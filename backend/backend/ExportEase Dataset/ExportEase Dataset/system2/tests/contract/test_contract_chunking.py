"""
test_contract_chunking.py — Contract tests for domain-aware chunking and retrieval
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


class TestChunkingAndRetrieval:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_chunk_id_stability(self, client):
        doc_id = f"test-chunk-{uuid.uuid4().hex[:6]}"
        content_v1 = "Section 1: Initial compliance rule.\nSection 2: Another rule."
        
        # 1. Ingest V1
        client.post("/v1/documents/ingest", json={
            "document_id": doc_id,
            "content": content_v1,
            "metadata": {"jurisdiction": ["EU"], "document_type": "regulation"}
        }, headers=self._headers())
        
        # Search to get the chunk IDs
        search_v1 = client.post("/v1/knowledge/search", json={
            "query": "Another rule", "top_k": 5, "score_threshold": 0.0
        }, headers=self._headers())
        results_v1 = search_v1.json()["results"]
        
        chunk_id_v1 = None
        for r in results_v1:
            if r["document_id"] == doc_id and "Another rule" in r["text"]:
                chunk_id_v1 = r["chunk_id"]
                break
                
        assert chunk_id_v1 is not None, "Failed to find V1 chunk"
        
        # 2. Ingest V2 (modify document structure by inserting text at the beginning)
        content_v2 = "NEW INTRO: This shifts all subsequent chunk indices.\n\n" + content_v1
        client.post("/v1/documents/ingest", json={
            "document_id": doc_id,
            "content": content_v2,
            "metadata": {"jurisdiction": ["EU"], "document_type": "regulation"}
        }, headers=self._headers())
        
        # Search again
        search_v2 = client.post("/v1/knowledge/search", json={
            "query": "Another rule", "top_k": 5, "score_threshold": 0.0
        }, headers=self._headers())
        results_v2 = search_v2.json()["results"]
        
        chunk_id_v2 = None
        for r in results_v2:
            if r["document_id"] == doc_id and "Another rule" in r["text"]:
                chunk_id_v2 = r["chunk_id"]
                break
                
        assert chunk_id_v2 is not None, "Failed to find V2 chunk"
        
        # 3. Prove stability
        assert chunk_id_v1 == chunk_id_v2, "Chunk ID changed despite content being identical!"

    def test_retrieval_filtering(self, client):
        # Insert a very specific document
        doc_id = f"test-retrieval-{uuid.uuid4().hex[:6]}"
        client.post("/v1/records/ingest", json={
            "country": ["JP"],
            "product": "Industrial Lasers",
            "hs_code": "901320",
            "authority": "METI",
            "source_id": "src-meti-001"
        }, headers=self._headers())
        
        # Query with POST /v1/retrieve using explicit filters
        retrieve_resp = client.post("/v1/retrieve", json={
            "query": "lasers",
            "filters": {
                "hs_code": ["901320"],
                "country": ["JP"]
            }
        }, headers=self._headers())
        
        assert retrieve_resp.status_code == 200
        results = retrieve_resp.json()["results"]
        
        assert len(results) > 0
        assert results[0]["hs_code"] == "901320"
        
        # Ensure we can retrieve it by jurisdiction alias too
        retrieve_resp2 = client.post("/v1/retrieve", json={
            "query": "lasers",
            "filters": {
                "jurisdiction": ["JP"]
            }
        }, headers=self._headers())
        assert retrieve_resp2.status_code == 200
        assert len(retrieve_resp2.json()["results"]) > 0
