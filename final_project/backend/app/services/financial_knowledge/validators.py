"""
Answer Relevance & Numerical Validators for SmartVest Universal Intelligence Engine.
Ensures responses accurately answer the user's specific question without topic confusion
or numerical contradictions.
"""

import re
from typing import Dict, Any, List, Optional, Tuple

LEAK_PHRASES = [
    "based on your current cashflow",
    "inflow minus",
    "investable surplus is",
    "current monthly income of ₹",
    "your monthly expenses of ₹"
]

def verify_answer_relevance(
    question: str,
    target_topic: str,
    answer: str,
    context_mode: str = "EDUCATIONAL"
) -> Tuple[bool, Optional[str]]:
    """
    Validates whether the generated answer accurately responds to the target topic.
    Rejects topic confusion (e.g. returning ETF content for Hedge Fund or IPO queries).
    """
    q_low = question.lower()
    ans_low = answer.lower()
    topic_low = (target_topic or "").lower()

    # 1. Anti-Cashflow Leak Validation for Educational Mode
    if context_mode == "EDUCATIONAL":
        for phrase in LEAK_PHRASES:
            if phrase in ans_low:
                return False, f"Anti-leak violation: Educational answer contained personalized cashflow statement '{phrase}'."

    # 2. Topic-Specific Confusion Checks
    # Hedge Fund Check
    if "hedge" in q_low or topic_low == "hedge_fund":
        if "exchange traded fund (etf)" in ans_low and "hedge fund" not in ans_low:
            return False, "Topic confusion: Answer discussed ETF instead of Hedge Fund."

    # IPO Check
    if "ipo" in q_low or topic_low == "ipo":
        if "exchange traded fund (etf)" in ans_low and "ipo" not in ans_low:
            return False, "Topic confusion: Answer discussed ETF instead of IPO."

    # P/E Ratio Check
    if ("pe" in q_low or "p/e" in q_low or "price to earnings" in q_low or topic_low == "pe_ratio"):
        if "exchange traded fund" in ans_low and "price-to-earnings" not in ans_low and "p/e" not in ans_low:
            return False, "Topic confusion: Answer discussed ETF instead of P/E Ratio."

    # REIT Check
    if "reit" in q_low or topic_low == "reit":
        if "exchange traded fund (etf)" in ans_low and "reit" not in ans_low and "real estate" not in ans_low:
            return False, "Topic confusion: Answer discussed ETF instead of REIT."

    # SGB Check
    if "sgb" in q_low or topic_low == "sgb" or "sovereign gold bond" in q_low:
        if "exchange traded fund" in ans_low and "sovereign gold bond" not in ans_low and "sgb" not in ans_low:
            return False, "Topic confusion: Answer discussed ETF instead of SGB."

    # General sanity check: Answer must not be empty
    if len(answer.strip()) < 20:
        return False, "Answer content too short or empty."

    return True, None

def validate_numerical_claims(answer: str, verified_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Cross-checks numerical values in the answer against verified calculation inputs/outputs.
    """
    errors = []
    # If verified surplus is provided, check that conflicting surplus claims do not appear
    if "investable_surplus" in verified_data:
        actual_surplus = verified_data["investable_surplus"]
        # Look for phrases like "surplus of ₹X"
        for match in re.finditer(r'surplus\s*(?:of|is)?\s*₹?\s*([\d,]+)', answer, re.IGNORECASE):
            claimed_str = match.group(1).replace(",", "")
            try:
                claimed_val = float(claimed_str)
                if abs(claimed_val - actual_surplus) > 1.0:
                    errors.append(f"Claimed surplus ₹{claimed_val:,.0f} conflicts with verified surplus ₹{actual_surplus:,.0f}")
            except ValueError:
                pass

    return len(errors) == 0, errors
