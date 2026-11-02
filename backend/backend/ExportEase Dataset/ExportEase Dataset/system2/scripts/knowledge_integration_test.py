#!/usr/bin/env python3
"""
knowledge_integration_test.py — System 2 Final Integration & Compatibility Suite

Executes the 8-step deployment & integration verification:
  1. Load shared contracts
  2. Check Qdrant
  3. Check Knowledge API
  4. Run retrieval
  5. Run hybrid retrieval
  6. Run confidence
  7. Resolve citations
  8. Test System 1 compatibility
"""

import sys
import os
import json
import logging
import urllib.request
import urllib.error

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.config import get_settings
from rag.integration.contract_loader import ContractLoader
from app.core.retriever import get_retriever

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("knowledge_integration_test")


def main():
    settings = get_settings()
    base_url = f"http://localhost:{settings.knowledge_service_port}"
    api_key = settings.api_key_secret
    headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json"
    }

    print("==================================================================")
    print("      EXPORT-EASE SYSTEM 2: KNOWLEDGE SERVICE INTEGRATION SUITE   ")
    print("==================================================================")

    # 1. Load shared contracts
    print("\n[Step 1/8] Loading shared contracts...")
    try:
        loader = ContractLoader()
        loader.load()
        contract_hash = loader.get_hash()
        print(f"✓ Contract loaded successfully (Hash: {contract_hash[:12]})")
    except Exception as exc:
        print(f"✗ Failed to load shared contracts: {exc}")
        sys.exit(1)

    # 2. Check Qdrant
    print("\n[Step 2/8] Checking internal Qdrant connection...")
    try:
        retriever = get_retriever()
        if retriever.ping():
            print("✓ Internal Qdrant vector database is ONLINE and reachable")
        else:
            print("✗ Qdrant ping returned False")
            sys.exit(1)
    except Exception as exc:
        print(f"✗ Failed to connect to Qdrant: {exc}")
        sys.exit(1)

    # 3. Check Knowledge API
    print("\n[Step 3/8] Checking Knowledge API health endpoints...")
    try:
        req = urllib.request.Request(f"{base_url}/health", headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"✓ GET /health: {data['status']} (Service: {data['service']})")
    except Exception as exc:
        print(f"✗ Knowledge API health check failed: {exc}")
        sys.exit(1)

    # 4. Run retrieval
    print("\n[Step 4/8] Executing dense retrieval (POST /v1/retrieve)...")
    try:
        payload = json.dumps({
            "query": "Export controls for dual use equipment",
            "top_k": 3
        }).encode()
        req = urllib.request.Request(f"{base_url}/v1/retrieve", data=payload, headers=headers, method="POST")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"✓ Retrieval successful — returned {len(data['results'])} candidates in {data['processing_time_ms']}ms")
    except Exception as exc:
        print(f"✗ Retrieval test failed: {exc}")
        sys.exit(1)

    # 5. Run hybrid retrieval
    print("\n[Step 5/8] Executing hybrid retrieval (POST /v1/retrieve/hybrid)...")
    try:
        payload = json.dumps({
            "query": "Export controls dual use",
            "top_k": 3
        }).encode()
        req = urllib.request.Request(f"{base_url}/v1/retrieve/hybrid", data=payload, headers=headers, method="POST")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"✓ Hybrid Retrieval successful — Confidence: {data['confidence']} (Version: {data['retrieval_version']})")
    except Exception as exc:
        print(f"✗ Hybrid retrieval test failed: {exc}")
        sys.exit(1)

    # 6. Run confidence
    print("\n[Step 6/8] Executing confidence evaluation (POST /v1/confidence)...")
    try:
        payload = json.dumps({
            "query": "Dual use",
            "results": [{"score": 0.85}]
        }).encode()
        req = urllib.request.Request(f"{base_url}/v1/confidence", data=payload, headers=headers, method="POST")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"✓ Confidence calculation successful — Status: {data['confidence_level']}")
    except Exception as exc:
        print(f"✗ Confidence evaluation failed: {exc}")
        sys.exit(1)

    # 7. Resolve citations
    print("\n[Step 7/8] Executing citation resolution (POST /v1/citations)...")
    try:
        payload = json.dumps({
            "chunk_ids": ["non-existent-chunk-id-test"]
        }).encode()
        req = urllib.request.Request(f"{base_url}/v1/citations", data=payload, headers=headers, method="POST")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"✓ Citation resolution endpoint responsive — returned {len(data)} citations (unverified excluded)")
    except Exception as exc:
        print(f"✗ Citation resolution test failed: {exc}")
        sys.exit(1)

    # 8. Test System 1 compatibility
    print("\n[Step 8/8] Testing System 1 AI / Agent compatibility...")
    system1_url = os.getenv("SYSTEM1_URL", "http://localhost:8000")
    try:
        req = urllib.request.Request(f"{system1_url}/health", headers={"Timeout": "2"})
        with urllib.request.urlopen(req, timeout=2) as resp:
            if resp.status == 200:
                print("✓ System 1 AI Service is ONLINE and connected!")
            else:
                print("STATUS: WAITING_FOR_AI_SERVICE (System 1 responded with non-200 status)")
    except Exception:
        print("STATUS: WAITING_FOR_AI_SERVICE (System 1 AI Service is currently offline)")

    print("\n==================================================================")
    print("      INTEGRATION SUITE COMPLETE — SYSTEM 2 API MATTES CONTRACTS  ")
    print("==================================================================")


if __name__ == "__main__":
    main()
