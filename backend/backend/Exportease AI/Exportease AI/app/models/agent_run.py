# ============================================================
# ExportEase AI - Agent Run Model
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Tracks AI agent execution runs. System 1 creates agent events.
System 3 validates, stores, and forwards them.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("export_projects.id"), nullable=False, index=True
    )
    request_id: Mapped[str] = mapped_column(
        String(36), nullable=False, index=True
    )

    # Agent Identity
    agent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    agent_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    workflow_step: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="QUEUED"
    )

    # Input/Output
    input_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Metrics
    total_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timing
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    project = relationship("ExportProject", back_populates="agent_runs")
    events = relationship("AgentEvent", back_populates="agent_run", lazy="selectin")

    def __repr__(self) -> str:
        return f"<AgentRun {self.agent_type} status={self.status}>"
