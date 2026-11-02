"""
ingest.py — Document ingestion endpoints

POST /v1/documents/ingest   — Ingest a single document
POST /v1/documents/batch    — Batch ingest multiple documents
DELETE /v1/documents/{id}   — Remove a document and all its chunks
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.config import get_settings
from app.core.chunker import ExportDocumentChunker
from app.core.rag_pipeline import get_rag_pipeline
from app.core.retriever import get_retriever
from app.core.document_registry import get_document_registry
from app.middleware.auth import verify_api_key
from app.models.requests import BatchIngestRequest, IngestRequest
from app.models.responses import (
    BatchIngestResponse, DeleteDocumentResponse, ErrorResponse, 
    IngestResponse, DocumentProvenanceResponse
)
import hashlib
from app.core.cleaner import DocumentCleaner
from app.core.rejected_registry import get_rejected_registry

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/documents", tags=["Documents"])


def _ingest_single(request: IngestRequest) -> IngestResponse:
    """Core ingest logic shared by single and batch endpoints."""
    settings = get_settings()
    pipeline = get_rag_pipeline()
    retriever = get_retriever()

    # Generate document ID if not provided
    document_id = request.document_id or f"doc-{uuid.uuid4().hex[:12]}"
    collection = request.collection

    # Ensure the target collection exists
    retriever.ensure_collection(
        collection_name=collection,
        vector_size=settings.qdrant_vector_size,
    )

    # Chunk the document
    chunker = ExportDocumentChunker(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
    )
    text_chunks = chunker.split(request.content)
    chunk_texts = [c.content for c in text_chunks]

    if not chunk_texts:
        raise ValueError("Document produced no text chunks after splitting")

    # Compute content hash on raw content
    content_hash = hashlib.sha256(request.content.encode("utf-8")).hexdigest()
    retrieval_time = datetime.now(timezone.utc)

    # 1. Clean chunks
    cleaned_chunks = [DocumentCleaner.clean_text(c) for c in chunk_texts if c.strip()]
    
    # 2. Deduplicate
    unique_chunks = DocumentCleaner.deduplicate(cleaned_chunks)
    
    if not unique_chunks:
        raise ValueError("Document produced no valid chunks after cleaning")

    # Prepare metadata payload
    meta = request.metadata.model_dump(mode="json", exclude_none=True)
    meta["document_id"] = document_id

    # 3. Validate against shared schema
    valid_chunks, rejected_records = DocumentCleaner.validate_chunks(
        chunks=unique_chunks, document_id=document_id, metadata=meta
    )
    
    if rejected_records:
        logger.warning(f"Rejected {len(rejected_records)} chunks for document {document_id}")
        get_rejected_registry().log_rejected(document_id, rejected_records)
        
    if not valid_chunks:
        raise ValueError("All chunks were rejected due to schema validation failure")

    # Embed and prepare for Qdrant
    prepared_chunks = pipeline.embed_and_prepare_chunks(
        chunks=valid_chunks,
        document_id=document_id,
        metadata=meta,
        collection=collection,
    )

    # Upsert into Qdrant
    retriever.upsert_chunks(collection=collection, chunks=prepared_chunks)

    # Save provenance record
    registry = get_document_registry()
    registry.save_record(DocumentProvenanceResponse(
        document_id=document_id,
        source_id=meta.get("source_id"),
        content_hash=content_hash,
        retrieval_time=retrieval_time,
        metadata=meta,
    ))

    logger.info(
        "Ingested document — id=%s chunks=%d collection=%s",
        document_id, len(prepared_chunks), collection,
    )

    return IngestResponse(
        document_id=document_id,
        chunks_created=len(prepared_chunks),
        chunks_rejected=len(rejected_records),
        status="ingested",
        collection=collection,
        timestamp=datetime.now(timezone.utc),
    )


@router.post(
    "/ingest",
    response_model=IngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a single document into the knowledge store",
    responses={
        401: {"model": ErrorResponse},
        400: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
    dependencies=[Depends(verify_api_key)],
)
async def ingest_document(request: IngestRequest) -> IngestResponse:
    """
    Accepts document content + metadata, chunks it, generates embeddings,
    and stores in Qdrant. Returns document ID and chunk count.
    """
    try:
        return _ingest_single(request)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "INGEST_VALIDATION_ERROR", "message": str(exc), "status_code": 400},
        )
    except Exception as exc:
        logger.exception("Ingest error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "INGEST_ERROR", "message": str(exc), "status_code": 503},
        )


@router.post(
    "/batch",
    response_model=BatchIngestResponse,
    status_code=status.HTTP_200_OK,
    summary="Batch ingest multiple documents",
    dependencies=[Depends(verify_api_key)],
)
async def batch_ingest_documents(request: BatchIngestRequest) -> BatchIngestResponse:
    """Ingest up to 100 documents in a single request."""
    results: List[IngestResponse] = []
    succeeded = 0
    failed = 0

    for doc_request in request.documents:
        # Override collection from batch-level if needed
        if request.collection != "exportease_knowledge":
            doc_request = doc_request.model_copy(update={"collection": request.collection})
        try:
            result = _ingest_single(doc_request)
            results.append(result)
            succeeded += 1
        except Exception as exc:
            logger.error("Batch ingest failed for one document: %s", exc)
            results.append(
                IngestResponse(
                    document_id=doc_request.document_id or "unknown",
                    chunks_created=0,
                    status="failed",
                    collection=request.collection,
                    timestamp=datetime.now(timezone.utc),
                )
            )
            failed += 1

    return BatchIngestResponse(
        total=len(request.documents),
        succeeded=succeeded,
        failed=failed,
        results=results,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentProvenanceResponse,
    summary="Retrieve document provenance metadata",
    responses={404: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def get_document_provenance(document_id: str) -> DocumentProvenanceResponse:
    """Returns ingestion records (provenance) for a document ID."""
    registry = get_document_registry()
    record = registry.get_record(document_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail={"error": "NOT_FOUND", "message": f"Document {document_id} provenance not found", "status_code": 404}
        )
    return record


@router.delete(
    "/{document_id}",
    response_model=DeleteDocumentResponse,
    summary="Delete a document and all its chunks",
    responses={404: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def delete_document(document_id: str, collection: str = "exportease_knowledge") -> DeleteDocumentResponse:
    """Remove a document and all its vector chunks from Qdrant."""
    try:
        retriever = get_retriever()
        retriever.delete_by_document_id(collection=collection, document_id=document_id)
        
        # Also remove from registry
        get_document_registry().delete_record(document_id)
        
        return DeleteDocumentResponse(document_id=document_id, chunks_deleted=0, status="deleted")
    except Exception as exc:
        logger.exception("Delete error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "DELETE_ERROR", "message": str(exc), "status_code": 503},
        )
