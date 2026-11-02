# ExportEase AI Intelligence Engine

**SYSTEM 1 — EXPORT-EASE-AI-ENGINE-V1**

Independent AI intelligence service for Indian MSME export assistance.
Built on Qwen2.5-1.5B-Instruct with QLoRA fine-tuning and LangGraph multi-agent orchestration.

---

## Architecture

```
Frontend (System 4)
    └── Backend (System 3)  ←──→  AI Engine (System 1, port 8001)
                                        └── Knowledge/RAG (System 2, port 8002)
```

This repository is **SYSTEM 1 only**. It communicates with other systems exclusively via HTTP APIs.

---

## Agents

| # | Agent | Purpose |
|---|-------|---------|
| 1 | Product Agent | Identifies and validates product details |
| 2 | HS Classification Agent | Classifies product under HS code taxonomy |
| 3 | Compliance Agent | Checks export regulations (DGFT, target country) |
| 4 | Document Agent | Lists required export documents |
| 5 | Certification Agent | Identifies required certifications |
| 6 | Market Agent | Provides target market intelligence |
| 7 | Risk Agent | Assesses export risk factors |
| 8 | Export Planner Agent | Generates comprehensive export plan |

Flow: `product → HS → compliance → document → certification → market → risk → planner`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/ready` | Readiness check (model + connectivity) |
| GET | `/version` | System version info |
| GET | `/api/v1/version` | Detailed model/agent version metadata |
| POST | `/api/v1/ai/analyze` | Full 8-agent export analysis |
| POST | `/api/v1/ai/classify` | HS code classification only |
| POST | `/api/v1/ai/compliance` | Compliance check only |
| POST | `/api/v1/ai/documents` | Document requirements only |
| POST | `/api/v1/ai/certifications` | Certification requirements only |
| POST | `/api/v1/ai/market` | Market intelligence only |
| POST | `/api/v1/ai/risk` | Risk assessment only |
| POST | `/api/v1/ai/export-plan` | Export plan generation only |

---

## Quick Start

### 1. Prerequisites

- Python 3.10+
- (Optional) CUDA-capable GPU for real LLM inference
- (Optional) System 2 running at `localhost:8002`
- (Optional) System 3 running at `localhost:8000`

### 2. Setup

```bash
# Clone and navigate
cd exportease

# Create virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env as needed (CPU_ONLY_MODE=true for dev without GPU)
```

### 3. Run

```bash
uvicorn ai_engine.main:app --host 0.0.0.0 --port 8001 --reload
```

### 4. Test

```bash
# Run all tests (uses mock LLM and mock services)
pytest ai_engine/tests/ -v

# Run end-to-end demo (turmeric → Germany)
pytest ai_engine/tests/test_e2e.py -v

# Health check
curl http://localhost:8001/health

# Full export analysis
curl -X POST http://localhost:8001/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "test-001",
    "user_id": "user-123",
    "project_id": "proj-001",
    "language": "en",
    "api_version": "v1",
    "query": "I want to export turmeric powder to Germany.",
    "product": "turmeric powder",
    "target_country": "Germany"
  }'
```

---

## Docker

```bash
# Build (CPU)
docker build -t exportease-ai-engine:latest .

# Build (GPU — Linux only)
docker build --build-arg BASE_IMAGE=nvidia/cuda:12.1-cudnn8-runtime-ubuntu22.04 \
  -t exportease-ai-engine:gpu .

# Run
docker run -p 8001:8001 \
  -e CPU_ONLY_MODE=true \
  -e MOCK_SERVICES=true \
  exportease-ai-engine:latest
```

---

## Environment Variables

See [.env.example](.env.example) for full list with descriptions.

Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_SERVICE_PORT` | `8001` | Port to listen on |
| `KNOWLEDGE_SERVICE_URL` | `http://localhost:8002` | System 2 URL |
| `BACKEND_SERVICE_URL` | `http://localhost:8000` | System 3 URL |
| `REAL_SERVICES` | `false` | Use real System 2/3 |
| `MOCK_SERVICES` | `true` | Use mock clients |
| `CPU_ONLY_MODE` | `true` | Skip GPU LLM loading |
| `MODEL_NAME` | `Qwen/Qwen2.5-1.5B-Instruct` | HuggingFace model ID |
| `ADAPTER_PATH` | `` | Path to QLoRA adapter |

---

## Grounding & Safety

**CRITICAL RULE**: This system never invents regulatory information.

- If the Knowledge service returns `INSUFFICIENT_GROUNDING` → response status is `INSUFFICIENT_GROUNDING`
- If confidence < threshold → response status is `LOW_CONFIDENCE` or `REVIEW_REQUIRED`
- Never fabricate: DGFT regulations, HS codes, certification requirements, government procedures, source URLs

---

## Versioning

All components are versioned independently:

| Component | Current Version |
|-----------|----------------|
| API | v1 |
| Model | qwen2.5-1.5b-instruct |
| QLoRA Adapter | none (pre-training) |
| Tokenizer | qwen2.5-base |
| Prompts | v1 |
| Agent Schema | v1 |
| Contracts | v1.0.0 |

---

## Integration Testing

Real connectivity is tested only when services are available:

```bash
# With real services running:
REAL_SERVICES=true pytest ai_engine/tests/test_clients.py -v -k "real"
```

External dependencies not yet tested:
- System 2 (Knowledge/RAG) — mock used in dev
- System 3 (Backend) — mock used in dev
- Qwen2.5-1.5B-Instruct model weights — mock LLM used without GPU

---

## Project Structure

```
exportease/                  ← Project root
├── contracts/               ← Shared cross-system schemas (authoritative)
│   └── v1/
├── ai_engine/               ← SYSTEM 1 source
│   ├── main.py
│   ├── config.py
│   ├── version.py
│   ├── contracts/           ← Contract loader/validator
│   ├── schemas/             ← Pydantic models
│   ├── clients/             ← Real + Mock external clients
│   ├── model/               ← LLM loader, inference, tokenizer
│   ├── prompts/             ← Versioned prompt templates
│   ├── safety/              ← Grounding + confidence
│   ├── agents/              ← LangGraph agents
│   ├── api/                 ← FastAPI routers
│   └── tests/
├── Dockerfile
├── requirements.txt
├── .env.example
└── pyproject.toml
```
