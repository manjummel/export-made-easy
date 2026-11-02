# ============================================================
# ExportEase AI - AI Integration API Routes
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Versioned AI endpoints exposed by the backend.
POST /api/v1/ai/analyze
POST /api/v1/ai/classify
POST /api/v1/ai/compliance
POST /api/v1/ai/documents
POST /api/v1/ai/certifications
POST /api/v1/ai/market
POST /api/v1/ai/risk
POST /api/v1/ai/export-plan
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.ai import (
    HSClassificationRequest,
    ComplianceAnalysisRequest,
    DocumentAnalysisRequest,
    CertificationAnalysisRequest,
    MarketAnalysisRequest,
    RiskAnalysisRequest,
    ExportPlanRequest,
    GeneralAnalysisRequest,
)
from app.services.workflow_engine import WorkflowEngine
from app.services.audit_service import AuditService
from app.dependencies import get_current_active_user, get_ai_client, get_knowledge_client
from app.utils.constants import WorkflowStep

router = APIRouter()


def _get_engine():
    return WorkflowEngine(get_ai_client(), get_knowledge_client())


@router.post("/analyze", response_model=ResponseEnvelope)
async def analyze(
    request: GeneralAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """General AI analysis endpoint."""
    engine = _get_engine()
    context = request.model_dump()
    result = await engine.execute_step(
        db, request.project_id, "GENERAL_ANALYSIS", context
    )
    return ResponseEnvelope.success(
        data=result.get("data"),
        request_id=request.request_id,
        project_id=request.project_id,
        confidence=result.get("confidence"),
        sources=result.get("sources", []),
    )


@router.post("/classify", response_model=ResponseEnvelope)
async def classify_hs(
    request: HSClassificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """HS Code classification."""
    engine = _get_engine()
    context = request.model_dump()
    result = await engine.execute_step(
        db, request.project_id, WorkflowStep.HS_CLASSIFICATION.value, context
    )
    return ResponseEnvelope.success(
        data=result.get("data"),
        request_id=request.request_id,
        project_id=request.project_id,
        confidence=result.get("confidence"),
        sources=result.get("sources", []),
    )


@router.post("/compliance", response_model=ResponseEnvelope)
async def analyze_compliance(
    request: ComplianceAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Compliance analysis for export requirements."""
    engine = _get_engine()
    context = request.model_dump()
    result = await engine.execute_step(
        db, request.project_id, WorkflowStep.COMPLIANCE.value, context
    )
    return ResponseEnvelope.success(
        data=result.get("data"),
        request_id=request.request_id,
        project_id=request.project_id,
        confidence=result.get("confidence"),
        sources=result.get("sources", []),
    )


@router.post("/documents", response_model=ResponseEnvelope)
async def analyze_documents(
    request: DocumentAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Document requirements analysis."""
    engine = _get_engine()
    context = request.model_dump()
    result = await engine.execute_step(
        db, request.project_id, WorkflowStep.DOCUMENTS.value, context
    )
    return ResponseEnvelope.success(
        data=result.get("data"),
        request_id=request.request_id,
        project_id=request.project_id,
        confidence=result.get("confidence"),
        sources=result.get("sources", []),
    )


@router.post("/certifications", response_model=ResponseEnvelope)
async def analyze_certifications(
    request: CertificationAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Certification requirements analysis."""
    engine = _get_engine()
    context = request.model_dump()
    result = await engine.execute_step(
        db, request.project_id, WorkflowStep.CERTIFICATIONS.value, context
    )
    return ResponseEnvelope.success(
        data=result.get("data"),
        request_id=request.request_id,
        project_id=request.project_id,
        confidence=result.get("confidence"),
        sources=result.get("sources", []),
    )


@router.post("/market", response_model=ResponseEnvelope)
async def analyze_market(
    request: MarketAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Destination market intelligence."""
    engine = _get_engine()
    context = request.model_dump()
    result = await engine.execute_step(
        db, request.project_id, WorkflowStep.DESTINATION_MARKET.value, context
    )
    return ResponseEnvelope.success(
        data=result.get("data"),
        request_id=request.request_id,
        project_id=request.project_id,
        confidence=result.get("confidence"),
        sources=result.get("sources", []),
    )


@router.post("/risk", response_model=ResponseEnvelope)
async def analyze_risk(
    request: RiskAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Risk assessment for export journey."""
    engine = _get_engine()
    context = request.model_dump()
    result = await engine.execute_step(
        db, request.project_id, WorkflowStep.RISK.value, context
    )
    return ResponseEnvelope.success(
        data=result.get("data"),
        request_id=request.request_id,
        project_id=request.project_id,
        confidence=result.get("confidence"),
        sources=result.get("sources", []),
    )


@router.post("/export-plan", response_model=ResponseEnvelope)
async def generate_export_plan(
    request: ExportPlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Generate comprehensive export plan."""
    engine = _get_engine()
    context = request.model_dump()
    result = await engine.execute_step(
        db, request.project_id, WorkflowStep.EXPORT_PLAN.value, context
    )
    return ResponseEnvelope.success(
        data=result.get("data"),
        request_id=request.request_id,
        project_id=request.project_id,
        confidence=result.get("confidence"),
        sources=result.get("sources", []),
    )
