# SmartVest — Live Demo Runbook & Cheat Sheet

---

## 🧭 Live Demo Quick Reference (10-Step Runbook)

| Step # | Screen / Route | Action to Perform | Visual Key for Audience | Verbal Pitch (Spoken Sentence) |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Landing Page** (`/`) | Scroll hero section; adjust quick SIP slider. | Modern dark hero, real-time compounding SIP widget. | *"SmartVest is a multi-asset quantitative wealth advisory platform that eliminates AI financial hallucinations."* |
| **2** | **Auth / Onboarding** (`/onboarding`) | Show income/expense discovery inputs. | Clean step progression, emergency fund savings field. | *"The platform gathers demographic and cashflow fundamentals to evaluate true risk capacity rather than stated bias."* |
| **3** | **Overview Dashboard** (`/dashboard`) | Highlight KPI cards and Dynamic Wealth Growth chart. | Monthly Surplus tile (₹27,000), Emergency Runway (6M), Recharts AreaChart. | *"SmartVest calculates investable surplus and projects long-term wealth compounding across 5 to 25-year horizons."* |
| **4** | **Allocation Blueprint** (`/recommendations`) | Review multi-asset cards and suitability scores. | Core Equity, Global Tech, Sovereign Gold, and Debt cards with radial fit gauges. | *"Capital is allocated across four risk-calibrated buckets to maximize diversification and minimize volatility."* |
| **5** | **Scenario Simulator** (`/recommendations` $\rightarrow$ Sim) | Select `Base` preset; adjust Annual Step-Up slider to 5%. | Real-time AreaChart update and return sensitivity matrix. | *"Investors can model what-if scenarios, including annual step-up SIP compounding and inflation purchasing power discounting."* |
| **6** | **Rebalancing Advisory** (`/recommendations` $\rightarrow$ Rebal) | Select $\pm 2\%$ threshold; review Drift matrix table. | `OVERWEIGHT` / `UNDERWEIGHT` badges and New-Contribution SIP plan. | *"SmartVest identifies portfolio drift and generates a tax-efficient SIP plan to realign allocations without forced selling."* |
| **7** | **Goal Roadmaps** (`/goals`) | Click on active milestone goal (e.g. Home Down Payment). | Target progress bar, monthly SIP requirement, probability gauge. | *"Milestone goals are dynamically tracked against investable surplus to ensure target feasibility."* |
| **8** | **Cashflow Analyzer** (`/expenses`) | Review fixed vs. discretionary expense breakdown. | Categorized spending donut chart and monthly surplus meter. | *"The expense tracker evaluates lifestyle burn rate to ensure sustainable long-term investment contributions."* |
| **9** | **Market Terminal** (`/market`) | Search `NIFTY 50` or `RELIANCE.NS`; open detail modal. | Searchable 57+ asset grid with `LIVE`, `DELAYED`, and `FALLBACK` badges. | *"Every quote carries an explicit freshness badge, backed by a 5-tier failover cascade that guarantees zero UI crashes."* |
| **10** | **VestIQ AI Copilot** (`/vestiq`) | Ask: *"How much can I invest each month?"* | Chat drawer displaying grounded answer using verified user surplus. | *"VestIQ answers queries strictly using the user's computed financial ground truth, eliminating mathematical hallucinations."* |

---

## 🛡️ Contingency & Failure Playbook

```
╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                 DEMO CONTINGENCY PLAYBOOK                                         ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. INTERNET OFFLINE:                                                                              ║
║    Action: Open http://localhost:5173/dashboard?demo=true                                         ║
║    Script: "SmartVest includes a zero-dependency deterministic Demo Mode designed for offline     ║
║             resilience and evaluation."                                                           ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 2. MARKET DATA UPSTREAM TIMEOUT:                                                                  ║
║    Action: Point to the yellow "FALLBACK" badge on the Market Terminal.                           ║
║    Script: "Notice how SmartVest gracefully falls back to verified baseline models rather than     ║
║             crashing the UI or throwing unhandled errors."                                        ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 3. AI / LLM ENDPOINT DOWN:                                                                        ║
║    Action: Send standard prompt in VestIQ chat drawer.                                            ║
║    Script: "When upstream AI APIs are unavailable, VestIQ seamlessly switches to its deterministic ║
║             rule-based engine grounded in the user's verified financial state."                   ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 4. BROWSER CHART GLITCH:                                                                          ║
║    Action: Switch scenario preset or toggle horizon selector (5Y to 10Y).                         ║
║    Script: "Recharts dynamically recalculates the bounding box on window resize or preset change."║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 📄 One-Page Presentation Cheat Sheet

```
╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                               SMARTVEST — ONE-PAGE MASTER CHEAT SHEET                             ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ PROJECT:       SmartVest — Strategic Multi-Asset Wealth Advisory Platform                         ║
║ PROBLEM:       Retail investors suffer from ungrounded advice, emotional allocation & broker bias. ║
║ SOLUTION:      Deterministic mathematical strategy engine + In-context grounded AI (VestIQ).      ║
║ PRIMARY USP:   Decoupled architecture: 100% deterministic math + grounded AI (Zero hallucinations).║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════╣
║ TECH STACK:    React 19 · TypeScript · Vite · Tailwind v4 · Zustand · Recharts · FastAPI · Vitest  ║
║ CORE MODULES:  Strategy Engine · Market Pipeline · VestIQ · Scenario Simulator · Rebalance Engine ║
║ KEY FORMULAS:  Surplus = Income - Expense · Effective Risk = min(Tolerance, Capacity) · Step-Up FV║
║ MARKET DATA:   5-Tier Cascade: TrueData ➔ NSE Snapshot ➔ Yahoo ➔ AMFI ➔ Baseline (Zero crashes)   ║
║ VESTIQ AI:     RAG prompt synthesis injecting exact calculated surplus, runway, and target goals. ║
║ SECURITY:      Zero client secrets · Server-side keys · PII scrubbing · Sentry · Audit trails     ║
║ TESTING:       10 test files · 75 automated unit tests · 100% pass rate · GitHub Actions CI       ║
║ DEPLOYMENT:    Automated Vercel Edge Deployment (https://smart-investment-strategic-advisor.app) ║
║ LIMITATIONS:   Advisory-only (No trade execution) · 15m delayed free exchange data · Deterministic.║
║ FUTURE SCOPE:  1-Click Zerodha/Groww execution · 10,000-path Monte Carlo · Tax-loss harvesting.    ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝
```
