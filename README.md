# SmartVest AI — Strategic Investment & Financial Advisor

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **SmartVest AI** is an institutional-grade, conflict-free personal wealth advisory platform. It combines dynamic multi-factor asset allocation, real-time market data ingestion (Equities, Direct Mutual Funds, ETFs, and Commodities), and an intelligent conversational co-pilot (**VestIQ AI**) to calibrate personalized financial roadmaps.

---

## 🌟 Key Features

### 1. 🤖 VestIQ AI — Conversational Wealth Co-Pilot
- Context-aware financial co-pilot analyzing portfolio allocation, investable cashflow surplus, and milestone goals.
- Multi-turn conversational memory with persistent session history.
- Grounded financial knowledgebase providing explainable investment rationale without broker bias.

### 2. 📊 Production-Grade Market Data Engine
- **Direct Mutual Funds**: Connected to official **AMFI** feeds for daily published Net Asset Values (NAV) across Index, Flexi-Cap, Liquid, and Small-Cap funds.
- **Equities & Global ETFs**: Live & 15-minute delayed tick streams for **NSE, BSE, NASDAQ**, and global ETFs (`NIFTY 50`, `SENSEX`, `MON100`, `GOLDBEES`).
- **Interactive Multi-Timeframe Charts**: Historical observations (1D, 1W, 1M, 3M, 1Y, 3Y, 5Y) with dynamic return calculations.
- **Global Market Terminal**: Searchable directory covering 57+ curated domestic and global instruments with fundamental metrics (P/E, P/B, Market Cap, Beta, 52W Range).

### 3. 🎯 Fiduciary Portfolio Strategy Engine
- **Risk Capacity & Tolerance Matrix**: Evaluates age, runway, financial dependents, and cashflow stability to produce objective Fit Scores (0–100).
- **Anti-Overlap Multi-Asset Baskets**: Eliminates redundant portfolio drag by curating low-cost Direct-Growth Index funds, active flexi-cap alpha, international tech diversification, and liquid emergency reserves.
- **Compounding Wealth Projections**: Interactive 5Y to 25Y Monte Carlo-style growth projections across Conservative, Base, and Optimistic scenarios.

### 4. 💳 Cashflow Management & Goal Planning
- **Expense Tracker & Runway Engine**: Real-time surplus calculations, savings rate analysis, and target emergency reserve funding indicators (3–6 months).
- **Milestone Goal Roadmaps**: Automated monthly SIP calculation and probability projections for major life milestones (Home Down Payment, Retirement, Education).

### 5. 🌗 Adaptive Dark & Light Themes
- Sleek dark fintech terminal mode and clean light theme with instant persistent state synchronization.

### 6. 📑 Exportable Fiduciary PDF Reports
- One-click client-ready PDF generation summarizing personalized portfolio blueprints, risk assessments, and execution guidelines.

---

## 🏗️ System Architecture

```
smart-investment-strategic-advisor/
├── backend/                         # FastAPI Python Backend
│   ├── app/
│   │   ├── api/v1/                  # REST API endpoints (Market, AI, Allocation, Goals, Expenses)
│   │   ├── core/                    # App config, database session, and security
│   │   ├── models/                  # SQLAlchemy ORM models (Users, Profiles, Goals, Expenses, Sessions)
│   │   └── services/
│   │       ├── market_data/         # AMFI NAV, Yahoo Finance, NSE/BSE feeds, Caching
│   │       ├── financial_knowledge/ # RAG & Rule-based Knowledge Validation
│   │       └── strategy_engine/     # Fiduciary asset allocation logic
│   ├── scripts/                     # Diagnostics & smoke testing suites
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # Backend Docker container config
│
├── frontend/                        # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/           # Strategic Wealth Overview & KPIs
│   │   │   ├── market/              # Global Market Terminal & Instrument Modals
│   │   │   ├── recommendations/     # Curated Investment Blueprint & Performance Charts
│   │   │   ├── vestiq/              # VestIQ AI Workspace & Context Panel
│   │   │   ├── expenses/            # Cashflow & Expense Analyzer
│   │   │   ├── goals/               # Milestone Goal Planner
│   │   │   └── landing/             # Modern landing page & SIP Simulator
│   │   ├── hooks/                   # Real-time polling hooks (Quotes, Candles, Status)
│   │   ├── services/                # API clients (Market, Auth, Strategy, PDF Generator)
│   │   └── store/                   # Zustand global state (Theme, Auth, Strategy, Currency)
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.ts               # Vite bundler configuration
│
├── docker-compose.yml               # Multi-container local deployment
├── MARKET_DATA.md                   # Market data architecture & compliance documentation
└── README.md                        # Project documentation
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Python** 3.11+
- **Node.js** 18+ and **npm**

---

### 1. Clone the Repository
```bash
git clone https://github.com/ravitejpatgar-art/smart-investment-strategic-advisor.git
cd smart-investment-strategic-advisor
```

---

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
- API Server: `http://127.0.0.1:8000`
- Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Recharts, Framer Motion, Lucide Icons |
| **Backend** | FastAPI, Python 3.12, SQLAlchemy, SQLite / PostgreSQL, Pydantic v2, Uvicorn |
| **Market Data** | AMFI Official Daily NAV Feed, Yahoo Finance API, NSE/BSE Market Data Engine |
| **AI / NLP** | OpenAI / Gemini API Integration with Financial Guardrails & Knowledge Base |
| **Deployment** | Docker, Docker Compose, Render / Cloud Hosting Ready |

---

## 📜 Fiduciary & Regulatory Notice

SmartVest is an **educational and decision-support advisory platform**.
- It is **not** a registered broker-dealer.
- It does **not** execute trades, place orders, or custody client funds.
- Execution occurs independently through SEBI-registered brokers (Zerodha, Groww, INDmoney) or AMFI-registered mutual fund platforms.
- Mutual fund recommendations prioritize **Direct-Growth plans** to eliminate distributor commission drag.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
