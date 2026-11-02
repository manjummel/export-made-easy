import pytest
from httpx import AsyncClient

# ──────────────────────────────────────────────────────────────────────────────
# UNIT TESTS — Schemas & exception classes
# ──────────────────────────────────────────────────────────────────────────────
from app.core.exceptions import (
    AuthenticationError, AuthorizationError, ResourceNotFoundError,
    AIServiceError, RAGServiceError, RequestTimeoutError, LowConfidenceError,
    InsufficientEvidenceError, DatabaseError
)

def test_authentication_error_status():
    exc = AuthenticationError()
    assert exc.status_code == 401

def test_authorization_error_status():
    exc = AuthorizationError()
    assert exc.status_code == 403

def test_resource_not_found_status():
    exc = ResourceNotFoundError("Project")
    assert exc.status_code == 404
    assert "Project" in exc.detail

def test_ai_service_error_status():
    exc = AIServiceError()
    assert exc.status_code == 502

def test_rag_service_error_status():
    exc = RAGServiceError()
    assert exc.status_code == 503

def test_timeout_error_status():
    exc = RequestTimeoutError("LLM Agent")
    assert exc.status_code == 504
    assert "LLM Agent" in exc.detail

def test_low_confidence_error():
    exc = LowConfidenceError(confidence=0.2, threshold=0.5)
    assert exc.status_code == 422
    assert "0.20" in exc.detail

def test_insufficient_evidence_error():
    exc = InsufficientEvidenceError()
    assert exc.status_code == 422

def test_database_error_status():
    exc = DatabaseError()
    assert exc.status_code == 500


# ──────────────────────────────────────────────────────────────────────────────
# INTEGRATION TESTS — Auth flow
# ──────────────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_auth_register_and_login(async_client: AsyncClient):
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "e2e_all@exportease.ai", "password": "SecurePassword123", "full_name": "E2E Tester"}
    )
    assert reg.status_code in (200, 201)
    
    login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "e2e_all@exportease.ai", "password": "SecurePassword123"}
    )
    assert login.status_code == 200
    assert "access_token" in login.json()["data"]

@pytest.mark.asyncio
async def test_wrong_password_rejected(async_client: AsyncClient):
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "wrongpw@exportease.ai", "password": "SecurePassword123", "full_name": "WP Tester"}
    )
    login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "wrongpw@exportease.ai", "password": "WrongPassword000"}
    )
    assert login.status_code in (401, 400)

@pytest.mark.asyncio
async def test_protected_route_without_token(async_client: AsyncClient):
    res = await async_client.get("/api/v1/projects/")
    assert res.status_code in (401, 403)


# ──────────────────────────────────────────────────────────────────────────────
# DATABASE TESTS — Persistence round-trips
# ──────────────────────────────────────────────────────────────────────────────
@pytest.fixture
async def full_context(async_client: AsyncClient):
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "db_test@exportease.ai", "password": "SecurePassword123", "full_name": "DB Tester"}
    )
    login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "db_test@exportease.ai", "password": "SecurePassword123"}
    )
    headers = {"Authorization": f"Bearer {login.json()['data']['access_token']}"}
    msme = await async_client.post("/api/v1/msme-profiles/", headers=headers, json={"company_name": "DB Test Co"})
    proj = await async_client.post("/api/v1/projects/", headers=headers, json={
        "msme_id": msme.json()["data"]["id"],
        "project_name": "DB Test Project",
        "destination_country": "US"
    })
    return {"headers": headers, "project_id": proj.json()["data"]["id"]}

@pytest.mark.asyncio
async def test_risk_persists_to_db(async_client: AsyncClient, full_context: dict):
    h = full_context["headers"]
    pid = full_context["project_id"]
    await async_client.post("/api/v1/risk/analyze", headers=h, json={
        "project_id": pid, "product": "Turmeric", "hs_code": "0910.30", "destination": "Germany"
    })
    res = await async_client.get(f"/api/v1/projects/{pid}/risk", headers=h)
    assert res.status_code == 200
    assert res.json()["data"]["risk_level"] in ("GREEN", "AMBER", "RED")

