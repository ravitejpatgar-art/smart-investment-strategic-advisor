# SmartVest: Executive Project Summary
**Intelligent Multi-Asset Investment Strategic Advisory & Portfolio Decision-Support Platform**

---

## 1. Project Overview
SmartVest is an intelligent, non-custodial financial technology platform designed to provide retail investors with institutional-grade wealth planning, deterministic asset allocation models, multi-scenario compounding simulation, and context-grounded AI guidance. Built with a modern decoupled client-server architecture (React 19 + TypeScript + Zustand + Python FastAPI), SmartVest bridges the critical gap between personal cash flow budgeting and long-term strategic wealth creation without demanding custody of user funds or taking transaction commissions.

---

## 2. Core Problem & Market Need
Retail investors face severe systemic obstacles in capital markets:
1. **Neglected Financial Prerequisites:** Investing in high-risk equities before accumulating an essential 6-month liquid emergency runway.
2. **Emotional Allocation Drift:** Overconcentrating in speculative single-asset stocks driven by recency bias and social media hype.
3. **Market Data Fragility:** Financial applications crashing during upstream third-party API outages.
4. **AI Hallucinations:** Generic LLMs fabricating stock quotes, hallucinating returns, and providing risky, non-compliant advice.

---

## 3. The SmartVest Solution & Core USP
SmartVest operates strictly as an independent strategic decision-support platform:
* **Deterministic Strategy Engine:** Computes monthly budget surplus, savings rate, emergency runway, and risk-mandated asset allocations mathematically in $<5\text{ms}$.
* **5-Tier Resilient Market Pipeline:** Guarantees 100% UI uptime through a seamless multi-provider failover hierarchy (`LIVE` TrueData $\rightarrow$ `DELAYED` Yahoo $\rightarrow$ `FALLBACK` AMFI NAVs $\rightarrow$ `FALLBACK` Baseline Model $\rightarrow$ `UNAVAILABLE`).
* **VestIQ Grounded AI Advisor:** Conversational financial assistant strictly bounded by the user's authoritative financial state, eliminating numerical hallucinations.
* **Tax-Efficient Contribution Rebalancing:** Calculates how to correct portfolio drift via future monthly SIP installments rather than selling holdings and triggering capital gains tax.
* **Non-Custodial Trust:** Zero handling of user funds, zero trade execution, and absolute client-side secret isolation.

---

## 4. High-Level Architecture & Technology Stack

```
[ User Browser (React 19 + TypeScript + Tailwind CSS v4) ]
                           │
                           ▼
              [ Zustand State Store ] (Profile, Goals, Quotes)
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
[ Financial Engines ]  [ VestIQ AI ]  [ Observability ]
(Strategy/Scenario/    (Grounded in   (Sentry SDK +
 Rebalancing Math)      User State)    Audit Logger)
         │
         ▼
[ Market API Client (5-Tier Resilient Routing) ]
         │
         ▼ (Asynchronous REST)
[ Python FastAPI Backend Gateway (Uvicorn + Pydantic) ]
         │
  ┌──────┴──────────┬──────────────────┐
  ▼                 ▼                  ▼
[ TrueData Feed ]  [ Yahoo Finance ]  [ AMFI / MFAPI ]
(Paid Real-Time)   (Delayed 15-Min)   (Daily Fund NAVs)
```

### Production Stack Versions
* **Frontend:** React `19.2.8`, TypeScript `~6.0.2`, Tailwind CSS `4.3.3`, Zustand `5.0.15`, Recharts `3.10.1`, Vite `8.2.2`.
* **Backend:** Python FastAPI `0.115.8`, Uvicorn `0.34.0`, Pydantic `2.9.2`, NumPy `2.2.3`, Pandas `2.2.3`, SQLAlchemy `2.0.38`.
* **Quality & Observability:** Vitest `4.1.11`, Happy DOM `20.13.2`, Sentry React SDK `10.73.0`, Firebase SDK `12.18.0`.

---

## 5. Key System Modules & Financial Algorithms

1. **Cash Flow & Emergency Runway Engine:**
   $$\text{Surplus } (S) = \text{Income} - \sum \text{Expenses} \quad \Big| \quad \text{Runway} = \frac{\text{Liquid Savings}}{\sum \text{Expenses}} \quad (\text{Mandate: } \ge 6 \text{ Months})$$
2. **Risk-Mandated Strategic Asset Allocation:**
   * *Conservative:* 20% Equity, 60% Debt, 10% Gold, 10% Cash (7.5% CAGR)
   * *Balanced:* 50% Equity, 35% Debt, 10% Gold, 5% Cash (10.5% CAGR)
   * *Growth:* 65% Equity, 25% Debt, 7% Gold, 3% Cash (12.0% CAGR)
   * *Aggressive:* 80% Equity, 12% Debt, 5% Gold, 3% Cash (13.5% CAGR)
3. **Scenario Compounding Simulator with Annual Step-Up:**
   $$FV = \sum_{y=1}^{Y} \left[ P_0 (1+s)^{y-1} \times \frac{(1+i)^{12(Y-y+1)} - (1+i)^{12(Y-y)}}{i} \right] \quad \Big| \quad PV_{real} = \frac{FV}{(1 + \pi)^Y}$$
4. **Portfolio Drift & Contribution Rebalancing:**
   $$\text{Drift}_k = \text{Current Allocation}_k - \text{Target Allocation}_k \quad (\text{Thresholds: } 1\%, 2.5\%, 5\%, 10\%)$$
   *Prescribes skewed monthly SIP installments toward underweight assets, avoiding capital gains taxation.*

---

## 6. Security, Privacy & Reliability Guardrails
* **Secret Isolation:** All commercial vendor API keys (TrueData, Sentry) are restricted to backend `.env` variables; zero credentials exist in frontend JavaScript bundles.
* **PII Sanitization:** All telemetry, error traces, and audit logs scrub user names, emails, passwords, and sensitive financial amounts before transmission.
* **Compliance Audit Logger:** Non-blocking recording of all critical financial calculations and user lifecycle events.
* **Error Boundaries:** Component-level React Error Boundaries prevent isolated UI rendering faults from crashing the application.

---

## 7. Quality Assurance, Testing & Deployment

* **Automated Test Suite:** **10 Test Files, 75 Unit & Integration Tests, 100% Pass Rate (0 Failures)**.
* **Execution Performance:** Full test suite executes in ~26.22 seconds via Vitest and Happy DOM.
* **Continuous Integration:** GitHub Actions (`.github/workflows/ci.yml`) runs on Node 20 (`npm ci` $\rightarrow$ `npm test` $\rightarrow$ `npm run build`).
* **Production Deployment:** Live on the Vercel Global Edge Network with zero TypeScript compilation errors.

---

## 8. Limitations & Future Scope
* **Current Limitations:** Non-custodial / no direct broker order execution; optional commercial feed subscription required for real-time tick feeds; deterministic projection models.
* **Future Scope:** Read-only broker API syncing (Zerodha Kite Connect, Upstox); 10,000-run stochastic Monte Carlo probability cones; automated Section 112A tax-loss harvesting; SMS/WhatsApp drift alerts.

---

## 9. Conclusion
SmartVest delivers a mathematically rigorous, fault-tolerant, and non-custodial wealth advisory platform that addresses the core systemic pitfalls faced by retail investors. By uniting cash flow budgeting, 5-tier market resilience, dynamic compounding simulation, and anti-hallucination AI guidance, SmartVest establishes a high benchmark for modern academic FinTech engineering.
