"""
config.py — Application configuration for EXPORT-EASE-KNOWLEDGE-V1

Uses pydantic-settings to load from environment variables / .env file.
All configuration is type-safe and validated at startup.
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import List, Literal, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Service Identity ──────────────────────────────────────────────────────
    service_name: str = Field("export-ease-knowledge-v1", alias="SERVICE_NAME")
    service_version: str = Field("1.0.0", alias="SERVICE_VERSION")
    knowledge_api_version: str = Field("v1", alias="KNOWLEDGE_API_VERSION")
    dataset_version: str = Field("1.0.0", alias="DATASET_VERSION")
    environment: str = Field("development", alias="ENVIRONMENT")
    debug: bool = Field(False, alias="DEBUG")

    # ── Network ───────────────────────────────────────────────────────────────
    knowledge_service_port: int = Field(8100, alias="KNOWLEDGE_SERVICE_PORT")
    knowledge_service_host: str = Field("0.0.0.0", alias="KNOWLEDGE_SERVICE_HOST")

    # ── Contracts ─────────────────────────────────────────────────────────────
    exportease_contracts_path: str = Field("/app/contracts", alias="EXPORTEASE_CONTRACTS_PATH")
    exportease_contracts_git_url: str = Field("", alias="EXPORTEASE_CONTRACTS_GIT_URL")
    exportease_contracts_git_branch: str = Field("main", alias="EXPORTEASE_CONTRACTS_GIT_BRANCH")

    # ── Qdrant (Internal — never expose externally) ───────────────────────────
    qdrant_url: str = Field("http://localhost:6333", alias="QDRANT_URL")
    qdrant_grpc_port: int = Field(6334, alias="QDRANT_GRPC_PORT")
    qdrant_api_key: Optional[str] = Field(None, alias="QDRANT_API_KEY")
    qdrant_collection_name: str = Field("exportease_knowledge", alias="QDRANT_COLLECTION_NAME")
    qdrant_vector_size: int = Field(384, alias="QDRANT_VECTOR_SIZE")

    # ── Embeddings ────────────────────────────────────────────────────────────
    embedding_provider: Literal["sentence_transformers", "openai"] = Field(
        "sentence_transformers", alias="EMBEDDING_PROVIDER"
    )
    embedding_model: str = Field("all-MiniLM-L6-v2", alias="EMBEDDING_MODEL")
    openai_api_key: Optional[str] = Field(None, alias="OPENAI_API_KEY")

    # ── Chunking ──────────────────────────────────────────────────────────────
    chunk_size: int = Field(512, alias="CHUNK_SIZE")
    chunk_overlap: int = Field(64, alias="CHUNK_OVERLAP")

    # ── Retrieval ─────────────────────────────────────────────────────────────
    retrieval_top_k: int = Field(5, alias="RETRIEVAL_TOP_K")
    retrieval_score_threshold: float = Field(0.60, alias="RETRIEVAL_SCORE_THRESHOLD")
    retrieval_mode: Literal["dense", "sparse", "hybrid"] = Field(
        "hybrid", alias="RETRIEVAL_MODE"
    )
    retrieval_version: str = Field("1.0.0", alias="RETRIEVAL_VERSION")
    reranker_version: str = Field("none", alias="RERANKER_VERSION")

    # ── Auth ──────────────────────────────────────────────────────────────────
    api_key_secret: str = Field("changeme-replace-in-production", alias="API_KEY_SECRET")
    allowed_api_keys: List[str] = Field(default_factory=list, alias="ALLOWED_API_KEYS")

    # ── System 1 ──────────────────────────────────────────────────────────────
    system1_base_url: str = Field("http://system1:8000", alias="SYSTEM1_BASE_URL")
    system1_health_path: str = Field("/health", alias="SYSTEM1_HEALTH_PATH")
    system1_api_version: str = Field("v1", alias="SYSTEM1_API_VERSION")
    system1_required: bool = Field(False, alias="SYSTEM1_REQUIRED")

    # ── System 3 ──────────────────────────────────────────────────────────────
    system3_base_url: str = Field("http://system3:8200", alias="SYSTEM3_BASE_URL")
    system3_health_path: str = Field("/health", alias="SYSTEM3_HEALTH_PATH")
    system3_api_version: str = Field("v1", alias="SYSTEM3_API_VERSION")
    system3_required: bool = Field(False, alias="SYSTEM3_REQUIRED")

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: Optional[str] = Field(None, alias="DATABASE_URL")

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = Field("INFO", alias="LOG_LEVEL")
    log_format: Literal["json", "text"] = Field("json", alias="LOG_FORMAT")

    # ── Computed ──────────────────────────────────────────────────────────────
    @field_validator("allowed_api_keys", mode="before")
    @classmethod
    def parse_api_keys(cls, v):
        if isinstance(v, str):
            return [k.strip() for k in v.split(",") if k.strip()]
        return v or []

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def effective_api_keys(self) -> List[str]:
        """All valid API keys (allowed_api_keys + api_key_secret as fallback)."""
        keys = list(self.allowed_api_keys)
        if self.api_key_secret and self.api_key_secret not in keys:
            keys.append(self.api_key_secret)
        return keys


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the application settings singleton."""
    return Settings()
