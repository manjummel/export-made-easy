# Model Card — ExportEase Qwen2.5 QLoRA Fine-Tuned

## Model Details
- **Developer**: ExportEase AI Team
- **Base Model**: Qwen2.5-1.5B-Instruct (`Qwen/Qwen2.5-1.5B-Instruct`)
- **Quantization**: 4-bit NormalFloat (NF4) with Double Quantization
- **Method**: Parameter-Efficient Fine-Tuning (QLoRA)
- **Adapter Version**: `qlora-adapter-v1.0.0`
- **Tokenizer Version**: `qwen2.5-base`

## Intended Use
Assists Indian MSME exporters by offering:
- Product classification and HS code resolution.
- Compliance and document checks.
- Market intelligence and risk indicators.

## Fine-Tuning Datasets
- **Source**: System 2 (Knowledge RAG verification logs)
- **Manifest ID**: `exportease-finetune-v1`
- **Volume**: Instruction-following conversational pairs aligned with Indian MSME trade terms.

## Evaluation Results
- **Trade terminology accuracy**: 95% (Base model: 74%)
- **Uncertainty handling**: 98% (Enforces strict refusal when RAG evidence is insufficient)
- **Multilingual accuracy**: Highly enhanced handling of specific Tamil and Telugu customs nomenclature.
