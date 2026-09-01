from typing import Dict, Any, List, Optional
import math

# ==============================================================================
# SMARTVEST CENTRALIZED CANDIDATE REGISTRY
# ==============================================================================

CANDIDATE_REGISTRY = {
    # --------------------------------------------------------------------------
    # INDIVIDUAL EQUITIES
    # --------------------------------------------------------------------------
    "TCS": {
        "canonical_id": "STOCK_TCS",
        "symbol": "TCS.NS",
        "name": "Tata Consultancy Services Ltd",
        "category": "STOCK",
        "market": "INDIA",
        "asset_class": "Indian Bluechip Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "DEFENSIVE EQUITY",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 98,
        "diversification_score": 75,
        "overlap_groups": ["INDIAN_IT", "INDIAN_EQUITY"],
        "business_summary": "Global IT services and digital transformation leader with net-zero debt, industry-leading operating margins (24-26%), and consistent high free cash flow return to shareholders.",
        "why_selected_template": "Selected as a premier defensive equity anchor. High ROCE (>50%), negative net debt, and dollar-denominated tech revenue provide steady compounding with low drawdowns.",
        "why_not_template": "Preferred over high-beta midcaps because its recession-resilient order book and strong corporate governance minimize capital impairment."
    },
    "RELIANCE": {
        "canonical_id": "STOCK_RELIANCE",
        "symbol": "RELIANCE.NS",
        "name": "Reliance Industries Ltd",
        "category": "STOCK",
        "market": "INDIA",
        "asset_class": "Indian Large-Cap Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "CORE EQUITY",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 94,
        "diversification_score": 80,
        "overlap_groups": ["INDIAN_CONGLOMERATE", "INDIAN_EQUITY"],
        "business_summary": "India's largest corporate powerhouse spanning 5G telecom (Jio), consumer retail network, green energy, and petrochemicals.",
        "why_selected_template": "Selected as the diversified domestic growth engine. Deep telecom and retail market dominance captures India's rising consumer consumption and digital penetration.",
        "why_not_template": "Preferred over pure cyclical commodity plays due to recurring high-margin digital and retail cash flows."
    },
    "V": {
        "canonical_id": "STOCK_VISA",
        "symbol": "V",
        "name": "Visa Inc",
        "category": "STOCK",
        "market": "US",
        "asset_class": "Global Quality Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "GLOBAL DIVERSIFICATION",
        "bucket": "CORE",
        "benchmark": "S&P 500",
        "cost_score": 95,
        "quality_score": 99,
        "diversification_score": 88,
        "overlap_groups": ["GLOBAL_FINTECH", "US_EQUITY"],
        "business_summary": "Global digital payments tollbooth processing over $15 trillion in annual transactions with 65%+ operating margins and a global duopoly moat.",
        "why_selected_template": "Selected for unparalleled tollbooth cash flows, inflation-linked transaction fee growth, and strong currency diversification in USD assets.",
        "why_not_template": "Preferred over cyclical banking stocks because Visa takes zero credit risk and requires minimal capital expenditure."
    },
    "AAPL": {
        "canonical_id": "STOCK_APPLE",
        "symbol": "AAPL",
        "name": "Apple Inc",
        "category": "STOCK",
        "market": "US",
        "asset_class": "Global Mega-Cap Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "GROWTH",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 96,
        "diversification_score": 82,
        "overlap_groups": ["US_TECH", "US_EQUITY"],
        "business_summary": "World-leading consumer hardware and services ecosystem with over 2.2 billion active devices generating high-margin recurring services revenue.",
        "why_selected_template": "Selected for unmatched customer brand retention, expanding high-margin subscription services, and disciplined shareholder capital return.",
        "why_not_template": "Preferred over speculative consumer tech due to immense ecosystem lock-in and $100B+ annual operating cash generation."
    },
    "MSFT": {
        "canonical_id": "STOCK_MICROSOFT",
        "symbol": "MSFT",
        "name": "Microsoft Corporation",
        "category": "STOCK",
        "market": "US",
        "asset_class": "US Tech Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "GROWTH",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 97,
        "diversification_score": 85,
        "overlap_groups": ["US_TECH", "US_EQUITY"],
        "business_summary": "Enterprise cloud computing (Azure), enterprise productivity software (Office 365), and commercial AI infrastructure leader.",
        "why_selected_template": "Selected for enterprise SaaS pricing power, hybrid cloud expansion, and commercial generative AI monetization.",
        "why_not_template": "Preferred over single-product software firms because Microsoft has diversified revenue across enterprise, cloud, and consumer sectors."
    },
    "NVDA": {
        "canonical_id": "STOCK_NVIDIA",
        "symbol": "NVDA",
        "name": "NVIDIA Corporation",
        "category": "STOCK",
        "market": "US",
        "asset_class": "US Tech Stocks",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 7,
        "portfolio_role": "HIGH ALPHA",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 95,
        "diversification_score": 70,
        "overlap_groups": ["US_TECH", "SEMICONDUCTOR", "US_EQUITY"],
        "business_summary": "Accelerated computing and AI superchip monopoly powered by full-stack CUDA hardware-software architecture.",
        "why_selected_template": "Selected as a premier high-alpha growth booster. Uncontested 80%+ share in AI data-center accelerators powers multi-year hyperscaler capex growth.",
        "why_not_template": "Assigned strictly to high-growth mandates with long horizons due to elevated volatility and semiconductor cycle sensitivity."
    },
    "TATAMOTORS": {
        "canonical_id": "STOCK_TATAMOTORS",
        "symbol": "TATAMOTORS.NS",
        "name": "Tata Motors Ltd",
        "category": "STOCK",
        "market": "INDIA",
        "asset_class": "Cyclical Growth Stocks",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "EMERGING GROWTH",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 88,
        "diversification_score": 72,
        "overlap_groups": ["INDIAN_AUTO", "INDIAN_EQUITY"],
        "business_summary": "Turnaround commercial and passenger vehicle manufacturer leading India's domestic electric vehicle (EV) revolution with global JLR luxury demand.",
        "why_selected_template": "Selected for strong free cash flow inflection, aggressive net debt reduction, and dominant 70%+ Indian EV market share.",
        "why_not_template": "Assigned only when aggressive risk capacity allows cyclical auto exposure."
    },

    # --------------------------------------------------------------------------
    # EXCHANGE TRADED FUNDS (ETFs)
    # --------------------------------------------------------------------------
    "NIFTYBEES": {
        "canonical_id": "ETF_NIFTYBEES",
        "symbol": "NIFTYBEES",
        "name": "Nippon India Nifty 50 BeES ETF",
        "category": "ETF",
        "market": "INDIA",
        "asset_class": "Indian Core Index ETF",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "CORE EQUITY",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 98, # Ultra-low expense ratio (~0.04%)
        "quality_score": 95,
        "diversification_score": 85,
        "overlap_groups": ["NIFTY_50_INDEX", "INDIAN_LARGE_CAP"],
        "business_summary": "India's highest-liquidity exchange-traded fund tracking the top 50 bluechip corporations listed on the National Stock Exchange.",
        "why_selected_template": "Selected as the foundational low-cost anchor for Indian economic growth. Captures 50 premier conglomerates with instant intraday liquidity and 0.04% expense ratio.",
        "why_not_template": "Preferred over actively managed large-cap funds which consistently underperform the index after fees."
    },
    "MON100": {
        "canonical_id": "ETF_MON100",
        "symbol": "MON100",
        "name": "Motilal Oswal Nasdaq 100 ETF",
        "category": "ETF",
        "market": "GLOBAL",
        "asset_class": "Global Tech ETF",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "GLOBAL DIVERSIFICATION",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 92,
        "quality_score": 96,
        "diversification_score": 92,
        "overlap_groups": ["NASDAQ_100", "GLOBAL_TECH"],
        "business_summary": "Indian ETF providing direct INR exposure to the top 100 non-financial global tech and innovation leaders listed on the NASDAQ exchange.",
        "why_selected_template": "Selected to provide essential geographical diversification and direct access to global innovation leaders (Microsoft, Apple, Nvidia, Alphabet) alongside a USD currency appreciation hedge.",
        "why_not_template": "Preferred over single US stocks for core global exposure because it diversifies single-company regulatory and earnings risk across 100 tech giants."
    },
    "GOLDBEES": {
        "canonical_id": "ETF_GOLDBEES",
        "symbol": "GOLDBEES",
        "name": "Sovereign Gold Bonds / Nippon Gold BeES",
        "category": "ETF",
        "market": "COMMODITY",
        "asset_class": "Sovereign Gold & Inflation Hedge",
        "risk_tier": "LOW",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 2,
        "portfolio_role": "INFLATION HEDGE",
        "bucket": "CORE",
        "benchmark": "Domestic Gold Spot",
        "cost_score": 94,
        "quality_score": 95,
        "diversification_score": 95,
        "overlap_groups": ["GOLD_COMMODITY"],
        "business_summary": "Pure 99.5% physical gold-backed institutional security offering non-correlated capital preservation and rupee depreciation protection.",
        "why_selected_template": "Selected as a vital counter-cyclical stabilizer. Gold maintains a near-zero or negative correlation to equities during macroeconomic drawdowns and stagflation cycles.",
        "why_not_template": "Preferred over physical jewellery due to zero making charges, instant liquidity, and pure institutional price tracking."
    },

    # --------------------------------------------------------------------------
    # MUTUAL FUNDS
    # --------------------------------------------------------------------------
    "PPFCF": {
        "canonical_id": "MF_PPFCF",
        "symbol": "PPFCF",
        "name": "Parag Parikh Flexi Cap Fund Direct",
        "category": "MUTUAL_FUND",
        "market": "INDIA",
        "asset_class": "Flexi-Cap Equity Fund",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "GROWTH",
        "bucket": "CORE",
        "benchmark": "Nifty 500",
        "cost_score": 90,
        "quality_score": 97,
        "diversification_score": 90,
        "overlap_groups": ["FLEXI_CAP_MF", "ACTIVE_EQUITY"],
        "business_summary": "India's premier value-conscious multi-cap fund investing dynamically across Indian large/mid-caps, cash arbitrage, and select international equities.",
        "why_selected_template": "Selected for exceptional risk-adjusted alpha generation and downside protection. Its mandate allows cash accumulation during overvalued markets and international equity allocation.",
        "why_not_template": "Preferred over narrow thematic mutual funds due to unconstrained multi-cap flexibility and a multi-decade track record of market outperformance."
    },
    "NIFTY50": {
        "canonical_id": "MF_NIFTY50",
        "symbol": "NIFTY50",
        "name": "UTI Nifty 50 Index Fund Direct",
        "category": "MUTUAL_FUND",
        "market": "INDIA",
        "asset_class": "Indian Core Index Fund",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "CORE EQUITY",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 97,
        "quality_score": 94,
        "diversification_score": 85,
        "overlap_groups": ["NIFTY_50_INDEX", "INDIAN_LARGE_CAP"],
        "business_summary": "Low-tracking-error direct index fund replicating the total returns of the Nifty 50 index with zero human fund-manager bias.",
        "why_selected_template": "Selected as a frictionless core wealth accumulator. Provides seamless automated SIP compounding in India's top 50 businesses with minimal tracking error and low expense ratio.",
        "why_not_template": "Preferred when direct mutual fund SIP automation is desired over exchange trading."
    },
    "HDFCSHORT": {
        "canonical_id": "MF_HDFCSHORT",
        "symbol": "HDFCSHORT",
        "name": "HDFC Short Duration Debt Fund Direct",
        "category": "MUTUAL_FUND",
        "market": "DEBT",
        "asset_class": "Short Duration Debt Fund",
        "risk_tier": "LOW",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 1,
        "portfolio_role": "DEBT / INCOME",
        "bucket": "GOAL_SPECIFIC",
        "benchmark": "Nifty Short Duration Debt",
        "cost_score": 93,
        "quality_score": 94,
        "diversification_score": 88,
        "overlap_groups": ["DEBT_FIXED_INCOME"],
        "business_summary": "High-quality debt portfolio focused on AAA corporate bonds, sovereign treasury bills, and banking debt with a 1-3 year Macaulay duration.",
        "why_selected_template": "Selected for predictable fixed income yield, capital preservation, and low interest-rate duration risk. Ideal for medium-term goals and portfolio rebalancing liquidity.",
        "why_not_template": "Preferred over long-duration gilt funds which suffer severe capital drawdowns during interest rate hiking cycles."
    },
    "ICICILIQ": {
        "canonical_id": "MF_ICICILIQ",
        "symbol": "ICICILIQ",
        "name": "ICICI Prudential Liquid Fund Direct",
        "category": "MUTUAL_FUND",
        "market": "DEBT",
        "asset_class": "Liquid Safety Reserve Fund",
        "risk_tier": "LOW",
        "volatility_tier": "LOW",
        "liquidity_tier": "VERY_HIGH",
        "minimum_horizon_years": 0,
        "portfolio_role": "LIQUIDITY",
        "bucket": "SAFETY",
        "benchmark": "Nifty Liquid Index",
        "cost_score": 94,
        "quality_score": 96,
        "diversification_score": 85,
        "overlap_groups": ["LIQUID_RESERVE"],
        "business_summary": "Institutional ultra-short money market fund investing in commercial papers and treasury instruments with up to 91-day maturity and T+1 redemption liquidity.",
        "why_selected_template": "Selected as the dedicated emergency buffer and liquidity shield. Provides higher post-tax yields than standard bank savings accounts with near-zero principal volatility.",
        "why_not_template": "Preferred over fixed deposits due to zero lock-in penalties and instant partial withdrawal flexibility."
    },
    "ICICISAVE": {
        "canonical_id": "MF_ICICISAVE",
        "symbol": "ICICISAVE",
        "name": "ICICI Prudential Conservative Hybrid Fund Direct",
        "category": "MUTUAL_FUND",
        "market": "INDIA",
        "asset_class": "Conservative Hybrid Fund",
        "risk_tier": "LOW",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 2,
        "portfolio_role": "STABILITY",
        "bucket": "CORE",
        "benchmark": "Crisil Hybrid 85+15",
        "cost_score": 91,
        "quality_score": 95,
        "diversification_score": 92,
        "overlap_groups": ["CONSERVATIVE_HYBRID", "DEBT_FIXED_INCOME"],
        "business_summary": "Defensive asset allocator holding 75-80% high-quality debt and fixed income with a disciplined 20-25% equity growth kicker.",
        "why_selected_template": "Selected for capital preservation with inflation protection. Fixed income allocation cushions market declines while equity participation beats inflation.",
        "why_not_template": "Preferred over pure debt for conservative investors who require modest real growth without bearing equity volatility."
    },
    "NIPPSMALL": {
        "canonical_id": "MF_NIPPSMALL",
        "symbol": "NIPPSMALL",
        "name": "Nippon India Small Cap Fund Direct",
        "category": "MUTUAL_FUND",
        "market": "INDIA",
        "asset_class": "Emerging Small-Cap",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 7,
        "portfolio_role": "EMERGING GROWTH",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nifty Smallcap 250",
        "cost_score": 88,
        "quality_score": 93,
        "diversification_score": 80,
        "overlap_groups": ["SMALL_CAP_MF", "ACTIVE_EQUITY"],
        "business_summary": "Extensively diversified portfolio of over 180 high-growth emerging Indian enterprises with significant market-cap expansion potential.",
        "why_selected_template": "Selected to capture high-velocity domestic market expansion. Deep diversification across 180+ emerging niche leaders mitigates individual business mortality risk.",
        "why_not_template": "Strictly restricted to aggressive long-term portfolios (7+ years) because small-caps experience sharp cyclical drawdown phases."
    }
}


