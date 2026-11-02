"""
ai_engine/tests/test_e2e.py

END-TO-END TEST: "I want to export turmeric powder to Germany."

This is the canonical system integration test.
Verifies the complete pipeline:
  Frontend → Backend → AI Engine → Knowledge/RAG → Agents → Backend → Frontend

Using mock services, validates:
  - request_id preserved end-to-end
  - project_id preserved end-to-end
  - agent_run_id preserved in all events
  - confidence is present and > 0
  - sources are present (Knowledge citations)
  - all 8 agents ran and produced output
  - all agent events emitted with correct structure
  - workflow result is complete

No GPU, no real services required.
"""

from __future__ import annotations

import pytest
from uuid import uuid4

from ai_engine.agents.state import make_initial_state
from ai_engine.agents.graph import ExportWorkflowOrchestrator
from ai_engine.model.mock_model import MockLLM
from ai_engine.model.inference import InferenceEngine
from ai_engine.clients.knowledge.mock_client import MockKnowledgeClient
from ai_engine.clients.backend.mock_client import MockBackendClient
from ai_engine.schemas.agent_trace import EventType


# -----------------------------------------------------------------------
# The canonical demo query
# -----------------------------------------------------------------------

CANONICAL_QUERY = "I want to export turmeric powder to Germany."
CANONICAL_PRODUCT = "Turmeric Powder"
CANONICAL_COUNTRY = "Germany"


@pytest.fixture(scope="module")
def orchestrator():
    inference = InferenceEngine(MockLLM())
    knowledge = MockKnowledgeClient()
    backend = MockBackendClient()
    return ExportWorkflowOrchestrator(inference, knowledge, backend)


@pytest.fixture(scope="module")
def e2e_request_ids():
    return {
        "request_id": str(uuid4()),
        "project_id": "proj-e2e-" + str(uuid4())[:8],
        "agent_run_id": str(uuid4()),
        "user_id": "user-e2e-test",
    }


@pytest.fixture(scope="module")
async def final_state(orchestrator, e2e_request_ids):
    """Run the full 8-agent workflow once and cache the result."""
    state = await orchestrator.run(
        request_id=e2e_request_ids["request_id"],
        agent_run_id=e2e_request_ids["agent_run_id"],
        query=CANONICAL_QUERY,
        target_country=CANONICAL_COUNTRY,
        language="en",
        project_id=e2e_request_ids["project_id"],
        user_id=e2e_request_ids["user_id"],
    )
    return state


# -----------------------------------------------------------------------
# Critical identifier preservation
# -----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_e2e_request_id_preserved(orchestrator, e2e_request_ids):
    state = await orchestrator.run(
        request_id=e2e_request_ids["request_id"],
        agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY,
        target_country=CANONICAL_COUNTRY,
        project_id=e2e_request_ids["project_id"],
    )
    assert state["request_id"] == e2e_request_ids["request_id"], "request_id was dropped!"


@pytest.mark.asyncio
async def test_e2e_project_id_preserved(orchestrator, e2e_request_ids):
    state = await orchestrator.run(
        request_id=str(uuid4()),
        agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY,
        target_country=CANONICAL_COUNTRY,
        project_id=e2e_request_ids["project_id"],
    )
    assert state["project_id"] == e2e_request_ids["project_id"], "project_id was dropped!"


@pytest.mark.asyncio
async def test_e2e_agent_run_id_preserved(orchestrator):
    run_id = str(uuid4())
    state = await orchestrator.run(
        request_id=str(uuid4()),
        agent_run_id=run_id,
        query=CANONICAL_QUERY,
        target_country=CANONICAL_COUNTRY,
    )
    assert state["agent_run_id"] == run_id, "agent_run_id was dropped!"
    for event in state.get("events", []):
        assert event.agent_run_id == run_id, (
            f"Event '{event.event_type}' from '{event.agent}' has wrong agent_run_id"
        )


# -----------------------------------------------------------------------
# All 8 agents ran
# -----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_e2e_all_8_agents_ran(orchestrator):
    state = await orchestrator.run(
        request_id=str(uuid4()), agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY, target_country=CANONICAL_COUNTRY,
    )
    assert state.get("product_info"), "product_agent did not produce output"
    assert state.get("hs_result"), "hs_agent did not produce output"
    assert state.get("compliance_result"), "compliance_agent did not produce output"
    assert state.get("document_result"), "document_agent did not produce output"
    assert state.get("certification_result"), "certification_agent did not produce output"
    assert state.get("market_result"), "market_agent did not produce output"
    assert state.get("risk_result"), "risk_agent did not produce output"
    assert state.get("export_plan"), "planner_agent did not produce output"


# -----------------------------------------------------------------------
# Confidence and sources
# -----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_e2e_confidence_present(orchestrator):
    state = await orchestrator.run(
        request_id=str(uuid4()), agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY, target_country=CANONICAL_COUNTRY,
    )
    confidence = state.get("overall_confidence", 0.0)
    assert isinstance(confidence, float), "overall_confidence must be float"
    assert confidence > 0.0, f"overall_confidence should be > 0.0, got {confidence}"
    assert confidence <= 1.0, f"overall_confidence must be ≤ 1.0, got {confidence}"


