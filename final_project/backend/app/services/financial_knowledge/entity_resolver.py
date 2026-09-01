"""
Financial Entity Resolver for SmartVest Universal Intelligence Engine.
Identifies financial concepts, instruments, tickers, indices, monetary amounts, 
time horizons, and interest percentages from raw natural language queries.
"""

import re
from enum import Enum
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

class EntityType(str, Enum):
    FINANCIAL_CONCEPT = "FINANCIAL_CONCEPT"
    STOCK = "STOCK"
    ETF = "ETF"
    MUTUAL_FUND = "MUTUAL_FUND"
    INDEX = "INDEX"
    COMMODITY = "COMMODITY"
    CURRENCY = "CURRENCY"
    AMOUNT = "AMOUNT"
    PERCENTAGE = "PERCENTAGE"
    TIME_HORIZON = "TIME_HORIZON"
    GOAL_TYPE = "GOAL_TYPE"
    UNKNOWN = "UNKNOWN"

@dataclass
class ResolvedEntity:
    raw_text: str
    entity_type: EntityType
    canonical_name: str
    identifier: str
    metadata: Dict[str, Any]

# Known instruments and indices map
INSTRUMENT_REGISTRY = {
    # ETFs
    "niftybees": {"name": "Nippon India ETF Nifty BeES", "type": EntityType.ETF, "symbol": "NIFTYBEES.NS"},
    "mon100": {"name": "Motilal Oswal Nasdaq 100 ETF", "type": EntityType.ETF, "symbol": "MON100.NS"},
    "goldbees": {"name": "Nippon India ETF Gold BeES", "type": EntityType.ETF, "symbol": "GOLDBEES.NS"},
    "juniorbees": {"name": "Nippon India ETF Junior BeES", "type": EntityType.ETF, "symbol": "JUNIORBEES.NS"},
    "bankbees": {"name": "Nippon India ETF Bank BeES", "type": EntityType.ETF, "symbol": "BANKBEES.NS"},
    "itbees": {"name": "Nippon India ETF Nifty IT", "type": EntityType.ETF, "symbol": "ITBEES.NS"},
    
    # Major Equities
    "reliance": {"name": "Reliance Industries Ltd", "type": EntityType.STOCK, "symbol": "RELIANCE.NS"},
    "tcs": {"name": "Tata Consultancy Services Ltd", "type": EntityType.STOCK, "symbol": "TCS.NS"},
    "infy": {"name": "Infosys Ltd", "type": EntityType.STOCK, "symbol": "INFY.NS"},
    "infosys": {"name": "Infosys Ltd", "type": EntityType.STOCK, "symbol": "INFY.NS"},
    "hdfc": {"name": "HDFC Bank Ltd", "type": EntityType.STOCK, "symbol": "HDFCBANK.NS"},
    "hdfc bank": {"name": "HDFC Bank Ltd", "type": EntityType.STOCK, "symbol": "HDFCBANK.NS"},
    "icici": {"name": "ICICI Bank Ltd", "type": EntityType.STOCK, "symbol": "ICICIBANK.NS"},
    "icici bank": {"name": "ICICI Bank Ltd", "type": EntityType.STOCK, "symbol": "ICICIBANK.NS"},
    "tata motors": {"name": "Tata Motors Ltd", "type": EntityType.STOCK, "symbol": "TATAMOTORS.NS"},
    "itc": {"name": "ITC Ltd", "type": EntityType.STOCK, "symbol": "ITC.NS"},
    "sbi": {"name": "State Bank of India", "type": EntityType.STOCK, "symbol": "SBIN.NS"},
    "apple": {"name": "Apple Inc.", "type": EntityType.STOCK, "symbol": "AAPL"},
    "aapl": {"name": "Apple Inc.", "type": EntityType.STOCK, "symbol": "AAPL"},
    "microsoft": {"name": "Microsoft Corp.", "type": EntityType.STOCK, "symbol": "MSFT"},
    "msft": {"name": "Microsoft Corp.", "type": EntityType.STOCK, "symbol": "MSFT"},
    "google": {"name": "Alphabet Inc.", "type": EntityType.STOCK, "symbol": "GOOGL"},
    "googl": {"name": "Alphabet Inc.", "type": EntityType.STOCK, "symbol": "GOOGL"},
    "nvidia": {"name": "NVIDIA Corp.", "type": EntityType.STOCK, "symbol": "NVDA"},
    "nvda": {"name": "NVIDIA Corp.", "type": EntityType.STOCK, "symbol": "NVDA"},

    # Mutual Funds
    "uti nifty 50": {"name": "UTI Nifty 50 Index Fund Direct-Growth", "type": EntityType.MUTUAL_FUND, "symbol": "UTI_NIFTY50"},
    "parag parikh": {"name": "Parag Parikh Flexi Cap Fund Direct-Growth", "type": EntityType.MUTUAL_FUND, "symbol": "PPFCF"},
    "ppfcf": {"name": "Parag Parikh Flexi Cap Fund Direct-Growth", "type": EntityType.MUTUAL_FUND, "symbol": "PPFCF"},
    "hdfc balanced advantage": {"name": "HDFC Balanced Advantage Fund Direct-Growth", "type": EntityType.MUTUAL_FUND, "symbol": "HDFC_BAF"},

    # Major Indices
    "nifty": {"name": "NIFTY 50", "type": EntityType.INDEX, "symbol": "^NSEI"},
    "nifty 50": {"name": "NIFTY 50", "type": EntityType.INDEX, "symbol": "^NSEI"},
    "sensex": {"name": "BSE SENSEX", "type": EntityType.INDEX, "symbol": "^BSESN"},
    "nasdaq": {"name": "NASDAQ 100", "type": EntityType.INDEX, "symbol": "^NDX"},
    "nasdaq 100": {"name": "NASDAQ 100", "type": EntityType.INDEX, "symbol": "^NDX"},
    "s&p 500": {"name": "S&P 500", "type": EntityType.INDEX, "symbol": "^GSPC"},

    # Commodities & Currency
    "gold": {"name": "Gold (10g / MCX)", "type": EntityType.COMMODITY, "symbol": "GOLD"},
    "silver": {"name": "Silver (1kg)", "type": EntityType.COMMODITY, "symbol": "SILVER"},
    "crude": {"name": "Crude Oil (Brent)", "type": EntityType.COMMODITY, "symbol": "CRUDE_OIL"},
    "usd/inr": {"name": "US Dollar / Indian Rupee", "type": EntityType.CURRENCY, "symbol": "USDINR=X"},
    "usdinr": {"name": "US Dollar / Indian Rupee", "type": EntityType.CURRENCY, "symbol": "USDINR=X"}
}

