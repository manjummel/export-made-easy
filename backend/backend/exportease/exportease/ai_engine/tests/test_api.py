"""
ai_engine/tests/test_api.py

FastAPI endpoint tests using httpx TestClient.
Tests all 8 endpoints + health/ready/version.
Uses mock services — no real LLM or external services required.
"""

from __future__ import annotations

import pytest
from uuid import uuid4
from fastapi.testclient import TestClient


# -----------------------------------------------------------------------
# App fixture: override state with mocks
# -----------------------------------------------------------------------

@pytest.fixture(scope="module")
def client():
    """
    Create a test client with mock services pre-loaded.
    Bypasses the lifespan startup to inject mocks directly.
    """
    from ai_engine.main import app
    from ai_engine.model.mock_model import MockLLM
    from ai_engine.model.inference import InferenceEngine
    from ai_engine.clients.knowledge.mock_client import MockKnowledgeClient
    from ai_engine.clients.backend.mock_client import MockBackendClient
    from ai_engine.agents.graph import ExportWorkflowOrchestrator
    from ai_engine.contracts.loader import load_contracts
    from pathlib import Path

    # Load contracts
    contracts_dir = Path(__file__).parent.parent.parent / "contracts"
    try:
        load_contracts(str(contracts_dir))
    except Exception:
        pass

    # Build mock components
    inference = InferenceEngine(MockLLM())
    knowledge = MockKnowledgeClient()
    backend = MockBackendClient()
    orchestrator = ExportWorkflowOrchestrator(inference, knowledge, backend)

    # Inject into app state
    app.state.inference = inference
    app.state.knowledge_client = knowledge
    app.state.backend_client = backend
    app.state.orchestrator = orchestrator

    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


# -----------------------------------------------------------------------
# Health endpoints
# -----------------------------------------------------------------------

