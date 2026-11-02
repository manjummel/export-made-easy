# ============================================================
# ExportEase AI - Product Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    business_id: str
    product_name: str = Field(min_length=1, max_length=500)
    description: Optional[str] = None
    category: Optional[str] = None
    hs_code: Optional[str] = None
    unit_of_measure: Optional[str] = None
    quantity: Optional[float] = None
    unit_price_usd: Optional[float] = None
    annual_production_capacity: Optional[str] = None
    raw_materials: Optional[str] = None
    specifications: Optional[str] = None
    intended_destination: Optional[str] = None


class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    hs_code: Optional[str] = None
    unit_of_measure: Optional[str] = None
    quantity: Optional[float] = None
    unit_price_usd: Optional[float] = None
    annual_production_capacity: Optional[str] = None
    raw_materials: Optional[str] = None
    specifications: Optional[str] = None
    intended_destination: Optional[str] = None


class ProductResponse(BaseModel):
    id: str
    business_id: str
    product_name: str
    description: Optional[str] = None
    category: Optional[str] = None
    hs_code: Optional[str] = None
    hs_description: Optional[str] = None
    hs_classification_confidence: Optional[float] = None
    hs_classification_source: Optional[str] = None
    
    unit_of_measure: Optional[str] = None
    quantity: Optional[float] = None
    unit_price_usd: Optional[float] = None
    annual_production_capacity: Optional[str] = None
    raw_materials: Optional[str] = None
    specifications: Optional[str] = None
    
    normalized_name: Optional[str] = None
    intended_destination: Optional[str] = None
    attributes: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class ProductAnalysisRequest(BaseModel):
    product_id: str
