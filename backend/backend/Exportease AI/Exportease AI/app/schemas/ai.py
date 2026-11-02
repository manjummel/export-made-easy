# ============================================================
# ExportEase AI - AI Integration Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Schemas for communication with System 1 (AI Engine).
System 3 communicates with System 1 only through its versioned AI API.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field

from app.utils.validators import generate_uuid, utc_now_iso
from app.utils.constants import API_VERSION


# ── AI Request Schemas ────────────────────────────────────────

class AIRequestBase(BaseModel):
    """Base request to AI Engine."""
    request_id: str = Field(default_factory=generate_uuid)
    user_id: str
    project_id: str
    timestamp: str = Field(default_factory=utc_now_iso)
    language: str = "en"
    api_version: str = API_VERSION


class HSClassificationRequest(AIRequestBase):
    product_name: str
    product_description: Optional[str] = None
    raw_materials: Optional[str] = None
    specifications: Optional[str] = None
    category: Optional[str] = None


class ComplianceAnalysisRequest(AIRequestBase):
    product_name: str
    hs_code: str
    destination_country: str
    destination_country_code: Optional[str] = None
    product_description: Optional[str] = None


class DocumentAnalysisRequest(AIRequestBase):
    product_name: str
    hs_code: str
    destination_country: str
    compliance_requirements: Optional[list[str]] = None


class CertificationAnalysisRequest(AIRequestBase):
    product_name: str
    hs_code: str
    destination_country: str
    product_description: Optional[str] = None
    compliance_requirements: Optional[list[str]] = None


class MarketAnalysisRequest(AIRequestBase):
    product_name: str
    hs_code: str
    destination_country: str
    destination_country_code: Optional[str] = None


class RiskAnalysisRequest(AIRequestBase):
    product_name: str
    hs_code: str
    destination_country: str
    compliance_status: Optional[str] = None
    market_data: Optional[dict[str, Any]] = None


class ExportPlanRequest(AIRequestBase):
    product_name: str
    hs_code: str
    destination_country: str
    msme_profile: Optional[dict[str, Any]] = None
    compliance_summary: Optional[dict[str, Any]] = None
    market_summary: Optional[dict[str, Any]] = None
    risk_summary: Optional[dict[str, Any]] = None
    documents: Optional[list[dict[str, Any]]] = None
    certifications: Optional[list[dict[str, Any]]] = None


class GeneralAnalysisRequest(AIRequestBase):
    query: str
    context: Optional[dict[str, Any]] = None


# ── AI Response Schemas ───────────────────────────────────────

class AIResponseBase(BaseModel):
    """Base response from AI Engine."""
    request_id: str
    project_id: str
    status: str
    confidence: Optional[float] = None
    sources: list[dict[str, Any]] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=utc_now_iso)
    api_version: str = API_VERSION


class HSClassificationResponse(AIResponseBase):
    data: Optional["HSClassificationData"] = None


class HSClassificationData(BaseModel):
    hs_code: str
    hs_description: str
    confidence: float
    alternative_codes: list[dict[str, Any]] = Field(default_factory=list)
    reasoning: Optional[str] = None


class ComplianceAnalysisResponse(AIResponseBase):
    data: Optional["ComplianceAnalysisData"] = None


class ComplianceAnalysisData(BaseModel):
    requirements: list[dict[str, Any]] = Field(default_factory=list)
    overall_status: str
    summary: Optional[str] = None


class DocumentAnalysisResponse(AIResponseBase):
    data: Optional["DocumentAnalysisData"] = None


class DocumentAnalysisData(BaseModel):
    required_documents: list[dict[str, Any]] = Field(default_factory=list)
    optional_documents: list[dict[str, Any]] = Field(default_factory=list)
    summary: Optional[str] = None


class CertificationAnalysisResponse(AIResponseBase):
    data: Optional["CertificationAnalysisData"] = None


class CertificationAnalysisData(BaseModel):
    required_certifications: list[dict[str, Any]] = Field(default_factory=list)
    optional_certifications: list[dict[str, Any]] = Field(default_factory=list)
    summary: Optional[str] = None


class MarketAnalysisResponse(AIResponseBase):
    data: Optional[dict[str, Any]] = None


class RiskAnalysisResponse(AIResponseBase):
    data: Optional[dict[str, Any]] = None


class ExportPlanResponse(AIResponseBase):
    data: Optional[dict[str, Any]] = None
