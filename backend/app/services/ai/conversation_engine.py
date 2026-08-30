"""
SmartVest Master Conversation Engine
====================================
Top-level conversational reasoning controller and orchestrator.
Transforms the assistant into a professional ChatGPT-like financial co-pilot.
Intelligently decomposes queries, tracks multi-turn conversational memory,
selects deterministic tools, formats responses across depths, and applies
18-point verification guardrails with safe fallback.
"""

import uuid
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from .entity_engine import (
    resolve_entities,
    extract_market_region,
    extract_asset_class,
    ConversationalMemory,
    MarketRegion,
    AssetClass,
    ResolvedEntity,
    KNOWN_EQUITIES,
    KNOWN_ETFS,
    KNOWN_MUTUAL_FUNDS,
    KNOWN_COMMODITIES_AND_BONDS
)
from .intent_engine import (
    classify_intent,
    ConversationalIntent,
    normalize_conversational_text,
    detect_depth_level,
    decompose_intents
)
from .context_engine import (
    get_context_for_intent,
    extract_user_profile_context
)
from .tool_router import (
    screen_stocks,
    screen_etfs,
    get_market_quote_data,
    get_technical_signals,
    get_fundamental_summary
)
from .response_planner import (
    format_stock_screening_response,
    format_single_stock_analysis,
    format_allocation_advice,
    format_comparison_response,
    format_educational_response
)
from .response_validator import validate_conversational_response

# Shared in-memory conversation memory store keyed by session/request
_CONVERSATION_MEMORY = ConversationalMemory()

