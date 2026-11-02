# Changelog — ExportEase AI

All notable changes to the ExportEase AI Frontend are documented below.

## [2.1.0] - 2026-11-02 (Day 2 Enterprise & Reliability Release)

### Added
- **Build Optimization**: Configured manual vendor chunking in `vite.config.js` for Three.js, Recharts, and UI icons.
- **Trade Validators**: Implemented statutory validation rules for DGFT IEC, GSTIN checksums, EORI, and Bank AD codes (`utils/validationRules.js`).
- **CBAM Tax Engine**: Built EU Carbon Border Adjustment Mechanism and customs duty calculation formulas (`utils/taxFormulas.js`).
- **HS Code Master Catalog**: Added curated 8-digit ITC-HS database covering 10 major Indian export sectors (`data/hsCodeDatabase.js`).
- **Port Directory**: Added global cargo shipping corridors with transit times and TEU freight benchmarks (`data/portDirectory.js`).
- **FTA Concessions Matrix**: Added bilateral rules of origin for India-UAE CEPA, India-Aus ECTA, and UK DCTS (`data/ftaAgreements.js`).
- **Custom Reactive Hooks**:
  - `useDebounce`, `useMediaQuery`, `useLocalStorage`
  - `useCurrencyRates`, `useHSClassification`
  - `useDocumentAudit`, `useBuyerFilters`
- **UI Components**:
  - Production `ErrorBoundary` with reload action
  - Interactive `HSCodeChip` with hover popover tariff details
  - `TariffBadge` for preferential FTA identification
  - Floating `CurrencyConverterWidget` with live spot & forward rates
- **Dossier Generator**: Built official printable ICEGATE export dossier modal and checklist (`components/documents/ExportDossierModal.jsx`).
- **Offline Cache Manager**: Implemented LRU cache with TTL expiration (`services/cacheManager.js`).
- **Unit Test Suite**: Added test harness with 100% pass rate (`tests/runTests.js`).

## [2.0.0] - 2026-11-01 (Day 1 Foundation Release)
- Initial UI release with 32 modules, 3D interactive Earth globe, executive command dashboard, and 7-agent intelligence views.
