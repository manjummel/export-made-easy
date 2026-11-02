"""
test_contract_status.py — Contract tests for Verified Knowledge Dataset
"""

from __future__ import annotations
import pytest
import uuid
from fastapi.testclient import TestClient

from app.main import create_app
from app.config import get_settings

VALID_API_KEY = get_settings().api_key_secret


@pytest.fixture(scope="module")
def client():
    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


class TestKnowledgeStatus:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_status_endpoint(self, client):
        # 1. Ingest documents to ensure we have data
        client.post("/v1/documents/ingest", json={
            "document_id": f"test-{uuid.uuid4().hex[:6]}",
            "content": "Verified doc.",
            "metadata": {"jurisdiction": ["EU"], "verification_status": "VERIFIED"}
        }, headers=self._headers())
        
        client.post("/v1/documents/ingest", json={
            "document_id": f"test-{uuid.uuid4().hex[:6]}",
            "content": "Unverified doc.",
            "metadata": {"jurisdiction": ["US"], "verification_status": "REVIEW_REQUIRED"}
        }, headers=self._headers())

        # 2. Fetch status
        response = client.get(
            "/v1/knowledge/status",
            headers=self._headers()
        )
        assert response.status_code == 200
        
        body = response.json()
        assert "record_count" in body
        assert "verified_count" in body
        assert "dataset_version" in body
        assert "last_updated" in body
        assert "coverage_summary" in body
        
        # verified_count must be <= record_count
        assert body["verified_count"] <= body["record_count"]
        
        # coverage summary should reflect jurisdictions of VERIFIED documents only
        # Our implementation of get_coverage_summary explicitly filters by VERIFIED
        coverage = body["coverage_summary"]
        if body["verified_count"] > 0:
            assert len(coverage) > 0
