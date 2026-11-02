from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.risk import RiskAssessmentRequest
from app.services.risk_engine import risk_engine
from app.services.audit_service import AuditService
from app.core.audit_actions import AuditAction
from app.dependencies import get_current_active_user

router = APIRouter()

@router.post("/analyze", response_model=ResponseEnvelope)
async def analyze_risks(
    request: RiskAssessmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """
    Analyze risk requirements based on project and compliance details.
    """
    response = await risk_engine.analyze_risks(db, request)
    await AuditService.log_action(
        db, action=AuditAction.RISK_ANALYZED,
        user_id=current_user["user_id"], project_id=request.project_id,
        description=f"Risk assessed: level={response.risk_level}, score={response.risk_score}"
    )
    return ResponseEnvelope.success(data=response.model_dump())
