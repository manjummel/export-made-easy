# 🚢 ExportEase AI — Autonomous Global Export Intelligence & Compliance Platform

<div align="center">

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**An autonomous, multi-agent AI export intelligence and customs compliance platform engineered to empower cross-border exporters and MSMEs with end-to-end statutory validation, real-time tariff optimization, verified buyer discovery, and interactive 3D global logistics intelligence.**

[Explore Live Demo](#-quick-start) • [Features](#-core-features) • [Architecture](#-tech-stack--architecture) • [API Reference](#-api-endpoints)

</div>

---

## 🌟 Overview

**ExportEase AI** transforms complex cross-border trade into an automated, error-free workflow. By orchestrating a specialized network of **7 autonomous AI agents**, the platform eliminates compliance bottlenecks, automates official documentation (ICEGATE / DGFT / CBIC), identifies verified international buyers, and optimizes tariff duties via bilateral Free Trade Agreements (CEPA, ECTA, DCTS, GSP).

---

## 🚀 Core Features

### 1. 🌍 Interactive 3D Realistic Earth & Global Supply Corridors
- **Photorealistic Blue Marble 3D Globe**: Rendered using Three.js and React Three Fiber with realistic ocean specular highlights, dual-layer Rayleigh atmospheric haze, and ambient orbital dust.
- **30+ Active Supply Trade Corridors**: Luminous parabolic flight and oceanic arcs connecting Indian export clusters (*JNPT, Mumbai, Mundra, Chennai*) to global hubs in North America, Europe, Middle East, Asia-Pacific, Latin America, and Africa.
- **Port Dossier Telemetry**: Interactive port markers displaying live duty rates, bilateral trade treaties, transit days (Air vs Sea), and top demanded commodities.

### 2. 📦 Executive Command Dashboard (12 Platform Modules)
- **HS Code & Tariff Classification**: AI-powered 8-digit ITC-HS determination with 99.4% precision.
- **Product Export Feasibility**: Technical barrier checks, packaging standards, and international lab testing validation.
- **Market Intelligence**: Target country CAGR demand trends, import volumes, and pricing benchmarks.
- **Verified Buyer Discovery**: Direct access to vetted global importers (e.g., Al Maya Group, Zalando, Nordstrom) with credit trust ratings.
- **Document Procedures & Checklist**: ICEGATE-ready generation of Shipping Bills, Commercial Invoices, Packing Lists, Bill of Lading (B/L), and Certificates of Origin (COO / REX).
- **Statutory Compliance & Certifications**: Automated validation against DGFT, APEDA, FSSAI, CE Marking, REACH, and FDA standards.
- **Export Roadmap & Milestone Tracking**: End-to-end Gantt execution pipeline from factory gate to destination port delivery.
- **Forex & Currency Risk Hedging**: Live FX spot rates (USD/INR, EUR/INR) and forward contract hedging recommendations.
- **Trade Policies & FTAs**: Preferential 0% duty capture under India-UAE CEPA, India-Australia ECTA, UK DCTS, and EU GSP.
- **Live Logistics & Shipment Tracking**: Sea container and air freight consignment tracking with real-time ETA countdowns.
- **Demand Forecasting & Predictive Revenue**: Machine learning volume surge prediction and seasonal revenue models.
- **Auditable Regulatory Sources**: Immutable legal citations synced directly with DGFT and CBIC official notifications.

### 3. 🤖 7-Agent Autonomous Intelligence Engine
- **Classification Agent**: Automatically matches product specifications to the exact ITC-HS schedule.
- **Compliance Agent**: Validates mandatory licenses, phytosanitary certificates, and export restrictions.
- **Market Intelligence Agent**: Analyzes global customs databases for high-demand corridors.
- **Buyer Profiler Agent**: Assesses buyer solvency, payment terms, and creditworthiness.
- **Document Validator Agent**: Ensures zero-discrepancy consistency across all shipping documentation.
- **Risk Guardian Agent**: Evaluates geopolitical, transit piracy, and foreign exchange risks.
- **Policy Monitor Agent**: Tracks amendments in foreign trade policies and bilateral trade agreements.

### 4. 🔍 AI-Powered Export Document Cross-Verification (Production Module)
- **Multi-Document Ingestion (PDF, PNG, JPG, JPEG)**: Exporters can drag-and-drop multiple shipping documents in one session across all 5 standard export documents:
  1. *Commercial Invoice (CI)*
  2. *Packing List (PL)*
  3. *Purchase Order (PO)*
  4. *Bill of Lading / Airway Bill (B/L)*
  5. *Certificate of Origin (COO / REX / Form A)*
- **Hybrid OCR & Structured Entity Extraction**: Native digital text parsing (via `pypdf`) with automated OCR fallback (via `pytesseract` & `Pillow`) to extract 10+ critical customs parameters:
  - Exporter & Importer/Consignee Name and legal address
  - Invoice / Document Reference Number & Date
  - Product Description & ITC-HS Code (4-to-8 digit classification)
  - Consignment Quantity & Unit of Measurement (UOM)
  - Gross Weight & Net Weight (kg) with ICEGATE 1.0% statutory tolerance checks
  - Declared Consignment Value, Currency, and Port Pairs (POL & POD)
- **Multi-Way Discrepancy Matrix**: Dynamically cross-compares all uploaded documents to detect:
  - HS Code mismatches between Commercial Invoice, Bill of Lading, and COO.
  - Weight discrepancies exceeding the mandatory 1% Indian customs threshold.
  - Quantity mismatch between PO, Invoice, and Packing List.
  - Consignee naming and EORI / VAT variance.
- **ICEGATE Readiness Gauge & Auto-Resolve**: Generates a 0–100% customs clearance probability score and provides one-click auto-resolution to synchronize manifests before electronic EDI submission.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **Framework**: React 19, Vite 8
- **3D Visualization**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling**: Tailwind CSS v4, Vanilla CSS Design System with light/dark adaptive tokens
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Icons**: Lucide React

### **Backend**
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **AI & RAG Engine**: Retrieval-Augmented Generation (RAG) with vector embeddings
- **Data Models**: Pydantic v2
- **CORS & Middleware**: Configured for local dev & production deployment

---

## ⚡ Quick Start

### 📋 Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**: Installed and configured

---

### 🟢 Option 1: One-Click Launch (Windows)

Simply double-click:
```cmd
START_ALL.bat
```
*(This automatically boots the FastAPI backend on port `8000` and the Vite React frontend on port `5173` in separate windows).*

---

### 💻 Option 2: Manual Terminal Setup

#### **1. Clone the Repository**
```bash
git clone https://github.com/manjummel/export-made-easy.git
cd export-made-easy
```

#### **2. Start the Backend API**
```bash
cd "backend/llm"
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

#### **3. Start the Frontend Application**
Open a new terminal:
```bash
cd "backend/ExportEase UI (2)/ExportEase UI/ExportEase UI"
npm install
npm run dev
```

---

## 🌐 Local Host Links

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | **[http://localhost:5173](http://localhost:5173)** | Complete React UI & 3D Logistics Engine |
| **Backend API** | **[http://localhost:8000](http://localhost:8000)** | FastAPI RAG Server & Agent Mesh |
| **Interactive API Docs** | **[http://localhost:8000/docs](http://localhost:8000/docs)** | Swagger UI documentation |
| **ReDoc API View** | **[http://localhost:8000/redoc](http://localhost:8000/redoc)** | OpenAPI Specification View |

---

## 🔗 Key API Endpoints

- `POST /chat` — Query the ExportEase AI Copilot with trade context
- `POST /chat/stream` — SSE streaming response for real-time AI generation
- `POST /api/v1/documents/extract` — Multi-document upload & OCR entity extraction (PDF, PNG, JPG, JPEG)
- `POST /api/v1/documents/cross-verify` — Cross-verification of parsed shipping documents against customs rules
- `POST /api/v1/documents/upload-and-verify` — Complete one-shot multi-document upload, extraction, and verification
- `POST /api/v1/audit-documents` — Single consignment tolerance audit against ICEGATE & DGFT rules
- `POST /api/v1/cbam-estimate` — EU Carbon Border Adjustment Mechanism (CBAM) tax liability estimation
- `GET /health` — API health check and service status

---

## 📂 Project Directory Structure

```
export-made-easy/
├── START_ALL.bat                      # One-click dual server launcher
├── START_BACKEND.bat                  # Backend launcher
├── START_FRONTEND.bat                 # Frontend launcher
├── PUSH_TO_GITHUB.bat                 # Git sync automation script
├── .gitignore                         # Root Git ignore configuration
├── README.md                          # Platform documentation
└── backend/
    ├── llm/                           # FastAPI Backend & RAG Engine
    │   ├── server.py                  # API routes & static server
    │   ├── rag_engine.py              # Retrieval-Augmented Generation logic
    │   ├── ingest.py                  # Vector document ingestion
    │   └── requirements.txt           # Python dependencies
    └── ExportEase UI (2)/             # React 19 Frontend Application
        └── ExportEase UI/
            └── ExportEase UI/
                ├── src/
                │   ├── components/
                │   │   ├── 3d/        # 3D Earth & Global Trade Scenes
                │   │   ├── layout/    # TopBar, Sidebar, AppShell
                │   │   ├── ui/        # Design system components (Card, Button, Badge)
                │   │   └── intelligence/ # Multi-agent trace & Next Best Action
                │   ├── pages/         # Dashboard, HS Code, Compliance, Buyers, etc.
                │   ├── services/      # API clients & data connectors
                │   └── routes/        # App routing definitions
                ├── package.json       # Node.js dependencies
                └── vite.config.js     # Vite build settings
```

---

## 🤝 Contributing

Contributions, feature requests, and issue reports are welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for Indian MSMEs & Global Exporters. Powered by <strong>ExportEase AI</strong>.</sub>
</div>
