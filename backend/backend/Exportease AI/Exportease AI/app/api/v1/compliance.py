# ============================================================
# ExportEase AI - Compliance API
# EXPORT-EASE-BACKEND-V1
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.compliance import ComplianceAnalyzeRequest, ComplianceAnalyzeResponse
from app.services.compliance_service import ComplianceService
from app.dependencies import get_current_active_user, get_ai_client, get_knowledge_client

router = APIRouter()

@router.post("/analyze", response_model=ResponseEnvelope, status_code=201)
async def analyze_compliance(
    request: ComplianceAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
    ai_client = Depends(get_ai_client),
    knowledge_client = Depends(get_knowledge_client)
):
    try:
        response = await ComplianceService.analyze_compliance(
            db, request, ai_client, knowledge_client, current_user["user_id"]
        )
        return ResponseEnvelope.success(
            data=response.model_dump()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
