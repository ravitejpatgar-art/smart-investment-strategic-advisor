# SmartVest — P5.0 Master Presentation Practice & Viva Simulation Guide
**Academic Major Project Defense & Comprehensive Technical Viva Reference**

---

# PART 1 — MASTER PRESENTATION SCRIPT (10–12 MINUTES)

### 1. Introduction (0:00 – 0:30)
* **WHAT TO SHOW:** Slide 1 (Title Slide: SmartVest Logo, Project Title, Student Names, Academic Year 2025–2026).
* **WHAT TO SAY:**
  > *"Good morning, respected members of the evaluation committee. Today, I am presenting **SmartVest: An Intelligent Multi-Asset Strategic Wealth Advisory and Portfolio Decision-Support System**.*
  > 
  > *SmartVest is designed to solve a fundamental problem in retail personal finance: helping individuals build resilient, goal-oriented wealth through mathematical asset allocation, dynamic compounding simulation, and context-grounded AI guidance—completely non-custodial and without broker commission bias."*

### 2. Problem Statement (0:30 – 1:15)
* **WHAT TO SHOW:** Slide 2 (Problem Statement: Cash Flow Disconnect, Emotional Trading, Data Fragility, AI Hallucinations).
* **WHAT TO SAY:**
  > *"Over 90% of retail market participants experience significant portfolio drawdowns due to four systemic pitfalls:*
  > 1. *First, **Neglected Financial Prerequisites**: Investors commit savings to volatile equities without establishing an essential 6-month liquid emergency runway.*
  > 2. *Second, **Asset Allocation Drift**: Portfolios become dangerously overconcentrated in high-beta stocks due to recency bias.*
  > 3. *Third, **Market Data Fragility**: Retail tools fail or crash during market volatility when upstream APIs time out.*
  > 4. *And fourth, **AI Hallucinations**: General-purpose LLMs frequently fabricate stock prices, project unrealistic returns, and give non-compliant advice."*

### 3. Proposed Solution (1:15 – 1:45)
* **WHAT TO SHOW:** Slide 3 (Proposed Solution: 5-Pillar Architecture).
* **WHAT TO SAY:**
  > *"SmartVest addresses these problems through five engineering pillars:*
  > * A **Deterministic Strategy Engine** that computes surplus, runway, and risk-mandated allocations in under 5 milliseconds.
  > * A **Fault-Tolerant 5-Tier Market Pipeline** ensuring 100% UI stability with explicit data freshness badges.
  > * **VestIQ AI**, a conversational advisor strictly grounded in active user telemetry with zero-hallucination guardrails.
  > * An **Interactive Scenario Simulator** modeling SIP compounding with annual step-up and inflation adjustments.
  > * And a **Tax-Efficient Rebalancing Advisor** that corrects allocation drift via future monthly SIP contributions."*

### 4. Unique Selling Proposition (USP) (1:45 – 2:15)
* **WHAT TO SHOW:** Slide 5 (USP Comparison Matrix).
* **WHAT TO SAY:**
  > *"Our core USP is that SmartVest is a **pure, unbiased decision-support platform**. Unlike commercial discount brokers, we do not earn transaction commissions, do not sell proprietary funds, and never take custody of user funds. We prioritize liquid emergency runway gating before any equity investment is recommended."*

### 5. System Architecture (2:15 – 3:00)
* **WHAT TO SHOW:** Slide 6 (Architecture Block Diagram).
* **WHAT TO SAY:**
  > *"SmartVest follows a modern decoupled client-server architecture:*
  > * On the frontend, we use **React 19 with TypeScript 6**, styled with the **Tailwind CSS v4** engine.
  > * State is managed through a central **Zustand** store, giving us instant reactivity without boilerplate.
  > * Financial math, compounding curves, and rebalancing matrices are computed on the client side in sub-5ms.
  > * Our backend is an asynchronous **Python FastAPI** gateway running on Uvicorn, which routes market data across commercial and public providers with memory caching and health checks.
  > * Observability is powered by the **Sentry React SDK**, a structured logger, and a compliance audit logger."*

### 6. Technology Stack (3:00 – 3:30)
* **WHAT TO SHOW:** Slide 7 (Tech Stack Table).
* **WHAT TO SAY:**
  > *"Every version in our stack is production-verified:*
  > * Frontend: React 19.2.8, TypeScript ~6.0.2, Tailwind CSS 4.3.3, Zustand 5.0.15, Recharts 3.10.1, and Vite 8.2.2.
  > * Backend: FastAPI 0.115.8, Uvicorn 0.34.0, Pydantic 2.9.2, NumPy/Pandas 2.2.3, and SQLAlchemy 2.0.38.
  > * Quality: Vitest 4.1.11, Happy DOM 20.13.2, Firebase Client SDK 12.18.0, and Sentry React 10.73.0."*

### 7. Financial Strategy Engine (3:30 – 4:15)
* **WHAT TO SHOW:** Slide 8 (Mathematical Formulas & Asset Allocation Donut).
* **WHAT TO SAY:**
  > *"The Financial Strategy Engine operates deterministically:*
  > * It calculates Monthly Surplus as Post-Tax Income minus Total Expenses.
  > * It evaluates Emergency Runway as Liquid Savings divided by Monthly Expenses. If the runway is under 6 months, it flags an emergency deficit.
  > * It maps the user's psychometric risk tolerance to institutional asset allocation mandates—from Conservative (20% Equity, 60% Debt) to Growth (65% Equity, 25% Debt) and Aggressive (80% Equity, 12% Debt)."*

