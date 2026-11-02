# ============================================================
# ExportEase AI - Export Project Service
# EXPORT-EASE-BACKEND-V1
# ============================================================
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.export_project import ExportProject
from app.models.msme_profile import MSMEProfile
from app.schemas.export_project import ExportProjectCreate, ExportProjectUpdate
from app.utils.validators import generate_uuid

class ExportProjectService:
    """Service handling export project business logic and authorization boundaries."""

    @staticmethod
    async def create_project(db: AsyncSession, request: ExportProjectCreate, user_id: str) -> ExportProject:
        """Create project ensuring MSME authority"""
        
        rel_check = await db.execute(select(MSMEProfile).where(
            MSMEProfile.id == request.msme_id, 
            MSMEProfile.user_id == user_id
        ))
        msme = rel_check.scalar_one_or_none()
        if not msme:
            raise ValueError("Unauthorized or missing MSME profile context")
        
        project = ExportProject(
            id=generate_uuid(),
            status="DRAFT", # Prompt designated initial status
            **request.model_dump()
        )
        db.add(project)
        await db.flush()
        return project

    @staticmethod
    async def get_project(db: AsyncSession, project_id: str, user_id: str) -> ExportProject | None:
        """Retrieve specifically bound to the user id down the chain."""
        stmt = select(ExportProject).join(MSMEProfile).where(
            ExportProject.id == project_id,
            MSMEProfile.user_id == user_id
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def list_projects(db: AsyncSession, user_id: str) -> List[ExportProject]:
        stmt = select(ExportProject).join(MSMEProfile).where(
            MSMEProfile.user_id == user_id
        )
        return list((await db.execute(stmt)).scalars().all())

    @staticmethod
    async def update_project(db: AsyncSession, project_id: str, update: ExportProjectUpdate, user_id: str) -> ExportProject:
        project = await ExportProjectService.get_project(db, project_id, user_id)
        if not project:
            raise ValueError("Project not found")

        update_data = update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)

        await db.flush()
        return project

    @staticmethod
    async def delete_project(db: AsyncSession, project_id: str, user_id: str) -> None:
        project = await ExportProjectService.get_project(db, project_id, user_id)
        if not project:
            raise ValueError("Project not found")
        await db.delete(project)
        await db.flush()
