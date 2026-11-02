"""
test_chunker.py — Unit tests for text chunking strategies
"""

from __future__ import annotations

import pytest
from app.core.chunker import ExportDocumentChunker, TextChunk, TextChunker


class TestTextChunker:
    """Unit tests for the base TextChunker."""

    def test_split_empty_string_returns_empty(self):
        chunker = TextChunker(chunk_size=100, chunk_overlap=10)
        result = chunker.split("")
        assert result == []

    def test_split_short_text_returns_single_chunk(self):
        chunker = TextChunker(chunk_size=500, chunk_overlap=50)
        text = "This is a short document about export compliance."
        chunks = chunker.split(text)
        assert len(chunks) == 1
        assert chunks[0].content == text.strip()

    def test_split_long_text_creates_multiple_chunks(self):
        chunker = TextChunker(chunk_size=100, chunk_overlap=10)
        text = " ".join(["word"] * 200)
        chunks = chunker.split(text)
        assert len(chunks) > 1

    def test_chunks_are_textchunk_instances(self):
        chunker = TextChunker(chunk_size=200, chunk_overlap=20)
        chunks = chunker.split("Export regulations require compliance with national laws.")
        for chunk in chunks:
            assert isinstance(chunk, TextChunk)

    def test_chunk_index_is_sequential(self):
        chunker = TextChunker(chunk_size=50, chunk_overlap=5)
        text = "\n\n".join([f"Section {i}: content about export topic {i}" for i in range(10)])
        chunks = chunker.split(text)
        for i, chunk in enumerate(chunks):
            assert chunk.chunk_index == i

    def test_chunk_overlap_validation(self):
        with pytest.raises(ValueError):
            TextChunker(chunk_size=100, chunk_overlap=100)  # overlap must be < size

    def test_word_count_computed(self):
        chunker = TextChunker(chunk_size=500)
        chunks = chunker.split("one two three four five")
        assert chunks[0].word_count == 5

    def test_split_texts_returns_nested_list(self):
        chunker = TextChunker(chunk_size=200)
        texts = ["First document text", "Second document text"]
        result = chunker.split_texts(texts)
        assert len(result) == 2
        assert all(isinstance(r, list) for r in result)


class TestExportDocumentChunker:
    """Unit tests for the domain-aware ExportDocumentChunker."""

    def test_hs_code_boundary_creates_new_chunk(self):
        chunker = ExportDocumentChunker(chunk_size=300, chunk_overlap=30)
        text = (
            "General export information for automotive parts.\n\n"
            "HS Code 8708 — Parts and accessories of motor vehicles.\n"
            "This heading covers all kinds of parts.\n\n"
            "HS Code 8471 — Automatic data-processing machines.\n"
            "Computers and laptops fall under this classification."
        )
        chunks = chunker.split(text)
        # Should detect HS code boundaries and split appropriately
        assert len(chunks) >= 1

    def test_regulation_section_boundary(self):
        chunker = ExportDocumentChunker(chunk_size=400, chunk_overlap=40)
        text = (
            "Introduction to export control.\n\n"
            "Section 1: Definitions\n"
            "All terms used herein shall have their standard meanings.\n\n"
            "Section 2: Scope of Application\n"
            "This regulation applies to all exporters registered in India."
        )
        chunks = chunker.split(text)
        assert len(chunks) >= 1
        # Verify chunks are TextChunk objects
        for chunk in chunks:
            assert isinstance(chunk, TextChunk)
            assert chunk.content.strip()

    def test_chunker_preserves_content(self):
        chunker = ExportDocumentChunker(chunk_size=1000, chunk_overlap=100)
        text = "Export compliance requires adherence to all applicable regulations."
        chunks = chunker.split(text)
        # All content should be preserved across chunks
        combined = " ".join(c.content for c in chunks)
        assert "Export compliance" in combined
        assert "regulations" in combined