### 8. Market Data Architecture (4:15 – 5:00)
* **WHAT TO SHOW:** Slide 9 (5-Tier Fallback Hierarchy Waterfall).
* **WHAT TO SAY:**
  > *"To eliminate UI crashes during upstream outages, we engineered a 5-tier data hierarchy:*
  > * **Tier 1 (LIVE):** TrueData Paid Indian Commercial Feed ($<200\text{ms}$ latency for real-time NSE/BSE quotes).
  > * **Tier 2 (DELAYED):** Yahoo Finance gateway for 15-minute delayed global indices, ETFs, and equities.
  > * **Tier 3 (FALLBACK):** Official AMFI / MFAPI feed for daily mutual fund NAVs, tagged `LATEST NAV`.
  > * **Tier 4 (FALLBACK):** Deterministic baseline models with mathematically valid OHLCV candles.
  > * **Tier 5 (UNAVAILABLE):** Explicit fallback badges without throwing uncaught exceptions.
  > * Batch quote requests automatically split if individual symbols time out, guaranteeing chart continuity."*

### 9. VestIQ Grounded AI (5:00 – 5:45)
* **WHAT TO SHOW:** Slide 10 (VestIQ Context Grounding Schema & Chat Drawer).
* **WHAT TO SAY:**
  > *"VestIQ is our in-context grounded conversational AI:*
  > * Every user prompt is dynamically injected with the user's authoritative financial state—exact income, surplus, runway, risk score, and goals.
  > * It adheres to strict anti-hallucination guardrails: it refuses to invent prices, never guarantees returns, discloses data provenance, and refuses trade execution.
  > * If external AI services are unreachable, a deterministic offline rule synthesizer answers financial questions directly from state."*

### 10. Scenario Simulator (5:45 – 6:30)
* **WHAT TO SHOW:** Slide 11 (Compounding Curves & Sliders).
* **WHAT TO SAY:**
  > *"Our Scenario Simulator compares Conservative, Base, Optimistic, and Custom trajectories.
  > * Users can adjust Monthly SIP, Expected CAGR, Horizon, Annual Step-Up percentage, and Inflation rate.
  > * By incorporating annual step-up compounding alongside inflation discounting, users see both their nominal future wealth and their true real purchasing power."*

### 11. Portfolio Rebalancing Advisory (6:30 – 7:15)
* **WHAT TO SHOW:** Slide 12 (Drift Matrix & SIP Rebalance Plan).
* **WHAT TO SAY:**
  > *"The Rebalancing Engine detects asset allocation drift against target weights across user-selected tolerance bands from 1% to 10%.
  > * Crucially, rather than selling overweight assets—which triggers capital gains tax and exit loads—SmartVest calculates a **contribution-based rebalance plan**, skewing upcoming monthly SIPs toward underweight assets.
  > * It is strictly an advisory tool; no automated transactions are executed."*

### 12. Security & Observability (7:15 – 8:00)
* **WHAT TO SHOW:** Slide 13 (Security Architecture & Audit Logger).
* **WHAT TO SAY:**
  > *"Security is built in by design:*
  > * Commercial vendor API keys are restricted to backend environment variables; zero secrets exist in frontend JavaScript bundles.
  > * All telemetry and Sentry error logs sanitize PII—names, emails, passwords, and account figures.
  > * A non-blocking Audit Logger records all critical financial events (`AUTH_*`, `PROFILE_*`, `MARKET_*`, `REBALANCE_*`).
  > * Component-level React Error Boundaries prevent isolated chart errors from crashing the page."*

### 13. Testing & Quality Assurance (8:00 – 8:45)
* **WHAT TO SHOW:** Slide 14 (Vitest Terminal Output & CI Workflow).
* **WHAT TO SAY:**
  > *"Our test suite is comprehensive and fully automated:*
  > * Built on **Vitest 4.1.11** and **Happy DOM 20.13.2**, we run **10 test suites comprising 75 automated unit and integration tests**.
  > * All 75 tests pass with a **100% success rate** in approximately 26 seconds.
  > * Suites cover financial strategy math, scenario compounding, rebalancing drift, VestIQ grounding, market API failovers, audit logging, and responsive breakpoints."*

### 14. Deployment & CI/CD Pipeline (8:45 – 9:15)
* **WHAT TO SHOW:** Slide 14 (GitHub Actions to Vercel Pipeline).
* **WHAT TO SAY:**
  > *"Our CI/CD pipeline triggers on every push to `main` via GitHub Actions:*
  > * It executes `actions/checkout@v4`, Node 20 setup, `npm ci`, `npm test`, and `npm run build` (`tsc -b && vite build`).
  > * Production deployment is hosted on the **Vercel Global Edge Network**, ensuring instant global availability with SSL encryption."*

### 15. Limitations (9:15 – 9:45)
* **WHAT TO SHOW:** Slide 16 (Limitations & Future Scope).
* **WHAT TO SAY:**
  > *"We acknowledge our current system boundaries:*
  > * 1. SmartVest is non-custodial and does not execute live broker trades.
  > * 2. Real-time tick data requires an optional commercial feed subscription; otherwise, data defaults to 15-minute delayed snapshots.
  > * 3. Projections use deterministic compounding formulas rather than stochastic probability distributions."*

### 16. Future Scope (9:45 – 10:15)
* **WHAT TO SHOW:** Slide 16 (Future Engineering Roadmap).
* **WHAT TO SAY:**
  > *"In future iterations, we plan to implement:*
  > * Read-only broker syncing via Zerodha Kite Connect and Upstox APIs.
  > * 10,000-iteration stochastic Monte Carlo confidence intervals.
  > * Automated Section 112A tax-loss harvesting recommendations.
  > * Automated WhatsApp and SMS rebalancing threshold alerts."*

### 17. Conclusion & Defense (10:15 – 10:45)
* **WHAT TO SHOW:** Slide 16 (Thank You Slide with GitHub URL).
* **WHAT TO SAY:**
  > *"In conclusion, SmartVest successfully demonstrates a mathematically sound, fault-tolerant, non-custodial strategic wealth advisory platform. It delivers institutional-grade planning tools directly to retail investors.
  > 
  > Thank you. I am now ready to take your questions."*

---

# PART 2 — 30-SECOND INTRO

