# ============================================================
# ExportEase AI - Domain Exceptions (Extended for 3.19)
# EXPORT-EASE-BACKEND-V1
# ============================================================
from fastapi import HTTPException, status

class ExportEaseException(Exception):
    """Base exception for all ExportEase domain errors."""
    pass

class AuthenticationError(HTTPException):
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class AuthorizationError(HTTPException):
    def __init__(self, detail: str = "Not authorized to access this resource"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class ResourceNotFoundError(HTTPException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")

class ValidationError(HTTPException):
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class ServiceUnavailableError(HTTPException):
    def __init__(self, service: str):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"External Service Unavailable: {service}")

class AIServiceError(HTTPException):
    def __init__(self, detail: str = "AI service returned an unexpected response"):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)

class RAGServiceError(HTTPException):
    def __init__(self, detail: str = "Knowledge retrieval service unavailable"):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)

class RequestTimeoutError(HTTPException):
    def __init__(self, service: str = "upstream service"):
        super().__init__(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=f"Request to {service} timed out")

class WebSocketError(ExportEaseException):
    def __init__(self, detail: str = "WebSocket communication error"):
        self.detail = detail
        super().__init__(detail)

class LowConfidenceError(HTTPException):
    def __init__(self, confidence: float, threshold: float = 0.5):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Result confidence {confidence:.2f} is below acceptable threshold {threshold:.2f}"
        )

class InsufficientEvidenceError(HTTPException):
    def __init__(self, detail: str = "Insufficient evidence to support this result"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)

class DatabaseError(HTTPException):
    def __init__(self, detail: str = "A database error occurred"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)
