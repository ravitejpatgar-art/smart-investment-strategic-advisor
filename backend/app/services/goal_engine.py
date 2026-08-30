import math
from typing import Dict, Any, List, Optional
from datetime import datetime

def calculate_goal_projection(
    target_amount: float,
    current_amount: float = 0.0,
    time_horizon_years: int = 10,
    risk_profile: str = "Moderate",
    annual_inflation_rate: float = 6.0
) -> Dict[str, Any]:
    """
    Monte Carlo & Compound SIP Goal Engine:
    Computes required monthly SIP, future value progression, and goal probability.
    """
    cagr_mapping = {
        "Conservative": 10.0,
        "Moderate": 14.0,
        "Aggressive": 18.0
    }
    expected_cagr = cagr_mapping.get(risk_profile, 14.0)

    months = max(12, time_horizon_years * 12)
    monthly_rate = (expected_cagr / 100.0) / 12.0

    # Compounding factor for current lump sum
    lump_sum_future = current_amount * math.pow(1.0 + monthly_rate, months)

    # Remaining corpus needed from SIP
    remaining_needed = max(0.0, target_amount - lump_sum_future)

    # Required Monthly SIP
    if remaining_needed > 0 and monthly_rate > 0:
        sip_future_factor = ((math.pow(1.0 + monthly_rate, months) - 1.0) / monthly_rate) * (1.0 + monthly_rate)
        required_monthly_sip = round(remaining_needed / sip_future_factor, 2)
    else:
        required_monthly_sip = 0.0

    # Inflation adjusted target
    inflation_multiplier = math.pow(1.0 + (annual_inflation_rate / 100.0), time_horizon_years)
    inflation_adjusted_target = round(target_amount * inflation_multiplier, 2)

    # Probability calculation
    base_prob = 80
    if time_horizon_years >= 10:
        base_prob += 12
    elif time_horizon_years >= 5:
        base_prob += 6
    else:
        base_prob -= 10

    if current_amount >= (target_amount * 0.3):
        base_prob += 8
    elif current_amount >= (target_amount * 0.1):
        base_prob += 4

    probability = max(35, min(98, base_prob))

    # Generate yearly projection series
    projection_timeline: List[Dict[str, Any]] = []
    accumulated_invested = current_amount
    running_future_value = current_amount

    for y in range(1, time_horizon_years + 1):
        accumulated_invested += (required_monthly_sip * 12)
        y_months = y * 12
        lump_part = current_amount * math.pow(1.0 + monthly_rate, y_months)
        sip_factor_y = ((math.pow(1.0 + monthly_rate, y_months) - 1.0) / monthly_rate) * (1.0 + monthly_rate) if monthly_rate > 0 else y_months
        running_future_value = lump_part + (required_monthly_sip * sip_factor_y)

        projection_timeline.append({
            "year": f"Year {y}",
            "invested": round(accumulated_invested, 2),
            "projectedValue": round(running_future_value, 2),
            "target": target_amount
        })

    return {
        "target_amount": target_amount,
        "current_amount": current_amount,
        "time_horizon_years": time_horizon_years,
        "risk_profile": risk_profile,
        "expected_cagr": expected_cagr,
        "required_monthly_sip": required_monthly_sip,
        "inflation_adjusted_target": inflation_adjusted_target,
        "probability": probability,
        "total_invested": round(accumulated_invested, 2),
        "estimated_gains": round(max(0.0, running_future_value - accumulated_invested), 2),
        "timeline": projection_timeline
    }

