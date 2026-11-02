# ============================================================
# ExportEase AI - Export Project Model
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
The Export Project is the central business entity for the export journey.
project_id is the central identifier that traces through all systems.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class ExportProject(Base):
    __tablename__ = "export_projects"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    msme_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("msme_profiles.id"), nullable=False, index=True
    )
    product_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("products.id"), nullable=True, index=True
    )

    # Project Identity
    project_name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Target
    destination_country: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    destination_country_code: Mapped[str | None] = mapped_column(
        String(3), nullable=True
    )

    # Workflow State (owned by System 3)
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="CREATED", index=True
    )
    current_step: Mapped[str] = mapped_column(
        String(50), nullable=False, default="MSME_PROFILE"
    )
    overall_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    # User input for the canonical scenario
    user_query: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Project parameters
    quantity: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str | None] = mapped_column(String(10), nullable=True, default="USD")
    preferred_language: Mapped[str | None] = mapped_column(String(50), nullable=True, default="en")
    
    completion_percentage: Mapped[int | None] = mapped_column(Float, nullable=True, default=0.0)
    risk_level: Mapped[str | None] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    msme_profile = relationship("MSMEProfile", back_populates="export_projects")
    steps = relationship(
        "ProjectStep", back_populates="project", lazy="selectin",
        order_by="ProjectStep.step_order"
    )
    documents = relationship("ProjectDocument", back_populates="project", lazy="noload")
    compliance_records = relationship(
        "ProjectCompliance", back_populates="project", lazy="noload"
    )
    certifications = relationship(
        "ProjectCertification", back_populates="project", lazy="noload"
    )
    market_analyses = relationship(
        "MarketAnalysis", back_populates="project", lazy="noload"
    )
    risks = relationship("ProjectRisk", back_populates="project", lazy="noload")
    export_plans = relationship("ExportPlan", back_populates="project", lazy="noload")
    agent_runs = relationship("AgentRun", back_populates="project", lazy="noload")
    citations = relationship("Citation", back_populates="project", lazy="noload")

    def __repr__(self) -> str:
        return f"<ExportProject {self.project_name} status={self.status}>"
