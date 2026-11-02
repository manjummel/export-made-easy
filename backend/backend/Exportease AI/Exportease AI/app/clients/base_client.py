# ============================================================
# ExportEase AI - Base HTTP Client
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Base async HTTP client with retry logic, timeouts, and health checking.
All external service clients inherit from this.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


class BaseServiceClient:
    """Base client for communicating with external services."""

    def __init__(
        self,
        base_url: str,
        timeout: int = 60,
        api_version: str = "v1",
        service_name: str = "external",
        api_key: Optional[str] = None,
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.api_version = api_version
        self.service_name = service_name
        self.api_key = api_key
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["X-API-Key"] = self.api_key
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=httpx.Timeout(self.timeout),
                headers=headers,
            )
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def health_check(self) -> dict[str, str]:
        """Check if the external service is healthy."""
        try:
            client = await self._get_client()
            response = await client.get("/health")
            if response.status_code == 200:
                return {"status": "healthy", "service": self.service_name}
            return {
                "status": "unhealthy",
                "service": self.service_name,
                "code": str(response.status_code),
            }
        except Exception as e:
            return {
                "status": "unavailable",
                "service": self.service_name,
                "error": str(e),
            }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    async def _post(
        self,
        path: str,
        data: dict[str, Any],
        headers: Optional[dict[str, str]] = None,
    ) -> dict[str, Any]:
        """POST request with retry logic."""
        client = await self._get_client()
        try:
            response = await client.post(path, json=data, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(
                f"[{self.service_name}] HTTP {e.response.status_code} on POST {path}: "
                f"{e.response.text}"
            )
            raise
        except httpx.ConnectError as e:
            logger.warning(
                f"[{self.service_name}] Connection failed for {path}: {e}. "
                f"Service at {self.base_url} may be unavailable."
            )
            raise

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    async def _get(
        self,
        path: str,
        params: Optional[dict[str, Any]] = None,
        headers: Optional[dict[str, str]] = None,
    ) -> dict[str, Any]:
        """GET request with retry logic."""
        client = await self._get_client()
        try:
            response = await client.get(path, params=params, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(
                f"[{self.service_name}] HTTP {e.response.status_code} on GET {path}: "
                f"{e.response.text}"
            )
            raise
        except httpx.ConnectError as e:
            logger.warning(
                f"[{self.service_name}] Connection failed for {path}: {e}. "
                f"Service at {self.base_url} may be unavailable."
            )
            raise