def extract_currency_amounts(text: str) -> List[Dict[str, Any]]:
    """Extracts numeric rupee amounts from patterns like ₹10 lakh, 1.5 Cr, 25000, 10k, 50L."""
    t = text.lower()
    results = []

    # 1. Crores patterns (e.g. ₹1 crore, 1.5 cr, 5 crores)
    for m in re.finditer(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:cr(?:ore)?s?)\b', t):
        val = float(m.group(1)) * 10000000.0
        results.append({"raw": m.group(0), "amount": val, "unit": "Crore"})

    # 2. Lakhs patterns (e.g. ₹10 lakh, 15 lakhs, 2.5l, 50 lac)
    for m in re.finditer(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh?s?|lacs?|\bl\b)\b', t):
        val = float(m.group(1)) * 100000.0
        results.append({"raw": m.group(0), "amount": val, "unit": "Lakh"})

    # 3. Thousands patterns (e.g. 25k, ₹50 thousand)
    for m in re.finditer(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousands?)\b', t):
        val = float(m.group(1)) * 1000.0
        results.append({"raw": m.group(0), "amount": val, "unit": "Thousand"})

    # 4. Explicit Rupee numbers (e.g. ₹20,000, ₹25000, Rs. 15000)
    for m in re.finditer(r'(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)', t):
        clean_num = m.group(1).replace(",", "")
        try:
            val = float(clean_num)
            if val > 0 and not any(r["raw"] in m.group(0) for r in results):
                results.append({"raw": m.group(0), "amount": val, "unit": "INR"})
        except ValueError:
            pass

    # 5. Plain 4+ digit numbers if not matched yet
    for m in re.finditer(r'\b(\d{4,9})\b', t):
        num_str = m.group(1)
        # Avoid year numbers like 2024, 2025, 2026 unless preceded by Rs
        val = float(num_str)
        if val not in [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2030, 2035, 2040, 2050]:
            if not any(r["amount"] == val for r in results):
                results.append({"raw": m.group(0), "amount": val, "unit": "INR"})

    return results

