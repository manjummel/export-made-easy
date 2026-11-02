# ExportEase AI — TESTING_STRATEGY.md
# EXPORT-EASE-BACKEND-V1

# Testing Strategy

## Test Environment
- **Database**: SQLite in-memory (`sqlite+aiosqlite:///:memory:`) — created fresh for every test, destroyed after.
- **Services**: `MOCK_SERVICES=true` activates mock AI and Knowledge clients.
- **Framework**: `pytest` + `pytest-asyncio` + `httpx.AsyncClient` (ASGI transport).
- **WebSocket**: `fastapi.testclient.TestClient` for synchronous WS tests.

## Test Categories

### 1. Unit Tests (`tests/test_comprehensive.py`, `tests/test_export_plan_validation.py`)
- Exception class status codes (`AuthenticationError`, `LowConfidenceError`, etc.)
- Pydantic schema validators — `PlanStep` blocks empty evidence + missing citations.

### 2. Integration Tests
- Auth register → login → token → protected route (full JWT lifecycle).
- Wrong password rejection.
- Unauthenticated route rejection.

### 3. API Tests
Each engine endpoint is tested for:
- ✅ Successful 200 response with correct schema fields
- ✅ 422 on missing required fields (product, hs_code, destination)
- ✅ 404 on unknown/non-existent project
- ✅ 401/403 on unauthenticated request

### 4. Database Tests
- Risk analysis persists and is retrievable via `GET /projects/{id}/risk`.
- Market analysis creates a record and count increases.
- Export plan overwrites on re-generation (single master plan per project).

### 5. Auth Tests (`tests/test_auth.py`)
- Registration, login, token refresh.
- Token expiry edge cases.
- Duplicate email rejection.

### 6. Workflow Tests
- Full sequential pipeline: Risk → Market → Export Plan.
- Context from prior steps is accepted as input to the plan generator.

### 7. WebSocket Tests
- Lifecycle: `agent_started` → `source_found` → `agent_partial_output` → `final_answer` → `agent_completed`.
- Ping/pong keep-alive.
- Invalid JSON payload returns `error` event, not server crash.

### 8. AI Integration Tests (`tests/test_ai_orchestration.py`)
- `POST /api/analyze` runs the full pipeline and returns an event log.
- Event types in the log include all lifecycle stages.

### 9. Failure Tests (`tests/test_failures.py`, `tests/test_risk_engine.py`)
| Scenario | Expected Outcome |
|---|---|
| Missing `product` | 422 VALIDATION_ERROR |
| Missing `destination` | 422 VALIDATION_ERROR |
| Missing `hs_code` | 422 VALIDATION_ERROR |
| Unknown destination ("UNKNOWN_DATA") | 400 INSUFFICIENT_DATA |
| Conflicting compliance results | RED risk, low confidence |
| Unauthorized project access | 404 (no enumeration) |
| Unauthenticated request | 401 / 403 |

## Running Tests

```bash
# All tests
pytest

# Specific category
pytest tests/test_comprehensive.py -v
pytest tests/test_certification_engine.py -v
pytest tests/test_risk_engine.py -v
pytest tests/test_export_plan_engine.py -v
pytest tests/test_market_analysis.py -v
pytest tests/test_ai_orchestration.py -v
pytest tests/test_failures.py -v
```

## Coverage Goal
- Target **≥ 80% line coverage** across `app/services/`, `app/api/`, and `app/integrations/`.
- Run `pytest --cov=app --cov-report=html` to generate an HTML coverage report.
