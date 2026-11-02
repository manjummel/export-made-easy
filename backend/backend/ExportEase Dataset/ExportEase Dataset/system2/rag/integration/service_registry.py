"""
service_registry.py — ExportEase Service Registry

Maintains a runtime registry of all known services in the ExportEase platform:
  - System 1 (LLM + Multi-Agent)   — consumer of this service
  - System 3 (Backend)              — consumer of this service
  - Qdrant                          — internal, owned by System 2 only

Each registry entry tracks:
  - name, base_url, health_path, api_version
  - last_known_status: ok | error | pending | unknown
  - last_checked: datetime

The registry is used by:
  - ConnectivityChecker (/ready endpoint)
  - Logging/observability
  - Future: service-mesh style circuit breaker
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class ServiceStatus(str, Enum):
    OK = "ok"
    ERROR = "error"
    PENDING = "pending"      # Not yet checked
    UNKNOWN = "unknown"      # Check attempted but no clear result
    NOT_CONFIGURED = "not_configured"


@dataclass
class ServiceEntry:
    name: str
    base_url: str
    health_path: str = "/health"
    api_version: str = "v1"
    required: bool = False          # If True, /ready returns 503 if this is down
    status: ServiceStatus = ServiceStatus.PENDING
    last_checked: Optional[datetime] = None
    last_error: Optional[str] = None
    metadata: Dict = field(default_factory=dict)

    def mark_ok(self) -> None:
        self.status = ServiceStatus.OK
        self.last_checked = datetime.now(timezone.utc)
        self.last_error = None

    def mark_error(self, error: str) -> None:
        self.status = ServiceStatus.ERROR
        self.last_checked = datetime.now(timezone.utc)
        self.last_error = error

    def mark_pending(self) -> None:
        self.status = ServiceStatus.PENDING

    @property
    def health_url(self) -> str:
        return f"{self.base_url.rstrip('/')}{self.health_path}"

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "base_url": self.base_url,
            "health_url": self.health_url,
            "api_version": self.api_version,
            "required": self.required,
            "status": self.status.value,
            "last_checked": self.last_checked.isoformat() if self.last_checked else None,
            "last_error": self.last_error,
        }


class ServiceRegistry:
    """
    Singleton-style registry for all ExportEase platform services.

    Usage:
        registry = ServiceRegistry.from_env()
        registry.register_service(ServiceEntry(name="custom", base_url="http://..."))
        entry = registry.get_service("system1")
        all_services = registry.list_services()
    """

    _instance: Optional["ServiceRegistry"] = None

    def __init__(self) -> None:
        self._services: Dict[str, ServiceEntry] = {}

    # ── Factory ───────────────────────────────────────────────────────────────

    @classmethod
    def from_env(cls) -> "ServiceRegistry":
        """Build registry from environment variables."""
        registry = cls()

        # System 1 — LLM + Multi-Agent (consumer)
        system1_url = os.environ.get("SYSTEM1_BASE_URL", "http://system1:8000")
        system1_required = os.environ.get("SYSTEM1_REQUIRED", "false").lower() == "true"
        registry.register_service(
            ServiceEntry(
                name="system1",
                base_url=system1_url,
                health_path=os.environ.get("SYSTEM1_HEALTH_PATH", "/health"),
                api_version=os.environ.get("SYSTEM1_API_VERSION", "v1"),
                required=system1_required,
                metadata={"role": "llm_agent", "is_consumer": True},
            )
        )

        # System 3 — Backend (consumer)
        system3_url = os.environ.get("SYSTEM3_BASE_URL", "http://system3:8200")
        system3_required = os.environ.get("SYSTEM3_REQUIRED", "false").lower() == "true"
        registry.register_service(
            ServiceEntry(
                name="system3",
                base_url=system3_url,
                health_path=os.environ.get("SYSTEM3_HEALTH_PATH", "/health"),
                api_version=os.environ.get("SYSTEM3_API_VERSION", "v1"),
                required=system3_required,
                metadata={"role": "backend", "is_consumer": True},
            )
        )

        # Qdrant — Internal vector DB (required)
        qdrant_url = os.environ.get("QDRANT_URL", "http://localhost:6333")
        registry.register_service(
            ServiceEntry(
                name="qdrant",
                base_url=qdrant_url,
                health_path="/healthz",
                required=True,      # System 2 CANNOT be ready without Qdrant
                metadata={"role": "vector_db", "internal": True},
            )
        )

        logger.info(
            "Service registry initialized with %d services", len(registry._services)
        )
        return registry

    @classmethod
    def get_instance(cls) -> "ServiceRegistry":
        """Return the process-level singleton, creating from env if needed."""
        if cls._instance is None:
            cls._instance = cls.from_env()
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Reset singleton (useful for tests)."""
        cls._instance = None

    # ── CRUD ──────────────────────────────────────────────────────────────────

    def register_service(self, entry: ServiceEntry) -> None:
        """Register or update a service entry."""
        self._services[entry.name] = entry
        logger.debug("Registered service: %s @ %s", entry.name, entry.base_url)

    def deregister_service(self, name: str) -> bool:
        """Remove a service from the registry. Returns True if found."""
        if name in self._services:
            del self._services[name]
            logger.info("Deregistered service: %s", name)
            return True
        return False

    def get_service(self, name: str) -> Optional[ServiceEntry]:
        """Return a service entry by name, or None."""
        return self._services.get(name)

    def list_services(self) -> List[ServiceEntry]:
        """Return all registered service entries."""
        return list(self._services.values())

    def update_status(self, name: str, status: ServiceStatus, error: str | None = None) -> None:
        """Update the status of a named service."""
        entry = self._services.get(name)
        if entry is None:
            logger.warning("Tried to update status for unknown service: %s", name)
            return
        if status == ServiceStatus.OK:
            entry.mark_ok()
        elif status == ServiceStatus.ERROR:
            entry.mark_error(error or "Unknown error")
        else:
            entry.status = status

    def get_service_status(self, name: str) -> ServiceStatus:
        """Return just the status for a named service."""
        entry = self._services.get(name)
        if entry is None:
            return ServiceStatus.UNKNOWN
        return entry.status

    def all_required_services_ok(self) -> bool:
        """
        Returns True only if every service with required=True has status=OK.
        Used by the /ready endpoint.
        """
        for entry in self._services.values():
            if entry.required and entry.status != ServiceStatus.OK:
                logger.debug(
                    "Required service not ready: %s (status=%s)",
                    entry.name, entry.status.value
                )
                return False
        return True

    def to_dict(self) -> dict:
        return {
            name: entry.to_dict()
            for name, entry in self._services.items()
        }

    def summary(self) -> dict:
        """Compact status summary used by /ready response."""
        return {
            name: entry.status.value
            for name, entry in self._services.items()
        }
