# ============================================================
# ExportEase AI - Auth API Routes
# EXPORT-EASE-BACKEND-V1
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest
from app.schemas.common import ResponseEnvelope
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.services.audit_service import AuditService
from app.dependencies import get_current_active_user

router = APIRouter()


@router.post("/register", response_model=ResponseEnvelope, status_code=201)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new MSME user."""
    try:
        user = await AuthService.register(db, request)
        await AuditService.log_action(
            db, action="REGISTER", user_id=user.id,
            description=f"User registered: {user.email}",
        )
        return ResponseEnvelope.success(
            data=UserResponse.model_validate(user).model_dump()
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=ResponseEnvelope)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user and return JWT tokens."""
    try:
        tokens = await AuthService.login(db, request)
        await AuditService.log_action(
            db, action="LOGIN",
            description=f"User logged in: {request.email}",
        )
        return ResponseEnvelope.success(data=tokens.model_dump())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)
        )


@router.post("/refresh", response_model=ResponseEnvelope)
async def refresh(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh JWT tokens."""
    try:
        tokens = await AuthService.refresh(db, request.refresh_token)
        return ResponseEnvelope.success(data=tokens.model_dump())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)
        )


@router.get("/me", response_model=ResponseEnvelope)
async def get_current_user_info(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user profile."""
    user = await AuthService.get_user_by_id(db, current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return ResponseEnvelope.success(
        data=UserResponse.model_validate(user).model_dump()
    )
