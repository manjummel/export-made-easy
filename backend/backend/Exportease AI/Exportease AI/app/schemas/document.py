from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DocumentAnalysisRequest(BaseModel):
    project_id: str
    product: str
    hs_code: str
    destination: str
    msme_profile: Dict[str, Any]
    compliance_result: Dict[str, Any]

class DocumentRequirement(BaseModel):
    document_name: str
    status: str = Field(..., description="MANDATORY | CONDITIONAL | RECOMMENDED")
    reason: str
    authority: str
    conditions: List[str]
    citations: List[str]

class DocumentAnalysisResponse(BaseModel):
    business_documents: List[DocumentRequirement] = []
    commercial_documents: List[DocumentRequirement] = []
    shipment_documents: List[DocumentRequirement] = []
    customs_related_documents: List[DocumentRequirement] = []
    certificates: List[DocumentRequirement] = []
    product_specific_documents: List[DocumentRequirement] = []
    destination_specific_documents: List[DocumentRequirement] = []

class DocumentUpdateStatus(BaseModel):
    status: str = Field(..., description="NOT_AVAILABLE | PENDING | UPLOADED | VERIFIED")

class DocumentResponse(BaseModel):
    id: str
    project_id: str
    document_name: str
    document_type: Optional[str] = None
    description: Optional[str] = None
    status: str
    issuing_authority: Optional[str] = None
    regulatory_reference: Optional[str] = None
    is_mandatory: bool
    ai_recommended: bool
    # conditions: List[str] = [] # Optional extra
    
    class Config:
        from_attributes = True
