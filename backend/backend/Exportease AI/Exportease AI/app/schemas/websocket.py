# ============================================================
# ExportEase AI - WebSocket Event Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
WebSocket event contract. Every event preserves:
request_id, project_id, agent_run_id, agent_event_id,
agent, status, partial_output, confidence, sources, timestamp.

System 1 creates agent events. System 3 validates, stores, forwards.
System 4 displays them.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field

from app.utils.validators import generate_uuid, utc_now_iso


class WSEvent(BaseModel):
    """WebSocket event per shared contract."""
    event_type: str
    request_id: str
    project_id: str
    agent_run_id: Optional[str] = None
    agent_event_id: str = Field(default_factory=generate_uuid)
    agent: Optional[str] = None
    status: Optional[str] = None
    partial_output: Optional[str] = None
    confidence: Optional[float] = None
    sources: list[dict[str, Any]] = Field(default_factory=list)
    timestamp: str = Field(default_factory=utc_now_iso)

    def to_json(self) -> dict:
        return self.model_dump()


class WSConnectionInfo(BaseModel):
    project_id: str
    user_id: str
    connected_at: str = Field(default_factory=utc_now_iso)
