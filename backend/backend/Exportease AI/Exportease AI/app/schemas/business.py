# ============================================================
# ExportEase AI - Business Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BusinessCreate(BaseModel):
    msme_id: str
    business_name: str = Field(min_length=1, max_length=500)
    business_type: Optional[str] = None
    description: Optional[str] = None
    primary_activity: Optional[str] = None
    manufacturing_capability: Optional[str] = None
    quality_certifications: Optional[str] = None


class BusinessUpdate(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    description: Optional[str] = None
    primary_activity: Optional[str] = None
    manufacturing_capability: Optional[str] = None
    quality_certifications: Optional[str] = None


class BusinessResponse(BaseModel):
    id: str
    msme_id: str
    business_name: str
    business_type: Optional[str] = None
    description: Optional[str] = None
    primary_activity: Optional[str] = None
    manufacturing_capability: Optional[str] = None
    quality_certifications: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
