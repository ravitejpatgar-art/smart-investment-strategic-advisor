from typing import Dict, Any, Tuple

def validate_quote_data(data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates quote sanity before exposing to SmartVest API or Recommendation Engine.
    """
    if not isinstance(data, dict):
        return False, "Data is not a valid dictionary"

    symbol = data.get("symbol")
    if not symbol or not isinstance(symbol, str):
        return False, "Missing or invalid symbol"

    price = data.get("price")
    if price is None or not isinstance(price, (int, float)) or price < 0:
        return False, f"Invalid price value: {price}"

    currency = data.get("currency")
    if not currency or currency not in ["INR", "USD", "EUR", "GBP"]:
        return False, f"Unsupported or missing currency: {currency}"

    freshness = data.get("freshness")
    if not freshness:
        return False, "Missing freshness tag"

    return True, "Valid"
