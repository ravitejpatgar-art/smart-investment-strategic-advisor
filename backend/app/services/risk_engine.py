from typing import Dict, Any, Optional

def compute_risk_capacity(
    age: Optional[int] = 30,
    monthly_income: float = 0.0,
    monthly_expenses: float = 0.0,
    existing_savings: float = 0.0,
    horizon_years: int = 10,
    debt_burden_monthly: float = 0.0
) -> Dict[str, Any]:
    """
    Phase 7: Institutional Objective Risk Capacity Engine.
    Evaluates cold financial ability to absorb capital volatility based on:
    - Age / Compounding horizon
    - Emergency reserve coverage
    - Savings rate / surplus margin
    - Debt burden
    """
    age_val = age or 30
    emergency_months = (existing_savings / monthly_expenses) if monthly_expenses > 0 else 6.0
    surplus = max(0.0, monthly_income - monthly_expenses)
    savings_rate = (surplus / monthly_income * 100.0) if monthly_income > 0 else 0.0
    debt_ratio = (debt_burden_monthly / monthly_income * 100.0) if monthly_income > 0 else 0.0

    capacity_points = 50

    # Age factor (+15 to -15)
    if age_val <= 30:
        capacity_points += 15
    elif age_val <= 45:
        capacity_points += 5
    elif age_val <= 55:
        capacity_points -= 5
    else:
        capacity_points -= 15

    # Emergency buffer factor (+20 to -25)
    if emergency_months >= 6.0:
        capacity_points += 20
    elif emergency_months >= 3.0:
        capacity_points += 5
    elif emergency_months >= 1.0:
        capacity_points -= 15
    else:
        capacity_points -= 25

    # Savings rate factor (+15 to -20)
    if savings_rate >= 35.0:
        capacity_points += 15
    elif savings_rate >= 20.0:
        capacity_points += 5
    elif savings_rate > 0.0:
        capacity_points -= 5
    else:
        capacity_points -= 20

    # Horizon factor (+15 to -20)
    if horizon_years >= 10:
        capacity_points += 15
    elif horizon_years >= 5:
        capacity_points += 5
    elif horizon_years >= 3:
        capacity_points -= 10
    else:
        capacity_points -= 20

    # Debt burden factor
    if debt_ratio > 40.0:
        capacity_points -= 15
    elif debt_ratio > 20.0:
        capacity_points -= 5

    capacity_points = max(10, min(95, capacity_points))

    if capacity_points >= 65:
        capacity_level = "HIGH"
    elif capacity_points >= 40:
        capacity_level = "MODERATE"
    else:
        capacity_level = "LOW"

    return {
        "capacity_score": capacity_points,
        "capacity_level": capacity_level,
        "emergency_months": round(emergency_months, 1),
        "savings_rate": round(savings_rate, 1),
        "horizon_years": horizon_years
    }

def resolve_final_advisory_risk(
    risk_tolerance: str,
    risk_capacity: str
) -> str:
    """
    Phase 7: Combines Stated Risk Tolerance and Objective Risk Capacity.
    Policy: Final advisory risk is bounded by the lower of tolerance and capacity
    to protect the investor from excessive drawdowns when capacity is constrained.
    Example: Tolerance = HIGH, Capacity = MODERATE -> Final Advisory Risk = MODERATE.
    """
    tol_clean = risk_tolerance.upper().strip()
    cap_clean = risk_capacity.upper().strip()

    level_map = {
        "LOW": 1, "CONSERVATIVE": 1,
        "MODERATE": 2, "BALANCED": 2,
        "HIGH": 3, "AGGRESSIVE": 3, "ULTRA-GROWTH": 3
    }
    rev_map = {1: "LOW", 2: "MODERATE", 3: "HIGH"}

    tol_val = level_map.get(tol_clean, 2)
    cap_val = level_map.get(cap_clean, 2)

    final_val = min(tol_val, cap_val)
    return rev_map[final_val]

def compute_risk_profile(
    age: int = 30,
    monthly_income: float = 0.0,
    monthly_expenses: float = 0.0,
    existing_savings: float = 0.0,
    horizon_years: int = 10,
    market_drop_reaction: str = "Hold",
    experience: str = "Intermediate",
    stated_tolerance: Optional[str] = None
) -> Dict[str, Any]:
    """
    Institutional Multi-Factor Risk Assessment Engine:
    Integrates Tolerance, Capacity, and Final Advisory Risk.
    """
    cap_res = compute_risk_capacity(
        age=age,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        existing_savings=existing_savings,
        horizon_years=horizon_years
    )

    # If stated tolerance provided, use it, else evaluate from questionnaire
    if stated_tolerance:
        tol_clean = stated_tolerance.upper().strip()
        if "AGGRESSIVE" in tol_clean or "HIGH" in tol_clean:
            tol_level = "HIGH"
        elif "CONSERVATIVE" in tol_clean or "LOW" in tol_clean:
            tol_level = "LOW"
        else:
            tol_level = "MODERATE"
    else:
        # Fallback psychological score
        psych_score = 15
        if market_drop_reaction == "Buy More":
            psych_score += 7
        elif market_drop_reaction == "Panic Sell":
            psych_score -= 8
        if experience == "Advanced":
            psych_score += 3
        elif experience == "Beginner":
            psych_score -= 3

        if psych_score >= 20:
            tol_level = "HIGH"
        elif psych_score <= 10:
            tol_level = "LOW"
        else:
            tol_level = "MODERATE"

    final_risk = resolve_final_advisory_risk(tol_level, cap_res["capacity_level"])

    if final_risk == "HIGH":
        category = "Aggressive"
        color = "emerald"
        drawdown_capacity = "-25% Max Drawdown"
        equity_bond_mix = "70% Equity / 30% Debt & Gold"
        expected_cagr = "14 - 18% p.a."
    elif final_risk == "MODERATE":
        category = "Moderate"
        color = "cyan"
        drawdown_capacity = "-15% Max Drawdown"
        equity_bond_mix = "50% Equity / 50% Debt & Gold"
        expected_cagr = "11 - 14% p.a."
    else:
        category = "Conservative"
        color = "amber"
        drawdown_capacity = "-8% Max Drawdown"
        equity_bond_mix = "30% Equity / 70% Debt & Gold"
        expected_cagr = "8 - 11% p.a."

    surplus = max(0.0, monthly_income - monthly_expenses)

    return {
        "risk_score": cap_res["capacity_score"],
        "category": category,
        "color": color,
        "risk_tolerance": tol_level,
        "risk_capacity": cap_res["capacity_level"],
        "final_advisory_risk": final_risk,
        "drawdown_capacity": drawdown_capacity,
        "equity_bond_mix": equity_bond_mix,
        "expected_cagr": expected_cagr,
        "investment_capacity": surplus * 0.9,
        "factors": {
            "age_score": {"score": min(25, max(5, 30 - age // 3)), "max": 25, "label": f"Age {age} (Horizon Advantage)"},
            "cushion_score": {"score": min(25, max(5, int(cap_res['emergency_months'] * 3.5))), "max": 25, "label": f"{cap_res['emergency_months']} Months Runway"},
            "horizon_score": {"score": min(25, max(6, horizon_years * 2)), "max": 25, "label": f"{horizon_years} Years Target Horizon"},
            "psych_score": {"score": 20 if tol_level == 'HIGH' else (10 if tol_level == 'LOW' else 15), "max": 25, "label": f"{tol_level} Tolerance"}
        }
    }
