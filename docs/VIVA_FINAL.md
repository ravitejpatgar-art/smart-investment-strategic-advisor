# SmartVest — Comprehensive Viva Preparation Guide (50 Questions & Difficult Viva Answers)

---

## 📌 Section 1: 50 Structured Viva Questions & Answers

### **Category 1: Project Basics & Vision**
1. **Q: What is SmartVest?**  
   *A:* SmartVest is an institutional-grade, multi-asset quantitative investment advisory platform that provides personalized asset allocations, wealth scenario modeling, and portfolio rebalancing advice without broker bias or trade execution conflicts.
2. **Q: What is the primary USP of SmartVest?**  
   *A:* Complete architectural decoupling between a 100% deterministic mathematical financial calculation engine and an in-context grounded conversational AI (VestIQ), eliminating financial hallucinations.
3. **Q: Does SmartVest execute trades or hold client funds?**  
   *A:* No. SmartVest is strictly an advisory decision-support platform. It does not place orders, connect to broker execution endpoints, or custody user assets.
4. **Q: Who are the primary target users?**  
   *A:* Young working professionals establishing their first emergency runway and SIPs, mid-career milestone planners managing multi-year goals, and pre-retirees focusing on capital preservation and debt yields.

### **Category 2: Frontend & React Architecture**
5. **Q: Why did you choose React 19 and TypeScript?**  
   *A:* React 19 provides high-performance component rendering and reactivity; TypeScript enforces compile-time type safety across complex financial data models.
6. **Q: Why did you use Zustand instead of Redux for state management?**  
   *A:* Zustand provides a lightweight, boilerplate-free, hook-based store that offers high rendering performance without complex reducers or action dispatch boilerplate.
7. **Q: How does SmartVest handle responsive design for mobile devices?**  
   *A:* Using Tailwind CSS v4 responsive utilities, touch targets $\ge 42\text{px}$, single-column wrapping, overflow-safe tables, and `prefers-reduced-motion` media queries.
8. **Q: How are interactive charts rendered?**  
   *A:* Using Recharts `ResponsiveContainer`, `AreaChart`, and `PieChart` with custom dark-themed institutional tooltips and dynamic currency formatting.

### **Category 3: Backend & Data Architecture**
9. **Q: What backend framework is used and why?**  
   *A:* FastAPI (Python 3.11) with Uvicorn for high-throughput asynchronous request handling, automated Pydantic schema validation, and multi-provider market routing.
10. **Q: What database and ORM are used?**  
    *A:* SQLAlchemy 2.0 with SQLite/PostgreSQL for user benchmark and session data caching.
11. **Q: How are market data caching TTLs configured?**  
    *A:* Quotes are cached for 20–30 seconds to prevent upstream API throttling; mutual fund NAVs and historical candles are cached for 1 hour.
12. **Q: How does the backend communicate with the frontend?**  
    *A:* Over typed JSON REST endpoints configured with strict CORS middleware supporting local development and production Vercel domains.

### **Category 4: Financial Calculation Engine**
13. **Q: How is monthly investable surplus calculated?**  
    *A:* $\text{Surplus} = (\text{Income}) - (\text{Expenses})$. The recommended investment is set to $90\%$ of surplus, retaining a $10\%$ flexible cash buffer.
14. **Q: How is risk capacity calculated vs. stated risk tolerance?**  
    *A:* Risk capacity is derived mathematically from savings rate, emergency runway, age, and horizon. Effective risk is capped at capacity to protect financially vulnerable users from taking excessive risk.
15. **Q: How are candidate assets categorized and selected?**  
    *A:* Across 4 buckets (Core Growth, Long-Term Alpha, Safety/Debt, Inflation Hedges) based on suitability scores ($0–100$), volatility tiers, and expense ratios.
16. **Q: How do you guarantee percentage allocations always sum to 100%?**  
    *A:* Through mathematical normalization (`normalizePercentages`) ensuring exact decimal reconciliation.
17. **Q: Are the compounding returns guaranteed?**  
    *A:* No. All compounding outputs are model-based educational projections derived from historical benchmark assumptions, not guaranteed returns.

