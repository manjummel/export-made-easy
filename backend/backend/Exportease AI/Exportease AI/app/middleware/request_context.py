# ============================================================
# ExportEase AI - Request ID & Structured Logging Middleware
# EXPORT-EASE-BACKEND-V1
# ============================================================

import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.utils.validators import generate_uuid

logger = logging.getLogger("exportease.access")

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", generate_uuid())
        request.state.request_id = request_id
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(process_time)
            
            logger.info(
                f"req_id={request_id} method={request.method} path={request.url.path} "
                f"status={response.status_code} duration={process_time:.2f}ms"
            )
            return response
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"req_id={request_id} method={request.method} path={request.url.path} "
                f"status=500 duration={process_time:.2f}ms error=\"{str(e)}\""
            )
            raise
