"""
test_contract_dense_retrieval.py — Contract tests for Dense Retrieval matching the Mock API Schema
"""

from __future__ import annotations
import pytest
import uuid
import json
import os
from fastapi.testclient import TestClient

from app.main import create_app
from app.config import get_settings

VALID_API_KEY = get_settings().api_key_secret


@pytest.fixture(scope="module")
def client():
    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


class TestDenseRetrieval:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_live_response_matches_mock_structure(self, client):
        # 1. Load the mock JSON
        mock_path = os.path.join(os.path.dirname(__file__), "..", "mock_data", "mock_retrieve_response.json")
        with open(mock_path, "r") as f:
            mock_data = json.load(f)
            
        mock_result = mock_data["results"][0]
        
        # 2. Ingest a document
        doc_id = f"test-dense-{uuid.uuid4().hex[:6]}"
        client.post("/v1/documents/ingest", json={
            "document_id": doc_id,
            "content": "Industrial lasers with output power exceeding 100W are restricted.",
            "metadata": {
                "jurisdiction": ["JP"],
                "document_type": "regulation",
                "product": "Industrial Lasers",
                "hs_code": "901320"
            }
        }, headers=self._headers())
        
        # 3. Retrieve via live API
        retrieve_resp = client.post("/v1/retrieve", json={
            "query": "Industrial lasers restricted",
            "top_k": 1,
            "score_threshold": 0.0
        }, headers=self._headers())
        
        assert retrieve_resp.status_code == 200
        live_data = retrieve_resp.json()
        
        assert len(live_data["results"]) > 0
        live_result = live_data["results"][0]
        
        # 4. Assert structure is identical (keys match perfectly)
        mock_keys = set(mock_result.keys())
        live_keys = set(live_result.keys())
        
        assert mock_keys == live_keys, f"Live API structure differs from Mock structure! Diff: {mock_keys.symmetric_difference(live_keys)}"
        
        # Specifically assert `score` exists and is a float
        assert "score" in live_result
        assert isinstance(live_result["score"], float)
