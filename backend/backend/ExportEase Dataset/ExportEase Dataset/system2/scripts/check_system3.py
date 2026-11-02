#!/usr/bin/env python3
"""
check_system3.py — Optional development script to check System 3 reachability.
"""

import os
import sys
import httpx

def main():
    url = os.environ.get("SYSTEM3_BASE_URL", "http://localhost:8200")
    print(f"Checking System 3 (Backend) at {url}...")
    try:
        resp = httpx.get(f"{url}/health", timeout=5.0)
        resp.raise_for_status()
        print("✓ System 3 is reachable.")
    except Exception as exc:
        print(f"✗ System 3 is NOT reachable: {exc}")
        print("Note: System 3 is an optional dependency during development.")

if __name__ == "__main__":
    main()
