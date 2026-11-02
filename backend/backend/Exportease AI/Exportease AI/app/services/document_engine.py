from typing import Dict, Any, List
from app.schemas.document import DocumentAnalysisRequest, DocumentAnalysisResponse, DocumentRequirement
import logging
from app.dependencies import get_ai_client

logger = logging.getLogger(__name__)

class DocumentEngineService:
    async def analyze_requirements(self, request: DocumentAnalysisRequest) -> DocumentAnalysisResponse:
        """
        Analyze the document requirements based on project parameters using the real AI Service.
        """
        logger.info(f"Analyzing document requirements for project {request.project_id}")
        ai_client = get_ai_client()
        
        context = request.model_dump()
        # Add required tracing fields for the AI client
        context.update({"api_version": "v1", "language": "en"})
        
        ai_response = await ai_client.analyze_documents(context)
        data = ai_response.get("data", {})
        
        return DocumentAnalysisResponse(
            business_documents=[DocumentRequirement(**d) for d in data.get("business_documents", [])],
            commercial_documents=[DocumentRequirement(**d) for d in data.get("commercial_documents", [])],
            shipment_documents=[DocumentRequirement(**d) for d in data.get("shipment_documents", [])],
            customs_related_documents=[DocumentRequirement(**d) for d in data.get("customs_related_documents", [])],
            certificates=[DocumentRequirement(**d) for d in data.get("certificates", [])],
            product_specific_documents=[DocumentRequirement(**d) for d in data.get("product_specific_documents", [])],
            destination_specific_documents=[DocumentRequirement(**d) for d in data.get("destination_specific_documents", [])]
        )

document_engine = DocumentEngineService()
