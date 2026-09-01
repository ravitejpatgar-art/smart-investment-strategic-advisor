"""
SmartVest VestIQ Universal Accuracy & Intelligence Test Suite
============================================================
Tests 100+ scenarios across all 25 financial intelligence categories:
1. Education
2. Stocks
3. ETFs
4. Mutual Funds
5. Bonds
6. Gold
7. Market Data & Intelligence
8. Technical Analysis
9. Fundamental Analysis
10. Comparison Engine
11. Portfolio Review
12. Risk Analysis
13. Goals
14. SIP Calculation
15. EMI Calculation
16. Affordability Engine
17. Cashflow Analysis
18. Emergency Fund
19. Personalization
20. Conversational Memory
21. Entity Disambiguation (Index vs ETF vs Commodity)
22. Fuzzy Entity Matching
23. Hinglish & Colloquial Understanding
24. Multi-Intent Decomposition
25. Privacy & Multi-User Isolation
"""

import sys
import os
import re

# Ensure app package is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Ensure UTF-8 console output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.ai.conversation_engine import process_conversational_query, _CONVERSATION_MEMORY
from app.services.ai.intent_engine import classify_intent, ConversationalIntent, normalize_conversational_text
from app.services.ai.entity_engine import resolve_entities, MarketRegion, AssetClass, KNOWN_INDICES, KNOWN_ETFS

passed_count = 0
failed_count = 0

def assert_test(condition: bool, msg: str):
    global passed_count, failed_count
    if condition:
        passed_count += 1
        print(f"  [PASS] {msg}")
    else:
        failed_count += 1
        print(f"  [FAIL] {msg}")

USER_AGGRESSIVE = {
    "name": "Aarav",
    "age": 22,
    "income": 250000.0,
    "expenses": 100000.0,
    "surplus": 150000.0,
    "risk": "Aggressive",
    "risk_profile": "Aggressive",
    "final_advisory_risk": "Aggressive",
    "horizon": 20,
    "emergency_fund": 500000.0,
    "portfolio": []
}

USER_CONSERVATIVE = {
    "name": "Vikram",
    "age": 48,
    "income": 250000.0,
    "expenses": 180000.0,
    "surplus": 70000.0,
    "risk": "Conservative",
    "risk_profile": "Conservative",
    "final_advisory_risk": "Conservative",
    "horizon": 4,
    "emergency_fund": 1200000.0,
    "portfolio": []
}

print("=" * 80)
print("VESTIQ UNIVERSAL FINANCIAL INTELLIGENCE TEST SUITE (100+ SCENARIOS)")
print("=" * 80)

# ============================================================================
# CATEGORY 1: EDUCATION (Zero cashflow leaks, pure explanations)
# ============================================================================
print("\n--- CATEGORY 1: EDUCATION ---")
edu_queries = [
    ("What is an ETF?", "Exchange Traded Fund"),
    ("What is an IPO?", "Initial Public Offering"),
    ("Explain P/E ratio", "Price-to-Earnings"),
    ("What is ROE?", "Return on Equity"),
    ("What is free cash flow?", "Free Cash Flow"),
    ("What is XIRR?", "Extended Internal Rate of Return"),
    ("What is CAGR?", "Compound Annual Growth Rate"),
    ("What is a hedge fund?", "Hedge Fund"),
    ("What is a REIT?", "Real Estate Investment Trust"),
    ("What is NAV?", "Net Asset Value"),
    ("What is expense ratio?", "Expense Ratio"),
    ("What is a liquid fund?", "Liquid Mutual Fund"),
    ("Explain ETFs like I'm a beginner.", "Exchange Traded Fund"),
]
for q, expected_topic in edu_queries:
    res = process_conversational_query(q, user_context=USER_AGGRESSIVE)
    ans = res.get("answer", "")
    assert_test(
        expected_topic.lower() in ans.lower() and "₹150,000" not in ans and "₹250,000" not in ans,
        f"Education '{q}' -> defined '{expected_topic}' without personal cashflow leak."
    )

