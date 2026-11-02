from fastapi import APIRouter, Depends
from app.schemas.common import ResponseEnvelope
from app.schemas.document import DocumentAnalysisRequest
from app.services.document_engine import document_engine
from app.dependencies import get_current_active_user

router = APIRouter()

@router.post("/analyze", response_model=ResponseEnvelope)
async def analyze_documents(
    request: DocumentAnalysisRequest,
    current_user: dict = Depends(get_current_active_user),
):
    """
    Analyze document requirements based on project details.
    """
    response = await document_engine.analyze_requirements(request)
    return ResponseEnvelope.success(data=response.model_dump())