> *"SmartVest is an intelligent, non-custodial wealth advisory and portfolio decision-support system. It evaluates personal cash flow, emergency runway, and risk tolerance to deterministically calculate target asset allocations across Equities, Debt, and Gold. It features a 5-tier fault-tolerant market data pipeline, an interactive compounding scenario simulator, tax-efficient SIP rebalancing, and VestIQ—an in-context grounded financial AI that operates strictly without hallucinations."*

---

# PART 3 — 1-MINUTE INTRO

> *"Good morning. SmartVest is an intelligent investment strategic advisor and portfolio decision-support platform designed to solve the primary challenges retail investors face: emotional investing, lack of asset diversification, and inadequate emergency reserves.*
> 
> *Built using React 19, TypeScript, and a Python FastAPI gateway, SmartVest calculates budget surplus, emergency runway, and risk-mandated asset allocations deterministically in under 5 milliseconds. It integrates a 5-tier resilient market data pipeline monitoring 57+ instruments with zero UI crashes during outages. Furthermore, SmartVest features an interactive compounding scenario simulator with annual SIP step-up and inflation adjustments, a tax-efficient contribution-based rebalancing advisor, and VestIQ—a conversational AI grounded in the user's verified financial state.*
> 
> *The platform is completely non-custodial, verified by 75 automated unit tests with a 100% pass rate, and deployed to production on Vercel."*

---

# PART 4 — "EXPLAIN YOUR PROJECT" (MAX 60 SECONDS)

> *"SmartVest is an independent, non-custodial investment decision-support system. It takes a user's monthly income, expenses, liquid savings, and risk answers, and instantly generates a mathematical financial blueprint.*
> 
> *The system verifies whether the user has a mandatory 6-month emergency runway before recommending growth allocations. It then recommends a diversified asset allocation across Large-Cap, Mid-Cap, US Equities, Short-Term Debt, and Sovereign Gold. Users can simulate wealth accumulation across 4 compounding scenarios with annual SIP step-ups, track portfolio drift, and ask financial questions to VestIQ—an AI assistant strictly grounded in their real financial numbers.*
> 
> *It does not take custody of funds or execute trades, ensuring zero broker bias and complete transparency."*

---

# PART 5 — "WHY DID YOU CHOOSE THIS PROJECT?" (30 SECONDS)

> *"I chose SmartVest because while retail access to trading apps has exploded, over 90% of individual investors lose money due to a lack of structured financial planning, emotional overconcentration, and absence of emergency buffers.*
> 
> *Most existing tools are either transactional brokerages incentivized by trading volume or generic chatbots that hallucinate financial advice. I wanted to build an institutional-grade, mathematically sound decision-support system that gives retail investors unbiased, personalized wealth strategies without taking custody of their capital."*

---

# PART 6 — CORE USP (20–30 SECONDS)

> *"SmartVest's core USP is its **independent, non-custodial strategic advisory framework**. Unlike discount brokers, we do not earn transaction commissions, do not hold user funds, and enforce a mandatory 6-month emergency buffer check before recommending aggressive equity allocations.*
> 
> *Every calculation is deterministic, market feeds use a transparent 5-tier failover hierarchy, and our AI advisor operates under strict anti-hallucination context grounding."*

---

# PART 7 — LIVE DEMO REHEARSAL (11-STEP SEQUENCE)

| Step | Screen | Action | Expected Result | What I Should Say | Technical Point |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | Landing Page | Click 'Explore Demo' or 'Sign In' | Landing hero with value props; navigates to Dashboard/Auth | *"We begin on the SmartVest landing page, introducing our non-custodial advisory philosophy."* | Framer Motion animations; responsive hero layout. |
| **2** | Login / Onboarding | Enter credentials or use Guest Demo bypass | Authenticates user via Firebase or hydrates demo profile | *"The user can authenticate securely with Firebase or initialize an isolated Demo session."* | Firebase SDK 12.18.0 with offline mock fallback. |
| **3** | Overview Dashboard | View KPI strip, runway gauge, and asset charts | Displays ₹85k income, ₹43k surplus, 4.2-mo runway alert | *"The dashboard instantly computes a ₹43,000 surplus and flags a 4.2-month runway deficit."* | Sub-5ms client-side calculation; Recharts rendering. |
| **4** | Market Terminal | Filter by 'Indian Equities' and click 'RELIANCE.NS' | Displays 57+ asset quotes, status badges, and sparklines | *"Our terminal monitors 57+ assets with explicit LIVE, DELAYED, and FALLBACK provenance badges."* | 5-tier failover routing; memory cache in FastAPI. |
| **5** | Strategic Blueprint | Navigate to Recommendations $\rightarrow$ Blueprint | Shows 65% Equity / 25% Debt / 7% Gold / 3% Cash | *"Based on the user's Growth risk score, the engine prescribes an institutional asset allocation."* | Deterministic risk mapping matrix; zero broker bias. |
| **6** | Scenario Simulator | Move SIP slider to ₹20k, Step-Up to 10%, Horizon to 15 yrs | Recharts AreaChart displays ₹1.32 Cr corpus with inflation PV | *"Here we simulate wealth compounding with realistic 10% annual salary step-ups and inflation."* | Step-up compounding formula; purchasing power math. |
| **7** | Portfolio Rebalance | Select 5% tolerance band; review drift matrix | Shows Large-Cap +8% Overweight; Debt -6% Underweight | *"The engine identifies drift and generates an illustrative SIP contribution rebalance plan."* | Tax-efficient cash flow skewing; no asset sales. |
| **8** | Goal Planning | View Retirement & Home Down Payment cards | Progress bars, target dates, and monthly SIP requirements | *"Goals are stacked by priority and linked directly to dedicated asset classes."* | Priority stacking logic; deterministic SIP requirements. |
| **9** | Expense Tracker | Add a ₹5,000 utility expense | Surplus updates to ₹38,000; runway updates to 3.8 mos | *"Any expense change immediately re-evaluates surplus and liquid runway in real-time."* | Reactive Zustand state mutations with local persistence. |
| **10** | Financial Profile | Toggle risk questionnaire answer | Recomputes strategy from Growth to Balanced | *"Adjusting risk tolerance dynamically re-allocates the asset blueprint across all views."* | Dynamic strategy recalculation; atomic store update. |
| **11** | VestIQ Assistant | Ask: *"Can I invest ₹30k in small caps?"* | VestIQ cites ₹43k surplus and 4.2-mo runway, advises balanced allocation | *"VestIQ references the user's real financial state and refuses ungrounded recommendations."* | In-context state grounding; anti-hallucination rules. |

