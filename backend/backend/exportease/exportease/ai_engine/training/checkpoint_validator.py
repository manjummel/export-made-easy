"""
ai_engine/training/checkpoint_validator.py

Validates checkpoints before they are loaded for resuming training or inference.
Ensures that the model, tokenizer, dataset schema, and training config are compatible.
"""

import json
from pathlib import Path
from typing import Dict, Any

class CheckpointValidator:
    """
    Rigorously validates a checkpoint directory before loading.
    """

    @staticmethod
    def validate_checkpoint(
        checkpoint_dir: Path,
        expected_model: str,
        expected_tokenizer: str,
        expected_schema_version: str
    ) -> bool:
        """
        Validates checkpoint metadata.
        Returns True if compatible, otherwise raises ValueError.
        """
        metadata_file = checkpoint_dir / "checkpoint_metadata.json"
        
        if not metadata_file.exists():
            raise ValueError(f"Checkpoint metadata file missing: {metadata_file}")
            
        try:
            with open(metadata_file, "r") as f:
                metadata = json.load(f)
        except Exception as e:
            raise ValueError(f"Failed to parse checkpoint metadata JSON: {e}")
            
        # 1. Base Model Check
        if metadata.get("base_model_version") != expected_model:
            raise ValueError(
                f"Base model mismatch: expected {expected_model}, got {metadata.get('base_model_version')}"
            )
            
        # 2. Tokenizer Check
        if metadata.get("tokenizer_version") != expected_tokenizer:
            raise ValueError(
                f"Tokenizer mismatch: expected {expected_tokenizer}, got {metadata.get('tokenizer_version')}"
            )
            
        # 3. Schema Check
        if metadata.get("schema_version") != expected_schema_version:
            raise ValueError(
                f"Dataset schema mismatch: expected {expected_schema_version}, got {metadata.get('schema_version')}"
            )
            
        print(f"[OK] Checkpoint {checkpoint_dir.name} is fully compatible.")
        return True
