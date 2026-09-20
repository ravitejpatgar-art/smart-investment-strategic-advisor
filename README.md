# SmartVest — Institutional Quantitative Wealth Advisory & Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-SmartVest_App-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://smart-investment-strategic-advisor.vercel.app/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-150%20Passing-brightgreen?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Linter](https://img.shields.io/badge/Linter-0%20Errors-brightgreen?style=flat-square&logo=eslint&logoColor=white)](https://github.com/oxc-project/oxc)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

🚀 **Production Web Application:** [https://smart-investment-strategic-advisor.vercel.app/](https://smart-investment-strategic-advisor.vercel.app/)

> **SmartVest** is an institutional-grade, multi-asset quantitative wealth advisory platform. It decouples a deterministic mathematical financial engine from an in-context grounded conversational AI copilot (**VestIQ**), eliminating financial hallucinations while synthesizing personalized asset allocation blueprints, wealth scenario projections, and non-liquidating portfolio rebalancing models.

---

## 🌟 Executive Summary

- **Advisory Mandate**: SmartVest is strictly an advisory decision-support platform. It does not execute trades, place orders, connect to broker execution endpoints, or hold custody of client funds.
- **Ground-Truth Architecture**: Total mathematical separation between deterministic financial formulas and conversational AI explanations.
- **Structured Financial Card System**: Clean 20px (`rounded-2xl`) section boundaries with theme-aware contrast shadows and consistent spatial hierarchy across all modules.
- **Global Two-Theme Architecture**: Seamless toggle between Institutional Dark (`#101217`) and High-Legibility White (`#F7FAFD`) canvases with smooth 800ms transitions.
- **5-Tier Resilient Market Pipeline**: Failover across live providers, NSE snapshot feeds, Yahoo Finance, direct AMFI NAV feeds, and deterministic baseline models with explicit status tags (`LIVE`, `DELAYED`, `FALLBACK`, `DEMO`, `UNAVAILABLE`).
- **VestIQ Conversational Intelligence**: Full-featured financial advisory copilot with message branching/editing, conversational truncation, plain-text export, and styled PDF reports.
- **Automated Quality Assurance**: 19 test files with 150 automated unit & regression tests (100% pass rate), 0 lint errors, and verified responsive layout from 320px up to 1920px.

---

## 📑 Core Modules & Capabilities

1. **Portfolio Overview & Mandate Summary** (`frontend/src/components/dashboard/OverviewDashboard.tsx`):
   - Real-time investor mandate summary (Horizon, Risk Capacity Score 72/100, Surplus).
   - Market Radar ticker tracking key benchmarks (NIFTY 50, SENSEX, NASDAQ, Gold).
   - Capital Protection & Mandate card tracking emergency cash runway cushions.
   - Comprehensive multi-page PDF advisory export (`[ Export PDF ]`).

2. **Global Market Terminal & Deep Analytics** (`frontend/src/components/market/MarketExplorerView.tsx`):
   - Institutional directory covering 125,000+ instruments across Indian (NSE/BSE) and global exchanges.
   - Search with debounced querying and filtering across asset classes (Stocks, ETFs, Mutual Funds).
   - Interactive `InstrumentDetailModal` with OHLCV candlestick/line charts, technical signals (BUY/SELL/HOLD), confidence ratings, and portfolio role mapping.

3. **Investing Academy** (`frontend/src/components/academy/InvestingAcademyView.tsx`):
   - 12 high-yield, bite-sized lessons across Fundamentals, Products, Strategy, Indian Markets, and Core Principles.
   - Interactive Lesson Player with playback speed controls (1x, 1.25x, 1.5x), collapsible transcripts, takeaway summaries, and direct VestIQ contextual Q&A bridges.

4. **Strategic Asset Allocation Blueprint** (`frontend/src/components/recommendations/InvestmentRecommendationsView.tsx`):
   - Quantitative multi-asset diversification engine calibrating Large-Cap Index, Flexi-Cap, US Tech Equities, High-Yield Debt, and Gold.
   - Direct mutual fund cost transparency highlighting the 0.5%–1.5% compounding advantage of direct plans over distributor regular plans.

5. **Lifecycle Goal Roadmaps & Capital Milestones** (`frontend/src/components/goals/GoalPlannerView.tsx`):
   - Goal planner for property acquisition, vehicle funding, retirement (FIRE), higher education, and wealth building.
   - Automated SIP calculation, target date tracking, and real-time funding gap analysis.

6. **Categorized Expense Tracker & Surplus Engine** (`frontend/src/components/expenses/ExpenseTrackerView.tsx`):
   - Dynamic outflow breakdown across Needs, Wants, and Fixed debt servicing.
   - Calculates net disposable monthly investable surplus to prevent over-allocation.

7. **Investor Mandate & Risk Profiling** (`frontend/src/components/profile/ProfileView.tsx`):
   - Comprehensive risk capacity and tolerance profiling (Conservative, Moderate, Aggressive).
   - Synchronizes investor constraints globally across all calculation and rebalancing engines.

8. **VestIQ Conversational Copilot** (`frontend/src/components/vestiq/VestiqShell.tsx`):
   - Full dedicated workspace with suggested research queries and grounded portfolio context.
   - Message-level controls: individual copy, edit message (branches conversation and resets downstream turns), delete message (cleans orphan turns).
   - Session-level controls: plain-text conversation copy, branded PDF download, and session switching.
   - Single floating quick-chat shortcut anchored to bottom-right (`[ SV ] Ask VestIQ`).

---

## 🏗️ System Architecture

```
[ User Browser Client ]
        │
        ▼
[ React 19 + TypeScript + Zustand Store ]
        │
        ├───► [ Strategy Engine ] ─────► (Deterministic Math & Multi-Asset Blueprint)
        ├───► [ Scenario Engine ] ─────► (Step-Up Compounding & Inflation Discounting)
        ├───► [ Rebalancing Engine ] ──► (Drift Detection & Tax-Efficient SIP Correction)
        ├───► [ VestIQ Copilot ] ──────► (In-Context Grounded Prompt Synthesis)
        │
        ▼
[ Market Data Client ]
        │
        ├─── (REST API) ────► [ FastAPI Backend Router ] ───► [ Provider Chain ]
        │                              │                      ├── TrueData (Optional Paid Feed)
        │                              │                      ├── NSE Snapshot / Yahoo Finance
        │                              │                      └── AMFI / MFAPI Feeds
        ▼                              ▼
[ Direct Client Fallbacks ]     [ Server-Side Cache ]
(MFAPI / Deterministic Models)  (TTL: 30s Quotes / 1h NAV)
```

---

## 🎨 Design System & Visual Foundation

- **Card Architecture**: 20px corner radius (`rounded-2xl`) with theme-aware borders and contrast hover lifts.
- **Two-Theme Palette**:
  - **Dark Theme**: Deep `#101217` canvas, `#1C2129` card surface, `#C1E8FF` light blue accent, `#0A1017` readable accent text.
  - **White Theme**: `#F7FAFD` canvas, `#FFFFFF` card surface, `#388DEB` brand blue accent, `#FFFFFF` crisp accent text.
  - **Transitions**: Controlled 800ms cubic-bezier transition on theme variables with zero layout shift.
- **Branding**: Approved SmartVest horizontal lockup and SV monogram; zero legacy marks or unapproved AI decorations.
- **Navigation**: Persistent desktop collapsible sidebar (72px rail / 256px expanded), mobile topbar drawer, and global logo click returning to `/dashboard`.
- **Accessibility**: Full WCAG 2.1 AA compliance, ≥44px touch targets, ARIA labels, focus-visible rings, and full support for `prefers-reduced-motion`.

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | 19.x | Component architecture & reactive UI |
| **Language** | **TypeScript** | 6.x | Strict static typing & domain modeling |
| **Build Tooling** | **Vite** | 8.2.2 | High-performance bundling & fast HMR |
| **Styling** | **Tailwind CSS** | v4 | Utility styling, custom CSS tokens & card system |
| **State Store** | **Zustand** | 5.0 | Reactive store for user mandate, strategy & theme |
| **Data Visualization** | **Recharts** | 3.10 | Interactive candlestick, line, area & allocation charts |
| **Icons** | **Lucide React** | 1.34 | Accessible icon system |
| **Backend API** | **FastAPI (Python)** | 0.115 | Asynchronous REST routing & market provider failover |
| **Server** | **Uvicorn** | 0.34 | Production ASGI server |
| **Database ORM** | **SQLAlchemy / SQLite** | 2.0 | Session caching & user benchmarks |
| **Authentication** | **Firebase Auth** | 12.18 | Email/Password, Google OAuth, and developer bypass |
| **Observability** | **Sentry React** | 10.73 | Production error monitoring & breadcrumbs |
| **Testing** | **Vitest** | 4.1.11 | Automated test runner (19 test files, 150 passing tests) |
| **Linter** | **Oxlint** | latest | High-speed static analysis (0 errors) |

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: v20.x (LTS) or higher
- **Python**: v3.11+ (optional, for running local backend server)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/sharathgowdaur-jpg/smart-investment-strategic-advisor.git
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

Run the automated Vitest test suite (19 test suites, 150 tests):
```bash
cd frontend
npm test -- --run
```

Run static linting with Oxlint:
```bash
npm run lint
```

Run production typecheck and Vite build:
```bash
npm run build
```

---

## 🔒 Security & Compliance

- **Secret Isolation**: Provider credentials and API keys are restricted to backend environment files and are never bundled in client bundles.
- **PII Scrubbing**: The structured logging system and Sentry integration sanitize passwords, authorization headers, salaries, and account balances before emitting logs.
- **Fiduciary Non-Custodial Principles**: Explicit risk warnings, disclaimers, and clear regulatory boundaries embedded across every recommendation view.
- **Deterministic Demo Sandbox**: Appending `?demo=true` or toggling demo mode activates a fully self-contained offline dataset without requiring live API keys.

---

## 📚 Documentation Directory

- [Project Overview](docs/PROJECT_OVERVIEW.md) — Fiduciary objectives, user personas, and core workflows.
- [System Architecture](docs/ARCHITECTURE.md) — Layered architecture and data flow diagrams.
- [Live Demo Script](docs/DEMO_SCRIPT.md) — Step-by-step product walkthrough.
- [Viva Q&A Guide](docs/VIVA_QA.md) — 40 technical viva questions with detailed explanations.
- [Technical Details](docs/TECHNICAL_DETAILS.md) — Financial compounding algorithms and mathematical models.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
