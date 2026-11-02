# ============================================================
# ExportEase AI - HS Classification Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class CitationSchema(BaseModel):
    source_title: str
    source_url: Optional[str] = None
    excerpt: Optional[str] = None
    relevance_score: Optional[float] = None


class HSCandidateSchema(BaseModel):
    code: str
    description: str
    confidence: float
    reasoning: Optional[str] = None


class HSClassificationRequest(BaseModel):
    export_project_id: str
    product_description: str
    destination: str
    optional_existing_hs_code: Optional[str] = None


class HSClassificationResponse(BaseModel):
    id: Optional[str] = None
    status: str  # CLASSIFIED, REVIEW_REQUIRED, INSUFFICIENT_EVIDENCE
    selected_code: Optional[str] = None
    candidates: List[HSCandidateSchema] = Field(default_factory=list)
    reasoning: Optional[str] = None
    confidence: Optional[float] = None
    citations: List[CitationSchema] = Field(default_factory=list)
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
