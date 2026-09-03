# SmartVest — System Architecture & Design

## 1. System Overview

SmartVest is structured as a modern, decoupled client-server architecture:
- **Frontend**: A high-performance, reactive Single Page Application built with React 19, TypeScript 6, Tailwind CSS v4, and Zustand.
- **Backend API**: An asynchronous Python FastAPI service responsible for multi-provider market data routing, health tracking, failover handling, and database persistence.
- **Authentication**: Firebase Authentication with email/password and Google OAuth, plus an offline dev mock bypass.
- **AI Layer**: In-context grounded conversational engine (VestIQ) with deterministic offline fallback.
- **Observability**: Production exception monitoring via Sentry React SDK, client-side structured logger, and compliance audit trails.

---

## 2. Layered Architecture Diagram

```
                                 [ USER CLIENT (Browser) ]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             [ React 19 + TypeScript ]                  [ Zustand State Store ]
             [ Tailwind CSS v4 Engine ]                 (Profile, Strategy, Quotes)
                       │                                           │
         ┌─────────────┼───────────────────────────┬───────────────┤
         ▼             ▼                           ▼               ▼
  [ Strategy Engine ] [ Scenario Engine ]  [ Rebalancing Engine ] [ VestIQ AI ]
  (Math & CAGR)     (Step-Up Compounding) (Drift & SIP Plans)    (Grounded Prompts)
         │                                                         │
         ▼                                                         ▼
  [ Market API Client ]                                    [ AI Intermediary ]
         │
         ├─── (REST API) ───► [ FastAPI Backend Router ] ───► [ Multi-Provider Engine ]
         │                             │                      ├── TrueData (Paid Indian Feed)
         │                             │                      ├── Yahoo Finance (Delayed Global)
         │                             │                      ├── Polygon / TwelveData (US)
         │                             │                      └── AMFI / MFAPI (Mutual Funds)
         ▼                             ▼
  [ Direct Client Fallback ]    [ Server-Side Cache ]
  (MFAPI / Baseline Models)     (TTL: 30s Quotes / 1h NAV)
```

---

## 3. Frontend Architecture

### **State Management (`useFintechStore.ts`)**
SmartVest uses **Zustand** for centralized, predictable state management:
- `user`: Holds the authenticated user profile (income, expenses, emergency fund, risk answers, goals).
- `strategy`: Computed dynamically via `calculateInvestmentStrategy(user, expenses, goals)`.
- `marketQuotes`: Real-time and delayed quote cache indexed by symbol.
- `currency`: Active display currency (`INR` with `₹` or `USD` with `$`).

### **Component Hierarchy**
- `DashboardLayout.tsx`: Top header, navigation drawer, currency switcher, PDF export button, and floating VestIQ trigger.
- `OverviewDashboard.tsx`: High-level KPI strip, emergency runway gauge, wealth compounding AreaChart, asset allocation donut chart, and milestone goal cards.
- `InvestmentRecommendationsView.tsx`: Sub-tab navigation switching between:
  1. `Allocation Blueprint & Instruments`: Curated asset cards, radial suitability gauges, and independent platform execution links.
  2. `ScenarioSimulatorView.tsx`: Interactive what-if modeling across SIP, expected return, horizon, annual step-up, and inflation.
  3. `PortfolioRebalanceView.tsx`: Allocation drift matrix, threshold selectors, and tax-efficient SIP rebalance plans.
- `MarketTerminalView.tsx`: Searchable 57+ instrument terminal with asset class filters, live quote cards, and modal sparkline charting.
- `AIAssistantDrawer.tsx`: In-context grounded conversational interface for VestIQ.

---

## 4. Backend Architecture (`FastAPI`)

The backend (`backend/app/`) acts as a resilient market data gateway and provider router:
- `app/main.py`: Application entrypoint configuring CORS, routes, and middleware.
- `app/api/v1/endpoints/market.py`: REST endpoints:
  - `GET /market/quotes`: Multi-symbol batch quote snapshots.
  - `GET /market/candles/{symbol}`: Historical daily/weekly OHLCV candle observations.
  - `GET /market/status`: Exchange market hours schedule (NSE/BSE, NYSE/NASDAQ).
  - `GET /market/providers`: Active provider capabilities and entitlement matrix.
- `app/services/market_data/router.py`: `ProviderRouter` with automatic failover, health tracking, cooldown backoffs, and ephemeral cache.

---

## 5. Market Data Hierarchy & Fallback Pipeline

SmartVest enforces a 5-tier failover hierarchy to guarantee zero UI crashes:
1. **Tier 1: Optional Paid Indian Provider (TrueData)**: When configured via server-side API keys, queries authorized real-time NSE/BSE feeds (`status: 'LIVE'`).
2. **Tier 2: Exchange Delayed Feed (NSE / Yahoo)**: Standard 15-minute delayed snapshot (`status: 'DELAYED'`).
3. **Tier 3: Direct AMFI / MFAPI Provider**: Official published daily mutual fund NAVs (`status: 'FALLBACK'`, tagged `LATEST NAV`).
4. **Tier 4: Static Baseline Model**: Built-in baseline prices and volatility metrics (`status: 'FALLBACK'`).
5. **Tier 5: Graceful Unavailable State**: Returns an explicit `UNAVAILABLE` quote badge without throwing errors or breaking charts.

---

## 6. Observability, Logging & Security Architecture

1. **Sentry React SDK (`sentry.ts`)**: Captures unhandled exceptions and console breadcrumbs with automatic PII scrubbing.
2. **Structured Logger (`logger.ts`)**: Formats application events (`[SmartVest:INFO]`, `[SmartVest:WARN]`, `[SmartVest:ERROR]`) with structured metadata.
3. **Compliance Audit Logger (`auditLogger.ts`)**: Records non-blocking compliance audit events (`AUTH_*`, `PROFILE_*`, `MARKET_*`, `SCENARIO_*`, `REBALANCE_*`).
4. **Zero Client-Side Secrets**: Commercial vendor API keys are restricted to backend environment variables and are never bundled into client-facing JavaScript.
