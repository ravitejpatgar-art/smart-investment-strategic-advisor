# SmartVest — Final Viva Rapid-Fire Cheat Sheet

---

### 1. Project Overview
* **Name:** SmartVest (Smart Investment Strategic Advisor)
* **Type:** Non-Custodial Multi-Asset Strategic Wealth Advisory & Portfolio Decision-Support System
* **Domain:** FinTech, Decision Support Systems, Applied AI, Wealth Engineering
* **Core Philosophy:** Unbiased, mathematical strategic planning without taking custody of funds or executing trades.

---

### 2. Core Problem Addressed
1. **Cash Flow Disconnect:** Retail investors trade high-risk assets without establishing a 6-month liquid emergency runway.
2. **Asset Allocation Drift:** Severe recency bias causing portfolio overconcentration in volatile single-asset equities.
3. **Data Fragility:** Broker and retail apps crash or display corrupt states during market API downtime.
4. **AI Hallucinations:** Generic LLMs fabricating stock prices, hallucinating returns, and giving non-compliant advice.

---

### 3. Solution & USP
* **Deterministic Strategy Engine:** Calculates surplus, savings rate, runway, and risk-mandated asset allocations in $<5\text{ms}$.
* **5-Tier Market Fallback Pipeline:** Zero-crash data hierarchy (`LIVE` $\rightarrow$ `DELAYED` $\rightarrow$ `FALLBACK` $\rightarrow$ `FALLBACK` $\rightarrow$ `UNAVAILABLE`).
* **VestIQ Grounded AI:** Context-enforced conversational assistant strictly bounded by the user's active financial state.
* **Tax-Efficient Rebalancing:** Adjusts portfolio drift via forward SIP cash flows rather than taxable asset liquidations.
* **Non-Custodial Trust:** Zero custody of funds, zero trade execution, zero commercial broker commissions.

---

### 4. Architecture & Technology Stack
* **Frontend:** React `19.2.8`, TypeScript `~6.0.2`, Tailwind CSS `4.3.3`, Zustand `5.0.15`, Recharts `3.10.1`, Vite `8.2.2`.
* **Backend:** Python FastAPI `0.115.8`, Uvicorn `0.34.0`, Pydantic `2.9.2`, NumPy/Pandas `2.2.3`, SQLAlchemy `2.0.38`.
* **Observability & Auth:** Sentry React SDK `10.73.0`, Firebase Client SDK `12.18.0`, Custom Audit Logger.
* **Testing:** Vitest `4.1.11` + Happy DOM `20.13.2`.
* **Deployment:** Vercel Global Edge Network + GitHub Actions CI.

---

### 5. Financial Algorithms & Formulas
* **Monthly Surplus:** $S = \text{Income} - \sum \text{Expenses}$
* **Savings Rate:** $R_{save} = (S / \text{Income}) \times 100$
* **Emergency Runway:** $\text{Runway} = \text{Liquid Savings} / \sum \text{Expenses} \quad (\text{Target: } \ge 6.0 \text{ months})$
* **Step-Up Compounding:** $FV = \sum_{y=1}^{Y} \left[ P_0 (1+s)^{y-1} \times \frac{(1+i)^{12(Y-y+1)} - (1+i)^{12(Y-y)}}{i} \right]$
* **Inflation Discounting:** $PV_{real} = FV / (1 + \pi)^Y$
* **Asset Allocation Matrix:**
  * *Conservative:* 20% Eq / 60% Debt / 10% Gold / 10% Cash (7.5% CAGR)
  * *Balanced:* 50% Eq / 35% Debt / 10% Gold / 5% Cash (10.5% CAGR)
  * *Growth:* 65% Eq / 25% Debt / 7% Gold / 3% Cash (12.0% CAGR)
  * *Aggressive:* 80% Eq / 12% Debt / 5% Gold / 3% Cash (13.5% CAGR)

---

### 6. 5-Tier Market Data Hierarchy
1. **Tier 1 (LIVE):** TrueData Paid Indian Feed (Authorized real-time NSE/BSE quotes, $<200\text{ms}$).
2. **Tier 2 (DELAYED):** Yahoo Finance Delayed Gateway (15-min delayed indices, global stocks, ETFs).
3. **Tier 3 (FALLBACK):** AMFI / MFAPI Official Daily Mutual Fund NAVs (`LATEST NAV`).
4. **Tier 4 (FALLBACK):** Deterministic Baseline Models (Valid mathematical OHLCV candles).
5. **Tier 5 (UNAVAILABLE):** Explicit fallback badge state without UI crashes or exceptions.

---

### 7. VestIQ Grounded AI Engine
* **Grounding Mechanism:** Serializes user income, expenses, surplus, runway, risk score, and goals into system prompt constraints.
* **Anti-Hallucination Rules:** Never invents stock prices, never guarantees returns, discloses data provenance, refuses trade execution.
* **Deterministic Fallback:** Rule-based synthesizer answers state questions when offline.

---

### 8. Scenario Simulator & Rebalancing
* **Scenarios:** Conservative (7.5%), Base (11.0%), Optimistic (15.0%), Custom.
* **Rebalancing Drift:** $\text{Drift}_k = \text{Current}_k - \text{Target}_k$ (Thresholds: 1%, 2.5%, 5%, 10%).
* **Tax Efficiency:** Rebalances by skewing future monthly SIP contributions to underweight assets rather than selling holdings.
* **Disclaimer:** Explicitly non-transactional (No automated orders placed).

---

### 9. Security & Observability
* **Secret Isolation:** Commercial API keys reside solely in backend `.env` files; zero keys in frontend bundles.
* **PII Sanitization:** Telemetry and Sentry error logs scrub email addresses, names, and passwords.
* **Audit Trail:** Non-blocking audit logger captures all critical lifecycle events (`AUTH_*`, `PROFILE_*`, `MARKET_*`, `REBALANCE_*`).
* **Error Boundaries:** React Error Boundaries prevent chart rendering faults from crashing the application.

---

### 10. Testing, CI/CD & Deployment
* **Automated Tests:** **10 Test Files, 75 Automated Tests, 100% Pass Rate (0 Failures)**.
* **Duration:** ~26.22 seconds execution time.
* **CI Pipeline:** GitHub Actions (`.github/workflows/ci.yml`) on Node 20 (`checkout` $\rightarrow$ `npm ci` $\rightarrow$ `npm test` $\rightarrow$ `npm run build`).
* **Hosting:** Vercel Global Edge Network with live production deployment.

---

### 11. Limitations & Future Scope
* **Current Limitations:** Non-custodial / no live trade execution; optional commercial feed subscription for real-time data; deterministic projection models.
* **Future Roadmap:** Read-only broker API syncing (Zerodha Kite Connect/Upstox); 10,000-run Monte Carlo probability cones; Section 112A tax-loss harvesting; SMS/WhatsApp threshold alerts.
