"""
test_contract_training.py — Contract tests for Training Dataset Export
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


class TestTrainingDatasetExport:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_training_manifest_and_export(self, client):
        # 1. Ingest a VERIFIED doc
        v_doc_id = f"test-train-verif-{uuid.uuid4().hex[:6]}"
        client.post("/v1/documents/ingest", json={
            "document_id": v_doc_id,
            "content": "A crucial verified rule for training.",
            "metadata": {"jurisdiction": ["EU"], "verification_status": "VERIFIED"}
        }, headers=self._headers())
        
        # 2. Ingest an UNVERIFIED doc
        u_doc_id = f"test-train-unverif-{uuid.uuid4().hex[:6]}"
        client.post("/v1/documents/ingest", json={
            "document_id": u_doc_id,
            "content": "An unverified rule, MUST NOT BE EXPORTED.",
            "metadata": {"jurisdiction": ["US"], "verification_status": "REVIEW_REQUIRED"}
        }, headers=self._headers())

        # 3. Fetch training manifest
        manifest_resp = client.get(
            "/v1/training-dataset/version",
            headers=self._headers()
        )
        assert manifest_resp.status_code == 200
        
        manifest = manifest_resp.json()
        assert "dataset_id" in manifest
        assert "dataset_version" in manifest
        assert "schema_version" in manifest
        assert "record_count" in manifest
        
        # Manifest should reflect at least the verified document we just added
        assert manifest["record_count"] >= 1

        # 4. Fetch export dataset
        export_resp = client.get(
            "/v1/training-dataset/export",
            headers=self._headers()
        )
        assert export_resp.status_code == 200
        records = export_resp.json()
        
        assert len(records) == manifest["record_count"]
        
        # Ensure ONLY verified records were exported
        found_verified = False
        for r in records:
            assert r["verification_status"] == "VERIFIED"
            if r["document_id"] == v_doc_id:
                found_verified = True
            if r["document_id"] == u_doc_id:
                pytest.fail("Export mechanism leaked an unverified record!")
                
        assert found_verified, "The newly added verified record was not found in the export."
