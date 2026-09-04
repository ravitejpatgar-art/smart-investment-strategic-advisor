# SmartVest: Intelligent Investment & Wealth Advisory Decision-Support System
**Final College Project Submission Report**

---

## 1. Title
**SmartVest: An Intelligent Multi-Asset Strategic Wealth Advisory & Portfolio Decision-Support Platform**

* **Academic Year:** 2025–2026
* **Domain:** Financial Technology (FinTech), Wealth Engineering, Decision Support Systems, Applied AI
* **Architecture:** Decoupled Client-Server (React 19 SPA + Python FastAPI Gateway + Multi-Provider Market Engine)

---

## 2. Abstract
Modern retail investors frequently struggle with fragmented financial data, emotional decision-making, unvetted social media advice, and a lack of structured mathematical planning. Existing commercial platforms either operate as pure transactional brokers without unbiased advisory logic or offer black-box robo-advisory tools that mandate custody of funds. 

This project presents **SmartVest**, an intelligent, non-custodial, multi-asset investment strategic advisor and portfolio decision-support system. SmartVest bridges personal cash flow budgeting with institutional-grade asset allocation by evaluating user financial surplus, emergency runway buffers, and psychometric risk profiles through a deterministic financial strategy engine. The platform integrates a resilient 5-tier market data pipeline (supporting live feeds via TrueData, delayed exchange snapshots, official AMFI mutual fund NAVs, and deterministic baseline models with zero-crash fallbacks). Furthermore, it incorporates **VestIQ**, a strictly grounded, in-context financial AI advisor that operates under anti-hallucination constraints using the user's authoritative financial state. Additional analytical capabilities include an interactive 4-scenario compounding simulator with annual SIP step-up and inflation modeling, as well as a multi-asset allocation drift analyzer that formulates tax-efficient contribution-based rebalancing plans. SmartVest is engineered with zero frontend secret exposure, production exception monitoring via Sentry, full compliance audit logging, and 100% automated test verification across 10 test suites (75 test cases), delivering an accessible, resilient, and academically rigorous wealth planning solution.

---

## 3. Introduction
Financial literacy and systematic wealth accumulation remain critical socio-economic challenges. While retail participation in capital markets has expanded exponentially through discount brokerages and mobile trading applications, the vast majority of individual investors fail to build diversified, goal-aligned portfolios. Common pitfalls include overconcentration in speculative equities, neglect of liquid emergency reserves, failure to account for long-term inflation, and panic-driven portfolio abandonment during market drawdowns.

SmartVest was developed to provide retail investors with institutional-grade strategic planning tools previously accessible only through high-net-worth wealth management services. Operating strictly as an advisory and decision-support platform, SmartVest empowers users to simulate scenarios, detect portfolio drift, formulate discipline-enforcing SIP contribution strategies, and receive context-grounded AI guidance without transferring custody of their funds or executing unvetted trades.

---

## 4. Problem Statement
Retail investors face severe systemic challenges when planning long-term wealth creation:
1. **Disconnection Between Cash Flow and Investment Mandates:** Individuals often commit capital to illiquid or high-risk instruments without establishing an adequate liquid emergency runway (minimum 3–6 months of living expenses).
2. **Emotional Bias and Lack of Asset Allocation Discipline:** Investment choices are frequently dictated by market noise and recency bias, leading to significant asset allocation drift away from risk-appropriate targets.
3. **Data Fragility and Opaque Broker Incentives:** Traditional retail tools either suffer from frequent API outages during volatility or prioritize high-turnover trading over long-term strategic compounding to maximize brokerage commissions.
4. **AI Hallucinations in Financial Guidance:** General-purpose Large Language Models (LLMs) frequently hallucinate numerical facts, invent stock prices, or provide dangerous, non-compliant financial advice when ungrounded in real user telemetry.

---