### **Category 5: Market Data Pipeline & Fallbacks**
18. **Q: What is the 5-tier market data failover hierarchy?**  
    *A:* TrueData Paid Feed $\rightarrow$ NSE Snapshot Feed $\rightarrow$ Yahoo Finance $\rightarrow$ Direct AMFI NAV API $\rightarrow$ Static Asset Baseline Models.
19. **Q: What are the 5 data freshness classifications?**  
    *A:* `LIVE` (Real-time), `DELAYED` (15m delayed), `LATEST NAV` (Published daily mutual fund NAV), `FALLBACK` (Baseline model), and `DEMO` (Deterministic demo mode).
20. **Q: Why is fallback handling critical in financial applications?**  
    *A:* It prevents UI blanking, runtime exceptions, and broker API rate-limit errors from disrupting the user experience during network outages.
21. **Q: Where are commercial market data API keys stored?**  
    *A:* Strictly in server-side environment variables on the FastAPI backend; never exposed in frontend `VITE_*` client bundles.
22. **Q: Is the paid market data provider required for SmartVest to function?**  
    *A:* No. The paid provider (TrueData) is completely optional (`PAID_MARKET_DATA_ENABLED=false` by default). The platform functions on standard open and fallback feeds.

### **Category 6: AI & VestIQ Grounding**
23. **Q: How does VestIQ eliminate financial hallucinations?**  
    *A:* By synthesizing the exact computed financial state into the system prompt and enforcing strict guardrails prohibiting speculative numbers.
24. **Q: What happens if the upstream AI LLM endpoint is down?**  
    *A:* VestIQ automatically switches to a deterministic pattern-matched fallback engine grounded in the user's real numbers.
25. **Q: Does VestIQ send private passwords or tokens to the AI API?**  
    *A:* No. Authentication tokens, passwords, and PII are strictly excluded from the prompt context.
26. **Q: How does VestIQ respond to questions about unconfigured assets like cryptocurrency?**  
    *A:* It informs the user that cryptocurrency is not part of their authorized risk-adjusted strategy blueprint.

### **Category 7: Scenario Simulator & Rebalancing**
27. **Q: How does the scenario simulator compute inflation-adjusted wealth?**  
    *A:* By discounting the nominal compound future value by $(1 + \text{Inflation Rate})^{\text{Years}}$ to display real purchasing power.
28. **Q: How does annual SIP step-up compounding work?**  
    *A:* Monthly contributions increase annually by the step-up percentage ($S_y = S_0 \times (1 + \text{stepUp})^{y-1}$), compounding monthly.
29. **Q: What is portfolio drift?**  
    *A:* The percentage point difference between an asset's current portfolio share and its target blueprint allocation ($\Delta \text{Drift} = \text{Current} - \text{Target}$).
30. **Q: How does new-contribution SIP rebalancing work without selling?**  
    *A:* It calculates the dollar deficit in underweight assets and directs future monthly SIP flows proportionally to close the gap tax-efficiently.
31. **Q: Are scenario simulations saved to the permanent user profile?**  
    *A:* No. Scenario experiments are ephemeral and temporary, preventing accidental corruption of the baseline strategy.

### **Category 8: Security, Quality Assurance & DevOps**
32. **Q: What authentication methods are supported?**  
    *A:* Firebase Authentication with email/password, Google OAuth, and an offline development mock bypass mode.
33. **Q: How is error monitoring handled in production?**  
    *A:* Via Sentry React SDK with automated breadcrumbs and client-side PII sanitization.
34. **Q: What is the purpose of audit logging in SmartVest?**  
    *A:* To capture non-blocking compliance audit events (`AUTH_*`, `PROFILE_*`, `MARKET_*`, `SCENARIO_*`, `REBALANCE_*`) for security and traceability.
35. **Q: What testing framework is used and how many tests exist?**  
    *A:* Vitest 4.1.11 with 10 test suites containing **75 automated unit tests (100% passing)**.
36. **Q: How does the CI/CD pipeline operate?**  
    *A:* GitHub Actions triggers on push/PR to `main`, executes `npm ci`, runs `npm test`, performs `npm run build`, and deploys automatically to Vercel.
37. **Q: What is Demo Mode and how is it activated?**  
    *A:* Appending `?demo=true` activates deterministic, self-contained mock data that bypasses live and paid market data feeds.
