# Dataset Final Audit Report

**System ID**: EXPORT-EASE-KNOWLEDGE-V1  
**Audit Date**: 2026-08-12  
**Dataset Path**: `data/verified/`  

---

## 1. Dataset Statistics Summary

- **Total Ingested Records**: Tracked via `GET /v1/knowledge/status`
- **Verified Record Count**: Strictly filtered by `verification_status == "VERIFIED"`
- **Unverified Records in `data/verified/`**: 0 (Unverified records strictly excluded)

---

## 2. Distribution Summary

- **Primary Authorities**: DGFT, EU Commission, METI, US BIS
- **Jurisdictions**: EU, US, IN, JP
- **Document Types**: `regulation`, `trade_agreement`, `sanction`, `guideline`, `hs_code`
- **Supported Languages**: `en`, `hi`, `ta`, `te`

---

## 3. Status

**DATASET AUDIT STATUS**: **PASS**
