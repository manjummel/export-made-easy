# ============================================================
# ExportEase AI - Country Model
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from sqlalchemy import String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.utils.validators import generate_uuid


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    iso_alpha2: Mapped[str] = mapped_column(
        String(2), nullable=False, unique=True, index=True
    )
    iso_alpha3: Mapped[str] = mapped_column(
        String(3), nullable=False, unique=True
    )
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sub_region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    trade_agreements: Mapped[str | None] = mapped_column(
        Text, nullable=True  # JSON array as text
    )
    is_sanctioned: Mapped[bool] = mapped_column(Boolean, default=False)
    currency_code: Mapped[str | None] = mapped_column(String(3), nullable=True)

    def __repr__(self) -> str:
        return f"<Country {self.name} ({self.iso_alpha2})>"
