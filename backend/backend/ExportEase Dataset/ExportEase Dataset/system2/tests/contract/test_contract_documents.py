"""
test_contract_documents.py — Contract tests for GET /v1/documents/{document_id}
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


class TestDocumentsEndpoint:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_ingest_and_resolve_provenance(self, client):
        # 1. Ingest a document with a known source_id
        ingest_payload = {
            "document_id": "test-doc-prov-01",
            "content": "This is some test content to establish provenance mapping.",
            "metadata": {
                "document_type": "regulation",
                "jurisdiction": ["IN"],
                "source_id": "src-1001"
            }
        }
        
        ingest_resp = client.post(
            "/v1/documents/ingest",
            json=ingest_payload,
            headers=self._headers(),
        )
        assert ingest_resp.status_code == 201
        
        # 2. Fetch the provenance metadata using the GET endpoint
        prov_resp = client.get(
            "/v1/documents/test-doc-prov-01",
            headers=self._headers(),
        )
        assert prov_resp.status_code == 200, f"Expected 200, got {prov_resp.status_code}"
        
        # 3. Verify provenance payload
        body = prov_resp.json()
        assert body["document_id"] == "test-doc-prov-01"
        assert body["source_id"] == "src-1001"
        assert "content_hash" in body
        assert len(body["content_hash"]) == 64  # SHA-256 hex
        assert "retrieval_time" in body

    def test_get_document_requires_auth(self, client):
        response = client.get("/v1/documents/test-doc-prov-01")
        assert response.status_code == 401

    def test_get_document_not_found(self, client):
        response = client.get(
            "/v1/documents/unknown-doc-id",
            headers=self._headers()
        )
        assert response.status_code == 404
