import yfinance as yf
from typing import Dict, Any, List, Optional
from app.services.market_data.base import BaseMarketDataProvider, ProviderCapabilities
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.normalizer import normalize_market_quote, create_unavailable_quote
from app.services.market_data.validator import validate_quote_data
from app.services.market_data.cache import market_cache
from app.services.market_data.yahoo_client import fetch_yahoo_chart_data, parse_yahoo_chart_candles, parse_yahoo_chart_quote

class GoldProvider(BaseMarketDataProvider):
    """
    Provider adapter for Gold Spot Reference, Gold ETFs, and Sovereign Gold Bonds (SGB).
    Explicitly distinguishes Spot Reference Price vs ETF Exchange Price vs SGB.
    """
    def __init__(self):
        super().__init__(
            name="Gold Reference & ETF Provider",
            capabilities=ProviderCapabilities(
                name="Gold Provider",
                realtime=False,
                delayed=True,
                historical=True,
                mutual_funds_nav=False,
                fundamentals=True,
                commercial_display=True,
                api_key_required=False,
                is_configured=True
            )
        )

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        s_upper = symbol.upper().strip()
        cache_key = f"quote:gold:{s_upper}"

        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            return cached

        # 1. Check if query is Gold ETF (GOLDBEES)
        if "BEES" in s_upper or "ETF" in s_upper or s_upper == "GOLDBEES":
            # Fast direct chart snapshot
            try:
                chart_raw = fetch_yahoo_chart_data("GOLDBEES.NS", range_period="5d", interval="1d", timeout=4)
                if chart_raw:
                    q_snap = parse_yahoo_chart_quote(chart_raw)
                    if q_snap and q_snap.get("price") is not None:
                        quote = normalize_market_quote(
                            symbol="GOLDBEES",
                            name="Nippon India ETF Gold BeES",
                            exchange="NSE",
                            asset_type="GOLD_ETF",
                            price=q_snap["price"],
                            change=q_snap["change"],
                            change_pct=q_snap["change_pct"],
                            volume=q_snap["volume"],
                            open_price=q_snap["open"],
                            high_price=q_snap["high"],
                            low_price=q_snap["low"],
                            prev_close=q_snap["prev_close"],
                            currency="INR",
                            freshness=DataFreshness.DELAYED,
                            source="NSE / GoldBeES Feed (15m Delayed)",
                            market_status="OPEN"
                        )
                        valid, _ = validate_quote_data(quote)
                        if valid:
                            market_cache.set(cache_key, quote, ttl_seconds=30)
                            return quote
            except Exception:
                pass

            try:
                ticker = yf.Ticker("GOLDBEES.NS")
                hist = ticker.history(period="5d", interval="1d")
                if not hist.empty and len(hist) >= 1:
                    close_p = float(hist['Close'].iloc[-1])
                    prev_p = float(hist['Close'].iloc[-2]) if len(hist) > 1 else close_p
                    change = close_p - prev_p
                    change_pct = (change / prev_p * 100.0) if prev_p > 0 else 0.0

                    quote = normalize_market_quote(
                        symbol="GOLDBEES",
                        name="Nippon India ETF Gold BeES",
                        exchange="NSE",
                        asset_type="GOLD_ETF",
                        price=close_p,
                        change=change,
                        change_pct=change_pct,
                        volume=int(hist['Volume'].iloc[-1]),
                        open_price=float(hist['Open'].iloc[-1]),
                        high_price=float(hist['High'].iloc[-1]),
                        low_price=float(hist['Low'].iloc[-1]),
                        prev_close=prev_p,
                        currency="INR",
                        freshness=DataFreshness.DELAYED,
                        source="NSE / GoldBeES Feed (15m Delayed)",
                        market_status="OPEN"
                    )
                    valid, _ = validate_quote_data(quote)
                    if valid:
                        market_cache.set(cache_key, quote, ttl_seconds=30)
                        return quote
            except Exception:
                pass

        # 2. Check if SGB
        if "SGB" in s_upper or "SOVEREIGN" in s_upper:
            try:
                gold_etf_q = self.get_quote("GOLDBEES")
                if gold_etf_q and gold_etf_q.get("price"):
                    etf_p = float(gold_etf_q["price"])
                    sgb_price = round(etf_p * 100.0, 2)
                    quote = normalize_market_quote(
                        symbol="SGB",
                        name="RBI Sovereign Gold Bond (Secondary Market)",
                        exchange="NSE / RBI",
                        asset_type="SOVEREIGN_GOLD_BOND",
                        price=sgb_price,
                        change=0.0,
                        change_pct=0.0,
                        volume=0,
                        currency="INR",
                        freshness=DataFreshness.MODEL_ASSUMPTION,
                        source="RBI SGB Benchmark Reference",
                        market_status="TRADING"
                    )
                    market_cache.set(cache_key, quote, ttl_seconds=3600)
                    return quote
            except Exception:
                pass

        # 3. Gold Spot Reference (e.g. Gold 24K MCX in INR / 10g)
        try:
            chart_gold = fetch_yahoo_chart_data("GC=F", range_period="5d", interval="1d", timeout=4)
            chart_fx = fetch_yahoo_chart_data("INR=X", range_period="5d", interval="1d", timeout=4)
            if chart_gold and chart_fx:
                q_gold = parse_yahoo_chart_quote(chart_gold)
                q_fx = parse_yahoo_chart_quote(chart_fx)
                if q_gold and q_fx and q_gold.get("price") and q_fx.get("price"):
                    gold_usd_oz = q_gold["price"]
                    usd_inr = q_fx["price"]
                    gold_10g_inr = round(((gold_usd_oz / 31.1035) * 10.0 * usd_inr * 1.06), 2)
                    
                    prev_gold_usd = q_gold.get("prev_close", gold_usd_oz)
                    prev_10g = round(((prev_gold_usd / 31.1035) * 10.0 * usd_inr * 1.06), 2)
                    change = gold_10g_inr - prev_10g
                    change_pct = (change / prev_10g * 100.0) if prev_10g > 0 else 0.0

                    quote = normalize_market_quote(
                        symbol="GOLD (10g)",
                        name="Gold 24K Domestic Spot Reference",
                        exchange="MCX / Global Spot",
                        asset_type="COMMODITY_SPOT",
                        price=gold_10g_inr,
                        change=change,
                        change_pct=change_pct,
                        volume=0,
                        currency="INR",
                        freshness=DataFreshness.DELAYED,
                        source="COMEX Spot / Domestic Reference",
                        market_status="OPEN"
                    )
                    valid, _ = validate_quote_data(quote)
                    if valid:
                        market_cache.set(cache_key, quote, ttl_seconds=60)
                        return quote
        except Exception:
            pass

        stale = market_cache.get(cache_key, allow_stale=True)
        if stale:
            stale["freshness"] = DataFreshness.STALE.value
            return stale

        return create_unavailable_quote(symbol, "Gold market quote temporarily unavailable.")

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        r_clean = range_period.lower().strip()
        if r_clean in ["1m", "30d"]:
            r_clean = "1mo"
        elif r_clean in ["3m", "90d"]:
            r_clean = "3mo"
        elif r_clean in ["6m", "180d"]:
            r_clean = "6mo"
        elif r_clean in ["12m", "365d"]:
            r_clean = "1y"
            
        cache_key = f"candles:gold:{symbol}:{interval}:{r_clean}"
        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            return cached

        # 1. Try Direct Fast Yahoo Chart Fetch
        try:
            chart_raw = fetch_yahoo_chart_data("GOLDBEES.NS", range_period=r_clean, interval=interval, timeout=6)
            if chart_raw:
                res = parse_yahoo_chart_candles(
                    chart_raw, 
                    canonical_symbol=symbol, 
                    range_period=range_period, 
                    interval=interval, 
                    source_label="NSE GoldBeES Historical Feed"
                )
                if res.get("observations") and len(res["observations"]) >= 2:
                    market_cache.set(cache_key, res, ttl_seconds=300)
                    return res
        except Exception:
            pass

        # 2. Fallback to yfinance ticker
        try:
            int_clean = "1wk" if r_clean in ["3y", "5y", "max"] and interval == "1d" else interval
            ticker = yf.Ticker("GOLDBEES.NS")
            hist = ticker.history(period=r_clean, interval=int_clean)
            if not hist.empty and len(hist) >= 2:
                observations = []
                for idx, row in hist.iterrows():
                    dt_str = idx.strftime("%Y-%m-%d") if hasattr(idx, 'strftime') else str(idx)[:10]
                    c = round(float(row['Close']), 2)
                    observations.append({
                        "date": dt_str,
                        "timestamp": dt_str,
                        "open": round(float(row['Open']), 2),
                        "high": round(float(row['High']), 2),
                        "low": round(float(row['Low']), 2),
                        "close": c,
                        "nav": c,
                        "volume": int(row['Volume'])
                    })

                res = {
                    "symbol": symbol,
                    "range": range_period,
                    "interval": interval,
                    "source": "NSE GoldBeES Historical Feed",
                    "freshness": DataFreshness.HISTORICAL.value,
                    "disclaimer": "Past performance does not guarantee future results.",
                    "observations": observations
                }
                market_cache.set(cache_key, res, ttl_seconds=300)
                return res
        except Exception:
            pass

        stale = market_cache.get(cache_key, allow_stale=True)
        if stale and stale.get("observations"):
            stale["freshness"] = DataFreshness.STALE.value
            return stale

        return {
            "symbol": symbol,
            "range": range_period,
            "interval": interval,
            "source": "NSE GoldBeES Historical Feed",
            "freshness": DataFreshness.UNAVAILABLE.value,
            "observations": [],
            "message": "Historical gold series unavailable."
        }

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        return {
            "symbol": symbol,
            "assetType": "Gold / SGB",
            "source": "RBI / Domestic Bullion Reference",
            "freshness": DataFreshness.LATEST_AVAILABLE.value
        }

    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        return {
            "symbol": symbol,
            "currency": "INR",
            "assetType": "GOLD"
        }
