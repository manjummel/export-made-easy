# ============================================================
# ExportEase AI - Users API Routes
# EXPORT-EASE-BACKEND-V1
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.common import ResponseEnvelope
from app.schemas.user import UserResponse, UserUpdate
from app.dependencies import get_current_active_user, require_admin

router = APIRouter()


@router.get("/", response_model=ResponseEnvelope)
async def list_users(
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(require_admin),
):
    """List all users (admin only)."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = [UserResponse.model_validate(u).model_dump() for u in result.scalars()]
    return ResponseEnvelope.success(data={"users": users, "total": len(users)})


@router.get("/{user_id}", response_model=ResponseEnvelope)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Get user by ID (own profile or admin)."""
    if current_user["user_id"] != user_id and current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return ResponseEnvelope.success(
        data=UserResponse.model_validate(user).model_dump()
    )


@router.patch("/{user_id}", response_model=ResponseEnvelope)
async def update_user(
    user_id: str,
    update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """Update user profile."""
    if current_user["user_id"] != user_id and current_user["role"] != "ADMIN":
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    await db.flush()
    return ResponseEnvelope.success(
        data=UserResponse.model_validate(user).model_dump()
    )
