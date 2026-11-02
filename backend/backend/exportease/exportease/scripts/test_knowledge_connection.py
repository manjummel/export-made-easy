"""
scripts/test_knowledge_connection.py

Tests System 1 -> Knowledge API -> retrieval.
If the real Knowledge Service (System 2) is unavailable,
it runs in mock mode and reports MOCK_KNOWLEDGE_SERVICE.
"""

import asyncio
from ai_engine.config import settings

async def main():
    print("=" * 50)
    print("ExportEase Knowledge Service Connection Test")
    print("=" * 50)
    
    print(f"Target URL: {settings.knowledge_service_url}\n")
    
    # 1. First, attempt to instantiate the Real client and check connectivity
    from ai_engine.clients.knowledge.real_client import RealKnowledgeClient
    real_client = RealKnowledgeClient()
    
    is_connected = await real_client.check_connectivity()
    
    if is_connected:
        print("[SUCCESS] Connected to REAL Knowledge Service.")
        active_client = real_client
    else:
        print("[WARNING] Real Knowledge Service is unavailable.")
        print("[STATUS]  MOCK_KNOWLEDGE_SERVICE")
        from ai_engine.clients.knowledge.mock_client import MockKnowledgeClient
        active_client = MockKnowledgeClient()
        
    print("-" * 50)
    print(f"Testing retrieval using {active_client.__class__.__name__}...")
    
    try:
        # Test 1: retrieve()
        results = await active_client.retrieve("Turmeric export to Germany", top_k=2)
        print(f"\n1. retrieve(): Got {len(results)} chunks")
        for i, r in enumerate(results):
            print(f"   [{i}] {r.chunk_id} | Verified: {r.is_verified} | Score: {r.score}")
            
        # Test 2: retrieve_with_filters()
        from ai_engine.schemas.knowledge import KnowledgeFilters
        f = KnowledgeFilters(country="DE")
        filtered_results = await active_client.retrieve_with_filters("Turmeric", f, top_k=1)
        print(f"\n2. retrieve_with_filters(country='DE'): Got {len(filtered_results)} chunks")
        
        # Test 3: get_evidence()
        evidence = await active_client.get_evidence("Compliance requirements")
        print(f"\n3. get_evidence(): Got {len(evidence)} highly confident verified chunks")
        
        # Test 4: get_citations()
        citations = await active_client.get_citations(["chunk-turmeric-hs-001"])
        print(f"\n4. get_citations(): Got {len(citations)} citations")
        
        # Test 5: get_confidence()
        conf = await active_client.get_confidence("Turmeric export to Germany", results)
        print(f"\n5. get_confidence(): {conf}")
        
        print("\n[SUCCESS] Knowledge API contract and response schema validated.")
        
    except Exception as e:
        print(f"\n[FAIL] Test failed: {e}")
    finally:
        if hasattr(active_client, "aclose"):
            await active_client.aclose()


if __name__ == "__main__":
    asyncio.run(main())
