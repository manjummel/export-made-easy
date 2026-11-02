"""
scripts/check_connectivity.py

Tests connectivity for:
1. AI Engine Local Health (System 1)
2. Knowledge Service (System 2)
3. Backend Service (System 3)

Classifies services as unavailable rather than pretending they are connected.
"""

import asyncio
import httpx
from typing import Dict

# URLs (mocked ports based on standard setup)
AI_URL = "http://localhost:8001/health"
KNOWLEDGE_URL = "http://localhost:8002/health"
BACKEND_URL = "http://localhost:8003/health"

async def check_service(name: str, url: str) -> Dict[str, str]:
    print(f"Checking {name} at {url}...")
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=3.0)
            if resp.status_code == 200:
                return {"name": name, "status": "REACHABLE", "url": url}
            else:
                return {"name": name, "status": f"UNAVAILABLE (HTTP {resp.status_code})", "url": url}
    except Exception as e:
        return {"name": name, "status": f"UNAVAILABLE ({type(e).__name__})", "url": url}


async def main():
    print("=" * 50)
    print("ExportEase Connectivity Check")
    print("=" * 50)
    
    results = await asyncio.gather(
        check_service("AI Engine Local", AI_URL),
        check_service("Knowledge Service", KNOWLEDGE_URL),
        check_service("Backend Service", BACKEND_URL)
    )
    
    print("\nResults:")
    print("-" * 50)
    for r in results:
        print(f"{r['name']:<25} | {r['status']}")
    print("-" * 50)


if __name__ == "__main__":
    asyncio.run(main())
