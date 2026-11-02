"""
chunker.py — Text chunking strategies for EXPORT-EASE-KNOWLEDGE-V1

Provides:
  - TextChunker: configurable recursive splitter
  - ExportDocumentChunker: domain-aware chunking for export trade documents
    (respects HS code boundaries, regulation section headers, etc.)
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class TextChunk:
    """A single chunk of text with positional metadata."""
    content: str
    chunk_index: int
    start_char: int
    end_char: int
    word_count: int = field(init=False)

    def __post_init__(self):
        self.word_count = len(self.content.split())


class TextChunker:
    """
    Recursive character-level text chunker with configurable size and overlap.

    Uses a priority list of separators, falling back to character splits.
    Suitable for general plain text and JSON documents.
    """

    DEFAULT_SEPARATORS = ["\n\n", "\n", ". ", "! ", "? ", ", ", " ", ""]

    def __init__(
        self,
        chunk_size: int = 512,
        chunk_overlap: int = 64,
        separators: Optional[List[str]] = None,
    ) -> None:
        if chunk_overlap >= chunk_size:
            raise ValueError(f"chunk_overlap ({chunk_overlap}) must be < chunk_size ({chunk_size})")
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or self.DEFAULT_SEPARATORS

    def split(self, text: str) -> List[TextChunk]:
        """Split text into overlapping chunks."""
        if not text or not text.strip():
            return []

        raw_chunks = self._recursive_split(text, self.separators)
        merged = self._merge_chunks(raw_chunks)
        return self._build_chunk_objects(merged, text)

    def split_texts(self, texts: List[str]) -> List[List[TextChunk]]:
        """Split multiple texts, returning a list of chunk lists."""
        return [self.split(t) for t in texts]

    # ── Private ───────────────────────────────────────────────────────────────

    def _recursive_split(self, text: str, separators: List[str]) -> List[str]:
        """Recursively split text using separators from most to least preferred."""
        final_chunks: List[str] = []
        separator = separators[-1]
        new_separators: List[str] = []

        for i, sep in enumerate(separators):
            if sep == "":
                separator = sep
                break
            if sep in text:
                separator = sep
                new_separators = separators[i + 1:]
                break

        splits = text.split(separator) if separator else list(text)
        good_splits: List[str] = []

        for s in splits:
            if len(s) < self.chunk_size:
                good_splits.append(s)
            else:
                if good_splits:
                    final_chunks.extend(self._merge_splits(good_splits, separator))
                    good_splits = []
                if new_separators:
                    other_info = self._recursive_split(s, new_separators)
                    final_chunks.extend(other_info)
                else:
                    final_chunks.append(s)

        if good_splits:
            final_chunks.extend(self._merge_splits(good_splits, separator))

        return final_chunks

    def _merge_splits(self, splits: List[str], separator: str) -> List[str]:
        """Merge small splits back together until chunk_size is reached."""
        merged: List[str] = []
        current: List[str] = []
        current_len = 0

        for split in splits:
            split_len = len(split)
            sep_len = len(separator)
            total = current_len + (sep_len if current else 0) + split_len

            if total > self.chunk_size and current:
                merged.append(separator.join(current))
                while current and (current_len > self.chunk_overlap or
                                   (current_len + sep_len + split_len > self.chunk_size and current_len > 0)):
                    current_len -= len(current[0]) + (sep_len if len(current) > 1 else 0)
                    current = current[1:]

            current.append(split)
            current_len += split_len + (sep_len if len(current) > 1 else 0)

        if current:
            merged.append(separator.join(current))

        return merged

    def _merge_chunks(self, raw: List[str]) -> List[str]:
        """Post-process: remove empty strings."""
        return [c.strip() for c in raw if c.strip()]

    def _build_chunk_objects(self, chunks: List[str], original: str) -> List[TextChunk]:
        """Build TextChunk objects with positional metadata."""
        result: List[TextChunk] = []
        search_start = 0
        for i, chunk_text in enumerate(chunks):
            pos = original.find(chunk_text, search_start)
            start = pos if pos != -1 else search_start
            end = start + len(chunk_text)
            result.append(TextChunk(
                content=chunk_text,
                chunk_index=i,
                start_char=start,
                end_char=end,
            ))
            search_start = max(0, end - self.chunk_overlap)
        return result


class ExportDocumentChunker(TextChunker):
    """
    Domain-aware chunker for export trade documents.

    Adds awareness of:
      - HS code entries (e.g. "8708 — Parts of motor vehicles")
      - Regulation section headers (e.g. "Section 3:", "Article 12")
      - Trade agreement clauses (e.g. "Clause 4.2")
    """

    # Patterns that should always start a new chunk
    SECTION_BREAK_PATTERNS = [
        r"^HS\s*Code\s*\d{4,8}",          # HS Code 8708
        r"^\d{4,8}\s*[—–-]",              # 8708 — Parts...
        r"^(Section|Article|Clause|Chapter)\s+\d",
        r"^(SECTION|ARTICLE|CHAPTER)\s+[IVX\d]",
        r"^\d+\.\d+(\.\d+)?\s+[A-Z]",     # 3.2.1 Definitions
    ]

    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 64) -> None:
        super().__init__(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        self._break_re = re.compile(
            "|".join(f"({p})" for p in self.SECTION_BREAK_PATTERNS),
            re.MULTILINE,
        )

    def split(self, text: str) -> List[TextChunk]:
        """Split respecting export document structure."""
        # Pre-split on domain section boundaries
        presplit = self._presplit_on_sections(text)
        all_chunks: List[TextChunk] = []
        char_offset = 0

        for section in presplit:
            section_chunks = super().split(section)
            for chunk in section_chunks:
                chunk.start_char += char_offset
                chunk.end_char += char_offset
                chunk.chunk_index = len(all_chunks)
                all_chunks.append(chunk)
            char_offset += len(section)

        return all_chunks

    def _presplit_on_sections(self, text: str) -> List[str]:
        """Split text at known section boundaries."""
        lines = text.split("\n")
        sections: List[str] = []
        current_lines: List[str] = []

        for line in lines:
            if current_lines and self._break_re.match(line.strip()):
                sections.append("\n".join(current_lines))
                current_lines = []
            current_lines.append(line)

        if current_lines:
            sections.append("\n".join(current_lines))

        return sections if sections else [text]
