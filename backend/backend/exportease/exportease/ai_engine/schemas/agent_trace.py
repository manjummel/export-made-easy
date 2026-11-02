"""
ai_engine/schemas/agent_trace.py

Pydantic v2 models for agent trace events.
Mirrors contracts/v1/agent_trace.json exactly.

NEVER change field names or enum values without updating the contract version.
"""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """
    Supported agent event types.
    Mirrors contracts/v1/event_types.json and contracts/v1/agent_trace.json.
    """
    REQUEST_RECEIVED = "REQUEST_RECEIVED"
    AGENT_STARTED = "AGENT_STARTED"
    SOURCE_RETRIEVED = "SOURCE_RETRIEVED"
    AGENT_PROCESSING = "AGENT_PROCESSING"
    AGENT_COMPLETED = "AGENT_COMPLETED"
    AGENT_FAILED = "AGENT_FAILED"
    WARNING = "WARNING"
    FINAL_RESULT = "FINAL_RESULT"


class AgentName(str, Enum):
    """
    Canonical agent names. Used in agent_trace.agent field.
    Mirrors contracts/v1/agent_trace.json#/properties/agent/enum.
    """
    PRODUCT = "product_agent"
    HS = "hs_agent"
    COMPLIANCE = "compliance_agent"
    DOCUMENT = "document_agent"
    CERTIFICATION = "certification_agent"
    MARKET = "market_agent"
    RISK = "risk_agent"
    PLANNER = "planner_agent"
    ORCHESTRATOR = "orchestrator"


class AgentStatus(str, Enum):
    """Status of an individual agent event."""
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    WARNING = "WARNING"
    PENDING = "PENDING"


class AgentEvent(BaseModel):
    """
    A single agent trace event.
    Mirrors contracts/v1/agent_trace.json.

    Emitted by ai_engine/agents/tracer.py at each lifecycle point.
    All events must preserve request_id and agent_run_id.
    """

    agent_event_id: str = Field(
        default_factory=lambda: str(uuid4()),
        description="Unique event identifier (UUID).",
    )
    request_id: str = Field(description="Original request identifier. MUST be preserved.")
    project_id: Optional[str] = Field(default=None, description="Project identifier.")
    agent_run_id: str = Field(
        description="Groups all events for a single workflow execution."
    )
    agent: str = Field(description="Name of the agent emitting this event.")
    event_type: EventType = Field(description="Event lifecycle type.")
    status: AgentStatus = Field(description="Current status of this agent.")
    partial_output: Optional[str] = Field(
        default=None, description="Partial or full textual output from the agent."
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Agent-level confidence at this event.",
    )
    sources: List[str] = Field(
        default_factory=list,
        description="Source/chunk/citation IDs referenced in this event.",
    )
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"use_enum_values": True}

    @classmethod
    def started(
        cls,
        request_id: str,
        agent_run_id: str,
        agent: str,
        project_id: Optional[str] = None,
    ) -> "AgentEvent":
        """Convenience factory: emit AGENT_STARTED event."""
        return cls(
            request_id=request_id,
            project_id=project_id,
            agent_run_id=agent_run_id,
            agent=agent,
            event_type=EventType.AGENT_STARTED,
            status=AgentStatus.RUNNING,
        )

    @classmethod
    def completed(
        cls,
        request_id: str,
        agent_run_id: str,
        agent: str,
        confidence: float = 0.0,
        sources: Optional[List[str]] = None,
        partial_output: Optional[str] = None,
        project_id: Optional[str] = None,
    ) -> "AgentEvent":
        """Convenience factory: emit AGENT_COMPLETED event."""
        return cls(
            request_id=request_id,
            project_id=project_id,
            agent_run_id=agent_run_id,
            agent=agent,
            event_type=EventType.AGENT_COMPLETED,
            status=AgentStatus.COMPLETED,
            confidence=confidence,
            sources=sources or [],
            partial_output=partial_output,
        )

    @classmethod
    def failed(
        cls,
        request_id: str,
        agent_run_id: str,
        agent: str,
        reason: str,
        project_id: Optional[str] = None,
    ) -> "AgentEvent":
        """Convenience factory: emit AGENT_FAILED event."""
        return cls(
            request_id=request_id,
            project_id=project_id,
            agent_run_id=agent_run_id,
            agent=agent,
            event_type=EventType.AGENT_FAILED,
            status=AgentStatus.FAILED,
            partial_output=reason,
        )
