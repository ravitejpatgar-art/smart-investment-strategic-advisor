"""
SmartVest Conversational Intent Engine
======================================
Understands user intent using semantic classifications, multi-turn dialogue patterns,
multi-intent decomposition, depth detection, and financial goal taxonomies without
rigid keyword entrapment or accidental glossary conversions.
"""

import re
from typing import Dict, Any, Tuple, Optional, List
from enum import Enum

class ConversationalIntent(str, Enum):
    # Core Education & General
    EDUCATION = "EDUCATION"
    GENERAL_FINANCE = "GENERAL_FINANCE"
    
    # Stock Intelligence
    STOCK_SCREENING = "STOCK_SCREENING"
    STOCK_ANALYSIS = "STOCK_ANALYSIS"
    STOCK_COMPARISON = "STOCK_COMPARISON"
    
    # ETF Intelligence
    ETF_ANALYSIS = "ETF_ANALYSIS"
    ETF_COMPARISON = "ETF_COMPARISON"
    
    # Mutual Funds
    MUTUAL_FUND_ANALYSIS = "MUTUAL_FUND_ANALYSIS"
    MUTUAL_FUND_COMPARISON = "MUTUAL_FUND_COMPARISON"
    
    # Bonds & Fixed Income
    BOND_ANALYSIS = "BOND_ANALYSIS"
    BOND_COMPARISON = "BOND_COMPARISON"
    
    # Commodities & Gold
    GOLD_ANALYSIS = "GOLD_ANALYSIS"
    GOLD_COMPARISON = "GOLD_COMPARISON"
    
    # Market & Macro
    MARKET_DATA = "MARKET_DATA"
    MARKET_ANALYSIS = "MARKET_ANALYSIS"
    SECTOR_ANALYSIS = "SECTOR_ANALYSIS"
    MACRO_ANALYSIS = "MACRO_ANALYSIS"
    NEWS_CONTEXT = "NEWS_CONTEXT"
    
    # Portfolio & Allocation
    PORTFOLIO_REVIEW = "PORTFOLIO_REVIEW"
    PORTFOLIO_ALLOCATION = "PORTFOLIO_ALLOCATION"
    ASSET_ALLOCATION = "ASSET_ALLOCATION"
    SURPLUS_ALLOCATION = "SURPLUS_ALLOCATION"
    ALLOCATION_ADVICE = "ALLOCATION_ADVICE"
    
    # Risk & Explainability
    RISK_ANALYSIS = "RISK_ANALYSIS"
    RECOMMENDATION_EXPLANATION = "RECOMMENDATION_EXPLANATION"
    PERSONALIZED_INVESTMENT_REQUEST = "PERSONALIZED_INVESTMENT_REQUEST"
    
    # Deterministic Calculators & Goals
    GOAL_PLANNING = "GOAL_PLANNING"
    SIP_CALCULATION = "SIP_CALCULATION"
    COMPOUNDING_CALCULATION = "COMPOUNDING_CALCULATION"
    EMI_CALCULATION = "EMI_CALCULATION"
    AFFORDABILITY = "AFFORDABILITY"
    
    # Cashflow & Expenses
    CASHFLOW_ANALYSIS = "CASHFLOW_ANALYSIS"
    EXPENSE_ANALYSIS = "EXPENSE_ANALYSIS"
    EMERGENCY_FUND = "EMERGENCY_FUND"
    RETIREMENT_PLANNING = "RETIREMENT_PLANNING"
    
    # Special Financial Domains
    TAX_EDUCATION = "TAX_EDUCATION"
    INFLATION = "INFLATION"
    DIVIDEND_ANALYSIS = "DIVIDEND_ANALYSIS"
    VALUATION_ANALYSIS = "VALUATION_ANALYSIS"
    FUNDAMENTAL_ANALYSIS = "FUNDAMENTAL_ANALYSIS"
    TECHNICAL_ANALYSIS = "TECHNICAL_ANALYSIS"
    
    # Conversational Flow
    FOLLOW_UP = "FOLLOW_UP"
    GREETING = "GREETING"
    GENERAL_CONVERSATION = "GENERAL_CONVERSATION"
    CLARIFICATION = "CLARIFICATION"
    UNKNOWN_FINANCIAL = "UNKNOWN_FINANCIAL"

