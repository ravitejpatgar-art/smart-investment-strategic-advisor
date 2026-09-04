# SmartVest — Final Presentation Deck & Speeches

---

## 📽️ Slide Deck (16 Presentation Slides)

### **Slide 1: Title**
- **Headline**: **SmartVest**
- **Sub-headline**: Strategic Multi-Asset Wealth Advisory & Decision-Support Platform
- **Project Scope**: Undergraduate Engineering Final Project / Technical Demonstration
- **Candidate Details**: [Student Name / Roll No Placeholder]
- **Core Tagline**: *"Deterministic Mathematical Asset Allocation Paired with In-Context Grounded AI."*

---

### **Slide 2: Problem Statement**
- **Fragmented Personal Finances**: Cash flows, existing savings, emergency funds, and milestone goals are scattered across disconnected spreadsheets and banking apps.
- **Emotional & Biased Asset Allocation**: Retail capital often concentrates heavily in single speculative stocks or underperforming traditional deposits without calculating risk capacity or diversification benefits.
- **Ungrounded AI Financial Advice**: Emerging AI chatbots frequently hallucinate numbers, recommend speculative assets, and quote inaccurate return percentages because they lack strict in-context grounding.
- **Broker Execution Conflicts**: Most retail platforms operate as commission-driven brokers incentivized by trade volume rather than conflict-free fiduciary asset allocation.

---

### **Slide 3: Proposed Solution**
- **Decoupled Architecture**: Separation of deterministic mathematical computation from conversational AI explanation.
- **End-to-End Workflow**:
  $$\text{User Profile} \longrightarrow \text{Surplus \& Runway Analysis} \longrightarrow \text{Risk Capacity Matrix} \longrightarrow \text{Multi-Asset Blueprint} \longrightarrow \text{VestIQ AI Copilot} \longrightarrow \text{What-If Scenarios} \longrightarrow \text{SIP Rebalancing}$$
- **Fiduciary Decision Support**: Completely advisory, non-custodial, and non-broker.

---

### **Slide 4: Project Objectives**
1. **Automate Comprehensive Cashflow Health Scoring**: Measure savings rate, emergency runway adequacy, and investment readiness dynamically.
2. **Calibrate Personalized Multi-Asset Allocations**: Generate asset allocations matching individual risk capacity across Indian Equities, Global Tech ETFs, Gold, and Liquid Debt.
3. **Provide Resilient Multi-Tier Market Intelligence**: Ingest live, delayed, and fallback market feeds across NSE/BSE and AMFI mutual funds with deterministic status badges.
4. **Deliver Grounded AI Financial Guidance**: Enable conversational Q&A on personal finances without risking mathematical hallucination.
5. **Facilitate Interactive Scenario Modeling**: Simulate annual step-up compounding, return sensitivity, and inflation-discounted real wealth.
6. **Support Non-Liquidating Portfolio Rebalancing**: Track percentage drift against target models and compute SIP corrective distribution.

---

### **Slide 5: Unique Selling Proposition (USP)**
- **Primary USP**:
  > **Ground-Truth Architecture**: Complete architectural decoupling between a **100% deterministic mathematical financial calculation engine** and an **in-context grounded conversational AI (VestIQ)**, guaranteeing zero financial or numerical hallucinations.
- **Supporting Differentiators**:
  1. **5-Tier Resilient Market Pipeline**: Failover cascade (`TrueData` $\rightarrow$ `NSE Snapshot` $\rightarrow$ `Yahoo Finance` $\rightarrow$ `AMFI NAV` $\rightarrow$ `Baseline Models`) guaranteeing zero UI crashes.
  2. **Tax-Efficient New-Contribution Rebalancing**: Realigns portfolio drift by steering future monthly SIP surplus into underweight asset classes without forcing asset liquidation.
  3. **Institutional Security & Privacy**: Client-side secret isolation, zero browser credential exposure, comprehensive Sentry telemetry with PII sanitization, and structured audit trails.

---

### **Slide 6: System Architecture**
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

