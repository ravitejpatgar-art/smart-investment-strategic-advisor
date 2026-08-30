from typing import Dict, Any, List

COURSES_DATA: List[Dict[str, Any]] = [
    {
        "id": "personal-finance-101",
        "title": "Personal Finance & The 50/30/20 Rule",
        "category": "Foundations",
        "level": "Beginner",
        "duration": "15 Mins",
        "lessonsCount": 4,
        "description": "Master budgeting psychology, cash flow automation, and the institutional 50/30/20 framework.",
        "badge": "Budgeting Master",
        "lessons": [
            {
                "title": "Demystifying the 50/30/20 Framework",
                "content": "The 50/30/20 rule divides your after-tax income into: 50% Needs (Rent, Groceries, Utilities), 30% Wants (Dining, Travel, Entertainment), and 20% Investments & Debt Payoff. Following this guarantees long-term wealth compounding without severe lifestyle austerity.",
                "takeaways": ["Cap essential fixed costs at 50%", "Invest minimum 20% of net income every month", "Automate savings on day 1 of salary credit"]
            },
            {
                "title": "The High-Cost Debt Avalanche vs Snowball",
                "content": "Credit card debt (>36% APR) destroys wealth compounding. The Debt Avalanche method prioritizes paying off highest-interest loans first to mathematically minimize total interest paid.",
                "takeaways": ["Never carry a revolving credit card balance", "Target highest APR loans first", "Consolidate high-interest unsecured debt"]
            }
        ],
        "quiz": {
            "question": "Under the 50/30/20 budgeting rule, what percentage of net income should be allocated to investments & debt repayment?",
            "options": ["10%", "20%", "35%", "50%"],
            "correctIndex": 1,
            "explanation": "20% of net income is the recommended threshold dedicated directly to wealth building and debt payoff."
        }
    },
    {
        "id": "stock-market-mastery",
        "title": "Stock Market Fundamentals & Equity Valuation",
        "category": "Equities",
        "level": "Intermediate",
        "duration": "25 Mins",
        "lessonsCount": 5,
        "description": "Learn P/E ratios, EPS growth, Market Cap tiers, and how institutional funds value compounders.",
        "badge": "Equity Analyst",
        "lessons": [
            {
                "title": "Understanding Price-to-Earnings (P/E) Ratio",
                "content": "The P/E ratio measures how much investors are willing to pay per rupee of company earnings. A P/E of 25 means paying ₹25 for ₹1 of annual earnings. Always compare P/E against historical median and industry peers.",
                "takeaways": ["High P/E signals high growth expectations", "Low P/E can signal deep value or a value trap", "Combine P/E with PEG ratio for growth context"]
            }
        ],
        "quiz": {
            "question": "What does a Price-to-Earnings (P/E) ratio of 20 signify?",
            "options": ["The stock price went up 20%", "You pay ₹20 for every ₹1 of company earnings", "The company pays 20% dividend", "The stock has 20 days of volume"],
            "correctIndex": 1,
            "explanation": "P/E ratio represents the multiple of current share price divided by annual Earnings Per Share (EPS)."
        }
    },
    {
        "id": "modern-portfolio-theory",
        "title": "Modern Portfolio Theory & Asset Allocation",
        "category": "Portfolio Theory",
        "level": "Advanced",
        "duration": "30 Mins",
        "lessonsCount": 6,
        "description": "Understand Harry Markowitz's Efficient Frontier, Sharpe Ratio, and uncorrelated asset diversification.",
        "badge": "MPT Strategist",
        "lessons": [
            {
                "title": "The Efficient Frontier & Uncorrelated Assets",
                "content": "Holding assets with low or negative correlation (Equities + Sovereign Gold + Government Bonds) reduces overall portfolio volatility while maximizing expected return CAGR.",
                "takeaways": ["Gold acts as a geopolitical hedge during market crashes", "Rebalance quarterly to harvest asset drift profits", "Never put all eggs in one sector basket"]
            }
        ],
        "quiz": {
            "question": "What is the primary benefit of holding uncorrelated assets like Gold alongside Equities?",
            "options": ["Guaranteed double-digit returns", "Reduces total portfolio volatility and drawdown", "Eliminates all taxes", "Increases daily trading fees"],
            "correctIndex": 1,
            "explanation": "Uncorrelated assets move independently, cushioning overall drawdowns during equity market corrections."
        }
    },
    {
        "id": "technical-indicators-pro",
        "title": "Technical Indicators (RSI, MACD, Bollinger Bands)",
        "category": "Trading & Quant",
        "level": "Advanced",
        "duration": "20 Mins",
        "lessonsCount": 4,
        "description": "Master 14-period RSI, Moving Average Golden Crosses, MACD Divergence, and Bollinger Volatility Channels.",
        "badge": "Technical Master",
        "lessons": [
            {
                "title": "Mastering Relative Strength Index (RSI)",
                "content": "RSI measures the speed and change of price movements on a scale from 0 to 100. RSI < 30 indicates oversold conditions (potential buying opportunity), while RSI > 70 indicates overbought conditions.",
                "takeaways": ["RSI < 30 is classically oversold", "RSI > 70 is classically overbought", "Watch for bullish divergence on weekly charts"]
            }
        ],
        "quiz": {
            "question": "An RSI reading below 30 typically indicates which market condition?",
            "options": ["Overbought (High Risk)", "Oversold (Potential Rebound)", "Zero Volume", "Company Bankruptcy"],
            "correctIndex": 1,
            "explanation": "RSI below 30 indicates aggressive selling pressure that has pushed the asset into oversold territory."
        }
    }
]

def get_all_courses() -> List[Dict[str, Any]]:
    return COURSES_DATA

def verify_course_quiz(course_id: str, selected_option_index: int) -> Dict[str, Any]:
    course = next((c for c in COURSES_DATA if c["id"] == course_id), None)
    if not course or "quiz" not in course:
        return {"success": False, "message": "Course or quiz not found"}
    
    quiz = course["quiz"]
    is_correct = selected_option_index == quiz["correctIndex"]

    return {
        "success": is_correct,
        "correctIndex": quiz["correctIndex"],
        "explanation": quiz["explanation"],
        "badgeEarned": course["badge"] if is_correct else None
    }