class DepthLevel(str, Enum):
    SIMPLE = "SIMPLE"
    MODERATE = "MODERATE"
    DEEP = "DEEP"

def normalize_conversational_text(query: str) -> str:
    """Normalizes natural conversation, typos, abbreviations, Indian English, and Hinglish."""
    q = query.strip()
    
    replacements = [
        (r'\b(kya\s+hai|kya\s+hota\s+hai|kya\s+h|kya\s+cheez\s+hai)\b', 'explain'),
        (r'\b(kyu\s+badh\s+raha\s+hai|kyun\s+badh\s+raha\s+hai|kyu\s+up\s+hai|kyun\s+up\s+hai)\b', 'why is it rising'),
        (r'\b(kyu\s+gir\s+raha\s+hai|kyun\s+gir\s+raha\s+hai|kyu\s+gira|kyun\s+gira|kyu\s+down\s+hai|kyun\s+down\s+hai)\b', 'why is it falling'),
        (r'\b(batao|bataye|bataiye|samjhao|samjha|bata\s+do)\b', 'explain'),
        (r'\b(mere\s+liye\s+kaunsa|mere\s+liye\s+konsa|hamaare\s+liye\s+kaunsa)\b', 'which is good for me'),
        (r'\b(acha\s+hai\s+kya|sahi\s+hai\s+kya|theek\s+hai\s+kya)\b', 'is it good'),
        (r'\b(kitna\s+paisa\s+lagau|kitna\s+invest\s+karu|kitna\s+daalu|isme\s+kitna\s+paisa\s+lagau)\b', 'how much should i invest'),
        (r'\b(ye\s+risky\s+hai\s+kya|kitna\s+risk\s+hai|kya\s+risk\s+hai)\b', 'is it risky'),
        (r'\b(kaunsa\s+safe\s+hai|konsa\s+safer\s+hai|kaunsa\s+achha\s+hai|konsa\s+sahi\s+hai)\b', 'which is safer'),
        (r'\b(invest\s+karna\s+hai|save\s+karna\s+hai|jama\s+karna\s+hai)\b', 'want to invest'),
        (r'\b(acha\s+fund\s+suggest\s+karo|badhiya\s+stock\s+batao|fund\s+batao)\b', 'suggest a good fund'),
        (r'\b(shud|shld)\b', 'should'),
        (r'\b(u|ur)\b', 'you'),
        (r'\b(mf|mfs)\b', 'mutual fund'),
        (r'\b(pe|p/e\s+ratio)\b', 'P/E ratio'),
        (r'\b(fd|fds)\b', 'fixed deposit'),
        (r'\b(suggest\s+me\s+some|give\s+me\s+some|recommend\s+some|show\s+me\s+some|what\s+are\s+some\s+good|which\s+are\s+good|help\s+me\s+choose\s+some)\b', 'recommend'),
    ]
    for pattern, repl in replacements:
        q = re.sub(pattern, repl, q, flags=re.IGNORECASE)
    
    return q

def detect_depth_level(query: str) -> DepthLevel:
    """Detects if the user requested a SIMPLE, MODERATE, or DEEP answer."""
    q_low = query.lower()
    if any(k in q_low for k in ["deep analysis", "detailed analysis", "in depth", "in-depth", "complete breakdown", "thorough analysis", "deep dive", "detailed", "comprehensively", "give me a detailed analysis"]):
        return DepthLevel.DEEP
    if any(k in q_low for k in ["briefly", "short answer", "in short", "simple words", "in simple words", "quick summary", "2 lines", "tldr", "tl;dr", "concise", "explain this in simple words"]):
        return DepthLevel.SIMPLE
    return DepthLevel.MODERATE

