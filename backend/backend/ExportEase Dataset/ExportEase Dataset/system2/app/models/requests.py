"""
requests.py — Pydantic request models for EXPORT-EASE-KNOWLEDGE-V1
These models mirror the OpenAPI contract schemas exactly.
"""

from __future__ import annotations

from datetime import date
from typing import List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class MetadataFilters(BaseModel):
    country: Optional[List[str]] = None
    jurisdiction: Optional[List[str]] = Field(None, description="Alias for country")
    product: Optional[List[str]] = None
    product_category: Optional[List[str]] = None
    hs_code: Optional[List[str]] = None
    authority: Optional[List[str]] = None
    document_type: Optional[List[str]] = None
    topic: Optional[List[str]] = None
    language: Optional[List[str]] = None
    verification_status: Optional[str] = None
    effective_after: Optional[date] = None
    effective_before: Optional[date] = None


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=2000, description="Natural language query")
    collection: str = Field("exportease_knowledge", description="Target Qdrant collection")
    top_k: int = Field(5, ge=1, le=20, description="Number of documents to retrieve")
    score_threshold: float = Field(0.60, ge=0.0, le=1.0, description="Minimum similarity score")
    filters: Optional[MetadataFilters] = None
    include_sources: bool = Field(True, description="Include source documents in response")
    retrieval_mode: Literal["dense", "sparse", "hybrid"] = Field(
        "hybrid", description="Vector retrieval strategy"
    )

    @field_validator("query")
    @classmethod
    def strip_query(cls, v: str) -> str:
        return v.strip()


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=2000)
    collection: str = Field("exportease_knowledge")
    top_k: int = Field(10, ge=1, le=50)
    score_threshold: float = Field(0.50, ge=0.0, le=1.0)
    filters: Optional[MetadataFilters] = None

    @field_validator("query")
    @classmethod
    def strip_query(cls, v: str) -> str:
        return v.strip()


class HybridRetrieveRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=2000)
    filters: Optional[MetadataFilters] = None
    top_k: int = Field(10, ge=1, le=50)

    @field_validator("query")
    @classmethod
    def strip_query(cls, v: str) -> str:
        return v.strip()


class ConfidenceRequest(BaseModel):
    query: str
    results: List[Any] = Field(description="List of RetrievalResult dicts")


class DocumentMetadata(BaseModel):
    document_type: Literal[
        "hs_code", "trade_agreement", "sanction", "regulation", "guideline"
    ]
    jurisdiction: List[str] = Field(..., min_length=1)
    source_id: Optional[str] = None
    source_url: Optional[str] = None
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
    superseded: Optional[bool] = None
    dataset_version: Optional[str] = None
    language: str = Field("en", description="ISO 639-1 language code")
    tags: Optional[List[str]] = Field(default_factory=list)


class IngestRequest(BaseModel):
    content: str = Field(..., min_length=10, description="Document text content to ingest")
    metadata: DocumentMetadata
    collection: str = Field("exportease_knowledge")
    document_id: Optional[str] = Field(
        None, description="Optional document ID — auto-generated if not provided"
    )


class BatchIngestRequest(BaseModel):
    documents: List[IngestRequest] = Field(..., min_length=1, max_length=100)
    collection: str = Field("exportease_knowledge")


class StructuredRecordDates(BaseModel):
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None


class StructuredRecordIngestRequest(BaseModel):
    country: List[str] = Field(..., min_length=1)
    product: str = Field(..., min_length=2)
    hs_code: str = Field(..., pattern=r"^\d{2,10}$")
    dates: Optional[StructuredRecordDates] = None
    authority: str = Field(..., min_length=2)
    source_id: str = Field(..., min_length=3)
    collection: str = Field("exportease_knowledge")


class CollectionCreateRequest(BaseModel):
    name: str = Field(..., description="Collection name")
    vector_size: int = Field(384, description="Embedding dimension")
    distance: Literal["Cosine", "Euclid", "Dot"] = Field("Cosine")


class BatchEvidenceRequest(BaseModel):
    chunk_ids: List[str] = Field(..., min_length=1)


class BatchCitationRequest(BaseModel):
    chunk_ids: List[str] = Field(..., min_length=1)


class BatchSourceRequest(BaseModel):
    source_ids: List[str] = Field(..., min_length=1)
