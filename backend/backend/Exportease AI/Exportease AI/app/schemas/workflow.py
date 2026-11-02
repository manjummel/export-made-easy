# ============================================================
# ExportEase AI - Workflow Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field

from app.utils.constants import WorkflowStep, StepStatus


class WorkflowStatusResponse(BaseModel):
    project_id: str
    current_step: str
    overall_status: str
    steps: list["WorkflowStepDetail"]
    progress_percentage: float = 0.0


class WorkflowStepDetail(BaseModel):
    step_name: str
    step_order: int
    status: str
    is_current: bool = False
    confidence: Optional[float] = None
    result_summary: Optional[str] = None


class WorkflowAdvanceRequest(BaseModel):
    """Request to advance to the next workflow step."""
    project_id: str
    current_step: Optional[str] = None
    force: bool = False  # Force advance even if current step incomplete


class WorkflowAdvanceResponse(BaseModel):
    project_id: str
    previous_step: str
    current_step: str
    status: str
    message: str


class WorkflowResetRequest(BaseModel):
    """Request to reset workflow to a specific step."""
    project_id: str
    target_step: str
