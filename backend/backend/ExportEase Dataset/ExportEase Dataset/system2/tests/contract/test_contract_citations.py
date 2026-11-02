"""
test_contract_citations.py — Contract & Integration tests for Citation & Evidence API
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


class TestCitationsAndEvidence:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_full_citation_and_evidence_pipeline(self, client):
        # 1. Register a source
        source_id = f"src-cit-{uuid.uuid4().hex[:6]}"
        client.post("/v1/sources", json={
            "source_id": source_id,
            "authority": "EU Council",
            "title": "Regulation (EU) 2021/821",
            "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021R0821",
            "source_type": "regulation",
            "publication_date": "2021-05-20",
            "effective_date": "2021-09-09",
            "language": "en",
            "verification_status": "VERIFIED"
        }, headers=self._headers())

        # 2. Ingest a VERIFIED document linked to this source
        verified_doc_id = f"doc-verif-{uuid.uuid4().hex[:6]}"
        client.post("/v1/documents/ingest", json={
            "document_id": verified_doc_id,
            "content": "Article 3: Items listed in Annex I shall require an authorization for export.",
            "metadata": {
                "jurisdiction": ["EU"],
                "document_type": "regulation",
                "source_id": source_id,
                "verification_status": "VERIFIED"
            }
        }, headers=self._headers())

        # 3. Ingest an UNVERIFIED document linked to the same source
        unverified_doc_id = f"doc-unverif-{uuid.uuid4().hex[:6]}"
        client.post("/v1/documents/ingest", json={
            "document_id": unverified_doc_id,
            "content": "Draft Article 99: Optional unverified guideline text.",
            "metadata": {
                "jurisdiction": ["EU"],
                "document_type": "guideline",
                "source_id": source_id,
                "verification_status": "REVIEW_REQUIRED"
            }
        }, headers=self._headers())

        # 4. System 1 queries Knowledge API to retrieve chunks
        retrieve_resp = client.post("/v1/retrieve", json={
            "query": "Authorization for export Annex I",
            "top_k": 5
        }, headers=self._headers())
        assert retrieve_resp.status_code == 200
        results = retrieve_resp.json()["results"]
        
        verified_chunk_id = None
        for r in results:
            if r["document_id"] == verified_doc_id:
                verified_chunk_id = r["chunk_id"]
                break
                
        assert verified_chunk_id is not None, "Verified chunk was not retrieved by Knowledge API."

        # Compute unverified chunk ID to test rejection
        # From cleaner logic: chk-sha256(doc_id:text)[:16]
        import hashlib
        unverif_text = "Draft Article 99: Optional unverified guideline text."
        unverif_hash = hashlib.sha256(f"{unverified_doc_id}:{unverif_text}".encode("utf-8")).hexdigest()[:16]
        unverified_chunk_id = f"chk-{unverif_hash}"

        # 5. System 1 → POST /v1/evidence (batch evidence resolution)
        evidence_resp = client.post("/v1/evidence", json={
            "chunk_ids": [verified_chunk_id, unverified_chunk_id]
        }, headers=self._headers())
        assert evidence_resp.status_code == 200
        evidence_records = evidence_resp.json()
        
        # Must only return the verified record
        assert len(evidence_records) == 1
        assert evidence_records[0]["chunk_id"] == verified_chunk_id
        assert evidence_records[0]["verification_status"] == "VERIFIED"

        # 6. System 1 → POST /v1/citations (batch citation generation)
        citation_resp = client.post("/v1/citations", json={
            "chunk_ids": [verified_chunk_id, unverified_chunk_id]
        }, headers=self._headers())
        assert citation_resp.status_code == 200
        citations = citation_resp.json()
        
        # Must only return citation for the verified record
        assert len(citations) == 1
        cit = citations[0]
        assert cit["chunk_id"] == verified_chunk_id
        assert cit["source_id"] == source_id
        assert cit["url"] == "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021R0821"
        assert "Annex I" in cit["text"]

        # 7. System 3 & System 4 → POST /v1/sources/batch
        batch_src_resp = client.post("/v1/sources/batch", json={
            "source_ids": [source_id]
        }, headers=self._headers())
        assert batch_src_resp.status_code == 200
        sources = batch_src_resp.json()
        assert len(sources) == 1
        assert sources[0]["source_id"] == source_id
