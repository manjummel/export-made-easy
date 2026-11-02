"""
health.py — Health, readiness and version endpoints

GET /health  — Liveness probe (always 200 if process is running)
GET /ready   — Readiness probe (503 if Qdrant or contracts unavailable)
GET /version — API version info
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.models.responses import HealthResponse, ReadinessResponse, VersionResponse
from rag.integration.connectivity import get_connectivity_checker
from rag.integration.contract_loader import get_contract_hash

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])

_start_time = datetime.now(timezone.utc)


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health check",
    responses={503: {"model": HealthResponse}},
)
async def get_health() -> HealthResponse:
    """
    Liveness probe. Returns 200 as long as the process is running.
    Does NOT check downstream services (use /ready for that).
    """
    settings = get_settings()
    uptime = (datetime.now(timezone.utc) - _start_time).total_seconds()
    return HealthResponse(
        status="ok",
        service=settings.service_name,
        version=settings.service_version,
        timestamp=datetime.now(timezone.utc),
        uptime_seconds=round(uptime, 2),
    )


@router.get(
    "/ready",
    summary="Readiness probe",
    responses={200: {"model": ReadinessResponse}, 503: {"model": ReadinessResponse}},
)
async def get_readiness():
    """
    Readiness probe. Returns 503 if Qdrant is unreachable or contracts are invalid.
    System 1 and System 3 connectivity is checked but non-blocking.
    """
    checker = get_connectivity_checker()
    await checker.check_all()
    summary = checker.get_readiness_summary()

    http_status = status.HTTP_200_OK if summary["status"] == "ready" else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(content=summary, status_code=http_status)


@router.get(
    "/version",
    response_model=VersionResponse,
    summary="API version information",
)
async def get_version() -> VersionResponse:
    """Returns version metadata for System 2 and the loaded API contract."""
    settings = get_settings()
    try:
        contract_hash = get_contract_hash()
    except Exception:
        contract_hash = "unavailable"

    return VersionResponse(
        service=settings.service_name,
        version=settings.service_version,
        api_version=settings.knowledge_api_version,
        knowledge_api_version="1.0.0",
        build_time=_start_time,
        contract_hash=contract_hash,
    )
