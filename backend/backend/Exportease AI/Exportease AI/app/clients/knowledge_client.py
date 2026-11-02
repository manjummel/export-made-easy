# ============================================================
# ExportEase AI - Knowledge Service Client (System 2)
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Real HTTP client for System 2 (Knowledge / RAG).
System 3 normally must not access Qdrant directly.
For evidence/source operations, communicate through the Knowledge API.
Never import Qdrant implementation details into this backend.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from app.clients.base_client import BaseServiceClient

logger = logging.getLogger(__name__)


class KnowledgeServiceClient(BaseServiceClient):
    """Client for the Knowledge/RAG system (System 2)."""

    def __init__(self, base_url: str, timeout: int = 60, api_version: str = "v1", api_key: Optional[str] = None):
        super().__init__(
            base_url=base_url,
            timeout=timeout,
            api_version=api_version,
            service_name="Knowledge Service (System 2)",
            api_key=api_key,
        )
        self.api_prefix = f"/{api_version}"

    async def check_connectivity(self) -> bool:
        """Verify connection to System 2."""
        try:
            res = await self.health_check()
            return res.get("status") == "healthy"
        except Exception:
            return False

    async def search_sources(
        self,
        query: str,
        project_id: Optional[str] = None,
        filters: Optional[dict[str, Any]] = None,
        top_k: int = 10,
    ) -> dict[str, Any]:
        """Search the knowledge base for relevant sources."""
        return await self._post(
            f"{self.api_prefix}/knowledge/search",
            {
                "query": query,
                "filters": filters or {},
                "top_k": top_k,
            },
        )

    async def hybrid_retrieve(
        self,
        query: str,
        filters: Optional[dict[str, Any]] = None,
        top_k: int = 10,
    ) -> dict[str, Any]:
        """Explicit dense + sparse hybrid retrieval."""
        return await self._post(
            f"{self.api_prefix}/knowledge/retrieve/hybrid",
            {
                "query": query,
                "filters": filters or {},
                "top_k": top_k,
            },
        )

    async def get_confidence(self, query: str, results: list[dict[str, Any]]) -> dict[str, Any]:
        """Retrieve confidence evaluation from System 2."""
        return await self._post(
            f"{self.api_prefix}/knowledge/confidence",
            {
                "query": query,
                "results": results,
            },
        )

    async def get_evidence(self, chunk_id: str) -> dict[str, Any]:
        """Retrieve raw provenance evidence by chunk ID."""
        return await self._get(f"{self.api_prefix}/evidence/{chunk_id}")

    async def get_citations(self, chunk_ids: list[str]) -> dict[str, Any]:
        """Retrieve citation details for given chunk IDs."""
        return await self._post(
            f"{self.api_prefix}/citations",
            {"chunk_ids": chunk_ids},
        )

    async def get_source(self, source_id: str) -> dict[str, Any]:
        """Retrieve a specific source metadata by ID."""
        return await self._get(f"{self.api_prefix}/sources/{source_id}")