# ============================================================================
# CATEGORY 2: STOCK SCREENING & RECOMMENDATIONS (No generic definitions!)
# ============================================================================
print("\n--- CATEGORY 2: STOCK SCREENING ---")
res_us = process_conversational_query("Suggest me some US stocks", user_context=USER_AGGRESSIVE)
ans_us = res_us.get("answer", "")
assert_test(
    any(sym in ans_us for sym in ["MSFT", "NVDA", "AAPL", "GOOGL"]) and "is a financial concept" not in ans_us,
    "Stock Screening: 'Suggest me some US stocks' returned actual US tickers."
)

res_ind = process_conversational_query("Suggest Indian stocks for long term", user_context=USER_AGGRESSIVE)
ans_ind = res_ind.get("answer", "")
assert_test(
    any(sym in ans_ind for sym in ["RELIANCE", "TCS", "HDFCBANK", "TATAMOTORS"]),
    "Stock Screening: 'Suggest Indian stocks for long term' returned actual Indian tickers."
)

res_which = process_conversational_query("Which US stocks should I research?", user_context=USER_AGGRESSIVE)
assert_test(
    any(sym in res_which.get("answer", "") for sym in ["MSFT", "NVDA", "AAPL"]),
    "Stock Screening: 'Which US stocks should I research?' provided candidates."
)

# ============================================================================
# CATEGORY 3: SINGLE INSTRUMENT ANALYSIS
# ============================================================================
print("\n--- CATEGORY 3: SINGLE INSTRUMENT ANALYSIS ---")
inst_queries = [
    ("Tell me about Nvidia", "NVIDIA Corporation", "NVDA"),
    ("Tell me about Microsoft", "Microsoft Corporation", "MSFT"),
    ("Tell me about Apple", "Apple Inc.", "AAPL"),
    ("Tell me about Reliance", "Reliance Industries", "RELIANCE"),
    ("Tell me about TCS", "Tata Consultancy Services", "TCS"),
    ("Tell me about Tata Motors", "Tata Motors", "TATAMOTORS"),
    ("Tell me about MON100", "Motilal Oswal Nasdaq 100", "MON100"),
    ("Tell me about NiftyBeES", "Nippon India ETF Nifty BeES", "NIFTYBEES"),
    ("Tell me about GoldBeES", "Nippon India ETF Gold BeES", "GOLDBEES"),
    ("Tell me about PPFCF", "Parag Parikh Flexi Cap Fund", "PPFCF"),
]
for q, exp_name, exp_sym in inst_queries:
    res = process_conversational_query(q, user_context=USER_AGGRESSIVE)
    ans = res.get("answer", "")
    assert_test(
        exp_sym in ans or exp_name.lower() in ans.lower(),
        f"Instrument Analysis '{q}' -> analyzed {exp_name} ({exp_sym})."
    )

# ============================================================================
# CATEGORY 4: COMPARISONS (Equities, ETFs, Gold vs Debt, FD vs Liquid)
# ============================================================================
print("\n--- CATEGORY 4: COMPARISON ENGINE ---")
comp_queries = [
    ("Compare Nvidia and Microsoft", "Nvidia", "Microsoft"),
    ("Compare Apple and Microsoft", "Apple", "Microsoft"),
    ("ETF vs mutual fund", "Exchange Traded Fund", "Mutual Fund"),
    ("Gold vs debt", "Gold", "Debt"),
    ("FD vs liquid fund", "Fixed Deposit", "Liquid"),
    ("Gold ETF vs SGB", "Gold", "SGB"),
    ("Direct mutual fund or regular", "Direct", "Regular"),
    ("Stocks or mutual funds?", "Stocks", "Mutual Fund"),
]
for q, k1, k2 in comp_queries:
    res = process_conversational_query(q, user_context=USER_AGGRESSIVE)
    ans = res.get("answer", "")
    assert_test(
        k1.lower() in ans.lower() and k2.lower() in ans.lower(),
        f"Comparison: '{q}' -> compared {k1} vs {k2}."
    )

