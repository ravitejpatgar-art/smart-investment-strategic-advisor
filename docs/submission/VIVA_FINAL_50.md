# SmartVest — Final 50 Viva Questions & Comprehensive Answers

---

## Category 1: Project Basics & System Architecture (Q1 – Q6)

#### Q1: What is SmartVest and what core problem does it solve?
**Answer:** SmartVest is an intelligent, non-custodial multi-asset investment strategic advisor and portfolio decision-support system. It solves the systemic retail investing dilemma where individuals commit capital to volatile assets without adequate liquid emergency buffers (6 months), suffer from emotional asset allocation drift, rely on fragile market data, or encounter AI hallucinations from generic chatbots.

#### Q2: What is the architectural model of SmartVest?
**Answer:** SmartVest employs a decoupled client-server architecture:
1. **Frontend:** Single Page Application (SPA) built with React 19, TypeScript 6, Tailwind CSS v4, and Zustand.
2. **Backend:** Asynchronous Python FastAPI gateway running on Uvicorn, handling multi-provider market routing, caching, and health checks.
3. **Services:** Firebase Auth, VestIQ Grounded AI, Sentry error tracking, and custom audit logging.

#### Q3: What is the difference between an advisory decision-support system and a trading platform?
**Answer:** A trading platform (broker) executes live orders, holds custody of user capital, and earns revenue via transaction commissions. SmartVest is a non-custodial strategic decision-support platform that performs cash flow analysis, risk profiling, compounding simulation, and rebalancing planning without handling user funds or executing trades.

#### Q4: Why did you choose a decoupled architecture rather than a monolithic full-stack framework?
**Answer:** Decoupling isolates concerns. The frontend maintains sub-5ms client-side reactivity for financial math and charts, even during backend maintenance. The backend gateway manages third-party rate limits, API key security, and multi-provider failovers independently.

#### Q5: What are the primary user roles and workflows in SmartVest?
**Answer:** The primary user is a retail investor. The workflow progresses from: Authentication $\rightarrow$ Cash Flow & Expense Profiling $\rightarrow$ Emergency Runway Check $\rightarrow$ Psychometric Risk Assessment $\rightarrow$ Strategic Blueprint Generation $\rightarrow$ Scenario Compounding Simulation $\rightarrow$ Rebalancing & VestIQ AI Guidance $\rightarrow$ PDF Report Export.

#### Q6: How does SmartVest ensure unbiased recommendations?
**Answer:** SmartVest does not accept broker kickbacks, affiliate distribution commissions, or promote proprietary funds. Allocations are driven strictly by mathematical formulas and empirical risk tolerance scoring.

---

## Category 2: Frontend Architecture & State Management (Q7 – Q12)

#### Q7: Why did you choose Zustand over Redux or React Context for state management?
**Answer:** Zustand (`useFintechStore.ts`) provides a lightweight (~1KB), boilerplate-free store with atomic selectors. Unlike React Context, it avoids unnecessary re-renders of unrelated components when high-frequency market quotes update.

#### Q8: What state is managed in the central Zustand store?
**Answer:** The store manages authenticated user profile data (income, expenses, emergency fund, risk answers, goals), computed investment strategy, cached market quotes, active currency (`INR` / `USD`), navigation views, and advisor drawer states.

#### Q9: How is client-side routing handled?
**Answer:** Views are managed via state-driven tab routing (`activeView` in Zustand), supporting smooth transitions between Landing, Onboarding, Overview Dashboard, Market Terminal, Expense Tracker, Goal Planning, Recommendations, and Profile views without page reloads.

#### Q10: What role does Tailwind CSS v4 play in the frontend?
**Answer:** Tailwind CSS v4 (`@tailwindcss/vite`) provides a high-performance, modern utility styling engine. It enforces design tokens (dark-mode aesthetics, custom color palettes, responsive flex/grid layouts) directly through Vite compilation without post-processing overhead.

#### Q11: How are responsive breakpoints handled?
**Answer:** Layouts are engineered mobile-first across three primary responsive breakpoints: Mobile (<768px / 375px baseline), Tablet (768px–1024px), and Desktop (>1024px / 1280px standard), verified via automated testing in `responsive.test.ts`.

#### Q12: How are interactive financial charts rendered?
**Answer:** Charts are built with **Recharts 3.10.1**, using declarative SVG components: `AreaChart` for compounding curves, `BarChart` for cash flow and goal progress, and `PieChart` / Donut charts for asset allocation distributions.

