# ============================================================
# ExportEase AI — Synthetic Data Database Model
# ============================================================
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Float
from sqlalchemy.sql import func
from app.database import Base


class SyntheticDataRecord(Base):
    """
    Model for storing synthetic export intelligence records.
    Used for RAG context, agent training, and evaluation.
    """
    __tablename__ = "synthetic_data_records"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    domain = Column(String, index=True, nullable=False)
    question = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    
    # Structured Data
    workflow_steps = Column(JSON, nullable=True)       # List of steps
    required_documents = Column(JSON, nullable=True)   # List of document names
    tags = Column(JSON, nullable=True)                 # List of tags
    metadata_fields = Column(JSON, nullable=True)      # 'metadata' is reserved, using metadata_fields
    evaluation_metadata = Column(JSON, nullable=True)

    # Classification & Metrics
    country = Column(String, index=True, nullable=True)
    product_category = Column(String, index=True, nullable=True)
    hs_code_reference = Column(String, index=True, nullable=True)
    compliance_area = Column(String, index=True, nullable=True)
    risk_level = Column(String, nullable=True)         # Low, Medium, High
    difficulty = Column(String, nullable=True)         # Beginner, Intermediate, Expert
    language = Column(String, default="en")

    source_type = Column(String, default="synthetic")
    confidence_score = Column(Float, nullable=True)

    # Ingestion State
    embedding_status = Column(String, default="PENDING") # PENDING, INGESTED, FAILED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
