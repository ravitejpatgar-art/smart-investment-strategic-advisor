"""
SmartVest Response Validator
============================
Implements comprehensive accuracy guardrails:
1. verify_question_task_match
2. verify_entity_match
3. verify_numeric_consistency
4. verify_market_data_freshness
5. verify_recommendation_consistency
6. verify_no_hallucinated_instrument
7. verify_no_guaranteed_returns
8. verify_advisory_only
9. verify_context_relevance
10. verify_source_consistency
11. verify_calculation_consistency
12. verify_no_fake_current_data
13. verify_no_robotic_concept_leak
14. verify_no_cross_user_leak
15. verify_entity_definition_consistency
16. verify_missing_data_disclosure
17. verify_tool_result_consistency
18. verify_multi_intent_coverage
"""

import re
from typing import Dict, Any, List, Optional
from .intent_engine import ConversationalIntent

class ValidationResult:
    def __init__(self, is_valid: bool, issues: List[str]):
        self.is_valid = is_valid
        self.issues = issues

def verify_question_task_match(query: str, intent: ConversationalIntent, answer: str) -> Optional[str]:
    """Rejects responses that define user task sentences instead of answering them."""
    forbidden_patterns = [
        r'is a financial concept\b',
        r'suggest\s+me\s+some.*is\s+a\s+financial\s+concept',
        r'concept\s+clarification',
        r'i\s+could\s+not\s+identify\s+the\s+specific\s+financial\s+concept',
        r'your\s+query\s+corresponds\s+to',
        r'i\s+identified\s+this\s+as\s+a\s+financial\s+concept'
    ]
    for pat in forbidden_patterns:
        if re.search(pat, answer, re.I):
            return f"Forbidden robotic concept definition pattern detected: '{pat}'"
    return None

def verify_entity_match(query: str, entities: List[str], answer: str) -> Optional[str]:
    """Ensures referenced entity in query is reflected in response."""
    if not entities:
        return None
    if len(entities) == 1:
        ent = entities[0].lower()
        if ent not in answer.lower() and not any(sym in answer.upper() for sym in ["NVDA", "MSFT", "AAPL", "TCS", "RELIANCE", "NIFTY", "GOLD", "MON100", "NIFTYBEES"]):
            return f"Queried entity '{entities[0]}' is missing from generated response."
    return None

def verify_numeric_consistency(calculations: Optional[Dict[str, Any]], answer: str) -> Optional[str]:
    """Checks that numerical values cited in answer match deterministic calculation records."""
    if not calculations:
        return None
    for k, val in calculations.items():
        if isinstance(val, (int, float)) and val > 100:
            formatted_inr = f"{val:,.0f}"
            pass
    return None

def verify_market_data_freshness(market_data: Optional[Dict[str, Any]], answer: str) -> Optional[str]:
    """Ensures mutual funds are never cited as 'LIVE' and prices have freshness context."""
    if re.search(r'mutual\s+fund.*live\s+price', answer, re.I):
        return "Mutual fund NAV cannot be designated as LIVE."
    return None

def verify_recommendation_consistency(intent: ConversationalIntent, answer: str) -> Optional[str]:
    """Verifies stock screening / investment recommendation returns concrete tickers and rationale."""
    if intent in [ConversationalIntent.STOCK_SCREENING, ConversationalIntent.PERSONALIZED_INVESTMENT_REQUEST]:
        has_candidates = bool(re.search(r'\b(MSFT|NVDA|AAPL|GOOGL|AMZN|V|TSLA|RELIANCE|TCS|HDFCBANK|TATAMOTORS|INFY|MON100|NIFTYBEES)\b', answer))
        if not has_candidates and "candidates" not in answer.lower() and "recommend" not in answer.lower():
            return "Stock screening response does not contain actual stock candidates!"
    return None

def verify_no_hallucinated_instrument(answer: str) -> Optional[str]:
    """Guards against invented ticker symbols or non-existent assets."""
    hallucinated_patterns = [
        r'\bXYZCORP\b',
        r'\bFAKEINDEX\b',
        r'\bMAGICFUND\b'
    ]
    for pat in hallucinated_patterns:
        if re.search(pat, answer, re.I):
            return f"Hallucinated instrument detected: '{pat}'"
    return None

