# ============================================================
# ExportEase AI - Project Step Model
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Tracks the status of each workflow step within an export project.
System 3 owns the canonical workflow order.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class ProjectStep(Base):
    __tablename__ = "project_steps"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("export_projects.id"), nullable=False, index=True
    )

    step_name: Mapped[str] = mapped_column(String(50), nullable=False)
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="PENDING"
    )

    # AI Result
    result_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_data: Mapped[str | None] = mapped_column(
        Text, nullable=True  # JSON as text
    )
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    agent_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

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
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    project = relationship("ExportProject", back_populates="steps")

    def __repr__(self) -> str:
        return f"<ProjectStep {self.step_name} status={self.status}>"
