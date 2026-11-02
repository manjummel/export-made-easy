"""
test_connectivity.py — Integration tests for service registry and connectivity checker
"""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from rag.integration.service_registry import ServiceEntry, ServiceRegistry, ServiceStatus
from rag.integration.connectivity import ConnectivityChecker, ConnectivityResult


class TestServiceRegistry:
    """Tests for the ServiceRegistry class."""

    def setup_method(self):
        """Reset singleton before each test."""
        ServiceRegistry.reset_instance()

    def test_register_service(self):
        registry = ServiceRegistry()
        entry = ServiceEntry(name="test_svc", base_url="http://test:8080")
        registry.register_service(entry)
        found = registry.get_service("test_svc")
        assert found is not None
        assert found.base_url == "http://test:8080"

    def test_deregister_service(self):
        registry = ServiceRegistry()
        registry.register_service(ServiceEntry(name="tmp", base_url="http://tmp:1234"))
        result = registry.deregister_service("tmp")
        assert result is True
        assert registry.get_service("tmp") is None

    def test_deregister_nonexistent_returns_false(self):
        registry = ServiceRegistry()
        result = registry.deregister_service("nonexistent")
        assert result is False

    def test_list_services(self):
        registry = ServiceRegistry()
        registry.register_service(ServiceEntry(name="s1", base_url="http://s1:80"))
        registry.register_service(ServiceEntry(name="s2", base_url="http://s2:80"))
        services = registry.list_services()
        names = [s.name for s in services]
        assert "s1" in names
        assert "s2" in names

    def test_required_service_blocks_readiness(self):
        registry = ServiceRegistry()
        registry.register_service(ServiceEntry(
            name="required_svc",
            base_url="http://required:80",
            required=True,
            status=ServiceStatus.ERROR,
        ))
        assert registry.all_required_services_ok() is False

    def test_optional_service_does_not_block_readiness(self):
        registry = ServiceRegistry()
        registry.register_service(ServiceEntry(
            name="required_svc",
            base_url="http://required:80",
            required=True,
            status=ServiceStatus.OK,
        ))
        registry.register_service(ServiceEntry(
            name="optional_svc",
            base_url="http://optional:80",
            required=False,
            status=ServiceStatus.ERROR,
        ))
        assert registry.all_required_services_ok() is True

    def test_update_status_mark_ok(self):
        registry = ServiceRegistry()
        registry.register_service(ServiceEntry(name="svc", base_url="http://svc:80", required=True))
        registry.update_status("svc", ServiceStatus.OK)
        assert registry.get_service_status("svc") == ServiceStatus.OK

    def test_from_env_creates_required_services(self):
        with patch.dict("os.environ", {
            "SYSTEM1_BASE_URL": "http://system1:8000",
            "SYSTEM3_BASE_URL": "http://system3:8200",
            "QDRANT_HOST": "localhost",
            "QDRANT_PORT": "6333",
        }):
            registry = ServiceRegistry.from_env()
        names = [s.name for s in registry.list_services()]
        assert "system1" in names
        assert "system3" in names
        assert "qdrant" in names
        # Qdrant must be required
        qdrant = registry.get_service("qdrant")
        assert qdrant.required is True


class TestConnectivityChecker:
    """Tests for the ConnectivityChecker (uses mocked HTTP)."""

    def setup_method(self):
        ServiceRegistry.reset_instance()

    @pytest.mark.asyncio
    async def test_check_reachable_service(self):
        registry = ServiceRegistry()
        registry.register_service(ServiceEntry(
            name="healthy_svc", base_url="http://healthy:80", required=True
        ))
        checker = ConnectivityChecker(registry)

        mock_response = MagicMock()
        mock_response.status_code = 200

        with patch("rag.integration.connectivity.httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            mock_client.get = AsyncMock(return_value=mock_response)
            mock_client_class.return_value = mock_client

            results = await checker.check_all(force=True)

        assert "healthy_svc" in results
        assert results["healthy_svc"].reachable is True

    @pytest.mark.asyncio
    async def test_check_unreachable_service(self):
        import httpx
        registry = ServiceRegistry()
        registry.register_service(ServiceEntry(
            name="dead_svc", base_url="http://dead:80", required=False
        ))
        checker = ConnectivityChecker(registry)

        with patch("rag.integration.connectivity.httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=None)
            mock_client.get = AsyncMock(side_effect=httpx.ConnectError("refused"))
            mock_client_class.return_value = mock_client

            results = await checker.check_all(force=True)

        assert results["dead_svc"].reachable is False
        assert "Connection refused" in (results["dead_svc"].error or "")

    @pytest.mark.asyncio
    async def test_is_ready_when_required_services_ok(self):
        registry = ServiceRegistry()
        registry.register_service(ServiceEntry(
            name="qdrant", base_url="http://qdrant:6333",
            health_path="/healthz", required=True, status=ServiceStatus.OK
        ))
        checker = ConnectivityChecker(registry)
        assert checker.is_ready() is True

    @pytest.mark.asyncio
    async def test_readiness_summary_structure(self):
        registry = ServiceRegistry()
        registry.register_service(ServiceEntry(
            name="qdrant", base_url="http://qdrant:6333",
            health_path="/healthz", required=True, status=ServiceStatus.OK
        ))
        checker = ConnectivityChecker(registry)
        summary = checker.get_readiness_summary()
        assert "status" in summary
        assert "checks" in summary
        assert "message" in summary
        assert summary["status"] in ("ready", "not_ready")
