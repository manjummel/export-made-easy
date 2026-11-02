"""
test_contract_qdrant_abstraction.py — Contract tests for Qdrant Abstraction
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


class TestQdrantAbstraction:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_qdrant_is_strictly_internal(self, client):
        """
        Proves that external systems can retrieve evidence without 
        knowing Qdrant exists. The response must contain NO Qdrant-specific 
        constructs (e.g., ScoredPoint, payload dicts, UUID internal types)
        and must strictly conform to the SearchResponse/NormalizedRecord schema.
        """
        # 1. Ingest a document
        doc_id = f"test-abstract-{uuid.uuid4().hex[:6]}"
        client.post("/v1/documents/ingest", json={
            "document_id": doc_id,
            "content": "Abstract vector database layer test.",
            "metadata": {"jurisdiction": ["EU"], "document_type": "regulation"}
        }, headers=self._headers())
        
        # 2. Retrieve via the public abstraction
        retrieve_resp = client.post("/v1/retrieve", json={
            "query": "Abstract vector database",
            "top_k": 1,
            "score_threshold": 0.0
        }, headers=self._headers())
        
        assert retrieve_resp.status_code == 200, f"Retrieval failed: {retrieve_resp.text}"
        body = retrieve_resp.json()
        
        assert "results" in body
        assert len(body["results"]) > 0
        
        result = body["results"][0]
        
        # 3. Assert exact schema conformance (no Qdrant leakages)
        # It must have EXACTLY the keys defined in NormalizedRecord + score
        expected_keys = {
            "chunk_id", "document_id", "source_id", "text", "authority", "title",
            "topic", "product", "hs_code", "country", "language", "page",
            "section", "publication_date", "effective_date", "superseded",
            "dataset_version", "verification_status", "score"
        }
        
        actual_keys = set(result.keys())
        
        assert actual_keys == expected_keys, f"Found unexpected/missing keys in payload: {actual_keys.symmetric_difference(expected_keys)}"
        
        # Ensure no Qdrant internal IDs are leaked as the chunk ID (it should be our hash)
        assert result["chunk_id"].startswith("chk-")
        
        # Verify health check doesn't leak raw Qdrant instance data
        health_resp = client.get("/health")
        assert health_resp.status_code == 200
        health_body = health_resp.json()
        assert health_body["status"] == "healthy"
        assert "qdrant" in health_body["components"]
        assert health_body["components"]["qdrant"] == "ok" # Simple status, no internal payload
