# ============================================================
# ExportEase AI - Workflow State Machine
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Defines the legal states, transitions, and step data structures
for the MSME export workflow engine.

SAFETY: State transitions are validated at every step.
        Compliance steps cannot be marked COMPLETED without evidence.
        HS Classification cannot be completed without a valid HS code.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Set


# ── Canonical Step States ─────────────────────────────────────

class StepState(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    FAILED = "FAILED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    SKIPPED = "SKIPPED"


# ── Legal State Transitions ───────────────────────────────────
# Defines which transitions are permissible for each source state.

LEGAL_TRANSITIONS: Dict[StepState, Set[StepState]] = {
    StepState.NOT_STARTED:          {StepState.IN_PROGRESS},
    StepState.IN_PROGRESS:          {StepState.COMPLETED, StepState.REVIEW_REQUIRED, StepState.FAILED, StepState.INSUFFICIENT_EVIDENCE},
    StepState.REVIEW_REQUIRED:      {StepState.COMPLETED, StepState.FAILED, StepState.IN_PROGRESS},
    StepState.INSUFFICIENT_EVIDENCE:{StepState.IN_PROGRESS, StepState.SKIPPED},  # Can retry or skip non-blocking
    StepState.FAILED:               {StepState.IN_PROGRESS},                       # Can retry
    StepState.COMPLETED:            set(),                                          # Terminal — cannot regress
    StepState.SKIPPED:              set(),                                          # Terminal
}


# ── Step Data Structure ───────────────────────────────────────

@dataclass
class WorkflowStepData:
    """
    In-memory representation of a single workflow step.
    Synced to/from PostgreSQL ProjectStep model.
    """
    step_name: str
    step_order: int
    status: StepState = StepState.NOT_STARTED
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    confidence: Optional[float] = None
    result_reference: Optional[str] = None   # Agent run ID or JSON ref
    result_summary: Optional[str] = None
    errors: List[str] = field(default_factory=list)
    is_blocking: bool = True                  # If True, INSUFFICIENT_EVIDENCE blocks whole workflow


# ── Workflow State Container ──────────────────────────────────

@dataclass
class WorkflowState:
    """
    Complete in-memory workflow state for a single Export Project.
    Governs all 10 steps and overall project progression.
    """
    project_id: str
    current_step_name: str
    overall_status: str
    steps: List[WorkflowStepData] = field(default_factory=list)

    @property
    def completion_percentage(self) -> float:
        """Calculate actual completion from completed steps — never hard-coded."""
        if not self.steps:
            return 0.0
        completed_count = sum(
            1 for s in self.steps
            if s.status in (StepState.COMPLETED, StepState.SKIPPED)
        )
        return round((completed_count / len(self.steps)) * 100, 1)

    @property
    def has_blocking_failures(self) -> bool:
        """Checks if any blocking step is in INSUFFICIENT_EVIDENCE or FAILED state."""
        return any(
            s.is_blocking and s.status in (StepState.INSUFFICIENT_EVIDENCE, StepState.FAILED)
            for s in self.steps
        )

    def get_step(self, step_name: str) -> Optional[WorkflowStepData]:
        for s in self.steps:
            if s.step_name == step_name:
                return s
        return None


# ── Transition Validator ──────────────────────────────────────

class WorkflowTransition:
    """
    Validates and applies state transitions between workflow steps.
    Enforces domain rules on top of legal state machine transitions.
    """

    @staticmethod
    def validate(step: WorkflowStepData, new_state: StepState) -> tuple[bool, str]:
        """
        Returns (is_valid, error_message).
        Domain rules layered on top of the base legal transition graph.
        """
        # Base legal transition check
        allowed = LEGAL_TRANSITIONS.get(step.status, set())
        if new_state not in allowed:
            return False, (
                f"Illegal transition for step '{step.step_name}': "
                f"{step.status.value} → {new_state.value}. "
                f"Allowed: {[s.value for s in allowed]}"
            )

        # ── Domain-Specific Safety Guards ─────────────────────
        if new_state == StepState.COMPLETED:
            # HS Classification: must have confidence > 0
            if step.step_name == "HS_CLASSIFICATION":
                if step.confidence is None or step.confidence <= 0.0:
                    return False, (
                        "HS Classification cannot be marked COMPLETED without a valid "
                        "confidence score. Evidence may be INSUFFICIENT."
                    )
                if not step.result_reference:
                    return False, (
                        "HS Classification cannot be marked COMPLETED without a result reference (HS code)."
                    )

            # Compliance: must not have INSUFFICIENT_EVIDENCE errors
            if step.step_name in ("COMPLIANCE", "EXPORT_ELIGIBILITY"):
                if any("INSUFFICIENT" in e.upper() for e in step.errors):
                    return False, (
                        f"Step '{step.step_name}' cannot be COMPLETED while "
                        "containing INSUFFICIENT_EVIDENCE errors. Investigate before proceeding."
                    )

            # Risk: must have confidence from previous steps
            if step.step_name == "RISK":
                if step.confidence is None:
                    return False, (
                        "Risk Analysis requires a confidence score derived from previous steps. "
                        "Ensure Compliance and Market Analysis are completed first."
                    )

        return True, ""

    @staticmethod
    def apply(step: WorkflowStepData, new_state: StepState, error: Optional[str] = None) -> WorkflowStepData:
        """Apply a validated transition, updating timestamps."""
        step.status = new_state
        if new_state == StepState.IN_PROGRESS and step.started_at is None:
            step.started_at = datetime.utcnow()
        if new_state in (StepState.COMPLETED, StepState.FAILED, StepState.INSUFFICIENT_EVIDENCE, StepState.SKIPPED):
            step.completed_at = datetime.utcnow()
        if error:
            step.errors.append(error)
        return step
