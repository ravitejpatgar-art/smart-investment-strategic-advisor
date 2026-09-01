"""
Deterministic & Semantic Conversation Title Generator
Generates clean, professional titles (<50 chars) from the first user query,
avoiding personal financial details while capturing financial intent.
"""

import re

def generate_conversation_title(query: str) -> str:
    if not query or not query.strip():
        return "New Financial Chat"
    
    text = query.strip()
    lower = text.lower()
    
    # Generic or trivial greetings
    if lower in ["hi", "hello", "hey", "help", "what", "tell me", "start", "test", "hi vestiq", "hello vestiq"]:
        return "New Financial Chat"
    
    # 1. ETFs & Mutual Funds Comparison
    if ("etf" in lower and ("mutual fund" in lower or "mf" in lower)) or "etf vs" in lower or "compare etf" in lower:
        return "ETF vs Mutual Funds"
    
    # 2. Stock Screening (US / India)
    if "us stock" in lower or "us stocks" in lower or "nasdaq" in lower or "american stock" in lower:
        if "suggest" in lower or "recommend" in lower:
            return "US Stock Suggestions"
        return "US Stock Research"
    
    if "indian stock" in lower or "indian stocks" in lower or "india stock" in lower or "nse" in lower:
        if "suggest" in lower or "recommend" in lower:
            return "Indian Stock Suggestions"
        return "Indian Stock Research"
    
    # 3. Ticker Specific Deep Dives
    tickers = {
        "nvidia": "Nvidia Analysis",
        "nvda": "Nvidia Analysis",
        "apple": "Apple Analysis",
        "aapl": "Apple Analysis",
        "microsoft": "Microsoft Analysis",
        "msft": "Microsoft Analysis",
        "google": "Google Analysis",
        "googl": "Google Analysis",
        "tesla": "Tesla Analysis",
        "tsla": "Tesla Analysis",
        "reliance": "Reliance Analysis",
        "tcs": "TCS Analysis",
        "hdfc": "HDFC Bank Analysis",
        "tata motors": "Tata Motors Analysis",
        "infy": "Infosys Analysis",
        "infosys": "Infosys Analysis",
    }
    for k, v in tickers.items():
        # Match whole word
        if re.search(r'\b' + re.escape(k) + r'\b', lower):
            if "compare" in lower:
                # E.g. Compare Apple and Microsoft
                for k2, v2 in tickers.items():
                    if k2 != k and re.search(r'\b' + re.escape(k2) + r'\b', lower):
                        name1 = k.capitalize()
                        name2 = k2.capitalize()
                        return f"{name1} vs {name2}"
            return v
    
    # 4. SIP & Goal Planning
    if "sip" in lower:
        # Check for ₹1 crore, 1 cr, 50 lakh, etc.
        crore_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore)', lower)
        if crore_match:
            val = crore_match.group(1)
            return f"₹{val} Crore SIP Plan"
        lakh_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)', lower)
        if lakh_match:
            val = lakh_match.group(1)
            return f"₹{val} Lakh SIP Plan"
        if "how much sip" in lower or "sip for" in lower:
            return "SIP Goal Roadmap"
        return "SIP Investment Plan"
    
    # 5. Affordability / Purchases (e.g., car, house)
    if "afford" in lower or "buy" in lower:
        car_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lac|cr|crore)?\s*car', lower)
        if "car" in lower:
            amount_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac)', lower)
            if amount_match:
                return f"₹{amount_match.group(1)} Lakh Car Affordability"
            return "Car Affordability Analysis"
        if "house" in lower or "home" in lower or "flat" in lower:
            return "Home Purchase Affordability"
        return "Purchase Affordability"
    
    # 6. Portfolio Review
    if "portfolio" in lower:
        if "review" in lower or "audit" in lower or "check" in lower or "analyze" in lower:
            return "Portfolio Review"
        if "allocation" in lower or "rebalance" in lower:
            return "Asset Allocation Review"
        return "Portfolio Strategy"
    
    # 7. Education / Concept Overviews
    if "what is" in lower or "explain" in lower:
        if "etf" in lower:
            return "ETF Guide"
        if "direct index" in lower:
            return "Direct Indexing Guide"
        if "reit" in lower:
            return "REIT Investment Guide"
        if "pe ratio" in lower or "p/e" in lower:
            return "P/E Ratio Explained"
        if "xirr" in lower:
            return "XIRR Return Analysis"
        if "hedge fund" in lower:
            return "Hedge Funds Overview"
        if "ipo" in lower:
            return "IPO Investment Guide"
        if "gold" in lower:
            return "Gold Hedge Strategy"
    
    # 8. Market & Macro Movements
    if "nifty" in lower:
        return "Nifty Market Overview"
    if "sensex" in lower:
        return "Sensex Market Overview"
    if "gold" in lower:
        return "Gold Market Analysis"
    if "market" in lower and ("today" in lower or "outlook" in lower):
        return "Market Outlook"
    
    # 9. Surplus Allocation
    if "surplus" in lower or "invest monthly" in lower:
        return "Monthly Surplus Strategy"
    
    # 10. Fallback: Clean up query, capitalize words, trim to max 45 chars
    clean = re.sub(r'^(can you|could you|please|tell me about|how to|what is|how do i)\s+', '', text, flags=re.IGNORECASE).strip()
    clean = re.sub(r'[^\w\s₹\-\/]', '', clean).strip()
    
    if not clean:
        return "New Financial Chat"
    
    # Capitalize title
    words = clean.split()
    title_cand = " ".join(w.capitalize() if not w.isupper() else w for w in words)
    
    if len(title_cand) > 45:
        title_cand = title_cand[:42].rstrip() + "..."
    
    return title_cand or "New Financial Chat"
