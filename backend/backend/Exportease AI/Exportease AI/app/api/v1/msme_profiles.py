# ============================================================
# ExportEase AI - MSME Profiles API Routes
# EXPORT-EASE-BACKEND-V1
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.msme_profile import (
    MSMEProfileCreate,
    MSMEProfileUpdate,
    MSMEProfileResponse,
)
from app.services.msme_service import MSMEProfileService
from app.dependencies import get_current_active_user

router = APIRouter()


@router.post("/", response_model=ResponseEnvelope, status_code=201)
async def create_msme_profile(
    request: MSMEProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Create an MSME profile for the current user."""
    profile = await MSMEProfileService.create_profile(
        db, request, current_user["user_id"]
    )
    return ResponseEnvelope.success(
        data=MSMEProfileResponse.model_validate(profile).model_dump()
    )


@router.get("/", response_model=ResponseEnvelope)
async def list_msme_profiles(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """List MSME profiles for the current user."""
    profiles = await MSMEProfileService.list_profiles(db, current_user["user_id"])
    serialized = [
        MSMEProfileResponse.model_validate(p).model_dump()
        for p in profiles
    ]
    return ResponseEnvelope.success(data={"profiles": serialized, "total": len(serialized)})


@router.get("/{profile_id}", response_model=ResponseEnvelope)
async def get_msme_profile(
    profile_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get a specific MSME profile."""
    profile = await MSMEProfileService.get_profile(db, profile_id, current_user["user_id"])
    if not profile:
        raise HTTPException(status_code=404, detail="MSME profile not found")
        
    return ResponseEnvelope.success(
        data=MSMEProfileResponse.model_validate(profile).model_dump()
    )


@router.patch("/{profile_id}", response_model=ResponseEnvelope)
async def update_msme_profile(
    profile_id: str,
    update: MSMEProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Update an MSME profile."""
    try:
        profile = await MSMEProfileService.update_profile(
            db, profile_id, update, current_user["user_id"]
        )
        return ResponseEnvelope.success(
            data=MSMEProfileResponse.model_validate(profile).model_dump()
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
