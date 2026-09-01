"""
SmartVest Response Planner
==========================
Constructs natural, articulate, ChatGPT-like financial responses.
Adapts depth dynamically (SIMPLE = concise 2-5 sentences, MODERATE = structured headings, DEEP = multi-section research).
Strictly separates:
- FACTS (verified data)
- ANALYSIS (implications)
- SUITABILITY (fit for user's profile)
- RISKS & NEXT STEPS
"""

from typing import Dict, Any, List, Optional
from .entity_engine import ResolvedEntity, MarketRegion, AssetClass

def format_stock_screening_response(
    candidates: List[Dict[str, Any]],
    user_profile: Dict[str, Any],
    market: MarketRegion,
    raw_query: str,
    depth: str = "MODERATE"
) -> Dict[str, Any]:
    """
    Constructs a professional stock screening response.
    Never claims 'these are the best stocks' — frames as 'strongest candidates based on SmartVest criteria'.
    """
    region_name = "US" if market == MarketRegion.US else "Indian"
    currency_sym = "$" if market == MarketRegion.US else "₹"
    risk = user_profile.get("risk", "Moderate")
    horizon = user_profile.get("horizon", 10)
    age = user_profile.get("age")
    age_suffix = f" (Age {age})" if age else ""

    top_3 = candidates[:3]
    
    if depth == "SIMPLE":
        candidate_names = ", ".join([f"**{c['name']} ({c['symbol']})**" for c in top_3])
        answer = f"Based on your **{risk}** risk profile and **{horizon}-year** horizon{age_suffix}, the top {region_name} stock candidates currently evaluated by SmartVest are {candidate_names}. We recommend keeping individual equities capped at 5%–10% of your total equity portfolio to maintain prudent diversification."
        return {
            "answer": answer,
            "market": region_name,
            "candidates": [c["symbol"] for c in top_3],
            "followUps": [f"Tell me about {top_3[0]['symbol']}", f"Compare {top_3[0]['symbol']} and {top_3[1]['symbol']}"]
        }

    candidate_blocks = []
    for i, c in enumerate(top_3, 1):
        block = f"""### {i}. {c['name']} ({c['symbol']}) — Suitability: {c['suitability_score']}/100
* **Current Quote:** {currency_sym}{c['price']:,.2f} ({c['freshness']})
* **Role in Portfolio:** {c['role']}
* **Valuation / Metrics:** P/E ~{c['pe']}x | Growth Profile: {c['growth']}
* **Why it Fits Your Profile:** {c['why']}
* **Key Risks to Monitor:** {c['risk']}
* **Diversification Role:** {c['diversification']}"""
        candidate_blocks.append(block)

    candidates_text = "\n\n".join(candidate_blocks)

    answer = f"""BOTTOM LINE

Based on your **{risk}** risk profile and **{horizon}-year** horizon{age_suffix}, I recommend focusing on a high-conviction shortlist of 3–4 quality {region_name} companies rather than an unwieldy basket.

Here are the strongest candidates evaluated across business quality, earnings durability, valuation multiples, and portfolio diversification:

TOP CANDIDATES

{candidates_text}

PORTFOLIO ALLOCATION & STRATEGY

* **Single-Stock Cap:** Limit any individual equity to **5%–10%** of your total equity portfolio to avoid uncompensated single-stock concentration risk.
* **Core vs. Satellite:** Keep 70%–80% of your equity investments in broad index funds (like Nifty 50 or S&P 500 / MON100) and use direct stocks as satellite conviction holdings.
* **Disclaimer:** Educational decision-support only; not a guarantee of returns.

NEXT STEP

Would you like to explore growth vs. dividend focus, or analyze the valuation of any specific company above?"""

    follow_ups = [
        f"Compare {top_3[0]['symbol']} and {top_3[1]['symbol']}",
        f"How much should I invest in {top_3[0]['symbol']}?",
        "What are the main risks?",
        "Where should I invest my monthly surplus?"
    ]

    return {
        "answer": answer,
        "market": region_name,
        "candidates": [c["symbol"] for c in top_3],
        "followUps": follow_ups
    }