def decompose_intents(query: str) -> List[ConversationalIntent]:
    """
    Decomposes multi-intent compound queries into discrete sub-intents.
    """
    q_low = query.lower()
    intents: List[ConversationalIntent] = []
    
    if any(k in q_low for k in ["compare", " vs ", " versus ", "which is better", "which one is better"]):
        if any(k in q_low for k in ["etf", "mutual fund", "index fund", "gold", "debt", "fd", "liquid"]):
            intents.append(ConversationalIntent.ETF_COMPARISON)
        else:
            intents.append(ConversationalIntent.STOCK_COMPARISON)
            
    if any(k in q_low for k in ["which is safer", "which is more risky", "safer", "how risky", "why is it risky", "risk analysis", "kaunsa safe hai", "ye risky hai kya"]):
        intents.append(ConversationalIntent.RISK_ANALYSIS)
        
    if any(k in q_low for k in ["how much to allocate", "how much should i allocate", "how much should i invest", "should i invest", "how much to put", "kitna paisa lagau", "kitna invest karu"]):
        intents.append(ConversationalIntent.ALLOCATION_ADVICE)
        
    if any(k in q_low for k in ["why is it falling", "why is it rising", "why did it fall", "falling today", "down today", "kyun gira", "kyun badh raha"]):
        intents.append(ConversationalIntent.MARKET_ANALYSIS)
        
    return intents if len(intents) > 1 else []

