"""
training.py — Endpoints for exporting instruction-tuning datasets.
"""

from __future__ import annotations
import logging
from typing import List
from fastapi import APIRouter, Depends
from app.core.retriever import get_retriever
from app.middleware.auth import verify_api_key
from app.config import get_settings
from app.models.responses import ErrorResponse, NormalizedRecord, TrainingDatasetManifest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/training-dataset", tags=["Training"])


@router.get(
    "/version",
    response_model=TrainingDatasetManifest,
    summary="Retrieve the training dataset manifest",
    responses={401: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def get_training_dataset_version() -> TrainingDatasetManifest:
    """Returns the manifest for the verified training dataset."""
    settings = get_settings()
    retriever = get_retriever()
    
    # We only export strictly verified records for training
    verified_count = retriever.count_records(filters={"verification_status": "VERIFIED"})
    
    return TrainingDatasetManifest(
        dataset_id=f"{settings.service_name}-verified",
        dataset_version=settings.dataset_version,
        schema_version=settings.knowledge_api_version,
        record_count=verified_count,
    )


@router.get(
    "/export",
    response_model=List[NormalizedRecord],
    summary="Bulk export of verified records for training",
    responses={401: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def export_training_dataset() -> List[NormalizedRecord]:
    """
    Exports all strictly verified records as an array of NormalizedRecord.
    System 1 can use this to generate its instruction-tuning Q/A pairs.
    """
    from qdrant_client.models import Filter, FieldCondition, MatchValue
    
    retriever = get_retriever()
    client = retriever._client
    
    # For MVP, we use scroll to fetch up to a large number of records.
    # In production, this would be paginated or streamed.
    records = []
    try:
        results, _ = client.scroll(
            collection_name=retriever._default_collection,
            scroll_filter=Filter(must=[FieldCondition(key="verification_status", match=MatchValue(value="VERIFIED"))]),
            limit=5000,
            with_payload=True,
            with_vectors=False
        )
        records = retriever._to_normalized_records(results)
    except Exception as exc:
        logger.error("Failed to export dataset: %s", exc)
        
    return records
