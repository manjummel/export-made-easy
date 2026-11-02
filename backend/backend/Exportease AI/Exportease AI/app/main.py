# ============================================================
# ExportEase AI - Main Application
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
FastAPI application entry point.
SYSTEM 3 is the central business orchestration layer between
the independently developed AI, Knowledge, and Frontend systems.

Development Rule: Every development step must:
1. Load the shared contracts
2. Preserve API schemas
3. Implement local functionality
4. Implement or update external-service clients
5. Create health/readiness/version checks
6. Create mock adapters where needed
7. Create integration tests
8. Test real connectivity when available
9. Clearly report unavailable dependencies
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db, close_db
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.api.v1.router import api_router
from app.api.v1.websocket import router as ws_router
from app.utils.constants import API_PREFIX, SYSTEM_3_ID

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Application State (service clients) ───────────────────────
app_state: dict = {}


def _init_service_clients():
    """Initialize AI and Knowledge service clients (real or mock)."""
    if settings.use_mock_services:
        logger.info(
            "┌─────────────────────────────────────────────────────┐\n"
            "│  MOCK MODE ACTIVE — Using mock service adapters     │\n"
            "│  Set REAL_SERVICES=true to use real services        │\n"
            "└─────────────────────────────────────────────────────┘"
        )
        from app.clients.mock_ai_client import MockAIServiceClient
        from app.clients.mock_knowledge_client import MockKnowledgeServiceClient

        app_state["ai_client"] = MockAIServiceClient()
        app_state["knowledge_client"] = MockKnowledgeServiceClient()
    else:
        logger.info(
            "┌─────────────────────────────────────────────────────┐\n"
            "│  REAL MODE — Connecting to external services        │\n"
            f"│  AI Engine:      {settings.AI_SERVICE_URL:<34}│\n"
            f"│  Knowledge:      {settings.KNOWLEDGE_SERVICE_URL:<34}│\n"
            "└─────────────────────────────────────────────────────┘"
        )
        from app.clients.ai_client import AIServiceClient
        from app.clients.knowledge_client import KnowledgeServiceClient

        app_state["ai_client"] = AIServiceClient(
            base_url=settings.AI_SERVICE_URL,
            timeout=settings.AI_SERVICE_TIMEOUT,
            api_version=settings.AI_SERVICE_API_VERSION,
        )
        app_state["knowledge_client"] = KnowledgeServiceClient(
            base_url=settings.KNOWLEDGE_SERVICE_URL,
            timeout=settings.KNOWLEDGE_SERVICE_TIMEOUT,
            api_version=settings.KNOWLEDGE_SERVICE_API_VERSION,
            api_key=settings.KNOWLEDGE_API_KEY,
        )


async def _cleanup_service_clients():
    """Close all service client connections."""
    for key in ("ai_client", "knowledge_client"):
        client = app_state.get(key)
        if client:
            await client.close()


# ── Lifespan ──────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Startup
    logger.info(f"Starting {SYSTEM_3_ID} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Port: {settings.BACKEND_SERVICE_PORT}")

    # Initialize database tables (dev convenience)
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}")
        logger.warning("The service will start but database operations may fail")

    # Initialize service clients
    _init_service_clients()

    logger.info(
        f"\n"
        f"╔═══════════════════════════════════════════════════════╗\n"
        f"║  ExportEase AI Backend — {SYSTEM_3_ID}  ║\n"
        f"║  Version: {settings.APP_VERSION:<44}║\n"
        f"║  API: {API_PREFIX:<48}║\n"
        f"║  Docs: http://localhost:{settings.BACKEND_SERVICE_PORT}/docs{'':>24}║\n"
        f"╚═══════════════════════════════════════════════════════╝"
    )

    yield

    # Shutdown
    logger.info("Shutting down...")
    await _cleanup_service_clients()
    await close_db()
    logger.info("Shutdown complete")


# ── Create Application ────────────────────────────────────────
app = FastAPI(
    title="ExportEase AI Backend",
    description=(
        "System 3 — Central Business Orchestrator for ExportEase AI. "
        "An AI-powered export intelligence platform for Indian MSMEs. "
        "Manages authentication, MSME profiles, export projects, "
        "workflow state, and coordinates with AI Engine (System 1) "
        "and Knowledge/RAG (System 2)."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# ── Routes ────────────────────────────────────────────────────
app.include_router(api_router, prefix=API_PREFIX)
app.include_router(ws_router, prefix=API_PREFIX)


# ── Root ──────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "system": SYSTEM_3_ID,
        "name": "ExportEase AI Backend",
        "version": settings.APP_VERSION,
        "api_docs": "/docs",
        "health": f"{API_PREFIX}/health",
        "readiness": f"{API_PREFIX}/readiness",
    }


# ── Configure Logging ─────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
