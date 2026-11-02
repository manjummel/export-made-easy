"""
test_contract_normalization.py — Contract tests for Schema Normalization
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


class TestSchemaNormalization:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_search_returns_normalized_record_schema(self, client):
        # 1. First ingest a document so we have something to retrieve
        ingest_payload = {
            "document_id": "test-doc-norm-01",
            "content": "Automotive parts export regulation for EU.",
            "metadata": {
                "document_type": "regulation",
                "jurisdiction": ["EU"],
                "source_id": "src-norm-101",
                "product": "Automotive parts",
                "hs_code": "870899"
            }
        }
        
        ingest_resp = client.post(
            "/v1/documents/ingest",
            json=ingest_payload,
            headers=self._headers(),
        )
        assert ingest_resp.status_code == 201

        # 2. Perform a search
        search_payload = {
            "query": "Automotive parts",
            "top_k": 1,
            "score_threshold": 0.0
        }

        search_resp = client.post(
            "/v1/knowledge/search",
            json=search_payload,
            headers=self._headers(),
        )
        assert search_resp.status_code == 200

        # 3. Verify exactly matching normalized flat fields
        body = search_resp.json()
        assert "results" in body
        
        if len(body["results"]) > 0:
            record = body["results"][0]
            
            # Must contain exact expected keys, NO nested 'metadata' dictionary
            assert "metadata" not in record, "Nested metadata dict should be gone"
            assert "content" not in record, "Content should be mapped to text"
            
            # Required top-level fields
            assert "chunk_id" in record
            assert "document_id" in record
            assert "text" in record
            
            # Optional top-level fields should at least be present (possibly None)
            expected_keys = {
                "chunk_id", "document_id", "source_id", "text", "authority",
                "title", "topic", "product", "hs_code", "country", "language",
                "page", "section", "publication_date", "effective_date",
                "verification_status", "score"
            }
            
            missing = expected_keys - record.keys()
            assert not missing, f"Missing normalized fields: {missing}"
            
            # Verify data actually mapped properly
            assert record["document_id"] == "test-doc-norm-01"
            assert "Automotive parts" in record["text"]
            assert record["source_id"] == "src-norm-101"
            assert record["product"] == "Automotive parts"
            assert record["hs_code"] == "870899"
            assert record["country"] == ["EU"]
