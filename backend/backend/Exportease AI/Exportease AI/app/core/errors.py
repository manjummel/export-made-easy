# ============================================================
# ExportEase AI - Centralized Error Handling
# EXPORT-EASE-BACKEND-V1
# ============================================================

from fastapi import Request, FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging
from app.utils.validators import generate_uuid, utc_now_iso

logger = logging.getLogger(__name__)

class ExportEaseError(Exception):
    def __init__(self, error_code: str, message: str, status_code: int = 400, details: dict = None):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.details = details or {}

def setup_exception_handlers(app: FastAPI):
    
    @app.exception_handler(ExportEaseError)
    async def exportease_error_handler(request: Request, exc: ExportEaseError):
        req_id = getattr(request.state, "request_id", generate_uuid())
        logger.error(f"[{req_id}] ExportEaseError: {exc.error_code} - {exc.message}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error_code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
                "request_id": req_id,
                "timestamp": utc_now_iso()
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        req_id = getattr(request.state, "request_id", generate_uuid())
        logger.warning(f"[{req_id}] RequestValidationError: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error_code": "VALIDATION_ERROR",
                "message": "The request payload is invalid.",
                "details": {"errors": exc.errors()},
                "request_id": req_id,
                "timestamp": utc_now_iso()
            }
        )

    @app.exception_handler(SQLAlchemyError)
    async def database_exception_handler(request: Request, exc: SQLAlchemyError):
        req_id = getattr(request.state, "request_id", generate_uuid())
        logger.critical(f"[{req_id}] SQLAlchemyError: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error_code": "DATABASE_ERROR",
                "message": "A database synchronization error occurred.",
                "details": {},
                "request_id": req_id,
                "timestamp": utc_now_iso()
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        req_id = getattr(request.state, "request_id", generate_uuid())
        logger.critical(f"[{req_id}] Unhandled Exception: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred.",
                "details": {},
                "request_id": req_id,
                "timestamp": utc_now_iso()
            }
        )
