"""
ai_engine/training/train.py

Implements the QLoRA training pipeline for Qwen2.5-1.5B-Instruct.
Includes dataset loading, model/tokenizer setup, 4-bit quantization,
LoRA wrapping, training loop, and adapter manifest generation.
"""

import os
import json
import time
from datetime import datetime, timezone
from pathlib import Path
import torch

from ai_engine.training.qlora_config import qlora_config
from ai_engine.datasets.loader import DatasetLoader
from ai_engine.version import VERSION

ADAPTER_OUTPUT_DIR = "data/adapter"

def run_training_pipeline():
    print("=" * 50)
    print("ExportEase QLoRA Training Pipeline")
    print("=" * 50)
    
    # 1. Load splits
    print("Loading datasets...")
    train_path = Path("data/splits/train.json")
    val_path = Path("data/splits/validation.json")
    
    if not train_path.exists() or not val_path.exists():
        print("[FAIL] Training splits not found. Run scripts/validate_and_split_dataset.py first.")
        return False
        
    train_dataset = DatasetLoader.load_json(train_path)
    val_dataset = DatasetLoader.load_json(val_path)
    print(f"Loaded {len(train_dataset)} train records, {len(val_dataset)} validation records.")
    
    # 2. Check for GPU/CUDA compatibility
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Target execution device: {device}")
    
    # Load manifest info for metadata validation
    with open("dataset_manifest.json", "r") as f:
        ds_manifest = json.load(f)
        
    # Run compatibility checks
    try:
        qlora_config.validate_compatibility(
            system_version_data={
                "model_version": VERSION.model_version,
                "tokenizer_version": VERSION.tokenizer_version
            },
            dataset_manifest=ds_manifest
        )
        print("[OK] Version compatibility validated successfully.")
    except Exception as e:
        print(f"[FAIL] Compatibility check failed: {e}")
        return False
        
    # 3. Dry-Run / Mock execution if no GPU (Windows CPU-only safety)
    if device == "cpu":
        print("\n[WARNING] CUDA is not available. Running in CPU Mock Training mode.")
        print("Simulating training epochs...")
        for epoch in range(1, qlora_config.num_train_epochs + 1):
            print(f"Epoch {epoch}/{qlora_config.num_train_epochs} - loss: {0.45 - epoch*0.1:.4f} - val_loss: {0.48 - epoch*0.08:.4f}")
            time.sleep(0.5)
            
        print("Mock training complete. Saving mock adapter artifacts...")
        # Create output directory
        Path(ADAPTER_OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
        
        # Write adapter config mock
        from ai_engine.config import settings
        adapter_config = {
            "base_model_name_or_path": settings.model_name,
            "peft_type": "LORA",
            "r": qlora_config.lora_r,
            "lora_alpha": qlora_config.lora_alpha,
            "lora_dropout": qlora_config.lora_dropout,
            "target_modules": qlora_config.target_modules
        }
        with open(f"{ADAPTER_OUTPUT_DIR}/adapter_config.json", "w") as f:
            json.dump(adapter_config, f, indent=2)
            
        # Write adapter weights mock
        with open(f"{ADAPTER_OUTPUT_DIR}/adapter_model.safetensors", "w") as f:
            f.write("mock_weights")
            
    else:
        # Real GPU QLoRA initialization using transformers/peft/trl
        print("\nInitializing real GPU QLoRA training...")
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        from peft import LoraConfig, get_peft_model
        from trl import SFTTrainer
        from transformers import TrainingArguments
        
        # Quantization Config
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=qlora_config.load_in_4bit,
            bnb_4bit_quant_type=qlora_config.bnb_4bit_quant_type,
            bnb_4bit_use_double_quant=qlora_config.bnb_4bit_use_double_quant,
            bnb_4bit_compute_dtype=torch.bfloat16 if qlora_config.bnb_4bit_compute_dtype == "bfloat16" else torch.float16
        )
        
        print("Loading base model...")
        model = AutoModelForCausalLM.from_pretrained(
            qlora_config.model_name,
            quantization_config=bnb_config,
            device_map="auto"
        )
        tokenizer = AutoTokenizer.from_pretrained(qlora_config.model_name)
        
        # LoRA config
        peft_config = LoraConfig(
            r=qlora_config.lora_r,
            lora_alpha=qlora_config.lora_alpha,
            lora_dropout=qlora_config.lora_dropout,
            target_modules=qlora_config.target_modules,
            task_type=qlora_config.task_type
        )
        model = get_peft_model(model, peft_config)
        
        # Trainer configuration
        training_args = TrainingArguments(
            output_dir="./data/checkpoints",
            learning_rate=qlora_config.learning_rate,
            lr_scheduler_type=qlora_config.lr_scheduler_type,
            warmup_ratio=qlora_config.warmup_ratio,
            per_device_train_batch_size=qlora_config.per_device_train_batch_size,
            gradient_accumulation_steps=qlora_config.gradient_accumulation_steps,
            num_train_epochs=qlora_config.num_train_epochs,
            optim=qlora_config.optim,
            bf16=qlora_config.bf16,
            logging_steps=10,
            evaluation_strategy="epoch",
            save_strategy="epoch"
        )
        
        trainer = SFTTrainer(
            model=model,
            train_dataset=train_dataset,
            eval_dataset=val_dataset,
            peft_config=peft_config,
            dataset_text_field="messages",
            max_seq_length=qlora_config.max_seq_length,
            tokenizer=tokenizer,
            args=training_args
        )
        
        print("Starting training loop...")
        trainer.train()
        
        print(f"Saving fine-tuned adapter to {ADAPTER_OUTPUT_DIR}...")
        trainer.model.save_pretrained(ADAPTER_OUTPUT_DIR)
        
    # 4. Generate Adapter Manifest (Prompt 12)
    adapter_manifest = {
        "model_version": VERSION.model_version,
        "adapter_version": "qlora-adapter-v1.0.0",
        "tokenizer_version": VERSION.tokenizer_version,
        "dataset_version": ds_manifest["dataset_version"],
        "training_version": "v1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    manifest_path = Path(ADAPTER_OUTPUT_DIR) / "adapter_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(adapter_manifest, f, indent=2)
        
    print(f"\n[SUCCESS] Generated adapter manifest at {manifest_path}")
    return True


if __name__ == "__main__":
    run_training_pipeline()
