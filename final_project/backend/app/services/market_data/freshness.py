from enum import Enum
from datetime import datetime, timezone, timedelta

class DataFreshness(str, Enum):
    REALTIME = "REALTIME"
    DELAYED = "DELAYED"
    LATEST_AVAILABLE = "LATEST_AVAILABLE"
    END_OF_DAY = "END_OF_DAY"
    HISTORICAL = "HISTORICAL"
    MODEL_ASSUMPTION = "MODEL_ASSUMPTION"
    STALE = "STALE"
    UNAVAILABLE = "UNAVAILABLE"

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