## 5. Limitations of Existing Systems
| Feature / Characteristic | Traditional Brokerages (Zerodha, Groww) | Generic Personal Finance Apps | Generic AI Chatbots (ChatGPT) | SmartVest Platform |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Incentive** | Transaction volume / Brokerage | Ad revenue / Lead generation | Open-domain text completion | Unbiased strategic decision-support |
| **Asset Allocation Engine** | Absent or rudimentary | Static pie charts | Generic textual suggestions | Rule-based, risk-mandated math models |
| **Emergency Fund Gating** | None (Encourages immediate trading) | Passive tracking | None | Strict prerequisite gating logic |
| **Market Data Resilience** | Single API dependency (Fails on outage) | Infrequent batch scraping | Outdated / Fabricated data | 5-Tier failover with explicit badges |
| **AI Context Grounding** | Rule-based static FAQs | Hardcoded rule scripts | Ungrounded (High hallucination risk) | Strictly grounded in active user telemetry |
| **Portfolio Rebalancing** | Manual calculation required | Basic percentage display | High-level advice only | Multi-threshold SIP contribution rebalancer |
| **Fund Custody** | Full custody required | Optional aggregators | N/A | Non-custodial (Zero fund handling) |

---

## 6. Proposed System
SmartVest operates through a structured, multi-stage financial lifecycle:

```
[ User Onboarding / Authentication ]
                 │
                 ▼
[ Monthly Cash Flow & Expense Profiling ] ──► [ Emergency Runway Calculation ]
                 │
                 ▼
[ Psychometric Risk Tolerance Assessment ] ──► [ Risk Category Determination ]
                 │
                 ▼
[ Financial Strategy Engine Calculation ] ──► [ Asset Class Target Allocation ]
                 │
                 ▼
[ Multi-Asset Goal Mapping & Priority Stacking ]
                 │
                 ├──► [ 5-Tier Resilient Market Terminal (57+ Instruments) ]
                 ├──► [ 4-Scenario Compounding Simulator (Step-Up & Inflation) ]
                 ├──► [ Portfolio Drift & Contribution Rebalance Engine ]
                 └──► [ VestIQ Grounded AI Advisor (Context-Enforced) ]
```

---

## 7. Measurable Project Objectives
1. **Objective 1 — Deterministic Financial Strategy Generation:** Compute monthly surplus, savings rate, emergency runway months, and target asset allocation (Equity, Debt, Gold, Cash) within <5ms using deterministic mathematical models.
2. **Objective 2 — High-Resilience Market Data Pipeline:** Implement a 5-tier failover routing engine (TrueData Paid $\rightarrow$ Yahoo Delayed $\rightarrow$ AMFI/MFAPI $\rightarrow$ Baseline Model $\rightarrow$ Graceful UNAVAILABLE) achieving 100% UI uptime without unhandled crashes.
3. **Objective 3 — Anti-Hallucination AI Grounding:** Design an in-context grounding architecture for VestIQ that strictly binds AI prompts to the user's verified financial state, preventing fabricated numbers.
4. **Objective 4 — Dynamic Compounding & Scenario Simulation:** Enable real-time simulation of Conservative, Base, Optimistic, and Custom investment scenarios with user-adjustable SIP, return rates, investment horizons, step-up rates, and inflation indexing.
5. **Objective 5 — Tax-Efficient Rebalancing Advisory:** Calculate exact allocation drift across asset classes against configurable tolerance bands (1%–10%) and generate contribution-based rebalancing recommendations without triggering premature capital gains tax.
6. **Objective 6 — Non-Custodial Security & Secret Isolation:** Enforce complete isolation of backend commercial API keys, sanitize client-side telemetry of PII, and maintain full compliance audit trails.
7. **Objective 7 — Rigorous Automated Verification:** Maintain 100% test passing rate across all test suites covering edge cases, market failovers, responsive breakpoints, and mathematical calculations.

---

## 8. System Scope
* **In Scope:**
  * Cash flow and budget surplus computation.
  * Risk tolerance profiling across Conservative, Moderately Conservative, Balanced, Growth, and Aggressive profiles.
  * Multi-asset strategic recommendations (Indian Large-Cap, Mid-Cap, Flexi-Cap, US Equities, Short-Term Debt, Sovereign Gold Bonds).
  * Market data monitoring for 57+ multi-asset instruments across Indian and Global indices, equities, and mutual funds.
  * Real-time scenario simulation, SIP growth forecasting, inflation adjustment, and sensitivity analysis.
  * Allocation drift detection, threshold alerts, and illustrative SIP rebalancing plans.
  * Context-grounded conversational financial AI (VestIQ).
  * Exportable PDF financial health and strategy reports.
* **Out of Scope (Explicitly Excluded):**
  * Live trade execution and broker order routing.
  * Custody or handling of user funds and bank account debiting.
  * Guaranteed returns or predictive machine learning price forecasting.
  * Real-time high-frequency trading (HFT) algorithms.

