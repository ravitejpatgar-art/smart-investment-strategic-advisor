from typing import Dict, Any, Tuple, Optional
from datetime import datetime, timezone
import math

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
    if price is None or not isinstance(price, (int, float)) or price <= 0:
        return False, f"Invalid or non-positive price value: {price}"

    currency = data.get("currency")
    if not currency or currency not in ["INR", "USD", "EUR", "GBP", "TWD"]:
        return False, f"Unsupported or missing currency: {currency}"

    freshness = data.get("freshness")
    if not freshness:
        return False, "Missing freshness tag"

    return True, "Valid"


def validate_quote_compatibility(
    instrument: Dict[str, Any],
    quote: Optional[Dict[str, Any]]
) -> Tuple[bool, str]:
    """
    Enforces strict 5-way compatibility between instrument metadata and provider quotes.
    Rejects cross-asset pollution and identity mismatches.

    Validates:
      instrument.assetType, instrument.exchange, instrument.provider, instrument.token
    against:
      quote.assetType, quote.exchange, quote.source/provider, quote.symbol, quote.token
    """
    if not quote or not isinstance(quote, dict):
        return False, "Quote is missing or not a dictionary"

    inst_asset_type = (instrument.get("assetType") or instrument.get("asset_type") or "").upper().strip()
    inst_market = (instrument.get("market") or "").upper().strip()
    inst_exchange = (instrument.get("exchange") or "").upper().strip()
    inst_symbol = (instrument.get("symbol") or "").upper().strip()
    inst_token = str(instrument.get("token") or instrument.get("symboltoken") or instrument.get("providerSymbol") or "").strip()

    quote_asset_type = (quote.get("assetType") or quote.get("asset_type") or quote.get("instrumentType") or "").upper().strip()
    quote_exchange = (quote.get("exchange") or "").upper().strip()
    quote_source = (quote.get("source") or quote.get("provider") or "").upper().strip()
    quote_symbol = (quote.get("symbol") or "").upper().strip()
    quote_token = str(quote.get("token") or quote.get("symboltoken") or "").strip()

    # Rule 1: MUTUAL_FUND instruments must NEVER receive equity or Angel One quotes
    if inst_asset_type == "MUTUAL_FUND" or inst_symbol.startswith("AMFI:") or inst_exchange == "AMFI":
        if "ANGEL" in quote_source or quote_exchange in ["NSE", "BSE"]:
            return False, f"Incompatible: MUTUAL_FUND cannot receive equity exchange quote ({quote_exchange} from {quote_source})"
        if quote_symbol.endswith(".NS") or quote_symbol.endswith(".BO"):
            return False, f"Incompatible: MUTUAL_FUND symbol cannot end with equity exchange suffix ({quote_symbol})"
        if quote_asset_type and quote_asset_type not in ["MUTUAL_FUND", "MF"]:
            return False, f"Incompatible: MUTUAL_FUND cannot receive assetType '{quote_asset_type}'"

    # Rule 2: STOCK / ETF instruments must NEVER receive mutual fund NAV quotes
    if inst_asset_type in ["STOCK", "ETF", "EQUITY"]:
        if quote_asset_type == "MUTUAL_FUND" or quote_exchange == "AMFI" or "AMFI" in quote_source:
            return False, f"Incompatible: {inst_asset_type} instrument cannot receive MUTUAL_FUND NAV quote"

    # Rule 3: Exchange compatibility
    if inst_exchange and quote_exchange:
        # Match NSE to NSE, BSE to BSE, AMFI to AMFI
        if inst_exchange in ["NSE", "BSE", "AMFI"] and quote_exchange in ["NSE", "BSE", "AMFI"]:
            if inst_exchange != quote_exchange:
                return False, f"Exchange mismatch: Instrument exchange {inst_exchange} != Quote exchange {quote_exchange}"

    # Rule 4: Token identity compatibility when both specify a token
    if inst_token and quote_token and inst_token.isdigit() and quote_token.isdigit():
        if inst_token != quote_token:
            return False, f"Token mismatch: Instrument token {inst_token} != Quote token {quote_token}"

    # Rule 5: US instruments must NEVER receive Indian NSE/BSE quotes or .NS suffixes
    if inst_market == "US" or inst_exchange in ["NASDAQ", "NYSE", "NYSEARCA"]:
        if quote_exchange in ["NSE", "BSE"] or quote_symbol.endswith(".NS") or quote_symbol.endswith(".BO") or "ANGEL" in quote_source:
            return False, f"Incompatible: US instrument cannot receive Indian equity quote ({quote_exchange} / {quote_symbol})"

    return True, "Compatible"


def validate_price_sanity(
    quote: Dict[str, Any],
    instrument: Optional[Dict[str, Any]] = None,
    prev_valid_price: Optional[float] = None
) -> Tuple[str, Optional[str]]:
    """
    Sanity checks for quotes to flag suspicious records as 'SUSPECT' with a clear reason.
    Returns: (dataQuality, suspectReason)
      where dataQuality is 'CLEAN', 'SUSPECT', 'INVALID', or 'CONFLICT'
    """
    price = quote.get("price")
    if price is None or not isinstance(price, (int, float)) or price <= 0:
        return "INVALID", f"Non-positive price: {price}"

    currency = quote.get("currency")
    exch = (quote.get("exchange") or "").upper()
    if exch in ("NSE", "BSE", "AMFI") and currency != "INR":
        return "SUSPECT", f"Indian exchange {exch} has non-INR currency: {currency}"

    # Check tick size if specified on instrument
    if instrument and instrument.get("tick_size"):
        try:
            ts = float(instrument["tick_size"])
            if ts > 0:
                ticks = round(price / ts)
                diff = abs(price - (ticks * ts))
                if diff > 0.01 and diff > (ts * 0.1):
                    return "SUSPECT", f"Price {price} does not align with tick size {ts} (difference: {round(diff, 4)})"
        except (ValueError, TypeError):
            pass

    # Check for unusually large jump vs previous valid price without corporate action (>50%)
    if prev_valid_price and prev_valid_price > 0:
        ratio = price / prev_valid_price
        if ratio > 1.50 or ratio < 0.50:
            pct_jump = round((price - prev_valid_price) / prev_valid_price * 100, 2)
            return "SUSPECT", f"Unusually large price jump of {pct_jump}% from {prev_valid_price} to {price}"

    # Check timestamp validity: future timestamp check
    raw_ts = quote.get("timestamp") or quote.get("raw_timestamp")
    if raw_ts:
        try:
            dt = datetime.fromisoformat(str(raw_ts).replace("Z", "+00:00"))
            now_utc = datetime.now(timezone.utc)
            if (dt - now_utc).total_seconds() > 300:
                return "SUSPECT", f"Future timestamp detected: {raw_ts}"
        except Exception:
            pass

    return "CLEAN", None
