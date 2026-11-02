"""
ai_engine/tests/test_schemas.py

Pydantic schema unit tests.
Tests instantiation, field validation, enums, and factory methods.
"""

from __future__ import annotations

import pytest
from uuid import uuid4
from datetime import datetime, timezone

from ai_engine.schemas.common import (
    RequestEnvelope,
    ResponseEnvelope,
    ResponseStatus,
    ConfidenceState,
    VerificationStatus,
    Language,
)
from ai_engine.schemas.agent_trace import AgentEvent, EventType, AgentName, AgentStatus
from ai_engine.schemas.knowledge import KnowledgeResult, KnowledgeRequest, KnowledgeFilters


# -----------------------------------------------------------------------
# RequestEnvelope
# -----------------------------------------------------------------------

def test_request_envelope_defaults():
    env = RequestEnvelope(api_version="v1")
    assert env.api_version == "v1"
    assert env.language == Language.ENGLISH
    assert env.request_id  # auto-generated UUID


def test_request_envelope_with_all_fields():
    rid = str(uuid4())
    env = RequestEnvelope(
        request_id=rid,
        user_id="user-1",
        project_id="proj-1",
        language=Language.HINDI,
        api_version="v1",
    )
    assert env.request_id == rid
    assert env.language == Language.HINDI


def test_request_envelope_extra_fields_allowed():
    """Domain endpoints extend the envelope — extra fields must be allowed."""
    env = RequestEnvelope(api_version="v1", query="export turmeric", target_country="Germany")
    assert env.api_version == "v1"


# -----------------------------------------------------------------------
# ResponseEnvelope
# -----------------------------------------------------------------------

def test_response_envelope_success_factory():
    rid = str(uuid4())
    resp = ResponseEnvelope.success(
        request_id=rid,
        data={"result": "ok"},
        confidence=0.9,
        sources=["chunk-1"],
    )
    assert resp.status == ResponseStatus.SUCCESS
    assert resp.confidence == 0.9
    assert resp.request_id == rid


def test_response_envelope_insufficient_grounding_factory():
    rid = str(uuid4())
    resp = ResponseEnvelope.insufficient_grounding(rid, "No verified evidence.")
    assert resp.status == ResponseStatus.INSUFFICIENT_GROUNDING
    assert resp.confidence == 0.0
    assert "No verified evidence." in resp.errors


def test_response_envelope_error_factory():
    rid = str(uuid4())
    resp = ResponseEnvelope.error(rid, "Something went wrong.")
    assert resp.status == ResponseStatus.ERROR
    assert resp.data == {}


def test_confidence_clamped():
    from pydantic import ValidationError
    rid = str(uuid4())
    with pytest.raises(ValidationError):
        ResponseEnvelope(request_id=rid, status=ResponseStatus.SUCCESS, confidence=1.5)
    with pytest.raises(ValidationError):
        ResponseEnvelope(request_id=rid, status=ResponseStatus.SUCCESS, confidence=-0.5)


# -----------------------------------------------------------------------
# AgentEvent
# -----------------------------------------------------------------------

def test_agent_event_started_factory():
    rid, run_id = str(uuid4()), str(uuid4())
    event = AgentEvent.started(request_id=rid, agent_run_id=run_id, agent="product_agent")
    assert event.event_type == EventType.AGENT_STARTED
    assert event.status == AgentStatus.RUNNING
    assert event.request_id == rid
    assert event.agent_run_id == run_id


def test_agent_event_completed_factory():
    rid, run_id = str(uuid4()), str(uuid4())
    event = AgentEvent.completed(
        request_id=rid, agent_run_id=run_id, agent="hs_agent",
        confidence=0.97, sources=["chunk-1"],
    )
    assert event.event_type == EventType.AGENT_COMPLETED
    assert event.confidence == 0.97
    assert "chunk-1" in event.sources


def test_agent_event_failed_factory():
    rid, run_id = str(uuid4()), str(uuid4())
    event = AgentEvent.failed(rid, run_id, "compliance_agent", "Connection refused")
    assert event.event_type == EventType.AGENT_FAILED
    assert event.status == AgentStatus.FAILED


def test_all_event_types_instantiable():
    rid, run_id = str(uuid4()), str(uuid4())
    for et in EventType:
        event = AgentEvent(
            request_id=rid,
            agent_run_id=run_id,
            agent="orchestrator",
            event_type=et,
            status=AgentStatus.RUNNING,
        )
        assert event.event_type == et


# -----------------------------------------------------------------------
# KnowledgeResult
# -----------------------------------------------------------------------

def test_knowledge_result_verified():
    kr = KnowledgeResult(
        chunk_id="c1", document_id="d1", source_id="s1",
        text="Turmeric HS 0910.30",
        score=0.95,
        verification_status=VerificationStatus.VERIFIED,
    )
    assert kr.is_verified is True
    assert kr.to_citation_id().startswith("chunk:c1")


def test_knowledge_result_unverified():
    kr = KnowledgeResult(
        chunk_id="c2", document_id="d2", source_id="s2",
        text="Some unverified text",
        score=0.7,
        verification_status=VerificationStatus.UNVERIFIED,
    )
    assert kr.is_verified is False


def test_knowledge_result_score_bounds():
    with pytest.raises(Exception):
        KnowledgeResult(
            chunk_id="c3", document_id="d3", source_id="s3",
            text="text", score=1.5,  # invalid
            verification_status=VerificationStatus.VERIFIED,
        )
