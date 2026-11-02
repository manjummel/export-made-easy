# ============================================================
# ExportEase AI - Workflow Engine (Domain Layer)
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Stateless domain layer that orchestrates step execution, state machine
transitions, and persistence of the MSME export workflow.

This is distinct from WorkflowEngine in services/ which handles the
HTTP-layer orchestration and AI client calls.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.export_project import ExportProject
from app.models.project_step import ProjectStep
from app.utils.validators import generate_uuid
from app.workflows.states import (
    WorkflowState,
    WorkflowStepData,
    WorkflowTransition,
    StepState,
)
from app.workflows.export_steps import STEP_DEFINITIONS, get_step_definition

logger = logging.getLogger(__name__)


class WorkflowDomainEngine:
    """
    Domain-layer workflow engine — pure PostgreSQL state management.
    Does NOT call AI or Knowledge services directly.
    Responsibilities:
      - Initialize step records
      - Apply and validate transitions
      - Serialize/deserialize WorkflowState from DB
      - Calculate a real completion percentage
    """

    # ── Hydration ─────────────────────────────────────────────

    @staticmethod
    async def load_state(db: AsyncSession, project_id: str) -> WorkflowState:
        """Load the full workflow state from PostgreSQL into memory."""
        proj_result = await db.execute(
            select(ExportProject).where(ExportProject.id == project_id)
        )
        project = proj_result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project not found: {project_id}")

        steps_result = await db.execute(
            select(ProjectStep)
            .where(ProjectStep.project_id == project_id)
            .order_by(ProjectStep.step_order)
        )
        db_steps = list(steps_result.scalars().all())

        step_data_list = []
        for db_step in db_steps:
            step_def = get_step_definition(db_step.step_name)
            is_blocking = step_def.is_blocking if step_def else True

            step_data_list.append(WorkflowStepData(
                step_name=db_step.step_name,
                step_order=db_step.step_order,
                status=StepState(db_step.status) if db_step.status in StepState._value2member_map_ else StepState.NOT_STARTED,
                started_at=db_step.started_at,
                completed_at=db_step.completed_at,
                confidence=db_step.confidence,
                result_reference=db_step.agent_run_id,
                result_summary=db_step.result_summary,
                is_blocking=is_blocking,
            ))

        return WorkflowState(
            project_id=project_id,
            current_step_name=project.current_step,
            overall_status=project.status,
            steps=step_data_list,
        )

    # ── Initialization ────────────────────────────────────────

    @staticmethod
    async def initialize(db: AsyncSession, project_id: str) -> WorkflowState:
        """
        Bootstrap all 10 workflow steps for a new project.
        STEP 1 begins IN_PROGRESS; all others start NOT_STARTED.
        Transitions project: DRAFT → ANALYZING.
        """
        proj_result = await db.execute(
            select(ExportProject).where(ExportProject.id == project_id)
        )
        project = proj_result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project not found: {project_id}")

        # Idempotency check
        existing = await db.execute(
            select(ProjectStep).where(ProjectStep.project_id == project_id)
        )
        if list(existing.scalars().all()):
            raise ValueError("Workflow already initialized for this project")

        for step_def in STEP_DEFINITIONS:
            initial_status = StepState.IN_PROGRESS if step_def.order == 0 else StepState.NOT_STARTED
            step = ProjectStep(
                id=generate_uuid(),
                project_id=project_id,
                step_name=step_def.name,
                step_order=step_def.order,
                status=initial_status.value,
                started_at=datetime.now(timezone.utc) if step_def.order == 0 else None,
            )
            db.add(step)

        project.status = "ANALYZING"
        project.current_step = STEP_DEFINITIONS[0].name
        await db.flush()

        logger.info(f"Workflow initialized: {project_id} — {len(STEP_DEFINITIONS)} steps")
        return await WorkflowDomainEngine.load_state(db, project_id)

    # ── Transition ────────────────────────────────────────────

    @staticmethod
    async def transition_step(
        db: AsyncSession,
        project_id: str,
        step_name: str,
        new_state: StepState,
        confidence: Optional[float] = None,
        result_reference: Optional[str] = None,
        result_summary: Optional[str] = None,
        error: Optional[str] = None,
    ) -> WorkflowState:
        """
        Apply a validated state transition to a workflow step.
        Automatically advances project.current_step on completion.
        """
        state = await WorkflowDomainEngine.load_state(db, project_id)
        step_data = state.get_step(step_name)
        if not step_data:
            raise ValueError(f"Step '{step_name}' not found in project {project_id}")

        # Update runtime data before validating
        if confidence is not None:
            step_data.confidence = confidence
        if result_reference is not None:
            step_data.result_reference = result_reference
        if error:
            step_data.errors.append(error)

        # Validate transition
        is_valid, err_msg = WorkflowTransition.validate(step_data, new_state)
        if not is_valid:
            raise ValueError(err_msg)

        # Apply in-memory
        WorkflowTransition.apply(step_data, new_state, error)

        # Persist to DB
        db_step_result = await db.execute(
            select(ProjectStep).where(
                ProjectStep.project_id == project_id,
                ProjectStep.step_name == step_name,
            )
        )
        db_step = db_step_result.scalar_one_or_none()
        if db_step:
            db_step.status = new_state.value
            db_step.started_at = step_data.started_at
            db_step.completed_at = step_data.completed_at
            db_step.confidence = step_data.confidence
            db_step.result_summary = result_summary or step_data.result_summary
            if result_reference:
                db_step.agent_run_id = result_reference

        # Update project state if step completed
        proj_result = await db.execute(
            select(ExportProject).where(ExportProject.id == project_id)
        )
        project = proj_result.scalar_one_or_none()

        if project and new_state == StepState.COMPLETED:
            # Advance current_step to next
            current_def = get_step_definition(step_name)
            if current_def:
                next_order = current_def.order + 1
                if next_order < len(STEP_DEFINITIONS):
                    project.current_step = STEP_DEFINITIONS[next_order].name
                    project.status = "IN_PROGRESS"
                else:
                    project.status = "COMPLETED"

        # Update project completion percentage
        if project:
            state = await WorkflowDomainEngine.load_state(db, project_id)
            project.completion_percentage = state.completion_percentage

            # Flag if blocking failure
            if new_state == StepState.INSUFFICIENT_EVIDENCE and step_data.is_blocking:
                project.status = "REVIEW_REQUIRED"
                logger.warning(
                    f"[SAFETY] Blocking step '{step_name}' hit INSUFFICIENT_EVIDENCE "
                    f"for project {project_id}. Status → REVIEW_REQUIRED"
                )

        await db.flush()

        return await WorkflowDomainEngine.load_state(db, project_id)

    # ── Status Summary ────────────────────────────────────────

    @staticmethod
    async def get_status_summary(db: AsyncSession, project_id: str) -> dict[str, Any]:
        """Return a structured status summary suitable for the API response."""
        state = await WorkflowDomainEngine.load_state(db, project_id)
        return {
            "project_id": project_id,
            "current_step": state.current_step_name,
            "overall_status": state.overall_status,
            "completion_percentage": state.completion_percentage,
            "has_blocking_failures": state.has_blocking_failures,
            "steps": [
                {
                    "step_name": s.step_name,
                    "step_order": s.step_order,
                    "status": s.status.value,
                    "is_current": s.step_name == state.current_step_name,
                    "confidence": s.confidence,
                    "result_summary": s.result_summary,
                    "errors": s.errors,
                    "is_blocking": s.is_blocking,
                    "started_at": s.started_at.isoformat() if s.started_at else None,
                    "completed_at": s.completed_at.isoformat() if s.completed_at else None,
                }
                for s in state.steps
            ],
        }
