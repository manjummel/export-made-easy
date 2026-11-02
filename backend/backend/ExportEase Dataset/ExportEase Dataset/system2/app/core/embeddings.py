"""embeddings.py — Embedding engine for EXPORT-EASE-KNOWLEDGE-V1

Provides a pluggable EmbeddingProvider abstraction:
  - SentenceTransformerProvider (default, offline-capable)
  - OpenAIEmbeddingProvider (optional, API-based)

The provider is selected via EMBEDDING_PROVIDER env var.
"""

from __future__ import annotations

import logging
import os
from abc import ABC, abstractmethod
from functools import lru_cache
from typing import List

logger = logging.getLogger(__name__)


class EmbeddingProvider(ABC):
    """Abstract base class for embedding providers."""

    @property
    @abstractmethod
    def model_name(self) -> str: ...

    @property
    @abstractmethod
    def vector_size(self) -> int: ...

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """Embed a single text string."""

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of text strings."""


class SentenceTransformerProvider(EmbeddingProvider):
    """
    Local sentence-transformers embedding provider.
    Runs entirely offline — no API calls required.
    Default model: all-MiniLM-L6-v2 (384-dim, fast, good quality).
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        self._model_name = model_name
        logger.info("Loading sentence-transformers model: %s", model_name)
        try:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(model_name)
            logger.info(
                "Embedding model loaded — vector_size=%d", self._model.get_sentence_embedding_dimension()
            )
        except ImportError as exc:
            raise RuntimeError(
                "sentence-transformers not installed. Run: pip install sentence-transformers"
            ) from exc

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def vector_size(self) -> int:
        return self._model.get_sentence_embedding_dimension()

    def embed_text(self, text: str) -> List[float]:
        embedding = self._model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        embeddings = self._model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        return [e.tolist() for e in embeddings]


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """
    OpenAI embedding provider using text-embedding-ada-002 or text-embedding-3-small.
    Requires OPENAI_API_KEY environment variable.
    """

    VECTOR_SIZES = {
        "text-embedding-ada-002": 1536,
        "text-embedding-3-small": 1536,
        "text-embedding-3-large": 3072,
    }

    def __init__(self, model_name: str = "text-embedding-3-small") -> None:
        self._model_name = model_name
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required for OpenAI embeddings")
        try:
            import openai
            self._client = openai.OpenAI(api_key=api_key)
        except ImportError as exc:
            raise RuntimeError("openai package not installed. Run: pip install openai") from exc
        logger.info("OpenAI embedding provider initialized with model: %s", model_name)

    @property
    def model_name(self) -> str:
        return self._model_name

    @property
    def vector_size(self) -> int:
        return self.VECTOR_SIZES.get(self._model_name, 1536)

    def embed_text(self, text: str) -> List[float]:
        response = self._client.embeddings.create(input=[text], model=self._model_name)
        return response.data[0].embedding

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        response = self._client.embeddings.create(input=texts, model=self._model_name)
        return [item.embedding for item in sorted(response.data, key=lambda x: x.index)]


# ── Factory ───────────────────────────────────────────────────────────────────

def create_embedding_provider(
    provider: str | None = None,
    model: str | None = None,
) -> EmbeddingProvider:
    """
    Create and return an embedding provider based on configuration.

    Args:
        provider: "sentence_transformers" or "openai". Defaults to env var.
        model: Model name override.
    """
    provider = provider or os.environ.get("EMBEDDING_PROVIDER", "sentence_transformers")
    model = model or os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

    if provider == "sentence_transformers":
        return SentenceTransformerProvider(model_name=model)
    elif provider == "openai":
        return OpenAIEmbeddingProvider(model_name=model)
    else:
        raise ValueError(f"Unknown embedding provider: {provider!r}. Use 'sentence_transformers' or 'openai'.")


@lru_cache(maxsize=1)
def get_embedding_provider() -> EmbeddingProvider:
    """Return the application-level embedding provider singleton."""
    return create_embedding_provider()