@pytest.mark.asyncio
async def test_e2e_sources_present(orchestrator):
    state = await orchestrator.run(
        request_id=str(uuid4()), agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY, target_country=CANONICAL_COUNTRY,
    )
    sources = state.get("all_sources", [])
    assert len(sources) > 0, "No sources/citations were collected"
    # All sources should be non-empty strings
    for s in sources:
        assert isinstance(s, str) and s, f"Invalid source ID: {s}"


# -----------------------------------------------------------------------
# Agent events
# -----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_e2e_agent_events_emitted(orchestrator):
    state = await orchestrator.run(
        request_id=str(uuid4()), agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY, target_country=CANONICAL_COUNTRY,
    )
    events = state.get("events", [])
    assert len(events) > 0, "No agent events were emitted"

    event_types_seen = {e.event_type for e in events}
    assert EventType.REQUEST_RECEIVED in event_types_seen
    assert EventType.AGENT_STARTED in event_types_seen
    assert EventType.AGENT_COMPLETED in event_types_seen
    assert EventType.FINAL_RESULT in event_types_seen


@pytest.mark.asyncio
async def test_e2e_events_have_required_fields(orchestrator):
    state = await orchestrator.run(
        request_id=str(uuid4()), agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY, target_country=CANONICAL_COUNTRY,
    )
    for event in state.get("events", []):
        assert event.agent_event_id, "event missing agent_event_id"
        assert event.request_id, "event missing request_id"
        assert event.agent_run_id, "event missing agent_run_id"
        assert event.agent, "event missing agent name"
        assert event.event_type, "event missing event_type"
        assert event.status, "event missing status"
        assert event.timestamp, "event missing timestamp"


# -----------------------------------------------------------------------
# Specific output validation for turmeric→Germany
# -----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_e2e_hs_code_is_turmeric(orchestrator):
    state = await orchestrator.run(
        request_id=str(uuid4()), agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY, target_country=CANONICAL_COUNTRY,
    )
    hs = state.get("hs_result", {})
    assert hs.get("hs_code") == "0910.30", (
        f"Expected HS code 0910.30 for turmeric, got {hs.get('hs_code')}"
    )


@pytest.mark.asyncio
async def test_e2e_export_plan_has_steps(orchestrator):
    state = await orchestrator.run(
        request_id=str(uuid4()), agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY, target_country=CANONICAL_COUNTRY,
    )
    plan = state.get("export_plan", {})
    steps = plan.get("steps", [])
    assert len(steps) > 0, "Export plan has no steps"
    # First step should have a step_number
    assert steps[0].get("step_number") == 1


@pytest.mark.asyncio
async def test_e2e_workflow_status_not_error(orchestrator):
    state = await orchestrator.run(
        request_id=str(uuid4()), agent_run_id=str(uuid4()),
        query=CANONICAL_QUERY, target_country=CANONICAL_COUNTRY,
    )
    status = state.get("workflow_status", "ERROR")
    assert status in ("SUCCESS", "PARTIAL_SUCCESS"), (
        f"Workflow ended with unexpected status: {status}"
    )


@pytest.mark.asyncio
async def test_e2e_via_api(orchestrator):
    """
    Simulate the full API flow: POST /api/v1/ai/analyze → check response envelope.
    """
    from fastapi.testclient import TestClient
    from ai_engine.main import app
    from ai_engine.contracts.loader import load_contracts
    from pathlib import Path

    try:
        load_contracts(str(Path(__file__).parent.parent.parent / "contracts"))
    except Exception:
        pass

    app.state.inference = orchestrator._inference
    app.state.knowledge_client = orchestrator._knowledge
    app.state.backend_client = MockBackendClient()
    app.state.orchestrator = orchestrator

    rid = str(uuid4())
    pid = "proj-api-e2e"

    with TestClient(app, raise_server_exceptions=True) as client:
        resp = client.post("/api/v1/ai/analyze", json={
            "request_id": rid,
            "project_id": pid,
            "api_version": "v1",
            "query": CANONICAL_QUERY,
            "target_country": CANONICAL_COUNTRY,
            "language": "en",
        })

    assert resp.status_code == 200
    body = resp.json()

    # Critical identifiers preserved
    assert body["request_id"] == rid
    assert body["project_id"] == pid

    # Confidence and sources
    assert isinstance(body["confidence"], float)
    assert body["confidence"] > 0.0
    assert len(body["sources"]) > 0

    # All agent outputs present
    data = body["data"]
    for key in ["product", "hs_classification", "compliance", "documents",
                "certifications", "market", "risk", "export_plan", "agent_events"]:
        assert key in data, f"Missing key in response data: {key}"

    # agent_run_id in response
    assert data["agent_run_id"]

    # All events have agent_run_id matching
    run_id = data["agent_run_id"]
    for event in data["agent_events"]:
        assert event["agent_run_id"] == run_id