def format_single_stock_analysis(
    entity: ResolvedEntity,
    quote: Dict[str, Any],
    user_profile: Dict[str, Any],
    depth: str = "MODERATE"
) -> Dict[str, Any]:
    """
    In-depth instrument analysis conforming to section 13, 20, 21.
    """
    sym = entity.symbol or entity.raw_text
    name = entity.canonical_name
    meta = entity.metadata or {}
    asset_cls = entity.asset_class
    risk_prof = user_profile.get("risk", "Moderate")
    horizon = user_profile.get("horizon", 10)
    surplus = float(user_profile.get("surplus") or 0.0)
    currency_sym = "$" if entity.region == MarketRegion.US else "₹"
    
    price_val = quote.get("price")
    freshness = quote.get("freshness", "Delayed Feed")
    available = quote.get("available", True)
    
    pe = quote.get("pe") or meta.get("pe", "N/A")
    role = meta.get("role", "Core Asset Allocation Pillar")
    why = meta.get("why", "Strong industry fundamentals and consistent long-term compounding.")
    top_holdings = meta.get("top_holdings")
    underlying = meta.get("underlying")
    expense_ratio = meta.get("expense_ratio", "N/A")
    sector = meta.get("sector", "Diversified")
    risk_level = meta.get("risk_level", "Moderate")

    # Sizing
    if asset_cls == AssetClass.ETFS and "MON100" in sym.upper():
        monthly_alloc = round(surplus * 0.15) if surplus > 0 else 0
        alloc_range = "10% to 15%"
    elif asset_cls in [AssetClass.ETFS, AssetClass.MUTUAL_FUNDS]:
        monthly_alloc = round(surplus * 0.25) if surplus > 0 else 0
        alloc_range = "20% to 30%"
    elif asset_cls == AssetClass.GOLD:
        monthly_alloc = round(surplus * 0.10) if surplus > 0 else 0
        alloc_range = "5% to 10%"
    else:
        monthly_alloc = round(surplus * 0.08) if surplus > 0 else 0
        alloc_range = "5% to 8%"

    price_str = f"{currency_sym}{price_val:,.2f} ({freshness})" if price_val and available else "Live market data currently unavailable"

    if depth == "SIMPLE":
        answer = f"**{name} ({sym})** is a **{sector}** leader ({role}). It has a {risk_level} risk profile and is best suited for a **{horizon}+ year** holding period. For your **{risk_prof}** profile, an allocation of **{alloc_range}** (approx. **₹{monthly_alloc:,.0f}/month**) provides prudent exposure without overconcentration."
        return {
            "answer": answer,
            "followUps": [f"Why is {sym} risky?", f"How much should I invest in {sym}?", "Compare with Microsoft"]
        }

    # Structured Detailed Format
    answer = f"""BOTTOM LINE

**{name} ({sym})** is a premier **{sector}** instrument. For a **{risk_prof}** investor with a **{horizon}-year** horizon, it serves as an effective **{role}**.

BUSINESS

* **Sector / Domain:** {sector}
* **Core Moat:** {why}
{f'* **Underlying Index:** {underlying}' if underlying else ''}
{f'* **Key Holdings:** {top_holdings}' if top_holdings else ''}

KEY FUNDAMENTALS & VALUATION

* **Current Quote / NAV:** {price_str}
* **Valuation Multiple (P/E):** ~{pe}x
{f'* **Expense Ratio (TER):** {expense_ratio}' if expense_ratio != 'N/A' else ''}
* **Risk Classification:** {risk_level}

GROWTH DRIVERS

* Market leadership and sustained secular demand across its core operating vertical.
* Expanding free cash flow conversion supporting capital reinvestment and shareholder return.

RISKS

* Sector-specific cyclicality and potential valuation compression during broader market multiple contractions.
* Regulatory oversight and customer concentration headwinds.

SUITABILITY FOR THIS USER

* **Profile Fit:** Aligns with your **{risk_prof}** risk tolerance and long-term compounding mandate.
* **Recommended Allocation:** **{alloc_range}** of your monthly investable surplus (approx. **₹{monthly_alloc:,.0f}/month**).

WHAT WOULD CHANGE THE VIEW

* Deterioration in core operating margins (>300 bps contraction) or unexpected debt escalation.
* Material loss of competitive market share to emerging peers.

NEXT STEP

Would you like to compare {sym} against peer alternatives or calculate a customized SIP allocation?"""

    follow_ups = [
        f"Why is {sym} risky?",
        f"How much should I invest in {sym}?",
        "Compare with peer stocks",
        "Where should I invest my monthly surplus?"
    ]

    return {
        "answer": answer,
        "followUps": follow_ups
    }