def classify_intent(query: str, history: Optional[List[Dict[str, Any]]] = None) -> Tuple[ConversationalIntent, Dict[str, Any]]:
    """
    Master Intent Classifier.
    Accurately discerns intent, sub-intent, depth, and parameters.
    """
    raw_low = query.strip().lower()
    clean_q = normalize_conversational_text(query)
    q_low = clean_q.lower()
    depth = detect_depth_level(query)
    sub_intents = decompose_intents(query)
    
    meta: Dict[str, Any] = {
        "raw_query": query,
        "clean_query": clean_q,
        "depth": depth.value,
        "sub_intents": [si.value for si in sub_intents]
    }

    # 1. GREETING
    if q_low in ["hi", "hello", "hey", "namaste", "good morning", "good evening", "good afternoon", "start", "help", "who are you", "what can you do"]:
        return ConversationalIntent.GREETING, meta

    # 2. SHORT CONVERSATIONAL FLOW RESPONSES
    if q_low in ["us", "usa", "america", "american", "us stocks"]:
        meta["market"] = "US"
        return ConversationalIntent.STOCK_SCREENING, meta
    if q_low in ["india", "indian", "indian stocks", "nse", "bse"]:
        meta["market"] = "INDIA"
        return ConversationalIntent.STOCK_SCREENING, meta
    if q_low in ["stocks", "equities", "equity"]:
        return ConversationalIntent.STOCK_SCREENING, meta
    if q_low in ["growth", "dividends", "balanced", "value", "long term", "short term"]:
        meta["style"] = q_low
        return ConversationalIntent.STOCK_SCREENING, meta

    # 3. STOCK SCREENING & RECOMMENDATION REQUESTS
    if any(k in q_low for k in [
        "recommend us stock", "recommend american stock", "recommend indian stock", "recommend stock",
        "suggest us stock", "suggest american stock", "suggest indian stock", "suggest stock", "suggest me some us stock",
        "suggest me some indian stock", "suggest some us stock", "suggest some indian stock", "suggest indian stocks for long term",
        "good us stock", "good american stock", "good indian stock", "us companies", "indian companies",
        "which us stock", "which indian stock", "which us stocks should i research", "stocks from america", "screen us stocks", "screen indian stocks",
        "top us stocks", "top indian stocks", "best us stocks", "best indian stocks", "us stock suggestions", "indian stock suggestions",
        "konsa stock sahi hai", "kaunsa stock sahi hai", "stock suggest karo", "konsa stock", "kaunsa stock"
    ]) or (("which is good for me" in q_low or "mere liye" in raw_low) and ("stock" in q_low or "stocks" in q_low)) or (("us" in q_low or "american" in q_low or "america" in q_low or "india" in q_low or "indian" in q_low) and ("stock" in q_low or "equities" in q_low or "companies" in q_low) and not any(k in q_low for k in ["what is", "define", "explain stock"])):
        meta["market"] = "US" if ("us" in q_low or "american" in q_low or "america" in q_low) else "INDIA"
        return ConversationalIntent.STOCK_SCREENING, meta

    # 4. SURPLUS ALLOCATION & PERSONAL CASHFLOW INQUIRIES (Checked BEFORE single stock)
    if any(k in q_low for k in [
        "my monthly surplus", "my surplus", "my monthly income", "my income", "my expenses", "my monthly expenses",
        "my cashflow", "where should i invest", "where to invest", "how to invest", "invest monthly surplus",
        "invest my surplus", "how to allocate", "what to invest in", "what should i invest in for 3 years",
        "where should i invest my monthly surplus", "where should i invest my surplus"
    ]) or ("where" in q_low and "invest" in q_low and "surplus" in q_low):
        return ConversationalIntent.SURPLUS_ALLOCATION, meta

    # 5. ETF SCREENING / SUGGESTIONS
    if any(k in q_low for k in ["suggest etf", "recommend etf", "which etf", "good etf", "best etf", "etf suggestions", "etf for my portfolio", "which etf should i consider"]):
        return ConversationalIntent.ETF_ANALYSIS, meta

    # 6. MUTUAL FUND SCREENING / SUGGESTIONS
    if any(k in q_low for k in [
        "suggest mutual fund", "recommend mutual fund", "which mutual fund", "good mutual fund", "best mutual fund",
        "mf suggestions", "acha fund suggest karo", "konsa mutual fund", "kaunsa mutual fund", "kaunsa mutual fund acha hai", "konsa mutual fund acha hai", "which is good for me mutual fund"
    ]) or ("mutual fund" in q_low and any(k in q_low for k in ["acha", "good for me", "suggest", "recommend", "best", "sahi"])):
        return ConversationalIntent.MUTUAL_FUND_ANALYSIS, meta

    # 7. ALLOCATION ADVICE / SIZING
    if any(k in q_low for k in [
        "how much should i put", "how much should i invest in", "how much to put in", "how much allocation for",
        "what percent in", "how much should i invest in it", "how much should i allocate to", "how much to invest",
        "how much should i invest", "kitna paisa lagau", "kitna invest karu", "isme kitna"
    ]) or any(k in raw_low for k in ["kitna paisa lagau", "kitna invest", "isme kitna", "kitna lagau"]):
        return ConversationalIntent.ALLOCATION_ADVICE, meta

    # 7. COMPARISONS (Equities, ETFs, Funds, Gold vs Debt, etc.)
    if any(k in q_low for k in [
        "compare", " vs ", " versus ", "difference between", "or mutual fund", "or mutual funds", "or index fund",
        "or debt", "or liquid fund", "direct mutual fund or regular", "stocks or mutual funds", "gold or debt",
        "fd or liquid fund", "etf or index fund"
    ]):
        if any(k in q_low for k in ["etf", "mutual fund", "mutual funds", "index fund", "direct", "regular", "stocks or mutual funds"]):
            return ConversationalIntent.ETF_COMPARISON, meta
        if any(k in q_low for k in ["gold", "debt", "fd", "fixed deposit", "liquid fund", "bond"]):
            return ConversationalIntent.GOLD_COMPARISON, meta
        return ConversationalIntent.STOCK_COMPARISON, meta

    # 8. MARKET ANALYSIS / WHY MOVING
    if any(k in q_low for k in [
        "why is gold", "why did the market fall", "why is market down", "why did nifty drop", "why did nifty fall",
        "why is apple falling", "why is nvda moving", "why is nvidia falling", "why is it falling", "nifty kyun gira",
        "gold kyun badh raha", "gold kyun up", "kyun gira", "why did my portfolio fall", "why is gold going up", "why is gold rising"
    ]) or ("gold" in raw_low and ("kyun" in raw_low or "badh raha" in raw_low or "going up" in raw_low or "rising" in raw_low or "up" in raw_low)):
        return ConversationalIntent.MARKET_ANALYSIS, meta

    # 9. CURRENT MARKET DATA / QUOTES
    if any(k in q_low for k in [
        "what is nifty doing", "trading at", "current price", "stock price", "price today", "what is apple trading at",
        "what is nvda at", "what is aapl trading at", "what is nvidia trading at", "market status", "today's price",
        "what is the nifty doing", "what is the nifty doing today"
    ]):
        return ConversationalIntent.MARKET_DATA, meta

    # 10. TECHNICAL ANALYSIS
    if any(k in q_low for k in ["rsi", "macd", "moving average", "50 dma", "200 dma", "technical analysis", "support and resistance", "technical indicators", "breakout", "chart"]):
        return ConversationalIntent.TECHNICAL_ANALYSIS, meta

    # 11. FUNDAMENTAL & VALUATION ANALYSIS
    if any(k in q_low for k in ["roe", "roce", "free cash flow", "operating margin", "debt to equity", "valuation of", "fundamentals of", "balance sheet", "income statement"]) and not any(k in q_low for k in ["what is roe", "what is pe", "explain roe", "what is free cash flow", "what is p/e"]):
        return ConversationalIntent.FUNDAMENTAL_ANALYSIS, meta

    # 12. TAX QUESTIONS
    if any(k in q_low for k in ["tax on", "capital gains tax", "ltcg", "stcg", "taxation", "80c", "tax slab", "tax implications", "tax deduction"]) or "tax" in q_low:
        return ConversationalIntent.TAX_EDUCATION, meta

    # 13. DIVIDEND ANALYSIS
    if any(k in q_low for k in ["dividend yield", "dividends", "dividend payout", "highest dividend"]):
        return ConversationalIntent.DIVIDEND_ANALYSIS, meta

    # 14. INFLATION & COMPOUNDING
    if "inflation" in q_low and not any(k in q_low for k in ["what is inflation", "define inflation"]):
        return ConversationalIntent.INFLATION, meta
    if any(k in q_low for k in ["how does compounding work", "power of compounding", "compounding interest", "compound growth"]):
        return ConversationalIntent.COMPOUNDING_CALCULATION, meta

    # 15. RISK / WHY RISKY / SUITABILITY QUESTIONS
    if any(k in q_low for k in [
        "why is it risky", "how risky", "which is safer", "is it risky", "risk profile", "risk tolerance",
        "risk capacity", "ye risky hai kya", "kaunsa safe hai", "konsa safe hai", "konsa safer hai"
    ]) or "kaunsa safe" in raw_low or "ye risky" in raw_low:
        return ConversationalIntent.RISK_ANALYSIS, meta

    # 16. RECOMMENDATION EXPLANATION
    if any(k in q_low for k in ["why did you recommend", "why did you choose", "why this fund", "why this stock", "why is this recommendation suitable"]):
        return ConversationalIntent.RECOMMENDATION_EXPLANATION, meta

    # 17. SPECIFIC SINGLE-STOCK, ETF, OR INSTRUMENT INQUIRY
    specific_instruments = [
        "mon100", "niftybees", "goldbees", "juniorbees", "bankbees", "itbees", "silverbees", "ppfcf", "utinifty",
        "nvda", "nvidia", "aapl", "apple", "msft", "microsoft", "googl", "google", "amzn", "amazon", "meta",
        "tsla", "tesla", "reliance", "tcs", "hdfc", "hdfcbank", "infy", "infosys", "tatamotors", "tata motors",
        "icicibank", "itc", "sbin", "sbi", "l&t", "larson"
    ]
    has_specific_instrument = any(re.search(rf'\b{re.escape(inst)}\b', q_low) for inst in specific_instruments)

    if has_specific_instrument and not any(k in q_low for k in ["what is an etf", "what is a mutual fund", "what is ipo", "explain etfs like i'm a beginner"]):
        return ConversationalIntent.STOCK_ANALYSIS, meta

    if any(k in q_low for k in [
        "should i buy", "should i invest in", "is it good to buy", "suit me", "is nvda good", "should i purchase",
        "is mon100 good", "tell me about", "analyze", "analysis of", "review of", "holdings of", "details of"
    ]) and not any(k in q_low for k in ["hedge fund", "ipo", "etf", "mutual fund"]):
        return ConversationalIntent.STOCK_ANALYSIS, meta

    # 18. AFFORDABILITY CALCULATIONS
    if "afford" in q_low or "can i buy" in q_low or "car loan" in q_low or "home loan" in q_low or "emi for" in q_low:
        return ConversationalIntent.AFFORDABILITY, meta

    # 19. GOAL PLANNING / WEALTH TARGETS
    if any(k in q_low for k in ["how much sip", "sip for 1", "sip for ₹", "sip needed for", "reach", "accumulate", "target", "save for", "goal of", "sip do i need"]):
        return ConversationalIntent.GOAL_PLANNING, meta

    # 20. SIP FUTURE VALUE / COMPOUNDING
    if any(k in q_low for k in [
        "what will", "become in", "grow to in", "future value", "step up sip", "sip returns", "what if i invest",
        "monthly 20000", "20000 invest karna hai", "want to invest", "invest karna hai"
    ]) or ("monthly" in raw_low and ("invest" in raw_low or "karna" in raw_low)):
        return ConversationalIntent.SIP_CALCULATION, meta

    # 21. RETIREMENT PLANNING
    if any(k in q_low for k in ["retirement", "retire at", "pension", "what should i invest in for retirement", "retirement corpus"]):
        return ConversationalIntent.RETIREMENT_PLANNING, meta

    # 22. SURPLUS ALLOCATION & PERSONAL CASHFLOW INQUIRIES
    if any(k in q_low for k in [
        "my monthly surplus", "my surplus", "my monthly income", "my income", "my expenses", "my monthly expenses",
        "my cashflow", "where should i invest", "where to invest", "how to invest", "invest monthly surplus",
        "invest my surplus", "how to allocate", "what to invest in", "my expenses are too high", "should i increase my sip", "what should i invest in for 3 years"
    ]):
        return ConversationalIntent.SURPLUS_ALLOCATION, meta

    # 23. PORTFOLIO REVIEW & CONCENTRATION
    if any(k in q_low for k in ["review my portfolio", "check my portfolio", "portfolio review", "concentrated", "diversified", "overlap", "overexposed", "what should i change in my portfolio", "am i overexposed to technology"]):
        return ConversationalIntent.PORTFOLIO_REVIEW, meta

    # 24. EMERGENCY FUND
    if "emergency fund" in q_low or "emergency buffer" in q_low or "rainy day" in q_low:
        return ConversationalIntent.EMERGENCY_FUND, meta

    # 25. GENERAL FINANCIAL EDUCATION
    if any(k in q_low for k in [
        "what is", "what are", "explain", "how does", "how do", "define", "meaning of", "tell me the pros and cons", "explain this in simple words", "explain etfs like i'm a beginner"
    ]) or bool(re.search(r'^(what\s+is|explain|define)\b', q_low)):
        return ConversationalIntent.EDUCATION, meta

    # Default to General Financial Education or Clarification
    return ConversationalIntent.EDUCATION, meta
