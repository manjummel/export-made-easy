# ============================================================
# ExportEase AI - Market Analysis Schemas (Updated for 3.15)
# EXPORT-EASE-BACKEND-V1
# ============================================================

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class MarketAnalysisRequest(BaseModel):
    project_id: str
    product: str
    hs_code: str
    destination_country: str

class TradeRequirement(BaseModel):
    id: str
    description: str

class TariffInfo(BaseModel):
    rate: str
    details: str

class Citation(BaseModel):
    source: str
    link: Optional[str] = None

class MarketAnalysisResponse(BaseModel):
    destination_information: str
    product_market_requirements: List[str]
    trade_requirements: List[str]
    tariff_trade_information: Optional[str] = None
    certifications: List[str]
    destination_documents: List[str]
    market_opportunities: List[str]
    market_risks: List[str]
    citations: List[Citation]
    confidence: float

class MarketAnalysisRecord(BaseModel):
    id: str
    project_id: str
    country: str
    product: str
    summary: Optional[str] = None
    requirements: Optional[str] = None
    opportunities: Optional[str] = None
    risks: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
