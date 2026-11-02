"""
test_contract_confidence.py — Contract tests for Retrieval Confidence Abstraction
"""

from __future__ import annotations
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


class TestConfidenceAbstraction:
    def _headers(self):
        return {"X-API-Key": VALID_API_KEY}

    def test_insufficient_grounding(self, client):
        # Pass a low score to the confidence endpoint
        resp = client.post("/v1/confidence", json={
            "query": "Does not matter",
            "results": [{"score": 0.25}]
        }, headers=self._headers())
        
        assert resp.status_code == 200
        body = resp.json()
        assert body["confidence_level"] == "INSUFFICIENT_GROUNDING"

    def test_low_confidence(self, client):
        # Pass a moderate/low score to the confidence endpoint
        resp = client.post("/v1/confidence", json={
            "query": "Does not matter",
            "results": [{"score": 0.55}]
        }, headers=self._headers())
        
        assert resp.status_code == 200
        body = resp.json()
        assert body["confidence_level"] == "LOW"

    def test_medium_confidence(self, client):
        resp = client.post("/v1/confidence", json={
            "query": "Does not matter",
            "results": [{"score": 0.75}]
        }, headers=self._headers())
        
        assert resp.status_code == 200
        assert resp.json()["confidence_level"] == "MEDIUM"

    def test_high_confidence(self, client):
        resp = client.post("/v1/confidence", json={
            "query": "Does not matter",
            "results": [{"score": 0.95}]
        }, headers=self._headers())
        
        assert resp.status_code == 200
        assert resp.json()["confidence_level"] == "HIGH"
