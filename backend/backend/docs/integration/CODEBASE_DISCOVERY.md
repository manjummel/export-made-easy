# Codebase Discovery

This document maps out the components and systems within the ExportEase AI project.

## System Topology and Boundaries

### 1. System 1: AI Engine (Set 1)
* **Location**: `exportease/exportease`
* **Purpose**: Independent AI intelligence service using a fine-tuned Qwen2.5 model and LangGraph multi-agent orchestration.
* **Entrypoint**: `ai_engine.main:app` (typically run on port `8001`).
* **Key Dependencies**: `fastapi`, `langgraph`, `torch`, `transformers`, `peft`, `trl`, `bitsandbytes`, `sentence-transformers`.
* **Status**: Partially implemented. Contains structured agent files and a mock model runner, plus a real model loading path. Uses a simulated streaming/processing implementation for multi-agent routing.

### 2. System 2: Knowledge / RAG (Set 2)
* **Location**: `ExportEase Dataset/ExportEase Dataset/system2`
* **Purpose**: Knowledge retrieval service exposing vector similarity search (Qdrant) and hybrid retrieval via FastAPI.
* **Entrypoint**: `app.main:app` (typically run on port `8100` but referenced in System 3 as `8002`).
* **Key Dependencies**: `fastapi`, `qdrant-client`, `sentence-transformers`, `rank_bm25`, `langchain-text-splitters`, `tiktoken`.
* **Status**: Implemented and operational. Contains sample datasets, Qdrant ingestion scripts, and validation schemas.

### 3. System 3: Backend (Set 3)
* **Location**: `Exportease AI/Exportease AI`
* **Purpose**: Central business logic, user auth, database persistence, and workflow orchestration.
* **Entrypoint**: `app.main:app` (typically run on port `8000`).
* **Key Dependencies**: `fastapi`, `sqlalchemy`, `asyncpg`, `alembic`, `psycopg2-binary`.
* **Status**: Implemented. Integrates database models and a 10-stage export workflow. Currently supports mock service clients.

---

## Component Inventory

| File/Path | Module | System | Purpose | Status |
|---|---|---|---|---|
| `exportease/exportease/ai_engine/main.py` | `ai_engine` | System 1 | FastAPI entrypoint | Operational |
| `exportease/exportease/ai_engine/agents/` | `ai_engine.agents` | System 1 | Seven-agent plus orchestrator graph definitions | Mocked responses / partially simulated |
| `ExportEase Dataset/ExportEase Dataset/system2/app/main.py` | `system2` | System 2 | FastAPI entrypoint | Operational |
| `ExportEase Dataset/ExportEase Dataset/system2/contracts/` | `system2` | System 2 | OpenAPI 3.1 contract (`knowledge_api_v1.yaml`) | Authority of truth |
| `Exportease AI/Exportease AI/app/main.py` | `app` | System 3 | Central backend API entrypoint | Operational |
| `Exportease AI/Exportease AI/app/clients/` | `app.clients` | System 3 | HTTP Clients for System 1 & 2 | Mismatched URLs/Paths |