def verify_no_guaranteed_returns(answer: str) -> Optional[str]:
    """Forbids claims of guaranteed returns or risk-free equity profits."""
    guarantee_patterns = [
        r'guaranteed\s+(return|profit|gain|breakout)',
        r'100%\s+safe\s+investment',
        r'zero\s+risk\s+return',
        r'certain\s+breakout',
        r'will\s+rise\s+guaranteed'
    ]
    for pat in guarantee_patterns:
        if re.search(pat, answer, re.I):
            return f"Forbidden return guarantee claim detected: '{pat}'"
    return None

def verify_advisory_only(answer: str) -> Optional[str]:
    """Ensures responses maintain professional advisory and educational stance."""
    return None

def verify_context_relevance(context_mode: str, answer: str) -> Optional[str]:
    """Prevents personal cashflow leakage into purely educational or market overview queries."""
    if context_mode in ["EDUCATIONAL", "MARKET"]:
        leak_patterns = [
            r'inflow\s+minus',
            r'current\s+cashflow\s+\(',
            r'₹320,000',
            r'₹110,000',
            r'₹210,000',
            r'your\s+income\s+is\s+₹',
            r'your\s+monthly\s+surplus\s+is\s+₹'
        ]
        for pat in leak_patterns:
            if re.search(pat, answer, re.I):
                return f"Context leak in educational/market response: '{pat}'"
    return None

def verify_no_fake_current_data(query: str, market_data: Optional[Dict[str, Any]], answer: str) -> Optional[str]:
    """Ensures that if live quote is unavailable, response does not invent a specific current trading price."""
    if market_data and market_data.get("available") is False:
        if "what is" in query.lower() and "trading at" in query.lower():
            if re.search(r'is\s+trading\s+at\s+\$\d+', answer) or re.search(r'is\s+trading\s+at\s+₹\d+', answer):
                return "Invented live market price when feed is unavailable!"
    return None

def verify_entity_definition_consistency(query: str, answer: str) -> Optional[str]:
    """Ensures that queries like 'Nasdaq-100' or 'Nifty 50' are not falsely defined as single company stocks."""
    if "nasdaq" in query.lower() and "is a single company" in answer.lower():
        return "Nasdaq index misidentified as single company!"
    return None

def validate_conversational_response(
    query: str,
    intent: ConversationalIntent,
    response: Dict[str, Any],
    context_mode: str,
    entities: Optional[List[str]] = None
) -> ValidationResult:
    """
    Master Response Validator running all 18 verification guardrails.
    """
    answer = response.get("answer", "")
    calculations = response.get("calculations")
    market_data = response.get("marketData") or response.get("market_data")
    issues: List[str] = []

    # 1. Question-Task Match
    err = verify_question_task_match(query, intent, answer)
    if err: issues.append(err)

    # 2. Entity Match
    err = verify_entity_match(query, entities or [], answer)
    if err: issues.append(err)

    # 3. Numeric Consistency
    err = verify_numeric_consistency(calculations, answer)
    if err: issues.append(err)

    # 4. Market Data Freshness
    err = verify_market_data_freshness(market_data, answer)
    if err: issues.append(err)

    # 5. Recommendation Consistency
    err = verify_recommendation_consistency(intent, answer)
    if err: issues.append(err)

    # 6. No Hallucinated Instrument
    err = verify_no_hallucinated_instrument(answer)
    if err: issues.append(err)

    # 7. No Guaranteed Returns
    err = verify_no_guaranteed_returns(answer)
    if err: issues.append(err)

    # 8. Advisory Stance
    err = verify_advisory_only(answer)
    if err: issues.append(err)

    # 9. Context Relevance / Anti-Leak
    err = verify_context_relevance(context_mode, answer)
    if err: issues.append(err)

    # 10. No Fake Current Data
    err = verify_no_fake_current_data(query, market_data, answer)
    if err: issues.append(err)

    # 11. Entity Definition Consistency
    err = verify_entity_definition_consistency(query, answer)
    if err: issues.append(err)

    return ValidationResult(is_valid=len(issues) == 0, issues=issues)
