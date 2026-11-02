"""
ai_engine/schemas/knowledge.py

Pydantic v2 models for the Knowledge/RAG service interface.
Mirrors contracts/v1/knowledge_result.json exactly.

System 1 MUST NEVER access Qdrant directly.
All knowledge retrieval goes through the KnowledgeClient HTTP interface.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field

from .common import VerificationStatus


class KnowledgeResult(BaseModel):
    """
    A single knowledge chunk returned by System 2.
    Mirrors contracts/v1/knowledge_result.json.

    CRITICAL: Only chunks with verification_status=VERIFIED may be used
    to support regulatory claims in agent outputs.
    """

    chunk_id: str = Field(description="Unique chunk identifier.")
    document_id: str = Field(description="Parent document identifier.")
    source_id: str = Field(description="Source registry identifier.")
    text: str = Field(description="The retrieved text passage.")
    score: float = Field(ge=0.0, le=1.0, description="Relevance score (0.0–1.0).")
    authority: Optional[str] = Field(default=None, description="Issuing authority (e.g. DGFT, EU Commission).")
    title: Optional[str] = Field(default=None)
    page: Optional[str] = Field(default=None)
    section: Optional[str] = Field(default=None)
    country: Optional[str] = Field(default=None)
    product: Optional[str] = Field(default=None)
    hs_code: Optional[str] = Field(default=None)
    language: Optional[str] = Field(default=None)
    publication_date: Optional[str] = Field(default=None)
    effective_date: Optional[str] = Field(default=None)
    verification_status: VerificationStatus = Field(
        description="CRITICAL: Only VERIFIED chunks support regulatory claims."
    )

    @property
    def is_verified(self) -> bool:
        """True if this chunk can be used for regulatory claims."""
        return self.verification_status == VerificationStatus.VERIFIED

    def to_citation_id(self) -> str:
        """Generate a citation ID for use in response sources list."""
        return f"chunk:{self.chunk_id}:doc:{self.document_id}:src:{self.source_id}"


class KnowledgeFilters(BaseModel):
    """Optional filters for knowledge retrieval."""
    country: Optional[str] = None
    product: Optional[str] = None
    hs_code: Optional[str] = None
    language: Optional[str] = None
    verification_status: Optional[VerificationStatus] = None
    authority: Optional[str] = None


class KnowledgeRequest(BaseModel):
    """
    Request sent to the Knowledge service.
    Wraps the common request envelope fields relevant to retrieval.
    """
    query: str = Field(description="The retrieval query text.")
    request_id: str = Field(description="Propagated request_id for tracing.")
    top_k: int = Field(default=5, ge=1, le=20, description="Max results to return.")
    filters: Optional[KnowledgeFilters] = Field(default=None)
    language: str = Field(default="en")
    agent: Optional[str] = Field(default=None, description="Calling agent name for logging.")


class GroundingStatus(str):
    """Grounding status values returned by the safety layer."""
    SUFFICIENT = "SUFFICIENT"
    INSUFFICIENT = "INSUFFICIENT_GROUNDING"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
