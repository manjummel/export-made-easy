# ============================================================
# ExportEase AI - Businesses API Routes
# EXPORT-EASE-BACKEND-V1
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.business import Business
from app.models.msme_profile import MSMEProfile
from app.schemas.common import ResponseEnvelope
from app.schemas.business import BusinessCreate, BusinessUpdate, BusinessResponse
from app.dependencies import get_current_active_user
from app.utils.validators import generate_uuid

router = APIRouter()


@router.post("/", response_model=ResponseEnvelope, status_code=201)
async def create_business(
    request: BusinessCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Create a business under an MSME profile."""
    # Verify MSME ownership
    msme_result = await db.execute(
        select(MSMEProfile).where(
            MSMEProfile.id == request.msme_id,
            MSMEProfile.user_id == current_user["user_id"],
        )
    )
    if not msme_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="MSME profile not found or access denied")

    business = Business(id=generate_uuid(), **request.model_dump())
    db.add(business)
    await db.flush()
    return ResponseEnvelope.success(
        data=BusinessResponse.model_validate(business).model_dump()
    )


@router.get("/{business_id}", response_model=ResponseEnvelope)
async def get_business(
    business_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get a business by ID."""
    result = await db.execute(select(Business).where(Business.id == business_id))
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return ResponseEnvelope.success(
        data=BusinessResponse.model_validate(business).model_dump()
    )


@router.patch("/{business_id}", response_model=ResponseEnvelope)
async def update_business(
    business_id: str,
    update: BusinessUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Update a business."""
    result = await db.execute(select(Business).where(Business.id == business_id))
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(business, key, value)

    await db.flush()
    return ResponseEnvelope.success(
        data=BusinessResponse.model_validate(business).model_dump()
    )
