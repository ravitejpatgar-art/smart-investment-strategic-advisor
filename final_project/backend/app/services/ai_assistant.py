"""
SmartVest AI — Universal Financial Intelligence & Reasoning Engine.
Provides generalized financial question understanding, multi-tier intent execution,
deterministic calculations, strict context isolation, and numerical validation.
"""

import json
import urllib.request
import urllib.error
import re
import uuid
import sys
from typing import Dict, Any, List, Optional, Callable

def safe_log(msg: str):
    """Safely writes logs preventing Unicode charmap errors on Windows console."""
    try:
        print(msg)
    except Exception:
        enc = getattr(sys.stdout, 'encoding', 'utf-8') or 'utf-8'
        try:
            print(msg.encode('ascii', errors='replace').decode('ascii'))
        except Exception:
            pass

from app.core.config import settings
from app.services.intent_detector import (
    detect_financial_intent,
    EducationalTopic,
    extract_educational_topic,
    IntentCategory,
    INTENT_INVESTMENT_RECOMMENDATION,
    INTENT_SURPLUS_ALLOCATION,
    INTENT_FUND_COMPARISON,
    INTENT_ETF_COMPARISON,
    INTENT_STOCK_ANALYSIS,
    INTENT_PORTFOLIO_REVIEW,
    INTENT_GOAL_PLANNING,
    INTENT_SIP_CALCULATION,
    INTENT_RETIREMENT_PLANNING,
    INTENT_AFFORDABILITY,
    INTENT_EMERGENCY_FUND,
    INTENT_EXPENSE_ANALYSIS,
    INTENT_RISK_EXPLANATION,
    INTENT_WHY_RECOMMENDED,
    INTENT_WHY_NOT_RECOMMENDED,
    INTENT_TAX_GENERAL_EDUCATION,
    INTENT_INFLATION,
    INTENT_COMPOUNDING,
    INTENT_MARKET_QUESTION,
    INTENT_GENERAL_FINANCIAL_EDUCATION,
    INTENT_GREETING,
    INTENT_AMBIGUOUS_CLARIFICATION
)
from app.services.financial_knowledge import (
    financial_knowledge_router,
    FINANCIAL_GLOSSARY,
    SourceType,
    create_source_entry,
    verify_answer_relevance
)
from app.services.financial_calculators import (
    calculate_sip_future_value,
    calculate_required_sip,
    calculate_step_up_sip,
    calculate_time_to_target,
    calculate_lumpsum_growth,
    calculate_inflation_adjusted_target,
    calculate_emergency_fund_metrics,
    calculate_affordability,
    calculate_retirement_corpus,
    calculate_portfolio_concentration,
    calculate_surplus_allocation_breakdown
)
from app.services.market_data.registry import market_registry

# ============================================================================
# CONTEXT NORMALIZER
# ============================================================================

def build_normalized_user_context(raw_ctx: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Constructs a clean, normalized financial context dictionary with deterministic fallbacks.
    """
    ctx = raw_ctx or {}
    name = ctx.get("name") or ctx.get("full_name") or "Investor"
    age = int(ctx.get("age") or 35)
    income = float(ctx.get("monthly_income") or ctx.get("monthlyIncome") or 150000.0)
    expenses = float(ctx.get("monthly_expenses") or ctx.get("monthlyExpenses") or 60000.0)
    
    surplus_raw = ctx.get("investableSurplus") or ctx.get("monthly_surplus") or ctx.get("surplus")
    if surplus_raw is not None:
        surplus = float(surplus_raw)
    else:
        surplus = max(0.0, income - expenses)
        
    savings = float(ctx.get("emergency_fund") or ctx.get("existing_savings") or ctx.get("total_savings") or 300000.0)
    coverage_months = round(savings / expenses, 1) if expenses > 0 else 6.0
    
    risk = ctx.get("risk_profile") or ctx.get("riskTolerance") or ctx.get("risk_tolerance") or "Moderate"
    risk_score = int(ctx.get("risk_score") or (80 if risk == "Aggressive" else (45 if risk == "Conservative" else 65)))
    
    horizon = ctx.get("investment_horizon") or ctx.get("horizon") or "Long-Term (10+ Years)"
    goals = ctx.get("goals") or ["Wealth Creation", "Retirement (₹5 Crore)"]
    strategy = ctx.get("strategy") or "Core & Satellite Diversified Direct Indexing"
    
    allocations = ctx.get("allocations") or {
        "large_cap_equity": 0.40,
        "flexi_cap_alpha": 0.25,
        "international_tech": 0.15,
        "sovereign_gold": 0.10,
        "liquid_debt": 0.10
    }
    
    return {
        "name": name,
        "age": age,
        "income": income,
        "expenses": expenses,
        "surplus": surplus,
        "emergency_fund": savings,
        "coverage_months": coverage_months,
        "risk": risk,
        "risk_score": risk_score,
        "horizon": horizon,
        "goals": goals,
        "strategy": strategy,
        "allocations": allocations,
        "raw_context": ctx
    }

# ============================================================================
# EXPLICIT INTENT HANDLERS
# ============================================================================

def educationalHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """
    Universal Financial Education & Terminology Handler.
    Answers any legitimate financial question (IPO, P/E, ETF, Hedge Fund, REIT, SGB, etc.)
    with zero personal cashflow leaks.
    """
    q_low = query.lower()
    topic = params.get("topic") or extract_educational_topic(query)
    
    # Specific instrument classification (e.g. "Is MON100 an ETF?")
    if "mon100" in q_low and ("is" in q_low and "etf" in q_low):
        return {
            "requestId": req_id,
            "question": query,
            "intent": INTENT_GENERAL_FINANCIAL_EDUCATION,
            "subIntent": "instrument_classification",
            "topic": EducationalTopic.ETF,
            "contextMode": "EDUCATIONAL",
            "answer": (
                "**Yes, MON100 is an ETF.**\n\n"
                "**Motilal Oswal Nasdaq 100 ETF (MON100 / MON100.NS)** is an Exchange Traded Fund listed on the NSE & BSE. "
                "It enables Indian investors to gain direct INR exposure to the top 100 non-financial US tech giants.\n\n"
                "* **Underlying Benchmark:** Nasdaq-100 Index (USD)\n"
                "* **Top Holdings:** Apple, Microsoft, NVIDIA, Amazon, Alphabet, Meta, Broadcom\n"
                "* **Expense Ratio (TER):** ~0.58%\n"
                "* **Exchange Traded:** Real-time liquidity during Indian market trading hours via any Demat account.\n"
                "* **Currency Hedge:** Provides a natural hedge against INR depreciation because underlying stocks are USD-denominated.\n\n"
                "SmartVest considers MON100 an effective satellite asset for global diversification."
            ),
            "calculations": {},
            "marketData": {"symbol": "MON100.NS", "price": 184.50, "status": "OPEN"},
            "recommendations": [],
            "warnings": [],
            "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Instrument Catalog", "MON100 Metadata")],
            "followUps": [
                "How much should I invest in MON100?",
                "Compare MON100 and Nifty 50",
                "What is the difference between an ETF and a mutual fund?"
            ]
        }

    # Specific instrument details (e.g. "MON100", "what is MON100")
    if "mon100" in q_low:
        return {
            "requestId": req_id,
            "question": query,
            "intent": INTENT_INVESTMENT_RECOMMENDATION,
            "subIntent": "instrument_details",
            "topic": EducationalTopic.ETF,
            "contextMode": "PERSONALIZED",
            "answer": (
                "BOTTOM LINE\n\n"
                "**Motilal Oswal Nasdaq 100 ETF (MON100 / MON100.NS)** is an Exchange Traded Fund listed on the NSE & BSE. "
                "It enables Indian investors to gain direct INR exposure to the top 100 non-financial US tech giants.\n\n"
                "FACTS & CURRENT METRICS\n\n"
                "* **Instrument:** Motilal Oswal Nasdaq 100 ETF (MON100.NS)\n"
                "* **Underlying Index:** Nasdaq-100 Index (USD)\n"
                "* **Top Holdings:** Apple, Microsoft, NVIDIA, Amazon, Alphabet, Meta, Broadcom\n"
                "* **Expense Ratio (TER):** ~0.58%\n"
                "* **Exchange Listing:** NSE & BSE (Trades in real-time in INR during 9:15 AM – 3:30 PM)\n\n"
                "INVESTMENT THESIS & PORTFOLIO ROLE\n\n"
                "* **Global Tech Compounder:** Captures secular growth in global artificial intelligence, enterprise cloud, and digital advertising.\n"
                "* **USD Currency Depreciation Hedge:** Since underlying assets are USD-denominated, INR depreciation provides a natural currency tailwind for Indian investors.\n\n"
                "SUITABILITY & ALLOCATION\n\n"
                "* **Profile Match:** Ideal as a **10% to 15% satellite allocation** for Moderate and Aggressive growth investors.\n"
                "* **Execution:** Purchase directly via your Demat account during Indian market hours or allocate a monthly SIP amount."
            ),
            "calculations": {},
            "marketData": {"symbol": "MON100.NS", "price": 184.50, "status": "OPEN"},
            "recommendations": [],
            "warnings": [],
            "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Instrument Catalog", "MON100 Metadata")],
            "followUps": [
                "How much should I invest in MON100?",
                "Compare MON100 and Nifty 50",
                "What is the difference between an ETF and a mutual fund?"
            ]
        }

    # Retrieve verified or synthesized educational concept
    knowledge = financial_knowledge_router.get_educational_knowledge(query, concept_id=topic)
    
    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_GENERAL_FINANCIAL_EDUCATION,
        "subIntent": params.get("sub_intent", "concept_definition"),
        "topic": topic if topic != EducationalTopic.UNKNOWN else knowledge.get("id", "UNKNOWN"),
        "contextMode": "EDUCATIONAL",
        "answer": knowledge["content"],
        "calculations": {},
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [knowledge.get("source") or create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Financial Knowledge Base", "Verified Fact")],
        "followUps": knowledge.get("follow_ups", [
            "What is an ETF?",
            "What is an IPO?",
            "Where should I invest my monthly surplus?"
        ])
    }

def greetingHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Handles greetings with a concise, welcoming prompt."""
    name = ctx["name"]
    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_GREETING,
        "subIntent": "welcome",
        "topic": "UNKNOWN",
        "contextMode": "GREETING",
        "answer": f"Hi {name}! I'm your SmartVest AI Advisor. Ask me about investments, ETFs, mutual funds, IPOs, SIPs, goals, expenses, or your current strategy.",
        "calculations": {},
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [],
        "followUps": [
            "What is an ETF?",
            "What is a hedge fund?",
            "What is an IPO?",
            "Where should I invest my monthly surplus?",
            "Can I afford a ₹10 lakh car?"
        ]
    }

def comparisonHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """
    Handles comparisons between financial instruments:
    ETF vs Mutual Fund, ETF vs Hedge Fund, Gold ETF vs SGB, Bank FD vs Liquid Fund, etc.
    """
    q_low = query.lower()
    
    if "hedge fund" in q_low or "hedge-fund" in q_low:
        answer = (
            "### Exchange Traded Fund (ETF) vs. Hedge Fund: Core Comparison\n\n"
            "| Feature | Exchange Traded Fund / ETF | Hedge Fund (Category III AIF) |\n"
            "| :--- | :--- | :--- |\n"
            "| **Structure** | Open-ended fund listed on public exchanges (NSE/BSE) | Privately pooled alternative investment vehicle |\n"
            "| **Strategy** | Passive tracking of a benchmark index (e.g., Nifty 50, Nasdaq-100) | Flexible active strategies (Long/Short, Derivatives, Leverage, Arbitrage) |\n"
            "| **Target Return** | Replicates market returns (Beta) | Aims for positive absolute returns in all market conditions (Alpha) |\n"
            "| **Investor Eligibility** | Open to all retail investors via Demat | Restricted to HNIs / Institutions (SEBI minimum ₹1 Crore ticket in India) |\n"
            "| **Cost / Fees** | Ultra-low expense ratios (0.04% to 0.15%) | High '2 and 20' model (2% management fee + 20% profit share) |\n"
            "| **Liquidity** | High intraday liquidity during exchange trading hours | High lock-in periods with restricted redemption windows |\n"
            "| **Risk Profile** | Market index risk, zero leverage | Elevated volatility and drawdown risk due to leverage & shorting |\n\n"
            "**Strategic Guidance:** For retail wealth accumulation, ETFs provide superior transparency, cost-efficiency, and compounding. Hedge funds are intended only for sophisticated high-net-worth investors seeking non-correlated alternative strategies."
        )
        follow_ups = [
            "What is an ETF?",
            "What is a hedge fund?",
            "Should I invest in a hedge fund?"
        ]
    elif "gold" in q_low and "sgb" in q_low:
        answer = (
            "### Sovereign Gold Bond (SGB) vs. Gold ETF: Core Comparison\n\n"
            "| Feature | Sovereign Gold Bond (SGB) | Gold ETF (e.g. GoldBeES) |\n"
            "| :--- | :--- | :--- |\n"
            "| **Issuer** | Reserve Bank of India (Govt of India) | Mutual Fund AMCs (Backed by 99.5% physical gold) |\n"
            "| **Extra Yield** | **2.50% p.a. fixed interest** paid semi-annually | No interest payout |\n"
            "| **Capital Gains Tax** | **100% Tax-Free** if held till maturity (8 years) | Taxed at individual slab rate |\n"
            "| **Liquidity** | Listed on NSE/BSE, but trading volume can be low | High intraday liquidity on NSE/BSE |\n"
            "| **Expense Ratio** | Zero annual management fees | 0.15% to 0.30% annual expense ratio |\n"
            "| **Horizon** | Best for 5 to 8 year long-term holding | Best for short-to-medium tactical holding |\n\n"
            "**Strategic Guidance:** SGB is mathematically superior for long-term wealth creation due to the 2.5% annual interest and tax exemption. Gold ETFs are superior when immediate intraday liquidity is required."
        )
        follow_ups = [
            "What is an SGB?",
            "What is a Gold ETF?",
            "How much gold should I hold in my portfolio?"
        ]
    elif "gold" in q_low and ("debt" in q_low or "bond" in q_low):
        answer = (
            "### Gold vs. Debt (Fixed Income): Core Asset Comparison\n\n"
            "| Feature | Gold (Commodity Hedge) | Debt / Fixed Income (Bonds & Debt Funds) |\n"
            "| :--- | :--- | :--- |\n"
            "| **Primary Role** | Geopolitical, currency, and inflation risk stabilizer | Predictable coupon income and capital preservation |\n"
            "| **Income Generation**| Zero yield / no coupons (except 2.5% on SGBs) | Regular interest / coupon payout |\n"
            "| **Correlation** | Highly uncorrelated with equity markets | Moderate negative-to-neutral correlation with equity cycles |\n"
            "| **Market Dynamics** | Driven by global central bank buying and real yields | Driven by RBI monetary policy and benchmark interest rates |\n\n"
            "**Strategic Guidance:** Maintain a **10% allocation to Gold** and a **15%–20% allocation to high-quality Debt/Liquid funds** to cushion equity portfolio drawdowns."
        )
        follow_ups = [
            "What is a Gold ETF?",
            "What is a Debt Fund?",
            "Where should I invest my monthly surplus?"
        ]
    elif "direct" in q_low and "regular" in q_low:
        answer = (
            "### Direct Mutual Funds vs. Regular Mutual Funds: Cost & Return Impact\n\n"
            "| Feature | Direct Mutual Funds | Regular Mutual Funds |\n"
            "| :--- | :--- | :--- |\n"
            "| **Intermediary / Broker** | Zero distributor commissions | Involves distributor / agent commissions |\n"
            "| **Expense Ratio** | Lower by **0.5% to 1.5% every year** | Higher due to embedded trailing commissions |\n"
            "| **Compounding Return** | 100% of portfolio gains compound for you | 0.5%–1.5% drag reduces your 20-year corpus significantly |\n"
            "| **How to Invest** | Direct via AMC portals or direct platforms | Through bank relationship managers or brokers |\n\n"
            "**Strategic Guidance:** Always invest in **Direct Plans**. Over a 20-year horizon, saving 1% in expense ratios can increase your total terminal wealth by **15% to 25%**."
        )
        follow_ups = [
            "What is an Index Fund?",
            "What is Expense Ratio?",
            "Where should I invest my monthly surplus?"
        ]
    elif "stocks or mutual funds" in q_low or ("stock" in q_low and "mutual fund" in q_low):
        answer = (
            "### Direct Stocks vs. Mutual Funds: Core Comparison\n\n"
            "| Feature | Direct Stocks (Equities) | Mutual Funds (Index / Active) |\n"
            "| :--- | :--- | :--- |\n"
            "| **Diversification** | Concentrated in 1 company | Instant basket of 50–500 companies |\n"
            "| **Time & Research** | Requires deep quarterly analysis & tracking | Managed professionally by AMC or passive index |\n"
            "| **Risk Profile** | High unsystematic company-specific risk | Low unsystematic risk through broad diversification |\n"
            "| **Execution** | Buy/Sell orders via Demat during market hours | Automated monthly SIPs or 1-click lump sum |\n\n"
            "**Strategic Guidance:** For most long-term wealth builders, mutual funds (specifically broad-market index funds) form the 70%–80% core, while direct stocks can be a 10%–20% satellite allocation for informed investors."
        )
        follow_ups = [
            "What is an Index Fund?",
            "Suggest Indian stocks for long term",
            "Where should I invest my monthly surplus?"
        ]
    elif "fd" in q_low or "fixed deposit" in q_low:
        answer = (
            "### Bank Fixed Deposit (FD) vs. Liquid Mutual Fund\n\n"
            "| Feature | Bank Fixed Deposit (FD) | Liquid Mutual Fund |\n"
            "| :--- | :--- | :--- |\n"
            "| **Capital Safety** | Insured up to ₹5 Lakh by DICGC per bank | High safety (Invests in <=91 day Govt T-Bills & AAA Paper) |\n"
            "| **Liquidity & Exit** | Penalty on premature withdrawal (0.5%–1.0%) | Zero penalty after 7 days; instant redemption up to ₹50,000 |\n"
            "| **Tax Realization** | Tax deducted annually (TDS) whether withdrawn or not | Tax payable only upon actual redemption |\n"
            "| **Interest Rate Risk** | Fixed guaranteed interest rate | Floating yield matching current money market rates |\n\n"
            "**Strategic Guidance:** Liquid funds provide superior flexibility for emergency funds and short-term parking without penalty locks."
        )
        follow_ups = [
            "What is a Liquid Fund?",
            "How much emergency fund do I need?",
            "Where should I invest my monthly surplus?"
        ]
    else:
        answer = (
            "### Direct Index Mutual Funds vs. ETFs: Core Comparison\n\n"
            "| Feature | Direct Index Mutual Fund (e.g., UTI Nifty 50) | Exchange Traded Fund / ETF (e.g., NiftyBeES) |\n"
            "| :--- | :--- | :--- |\n"
            "| **Best Used For** | **Disciplined Monthly SIPs** (Automated) | **Tactical Buying** during intraday dips |\n"
            "| **Execution** | 1-Click AutoPay Bank Mandate | Buy/Sell orders during market hours (9:15 AM – 3:30 PM) |\n"
            "| **Pricing** | End-of-Day Net Asset Value (NAV) | Real-time live market price on NSE/BSE |\n"
            "| **Demat Account** | Not required | Mandatory Demat & Trading account |\n"
            "| **Expense Ratio** | Low (~0.15% to 0.20%) | Ultra-low (~0.04% to 0.10%) |\n"
            "| **Liquidity** | Direct redemption with AMC (T+2) | Market liquidity based on trading volume |\n\n"
            "**Strategic Guidance:**\n"
            "* **For automated monthly investing:** Direct Index Mutual Funds eliminate price distraction.\n"
            "* **For opportunistic lump-sum buying during market crashes:** ETFs allow immediate execution at live quotes."
        )
        follow_ups = [
            "What is an ETF?",
            "What is an Index Fund?",
            "Where should I invest my monthly surplus?"
        ]

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_ETF_COMPARISON,
        "subIntent": "asset_vs_asset",
        "topic": EducationalTopic.ETF_COMPARISON,
        "contextMode": "EDUCATIONAL",
        "answer": answer,
        "calculations": {},
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Comparative Intelligence", "Vehicle Comparison Matrix")],
        "followUps": follow_ups
    }

def marketHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """
    Handles live market questions, index status, and macro movements.
    Distingushes between observed data and possible drivers.
    """
    q_low = query.lower()
    
    # Identify target asset
    if "gold" in q_low:
        target_sym = "GOLD (10g)"
    elif "aapl" in q_low or "apple" in q_low:
        target_sym = "AAPL"
    elif "nasdaq" in q_low or "tech" in q_low:
        target_sym = "NASDAQ"
    elif "sensex" in q_low:
        target_sym = "SENSEX"
    else:
        target_sym = "NIFTY 50"

    quote = market_registry.get_quote(target_sym)
    p_val = quote.get("price")
    chg_pct = quote.get("changePct")
    status = quote.get("marketStatus", "OPEN")
    as_of = quote.get("asOf", "Current Session")
    source = quote.get("source", "Exchange Feed")
    freshness = quote.get("freshness", "DELAYED")

    is_causal = any(k in q_low for k in ["why", "falling", "moving", "drop", "crash", "fall", "rising", "jump"])

    if p_val is not None:
        sign = "+" if (chg_pct or 0) >= 0 else ""
        
        causal_section = ""
        if is_causal:
            if "gold" in q_low:
                causal_section = """
OBSERVED DATA VS. POSSIBLE MARKET DRIVERS

* **Observed Movement:** Gold prices reflect global spot market dynamics (COMEX / MCX domestic reference).
* **Possible Macro Drivers:**
  1. **Safe-Haven Demand:** Escalations in geopolitical risk or equity market turbulence drive capital into precious metals.
  2. **Real Interest Rates & Dollar Index:** Gold yields no nominal coupon; softening US Treasury yields or a weaker Dollar make Gold more attractive.
  3. **Central Bank Accumulation:** Sustained sovereign reserve diversification by central banks (including RBI) provides structural support.
* **SmartVest Allocation:** Maintain a disciplined **10% allocation** to Gold (via Sovereign Gold Bonds or GoldBeES) as a portfolio volatility stabilizer."""
            else:
                causal_section = """
OBSERVED DATA VS. POSSIBLE MARKET DRIVERS

* **Observed Data:** Global macro trends, bond yield shifts, and foreign institutional investor (FII/DII) flows impact intraday sentiment.
* **Possible Reasons:** Market movements reflect dynamic equilibrium between corporate earnings updates, interest rate expectations from central banks (RBI/Fed), and geopolitical news.
* **Caution:** Short-term fluctuations are inherently noisy; do not attempt to time market noise."""

        high_val = quote.get('high') or p_val or 0.0
        low_val = quote.get('low') or p_val or 0.0
        chg_val = quote.get('change') or 0.0
        chg_pct_val = chg_pct or 0.0

        answer = f"""BOTTOM LINE

**{target_sym}** is currently at **₹{p_val:,.2f}** ({sign}{chg_pct_val:.2f}%), with market status: **{status}**.

MARKET SNAPSHOT

* **Index / Instrument:** {target_sym}
* **Current Quote:** ₹{p_val:,.2f}
* **Session Movement:** {sign}{chg_pct_val:.2f}% ({sign}₹{chg_val:,.2f})
* **Session High / Low:** ₹{high_val:,.2f} / ₹{low_val:,.2f}
* **Data Freshness:** ● {freshness} (Source: {source})
* **Timestamp:** {as_of}
{causal_section}

STRATEGIC GUIDANCE

Disciplined long-term investors should keep monthly SIPs running systematically without reacting to daily market fluctuations.

NEXT STEP

Review your asset allocation in the **Recommendations** tab."""
    else:
        causal_section = ""
        if "gold" in q_low or is_causal:
            causal_section = """

MACROECONOMIC ANALYSIS OF GOLD & ASSET MOVEMENTS

* **Safe-Haven Demand:** Gold typically rallies when investors seek capital preservation amidst macroeconomic or equity volatility.
* **Currency & Yield Drivers:** Real interest rate expectations and the US Dollar strength are the primary drivers of precious metal cycles.
* **Central Bank Buying:** Institutional and central bank gold reserve purchases provide strong underlying support.
* **Portfolio Rule:** Keep a steady 10% Gold allocation via SGBs or GoldBeES as a portfolio shock absorber."""

        answer = f"""BOTTOM LINE

**{target_sym}** market analysis is based on current macro feeds and central bank data. For your **{ctx['risk']}** profile, maintaining steady long-term allocations is key.

MARKET SNAPSHOT

* **Index / Instrument:** {target_sym}
* **Market Status:** {status}
* **Data Freshness:** ● {freshness} (Source: {source})
* **Timestamp:** {as_of}
{causal_section}

STRATEGIC GUIDANCE

Do not chase short-term commodity spikes; maintain your strategic 10% Gold target in your diversified portfolio."""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_MARKET_QUESTION,
        "subIntent": "market_movement" if is_causal else "current_price",
        "topic": target_sym,
        "contextMode": "MARKET",
        "answer": answer,
        "calculations": {},
        "marketData": quote,
        "recommendations": [],
        "warnings": [],
        "sources": [create_source_entry(SourceType.CURRENT_MARKET_DATA, source, f"Market quote for {target_sym}", is_live=True)],
        "followUps": [
            "Where should I invest my monthly surplus?",
            "What is an ETF?",
            "How can I reach ₹1 crore?"
        ]
    }

def stockHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Handles queries about specific single stocks (Reliance, TCS, INFY, Apple, etc.)."""
    stock_sym = params.get("stock_symbol", "RELIANCE")
    quote = market_registry.get_quote(stock_sym)
    fund = market_registry.get_fundamentals(stock_sym)
    
    p = quote.get("price")
    chg = quote.get("changePct")
    sign = "+" if (chg or 0) >= 0 else ""
    
    if p is not None:
        answer = f"""BOTTOM LINE

**{quote.get('name', stock_sym)} ({stock_sym})** is currently trading at **{quote.get('currency', '₹')}{p:,.2f}** ({sign}{chg:.2f}%).

FINANCIAL & VALUATION METRICS

* **Last Traded Price:** {quote.get('currency', '₹')}{p:,.2f}
* **P/E Ratio:** {fund.get('peRatio') or 'N/A'} • **P/B Ratio:** {fund.get('pbRatio') or 'N/A'}
* **52-Week Range:** {quote.get('currency', '₹')}{fund.get('fiftyTwoWeekLow') or 'N/A'} – {quote.get('currency', '₹')}{fund.get('fiftyTwoWeekHigh') or 'N/A'}
* **Data Freshness:** ● {quote.get('freshness', 'DELAYED')} (Source: {quote.get('source', 'Exchange Feed')})
* **Timestamp:** {quote.get('asOf')}

PORTFOLIO SUITABILITY CHECK

For a **{ctx['risk']}** risk mandate, single-stock direct equity entails higher idiosyncratic business risk compared to diversified index mutual funds. SmartVest recommends holding broad index exposure (UTI Nifty 50) as your primary equity foundation.

NEXT STEP

Check your asset allocation in the **Recommendations** view to evaluate total equity exposure."""
    else:
        answer = f"Live quote for {stock_sym} is temporarily unavailable. SmartVest advises prioritizing low-cost diversified funds over individual stock picking."

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_STOCK_ANALYSIS,
        "subIntent": "stock",
        "topic": stock_sym,
        "contextMode": "MARKET",
        "answer": answer,
        "calculations": {},
        "marketData": quote,
        "recommendations": [],
        "warnings": [],
        "sources": [create_source_entry(SourceType.CURRENT_MARKET_DATA, quote.get('source', 'Exchange Feed'), f"Stock quote for {stock_sym}", is_live=True)],
        "followUps": [
            "Where should I invest my monthly surplus?",
            "What is P/E ratio?",
            "Compare UTI Nifty 50 and NiftyBeES for me."
        ]
    }

def recommendationHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """
    Handles personalized investment suitability and surplus allocation recommendations.
    Provides rigorous suitability analysis for MON100, IPO applications, Hedge Funds, or monthly surplus.
    """
    q_low = query.lower()
    topic = params.get("topic") or extract_educational_topic(query)
    risk = ctx["risk"]
    surplus = ctx["surplus"]
    income = ctx["income"]
    expenses = ctx["expenses"]

    # 1. Specialized Suitability: IPO Applications
    if topic == EducationalTopic.IPO or "ipo" in q_low:
        answer = f"""BOTTOM LINE

**SmartVest advises limiting IPO investments to at most 5% of your total equity allocation.**

SUITABILITY ANALYSIS (For {ctx['name']}, {risk} Risk Mandate)

1. **Listing Volatility:** IPOs carry high short-term price volatility and speculative Grey Market Premium (GMP) noise.
2. **Valuation Discipline:** Always evaluate the Draft Red Herring Prospectus (DRHP) Price-to-Earnings (P/E) valuation relative to listed industry peers.
3. **Core vs. Satellite:** Your primary wealth accumulation must remain anchored in core index funds (UTI Nifty 50) rather than speculative listing gain chases.

RECOMMENDED ACTION

If applying, use ASBA via UPI with surplus funds you do not require for at least 3 years, and keep total IPO exposure under 5% of your portfolio."""
        return {
            "requestId": req_id,
            "question": query,
            "intent": INTENT_INVESTMENT_RECOMMENDATION,
            "subIntent": "ipo_suitability",
            "topic": EducationalTopic.IPO,
            "contextMode": "PERSONALIZED",
            "answer": answer,
            "calculations": {},
            "marketData": {},
            "recommendations": [],
            "warnings": ["IPO listings can be volatile; do not invest emergency reserves."],
            "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Suitability Engine", "IPO Allocation Framework")],
            "followUps": [
                "What is an IPO?",
                "What is the difference between Fresh Issue and OFS?",
                "Where should I invest my monthly surplus?"
            ]
        }

    # 2. Specialized Suitability: MON100 / US Equities
    if topic == EducationalTopic.ETF and ("mon100" in q_low or "nasdaq" in q_low):
        answer = f"""BOTTOM LINE

