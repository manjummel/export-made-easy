# ============================================================
# ExportEase AI - Workflow Engine API Routes
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Workflow management endpoints for the canonical export workflow.
System 3 owns the workflow state machine.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.workflow import (
    WorkflowAdvanceRequest,
    WorkflowResetRequest,
)
from app.services.workflow_engine import WorkflowEngine
from app.services.audit_service import AuditService
from app.dependencies import get_current_active_user, get_ai_client, get_knowledge_client

router = APIRouter()


def _get_workflow_engine():
    """Get workflow engine with injected clients."""
    ai_client = get_ai_client()
    knowledge_client = get_knowledge_client()
    return WorkflowEngine(ai_client, knowledge_client)


@router.get("/{project_id}/status", response_model=ResponseEnvelope)
async def get_workflow_status(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get the workflow status and progress for a project."""
    engine = _get_workflow_engine()
    try:
        status = await engine.get_workflow_status(db, project_id)
        return ResponseEnvelope.success(data=status, project_id=project_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/advance", response_model=ResponseEnvelope)
async def advance_workflow(
    request: WorkflowAdvanceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Advance the workflow to the next step."""
    engine = _get_workflow_engine()
    try:
        result = await engine.advance_step(db, request.project_id, force=request.force)
        await AuditService.log_action(
            db,
            action="WORKFLOW_ADVANCE",
            user_id=current_user["user_id"],
            project_id=request.project_id,
            description=f"Workflow advanced: {result['previous_step']} → {result['current_step']}",
        )
        return ResponseEnvelope.success(data=result, project_id=request.project_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset", response_model=ResponseEnvelope)
async def reset_workflow(
    request: WorkflowResetRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Reset workflow back to a specific step."""
    engine = _get_workflow_engine()
    try:
        result = await engine.reset_to_step(
            db, request.project_id, request.target_step
        )
        await AuditService.log_action(
            db,
            action="WORKFLOW_ADVANCE",
            user_id=current_user["user_id"],
            project_id=request.project_id,
            description=f"Workflow reset to: {request.target_step}",
        )
        return ResponseEnvelope.success(data=result, project_id=request.project_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{project_id}/initialize", response_model=ResponseEnvelope)
async def initialize_workflow(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Initialize the 10-step export workflow for a project."""
    from app.workflows.engine import WorkflowDomainEngine
    try:
        state = await WorkflowDomainEngine.initialize(db, project_id)
        await AuditService.log_action(
            db,
            action="WORKFLOW_ADVANCE",
            user_id=current_user["user_id"],
            project_id=project_id,
            description="Workflow initialized — 10 steps created",
        )
        return ResponseEnvelope.success(data={
            "project_id": project_id,
            "total_steps": len(state.steps),
            "current_step": state.current_step_name,
            "status": state.overall_status,
            "completion_percentage": state.completion_percentage,
            "message": "Workflow initialized successfully",
        }, project_id=project_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{project_id}/detailed-status", response_model=ResponseEnvelope)
async def get_detailed_workflow_status(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get detailed workflow status including blocking failure detection."""
    from app.workflows.engine import WorkflowDomainEngine
    try:
        summary = await WorkflowDomainEngine.get_status_summary(db, project_id)
        return ResponseEnvelope.success(data=summary, project_id=project_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
@router.post("/{project_id}/execute/{step_name}", response_model=ResponseEnvelope)
async def execute_workflow_step(
    project_id: str,
    step_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Execute a specific workflow step by calling the AI Engine."""
    engine = _get_workflow_engine()
    try:
        # Build context from the project
        from app.services.project_service import ProjectService
        project = await ProjectService.get_project(
            db, project_id, user_id=current_user["user_id"]
        )
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        context = {
            "user_id": current_user["user_id"],
            "project_id": project_id,
            "product_name": project.project_name,
            "destination_country": project.destination_country or "",
            "destination_country_code": project.destination_country_code or "",
            "user_query": project.user_query or "",
        }

        result = await engine.execute_step(db, project_id, step_name, context)

        await AuditService.log_action(
            db,
            action="AI_REQUEST",
            user_id=current_user["user_id"],
            project_id=project_id,
            description=f"Executed step: {step_name}",
        )

        return ResponseEnvelope.success(
            data=result.get("data"),
            project_id=project_id,
            confidence=result.get("confidence"),
            sources=result.get("sources", []),
            warnings=result.get("warnings", []),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Step execution failed: {str(e)}")