### **Slide 7: Technology Stack**
| Layer | Technology | Purpose | Location |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React 19.2.8** | Component architecture & reactive UI | `frontend/src/` |
| **Language** | **TypeScript 6.0.2** | Compile-time type safety & domain modeling | `frontend/src/types/` |
| **Build Tooling** | **Vite 8.2.2** | High-performance bundling & HMR | `frontend/vite.config.ts` |
| **Styling** | **Tailwind CSS v4.3.3** | Institutional dark theme & mobile micro-interactions | `frontend/src/index.css` |
| **State Management** | **Zustand 5.0.15** | Global store for user profile, strategy, and quotes | `frontend/src/store/useFintechStore.ts` |
| **Data Visualization** | **Recharts 3.10.1** | Interactive area, trajectory, and allocation charts | `frontend/src/components/` |
| **Backend API** | **FastAPI 0.115.8 (Python)** | Asynchronous REST routing & provider failover | `backend/app/main.py` |
| **Server** | **Uvicorn 0.34.0** | Production ASGI server | `backend/app/` |
| **Database ORM** | **SQLAlchemy 2.0.38 / SQLite** | Relational user benchmark & session caching | `backend/app/core/database.py` |
| **Authentication** | **Firebase Auth 12.18.0** | Email/password, Google OAuth, and dev bypass | `frontend/src/services/firebase.ts` |
| **Observability** | **Sentry React 10.73.0** | Production error monitoring & breadcrumbs | `frontend/src/services/sentry.ts` |
| **Testing** | **Vitest 4.1.11** | Unit, regression, and contract test runner (75 tests) | `frontend/src/__tests__/` |

---

### **Slide 8: Core Financial Engine (`strategyEngine.ts`)**
- **Monthly Investable Surplus**:
  $$\text{Surplus} = \max(0, (\text{Salary} + \text{Other Income}) - \text{Expenses}), \quad \text{Recommended SIP} = \text{Surplus} \times 0.90$$
- **Emergency Runway Adequacy**:
  $$\text{Runway (Months)} = \frac{\text{Emergency Fund} + \text{Savings}}{\text{Monthly Expenses}} \quad (\ge 6\text{ months} = \text{Healthy})$$
- **Risk Capacity Matrix**:
  $$\text{Effective Risk Category} = \min(\text{Stated Risk Tolerance}, \text{Evaluated Risk Capacity})$$
- **Multi-Asset Allocation**:
  - Core Domestic Large Cap Index (`Nifty 50`)
  - Active Flexi Cap Alpha (`PPFAS`)
  - Global Tech Diversification (`Nasdaq 100 / MON100`)
  - Sovereign Gold Bonds (`GoldBeES`) & Liquid Debt Yield
- *Disclaimer*: All compounding outputs are mathematical models, not guaranteed returns.

---

### **Slide 9: Multi-Tier Market Data Pipeline (`marketApi.ts`)**
- **5 Freshness Classifications**:
  1. `LIVE`: Real-time streaming or tick feed from authorized provider.
  2. `DELAYED`: 15-minute delayed exchange feed (NSE/BSE/NASDAQ).
  3. `LATEST NAV`: Published end-of-day mutual fund Net Asset Value (AMFI).
  4. `FALLBACK`: Deterministic baseline model when external networks disconnect.
  5. `DEMO`: Self-contained evaluation sandbox (`?demo=true`).
- **Resilience Features**: Multi-symbol batch quote fallback, cached historical candles, and zero UI crashing.

---

### **Slide 10: VestIQ Grounded AI Copilot (`vestiqAiService.ts`)**
- **Anti-Hallucination Grounding**:
  - Synthesizes exact computed state (Monthly Surplus: ₹27,000, Runway: 4.5 months, Target Allocations: 45% Equity / 20% Debt) directly into the LLM system prompt.
  - Strict guardrails: Prohibits quoting unverified figures or recommending speculative crypto assets.
- **Concrete Example**:
  - *User Query*: "How much can I invest each month?"
  - *VestIQ Grounded Answer*: "Based on your verified monthly income of ₹1,00,000 and total expenses of ₹70,000, your investable surplus is ₹30,000. SmartVest recommends a monthly SIP of ₹27,000 (retaining a ₹3,000 flexible buffer) across your risk-calibrated asset blueprint."
