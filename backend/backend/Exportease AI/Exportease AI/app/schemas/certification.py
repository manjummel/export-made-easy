from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class CertificationAnalysisRequest(BaseModel):
    project_id: str
    product: str
    hs_code: str
    destination: str
    compliance_information: Dict[str, Any]

class CertificationRequirement(BaseModel):
    certification_name: str
    applicability: str
    status: str = Field(..., description="REQUIRED | CONDITIONAL | NOT_IDENTIFIED | REVIEW_REQUIRED")
    reason: str
    issuing_authority: str
    source: str
    evidence: str
    confidence: float

class CertificationAnalysisResponse(BaseModel):
    project_id: str
    certifications: List[CertificationRequirement]

class CertificationResponse(BaseModel):
    id: str
    project_id: str
    certification_name: str
    certification_type: Optional[str] = None
    description: Optional[str] = None
    status: str
    issuing_body: Optional[str] = None
    validity_period: Optional[str] = None
    estimated_cost: Optional[str] = None
    estimated_time: Optional[str] = None
    application_process: Optional[str] = None
    is_mandatory: bool
    country_specific: Optional[str] = None
    ai_recommended: bool
    confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
