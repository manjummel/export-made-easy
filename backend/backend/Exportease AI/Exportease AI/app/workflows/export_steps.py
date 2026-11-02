# ============================================================
# ExportEase AI - Export Workflow Step Definitions
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Defines each step in the canonical MSME export workflow.

The 10-step journey:
  STEP 1: MSME_PROFILE       → Business identity & context
  STEP 2: PRODUCT             → Product identification & normalization
  STEP 3: HS_CLASSIFICATION   → HS code lookup via AI + RAG
  STEP 4: EXPORT_ELIGIBILITY  → Is this product eligible for export?
  STEP 5: COMPLIANCE          → Regulatory requirements (FSSAI, DGFT, CBIC)
  STEP 6: DOCUMENTS           → Documentation requirements
  STEP 7: CERTIFICATIONS      → Certification requirements
  STEP 8: DESTINATION_MARKET  → Market analysis for target country
  STEP 9: RISK                → Risk assessment
  STEP 10: EXPORT_PLAN        → Final comprehensive export plan

SAFETY: Steps 3–7 MUST be grounded in RAG citations.
        If System 1 or System 2 returns INSUFFICIENT_EVIDENCE,
        the workflow MUST preserve that state and block progression.
"""

from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class StepDefinition:
    """Defines a single workflow step's metadata and constraints."""
    name: str
    order: int
    display_name: str
    description: str
    requires_ai: bool = False
    requires_rag: bool = False
    is_blocking: bool = True          # If True, INSUFFICIENT_EVIDENCE blocks advancement
    required_inputs: List[str] = field(default_factory=list)
    produces: List[str] = field(default_factory=list)


# ── Canonical Step Registry ───────────────────────────────────

STEP_DEFINITIONS: List[StepDefinition] = [
    StepDefinition(
        name="MSME_PROFILE",
        order=0,
        display_name="MSME Profile",
        description="Capture and validate the MSME business identity, GSTIN, IEC, and export readiness.",
        requires_ai=False,
        requires_rag=False,
        is_blocking=True,
        required_inputs=["company_name"],
        produces=["msme_id", "gstin", "iec_code"],
    ),
    StepDefinition(
        name="PRODUCT",
        order=1,
        display_name="Product Identification",
        description="Identify and normalize the product the MSME wants to export.",
        requires_ai=True,
        requires_rag=False,
        is_blocking=True,
        required_inputs=["product_name"],
        produces=["normalized_name", "attributes", "category"],
    ),
    StepDefinition(
        name="HS_CLASSIFICATION",
        order=2,
        display_name="HS Classification",
        description="Classify the product under the Harmonized System using AI reasoning grounded in RAG.",
        requires_ai=True,
        requires_rag=True,
        is_blocking=True,
        required_inputs=["normalized_name", "destination_country"],
        produces=["hs_code", "hs_description", "classification_confidence"],
    ),
    StepDefinition(
        name="EXPORT_ELIGIBILITY",
        order=3,
        display_name="Export Eligibility",
        description="Verify whether this product is eligible for export from India to the destination country.",
        requires_ai=True,
        requires_rag=True,
        is_blocking=True,
        required_inputs=["hs_code", "destination_country"],
        produces=["is_eligible", "restrictions"],
    ),
    StepDefinition(
        name="COMPLIANCE",
        order=4,
        display_name="Compliance Analysis",
        description="Map all regulatory compliance requirements (FSSAI, DGFT, CBIC, destination-side).",
        requires_ai=True,
        requires_rag=True,
        is_blocking=True,
        required_inputs=["hs_code", "destination_country", "product_category"],
        produces=["compliance_requirements", "regulatory_bodies"],
    ),
    StepDefinition(
        name="DOCUMENTS",
        order=5,
        display_name="Documentation Requirements",
        description="Identify all required shipping, customs, and statutory documents.",
        requires_ai=True,
        requires_rag=True,
        is_blocking=True,
        required_inputs=["hs_code", "destination_country", "compliance_requirements"],
        produces=["required_documents", "optional_documents"],
    ),
    StepDefinition(
        name="CERTIFICATIONS",
        order=6,
        display_name="Certification Requirements",
        description="Determine mandatory and optional certifications for the product-country pair.",
        requires_ai=True,
        requires_rag=True,
        is_blocking=True,
        required_inputs=["hs_code", "destination_country", "product_category"],
        produces=["required_certifications", "optional_certifications"],
    ),
    StepDefinition(
        name="DESTINATION_MARKET",
        order=7,
        display_name="Market Analysis",
        description="Analyze the destination market: size, growth, duties, trade agreements, competition.",
        requires_ai=True,
        requires_rag=True,
        is_blocking=False,   # Market insight is non-blocking
        required_inputs=["hs_code", "destination_country"],
        produces=["market_size", "import_duties", "trade_agreements", "competitors"],
    ),
    StepDefinition(
        name="RISK",
        order=8,
        display_name="Risk Assessment",
        description="Assess regulatory, market, financial, logistics, and political risks.",
        requires_ai=True,
        requires_rag=True,
        is_blocking=False,   # Risk is advisory
        required_inputs=["hs_code", "destination_country", "compliance_requirements"],
        produces=["risks", "overall_risk_level", "mitigations"],
    ),
    StepDefinition(
        name="EXPORT_PLAN",
        order=9,
        display_name="Export Plan",
        description="Generate the comprehensive, actionable export plan synthesizing all previous steps.",
        requires_ai=True,
        requires_rag=True,
        is_blocking=True,
        required_inputs=["hs_code", "destination_country", "compliance_requirements", "documents", "certifications"],
        produces=["full_export_plan"],
    ),
]


def get_step_definition(step_name: str) -> Optional[StepDefinition]:
    """Retrieve a step definition by name."""
    for step in STEP_DEFINITIONS:
        if step.name == step_name:
            return step
    return None


def get_step_by_order(order: int) -> Optional[StepDefinition]:
    """Retrieve a step definition by its order index."""
    for step in STEP_DEFINITIONS:
        if step.order == order:
            return step
    return None