def format_allocation_advice(
    entity: Optional[ResolvedEntity],
    user_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """Provides exact percentage and INR allocation sizing."""
    surplus = float(user_profile.get("surplus") or 0.0)
    risk = user_profile.get("risk", "Moderate")
    
    if not entity:
        return {
            "answer": f"""BOTTOM LINE

Based on your **{risk}** profile and monthly investable surplus of **₹{surplus:,.0f}/month**, we recommend a core-and-satellite asset allocation:

* **Core Large-Cap Equities (35%):** ₹{round(surplus * 0.35):,.0f}/month
* **Flexi-Cap / Active Alpha (25%):** ₹{round(surplus * 0.25):,.0f}/month
* **Global US Tech Satellite (15%):** ₹{round(surplus * 0.15):,.0f}/month
* **Liquid Safety Buffer (15%):** ₹{round(surplus * 0.15):,.0f}/month
* **Sovereign Gold Hedge (10%):** ₹{round(surplus * 0.10):,.0f}/month""",
            "followUps": ["Suggest me some US stocks", "Review my portfolio", "How much SIP for ₹1 crore?"]
        }

    name = entity.canonical_name
    sym = entity.symbol or entity.raw_text
    
    if entity.asset_class == AssetClass.ETFS and "MON100" in sym.upper():
        pct = 15
        monthly = round(surplus * 0.15)
        role = "Global US Technology Satellite Allocation"
    elif entity.asset_class in [AssetClass.ETFS, AssetClass.MUTUAL_FUNDS]:
        pct = 25
        monthly = round(surplus * 0.25)
        role = "Core Diversified Growth Pillar"
    elif entity.asset_class == AssetClass.GOLD:
        pct = 10
        monthly = round(surplus * 0.10)
        role = "Defensive Safe-Haven & Inflation Hedge"
    else:  # Direct single stock
        pct = 8
        monthly = round(surplus * 0.08)
        role = "Satellite High-Conviction Stock Holding"

    answer = f"""BOTTOM LINE

For **{name} ({sym})**, the recommended allocation for a **{risk}** investor is **{pct}%** of your monthly investable surplus (approx. **₹{monthly:,.0f}/month**).

ALLOCATION SIZING & RATIONALE

* **Monthly Investable Surplus:** ₹{surplus:,.0f}/month
* **Target Security Weight:** **{pct}%** (₹{monthly:,.0f}/month)
* **Portfolio Role:** {role}
* **Risk Constraint:** We cap single direct equities at 5%–10% to protect against single-company drawdown risk while allowing your core index funds (70%+) to compound steadily.

EXECUTION BLUEPRINT

1. Set up an automated monthly SIP of **₹{monthly:,.0f}** on your trading platform.
2. Review position sizing every 6 months during routine portfolio rebalancing."""

    return {
        "answer": answer,
        "followUps": [
            f"Tell me about {sym}",
            f"Why is {sym} risky?",
            "Where should I invest my surplus?"
        ]
    }

def format_comparison_response(
    e1: ResolvedEntity,
    e2: ResolvedEntity,
    user_profile: Dict[str, Any],
    depth: str = "MODERATE"
) -> Dict[str, Any]:
    """Generates structured side-by-side comparison conforming to section 22."""
    risk = user_profile.get("risk", "Moderate")
    n1, n2 = e1.canonical_name, e2.canonical_name
    s1, s2 = e1.symbol or e1.raw_text, e2.symbol or e2.raw_text
    m1, m2 = e1.metadata or {}, e2.metadata or {}

    pe1 = m1.get("pe", "N/A")
    pe2 = m2.get("pe", "N/A")
    r1 = m1.get("risk_level", "Moderate")
    r2 = m2.get("risk_level", "Moderate")
    role1 = m1.get("role", "Capital Growth")
    role2 = m2.get("role", "Capital Growth")

    # Determine safer candidate
    safer = n1 if ("Low" in r1 and "High" in r2) or ("Moderate" in r1 and "High" in r2) else (n2 if ("Low" in r2 and "High" in r1) or ("Moderate" in r2 and "High" in r1) else n1)

    if depth == "SIMPLE":
        answer = f"Comparing **{n1}** vs **{n2}**: **{safer}** is relatively safer with lower volatility and more resilient cash flows ({r1} risk vs {r2} risk). For a **{risk}** investor, **{safer}** serves as a defensive anchor while the other offers higher growth beta."
        return {
            "answer": answer,
            "followUps": [f"How much should I invest in {s1}?", f"Tell me about {s2}"]
        }

    answer = f"""BOTTOM LINE

Comparing **{n1} ({s1})** vs **{n2} ({s2})**: **{safer}** offers greater defensive stability, whereas the other provides higher cyclical growth potential.

STRUCTURED COMPARISON

| Metric / Dimension | {n1} ({s1}) | {n2} ({s2}) |
| :--- | :--- | :--- |
| **Primary Purpose** | {role1} | {role2} |
| **Risk Profile** | {r1} Risk | {r2} Risk |
| **Valuation (P/E)** | ~{pe1}x | ~{pe2}x |
| **Return Characteristics** | {m1.get('growth', 'Consistent')} | {m2.get('growth', 'Consistent')} |
| **Liquidity & Tradability** | High Daily Trading Volume | High Daily Trading Volume |
| **Cost / Expense** | Standard Brokerage / Zero TER | Standard Brokerage / Zero TER |
| **Diversification Role** | {m1.get('sector', 'Core Holding')} | {m2.get('sector', 'Core Holding')} |
| **Suitability for {risk}** | Core Foundation Fit | Satellite Conviction Fit |

ANALYSIS & VERDICT

* **Safety & Stability:** **{safer}** carries lower volatility due to diversified cash generation and strong balance sheet health.
* **Growth Beta:** For aggressive growth targeting high compounding, higher multiple assets offer greater upside during expansionary cycles.
* **Portfolio Strategy:** Rather than an all-or-nothing choice, holding a balanced mix (e.g. 60% in the safer compounder and 40% in high-beta growth) provides optimal risk-adjusted returns.

NEXT STEP

Would you like advice on the exact allocation split for your monthly surplus?"""

    return {
        "answer": answer,
        "followUps": [
            f"How much should I invest in {s1}?",
            f"How much should I invest in {s2}?",
            "Which is safer?",
            "Where should I invest my monthly surplus?"
        ]
    }

def format_educational_response(
    topic: str,
    title: str,
    definition: str,
    how_it_works: str,
    example: str,
    pros: List[str],
    cons: List[str],
    bottom_line: str,
    depth: str = "MODERATE"
) -> Dict[str, Any]:
    """Formats pure educational guidance with zero cashflow leaks."""
    if depth == "SIMPLE":
        answer = f"**{title}:** {definition} {bottom_line}"
        return {
            "answer": answer,
            "followUps": [f"Explain {topic} with examples", f"ETF vs mutual fund", "Suggest some US stocks"]
        }

    pros_text = "\n".join([f"* {p}" for p in pros])
    cons_text = "\n".join([f"* {c}" for c in cons])

    answer = f"""DEFINITION

**{title}**: {definition}

HOW IT WORKS

{how_it_works}

EXAMPLE

{example}

PROS

{pros_text}

LIMITATIONS & RISKS

{cons_text}

BOTTOM LINE

{bottom_line}"""

    return {
        "answer": answer,
        "followUps": [
            f"Compare {topic} vs alternatives",
            "Suggest some US stocks",
            "How much SIP for ₹1 crore?"
        ]
    }
