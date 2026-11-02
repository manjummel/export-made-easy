# ============================================================
# ExportEase AI - MSME Service
# EXPORT-EASE-BACKEND-V1
# ============================================================
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.msme_profile import MSMEProfile
from app.schemas.msme_profile import MSMEProfileCreate, MSMEProfileUpdate
from app.repositories.msme_repository import MSMEProfileRepository
from app.utils.validators import generate_uuid

class MSMEProfileService:
    """Service layer for MSME business logic and profile orchestration."""
    
    @staticmethod
    async def create_profile(db: AsyncSession, request: MSMEProfileCreate, user_id: str) -> MSMEProfile:
        """Hydrates business logic securely binding profile scope to requesting user."""
        profile = MSMEProfile(
            id=generate_uuid(),
            user_id=user_id,
            **request.model_dump()
        )
        return await MSMEProfileRepository.create(db, profile)

    @staticmethod
    async def get_profile(db: AsyncSession, profile_id: str, user_id: str) -> MSMEProfile | None:
        return await MSMEProfileRepository.get_by_id(db, profile_id, user_id)

    @staticmethod
    async def list_profiles(db: AsyncSession, user_id: str) -> List[MSMEProfile]:
        return await MSMEProfileRepository.list_by_user(db, user_id)

    @staticmethod
    async def update_profile(
        db: AsyncSession, profile_id: str, update: MSMEProfileUpdate, user_id: str
    ) -> MSMEProfile:
        profile = await MSMEProfileRepository.get_by_id(db, profile_id, user_id)
        if not profile:
            raise ValueError("MSME profile not found or unauthorized")

        update_data = update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)

        return await MSMEProfileRepository.update(db, profile)
