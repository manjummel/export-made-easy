# ============================================================
# ExportEase AI - Product Model
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.validators import generate_uuid


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    business_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("businesses.id"), nullable=False, index=True
    )

    product_name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # HS Classification
    hs_code: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    hs_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hs_classification_confidence: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    hs_classification_source: Mapped[str | None] = mapped_column(
        String(50), nullable=True  # AI, MANUAL, VERIFIED
    )

    # Product Details
    unit_of_measure: Mapped[str | None] = mapped_column(String(50), nullable=True)
    quantity: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit_price_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    annual_production_capacity: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    raw_materials: Mapped[str | None] = mapped_column(Text, nullable=True)
    specifications: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Analysis Expansion
    normalized_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    intended_destination: Mapped[str | None] = mapped_column(String(255), nullable=True)
    attributes: Mapped[str | None] = mapped_column(Text, nullable=True) # Stored as JSON string

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
    business = relationship("Business", back_populates="products")

    def __repr__(self) -> str:
        return f"<Product {self.product_name} HS={self.hs_code}>"
