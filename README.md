# SmartVest — Strategic Investment & Wealth Advisory Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-SmartVest_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://smart-investment-strategic-advisor.vercel.app/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-75%20Passing-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)

🚀 **Production Application:** [https://smart-investment-strategic-advisor.vercel.app/](https://smart-investment-strategic-advisor.vercel.app/)

> **SmartVest** is an institutional-grade, multi-asset quantitative wealth advisory platform. It decouples a deterministic mathematical financial engine from an in-context grounded conversational AI (**VestIQ**), eliminating financial hallucinations while synthesizing personalized asset allocation blueprints, wealth scenario projections, and non-liquidating portfolio rebalancing models.

---

## 🌟 Executive Summary

- **Advisory Mandate**: SmartVest is strictly an advisory decision-support platform. It does not execute trades, place orders, connect to broker execution endpoints, or hold custody of client funds.
- **Ground-Truth Architecture**: Complete separation between deterministic mathematical algorithms and conversational AI explanations.
- **5-Tier Resilient Market Pipeline**: Seamless failover across TrueData, NSE snapshot feeds, Yahoo Finance, direct AMFI NAV APIs, and deterministic baseline models with explicit data freshness tagging (`LIVE`, `DELAYED`, `FALLBACK`, `DEMO`, `UNAVAILABLE`).
- **Comprehensive Quality Assurance**: 10 automated test suites with 75 unit tests (100% pass rate) running in GitHub Actions CI prior to production Vercel edge deployment.

---

## 📑 Core Modules

1. **Strategy & Asset Allocation Engine** ([`strategyEngine.ts`](file:///c:/Users/ravit/OneDrive/Desktop/final_project/frontend/src/services/strategyEngine.ts)):
   - Calculates monthly investable surplus with a 10% flexible cash buffer.
   - Computes risk capacity vs. tolerance and sets effective risk mandate.
   - Allocates capital across 4 distinct buckets: Core Large Cap Equity, Long-Term Alpha (Global Tech), Sovereign Gold Bonds, and Liquid/Corporate Debt.
2. **What-If Scenario Simulator** ([`scenarioEngine.ts`](file:///c:/Users/ravit/OneDrive/Desktop/final_project/frontend/src/services/scenarioEngine.ts)):
   - Simulates annual step-up SIP compounding and inflation purchasing power discounting.
   - Provides presets (`Conservative`, `Base`, `Optimistic`, `Custom`) and return rate sensitivity matrices.
3. **Portfolio Rebalancing Advisory** ([`rebalancingEngine.ts`](file:///c:/Users/ravit/OneDrive/Desktop/final_project/frontend/src/services/rebalancingEngine.ts)):
   - Calculates percentage drift against target blueprints with configurable sensitivity ($\pm 1\%$, $\pm 2\%$, $\pm 5\%$).
   - Formulates a tax-efficient **New-Contribution SIP Rebalancing Plan** to realign allocations without selling.
4. **VestIQ AI Financial Copilot** ([`vestiqAiService.ts`](file:///c:/Users/ravit/OneDrive/Desktop/final_project/frontend/src/services/vestiqAiService.ts)):
   - Conversational AI grounded strictly in the user's computed financial state with offline rule-based fallback.
5. **Global Market Terminal** ([`marketApi.ts`](file:///c:/Users/ravit/OneDrive/Desktop/final_project/frontend/src/services/marketApi.ts)):
   - Ingests quotes and historical candles across NSE/BSE, NASDAQ, and AMFI mutual funds with deterministic status badges.

---

## 🏗️ System Architecture

```
[ User Browser Client ]
        │
        ▼
[ React 19 + TypeScript + Zustand Store ]
        │
        ├───► [ Strategy Engine ] ──► (Deterministic Math & Multi-Asset Blueprint)
        ├───► [ Scenario Engine ] ──► (Annual Step-Up Compounding & Inflation Discounting)
        ├───► [ Rebalancing Engine ] ► (Drift Detection & Tax-Efficient SIP Correction)
        ├───► [ VestIQ Copilot ] ──► (In-Context Grounded Prompt Synthesis)
        │
        ▼
[ Market Data Client ]
        │
        ├─── (REST API) ───► [ FastAPI Backend Router ] ───► [ Provider Chain ]
        │                             │                      ├── TrueData (Optional Paid Feed)
        │                             │                      ├── NSE Snapshot / Yahoo Finance
        │                             │                      └── AMFI / MFAPI Feeds
        ▼                             ▼
[ Direct Client Fallbacks ]    [ Server-Side Cache ]
(MFAPI / Baseline Models)      (TTL: 30s Quotes / 1h NAV)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19.2.8** | Component architecture & reactive UI |
| **Language** | **TypeScript 6.0.2** | Compile-time type safety & domain modeling |
| **Build Tooling** | **Vite 8.2.2** | High-performance bundling & HMR |
| **Styling** | **Tailwind CSS v4.3.3** | Institutional dark theme & mobile micro-interactions |
| **State Management** | **Zustand 5.0.15** | Reactive state store for profile, strategy, and quotes |
| **Data Visualization** | **Recharts 3.10.1** | Interactive area, trajectory, and allocation charts |
| **Icons** | **Lucide React 1.34.0** | Icon library |
| **Backend API** | **FastAPI 0.115.8 (Python)** | Asynchronous REST routing & provider failover |
| **Server** | **Uvicorn 0.34.0** | Production ASGI server |
| **Database ORM** | **SQLAlchemy 2.0.38 / SQLite** | Relational user benchmark & session caching |
| **Authentication** | **Firebase Auth 12.18.0** | Email/password, Google OAuth, and dev bypass |
| **Observability** | **Sentry React 10.73.0** | Production error monitoring & breadcrumbs |
| **Testing** | **Vitest 4.1.11** | Unit, regression, and contract test runner (75 tests) |

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: v20.x (LTS) or higher
- **Python**: v3.11+ (for optional backend server)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/ravitejpatgar-art/smart-investment-strategic-advisor.git
cd smart-investment-strategic-advisor
```

### 2. Frontend Setup
```bash
cd frontend
npm ci
npm run dev
```
The application will launch on `http://localhost:5173`.

### 3. Backend Setup (Optional)
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 🧪 Testing & Verification

Run the automated Vitest test suite (10 test files, 75 tests):
```bash
cd frontend
npm test
```

Run production typecheck and build validation:
```bash
npm run build
```

---

## 🔒 Security & Privacy

- **Server-Side Secret Isolation**: Paid provider credentials (`TRUEDATA_API_KEY`, `PAID_MARKET_DATA_API_KEY`) are kept strictly on the backend server and are never exposed in `VITE_*` client bundles.
- **Client-Side PII Scrubbing**: The structured logger and Sentry integration sanitize passwords, tokens, salaries, and private portfolio values before recording telemetry.
- **Ephemeral Demo Mode**: Appending `?demo=true` activates a deterministic, self-contained offline evaluation sandbox.

---

## 📚 Detailed Documentation

- [Project Overview](docs/PROJECT_OVERVIEW.md) — Objectives, user personas, and core workflows.
- [System Architecture](docs/ARCHITECTURE.md) — Layered architectural deep-dive and data flow diagrams.
- [Live Demo Script](docs/DEMO_SCRIPT.md) — 7–10 minute step-by-step presentation guide.
- [Viva Q&A Guide](docs/VIVA_QA.md) — 40 technical viva questions with comprehensive answers.
- [Technical Details](docs/TECHNICAL_DETAILS.md) — Financial formulas, market data pipeline, and algorithms.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
