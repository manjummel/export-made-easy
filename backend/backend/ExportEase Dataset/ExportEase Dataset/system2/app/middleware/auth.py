"""
auth.py — API Key authentication middleware for EXPORT-EASE-KNOWLEDGE-V1

Validates X-API-Key header on all protected routes.
Health endpoints (/health, /ready, /version) are exempt.
"""

from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.config import get_settings

logger = logging.getLogger(__name__)

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

# Paths that do NOT require authentication
PUBLIC_PATHS = {"/health", "/ready", "/version", "/docs", "/redoc", "/openapi.json"}


async def verify_api_key(api_key: Optional[str] = Security(API_KEY_HEADER)) -> str:
    """
    FastAPI dependency that validates the X-API-Key header.
    Returns the validated key on success; raises 401 on failure.
    """
    settings = get_settings()
    valid_keys: List[str] = settings.effective_api_keys

    if not api_key:
        logger.warning("Request received with no API key")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "MISSING_API_KEY",
                "message": "X-API-Key header is required",
                "status_code": 401,
            },
        )

    if api_key not in valid_keys:
        logger.warning("Request received with invalid API key (first 8 chars): %s...", api_key[:8])
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_API_KEY",
                "message": "The provided API key is invalid",
                "status_code": 401,
            },
        )

    return api_key
