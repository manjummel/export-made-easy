"""
ai_engine/version.py

Independent version registry for all SYSTEM 1 components.
Each component is versioned separately to allow independent upgrades.

Exposed via GET /api/v1/version and GET /version.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, Optional


@dataclass
class VersionMetadata:
    """Complete version metadata for the AI Engine."""

    # System
    system_id: str = "EXPORT-EASE-AI-ENGINE-V1"
    system_name: str = "ExportEase AI Intelligence Engine"
    system_version: str = "0.1.0"

    # API contract version (NEVER change without updating contracts/VERSION)
    api_version: str = "v1"
    contract_version: str = "v1.0.0"

    # Model versions
    model_name: str = "Qwen/Qwen2.5-1.5B-Instruct"
    model_version: str = "qwen2.5-1.5b-instruct"
    model_family: str = "qwen2.5"

    # QLoRA adapter (updated after fine-tuning)
    adapter_version: str = "none"
    adapter_path: Optional[str] = None

    # Tokenizer (based on Qwen2.5 — NOT trained from scratch)
    tokenizer_version: str = "qwen2.5-base"
    tokenizer_extended: bool = False  # True if vocabulary was extended

    # Prompt templates
    prompt_version: str = "v1"

    # Agent schemas
    agent_schema_version: str = "v1"

    # Dataset (updated when fine-tuning data is prepared)
    dataset_version: str = "none"

    # Build info
    build_timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> Dict:
        return {
            "system": {
                "id": self.system_id,
                "name": self.system_name,
                "version": self.system_version,
            },
            "api": {
                "version": self.api_version,
                "contract_version": self.contract_version,
            },
            "model": {
                "name": self.model_name,
                "version": self.model_version,
                "family": self.model_family,
            },
            "adapter": {
                "version": self.adapter_version,
                "path": self.adapter_path,
            },
            "tokenizer": {
                "version": self.tokenizer_version,
                "extended": self.tokenizer_extended,
            },
            "prompts": {
                "version": self.prompt_version,
            },
            "agents": {
                "schema_version": self.agent_schema_version,
                "agents": [
                    "product_agent",
                    "hs_agent",
                    "compliance_agent",
                    "document_agent",
                    "certification_agent",
                    "market_agent",
                    "risk_agent",
                    "planner_agent",
                ],
            },
            "dataset": {
                "version": self.dataset_version,
            },
            "build": {
                "timestamp": self.build_timestamp,
            },
        }


# Singleton — updated at runtime when adapter is loaded
VERSION = VersionMetadata()


def update_adapter_version(version: str, path: Optional[str] = None) -> None:
    """Called by model/loader.py after a QLoRA adapter is successfully loaded."""
    VERSION.adapter_version = version
    VERSION.adapter_path = path


def update_tokenizer_extended(extended: bool) -> None:
    """Called by model/tokenizer.py if vocabulary extension occurs."""
    VERSION.tokenizer_extended = extended
