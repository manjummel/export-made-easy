"""
test_contract_hybrid.py — Contract tests for Hybrid Retrieval Abstraction
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


class TestHybridRetrieval:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_hybrid_retrieval_conformance(self, client):
        # 1. Ingest a document
        doc_id = f"test-hybrid-{uuid.uuid4().hex[:6]}"
        client.post("/v1/documents/ingest", json={
            "document_id": doc_id,
            "content": "BM25 keyword matching and dense vector search combined.",
            "metadata": {"jurisdiction": ["EU"], "document_type": "regulation"}
        }, headers=self._headers())
        
        # 2. Retrieve via the hybrid abstraction
        resp = client.post("/v1/retrieve/hybrid", json={
            "query": "BM25 combined search",
            "top_k": 3
        }, headers=self._headers())
        
        assert resp.status_code == 200, f"Failed: {resp.text}"
        body = resp.json()
        
        # 3. Assert top-level hybrid schema
        assert "results" in body
        assert "confidence" in body
        assert "metadata" in body
        assert "retrieval_version" in body
        
        # Assert no Qdrant specifics are leaked in metadata or response body
        assert "qdrant" not in str(body).lower()
        assert "bm25" not in str(body["metadata"]).lower()  # It can have "mode": "hybrid", but no raw bm25 arrays
        
        assert isinstance(body["confidence"], float)
        assert body["retrieval_version"] == get_settings().retrieval_version
        
        # Ensure results are cleanly mapped
        if len(body["results"]) > 0:
            result = body["results"][0]
            assert "score" in result
            assert "chunk_id" in result
