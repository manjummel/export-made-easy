"""
ai_engine/tests/test_contracts.py

Contract schema validation tests.
Verifies that:
1. All required contract files exist and are valid JSON
2. Python Pydantic schemas match the authoritative JSON contracts
3. EventType enum values match the contract event_types.json
"""

from __future__ import annotations

import json
import os
import pytest
from pathlib import Path


# -----------------------------------------------------------------------
# Locate contracts directory
# -----------------------------------------------------------------------

def _contracts_dir() -> Path:
    """Find the contracts/ directory relative to the project root."""
    # From ai_engine/tests/ go up two levels to exportease/
    here = Path(__file__).parent
    root = here.parent.parent
    contracts = root / "contracts"
    return contracts


CONTRACTS_DIR = _contracts_dir()
V1_DIR = CONTRACTS_DIR / "v1"

REQUIRED_FILES = [
    "identifiers.json",
    "request_envelope.json",
    "response_envelope.json",
    "agent_trace.json",
    "knowledge_result.json",
    "event_types.json",
]


# -----------------------------------------------------------------------
# Tests: contract files exist and are valid JSON
# -----------------------------------------------------------------------

def test_contracts_directory_exists():
    assert CONTRACTS_DIR.exists(), f"contracts/ directory not found at {CONTRACTS_DIR}"


def test_contracts_version_file_exists():
    version_file = CONTRACTS_DIR / "VERSION"
    assert version_file.exists(), "contracts/VERSION file missing"
    version = version_file.read_text().strip()
    assert version.startswith("v"), f"VERSION should start with 'v', got: {version}"


def test_contracts_v1_directory_exists():
    assert V1_DIR.exists(), "contracts/v1/ directory missing"


@pytest.mark.parametrize("filename", REQUIRED_FILES)
def test_contract_file_exists(filename):
    filepath = V1_DIR / filename
    assert filepath.exists(), f"Required contract file missing: contracts/v1/{filename}"


@pytest.mark.parametrize("filename", REQUIRED_FILES)
def test_contract_file_is_valid_json(filename):
    filepath = V1_DIR / filename
    if not filepath.exists():
        pytest.skip(f"File not found: {filename}")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert isinstance(data, dict), f"{filename} should be a JSON object"


# -----------------------------------------------------------------------
# Tests: contract loader
# -----------------------------------------------------------------------

def test_contract_loader_loads_all_files():
    from ai_engine.contracts.loader import load_contracts, get_all_contracts
    contracts = load_contracts(str(CONTRACTS_DIR))
    assert len(contracts) == len(REQUIRED_FILES), (
        f"Expected {len(REQUIRED_FILES)} contracts, got {len(contracts)}"
    )


def test_contract_loader_returns_correct_keys():
    from ai_engine.contracts.loader import get_all_contracts, is_loaded
    assert is_loaded()
    contracts = get_all_contracts()
    expected_keys = {f.replace(".json", "") for f in REQUIRED_FILES}
    assert set(contracts.keys()) == expected_keys


def test_contract_get_by_name():
    from ai_engine.contracts.loader import get_contract
    envelope = get_contract("request_envelope")
    assert "properties" in envelope
    assert "request_id" in envelope["properties"]


# -----------------------------------------------------------------------
# Tests: Python schema vs contract alignment
# -----------------------------------------------------------------------

def test_request_envelope_fields_match_contract():
    from ai_engine.contracts.validator import validate_field_presence
    from ai_engine.schemas.common import RequestEnvelope
    fields = {k: True for k in RequestEnvelope.model_fields}
    missing = validate_field_presence("request_envelope", fields, required_only=True)
    assert missing == [], f"RequestEnvelope missing required contract fields: {missing}"


def test_response_envelope_fields_match_contract():
    from ai_engine.contracts.validator import validate_field_presence
    from ai_engine.schemas.common import ResponseEnvelope
    fields = {k: True for k in ResponseEnvelope.model_fields}
    missing = validate_field_presence("response_envelope", fields, required_only=True)
    assert missing == [], f"ResponseEnvelope missing required contract fields: {missing}"


def test_agent_event_fields_match_contract():
    from ai_engine.contracts.validator import validate_field_presence
    from ai_engine.schemas.agent_trace import AgentEvent
    fields = {k: True for k in AgentEvent.model_fields}
    missing = validate_field_presence("agent_trace", fields, required_only=True)
    assert missing == [], f"AgentEvent missing required contract fields: {missing}"


def test_knowledge_result_fields_match_contract():
    from ai_engine.contracts.validator import validate_field_presence
    from ai_engine.schemas.knowledge import KnowledgeResult
    fields = {k: True for k in KnowledgeResult.model_fields}
    missing = validate_field_presence("knowledge_result", fields, required_only=True)
    assert missing == [], f"KnowledgeResult missing required contract fields: {missing}"


def test_event_type_enum_matches_contract():
    from ai_engine.contracts.validator import validate_event_types
    from ai_engine.schemas.agent_trace import EventType
    enum_values = [e.value for e in EventType]
    missing = validate_event_types(enum_values)
    assert missing == [], f"EventType enum missing contract event types: {missing}"
