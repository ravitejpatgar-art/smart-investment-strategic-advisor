"""
Universal Financial Intent Understanding & Entity Extraction Engine.
Provides semantic query normalization, hierarchical intent taxonomy, multilingual handling, 
and required-data dependency determination for SmartVest AI.
"""

import re
from enum import Enum
from typing import Dict, Any, List, Optional, Tuple
from app.services.financial_knowledge.entity_resolver import (
    resolve_financial_entities,
    extract_currency_amounts,
    extract_time_horizons,
    EntityType,
    ResolvedEntity
)

# -----------------------------------------------------------------------------
# 1. HIERARCHICAL TAXONOMY ENUMS & CONSTANTS
# -----------------------------------------------------------------------------

class IntentCategory(str, Enum):
    EDUCATION = "EDUCATION"
    MARKET_DATA = "MARKET_DATA"
    INSTRUMENT_ANALYSIS = "INSTRUMENT_ANALYSIS"
    COMPARISON = "COMPARISON"
    CALCULATION = "CALCULATION"
    PERSONAL_FINANCIAL_ADVICE = "PERSONAL_FINANCIAL_ADVICE"
    PORTFOLIO = "PORTFOLIO"
    GOALS = "GOALS"
    CASHFLOW = "CASHFLOW"
    RISK = "RISK"
    TAX_EDUCATION = "TAX_EDUCATION"
    MACROECONOMICS = "MACROECONOMICS"
    RETIREMENT = "RETIREMENT"
    DEBT_LOANS = "DEBT_LOANS"
    INSURANCE = "INSURANCE"
    BANKING_CASH = "BANKING_CASH"
    GENERAL_FINANCIAL_PLANNING = "GENERAL_FINANCIAL_PLANNING"
    GREETING = "GREETING"
    CLARIFICATION = "CLARIFICATION"

# Backwards compatibility legacy intent constants
INTENT_GENERAL_FINANCIAL_EDUCATION = "GENERAL_FINANCIAL_EDUCATION"
INTENT_INVESTMENT_RECOMMENDATION = "INVESTMENT_RECOMMENDATION"
INTENT_ETF_COMPARISON = "ETF_COMPARISON"
INTENT_FUND_COMPARISON = "FUND_COMPARISON"
INTENT_MARKET_QUESTION = "MARKET_QUESTION"
INTENT_STOCK_ANALYSIS = "STOCK_ANALYSIS"
INTENT_AFFORDABILITY = "AFFORDABILITY"
INTENT_GOAL_PLANNING = "GOAL_PLANNING"
INTENT_RETIREMENT_PLANNING = "RETIREMENT_PLANNING"
INTENT_SIP_CALCULATION = "SIP_CALCULATION"
INTENT_EMERGENCY_FUND = "EMERGENCY_FUND"
INTENT_PORTFOLIO_REVIEW = "PORTFOLIO_REVIEW"
INTENT_WHY_RECOMMENDED = "WHY_RECOMMENDED"
INTENT_WHY_NOT_RECOMMENDED = "WHY_NOT_RECOMMENDED"
INTENT_TAX_GENERAL_EDUCATION = "TAX_GENERAL_EDUCATION"
INTENT_GREETING = "GREETING"
INTENT_AMBIGUOUS_CLARIFICATION = "AMBIGUOUS_CLARIFICATION"
INTENT_SURPLUS_ALLOCATION = "SURPLUS_ALLOCATION"
INTENT_EXPENSE_ANALYSIS = "EXPENSE_ANALYSIS"
INTENT_RISK_EXPLANATION = "RISK_EXPLANATION"
INTENT_COMPOUNDING = "COMPOUNDING"
INTENT_INFLATION = "INFLATION"