---

## 9. System Architecture & Component Diagram

```
+-----------------------------------------------------------------------------------+
|                               USER CLIENT BROWSER                                 |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                           PRESENTATION LAYER (React 19)                           |
|  • Tailwind CSS v4 Responsive Layouts (Mobile 375px / Tablet 768px / Desktop 1280px)|
|  • Recharts Interactive Visualization (AreaCharts, BarCharts, Donut Allocations)  |
|  • Sentry Error Boundary & React SDK Exception Monitoring                         |
+-----------------------------------------------------------------------------------+
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                        CENTRAL APPLICATION STATE (Zustand)                        |
|  • Auth State (Firebase / Offline Dev Mock)  • Active Currency (INR ₹ / USD $)    |
|  • Authoritative User Profile & Cash Flow    • Active Goals & Categorized Expenses|
|  • Cached Market Quotes & Fallback Flags     • Active Tab & View Routing          |
+-----------------------------------------------------------------------------------+
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
+-----------------------+     +-----------------------+     +-----------------------+
|   FINANCIAL ENGINES   |     |     VESTIQ AI LAYER   |     |  OBSERVABILITY SUITE  |
| • Strategy Engine     |     | • Context Grounding   |     | • Structured Logger   |
| • Scenario Simulator  |     | • State Injector      |     | • Audit Logger (Events)|
| • Rebalancing Engine  |     | • Deterministic Fallbk|     | • Sentry Error Buffer |
+-----------------------+     +-----------------------+     +-----------------------+
        │                                                           │
        ▼                                                           ▼
+-----------------------------------------------------------------------------------+
|                           DATA & SERVICE ACCESS LAYER                             |
|  • Market API Client (`marketApi.ts`) with Batch Fallback & Cooldown Handlers     |
|  • User Profile Repository (`userProfileRepository.ts`) with LocalStorage / Cloud |
+-----------------------------------------------------------------------------------+
                                          │
                       (Asynchronous REST over HTTP)
                                          │
                                          ▼
+-----------------------------------------------------------------------------------+
|                        FASTAPI BACKEND GATEWAY (Python)                           |
|  • CORS Middleware & Pydantic Validation Models                                   |
|  • Provider Router with Health Checking, Cooldown Backoff & Memory Cache          |
+-----------------------------------------------------------------------------------+
                                          │
        ┌──────────────────┬──────────────┴─────┬──────────────────┐
        ▼                  ▼                    ▼                  ▼
+---------------+  +---------------+  +-------------------+  +---------------+
| TrueData Feed |  | Yahoo Finance |  | AMFI / MFAPI Feed |  | SQLite / PG   |
| (Paid NSE/BSE)|  | (Delayed Glob)|  | (Daily Fund NAVs) |  | (Persist DB)  |
+---------------+  +---------------+  +-------------------+  +---------------+
```

---

## 10. Technology Stack & Verified Versions

| Layer / Component | Technology / Library | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `19.2.8` | Core UI component hierarchy and reactive rendering |
| **DOM Renderer** | React DOM | `19.2.8` | Virtual DOM reconciler and browser rendering |
| **Language** | TypeScript | `~6.0.2` | Static type safety and compile-time contract enforcement |
| **Build Tool & Server**| Vite | `8.2.2` | High-speed ESM bundling and local development server |
| **Styling Engine** | Tailwind CSS | `4.3.3` | Utility-first responsive design and modern CSS styling |
| **Vite Tailwind Plugin**| `@tailwindcss/vite` | `4.3.3` | Zero-configuration Vite compilation integration |
| **State Management** | Zustand | `5.0.15` | Centralized, reactive application state store |
| **Data Visualization** | Recharts | `3.10.1` | Declarative SVG charting (Area, Bar, Donut, Sparklines) |
| **UI Icons** | Lucide React | `1.34.0` | Modern, lightweight SVG iconography |
| **Animation Engine** | Framer Motion | `13.1.1` | Fluid layout transitions and drawer animations |
| **HTTP Client** | Axios | `1.19.0` | Asynchronous REST communication with backend API |
| **Error Monitoring** | Sentry React SDK | `10.73.0` | Production exception tracking, PII scrubbing, and breadcrumbs |
| **Authentication** | Firebase Client SDK | `12.18.0` | Email/password, Google OAuth, and secure token lifecycle |
| **Testing Framework** | Vitest | `4.1.11` | High-speed unit and integration test runner |
| **Testing DOM** | Happy DOM | `20.13.2` | Lightweight headless DOM environment for UI unit tests |
| **Backend Framework** | FastAPI | `0.115.8` | Asynchronous Python REST API framework |
| **ASGI Server** | Uvicorn | `0.34.0` | High-performance asynchronous server implementation |
| **Data Validation** | Pydantic | `2.9.2` | Strong type validation and request/response schema parsing |
| **Market Data Scraper**| yfinance | `0.2.54` | Delayed global equity and index quote extraction |
| **Numerical Computing**| NumPy / Pandas | `2.2.3` | Financial data manipulation and time series processing |
| **Database ORM** | SQLAlchemy | `2.0.38` | Relational database abstraction and persistence |

