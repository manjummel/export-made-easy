# syntax=docker/dockerfile:1
# ==============================================================================
# ExportEase AI Intelligence Engine — Dockerfile
# SYSTEM: EXPORT-EASE-AI-ENGINE-V1
# Port: 8001
# ==============================================================================

# --- Base image: CPU default ---
# For GPU (Linux), override with: --build-arg BASE_IMAGE=nvidia/cuda:12.1-cudnn8-runtime-ubuntu22.04
ARG BASE_IMAGE=python:3.11-slim
FROM ${BASE_IMAGE}

# --- Labels ---
LABEL org.opencontainers.image.title="ExportEase AI Intelligence Engine"
LABEL org.opencontainers.image.description="SYSTEM 1: LLM + Multi-Agent Intelligence for Indian MSME Export Assistance"
LABEL org.opencontainers.image.version="0.1.0"

# --- System dependencies ---
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# --- Working directory ---
WORKDIR /app

# --- Python dependencies ---
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# --- Copy shared contracts ---
COPY contracts/ ./contracts/

# --- Copy application source ---
COPY ai_engine/ ./ai_engine/

# --- Copy environment template ---
COPY .env.example .env.example

# --- Non-root user for security ---
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

# --- Expose AI Engine port ---
EXPOSE 8001

# --- Health check ---
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# --- Entrypoint ---
CMD ["uvicorn", "ai_engine.main:app", "--host", "0.0.0.0", "--port", "8001", "--log-level", "info"]
