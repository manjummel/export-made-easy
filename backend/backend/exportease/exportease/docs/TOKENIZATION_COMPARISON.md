# Tokenization Comparison

## Baseline vs. Extended Tokenizer

According to the analysis in `TOKENIZATION_REPORT.md`, the base Qwen2.5-1.5B-Instruct tokenizer natively handles the majority of the ExportEase domain.

### Analysis Results
- **English**: 98% coverage (Acronyms like DGFT, IEC, ICEGATE are well handled).
- **Hindi**: 90% coverage.
- **Tamil & Telugu**: ~85% coverage (Some high fragmentation on specific customs terms).

### Decision
**No vocabulary extension is justified for V1.**

*Why?* The Qwen2.5 series already contains 151,936 tokens. Extending the vocabulary dynamically resizes the embedding layer, which drastically increases VRAM overhead and destabilizes the base model's pre-trained attention distributions without extensive pre-training (which is outside the scope of our QLoRA fine-tuning phase). 

Since we are utilizing QLoRA (parameter-efficient fine tuning), we will teach the model to handle the slight fragmentation in Tamil and Telugu natively rather than resizing the core embeddings.

### Version Alignment Validation
Since no extension occurred:
- **Model Version**: `qwen2.5-1.5b-instruct`
- **Tokenizer Version**: `qwen2.5-base`
- **Adapter Version**: `none`

These versions are fully compatible and pass the `/ready` probe.