---

# PART 8 — DEMO TALK TRACK (SCREEN-BY-SCREEN)

* **Dashboard:** *"Here is the primary financial dashboard. Notice how it immediately presents the core cash flow numbers: monthly income, total expenses, net surplus, and our proprietary emergency runway indicator."*
* **Market Terminal:** *"The Market Terminal provides real-time and delayed quotes across 57+ multi-asset instruments. Every asset displays its data provenance—whether LIVE from TrueData, DELAYED from exchange feeds, or FALLBACK from AMFI mutual fund NAVs."*
* **Strategic Blueprint:** *"Under Recommendations, the Blueprint converts psychometric risk profiling into an actionable target asset allocation across Large-Cap, Mid-Cap, US Equities, Short-Term Debt, and Sovereign Gold."*
* **Scenario Simulator:** *"The Scenario Simulator allows users to model long-term compounding. Unlike standard calculators, it supports annual SIP step-up percentages and inflation discounting to show true purchasing power."*
* **Rebalancing:** *"Our Rebalancing module tracks portfolio drift against customizable tolerance thresholds (1% to 10%) and formulates a tax-efficient contribution rebalancing plan."*
* **VestIQ Drawer:** *"VestIQ provides conversational guidance. Because it is grounded directly in the user's active financial state, it delivers accurate, contextual advice without hallucinating numbers."*

---

# PART 9 — ARCHITECTURE EXPLANATION (60–90 SECONDS)

> *"SmartVest is structured as a modern, decoupled client-server system:*
> 
> *The **Frontend** is a Single Page Application built with **React 19** and **TypeScript 6**, styled using **Tailwind CSS v4**. We use **Zustand** as our central state store. Client-side financial engines calculate budget surplus, emergency runway, compounding curves, and rebalancing matrices in under 5 milliseconds.*
> 
> *The **Backend** is an asynchronous **Python FastAPI** gateway running on Uvicorn. It acts as a market data router and resiliency gateway. It interfaces with our 5-tier provider pipeline—including an optional paid Indian commercial provider (TrueData), delayed exchange feeds (Yahoo Finance), official mutual fund feeds (AMFI/MFAPI), and local baseline models. The backend manages provider health checks, cooldown backoffs, and memory caching.*
> 
> *For services, we integrate **Firebase Authentication** with a local mock developer bypass, **VestIQ** in-context grounded AI, **Sentry** exception monitoring with PII sanitization, and a custom non-blocking compliance **Audit Logger**.*
> 
> *This decoupled design ensures that if the backend or third-party APIs experience downtime, the frontend continues to operate gracefully using cached and fallback data with zero UI crashes."*

---

# PART 10 — FINANCIAL ENGINE ALGORITHMS & FORMULAS

### 1. Monthly Budget Surplus & Savings Rate
* **Meaning:** The investable net cash flow remaining after all monthly living expenses are deducted.
* **SmartVest Use:** Dictates the maximum recommended monthly SIP allocation.
* **Formula:**
  $$\text{Surplus } (S) = \text{Monthly Post-Tax Income} - \sum_{i=1}^{n} \text{Expense}_i$$
  $$\text{Savings Rate } (R_{save}) = \left( \frac{S}{\text{Income}} \right) \times 100$$

### 2. Emergency Runway
* **Meaning:** The number of months a user can maintain their current standard of living using liquid savings if all income stops.
* **SmartVest Use:** Strict prerequisite gating. If runway is $<6.0$ months, the engine alerts the user and prioritizes liquid debt allocations.
* **Formula:**
  $$\text{Runway (Months)} = \frac{\text{Current Liquid Savings}}{\sum_{i=1}^{n} \text{Expense}_i}$$

### 3. Risk Mandate & Strategic Asset Allocation
* **Meaning:** The deterministic proportion of wealth distributed across Equities, Debt, Gold, and Cash based on risk capacity and tolerance.
* **SmartVest Use:** Generates the target portfolio baseline.
* **Allocations:**
  * **Conservative:** 20% Equity, 60% Debt, 10% Gold, 10% Cash (7.5% nominal CAGR)
  * **Moderately Conservative:** 35% Equity, 50% Debt, 10% Gold, 5% Cash (8.8% nominal CAGR)
  * **Balanced:** 50% Equity, 35% Debt, 10% Gold, 5% Cash (10.5% nominal CAGR)
  * **Growth:** 65% Equity, 25% Debt, 7% Gold, 3% Cash (12.0% nominal CAGR)
  * **Aggressive:** 80% Equity, 12% Debt, 5% Gold, 3% Cash (13.5% nominal CAGR)

### 4. Compounding with Annual Step-Up SIP
* **Meaning:** Future value modeling that accounts for annual salary increments and expanding monthly contributions.
* **SmartVest Use:** Powers the Scenario Simulator.
* **Formula:**
  $$FV = \sum_{y=1}^{Y} \left[ P_0 (1+s)^{y-1} \times \frac{(1+i)^{12(Y-y+1)} - (1+i)^{12(Y-y)}}{i} \right]$$
  *Where $P_0$ is initial monthly SIP, $s$ is annual step-up rate, $i = r/12$ is monthly interest rate, and $Y$ is years.*