---

## 11. Module Decomposition & Source Code Mapping

| Module Name | Purpose & Business Logic | Primary Technologies | Key Source Files |
| :--- | :--- | :--- | :--- |
| **Authentication & Profile** | User signup, login, session persistence, and financial profiling | Firebase Auth, Zustand, LocalStorage | `src/components/auth/LoginModal.tsx`<br>`src/services/firebase.ts`<br>`src/services/userProfileRepository.ts` |
| **Financial Strategy Engine** | Computes surplus, runway, risk mandates, and target allocations | TypeScript, Math Algorithms | `src/services/strategyEngine.ts`<br>`src/types/index.ts` |
| **Market Data Gateway** | 5-tier multi-provider routing, live/delayed badges, and fallbacks | Axios, FastAPI, yfinance, TrueData | `src/services/marketApi.ts`<br>`backend/app/services/market_data/router.py` |
| **Scenario Simulator** | 4-scenario compounding, step-up SIP, inflation discounting | Recharts, Math Compounding Algorithms | `src/components/recommendations/ScenarioSimulatorView.tsx`<br>`src/services/scenarioEngine.ts` |
| **Portfolio Rebalancing** | Drift calculation, tolerance gating, contribution SIP rebalancing | TypeScript, Recharts | `src/components/recommendations/PortfolioRebalanceView.tsx`<br>`src/services/rebalancingEngine.ts` |
| **VestIQ AI Advisor** | In-context grounded conversational advisory with anti-hallucination | LLM Prompt Grounding, Deterministic Fallback | `src/components/vestiq/AIAssistantDrawer.tsx`<br>`src/services/vestiqGrounding.ts` |
| **Expense & Goal Tracker** | Cash flow tracking, milestone progress, and priority stacking | Zustand, Lucide React | `src/components/expenses/ExpenseTrackerView.tsx`<br>`src/components/goals/GoalPlanningView.tsx` |
| **Observability & Audit** | Error boundaries, PII scrubbing, structured logging, audit trails | Sentry SDK, Custom Audit Logger | `src/services/sentry.ts`<br>`src/services/logger.ts`<br>`src/services/auditLogger.ts` |

---

## 12. Financial Strategy Engine & Mathematical Algorithms

SmartVest enforces a clear distinction between **Deterministic Calculations**, **Mathematical Projections**, and **Market Observations**.

### A. Core Mathematical Formulas (Deterministic Calculations)
1. **Monthly Budget Surplus ($S$):**
   $$S = I - \sum_{i=1}^{n} E_i$$
   *Where $I$ is monthly post-tax income, and $E_i$ represents individual monthly expense items.*
2. **Savings Rate ($R_{save}$):**
   $$R_{save} = \left( \frac{S}{I} \right) \times 100$$
3. **Emergency Fund Target ($EF_{target}$) & Liquid Runway ($Runway$):**
   $$EF_{target} = 6 \times \sum E_i$$
   $$Runway = \frac{\text{Current Liquid Savings}}{\sum E_i} \quad (\text{Target: } \ge 6 \text{ months})$$

### B. Strategic Asset Allocation Matrix
Asset allocation is determined deterministically by combining psychometric risk tolerance scores with investment horizons:

| Risk Category | Equity Allocation | Debt / Fixed Income | Sovereign Gold | Liquid Cash Buffer | Expected CAGR (Nominal) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Conservative** | 20% | 60% | 10% | 10% | 7.5% |
| **Moderately Conservative** | 35% | 50% | 10% | 5% | 8.8% |
| **Balanced** | 50% | 35% | 10% | 5% | 10.5% |
| **Growth** | 65% | 25% | 7% | 3% | 12.0% |
| **Aggressive** | 80% | 12% | 5% | 3% | 13.5% |

