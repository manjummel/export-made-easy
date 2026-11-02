"""
conftest.py — pytest configuration for ExportEase AI Engine tests.

Configures:
- asyncio mode (auto)
- Contract loading for all tests
- Shared test fixtures
"""

import pytest
import asyncio
from pathlib import Path


def pytest_configure(config):
    """Load contracts at test session start."""
    contracts_dir = Path(__file__).parent / "contracts"
    if contracts_dir.exists():
        try:
            from ai_engine.contracts.loader import load_contracts
            load_contracts(str(contracts_dir))
        except Exception as e:
            print(f"Warning: Could not load contracts: {e}")


# asyncio event loop policy for Windows
@pytest.fixture(scope="session")
def event_loop_policy():
    return asyncio.DefaultEventLoopPolicy()
