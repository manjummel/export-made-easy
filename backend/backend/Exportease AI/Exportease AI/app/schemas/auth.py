# ============================================================
# ExportEase AI - Auth Schemas
# EXPORT-EASE-BACKEND-V1
# ============================================================

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.utils.validators import validate_email


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    phone: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        if not validate_email(v):
            raise ValueError("Invalid email format")
        return v.lower().strip()


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenPayload(BaseModel):
    user_id: str
    email: str
    role: str
    exp: int
    type: str = "access"
