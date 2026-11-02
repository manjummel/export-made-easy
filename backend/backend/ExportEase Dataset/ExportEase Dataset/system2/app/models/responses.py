"""
responses.py — Pydantic response models for EXPORT-EASE-KNOWLEDGE-V1
These models mirror the OpenAPI contract schemas exactly.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field


class ConfidenceLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INSUFFICIENT_GROUNDING = "INSUFFICIENT_GROUNDING"


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded", "error"]
    service: str
    version: str
    timestamp: datetime
    uptime_seconds: Optional[float] = None


class ReadinessResponse(BaseModel):
    status: Literal["ready", "not_ready"]
    checks: Dict[str, Literal["ok", "error", "pending", "not_configured"]]
    message: str


class VersionResponse(BaseModel):
    service: str
    version: str
    api_version: str
    knowledge_api_version: str
    build_time: datetime
    contract_hash: Optional[str] = None


class KnowledgeVersionResponse(BaseModel):
    dataset_version: str
    embedding_version: str
    retrieval_version: str
    reranker_version: str
    api_version: str


class KnowledgeStatusResponse(BaseModel):
    record_count: int
    verified_count: int
    dataset_version: str
    last_updated: datetime
    coverage_summary: Dict[str, int]


class TrainingDatasetManifest(BaseModel):
    dataset_id: str
    dataset_version: str
    schema_version: str
    record_count: int


class EmbeddingStatusResponse(BaseModel):
    embedding_model_version: str
    embedding_dimension: int
    dataset_version: str


class NormalizedRecord(BaseModel):
    chunk_id: str
    document_id: str
    source_id: Optional[str] = None
    text: str
    authority: Optional[str] = None
    title: Optional[str] = None
    topic: Optional[str] = None
    product: Optional[str] = None
    hs_code: Optional[str] = None
    country: Optional[List[str]] = None
    language: Optional[str] = None
    page: Optional[int] = None
    section: Optional[str] = None
    publication_date: Optional[str] = None
    effective_date: Optional[str] = None
    superseded: Optional[bool] = None
    dataset_version: Optional[str] = None
    verification_status: str


class RetrievalResult(NormalizedRecord):
    score: float


class Citation(BaseModel):
    citation_id: str
    chunk_id: str
    document_id: str
    source_id: Optional[str] = None
    text: str
    authority: str
    title: Optional[str] = None
    url: Optional[str] = None


class SourceResponse(BaseModel):
    source_id: str
    authority: str
    title: str
    url: str
    source_type: Literal["regulation", "agreement", "guideline", "official_publication", "unknown"]
    publication_date: str
    effective_date: str
    retrieval_date: datetime
    language: str
    verification_status: Literal["VERIFIED", "REVIEW_REQUIRED", "REJECTED"]


class QueryResponse(BaseModel):
    query_id: UUID
    answer: str
    sources: List[NormalizedRecord] = Field(default_factory=list)
    retrieval_count: int
    latency_ms: float
    model_used: Optional[str] = None
    processing_time_ms: int


class SearchResponse(BaseModel):
    query: str
    results: List[RetrievalResult]
    total_results: int
    processing_time_ms: int


class ConfidenceResponse(BaseModel):
    confidence_level: ConfidenceLevel


class HybridRetrieveResponse(BaseModel):
    results: List[RetrievalResult]
    confidence: ConfidenceLevel
    metadata: Dict[str, Any]
    retrieval_version: str


class IngestResponse(BaseModel):
    document_id: str
    chunks_created: int
    chunks_rejected: int = 0
    status: Literal["ingested", "updated", "failed"]
    collection: str
    timestamp: datetime


class DocumentProvenanceResponse(BaseModel):
    document_id: str
    source_id: Optional[str] = None
    content_hash: str
    retrieval_time: datetime
    metadata: Dict[str, Any]


class BatchIngestResponse(BaseModel):
    total: int
    succeeded: int
    failed: int
    results: List[IngestResponse] = Field(default_factory=list)


class StructuredRecordIngestResponse(BaseModel):
    record_id: str
    document_id: str
    chunks_created: int
    chunks_rejected: int = 0
    status: Literal["ingested", "failed"]


class CollectionInfo(BaseModel):
    name: str
    vectors_count: int
    status: Literal["green", "yellow", "red"]
    vector_size: Optional[int] = None
    created_at: Optional[datetime] = None


class ErrorResponse(BaseModel):
    error: str
    message: str
    status_code: int
    detail: Optional[Dict[str, Any]] = None
    request_id: Optional[UUID] = None


class DeleteDocumentResponse(BaseModel):
    document_id: str
    chunks_deleted: int
    status: Literal["deleted", "not_found"]


class DeleteCollectionResponse(BaseModel):
    name: str
    status: Literal["deleted"]


class ListCollectionsResponse(BaseModel):
    collections: List[CollectionInfo]
    total: int
