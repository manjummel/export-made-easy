#!/usr/bin/env python3
"""
check_system1.py — Optional development script to check System 1 reachability.
"""

import os
import sys
import httpx

def main():
    url = os.environ.get("SYSTEM1_BASE_URL", "http://localhost:8000")
    print(f"Checking System 1 (LLM + Multi-Agent) at {url}...")
    try:
        resp = httpx.get(f"{url}/health", timeout=5.0)
        resp.raise_for_status()
        print("✓ System 1 is reachable.")
    except Exception as exc:
        print(f"✗ System 1 is NOT reachable: {exc}")
        print("Note: System 1 is an optional dependency during development.")

if __name__ == "__main__":
    main()
