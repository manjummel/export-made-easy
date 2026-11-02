# ============================================================
# ExportEase AI - Projects API Routes
# EXPORT-EASE-BACKEND-V1
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.export_project import (
    ExportProjectCreate,
    ExportProjectUpdate,
    ExportProjectResponse,
    ProjectListResponse,
)
from app.services.export_project_service import ExportProjectService
from app.dependencies import get_current_active_user
from app.services.audit_service import AuditService
from sqlalchemy import select
from app.schemas.document import DocumentUpdateStatus, DocumentResponse
from app.models.project_document import ProjectDocument
from app.schemas.certification import CertificationResponse
from app.models.project_certification import ProjectCertification
from app.schemas.risk import RiskResponse
from app.models.project_risk import ProjectRisk
from app.schemas.market_analysis import MarketAnalysisRecord
from app.models.market_analysis import MarketAnalysis
from app.schemas.export_plan import ExportPlanRecord
from app.models.export_plan import ExportPlan

router = APIRouter()


@router.post("/", response_model=ResponseEnvelope, status_code=201)
async def create_project(
    request: ExportProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Create a new export project."""
    try:
        project = await ExportProjectService.create_project(db, request, current_user["user_id"])
        
        await AuditService.log_action(
            db, action="PROJECT_CREATED", user_id=current_user["user_id"],
            project_id=project.id,
            description=f"Export project created: {project.project_name}",
        )
        return ResponseEnvelope.success(
            data=ExportProjectResponse.model_validate(project).model_dump()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=ResponseEnvelope)
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """List all projects belonging to requesting user."""
    projects = await ExportProjectService.list_projects(db, current_user["user_id"])
    serialized = [ExportProjectResponse.model_validate(p).model_dump() for p in projects]
    return ResponseEnvelope.success(data={"projects": serialized, "total": len(serialized)})


@router.get("/{project_id}", response_model=ResponseEnvelope)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get specific scoped export project."""
    project = await ExportProjectService.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(status_code=404, detail="Export project not found")
        
    return ResponseEnvelope.success(
        data=ExportProjectResponse.model_validate(project).model_dump()
    )


@router.put("/{project_id}", response_model=ResponseEnvelope)
async def update_project(
    project_id: str,
    update: ExportProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Update project variables."""
    try:
        project = await ExportProjectService.update_project(db, project_id, update, current_user["user_id"])
        return ResponseEnvelope.success(
            data=ExportProjectResponse.model_validate(project).model_dump()
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Delete a scoped export project."""
    try:
        await ExportProjectService.delete_project(db, project_id, current_user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{project_id}/documents", response_model=ResponseEnvelope)
async def get_project_documents(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get all documents for an export project."""
    project = await ExportProjectService.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(status_code=404, detail="Export project not found")
        
    result = await db.execute(select(ProjectDocument).where(ProjectDocument.project_id == project_id))
    docs = result.scalars().all()
    serialized = [DocumentResponse.model_validate(doc).model_dump() for doc in docs]
    return ResponseEnvelope.success(data={"documents": serialized, "total": len(serialized)})

@router.post("/{project_id}/documents/{document_id}/complete", response_model=ResponseEnvelope)
async def complete_document(
    project_id: str,
    document_id: str,
    status_update: DocumentUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Update user document status."""
    project = await ExportProjectService.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(status_code=404, detail="Export project not found")
        
    doc = await db.get(ProjectDocument, document_id)
    if not doc or doc.project_id != project_id:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc.status = status_update.status
    await db.commit()
    await db.refresh(doc)
    
    return ResponseEnvelope.success(data=DocumentResponse.model_validate(doc).model_dump())

@router.get("/{project_id}/certifications", response_model=ResponseEnvelope)
async def get_project_certifications(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get all certifications for an export project."""
    project = await ExportProjectService.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(status_code=404, detail="Export project not found")
        
    result = await db.execute(select(ProjectCertification).where(ProjectCertification.project_id == project_id))
    certs = result.scalars().all()
    serialized = [CertificationResponse.model_validate(cert).model_dump() for cert in certs]
    return ResponseEnvelope.success(data={"certifications": serialized, "total": len(serialized)})

@router.get("/{project_id}/risk", response_model=ResponseEnvelope)
async def get_project_risk(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get risk assessment associated with an export project."""
    project = await ExportProjectService.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(status_code=404, detail="Export project not found")
        
    result = await db.execute(select(ProjectRisk).where(ProjectRisk.project_id == project_id))
    risk = result.scalars().first()
    
    if not risk:
        return ResponseEnvelope.success(data=None)
        
    import json
    data_dict = {
        "id": risk.id,
        "project_id": risk.project_id,
        "risk_score": risk.risk_score,
        "risk_level": risk.risk_level,
        "risk_categories": json.loads(risk.risk_categories) if risk.risk_categories else [],
        "risk_factors": json.loads(risk.risk_factors) if risk.risk_factors else [],
        "mitigation_actions": json.loads(risk.mitigation_actions) if risk.mitigation_actions else [],
        "citations": json.loads(risk.citations) if risk.citations else [],
        "confidence": risk.confidence,
        "created_at": risk.created_at.isoformat(),
        "updated_at": risk.updated_at.isoformat()
    }
    
    return ResponseEnvelope.success(data=data_dict)

@router.get("/{project_id}/market-analysis", response_model=ResponseEnvelope)
async def get_project_market_analysis(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get market analysis records for an export project."""
    project = await ExportProjectService.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(status_code=404, detail="Export project not found")
        
    result = await db.execute(select(MarketAnalysis).where(MarketAnalysis.project_id == project_id))
    records = result.scalars().all()
    serialized = [MarketAnalysisRecord.model_validate(r).model_dump() for r in records]
    return ResponseEnvelope.success(data={"market_analysis": serialized, "total": len(serialized)})

@router.get("/{project_id}/export-plan", response_model=ResponseEnvelope)
async def get_project_export_plans(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get export plans generated for an export project."""
    project = await ExportProjectService.get_project(db, project_id, current_user["user_id"])
    if not project:
        raise HTTPException(status_code=404, detail="Export project not found")
        
    result = await db.execute(select(ExportPlan).where(ExportPlan.project_id == project_id))
    plan = result.scalars().first()
    
    if not plan:
        return ResponseEnvelope.success(data=None)
        
    import json
    data_dict = {
        "id": plan.id,
        "project_id": plan.project_id,
        "plan_title": plan.plan_title,
        "phase_a_readiness": json.loads(plan.phase_a_readiness) if plan.phase_a_readiness else [],
        "phase_b_hs_classification": json.loads(plan.phase_b_hs_classification) if plan.phase_b_hs_classification else [],
        "phase_c_compliance": json.loads(plan.phase_c_compliance) if plan.phase_c_compliance else [],
        "phase_d_documents": json.loads(plan.phase_d_documents) if plan.phase_d_documents else [],
        "phase_e_certifications": json.loads(plan.phase_e_certifications) if plan.phase_e_certifications else [],
        "phase_f_destination_market": json.loads(plan.phase_f_destination_market) if plan.phase_f_destination_market else [],
        "phase_g_risk_mitigation": json.loads(plan.phase_g_risk_mitigation) if plan.phase_g_risk_mitigation else [],
        "phase_h_execution_checklist": json.loads(plan.phase_h_execution_checklist) if plan.phase_h_execution_checklist else [],
        "confidence": plan.confidence,
        "created_at": plan.created_at.isoformat(),
        "updated_at": plan.updated_at.isoformat()
    }
    
    return ResponseEnvelope.success(data=data_dict)