38. **Q: How do you handle edge cases like zero income, zero portfolio value, or negative inputs?**  
    *A:* Input sanitizers clamp values to valid numerical boundaries, and deficit flags display budgeting guidance without throwing `NaN` or `Infinity`.
39. **Q: What are the current limitations of SmartVest?**  
    *A:* Advisory-only scope (no trade execution), 15-minute exchange delay on free tier data, and deterministic rather than stochastic projections.
40. **Q: What is the future development roadmap?**  
    *A:* Direct broker basket execution via Zerodha/Groww APIs, 10,000-path Monte Carlo retirement simulations, and automated tax-loss harvesting.
41. **Q: How does SmartVest handle multi-currency display?**  
    *A:* Using the global currency context (`INR` with `₹` and `USD` with `$`) and localized formatting helpers (`formatCurrency`).
42. **Q: How is PDF export implemented?**  
    *A:* Client-side PDF generation using jsPDF with formatted asset allocation tables, risk scores, and compliance disclaimers.
43. **Q: How are market holidays and non-trading hours handled?**  
    *A:* The market status endpoint returns `CLOSED` or `PRE_MARKET` schedules while serving the most recent closing quotes.
44. **Q: How does the goal planner project completion probability?**  
    *A:* By comparing required monthly SIP against available surplus and calculating future value compounding over the goal horizon.
45. **Q: How are discretionary and non-discretionary expenses categorized?**  
    *A:* Expenses are tagged by category (`Housing`, `Food`, `Utilities`, `Entertainment`, `EMI`) to evaluate fixed vs. lifestyle costs.
46. **Q: How does SmartVest ensure accessibility compliance?**  
    *A:* Through high-contrast text ratios, explicit ARIA labels, semantic HTML landmarks, and keyboard navigation support.
47. **Q: What happens if a user submits an invalid password during login?**  
    *A:* Firebase returns an auth error which is caught safely and surfaced via a toast message while logging a sanitized `AUTH_LOGIN_FAILURE` audit event.
48. **Q: How is data persisted across browser refreshes?**  
    *A:* Zustand state is synchronized with `localStorage` backup and remote Firestore documents for authenticated sessions.
49. **Q: What prevents multiple simultaneous API requests during market polling?**  
    *A:* In-flight request de-duplication and 30-second client-side TTL caching in `marketApi.ts`.
50. **Q: How do you know the application is production-ready?**  
    *A:* 100% passing automated test suite (75 tests), zero TypeScript/bundling build errors, zero leaked secrets, and verified live Vercel edge deployment.

---

## 🧠 Section 2: 40 Difficult Viva Questions & Deep Answers

1. **What problem does SmartVest solve?**  
   *It solves fragmented financial management, emotional asset allocation, and hallucinated AI advice by combining deterministic quantitative mathematics with grounded AI.*
2. **What is the USP?**  
   *The architectural decoupling of a 100% deterministic mathematical financial engine from an in-context grounded conversational AI (VestIQ).*
3. **Why React?**  
   *Component reusability, virtual DOM performance, and rich ecosystem for financial data visualization.*
4. **Why TypeScript?**  
   *Eliminates runtime type errors across complex financial interfaces, quote schemas, and allocation objects.*
5. **Why FastAPI?**  
   *High-performance asynchronous Python framework with native Pydantic validation and automatic OpenAPI documentation.*
6. **Why Firebase?**  
   *Secure, managed authentication infrastructure and serverless document persistence with zero maintenance overhead.*
7. **How is user data persisted?**  
   *Via Firestore document collections mapped by authenticated UID, backed by local state persistence.*
8. **How is the risk mandate determined?**  
   *By evaluating savings rate, emergency runway, age, and horizon, setting Effective Risk = min(Stated Tolerance, Evaluated Capacity).*
9. **How is monthly surplus calculated?**  
   *Total Monthly Income minus Total Monthly Expenses, allocating 90% to recommended SIP and 10% to flexible cash buffer.*
10. **How is CAGR used?**  
    *As the weighted geometric return expectation across the portfolio's historical asset class benchmarks.*
11. **Are the returns guaranteed?**  
    *No. All return projections are analytical model estimates, clearly stated as educational illustrations.*
