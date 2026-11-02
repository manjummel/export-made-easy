"""
source_registry.py — Mock registry for source metadata retrieval.

As System 2 transitions to PostgreSQL, this interface will be swapped
with a database-backed implementation. For now, it provides a static
dictionary to satisfy System 1's requirements and contract tests.
"""

from __future__ import annotations
from datetime import datetime, timezone
from typing import Dict, Optional

from app.models.responses import SourceResponse


class SourceRegistry:
    """In-memory mock for source metadata retrieval."""

    def __init__(self):
        # We strictly adhere to "Never invent source URLs."
        # Using placeholder dummy domains (example.com) for test data.
        self._sources: Dict[str, SourceResponse] = {
            "src-1001": SourceResponse(
                source_id="src-1001",
                authority="Directorate General of Foreign Trade (DGFT)",
                title="Foreign Trade Policy 2023",
                url="https://www.dgft.gov.in/CP/?opt=ft-policy",
                source_type="regulation",
                publication_date="2023-03-31",
                effective_date="2023-04-01",
                retrieval_date=datetime(2023, 10, 15, 10, 0, 0, tzinfo=timezone.utc),
                language="en",
                verification_status="verified",
            ),
            "src-test-01": SourceResponse(
                source_id="src-test-01",
                authority="Test Authority",
                title="Test Agreement",
                url="https://example.com/test-agreement",
                source_type="agreement",
                publication_date="2022-01-01",
                effective_date="2022-01-01",
                retrieval_date=datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
                language="en",
                verification_status="unverified",
            )
        }

    def get_source(self, source_id: str) -> Optional[SourceResponse]:
        """Retrieve source by ID."""
        return self._sources.get(source_id)

    def register_source(self, source: SourceResponse) -> SourceResponse:
        """Register or update a source in the registry."""
        self._sources[source.source_id] = source
        return source


# Singleton
_registry = SourceRegistry()

def get_source_registry() -> SourceRegistry:
    return _registry
