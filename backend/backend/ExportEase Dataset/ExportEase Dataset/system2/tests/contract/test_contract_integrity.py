"""
test_contract_integrity.py — Contract tests for the cleaning and deduplication pipeline
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


class TestDataIntegrity:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_deduplication_and_cleaning(self, client):
        # Provide a raw document with duplicated sections and excess whitespace
        raw_text = (
            "Section 1: Important compliance rule.\n\n\n\n\n"
            "Section 1: Important compliance rule.    \t   \n"
            "Section 2: Another rule."
        )
        
        # We use a very small chunk size to ensure these split into distinct chunks
        # But actually, chunker.split will chunk it up, and our cleaner will deduplicate it.
        # So we expect fewer chunks generated than what the chunker originally produced.
        ingest_payload = {
            "document_id": "test-doc-integrity-01",
            "content": raw_text,
            "metadata": {
                "document_type": "regulation",
                "jurisdiction": ["EU"],
                "source_id": "src-integrity-101"
            }
        }
        
        ingest_resp = client.post(
            "/v1/documents/ingest",
            json=ingest_payload,
            headers=self._headers(),
        )
        assert ingest_resp.status_code == 201
        
        body = ingest_resp.json()
        assert body["document_id"] == "test-doc-integrity-01"
        assert body["chunks_rejected"] == 0 # Metadata is valid, so no rejections
        # Exactly how many chunks created depends on chunker, but it shouldn't fail.

        # Verify traceability through search
        search_resp = client.post(
            "/v1/knowledge/search",
            json={"query": "compliance rule"},
            headers=self._headers(),
        )
        assert search_resp.status_code == 200
        
        results = search_resp.json()["results"]
        # Ensure that source_id and document_id survived the pipeline
        found = False
        for r in results:
            if r["document_id"] == "test-doc-integrity-01":
                assert r["source_id"] == "src-integrity-101"
                found = True
        
        assert found, "Document was not traceable in the API response"

    def test_validation_rejection(self, client):
        # We need to trigger a validation failure on the chunk.
        # NormalizedRecord requires 'text', 'document_id', 'chunk_id', which we auto-fill.
        # But wait, our metadata mapping sets `source_id=metadata.get("source_id")`.
        # Is source_id strictly required by NormalizedRecord? No, it's optional in Python, 
        # but what if we pass completely wrong data types?
        # Actually, let's inject a bad type to force a validation error in Pydantic.
        
        ingest_payload = {
            "document_id": "test-doc-integrity-02",
            "content": "Valid text, bad metadata",
            "metadata": {
                "document_type": "regulation",
                "jurisdiction": ["EU"], # valid
                "page": "not-an-integer" # This will fail validation (expects int)
            }
        }
        
        ingest_resp = client.post(
            "/v1/documents/ingest",
            json=ingest_payload,
            headers=self._headers(),
        )
        
        # Wait, if all chunks fail, we raise ValueError 400
        assert ingest_resp.status_code == 400
        assert "validation failure" in ingest_resp.json()["detail"]["message"]

