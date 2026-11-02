# ============================================================
# ExportEase AI - Export Plan Model (Updated for 3.17)
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class ExportPlan(Base):
    __tablename__ = "export_plans"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("export_projects.id"), nullable=False, index=True
    )

    # General Info
    plan_title: Mapped[str] = mapped_column(String(500), nullable=False)
    
    # Store individual phases as JSON arrays of steps
    phase_a_readiness: Mapped[str | None] = mapped_column(Text, nullable=True)
    phase_b_hs_classification: Mapped[str | None] = mapped_column(Text, nullable=True)
    phase_c_compliance: Mapped[str | None] = mapped_column(Text, nullable=True)
    phase_d_documents: Mapped[str | None] = mapped_column(Text, nullable=True)
    phase_e_certifications: Mapped[str | None] = mapped_column(Text, nullable=True)
    phase_f_destination_market: Mapped[str | None] = mapped_column(Text, nullable=True)
    phase_g_risk_mitigation: Mapped[str | None] = mapped_column(Text, nullable=True)
    phase_h_execution_checklist: Mapped[str | None] = mapped_column(Text, nullable=True)
    
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
    project = relationship("ExportProject", back_populates="export_plans")

    def __repr__(self) -> str:
        return f"<ExportPlan project_id={self.project_id}>"
