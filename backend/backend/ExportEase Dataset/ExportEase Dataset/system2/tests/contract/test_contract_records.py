"""
test_contract_records.py — Contract tests for POST /v1/records/ingest
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


class TestStructuredRecordsEndpoint:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_ingest_structured_record_success(self, client):
        payload = {
            "country": ["EU", "DE"],
            "product": "Automotive engine parts",
            "hs_code": "870899",
            "dates": {
                "effective_date": "2023-01-01",
                "expiry_date": "2026-12-31"
            },
            "authority": "European Commission",
            "source_id": "src-eu-trade-001"
        }
        
        response = client.post(
            "/v1/records/ingest",
            json=payload,
            headers=self._headers(),
        )
        assert response.status_code == 201
        
        body = response.json()
        assert "record_id" in body
        assert "document_id" in body
        assert body["chunks_created"] >= 1
        assert body["status"] == "ingested"

    def test_ingest_structured_record_malformed_hs_code(self, client):
        # Missing hs_code entirely, or malformed
        payload = {
            "country": ["EU"],
            "product": "Automotive engine parts",
            "hs_code": "invalid-code",  # Should fail pattern ^\d{2,10}$
            "authority": "European Commission",
            "source_id": "src-eu-trade-001"
        }
        
        response = client.post(
            "/v1/records/ingest",
            json=payload,
            headers=self._headers(),
        )
        assert response.status_code == 422, "Expected 422 Validation Error for malformed HS Code"

    def test_ingest_structured_record_missing_source_id(self, client):
        payload = {
            "country": ["US"],
            "product": "Steel components",
            "hs_code": "732690",
            "authority": "CBP"
            # Missing source_id
        }
        
        response = client.post(
            "/v1/records/ingest",
            json=payload,
            headers=self._headers(),
        )
        assert response.status_code == 422, "Expected 422 Validation Error for missing source_id"
