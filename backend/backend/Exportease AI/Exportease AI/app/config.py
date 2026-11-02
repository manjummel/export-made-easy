# ============================================================
# ExportEase AI - System 3 Backend Configuration Module
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Centralized configuration using pydantic-settings.
All external service URLs, database connections, and feature flags
are loaded from environment variables. Never hard-code device IPs.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, SecretStr


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Service Identity ──────────────────────────────────────
    APP_NAME: str = "ExportEase AI Backend"
    APP_VERSION: str = "1.0.0"
    SYSTEM_ID: str = "EXPORT-EASE-BACKEND-V1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ── Server ────────────────────────────────────────────────
    BACKEND_SERVICE_PORT: int = 8000
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PUBLIC_URL: str = "http://localhost:8000"

    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://exportease:exportease_dev@localhost:5432/exportease_db"
    DATABASE_SYNC_URL: str = "postgresql+psycopg2://exportease:exportease_dev@localhost:5432/exportease_db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # ── Authentication ────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-this-to-a-secure-random-string-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── System 1: AI Engine ───────────────────────────────────
    AI_SERVICE_URL: str = "http://localhost:8001"
    AI_SERVICE_TIMEOUT: int = 120
    AI_SERVICE_API_VERSION: str = "v1"

    # ── System 2: Knowledge / RAG ─────────────────────────────
    KNOWLEDGE_SERVICE_URL: str = "http://localhost:8100"
    KNOWLEDGE_SERVICE_TIMEOUT: int = 60
    KNOWLEDGE_SERVICE_API_VERSION: str = "v1"
    KNOWLEDGE_API_KEY: str = "changeme-replace-in-production"

    # ── Service Mode ──────────────────────────────────────────
    REAL_SERVICES: bool = False
    MOCK_SERVICES: bool = True

    # ── Shared Contracts ──────────────────────────────────────
    EXPORTEASE_CONTRACTS_PATH: Optional[str] = None
    EXPORTEASE_CONTRACTS_GIT_URL: Optional[str] = None

    # ── CORS ──────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    CORS_ALLOW_CREDENTIALS: bool = True

    # ── Logging ───────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # ── Rate Limiting ─────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 60

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def use_mock_services(self) -> bool:
        """Determine if mock adapters should be used."""
        return self.MOCK_SERVICES or not self.REAL_SERVICES


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
