"""
cleaner.py — Document cleaning and deduplication pipeline.
"""
import re
import hashlib
from typing import List, Tuple, Dict, Any
from app.models.responses import NormalizedRecord

class DocumentCleaner:
    @staticmethod
    def _generate_chunk_id(document_id: str, text: str) -> str:
        # Create a stable, deterministic chunk ID based on document and content
        payload = f"{document_id}:{text}".encode("utf-8")
        chunk_hash = hashlib.sha256(payload).hexdigest()[:16]
        return f"chk-{chunk_hash}"

    @staticmethod
    def clean_text(text: str) -> str:
        """Strip excess whitespace and remove non-printable characters."""
        # Remove non-printable control characters (except newlines/tabs)
        cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
        # Normalize excessive whitespace/newlines
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
        cleaned = re.sub(r'[ \t]+', ' ', cleaned)
        return cleaned.strip()

    @staticmethod
    def deduplicate(chunks: List[str]) -> List[str]:
        """Remove exact duplicate chunks using SHA-256 hashing."""
        seen = set()
        unique_chunks = []
        for chunk in chunks:
            chunk_hash = hashlib.sha256(chunk.encode("utf-8")).hexdigest()
            if chunk_hash not in seen:
                seen.add(chunk_hash)
                unique_chunks.append(chunk)
        return unique_chunks

    @staticmethod
    def validate_chunks(
        chunks: List[str], document_id: str, metadata: Dict[str, Any]
    ) -> Tuple[List[str], List[Dict[str, Any]]]:
        """
        Validates chunks against the NormalizedRecord schema.
        Returns (valid_chunks, rejected_records).
        """
        from app.core.chunk_registry import get_chunk_registry
        
        valid_chunks = []
        rejected_records = []
        registered_data = []
        
        for i, chunk_text in enumerate(chunks):
            # Domain-aware chunking requires stable IDs across re-indexing
            chunk_id = DocumentCleaner._generate_chunk_id(document_id, chunk_text)
            try:
                # Attempt to map to the shared knowledge schema
                record = NormalizedRecord(
                    chunk_id=chunk_id,
                    document_id=document_id,
                    source_id=metadata.get("source_id"),
                    text=chunk_text,
                    authority=metadata.get("authority"),
                    title=metadata.get("title"),
                    topic=metadata.get("topic"),
                    product=metadata.get("product"),
                    hs_code=metadata.get("hs_code"),
                    country=metadata.get("jurisdiction", metadata.get("country")),
                    language=metadata.get("language"),
                    page=metadata.get("page"),
                    section=metadata.get("section"),
                    publication_date=metadata.get("publication_date"),
                    effective_date=metadata.get("effective_date"),
                    superseded=metadata.get("superseded"),
                    dataset_version=metadata.get("dataset_version"),
                    verification_status=metadata.get("verification_status")
                )
                valid_chunks.append(chunk_text)
                registered_data.append(record.model_dump())
            except Exception as e:
                rejected_records.append({
                    "chunk_id": chunk_id,
                    "document_id": document_id,
                    "reason": str(e),
                    "text_preview": chunk_text[:100]
                })
                
        if registered_data:
            get_chunk_registry().log_chunks(document_id, registered_data)
                
        return valid_chunks, rejected_records
                NormalizedRecord(
                    chunk_id=chunk_id,
                    document_id=document_id,
                    source_id=metadata.get("source_id"),
                    text=chunk_text,
                    authority=metadata.get("authority"),
                    title=metadata.get("title"),
                    topic=metadata.get("topic"),
                    product=metadata.get("product"),
                    hs_code=metadata.get("hs_code"),
                    country=metadata.get("jurisdiction", metadata.get("country")),
                    language=metadata.get("language"),
                    page=metadata.get("page"),
                    section=metadata.get("section"),
                    publication_date=metadata.get("publication_date"),
                    effective_date=metadata.get("effective_date"),
                    verification_status=metadata.get("verification_status")
                )
                valid_chunks.append(chunk_text)
            except Exception as e:
                rejected_records.append({
                    "chunk_id": chunk_id,
                    "document_id": document_id,
                    "reason": str(e),
                    "text_preview": chunk_text[:100]
                })
                
        return valid_chunks, rejected_records
