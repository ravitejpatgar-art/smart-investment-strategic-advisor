from datetime import datetime, timezone, timedelta
from typing import Dict, Any

# Indian Public & Exchange Holidays (2025/2026 sample set for validation)
INDIAN_HOLIDAYS = {
    "2026-01-26", "2026-03-06", "2026-03-27", "2026-04-03", "2026-04-14",
    "2026-05-01", "2026-08-15", "2026-10-02", "2026-10-20", "2026-11-09",
    "2026-12-25"
}

# US Exchange Holidays (2025/2026 sample set for validation)
US_HOLIDAYS = {
    "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25",
    "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25"
}

def get_indian_market_status() -> Dict[str, Any]:
    """
    Evaluates NSE/BSE trading status based on IST (UTC+5:30).
    Normal trading: 09:15 AM - 03:30 PM IST (Mon-Fri)
    Pre-market: 09:00 AM - 09:15 AM IST
    """
    utc_now = datetime.now(timezone.utc)
    ist_now = utc_now + timedelta(hours=5, minutes=30)
    date_str = ist_now.strftime("%Y-%m-%d")
    weekday = ist_now.weekday() # 0 = Monday, 6 = Sunday

    if weekday in [5, 6]:
        return {
            "market": "NSE / BSE",
            "country": "IN",
            "timezone": "IST (UTC+5:30)",
            "status": "CLOSED",
            "reason": "WEEKEND",
            "isOpen": False,
            "nextOpen": "Monday 09:15 AM IST",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }

    if date_str in INDIAN_HOLIDAYS:
        return {
            "market": "NSE / BSE",
            "country": "IN",
            "timezone": "IST (UTC+5:30)",
            "status": "CLOSED",
            "reason": "EXCHANGE_HOLIDAY",
            "isOpen": False,
            "nextOpen": "Next Trading Day 09:15 AM IST",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }

    current_minutes = ist_now.hour * 60 + ist_now.minute

    # 9:00 AM = 540 min, 9:15 AM = 555 min, 3:30 PM = 930 min
    if 540 <= current_minutes < 555:
        return {
            "market": "NSE / BSE",
            "country": "IN",
            "timezone": "IST (UTC+5:30)",
            "status": "PRE_MARKET",
            "reason": "PRE_OPEN_SESSION",
            "isOpen": True,
            "nextOpen": "09:15 AM IST (Regular Trading)",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }
    elif 555 <= current_minutes < 930:
        return {
            "market": "NSE / BSE",
            "country": "IN",
            "timezone": "IST (UTC+5:30)",
            "status": "OPEN",
            "reason": "REGULAR_TRADING",
            "isOpen": True,
            "nextClose": "03:30 PM IST",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }
    else:
        return {
            "market": "NSE / BSE",
            "country": "IN",
            "timezone": "IST (UTC+5:30)",
            "status": "CLOSED",
            "reason": "AFTER_HOURS",
            "isOpen": False,
            "nextOpen": "Tomorrow 09:15 AM IST" if weekday < 4 else "Monday 09:15 AM IST",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }

def get_us_market_status() -> Dict[str, Any]:
    """
    Evaluates NYSE/NASDAQ status based on Eastern Time (approx UTC-4 during EDT).
    Regular trading: 09:30 AM - 04:00 PM ET (Mon-Fri)
    """
    utc_now = datetime.now(timezone.utc)
    et_now = utc_now - timedelta(hours=4) # EDT offset
    ist_now = utc_now + timedelta(hours=5, minutes=30)
    date_str = et_now.strftime("%Y-%m-%d")
    weekday = et_now.weekday()

    if weekday in [5, 6]:
        return {
            "market": "NASDAQ / NYSE",
            "country": "US",
            "timezone": "ET (UTC-4)",
            "status": "CLOSED",
            "reason": "WEEKEND",
            "isOpen": False,
            "nextOpen": "Monday 07:00 PM IST (09:30 AM ET)",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }

    if date_str in US_HOLIDAYS:
        return {
            "market": "NASDAQ / NYSE",
            "country": "US",
            "timezone": "ET (UTC-4)",
            "status": "CLOSED",
            "reason": "EXCHANGE_HOLIDAY",
            "isOpen": False,
            "nextOpen": "Next Trading Day 07:00 PM IST",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }

    current_minutes = et_now.hour * 60 + et_now.minute

    # 9:30 AM = 570 min, 4:00 PM = 960 min, 8:00 PM = 1200 min
    if 240 <= current_minutes < 570:
        return {
            "market": "NASDAQ / NYSE",
            "country": "US",
            "timezone": "ET (UTC-4)",
            "status": "PRE_MARKET",
            "reason": "PRE_MARKET_SESSION",
            "isOpen": True,
            "nextOpen": "07:00 PM IST (09:30 AM ET)",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }
    elif 570 <= current_minutes < 960:
        return {
            "market": "NASDAQ / NYSE",
            "country": "US",
            "timezone": "ET (UTC-4)",
            "status": "OPEN",
            "reason": "REGULAR_TRADING",
            "isOpen": True,
            "nextClose": "01:30 AM IST (04:00 PM ET)",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }
    elif 960 <= current_minutes < 1200:
        return {
            "market": "NASDAQ / NYSE",
            "country": "US",
            "timezone": "ET (UTC-4)",
            "status": "AFTER_HOURS",
            "reason": "AFTER_HOURS_SESSION",
            "isOpen": False,
            "nextOpen": "Tomorrow 07:00 PM IST",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }
    else:
        return {
            "market": "NASDAQ / NYSE",
            "country": "US",
            "timezone": "ET (UTC-4)",
            "status": "CLOSED",
            "reason": "CLOSED_OVERNIGHT",
            "isOpen": False,
            "nextOpen": "Today 07:00 PM IST" if current_minutes < 240 else "Tomorrow 07:00 PM IST",
            "currentTime": ist_now.strftime("%I:%M:%S %p IST")
        }
