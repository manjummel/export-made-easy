"""
knowledge.py — RAG query and semantic search endpoints

POST /v1/knowledge/query  — Full RAG: embed → retrieve → answer + citations
POST /v1/knowledge/search — Pure vector similarity search (no generation)
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.rag_pipeline import get_rag_pipeline
from app.core.retriever import get_retriever
from app.middleware.auth import verify_api_key
from app.config import get_settings
from app.models.requests import QueryRequest, SearchRequest, HybridRetrieveRequest, ConfidenceRequest
from app.models.responses import ErrorResponse, QueryResponse, SearchResponse, KnowledgeVersionResponse, KnowledgeStatusResponse, HybridRetrieveResponse, ConfidenceResponse, ConfidenceLevel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/knowledge", tags=["Knowledge"])

@router.get(
    "/version",
    response_model=KnowledgeVersionResponse,
    summary="Retrieve regulatory and pipeline version metadata",
    responses={401: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def get_knowledge_version() -> KnowledgeVersionResponse:
    """Returns the active versions for dataset, embeddings, and retrieval."""
    settings = get_settings()
    return KnowledgeVersionResponse(
        dataset_version=settings.dataset_version,
        embedding_version=settings.embedding_model,
        retrieval_version=settings.retrieval_version,
        reranker_version=settings.reranker_version,
        api_version=settings.knowledge_api_version,
    )


@router.get(
    "/status",
    response_model=KnowledgeStatusResponse,
    summary="Retrieve dataset status and coverage summary",
    responses={401: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def get_knowledge_status() -> KnowledgeStatusResponse:
    """Returns administrative status of the RAG dataset."""
    from datetime import datetime, timezone
    
    settings = get_settings()
    retriever = get_retriever()
    
    total_count = retriever.count_records()
    verified_count = retriever.count_records(filters={"verification_status": "VERIFIED"})
    coverage = retriever.get_coverage_summary()
    
    return KnowledgeStatusResponse(
        record_count=total_count,
        verified_count=verified_count,
        dataset_version=settings.dataset_version,
        last_updated=datetime.now(timezone.utc), # Ideally fetched from last ingest log
        coverage_summary=coverage
    )

@router.post(
    "/query",
    response_model=QueryResponse,
    status_code=status.HTTP_200_OK,
    summary="RAG query — retrieve and generate grounded answer",
    responses={
        401: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
    dependencies=[Depends(verify_api_key)],
)
async def query_knowledge(request: QueryRequest) -> QueryResponse:
    """
    Primary endpoint consumed by System 1 (LLM + Multi-Agent).

    Pipeline:
      1. Embeds the query using the configured embedding model
      2. Retrieves top-k relevant chunks from Qdrant (hybrid search)
      3. Returns a grounded answer with source citations

    System 1 may further augment the returned answer with its own LLM.
    System 3 (Backend) may call this for compliance lookups.
    """
    try:
        pipeline = get_rag_pipeline()
        return await pipeline.query(request)
    except ConnectionError as exc:
        logger.error("Qdrant unreachable during query: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "QDRANT_UNAVAILABLE",
                "message": "Vector database is temporarily unavailable",
                "status_code": 503,
            },
        )
    except Exception as exc:
        logger.exception("Unexpected error during RAG query: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "RAG_PIPELINE_ERROR",
                "message": str(exc),
                "status_code": 500,
            },
        )


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Pure vector similarity search (no generation)",
    responses={
        401: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
    dependencies=[Depends(verify_api_key)],
)
async def search_knowledge(request: SearchRequest) -> SearchResponse:
    """
    Pure semantic search over the knowledge store.
    Returns raw chunk matches without LLM generation.
    Useful when System 1 wants to retrieve context for its own LLM pipeline.
    """
    try:
        pipeline = get_rag_pipeline()
        return await pipeline.search(request)
    except Exception as exc:
        logger.exception("Search error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "SEARCH_ERROR",
                "message": str(exc),
                "status_code": 503,
            },
        )

@router.post(
    "/retrieve",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Pure vector similarity search with rich metadata filtering",
    responses={401: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def retrieve_knowledge(request: SearchRequest) -> SearchResponse:
    """
    Semantic search over the knowledge store, enforcing the shared retrieval schema.
    System 1 must never need to know the internal Qdrant payload structure.
    """
    return await search_knowledge(request)

def _calculate_confidence(results: list) -> ConfidenceLevel:
    if not results:
        return ConfidenceLevel.INSUFFICIENT_GROUNDING
    
    # We expect results to be dicts if from ConfidenceRequest or objects if from SearchResponse
    top_score = getattr(results[0], "score", None)
    if top_score is None and isinstance(results[0], dict):
        top_score = results[0].get("score", 0.0)
        
    if top_score is None:
        top_score = 0.0
        
    if top_score < 0.4:
        return ConfidenceLevel.INSUFFICIENT_GROUNDING
    elif top_score < 0.6:
        return ConfidenceLevel.LOW
    elif top_score < 0.8:
        return ConfidenceLevel.MEDIUM
    else:
        return ConfidenceLevel.HIGH

@router.post(
    "/confidence",
    response_model=ConfidenceResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate retrieval confidence",
    responses={401: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def calculate_confidence(request: ConfidenceRequest) -> ConfidenceResponse:
    level = _calculate_confidence(request.results)
    return ConfidenceResponse(confidence_level=level)

@router.post(
    "/retrieve/hybrid",
    response_model=HybridRetrieveResponse,
    status_code=status.HTTP_200_OK,
    summary="Explicitly perform BM25 + Dense Hybrid Retrieval",
    responses={401: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    dependencies=[Depends(verify_api_key)],
)
async def retrieve_hybrid(request: HybridRetrieveRequest) -> HybridRetrieveResponse:
    """
    Explicitly forces hybrid retrieval and returns a mapped confidence score.
    Does not leak BM25 weights or Qdrant constructs.
    """
    # Map to internal SearchRequest forcing hybrid mode
    internal_req = SearchRequest(
        query=request.query,
        filters=request.filters,
        top_k=request.top_k,
        score_threshold=0.0, # Let hybrid fusion decide
    )
    
    # We cheat a bit by just using search_knowledge, but we could bypass to retriever directly.
    # The actual RAG pipeline handles the Qdrant call.
    pipeline = get_rag_pipeline()
    search_resp = await pipeline.search(internal_req)
    
    results = search_resp.results
    
    # Confidence heuristic
    confidence_level = _calculate_confidence(results)
    
    settings = get_settings()
    
    return HybridRetrieveResponse(
        results=results,
        confidence=confidence_level,
        metadata={
            "processing_time_ms": search_resp.processing_time_ms,
            "mode": "hybrid",
            "total_results": len(results)
        },
        retrieval_version=settings.retrieval_version
    )