### C. Future Value Projection with Step-Up SIP (Mathematical Projections)
For long-term goal accumulation with an annual SIP step-up rate $s$, monthly contribution $P_0$, expected annual return $r$, compounding monthly ($i = r/12$), over $Y$ years ($N = 12Y$ months):

$$\text{Future Value } (FV) = \sum_{y=1}^{Y} \left[ P_0 (1+s)^{y-1} \times \frac{(1+i)^{12(Y-y+1)} - (1+i)^{12(Y-y)}}{i} \right]$$

### D. Inflation-Adjusted Real Value
To compute the true purchasing power of future wealth under annual inflation rate $\pi$:

$$\text{Real Purchasing Power } (PV_{real}) = \frac{FV}{(1 + \pi)^Y}$$

---

## 13. Market Data Architecture & Resilience Pipeline

SmartVest implements a zero-crash, 5-tier fallback architecture ensuring continuous usability during upstream outages:

```
[ Market API Request (`getQuote` / `getCandles`) ]
                      │
                      ▼
[ Tier 1: TrueData Paid Commercial Provider ]
  • Requires server-side credentials
  • Status: `LIVE` | Latency: <200ms
  • Direct NSE/BSE real-time WebSocket/REST feeds
                      │ (If unavailable or not configured)
                      ▼
[ Tier 2: Yahoo Finance Delayed Gateway ]
  • Status: `DELAYED` (15-min exchange delay)
  • Scrapes global indices, ETFs, US and Indian equities
                      │ (If endpoint times out / 5xx error)
                      ▼
[ Tier 3: Official AMFI / MFAPI Feed ]
  • Status: `FALLBACK` | Tagged `LATEST NAV`
  • Fetches published end-of-day mutual fund values
                      │ (If network completely offline)
                      ▼
[ Tier 4: Deterministic Baseline Models ]
  • Status: `FALLBACK` | Tagged `ESTIMATED BASELINE`
  • Generates mathematically consistent OHLCV candles
                      │ (If symbol unknown)
                      ▼
[ Tier 5: Graceful Unavailable State ]
  • Status: `UNAVAILABLE` | Explicit badge
  • Zero unhandled exceptions; UI renders gracefully
```

---

## 14. VestIQ: Grounded Conversational AI Engine

VestIQ is an in-context grounded AI advisor engineered to eliminate financial hallucinations:
1. **Context Grounding Layer:** Before any query is processed, the platform serializes the user's authoritative financial state (Income: ₹85,000, Expenses: ₹42,000, Surplus: ₹43,000, Runway: 4.2 months, Risk: Growth, Top Goals) into system prompt constraints.
2. **Anti-Hallucination Guardrails:** VestIQ is strictly instructed:
   * Never fabricate stock prices or guarantee returns.
   * Explicitly state data freshness status (LIVE vs DELAYED vs FALLBACK).
   * Refuse requests to execute trades or handle fund transfers.
   * Provide structured, educational recommendations citing verified formulas.
3. **Deterministic Offline Fallback:** If the external AI service is unreachable, VestIQ falls back to a deterministic rule-based response synthesizer that answers surplus, runway, and allocation questions accurately from local memory.

### Sample Grounded Interaction
* **User:** *"Can I afford to invest ₹30,000 every month in small-cap stocks?"*
* **VestIQ Response:** *"Based on your monthly surplus of ₹43,000 and current emergency runway of 4.2 months, committing ₹30,000 is within your cash surplus. However, your risk profile is **Growth** (mandating 65% Equity, 25% Debt, 7% Gold, 3% Cash). Allocating the entire ₹30,000 exclusively to high-volatility small-caps would create severe asset drift. We recommend allocating ₹19,500 to diversified equities (Large/Flexi-cap), ₹7,500 to Debt funds to reinforce your runway to 6.0 months, and ₹2,100 to Gold."*

---

## 15. Scenario Simulator & Sensitivity Analysis

