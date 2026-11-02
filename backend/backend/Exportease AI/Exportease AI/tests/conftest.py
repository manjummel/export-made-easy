# ============================================================
# ExportEase AI - Test Configuration
# ============================================================
"""
Pytest configuration for ExportEase Backend.
"""

import os
import pytest
from httpx import AsyncClient, ASGITransport

# Force test environment before importing app
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["MOCK_SERVICES"] = "true"
os.environ["REAL_SERVICES"] = "false"

from app.main import app
from app.database import Base, engine


@pytest.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def async_client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        yield client
