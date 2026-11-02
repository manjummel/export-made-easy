# ============================================================
# ExportEase AI - Compliance Engine Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ComplianceCitation(BaseModel):
    source_title: str
    source_url: Optional[str] = None
    excerpt: Optional[str] = None
    relevance_score: Optional[float] = None

class ComplianceRequirement(BaseModel):
    name: str
    mandatory_or_conditional: str
    reason: Optional[str] = None
    authority: Optional[str] = None
    evidence: Optional[str] = None
    citation: Optional[ComplianceCitation] = None

class ComplianceAnalyzeRequest(BaseModel):
    project_id: str
    product_name: str
    hs_code: str
    destination: str
    business_context: Optional[str] = None

class ComplianceAnalyzeResponse(BaseModel):
    status: str
    requirements: List[ComplianceRequirement] = Field(default_factory=list)
    restrictions: List[str] = Field(default_factory=list)
    licenses: List[str] = Field(default_factory=list)
    conditions: List[str] = Field(default_factory=list)
    exceptions: List[str] = Field(default_factory=list)
    authorities: List[str] = Field(default_factory=list)
    confidence: Optional[float] = None
    citations: List[ComplianceCitation] = Field(default_factory=list)
