# SmartVest — Final Evaluation Presentation Deck
**Slide Count:** Exactly 16 Slides | **Theme:** Modern Academic FinTech & Engineering

---

## Slide 1: Title Slide
* **TITLE:** SmartVest: Intelligent Investment & Wealth Advisory Decision-Support Platform
* **SLIDE CONTENT:**
  * **Project Type:** Final Year Major Project / Capstone Submission
  * **Domain:** Financial Technology, Wealth Engineering, Decision Support Systems, Applied AI
  * **Architecture:** Decoupled Client-Server (React 19 + TypeScript + Zustand + Python FastAPI)
  * **Key Capabilities:** Deterministic Asset Allocation, 5-Tier Market Resilience, Anti-Hallucination AI, Compounding Simulators, Tax-Efficient Contribution Rebalancing
* **VISUAL RECOMMENDATION:** Clean dark-mode banner with SmartVest logo, shield icon (representing security/advisory), and clean typography.
* **SPEAKER NOTES:** Introduce the project title, evaluation scope, and high-level objective of delivering unbiased, institutional-grade wealth advisory tools to retail investors without demanding fund custody.

---

## Slide 2: Problem Statement
* **TITLE:** The Retail Investing Dilemma & Industry Pitfalls
* **SLIDE CONTENT:**
  * **1. Cash Flow Disconnection:** Committing capital to volatile equities without establishing a 6-month liquid emergency runway.
  * **2. Asset Allocation Drift:** Overconcentration in high-beta assets driven by recency bias and social media hype.
  * **3. Market Data Fragility:** Critical application crashes or corrupt data rendering during third-party provider downtime.
  * **4. AI Hallucination Risks:** Generic LLMs fabricating stock quotes, hallucinating returns, and providing risky, non-compliant advice.
* **VISUAL RECOMMENDATION:** A 4-quadrant breakdown displaying each pain point with warning icons and statistical citations (e.g., 90%+ retail trader drawdown rates).
* **SPEAKER NOTES:** Emphasize that retail access to trading has outpaced financial education, leading to avoidable wealth destruction.

---

## Slide 3: Proposed Solution
* **TITLE:** The SmartVest Strategic Advisory Framework
* **SLIDE CONTENT:**
  * **Deterministic Financial Strategy Engine:** Instant client-side computation of surplus, savings rate, runway, and risk-mandated asset allocations.
  * **5-Tier Resilient Market Pipeline:** High-availability routing across Live Commercial Feeds, Delayed Exchanges, AMFI NAVs, and Baseline Fallbacks.
  * **VestIQ Context-Grounded AI:** Grounded conversational advisory strictly bound to the user's verified financial state.
  * **Interactive Scenario Compounding:** Multi-horizon wealth projections featuring annual SIP step-up and inflation adjustments.
  * **Contribution-Based Rebalancing:** Correcting portfolio drift via smart SIP allocation without triggering premature capital gains tax.
* **VISUAL RECOMMENDATION:** A high-level 5-pillar horizontal workflow showing the end-to-end user journey from cash flow input to actionable allocation blueprints.
* **SPEAKER NOTES:** Highlight that SmartVest operates strictly as an independent advisory layer, maintaining zero conflict of interest.

---

## Slide 4: Project Objectives
* **TITLE:** Measurable Engineering Objectives
* **SLIDE CONTENT:**
  * **Sub-5ms Execution Latency:** Real-time client-side calculation of surplus, runway, and risk-mandated allocations.
  * **100% Market Data Uptime:** Zero-crash UI stability during upstream API disconnects via 5-tier failover hierarchy.
  * **Anti-Hallucination AI Guardrails:** Enforcing strict context injection so AI cannot invent user numbers or prices.
  * **Multi-Scenario Sensitivity Modeling:** 4-scenario compounding engine with dynamic step-up SIP and inflation indexing.
  * **Non-Custodial Architecture:** Zero handling of user funds, zero trade execution, and absolute secret isolation.
  * **Comprehensive Automated Verification:** 100% test pass rate across 10 test suites and 75 automated unit/integration tests.
* **VISUAL RECOMMENDATION:** Checkmark badge list with metric targets next to each objective.
* **SPEAKER NOTES:** Walk through each objective, emphasizing that every single goal is measurable, testable, and verified in the final build.

---

