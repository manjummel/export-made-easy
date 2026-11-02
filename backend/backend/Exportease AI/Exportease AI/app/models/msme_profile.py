# ============================================================
# ExportEase AI - MSME Profile Model
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
MSME (Micro, Small and Medium Enterprise) business profile.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class MSMEProfile(Base):
    __tablename__ = "msme_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )

    # Business Identity
    company_name: Mapped[str] = mapped_column(String(500), nullable=False)
    gstin: Mapped[str | None] = mapped_column(String(15), nullable=True, index=True)
    iec_code: Mapped[str | None] = mapped_column(String(10), nullable=True, index=True)
    udyam_number: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Classification
    msme_category: Mapped[str | None] = mapped_column(
        String(20), nullable=True  # MICRO, SMALL, MEDIUM
    )
    industry_sector: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Contact
    registered_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pincode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Export Experience
    export_experience_years: Mapped[int | None] = mapped_column(nullable=True)
    annual_turnover_inr: Mapped[float | None] = mapped_column(nullable=True)
    previous_export_countries: Mapped[str | None] = mapped_column(
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
    user = relationship("User", back_populates="msme_profiles")
    businesses = relationship("Business", back_populates="msme_profile", lazy="selectin")
    export_projects = relationship(
        "ExportProject", back_populates="msme_profile", lazy="noload"
    )

    def __repr__(self) -> str:
        return f"<MSMEProfile {self.company_name}>"