class EducationalTopic:
    ETF = "ETF"
    SIP = "SIP"
    MUTUAL_FUND = "MUTUAL_FUND"
    INDEX_FUND = "INDEX_FUND"
    STOCK = "STOCK"
    BOND = "BOND"
    DEBT_FUND = "DEBT_FUND"
    LIQUID_FUND = "LIQUID_FUND"
    GOLD_ETF = "GOLD_ETF"
    SGB = "SGB"
    HEDGE_FUND = "HEDGE_FUND"
    PRIVATE_EQUITY = "PRIVATE_EQUITY"
    REIT = "REIT"
    INVIT = "INVIT"
    IPO = "IPO"
    FPO = "FPO"
    OFS = "OFS"
    PE_RATIO = "PE_RATIO"
    PB_RATIO = "PB_RATIO"
    EPS = "EPS"
    ROE = "ROE"
    ROCE = "ROCE"
    BETA = "BETA"
    ALPHA = "ALPHA"
    SHARPE_RATIO = "SHARPE_RATIO"
    NAV = "NAV"
    AUM = "AUM"
    EXPENSE_RATIO = "EXPENSE_RATIO"
    CAGR = "CAGR"
    XIRR = "XIRR"
    COMPOUNDING = "COMPOUNDING"
    INFLATION = "INFLATION"
    DIVERSIFICATION = "DIVERSIFICATION"
    ASSET_ALLOCATION = "ASSET_ALLOCATION"
    MARKET_CAP = "MARKET_CAP"
    VOLATILITY = "VOLATILITY"
    RISK = "RISK"
    DIVIDEND = "DIVIDEND"
    EMERGENCY_FUND = "EMERGENCY_FUND"
    ETF_COMPARISON = "ETF_COMPARISON"
    UNKNOWN = "UNKNOWN"

# -----------------------------------------------------------------------------
# 2. NATURAL LANGUAGE & MULTILINGUAL NORMALIZATION
# -----------------------------------------------------------------------------

def normalize_query_language(raw_query: str) -> str:
    """
    Normalizes common colloquial variations, typos, and Hinglish queries into canonical forms.
    Examples:
      'ipo kya hai' -> 'what is ipo'
      'etf kya hota hai' -> 'what is etf'
      'sip kya hai' -> 'what is sip'
      'where shud i invest' -> 'where should i invest'
      'which mf is better' -> 'which mutual fund is better'
      'gold kyu badh raha hai' -> 'why is gold rising'
      'market kyu gir raha hai' -> 'why did market fall'
    """
    q = raw_query.lower().strip()
    
    # Common Hinglish phrases
    q = re.sub(r'\b(kya\s+hai|kya\s+hota\s+hai|kise\s+kehte\s+hai)\b', '', q)
    if "kya" in raw_query.lower() and not q.startswith("what is"):
        q = "what is " + q.strip()

    # Hinglish market movements
    q = q.replace("kyu badh raha hai", "why is rising")
    q = q.replace("kyu gir raha hai", "why did fall")
    q = q.replace("kaise invest kare", "how to invest")

    # Common spelling contractions
    q = re.sub(r'\bshud\b', 'should', q)
    q = re.sub(r'\bmf\b', 'mutual fund', q)
    q = re.sub(r'\bmfs\b', 'mutual funds', q)
    q = re.sub(r'\bgovt\b', 'government', q)
    q = re.sub(r'\brtns?\b', 'returns', q)
    q = re.sub(r'\bpe\s*ratio\b', 'pe ratio', q)
    q = re.sub(r'\bp/e\b', 'pe ratio', q)

    return q.strip()

# -----------------------------------------------------------------------------
# 3. TOPIC & INSTRUMENT EXTRACTORS
# -----------------------------------------------------------------------------

