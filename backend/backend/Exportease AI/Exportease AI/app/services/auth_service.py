# ============================================================
# ExportEase AI - Auth Service
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.utils.validators import generate_uuid
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class AuthService:
    """Handles user registration, login, and token management."""

    @staticmethod
    async def register(db: AsyncSession, request: RegisterRequest) -> User:
        """Register a new user."""
        # Check if email already exists
        result = await db.execute(
            select(User).where(User.email == request.email.lower().strip())
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise ValueError("Email already registered")

        user = User(
            id=generate_uuid(),
            email=request.email.lower().strip(),
            hashed_password=hash_password(request.password),
            full_name=request.full_name,
            phone=request.phone,
            role="MSME_USER",
        )
        db.add(user)
        await db.flush()
        logger.info(f"User registered: {user.email}")
        return user

    @staticmethod
    async def login(db: AsyncSession, request: LoginRequest) -> TokenResponse:
        """Authenticate user and return JWT tokens."""
        result = await db.execute(
            select(User).where(User.email == request.email.lower().strip())
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(request.password, user.hashed_password):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("Account is disabled")

        token_data = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        logger.info(f"User logged in: {user.email}")
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    @staticmethod
    async def refresh(db: AsyncSession, refresh_token: str) -> TokenResponse:
        """Validate refresh token and issue new tokens."""
        from app.utils.security import decode_token
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise ValueError("Invalid token type")
                
            user_id = payload.get("user_id")
            if not user_id:
                raise ValueError("Invalid payload")
                
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            
            if not user or not user.is_active:
                raise ValueError("Account is disabled or deleted")
                
            token_data = {
                "user_id": user.id,
                "email": user.email,
                "role": user.role,
            }

            new_access = create_access_token(token_data)
            new_refresh = create_refresh_token(token_data)

            return TokenResponse(
                access_token=new_access,
                refresh_token=new_refresh,
                token_type="bearer",
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            )
        except Exception:
            raise ValueError("Invalid or expired refresh token")

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
        """Retrieve user by ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
