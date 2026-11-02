# ============================================================
# ExportEase AI - Export Project Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class ExportProjectCreate(BaseModel):
    msme_id: str
    product_id: Optional[str] = None
    project_name: str = Field(min_length=1, max_length=500)
    description: Optional[str] = None
    destination_country: Optional[str] = None
    destination_country_code: Optional[str] = None
    user_query: Optional[str] = None  # e.g. "I want to export turmeric powder to Germany"
    quantity: Optional[float] = None
    estimated_value: Optional[float] = None
    currency: Optional[str] = "USD"
    preferred_language: Optional[str] = "en"


class ExportProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None
    product_id: Optional[str] = None
    destination_country: Optional[str] = None
    destination_country_code: Optional[str] = None
    user_query: Optional[str] = None
    quantity: Optional[float] = None
    estimated_value: Optional[float] = None
    currency: Optional[str] = None
    preferred_language: Optional[str] = None
    status: Optional[str] = None


class ProjectStepResponse(BaseModel):
    id: str
    project_id: str
    step_name: str
    step_order: int
    status: str
    result_summary: Optional[str] = None
    confidence: Optional[float] = None
    agent_run_id: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExportProjectResponse(BaseModel):
    id: str
    msme_id: str
    product_id: Optional[str] = None
    project_name: str
    description: Optional[str] = None
    destination_country: Optional[str] = None
    destination_country_code: Optional[str] = None
    status: str
    current_step: str
    overall_confidence: Optional[float] = None
    user_query: Optional[str] = None
    
    quantity: Optional[float] = None
    estimated_value: Optional[float] = None
    currency: Optional[str] = None
    preferred_language: Optional[str] = None
    completion_percentage: Optional[float] = None
    risk_level: Optional[str] = None
    
    steps: list[ProjectStepResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    projects: list[ExportProjectResponse]
    total: int