def process_conversational_query(
    query: str,
    user_context: Optional[Dict[str, Any]] = None,
    history: Optional[List[Dict[str, Any]]] = None,
    request_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Master entrypoint for SmartVest Conversational Financial AI.
    Executes the complete understanding -> reasoning -> routing -> execution -> validation pipeline.
    """
    req_id = request_id or str(uuid.uuid4())
    norm_q = normalize_conversational_text(query)
    q_low = query.lower()

    # 1. Update memory from multi-turn history if provided
    if history:
        for turn in history[-5:]:
            q_prev = turn.get("question") or turn.get("user") or ""
            prev_entities = resolve_entities(q_prev, memory=None)
            if prev_entities:
                for pe in prev_entities:
                    _CONVERSATION_MEMORY.push_entity(pe)
                if len(prev_entities) >= 2:
                    _CONVERSATION_MEMORY.comparison_entities = list(prev_entities[:2])

    # 2. Intent Classification & Depth Detection
    intent, intent_meta = classify_intent(norm_q, history=history)
    depth = intent_meta.get("depth", "MODERATE")
    sub_intents = intent_meta.get("sub_intents", [])

    # 3. Entity & Market Resolution
    market_region = extract_market_region(norm_q)
    if market_region == MarketRegion.UNKNOWN and _CONVERSATION_MEMORY.last_market != MarketRegion.UNKNOWN:
        market_region = _CONVERSATION_MEMORY.last_market

    entities = resolve_entities(norm_q, memory=_CONVERSATION_MEMORY)

    # 4. Context Conditioning Policy
    context_mode, scoped_ctx = get_context_for_intent(intent, user_context)
    user_prof = extract_user_profile_context(user_context)

    # 5. Tool Selection & Execution
    response_payload: Dict[str, Any] = {
        "requestId": req_id,
        "question": query,
        "intent": intent.value,
        "contextMode": context_mode,
        "entities": [e.canonical_name for e in entities],
        "marketData": {},
        "calculations": {},
        "recommendations": [],
        "warnings": [],
        "sources": [],
        "followUps": []
    }

    # --- HANDLER 1: STOCK SCREENING / RECOMMENDATIONS ---
    if intent in [ConversationalIntent.STOCK_SCREENING, ConversationalIntent.PERSONALIZED_INVESTMENT_REQUEST]:
        region = market_region if market_region != MarketRegion.UNKNOWN else MarketRegion.US
        candidates = screen_stocks(region, user_prof, style=intent_meta.get("style"))
        res = format_stock_screening_response(candidates, user_prof, region, query, depth=depth)
        response_payload["answer"] = res["answer"]
        response_payload["followUps"] = res["followUps"]
        response_payload["recommendations"] = res["candidates"]
        _CONVERSATION_MEMORY.update_from_turn(entities, region, intent.value, candidates=res["candidates"])

    # --- HANDLER 2: COMPARISONS (Equities, ETFs, Gold vs Debt, etc.) ---
    elif intent in [
        ConversationalIntent.STOCK_COMPARISON,
        ConversationalIntent.ETF_COMPARISON,
        ConversationalIntent.GOLD_COMPARISON,
        ConversationalIntent.BOND_COMPARISON
    ] or (len(entities) >= 2 and any(k in q_low for k in ["compare", " vs ", "versus", "difference between", "better", "safer"])) or (any(k in q_low for k in ["which is safer", "which one is safer", "safer", "which is more risky"]) and len(_CONVERSATION_MEMORY.entity_stack) >= 2):
        if len(entities) >= 2:
            e1, e2 = entities[0], entities[1]
            res = format_comparison_response(e1, e2, user_prof, depth=depth)
            response_payload["answer"] = res["answer"]
            response_payload["followUps"] = res["followUps"]
            _CONVERSATION_MEMORY.update_from_turn(entities, market_region, intent.value)
        elif any(k in q_low for k in ["which is safer", "which one is safer", "safer", "which is more risky"]) and len(_CONVERSATION_MEMORY.entity_stack) >= 2:
            e1 = _CONVERSATION_MEMORY.entity_stack[-2]
            e2 = _CONVERSATION_MEMORY.entity_stack[-1]
            res = format_comparison_response(e1, e2, user_prof, depth=depth)
            response_payload["answer"] = res["answer"]
            response_payload["followUps"] = res["followUps"]
        else:
            from app.services.ai_assistant import comparisonHandler
            legacy_res = comparisonHandler(query, {}, user_prof, req_id)
            response_payload = legacy_res

    # --- HANDLER 3: ALLOCATION ADVICE & SIZING ---
    elif intent == ConversationalIntent.ALLOCATION_ADVICE:
        target_entity = entities[0] if entities else None
        res = format_allocation_advice(target_entity, user_prof)
        response_payload["answer"] = res["answer"]
        response_payload["followUps"] = res["followUps"]

    # --- HANDLER 4: RISK ANALYSIS / WHY IS IT RISKY? ---
    elif intent == ConversationalIntent.RISK_ANALYSIS:
        target_entity = entities[0] if entities else None
        risk_prof = user_prof.get("risk", "Moderate")
        if target_entity:
            name = target_entity.canonical_name
            sym = target_entity.symbol or target_entity.raw_text
            meta = target_entity.metadata or {}
            risk_level = meta.get("risk_level", "Moderate to High")
            why_risk = meta.get("risk", "Cyclical industry dynamics and valuation multiple compression risk.")
            response_payload["answer"] = f"""BOTTOM LINE

**{name} ({sym})** carries a **{risk_level}** risk profile.

RISK FACTORS

* **Business / Valuation Risk:** {why_risk}
* **Market Beta:** Vulnerable to broader macroeconomic headwinds and sector rotation drawdowns.
* **Single-Stock Constraint:** Holding individual equities exposes you to uncompensated unsystematic risk compared to broad index funds.

WHAT THIS MEANS FOR YOU

As a **{risk_prof}** investor, SmartVest recommends limiting direct exposure to **5%–10%** of your equity portfolio and anchoring 70%+ in diversified index funds."""
            response_payload["followUps"] = [
                f"How much should I invest in {sym}?",
                f"Tell me about {sym}",
                "Where should I invest my monthly surplus?"
            ]
            _CONVERSATION_MEMORY.update_from_turn(entities, target_entity.region, intent.value)
        else:
            from app.services.ai_assistant import generate_ai_assistant_response
            legacy_res = generate_ai_assistant_response(query=query, user_context=user_context, history=history, request_id=req_id)
            response_payload = legacy_res

    # --- HANDLER 5: SINGLE INSTRUMENT ANALYSIS ---
    elif intent in [
        ConversationalIntent.STOCK_ANALYSIS,
        ConversationalIntent.ETF_ANALYSIS,
        ConversationalIntent.MUTUAL_FUND_ANALYSIS,
        ConversationalIntent.GOLD_ANALYSIS
    ] and entities:
        target_entity = entities[0]
        quote = get_market_quote_data(target_entity.symbol or target_entity.raw_text)
        res = format_single_stock_analysis(target_entity, quote, user_prof, depth=depth)
        response_payload["answer"] = res["answer"]
        response_payload["followUps"] = res["followUps"]
        response_payload["marketData"] = quote
        _CONVERSATION_MEMORY.update_from_turn(entities, target_entity.region, intent.value)

    # --- HANDLER 6: SURPLUS ALLOCATION & PERSONAL CASHFLOW ---
    elif intent == ConversationalIntent.SURPLUS_ALLOCATION:
        response_payload["intent"] = "INVESTMENT_RECOMMENDATION"
        income = float(user_prof.get("income", 0.0))
        expenses = float(user_prof.get("expenses", 0.0))
        surplus = float(user_prof.get("surplus", 0.0))
        risk = user_prof.get("risk", "Moderate")
        savings_rate = round((surplus / income) * 100) if income > 0 else 0

        if surplus <= 0:
            response_payload["answer"] = f"""BOTTOM LINE

Your monthly income (₹{income:,.0f}) is fully consumed by living outflows (₹{expenses:,.0f}), resulting in **₹0 investable capacity**.

ACTIONABLE GUIDANCE

* Do not deploy capital into market investments until an emergency reserve (3–6 months of expenses) is secured.
* Focus on optimizing expense leaks to build a positive monthly surplus."""
            response_payload["followUps"] = ["How much emergency fund do I need?", "Can I afford a ₹10 lakh car?"]
        elif ("what is my" in q_low or "tell me my" in q_low or "how much is my" in q_low or "show my" in q_low) and any(k in q_low for k in ["surplus", "income", "salary", "expense", "expenses", "cashflow"]):
            if "income" in q_low or "salary" in q_low:
                focus_title = f"Your current monthly income is **₹{income:,.0f}/month** with an investable surplus of **₹{surplus:,.0f}/month**."
            elif "expense" in q_low:
                focus_title = f"Your current monthly living expenses are **₹{expenses:,.0f}/month** against an income of **₹{income:,.0f}/month**."
            else:
                focus_title = f"Your current monthly investable surplus is **₹{surplus:,.0f}/month**."

            response_payload["answer"] = f"""BOTTOM LINE

{focus_title}

CASHFLOW BREAKDOWN

* **Monthly Inflow (Income):** ₹{income:,.0f}
* **Monthly Living Outflows (Expenses):** ₹{expenses:,.0f}
* **Net Investable Surplus:** **₹{surplus:,.0f}/month** ({savings_rate}% Savings Rate)

NEXT STEP

Would you like to explore how to allocate your ₹{surplus:,.0f}/month across index funds, global ETFs, and gold?"""
            response_payload["followUps"] = [
                "Where should I invest my surplus?",
                "Suggest me some US stocks",
                "How much SIP for ₹1 crore?"
            ]
        else:
            # Multi-asset deployment
            alloc_index = round(surplus * 0.35)
            alloc_flexi = round(surplus * 0.25)
            alloc_global = round(surplus * 0.15)
            alloc_liquid = round(surplus * 0.15)
            alloc_gold = round(surplus * 0.10)

            response_payload["answer"] = f"""BOTTOM LINE

Based on your **{risk}** profile and monthly investable surplus of **₹{surplus:,.0f}/month**, SmartVest recommends deploying your capital into a disciplined multi-asset blueprint:

RECOMMENDED ASSET ALLOCATION

1. **Indian Core Large-Cap (35% — ₹{alloc_index:,.0f}/mo):** UTI Nifty 50 Index Fund Direct / NiftyBeES
2. **Multi-Cap Alpha (25% — ₹{alloc_flexi:,.0f}/mo):** Parag Parikh Flexi Cap Fund Direct
3. **Global Tech Diversification (15% — ₹{alloc_global:,.0f}/mo):** Motilal Oswal Nasdaq 100 ETF (MON100)
4. **Liquid / Safety Buffer (15% — ₹{alloc_liquid:,.0f}/mo):** ICICI Prudential Liquid Fund Direct
5. **Sovereign Gold Hedge (10% — ₹{alloc_gold:,.0f}/mo):** Sovereign Gold Bonds / GoldBeES

WHY THIS FITS

* **Total Capital Deployed:** 100% (₹{surplus:,.0f}/month)
* **Risk Shield:** 25% allocated to liquid reserves and gold cushions downside volatility while 75% compound equity wealth.
* **Execution:** Set up automated monthly AutoPay mandates on the 5th of every month."""
            response_payload["followUps"] = [
                "Suggest me some US stocks",
                "Why MON100?",
                "How much SIP for ₹1 crore?"
            ]

    # --- HANDLER 7: GREETING ---
    elif intent == ConversationalIntent.GREETING:
        response_payload["answer"] = """Hi! I'm your SmartVest AI Advisor.

I can help you analyze investments, screen US & Indian stocks, review your portfolio diversification, calculate loan affordability, or explain any financial concept.

What would you like to explore today?"""
        response_payload["followUps"] = [
            "Suggest US stocks for me",
            "Suggest Indian stocks",
            "Review my portfolio",
            "How much SIP for ₹1 crore?"
        ]

    # --- HANDLER 8: GOAL PLANNING ---
    elif intent == ConversationalIntent.GOAL_PLANNING:
        from app.services.ai_assistant import goalHandler
        response_payload = goalHandler(query, {}, user_prof, req_id)

    # --- HANDLER 9: SIP / COMPOUNDING CALCULATION ---
    elif intent in [ConversationalIntent.SIP_CALCULATION, ConversationalIntent.COMPOUNDING_CALCULATION]:
        from app.services.ai_assistant import sipHandler
        response_payload = sipHandler(query, {}, user_prof, req_id)

    # --- HANDLER 10: AFFORDABILITY ---
    elif intent == ConversationalIntent.AFFORDABILITY:
        from app.services.ai_assistant import affordabilityHandler
        response_payload = affordabilityHandler(query, {}, user_prof, req_id)

    # --- HANDLER 11: PORTFOLIO REVIEW ---
    elif intent == ConversationalIntent.PORTFOLIO_REVIEW:
        from app.services.ai_assistant import portfolioHandler
        response_payload = portfolioHandler(query, {}, user_prof, req_id)

    # --- HANDLER 12: EMERGENCY FUND ---
    elif intent == ConversationalIntent.EMERGENCY_FUND:
        from app.services.ai_assistant import emergencyFundHandler
        response_payload = emergencyFundHandler(query, {}, user_prof, req_id)

    # --- HANDLER 13: MARKET DATA & ANALYSIS ---
    elif intent in [ConversationalIntent.MARKET_DATA, ConversationalIntent.MARKET_ANALYSIS]:
        from app.services.ai_assistant import marketHandler
        response_payload = marketHandler(query, {}, user_prof, req_id)

    # --- HANDLER 14: EDUCATION & FALLBACK ---
    else:
        from app.services.ai_assistant import educationalHandler
        response_payload = educationalHandler(query, {}, user_prof, req_id)

    # 6. Response Validation & Accuracy Guardrail
    validation = validate_conversational_response(
        query=query,
        intent=intent,
        response=response_payload,
        context_mode=context_mode,
        entities=[e.canonical_name for e in entities]
    )

    if not validation.is_valid:
        for issue in validation.issues:
            if "Forbidden robotic concept definition pattern" in issue:
                candidates = screen_stocks(MarketRegion.US, user_prof)
                res = format_stock_screening_response(candidates, user_prof, MarketRegion.US, query, depth=depth)
                response_payload["answer"] = res["answer"]
                response_payload["followUps"] = res["followUps"]
                break

    return response_payload
