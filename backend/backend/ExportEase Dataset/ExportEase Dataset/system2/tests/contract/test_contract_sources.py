"""
test_contract_sources.py — Contract tests for GET /v1/sources/{source_id}
"""

from __future__ import annotations
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.config import get_settings

VALID_API_KEY = get_settings().api_key_secret


@pytest.fixture(scope="module")
def client():
    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


class TestSourcesEndpoint:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_get_source_requires_auth(self, client):
        response = client.get("/v1/sources/src-1001")
        assert response.status_code == 401, "Expected 401 Unauthorized"

    def test_get_source_returns_200_for_known_source(self, client):
        response = client.get(
            "/v1/sources/src-1001",
            headers=self._headers(),
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_get_source_returns_404_for_unknown_source(self, client):
        response = client.get(
            "/v1/sources/unknown-src-id",
            headers=self._headers(),
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        # Verify custom error structure matches ErrorResponse contract
        body = response.json()
        assert "detail" in body
        detail = body["detail"]
        assert detail.get("error") == "NOT_FOUND"
        assert detail.get("status_code") == 404

    def test_get_source_response_has_required_fields(self, client):
        response = client.get(
            "/v1/sources/src-1001",
            headers=self._headers(),
        )
        body = response.json()
        required_fields = {
            "source_id", "authority", "title", "url", "source_type", 
            "publication_date", "effective_date", "retrieval_date", 
            "language", "verification_status"
        }
        missing = required_fields - body.keys()
        assert not missing, f"Missing required fields: {missing}"

    def test_get_source_enum_values(self, client):
        response = client.get(
            "/v1/sources/src-1001",
            headers=self._headers(),
        )
        body = response.json()
        
        valid_source_types = {"regulation", "agreement", "guideline", "official_publication", "unknown"}
        assert body["source_type"] in valid_source_types, f"Invalid source_type: {body['source_type']}"
        
        valid_verification_statuses = {"verified", "unverified", "deprecated", "revoked"}
        assert body["verification_status"] in valid_verification_statuses, f"Invalid verification_status: {body['verification_status']}"
