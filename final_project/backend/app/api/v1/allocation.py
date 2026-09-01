from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, FinancialProfile
from app.services.allocation_engine import calculate_dynamic_allocation, compute_asset_allocation
from app.models.portfolio import PortfolioHolding
from app.services.stock_engine import get_stock_data

router = APIRouter(prefix="/allocation", tags=["AI Asset Allocation Engine"])

@router.get("/recommended")
def get_recommended_allocation(
    model: Optional[str] = Query(None, description="Conservative, Moderate, Aggressive, or Ultra-Growth (Alpha)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    category = model or (profile.risk_tolerance if profile and profile.risk_tolerance else "Moderate")

    holdings = db.query(PortfolioHolding).filter(PortfolioHolding.user_id == current_user.id).all()
    total_corpus = 0.0
    for h in holdings:
        stock_info = get_stock_data(h.symbol)
        curr_p = stock_info.get("currentPrice", h.avg_buy_price)
        total_corpus += (h.shares * curr_p)

    if total_corpus == 0.0 and profile:
        total_corpus = profile.existing_savings or 0.0

    # Calculate multi-factor dynamic allocation
    if profile:
        monthly_inc = float(profile.monthly_income or 0.0)
        monthly_exp = float(profile.monthly_expenses or 0.0)
        emergency_mos = float(profile.emergency_fund_months or 6.0)
        horizon = int(profile.investment_horizon_years or 10)
        
        portfolio_list = [{"symbol": h.symbol, "amount": h.shares * h.avg_buy_price} for h in holdings]

        dynamic_res = calculate_dynamic_allocation(
            risk_tolerance=category,
            risk_capacity=profile.risk_capacity or category,
            age=profile.age or 30,
            horizon_years=horizon,
            monthly_income=monthly_inc,
            monthly_expenses=monthly_exp,
            emergency_fund_months=emergency_mos,
            existing_investments=total_corpus,
            total_corpus=total_corpus,
            portfolio=portfolio_list
        )
        return {
            "riskProfile": dynamic_res["final_advisory_risk"],
            "selected_risk_category": dynamic_res["final_advisory_risk"],
            "model_title": dynamic_res["strategy_title"],
            "strategy_title": dynamic_res["strategy_title"],
            "target_risk_budget": dynamic_res["target_risk_budget"],
            "riskBudget": dynamic_res["target_risk_budget"],
            "financial_resilience": dynamic_res["financial_resilience"],
            "expected_cagr": dynamic_res["expected_cagr"],
            "core_portfolio_risk": dynamic_res["core_portfolio_risk"],
            "safety_portfolio_risk": dynamic_res["safety_portfolio_risk"],
            "overall_portfolio_risk": dynamic_res["overall_portfolio_risk"],
            "portfolioRisk": dynamic_res["overall_portfolio_risk"],
            "diversificationScore": dynamic_res["diversificationScore"],
            "investmentCorpus": total_corpus,
            "monthlyDeployment": dynamic_res["monthlyDeployment"],
            "recommendationCount": dynamic_res["recommendationCount"],
            "categoryBreakdown": dynamic_res["categoryBreakdown"],
            "recommendations": dynamic_res["recommendations"],
            "allocation": dynamic_res["allocation"],
            "allocation_dict": dynamic_res["allocation_dict"],
            "candidates": dynamic_res["candidates"],
            "top_recommendation": dynamic_res.get("top_recommendation"),
            "rationale": dynamic_res["rationale"],
            "core_allocation_pct": dynamic_res["core_allocation_pct"],
            "safety_allocation_pct": dynamic_res["safety_allocation_pct"],
            "goal_specific_allocation_pct": dynamic_res["goal_specific_allocation_pct"],
            "long_term_growth_allocation_pct": dynamic_res["long_term_growth_allocation_pct"],
            "equity_total_pct": dynamic_res.get("equity_total_pct", 0),
            "debt_total_pct": dynamic_res.get("debt_total_pct", 0),
            "gold_total_pct": dynamic_res.get("gold_total_pct", 0),
            "global_total_pct": dynamic_res.get("global_total_pct", 0)
        }

    return compute_asset_allocation(
        risk_category=category,
        total_corpus=total_corpus
    )

@router.get("/strategy-debug")
def get_strategy_debug(
    risk: str = "HIGH",
    age: int = 22,
    horizon_years: int = 20,
    monthly_income: float = 50000.0,
    monthly_expenses: float = 30000.0,
    emergency_fund_months: float = 6.0,
    has_near_term_goal: bool = False,
    existing_investments: float = 0.0
) -> Dict[str, Any]:
    """
    Developer-only diagnostic endpoint (no secrets returned) for verifying
    candidate screening, exclusion reasons, risk budget, and dynamic bucketing.
    """
    dynamic_res = calculate_dynamic_allocation(
        risk_tolerance=risk,
        risk_capacity=risk,
        age=age,
        horizon_years=horizon_years,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        emergency_fund_months=emergency_fund_months,
        has_near_term_goal=has_near_term_goal,
        existing_investments=existing_investments,
        total_corpus=100000.0
    )

    all_universe = [
        {"symbol": "NIFTY50", "name": "UTI Nifty 50 Index Fund Direct", "risk_tier": "MODERATE", "min_horizon": 3},
        {"symbol": "PPFCF", "name": "Parag Parikh Flexi Cap Fund Direct", "risk_tier": "MODERATE", "min_horizon": 3},
        {"symbol": "MON100", "name": "Motilal Oswal Nasdaq 100 ETF", "risk_tier": "HIGH", "min_horizon": 5},
        {"symbol": "NIPPSMALL", "name": "Nippon India Small Cap Fund Direct", "risk_tier": "VERY_HIGH", "min_horizon": 7},
        {"symbol": "GOLDBEES", "name": "Sovereign Gold Bonds / Nippon Gold BeES", "risk_tier": "LOW", "min_horizon": 2},
        {"symbol": "HDFCSHORT", "name": "HDFC Short Duration Debt Fund Direct", "risk_tier": "LOW", "min_horizon": 1},
        {"symbol": "ICICILIQ", "name": "ICICI Prudential Liquid Fund Direct", "risk_tier": "LOW", "min_horizon": 0},
        {"symbol": "ICICISAVE", "name": "ICICI Prudential Regular Savings Fund Direct", "risk_tier": "LOW", "min_horizon": 2}
    ]

    selected_symbols = {c["symbol"] for c in dynamic_res["candidates"]}
    excluded = []
    for cand in all_universe:
        if cand["symbol"] not in selected_symbols:
            reason = "Not required for current risk/horizon bucket"
            if cand["symbol"] == "MON100" and dynamic_res["final_advisory_risk"] == "LOW":
                reason = "Excluded: High volatility asset unsuitable for LOW risk profile"
            elif cand["symbol"] == "NIPPSMALL" and (horizon_years < 7 or dynamic_res["final_advisory_risk"] != "HIGH"):
                reason = "Excluded: Minimum 7Y horizon and HIGH risk mandate required"
            elif cand["symbol"] in ["HDFCSHORT", "ICICILIQ"] and dynamic_res["debt_total_pct"] == 0:
                reason = "Excluded: Zero debt allocation justified for aggressive long-term investor with adequate reserve"
            elif cand["symbol"] == "ICICISAVE" and dynamic_res["final_advisory_risk"] != "LOW":
                reason = "Excluded: Conservative hybrid only active for capital preservation mandate"

            excluded.append({
                "symbol": cand["symbol"],
                "name": cand["name"],
                "reason": reason
            })

    return {
        "input_context": {
            "risk": risk,
            "age": age,
            "horizon_years": horizon_years,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "emergency_fund_months": emergency_fund_months,
            "has_near_term_goal": has_near_term_goal,
            "existing_investments": existing_investments
        },
        "final_advisory_risk": dynamic_res["final_advisory_risk"],
        "target_risk_budget": dynamic_res["target_risk_budget"],
        "financial_resilience": dynamic_res["financial_resilience"],
        "core_portfolio_risk": dynamic_res["core_portfolio_risk"],
        "overall_portfolio_risk": dynamic_res["overall_portfolio_risk"],
        "bucket_requirements": {
            "core_pct": dynamic_res["core_allocation_pct"],
            "safety_pct": dynamic_res["safety_allocation_pct"],
            "goal_specific_pct": dynamic_res["goal_specific_allocation_pct"],
            "long_term_growth_pct": dynamic_res["long_term_growth_allocation_pct"]
        },
        "candidate_universe_count": len(all_universe),
        "eligible_candidate_count": len(dynamic_res["candidates"]),
        "ranked_candidates": dynamic_res["candidates"],
        "excluded_candidates": excluded,
        "final_allocation": dynamic_res["allocation"]
    }
