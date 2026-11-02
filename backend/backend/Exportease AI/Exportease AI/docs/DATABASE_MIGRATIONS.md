# ExportEase AI - Database Migrations

## Overview
ExportEase AI (System 3) utilizes **Alembic** mapped with asynchronous **SQLAlchemy 2.x** models to construct its PostgreSQL database schemas. All changes to the database structure—ranging from new AI analytical tables down to auditing tracking logs—must run via an Alembic migration script.

This eliminates state desynchronization across dev environments and production.

## Migration Structure
All configuration sits dynamically tied to your `.env` configs (as loaded in `alembic.ini` + `migrations/env.py`). The actual history of SQL states resides in:
```text
migrations/versions/
├── 001_initial_schema.py   # Baseline containing all 17 initial state tables
```

## Migration Commands Cheat Sheet

These commands guarantee correct database operations mapping.

### 1. Database Initialization & Upgrade (Apply Migrations)
To run the setup from scratch against an empty PostgreSQL instance, run:
```bash
alembic upgrade head
```
*This command asserts all sequential configurations are piped into the database successfully to the latest "head" configuration.*

### 2. Migration Creation (Generating new revisions)
When you alter or add new attributes into `app/models/`, detect and generate a new revision:
```bash
alembic revision --autogenerate -m "Add new market attribute"
```
*Always audit the auto-generated file before committing.*

### 3. Migration Downgrade (Rollback)
If deployment behavior regressions occur due to a DB issue, revert out the current revision safely:
```bash
alembic downgrade -1
```
*To wipe completely to baseline:*
```bash
alembic downgrade base
```

## Rollback Constraints & Testing
Each migration strictly embeds a functional `downgrade()` definition enforcing `op.drop_table` or `op.drop_column`. The migration logic is bound by integration tests (`tests/test_migrations.py`) asserting that upgrades followed by downgrades will NOT break database consistency, allowing immediate functional rollbacks during catastrophic deployments.

**Rule**: The development database can **always** be safely torn down and rebuilt using strictly migrations. Manual `SQL` scripts to build structures are forbidden.
