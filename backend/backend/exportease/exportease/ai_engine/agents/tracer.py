"""
ai_engine/agents/tracer.py

AgentTracer — emits AgentEvent objects at each lifecycle point.
Events are:
  1. Appended to state["events"] for the API response
  2. Optionally pushed to System 3 (Backend) via BackendClient for WebSocket forwarding
"""

from __future__ import annotations

import logging
from typing import List, Optional

from ai_engine.schemas.agent_trace import AgentEvent, AgentStatus, EventType
from ai_engine.clients.backend.interface import BackendClientInterface

logger = logging.getLogger(__name__)


class AgentTracer:
    """
    Emits structured AgentEvent objects at key agent lifecycle points.

    Usage:
        tracer = AgentTracer(backend_client)
        event = tracer.emit_started(state, "product_agent")
        # ... do work ...
        event = tracer.emit_completed(state, "product_agent", confidence=0.9)
    """

    def __init__(self, backend_client: Optional[BackendClientInterface] = None):
        self._backend = backend_client

    def emit(self, event: AgentEvent, state: dict) -> AgentEvent:
        """
        Record event in state and optionally push to backend.
        Returns the event for chaining.
        """
        if "events" not in state or state["events"] is None:
            state["events"] = []
        state["events"].append(event)
        logger.debug(
            f"[{event.agent}] {event.event_type} | status={event.status} "
            f"| confidence={event.confidence:.2f}"
        )
        # Fire-and-forget push to backend (no await — called from sync context in graph nodes)
        # Real async push happens via background task or via batch at end
        return event

    def emit_request_received(self, state: dict) -> AgentEvent:
        event = AgentEvent(
            request_id=state["request_id"],
            project_id=state.get("project_id"),
            agent_run_id=state["agent_run_id"],
            agent="orchestrator",
            event_type=EventType.REQUEST_RECEIVED,
            status=AgentStatus.RUNNING,
            partial_output=f"Request received. Query: {state.get('query', '')[:100]}",
        )
        return self.emit(event, state)

    def emit_started(self, state: dict, agent_name: str) -> AgentEvent:
        event = AgentEvent.started(
            request_id=state["request_id"],
            agent_run_id=state["agent_run_id"],
            agent=agent_name,
            project_id=state.get("project_id"),
        )
        return self.emit(event, state)

    def emit_source_retrieved(
        self,
        state: dict,
        agent_name: str,
        source_count: int,
        chunk_ids: List[str],
    ) -> AgentEvent:
        event = AgentEvent(
            request_id=state["request_id"],
            project_id=state.get("project_id"),
            agent_run_id=state["agent_run_id"],
            agent=agent_name,
            event_type=EventType.SOURCE_RETRIEVED,
            status=AgentStatus.RUNNING,
            partial_output=f"Retrieved {source_count} knowledge chunk(s).",
            sources=chunk_ids,
        )
        return self.emit(event, state)

    def emit_processing(self, state: dict, agent_name: str, message: str = "") -> AgentEvent:
        event = AgentEvent(
            request_id=state["request_id"],
            project_id=state.get("project_id"),
            agent_run_id=state["agent_run_id"],
            agent=agent_name,
            event_type=EventType.AGENT_PROCESSING,
            status=AgentStatus.RUNNING,
            partial_output=message or "LLM inference in progress.",
        )
        return self.emit(event, state)

    def emit_completed(
        self,
        state: dict,
        agent_name: str,
        confidence: float = 0.0,
        sources: Optional[List[str]] = None,
        partial_output: Optional[str] = None,
    ) -> AgentEvent:
        event = AgentEvent.completed(
            request_id=state["request_id"],
            agent_run_id=state["agent_run_id"],
            agent=agent_name,
            confidence=confidence,
            sources=sources or [],
            partial_output=partial_output,
            project_id=state.get("project_id"),
        )
        return self.emit(event, state)

    def emit_failed(self, state: dict, agent_name: str, reason: str) -> AgentEvent:
        event = AgentEvent.failed(
            request_id=state["request_id"],
            agent_run_id=state["agent_run_id"],
            agent=agent_name,
            reason=reason,
            project_id=state.get("project_id"),
        )
        return self.emit(event, state)

    def emit_warning(self, state: dict, agent_name: str, message: str) -> AgentEvent:
        event = AgentEvent(
            request_id=state["request_id"],
            project_id=state.get("project_id"),
            agent_run_id=state["agent_run_id"],
            agent=agent_name,
            event_type=EventType.WARNING,
            status=AgentStatus.WARNING,
            partial_output=message,
        )
        return self.emit(event, state)

    def emit_final_result(
        self,
        state: dict,
        confidence: float,
        sources: List[str],
    ) -> AgentEvent:
        event = AgentEvent(
            request_id=state["request_id"],
            project_id=state.get("project_id"),
            agent_run_id=state["agent_run_id"],
            agent="orchestrator",
            event_type=EventType.FINAL_RESULT,
            status=AgentStatus.COMPLETED,
            confidence=confidence,
            sources=sources,
            partial_output=f"Workflow complete. Status: {state.get('workflow_status', 'UNKNOWN')}",
        )
        return self.emit(event, state)
