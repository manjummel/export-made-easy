# ============================================================
# ExportEase AI - Agent Event Model
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Individual events within an agent run. Forwarded via WebSocket.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class AgentEvent(Base):
    __tablename__ = "agent_events"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    agent_run_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("agent_runs.id"), nullable=False, index=True
    )

    # Event Identity
    event_type: Mapped[str] = mapped_column(String(30), nullable=False)
    event_order: Mapped[int] = mapped_column(nullable=False, default=0)

    # Context (preserved per WebSocket event contract)
    request_id: Mapped[str] = mapped_column(String(36), nullable=False)
    project_id: Mapped[str] = mapped_column(String(36), nullable=False)
    agent: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # Data
    partial_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    sources: Mapped[str | None] = mapped_column(
        Text, nullable=True  # JSON array as text
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    agent_run = relationship("AgentRun", back_populates="events")

    def __repr__(self) -> str:
        return f"<AgentEvent {self.event_type} run={self.agent_run_id}>"