def test_health_returns_200(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "timestamp" in data


def test_version_endpoint(client):
    resp = client.get("/version")
    assert resp.status_code == 200
    data = resp.json()
    assert "system_id" in data
    assert data["system_id"] == "EXPORT-EASE-AI-ENGINE-V1"


def test_api_version_endpoint(client):
    resp = client.get("/api/v1/version")
    assert resp.status_code == 200
    data = resp.json()
    assert "ai_service_version" in data
    assert "api_version" in data
    assert "model_version" in data
    assert "adapter_version" in data
    assert "tokenizer_version" in data
    assert "detailed_metadata" in data

def test_model_status_endpoint(client):
    resp = client.get("/api/v1/model/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "model_loaded" in data
    assert "model_version" in data
    assert "tokenizer_version" in data
    assert "adapter_loaded" in data
    assert "device" in data
    assert "health" in data

def test_tokenizer_status_endpoint(client):
    resp = client.get("/api/v1/tokenizer/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "tokenizer_version" in data
    assert "vocabulary_size" in data
    assert "languages" in data
    assert "coverage_report_version" in data

def test_ready_endpoint(client):
    resp = client.get("/ready")
    # Should be 200 because tokenizer_version matches model_family in VERSION
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("ready") is True

def test_evaluation_status_endpoint(client):
    resp = client.get("/api/v1/evaluation/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "model_version" in data
    assert "adapter_version" in data
    assert "dataset_version" in data
    assert "evaluation_version" in data
    assert "metrics_summary" in data
    assert "evaluation_status" in data


# -----------------------------------------------------------------------
# Analyze endpoint
# -----------------------------------------------------------------------

def test_analyze_turmeric_germany(client):
    """Canonical demo query."""
    resp = client.post("/api/v1/ai/analyze", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "query": "I want to export turmeric powder to Germany.",
        "target_country": "Germany",
        "language": "en",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["request_id"]
    assert data["status"] in ("SUCCESS", "PARTIAL_SUCCESS")
    assert "data" in data
    assert "confidence" in data
    assert "sources" in data


def test_analyze_preserves_request_id(client):
    rid = str(uuid4())
    resp = client.post("/api/v1/ai/analyze", json={
        "request_id": rid,
        "api_version": "v1",
        "query": "Export turmeric to Germany",
    })
    assert resp.status_code == 200
    assert resp.json()["request_id"] == rid


def test_analyze_preserves_project_id(client):
    rid = str(uuid4())
    pid = "proj-" + str(uuid4())
    resp = client.post("/api/v1/ai/analyze", json={
        "request_id": rid,
        "project_id": pid,
        "api_version": "v1",
        "query": "Export turmeric to Germany",
    })
    assert resp.status_code == 200
    assert resp.json()["project_id"] == pid


def test_analyze_has_agent_events(client):
    resp = client.post("/api/v1/ai/analyze", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "query": "I want to export turmeric powder to Germany.",
        "target_country": "Germany",
    })
    assert resp.status_code == 200
    data = resp.json()
    events = data["data"].get("agent_events", [])
    assert len(events) > 0
    for event in events:
        assert "agent_event_id" in event
        assert "request_id" in event
        assert "agent_run_id" in event
        assert "event_type" in event


def test_analyze_stream_endpoint(client):
    payload = {
        "request_id": "req-stream-123",
        "project_id": "proj-stream-123",
        "language": "en",
        "query": "I want to export turmeric powder to Germany."
    }
    resp = client.post("/api/v1/ai/analyze/stream", json=payload)
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "text/event-stream; charset=utf-8"
    
    # Read the streamed lines
    lines = [line for line in resp.iter_lines() if line]
    assert len(lines) > 0
    assert lines[0].startswith("data:")


def test_analyze_has_all_agent_outputs(client):
    resp = client.post("/api/v1/ai/analyze", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "query": "I want to export turmeric powder to Germany.",
        "target_country": "Germany",
    })
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "product" in data
    assert "hs_classification" in data
    assert "compliance" in data
    assert "documents" in data
    assert "certifications" in data
    assert "market" in data
    assert "risk" in data
    assert "export_plan" in data


# -----------------------------------------------------------------------
# Single-agent endpoints
# -----------------------------------------------------------------------

def test_classify_endpoint(client):
    resp = client.post("/api/v1/ai/classify", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "query": "turmeric powder",
        "product": "Turmeric Powder",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("SUCCESS", "PARTIAL_SUCCESS")
    assert "hs_classification" in data["data"]


def test_compliance_endpoint(client):
    resp = client.post("/api/v1/ai/compliance", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "query": "turmeric Germany compliance",
        "product": "Turmeric Powder",
        "hs_code": "0910.30",
        "target_country": "Germany",
    })
    assert resp.status_code == 200
    assert resp.json()["status"] in ("SUCCESS", "PARTIAL_SUCCESS", "INSUFFICIENT_GROUNDING")


def test_documents_endpoint(client):
    resp = client.post("/api/v1/ai/documents", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "target_country": "Germany",
        "product": "Turmeric Powder",
    })
    assert resp.status_code == 200
    assert "documents" in resp.json()["data"]


def test_certifications_endpoint(client):
    resp = client.post("/api/v1/ai/certifications", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "target_country": "Germany",
        "product": "Turmeric Powder",
    })
    assert resp.status_code == 200
    assert "certifications" in resp.json()["data"]


def test_market_endpoint(client):
    resp = client.post("/api/v1/ai/market", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "target_country": "Germany",
        "product": "Turmeric Powder",
    })
    assert resp.status_code == 200
    assert "market" in resp.json()["data"]


def test_risk_endpoint(client):
    resp = client.post("/api/v1/ai/risk", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "target_country": "Germany",
        "product": "Turmeric Powder",
    })
    assert resp.status_code == 200
    assert "risk" in resp.json()["data"]


def test_export_plan_endpoint(client):
    resp = client.post("/api/v1/ai/export-plan", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "target_country": "Germany",
        "product": "Turmeric Powder",
    })
    assert resp.status_code == 200
    assert "export_plan" in resp.json()["data"]


# -----------------------------------------------------------------------
# Response envelope structure
# -----------------------------------------------------------------------

def test_response_envelope_has_all_required_fields(client):
    resp = client.post("/api/v1/ai/classify", json={
        "request_id": str(uuid4()),
        "api_version": "v1",
        "query": "turmeric",
    })
    data = resp.json()
    required = ["request_id", "status", "data", "confidence", "sources", "warnings", "errors", "timestamp", "api_version"]
    for field in required:
        assert field in data, f"Missing required response field: {field}"