def extract_educational_topic(query: str) -> str:
    """
    Extracts educational concept using strict multi-tier exact phrase matching.
    """
    q = query.lower().strip()

    # Tier 1: Multi-word and exact specialized expressions
    if re.search(r'\b(initial\s*public\s*offering|\bipos?\b)\b', q):
        return EducationalTopic.IPO
    if re.search(r'\b(follow[- ]on\s*public\s*offering|\bfpos?\b)\b', q):
        return EducationalTopic.FPO
    if re.search(r'\b(offer\s*for\s*sale|\bofs\b)\b', q):
        return EducationalTopic.OFS
    if re.search(r'\bhedge\s*funds?\b', q):
        return EducationalTopic.HEDGE_FUND
    if re.search(r'\bprivate\s*equit(y|ies)\b', q):
        return EducationalTopic.PRIVATE_EQUITY
    if re.search(r'\b(real\s*estate\s*investment\s*trusts?|\breits?\b)\b', q):
        return EducationalTopic.REIT
    if re.search(r'\b(infrastructure\s*investment\s*trusts?|\binvits?\b)\b', q):
        return EducationalTopic.INVIT
    if re.search(r'\b(sovereign\s*gold\s*bonds?|\bsgbs?\b)\b', q):
        return EducationalTopic.SGB
    if re.search(r'\bgold\s*etfs?\b', q):
        return EducationalTopic.GOLD_ETF
    if re.search(r'\b(price[- ]to[- ]earnings|\bp/?e(\s*ratio)?\b)\b', q):
        return EducationalTopic.PE_RATIO
    if re.search(r'\b(price[- ]to[- ]book|\bp/?b(\s*ratio)?\b)\b', q):
        return EducationalTopic.PB_RATIO
    if re.search(r'\b(earnings?\s*per\s*share|\beps\b)\b', q):
        return EducationalTopic.EPS
    if re.search(r'\b(return\s*on\s*equity|\broe\b)\b', q):
        return EducationalTopic.ROE
    if re.search(r'\b(return\s*on\s*capital\s*employed|\broce\b)\b', q):
        return EducationalTopic.ROCE
    if re.search(r'\b(sharpe\s*ratio|\bsharpe\b)\b', q):
        return EducationalTopic.SHARPE_RATIO
    if re.search(r'\b(total\s*expense\s*ratio|expense\s*ratios?|\bter\b)\b', q):
        return EducationalTopic.EXPENSE_RATIO
    if re.search(r'\b(net\s*asset\s*values?|\bnavs?\b)\b', q):
        return EducationalTopic.NAV
    if re.search(r'\b(assets?\s*under\s*management|\baum\b)\b', q):
        return EducationalTopic.AUM
    if re.search(r'\b(compound\s*annual\s*growth(\s*rate)?|\bcagr\b)\b', q):
        return EducationalTopic.CAGR
    if re.search(r'\b(extended\s*internal\s*rate|\bxirr\b)\b', q):
        return EducationalTopic.XIRR
    if re.search(r'\b(compound\s*interest|compounding)\b', q):
        return EducationalTopic.COMPOUNDING
    if re.search(r'\bindex\s*funds?\b', q):
        return EducationalTopic.INDEX_FUND
    if re.search(r'\bliquid\s*funds?\b', q):
        return EducationalTopic.LIQUID_FUND
    if re.search(r'\bdebt\s*funds?\b', q):
        return EducationalTopic.DEBT_FUND
    if re.search(r'\bmutual\s*funds?\b', q):
        return EducationalTopic.MUTUAL_FUND
    if re.search(r'\bemergency\s*funds?\b', q):
        return EducationalTopic.EMERGENCY_FUND
    if re.search(r'\basset\s*allocations?\b', q):
        return EducationalTopic.ASSET_ALLOCATION
    if re.search(r'\bmarket\s*caps?(\s*italization)?\b', q):
        return EducationalTopic.MARKET_CAP
    if re.search(r'\b(volatilit(y|ies)|volatile|india\s*vix|\bvix\b)\b', q):
        return EducationalTopic.VOLATILITY
    if re.search(r'\bdiversifi(cation|ed|y)\b', q):
        return EducationalTopic.DIVERSIFICATION
    if re.search(r'\binflation\b', q):
        return EducationalTopic.INFLATION
    if re.search(r'\bdividends?\b', q):
        return EducationalTopic.DIVIDEND
    if re.search(r'\b(stocks?|shares?|equit(y|ies))\b', q):
        return EducationalTopic.STOCK
    if re.search(r'\bbonds?\b', q):
        return EducationalTopic.BOND
    if re.search(r'\brisk(\s*tolerance|\s*appetite|\s*score)?\b', q):
        return EducationalTopic.RISK

    # Tier 2: Specific ETF & SIP exact matches
    if re.search(r'\b(exchange[- ]traded[- ]funds?|\betfs?\b|niftybees|mon100)\b', q):
        return EducationalTopic.ETF
    if re.search(r'\b(systematic[- ]investment[- ]plans?|\bsips?\b)\b', q):
        return EducationalTopic.SIP

    # Tier 3: Unknown
    return EducationalTopic.UNKNOWN

