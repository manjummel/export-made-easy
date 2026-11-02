from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.market_analysis import MarketAnalysisRequest
from app.services.market_analysis_engine import market_engine
from app.services.audit_service import AuditService
from app.core.audit_actions import AuditAction
from app.dependencies import get_current_active_user

router = APIRouter()

@router.post("/analyze", response_model=ResponseEnvelope)
async def analyze_market(
    request: MarketAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """
    Analyze market context and conditions.
    """
    response = await market_engine.analyze_market(db, request)
    await AuditService.log_action(
        db, action=AuditAction.MARKET_ANALYZED,
        user_id=current_user["user_id"], project_id=request.project_id,
        description=f"Market analyzed: {request.destination_country} for {request.product}"
    )
    return ResponseEnvelope.success(data=response.model_dump())
