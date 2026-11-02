# ============================================================
# ExportEase AI - Citation Model
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Citations link AI outputs to verified sources from the Knowledge system.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class Citation(Base):
    __tablename__ = "citations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("export_projects.id"), nullable=False, index=True
    )

    # Source Identity
    source_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    chunk_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    # Citation Content
    source_title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    page_number: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Context
    agent_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    workflow_step: Mapped[str | None] = mapped_column(String(50), nullable=True)
    relevance_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Verification
    is_verified: Mapped[bool] = mapped_column(default=False)
    verified_by: Mapped[str | None] = mapped_column(String(36), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    project = relationship("ExportProject", back_populates="citations")

    def __repr__(self) -> str:
        return f"<Citation {self.source_title}>"