12. **How do you avoid AI hallucinations?**  
    *By injecting the exact computed financial state into the system prompt and enforcing strict guardrails prohibiting speculative numbers.*
13. **What happens when the AI backend is unavailable?**  
    *VestIQ automatically falls back to a deterministic rule-based response engine grounded in the user's real numbers.*
14. **What happens when market APIs fail?**  
    *The 5-tier failover cascade seamlessly serves cached NAVs or baseline models with yellow `FALLBACK` badges without crashing.*
15. **Why do you need fallback data?**  
    *To guarantee 100% UI availability and prevent network timeouts or broker API downtime from freezing the application.*
16. **How do you distinguish LIVE from DEMO data?**  
    *Through explicit quote status tags: `LIVE` indicates real-time provider data, while `DEMO` indicates deterministic mock data.*
17. **How are API keys protected?**  
    *All commercial vendor API keys reside on the FastAPI server; zero private keys are bundled into frontend code.*
18. **Why is the paid market provider optional?**  
    *To ensure the application operates freely on open and delayed feeds without requiring mandatory paid subscriptions.*
19. **Does SmartVest execute trades?**  
    *No. SmartVest is strictly an advisory decision-support platform.*
20. **How does rebalancing work?**  
    *It calculates allocation drift against target blueprints and generates a tax-efficient New-Contribution SIP Plan.*
21. **How does the scenario engine work?**  
    *It simulates compound growth incorporating monthly SIP, annual step-up percentages, and inflation discounting.*
22. **How is inflation handled?**  
    *Future nominal wealth is discounted by $(1 + \text{Inflation})^{\text{Years}}$ to display real purchasing power.*
23. **How are percentages kept mathematically valid?**  
    *Through normalization algorithms that ensure asset class weights reconcile to exactly 100%.*
24. **How is user isolation implemented?**  
    *Authenticated user state is isolated by Firebase UID; Demo Mode runs entirely in ephemeral memory.*
25. **What is Demo Mode?**  
    *A zero-dependency offline evaluation sandbox activated by `?demo=true`.*
26. **Why is Demo Mode useful?**  
    *It enables deterministic presentations, offline testing, and instructor reviews without requiring live API keys.*
27. **How does Sentry help?**  
    *It captures production runtime exceptions with automated breadcrumbs and client-side PII sanitization.*
28. **Why do you need structured logging?**  
    *To provide traceable, formatted application logs (`[SmartVest:INFO]`) without leaking sensitive financial values.*
29. **What is audit logging?**  
    *A non-blocking compliance record capturing key security and calculation events (`AUTH_*`, `PROFILE_*`, `SCENARIO_*`).*
30. **How do you test financial calculations?**  
    *Using automated Vitest unit test suites validating surplus, compounding, drift, and normalization formulas.*
31. **How does CI work?**  
    *GitHub Actions triggers on push/PR, installs dependencies, runs Vitest (75 tests), and validates production builds.*
32. **Why deploy with Vercel?**  
    *For global edge network distribution, sub-second TTFB, and seamless GitHub Actions automated continuous delivery.*
33. **What happens if the backend goes down?**  
    *The frontend switches to client-side direct AMFI/MFAPI fallbacks and baseline models with zero interruption.*
34. **What happens if market price is unavailable?**  
    *Rebalancing calculations operate purely on percentage shares, and quotes display a clear `UNAVAILABLE` badge.*
35. **What are the limitations?**  
    *Advisory-only scope, 15-minute exchange delay on free tier data, and deterministic rather than stochastic projections.*
36. **What would you improve next?**  
    *Integrate 1-click broker OAuth execution (Zerodha/Groww) and a 10,000-path stochastic Monte Carlo simulation engine.*
37. **How would you scale this system?**  
    *Deploy FastAPI backend on Kubernetes with Redis caching clusters and database read replicas.*
38. **What happens with a zero-investment portfolio?**  
    *The platform displays budgeting guidance and highlights the need to build an emergency fund before investing.*
39. **What happens with an empty allocation?**  
    *The strategy engine defaults to safe liquid reserve baselines until the user configures their discovery profile.*
40. **Why is the system advisory rather than execution-oriented?**  
    *To eliminate broker commission bias and focus exclusively on fiduciary, conflict-free multi-asset strategic planning.*
