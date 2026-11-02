"""
records.py — Structured data ingestion endpoints
"""

from __future__ import annotations

import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.ingest import _ingest_single
from app.middleware.auth import verify_api_key
from app.models.requests import IngestRequest, StructuredRecordIngestRequest, DocumentMetadata
from app.models.responses import ErrorResponse, StructuredRecordIngestResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/records", tags=["Documents"])


@router.post(
    "/ingest",
    response_model=StructuredRecordIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a structured knowledge record",
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
    },
    dependencies=[Depends(verify_api_key)],
)
async def ingest_structured_record(request: StructuredRecordIngestRequest) -> StructuredRecordIngestResponse:
    """
    Ingests structured compliance data.
    Validates strictly, strings it into a text document, and pipes it through the standard RAG pipeline.
    """
    record_id = f"rec-{request.hs_code}-{uuid.uuid4().hex[:6]}"
    
    # Format the structured data into a cohesive text document for RAG retrieval
    content_parts = [
        f"Record ID: {record_id}",
        f"Product: {request.product}",
        f"HS Code: {request.hs_code}",
        f"Jurisdiction (Country): {', '.join(request.country)}",
        f"Regulatory Authority: {request.authority}",
    ]
    
    eff_date = request.dates.effective_date if request.dates else None
    exp_date = request.dates.expiry_date if request.dates else None
    
    if eff_date:
        content_parts.append(f"Effective Date: {eff_date.isoformat()}")
    if exp_date:
        content_parts.append(f"Expiry Date: {exp_date.isoformat()}")
        
    content_text = "\n".join(content_parts)
    
    doc_metadata = DocumentMetadata(
        document_type="regulation",  # Defaulting for structured data records
        jurisdiction=request.country,
        source_id=request.source_id,
        effective_date=eff_date,
        expiry_date=exp_date,
        tags=["structured_record", request.hs_code]
    )
    
    ingest_req = IngestRequest(
        content=content_text,
        metadata=doc_metadata,
        collection=request.collection,
        document_id=f"doc-{record_id}"
    )
    
    try:
        ingest_resp = _ingest_single(ingest_req)
        return StructuredRecordIngestResponse(
            record_id=record_id,
            document_id=ingest_resp.document_id,
            chunks_created=ingest_resp.chunks_created,
            status="ingested"
        )
    except Exception as exc:
        logger.exception("Failed to ingest structured record: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "RECORD_INGEST_ERROR", "message": str(exc), "status_code": 400}
        )
