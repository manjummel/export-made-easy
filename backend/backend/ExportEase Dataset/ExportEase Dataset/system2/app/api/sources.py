"""
sources.py — API router for Source metadata retrieval
"""

from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, HTTPException

from app.core.source_registry import SourceRegistry, get_source_registry
from app.middleware.auth import verify_api_key
from app.models.requests import BatchSourceRequest
from app.models.responses import SourceResponse, ErrorResponse

router = APIRouter(
    prefix="/v1/sources",
    tags=["Sources"],
    dependencies=[Depends(verify_api_key)],
)


@router.get(
    "/{source_id}",
    response_model=SourceResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Source not found"},
    }
)
async def get_source(
    source_id: str,
    registry: SourceRegistry = Depends(get_source_registry),
) -> SourceResponse:
    """Retrieve metadata about a specific source."""
    source = registry.get_source(source_id)
    if not source:
        raise HTTPException(
            status_code=404,
            detail={"error": "NOT_FOUND", "message": f"Source {source_id} not found", "status_code": 404}
        )
    return source


@router.post(
    "/batch",
    response_model=List[SourceResponse],
    summary="Batch retrieve sources by source_ids",
)
async def get_batch_sources(
    request: BatchSourceRequest,
    registry: SourceRegistry = Depends(get_source_registry),
) -> List[SourceResponse]:
    """Suitable for System 3 and System 4 backend lookup."""
    results = []
    for sid in request.source_ids:
        src = registry.get_source(sid)
        if src:
            results.append(src)
    return results


@router.post(
    "",
    response_model=SourceResponse,
    summary="Register a new source",
)
async def register_source(
    source: SourceResponse,
    registry: SourceRegistry = Depends(get_source_registry),
) -> SourceResponse:
    """Registers a new source in the source registry."""
    return registry.register_source(source)
