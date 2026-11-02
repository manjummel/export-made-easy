# ExportEase AI — SECURITY.md
# EXPORT-EASE-BACKEND-V1

# Security Architecture

## Authentication
- **JWT Bearer tokens** issued on `POST /api/v1/auth/login`.
- Tokens signed with `HS256` using a secret loaded from environment (`SECRET_KEY`).
- Access tokens expire after a configurable TTL (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- Passwords are hashed using **bcrypt** before storage; plaintext passwords are never persisted.

## Authorization
- Every protected endpoint depends on `get_current_active_user` (FastAPI dependency).
- Resources (projects, documents, certifications) are scoped to the **owner's `user_id`** — cross-user access returns 404, not 403, to prevent enumeration.
- Admin-only endpoints require an `is_admin` flag on the user record.

## CORS
- Configured in `main.py` via `CORSMiddleware`.
- `allow_origins` is driven by the `CORS_ORIGINS` environment variable.
- Wildcard origins are **disabled** in production (`ENVIRONMENT=production`).

## Input Validation
- All request bodies are validated by Pydantic v2 schemas before any handler logic runs.
- Custom `@validator` guards block unsupported factual claims from entering the export plan.
- HS codes, destination codes, and MSME IDs are length-bounded to prevent injection.

## Sensitive Data
- No PII is logged at INFO level; only `user_id` (opaque UUID) appears in logs.
- DB credentials, secret keys, and API keys are injected via environment variables exclusively.
- Audit logs are append-only; no audit record is deleted via the API.

## WebSocket Security
- WebSocket connections over `/api/v1/chat` currently accept connections without token validation (development mode).
- **In production**: validate `Authorization: Bearer <token>` query parameter or first-message authentication before processing any command.
- Client messages are parsed as JSON; malformed input returns an error event and does not raise server exceptions.

## Dependency Supply Chain
- `requirements.txt` / `pyproject.toml` pins all dependency versions.
- Run `pip-audit` or `safety check` in CI to catch known CVEs.

## Secrets Management
| Variable | Purpose |
|---|---|
| `SECRET_KEY` | JWT signing key |
| `DATABASE_URL` | Database connection string |
| `AI_SERVICE_URL` | SET 1 endpoint |
| `KNOWLEDGE_SERVICE_URL` | SET 2 RAG endpoint |

> **Never commit `.env` to version control.**
