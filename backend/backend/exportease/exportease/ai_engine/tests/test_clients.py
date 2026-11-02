"""
ai_engine/tests/test_clients.py

External client tests — mock clients.
Tests that mock clients:
1. Implement the full interface
2. Return schema-valid objects
3. Report as mock (is_mock() == True)
4. Report connectivity as True
"""

from __future__ import annotations

import pytest
from uuid import uuid4

from ai_engine.schemas.knowledge import KnowledgeResult, KnowledgeFilters
from ai_engine.schemas.common import VerificationStatus


# -----------------------------------------------------------------------
# MockKnowledgeClient
# -----------------------------------------------------------------------

@pytest.fixture
def mock_knowledge():
    from ai_engine.clients.knowledge.mock_client import MockKnowledgeClient
    return MockKnowledgeClient()


@pytest.mark.asyncio
async def test_mock_knowledge_is_mock(mock_knowledge):
    assert mock_knowledge.is_mock() is True


@pytest.mark.asyncio
async def test_mock_knowledge_connectivity(mock_knowledge):
    result = await mock_knowledge.check_connectivity()
    assert result is True


@pytest.mark.asyncio
async def test_mock_knowledge_retrieve_returns_results(mock_knowledge):
    results = await mock_knowledge.retrieve("turmeric export Germany", top_k=3)
    assert isinstance(results, list)
    assert len(results) == 3
    for r in results:
        assert isinstance(r, KnowledgeResult)
        assert r.chunk_id
        assert r.text
        assert 0.0 <= r.score <= 1.0


@pytest.mark.asyncio
async def test_mock_knowledge_retrieve_all_verified(mock_knowledge):
    results = await mock_knowledge.retrieve("turmeric", top_k=5)
    for r in results:
        assert r.verification_status == VerificationStatus.VERIFIED, (
            f"Mock chunk {r.chunk_id} is not VERIFIED"
        )


@pytest.mark.asyncio
async def test_mock_knowledge_retrieve_with_filters(mock_knowledge):
    filters = KnowledgeFilters(country="DE")
    results = await mock_knowledge.retrieve_with_filters("turmeric Germany", filters, top_k=5)
    assert isinstance(results, list)
    # All results should be for DE or have no country specified
    for r in results:
        assert r.country in ("DE", None), f"Unexpected country: {r.country}"


@pytest.mark.asyncio
async def test_mock_knowledge_get_evidence(mock_knowledge):
    results = await mock_knowledge.get_evidence("turmeric compliance EU")
    assert len(results) > 0
    for r in results:
        assert r.verification_status == VerificationStatus.VERIFIED


@pytest.mark.asyncio
async def test_mock_knowledge_get_citations(mock_knowledge):
    chunk_ids = ["chunk-turmeric-hs-001", "chunk-eu-spice-002"]
    citations = await mock_knowledge.get_citations(chunk_ids)
    assert isinstance(citations, list)
    assert len(citations) == 2
    for c in citations:
        assert "citation_id" in c
        assert "chunk_id" in c


@pytest.mark.asyncio
async def test_mock_knowledge_get_confidence(mock_knowledge):
    results = await mock_knowledge.retrieve("turmeric", top_k=3)
    confidence = await mock_knowledge.get_confidence("turmeric", results)
    assert 0.0 <= confidence <= 1.0


# -----------------------------------------------------------------------
# MockBackendClient
# -----------------------------------------------------------------------

@pytest.fixture
def mock_backend():
    from ai_engine.clients.backend.mock_client import MockBackendClient
    return MockBackendClient()


@pytest.mark.asyncio
async def test_mock_backend_is_mock(mock_backend):
    assert mock_backend.is_mock() is True


@pytest.mark.asyncio
async def test_mock_backend_connectivity(mock_backend):
    result = await mock_backend.check_connectivity()
    assert result is True


@pytest.mark.asyncio
async def test_mock_backend_push_event(mock_backend):
    from ai_engine.schemas.agent_trace import AgentEvent, EventType, AgentStatus
    rid, run_id = str(uuid4()), str(uuid4())
    event = AgentEvent(
        request_id=rid, agent_run_id=run_id,
        agent="product_agent", event_type=EventType.AGENT_STARTED,
        status=AgentStatus.RUNNING,
    )
    result = await mock_backend.push_agent_event(event)
    assert result is True


@pytest.mark.asyncio
async def test_mock_backend_records_events(mock_backend):
    from ai_engine.schemas.agent_trace import AgentEvent, EventType, AgentStatus
    rid, run_id = str(uuid4()), str(uuid4())
    mock_backend.clear_events()
    for i in range(3):
        event = AgentEvent(
            request_id=rid, agent_run_id=run_id,
            agent="hs_agent", event_type=EventType.AGENT_PROCESSING,
            status=AgentStatus.RUNNING,
        )
        await mock_backend.push_agent_event(event)
    recorded = mock_backend.get_recorded_events()
    assert len(recorded) == 3


@pytest.mark.asyncio
async def test_mock_backend_notify_complete(mock_backend):
    result = await mock_backend.notify_workflow_complete(
        agent_run_id=str(uuid4()),
        request_id=str(uuid4()),
        project_id="proj-1",
        result={"status": "SUCCESS"},
    )
    assert result is True


# -----------------------------------------------------------------------
# Safety + Grounding tests
# -----------------------------------------------------------------------

def test_grounding_checker_sufficient():
    from ai_engine.safety.grounding import GroundingChecker, GroundingState
    from ai_engine.schemas.knowledge import KnowledgeResult
    checker = GroundingChecker()
    results = [
        KnowledgeResult(
            chunk_id="c1", document_id="d1", source_id="s1",
            text="verified text", score=0.9,
            verification_status=VerificationStatus.VERIFIED,
        )
    ]
    result = checker.check(results, "test_agent")
    assert result.state == GroundingState.SUFFICIENT
    assert result.is_sufficient is True


def test_grounding_checker_no_results():
    from ai_engine.safety.grounding import GroundingChecker, GroundingState
    checker = GroundingChecker()
    result = checker.check([], "test_agent")
    assert result.state == GroundingState.INSUFFICIENT_GROUNDING
    assert result.is_sufficient is False


def test_confidence_evaluator_thresholds():
    from ai_engine.safety.confidence import ConfidenceEvaluator
    from ai_engine.schemas.common import ConfidenceState
    assert ConfidenceEvaluator.score_to_state(0.9) == ConfidenceState.HIGH
    assert ConfidenceEvaluator.score_to_state(0.7) == ConfidenceState.MEDIUM
    assert ConfidenceEvaluator.score_to_state(0.5) == ConfidenceState.LOW
    assert ConfidenceEvaluator.score_to_state(0.3) == ConfidenceState.INSUFFICIENT


def test_confidence_aggregate():
    from ai_engine.safety.confidence import ConfidenceEvaluator
    result = ConfidenceEvaluator.aggregate_confidence([0.9, 0.8, 0.7])
    assert 0.0 < result <= 1.0
    assert ConfidenceEvaluator.aggregate_confidence([]) == 0.0
