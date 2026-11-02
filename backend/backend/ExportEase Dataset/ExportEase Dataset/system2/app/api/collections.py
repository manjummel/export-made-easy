"""
collections.py — Vector collection management endpoints

GET    /v1/collections                     — List all collections
POST   /v1/collections                     — Create a collection
DELETE /v1/collections/{name}              — Delete a collection
GET    /v1/collections/{name}/stats        — Collection statistics
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.retriever import get_retriever
from app.middleware.auth import verify_api_key
from app.models.requests import CollectionCreateRequest
from app.models.responses import (
    CollectionInfo,
    DeleteCollectionResponse,
    ErrorResponse,
    ListCollectionsResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/collections", tags=["Collections"])


@router.get(
    "",
    response_model=ListCollectionsResponse,
    summary="List all knowledge collections",
    dependencies=[Depends(verify_api_key)],
)
async def list_collections() -> ListCollectionsResponse:
    """Returns all Qdrant collections visible to System 2."""
    retriever = get_retriever()
    raw = retriever.list_collections()
    collections = [
        CollectionInfo(
            name=c["name"],
            vectors_count=c["vectors_count"],
            status=c.get("status", "green") if c.get("status") in ("green", "yellow", "red") else "green",
            vector_size=c.get("vector_size"),
        )
        for c in raw
    ]
    return ListCollectionsResponse(collections=collections, total=len(collections))


@router.post(
    "",
    response_model=CollectionInfo,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new knowledge collection",
    responses={400: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def create_collection(request: CollectionCreateRequest) -> CollectionInfo:
    """Create a new Qdrant collection with specified vector dimensions."""
    try:
        retriever = get_retriever()
        info = retriever.create_collection(
            name=request.name,
            vector_size=request.vector_size,
            distance=request.distance,
        )
        return CollectionInfo(
            name=info["name"],
            vectors_count=info["vectors_count"],
            status="green",
            vector_size=request.vector_size,
            created_at=datetime.now(timezone.utc),
        )
    except Exception as exc:
        logger.error("Create collection failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "COLLECTION_EXISTS_OR_ERROR", "message": str(exc), "status_code": 400},
        )


@router.delete(
    "/{collection_name}",
    response_model=DeleteCollectionResponse,
    summary="Delete a knowledge collection",
    responses={404: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def delete_collection(collection_name: str) -> DeleteCollectionResponse:
    """Delete a Qdrant collection and all its vectors."""
    try:
        retriever = get_retriever()
        retriever.delete_collection(collection_name)
        return DeleteCollectionResponse(name=collection_name, status="deleted")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "COLLECTION_NOT_FOUND", "message": str(exc), "status_code": 404},
        )


@router.get(
    "/{collection_name}/stats",
    response_model=CollectionInfo,
    summary="Get statistics for a collection",
    responses={404: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def get_collection_stats(collection_name: str) -> CollectionInfo:
    """Returns vector count and status for a named collection."""
    try:
        retriever = get_retriever()
        stats = retriever.get_collection_stats(collection_name)
        return CollectionInfo(
            name=stats["name"],
            vectors_count=stats["vectors_count"],
            status=stats.get("status", "green") if stats.get("status") in ("green", "yellow", "red") else "green",
            vector_size=stats.get("vector_size"),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "COLLECTION_NOT_FOUND", "message": str(exc), "status_code": 404},
        )
