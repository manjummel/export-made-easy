from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.export_plan import ExportPlanRequest
from app.services.export_plan_engine import export_plan_engine
from app.services.audit_service import AuditService
from app.core.audit_actions import AuditAction
from app.dependencies import get_current_active_user

router = APIRouter()

@router.post("/generate", response_model=ResponseEnvelope)
async def generate_export_plan(
    request: ExportPlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """
    Generate an overall export plan based on collected requirements.
    """
    response = await export_plan_engine.generate_plan(db, request)
    await AuditService.log_action(
        db, action=AuditAction.EXPORT_PLAN_GENERATED,
        user_id=current_user["user_id"], project_id=request.project_id,
        description=f"Export plan generated for project {request.project_id}"
    )
    return ResponseEnvelope.success(data=response.model_dump())
