"""
test_contract_ingest.py — Contract tests for document ingestion endpoints

POST /v1/documents/ingest
POST /v1/documents/batch
DELETE /v1/documents/{id}
"""

from __future__ import annotations
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.config import get_settings
from app.models.responses import IngestResponse

VALID_API_KEY = get_settings().api_key_secret

VALID_INGEST_PAYLOAD = {
    "content": "HS Code 8708 covers parts and accessories of motor vehicles of headings 8701 to 8705. This includes bumpers, seat belts, brakes, gear boxes, drive-axles, road wheels, shock-absorbers, radiators, mufflers, steering wheels.",
    "metadata": {
        "document_type": "hs_code",
        "jurisdiction": ["IN", "EU"],
        "effective_date": "2023-01-01",
    },
}


@pytest.fixture(scope="module")
def client():
    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture(autouse=True)
def mock_ingest():
    """Mock the ingestion pipeline components."""
    mock_retriever = MagicMock()
    mock_retriever.ensure_collection.return_value = True
    mock_retriever.upsert_chunks.return_value = 3
    mock_retriever.delete_by_document_id.return_value = 2

    mock_pipeline = MagicMock()
    mock_pipeline.embed_and_prepare_chunks.return_value = [
        {"id": i, "vector": [0.1] * 384, "payload": {}} for i in range(3)
    ]

    mock_chunker = MagicMock()
    mock_chunk = MagicMock()
    mock_chunk.content = "Chunk text content"
    mock_chunker.split.return_value = [mock_chunk, mock_chunk, mock_chunk]

    with (
        patch("app.api.ingest.get_retriever", return_value=mock_retriever),
        patch("app.api.ingest.get_rag_pipeline", return_value=mock_pipeline),
        patch("app.api.ingest.ExportDocumentChunker", return_value=mock_chunker),
    ):
        yield


class TestIngestEndpoint:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_ingest_requires_auth(self, client):
        response = client.post("/v1/documents/ingest", json=VALID_INGEST_PAYLOAD)
        assert response.status_code == 401

    def test_ingest_returns_201(self, client):
        response = client.post(
            "/v1/documents/ingest",
            json=VALID_INGEST_PAYLOAD,
            headers=self._headers(),
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"

    def test_ingest_response_has_required_fields(self, client):
        response = client.post(
            "/v1/documents/ingest",
            json=VALID_INGEST_PAYLOAD,
            headers=self._headers(),
        )
        body = response.json()
        required = {"document_id", "chunks_created", "status", "collection", "timestamp"}
        assert not (required - body.keys()), f"Missing ingest response fields: {required - body.keys()}"

    def test_ingest_status_is_valid(self, client):
        response = client.post(
            "/v1/documents/ingest",
            json=VALID_INGEST_PAYLOAD,
            headers=self._headers(),
        )
        status = response.json().get("status")
        assert status in ("ingested", "updated", "failed"), f"Invalid status: {status}"

    def test_ingest_with_custom_document_id(self, client):
        payload = {**VALID_INGEST_PAYLOAD, "document_id": "custom-doc-001"}
        response = client.post(
            "/v1/documents/ingest",
            json=payload,
            headers=self._headers(),
        )
        assert response.status_code == 201
        body = response.json()
        assert body.get("document_id") == "custom-doc-001"

    def test_ingest_rejects_empty_content(self, client):
        payload = {**VALID_INGEST_PAYLOAD, "content": "ab"}  # < minLength 10
        response = client.post(
            "/v1/documents/ingest",
            json=payload,
            headers=self._headers(),
        )
        assert response.status_code == 422

    def test_ingest_rejects_invalid_document_type(self, client):
        payload = {
            "content": "Valid content here that is long enough",
            "metadata": {"document_type": "invalid_type", "jurisdiction": ["IN"]},
        }
        response = client.post(
            "/v1/documents/ingest",
            json=payload,
            headers=self._headers(),
        )
        assert response.status_code == 422

    def test_ingest_rejects_missing_metadata(self, client):
        response = client.post(
            "/v1/documents/ingest",
            json={"content": "Some valid content text here"},
            headers=self._headers(),
        )
        assert response.status_code == 422


class TestBatchIngestEndpoint:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_batch_ingest_returns_200(self, client):
        payload = {"documents": [VALID_INGEST_PAYLOAD, VALID_INGEST_PAYLOAD]}
        response = client.post(
            "/v1/documents/batch",
            json=payload,
            headers=self._headers(),
        )
        assert response.status_code == 200

    def test_batch_ingest_response_shape(self, client):
        payload = {"documents": [VALID_INGEST_PAYLOAD]}
        response = client.post(
            "/v1/documents/batch",
            json=payload,
            headers=self._headers(),
        )
        body = response.json()
        required = {"total", "succeeded", "failed", "results"}
        assert not (required - body.keys())
        assert body["total"] == 1

    def test_batch_ingest_rejects_empty_list(self, client):
        response = client.post(
            "/v1/documents/batch",
            json={"documents": []},
            headers=self._headers(),
        )
        assert response.status_code == 422


class TestDeleteDocumentEndpoint:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_delete_requires_auth(self, client):
        response = client.delete("/v1/documents/doc-001")
        assert response.status_code == 401

    def test_delete_returns_200(self, client):
        response = client.delete(
            "/v1/documents/doc-test-001",
            headers=self._headers(),
        )
        assert response.status_code == 200

    def test_delete_response_shape(self, client):
        response = client.delete(
            "/v1/documents/doc-test-001",
            headers=self._headers(),
        )
        body = response.json()
        assert "document_id" in body
        assert "status" in body