### 5. Inflation Discounting (Real Purchasing Power)
* **Meaning:** Converting future nominal rupees into present-day purchasing power.
* **SmartVest Use:** Prevents unrealistic retirement projections.
* **Formula:**
  $$PV_{real} = \frac{FV}{(1 + \pi)^Y} \quad (\pi = \text{Annual Inflation Rate})$$

### 6. Portfolio Drift & Rebalancing
* **Meaning:** The variance between current portfolio weights and target strategic model weights.
* **SmartVest Use:** Flags overweight/underweight asset classes and formulates contribution rebalance plans.
* **Formula:**
  $$\text{Drift}_k = \text{Current Percentage}_k - \text{Target Percentage}_k$$

> [!IMPORTANT]
> **Crucial Distinction:** Calculations (Surplus, Runway, Drift) are exact mathematical facts based on current user inputs. Projections (Future Value, Real Corpus) are mathematical simulations based on historical asset class averages, **not guaranteed returns**.

---

# PART 11 — MARKET DATA ARCHITECTURE & FAILOVER

### Data Freshness Badges
1. **`LIVE` (Tier 1):** Real-time tick data from TrueData commercial feed ($<200\text{ms}$ latency, authorized NSE/BSE).
2. **`DELAYED` (Tier 2):** 15-minute delayed snapshot from exchange gateways (Yahoo Finance).
3. **`FALLBACK` (Tier 3 & 4):** Official AMFI mutual fund daily NAVs (tagged `LATEST NAV`) or deterministic baseline models (tagged `ESTIMATED BASELINE`).
4. **`DEMO`:** Isolated synthetic quotes used during demo sessions.
5. **`UNAVAILABLE` (Tier 5):** Graceful badge indicator when a symbol cannot be resolved, preventing UI crashes.

### Provider Priority & Failover Pipeline
```
[ Request Quote / Candles ]
             │
             ▼
[ Tier 1: TrueData Paid Indian Feed ] ──(If unavailable / no key)──►
             ▼
[ Tier 2: Yahoo Finance Delayed Gateway ] ──(If 5xx / timeout)──►
             ▼
[ Tier 3: AMFI / MFAPI Official Daily NAVs ] ──(If network down)──►
             ▼
[ Tier 4: Deterministic Baseline Models ] ──(If symbol unknown)──►
             ▼
[ Tier 5: Explicit UNAVAILABLE Badge (Zero Crashes) ]
```

### Batch Resilience & Timeout Handling
* Standard timeout is 5.0 seconds.
* If a batch quote request for 10 symbols has 2 slow symbols, `marketApi.ts` splits the batch, returns the 8 successful quotes, and substitutes baseline estimates for the 2 failing symbols.

---

# PART 12 — VESTIQ GROUNDED AI EXPLANATION

### Grounding Mechanism
Before sending any prompt to the AI, `vestiqGrounding.ts` extracts the user's active financial state from Zustand:
```json
{
  "monthlyIncome": 85000,
  "totalExpenses": 42000,
  "monthlySurplus": 43000,
  "emergencyRunwayMonths": 4.2,
  "emergencyFundTarget": 252000,
  "riskCategory": "Growth",
  "activeGoals": ["Retirement (15y)", "Emergency Buffer"]
}
```
This payload is injected into the system prompt constraints.

### Anti-Hallucination Guardrails
1. **Fact Enforcement:** The AI must only reference numerical values present in the injected state.
2. **Price Guard:** The AI cannot fabricate real-time stock prices or guarantee returns.
3. **Provenance Disclosure:** The AI must cite whether referenced market data is LIVE, DELAYED, or FALLBACK.
4. **Non-Custodial Enforcement:** The AI explicitly refuses commands to execute trades or move money.

### Concrete Example
* **User Query:** *"How much can I invest each month?"*
* **VestIQ Response:**
  > *"Based on your post-tax monthly income of ₹85,000 and living expenses of ₹42,000, your calculated investable surplus is **₹43,000/month** (a 50.6% savings rate).*
  > 
  > *However, your current emergency runway is **4.2 months** (₹1,75,000 saved vs ₹2,52,000 target). We recommend allocating ₹10,000 of your surplus toward liquid debt funds to complete your 6-month buffer, and directing the remaining ₹33,000 toward your Growth asset blueprint (65% Equity, 25% Debt, 7% Gold, 3% Cash)."*

---

# PART 13 — SCENARIO SIMULATOR & SENSITIVITY ANALYSIS

### 4 Standard Scenarios
1. **Conservative:** 7.5% CAGR, 7.0% inflation (Defensive asset allocation).
2. **Base Case:** 11.0% CAGR, 5.5% inflation (Historical long-term diversified portfolio average).
3. **Optimistic:** 15.0% CAGR, 4.5% inflation (Favorable economic and market expansion).
4. **Custom Interactive:** Full slider control over SIP, Return %, Horizon, Step-Up %, and Inflation %.

### Why Deterministic Scenarios Are Useful
Deterministic multi-scenario analysis allows retail investors to understand sensitivity—for example, observing that a 10% annual step-up SIP yields nearly double the wealth of a flat SIP over 15 years, while inflation discounting provides an honest assessment of future purchasing power.

---

# PART 14 — PORTFOLIO REBALANCING ADVISORY

### Drift & Tolerance Thresholds
* **Formula:** $\text{Drift}_k = \text{Current Allocation}_k - \text{Target Allocation}_k$
* **Configurable Bands:** 1.0%, 2.5%, 5.0%, and 10.0%.
* **Classifications:**
  * `OVERWEIGHT`: $\text{Drift} > +\text{Threshold}$
  * `UNDERWEIGHT`: $\text{Drift} < -\text{Threshold}$
  * `ON TARGET`: $|\text{Drift}| \le \text{Threshold}$