@pytest.mark.asyncio
async def test_market_analysis_persists_to_db(async_client: AsyncClient, full_context: dict):
    h = full_context["headers"]
    pid = full_context["project_id"]
    await async_client.post("/api/v1/market/analyze", headers=h, json={
        "project_id": pid, "product": "Turmeric", "hs_code": "0910.30", "destination_country": "Germany"
    })
    res = await async_client.get(f"/api/v1/projects/{pid}/market-analysis", headers=h)
    assert res.status_code == 200
    assert res.json()["data"]["total"] >= 1

@pytest.mark.asyncio
async def test_export_plan_persists_to_db(async_client: AsyncClient, full_context: dict):
    h = full_context["headers"]
    pid = full_context["project_id"]
    await async_client.post("/api/v1/export-plan/generate", headers=h, json={"project_id": pid})
    res = await async_client.get(f"/api/v1/projects/{pid}/export-plan", headers=h)
    assert res.status_code == 200
    assert res.json()["data"]["project_id"] == pid


# ──────────────────────────────────────────────────────────────────────────────
# WORKFLOW TESTS — Full end-to-end sequential pipeline
# ──────────────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_full_export_workflow(async_client: AsyncClient, full_context: dict):
    """Orchestrates a realistic sequential export workflow."""
    h = full_context["headers"]
    pid = full_context["project_id"]

    # Step 1: Risk
    r1 = await async_client.post("/api/v1/risk/analyze", headers=h, json={
        "project_id": pid, "product": "Turmeric Powder", "hs_code": "0910.30", "destination": "Germany"
    })
    assert r1.status_code == 200

    # Step 2: Market
    r2 = await async_client.post("/api/v1/market/analyze", headers=h, json={
        "project_id": pid, "product": "Turmeric Powder", "hs_code": "0910.30", "destination_country": "Germany"
    })
    assert r2.status_code == 200

    # Step 3: Export Plan (consuming the derived context)
    r3 = await async_client.post("/api/v1/export-plan/generate", headers=h, json={
        "project_id": pid,
        "risk_analysis": r1.json()["data"],
        "market_analysis": r2.json()["data"]
    })
    assert r3.status_code == 200
    plan = r3.json()["data"]
    assert plan["phase_a_readiness"]
    assert plan["phase_h_execution_checklist"]


# ──────────────────────────────────────────────────────────────────────────────
# WEBSOCKET TESTS
# ──────────────────────────────────────────────────────────────────────────────
from fastapi.testclient import TestClient
from app.main import app

def test_ws_lifecycle_events():
    client = TestClient(app)
    with client.websocket_connect("/api/v1/chat") as ws:
        ws.send_json({
            "command": "start_analysis",
            "query": "I want to export turmeric powder to Germany.",
            "project_id": "ws-test-project"
        })
        events = []
        try:
            while True:
                msg = ws.receive_json()
                events.append(msg["event"])
                if msg["event"] == "agent_completed":
                    break
        except Exception:
            pass

        assert "agent_started" in events
        assert "source_found" in events
        assert "final_answer" in events

def test_ws_ping_pong():
    client = TestClient(app)
    with client.websocket_connect("/api/v1/chat") as ws:
        ws.send_json({"command": "ping"})
        msg = ws.receive_json()
        assert msg.get("event") == "pong"


# ──────────────────────────────────────────────────────────────────────────────
# AI INTEGRATION TESTS — POST /api/analyze batch runner
# ──────────────────────────────────────────────────────────────────────────────
@pytest.mark.asyncio
async def test_ai_batch_analysis(async_client: AsyncClient):
    res = await async_client.post("/api/v1/analyze", json={
        "query": "I want to export turmeric powder to Germany.",
        "project_id": "batch-test-project"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "events_log" in data
    assert len(data["events_log"]) >= 1

@pytest.mark.asyncio
async def test_ai_event_types_correct(async_client: AsyncClient):
    res = await async_client.post("/api/v1/analyze", json={
        "query": "I want to export turmeric powder to Germany.",
        "project_id": "batch-test-types"
    })
    assert res.status_code == 200
    event_types = {e["event"] for e in res.json()["events_log"]}
    assert "agent_started" in event_types
    assert "agent_completed" in event_types
