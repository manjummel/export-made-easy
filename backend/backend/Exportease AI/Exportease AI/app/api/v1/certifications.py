from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.certification import CertificationAnalysisRequest
from app.services.certification_engine import CertificationEngineService
from app.dependencies import get_current_active_user

router = APIRouter()

@router.post("/analyze", response_model=ResponseEnvelope)
async def analyze_certifications(
    request: CertificationAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """
    Analyze certification requirements based on project and compliance details.
    """
    response = await CertificationEngineService.analyze_certifications(db, request)
    return ResponseEnvelope.success(data=response.model_dump())
