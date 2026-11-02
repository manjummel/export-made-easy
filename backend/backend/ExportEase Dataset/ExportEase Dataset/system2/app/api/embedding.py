"""
embedding.py — Endpoints for tracking embedding pipeline metadata.
"""

from __future__ import annotations
import logging
from fastapi import APIRouter, Depends
from app.middleware.auth import verify_api_key
from app.config import get_settings
from app.models.responses import ErrorResponse, EmbeddingStatusResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/embedding", tags=["Knowledge"])


@router.get(
    "/status",
    response_model=EmbeddingStatusResponse,
    summary="Retrieve the embedding pipeline status",
    responses={401: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def get_embedding_status() -> EmbeddingStatusResponse:
    """Returns the metadata for the active embedding pipeline."""
    settings = get_settings()
    
    return EmbeddingStatusResponse(
        embedding_model_version=settings.embedding_model,
        embedding_dimension=settings.qdrant_vector_size,
        dataset_version=settings.dataset_version,
    )
