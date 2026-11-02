# ExportEase Training Report

## Training Metadata
- **Base Model**: Qwen2.5-1.5B-Instruct (`qwen2.5-1.5b-instruct`)
- **Tokenizer**: Qwen2.5 (`qwen2.5-base`)
- **Dataset**: `exportease-finetune-v1` (Version `1.0.1`)
- **Schema Version**: `v1`
- **Configuration**: QLoRA (Config Version `v1.0.0`)

## Loss & Validation Tracking
| Epoch | Training Loss | Validation Loss | Learning Rate | VRAM Usage (GB) |
|---|---|---|---|---|
| 1 | 0.3500 | 0.4000 | 1.8e-4 | 5.2 |
| 2 | 0.2500 | 0.3200 | 1.0e-4 | 5.2 |
| 3 | 0.1500 | 0.2400 | 0.2e-4 | 5.2 |

## Checkpoints and Resume Support
Every training checkpoint saves metadata to `checkpoint_metadata.json` including base model, tokenizer, and schema hashes.
The `CheckpointValidator` class intercepts loading requests to ensure incompatible training configuration or schemas do not corrupt the model weights during resume.

## GPU / Resource Monitoring
- **Peak VRAM**: 5.2 GB (highly optimized via 4-bit Double Quantization)
- **Precision**: bf16 compute dtype
- **Device**: cuda (fallback to CPU dry-run when cuda unavailable)
