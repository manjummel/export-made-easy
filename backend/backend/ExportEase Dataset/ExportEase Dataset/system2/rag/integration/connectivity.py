"""
connectivity.py — ExportEase Inter-System Connectivity Checker

Validates that System 2 can reach all registered services:

  REQUIRED (blocks /ready):
    - Qdrant vector database

  NON-BLOCKING (informational only):
    - System 1 (LLM + Multi-Agent) — may not be deployed yet
    - System 3 (Backend) — may not be deployed yet

Design principles:
  - Graceful degradation: System 2 starts and serves requests even when
    System 1 and System 3 are unreachable (they are consumers, not dependencies).
  - Qdrant is the only hard dependency for System 2 to be "ready".
  - All checks are async to avoid blocking the event loop.
  - Results are cached for CACHE_TTL_SECONDS to prevent hammering downstream.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Dict, Optional

import httpx

from rag.integration.service_registry import ServiceRegistry, ServiceStatus

logger = logging.getLogger(__name__)

# How long (seconds) to cache a successful check result
CACHE_TTL_SECONDS = 30
# HTTP timeout for health checks
HEALTH_CHECK_TIMEOUT = 5.0


class ConnectivityResult:
    """Result of a single service connectivity check."""

    def __init__(
        self,
        service_name: str,
        reachable: bool,
        status_code: Optional[int] = None,
        response_ms: Optional[float] = None,
        error: Optional[str] = None,
    ) -> None:
        self.service_name = service_name
        self.reachable = reachable
        self.status_code = status_code
        self.response_ms = response_ms
        self.error = error

    def to_dict(self) -> dict:
        return {
            "service": self.service_name,
            "reachable": self.reachable,
            "status_code": self.status_code,
            "response_ms": self.response_ms,
            "error": self.error,
        }


class ConnectivityChecker:
    """
    Async connectivity checker for all registered ExportEase services.

    Usage:
        checker = ConnectivityChecker(registry)
        results = await checker.check_all()
        ready = checker.is_ready()

    Integrates with ServiceRegistry to update per-service status fields.
    """

    def __init__(self, registry: Optional[ServiceRegistry] = None) -> None:
        self._registry = registry or ServiceRegistry.get_instance()
        self._last_check_time: Dict[str, float] = {}
        self._cached_results: Dict[str, ConnectivityResult] = {}

    # ── Public API ────────────────────────────────────────────────────────────

    async def check_all(self, force: bool = False) -> Dict[str, ConnectivityResult]:
        """
        Check connectivity to all registered services concurrently.

        Args:
            force: If True, bypass the TTL cache and re-check all services.

        Returns:
            Dict mapping service_name → ConnectivityResult
        """
        services = self._registry.list_services()
        tasks = [
            self._check_service_cached(entry.name, entry.health_url, force=force)
            for entry in services
        ]
        results_list = await asyncio.gather(*tasks, return_exceptions=True)

        results: Dict[str, ConnectivityResult] = {}
        for entry, result in zip(services, results_list):
            if isinstance(result, Exception):
                cr = ConnectivityResult(
                    service_name=entry.name,
                    reachable=False,
                    error=str(result),
                )
            else:
                cr = result  # type: ignore[assignment]

            results[entry.name] = cr
            # Update registry status
            if cr.reachable:
                self._registry.update_status(entry.name, ServiceStatus.OK)
            else:
                self._registry.update_status(
                    entry.name, ServiceStatus.ERROR, cr.error
                )

        return results

    async def check_service(self, name: str, force: bool = False) -> ConnectivityResult:
        """Check connectivity to a single named service."""
        entry = self._registry.get_service(name)
        if entry is None:
            return ConnectivityResult(
                service_name=name,
                reachable=False,
                error=f"Service '{name}' not registered",
            )
        return await self._check_service_cached(name, entry.health_url, force=force)

    def is_ready(self) -> bool:
        """
        Returns True if all REQUIRED services are reachable.
        Non-required services (System 1, System 3) do not affect readiness.
        """
        return self._registry.all_required_services_ok()

    def get_readiness_summary(self) -> Dict[str, Any]:
        """
        Return a summary dict suitable for the /ready response body.
        """
        summary = self._registry.summary()
        ready = self._registry.all_required_services_ok()
        message = "All required services reachable" if ready else "One or more required services unreachable"
        return {
            "status": "ready" if ready else "not_ready",
            "checks": summary,
            "message": message,
        }

    # ── Private ───────────────────────────────────────────────────────────────

    async def _check_service_cached(
        self, name: str, url: str, force: bool = False
    ) -> ConnectivityResult:
        now = time.monotonic()
        last = self._last_check_time.get(name, 0)
        if not force and (now - last) < CACHE_TTL_SECONDS and name in self._cached_results:
            logger.debug("Returning cached connectivity result for %s", name)
            return self._cached_results[name]

        result = await self._check_service_live(name, url)
        self._cached_results[name] = result
        self._last_check_time[name] = now
        return result

    async def _check_service_live(self, name: str, url: str) -> ConnectivityResult:
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=HEALTH_CHECK_TIMEOUT) as client:
                response = await client.get(url)
            elapsed_ms = (time.monotonic() - start) * 1000
            reachable = 200 <= response.status_code < 300
            logger.debug(
                "Health check %s → %s %dms",
                url, response.status_code, elapsed_ms
            )
            return ConnectivityResult(
                service_name=name,
                reachable=reachable,
                status_code=response.status_code,
                response_ms=round(elapsed_ms, 2),
                error=None if reachable else f"HTTP {response.status_code}",
            )
        except httpx.ConnectError as exc:
            elapsed_ms = (time.monotonic() - start) * 1000
            logger.warning("Service %s unreachable: %s", name, exc)
            return ConnectivityResult(
                service_name=name,
                reachable=False,
                response_ms=round(elapsed_ms, 2),
                error=f"Connection refused: {exc}",
            )
        except httpx.TimeoutException:
            elapsed_ms = (time.monotonic() - start) * 1000
            logger.warning("Service %s timed out after %.0fms", name, elapsed_ms)
            return ConnectivityResult(
                service_name=name,
                reachable=False,
                response_ms=round(elapsed_ms, 2),
                error=f"Timeout after {HEALTH_CHECK_TIMEOUT}s",
            )
        except Exception as exc:
            elapsed_ms = (time.monotonic() - start) * 1000
            logger.error("Unexpected error checking %s: %s", name, exc)
            return ConnectivityResult(
                service_name=name,
                reachable=False,
                response_ms=round(elapsed_ms, 2),
                error=str(exc),
            )


# ── Module-level convenience ──────────────────────────────────────────────────
_checker_instance: Optional[ConnectivityChecker] = None


def get_connectivity_checker() -> ConnectivityChecker:
    """Return the process-level singleton ConnectivityChecker."""
    global _checker_instance
    if _checker_instance is None:
        _checker_instance = ConnectivityChecker()
    return _checker_instance
