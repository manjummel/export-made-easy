# ============================================================
# ExportEase AI - Error Handler Middleware
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Global exception handler returning consistent ResponseEnvelope errors.
"""

from __future__ import annotations

import logging
import traceback

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.utils.validators import generate_uuid, utc_now_iso
from app.utils.constants import API_VERSION

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Catch unhandled exceptions and return a standard error envelope."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            request_id = getattr(request.state, "request_id", generate_uuid())
            logger.error(
                f"Unhandled exception [request_id={request_id}]: {exc}\n"
                f"{traceback.format_exc()}"
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "request_id": request_id,
                    "project_id": None,
                    "status": "error",
                    "data": None,
                    "confidence": None,
                    "sources": [],
                    "warnings": [],
                    "errors": [
                        "An internal server error occurred. Please try again later."
                    ],
                    "timestamp": utc_now_iso(),
                    "api_version": API_VERSION,
                },
            )
