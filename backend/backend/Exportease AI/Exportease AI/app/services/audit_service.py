# ============================================================
# ExportEase AI - Audit Service
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

import logging
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.utils.validators import generate_uuid

logger = logging.getLogger(__name__)


class AuditService:
    """Audit logging for all system actions."""

    @staticmethod
    async def log_action(
        db: AsyncSession,
        action: str,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        description: Optional[str] = None,
        request_data: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Create an audit log entry."""
        log = AuditLog(
            id=generate_uuid(),
            user_id=user_id,
            project_id=project_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
            request_data=request_data,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        db.add(log)
        await db.flush()
        return log

    @staticmethod
    async def get_audit_logs(
        db: AsyncSession,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None,
        action: Optional[str] = None,
        offset: int = 0,
        limit: int = 50,
    ) -> tuple[list[AuditLog], int]:
        """Retrieve audit logs with filtering."""
        query = select(AuditLog)

        if user_id:
            query = query.where(AuditLog.user_id == user_id)
        if project_id:
            query = query.where(AuditLog.project_id == project_id)
        if action:
            query = query.where(AuditLog.action == action)

        count_query = select(func.count()).select_from(AuditLog)
        if user_id:
            count_query = count_query.where(AuditLog.user_id == user_id)
        if project_id:
            count_query = count_query.where(AuditLog.project_id == project_id)

        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0

        query = query.offset(offset).limit(limit).order_by(AuditLog.timestamp.desc())
        result = await db.execute(query)
        logs = list(result.scalars().all())

        return logs, total
