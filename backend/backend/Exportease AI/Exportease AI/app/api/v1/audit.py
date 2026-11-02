# ============================================================
# ExportEase AI - Audit Logs API Routes
# EXPORT-EASE-BACKEND-V1
# ============================================================

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.services.audit_service import AuditService
from app.dependencies import get_current_active_user, require_admin

router = APIRouter()


@router.get("/", response_model=ResponseEnvelope)
async def list_audit_logs(
    project_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """List audit logs (filtered by user or admin sees all)."""
    user_id = current_user["user_id"]
    if current_user["role"] == "ADMIN":
        user_id = None  # Admin can see all

    offset = (page - 1) * page_size
    logs, total = await AuditService.get_audit_logs(
        db,
        user_id=user_id,
        project_id=project_id,
        action=action,
        offset=offset,
        limit=page_size,
    )

    return ResponseEnvelope.success(
        data={
            "logs": [
                {
                    "id": log.id,
                    "user_id": log.user_id,
                    "project_id": log.project_id,
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "description": log.description,
                    "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                }
                for log in logs
            ],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )
