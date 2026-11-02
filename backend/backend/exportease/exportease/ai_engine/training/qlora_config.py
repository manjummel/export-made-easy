"""
ai_engine/training/qlora_config.py

QLoRA Configuration for Qwen2.5-1.5B-Instruct.
Includes 4-bit quantization settings, PEFT/LoRA parameters, and training hyperparameters.
"""

from pydantic import BaseModel, Field
from typing import List

class QLoRAConfig(BaseModel):
    # BitsAndBytes 4-bit Quantization
    load_in_4bit: bool = True
    bnb_4bit_quant_type: str = "nf4"
    bnb_4bit_use_double_quant: bool = True
    bnb_4bit_compute_dtype: str = "bfloat16"

    # LoRA / PEFT Parameters
    lora_r: int = Field(default=16, description="LoRA rank")
    lora_alpha: int = Field(default=32, description="LoRA alpha")
    lora_dropout: float = Field(default=0.05, description="LoRA dropout")
    target_modules: List[str] = Field(
        default_factory=lambda: ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )
    task_type: str = "CAUSAL_LM"

    # Training Hyperparameters
    learning_rate: float = 2e-4
    lr_scheduler_type: str = "cosine"
    warmup_ratio: float = 0.03
    per_device_train_batch_size: int = 4
    gradient_accumulation_steps: int = 4
    num_train_epochs: int = 3
    max_seq_length: int = 2048
    optim: str = "paged_adamw_32bit"
    bf16: bool = True  # Training precision

    def validate_compatibility(self, system_version_data: dict, dataset_manifest: dict):
        """
        Validates that the model, tokenizer, and dataset versions align perfectly
        before allowing training to commence.
        """
        base_model = system_version_data.get("model_version")
        tokenizer = system_version_data.get("tokenizer_version")
        
        if base_model != "qwen2.5-1.5b-instruct":
            raise ValueError(f"Incompatible base model: expected qwen2.5-1.5b-instruct, got {base_model}")
            
        if tokenizer != "qwen2.5-base":
            raise ValueError(f"Incompatible tokenizer: expected qwen2.5-base, got {tokenizer}")
            
        if not dataset_manifest.get("dataset_version"):
            raise ValueError("Dataset manifest missing version constraint")
            
        return True

# Singleton config instance
qlora_config = QLoRAConfig()