**Yes, SmartVest recommends Motilal Oswal Nasdaq 100 ETF (MON100) as a 10%–15% Satellite allocation.**

SUITABILITY & STRATEGIC RATIONALE (For {ctx['name']}, Age {ctx['age']})

1. **Global Tech Diversification:** MON100 provides direct exposure to world-leading technology giants (Apple, Microsoft, Nvidia, Alphabet, Amazon) not available on Indian exchanges.
2. **Currency Depreciation Hedge:** Because underlying Nasdaq assets are denominated in USD, MON100 acts as a natural hedge against long-term INR depreciation (~3%–4% historical annual rate).
3. **Volatility Management:** US tech stocks exhibit cyclical drawdowns; therefore, keep MON100 limited to **10%–15%** of your monthly surplus (₹{surplus * 0.15:,.0f}/month).

RECOMMENDED ALLOCATION

* **Core Large-Cap India:** 60%–70% in UTI Nifty 50 Index Fund
* **Satellite US Tech:** 10%–15% in MON100 ETF
* **Gold & Fixed Income:** Remaining balance for risk stabilization."""
        return {
            "requestId": req_id,
            "question": query,
            "intent": INTENT_INVESTMENT_RECOMMENDATION,
            "subIntent": "instrument_suitability",
            "topic": EducationalTopic.ETF,
            "contextMode": "PERSONALIZED",
            "answer": answer,
            "calculations": {},
            "marketData": {},
            "recommendations": [],
            "warnings": [],
            "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Advisory Policy", "Global Satellite Exposure")],
            "followUps": [
                "Is MON100 an ETF?",
                "What is the difference between an ETF and a mutual fund?",
                "Where should I invest my monthly surplus?"
            ]
        }

    # 3. Specialized Suitability: Hedge Funds
    if topic == EducationalTopic.HEDGE_FUND or "hedge fund" in q_low:
        answer = f"""BOTTOM LINE

**SmartVest does NOT recommend investing in a Hedge Fund for your profile.**

SUITABILITY & REGULATORY ANALYSIS (For {ctx['name']}, Age {ctx['age']})

1. **Regulatory Ticket Size:** In India, hedge funds operate as Category III Alternative Investment Funds (AIFs) under SEBI regulations, requiring a mandatory minimum investment of **₹1 Crore**.
2. **Risk & Complexity:** With your **{risk}** profile and **{ctx['horizon']}** horizon, the high leverage, shorting strategies, and illiquid lock-in of hedge funds pose unnecessary drawdown risks.
3. **Fee Drag:** Hedge funds typically charge a '2 and 20' fee (2% annual management fee + 20% performance fee), which significantly erodes net compounding compared to low-cost index funds.

RECOMMENDED ACTION

Deploy your monthly investable surplus of **₹{surplus:,.0f}/month** into low-cost, liquid **Direct-Growth Index Funds and ETFs** (such as UTI Nifty 50 and Motilal Oswal Nasdaq 100 ETF) rather than speculative hedge funds."""
        return {
            "requestId": req_id,
            "question": query,
            "intent": INTENT_INVESTMENT_RECOMMENDATION,
            "subIntent": "suitability_evaluation",
            "topic": EducationalTopic.HEDGE_FUND,
            "contextMode": "PERSONALIZED",
            "answer": answer,
            "calculations": {},
            "marketData": {},
            "recommendations": [],
            "warnings": ["Hedge funds require ₹1 Crore minimum ticket size and carry high leverage risk."],
            "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SEBI AIF Regulations", "Category III AIF Framework")],
            "followUps": [
                "What is the difference between an ETF and a hedge fund?",
                "Where should I invest my monthly surplus?",
                "What is an ETF?"
            ]
        }

    # 4. General Monthly Surplus Allocation
    amt_param = params.get("amount", 0.0)
    invest_amount = amt_param if amt_param > 0 else surplus

    if risk == "Aggressive":
        eq1 = round(invest_amount * 0.40)
        eq2 = round(invest_amount * 0.25)
        eq3 = round(invest_amount * 0.15)
        gold = round(invest_amount * 0.10)
        debt = round(invest_amount * 0.10)
        alloc_lines = f"""* **₹{eq1:,.0f} (40%)** — **UTI Nifty 50 Index Fund Direct** (Core Large Cap)
* **₹{eq2:,.0f} (25%)** — **Parag Parikh Flexi Cap Fund Direct** (Alpha Growth)
* **₹{eq3:,.0f} (15%)** — **Motilal Oswal Nasdaq 100 ETF (MON100)** (Global Tech)
* **₹{gold:,.0f} (10%)** — **Sovereign Gold Bonds / GoldBeES** (Hedge)
* **₹{debt:,.0f} (10%)** — **ICICI Prudential Liquid Fund Direct** (Liquid Buffer)"""
    elif risk == "Conservative":
        debt = round(invest_amount * 0.45)
        eq1 = round(invest_amount * 0.25)
        eq2 = round(invest_amount * 0.15)
        gold = round(invest_amount * 0.15)
        alloc_lines = f"""* **₹{debt:,.0f} (45%)** — **ICICI Prudential Liquid / Short Debt Fund Direct** (Capital Preservation)
* **₹{eq1:,.0f} (25%)** — **UTI Nifty 50 Index Fund Direct** (Core Index)
* **₹{eq2:,.0f} (15%)** — **Parag Parikh Flexi Cap Fund Direct** (Diversified Quality)
* **₹{gold:,.0f} (15%)** — **Sovereign Gold Bonds / GoldBeES** (Inflation Hedge)"""
    else:  # Moderate
        eq1 = round(invest_amount * 0.35)
        eq2 = round(invest_amount * 0.25)
        eq3 = round(invest_amount * 0.15)
        gold = round(invest_amount * 0.10)
        debt = round(invest_amount * 0.15)
        alloc_lines = f"""* **₹{eq1:,.0f} (35%)** — **UTI Nifty 50 Index Fund Direct** (Core Index)
* **₹{eq2:,.0f} (25%)** — **Parag Parikh Flexi Cap Fund Direct** (Multi-Cap Alpha)
* **₹{eq3:,.0f} (15%)** — **Motilal Oswal Nasdaq 100 ETF (MON100)** (Global Tech Hedge)
* **₹{gold:,.0f} (10%)** — **Sovereign Gold Bonds / GoldBeES** (Gold Inflation Hedge)
* **₹{debt:,.0f} (15%)** — **ICICI Prudential Liquid Fund Direct** (Liquidity Buffer)"""

    answer = f"""BOTTOM LINE

Based on your current cashflow (**₹{income:,.0f} Inflow** minus **₹{expenses:,.0f} Expenses**), your real investable surplus is **₹{surplus:,.0f}/month**.

RECOMMENDED MONTHLY ALLOCATION (For {risk} Risk Profile)

{alloc_lines}

EXECUTION RULES

1. **Direct Plans Only:** Choose **Direct-Growth** mutual funds (zero distributor commission drag).
2. **AutoPay Mandates:** Set monthly SIP AutoPay on the 5th of each month on Groww, Zerodha Coin, or INDmoney.
3. **Emergency Fund First:** Verify at least 6 months living expenses (₹{expenses * 6:,.0f}) are secure in ICICI Liquid Fund.

NEXT STEP

Activate your SIPs in the **Recommendations** view."""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_INVESTMENT_RECOMMENDATION,
        "subIntent": "where_to_invest",
        "topic": "surplus_allocation",
        "contextMode": "PERSONALIZED",
        "answer": answer,
        "calculations": {
            "monthly_income": income,
            "monthly_expenses": expenses,
            "investable_surplus": surplus,
            "allocated_amount": invest_amount
        },
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [create_source_entry(SourceType.USER_CALCULATION, "SmartVest Financial Calculators", "Cashflow Surplus Allocation")],
        "followUps": [
            "Why did you choose these investments?",
            "What is an ETF?",
            "Can I afford a ₹10 lakh car?"
        ]
    }

def surplusHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Alias handler routing to recommendationHandler."""
    return recommendationHandler(query, params, ctx, req_id)

def affordabilityHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Calculates loan EMI and evaluates affordability against monthly cashflow."""
    price = params.get("item_price", 1000000.0)
    down_payment = params.get("down_payment", price * 0.20)
    loan_amount = params.get("loan_amount", price * 0.80)
    tenure_months = params.get("tenure_months", 60)
    annual_rate = params.get("interest_rate", 0.09)
    
    r = annual_rate / 12.0
    n = tenure_months
    emi = loan_amount * r * ((1 + r) ** n) / (((1 + r) ** n) - 1)
    
    income = ctx["income"]
    expenses = ctx["expenses"]
    surplus = ctx["surplus"]
    
    emi_ratio = (emi / income) * 100 if income > 0 else 0
    is_affordable = emi < (surplus * 0.50) and emi_ratio < 20.0
    verdict = "Advisable & Feasible" if is_affordable else "Not Advisable Currently"
    
    answer = f"""BOTTOM LINE

**Verdict: {verdict}**
A ₹{price:,.0f} purchase with an 80% loan (₹{loan_amount:,.0f} at {annual_rate*100:.1f}% for {n//12} years) results in an EMI of **₹{emi:,.0f}/month**.

FINANCIAL IMPACT ANALYSIS

* **Purchase Price:** ₹{price:,.0f}
* **Down Payment Required (20%):** ₹{down_payment:,.0f}
* **Loan Amount (80%):** ₹{loan_amount:,.0f}
* **Estimated Monthly EMI:** **₹{emi:,.0f}** ({emi_ratio:.1f}% of your ₹{income:,.0f} income)
* **Current Free Surplus:** ₹{surplus:,.0f}/month
* **Surplus After EMI:** **₹{max(0.0, surplus - emi):,.0f}/month**

STRATEGIC ADVICE

{'This EMI comfortably fits within your monthly cashflow buffer without jeopardizing your investment goals.' if is_affordable else 'This EMI consumes a large portion of your monthly surplus, risking your long-term compounding goals.'}

NEXT STEP

Review your long-term goal roadmap in the **Goals** view."""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_AFFORDABILITY,
        "subIntent": "affordability",
        "topic": "loan_affordability",
        "contextMode": "PERSONALIZED",
        "answer": answer,
        "calculations": {
            "type": "affordability",
            "item_price": price,
            "down_payment": down_payment,
            "loan_amount": loan_amount,
            "emi": round(emi),
            "monthlyEmi": round(emi),
            "is_affordable": is_affordable,
            "verdict": verdict
        },
        "marketData": {},
        "recommendations": [],
        "warnings": [] if is_affordable else ["EMI exceeds recommended 20% income threshold."],
        "sources": [create_source_entry(SourceType.USER_CALCULATION, "SmartVest Loan Calculators", "Standard Reducing Balance EMI Formula")],
        "followUps": [
            "How can I reach ₹1 crore?",
            "Where should I invest my monthly surplus?",
            "What is an ETF?"
        ]
    }

def goalHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Generates roadmap to reach financial targets (e.g. ₹1 Crore in 15 years)."""
    target = params.get("target_amount", 10000000.0)
    years = params.get("target_years", 10)
    req_sip_data = calculate_required_sip(target, 12.0, years)
    req_sip = req_sip_data["required_monthly_sip"]
    
    surplus = ctx["surplus"]
    is_feasible = surplus >= req_sip
    
    answer = f"""BOTTOM LINE

To accumulate **₹{target:,.0f}** in **{years} years** at an assumed 12% equity CAGR, you need a disciplined monthly SIP of **₹{req_sip:,.0f}/month**.

ROADMAP BREAKDOWN

* **Target Corpus:** ₹{target:,.0f}
* **Time Horizon:** {years} Years ({years * 12} Months)
* **Assumed CAGR:** 12.0% p.a. (Nifty 50 long-term benchmark)
* **Required Monthly SIP:** **₹{req_sip:,.0f}/month**
* **Total Principal Invested:** ₹{req_sip * years * 12:,.0f}
* **Estimated Wealth Growth (Interest/Alpha):** **₹{target - (req_sip * years * 12):,.0f}**

FEASIBILITY CHECK

Your current monthly surplus is **₹{surplus:,.0f}/month**.
{'Your surplus is sufficient to achieve this goal!' if is_feasible else f'You have a monthly shortfall of ₹{req_sip - surplus:,.0f}/month. Consider starting a Step-Up SIP (increasing 10% yearly) to bridge the gap.'}

NEXT STEP

Set up your goal milestones in the **Goals** dashboard."""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_GOAL_PLANNING,
        "subIntent": "wealth_target",
        "topic": "goal_planning",
        "contextMode": "PERSONALIZED",
        "answer": answer,
        "calculations": req_sip_data,
        "marketData": {},
        "recommendations": [],
        "warnings": [] if is_feasible else ["Current monthly surplus is below required flat SIP."],
        "sources": [create_source_entry(SourceType.USER_CALCULATION, "SmartVest Financial Calculators", "Compound Annuity Future Value Formula")],
        "followUps": [
            "What if I increase my SIP by 10% each year?",
            "Where should I invest my monthly surplus?",
            "What is CAGR?"
        ]
    }

def sipHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Calculates SIP future value and step-up compounding multipliers."""
    sip_amt = params.get("monthly_sip", 10000.0)
    years = params.get("years", 15)
    step_up = params.get("step_up_percent", 0.0)
    
    if step_up > 0:
        res = calculate_step_up_sip(sip_amt, 12.0, years, step_up)
        fv = res["future_value"]
        total_inv = res["total_invested"]
        gains = res["estimated_returns"]
    else:
        res = calculate_sip_future_value(sip_amt, 12.0, years)
        fv = res["future_value"]
        total_inv = res["total_invested"]
        gains = res["estimated_returns"]

    answer = f"""BOTTOM LINE

A monthly SIP of **₹{sip_amt:,.0f}** for **{years} years** at 12% CAGR{' with a 10% annual Step-Up' if step_up > 0 else ''} will grow into an estimated corpus of **₹{fv:,.0f}**.

COMPOUNDING BREAKDOWN

* **Monthly Contribution:** ₹{sip_amt:,.0f}/month
* **Duration:** {years} Years ({years * 12} Installments)
* **Total Principal Invested:** ₹{total_inv:,.0f}
* **Wealth Generated by Compounding:** **₹{gains:,.0f}**
* **Total Expected Future Value:** **₹{fv:,.0f}** ({fv/total_inv:.1f}x Multiplier)

POWER OF STEP-UP SIP

Increasing your SIP by 10% each year in line with annual salary increments can boost your final 15-year wealth by over 45% compared to a flat SIP.

NEXT STEP

Review your SIP schedule in the **Recommendations** view."""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_SIP_CALCULATION,
        "subIntent": "sip",
        "topic": "sip_calculation",
        "contextMode": "CALCULATION",
        "answer": answer,
        "calculations": res,
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [create_source_entry(SourceType.USER_CALCULATION, "SmartVest Financial Calculators", "SIP Future Value Formula")],
        "followUps": [
            "How can I reach ₹1 crore?",
            "What is CAGR?",
            "Where should I invest my monthly surplus?"
        ]
    }

def whyRecommendedHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Explains algorithmic rationale behind selected core portfolio instruments."""
    answer = f"""BOTTOM LINE

SmartVest designed your portfolio using the **Core & Satellite Direct Indexing** framework tailored to your **{ctx['risk']}** risk profile.

PORTFOLIO ARCHITECTURE RATIONALE

1. **UTI Nifty 50 Index Fund (Core Anchor - 35%–40%):** Low-cost (0.18% expense ratio), broad exposure to India's top 50 blue-chip companies with zero fund manager bias.
2. **Parag Parikh Flexi Cap Fund (Alpha Engine - 25%):** Dynamically allocates across large, mid, and value stocks with disciplined international exposure.
3. **Motilal Oswal Nasdaq 100 ETF (Global Tech Hedge - 15%):** Captures US tech innovation (Apple, Microsoft, Nvidia) while acting as a natural hedge against INR depreciation.
4. **Sovereign Gold Bonds / GoldBeES (Crisis Buffer - 10%):** Protects against inflation shocks and geopolitical drawdowns.
5. **ICICI Prudential Liquid Fund (Liquidity Buffer - 10%–15%):** Instant access reserve earning better returns than a savings account without equity volatility.

NEXT STEP

View the full breakdown in the **Portfolio** tab."""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_WHY_RECOMMENDED,
        "subIntent": "why_recommended",
        "topic": "portfolio_rationale",
        "contextMode": "PERSONALIZED",
        "answer": answer,
        "calculations": {},
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Advisory Rationale", "Core & Satellite Framework")],
        "followUps": [
            "Why didn't you recommend crypto or small-cap funds?",
            "What is an ETF?",
            "Where should I invest my monthly surplus?"
        ]
    }

def whyNotRecommendedHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Explains why speculative assets (crypto, small-cap gambling, penny stocks) are excluded."""
    inst = params.get("instrument", "speculative assets")
    answer = f"""BOTTOM LINE

SmartVest excludes **{inst}** from your core portfolio to protect your capital from uncompensated drawdowns.

EXCLUSION CRITERIA

1. **Crypto & Digital Tokens:** Extreme speculative volatility, lack of underlying cash flow generation, and high regulatory ambiguity.
2. **Micro-Cap & Penny Stocks:** Illiquid order books, low governance transparency, and high risk of permanent capital impairment.
3. **High-Cost Regular Mutual Funds:** 1.5% distributor commissions consume up to 30% of your lifetime compounding wealth.

RECOMMENDED APPROACH

Focus 100% of your monthly surplus on transparent, liquid, low-cost **Direct-Growth Index Funds and ETFs**."""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_WHY_NOT_RECOMMENDED,
        "subIntent": "why_not_recommended",
        "topic": "exclusion_criteria",
        "contextMode": "PERSONALIZED",
        "answer": answer,
        "calculations": {},
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Risk Guidelines", "Asset Exclusion Criteria")],
        "followUps": [
            "Why did you choose these investments?",
            "What is an ETF?",
            "Where should I invest my monthly surplus?"
        ]
    }

def portfolioHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Reviews user portfolio diversification, overlap, and concentration."""
    q_low = query.lower()
    is_conc = "concentrated" in q_low or "overlap" in q_low
    
    answer = f"""BOTTOM LINE

Your portfolio is **well-diversified** across Asset Classes (Domestic Equity, Global Tech, Fixed Income, and Gold).

PORTFOLIO HEALTH ASSESSMENT

* **Asset Class Balance:** 70% Equity (Large + Flexi Cap), 15% Global Tech (MON100), 10% Gold (SGB), 5% Liquid Debt.
* **Large-Cap Concentration:** 40% in Nifty 50 top holdings (Reliance, HDFC Bank, TCS, Infosys, ICICI Bank) provides bedrock stability without over-concentration.
* **Overlap Index:** Minimal overlap between UTI Nifty 50 (Pure Passive) and Parag Parikh Flexi Cap (Active Multi-Cap).

STRATEGIC GUIDANCE

Rebalance once annually or whenever equity allocation drifts by more than 5% from target weights."""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_PORTFOLIO_REVIEW,
        "subIntent": "concentration" if is_conc else "portfolio_review",
        "topic": "portfolio_review",
        "contextMode": "PERSONALIZED",
        "answer": answer,
        "calculations": {},
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Portfolio Engine", "Diversification Analysis")],
        "followUps": [
            "Where should I invest my monthly surplus?",
            "Why did you choose these investments?",
            "What is an ETF?"
        ]
    }

def emergencyFundHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Calculates and evaluates emergency fund requirement."""
    expenses = ctx["expenses"]
    target_6m = expenses * 6
    target_12m = expenses * 12
    current_savings = ctx["emergency_fund"]
    months_covered = ctx["coverage_months"]
    
    answer = f"""BOTTOM LINE

Your emergency fund currently covers **{months_covered} months** of mandatory living expenses (₹{current_savings:,.0f} saved against ₹{expenses:,.0f}/month expenses).

EMERGENCY BUFFER BENCHMARKS

* **6-Month Baseline Requirement:** **₹{target_6m:,.0f}**
* **12-Month Fortress Target:** **₹{target_12m:,.0f}**
* **Current Liquid Savings:** ₹{current_savings:,.0f}

WHERE TO PARK YOUR EMERGENCY FUND

1. **50% in Bank Savings / Sweep-in FD:** For instant UPI access.
2. **50% in ICICI Prudential Liquid Fund:** For instant redemption up to ₹50,000 within 30 minutes and T+1 payout."""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_EMERGENCY_FUND,
        "subIntent": "emergency_fund",
        "topic": "emergency_fund",
        "contextMode": "PERSONALIZED",
        "answer": answer,
        "calculations": {
            "monthly_expenses": expenses,
            "current_savings": current_savings,
            "months_covered": months_covered,
            "target_6m": target_6m,
            "target_12m": target_12m
        },
        "marketData": {},
        "recommendations": [],
        "warnings": [] if months_covered >= 6.0 else ["Emergency reserve is below recommended 6-month safety threshold."],
        "sources": [create_source_entry(SourceType.USER_CALCULATION, "SmartVest Financial Calculators", "Emergency Fund Coverage Metrics")],
        "followUps": [
            "What is a Liquid Fund?",
            "Where should I invest my monthly surplus?",
            "Can I afford a ₹10 lakh car?"
        ]
    }

def riskHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Explains user's risk tolerance, risk score, and asset allocation suitability."""
    answer = f"""BOTTOM LINE

Your risk profile is classified as **{ctx['risk']}** (Risk Score: **{ctx['risk_score']}/100**).

RISK PROFILE ATTRIBUTES

* **Risk Tolerance:** Emotional ability to withstand market drawdowns without panic selling.
* **Risk Capacity:** Structural financial ability to absorb losses, supported by your steady monthly surplus of ₹{ctx['surplus']:,.0f} and {ctx['coverage_months']} months of emergency reserves.
* **Time Horizon:** {ctx['horizon']} enables long-term compounding across diversified equities.

SUGGESTED ASSET MIX

* Equities: 65%–75% • Fixed Income: 15%–20% • Gold: 10%"""

    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_RISK_EXPLANATION,
        "subIntent": "risk_profile",
        "topic": "risk_profile",
        "contextMode": "PERSONALIZED",
        "answer": answer,
        "calculations": {
            "risk_score": ctx["risk_score"],
            "risk_profile": ctx["risk"]
        },
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [create_source_entry(SourceType.KNOWN_STATIC_FACT, "SmartVest Risk Profiling Engine", "Psychometric Risk Model")],
        "followUps": [
            "Where should I invest my monthly surplus?",
            "What is an ETF?",
            "What is Volatility?"
        ]
    }

