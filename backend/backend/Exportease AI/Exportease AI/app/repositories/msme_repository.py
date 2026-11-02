# ============================================================
# ExportEase AI - MSME Repository
# EXPORT-EASE-BACKEND-V1
# ============================================================
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.msme_profile import MSMEProfile

class MSMEProfileRepository:
    """Handles direct database access for MSME Profile models."""
    
    @staticmethod
    async def create(db: AsyncSession, profile: MSMEProfile) -> MSMEProfile:
        db.add(profile)
        await db.flush()
        return profile

    @staticmethod
    async def get_by_id(db: AsyncSession, profile_id: str, user_id: str) -> Optional[MSMEProfile]:
        result = await db.execute(
            select(MSMEProfile).where(
                MSMEProfile.id == profile_id,
                MSMEProfile.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_by_user(db: AsyncSession, user_id: str) -> List[MSMEProfile]:
        result = await db.execute(
            select(MSMEProfile).where(MSMEProfile.user_id == user_id)
        )
        return list(result.scalars().all())

    @staticmethod
    async def update(db: AsyncSession, profile: MSMEProfile) -> MSMEProfile:
        await db.flush()
        return profile
