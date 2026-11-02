# ── Build stage ────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Install system dependencies for compiling some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Pre-download the sentence-transformers model at build time
# This avoids slow model downloads at container startup
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

LABEL org.opencontainers.image.title="ExportEase Knowledge API"
LABEL org.opencontainers.image.description="System 2: EXPORT-EASE-KNOWLEDGE-V1 — RAG Knowledge Service"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="ExportEase AI"

# Security: run as non-root
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --no-create-home --shell /bin/false appuser

WORKDIR /app

# Install runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy sentence-transformers cached model from builder
COPY --from=builder /root/.cache /home/appuser/.cache

# Copy application source
COPY --chown=appuser:appgroup app/ ./app/
COPY --chown=appuser:appgroup rag/ ./rag/
COPY --chown=appuser:appgroup contracts/ ./contracts/

# Create data directory
RUN mkdir -p /app/data && chown appuser:appgroup /app/data

USER appuser

# Environment defaults (override via docker-compose or k8s)
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV KNOWLEDGE_SERVICE_PORT=8100
ENV KNOWLEDGE_SERVICE_HOST=0.0.0.0

EXPOSE 8100

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8100/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8100", \
     "--workers", "2", \
     "--log-level", "info"]