## Slide 5: Unique Selling Proposition (USP)
* **TITLE:** Competitive Advantage & System Differentiation
* **SLIDE CONTENT:**
  * **1. True Advisory Independence:** No transactional brokerage commissions, no sponsored fund bias, no custody of capital.
  * **2. Mandatory Prerequisite Gating:** Enforces emergency fund adequacy before recommending high-equity allocations.
  * **3. Explicit Market Data Provenance:** Clear labeling of data freshness (`LIVE`, `DELAYED`, `FALLBACK`, `UNAVAILABLE`).
  * **4. Tax-Aware Rebalancing:** Focuses on forward-looking SIP cash flow skewing over destructive asset liquidations.
  * **5. Privacy-First Architecture:** Complete client-side secret isolation and PII sanitization across all logs.
* **VISUAL RECOMMENDATION:** Side-by-side comparison matrix contrasting SmartVest with Discount Brokers, Personal Finance Trackers, and Generic Chatbots.
* **SPEAKER NOTES:** Explain why SmartVest is structurally different from transactional platforms whose business models depend on high trading churn.

---

## Slide 6: System Architecture
* **TITLE:** Decoupled Layered System Architecture
* **SLIDE CONTENT:**
  * **Presentation Layer:** React 19, TypeScript 6, Tailwind CSS v4, Lucide React, Framer Motion.
  * **Central State Store:** Zustand (Authoritative User Profile, Cached Quotes, Active Strategy).
  * **Execution Engines:** Strategy Engine, Scenario Simulator, Rebalancing Engine, VestIQ AI Grounder.
  * **Backend Gateway:** Python FastAPI Asynchronous Gateway with Uvicorn and Pydantic validation.
  * **Multi-Provider Hierarchy:** TrueData (Tier 1) $\rightarrow$ Yahoo Finance (Tier 2) $\rightarrow$ AMFI/MFAPI (Tier 3) $\rightarrow$ Baseline Models (Tier 4).
* **VISUAL RECOMMENDATION:** Clean ASCII/Block architectural schematic illustrating client-to-backend data flow and observability hooks (Sentry, AuditLogger).
* **SPEAKER NOTES:** Detail how the decoupled architecture isolates failure domains, ensuring frontend continuity regardless of backend provider status.

---

## Slide 7: Technology Stack
* **TITLE:** Production Technology Stack & Versions
* **SLIDE CONTENT:**
  * **Frontend Framework:** React `19.2.8` & React DOM `19.2.8`
  * **Language & Bundler:** TypeScript `~6.0.2` & Vite `8.2.2`
  * **Styling Engine:** Tailwind CSS `4.3.3` & `@tailwindcss/vite`
  * **State & Visualization:** Zustand `5.0.15` & Recharts `3.10.1`
  * **Backend API & Server:** Python FastAPI `0.115.8` & Uvicorn `0.34.0`
  * **Validation & Data:** Pydantic `2.9.2`, NumPy `2.2.3`, Pandas `2.2.3`
  * **Testing & DOM:** Vitest `4.1.11` & Happy DOM `20.13.2`
  * **Observability & Auth:** Sentry React SDK `10.73.0` & Firebase SDK `12.18.0`
* **VISUAL RECOMMENDATION:** Structured table listing Layer, Component, Verified Version, and Architectural Purpose.
* **SPEAKER NOTES:** Confirm that all listed versions represent actual production dependencies installed in the repository.

---

## Slide 8: Financial Strategy Engine
* **TITLE:** Deterministic Financial Algorithms & Risk Mandates
* **SLIDE CONTENT:**
  * **Monthly Surplus:** $S = I - \sum E_i \quad \text{and} \quad R_{save} = (S / I) \times 100$
  * **Emergency Runway:** $\text{Runway} = \text{Liquid Savings} / \sum E_i \quad (\text{Target: } \ge 6 \text{ Months})$
  * **Risk Allocation Mandates:**
    * *Conservative:* 20% Equity / 60% Debt / 10% Gold / 10% Cash (7.5% CAGR)
    * *Balanced:* 50% Equity / 35% Debt / 10% Gold / 5% Cash (10.5% CAGR)
    * *Growth:* 65% Equity / 25% Debt / 7% Gold / 3% Cash (12.0% CAGR)
    * *Aggressive:* 80% Equity / 12% Debt / 5% Gold / 3% Cash (13.5% CAGR)
  * **Prerequisite Enforcement:** Flags emergency fund deficits before unlocking aggressive growth allocations.
