# ============================================================
# ExportEase AI - Risk Assessment Schemas (Updated for 3.16)
# EXPORT-EASE-BACKEND-V1
# ============================================================

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class RiskAssessmentRequest(BaseModel):
    project_id: str
    product: str
    hs_code: str
    destination: str
    msme_profile: Dict[str, Any] = {}
    compliance_result: Dict[str, Any] = {}
    market_analysis: Dict[str, Any] = {}
    simulate_conflict: bool = False # For testing conflicting results
    
class RiskFactor(BaseModel):
    category: str
    factor: str
    explanation: str

class Citation(BaseModel):
    source: str
    link: Optional[str] = None

class RiskAssessmentResponse(BaseModel):
    risk_score: int
    risk_level: str = Field(..., description="GREEN | AMBER | RED")
    risk_categories: List[str]
    risk_factors: List[RiskFactor]
    mitigation_actions: List[str]
    confidence: float
    citations: List[Citation]

class RiskResponse(BaseModel):
    id: str
    project_id: str
    risk_score: int
    risk_level: str
    risk_categories: Optional[List[str]] = None
    risk_factors: Optional[List[Dict[str, Any]]] = None
    mitigation_actions: Optional[List[str]] = None
    citations: Optional[List[Dict[str, Any]]] = None
    confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime


    class Config:
        from_attributes = True

# Alias kept for schema __init__ import compatibility
RiskItem = RiskFactor
