# ============================================================
# ExportEase AI - HS Classification API
# EXPORT-EASE-BACKEND-V1
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.hs_classification import HSClassificationRequest, HSClassificationResponse
from app.services.hs_service import HSClassificationService
from app.dependencies import get_current_active_user, get_ai_client, get_knowledge_client

router = APIRouter()


@router.post("/classification", response_model=ResponseEnvelope, status_code=201)
async def classify_hs_code(
    request: HSClassificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
    ai_client = Depends(get_ai_client),
    knowledge_client = Depends(get_knowledge_client)
):
    try:
        classification = await HSClassificationService.classify(
            db, request, ai_client, knowledge_client, current_user["user_id"]
        )
        return ResponseEnvelope.success(
            data=HSClassificationResponse.model_validate(classification).model_dump()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/classification/{project_id}", response_model=ResponseEnvelope)
async def get_classification_history(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    try:
        classifications = await HSClassificationService.get_project_classifications(
            db, project_id, current_user["user_id"]
        )
        serialized = [HSClassificationResponse.model_validate(c).model_dump() for c in classifications]
        return ResponseEnvelope.success(data=serialized)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
