# ExportEase Inference API Client Examples (System 3 Integration)

The ExportEase AI Engine (System 1) exposes 8 production endpoints for System 3 consumption. All endpoints conform strictly to the shared JSON contracts.

## OpenAPI Documentation
When the service is running, the interactive OpenAPI UI is available at:
- **Swagger**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`
- **JSON Schema**: `http://localhost:8001/openapi.json`

---

## Python Integration Example (System 3)

Below is a complete python snippet using `httpx` showing how System 3 should hit the `/api/v1/ai/analyze` and individual agent endpoints.

```python
import httpx
import uuid
import json

AI_ENGINE_URL = "http://localhost:8001/api/v1/ai"

def make_request(endpoint: str, query: str, country: str, project_id: str):
    request_id = str(uuid.uuid4())
    
    # 1. Payload complies with request_envelope.json contract
    payload = {
        "request_id": request_id,
        "project_id": project_id,
        "language": "en",
        "query": query,
        "target_country": country
    }
    
    print(f"[{endpoint.upper()}] Sending Request: {request_id}")
    
    resp = httpx.post(f"{AI_ENGINE_URL}/{endpoint}", json=payload, timeout=30.0)
    
    if resp.status_code != 200:
        print(f"Error: {resp.status_code} - {resp.text}")
        return None
        
    response_envelope = resp.json()
    
    # 2. Verify response_envelope.json contract
    print(f"Status: {response_envelope['status']}")
    print(f"Confidence: {response_envelope['confidence']}")
    print(f"Data Keys: {list(response_envelope['data'].keys())}")
    
    return response_envelope

# Example Runs
if __name__ == "__main__":
    proj_id = "proj-msme-turmeric-101"
    
    # E2E analysis across the 8-agent LangGraph workflow
    make_request("analyze", "I want to export turmeric powder to Germany.", "Germany", proj_id)
    
    # Individual Agent Calls
    make_request("classify", "Turmeric powder", "Germany", proj_id)
    make_request("compliance", "Turmeric powder to Germany", "Germany", proj_id)
```

## JSON Payloads Schema Reference

### Request Envelope (`POST /api/v1/ai/analyze`)
```json
{
  "request_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "project_id": "proj-123",
  "language": "en",
  "query": "I want to export turmeric powder to Germany.",
  "target_country": "Germany"
}
```

### Response Envelope
```json
{
  "request_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "project_id": "proj-123",
  "status": "SUCCESS",
  "confidence": 0.95,
  "data": {
    "output_text": "Detailed analysis content...",
    "source_ids": ["doc-hs-090230"],
    "agent_events": [
      {
        "agent_name": "hs_agent",
        "event_type": "completed",
        "agent_run_id": "run-xyz-123",
        "timestamp": "2026-08-12T12:00:00Z"
      }
    ]
  },
  "errors": []
}
```