### Tax-Efficient Contribution Rebalancing
* **Conventional Rebalancing:** Sells overweight equity to buy debt, triggering Short-Term Capital Gains (STCG @ 20%), Long-Term Capital Gains (LTCG @ 12.5% above ₹1.25 Lakhs), and mutual fund exit loads.
* **SmartVest Contribution Approach:** Calculates how to skew upcoming monthly SIP cash flows (e.g., directing 80% of new monthly surplus to underweight Debt/Gold) to restore equilibrium over 3–6 months **without selling a single asset or incurring tax liabilities**.

> [!NOTE]
> **Strict Disclaimer:** SmartVest displays an illustrative rebalance blueprint. It does not connect to broker APIs or execute market orders.

---

# PART 15 — SECURITY ARCHITECTURE & PRIVACY

1. **Backend Secret Isolation:** Commercial API keys (TrueData, Sentry DSN) are stored exclusively in backend `.env` variables and never bundled into client JavaScript.
2. **PII Sanitization:** Telemetry, console logging, and Sentry error reports automatically sanitize email addresses, user names, passwords, and bank details.
3. **Firebase Authentication:** Standard JSON Web Token (JWT) lifecycle with automatic session validation and local mock fallback for offline development.
4. **Compliance Audit Logging:** All critical financial operations (`AUTH_*`, `PROFILE_*`, `MARKET_*`, `REBALANCE_*`) dispatch non-blocking structured audit events via `auditLogger.ts`.
5. **Non-Custodial Architecture:** SmartVest contains zero bank write tokens, payment gateway integrations, or trade execution endpoints.

---

# PART 16 — TESTING & QUALITY ASSURANCE

* **Testing Framework:** Vitest `4.1.11` + Happy DOM `20.13.2`
* **Test Metrics:** **10 Test Suites, 75 Automated Tests, 100% Pass Rate (0 Failures)**
* **Execution Time:** ~26.22 seconds
* **Suite Breakdown:**
  1. `strategyEngine.test.ts` (3 tests): Surplus, runway, and risk allocation math.
  2. `scenarioEngine.test.ts` (10 tests): Compounding, step-up SIPs, and inflation math.
  3. `rebalancingEngine.test.ts` (8 tests): Drift detection and contribution rebalancing.
  4. `vestiqGrounding.test.ts` (10 tests): Context prompt injection and anti-hallucination guardrails.
  5. `marketApi.test.ts` (10 tests): 5-tier failovers, offline handling, and batch resilience.
  6. `paidMarketData.test.ts` (8 tests): Commercial provider credentials and live quote badges.
  7. `auditLogger.test.ts` (7 tests): Event dispatch and circular object crash protection.
  8. `logger.test.ts` (7 tests): Structured log formatting and level filtering.
  9. `demoMode.test.ts` (7 tests): Demo profile hydration and isolation.
  10. `responsive.test.ts` (5 tests): Breakpoint compatibility (375px, 768px, 1280px).

---

# PART 17 — DEPLOYMENT & CI/CD PIPELINE

```
[ Git Push to Main ]
        │
        ▼
[ GitHub Actions Workflow (`.github/workflows/ci.yml`) ]
  ├── 1. `actions/checkout@v4`
  ├── 2. `actions/setup-node@v4` (Node.js LTS v20)
  ├── 3. `npm ci` (Deterministic package install)
  ├── 4. `npm test` (Full Vitest automated suite — 75 tests)
  └── 5. `npm run build` (`tsc -b && vite build` — Zero type/bundle errors)
        │
        ▼ (On Successful Build)
[ Vercel Global Edge Network Deployment ]
  └── Production URL: `https://smartvest-advisory.vercel.app`
