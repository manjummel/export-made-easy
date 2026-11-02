import pytest
from pydantic import ValidationError
from app.schemas.export_plan import PlanStep, Citation

def test_plan_step_valid_evidence():
    """Ensure a plan step with high confidence and evidence passes."""
    step = PlanStep(
        title="Test valid step",
        description="A valid description.",
        status="PENDING",
        prerequisites=[],
        next_action="Go ahead",
        evidence="We verified this in our DB.",
        citations=[Citation(source="DB Resource")],
        confidence=0.9
    )
    assert step.title == "Test valid step"

def test_plan_step_rejects_missing_evidence():
    """Ensure high confidence steps without evidence are blocked (No unsupported factual claims)."""
    with pytest.raises(ValidationError) as exc:
        PlanStep(
            title="Test invalid step missing evidence",
            description="A valid description.",
            status="PENDING",
            prerequisites=[],
            next_action="Go ahead",
            evidence="",  # Missing evidence
            citations=[Citation(source="DB Resource")],
            confidence=0.9 # High confidence triggers the check
        )
    assert "Unsupported factual claims are not allowed. Provide evidence." in str(exc.value)
    
def test_plan_step_rejects_missing_citations():
    """Ensure high confidence steps without citations are blocked."""
    with pytest.raises(ValidationError) as exc:
        PlanStep(
            title="Test invalid step missing citations",
            description="A valid description.",
            status="PENDING",
            prerequisites=[],
            next_action="Go ahead",
            evidence="I claim this is true.",
            citations=[], # Missing citations
            confidence=0.9 # High confidence triggers the check
        )
    assert "Supported factual claims require at least one citation track back." in str(exc.value)