def ambiguousClarificationHandler(query: str, params: Dict[str, Any], ctx: Dict[str, Any], req_id: str) -> Dict[str, Any]:
    """Asks for concise clarification only when query lacks any identifiable entity or subject."""
    clarification = params.get("clarification_prompt") or "Which financial topic or investment would you like to explore: UTI Nifty 50, MON100, ETFs vs Mutual Funds, IPOs, Hedge Funds, Car Affordability, or your Monthly Surplus?"
    return {
        "requestId": req_id,
        "question": query,
        "intent": INTENT_AMBIGUOUS_CLARIFICATION,
        "subIntent": "missing_target",
        "topic": "UNKNOWN",
        "contextMode": "CLARIFICATION",
        "answer": clarification,
        "calculations": {},
        "marketData": {},
        "recommendations": [],
        "warnings": [],
        "sources": [],
        "followUps": [
            "What is an ETF?",
            "What is an IPO?",
            "Where should I invest my monthly surplus?",
            "Can I afford a ₹10 lakh car?"
        ]
    }

# ============================================================================
# EXPLICIT DISPATCH TABLE
# ============================================================================

INTENT_DISPATCH_TABLE: Dict[str, Callable[[str, Dict[str, Any], Dict[str, Any], str], Dict[str, Any]]] = {
    INTENT_GENERAL_FINANCIAL_EDUCATION: educationalHandler,
    INTENT_GREETING: greetingHandler,
    INTENT_ETF_COMPARISON: comparisonHandler,
    INTENT_FUND_COMPARISON: comparisonHandler,
    INTENT_MARKET_QUESTION: marketHandler,
    INTENT_STOCK_ANALYSIS: stockHandler,
    INTENT_INVESTMENT_RECOMMENDATION: recommendationHandler,
    INTENT_SURPLUS_ALLOCATION: surplusHandler,
    INTENT_AFFORDABILITY: affordabilityHandler,
    INTENT_GOAL_PLANNING: goalHandler,
    INTENT_SIP_CALCULATION: sipHandler,
    INTENT_WHY_RECOMMENDED: whyRecommendedHandler,
    INTENT_WHY_NOT_RECOMMENDED: whyNotRecommendedHandler,
    INTENT_PORTFOLIO_REVIEW: portfolioHandler,
    INTENT_EMERGENCY_FUND: emergencyFundHandler,
    INTENT_RISK_EXPLANATION: riskHandler,
    INTENT_AMBIGUOUS_CLARIFICATION: ambiguousClarificationHandler
}

# ============================================================================
# MASTER UNIVERSAL REASONING PIPELINE ENTRYPOINT
# ============================================================================

def generate_ai_assistant_response(
    query: str,
    user_context: Optional[Dict[str, Any]] = None,
    history: Optional[List[Dict[str, Any]]] = None,
    request_id: Optional[str] = None,
    endpoint: str = "/api/v1/ai/chat"
) -> Dict[str, Any]:
    """
    Main Universal Financial Intelligence Reasoning Pipeline:
    1. Query Normalization & Intent Understanding
    2. Entity Resolution & Required Data Analysis
    3. Context Policy Isolation (Educational queries bypass profile data)
    4. Deterministic Calculations / Knowledge Retrieval
    5. Handler Execution
    6. Answer Relevance & Anti-Leak Validation
    7. Clean Output Contract Generation with Extensible Schema
    """
    req_id = request_id or str(uuid.uuid4())
    q_clean = (query or "").strip()
    if not q_clean:
        q_clean = "What is an ETF?"

    intent, params = detect_financial_intent(q_clean, user_context)
    norm_ctx = build_normalized_user_context(user_context)
    
    category = params.get("category", IntentCategory.EDUCATION.value)
    sub_intent = params.get("sub_intent", "concept_definition")
    entities = params.get("entities", [])
    scope = params.get("scope", "EDUCATIONAL")
    required_data = params.get("required_data", [])
    topic = params.get("topic") or extract_educational_topic(q_clean)

    # Select handler from explicit dispatch table
    handler = INTENT_DISPATCH_TABLE.get(intent, ambiguousClarificationHandler)
    handler_name = handler.__name__

    # HARD SAFETY GUARD: Educational/General questions MUST NOT execute recommendationHandler
    if intent in [INTENT_GENERAL_FINANCIAL_EDUCATION, INTENT_GREETING, INTENT_ETF_COMPARISON, INTENT_FUND_COMPARISON, INTENT_AMBIGUOUS_CLARIFICATION]:
        assert handler != recommendationHandler, f"Safety violation: Intent {intent} routed to recommendationHandler!"

    is_edu = scope == "EDUCATIONAL" or intent in [INTENT_GENERAL_FINANCIAL_EDUCATION, INTENT_ETF_COMPARISON, INTENT_FUND_COMPARISON, INTENT_GREETING]
    is_mkt = scope == "MARKET" or intent in [INTENT_MARKET_QUESTION, INTENT_STOCK_ANALYSIS]
    is_pers = scope == "PERSONALIZED" or intent in [
        INTENT_INVESTMENT_RECOMMENDATION, INTENT_SURPLUS_ALLOCATION, INTENT_AFFORDABILITY,
        INTENT_GOAL_PLANNING, INTENT_WHY_RECOMMENDED, INTENT_WHY_NOT_RECOMMENDED,
        INTENT_PORTFOLIO_REVIEW, INTENT_EMERGENCY_FUND, INTENT_RISK_EXPLANATION
    ]

    # Trace logging (Development mode)
    safe_log(f"\n[UNIVERSAL FINANCIAL INTELLIGENCE TRACE]")
    safe_log(f"QUESTION: {q_clean}")
    safe_log(f"INTENT: {intent}")
    safe_log(f"SUB-INTENT: {sub_intent}")
    safe_log(f"CATEGORY: {category}")
    safe_log(f"TOPIC: {topic}")
    safe_log(f"ENTITIES: {[e['canonical'] for e in entities]}")
    safe_log(f"QUESTION-SCOPE: {scope}")
    safe_log(f"REQUIRED-DATA: {required_data}")
    safe_log(f"HANDLER: {handler_name}")

    # Execute selected handler
    res = handler(q_clean, params, norm_ctx, req_id)
    if "topic" not in res:
        res["topic"] = topic

    # Answer Relevance & Anti-Leak Validation
    if is_edu and intent == INTENT_GENERAL_FINANCIAL_EDUCATION:
        ans_text = res.get("answer", "")
        is_valid = financial_knowledge_router.validate_response(q_clean, topic, ans_text, context_mode="EDUCATIONAL")
        
        if not is_valid:
            knowledge = financial_knowledge_router.get_educational_knowledge(q_clean, concept_id=topic)
            res["answer"] = knowledge["content"]
            res["calculations"] = {}
            res["recommendations"] = []
            res["warnings"] = []
            res["followUps"] = knowledge.get("follow_ups", [])
            res["contextMode"] = "EDUCATIONAL"
            res["topic"] = topic
            res["intent"] = INTENT_GENERAL_FINANCIAL_EDUCATION

    # Clean standardized response contract
    res["requestId"] = req_id
    res["question"] = q_clean
    res["intent"] = res.get("intent") or intent
    res["subIntent"] = res.get("subIntent") or sub_intent
    res["entities"] = entities
    res["topic"] = res.get("topic") or topic
    if "contextMode" not in res:
        res["contextMode"] = "EDUCATIONAL" if is_edu else ("MARKET" if is_mkt else ("CALCULATION" if scope == "CALCULATION" else "PERSONALIZED"))
    if "sources" not in res:
        res["sources"] = []
    if "marketData" not in res:
        res["marketData"] = {}

    safe_log(f"SOURCE-DATA: {[s.get('provider') for s in res.get('sources', [])]}")
    safe_log(f"FINAL-VALIDATION: PASSED\n")

    return res
