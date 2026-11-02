"""
ai_engine/main.py

ExportEase AI Intelligence Engine — FastAPI Application
SYSTEM 1: EXPORT-EASE-AI-ENGINE-V1

Startup sequence:
  1. Load shared contracts + validate schemas
  2. Initialize external service clients (real or mock based on env)
  3. Load LLM model (real or mock based on CPU_ONLY_MODE)
  4. Build LangGraph orchestrator
  5. Register all API routers

Port: AI_SERVICE_PORT (default 8001)
"""

from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager
from typing import Optional

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai_engine.config import settings
from ai_engine.version import VERSION

# -----------------------------------------------------------------------
# Logging setup
# -----------------------------------------------------------------------

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("ai_engine.main")


# -----------------------------------------------------------------------
# Lifespan: startup + shutdown
# -----------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    All startup logic runs before yield; shutdown logic runs after.
    """
    logger.info("=" * 60)
    logger.info(f"Starting {VERSION.system_id} v{VERSION.system_version}")
    logger.info(f"API version: {VERSION.api_version}")
    logger.info(f"Mode: CPU_ONLY={settings.cpu_only_mode} | MOCK_SERVICES={settings.mock_services}")
    logger.info("=" * 60)

    # ------------------------------------------------------------------
    # Step 1: Load contracts
    # ------------------------------------------------------------------
    from ai_engine.contracts.loader import load_contracts
    from ai_engine.contracts.validator import run_all_validations
    try:
        contracts = load_contracts(settings.contracts_dir)
        logger.info(f"Contracts loaded: {len(contracts)} schemas")
        violations = run_all_validations()
        has_violations = any(violations.values())
        if has_violations:
            logger.warning(f"Contract validation warnings: {violations}")
        else:
            logger.info("All contract validations passed.")
    except FileNotFoundError as e:
        logger.error(f"Contracts not found: {e}")
        logger.warning("Continuing without contract validation (dev mode).")
    except Exception as e:
        logger.error(f"Contract loading failed: {e}")

    # ------------------------------------------------------------------
    # Step 2: Initialize external clients
    # ------------------------------------------------------------------
    knowledge_client = _build_knowledge_client()
    backend_client = _build_backend_client()

    # Check connectivity (non-fatal)
    k_ok = await knowledge_client.check_connectivity()
    b_ok = await backend_client.check_connectivity()
    logger.info(f"Knowledge service: {'✓ reachable' if k_ok else '✗ unreachable (mock active)'}")
    logger.info(f"Backend service: {'✓ reachable' if b_ok else '✗ unreachable (mock active)'}")

    # ------------------------------------------------------------------
    # Step 3: Load model
    # ------------------------------------------------------------------
    from ai_engine.model.loader import load_model
    from ai_engine.model.inference import InferenceEngine
    from ai_engine.model.tokenizer import TokenizerWrapper

    model, tokenizer = load_model()
    inference = InferenceEngine(model, tokenizer)
    tokenizer_wrapper = TokenizerWrapper(tokenizer)
    logger.info(f"Model ready: {'MockLLM' if inference.is_mock else settings.model_name}")

    # ------------------------------------------------------------------
    # Step 4: Build orchestrator
    # ------------------------------------------------------------------
    from ai_engine.agents.graph import ExportWorkflowOrchestrator
    orchestrator = ExportWorkflowOrchestrator(
        inference=inference,
        knowledge=knowledge_client,
        backend_client=backend_client,
    )
    logger.info("LangGraph orchestrator ready (8 agents).")

    # ------------------------------------------------------------------
    # Attach to app state
    # ------------------------------------------------------------------
    app.state.knowledge_client = knowledge_client
    app.state.backend_client = backend_client
    app.state.inference = inference
    app.state.tokenizer = tokenizer_wrapper
    app.state.orchestrator = orchestrator

    logger.info(f"{VERSION.system_id} startup complete. Listening on port {settings.ai_service_port}.")
    logger.info("=" * 60)

    yield  # ← Application runs here

    # ------------------------------------------------------------------
    # Shutdown
    # ------------------------------------------------------------------
    logger.info("Shutting down AI Engine...")
    if hasattr(knowledge_client, "aclose"):
        await knowledge_client.aclose()
    if hasattr(backend_client, "aclose"):
        await backend_client.aclose()
    logger.info("Shutdown complete.")


# -----------------------------------------------------------------------
# Client builders
# -----------------------------------------------------------------------

def _build_knowledge_client():
    """Build real or mock Knowledge client based on configuration."""
    if settings.use_real_knowledge_client:
        from ai_engine.clients.knowledge.real_client import RealKnowledgeClient
        logger.info(f"Knowledge client: REAL → {settings.knowledge_service_url}")
        return RealKnowledgeClient()
    else:
        from ai_engine.clients.knowledge.mock_client import MockKnowledgeClient
        logger.info("Knowledge client: MOCK (set REAL_SERVICES=true for real)")
        return MockKnowledgeClient()


def _build_backend_client():
    """Build real or mock Backend client based on configuration."""
    if settings.use_real_backend_client:
        from ai_engine.clients.backend.real_client import RealBackendClient
        logger.info(f"Backend client: REAL → {settings.backend_service_url}")
        return RealBackendClient()
    else:
        from ai_engine.clients.backend.mock_client import MockBackendClient
        logger.info("Backend client: MOCK (set REAL_SERVICES=true for real)")
        return MockBackendClient()


# -----------------------------------------------------------------------
# FastAPI application
# -----------------------------------------------------------------------

app = FastAPI(
    title="ExportEase AI Intelligence Engine",
    description=(
        "**SYSTEM 1 — EXPORT-EASE-AI-ENGINE-V1**\n\n"
        "Multi-agent AI service for Indian MSME export assistance.\n\n"
        "**Canonical demo**: POST `/api/v1/ai/analyze` with:\n"
        "```json\n"
        '{"query": "I want to export turmeric powder to Germany.", '
        '"request_id": "...", "api_version": "v1"}\n'
        "```"
    ),
    version=VERSION.system_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# -----------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------
# Routers
# -----------------------------------------------------------------------

from ai_engine.api.health import router as health_router
from ai_engine.api.v1.version import router as version_router
from ai_engine.api.v1.analyze import router as analyze_router
from ai_engine.api.v1.classify import router as classify_router
from ai_engine.api.v1.compliance import router as compliance_router
from ai_engine.api.v1.documents import router as documents_router
from ai_engine.api.v1.certifications import router as certifications_router
from ai_engine.api.v1.market import router as market_router
from ai_engine.api.v1.risk import router as risk_router
from ai_engine.api.v1.export_plan import router as export_plan_router
from ai_engine.api.v1.model import router as model_router
from ai_engine.api.v1.tokenizer import router as tokenizer_router
from ai_engine.api.v1.evaluation import router as evaluation_router

app.include_router(health_router)
app.include_router(version_router)
app.include_router(analyze_router)
app.include_router(classify_router)
app.include_router(compliance_router)
app.include_router(documents_router)
app.include_router(certifications_router)
app.include_router(market_router)
app.include_router(risk_router)
app.include_router(export_plan_router)
app.include_router(model_router)
app.include_router(tokenizer_router)
app.include_router(evaluation_router)


# -----------------------------------------------------------------------
# Dev entrypoint
# -----------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(
        "ai_engine.main:app",
        host=settings.ai_service_host,
        port=settings.ai_service_port,
        reload=True,
        log_level=settings.log_level.lower(),
    )
