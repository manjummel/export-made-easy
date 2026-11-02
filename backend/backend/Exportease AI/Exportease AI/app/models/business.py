# ============================================================
# ExportEase AI - Business Model
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class Business(Base):
    __tablename__ = "businesses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    msme_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("msme_profiles.id"), nullable=False, index=True
    )

    business_name: Mapped[str] = mapped_column(String(500), nullable=False)
    business_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    primary_activity: Mapped[str | None] = mapped_column(String(255), nullable=True)
    manufacturing_capability: Mapped[str | None] = mapped_column(Text, nullable=True)
    quality_certifications: Mapped[str | None] = mapped_column(
        Text, nullable=True  # JSON array as text
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
    msme_profile = relationship("MSMEProfile", back_populates="businesses")
    products = relationship("Product", back_populates="business", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Business {self.business_name}>"