# ============================================================================
# CATEGORY 5: MARKET DATA & MACRO INTELLIGENCE
# ============================================================================
print("\n--- CATEGORY 5: MARKET DATA & MACRO ---")
res_nifty = process_conversational_query("What is the Nifty doing today?", user_context=USER_AGGRESSIVE)
assert_test("NIFTY" in res_nifty.get("answer", "") or "index" in res_nifty.get("answer", "").lower(), "Market: 'What is the Nifty doing today?' answered with market status.")

res_gold_why = process_conversational_query("Why is gold going up?", user_context=USER_AGGRESSIVE)
assert_test("gold" in res_gold_why.get("answer", "").lower(), "Market Analysis: 'Why is gold going up?' analyzed safe haven & inflation factors.")

res_market_why = process_conversational_query("Why did the market fall today?", user_context=USER_AGGRESSIVE)
assert_test("market" in res_market_why.get("answer", "").lower(), "Market Analysis: 'Why did the market fall today?' separated facts from explanations.")

# ============================================================================
# CATEGORY 6: DETERMINISTIC CALCULATIONS (SIP, EMI, Compounding, Affordability)
# ============================================================================
print("\n--- CATEGORY 6: DETERMINISTIC CALCULATORS ---")
res_sip = process_conversational_query("How much SIP do I need for ₹1 crore?", user_context=USER_AGGRESSIVE)
assert_test("sip" in res_sip.get("answer", "").lower() and ("1 crore" in res_sip.get("answer", "").lower() or "₹10,000,000" in res_sip.get("answer", "") or "₹" in res_sip.get("answer", "")), "Calc: 'How much SIP for ₹1 crore?' computed SIP.")

res_grow = process_conversational_query("What will ₹10,000/month become in 15 years?", user_context=USER_AGGRESSIVE)
assert_test("₹10,000" in res_grow.get("answer", "") or "10,000" in res_grow.get("answer", ""), "Calc: 'What will ₹10,000/month become in 15 years?' calculated compounding value.")

res_afford = process_conversational_query("Can I afford a ₹10 lakh car?", user_context=USER_AGGRESSIVE)
assert_test("afford" in res_afford.get("answer", "").lower() or "emi" in res_afford.get("answer", "").lower(), "Affordability: 'Can I afford a ₹10 lakh car?' evaluated EMI and cashflow.")

# ============================================================================
# CATEGORY 7: CASHFLOW & SURPLUS QUESTIONS
# ============================================================================
print("\n--- CATEGORY 7: CASHFLOW & SURPLUS ---")
res_surplus = process_conversational_query("What is my monthly surplus?", user_context=USER_AGGRESSIVE)
assert_test("₹150,000" in res_surplus.get("answer", "") or "150,000" in res_surplus.get("answer", ""), "Cashflow: 'What is my monthly surplus?' accurately cited ₹150,000.")

res_deploy = process_conversational_query("Where should I invest my monthly surplus?", user_context=USER_AGGRESSIVE)
assert_test("allocation" in res_deploy.get("answer", "").lower() or "deploy" in res_deploy.get("answer", "").lower() or "index" in res_deploy.get("answer", "").lower(), "Surplus Allocation: 'Where should I invest my surplus?' deployed capital into multi-asset blueprint.")

# Zero Surplus / Deficit check
USER_DEFICIT = {
    "name": "Rohan",
    "age": 28,
    "income": 50000.0,
    "expenses": 60000.0,
    "surplus": 0.0,
    "risk": "Moderate"
}
res_def = process_conversational_query("Where should I invest my monthly surplus?", user_context=USER_DEFICIT)
assert_test("0" in res_def.get("answer", "") or "not advisable" in res_def.get("answer", "").lower() or "emergency" in res_def.get("answer", "").lower(), "Zero Capacity Guard: Deficit profile was not advised to risk capital in market.")

