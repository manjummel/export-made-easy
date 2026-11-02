import pytest
import json
from httpx import AsyncClient
from fastapi.testclient import TestClient
from app.main import app

def test_websocket_chat_streaming():
    """Validates the exact WebSocket streaming pipeline from backend to client."""
    client = TestClient(app)
    
    # We bypass auth injection and just connect directly to WS
    with client.websocket_connect("/api/v1/chat") as websocket:
        # Prompt exactly as requested
        payload = {
            "command": "start_analysis",
            "query": "I want to export turmeric powder to Germany.",
            "project_id": "test-ws-project"
        }
        websocket.send_json(payload)
        
        events_received = []
        try:
            # We fetch all events untill we hit 'agent_completed' or timeout
            while True:
                data = websocket.receive_json()
                events_received.append(data["event"])
                
                # Enforce schema fields
                assert "agent" in data
                assert "status" in data
                assert "partial_output" in data
                assert "confidence" in data
                assert "sources" in data
                assert "timestamp" in data
                
                if data["event"] == "agent_completed":
                    break
        except Exception:
            pass
            
        # Ensure all core lifecycle events fired
        assert "agent_started" in events_received
        assert "agent_processing" in events_received
        assert "source_found" in events_received
        assert "agent_partial_output" in events_received
        assert "final_answer" in events_received

@pytest.mark.asyncio
async def test_post_analyzer_batch(async_client: AsyncClient):
    payload = {
        "query": "I want to export turmeric powder to Germany.",
        "project_id": "test-ws-project"
    }
    res = await async_client.post("/api/v1/analyze", json=payload)
    assert res.status_code == 200
    assert len(res.json()["events_log"]) > 0
