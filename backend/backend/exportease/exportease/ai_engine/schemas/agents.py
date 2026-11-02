"""
ai_engine/schemas/agents.py

Pydantic v2 schemas for per-agent inputs and outputs.
These are internal to System 1 — not part of the cross-system contract.

Each agent has:
  - <AgentName>Input: what the agent receives from the workflow state
  - <AgentName>Output: what the agent writes back to the workflow state
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Product Agent
# ---------------------------------------------------------------------------


class ProductAgentInput(BaseModel):
    query: str
    language: str = "en"


class ProductAgentOutput(BaseModel):
    product_name: str
    product_description: str
    product_category: str
    export_form: str  # e.g. "powder", "whole", "processed"
    origin_state: Optional[str] = None
    hsn_hint: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# HS Classification Agent
# ---------------------------------------------------------------------------


class HSAgentInput(BaseModel):
    product_info: Dict[str, Any]
    language: str = "en"


class HSAgentOutput(BaseModel):
    hs_code: str
    hs_description: str
    chapter: str
    heading: str
    subheading: str
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    alternative_codes: List[Dict[str, str]] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Compliance Agent
# ---------------------------------------------------------------------------


class ComplianceAgentInput(BaseModel):
    product_info: Dict[str, Any]
    hs_result: Dict[str, Any]
    target_country: str
    language: str = "en"


class ComplianceRequirement(BaseModel):
    regulation_name: str
    authority: str
    description: str
    mandatory: bool
    source_id: Optional[str] = None


class ComplianceAgentOutput(BaseModel):
    target_country: str
    requirements: List[ComplianceRequirement] = Field(default_factory=list)
    export_restrictions: List[str] = Field(default_factory=list)
    import_restrictions: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    grounding_status: str = "SUFFICIENT"


# ---------------------------------------------------------------------------
# Document Agent
# ---------------------------------------------------------------------------


class DocumentAgentInput(BaseModel):
    product_info: Dict[str, Any]
    hs_result: Dict[str, Any]
    compliance_result: Dict[str, Any]
    target_country: str
    language: str = "en"


class RequiredDocument(BaseModel):
    document_name: str
    issuing_authority: str
    mandatory: bool
    description: str
    estimated_processing_days: Optional[int] = None


class DocumentAgentOutput(BaseModel):
    required_documents: List[RequiredDocument] = Field(default_factory=list)
    optional_documents: List[RequiredDocument] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Certification Agent
# ---------------------------------------------------------------------------


class CertificationAgentInput(BaseModel):
    product_info: Dict[str, Any]
    hs_result: Dict[str, Any]
    target_country: str
    language: str = "en"


class RequiredCertification(BaseModel):
    certification_name: str
    issuing_body: str
    mandatory: bool
    description: str
    estimated_cost_inr: Optional[float] = None
    validity_months: Optional[int] = None


class CertificationAgentOutput(BaseModel):
    certifications: List[RequiredCertification] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Market Agent
# ---------------------------------------------------------------------------


class MarketAgentInput(BaseModel):
    product_info: Dict[str, Any]
    hs_result: Dict[str, Any]
    target_country: str
    language: str = "en"


class MarketAgentOutput(BaseModel):
    target_country: str
    market_size_usd: Optional[str] = None
    demand_trend: Optional[str] = None
    key_buyers: List[str] = Field(default_factory=list)
    competitors: List[str] = Field(default_factory=list)
    entry_barriers: List[str] = Field(default_factory=list)
    price_range_usd: Optional[str] = None
    seasonal_demand: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Risk Agent
# ---------------------------------------------------------------------------


class RiskAgentInput(BaseModel):
    product_info: Dict[str, Any]
    hs_result: Dict[str, Any]
    compliance_result: Dict[str, Any]
    market_result: Dict[str, Any]
    target_country: str
    language: str = "en"


class RiskFactor(BaseModel):
    risk_name: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    description: str
    mitigation: Optional[str] = None


class RiskAgentOutput(BaseModel):
    overall_risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_factors: List[RiskFactor] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Export Planner Agent
# ---------------------------------------------------------------------------


class PlannerAgentInput(BaseModel):
    product_info: Dict[str, Any]
    hs_result: Dict[str, Any]
    compliance_result: Dict[str, Any]
    document_result: Dict[str, Any]
    certification_result: Dict[str, Any]
    market_result: Dict[str, Any]
    risk_result: Dict[str, Any]
    target_country: str
    language: str = "en"


class ExportStep(BaseModel):
    step_number: int
    title: str
    description: str
    estimated_days: Optional[int] = None
    estimated_cost_inr: Optional[float] = None
    dependencies: List[int] = Field(default_factory=list)


class PlannerAgentOutput(BaseModel):
    export_plan_summary: str
    steps: List[ExportStep] = Field(default_factory=list)
    total_estimated_days: Optional[int] = None
    total_estimated_cost_inr: Optional[float] = None
    recommended_incoterms: Optional[str] = None
    recommended_payment_terms: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    sources: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
