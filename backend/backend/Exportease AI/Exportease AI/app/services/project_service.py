# ============================================================
# ExportEase AI - Project Service
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
CRUD operations for export projects.
The project_id is the central business identifier for the export journey.
"""

from __future__ import annotations

import logging
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.export_project import ExportProject
from app.models.project_step import ProjectStep
from app.schemas.export_project import ExportProjectCreate, ExportProjectUpdate
from app.utils.validators import generate_uuid
from app.utils.constants import (
    WorkflowStep,
    WORKFLOW_ORDER,
    ProjectStatus,
    StepStatus,
)

logger = logging.getLogger(__name__)


class ProjectService:
    """Manages export project lifecycle and CRUD."""

    @staticmethod
    async def create_project(
        db: AsyncSession,
        request: ExportProjectCreate,
        user_id: str,
    ) -> ExportProject:
        """Create a new export project with all workflow steps initialized."""
        project = ExportProject(
            id=generate_uuid(),
            msme_id=request.msme_id,
            product_id=request.product_id,
            project_name=request.project_name,
            description=request.description,
            destination_country=request.destination_country,
            destination_country_code=request.destination_country_code,
            user_query=request.user_query,
            status=ProjectStatus.CREATED.value,
            current_step=WorkflowStep.MSME_PROFILE.value,
        )
        db.add(project)
        await db.flush()

        # Initialize all workflow steps
        for order, step in enumerate(WORKFLOW_ORDER):
            step_obj = ProjectStep(
                id=generate_uuid(),
                project_id=project.id,
                step_name=step.value,
                step_order=order,
                status=StepStatus.PENDING.value,
            )
            db.add(step_obj)

        await db.flush()
        logger.info(f"Export project created: {project.id} — {project.project_name}")
        return project

    @staticmethod
    async def get_project(
        db: AsyncSession,
        project_id: str,
        user_id: Optional[str] = None,
    ) -> ExportProject | None:
        """Get a project by ID, optionally filtered by user ownership."""
        query = (
            select(ExportProject)
            .options(selectinload(ExportProject.steps))
            .where(ExportProject.id == project_id)
        )
        if user_id:
            # JOIN through msme_profile to check ownership
            from app.models.msme_profile import MSMEProfile
            query = query.join(MSMEProfile).where(MSMEProfile.user_id == user_id)

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_projects(
        db: AsyncSession,
        user_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[ExportProject], int]:
        """List projects with filtering and pagination."""
        from app.models.msme_profile import MSMEProfile

        query = select(ExportProject).options(selectinload(ExportProject.steps))

        if user_id:
            query = query.join(MSMEProfile).where(MSMEProfile.user_id == user_id)
        if status_filter:
            query = query.where(ExportProject.status == status_filter)

        # Count
        count_query = select(func.count()).select_from(ExportProject)
        if user_id:
            count_query = count_query.join(MSMEProfile).where(
                MSMEProfile.user_id == user_id
            )
        if status_filter:
            count_query = count_query.where(ExportProject.status == status_filter)

        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0

        # Fetch
        query = query.offset(offset).limit(limit).order_by(
            ExportProject.created_at.desc()
        )
        result = await db.execute(query)
        projects = list(result.scalars().all())

        return projects, total

    @staticmethod
    async def update_project(
        db: AsyncSession,
        project_id: str,
        update: ExportProjectUpdate,
    ) -> ExportProject | None:
        """Update project fields."""
        result = await db.execute(
            select(ExportProject).where(ExportProject.id == project_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            return None

        update_data = update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)

        await db.flush()
        return project

    @staticmethod
    async def delete_project(db: AsyncSession, project_id: str) -> bool:
        """Soft delete or hard delete a project."""
        result = await db.execute(
            select(ExportProject).where(ExportProject.id == project_id)
        )
        project = result.scalar_one_or_none()
        if not project:
            return False

        project.status = ProjectStatus.ARCHIVED.value
        await db.flush()
        return True
