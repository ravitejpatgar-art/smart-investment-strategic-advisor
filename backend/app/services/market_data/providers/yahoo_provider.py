import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import yfinance as yf
from app.services.market_data.base import BaseMarketDataProvider, ProviderCapabilities
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.normalizer import normalize_market_quote, create_unavailable_quote
from app.services.market_data.yahoo_client import fetch_yahoo_chart_data, parse_yahoo_chart_candles
from app.services.market_data.fundamentals import get_enhanced_fundamentals

logger = logging.getLogger(__name__)

class YahooFinanceProvider(BaseMarketDataProvider):
    """
    Yahoo Finance multi-host provider adapter.
    Provides universal coverage across Global Equities, ADRs, ETFs, Indices, and Commodities.
    """
    def __init__(self):
        capabilities = ProviderCapabilities(
            name="YahooFinance",
            realtime=False,
            delayed=True,
            historical=True,
            mutual_funds_nav=True,
            fundamentals=True,
            commercial_display=True,
            api_key_required=False,
            is_configured=True,
            entitlement_verified=True
        )
        super().__init__("YahooFinance", capabilities)

    def _normalize_symbol(self, symbol: str) -> str:
        s = symbol.strip()
        # Common aliases
        if s.upper() == "NIFTY 50" or s.upper() == "NIFTY":
            return "^NSEI"
        if s.upper() == "SENSEX":
            return "^BSESN"
        if s.upper() == "BANKNIFTY" or s.upper() == "BANK NIFTY":
            return "^NSEBANK"
        if s.upper() == "S&P 500" or s.upper() == "S&P500":
            return "^GSPC"
        if s.upper() == "NASDAQ" or s.upper() == "NASDAQ 100":
            return "^IXIC"
        if s.upper() == "DOW JONES" or s.upper() == "DOW":
            return "^DJI"
        if s.upper() == "GOLD" or s.upper() == "GOLD (10G)":
            return "GC=F"
        if s.upper() == "SILVER":
            return "SI=F"
        return s

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        target_sym = self._normalize_symbol(symbol)
        
        # 1. First attempt fast v8 chart quote
        chart_res = fetch_yahoo_chart_data(target_sym, range_period="1d", interval="1d", timeout=5)
        if chart_res and "meta" in chart_res:
            meta = chart_res["meta"]
            price = meta.get("regularMarketPrice") or meta.get("chartPreviousClose") or 0.0
            prev_close = meta.get("previousClose") or meta.get("chartPreviousClose") or price
            change = round(float(price - prev_close), 2)
            change_pct = round((change / prev_close * 100), 2) if prev_close > 0 else 0.0

            currency = meta.get("currency") or ("INR" if ".NS" in target_sym or ".BO" in target_sym or target_sym.startswith("^NSE") else "USD")
            exchange = meta.get("exchangeName") or meta.get("exchangeTimezoneName") or "GLOBAL"

            return normalize_market_quote(
                symbol=symbol,
                name=meta.get("shortName") or meta.get("symbol") or symbol,
                exchange=exchange,
                asset_type="STOCK" if not target_sym.startswith("^") else "INDEX",
                price=float(price),
                change=change,
                change_pct=change_pct,
                volume=int(meta.get("regularMarketVolume") or 0),
                freshness=DataFreshness.DELAYED if meta.get("tradingPeriods") else DataFreshness.LATEST_AVAILABLE,
                source="Yahoo Finance",
                currency=currency,
                open_price=meta.get("regularMarketDayHigh"),
                high_price=meta.get("regularMarketDayHigh"),
                low_price=meta.get("regularMarketDayLow"),
                prev_close=float(prev_close)
            )

        # 2. Fallback to yfinance ticker info
        try:
            t = yf.Ticker(target_sym)
            fi = t.fast_info
            if fi and getattr(fi, "last_price", None) is not None:
                p = float(fi.last_price)
                pc = float(fi.previous_close or p)
                ch = round(p - pc, 2)
                ch_pct = round((ch / pc * 100), 2) if pc > 0 else 0.0
                currency = getattr(fi, "currency", "USD") or "USD"

                return normalize_market_quote(
                    symbol=symbol,
                    name=symbol,
                    exchange=getattr(fi, "exchange", "GLOBAL") or "GLOBAL",
                    asset_type="STOCK",
                    price=p,
                    change=ch,
                    change_pct=ch_pct,
                    volume=int(getattr(fi, "last_volume", 0) or 0),
                    freshness=DataFreshness.DELAYED,
                    source="Yahoo Finance FastInfo",
                    currency=currency,
                    prev_close=pc
                )
        except Exception as e:
            logger.warning(f"yfinance fast_info fallback failed for {target_sym}: {e}")

        return create_unavailable_quote(symbol, message="Yahoo Finance quote unavailable.")

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        target_sym = self._normalize_symbol(symbol)
        
        # 1. Fetch via multi-host chart query
        chart_res = fetch_yahoo_chart_data(target_sym, range_period=range_period, interval=interval, timeout=7)
        if chart_res:
            parsed = parse_yahoo_chart_candles(chart_res, symbol, range_period, interval, source_label="Yahoo Finance")
            if parsed.get("observations"):
                return parsed

        # 2. Fallback to yfinance history
        try:
            t = yf.Ticker(target_sym)
            df = t.history(period=range_period, interval=interval)
            if df is not None and not df.empty:
                observations = []
                for idx, row in df.iterrows():
                    d_str = idx.strftime("%Y-%m-%d")
                    c = float(row.get("Close") or 0.0)
                    observations.append({
                        "date": d_str,
                        "timestamp": d_str,
                        "open": round(float(row.get("Open") or c), 2),
                        "high": round(float(row.get("High") or c), 2),
                        "low": round(float(row.get("Low") or c), 2),
                        "close": round(c, 2),
                        "volume": int(row.get("Volume") or 0)
                    })
                return {
                    "symbol": symbol,
                    "range": range_period,
                    "interval": interval,
                    "source": "Yahoo Finance (yfinance)",
                    "freshness": DataFreshness.HISTORICAL.value,
                    "observations": observations
                }
        except Exception as e:
            logger.warning(f"yfinance history fallback failed for {target_sym}: {e}")

        return {
            "symbol": symbol,
            "range": range_period,
            "interval": interval,
            "freshness": DataFreshness.UNAVAILABLE.value,
            "observations": [],
            "message": "No historical observations available."
        }

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        target_sym = self._normalize_symbol(symbol)
        return get_enhanced_fundamentals(target_sym)

    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        return self.get_fundamentals(symbol)
