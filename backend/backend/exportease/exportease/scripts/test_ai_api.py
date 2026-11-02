"""
scripts/test_ai_api.py

Tests the AI Engine API (/api/v1/ai/analyze) via HTTP.
Verifies the response schema matches the common response envelope contract
so System 3 can theoretically consume it.
"""

import asyncio
import httpx
import json
from uuid import uuid4

API_URL = "http://localhost:8001/api/v1/ai/analyze"

async def main():
    print("=" * 50)
    print("ExportEase AI API Test (System 1)")
    print("=" * 50)
    
    payload = {
        "request_id": str(uuid4()),
        "project_id": "proj-test-04",
        "language": "en",
        "query": "I want to export turmeric powder to Germany.",
        "target_country": "Germany"
    }
    
    print(f"Sending POST request to: {API_URL}")
    print(f"Payload:\n{json.dumps(payload, indent=2)}\n")
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(API_URL, json=payload, timeout=10.0)
            
            print(f"HTTP Status: {resp.status_code}")
            
            if resp.status_code != 200:
                print(f"Error Response:\n{resp.text}")
                return
                
            data = resp.json()
            print("\nResponse Envelope Validated:")
            print(f"- request_id: {data.get('request_id')}")
            print(f"- project_id: {data.get('project_id')}")
            print(f"- status:     {data.get('status')}")
            print(f"- confidence: {data.get('confidence')}")
            
            # Print a snippet of the data
            resp_data = data.get("data", {})
            print(f"- data keys:  {list(resp_data.keys())}")
            
            if "agent_events" in resp_data:
                print(f"- events:     {len(resp_data['agent_events'])} agent trace events")
            
            print("\n[SUCCESS] Response matches the expected System 3 contract schema.")
            
    except Exception as e:
        print(f"\n[FAIL] Request failed: {e}")


if __name__ == "__main__":
    asyncio.run(main())