---

## Category 3: Backend API & Service Layer (Q13 – Q17)

#### Q13: Why did you choose FastAPI for the backend gateway?
**Answer:** FastAPI (`0.115.8`) offers asynchronous non-blocking I/O (`async`/`await`), automatic OpenAPI/Swagger documentation, high execution speeds on Uvicorn, and native integration with Pydantic for robust request/response validation.

#### Q14: What are the primary REST endpoints exposed by the backend?
**Answer:**
* `GET /market/quotes?symbols=...`: Batch quote snapshots.
* `GET /market/candles/{symbol}`: Historical daily/weekly OHLCV candles.
* `GET /market/status`: Exchange market hours and trading session status (NSE/BSE, NYSE).
* `GET /market/providers`: Active provider status and capabilities matrix.

#### Q15: How does the backend handle concurrent requests without getting rate-limited?
**Answer:** The `ProviderRouter` maintains an in-memory TTL cache (30s for real-time quotes, 1 hour for daily NAVs) and implements exponential backoff cooldowns when third-party providers return HTTP 429 or 5xx errors.

#### Q16: How does the backend validate incoming client payloads?
**Answer:** Through **Pydantic v2 schemas**, enforcing strong type validation, regex pattern matching for ticker symbols, and range checks on numerical parameters.

#### Q17: What database technologies are supported in the backend?
**Answer:** The backend utilizes **SQLAlchemy 2.0 ORM** with **Alembic migrations**, supporting lightweight SQLite for local development and PostgreSQL (`psycopg2-binary`) for production deployments.

---

## Category 4: Database & User Profile Persistence (Q18 – Q21)

#### Q18: Where is user financial data stored when offline or unauthenticated?
**Answer:** Unauthenticated and offline sessions are persisted via `userProfileRepository.ts` using browser `localStorage` under isolated keys (`smartvest_profile`, `smartvest_expenses`, `smartvest_goals`), with automatic JSON serialization and validation.

#### Q19: How is user data isolated across different accounts?
**Answer:** In authenticated mode, all records are indexed and partitioned by unique Firebase User IDs (`uid`). User profiles are scoped strictly to the authenticated identity, preventing cross-user data leakage.

#### Q20: What is Demo Mode and how is its state handled?
**Answer:** Demo Mode hydrates the application with a pre-configured, realistic financial profile (₹85,000 income, 4 expenses, 3 milestone goals, Balanced risk mandate). It operates in an isolated state that does not overwrite existing authenticated user data.

#### Q21: How does SmartVest handle schema migrations for local storage?
**Answer:** `userProfileRepository.ts` inspects stored JSON versions, provides fallback defaults for newly introduced fields (e.g., currency preferences, emergency fund targets), and sanitizes legacy keys on startup.

---

## Category 5: Authentication & Firebase (Q22 – Q25)

#### Q22: How is user authentication implemented?
**Answer:** SmartVest uses **Firebase Authentication Client SDK (`12.18.0`)**, supporting Email/Password authentication and Google OAuth Single Sign-On (SSO).

#### Q23: How does the application support local development if Firebase keys are not configured?
**Answer:** The system features an automatic **Mock Auth Bypass** (`isAuthEnabled()` in `firebase.ts`). If Firebase configuration keys are absent, the application gracefully initializes a local developer session without throwing runtime errors.

#### Q24: How are JSON Web Tokens (JWT) handled in API requests?
**Answer:** When Firebase Auth is active, the client attaches the bearer token (`Authorization: Bearer <token>`) to Axios HTTP request headers, validated server-side by FastAPI middleware.

#### Q25: How does the frontend handle session termination and logout?
**Answer:** Triggering logout clears Firebase authentication tokens, flushes active Zustand user state, resets cached strategy models, and redirects the user to the landing view.

---

## Category 6: Market Data & 5-Tier Fallback Hierarchy (Q26 – Q31)

#### Q26: What is the 5-Tier Market Data Hierarchy in SmartVest?
**Answer:**
1. **Tier 1 (LIVE):** TrueData Paid Indian Provider (Real-time NSE/BSE feeds via commercial API keys).
2. **Tier 2 (DELAYED):** Yahoo Finance Delayed Gateway (15-minute delayed global quotes and indices).
3. **Tier 3 (FALLBACK):** Official AMFI / MFAPI Feed (Daily mutual fund NAVs tagged `LATEST NAV`).
4. **Tier 4 (FALLBACK):** Deterministic Baseline Models (Valid mathematical OHLCV candles).
5. **Tier 5 (UNAVAILABLE):** Explicit fallback badge state preventing UI crashes.