* **VISUAL RECOMMENDATION:** Financial formula cards accompanied by an asset allocation distribution donut chart.
* **SPEAKER NOTES:** Emphasize the mathematical distinction between deterministic calculations (surplus, runway) and long-term asset class projections.

---

## Slide 9: Market Data Reliability
* **TITLE:** 5-Tier Fault-Tolerant Market Data Hierarchy
* **SLIDE CONTENT:**
  * **Tier 1 (LIVE):** TrueData Paid Indian Commercial Feed ($<200\text{ms}$ latency, authorized NSE/BSE real-time data).
  * **Tier 2 (DELAYED):** Yahoo Finance delayed gateway (15-minute global indices, ETFs, US/Indian equities).
  * **Tier 3 (FALLBACK):** AMFI / MFAPI Official Daily Mutual Fund NAVs (`LATEST NAV` tag).
  * **Tier 4 (FALLBACK):** Built-in deterministic baseline pricing models with valid OHLCV candles.
  * **Tier 5 (UNAVAILABLE):** Explicit fallback badge state preventing unhandled errors or broken charts.
  * **Resilience Mechanisms:** 5-second request timeouts, cooldown backoffs, batch quote splitting, and server caching.
* **VISUAL RECOMMENDATION:** Vertical tiered waterfall diagram showing fallback progression from Tier 1 to Tier 5 with status badges.
* **SPEAKER NOTES:** Explain that no financial chart will ever render blank or throw uncaught exceptions due to an API timeout.

---

## Slide 10: VestIQ Grounded AI
* **TITLE:** VestIQ: In-Context Grounded Financial AI Advisor
* **SLIDE CONTENT:**
  * **Authoritative State Injection:** Every prompt dynamically injects user income, expenses, surplus, runway, risk score, and goals into system context.
  * **Anti-Hallucination Guardrails:**
    * Strict refusal to invent stock quotes or guarantee future returns.
    * Mandated disclosure of data provenance (LIVE vs DELAYED vs FALLBACK).
    * Explicit refusal to handle trades, transfers, or personal funds.
  * **Deterministic Offline Synthesizer:** Rule-based fallback engine answering financial state questions when external AI is offline.
* **VISUAL RECOMMENDATION:** Two-column dialog showing a user query, grounded context injection schema, and the resulting hallucination-free response.
* **SPEAKER NOTES:** Point out how context grounding transforms a generic conversational LLM into a reliable, compliant domain advisor.

---

## Slide 11: Scenario Simulator
* **TITLE:** Dynamic Compounding & Sensitivity Simulator
* **SLIDE CONTENT:**
  * **4 Comparative Trajectories:** Conservative (7.5%), Base (11.0%), Optimistic (15.0%), and Custom Slider Mode.
  * **Interactive Parameters:** Initial Monthly SIP (₹1k–₹500k), Expected CAGR (1%–30%), Time Horizon (1–40 Years).
  * **Annual Step-Up SIP:** Models realistic salary increments ($0\% \text{ to } 25\% \text{ per year}$):
    $$FV = \sum_{y=1}^{Y} \left[ P_0 (1+s)^{y-1} \times \frac{(1+i)^{12(Y-y+1)} - (1+i)^{12(Y-y)}}{i} \right]$$
  * **Inflation Purchasing Power Discounting:** $PV_{real} = FV / (1 + \pi)^Y$
* **VISUAL RECOMMENDATION:** Recharts AreaChart visual displaying compounding wealth curves over time with interactive slider controls.
* **SPEAKER NOTES:** Demonstrate how annual step-up compounding drastically increases long-term corpus accumulation compared to flat SIPs.

---

## Slide 12: Portfolio Rebalancing Advisory
* **TITLE:** Asset Allocation Drift & Contribution Rebalancing
* **SLIDE CONTENT:**
  * **Drift Monitoring Formula:** $\text{Drift}_k = \text{Current Allocation}_k - \text{Target Allocation}_k$
  * **Tolerance Thresholds:** Configurable bands ($1\%, 2.5\%, 5\%, 10\%$) with `OVERWEIGHT`, `UNDERWEIGHT`, and `ON TARGET` status.
  * **Tax-Efficient Contribution Rebalancing:**
    * Avoids asset liquidation, exit loads, and Capital Gains Tax (Section 112A).
    * Calculates skewed monthly SIP contributions toward underweight assets over 3–6 months.
  * **Non-Execution Boundary:** Clearly labeled as decision-support; no automatic transactions executed.
