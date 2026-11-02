# ============================================================
# ExportEase AI - Project Certification Model
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class ProjectCertification(Base):
    __tablename__ = "project_certifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("export_projects.id"), nullable=False, index=True
    )

    certification_name: Mapped[str] = mapped_column(String(500), nullable=False)
    certification_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="REQUIRED"
    )

    # Certification Details
    issuing_body: Mapped[str | None] = mapped_column(String(500), nullable=True)
    validity_period: Mapped[str | None] = mapped_column(String(100), nullable=True)
    estimated_cost: Mapped[str | None] = mapped_column(String(100), nullable=True)
    estimated_time: Mapped[str | None] = mapped_column(String(100), nullable=True)
    application_process: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Regulatory
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)
    country_specific: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # AI Source
    ai_recommended: Mapped[bool] = mapped_column(Boolean, default=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    agent_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

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
    project = relationship("ExportProject", back_populates="certifications")

    def __repr__(self) -> str:
        return f"<ProjectCertification {self.certification_name} status={self.status}>"
