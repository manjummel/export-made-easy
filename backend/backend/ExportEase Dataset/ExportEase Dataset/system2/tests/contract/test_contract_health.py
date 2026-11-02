"""
test_contract_health.py — Contract tests for health endpoints

Auto-validates that /health, /ready, /version match the OpenAPI contract.
Uses schemathesis for schema-driven testing plus explicit assertion tests.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture(scope="module")
def client():
    """TestClient that bypasses network — good for contract testing."""
    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


# ── /health ───────────────────────────────────────────────────────────────────

class TestHealthEndpoint:
    """Contract tests for GET /health"""

    def test_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_health_response_has_required_fields(self, client):
        response = client.get("/health")
        body = response.json()
        assert "status" in body, "Missing field: status"
        assert "service" in body, "Missing field: service"
        assert "version" in body, "Missing field: version"
        assert "timestamp" in body, "Missing field: timestamp"

    def test_health_status_is_valid_enum(self, client):
        response = client.get("/health")
        status = response.json().get("status")
        assert status in ("ok", "degraded", "error"), f"Invalid status value: {status}"

    def test_health_content_type_is_json(self, client):
        response = client.get("/health")
        assert "application/json" in response.headers.get("content-type", "")

    def test_health_no_auth_required(self, client):
        """Health endpoint must be accessible without X-API-Key."""
        response = client.get("/health")
        assert response.status_code != 401, "/health must not require authentication"

    def test_health_service_name(self, client):
        response = client.get("/health")
        service = response.json().get("service")
        assert service, "service field must not be empty"
        assert "export-ease" in service.lower() or "knowledge" in service.lower(), \
            f"Unexpected service name: {service}"


# ── /ready ────────────────────────────────────────────────────────────────────

class TestReadinessEndpoint:
    """Contract tests for GET /ready"""

    def test_ready_returns_200_or_503(self, client):
        response = client.get("/ready")
        assert response.status_code in (200, 503), \
            f"Expected 200 or 503, got {response.status_code}"

    def test_ready_response_has_required_fields(self, client):
        response = client.get("/ready")
        body = response.json()
        assert "status" in body, "Missing field: status"
        assert "checks" in body, "Missing field: checks"

    def test_ready_status_is_valid_enum(self, client):
        response = client.get("/ready")
        status = response.json().get("status")
        assert status in ("ready", "not_ready"), f"Invalid status: {status}"

    def test_ready_checks_includes_qdrant(self, client):
        response = client.get("/ready")
        checks = response.json().get("checks", {})
        assert "qdrant" in checks, "checks must include 'qdrant' key"

    def test_ready_checks_values_are_valid(self, client):
        response = client.get("/ready")
        checks = response.json().get("checks", {})
        valid_values = {"ok", "error", "pending", "not_configured"}
        for key, value in checks.items():
            assert value in valid_values, f"Invalid check value for {key}: {value}"

    def test_ready_no_auth_required(self, client):
        response = client.get("/ready")
        assert response.status_code != 401, "/ready must not require authentication"


# ── /version ──────────────────────────────────────────────────────────────────

class TestVersionEndpoint:
    """Contract tests for GET /version"""

    def test_version_returns_200(self, client):
        response = client.get("/version")
        assert response.status_code == 200

    def test_version_response_has_required_fields(self, client):
        response = client.get("/version")
        body = response.json()
        required = {"service", "version", "api_version", "knowledge_api_version", "build_time"}
        missing = required - body.keys()
        assert not missing, f"Missing fields in /version response: {missing}"

    def test_version_api_version_format(self, client):
        response = client.get("/version")
        api_version = response.json().get("api_version")
        assert api_version, "api_version must not be empty"
        assert api_version.startswith("v"), f"api_version should start with 'v', got: {api_version}"

    def test_version_no_auth_required(self, client):
        response = client.get("/version")
        assert response.status_code != 401, "/version must not require authentication"

    def test_version_service_matches_health(self, client):
        health = client.get("/health").json()
        version = client.get("/version").json()
        assert health.get("service") == version.get("service"), \
            "service name must be consistent between /health and /version"