* **VISUAL RECOMMENDATION:** Drift matrix table alongside an illustrative SIP contribution rebalance plan card.
* **SPEAKER NOTES:** Emphasize that rebalancing via future contributions is significantly more tax-efficient than selling existing holdings.

---

## Slide 13: Security & Reliability
* **TITLE:** Non-Custodial Security & Enterprise Observability
* **SLIDE CONTENT:**
  * **Authentication:** Firebase Auth (JWT token lifecycle) + offline mock dev mode.
  * **Backend Secret Isolation:** Zero commercial vendor keys in frontend client bundles.
  * **PII Sanitization:** Automatic scrubbing of passwords, names, and financial data in telemetry.
  * **Structured Audit Logging:** Non-blocking dispatch of `AUTH_*`, `PROFILE_*`, `MARKET_*`, `SCENARIO_*`, and `REBALANCE_*` events.
  * **Sentry Exception Monitoring:** Real-time production error capture with component-level React Error Boundaries.
* **VISUAL RECOMMENDATION:** Security architecture diagram showing client-server boundary and logging pipelines.
* **SPEAKER NOTES:** Reiterate that SmartVest never touches user banking credentials or trade execution endpoints.

---

## Slide 14: Testing & CI/CD Pipeline
* **TITLE:** Automated Quality Assurance & Continuous Integration
* **SLIDE CONTENT:**
  * **Testing Stack:** Vitest `4.1.11` + Happy DOM `20.13.2`
  * **Test Coverage:** **10 Test Suites, 75 Automated Tests, 100% Pass Rate** (0 Failures).
  * **Verified Suites:** Strategy Engine (3), Scenario Engine (10), Rebalancing (8), VestIQ Grounding (10), Market API (10), Paid Data (8), Audit Logger (7), Structured Logger (7), Demo Mode (7), Responsive Layouts (5).
  * **GitHub Actions Pipeline:** `actions/checkout@v4` $\rightarrow$ Node 20 $\rightarrow$ `npm ci` $\rightarrow$ `npm test` $\rightarrow$ `npm run build`.
  * **Production Deployment:** Vercel Global Edge Network with zero TypeScript compilation warnings.
* **VISUAL RECOMMENDATION:** Terminal test execution summary graphic showing all 10 suites green, alongside GitHub Actions pipeline workflow.
* **SPEAKER NOTES:** Highlight that 100% of the mathematical algorithms, market failovers, and responsive breakpoints are verified via automated CI.

---

## Slide 15: Live Demonstration
* **TITLE:** Live System Walkthrough & Feature Verification
* **SLIDE CONTENT:**
  * **Step 1: Onboarding & Cash Flow:** Surplus calculation and 4.2-month emergency runway deficit alert.
  * **Step 2: Market Terminal:** 57+ multi-asset quotes, status badges, and sparkline modal charts.
  * **Step 3: Strategic Blueprint:** Risk-mandated asset allocation and curated instrument recommendations.
  * **Step 4: Scenario Simulation:** Interactive 15-year SIP modeling with 10% annual step-up and 5.5% inflation.
  * **Step 5: Rebalance & VestIQ:** Drift matrix visualization and context-grounded AI conversational defense.
* **VISUAL RECOMMENDATION:** Annotated screenshots of the Overview Dashboard, Scenario Simulator, and VestIQ Assistant Drawer.
* **SPEAKER NOTES:** Guide the evaluation committee through the live demonstration, validating each system capability in real time.

---

## Slide 16: Conclusion & Future Scope
* **TITLE:** Conclusion & Future Engineering Roadmap
* **SLIDE CONTENT:**
  * **Conclusion:** SmartVest provides a resilient, mathematically sound, non-custodial strategic wealth advisory platform bridging cash flow budgeting and institutional asset allocation.
  * **Academic & Engineering Results:** Sub-5ms calculation latency, 100% market uptime resilience, zero-hallucination AI grounding, 75/75 tests passing.
  * **Future Scope (Planned Enhancements):**
    * 1. Read-only broker API syncing via Zerodha Kite Connect & Upstox.
    * 2. 10,000-iteration stochastic Monte Carlo confidence intervals.
    * 3. Automated Indian Section 112A tax-loss harvesting recommendations.
    * 4. Multi-channel SMS/WhatsApp drift alert webhooks.
* **VISUAL RECOMMENDATION:** Concluding thank-you card with project summary metrics, GitHub repository link, and Q&A prompt.
* **SPEAKER NOTES:** Summarize key achievements and invite questions from the evaluation committee.