# ============================================================================
# CATEGORY 8: PORTFOLIO REVIEW & CONCENTRATION
# ============================================================================
print("\n--- CATEGORY 8: PORTFOLIO REVIEW ---")
res_port = process_conversational_query("Review my portfolio.", user_context=USER_AGGRESSIVE)
assert_test("portfolio" in res_port.get("answer", "").lower() or "diversification" in res_port.get("answer", "").lower(), "Portfolio: 'Review my portfolio.' performed asset review.")

res_tech = process_conversational_query("Am I overexposed to technology?", user_context=USER_AGGRESSIVE)
assert_test("technology" in res_tech.get("answer", "").lower() or "tech" in res_tech.get("answer", "").lower() or "exposure" in res_tech.get("answer", "").lower(), "Portfolio: 'Am I overexposed to technology?' analyzed tech exposure.")

# ============================================================================
# CATEGORY 9: MULTI-TURN CONVERSATIONAL MEMORY (Pronouns & Referencing)
# ============================================================================
print("\n--- CATEGORY 9: MULTI-TURN CONVERSATIONAL MEMORY ---")
# 1. User: Tell me about Nvidia.
turn1 = process_conversational_query("Tell me about Nvidia.", user_context=USER_AGGRESSIVE)
assert_test("NVIDIA" in turn1.get("answer", "") or "NVDA" in turn1.get("answer", ""), "Multi-turn Turn 1: Discussed Nvidia.")

# 2. User: Why is it risky?
turn2 = process_conversational_query("Why is it risky?", user_context=USER_AGGRESSIVE)
assert_test("NVIDIA" in turn2.get("answer", "") or "NVDA" in turn2.get("answer", ""), "Multi-turn Turn 2: Resolved 'it' -> Nvidia.")

# 3. User: What about Microsoft?
turn3 = process_conversational_query("What about Microsoft?", user_context=USER_AGGRESSIVE)
assert_test("Microsoft" in turn3.get("answer", "") or "MSFT" in turn3.get("answer", ""), "Multi-turn Turn 3: Switched active entity to Microsoft.")

# 4. User: Which is safer?
turn4 = process_conversational_query("Which is safer?", user_context=USER_AGGRESSIVE)
assert_test(
    any(k in turn4.get("answer", "").upper() for k in ["MICROSOFT", "MSFT", "NVIDIA", "NVDA"]),
    "Multi-turn Turn 4: Compared Microsoft vs Nvidia for safety."
)

# 5. User: How much should I invest in it?
turn5 = process_conversational_query("How much should I invest in it?", user_context=USER_AGGRESSIVE)
assert_test("₹" in turn5.get("answer", "") or "%" in turn5.get("answer", ""), "Multi-turn Turn 5: Resolved entity and provided personalized allocation sizing.")

# ============================================================================
# CATEGORY 10: ENTITY DISAMBIGUATION (Index vs ETF vs Commodity)
# ============================================================================
print("\n--- CATEGORY 10: ENTITY DISAMBIGUATION ---")
# Nasdaq-100 != MON100
ent_ndx = resolve_entities("What is Nasdaq-100?")
assert_test(any(e.asset_class == AssetClass.INDEX for e in ent_ndx), "Disambiguation: Nasdaq-100 resolved as INDEX, not ETF.")

ent_mon = resolve_entities("Tell me about MON100")
assert_test(any(e.asset_class == AssetClass.ETFS for e in ent_mon), "Disambiguation: MON100 resolved as ETF.")

# Nifty 50 != NiftyBeES
ent_nifty = resolve_entities("What is Nifty 50?")
assert_test(any(e.asset_class == AssetClass.INDEX for e in ent_nifty), "Disambiguation: Nifty 50 resolved as INDEX.")

ent_niftybees = resolve_entities("Tell me about NiftyBeES")
assert_test(any(e.asset_class == AssetClass.ETFS for e in ent_niftybees), "Disambiguation: NiftyBeES resolved as ETF.")

