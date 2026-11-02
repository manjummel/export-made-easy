# ExportEase UI — Architecture & Technical Specifications

ExportEase AI is engineered with a modular, performance-driven single-page architecture built on React 19, Vite, and Tailwind CSS.

## 1. Directory Structure

```
frontend/
├── src/
│   ├── assets/        # Public brand marks, icons, and hero textures
│   ├── components/    # Atomic design system components
│   │   ├── 3d/        # Three.js / React Three Fiber interactive globe
│   │   ├── ai/        # AI Orb, agent traces, and decision stream cards
│   │   ├── currency/  # Floating live FX converter & forward hedging tools
│   │   ├── documents/ # Printable shipping dossier & OCR audit studio
│   │   ├── layout/    # AppShell, TopBar, Sidebar, and ErrorBoundary
│   │   └── ui/        # Buttons, Cards, Modals, HSCodeChips, Badges
│   ├── context/       # Auth, Theme, and Regulatory Evidence Contexts
│   ├── data/          # 8-Digit ITC-HS catalog, Port Directory, FTA rules
│   ├── hooks/         # Reactive hooks (currency, HS lookup, audit, debounce)
│   ├── pages/         # 20+ specialized executive trade intelligence pages
│   ├── services/      # Centralized API client, offline cache manager, FX feed
│   ├── tests/         # Unit test suite & validation harnesses
│   └── utils/         # Statutory format validators & CBAM tax formula engine
```

## 2. Key Modules & Technical Innovations

1. **Photorealistic Blue Marble 3D Globe (`components/3d/`)**:
   - Rendered using Three.js with ocean specular highlights, dual-layer Rayleigh haze, and 30+ luminous global supply corridors.
2. **Statutory Trade Validators (`utils/validationRules.js`)**:
   - Comprehensive regex & checksum validation for DGFT IEC, GSTIN, EORI, and Bank AD codes.
3. **CBAM & Duty Engine (`utils/taxFormulas.js`)**:
   - Live carbon border tax calculator and bilateral Free Trade Agreement duty concession engine.
4. **Offline-First Resilience (`services/cacheManager.js`)**:
   - In-memory LRU cache with LocalStorage persistence and configurable TTL.
5. **Printable Consignment Dossier (`utils/exportDossierGenerator.js`)**:
   - Generates official ICEGATE shipping bills, packing lists, and DGFT compliance checklists.
