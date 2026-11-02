# ============================================================
# ExportEase AI - AI Service Client (System 1)
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Real HTTP client for System 1 (AI Engine).
System 3 MUST communicate with System 1 only through its versioned AI API.
Never hard-code a device IP inside application source code.
"""

from __future__ import annotations

import logging
from typing import Any

from app.clients.base_client import BaseServiceClient

logger = logging.getLogger(__name__)


class AIServiceClient(BaseServiceClient):
    """Client for the AI Engine (System 1)."""

    def __init__(self, base_url: str, timeout: int = 120, api_version: str = "v1"):
        super().__init__(
            base_url=base_url,
            timeout=timeout,
            api_version=api_version,
            service_name="AI Engine (System 1)",
        )
        self.api_prefix = f"/api/{api_version}"

    async def classify_hs(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """POST /api/v1/ai/classify — HS code classification."""
        return await self._post(f"{self.api_prefix}/ai/classify", request_data)

    async def analyze_compliance(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """POST /api/v1/ai/compliance — Compliance analysis."""
        return await self._post(f"{self.api_prefix}/ai/compliance", request_data)

    async def analyze_documents(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """POST /api/v1/ai/documents — Document requirements analysis."""
        return await self._post(f"{self.api_prefix}/ai/documents", request_data)

    async def analyze_certifications(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """POST /api/v1/ai/certifications — Certification analysis."""
        return await self._post(f"{self.api_prefix}/ai/certifications", request_data)

    async def analyze_market(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """POST /api/v1/ai/market — Market intelligence."""
        return await self._post(f"{self.api_prefix}/ai/market", request_data)

    async def analyze_risk(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """POST /api/v1/ai/risk — Risk assessment."""
        return await self._post(f"{self.api_prefix}/ai/risk", request_data)

    async def generate_export_plan(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """POST /api/v1/ai/export-plan — Export plan generation."""
        return await self._post(f"{self.api_prefix}/ai/export-plan", request_data)

    async def general_analysis(self, request_data: dict[str, Any]) -> dict[str, Any]:
        """POST /api/v1/ai/analyze — General AI analysis."""
        return await self._post(f"{self.api_prefix}/ai/analyze", request_data)
