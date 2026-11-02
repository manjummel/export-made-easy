"""
test_contract_embedding.py — Contract tests for Embedding Pipeline Status
"""

from __future__ import annotations
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from app.main import create_app
from app.config import get_settings

VALID_API_KEY = get_settings().api_key_secret


@pytest.fixture(scope="module")
def client():
    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


class TestEmbeddingPipeline:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_embedding_status_endpoint(self, client):
        resp = client.get("/v1/embedding/status", headers=self._headers())
        assert resp.status_code == 200
        
        body = resp.json()
        assert "embedding_model_version" in body
        assert "embedding_dimension" in body
        assert "dataset_version" in body
        
        # Verify it matches the active configuration
        settings = get_settings()
        assert body["embedding_model_version"] == settings.embedding_model
        assert body["embedding_dimension"] == settings.qdrant_vector_size
        assert body["dataset_version"] == settings.dataset_version

    @patch("app.api.knowledge.get_settings")
    @patch("app.api.embedding.get_settings")
    def test_version_manifest_synchronization(self, mock_emb_settings, mock_know_settings, client):
        # We simulate a regenerated embedding pipeline by overriding settings
        # The prompt states: "When embeddings are regenerated, update the knowledge version manifest."
        # This test proves that the two endpoints pull from the identical config and stay perfectly synced.
        
        # Create a mock settings object with a new dataset and embedding version
        settings = get_settings()
        settings_copy = settings.model_copy()
        settings_copy.dataset_version = "2.0.0"
        settings_copy.embedding_model = "bge-m3"
        
        mock_emb_settings.return_value = settings_copy
        mock_know_settings.return_value = settings_copy
        
        # 1. Fetch embedding status
        emb_resp = client.get("/v1/embedding/status", headers=self._headers())
        assert emb_resp.status_code == 200
        emb_body = emb_resp.json()
        
        assert emb_body["embedding_model_version"] == "bge-m3"
        assert emb_body["dataset_version"] == "2.0.0"
        
        # 2. Fetch knowledge version manifest
        know_resp = client.get("/v1/knowledge/version", headers=self._headers())
        assert know_resp.status_code == 200
        know_body = know_resp.json()
        
        assert know_body["embedding_version"] == "bge-m3"
        assert know_body["dataset_version"] == "2.0.0"
