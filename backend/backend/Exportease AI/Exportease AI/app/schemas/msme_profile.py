# ============================================================
# ExportEase AI - MSME Profile Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MSMEProfileCreate(BaseModel):
    company_name: str = Field(min_length=1, max_length=500)
    gstin: Optional[str] = None
    iec_code: Optional[str] = None
    udyam_number: Optional[str] = None
    msme_category: Optional[str] = None
    industry_sector: Optional[str] = None
    registered_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website: Optional[str] = None
    export_experience_years: Optional[int] = None
    annual_turnover_inr: Optional[float] = None
    previous_export_countries: Optional[str] = None


class MSMEProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    gstin: Optional[str] = None
    iec_code: Optional[str] = None
    udyam_number: Optional[str] = None
    msme_category: Optional[str] = None
    industry_sector: Optional[str] = None
    registered_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website: Optional[str] = None
    export_experience_years: Optional[int] = None
    annual_turnover_inr: Optional[float] = None
    previous_export_countries: Optional[str] = None


class MSMEProfileResponse(BaseModel):
    id: str
    user_id: str
    company_name: str
    gstin: Optional[str] = None
    iec_code: Optional[str] = None
    udyam_number: Optional[str] = None
    msme_category: Optional[str] = None
    industry_sector: Optional[str] = None
    registered_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    website: Optional[str] = None
    export_experience_years: Optional[int] = None
    annual_turnover_inr: Optional[float] = None
    previous_export_countries: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