#### Q27: How does SmartVest prevent fake LIVE status labeling?
**Answer:** The system strictly assigns status badges based on actual provider provenance. Quotes derived from secondary scrapers are labeled `DELAYED`, AMFI daily NAVs are labeled `FALLBACK` / `LATEST NAV`, and baseline estimates are marked `FALLBACK`. Only authenticated commercial streaming feeds receive the `LIVE` badge.

#### Q28: How does the market client handle batch quote requests when some symbols fail?
**Answer:** `marketApi.ts` implements **Batch Resilience**. If a bulk request fails, it automatically splits the batch, resolves available quotes individually, and substitutes fallback estimates only for the failing symbols without aborting the entire request.

#### Q29: How are commercial API keys protected from client exposure?
**Answer:** Commercial credentials (e.g., TrueData credentials) are stored exclusively in backend `.env` files. The frontend client only requests normalized quotes through the FastAPI backend gateway, ensuring zero secret leakage in client-side bundles.

#### Q30: How many instruments does the Market Terminal monitor?
**Answer:** Over **57 instruments** across Indian Equities (NIFTY 50, Sensex, Reliance, TCS), Global Indices (S&P 500, Nasdaq, FTSE), ETFs (Nifty BeES, Gold BeES), Mutual Funds (Parag Parikh, HDFC Top 100), and Government Debt Securities.

#### Q31: What happens if the entire backend service is offline?
**Answer:** The frontend's `marketApi.ts` detects the connection failure, logs a structured warning, and activates client-side Tier 3/4 fallbacks, generating valid numeric data for all dashboard widgets and charts.

---

## Category 7: Financial Algorithms & Compounding Logic (Q32 – Q36)

#### Q32: What is the formula for Monthly Budget Surplus and Savings Rate?
**Answer:**
$$\text{Surplus } (S) = \text{Monthly Net Income} - \sum \text{Monthly Expenses}$$
$$\text{Savings Rate } (R_{save}) = \left( \frac{S}{\text{Income}} \right) \times 100$$

#### Q33: How is the Emergency Runway calculated and why is it gated?
**Answer:**
$$\text{Emergency Runway (Months)} = \frac{\text{Current Liquid Savings}}{\sum \text{Monthly Expenses}}$$
A minimum of 6.0 months is mandated. If the runway is below 6 months, the strategy engine flags an emergency deficit and prioritizes allocations to liquid debt before recommending aggressive equity investments.

#### Q34: What is the mathematical formula for Future Value with an Annual Step-Up SIP?
**Answer:**
For initial monthly SIP $P_0$, annual step-up rate $s$, annual expected return $r$ ($i = r/12$), over $Y$ years:
$$FV = \sum_{y=1}^{Y} \left[ P_0 (1+s)^{y-1} \times \frac{(1+i)^{12(Y-y+1)} - (1+i)^{12(Y-y)}}{i} \right]$$

#### Q35: How is inflation-adjusted purchasing power calculated?
**Answer:**
$$PV_{real} = \frac{FV}{(1 + \pi)^Y}$$
Where $FV$ is nominal future corpus, $\pi$ is the annual inflation rate (e.g., 5.5%), and $Y$ is the investment horizon in years.

#### Q36: How does the strategy engine map risk profiles to asset allocations?
**Answer:**
* **Conservative:** 20% Equity, 60% Debt, 10% Gold, 10% Cash (7.5% CAGR)
* **Balanced:** 50% Equity, 35% Debt, 10% Gold, 5% Cash (10.5% CAGR)
* **Growth:** 65% Equity, 25% Debt, 7% Gold, 3% Cash (12.0% CAGR)
* **Aggressive:** 80% Equity, 12% Debt, 5% Gold, 3% Cash (13.5% CAGR)

---

## Category 8: VestIQ Grounded AI Engine (Q37 – Q40)

#### Q37: How does VestIQ prevent AI hallucinations in financial advisory?
**Answer:** VestIQ uses **In-Context State Grounding** (`vestiqGrounding.ts`). Every user query is pre-processed by injecting the user's authoritative financial state (exact income, surplus, runway, risk profile, active goals) into the system prompt with strict instructions never to fabricate prices, guarantee returns, or execute trades.

