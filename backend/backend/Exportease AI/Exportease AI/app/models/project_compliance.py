# ============================================================
# ExportEase AI - Project Compliance Model
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class ProjectCompliance(Base):
    __tablename__ = "project_compliance"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("export_projects.id"), nullable=False, index=True
    )

    # Compliance Details
    requirement_name: Mapped[str] = mapped_column(String(500), nullable=False)
    requirement_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="PENDING_REVIEW"
    )

    # Regulatory
    regulatory_body: Mapped[str | None] = mapped_column(String(500), nullable=True)
    regulation_reference: Mapped[str | None] = mapped_column(Text, nullable=True)
    country_specific: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)

    # AI Assessment
    ai_assessment: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    agent_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    # SAFETY: Never invent regulatory facts
    evidence_status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="PENDING_REVIEW"
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
    project = relationship("ExportProject", back_populates="compliance_records")

    def __repr__(self) -> str:
        return f"<ProjectCompliance {self.requirement_name} status={self.status}>"
