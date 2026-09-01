import sys
import os

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.allocation_engine import calculate_dynamic_allocation

def show_basket(label, result):
    print(f"\n=== {label} ===")
    print(f"Final Advisory Risk : {result.get('final_advisory_risk', result.get('target_risk_budget','?'))}")
    print(f"Diversification     : {result.get('diversification_score', '-')}")
    
    candidates = result.get("recommendations", [])
    asset_types = {}
    for c in candidates:
        t = c.get("type", c.get("assetType", "?"))
        asset_types[t] = asset_types.get(t, 0) + 1
        name = c.get("name", c.get("asset", "?"))[:40]
        pct = c.get("allocationPct", c.get("percentage", 0))
        score = c.get("suitabilityScore", "-")
        sym = c.get("symbol", "?")
        print(f"  [{t:6}] {sym:12} {name:40}  {pct:5.1f}%  score={score}")

    total = sum(c.get("allocationPct", c.get("percentage", 0)) for c in candidates)
    print(f"Basket size: {len(candidates)} instruments")
    print("Composition:", " + ".join(f"{v} {k}" for k, v in sorted(asset_types.items())))
    print(f"Total allocation: {total:.1f}%  (must be 100)")

if __name__ == "__main__":
    # Print the raw keys once to understand structure
    sample = calculate_dynamic_allocation(
        risk_tolerance="MODERATE",
        risk_capacity="MODERATE",
        age=30,
        horizon_years=10,
        monthly_income=80000,
        monthly_expenses=45000,
        emergency_fund_months=6.0,
        total_corpus=300000,
    )
    print("KEYS IN RESULT:", list(sample.keys()))
    
    # Show recommendations key if it exists
    recs = sample.get("recommendations", sample.get("candidates", []))
    if recs:
        print("FIRST CANDIDATE KEYS:", list(recs[0].keys()))
    
    show_basket("MODERATE — 10Y — 3L", sample)

    show_basket("HIGH — 15Y — 5L", calculate_dynamic_allocation(
        risk_tolerance="HIGH", risk_capacity="HIGH", age=28,
        horizon_years=15, monthly_income=100000, monthly_expenses=55000,
        emergency_fund_months=7.0, total_corpus=500000,
    ))

    show_basket("LOW — 5Y — 1L", calculate_dynamic_allocation(
        risk_tolerance="LOW", risk_capacity="LOW", age=45,
        horizon_years=5, monthly_income=40000, monthly_expenses=30000,
        emergency_fund_months=5.0, total_corpus=100000,
    ))
