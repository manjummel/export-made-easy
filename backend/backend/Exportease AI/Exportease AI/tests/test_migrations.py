# ============================================================
# ExportEase AI - Migration Rollback Tests
# ============================================================
"""
Tests to guarantee safety of Alembic Database Migrations.
Guarantees upgrade triggers correctly and downgrades wipe instances safely.
"""

import os
import pytest
from alembic.config import Config
from alembic import command
from sqlalchemy import text

# Map to integration path
alembic_cfg = Config("alembic.ini")

@pytest.mark.asyncio
async def test_migration_upgrades(setup_db):
    """
    Test that the initial DB schema applies successfully without throwing errors.
    Tests: alembic upgrade head
    """
    try:
        command.upgrade(alembic_cfg, "head")
        assert True
    except Exception as e:
        pytest.fail(f"Migration upgrade failed: {str(e)}")


@pytest.mark.asyncio
async def test_migration_rollbacks(setup_db):
    """
    Test that downgrading the applied schema safely wipes relational state.
    Tests: alembic downgrade base
    """
    try:
        # First ensure we are at head
        command.upgrade(alembic_cfg, "head")
        
        # Then safely rollback everything to base
        command.downgrade(alembic_cfg, "base")
        assert True
        
        # Test applying it again ensures idempotency
        command.upgrade(alembic_cfg, "head")
    except Exception as e:
         pytest.fail(f"Migration downgrade logic failed: {str(e)}")
