# ============================================================
# ExportEase AI - HS Classification Model
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Stores HS classification history and its associated citations for projects.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class HSClassification(Base):
    __tablename__ = "hs_classifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("export_projects.id"), nullable=False, index=True
    )

    product_description: Mapped[str] = mapped_column(Text, nullable=False)
    destination: Mapped[str | None] = mapped_column(String(255), nullable=True)

    status: Mapped[str] = mapped_column(String(50), nullable=False) # CLASSIFIED, REVIEW_REQUIRED, INSUFFICIENT_EVIDENCE
    selected_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    agent_run_id: Mapped[str | None] = mapped_column(String(36), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<HSClassification {self.selected_code} status={self.status}>"