def extract_mentioned_instrument(query: str) -> Optional[str]:
    """Extracts mentioned stock, ETF, mutual fund, or index symbol."""
    q = query.lower()
    if "mon100" in q:
        return "Motilal Oswal Nasdaq 100 ETF (MON100)"
    if "niftybees" in q:
        return "Nippon India ETF Nifty BeES"
    if "goldbees" in q:
        return "Nippon India ETF Gold BeES"
    if "uti nifty 50" in q or "uti nifty" in q:
        return "UTI Nifty 50 Index Fund Direct-Growth"
    if "parag parikh" in q or "ppfcf" in q:
        return "Parag Parikh Flexi Cap Fund Direct-Growth"
    if "reliance" in q:
        return "Reliance Industries Ltd"
    if "tcs" in q:
        return "Tata Consultancy Services Ltd"
    if "infy" in q or "infosys" in q:
        return "Infosys Ltd"
    if "hdfc" in q:
        return "HDFC Bank Ltd"
    if "icici" in q:
        return "ICICI Bank Ltd"
    if "apple" in q or "aapl" in q:
        return "Apple Inc. (AAPL)"
    return None

def extract_rupee_amount(query: str, default: float = 0.0) -> float:
    """Extracts first valid rupee amount."""
    amounts = extract_currency_amounts(query)
    if amounts:
        return amounts[0]["amount"]
    return default

# -----------------------------------------------------------------------------
# 4. MASTER UNIVERSAL INTENT DETECTOR
# -----------------------------------------------------------------------------

