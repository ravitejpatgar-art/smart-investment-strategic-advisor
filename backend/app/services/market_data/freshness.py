from enum import Enum
from datetime import datetime, timezone, timedelta
from typing import Optional

class DataFreshness(str, Enum):
    LIVE = "LIVE"
    REALTIME = "REALTIME"
    DELAYED = "DELAYED"
    LATEST_AVAILABLE = "LATEST_AVAILABLE"
    END_OF_DAY = "END_OF_DAY"
    HISTORICAL = "HISTORICAL"
    MODEL_ASSUMPTION = "MODEL_ASSUMPTION"
    FALLBACK = "FALLBACK"
    STALE = "STALE"
    UNAVAILABLE = "UNAVAILABLE"

# Allowed canonical freshness labels
VALID_FRESHNESS_VALUES = {f.value for f in DataFreshness}

def sanitize_freshness_state(value: Optional[str], default: str = "LATEST_AVAILABLE") -> str:
    """Normalizes any incoming freshness string into a canonical DataFreshness value."""
    if not value:
        return default
    v_upper = value.upper().strip()
    if v_upper in VALID_FRESHNESS_VALUES:
        return v_upper
    if v_upper in ["REAL_TIME", "REAL-TIME", "STREAMING"]:
        return DataFreshness.LIVE.value
    if v_upper in ["EOD", "END-OF-DAY", "CLOSE"]:
        return DataFreshness.END_OF_DAY.value
    return default

def enforce_truthful_freshness(freshness_candidate: str, is_authorized_live_feed: bool, is_market_open: bool) -> str:
    """
    Guarantees that DELAYED, FALLBACK, HISTORICAL, or STALE statuses are NEVER promoted to LIVE.
    Only authorized real-time feeds during open market sessions can emit LIVE.
    """
    cand = sanitize_freshness_state(freshness_candidate)
    
    if cand in [DataFreshness.LIVE.value, DataFreshness.REALTIME.value]:
        if not (is_authorized_live_feed and is_market_open):
            # Downgrade to DELAYED or LATEST_AVAILABLE if not legitimately open/authorized
            return DataFreshness.LATEST_AVAILABLE.value if not is_market_open else DataFreshness.DELAYED.value
        return DataFreshness.LIVE.value

    # Never promote non-live states
    return cand

def is_data_stale(timestamp_str: str, max_age_seconds: int = 300) -> bool:
    """
    Checks if a quote timestamp is older than max_age_seconds.
    """
    if not timestamp_str:
        return True
    try:
        # ISO string parsing
        dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        age = (now - dt).total_seconds()
        return age > max_age_seconds
    except Exception:
        return False