# ==============================================================================
# AUTHORITATIVE PERSONALIZED PORTFOLIO CONSTRUCTION ENGINE
# ==============================================================================

def compute_asset_allocation(
    risk_category: str = "Moderate",
    total_corpus: float = 0.0
) -> Dict[str, Any]:
    """Legacy helper for backward compatibility."""
    return calculate_dynamic_allocation(
        risk_tolerance=risk_category,
        risk_capacity=risk_category,
        total_corpus=total_corpus
    )


def calculate_dynamic_allocation(
    risk_tolerance: str = "MODERATE",
    risk_capacity: str = "MODERATE",
    final_advisory_risk: Optional[str] = None,
    age: int = 30,
    horizon_years: int = 10,
    monthly_income: float = 0.0,
    monthly_expenses: float = 0.0,
    emergency_fund_months: float = 6.0,
    has_near_term_goal: bool = False,
    existing_investments: float = 0.0,
    total_corpus: float = 0.0,
    goals: Optional[List[Dict[str, Any]]] = None,
    portfolio: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Authoritative SmartVest Portfolio Construction Engine:
    Produces a curated, personalized, compact basket (typically 1 Stock + 2-3 ETFs + 2-3 MFs, N in [2, 6])
    dynamically optimized for risk, corpus, horizon, emergency readiness, and portfolio overlap.
    """
    # 1. Resolve Final Advisory Risk
    tol_map = {"LOW": 1, "CONSERVATIVE": 1, "MODERATE": 2, "BALANCED": 2, "HIGH": 3, "AGGRESSIVE": 3}
    rev_map = {1: "LOW", 2: "MODERATE", 3: "HIGH"}

    t_val = tol_map.get(risk_tolerance.upper().strip(), 2)
    c_val = tol_map.get(risk_capacity.upper().strip(), 2)

    if final_advisory_risk:
        eff_risk = final_advisory_risk.upper().strip()
    else:
        eff_risk = rev_map[min(t_val, c_val)]

    # Horizon and Emergency constraints on risk
    if horizon_years < 3 or has_near_term_goal:
        eff_risk = "LOW"
    elif emergency_fund_months < 1.0 and eff_risk == "HIGH":
        eff_risk = "MODERATE"

    # 2. Risk Budget & Resilience
    financial_resilience = min(100, max(10, int((emergency_fund_months * 8) + (horizon_years * 2))))
    
    if eff_risk == "LOW":
        target_risk_budget = 20 if horizon_years < 3 else 30
    elif eff_risk == "MODERATE":
        target_risk_budget = 65 if horizon_years >= 10 else 55
    else:
        target_risk_budget = 90 if (horizon_years >= 10 and emergency_fund_months >= 3.5) else 80

    # 3. Monthly Deployment Capacity & Sizing
    monthly_surplus = max(0.0, monthly_income - monthly_expenses) if monthly_income > 0 else 0.0
    effective_monthly_deployment = monthly_surplus if monthly_surplus > 0 else (total_corpus * 0.05 if total_corpus > 0 else 10000.0)

    # 4. Handle Deficit Cashflow Special Case
    if monthly_income > 0 and monthly_expenses >= monthly_income and total_corpus <= 0:
        liquid_cand = CANDIDATE_REGISTRY["ICICILIQ"]
        rec = {
            "canonicalId": liquid_cand["canonical_id"],
            "symbol": liquid_cand["symbol"],
            "name": liquid_cand["name"],
            "category": liquid_cand["category"],
            "assetClass": liquid_cand["asset_class"],
            "allocationPct": 100,
            "percentage": 100,
            "monthlyAmount": 0,
            "corpusAmount": 0,
            "amount": 0,
            "portfolioRole": "LIQUIDITY",
            "role": "LIQUIDITY",
            "bucket": "SAFETY",
            "suitabilityScore": 98,
            "suitability_score": 98,
            "riskTier": "LOW",
            "risk_tier": "LOW",
            "risk": "LOW",
            "asset": "Liquid & Emergency Reserve",
            "whySelected": "Living expenses fully consume income. 100% of capital must be channeled toward emergency liquidity and debt stabilization before entering volatile markets.",
            "whyNotAlternatives": "All equity, ETF, and growth products are restricted during cashflow deficit.",
            "horizonFit": "Immediate liquidity access",
            "goalFit": "Emergency Cashflow Stabilization",
            "diversificationRole": "Capital protection baseline",
            "overlapPenalty": 0,
            "color": "#64748B"
        }
        return {
            "riskProfile": eff_risk,
            "final_advisory_risk": eff_risk,
            "strategy_title": "Deficit Cashflow Protection",
            "target_risk_budget": 10,
            "financial_resilience": financial_resilience,
            "core_portfolio_risk": 1.0,
            "safety_portfolio_risk": 1.0,
            "overall_portfolio_risk": 1.0,
            "portfolioRisk": 1.0,
            "diversificationScore": 30,
            "expected_cagr": 6.5,
            "investmentCorpus": total_corpus,
            "monthlyDeployment": 0,
            "recommendationCount": 1,
            "categoryBreakdown": {"stocks": 0, "etfs": 0, "mutualFunds": 1},
            "recommendations": [rec],
            "candidates": [rec],
            "top_recommendation": rec,
            "allocation": [{"asset": "Liquid & Emergency Reserve", "percentage": 100, "amount": 0, "color": "#64748B", "symbol": "ICICILIQ", "name": liquid_cand["name"]}],
            "allocation_dict": {"Liquid & Emergency Reserve": 100},
            "core_allocation_pct": 0,
            "safety_allocation_pct": 100,
            "goal_specific_allocation_pct": 0,
            "long_term_growth_allocation_pct": 0,
            "equity_total_pct": 0,
            "debt_total_pct": 100,
            "gold_total_pct": 0,
            "global_total_pct": 0,
            "rationale": "Expenses absorb income. Directing 100% to liquid reserves until positive surplus is restored."
        }

    # 5. Overlap Identification from Existing Portfolio
    existing_symbols = set()
    if portfolio:
        for p in portfolio:
            sym = str(p.get("symbol", "")).upper()
            name = str(p.get("name", "")).upper()
            existing_symbols.add(sym)
            if "NIFTY" in sym or "NIFTY" in name:
                existing_symbols.add("NIFTY_OVERLAP")
            if "MON100" in sym or "NASDAQ" in name or "TECH" in name:
                existing_symbols.add("NASDAQ_OVERLAP")
            if "GOLD" in sym or "GOLD" in name or "SGB" in sym:
                existing_symbols.add("GOLD_OVERLAP")

    # 6. Basket Sizing N in [2, 6]
    effective_size_capital = max(total_corpus, effective_monthly_deployment * 12)
    if effective_size_capital < 25000 or effective_monthly_deployment < 3000:
        target_basket_size = 3 if eff_risk != "LOW" else 2
    elif effective_size_capital < 100000 or effective_monthly_deployment < 8000:
        target_basket_size = 4
    else:
        target_basket_size = 6 if (eff_risk == "HIGH" or (eff_risk == "MODERATE" and horizon_years >= 5)) else 5

    # 7. Select Curated Basket by Risk & Role
    # Target Structure: 1 Stock + 2-3 ETFs + 2-3 MFs
    selected_keys: List[str] = []
    weight_map: Dict[str, int] = {}
    title = "Balanced Multi-Asset Wealth Compounder"
    expected_cagr = 14.2
    rationale = "Balanced diversified growth with core equity anchors, global hedging, and fixed income yield."

    # --------------------------------------------------------------------------
    # ARCHETYPE 1: LOW RISK (Capital Preservation & Stability)
    # Target: 1 Defensive Stock + 2 ETFs + 2-3 MFs (or fewer for small corpus)
    # --------------------------------------------------------------------------
    if eff_risk == "LOW":
        if horizon_years < 3:
            title = "Near-Term Capital Preservation Strategy"
            expected_cagr = 8.8
            rationale = "Near-term goal horizon mandates capital preservation with short-duration debt, liquid reserves, and gold hedge."
            if target_basket_size <= 3:
                selected_keys = ["HDFCSHORT", "ICICILIQ", "GOLDBEES"]
                weight_map = {"HDFCSHORT": 45, "ICICILIQ": 35, "GOLDBEES": 20}
            else:
                # 1 Stock + 2 ETFs + 2 MFs
                selected_keys = ["TCS", "GOLDBEES", "NIFTYBEES", "HDFCSHORT", "ICICILIQ"]
                weight_map = {"HDFCSHORT": 35, "ICICILIQ": 25, "GOLDBEES": 20, "TCS": 10, "NIFTYBEES": 10}
        else:
            title = "Capital Preservation & Defensive Yield Strategy"
            expected_cagr = 9.8
            rationale = "Low risk mandate prioritizes stability with defensive hybrid debt, sovereign gold, and dividend bluechips."
            if target_basket_size <= 3:
                selected_keys = ["ICICISAVE", "HDFCSHORT", "GOLDBEES"]
                weight_map = {"ICICISAVE": 45, "HDFCSHORT": 35, "GOLDBEES": 20}
            elif target_basket_size == 4:
                selected_keys = ["ICICISAVE", "HDFCSHORT", "GOLDBEES", "NIFTY50"]
                weight_map = {"ICICISAVE": 35, "HDFCSHORT": 25, "GOLDBEES": 20, "NIFTY50": 20}
            else:
                # 1 Stock + 2 ETFs + 2-3 MFs (5 or 6 items)
                # Stock: TCS (quality defensive)
                # ETFs: NIFTYBEES, GOLDBEES
                # MFs: ICICISAVE, HDFCSHORT, ICICILIQ
                if target_basket_size == 6:
                    selected_keys = ["ICICISAVE", "HDFCSHORT", "GOLDBEES", "TCS", "NIFTYBEES", "ICICILIQ"]
                    weight_map = {"ICICISAVE": 30, "HDFCSHORT": 20, "GOLDBEES": 20, "NIFTYBEES": 10, "TCS": 10, "ICICILIQ": 10}
                else:
                    selected_keys = ["ICICISAVE", "HDFCSHORT", "GOLDBEES", "TCS", "NIFTYBEES"]
                    weight_map = {"ICICISAVE": 35, "HDFCSHORT": 25, "GOLDBEES": 20, "NIFTYBEES": 10, "TCS": 10}

    # --------------------------------------------------------------------------
    # ARCHETYPE 2: MODERATE RISK (Balanced Wealth Compounder)
    # Target: 1 Stock (Quality Growth) + 2-3 ETFs + 2-3 MFs
    # --------------------------------------------------------------------------
    elif eff_risk == "MODERATE":
        title = "Balanced Multi-Asset Wealth Compounder"
        expected_cagr = 14.4
        rationale = "Balanced allocation maximizing risk-adjusted compound return with core Indian equities, global technology, flexi-cap alpha, and gold."
        
        # Stock candidate choice: If existing portfolio has US tech, pick RELIANCE, else MSFT/RELIANCE
        stock_pick = "RELIANCE" if "NASDAQ_OVERLAP" in existing_symbols else "MSFT"

        if target_basket_size <= 3:
            selected_keys = ["NIFTY50", "PPFCF", "HDFCSHORT"]
            weight_map = {"NIFTY50": 45, "PPFCF": 35, "HDFCSHORT": 20}
        elif target_basket_size == 4:
            selected_keys = ["NIFTY50", "PPFCF", "MON100", "GOLDBEES"]
            weight_map = {"NIFTY50": 35, "PPFCF": 30, "MON100": 20, "GOLDBEES": 15}
        elif target_basket_size == 5:
            # 1 Stock + 2 ETFs + 2 MFs
            # Stock: RELIANCE / MSFT
            # ETFs: NIFTYBEES, GOLDBEES (or MON100)
            # MFs: PPFCF, HDFCSHORT (or ICICILIQ if low EF)
            debt_fund = "ICICILIQ" if emergency_fund_months < 3 else "HDFCSHORT"
            selected_keys = ["NIFTY50", "PPFCF", stock_pick, "MON100", debt_fund]
            weight_map = {"NIFTY50": 30, "PPFCF": 25, stock_pick: 15, "MON100": 15, debt_fund: 15}
        else: # 6 instruments (1 Stock + 2 ETFs + 3 MFs or 1 Stock + 3 ETFs + 2 MFs)
            # 1 Stock: RELIANCE/MSFT
            # 2 ETFs: MON100, GOLDBEES
            # 3 MFs: NIFTY50, PPFCF, HDFCSHORT (or ICICILIQ)
            debt_fund = "ICICILIQ" if emergency_fund_months < 3 else "HDFCSHORT"
            selected_keys = ["NIFTY50", "PPFCF", stock_pick, "MON100", "GOLDBEES", debt_fund]
            if emergency_fund_months < 2.0:
                weight_map = {"NIFTY50": 20, "PPFCF": 20, stock_pick: 15, "MON100": 15, "GOLDBEES": 10, debt_fund: 20}
            else:
                weight_map = {"NIFTY50": 25, "PPFCF": 25, stock_pick: 15, "MON100": 15, "GOLDBEES": 10, debt_fund: 10}

    # --------------------------------------------------------------------------
    # ARCHETYPE 3: HIGH RISK (High Alpha Growth Blueprint)
    # Target: 1 High-Alpha Stock + 2-3 ETFs + 2-3 MFs
    # --------------------------------------------------------------------------
    else:
        title = "High Alpha Multi-Asset Growth Blueprint"
        expected_cagr = 18.2
        rationale = "High-growth mandate engineered for long-term compound wealth creation across multi-cap alpha, global technology, high-growth AI semiconductor equities, and emerging small-caps."
        
        # Stock candidate choice: NVDA (high alpha) unless existing US tech overlap, then TATAMOTORS or RELIANCE
        stock_pick = "TATAMOTORS" if "NASDAQ_OVERLAP" in existing_symbols else "NVDA"

        if target_basket_size <= 3:
            selected_keys = ["PPFCF", "MON100", stock_pick]
            weight_map = {"PPFCF": 45, "MON100": 35, stock_pick: 20}
        elif target_basket_size == 4:
            selected_keys = ["PPFCF", "NIFTY50", "MON100", stock_pick]
            weight_map = {"PPFCF": 35, "NIFTY50": 25, "MON100": 25, stock_pick: 15}
        elif target_basket_size == 5:
            # 1 Stock + 2 ETFs + 2 MFs
            # Stock: NVDA/TATAMOTORS
            # ETFs: NIFTYBEES (or MON100), GOLDBEES
            # MFs: PPFCF, NIPPSMALL
            selected_keys = ["PPFCF", "MON100", stock_pick, "NIPPSMALL", "GOLDBEES"]
            weight_map = {"PPFCF": 30, "MON100": 25, stock_pick: 20, "NIPPSMALL": 15, "GOLDBEES": 10}
        else: # 6 instruments: 1 Stock + 2 ETFs + 3 MFs
            # Stock: NVDA
            # ETFs: MON100, GOLDBEES
            # MFs: NIFTY50, PPFCF, NIPPSMALL, (plus cash reserve if emergency fund low)
            if emergency_fund_months < 2.0:
                selected_keys = ["PPFCF", "NIFTY50", "MON100", stock_pick, "NIPPSMALL", "ICICILIQ"]
                weight_map = {"PPFCF": 25, "NIFTY50": 20, "MON100": 20, stock_pick: 15, "ICICILIQ": 10, "NIPPSMALL": 10}
            else:
                selected_keys = ["PPFCF", "NIFTY50", "MON100", stock_pick, "NIPPSMALL", "GOLDBEES"]
                weight_map = {"PPFCF": 25, "NIFTY50": 25, "MON100": 20, stock_pick: 15, "NIPPSMALL": 10, "GOLDBEES": 5}

    # 8. Overlap Adjustment & Penalties
    # If user already owns NIFTY50, swap or reduce Nifty and boost Flexi/Global
    if "NIFTY_OVERLAP" in existing_symbols and "NIFTY50" in weight_map and "PPFCF" in weight_map:
        w_nifty = weight_map["NIFTY50"]
        if w_nifty > 15:
            weight_map["NIFTY50"] = 10
            weight_map["PPFCF"] += (w_nifty - 10)

    # If user already owns MON100 and MON100 is selected
    if "NASDAQ_OVERLAP" in existing_symbols and "MON100" in weight_map:
        w_mon = weight_map["MON100"]
        if w_mon > 10:
            weight_map["MON100"] = 10
            if "GOLDBEES" in weight_map:
                weight_map["GOLDBEES"] += (w_mon - 10)
            elif "PPFCF" in weight_map:
                weight_map["PPFCF"] += (w_mon - 10)

    # Normalize weights to exactly 100%
    total_w = sum(weight_map.values())
    if total_w != 100 and total_w > 0:
        # Scale proportionally and fix rounding on top weight
        top_k = max(weight_map, key=weight_map.get)
        diff = 100 - total_w
        weight_map[top_k] += diff

    # 9. Build Recommendation Objects with Deep Explainability
    recommendations_list: List[Dict[str, Any]] = []
    category_counts = {"stocks": 0, "etfs": 0, "mutualFunds": 0}

    # Calculate individual suitability scores dynamically
    for k in selected_keys:
        cand = CANDIDATE_REGISTRY[k]
        pct = weight_map[k]
        
        # Calculate dynamic suitability score
        base_suitability = cand["quality_score"]
        # Risk bonus/penalty
        if cand["risk_tier"] == eff_risk:
            base_suitability += 3
        elif (eff_risk == "LOW" and cand["risk_tier"] == "HIGH") or (eff_risk == "HIGH" and cand["risk_tier"] == "LOW"):
            base_suitability -= 6

        # Horizon bonus
        if horizon_years >= cand["minimum_horizon_years"]:
            base_suitability += 2
        else:
            base_suitability -= 8

        # Near-term capital preservation bonus for debt & hybrid stability assets
        if horizon_years < 3:
            if k in ["HDFCSHORT", "ICICISAVE", "ICICILIQ"]:
                base_suitability += 4
            elif k in ["GOLDBEES"]:
                base_suitability -= 2

        # Overlap penalty
        overlap_penalty = 0
        if ("NIFTY_OVERLAP" in existing_symbols and "NIFTY" in k) or \
           ("NASDAQ_OVERLAP" in existing_symbols and (k in ["MON100", "NVDA", "AAPL", "MSFT"])) or \
           ("GOLD_OVERLAP" in existing_symbols and "GOLD" in k):
            overlap_penalty = 12
            base_suitability -= overlap_penalty

        final_suitability = max(60, min(99, base_suitability))

        # Monthly allocation
        m_amt = round(effective_monthly_deployment * (pct / 100.0), 2)
        c_amt = round(total_corpus * (pct / 100.0), 2) if total_corpus > 0 else m_amt

        # Update category counts
        cat = cand["category"]
        if cat == "STOCK":
            category_counts["stocks"] += 1
        elif cat == "ETF":
            category_counts["etfs"] += 1
        elif cat == "MUTUAL_FUND":
            category_counts["mutualFunds"] += 1

        rec_obj = {
            "canonicalId": cand["canonical_id"],
            "symbol": cand["symbol"],
            "name": cand["name"],
            "category": cand["category"],
            "assetClass": cand["asset_class"],
            "allocationPct": pct,
            "percentage": pct,
            "monthlyAmount": m_amt,
            "corpusAmount": c_amt,
            "amount": c_amt,
            "portfolioRole": cand["portfolio_role"],
            "role": cand["portfolio_role"],
            "bucket": cand["bucket"],
            "suitabilityScore": final_suitability,
            "suitability_score": final_suitability,
            "riskTier": cand["risk_tier"],
            "risk_tier": cand["risk_tier"],
            "risk": cand["risk_tier"],
            "asset": cand["asset_class"],
            "whySelected": cand["why_selected_template"],
            "whyNotAlternatives": cand["why_not_template"],
            "horizonFit": f"Optimal for {cand['minimum_horizon_years']}+ year investment horizon",
            "goalFit": "Supports long-term capital compounding and wealth creation" if cand["bucket"] in ["CORE", "LONG_TERM_GROWTH"] else "Provides capital protection and goal liquidity",
            "diversificationRole": cand["business_summary"],
            "overlapPenalty": overlap_penalty,
            "color": "#10B981" if cat == "STOCK" else ("#06B6D4" if cat == "ETF" else "#8B5CF6")
        }
        recommendations_list.append(rec_obj)

    # Sort recommendations by suitability score descending so top pick is highest score
    recommendations_list.sort(key=lambda x: x["suitabilityScore"], reverse=True)

    # Ensure monthly amounts sum exactly to effective_monthly_deployment
    sum_m = sum(r["monthlyAmount"] for r in recommendations_list)
    if recommendations_list and abs(sum_m - effective_monthly_deployment) > 0.01:
        diff = round(effective_monthly_deployment - sum_m, 2)
        recommendations_list[0]["monthlyAmount"] = round(recommendations_list[0]["monthlyAmount"] + diff, 2)

    # 10. Portfolio-Level Metrics
    risk_tier_weights = {"LOW": 2.0, "MODERATE": 5.0, "HIGH": 8.0, "VERY_HIGH": 9.5}
    weighted_risk_sum = sum(
        (risk_tier_weights.get(r["riskTier"], 5.0) * r["allocationPct"])
        for r in recommendations_list
    )
    overall_portfolio_risk = round(weighted_risk_sum / 100.0, 1)

    core_growth_cands = [r for r in recommendations_list if r["bucket"] in ["CORE", "LONG_TERM_GROWTH"]]
    core_w = sum(r["allocationPct"] for r in core_growth_cands)
    if core_w > 0:
        core_portfolio_risk = round(sum(risk_tier_weights.get(r["riskTier"], 5.0) * r["allocationPct"] for r in core_growth_cands) / core_w, 1)
    else:
        core_portfolio_risk = 2.0

    # Diversification score (0 - 100) based on category spread and asset class diversity
    cat_spread = len([c for c in category_counts.values() if c > 0])
    diversification_score = min(98, max(50, int(60 + (cat_spread * 10) + (len(recommendations_list) * 2))))

    # Totals by broad class
    equity_total_pct = sum(r["allocationPct"] for r in recommendations_list if "Equity" in r["assetClass"] or "Stocks" in r["assetClass"] or "Index" in r["assetClass"] or "Small-Cap" in r["assetClass"] or "Tech" in r["assetClass"] or ("Fund" in r["assetClass"] and not ("Debt" in r["assetClass"] or "Liquid" in r["assetClass"] or "Hybrid" in r["assetClass"])))
    debt_total_pct = sum(r["allocationPct"] for r in recommendations_list if "Debt" in r["assetClass"] or "Liquid" in r["assetClass"] or "Hybrid" in r["assetClass"] or "Reserve" in r["assetClass"] or "Savings" in r["assetClass"])
    gold_total_pct = sum(r["allocationPct"] for r in recommendations_list if "Gold" in r["assetClass"])
    global_total_pct = sum(r["allocationPct"] for r in recommendations_list if "Global" in r["assetClass"] or "US" in r["assetClass"] or "Nasdaq" in r["name"])

    # Build allocation list for charts
    alloc_dict = {r["assetClass"]: r["allocationPct"] for r in recommendations_list}
    allocation_list = [
        {
            "asset": r["assetClass"],
            "percentage": r["allocationPct"],
            "amount": r["corpusAmount"],
            "color": r["color"],
            "symbol": r["symbol"],
            "name": r["name"]
        }
        for r in recommendations_list
    ]

    top_recommendation = recommendations_list[0] if recommendations_list else None

    return {
        "riskProfile": eff_risk,
        "final_advisory_risk": eff_risk,
        "strategy_title": title,
        "target_risk_budget": target_risk_budget,
        "financial_resilience": financial_resilience,
        "core_portfolio_risk": core_portfolio_risk,
        "safety_portfolio_risk": 1.0,
        "overall_portfolio_risk": overall_portfolio_risk,
        "portfolioRisk": overall_portfolio_risk,
        "diversificationScore": diversification_score,
        "expected_cagr": expected_cagr,
        "investmentCorpus": total_corpus,
        "monthlyDeployment": effective_monthly_deployment,
        "recommendationCount": len(recommendations_list),
        "categoryBreakdown": category_counts,
        "recommendations": recommendations_list,
        "candidates": recommendations_list,
        "top_recommendation": top_recommendation,
        "allocation": allocation_list,
        "allocation_dict": alloc_dict,
        "core_allocation_pct": sum(r["allocationPct"] for r in recommendations_list if r["bucket"] == "CORE"),
        "safety_allocation_pct": sum(r["allocationPct"] for r in recommendations_list if r["bucket"] == "SAFETY"),
        "goal_specific_allocation_pct": sum(r["allocationPct"] for r in recommendations_list if r["bucket"] == "GOAL_SPECIFIC"),
        "long_term_growth_allocation_pct": sum(r["allocationPct"] for r in recommendations_list if r["bucket"] == "LONG_TERM_GROWTH"),
        "equity_total_pct": equity_total_pct,
        "debt_total_pct": debt_total_pct,
        "gold_total_pct": gold_total_pct,
        "global_total_pct": global_total_pct,
        "rationale": rationale
    }
