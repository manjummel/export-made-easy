"""
document_registry.py — Mock registry for document provenance retrieval.

Maintains an in-memory mapping of document_id -> DocumentProvenanceResponse.
"""

from __future__ import annotations
from typing import Dict, Optional
from app.models.responses import DocumentProvenanceResponse


class DocumentRegistry:
    """In-memory mock for document provenance storage."""

    def __init__(self):
        self._records: Dict[str, DocumentProvenanceResponse] = {}

    def save_record(self, record: DocumentProvenanceResponse) -> None:
        self._records[record.document_id] = record

    def get_record(self, document_id: str) -> Optional[DocumentProvenanceResponse]:
        return self._records.get(document_id)

    def delete_record(self, document_id: str) -> bool:
        if document_id in self._records:
            del self._records[document_id]
            return True
        return False


# Singleton
_registry = DocumentRegistry()

def get_document_registry() -> DocumentRegistry:
    return _registry