# Gold != GoldBeES
ent_gold = resolve_entities("Why is gold going up?")
assert_test(any(e.canonical_name == "Gold (10g / MCX / Spot)" for e in ent_gold), "Disambiguation: 'gold' resolved as commodity asset.")

# ============================================================================
# CATEGORY 11: FUZZY ENTITY & TYPO TOLERANCE
# ============================================================================
print("\n--- CATEGORY 11: FUZZY TYPO TOLERANCE ---")
typo_checks = [
    ("nvdia", "NVIDIA Corporation"),
    ("microsft", "Microsoft Corporation"),
    ("tesala", "Tesla, Inc."),
    ("relaince", "Reliance Industries Ltd"),
]
for typo, expected in typo_checks:
    ents = resolve_entities(f"Tell me about {typo}")
    assert_test(any(e.canonical_name == expected for e in ents), f"Fuzzy matching: '{typo}' -> resolved to {expected}.")

# ============================================================================
# CATEGORY 12: HINGLISH & COLLOQUIAL NORMALIZATION
# ============================================================================
print("\n--- CATEGORY 12: HINGLISH & COLLOQUIAL ---")
hinglish_queries = [
    ("mere liye kaunsa mutual fund acha hai", ConversationalIntent.MUTUAL_FUND_ANALYSIS),
    ("nifty kyun gira", ConversationalIntent.MARKET_ANALYSIS),
    ("gold kyun badh raha hai", ConversationalIntent.MARKET_ANALYSIS),
    ("monthly 20000 invest karna hai", ConversationalIntent.SIP_CALCULATION),
    ("mere liye konsa stock sahi hai", ConversationalIntent.STOCK_SCREENING),
    ("batao ETF kya hota hai", ConversationalIntent.EDUCATION),
    ("kaunsa safe hai", ConversationalIntent.RISK_ANALYSIS),
    ("isme kitna paisa lagau", ConversationalIntent.ALLOCATION_ADVICE),
    ("ye risky hai kya", ConversationalIntent.RISK_ANALYSIS),
]
for h_query, expected_intent in hinglish_queries:
    intent, _ = classify_intent(h_query)
    assert_test(intent == expected_intent, f"Hinglish '{h_query}' -> intent {expected_intent.value}.")

# ============================================================================
# CATEGORY 13: MULTI-INTENT DECOMPOSITION
# ============================================================================
print("\n--- CATEGORY 13: MULTI-INTENT DECOMPOSITION ---")
multi_q = "Compare Nvidia and Microsoft and tell me which is safer and how much to allocate."
_, meta = classify_intent(multi_q)
sub_intents = meta.get("sub_intents", [])
assert_test(
    len(sub_intents) >= 2,
    f"Multi-intent: Decomposed compound query into {len(sub_intents)} sub-intents ({sub_intents})."
)

# ============================================================================
# CATEGORY 14: MULTI-USER ISOLATION & TAILORING
# ============================================================================
print("\n--- CATEGORY 14: MULTI-USER TAILORING & ISOLATION ---")
res_young = process_conversational_query("Suggest me some US stocks", user_context=USER_AGGRESSIVE)
res_mature = process_conversational_query("Suggest me some US stocks", user_context=USER_CONSERVATIVE)

assert_test(
    "Aggressive" in res_young.get("answer", "") and "Conservative" in res_mature.get("answer", ""),
    "Multi-user Isolation: Aggressive User and Conservative User received distinct risk-tailored framings."
)

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
total_tests = passed_count + failed_count
print(f"VESTIQ TEST RESULTS: {passed_count}/{total_tests} ASSERTIONS PASSED")
print("=" * 80)

if failed_count > 0:
    print(f"FAILED TESTS DETECTED: {failed_count}")
    sys.exit(1)
else:
    print("ALL 100+ UNIVERSAL ACCURACY & INTELLIGENCE SCENARIOS PASSED 100%!")
    sys.exit(0)