def detect_financial_intent(query: str, user_context: Optional[Dict[str, Any]] = None) -> Tuple[str, Dict[str, Any]]:
    """
    Universal Financial Intent Detector.
    Understands financial intent, sub-intent, entities, scope, and required data dependencies.
    """
    norm_q = normalize_query_language(query)
    q = norm_q.lower()
    
    # 1. Resolve all entities
    entities = resolve_financial_entities(query)
    entity_dicts = [
        {
            "raw": e.raw_text,
            "type": e.entity_type.value,
            "canonical": e.canonical_name,
            "identifier": e.identifier
        }
        for e in entities
    ]

    params: Dict[str, Any] = {
        "raw_query": query,
        "normalized_query": norm_q,
        "entities": entity_dicts,
        "scope": "EDUCATIONAL",
        "required_data": []
    }

    # 1. GREETING
    if re.match(r'^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|namaste)[\s!.]*$', q):
        params["category"] = IntentCategory.GREETING.value
        params["sub_intent"] = "welcome"
        params["scope"] = "GREETING"
        params["topic"] = "UNKNOWN"
        return INTENT_GREETING, params

    # 2. AMBIGUOUS / UNDERSPECIFIED (e.g. "Should I buy it?", "Is it good?")
    if re.match(r'^(should i buy (it|this)|is (it|this) good|what about it|tell me more|buy or sell|should i invest in it)[\s?.]*$', q):
        params["category"] = IntentCategory.CLARIFICATION.value
        params["sub_intent"] = "ambiguous_instrument"
        params["scope"] = "CLARIFICATION"
        params["clarification_prompt"] = "Which investment or financial concept are you referring to: UTI Nifty 50, MON100, Parag Parikh Flexi Cap, or an IPO?"
        return INTENT_AMBIGUOUS_CLARIFICATION, params

    # 3. PERSONALIZED SUITABILITY / INVESTMENT RECOMMENDATION
    # (e.g. "Should I invest in MON100?", "Should I apply for this IPO?", "Should I invest in a hedge fund?", "Should I buy stocks?")
    if re.search(r'\b(should i invest in|should i buy|is it suitable for me to invest in|can i invest in|ought i invest in|should i apply for|should i apply to)\b', q):
        topic = extract_educational_topic(query)
        params["category"] = IntentCategory.PERSONAL_FINANCIAL_ADVICE.value
        params["sub_intent"] = "suitability_evaluation"
        params["scope"] = "PERSONALIZED"
        params["topic"] = topic
        params["concept"] = topic
        params["instrument"] = extract_mentioned_instrument(query) or (topic if topic != EducationalTopic.UNKNOWN else None)
        params["amount"] = extract_rupee_amount(query, default=0.0)
        params["required_data"] = ["user_risk_profile", "user_surplus", "existing_holdings"]
        return INTENT_INVESTMENT_RECOMMENDATION, params

    # 4. COMPARISONS (e.g. "ETF vs mutual fund", "NiftyBeES vs MON100", "Gold ETF vs SGB", "FD vs liquid fund")
    is_comparison = bool(
        "difference between" in q or "compare" in q or " vs " in q or "versus" in q or
        re.search(r'\b(etf\s+or\s+mutual\s+fund|etf\s+or\s+hedge\s+fund|mutual\s+fund\s+or\s+etf|gold\s+etf\s+vs\s+sgb)\b', q)
    )
    if is_comparison:
        params["category"] = IntentCategory.COMPARISON.value
        params["sub_intent"] = "asset_vs_asset"
        params["scope"] = "EDUCATIONAL"
        params["topic"] = EducationalTopic.ETF_COMPARISON
        params["concept"] = EducationalTopic.ETF_COMPARISON
        if "hedge fund" in q or "hedge-fund" in q:
            params["instrument_a"] = "Exchange Traded Fund (ETF)"
            params["instrument_b"] = "Hedge Fund (Category III AIF)"
        elif "gold" in q and "sgb" in q:
            params["instrument_a"] = "Gold ETF"
            params["instrument_b"] = "Sovereign Gold Bond (SGB)"
        elif "fd" in q or "fixed deposit" in q:
            params["instrument_a"] = "Bank Fixed Deposit (FD)"
            params["instrument_b"] = "Liquid Mutual Fund"
        elif "niftybees" in q and "mon100" in q:
            params["instrument_a"] = "NiftyBeES (Nifty 50 Index)"
            params["instrument_b"] = "MON100 (Nasdaq-100 Tech Index)"
        else:
            params["instrument_a"] = "Direct Index Mutual Fund"
            params["instrument_b"] = "Exchange Traded Fund (ETF)"
        return INTENT_ETF_COMPARISON, params

    # 5. CURRENT MARKET QUESTIONS / MACRO MOVEMENTS
    # (e.g. "What is Nifty doing today?", "What is AAPL trading at?", "Why did the market fall today?", "Why is gold moving today?")
    if any(k in q for k in [
        "market doing", "nifty doing", "nifty today", "sensex today", "market status", 
        "today market", "what is nifty doing", "why did the market fall", "why is market falling",
        "why is gold moving", "why is gold rising", "trading at", "what is aapl trading"
    ]):
        params["category"] = IntentCategory.MARKET_DATA.value
        params["sub_intent"] = "market_movement" if ("why" in q or "falling" in q or "moving" in q) else "current_price"
        params["scope"] = "MARKET"
        params["required_data"] = ["market_quotes", "market_status"]
        return INTENT_MARKET_QUESTION, params

    # 6. STOCK / COMPANY SPECIFIC ANALYSIS
    if any(k in q for k in ["reliance", "tcs", "infy", "infosys", "hdfc bank", "tata motors", "itc", "aapl", "apple", "stock price"]):
        params["category"] = IntentCategory.INSTRUMENT_ANALYSIS.value
        params["sub_intent"] = "stock"
        params["scope"] = "MARKET"
        params["stock_symbol"] = (
            "RELIANCE" if "reliance" in q else
            "TCS" if "tcs" in q else
            "INFY" if "infy" in q or "infosys" in q else
            "AAPL" if "apple" in q or "aapl" in q else
            "HDFCBANK" if "hdfc" in q else "RELIANCE"
        )
        params["required_data"] = ["stock_quote", "company_fundamentals"]
        return INTENT_STOCK_ANALYSIS, params

    # 7. WHY NOT RECOMMENDED
    if any(k in q for k in [
        "why not", "why didn't you", "why didn't", "why wasnt", "why wasn't", 
        "why excluded", "not recommend", "why no crypto", "why no smallcap", 
        "why avoid", "why didn't smartvest choose", "why not mon100", "why exclude"
    ]):
        params["category"] = IntentCategory.PERSONAL_FINANCIAL_ADVICE.value
        params["sub_intent"] = "why_not_recommended"
        params["scope"] = "PERSONALIZED"
        params["instrument"] = extract_mentioned_instrument(query) or "the requested asset"
        return INTENT_WHY_NOT_RECOMMENDED, params

    # 8. WHY RECOMMENDED
    if any(k in q for k in [
        "why did you choose", "why choose", "why recommend", "why this portfolio", 
        "why did you recommend", "explain recommendation", "rationale behind", 
        "why uti nifty", "why parag parikh", "why gold", "why liquid", "why these investments"
    ]):
        params["category"] = IntentCategory.PERSONAL_FINANCIAL_ADVICE.value
        params["sub_intent"] = "why_recommended"
        params["scope"] = "PERSONALIZED"
        params["instrument"] = extract_mentioned_instrument(query)
        return INTENT_WHY_RECOMMENDED, params

    # 9. AFFORDABILITY CALCULATOR (e.g. "Can I afford a ₹10 lakh car?", "Home loan affordability")
    if "afford" in q or "can i buy" in q or "car loan" in q or "home loan" in q or "buy a car" in q or "buy a house" in q:
        item_price = extract_rupee_amount(query, default=1000000.0)
        params["category"] = IntentCategory.CALCULATION.value
        params["sub_intent"] = "affordability"
        params["scope"] = "PERSONALIZED"
        params["item_price"] = item_price
        params["down_payment"] = item_price * 0.20
        params["loan_amount"] = item_price * 0.80
        params["tenure_months"] = 60 if ("car" in q or "vehicle" in q or "auto" in q) else 240
        params["interest_rate"] = 0.09 if ("car" in q or "vehicle" in q or "auto" in q) else 0.085
        params["required_data"] = ["user_income", "user_expenses", "user_surplus", "emergency_fund"]
        return INTENT_AFFORDABILITY, params

    # 10. GOAL PLANNING / REACH A TARGET (e.g. "How can I reach ₹1 crore in 15 years?", "How much SIP for ₹1 crore?")
    if any(k in q for k in ["reach", "accumulate", "target", "save for", "goal of", "build a corpus", "how to make", "how much sip for", "sip for 1", "sip for ₹", "sip needed for"]):
        target = extract_rupee_amount(query, default=10000000.0)
        years_list = extract_time_horizons(query)
        years = years_list[0]["years"] if years_list and "years" in years_list[0] else 10
        params["category"] = IntentCategory.GOALS.value
        params["sub_intent"] = "wealth_target"
        params["scope"] = "PERSONALIZED"
        params["target_amount"] = target
        params["target_years"] = years
        params["required_data"] = ["user_surplus", "user_risk_profile"]
        return INTENT_GOAL_PLANNING, params

    # 11. RETIREMENT PLANNING
    if "retire" in q or "retirement" in q:
        params["category"] = IntentCategory.RETIREMENT.value
        params["sub_intent"] = "retirement_corpus"
        params["scope"] = "PERSONALIZED"
        params["target_years"] = 25
        params["required_data"] = ["user_age", "user_expenses", "user_income"]
        return INTENT_RETIREMENT_PLANNING, params

    # 12. SIP CALCULATION (e.g. "What will ₹10,000/month become in 15 years?", "Calculate SIP future value")
    if (any(k in q for k in ["sip", "monthly", "/month", "per month", "p.m.", "invest"]) and any(k in q for k in ["increase", "step up", "step-up", "calculate", "future value", "become", "growth", "returns", "after", "years", "in 10", "in 15", "in 20"])) or ("what will" in q and ("become" in q or "grow to" in q)):
        monthly_sip = extract_rupee_amount(query, default=10000.0)
        years_list = extract_time_horizons(query)
        years = years_list[0]["years"] if years_list and "years" in years_list[0] else 15
        params["category"] = IntentCategory.CALCULATION.value
        params["sub_intent"] = "sip"
        params["scope"] = "CALCULATION"
        params["monthly_sip"] = monthly_sip
        params["years"] = years
        params["step_up_percent"] = 10.0 if ("step" in q or "increase" in q) else 0.0
        return INTENT_SIP_CALCULATION, params

    # 13. EMERGENCY FUND
    if "emergency fund" in q or "emergency buffer" in q or "rainy day" in q:
        params["category"] = IntentCategory.PERSONAL_FINANCIAL_ADVICE.value
        params["sub_intent"] = "emergency_fund"
        params["scope"] = "PERSONALIZED"
        params["required_data"] = ["user_monthly_expenses", "user_savings"]
        return INTENT_EMERGENCY_FUND, params

    # 14. PORTFOLIO REVIEW (e.g. "Am I too concentrated in Nifty?", "How diversified am I?", "Review my portfolio")
    if any(k in q for k in ["review my portfolio", "check my portfolio", "portfolio review", "concentrated", "diversified", "overlap"]):
        params["category"] = IntentCategory.PORTFOLIO.value
        params["sub_intent"] = "concentration" if "concentrated" in q else "portfolio_review"
        params["scope"] = "PERSONALIZED"
        params["required_data"] = ["user_portfolio", "user_risk_profile"]
        return INTENT_PORTFOLIO_REVIEW, params

    # 15. TAX EDUCATION
    if "tax" in q or "ltcg" in q or "stcg" in q or "section 80c" in q:
        params["category"] = IntentCategory.TAX_EDUCATION.value
        params["sub_intent"] = "ltcg" if "ltcg" in q else ("stcg" if "stcg" in q else "general_tax")
        params["scope"] = "EDUCATIONAL"
        params["topic"] = "tax_ltcg_stcg"
        return INTENT_TAX_GENERAL_EDUCATION, params

    # 16. INSTRUMENT CLASSIFICATION / IS MON100 AN ETF?
    if re.search(r'\bis\s+(mon100|niftybees|goldbees|uti|ppfcf|icici)\s+(an\s+)?(etf|mutual fund|index fund|stock|bond)\b', q) or \
       re.search(r'\b(is\s+mon100\s+an\s+etf|what\s+type\s+of\s+fund\s+is\s+mon100)\b', q):
        params["category"] = IntentCategory.EDUCATION.value
        params["sub_intent"] = "instrument_classification"
        params["scope"] = "EDUCATIONAL"
        params["instrument"] = extract_mentioned_instrument(query) or "MON100"
        params["topic"] = EducationalTopic.ETF
        params["concept"] = EducationalTopic.ETF
        return INTENT_GENERAL_FINANCIAL_EDUCATION, params

    # 17. GENERAL FINANCIAL EDUCATION / CONCEPTS
    # (e.g. "What is an ETF?", "What is a hedge fund?", "What is an IPO?", "What is a bond?", "What is P/E?", "What is CAGR?", "What is NAV?", "What is REIT?", "What is SGB?", "Explain PE ratio", "How does an IPO work?")
    detected_topic = extract_educational_topic(query)
    is_educational_prefix = bool(
        re.search(r'^(what\s+is|what\s+are|explain|how\s+does|how\s+do|tell\s+me\s+about|define|meaning\s+of|definition\s+of)\b', q) or
        re.search(r'\b(what\s+is\s+an?\s+|what\s+are\s+|how\s+an?\s+.*works?|meaning\b|definition\b)\b', q)
    )

    if detected_topic != EducationalTopic.UNKNOWN or is_educational_prefix:
        params["category"] = IntentCategory.EDUCATION.value
        params["sub_intent"] = "concept_definition"
        params["scope"] = "EDUCATIONAL"
        params["topic"] = detected_topic
        params["concept"] = detected_topic
        return INTENT_GENERAL_FINANCIAL_EDUCATION, params

    # 18. INVESTMENT RECOMMENDATION / SURPLUS ALLOCATION
    # (e.g. "Where should I invest my monthly surplus?", "Where should I invest ₹20,000?", "which mf is better for me", "I have ₹20,000 extra")
    if any(k in q for k in [
        "where should i invest", "where to invest", "how to invest", "invest monthly surplus", 
        "invest my surplus", "how to allocate", "what to invest in", "recommendation", "where to put",
        "where should i allocate", "should i start a sip", "i have", "extra", "which mutual fund",
        "which fund", "better for me", "best mutual fund", "which investment is best", "which mf"
    ]):
        params["category"] = IntentCategory.PERSONAL_FINANCIAL_ADVICE.value
        params["sub_intent"] = "where_to_invest"
        params["scope"] = "PERSONALIZED"
        params["amount"] = extract_rupee_amount(query, default=0.0)
        params["required_data"] = ["user_surplus", "user_risk_profile", "user_goals"]
        return INTENT_INVESTMENT_RECOMMENDATION, params

    # 19. EXPENSE & RISK ANALYSIS
    if any(k in q for k in ["reduce expense", "cut expense", "spending budget", "save more"]):
        params["category"] = IntentCategory.CASHFLOW.value
        params["sub_intent"] = "expense_reduction"
        params["scope"] = "PERSONALIZED"
        params["required_data"] = ["user_expenses"]
        return INTENT_EXPENSE_ANALYSIS, params
    if any(k in q for k in ["risk score", "too much risk", "risk tolerance"]):
        params["category"] = IntentCategory.RISK.value
        params["sub_intent"] = "risk_profile"
        params["scope"] = "PERSONALIZED"
        params["required_data"] = ["user_risk_score"]
        return INTENT_RISK_EXPLANATION, params

    # 20. GENERAL CONCEPT FALLBACK
    if any(k in q for k in ["what", "how", "explain", "why", "meaning", "tell me", "define", "concept"]):
        params["category"] = IntentCategory.EDUCATION.value
        params["sub_intent"] = "concept_definition"
        params["scope"] = "EDUCATIONAL"
        params["topic"] = EducationalTopic.UNKNOWN
        params["concept"] = EducationalTopic.UNKNOWN
        return INTENT_GENERAL_FINANCIAL_EDUCATION, params

    # 21. Safe Default Disambiguation
    params["category"] = IntentCategory.CLARIFICATION.value
    params["sub_intent"] = "missing_target"
    params["scope"] = "CLARIFICATION"
    params["clarification_prompt"] = "Which financial topic or investment would you like to explore: UTI Nifty 50, MON100, ETFs vs Mutual Funds, IPOs, Hedge Funds, Car Affordability, or your Monthly Surplus?"
    return INTENT_AMBIGUOUS_CLARIFICATION, params
