"""
SmartVest Context Engine
========================
Enforces strict task-dependent context conditioning policies:
Never leaks personal cashflow data into educational or market questions.
Provides full personalized profile only when answering suitability or advisory tasks.
"""

from typing import Dict, Any, Optional, Tuple
import re
from .intent_engine import ConversationalIntent

class ContextMode:
    EDUCATIONAL = "EDUCATIONAL"
    MARKET = "MARKET"
    PERSONALIZED = "PERSONALIZED"
    CALCULATION = "CALCULATION"
    CONVERSATIONAL = "CONVERSATIONAL"

def _parse_horizon_years(val: Any) -> int:
    """Parses numeric horizon years from integer, float, or strings like '5 to 10 years'."""
    if isinstance(val, (int, float)):
        return int(val)
    if isinstance(val, str):
        val_lower = val.lower()
        if "less than 3" in val_lower or "< 3" in val_lower or "<3" in val_lower:
            return 2
        if "3 to 5" in val_lower or "3-5" in val_lower:
            return 4
        if "5 to 10" in val_lower or "5-10" in val_lower:
            return 8
        if "10+" in val_lower or "more than 10" in val_lower or "15" in val_lower:
            return 15
        nums = re.findall(r'\d+', val)
        if nums:
            return int(nums[0])
    return 10

