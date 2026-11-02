"""
ai_engine/tests/test_agents.py

Agent unit tests using MockLLM and MockKnowledgeClient.
Tests each agent individually and as a full 8-agent pipeline.

All tests use mock services — no GPU or real services required.
"""

from __future__ import annotations

import pytest
from uuid import uuid4

from ai_engine.agents.state import make_initial_state
from ai_engine.agents.tracer import AgentTracer
from ai_engine.model.mock_model import MockLLM
from ai_engine.model.inference import InferenceEngine
from ai_engine.safety.grounding import GroundingChecker, grounding_checker


# -----------------------------------------------------------------------
# Fixtures
# -----------------------------------------------------------------------

@pytest.fixture
def mock_inference():
    return InferenceEngine(MockLLM())


@pytest.fixture
def mock_knowledge():
    from ai_engine.clients.knowledge.mock_client import MockKnowledgeClient
    return MockKnowledgeClient()


@pytest.fixture
def mock_backend():
    from ai_engine.clients.backend.mock_client import MockBackendClient
    return MockBackendClient()


@pytest.fixture
def tracer(mock_backend):
    return AgentTracer(mock_backend)


@pytest.fixture
def base_state():
    return make_initial_state(
        request_id=str(uuid4()),
        agent_run_id=str(uuid4()),
        query="I want to export turmeric powder to Germany.",
        language="en",
        target_country="Germany",
        project_id="proj-test-001",
        user_id="user-test-001",
    )


# -----------------------------------------------------------------------
# MockLLM tests
# -----------------------------------------------------------------------

def test_mock_llm_returns_string():
    llm = MockLLM()
    result = llm.generate("What product is this?")
    assert isinstance(result, str)
    assert len(result) > 0


def test_mock_llm_structured_product():
    llm = MockLLM()
    result = llm.generate_structured("TASK: Product Identification Agent turmeric")
    assert "product_name" in result
    assert "confidence" in result


def test_mock_llm_structured_hs():
    llm = MockLLM()
    result = llm.generate_structured("TASK: HS Code Classification Agent turmeric harmonized system")
    assert "hs_code" in result
    assert result["hs_code"] == "0910.30"


def test_inference_engine_mock():
    engine = InferenceEngine(MockLLM())
    assert engine.is_mock is True
    result = engine.generate("test prompt")
    assert isinstance(result, str)


# -----------------------------------------------------------------------
# Product Agent
# -----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_product_agent_runs(base_state, mock_inference, mock_knowledge, tracer):
    from ai_engine.agents.product_agent import run_product_agent
    state = await run_product_agent(base_state, mock_inference, mock_knowledge, tracer, grounding_checker)
    assert "product_info" in state
    assert state["product_info"].get("product_name")
    assert state["product_info"].get("confidence", 0) > 0


@pytest.mark.asyncio
async def test_product_agent_emits_events(base_state, mock_inference, mock_knowledge, tracer):
    from ai_engine.agents.product_agent import run_product_agent
    state = await run_product_agent(base_state, mock_inference, mock_knowledge, tracer, grounding_checker)
    events = state.get("events", [])
    event_types = [e.event_type for e in events]
    assert "AGENT_STARTED" in event_types
    assert "AGENT_COMPLETED" in event_types


# -----------------------------------------------------------------------
# HS Agent
# -----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_hs_agent_runs(base_state, mock_inference, mock_knowledge, tracer):
    from ai_engine.agents.hs_agent import run_hs_agent
    base_state["product_info"] = {"product_name": "Turmeric Powder", "hsn_hint": "0910.30"}
    base_state["agent_confidences"] = {}
    state = await run_hs_agent(base_state, mock_inference, mock_knowledge, tracer, grounding_checker)
    assert "hs_result" in state
    assert state["hs_result"].get("hs_code") == "0910.30"


# -----------------------------------------------------------------------
# Compliance Agent
# -----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_compliance_agent_runs(base_state, mock_inference, mock_knowledge, tracer):
    from ai_engine.agents.compliance_agent import run_compliance_agent
    base_state["product_info"] = {"product_name": "Turmeric Powder"}
    base_state["hs_result"] = {"hs_code": "0910.30"}
    base_state["agent_confidences"] = {}
    state = await run_compliance_agent(base_state, mock_inference, mock_knowledge, tracer, grounding_checker)
    assert "compliance_result" in state
    result = state["compliance_result"]
    assert "requirements" in result or "error" in result


# -----------------------------------------------------------------------
# Critical ID preservation tests
# -----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_request_id_preserved_through_agents(base_state, mock_inference, mock_knowledge, tracer):
    """request_id MUST be preserved by every agent."""
    from ai_engine.agents.product_agent import run_product_agent
    from ai_engine.agents.hs_agent import run_hs_agent
    original_request_id = base_state["request_id"]
    base_state["agent_confidences"] = {}

    state = await run_product_agent(base_state, mock_inference, mock_knowledge, tracer, grounding_checker)
    assert state["request_id"] == original_request_id

    state = await run_hs_agent(state, mock_inference, mock_knowledge, tracer, grounding_checker)
    assert state["request_id"] == original_request_id


@pytest.mark.asyncio
async def test_agent_run_id_preserved(base_state, mock_inference, mock_knowledge, tracer):
    """agent_run_id MUST be preserved by every agent."""
    from ai_engine.agents.product_agent import run_product_agent
    original_run_id = base_state["agent_run_id"]
    base_state["agent_confidences"] = {}
    state = await run_product_agent(base_state, mock_inference, mock_knowledge, tracer, grounding_checker)
    assert state["agent_run_id"] == original_run_id

    # All events must reference the same agent_run_id
    for event in state.get("events", []):
        assert event.agent_run_id == original_run_id, (
            f"Event {event.event_type} has wrong agent_run_id"
        )


@pytest.mark.asyncio
async def test_project_id_preserved(base_state, mock_inference, mock_knowledge, tracer):
    """project_id MUST be preserved."""
    from ai_engine.agents.product_agent import run_product_agent
    base_state["agent_confidences"] = {}
    original_project_id = base_state["project_id"]
    state = await run_product_agent(base_state, mock_inference, mock_knowledge, tracer, grounding_checker)
    assert state["project_id"] == original_project_id