def analyze_multiple_goals_and_detect_conflicts(
    goals: List[Dict[str, Any]],
    available_monthly_capacity: float
) -> Dict[str, Any]:
    """
    Phases 8 & 9: Institutional Goal Conflict & Remediation Intelligence.
    Detects when combined required SIPs exceed investable capacity.
    Generates exact funding percentage, priority tiers, and 5 resolution strategies.
    """
    if not goals:
        return {
            "has_conflict": False,
            "total_required_monthly_sip": 0.0,
            "available_monthly_capacity": max(0.0, available_monthly_capacity),
            "funding_gap": 0.0,
            "funded_percentage": 100.0,
            "advisory_message": "No goals registered yet.",
            "prioritized_goals": [],
            "remediation_strategies": []
        }

    total_req_sip = 0.0
    processed_goals = []

    current_year = datetime.now().year

    for g in goals:
        target = float(g.get("target_amount") or g.get("target") or 0.0)
        current = float(g.get("current_amount") or g.get("current") or 0.0)
        
        # Calculate horizon
        years = g.get("years")
        if years is None and g.get("target_date"):
            try:
                target_yr = int(str(g["target_date"])[:4])
                years = max(1, target_yr - current_year)
            except Exception:
                years = 5
        years = max(1, int(years or 5))

        rate = float(g.get("rate") or 12.0)
        proj = calculate_goal_projection(target, current, years)
        req_sip = proj["required_monthly_sip"]
        total_req_sip += req_sip

        # Priority score based on urgency and importance
        urgency = "HIGH" if years <= 3 else ("MEDIUM" if years <= 7 else "LOWER")
        cat = str(g.get("category", "")).lower()
        if "retirement" in cat or "house" in cat or "education" in cat:
            importance = "HIGH"
        else:
            importance = "MODERATE"

        if urgency == "HIGH" or importance == "HIGH":
            priority = "HIGH PRIORITY"
            priority_reason = f"Near horizon ({years} yrs) or critical life milestone ({cat or 'core goal'})."
        elif years <= 7:
            priority = "MEDIUM PRIORITY"
            priority_reason = f"Intermediate compounding timeline ({years} yrs)."
        else:
            priority = "LOWER PRIORITY"
            priority_reason = f"Long compounding runway ({years} yrs); flexible timing."

        processed_goals.append({
            "title": g.get("title", "Goal"),
            "category": g.get("category", "General"),
            "target_amount": target,
            "current_amount": current,
            "remaining_amount": max(0.0, target - current),
            "years_remaining": years,
            "required_monthly_sip": req_sip,
            "probability": proj["probability"],
            "priority": priority,
            "priority_reason": priority_reason,
            "feasibility": "Fully Funded" if req_sip == 0 else ("Achievable" if req_sip <= available_monthly_capacity else "Capacity Shortfall")
        })

    has_conflict = total_req_sip > available_monthly_capacity
    funding_gap = max(0.0, total_req_sip - available_monthly_capacity)
    funded_percentage = round((available_monthly_capacity / total_req_sip * 100.0), 1) if total_req_sip > 0 else 100.0
    funded_percentage = min(100.0, max(0.0, funded_percentage))

    if has_conflict:
        advisory_message = (
            f"You currently have enough capacity to fund approximately {funded_percentage:.0f}% "
            f"of your combined requested goal contributions. "
            f"Your current goals require ₹{funding_gap:,.0f} more per month than your available capacity of ₹{available_monthly_capacity:,.0f}."
        )
    else:
        advisory_message = (
            f"Your available monthly capacity of ₹{available_monthly_capacity:,.0f} comfortably funds "
            f"100% of your requested goal SIP contributions (₹{total_req_sip:,.0f}/mo)."
        )

    # 5 Institutional Remediation Strategies (Phase 9)
    remediation_strategies = [
        {
            "option": 1,
            "title": "Increase Time Horizon",
            "action": "Extend target dates by 2–3 years to lower required monthly SIP via longer compounding."
        },
        {
            "option": 2,
            "title": "Increase Monthly Contribution",
            "action": "Optimize discretionary expenses to boost monthly investable surplus towards goals."
        },
        {
            "option": 3,
            "title": "Calibrate Target Corpus",
            "action": "Adjust target down payment or budget to align with current surplus capacity."
        },
        {
            "option": 4,
            "title": "Prioritize High-Urgency Milestone",
            "action": "Direct available capacity to High-Priority goals (House/Retirement) first."
        },
        {
            "option": 5,
            "title": "Defer Lower-Priority Goal",
            "action": "Pause or step-up contributions for discretionary goals (Vacation/Luxury) until income expands."
        }
    ]

    return {
        "has_conflict": has_conflict,
        "total_required_monthly_sip": round(total_req_sip, 2),
        "available_monthly_capacity": round(available_monthly_capacity, 2),
        "funding_gap": round(funding_gap, 2),
        "funded_percentage": funded_percentage,
        "advisory_message": advisory_message,
        "prioritized_goals": processed_goals,
        "remediation_strategies": remediation_strategies
    }