def extract_time_horizons(text: str) -> List[Dict[str, Any]]:
    """Extracts years or months horizons (e.g., in 15 years, for 10 yrs, at age 50)."""
    t = text.lower()
    horizons = []
    
    # Years match
    for m in re.finditer(r'(\d+)\s*(?:years?|yrs?)\b', t):
        horizons.append({"raw": m.group(0), "years": int(m.group(1)), "type": "years"})

    # Months match
    for m in re.finditer(r'(\d+)\s*(?:months?|mos?)\b', t):
        horizons.append({"raw": m.group(0), "months": int(m.group(1)), "years": int(m.group(1))/12.0, "type": "months"})

    # Age target match (e.g. retire at 55)
    for m in re.finditer(r'(?:at|by)\s*(?:age\s*)?(\d{2})\b', t):
        target_age = int(m.group(1))
        if 40 <= target_age <= 75:
            horizons.append({"raw": m.group(0), "target_age": target_age, "type": "target_age"})

    return horizons

def resolve_financial_entities(query: str) -> List[ResolvedEntity]:
    """Identifies all distinct financial entities from the query."""
    q = query.lower().strip()
    entities: List[ResolvedEntity] = []

    # 1. Check Instrument Registry
    for key, meta in INSTRUMENT_REGISTRY.items():
        pattern = r'\b' + re.escape(key) + r'\b'
        if re.search(pattern, q):
            entities.append(ResolvedEntity(
                raw_text=key,
                entity_type=meta["type"],
                canonical_name=meta["name"],
                identifier=meta["symbol"],
                metadata=meta
            ))

    # 2. Check Financial Concepts from Glossary
    from app.services.financial_knowledge.glossary import FINANCIAL_GLOSSARY
    for cid, concept in FINANCIAL_GLOSSARY.items():
        # Exact multi-word or boundary matching for concept aliases
        for alias in concept.aliases:
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, q):
                # Avoid duplicate concepts
                if not any(e.identifier == concept.id for e in entities):
                    entities.append(ResolvedEntity(
                        raw_text=alias,
                        entity_type=EntityType.FINANCIAL_CONCEPT,
                        canonical_name=concept.title,
                        identifier=concept.id,
                        metadata={"category": concept.category, "summary": concept.summary}
                    ))
                break

    # 3. Check Monetary Amounts
    amounts = extract_currency_amounts(query)
    for amt in amounts:
        entities.append(ResolvedEntity(
            raw_text=amt["raw"],
            entity_type=EntityType.AMOUNT,
            canonical_name=f"₹{amt['amount']:,.0f}",
            identifier=str(amt["amount"]),
            metadata=amt
        ))

    # 4. Check Time Horizons
    horizons = extract_time_horizons(query)
    for h in horizons:
        entities.append(ResolvedEntity(
            raw_text=h["raw"],
            entity_type=EntityType.TIME_HORIZON,
            canonical_name=h["raw"],
            identifier=str(h.get("years", h.get("target_age"))),
            metadata=h
        ))

    return entities
