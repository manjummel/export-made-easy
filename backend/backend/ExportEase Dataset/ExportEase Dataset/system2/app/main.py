"""
main.py — FastAPI application entrypoint for EXPORT-EASE-KNOWLEDGE-V1

Startup sequence:
  1. Load configuration
  2. Initialize structlog
  3. Load and validate API contracts
  4. Initialize embedding provider (warm-up model)
  5. Initialize Qdrant retriever
  6. Bootstrap service registry
  7. Run connectivity checks
  8. Start serving requests
"""

from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager

import structlog
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import collections, health, ingest, knowledge, sources, records, evidence, training, embedding
from app.config import get_settings
from app.core.embeddings import get_embedding_provider
from app.core.retriever import get_retriever
from app.middleware.logging import RequestLoggingMiddleware
from rag.integration.connectivity import get_connectivity_checker
from rag.integration.contract_loader import ContractLoader
from rag.integration.service_registry import ServiceRegistry

logger = structlog.get_logger(__name__)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup → serve → shutdown."""
    settings = get_settings()
    logger.info(
        "Starting EXPORT-EASE-KNOWLEDGE-V1",
        version=settings.service_version,
        environment=settings.environment,
        port=settings.knowledge_service_port,
    )

    # 1. Load and validate API contract
    try:
        loader = ContractLoader()
        loader.load()
        logger.info("API contract loaded", contract_hash=loader.get_hash())
    except Exception as exc:
        logger.warning("Contract load failed (non-fatal)", error=str(exc))

    # 2. Warm up embedding model
    try:
        provider = get_embedding_provider()
        logger.info(
            "Embedding provider ready",
            model=provider.model_name,
            vector_size=provider.vector_size,
        )
    except Exception as exc:
        logger.error("Embedding provider failed to initialize", error=str(exc))
        sys.exit(1)

    # 3. Initialize Qdrant retriever and ensure default collection exists
    try:
        retriever = get_retriever()
        retriever.ensure_collection(
            collection_name=settings.qdrant_collection_name,
            vector_size=settings.qdrant_vector_size,
        )
        logger.info("Qdrant retriever ready", collection=settings.qdrant_collection_name)
    except Exception as exc:
        logger.error(
            "Qdrant connection failed at startup",
            error=str(exc),
            hint="Check QDRANT_HOST and QDRANT_PORT env vars or run: docker-compose up qdrant",
        )
        # Non-fatal at startup — /ready will reflect the degraded state

    # 4. Initialize service registry and run initial connectivity checks
    registry = ServiceRegistry.get_instance()
    checker = get_connectivity_checker()
    results = await checker.check_all()
    for svc_name, result in results.items():
        status_str = "✓ reachable" if result.reachable else "✗ unreachable"
        logger.info(
            "Connectivity check",
            service=svc_name,
            status=status_str,
            latency_ms=result.response_ms,
        )

    logger.info(
        "System 2 ready",
        service=settings.service_name,
        port=settings.knowledge_service_port,
        docs_url=f"http://localhost:{settings.knowledge_service_port}/docs",
    )

    yield  # ← Application serves requests here

    logger.info("EXPORT-EASE-KNOWLEDGE-V1 shutting down")


# ── Application factory ────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="ExportEase Knowledge API",
        description=(
            "System 2 — EXPORT-EASE-KNOWLEDGE-V1\n\n"
            "The only interface through which System 1 (LLM + Multi-Agent) and "
            "System 3 (Backend) may query the export compliance knowledge store. "
            "Direct access to Qdrant is strictly prohibited for external systems."
        ),
        version=settings.service_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── Middleware ─────────────────────────────────────────────────────────────
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if not settings.is_production else [],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ────────────────────────────────────────────────────────────────
    app.include_router(health.router)
    app.include_router(knowledge.router)
    app.include_router(sources.router)
    app.include_router(evidence.router)
    app.include_router(evidence.citations_router)
    app.include_router(training.router)
    app.include_router(embedding.router)
    app.include_router(ingest.router)
    app.include_router(records.router)
    app.include_router(collections.router)

    # ── Global error handler ───────────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception", path=request.url.path, error=str(exc))
        return JSONResponse(
            status_code=500,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "status_code": 500,
            },
        )

    return app


# ── Module-level app instance ──────────────────────────────────────────────────
app = create_app()


# ── Entrypoint ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.knowledge_service_host,
        port=settings.knowledge_service_port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
