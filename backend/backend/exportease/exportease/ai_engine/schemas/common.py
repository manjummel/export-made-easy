"""
ai_engine/schemas/common.py

Pydantic v2 models for the ExportEase Common Request and Response Envelopes.
These models mirror contracts/v1/request_envelope.json and response_envelope.json exactly.

NEVER change field names, types, or enum values without updating the contract version first.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class Language(str, Enum):
    """Supported response languages. Mirrors contracts/v1/request_envelope.json."""
    ENGLISH = "en"
    HINDI = "hi"
    TAMIL = "ta"
    TELUGU = "te"


class ResponseStatus(str, Enum):
    """
    Top-level response status values.
    Mirrors contracts/v1/response_envelope.json#/properties/status/enum.
    """
    SUCCESS = "SUCCESS"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
    INSUFFICIENT_GROUNDING = "INSUFFICIENT_GROUNDING"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    ERROR = "ERROR"
    AGENT_FAILED = "AGENT_FAILED"


class ConfidenceState(str, Enum):
    """
    Named confidence tiers used internally by the safety layer.
    Maps to numeric thresholds in ai_engine/safety/confidence.py.
    """
    HIGH = "HIGH"                 # score > 0.85
    MEDIUM = "MEDIUM"             # score > 0.65
    LOW = "LOW"                   # score > 0.40
    INSUFFICIENT = "INSUFFICIENT" # score <= 0.40
    REVIEW_REQUIRED = "REVIEW_REQUIRED"


class VerificationStatus(str, Enum):
    """
    Knowledge chunk verification status.
    Mirrors contracts/v1/knowledge_result.json#/properties/verification_status/enum.
    CRITICAL: Only VERIFIED chunks may support regulatory claims.
    """
    VERIFIED = "VERIFIED"
    UNVERIFIED = "UNVERIFIED"
    PENDING = "PENDING"
    INSUFFICIENT_GROUNDING = "INSUFFICIENT_GROUNDING"


# ---------------------------------------------------------------------------
# Request Envelope
# ---------------------------------------------------------------------------


class RequestEnvelope(BaseModel):
    """
    Common request envelope for all cross-system requests.
    Mirrors contracts/v1/request_envelope.json.
    """

    request_id: str = Field(
        default_factory=lambda: str(uuid4()),
        description="Unique request identifier (UUID-compatible). MUST be preserved in all responses.",
    )
    user_id: Optional[str] = Field(default=None, description="Authenticated user identifier.")
    project_id: Optional[str] = Field(
        default=None, description="Export project identifier. MUST be preserved end-to-end."
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="ISO 8601 timestamp of the request.",
    )
    language: Language = Field(default=Language.ENGLISH, description="Response language.")
    api_version: str = Field(default="v1", description="API contract version.")

    model_config = {"extra": "allow"}  # allow domain-specific extensions


# ---------------------------------------------------------------------------
# Response Envelope
# ---------------------------------------------------------------------------


class ResponseEnvelope(BaseModel):
    """
    Common response envelope for all AI Engine responses.
    Mirrors contracts/v1/response_envelope.json.

    NEVER change field names without updating the contract version.
    """

    request_id: str = Field(description="Echo of the original request_id. Always present.")
    project_id: Optional[str] = Field(default=None, description="Echo of project_id if provided.")
    status: ResponseStatus = Field(description="Top-level response status.")
    data: Dict[str, Any] = Field(default_factory=dict, description="Endpoint-specific payload.")
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Aggregate confidence score (0.0–1.0).",
    )
    sources: List[str] = Field(
        default_factory=list,
        description="Source/citation IDs used to generate the response.",
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Non-fatal warnings (e.g. low confidence on a sub-component).",
    )
    errors: List[str] = Field(
        default_factory=list,
        description="Error messages if status != SUCCESS.",
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    api_version: str = Field(default="v1")

    @field_validator("confidence")
    @classmethod
    def clamp_confidence(cls, v: float) -> float:
        return max(0.0, min(1.0, v))

    @classmethod
    def success(
        cls,
        request_id: str,
        data: Dict[str, Any],
        confidence: float = 1.0,
        sources: Optional[List[str]] = None,
        warnings: Optional[List[str]] = None,
        project_id: Optional[str] = None,
    ) -> "ResponseEnvelope":
        """Convenience factory for a successful response."""
        return cls(
            request_id=request_id,
            project_id=project_id,
            status=ResponseStatus.SUCCESS,
            data=data,
            confidence=confidence,
            sources=sources or [],
            warnings=warnings or [],
        )

    @classmethod
    def insufficient_grounding(
        cls,
        request_id: str,
        message: str,
        project_id: Optional[str] = None,
    ) -> "ResponseEnvelope":
        """
        Factory for INSUFFICIENT_GROUNDING response.
        Use when the Knowledge service cannot provide verified evidence.
        """
        return cls(
            request_id=request_id,
            project_id=project_id,
            status=ResponseStatus.INSUFFICIENT_GROUNDING,
            data={},
            confidence=0.0,
            errors=[message],
        )

    @classmethod
    def error(
        cls,
        request_id: str,
        message: str,
        project_id: Optional[str] = None,
    ) -> "ResponseEnvelope":
        """Factory for an error response."""
        return cls(
            request_id=request_id,
            project_id=project_id,
            status=ResponseStatus.ERROR,
            data={},
            confidence=0.0,
            errors=[message],
        )
