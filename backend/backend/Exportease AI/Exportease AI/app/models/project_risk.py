# ============================================================
# ExportEase AI - Project Risk Model (Updated for 3.16)
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class ProjectRisk(Base):
    __tablename__ = "project_risks"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("export_projects.id"), nullable=False, index=True
    )

    # Risk Summary
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    risk_level: Mapped[str] = mapped_column(
        String(20), nullable=False, default="GREEN"
    )

    # JSON Arrays
    risk_categories: Mapped[str | None] = mapped_column(Text, nullable=True) # JSON list
    risk_factors: Mapped[str | None] = mapped_column(Text, nullable=True) # JSON list of dicts
    mitigation_actions: Mapped[str | None] = mapped_column(Text, nullable=True) # JSON list
    citations: Mapped[str | None] = mapped_column(Text, nullable=True) # JSON list of dicts

    # Metrics
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

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
    project = relationship("ExportProject", back_populates="risks")

    def __repr__(self) -> str:
        return f"<ProjectRisk project={self.project_id} level={self.risk_level}>"
