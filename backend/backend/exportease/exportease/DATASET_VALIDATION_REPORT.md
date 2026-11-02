# Dataset Validation Report

## Overview
- **Source System**: EXPORT-EASE-KNOWLEDGE-V1
- **Dataset Version**: 1.0.1
- **Total Raw Records**: 5

## Quality Checks
| Check | Count | Status |
|---|---|---|
| Duplicates Removed | 1 | PASS |
| Near Duplicates Flagged | 0 | PASS |
| Missing Fields | 0 | PASS |
| Invalid Source IDs | 0 | PASS |
| Empty Outputs | 0 | PASS |
| Long Sequences Filtered | 0 | PASS |
| Schema Mismatches | 0 | PASS |
| Train/Test Leakage | 0 | PASS (No hash overlaps between splits) |

## Final Splits
- **Train**: 2
- **Validation**: 1
- **Test**: 1

All valid records strictly map back to `source_ids`, ensuring System 2 traceability is maintained in the final model metadata.