- **Offline Rule Engine**: Graceful fallback when upstream AI endpoints are unreachable.

---

### **Slide 11: What-If Scenario Simulator (`scenarioEngine.ts`)**
- **Interactive Multi-Variable Modeling**:
  - Monthly SIP (₹), Expected Return %, Horizon (Years), Annual Step-Up %, Inflation %.
- **Presets**: `Conservative` (Base $-3\%$), `Base` (Authoritative CAGR), `Optimistic` (Base $+3\%$), `Custom`.
- **Annual Step-Up Compounding**:
  $$S_y = S_0 \times (1 + \text{stepUp})^{y-1}, \quad C_m = (C_{m-1} + S_y) \times (1 + r_m)$$
- **Inflation Purchasing Power Discounting**:
  $$\text{Real Purchasing Power} = \frac{\text{Nominal Future Corpus}}{(1 + \text{Inflation Rate})^{\text{Years}}}$$
- **Return Sensitivity Matrix**: Evaluates outcomes across return variations ($R-4\% \dots R+4\%$).

---

### **Slide 12: Portfolio Rebalancing Advisory (`rebalancingEngine.ts`)**
- **Allocation Drift Analysis**:
  $$\text{Drift}_i = \text{Current Percentage}_i - \text{Target Percentage}_i$$
- **Configurable Sensitivity Thresholds**: $\pm 1\%$, $\pm 2\%$, $\pm 5\%$.
- **Status Classification**: `OVERWEIGHT`, `UNDERWEIGHT`, `ON_TARGET`.
- **Tax-Efficient New-Contribution SIP Plan**:
  $$\text{Suggested SIP}_i = S_{\text{monthly}} \times \frac{\text{Deficit}_i}{\sum \text{Deficit}_k}$$
- *Advisory Only*: SmartVest illustrates adjustments and new contribution plans without executing broker orders.

---

### **Slide 13: Security, Observability & Reliability**
- **Server-Side Secret Protection**: Vendor API keys (`TRUEDATA_API_KEY`, etc.) reside exclusively on the FastAPI backend server; zero commercial keys exist in client-side bundles.
- **Client-Side PII Scrubbing**: Structured logger and Sentry integration scrub passwords, tokens, salaries, and private portfolio values before recording telemetry.
- **Production Observability**: Sentry React SDK for error tracking, structured console logging (`[SmartVest:INFO]`), and non-blocking compliance audit trails (`auditLogger.ts`).
- **Demo Mode Sandbox**: Full offline evaluation sandbox enabled via `?demo=true`.

---

### **Slide 14: Automated Testing & CI/CD Pipeline**
- **Vitest Automated Test Suite**: **10 test files, 75 unit tests (100% pass rate)**.
- **CI/CD Workflow** (`.github/workflows/ci.yml`):
  $$\text{GitHub Push / PR} \longrightarrow \text{GitHub Actions (Ubuntu)} \longrightarrow \text{npm ci} \longrightarrow \text{npm test (75/75)} \longrightarrow \text{npm run build (0 errors)} \longrightarrow \text{Vercel Edge Deployment}$$
- **Live Production URL**: `https://smart-investment-strategic-advisor.vercel.app/`

---

### **Slide 15: Live Demonstration Workflow**
```
1. Landing Page ────► Fast interactive SIP calculator & dark mode theme.
2. Dashboard ───────► Surplus calculation, emergency runway, and wealth compounding chart.
3. Recommendations ─► Multi-asset blueprint, suitability scores, and execution disclosures.
4. Scenario Sim ────► Compounding sliders, annual step-up %, and inflation-adjusted purchasing power.
5. Rebalancing ─────► Portfolio drift matrix, threshold selectors, and tax-efficient SIP plan.
6. Market Terminal ─► Multi-asset ticker grid with LIVE/DELAYED/FALLBACK status badges.
7. VestIQ AI ───────► Conversational queries answered strictly using verified ground-truth context.
```

---

### **Slide 16: Limitations & Future Scope**
- **Current Limitations**:
  - Advisory-only scope (no trade execution or custody).
  - 15-minute exchange delay on free tier data endpoints.
  - Compounding simulations use deterministic expected returns rather than stochastic paths.