The Scenario Simulator enables interactive what-if analysis across four distinct modeling environments:
* **Conservative Scenario:** Assumes lower-bound historical equity returns (7%–8% CAGR) with higher inflation (7.0%).
* **Base Case Scenario:** Applies long-term historical asset class averages (10%–12% CAGR) with baseline inflation (5.5%).
* **Optimistic Scenario:** Models favorable economic cycles (14%–16% CAGR) with moderate inflation (4.5%).
* **Custom Interactive Scenario:** Provides real-time sliders for:
  1. Initial Monthly SIP (₹1,000 to ₹5,00,000)
  2. Expected Annual Return (1% to 30%)
  3. Investment Time Horizon (1 to 40 Years)
  4. Annual SIP Step-Up (0% to 25%)
  5. Inflation Rate (0% to 15%)

---

## 16. Portfolio Rebalancing Advisory

SmartVest monitors portfolio drift without requiring or executing transactions:
* **Drift Formula:**
  $$\text{Drift}_k = \text{Current Allocation}_k - \text{Target Allocation}_k$$
* **Tolerance Thresholds:** Configurable at 1%, 2.5%, 5%, and 10%. An asset is classified as:
  * **OVERWEIGHT:** $\text{Drift}_k > +\text{Threshold}$
  * **UNDERWEIGHT:** $\text{Drift}_k < -\text{Threshold}$
  * **ON TARGET:** $|\text{Drift}_k| \le \text{Threshold}$
* **Tax-Efficient Contribution-Based Rebalancing:** Rather than selling overweight assets (which incurs short-term or long-term capital gains tax and exit loads), SmartVest calculates how to skew upcoming monthly SIP installments toward underweight assets to naturally bring the portfolio back into balance over 3–6 months.

---

## 17. Security Architecture & Privacy Safeguards

1. **Authentication:** Firebase Authentication with secure JSON Web Token (JWT) lifecycle and offline mock fallback for local environments.
2. **Backend Secret Isolation:** Commercial API keys (TrueData, TwelveData, Sentry DSN) are confined strictly to server-side `.env` configurations and are never bundled into client JavaScript.
3. **PII Sanitization:** All telemetry, error logs, and Sentry events strip user passwords, personal names, and bank details before transmission.
4. **Structured & Compliance Audit Logging:** Every strategic calculation, profile edit, goal creation, and market failover triggers a non-blocking compliance audit event recorded via `auditLogger.ts`.
5. **Non-Custodial Guarantee:** The architecture does not contain payment gateway integrations, bank API write tokens, or trade execution endpoints.

---

## 18. Reliability & Error Boundary Implementation

* **React Error Boundaries:** Component-level error boundaries isolate rendering errors, ensuring a failure in a single chart does not crash the dashboard.
* **Network Timeout & Retry Policies:** Market API calls enforce a 5-second strict timeout with exponential backoff before triggering fallback tiers.
* **Zero-Crash UI Invariants:** All numeric calculations validate against `NaN` and `Infinity` states, substituting safe defaults ($0.0$).

---

## 19. Testing & Quality Assurance Verification

The platform underwent comprehensive automated testing using **Vitest** and **Happy DOM**:

* **Testing Framework:** Vitest `4.1.11`
* **Headless DOM:** Happy DOM `20.13.2`
* **Total Test Suites:** 10 passed (10 files)
* **Total Unit/Integration Tests:** 75 passed (75 tests)
* **Test Execution Duration:** 26.22s
* **Failure Count:** 0 failures (100% pass rate)

### Test Suite Breakdown:
1. `strategyEngine.test.ts` (3 tests) — Surplus, runway, risk-mandated asset allocations.
2. `scenarioEngine.test.ts` (10 tests) — Compounding math, step-up SIPs, inflation discounting, edge cases.
3. `rebalancingEngine.test.ts` (8 tests) — Drift calculations, threshold gating, contribution SIP rebalancing.
4. `vestiqGrounding.test.ts` (10 tests) — Context prompt injection, anti-hallucination guardrails, fallback synthesis.
5. `marketApi.test.ts` (10 tests) — 5-tier failover hierarchy, batch resilience, offline handling.
6. `paidMarketData.test.ts` (8 tests) — TrueData integration, credentials isolation, live quote badges.
7. `auditLogger.test.ts` (7 tests) — Audit event dispatch, circular reference protection, non-blocking execution.
8. `logger.test.ts` (7 tests) — Log level filtering, metadata formatting, production suppression.
9. `demoMode.test.ts` (7 tests) — Demo profile hydration, state isolation, quick-start workflows.
10. `responsive.test.ts` (5 tests) — Breakpoint compatibility (375px mobile, 768px tablet, 1280px desktop).

