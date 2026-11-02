# ============================================================
# ExportEase AI - Common Request/Response Envelopes
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Common request/response envelopes per shared contracts.
All cross-system communication uses these envelopes.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

from app.utils.constants import API_VERSION
from app.utils.validators import generate_uuid, utc_now_iso

T = TypeVar("T")


# ── Common Request Envelope ───────────────────────────────────
class RequestEnvelope(BaseModel):
    """Cross-system request envelope."""
    request_id: str = Field(default_factory=generate_uuid)
    user_id: Optional[str] = None
    project_id: Optional[str] = None
    timestamp: str = Field(default_factory=utc_now_iso)
    language: str = "en"
    api_version: str = API_VERSION


# ── Common Response Envelope ─────────────────────────────────
class ResponseEnvelope(BaseModel, Generic[T]):
    """Cross-system response envelope."""
    request_id: str = Field(default_factory=generate_uuid)
    project_id: Optional[str] = None
    status: str = "success"
    data: Optional[T] = None
    confidence: Optional[float] = None
    sources: list[dict[str, Any]] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=utc_now_iso)
    api_version: str = API_VERSION

    @classmethod
    def success(
        cls,
        data: Any = None,
        request_id: str | None = None,
        project_id: str | None = None,
        confidence: float | None = None,
        sources: list | None = None,
        warnings: list | None = None,
    ) -> "ResponseEnvelope":
        return cls(
            request_id=request_id or generate_uuid(),
            project_id=project_id,
            status="success",
            data=data,
            confidence=confidence,
            sources=sources or [],
            warnings=warnings or [],
        )

    @classmethod
    def error(
        cls,
        errors: list[str],
        request_id: str | None = None,
        project_id: str | None = None,
        warnings: list | None = None,
    ) -> "ResponseEnvelope":
        return cls(
            request_id=request_id or generate_uuid(),
            project_id=project_id,
            status="error",
            errors=errors,
            warnings=warnings or [],
        )

    @classmethod
    def insufficient_evidence(
        cls,
        message: str = "Insufficient evidence available",
        request_id: str | None = None,
        project_id: str | None = None,
    ) -> "ResponseEnvelope":
        """SAFETY: Preserve INSUFFICIENT_EVIDENCE state. Do not silently convert."""
        return cls(
            request_id=request_id or generate_uuid(),
            project_id=project_id,
            status="INSUFFICIENT_EVIDENCE",
            warnings=[message],
        )


# ── Pagination ────────────────────────────────────────────────
class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20
    total_pages: int = 0


# ── Health Check ──────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str = "healthy"
    system_id: str = "EXPORT-EASE-BACKEND-V1"
    version: str
    environment: str
    timestamp: str = Field(default_factory=utc_now_iso)
    dependencies: dict[str, str] = Field(default_factory=dict)


class ReadinessResponse(BaseModel):
    ready: bool = True
    database: str = "unknown"
    ai_service: str = "unknown"
    knowledge_service: str = "unknown"
    timestamp: str = Field(default_factory=utc_now_iso)


class VersionResponse(BaseModel):
    system_id: str = "EXPORT-EASE-BACKEND-V1"
    version: str
    api_version: str = API_VERSION
    environment: str