#### Q38: What happens if an external LLM API fails or is unreachable?
**Answer:** VestIQ triggers its **Deterministic Offline Synthesizer**, which evaluates user questions against intent patterns (e.g., runway check, surplus analysis, allocation queries) and returns accurate answers constructed directly from local state.

#### Q39: Can VestIQ execute trades or move money on behalf of the user?
**Answer:** No. VestIQ operates under strict compliance guardrails. It explicitly refuses any user instruction to execute trades, initiate payments, or transfer funds, reinforcing its role as an educational and strategic advisory tool.

#### Q40: How does VestIQ tailor its advice to user risk mandates?
**Answer:** If an aggressive user asks about debt allocations, VestIQ explains the role of capital preservation. If a conservative user asks about high-beta small-cap stocks, VestIQ warns of volatility risks and recommends adhering to their 20% equity mandate.

---

## Category 9: Scenario Simulator & Rebalancing Engine (Q41 – Q44)

#### Q41: What four scenarios does the Scenario Simulator compare?
**Answer:**
1. **Conservative:** 7.5% CAGR with 7.0% inflation.
2. **Base Case:** 11.0% CAGR with 5.5% inflation.
3. **Optimistic:** 15.0% CAGR with 4.5% inflation.
4. **Custom Scenario:** Fully adjustable sliders for SIP, Return (1%–30%), Horizon (1–40 yrs), Step-Up (0%–25%), and Inflation (0%–15%).

#### Q42: What is Portfolio Drift in the Rebalancing Engine?
**Answer:** Drift represents the divergence of current asset holdings from the target model allocation:
$$\text{Drift}_k = \text{Current Percentage}_k - \text{Target Percentage}_k$$

#### Q43: How do tolerance thresholds function in portfolio rebalancing?
**Answer:** Users select a tolerance band (1%, 2.5%, 5%, 10%). Assets exceeding $+\text{Threshold}$ are marked `OVERWEIGHT`, assets below $-\text{Threshold}$ are marked `UNDERWEIGHT`, and assets within the band are marked `ON TARGET`.

#### Q44: Why is contribution-based SIP rebalancing superior to selling assets?
**Answer:** Selling overweight assets triggers Short-Term (STCG) or Long-Term Capital Gains (LTCG) tax liabilities and exit loads. Contribution-based rebalancing directs upcoming monthly SIP cash flows into underweight assets, restoring balance naturally without incurring tax penalties.

---

## Category 10: Security, Privacy & Logging (Q45 – Q47)

#### Q45: How does SmartVest protect user privacy and Personally Identifiable Information (PII)?
**Answer:** All client telemetry, console logs, and Sentry error reports automatically sanitize email addresses, user names, passwords, and sensitive financial figures before transmission.

#### Q46: What is the role of `auditLogger.ts`?
**Answer:** It records non-blocking, structured compliance audit events for all critical lifecycle actions (`AUTH_LOGIN_SUCCESS`, `PROFILE_SAVED`, `GOAL_CREATED`, `MARKET_FALLBACK_ACTIVATED`, `VESTIQ_REQUEST_INITIATED`), protected against circular reference crashes.

#### Q47: How does Sentry contribute to application reliability?
**Answer:** Sentry React SDK (`@sentry/react 10.73.0`) captures unhandled client-side runtime errors, breadcrumbs, and component crashes, reporting stack traces without blocking user interaction.

---

## Category 11: Testing, CI/CD & Deployment (Q48 – Q50)

#### Q48: What is the current status and size of the automated test suite?
**Answer:** SmartVest has **10 automated test suites containing 75 unit and integration tests**, executed via **Vitest 4.1.11** and **Happy DOM 20.13.2**. All 75 tests pass with a **100% success rate (0 failures)**.

#### Q49: Describe the GitHub Actions Continuous Integration (CI) pipeline.
**Answer:** Configured in `.github/workflows/ci.yml`, the pipeline runs on Ubuntu Latest (Node 20) on every push/PR to `main`:
`Checkout` $\rightarrow$ `Setup Node 20` $\rightarrow$ `npm ci` $\rightarrow$ `npm test (Vitest)` $\rightarrow$ `npm run build (TypeScript & Vite)`.

#### Q50: How is SmartVest deployed to production?
**Answer:** The frontend is deployed to the **Vercel Global Edge Network**, leveraging edge caching, instant SSL termination, and automated builds directly synchronized with the GitHub repository.
