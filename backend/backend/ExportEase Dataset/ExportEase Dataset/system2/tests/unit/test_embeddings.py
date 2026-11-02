"""
test_embeddings.py — Unit tests for embedding providers
"""

from __future__ import annotations

import pytest
from unittest.mock import MagicMock, patch


class TestSentenceTransformerProvider:
    """Unit tests for the SentenceTransformerProvider."""

    def test_embed_text_returns_list_of_floats(self):
        import numpy as np
        mock_model = MagicMock()
        mock_model.encode.return_value = np.array([0.1, 0.2, 0.3] * 128)
        mock_model.get_sentence_embedding_dimension.return_value = 384

        with patch("app.core.embeddings.SentenceTransformer", return_value=mock_model):
            from app.core.embeddings import SentenceTransformerProvider
            provider = SentenceTransformerProvider("all-MiniLM-L6-v2")
            result = provider.embed_text("test query about HS codes")

        assert isinstance(result, list)
        assert all(isinstance(v, float) for v in result)

    def test_embed_batch_returns_list_of_vectors(self):
        import numpy as np
        mock_model = MagicMock()
        mock_model.encode.return_value = np.array([[0.1] * 384, [0.2] * 384])
        mock_model.get_sentence_embedding_dimension.return_value = 384

        with patch("app.core.embeddings.SentenceTransformer", return_value=mock_model):
            from app.core.embeddings import SentenceTransformerProvider
            provider = SentenceTransformerProvider("all-MiniLM-L6-v2")
            result = provider.embed_batch(["query one", "query two"])

        assert len(result) == 2
        assert all(isinstance(v, list) for v in result)

    def test_vector_size_matches_model(self):
        mock_model = MagicMock()
        mock_model.get_sentence_embedding_dimension.return_value = 384

        with patch("app.core.embeddings.SentenceTransformer", return_value=mock_model):
            from app.core.embeddings import SentenceTransformerProvider
            provider = SentenceTransformerProvider()
            assert provider.vector_size == 384

    def test_model_name_property(self):
        mock_model = MagicMock()
        mock_model.get_sentence_embedding_dimension.return_value = 384

        with patch("app.core.embeddings.SentenceTransformer", return_value=mock_model):
            from app.core.embeddings import SentenceTransformerProvider
            provider = SentenceTransformerProvider("all-MiniLM-L6-v2")
            assert provider.model_name == "all-MiniLM-L6-v2"


class TestCreateEmbeddingProvider:
    """Tests for the provider factory."""

    def test_creates_sentence_transformer_by_default(self):
        mock_model = MagicMock()
        mock_model.get_sentence_embedding_dimension.return_value = 384

        with patch("app.core.embeddings.SentenceTransformer", return_value=mock_model):
            from app.core.embeddings import create_embedding_provider
            provider = create_embedding_provider(provider="sentence_transformers")
            assert provider.model_name == "all-MiniLM-L6-v2"

    def test_raises_for_unknown_provider(self):
        from app.core.embeddings import create_embedding_provider
        with pytest.raises(ValueError, match="Unknown embedding provider"):
            create_embedding_provider(provider="unknown_provider")
