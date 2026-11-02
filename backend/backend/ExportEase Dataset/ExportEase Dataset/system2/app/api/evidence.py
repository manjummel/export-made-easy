"""
evidence.py — Endpoints for System 1 citation and evidence resolution.
"""

from __future__ import annotations
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.retriever import get_retriever
from app.core.source_registry import get_source_registry
from app.middleware.auth import verify_api_key
from app.models.requests import BatchEvidenceRequest, BatchCitationRequest
from app.models.responses import ErrorResponse, NormalizedRecord, Citation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/evidence", tags=["Evidence"])
citations_router = APIRouter(prefix="/v1/citations", tags=["Evidence"])


@router.get(
    "/{chunk_id}",
    response_model=NormalizedRecord,
    summary="Retrieve raw provenance evidence by chunk ID",
    responses={404: {"model": ErrorResponse}, 401: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def get_evidence_chunk(chunk_id: str) -> NormalizedRecord:
    """
    Returns the exact NormalizedRecord for a specific chunk, including its text and metadata.
    Never returns an unverified source.
    """
    retriever = get_retriever()
    chunk = retriever.get_chunk_by_id(chunk_id)
    
    if not chunk or chunk.verification_status != "VERIFIED":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "message": f"Verified evidence chunk {chunk_id} not found", "status_code": 404}
        )
        
    return chunk


@router.post(
    "",
    response_model=List[NormalizedRecord],
    summary="Batch retrieve evidence chunks",
    dependencies=[Depends(verify_api_key)],
)
async def get_batch_evidence(request: BatchEvidenceRequest) -> List[NormalizedRecord]:
    """
    Batch returns NormalizedRecords for a set of chunk IDs.
    Strictly filters out any unverified or missing records.
    """
    retriever = get_retriever()
    results = []
    
    for cid in request.chunk_ids:
        chunk = retriever.get_chunk_by_id(cid)
        if chunk and chunk.verification_status == "VERIFIED":
            results.append(chunk)
            
    return results


@citations_router.post(
    "",
    response_model=List[Citation],
    summary="Resolve citations from chunk IDs",
    dependencies=[Depends(verify_api_key)],
)
async def get_batch_citations(request: BatchCitationRequest) -> List[Citation]:
    """
    Resolves chunk IDs into standardized Citation objects for System 1.
    NEVER allows a citation to reference an unverified source.
    """
    retriever = get_retriever()
    source_registry = get_source_registry()
    citations = []
    
    for idx, cid in enumerate(request.chunk_ids):
        chunk = retriever.get_chunk_by_id(cid)
        # CRITICAL SECURITY RULE: Never allow unverified sources in citations
        if chunk and chunk.verification_status == "VERIFIED":
            # Lookup source URL if source_id exists
            source_url = None
            if chunk.source_id:
                src = source_registry.get_source(chunk.source_id)
                if src:
                    source_url = src.url
                    
            citations.append(
                Citation(
                    citation_id=f"cit-{cid[:8]}-{idx}",
                    chunk_id=chunk.chunk_id,
                    document_id=chunk.document_id,
                    source_id=chunk.source_id,
                    text=chunk.text,
                    authority=chunk.authority or "Unknown Authority",
                    title=chunk.title,
                    url=source_url
                )
            )
            
    return citations
