# ============================================================
# ExportEase AI - Export Plan Schemas (Updated for 3.17)
# EXPORT-EASE-BACKEND-V1
# ============================================================

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime

class Citation(BaseModel):
    source: str
    link: Optional[str] = None

class PlanStep(BaseModel):
    title: str
    description: str
    status: str = Field(..., description="PENDING | IN_PROGRESS | COMPLETED | BLOCKED")
    prerequisites: List[str]
    next_action: str
    evidence: str
    citations: List[Citation]
    confidence: float
    
    @validator("evidence", pre=False)
    def validate_factual_claims(cls, v, values):
        # Enforce that if confidence is very high, evidence cannot be empty.
        # "Do not allow unsupported factual claims to enter the final plan."
        conf = values.get('confidence', 0)
        citations = values.get('citations', [])
        if conf > 0.5 and not v:
            raise ValueError("Unsupported factual claims are not allowed. Provide evidence.")
        if conf > 0.5 and len(citations) == 0:
            raise ValueError("Supported factual claims require at least one citation track back.")
        return v

class ExportPlanRequest(BaseModel):
    project_id: str
    product_analysis: Dict[str, Any] = {}
    hs_classification: Dict[str, Any] = {}
    compliance: Dict[str, Any] = {}
    documents: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    market_analysis: Dict[str, Any] = {}
    risk_analysis: Dict[str, Any] = {}

class ExportPlanResponse(BaseModel):
    project_id: str
    plan_title: str
    phase_a_readiness: List[PlanStep]
    phase_b_hs_classification: List[PlanStep]
    phase_c_compliance: List[PlanStep]
    phase_d_documents: List[PlanStep]
    phase_e_certifications: List[PlanStep]
    phase_f_destination_market: List[PlanStep]
    phase_g_risk_mitigation: List[PlanStep]
    phase_h_execution_checklist: List[PlanStep]
    confidence: float

class ExportPlanRecord(BaseModel):
    id: str
    project_id: str
    plan_title: str
    phase_a_readiness: Optional[List[Dict[str, Any]]] = None
    phase_b_hs_classification: Optional[List[Dict[str, Any]]] = None
    phase_c_compliance: Optional[List[Dict[str, Any]]] = None
    phase_d_documents: Optional[List[Dict[str, Any]]] = None
    phase_e_certifications: Optional[List[Dict[str, Any]]] = None
    phase_f_destination_market: Optional[List[Dict[str, Any]]] = None
    phase_g_risk_mitigation: Optional[List[Dict[str, Any]]] = None
    phase_h_execution_checklist: Optional[List[Dict[str, Any]]] = None
    confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
