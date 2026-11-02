"""
test_contract_verification.py — Contract tests for Provenance and Verification Engine
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


class TestVerificationEngine:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_rag_only_returns_verified_records(self, client):
        # 1. Ingest a VERIFIED document
        verified_doc_id = f"test-doc-verif-yes-{uuid.uuid4().hex[:6]}"
        verified_payload = {
            "document_id": verified_doc_id,
            "content": "A highly critical verified rule regarding export compliance.",
            "metadata": {
                "document_type": "regulation",
                "jurisdiction": ["EU"],
                "source_id": "src-verif-001",
                "verification_status": "VERIFIED"
            }
        }
        client.post("/v1/documents/ingest", json=verified_payload, headers=self._headers())

        # 2. Ingest a REVIEW_REQUIRED document
        review_doc_id = f"test-doc-verif-no-{uuid.uuid4().hex[:6]}"
        review_payload = {
            "document_id": review_doc_id,
            "content": "A highly critical unverified rule regarding export compliance.",
            "metadata": {
                "document_type": "regulation",
                "jurisdiction": ["EU"],
                "source_id": "src-verif-002",
                "verification_status": "REVIEW_REQUIRED"
            }
        }
        client.post("/v1/documents/ingest", json=review_payload, headers=self._headers())

        # 3. Perform a RAG search
        search_payload = {
            "query": "critical rule regarding export compliance",
            "top_k": 5,
            "score_threshold": 0.0
        }

        search_resp = client.post(
            "/v1/knowledge/search",
            json=search_payload,
            headers=self._headers(),
        )
        assert search_resp.status_code == 200
        
        results = search_resp.json()["results"]
        
        # Verify that ONLY the VERIFIED document is returned
        found_verified = False
        for r in results:
            if r["document_id"] == verified_doc_id:
                assert r["verification_status"] == "VERIFIED"
                found_verified = True
            if r["document_id"] == review_doc_id:
                pytest.fail("Search returned a REVIEW_REQUIRED document, which is strictly prohibited.")
                
        assert found_verified, "The VERIFIED document was not found in the search results."
        
        # 4. Test Evidence endpoint (Provenance resolution)
        # Get the chunk_id of the verified doc we just found
        verified_chunk = [r for r in results if r["document_id"] == verified_doc_id][0]
        chunk_id = verified_chunk["chunk_id"]
        
        evidence_resp = client.get(
            f"/v1/evidence/{chunk_id}",
            headers=self._headers()
        )
        assert evidence_resp.status_code == 200
        evidence_body = evidence_resp.json()
        
        assert evidence_body["chunk_id"] == chunk_id
        assert evidence_body["document_id"] == verified_doc_id
        assert evidence_body["verification_status"] == "VERIFIED"
        assert evidence_body["source_id"] == "src-verif-001"
