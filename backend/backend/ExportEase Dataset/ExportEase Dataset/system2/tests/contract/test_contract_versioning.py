"""
test_contract_versioning.py — Contract tests for Regulatory Versioning
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


class TestRegulatoryVersioning:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_knowledge_version_endpoint(self, client):
        response = client.get(
            "/v1/knowledge/version",
            headers=self._headers()
        )
        assert response.status_code == 200
        
        body = response.json()
        assert "dataset_version" in body
        assert "embedding_version" in body
        assert "retrieval_version" in body
        assert "reranker_version" in body
        assert "api_version" in body

    def test_evidence_preserves_versioning(self, client):
        # 1. Ingest a document with versioning fields
        doc_id = f"test-doc-vers-{uuid.uuid4().hex[:6]}"
        payload = {
            "document_id": doc_id,
            "content": "Regulatory rule v2.",
            "metadata": {
                "document_type": "regulation",
                "jurisdiction": ["EU"],
                "source_id": "src-vers-001",
                "verification_status": "VERIFIED",
                "superseded": True,
                "dataset_version": "1.0.0"
            }
        }
        ingest_resp = client.post("/v1/documents/ingest", json=payload, headers=self._headers())
        assert ingest_resp.status_code == 201
        
        # 2. Retrieve chunk directly
        # Wait, how do we know the chunk ID without searching?
        # Let's just do a search first to get the chunk ID.
        search_resp = client.post(
            "/v1/knowledge/search",
            json={"query": "Regulatory rule v2.", "top_k": 1, "score_threshold": 0.0},
            headers=self._headers(),
        )
        assert search_resp.status_code == 200
        results = search_resp.json()["results"]
        
        # Find our specific doc
        chunk_id = None
        for r in results:
            if r["document_id"] == doc_id:
                chunk_id = r["chunk_id"]
                break
                
        assert chunk_id is not None, "Failed to find the ingested versioning doc."
        
        # 3. Retrieve evidence and assert version fields
        evidence_resp = client.get(
            f"/v1/evidence/{chunk_id}",
            headers=self._headers()
        )
        assert evidence_resp.status_code == 200
        evidence_body = evidence_resp.json()
        
        assert evidence_body["superseded"] is True
        assert evidence_body["dataset_version"] == "1.0.0"
