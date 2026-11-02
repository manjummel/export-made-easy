# System 2: EXPORT-EASE-KNOWLEDGE-V1

> **ExportEase AI Platform — Dataset + RAG Module**
> Independently deployable knowledge service providing semantic search and retrieval-augmented generation over export compliance data.

---

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│              ExportEase AI Platform                       │
│                                                           │
│  System 1 ──► POST /v1/knowledge/query ──►  System 2     │
│  (LLM+Agents)  POST /v1/knowledge/search    (THIS)        │
│                POST /v1/documents/ingest                  │
│  System 3 ──►  GET  /health                 ┌──────────┐  │
│  (Backend)     GET  /ready                  │  Qdrant  │  │
│                GET  /version                │ (intern) │  │
│                                             └──────────┘  │
└───────────────────────────────────────────────────────────┘
```

> ⚠️ **System 1 and System 3 MUST NOT have direct access to Qdrant.**
> All knowledge access is routed exclusively through System 2's API.

---

## Quick Start

### 1. Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)

### 2. Configure Environment

```bash
cd system2
cp .env.example .env
# Edit .env — at minimum set API_KEY_SECRET
```

### 3. Start with Docker Compose

```bash
docker-compose up --build
```

Services:
| Service | URL | Notes |
|---|---|---|
| System 2 API | http://localhost:8100 | Publicly accessible |
| Swagger UI | http://localhost:8100/docs | Interactive API docs |
| Qdrant UI | http://localhost:6333/dashboard | Dev only — localhost-bound |

### 4. Verify Health

```bash
curl http://localhost:8100/health
curl http://localhost:8100/ready
curl http://localhost:8100/version
```

### 5. Seed Sample Data

```bash
python scripts/ingest_sample_data.py --api-key changeme-replace-in-production
```

### 6. Test a Query

```bash
curl -X POST http://localhost:8100/v1/knowledge/query \
  -H "X-API-Key: changeme-replace-in-production" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the HS codes for automotive parts exported to Germany?"}'
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `KNOWLEDGE_SERVICE_PORT` | `8100` | Port System 2 listens on |
| `EXPORTEASE_CONTRACTS_PATH` | `/app/contracts` | Local path to OpenAPI contract |
| `EXPORTEASE_CONTRACTS_GIT_URL` | *(empty)* | Git URL for contract fallback |
| `QDRANT_HOST` | `localhost` | Qdrant hostname (internal) |
| `QDRANT_PORT` | `6333` | Qdrant port (internal) |
| `EMBEDDING_PROVIDER` | `sentence_transformers` | `sentence_transformers` or `openai` |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Model name |
| `RETRIEVAL_MODE` | `hybrid` | `dense`, `sparse`, or `hybrid` |
| `API_KEY_SECRET` | `changeme-...` | API key for inter-system auth |
| `SYSTEM1_BASE_URL` | `http://system1:8000` | System 1 health check URL |
| `SYSTEM3_BASE_URL` | `http://system3:8200` | System 3 health check URL |
| `SYSTEM1_REQUIRED` | `false` | Block /ready if System 1 is down |
| `SYSTEM3_REQUIRED` | `false` | Block /ready if System 3 is down |

---

## API Endpoints

### Health (No auth required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/ready` | Readiness probe (blocks on Qdrant) |
| `GET` | `/version` | API version and contract hash |

### Knowledge (Requires `X-API-Key` header)

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/knowledge/query` | Full RAG query with grounded answer |
| `POST` | `/v1/knowledge/search` | Pure vector similarity search |

### Documents (Requires `X-API-Key` header)

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/documents/ingest` | Ingest a single document |
| `POST` | `/v1/documents/batch` | Batch ingest up to 100 documents |
| `DELETE` | `/v1/documents/{id}` | Delete document and all chunks |

### Collections (Requires `X-API-Key` header)

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/collections` | List all Qdrant collections |
| `POST` | `/v1/collections` | Create a collection |
| `DELETE` | `/v1/collections/{name}` | Delete a collection |
| `GET` | `/v1/collections/{name}/stats` | Collection statistics |

---

## Project Structure

```
system2/
├── app/
│   ├── main.py              ← FastAPI entrypoint
│   ├── config.py            ← Pydantic settings
│   ├── api/                 ← Route handlers
│   ├── core/                ← Embeddings, chunker, retriever, RAG pipeline
│   ├── models/              ← Pydantic request/response models
│   └── middleware/          ← Auth & logging
├── rag/
│   └── integration/
│       ├── contract_loader.py   ← Loads & validates OpenAPI contract
│       ├── service_registry.py  ← Service discovery
│       └── connectivity.py      ← Async health checks
├── contracts/
│   └── knowledge_api_v1.yaml    ← OpenAPI 3.1 (source of truth)
├── data/sample/             ← Sample HS codes, agreements, regulations
├── tests/
│   ├── contract/            ← Schema-validated endpoint tests
│   ├── unit/                ← Chunker & embedding unit tests
│   └── integration/         ← Qdrant & connectivity tests
├── scripts/                 ← CLI tools
├── docker/                  ← Qdrant config
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

---

## Running Tests

```bash
# Contract tests (no Qdrant needed)
pytest tests/contract/ -v -m contract

# Unit tests (no external services)
pytest tests/unit/ -v -m unit

# Integration tests (requires: docker-compose up qdrant)
pytest tests/integration/ -v -m integration

# All tests
pytest -v
```

---

## Contract Validation

The API contract at `contracts/knowledge_api_v1.yaml` is the **single source of truth**.
System 1 must implement its client against this contract.

```bash
# Validate the contract locally
python scripts/validate_contracts.py

# Check all service connectivity
python scripts/check_connectivity.py
```

---

## Security

- Qdrant is **never accessible** to System 1 or System 3 directly
- Qdrant port is bound to `127.0.0.1` in development (not `0.0.0.0`)
- In production: remove Qdrant port binding entirely
- All knowledge/document/collection endpoints require `X-API-Key`
- Container runs as non-root user `appuser`

---

## System Connectivity

System 2 performs connectivity checks on startup and every 30 seconds:

| Service | Required for /ready | Direction |
|---|---|---|
| Qdrant | ✅ Yes | Internal dependency |
| System 1 | ❌ No (informational) | Consumer of System 2 |
| System 3 | ❌ No (informational) | Consumer of System 2 |

System 2 **starts and serves requests** even when System 1/3 are unreachable.
The `/ready` endpoint only returns 503 when **Qdrant** is down.
