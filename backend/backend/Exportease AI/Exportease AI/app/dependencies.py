# ============================================================
# ExportEase AI - FastAPI Dependencies
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Dependency injection for auth, DB sessions, and service clients.
Users must only access their own projects unless their role explicitly allows.
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings, Settings
from app.database import get_db
from app.utils.security import verify_access_token
from app.utils.constants import UserRole

logger = logging.getLogger(__name__)

security_scheme = HTTPBearer(auto_error=False)


# ── Settings Dependency ───────────────────────────────────────
def get_app_settings() -> Settings:
    return get_settings()


# ── Auth Dependencies ─────────────────────────────────────────
async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Extract and verify the current user from JWT token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "user_id": payload.get("user_id"),
        "email": payload.get("email"),
        "role": payload.get("role", "MSME_USER"),
    }


async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Ensure the user is active."""
    # In production, verify against DB that user.is_active == True
    return current_user


def require_role(*roles: UserRole):
    """Dependency factory: require specific roles."""

    async def role_checker(
        current_user: dict = Depends(get_current_active_user),
    ) -> dict:
        user_role = current_user.get("role", "")
        if user_role not in [r.value for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' is not authorized for this action. "
                       f"Required: {[r.value for r in roles]}",
            )
        return current_user

    return role_checker


async def require_admin(
    current_user: dict = Depends(get_current_active_user),
) -> dict:
    """Require ADMIN role."""
    if current_user.get("role") != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# ── Service Client Dependencies ───────────────────────────────
def get_ai_client():
    """Get the appropriate AI service client (real or mock)."""
    from app.main import app_state
    return app_state.get("ai_client")


def get_knowledge_client():
    """Get the appropriate Knowledge service client (real or mock)."""
    from app.main import app_state
    return app_state.get("knowledge_client")