```

---

# PART 18 — SYSTEM LIMITATIONS

1. **Non-Custodial / No Live Trade Execution:** Users must manually execute recommended portfolio allocations on their chosen brokerage platform.
2. **Commercial Market Data Licensing:** Real-time Indian exchange data requires a paid subscription to a provider like TrueData; otherwise, data defaults to 15-minute delayed feeds.
3. **Deterministic Growth Models:** Scenario projections assume constant or step-up annual growth rates rather than stochastic market volatility.
4. **Historical Fallback Resolution:** In complete offline mode, baseline curves provide mathematically plausible trajectories rather than tick-level archival records.

---

# PART 19 — FUTURE SCOPE & ROADMAP

1. **Read-Only Broker API Integrations:** Syncing live holdings via Zerodha Kite Connect, Upstox, and Groww for automated drift tracking.
2. **Stochastic Monte Carlo Simulation:** 10,000-run Monte Carlo probability cones displaying 10th, 50th, and 90th percentile wealth distribution bands.
3. **Automated Tax-Loss Harvesting:** Algorithms analyzing unrealized losses to offset realized capital gains under Indian Section 112A (LTCG up to ₹1.25 Lakhs tax-free).
4. **Automated Drift Alerts:** Push notifications via WhatsApp and SMS when portfolio drift breaches user thresholds.

---

# PART 20 — 50 VIVA QUESTIONS WITH KEYWORDS

*(See `VIVA_FINAL_50.md` for full answers; key highlights below)*

1. **Q:** What is SmartVest? | **A:** Non-custodial investment advisory & decision-support system. | **KEYWORD:** Decision-Support
2. **Q:** What is the tech stack? | **A:** React 19, TypeScript, Zustand, Tailwind v4, Python FastAPI. | **KEYWORD:** Decoupled Architecture
3. **Q:** How is state managed? | **A:** Zustand central store (`useFintechStore.ts`). | **KEYWORD:** Zustand Store
4. **Q:** How do you calculate budget surplus? | **A:** Income minus Total Expenses. | **KEYWORD:** Investable Cash Flow
5. **Q:** What is the emergency runway formula? | **A:** Liquid Savings divided by Monthly Expenses. | **KEYWORD:** 6-Month Gating
6. **Q:** What are the 5 risk categories? | **A:** Conservative, Mod-Conservative, Balanced, Growth, Aggressive. | **KEYWORD:** Risk Mandate
7. **Q:** What is the 5-tier market data pipeline? | **A:** TrueData $\rightarrow$ Yahoo $\rightarrow$ AMFI NAVs $\rightarrow$ Baseline Model $\rightarrow$ Unavailable. | **KEYWORD:** 5-Tier Failover
8. **Q:** How does VestIQ prevent hallucinations? | **A:** In-context state grounding injecting active user telemetry. | **KEYWORD:** In-Context Grounding
9. **Q:** How does contribution rebalancing work? | **A:** Skews new monthly SIPs toward underweight assets. | **KEYWORD:** Tax-Efficient SIP
10. **Q:** What test framework is used? | **A:** Vitest 4.1.11 with Happy DOM (75 tests passing). | **KEYWORD:** Vitest / 75 Tests

*(40 additional questions fully detailed in `docs/submission/VIVA_FINAL_50.md`)*

---

# PART 21 — RAPID-FIRE ROUND (25 QUESTIONS)

1. **What is React 19?** A component-based JavaScript library for building responsive user interfaces.
2. **What is TypeScript?** A statically typed superset of JavaScript that catches errors at compile time.
3. **What is FastAPI?** A high-performance, asynchronous Python web framework for building REST APIs.
4. **What is Zustand?** A lightweight, unopinionated state management library for React.
5. **What is CAGR?** Compound Annual Growth Rate—the annualized geometric return rate of an investment.
6. **What is Asset Allocation?** Distributing investments across asset classes (Equity, Debt, Gold) to manage risk.
7. **What is Emergency Runway?** The number of months liquid savings can cover living expenses without income.
8. **What is Portfolio Drift?** The divergence between current asset weights and target model weights.
9. **What is Step-Up SIP?** Increasing monthly investment contributions annually by a fixed percentage.
10. **What is Inflation Adjustment?** Discounting future nominal returns to reflect true present purchasing power.
11. **What is Fallback Data?** Secondary or synthetic data used when the primary API provider is unreachable.
12. **What is Demo Mode?** An isolated session populated with realistic financial data for demonstration.
13. **What is PII Sanitization?** Stripping personal identifiable information (names, emails) before logging.
14. **What is Sentry?** An application monitoring platform that captures unhandled runtime exceptions.
15. **What is an Audit Logger?** A compliance logging service that records critical financial events non-blockingly.
16. **What is CI/CD?** Continuous Integration and Continuous Deployment—automating testing and deployment pipelines.
17. **What is Vercel?** A cloud platform for static and serverless edge web deployment.
18. **What is Happy DOM?** A lightweight, high-speed headless DOM implementation for running unit tests.
19. **What is Non-Custodial?** Operating without holding, managing, or transferring user capital.
20. **What is Context Grounding?** Injecting authoritative local state into an AI prompt to prevent hallucinations.
21. **What is TrueData?** A commercial Indian market data provider delivering real-time NSE/BSE feeds.
22. **What is AMFI?** Association of Mutual Funds in India—the official publisher of daily mutual fund NAVs.
23. **What is a Tolerance Threshold?** The allowable drift percentage (e.g., 5%) before an asset is flagged for rebalance.
24. **What is an Error Boundary?** A React component that catches JavaScript errors in child component trees.
25. **What is Vite?** A next-generation frontend build tool offering high-speed bundling and HMR.

---

# PART 22 — DIFFICULT EXAMINER ROUND (25 DEEP TECHNICAL QUESTIONS)

#### 1. Why perform financial calculations on the client side instead of the backend?
* **Direct Answer:** Sub-5ms reactivity and zero-latency slider interaction.
* **Technical Explanation:** Client-side execution in TypeScript eliminates HTTP round-trip latency when users drag simulator sliders, while offloading computation from the backend gateway.
* **Strong Sentence:** *"Client-side math guarantees instantaneous UI feedback and offline calculation continuity."*

#### 2. How do you prevent floating-point rounding errors in compounding calculations?
* **Direct Answer:** Safe rounding utilities and validation against `NaN`/`Infinity`.
* **Technical Explanation:** Calculations clamp division by zero (e.g., zero expenses for runway) and round currency figures to two decimal places at the presentation boundary.
* **Strong Sentence:** *"All financial formulas enforce input guards and sanitize outputs before state updates."*

#### 3. How does the system handle concurrent market API requests without hitting rate limits?
* **Direct Answer:** Server-side in-memory caching and exponential backoff cooldowns.
* **Technical Explanation:** FastAPI's `ProviderRouter` caches real-time quotes with a 30-second TTL and mutual fund NAVs with a 1-hour TTL, suppressing redundant upstream calls.
* **Strong Sentence:** *"Our gateway throttles upstream traffic via TTL memory caching and provider health backoffs."*

#### 4. What happens if a user inputs zero expenses?
* **Direct Answer:** The engine safely caps runway calculation to prevent division-by-zero.
* **Technical Explanation:** If expenses are zero, the runway calculation returns a clamped maximum flag (e.g., 99.0 months) with an advisory note rather than throwing `Infinity`.
* **Strong Sentence:** *"Division by zero is guarded deterministically at the service level."*

#### 5. How do you ensure VestIQ doesn't leak one user's financial data to another?
* **Direct Answer:** Stateless per-request context injection with zero cross-session memory.
* **Technical Explanation:** VestIQ does not maintain shared server memory. Each prompt is constructed dynamically from the active user's local Zustand state and discarded immediately after generation.
* **Strong Sentence:** *"User context is ephemeral and strictly isolated to the authenticated client session."*

*(20 additional advanced questions detailed in presentation materials)*

---

# PART 23 — TRICK QUESTIONS PLAYBOOK

1. **"Does your AI predict future stock prices?"**
   * *Answer:* *"No. VestIQ is strictly a strategic advisory assistant, not a price prediction engine. It explains asset allocation principles and evaluates cash flow grounded in the user's verified financial state."*
2. **"Are the projected returns in the simulator guaranteed?"**
   * *Answer:* *"No. Projections represent mathematical simulations based on historical asset class CAGRs for educational and planning purposes. They are clearly labeled as non-guaranteed estimates."*
3. **"Is SmartVest a SEBI-registered broker?"**
   * *Answer:* *"No. SmartVest is a non-custodial decision-support software platform. It does not execute trades, hold client funds, or charge brokerage commissions."*
4. **"Why don't you use Monte Carlo simulations currently?"**
   * *Answer:* *"In the current version, deterministic multi-scenario modeling provides clear, understandable baseline sensitivity analysis for retail users. Stochastic Monte Carlo modeling is part of our future roadmap."*
5. **"What happens if the market API fails completely during a live presentation?"**
   * *Answer:* *"The platform seamlessly activates its Tier 4/5 fallback pipeline, displaying deterministic baseline quotes and explicit fallback badges without throwing a single error or crashing charts."*

---

# PART 24 — PROFESSIONAL FALLBACK PHRASES

* Instead of *"I don't know"*, say:
  * *"In the current implementation, our architecture handles this by..."*
  * *"Based on our verified system design, that specific behavior is managed through..."*
  * *"That feature is intentionally scoped for our future roadmap, whereas our current version focuses on..."*
  * *"From a financial engineering perspective, our current model assumes..."*

---

# PART 25 — DEMO FAILURE PLAYBOOK

1. **Market API Unreachable:** The UI displays `FALLBACK` / `DELAYED` badges automatically; charts render from baseline data without disruption.
2. **AI Backend Times Out:** VestIQ automatically activates its deterministic offline rule synthesizer, answering state questions locally.
3. **Network Disconnected:** The local application operates using cached Zustand state and LocalStorage persistence.
4. **Firebase Configuration Missing:** The app automatically boots in Mock Dev Mode, allowing full walkthrough without authentication blocks.

---

# PART 26 — ONE-PAGE FINAL REVISION SHEET

* **Project:** SmartVest (Non-Custodial Multi-Asset Investment Strategic Advisor)
* **Problem:** Lack of emergency fund gating, emotional asset drift, API fragility, AI hallucinations.
* **Solution:** Deterministic strategy engine, 5-tier market resilience, grounded AI, scenario simulator, SIP rebalancing.
* **Tech Stack:** React 19.2.8, TypeScript ~6.0.2, Zustand 5.0.15, Tailwind CSS 4.3.3, FastAPI 0.115.8, Vitest 4.1.11.
* **Math Formulas:**
  * Surplus: $S = I - \sum E$
  * Runway: $\text{Savings} / \sum E \ge 6.0\text{ mos}$
  * Step-Up FV: $FV = \sum P_0(1+s)^{y-1} \times \frac{(1+i)^{12(Y-y+1)}-(1+i)^{12(Y-y)}}{i}$
  * Real PV: $PV = FV / (1+\pi)^Y$
* **Market Pipeline:** TrueData (Tier 1) $\rightarrow$ Yahoo (Tier 2) $\rightarrow$ AMFI NAVs (Tier 3) $\rightarrow$ Baseline (Tier 4) $\rightarrow$ Unavailable (Tier 5).
* **Testing:** 10 Test Suites, 75 Tests Passed (100%), 0 Failures.
* **Deployment:** GitHub Actions CI $\rightarrow$ Vercel Global Edge Network.

---

# PART 27 — MOCK VIVA SIMULATION (20 PROGRESSIVE QUESTIONS)

### Question 1
* **EXAMINER:** *"What is the main objective of SmartVest?"*
* **MY ANSWER:** `[Practice answering in 30 seconds]`
* **EXPECTED KEY POINTS:** Non-custodial strategic decision-support; cash flow analysis; emergency runway gating; risk-mandated asset allocation; resilient market data; grounded AI.

### Question 2
* **EXAMINER:** *"Why is Zustand used instead of Redux?"*
* **MY ANSWER:** `[Practice answering in 30 seconds]`
* **EXPECTED KEY POINTS:** Minimal boilerplate (~1KB); atomic state selectors; prevents re-renders during high-frequency quote updates; clean developer experience.

### Question 3
* **EXAMINER:** *"Explain the Emergency Runway concept."*
* **MY ANSWER:** `[Practice answering in 30 seconds]`
* **EXPECTED KEY POINTS:** Liquid savings divided by monthly expenses; minimum 6-month buffer required; prerequisite gating before aggressive equity investing.

*(Questions 4–20 span 5-tier failover, VestIQ prompt injection, contribution rebalancing, Vitest testing, and CI/CD)*

---

# PART 28 — PRESENTATION BODY LANGUAGE & DELIVERY TIPS

1. **Eye Contact:** Alternate between the evaluation committee members and the presentation screen (70% audience, 30% screen).
2. **Pacing:** Speak deliberately at approximately 130–140 words per minute. Pause for 2 seconds after key financial formulas and architecture slides.
3. **Slide Transitions:** Never read slides verbatim. Use bullet points as anchors and explain the *engineering rationale* behind each design choice.
4. **Demonstrating Charts:** Point directly to the axes (e.g., *"On the X-axis we have time horizon in years, and on the Y-axis we show compounded wealth in Crores"*).

---

# PART 29 — FINAL 60-SECOND CLOSING STATEMENT

> *"Respected members of the committee, SmartVest demonstrates that modern FinTech can provide individual retail investors with institutional-grade financial strategies without taking custody of their capital or charging transaction fees.*
> 
> *By combining deterministic mathematical modeling, a fault-tolerant 5-tier market pipeline, and context-grounded AI guidance, SmartVest provides an accessible, robust, and mathematically sound foundation for personal wealth creation.*
> 
> *All features are fully implemented, verified across 75 automated tests, and deployed to production. Thank you for your time and guidance."*
