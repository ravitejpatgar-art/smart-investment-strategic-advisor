# SmartVest — Project Overview

## 1. Problem Statement

Individual retail investors face multiple structural hurdles when planning their long-term wealth:
1. **Fragmented Personal Finances**: Cash flows, existing savings, emergency funds, and milestone goals are managed across disconnected spreadsheets and banking apps.
2. **Emotional & Biased Asset Allocation**: Retail capital often concentrates heavily in speculative single-stock bets, over-allocated real estate, or underperforming traditional deposits without calculating risk capacity or diversification benefits.
3. **Ungrounded AI Financial Advice**: Emerging AI chatbots frequently hallucinate returns, recommend speculative instruments, and quote inaccurate numbers because they lack strict in-context grounding.
4. **Broker Execution Conflicts**: Most retail platforms operate as commission-driven brokers, incentivized by transaction frequency rather than conflict-free fiduciary asset allocation.

---

## 2. Proposed Solution

**SmartVest** is an institutional-grade, conflict-free strategic wealth advisory platform designed to bridge the gap between mathematical financial planning and conversational AI guidance.

SmartVest strictly decouples **deterministic quantitative algorithms** from **conversational natural language explanation**:
- The **Financial Strategy Engine** computes exact mathematical surplus, risk capacity scores, emergency fund coverage, and asset allocation percentages.
- The **VestIQ Grounded AI Copilot** communicates this advice conversationally using strict ground-truth context, eliminating financial hallucinations.
- The **Scenario Simulator** models annual step-up compounding and inflation purchasing power discounting.
- The **Portfolio Rebalancing Engine** identifies allocation drift and formulates tax-efficient new-contribution SIP plans without forced selling.

---

## 3. Unique Selling Proposition (USP)

### **Primary USP**
> **Ground-Truth Architecture**: Complete decoupling of a **100% deterministic mathematical financial engine** from an **in-context grounded AI financial copilot (VestIQ)**, guaranteeing zero hallucinated figures while providing institutional-quality portfolio advice.

### **Supporting Differentiators**
1. **Resilient 5-Tier Market Data Hierarchy**: Seamless cascade (`TrueData Paid Feed` $\rightarrow$ `NSE Snapshot` $\rightarrow$ `Yahoo Finance` $\rightarrow$ `Direct AMFI/MFAPI` $\rightarrow$ `Deterministic Baseline/Demo`) guaranteeing zero UI crashes.
2. **Tax-Efficient New-Contribution Rebalancing**: Realigns portfolio drift by steering future monthly SIP surplus into underweight asset classes without forcing asset liquidation.
3. **Institutional Security & Data Privacy**: Client-side secret isolation, zero browser credential exposure, comprehensive Sentry telemetry with PII sanitization, and structured audit trails.

---

## 4. Target User Personas

1. **Young Working Professionals (Age 22–35)**: Building disciplined monthly investment habits, balancing lifestyle expenditures, and creating their first emergency runway.
2. **Mid-Career Milestone Planners (Age 35–50)**: Managing multi-goal horizons (children's education, home purchase, retirement) requiring dynamic multi-asset balancing.
3. **Pre-Retirement & Conservative Investors (Age 50+)**: Shifting from high-growth equity accumulation toward capital preservation, liquid debt yield, and inflation-hedged gold reserves.

---

## 5. End-to-End User Workflows

```
[ User Onboarding & Discovery ]
              │
              ▼
[ Income, Expenses, Emergency Savings, Age, Horizon, Goals ]
              │
              ▼
[ Strategy Engine: Math & Suitability Scoring ]
              ├── Investable Surplus & 10% Flexible Cash Buffer
              ├── Risk Capacity vs. Stated Tolerance Matrix
              └── Multi-Asset Blueprint Allocation (Core, Growth, Gold, Debt)
              │
              ├───► [ Strategic Wealth Dashboard & Compounding Chart ]
              ├───► [ What-If Scenario Simulator & Step-Up Modeling ]
              ├───► [ Portfolio Drift & Tax-Efficient SIP Rebalancing ]
              ├───► [ Global Market Terminal & Instrument Analytics ]
              └───► [ VestIQ Grounded AI Copilot Q&A ]
```

---

## 6. Project Scope & Advisory Mandate

- **Strictly Advisory**: SmartVest provides decision-support models and institutional analytics.
- **Non-Custodial & Non-Broker**: SmartVest does not execute trades, hold custody of client funds, place orders, or connect to broker execution endpoints.
- **Non-Predictive**: All compounding projections and return ranges are model-based educational illustrations, not guaranteed returns.
