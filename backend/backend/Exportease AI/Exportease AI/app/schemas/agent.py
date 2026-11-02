# ============================================================
# ExportEase AI - Agent Tracking Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class AgentRunResponse(BaseModel):
    id: str
    project_id: str
    request_id: str
    agent_type: str
    agent_name: Optional[str] = None
    workflow_step: Optional[str] = None
    status: str
    confidence: Optional[float] = None
    total_tokens: Optional[int] = None
    duration_ms: Optional[int] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    events: list["AgentEventResponse"] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class AgentEventResponse(BaseModel):
    id: str
    agent_run_id: str
    event_type: str
    event_order: int
    request_id: str
    project_id: str
    agent: Optional[str] = None
    status: Optional[str] = None
    partial_output: Optional[str] = None
    confidence: Optional[float] = None
    sources: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}


class CitationResponse(BaseModel):
    id: str
    project_id: str
    source_id: Optional[str] = None
    chunk_id: Optional[str] = None
    source_title: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    excerpt: Optional[str] = None
    page_number: Optional[str] = None
    agent_run_id: Optional[str] = None
    workflow_step: Optional[str] = None
    relevance_score: Optional[float] = None
    is_verified: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}