- **Future Scope**:
  - Direct 1-click broker execution via Zerodha Kite / Groww OAuth APIs.
  - 10,000-path stochastic Monte Carlo simulation engine.
  - Automated tax-loss harvesting module.
  - Direct Demat Consolidated Account Statement (CAS) holdings importer.

---

## 🎙️ Spoken Presentation Speeches

### **1. 30-Second Elevator Pitch**
> "SmartVest is an institutional-grade strategic investment advisory platform that provides retail investors with personalized, mathematically calibrated multi-asset portfolios. Unlike generic robo-advisors or speculative stock pickers, SmartVest computes exact investable surplus and risk capacity deterministically, pairing it with an in-context grounded AI financial assistant that eliminates hallucinations."

### **2. 1-Minute Comprehensive Pitch**
> "Retail investing today is broken: investors receive fragmented advice, succumb to emotional asset allocation, and encounter AI chatbots that hallucinate financial numbers. SmartVest solves this with a strict architectural separation of concerns: our core financial engine deterministically calculates disposable surplus, emergency runway, and asset allocations across Indian Equities, Global Tech ETFs, Gold, and Liquid Debt. Our grounded AI copilot, VestIQ, communicates this advice conversationally using strict ground-truth context. Supported by a resilient multi-provider market data pipeline, a what-if scenario simulator, and a tax-efficient SIP rebalancing analyzer, SmartVest delivers institutional decision-support without custody or broker bias."

### **3. Architecture Speech (60–90 Seconds)**
> "Architecturally, SmartVest is built as a high-performance Single Page Application using React 19, TypeScript, and Tailwind CSS v4, backed by a FastAPI Python backend. State is managed reactively through Zustand with Firebase Authentication. For market data, we employ a 5-tier failover hierarchy spanning TrueData, NSE snapshot feeds, Yahoo Finance, and direct AMFI mutual fund APIs. Our testing suite runs 75 automated Vitest unit tests in GitHub Actions CI prior to automated Vercel deployment. Private API keys are strictly isolated on the backend server, guaranteeing zero credential exposure in client bundles."

### **4. Spoken Live Demo Transitions**
- **Dashboard**: *"Here on the Overview Dashboard, SmartVest calculates the investor's exact monthly investable surplus after retaining a 10% flexible cash buffer. The compounding chart models long-term wealth growth from 5 to 25 years based on the user's verified risk capacity."*
- **Recommendations**: *"The recommendation engine selects optimal institutional instruments tailored to the user's time horizon and liquidity requirements across Core Growth, Long-Term Alpha, and Safety."*
- **Scenario Simulator**: *"Investors can model what-if scenarios in real-time. For example, by enabling a 5% annual SIP step-up, SmartVest calculates the compounded corpus while discounting future value by 6% inflation to show real purchasing power in today's currency."*
- **Rebalancing**: *"SmartVest identifies portfolio drift and computes a new-contribution SIP plan to realign asset allocations without forcing asset liquidation or generating tax events."*
- **Market Terminal**: *"Every market quote carries an explicit freshness status, ensuring delayed or fallback data is never misrepresented as real-time."*
- **VestIQ**: *"VestIQ answers investor questions using only the user's computed financial ground truth, eliminating mathematical hallucinations."*

### **5. Closing Statement (20–30 Seconds)**
> *"In summary, SmartVest demonstrates how modern web engineering can solve personal finance challenges. By combining React 19, TypeScript, and FastAPI with a mathematically deterministic strategy engine and a grounded AI assistant, we deliver institutional-grade portfolio intelligence with zero hallucinations, complete privacy, and 100% verified reliability. Thank you, and I am happy to answer any questions."*

---

## 📋 Presenter Rules & Guidelines
1. **Never Claim Guaranteed Returns**: Always describe compounding outputs as model-based educational illustrations.
2. **Clarify Advisory Scope**: Clearly articulate that SmartVest does not execute trades or hold user funds.
3. **Be Transparent About Market Data**: Point out `DELAYED` or `FALLBACK` badges openly to highlight system transparency.
4. **Emphasize AI Grounding**: Reiterate that VestIQ interprets deterministic numbers rather than generating financial math.
