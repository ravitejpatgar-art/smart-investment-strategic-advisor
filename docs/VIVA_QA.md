# SmartVest — 40 Comprehensive Viva Questions & Answers

---

## 📌 Category 1: Project Basics & Vision

1. **Q: What is SmartVest and what is its core objective?**  
   *A:* SmartVest is an institutional-grade, multi-asset quantitative investment advisory platform that provides personalized asset allocations, wealth scenario modeling, and portfolio rebalancing advice without broker bias or trade execution conflicts.

2. **Q: What is the primary USP of SmartVest?**  
   *A:* The strict decoupling of a 100% deterministic mathematical financial engine from an in-context grounded AI assistant (VestIQ), guaranteeing zero financial or numerical hallucinations.

3. **Q: Does SmartVest execute trades or hold client funds?**  
   *A:* No. SmartVest is strictly an advisory decision-support platform. It does not place orders, connect to broker execution endpoints, or custody user assets.

4. **Q: Who are the primary target users of SmartVest?**  
   *A:* Young working professionals establishing their first emergency runway and SIPs, mid-career milestone planners managing multi-year goals, and pre-retirees focusing on capital preservation and debt yields.

---

## 📌 Category 2: Frontend & React Architecture

5. **Q: Why did you choose React 19 and TypeScript?**  
   *A:* React 19 delivers high-performance declarative UI rendering; TypeScript enforces compile-time type safety across complex financial data structures.

6. **Q: Why did you use Zustand instead of Redux for state management?**  
   *A:* Zustand provides a lightweight, boilerplate-free, hook-based store that offers high rendering performance without complex reducers or action dispatch boilerplate.

7. **Q: How does SmartVest handle responsive design for mobile devices?**  
   *A:* Using Tailwind CSS v4 responsive utilities, touch targets $\ge 42\text{px}$, single-column wrapping, overflow-safe tables, and `prefers-reduced-motion` media queries.

8. **Q: How are interactive charts rendered?**  
   *A:* Using Recharts `ResponsiveContainer`, `AreaChart`, and `PieChart` with custom dark-themed institutional tooltips and dynamic currency formatting.

---

## 📌 Category 3: Backend & Data Architecture

9. **Q: What backend framework is used and why?**  
   *A:* FastAPI (Python 3.11) with Uvicorn for high-throughput asynchronous request handling, automated Pydantic schema validation, and multi-provider market routing.

10. **Q: What database and ORM are used?**  
    *A:* SQLAlchemy 2.0 with SQLite/PostgreSQL for user benchmark and session data caching.

11. **Q: How are market data caching TTLs configured?**  
    *A:* Quotes are cached for 20–30 seconds to prevent upstream API throttling; mutual fund NAVs and historical candles are cached for 1 hour.

12. **Q: How does the backend communicate with the frontend?**  
    *A:* Over typed JSON REST endpoints configured with strict CORS middleware supporting local development and production Vercel domains.

---

## 📌 Category 4: Financial Calculation Engine

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

---

## 📌 Category 5: Market Data Pipeline & Fallbacks

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

---

## 📌 Category 6: AI & VestIQ Grounding

23. **Q: How does VestIQ eliminate financial hallucinations?**  
    *A:* By synthesizing the exact computed financial state into the system prompt and enforcing strict guardrails prohibiting speculative numbers.

24. **Q: What happens if the upstream AI LLM endpoint is down?**  
    *A:* VestIQ automatically switches to a deterministic pattern-matched fallback engine grounded in the user's real numbers.

25. **Q: Does VestIQ send private passwords or tokens to the AI API?**  
    *A:* No. Authentication tokens, passwords, and PII are strictly excluded from the prompt context.

26. **Q: How does VestIQ respond to questions about unconfigured assets like cryptocurrency?**  
    *A:* It informs the user that cryptocurrency is not part of their authorized risk-adjusted strategy blueprint.

---

## 📌 Category 7: Scenario Simulator & Rebalancing

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

---

## 📌 Category 8: Security, Quality Assurance & DevOps

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
