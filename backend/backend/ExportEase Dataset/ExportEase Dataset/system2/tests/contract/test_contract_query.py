"""
test_contract_query.py — Contract tests for POST /v1/knowledge/query

Validates request/response shapes against the OpenAPI contract.
Uses TestClient with mocked Qdrant to avoid requiring a running vector DB.
"""

from __future__ import annotations
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.config import get_settings

VALID_API_KEY = get_settings().api_key_secret


@pytest.fixture(scope="module")
def client():
    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture(autouse=True)
def mock_pipeline():
    """Mock the RAG pipeline to avoid Qdrant dependency in contract tests."""
    import uuid
    from datetime import datetime, timezone
    from app.models.responses import QueryResponse, SearchResponse, SourceDocument

    mock_response = QueryResponse(
        query_id=uuid.uuid4(),
        answer="Based on retrieved documents, the applicable HS code is 8708.",
        sources=[
            SourceDocument(
                document_id="doc-8708",
                chunk_id="doc-8708-chunk-0000",
                score=0.87,
                content="HS Code 8708 covers parts and accessories of motor vehicles.",
                metadata={"document_type": "hs_code", "jurisdiction": ["EU", "IN"]},
            )
        ],
        retrieval_count=1,
        latency_ms=123.4,
        model_used="all-MiniLM-L6-v2",
    )
    mock_search_response = SearchResponse(
        query="automotive parts",
        results=[
            SourceDocument(
                document_id="doc-8708",
                chunk_id="doc-8708-chunk-0000",
                score=0.87,
                content="HS Code 8708 covers parts and accessories of motor vehicles.",
            )
        ],
        total_results=1,
        latency_ms=45.2,
    )

    mock_pipe = MagicMock()
    mock_pipe.query = MagicMock(return_value=mock_response)
    mock_pipe.search = MagicMock(return_value=mock_search_response)

    with patch("app.api.knowledge.get_rag_pipeline", return_value=mock_pipe):
        yield mock_pipe


# ── POST /v1/knowledge/query ───────────────────────────────────────────────────

class TestQueryEndpoint:
    """Contract tests for the primary RAG query endpoint."""

    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_query_requires_auth(self, client):
        response = client.post("/v1/knowledge/query", json={"query": "test query"})
        assert response.status_code == 401, "Query endpoint must require X-API-Key"

    def test_query_returns_200_with_valid_request(self, client):
        response = client.post(
            "/v1/knowledge/query",
            json={"query": "What is HS code 8708?"},
            headers=self._headers(),
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    def test_query_response_has_required_fields(self, client):
        response = client.post(
            "/v1/knowledge/query",
            json={"query": "What is HS code 8708?"},
            headers=self._headers(),
        )
        body = response.json()
        required = {"query_id", "answer", "sources", "retrieval_count", "latency_ms"}
        missing = required - body.keys()
        assert not missing, f"Missing fields in query response: {missing}"

    def test_query_id_is_uuid(self, client):
        response = client.post(
            "/v1/knowledge/query",
            json={"query": "What is HS code 8708?"},
            headers=self._headers(),
        )
        import re
        query_id = response.json().get("query_id")
        uuid_pattern = re.compile(
            r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I
        )
        assert uuid_pattern.match(str(query_id)), f"query_id is not a valid UUID: {query_id}"

    def test_query_sources_is_list(self, client):
        response = client.post(
            "/v1/knowledge/query",
            json={"query": "What is HS code 8708?"},
            headers=self._headers(),
        )
        sources = response.json().get("sources")
        assert isinstance(sources, list), "sources must be a list"

    def test_query_source_has_required_fields(self, client):
        response = client.post(
            "/v1/knowledge/query",
            json={"query": "What is HS code 8708?", "include_sources": True},
            headers=self._headers(),
        )
        sources = response.json().get("sources", [])
        if sources:
            src = sources[0]
            required = {"document_id", "chunk_id", "score", "content"}
            missing = required - src.keys()
            assert not missing, f"Missing fields in source document: {missing}"

    def test_query_rejects_too_short(self, client):
        response = client.post(
            "/v1/knowledge/query",
            json={"query": "ab"},  # < minLength 3
            headers=self._headers(),
        )
        assert response.status_code == 422, "Query < 3 chars should return 422"

    def test_query_rejects_top_k_out_of_range(self, client):
        response = client.post(
            "/v1/knowledge/query",
            json={"query": "valid query", "top_k": 999},  # max is 20
            headers=self._headers(),
        )
        assert response.status_code == 422, "top_k > 20 should return 422"

    def test_query_accepts_valid_filters(self, client):
        response = client.post(
            "/v1/knowledge/query",
            json={
                "query": "export duties for automotive parts",
                "filters": {
                    "jurisdiction": ["EU", "IN"],
                    "document_type": ["hs_code"],
                },
            },
            headers=self._headers(),
        )
        assert response.status_code == 200

    def test_query_accepts_all_retrieval_modes(self, client):
        for mode in ("dense", "sparse", "hybrid"):
            response = client.post(
                "/v1/knowledge/query",
                json={"query": "test export query", "retrieval_mode": mode},
                headers=self._headers(),
            )
            assert response.status_code == 200, f"Mode {mode} failed with {response.status_code}"

    def test_query_invalid_retrieval_mode(self, client):
        response = client.post(
            "/v1/knowledge/query",
            json={"query": "test", "retrieval_mode": "magic"},
            headers=self._headers(),
        )
        assert response.status_code == 422


# ── POST /v1/knowledge/search ─────────────────────────────────────────────────

class TestSearchEndpoint:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_search_requires_auth(self, client):
        response = client.post("/v1/knowledge/search", json={"query": "test"})
        assert response.status_code == 401

    def test_search_returns_200(self, client):
        response = client.post(
            "/v1/knowledge/search",
            json={"query": "automotive parts export"},
            headers=self._headers(),
        )
        assert response.status_code == 200

    def test_search_response_shape(self, client):
        response = client.post(
            "/v1/knowledge/search",
            json={"query": "automotive parts export"},
            headers=self._headers(),
        )
        body = response.json()
        required = {"query", "results", "total_results", "latency_ms"}
        assert not (required - body.keys()), f"Missing search response fields"
        assert isinstance(body["results"], list)
        assert isinstance(body["total_results"], int)
        assert isinstance(body["latency_ms"], (int, float))
