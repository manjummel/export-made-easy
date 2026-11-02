# ============================================================
# ExportEase AI - Workflow Engine Tests
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Tests for the ExportEase MSME export workflow engine.
Covers:
- Workflow initialization (all 10 steps created)
- Legal state transitions
- Illegal state transitions (blocked)
- Domain safety guards (HS classification, compliance, risk)
- Completion percentage calculation
- INSUFFICIENT_EVIDENCE handling
- Blocking step → REVIEW_REQUIRED propagation
"""

import pytest

from app.workflows.states import (
    WorkflowState,
    WorkflowStepData,
    WorkflowTransition,
    StepState,
    LEGAL_TRANSITIONS,
)
from app.workflows.export_steps import STEP_DEFINITIONS, get_step_definition
from app.workflows.engine import WorkflowDomainEngine


# ── Unit Tests: State Machine ─────────────────────────────────

class TestLegalTransitions:
    """Unit tests for the state transition graph."""

    def test_not_started_can_move_to_in_progress(self):
        step = WorkflowStepData("TEST", 0, StepState.NOT_STARTED)
        valid, msg = WorkflowTransition.validate(step, StepState.IN_PROGRESS)
        assert valid, msg

    def test_in_progress_can_complete(self):
        step = WorkflowStepData("TEST", 0, StepState.IN_PROGRESS, confidence=0.9, result_reference="ref1")
        valid, msg = WorkflowTransition.validate(step, StepState.COMPLETED)
        assert valid, msg

    def test_in_progress_can_fail(self):
        step = WorkflowStepData("TEST", 0, StepState.IN_PROGRESS)
        valid, msg = WorkflowTransition.validate(step, StepState.FAILED)
        assert valid, msg

    def test_in_progress_can_hit_insufficient_evidence(self):
        step = WorkflowStepData("TEST", 0, StepState.IN_PROGRESS)
        valid, msg = WorkflowTransition.validate(step, StepState.INSUFFICIENT_EVIDENCE)
        assert valid, msg

    def test_completed_cannot_regress(self):
        """COMPLETED is terminal — no further transitions allowed."""
        step = WorkflowStepData("TEST", 0, StepState.COMPLETED)
        valid, _ = WorkflowTransition.validate(step, StepState.IN_PROGRESS)
        assert not valid

    def test_completed_cannot_go_to_failed(self):
        step = WorkflowStepData("TEST", 0, StepState.COMPLETED)
        valid, _ = WorkflowTransition.validate(step, StepState.FAILED)
        assert not valid

    def test_not_started_cannot_jump_to_completed(self):
        """Must pass through IN_PROGRESS first."""
        step = WorkflowStepData("TEST", 0, StepState.NOT_STARTED)
        valid, _ = WorkflowTransition.validate(step, StepState.COMPLETED)
        assert not valid

    def test_failed_can_retry_in_progress(self):
        step = WorkflowStepData("TEST", 0, StepState.FAILED)
        valid, msg = WorkflowTransition.validate(step, StepState.IN_PROGRESS)
        assert valid, msg

    def test_review_required_can_be_resolved(self):
        step = WorkflowStepData("TEST", 0, StepState.REVIEW_REQUIRED)
        valid, msg = WorkflowTransition.validate(step, StepState.COMPLETED)
        assert valid, msg


class TestDomainSafetyGuards:
    """Unit tests for step-specific safety rules."""

    def test_hs_classification_cannot_complete_without_confidence(self):
        """HS Classification requires confidence > 0."""
        step = WorkflowStepData("HS_CLASSIFICATION", 2, StepState.IN_PROGRESS)
        step.confidence = None  # No confidence
        step.result_reference = "hs_run_123"
        valid, msg = WorkflowTransition.validate(step, StepState.COMPLETED)
        assert not valid
        assert "confidence" in msg.lower()

    def test_hs_classification_cannot_complete_without_result_reference(self):
        """HS Classification requires a result reference (HS code run)."""
        step = WorkflowStepData("HS_CLASSIFICATION", 2, StepState.IN_PROGRESS)
        step.confidence = 0.85
        step.result_reference = None  # No reference
        valid, msg = WorkflowTransition.validate(step, StepState.COMPLETED)
        assert not valid
        assert "result reference" in msg.lower()

    def test_hs_classification_completes_with_valid_data(self):
        step = WorkflowStepData("HS_CLASSIFICATION", 2, StepState.IN_PROGRESS)
        step.confidence = 0.85
        step.result_reference = "agent_run_abc123"
        valid, msg = WorkflowTransition.validate(step, StepState.COMPLETED)
        assert valid, msg

    def test_compliance_cannot_complete_with_insufficient_evidence_error(self):
        """Compliance with INSUFFICIENT_EVIDENCE in errors cannot be COMPLETED."""
        step = WorkflowStepData("COMPLIANCE", 4, StepState.IN_PROGRESS)
        step.confidence = 0.5
        step.errors = ["INSUFFICIENT_EVIDENCE: FSSAI regulation data missing"]
        valid, msg = WorkflowTransition.validate(step, StepState.COMPLETED)
        assert not valid

    def test_risk_analysis_cannot_complete_without_confidence(self):
        """Risk step requires confidence derived from previous steps."""
        step = WorkflowStepData("RISK", 8, StepState.IN_PROGRESS)
        step.confidence = None
        valid, msg = WorkflowTransition.validate(step, StepState.COMPLETED)
        assert not valid
        assert "confidence" in msg.lower()


class TestCompletionPercentage:
    """Unit tests for real completion percentage calculation."""

    def _make_state(self, statuses: list[StepState]) -> WorkflowState:
        steps = [
            WorkflowStepData(f"STEP_{i}", i, status)
            for i, status in enumerate(statuses)
        ]
        return WorkflowState(
            project_id="test-proj",
            current_step_name="STEP_0",
            overall_status="IN_PROGRESS",
            steps=steps,
        )

    def test_zero_completion_when_nothing_done(self):
        state = self._make_state([StepState.NOT_STARTED] * 10)
        assert state.completion_percentage == 0.0

    def test_full_completion_when_all_done(self):
        state = self._make_state([StepState.COMPLETED] * 10)
        assert state.completion_percentage == 100.0

    def test_50_percent_when_5_of_10_complete(self):
        statuses = [StepState.COMPLETED] * 5 + [StepState.NOT_STARTED] * 5
        state = self._make_state(statuses)
        assert state.completion_percentage == 50.0

    def test_skipped_counts_as_completed(self):
        """SKIPPED steps are non-blocking completions."""
        statuses = [StepState.COMPLETED] * 4 + [StepState.SKIPPED] + [StepState.NOT_STARTED] * 5
        state = self._make_state(statuses)
        assert state.completion_percentage == 50.0

    def test_in_progress_does_not_count(self):
        statuses = [StepState.IN_PROGRESS] * 10
        state = self._make_state(statuses)
        assert state.completion_percentage == 0.0


class TestStepDefinitions:
    """Unit tests for the canonical step registry."""

    def test_exactly_10_steps_defined(self):
        assert len(STEP_DEFINITIONS) == 10

    def test_steps_are_sequential(self):
        orders = [s.order for s in STEP_DEFINITIONS]
        assert orders == list(range(10))

    def test_compliance_steps_require_rag(self):
        """Steps 3–7 must require RAG for regulatory grounding."""
        rag_required_steps = {"HS_CLASSIFICATION", "EXPORT_ELIGIBILITY", "COMPLIANCE", "DOCUMENTS", "CERTIFICATIONS"}
        for step in STEP_DEFINITIONS:
            if step.name in rag_required_steps:
                assert step.requires_rag, f"Step {step.name} must require RAG"

    def test_compliance_is_blocking(self):
        """COMPLIANCE must be a blocking step."""
        step = get_step_definition("COMPLIANCE")
        assert step is not None
        assert step.is_blocking is True

    def test_risk_is_not_blocking(self):
        """RISK is advisory — non-blocking."""
        step = get_step_definition("RISK")
        assert step is not None
        assert step.is_blocking is False

    def test_market_is_not_blocking(self):
        """DESTINATION_MARKET is advisory — non-blocking."""
        step = get_step_definition("DESTINATION_MARKET")
        assert step is not None
        assert step.is_blocking is False


class TestBlockingFailureDetection:
    """Tests for blocking failure detection in WorkflowState."""

    def test_has_blocking_failures_when_blocking_step_fails(self):
        steps = [
            WorkflowStepData("HS_CLASSIFICATION", 2, StepState.INSUFFICIENT_EVIDENCE, is_blocking=True),
        ]
        state = WorkflowState("proj", "HS_CLASSIFICATION", "REVIEW_REQUIRED", steps)
        assert state.has_blocking_failures is True

    def test_no_blocking_failure_when_non_blocking_step_fails(self):
        steps = [
            WorkflowStepData("RISK", 8, StepState.INSUFFICIENT_EVIDENCE, is_blocking=False),
        ]
        state = WorkflowState("proj", "RISK", "IN_PROGRESS", steps)
        assert state.has_blocking_failures is False

    def test_no_blocking_failure_when_all_steps_completed(self):
        steps = [
            WorkflowStepData(f"STEP_{i}", i, StepState.COMPLETED, is_blocking=True)
            for i in range(10)
        ]
        state = WorkflowState("proj", "EXPORT_PLAN", "COMPLETED", steps)
        assert state.has_blocking_failures is False


# ── Integration Tests ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_workflow_domain_integration(async_client, setup_db):
    """
    Integration test: Initialize a workflow and advance through steps.
    """
    from httpx import AsyncClient

    # Register and login user
    await async_client.post(
        "/api/v1/auth/register",
        json={"email": "workflow_domain@exportease.ai", "password": "SecurePassword123", "full_name": "Domain Tester"}
    )
    login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "workflow_domain@exportease.ai", "password": "SecurePassword123"}
    )
    headers = {"Authorization": f"Bearer {login.json()['data']['access_token']}"}

    # Create MSME + Project
    msme = await async_client.post(
        "/api/v1/msme-profiles/", headers=headers, json={"company_name": "Workflow Test MSME"}
    )
    proj = await async_client.post(
        "/api/v1/projects/", headers=headers,
        json={"msme_id": msme.json()["data"]["id"], "project_name": "Workflow Test Project"}
    )
    assert proj.status_code == 201
    project_id = proj.json()["data"]["id"]

    # Initialize workflow via API
    init = await async_client.post(f"/api/v1/workflow/{project_id}/initialize", headers=headers)
    assert init.status_code == 200
    init_data = init.json()["data"]
    assert init_data["total_steps"] == 10
    assert init_data["current_step"] == "MSME_PROFILE"

    # Get status — step 1 should be IN_PROGRESS
    status = await async_client.get(f"/api/v1/workflow/{project_id}/status", headers=headers)
    assert status.status_code == 200
    steps = status.json()["data"]["steps"]
    assert len(steps) == 10
    assert steps[0]["status"] == "IN_PROGRESS"   # MSME_PROFILE
    assert steps[1]["status"] == "NOT_STARTED"    # PRODUCT

    # Completion percentage should be 0 (no steps complete yet)
    assert status.json()["data"]["completion_percentage"] == 0.0
