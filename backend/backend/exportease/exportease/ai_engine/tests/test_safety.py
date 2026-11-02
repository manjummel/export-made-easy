"""
ai_engine/tests/test_safety.py

Unit and integration tests for Prompt 16 safety features.
Tests adversarial prompts and strict grounding constraints.
"""

import pytest
from ai_engine.safety.grounding import GroundingChecker, GroundingState
from ai_engine.safety.grounding_policy import GroundingPolicy
from ai_engine.safety.hallucination_guard import HallucinationGuard
from ai_engine.safety.output_validator import OutputValidator

def test_adversarial_patterns():
    # Hallucination Guard must catch adversarial attempts
    assert HallucinationGuard.is_hallucinating("I am guessing the hs code for turmeric is 0902.") is True
    assert HallucinationGuard.is_hallucinating("This is an invented rule for DGFT exports.") is True
    
    # Normal text should pass
    assert HallucinationGuard.is_hallucinating("The official HS code is 0910.30.") is False

def test_grounding_policy_mapping():
    # Enforces NO VERIFIED EVIDENCE -> INSUFFICIENT_EVIDENCE mapping
    checker = GroundingChecker()
    # Mocking empty results
    res = checker.check([])
    assert res.state == GroundingState.INSUFFICIENT_GROUNDING
    
    policy_status = GroundingPolicy.enforce(res)
    assert policy_status == "INSUFFICIENT_EVIDENCE"

def test_output_validator():
    # Valid output passes
    assert OutputValidator.validate("Here is the verified export plan.") is True
    # Invalid or hallucinated output fails
    assert OutputValidator.validate("") is False
    assert OutputValidator.validate("I am guessing the hs code is 1234") is False