---

## 20. CI/CD & Deployment Architecture

### Continuous Integration Pipeline (`.github/workflows/ci.yml`)
1. **Trigger:** Automated execution on every `push` and `pull_request` to the `main` branch.
2. **Environment:** Ubuntu Latest with Node.js LTS v20 and npm cache.
3. **Pipeline Stages:**
   * Step 1: `actions/checkout@v4`
   * Step 2: `actions/setup-node@v4` (Node 20)
   * Step 3: `npm ci` (Deterministic dependency installation)
   * Step 4: `npm test` (Full automated Vitest suite — 75 tests)
   * Step 5: `npm run build` (`tsc -b && vite build` — Zero TypeScript or bundling errors)

### Production Deployment
* **Hosting Platform:** Vercel Global Edge Network
* **Production Status:** Active & Deployed
* **Production URL:** `https://smartvest-advisory.vercel.app` (or active custom Vercel domain)

---

## 21. Experimental Results & Verification Summary

| Evaluation Dimension | Verification Metric / Result | Academic Significance |
| :--- | :--- | :--- |
| **Strategy Computation** | Execution latency < 5ms | Instantaneous client-side reactivity without server round-trip |
| **Market Data Uptime** | 100% UI stability during simulated 503/timeout outages | Proves the robustness of the 5-tier failover routing pipeline |
| **AI Context Accuracy** | Zero numerical hallucinations across test prompts | Validates strict in-context state injection methodology |
| **Responsive Usability** | 100% functional across 375px, 768px, and 1280px screens | Ensures accessibility for diverse retail mobile and desktop users |
| **Code Quality & Build** | 75/75 tests passing; clean TypeScript compilation | Meets rigorous production engineering and submission standards |

---

## 22. System Limitations
1. **Non-Custodial / No Trade Execution:** SmartVest does not route orders to exchanges or brokers; users must manually execute recommended allocations on their chosen platform.
2. **Commercial Feed Licensing:** Real-time Indian exchange data requires a paid subscription to commercial vendors (e.g., TrueData); otherwise, data defaults to 15-minute delayed snapshots.
3. **Deterministic Projection Models:** Projections assume constant or step-up growth rates and do not incorporate stochastic Monte Carlo probability distributions.
4. **Offline Historical Data Limitations:** Fallback baseline models generate mathematically plausible historical curves rather than tick-level archival records when completely offline.

---

## 23. Future Scope & Roadmap
1. **Broker API Read-Only Integrations:** Support read-only portfolio syncing via Zerodha Kite Connect and Upstox APIs for automated drift tracking.
2. **Stochastic Monte Carlo Simulations:** Implement multi-factor Monte Carlo probability engines (10,000 iterations) to display confidence cones (10th, 50th, 90th percentiles).
3. **Automated Tax-Loss Harvesting:** Integrate Indian Capital Gains tax harvesting recommendations (Section 112A LTCG exemptions up to ₹1.25 Lakh).
4. **Automated Rebalancing Push Notifications:** Dispatch SMS and WhatsApp alerts when asset drift breaches user-defined thresholds.

---

## 24. Conclusion
SmartVest demonstrates the successful design, implementation, and empirical verification of an intelligent, non-custodial investment strategic advisor. By integrating deterministic financial algorithms, a fault-tolerant multi-provider market data pipeline, and an anti-hallucination conversational AI layer, the platform addresses the primary pitfalls faced by retail investors. SmartVest bridges the critical gap between raw market access and disciplined, long-term wealth compounding, providing an open, resilient, and mathematically sound decision-support framework for modern personal finance.

---

## 25. Academic & Technical References
1. Markowitz, H. (1952). *Portfolio Selection*. The Journal of Finance, 7(1), 77–91.
2. Sharpe, W. F. (1964). *Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk*. The Journal of Finance, 19(3), 425–442.
3. Bogle, J. C. (2007). *The Little Book of Common Sense Investing*. John Wiley & Sons.
4. FastAPI Documentation. *FastAPI Framework, High Performance, Easy to Learn, Fast to Code*. https://fastapi.tiangolo.com/
5. React 19 Documentation. *React: The library for web and native user interfaces*. https://react.dev/
6. Vitest Documentation. *Next Generation Testing Framework*. https://vitest.dev/