def extract_user_profile_context(user_context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Phase 3: Real User Single Source of Truth
    Extracts and normalizes authoritative user context attributes.
    Preserves negative surplus (deficits) without clamping to zero.
    """
    ctx = user_context or {}
    
    # Incomes & Expenses
    income = float(ctx.get("monthlyIncome") if ctx.get("monthlyIncome") is not None else (ctx.get("monthly_income") if ctx.get("monthly_income") is not None else (ctx.get("income") or 0.0)))
    expenses = float(ctx.get("monthlyExpenses") if ctx.get("monthlyExpenses") is not None else (ctx.get("monthly_expenses") if ctx.get("monthly_expenses") is not None else (ctx.get("expenses") or 0.0)))
    savings = float(ctx.get("totalSavings") if ctx.get("totalSavings") is not None else (ctx.get("total_savings") if ctx.get("total_savings") is not None else (ctx.get("savings") or (ctx.get("emergencyFund") or (ctx.get("emergency_fund") or (ctx.get("existingSavings") or (ctx.get("existing_savings") or 0.0)))))))
    
    if ctx.get("monthlySurplus") is not None:
        surplus = float(ctx.get("monthlySurplus"))
    elif ctx.get("monthly_surplus") is not None:
        surplus = float(ctx.get("monthly_surplus"))
    elif ctx.get("investableSurplus") is not None and float(ctx.get("investableSurplus")) > 0:
        surplus = float(ctx.get("investableSurplus"))
    elif ctx.get("investable_surplus") is not None and float(ctx.get("investable_surplus")) > 0:
        surplus = float(ctx.get("investable_surplus"))
    elif ctx.get("surplus") is not None:
        surplus = float(ctx.get("surplus"))
    else:
        surplus = income - expenses

    savings_rate = float(ctx.get("savingsRate") if ctx.get("savingsRate") is not None else (ctx.get("savings_rate") if ctx.get("savings_rate") is not None else ((surplus / income * 100.0) if income > 0 and surplus > 0 else 0.0)))

    # Emergency Fund metrics
    emergency_fund = savings
    emergency_target = float(ctx.get("emergencyTarget") if ctx.get("emergencyTarget") is not None else (ctx.get("emergency_target") if ctx.get("emergency_target") is not None else (expenses * 6.0)))
    emergency_coverage_months = float(ctx.get("emergencyCoverageMonths") if ctx.get("emergencyCoverageMonths") is not None else (ctx.get("emergency_coverage_months") if ctx.get("emergency_coverage_months") is not None else ((emergency_fund / expenses) if expenses > 0 else 6.0)))

    # Risk & Demographics
    risk_tolerance = str(ctx.get("riskTolerance") or ctx.get("risk_tolerance") or ctx.get("riskProfile") or ctx.get("risk_profile") or ctx.get("risk") or "Moderate").capitalize()
    risk_capacity = str(ctx.get("riskCapacity") or ctx.get("risk_capacity") or ("High" if emergency_coverage_months >= 4 and savings_rate >= 25 else ("Low" if emergency_coverage_months < 2 else "Moderate"))).capitalize()
    
    # Final Advisory Risk
    if ctx.get("finalAdvisoryRisk") or ctx.get("final_advisory_risk"):
        final_advisory_risk = str(ctx.get("finalAdvisoryRisk") or ctx.get("final_advisory_risk")).capitalize()
    else:
        if "Low" in [risk_tolerance, risk_capacity] or "Conservative" in [risk_tolerance, risk_capacity]:
            final_advisory_risk = "Conservative"
        elif "Moderate" in [risk_tolerance, risk_capacity]:
            final_advisory_risk = "Moderate"
        else:
            final_advisory_risk = risk_tolerance

    age = int(ctx.get("age")) if ctx.get("age") else None
    occupation = str(ctx.get("occupation") or "Professional")
    horizon = _parse_horizon_years(ctx.get("investmentHorizon") or ctx.get("horizon"))
    name = str(ctx.get("name") or "Investor")
    user_id = ctx.get("userId") or ctx.get("id")
    
    # Portfolio & Goals
    portfolio = ctx.get("portfolio") or ctx.get("holdings") or []
    goals = ctx.get("goals") or []
    strategy = ctx.get("strategy") or {}

    return {
        "userId": user_id,
        "name": name,
        "age": age,
        "occupation": occupation,
        "monthlyIncome": income,
        "monthlyExpenses": expenses,
        "monthlySurplus": surplus,
        "savingsRate": savings_rate,
        "emergencyFund": emergency_fund,
        "emergencyTarget": emergency_target,
        "emergencyCoverageMonths": round(emergency_coverage_months, 1),
        "riskTolerance": risk_tolerance,
        "riskCapacity": risk_capacity,
        "finalAdvisoryRisk": final_advisory_risk,
        "investmentHorizon": f"{horizon} Years",
        "goals": goals,
        "portfolio": portfolio,
        "strategy": strategy,
        # Backward compatibility aliases
        "income": income,
        "expenses": expenses,
        "savings": savings,
        "surplus": surplus,
        "risk": final_advisory_risk,
        "horizon": horizon
    }

def get_context_for_intent(intent: ConversationalIntent, user_context: Optional[Dict[str, Any]]) -> Tuple[str, Dict[str, Any]]:
    """
    Phase 20: AI Context Policy
    Returns (ContextMode, filtered_context_dict) strictly based on task intent.
    """
    full_ctx = extract_user_profile_context(user_context)

    if intent in [ConversationalIntent.EDUCATION, ConversationalIntent.GREETING, ConversationalIntent.CLARIFICATION]:
        return ContextMode.EDUCATIONAL, {
            "mode": ContextMode.EDUCATIONAL,
            "allow_personal_data": False
        }

    if intent in [ConversationalIntent.MARKET_DATA, ConversationalIntent.MARKET_ANALYSIS]:
        return ContextMode.MARKET, {
            "mode": ContextMode.MARKET,
            "allow_personal_data": False,
            "risk": full_ctx["risk"]  # general strategic baseline
        }

    if intent in [
        ConversationalIntent.STOCK_SCREENING,
        ConversationalIntent.PERSONALIZED_INVESTMENT_REQUEST,
        ConversationalIntent.STOCK_ANALYSIS,
        ConversationalIntent.ALLOCATION_ADVICE,
        ConversationalIntent.SURPLUS_ALLOCATION,
        ConversationalIntent.PORTFOLIO_REVIEW,
        ConversationalIntent.GOAL_PLANNING,
        ConversationalIntent.RETIREMENT_PLANNING,
        ConversationalIntent.EMERGENCY_FUND
    ]:
        return ContextMode.PERSONALIZED, {
            "mode": ContextMode.PERSONALIZED,
            "allow_personal_data": True,
            **full_ctx
        }

    if intent in [ConversationalIntent.AFFORDABILITY, ConversationalIntent.SIP_CALCULATION]:
        return ContextMode.CALCULATION, {
            "mode": ContextMode.CALCULATION,
            "allow_personal_data": True,
            **full_ctx
        }

    return ContextMode.CONVERSATIONAL, {
        "mode": ContextMode.CONVERSATIONAL,
        "allow_personal_data": False
    }
