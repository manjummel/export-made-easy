# ============================================================
# ExportEase AI - Health, Readiness & Version API
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Health, readiness, and version endpoints.
Every development step must create health/readiness/version checks.
"""

from fastapi import APIRouter, Depends

from app.config import get_settings
from app.schemas.common import HealthResponse, ReadinessResponse, VersionResponse
from app.dependencies import get_ai_client, get_knowledge_client
from app.utils.constants import API_VERSION, SYSTEM_3_ID
from app.utils.validators import utc_now_iso

router = APIRouter()
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check — is the service running?"""
    return HealthResponse(
        status="healthy",
        system_id=SYSTEM_3_ID,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=utc_now_iso(),
        dependencies={
            "ai_service": settings.AI_SERVICE_URL,
            "knowledge_service": settings.KNOWLEDGE_SERVICE_URL,
            "database": "postgresql",
            "mock_mode": str(settings.use_mock_services),
        },
    )


@router.get("/readiness", response_model=ReadinessResponse)
async def readiness_check():
    """
    Readiness check — are all dependencies available?
    Checks database, AI Engine, and Knowledge Service connectivity.
    """
    # Database check
    db_status = "unknown"
    try:
        from app.database import engine
        async with engine.connect() as conn:
            await conn.execute(
                __import__("sqlalchemy").text("SELECT 1")
            )
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)[:100]}"

    # AI Service check
    ai_status = "unknown"
    try:
        ai_client = get_ai_client()
        if ai_client:
            health = await ai_client.health_check()
            ai_status = health.get("status", "unknown")
        else:
            ai_status = "not_configured"
    except Exception as e:
        ai_status = f"unavailable: {str(e)[:100]}"

    # Knowledge Service check
    kb_status = "unknown"
    try:
        kb_client = get_knowledge_client()
        if kb_client:
            health = await kb_client.health_check()
            kb_status = health.get("status", "unknown")
        else:
            kb_status = "not_configured"
    except Exception as e:
        kb_status = f"unavailable: {str(e)[:100]}"

    all_ready = db_status == "healthy"  # DB is required; services can be mock
    return ReadinessResponse(
        ready=all_ready,
        database=db_status,
        ai_service=ai_status,
        knowledge_service=kb_status,
        timestamp=utc_now_iso(),
    )


@router.get("/version", response_model=VersionResponse)
async def version_info():
    """System version information."""
    return VersionResponse(
        system_id=SYSTEM_3_ID,
        version=settings.APP_VERSION,
        api_version=API_VERSION,
        environment=settings.ENVIRONMENT,
    )
