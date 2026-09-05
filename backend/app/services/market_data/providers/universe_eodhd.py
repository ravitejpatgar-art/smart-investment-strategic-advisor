import logging
import re
import urllib.request
import urllib.error
import urllib.parse
import json
import time
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class EODHDUniverseProvider:
    """
    Universe Provider for EODHD (End-of-Day Historical Data).
    Fetches active global stocks, ETFs, and funds across major international exchanges.
    Supports server-side exchange-level batch fetching, resilient timeout/retry logic,
    rate-limit backoff, and robust field normalization.
    """
    provider_name: str = "EODHD"

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or settings.EODHD_API_KEY
        self.base_url = (base_url or settings.EODHD_API_URL or "https://eodhd.com/api").rstrip("/")
        self.timeout_seconds = 15

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and self.api_key != "demo")

    def _safe_request(self, endpoint: str, params: Optional[Dict[str, str]] = None, retries: int = 2) -> Optional[Any]:
        if not self.api_key:
            logger.debug("[EODHD] API key not configured, skipping remote request.")
            return None

        all_params = {"api_token": self.api_key, "fmt": "json"}
        if params:
            all_params.update(params)

        query_str = urllib.parse.urlencode(all_params)
        url = f"{self.base_url}/{endpoint.lstrip('/')}?{query_str}"
        masked_url = re.sub(r'api_token=[^&]+', 'api_token=***', url)

        for attempt in range(retries + 1):
            try:
                req = urllib.request.Request(
                    url,
                    headers={"User-Agent": "SmartVest/1.0 (UniverseSyncEngine; Contact: support@smartvest.ai)"}
                )
                with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                    if resp.status == 200:
                        raw_data = resp.read().decode("utf-8")
                        try:
                            return json.loads(raw_data)
                        except json.JSONDecodeError as json_err:
                            logger.warning(f"[EODHD] Malformed JSON from {masked_url}: {json_err}")
                            return None
                    elif resp.status == 429:
                        logger.warning(f"[EODHD] Rate limited on {masked_url} (HTTP 429). Attempt {attempt + 1}/{retries + 1}")
                        time.sleep(1.5 * (attempt + 1))
                    else:
                        logger.warning(f"[EODHD] HTTP {resp.status} on {masked_url}")
            except urllib.error.HTTPError as he:
                if he.code == 429:
                    logger.warning(f"[EODHD] Rate limited (HTTP 429). Backing off attempt {attempt + 1}")
                    time.sleep(2.0 * (attempt + 1))
                else:
                    logger.warning(f"[EODHD] HTTP Error {he.code} on {masked_url}")
                    break
            except Exception as exc:
                logger.warning(f"[EODHD] Connection failure on attempt {attempt + 1} for {masked_url}: {exc}")
                if attempt < retries:
                    time.sleep(1.0 * (attempt + 1))

        return None

    def list_supported_exchanges(self) -> List[Dict[str, Any]]:
        """
        Fetches the official list of supported exchanges from EODHD.
        Returns normalized exchange dictionaries.
        """
        data = self._safe_request("exchanges-list")
        if not data or not isinstance(data, list):
            logger.info("[EODHD] Using default core exchange registry list.")
            return [
                {"Code": "US", "Name": "USA Stocks", "Country": "USA", "Currency": "USD"},
                {"Code": "NSE", "Name": "National Stock Exchange of India", "Country": "India", "Currency": "INR"},
                {"Code": "BSE", "Name": "Bombay Stock Exchange", "Country": "India", "Currency": "INR"},
                {"Code": "LSE", "Name": "London Stock Exchange", "Country": "UK", "Currency": "GBP"},
                {"Code": "XETRA", "Name": "Deutsche Börse Xetra", "Country": "Germany", "Currency": "EUR"},
                {"Code": "TO", "Name": "Toronto Stock Exchange", "Country": "Canada", "Currency": "CAD"},
            ]
        return data

    def fetch_exchange_instruments(self, exchange_code: str = "US", type_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetches active securities for a specific exchange code (e.g. 'US', 'LSE', 'NSE').
        Normalizes each raw security into standard SmartVest instrument format.
        """
        params = {}
        if type_filter:
            params["type"] = type_filter

        endpoint = f"exchange-symbol-list/{exchange_code.upper()}"
        data = self._safe_request(endpoint, params=params)

        if not data or not isinstance(data, list):
            return []

        normalized_list: List[Dict[str, Any]] = []
        for raw in data:
            if not isinstance(raw, dict):
                continue
            normalized = self.normalize_instrument(raw, default_exchange=exchange_code.upper())
            if normalized and normalized.get("symbol") and normalized.get("name"):
                normalized_list.append(normalized)

        logger.info(f"[EODHD] Fetched and normalized {len(normalized_list)} instruments for exchange '{exchange_code}'.")
        return normalized_list

    def normalize_instrument(self, raw: Dict[str, Any], default_exchange: str = "US") -> Optional[Dict[str, Any]]:
        """
        Maps an EODHD raw record to the normalized SmartVest instrument schema.
        Allowed instrument types: STOCK, ETF, MUTUAL_FUND
        """
        code = str(raw.get("Code") or raw.get("symbol") or "").strip().upper()
        if not code:
            return None

        raw_type = str(raw.get("Type") or "").strip().lower()
        asset_type = self._map_asset_type(raw_type)

        exchange = str(raw.get("Exchange") or raw.get("exchange") or default_exchange).strip().upper()
        name = str(raw.get("Name") or raw.get("name") or code).strip()
        country = str(raw.get("Country") or raw.get("country") or "").strip().upper()
        currency = str(raw.get("Currency") or raw.get("currency") or "").strip().upper()
        isin = str(raw.get("Isin") or raw.get("isin") or "").strip() or None

        # Standardize country codes (e.g. USA -> US, India -> IN)
        country_upper = country.upper()
        if country_upper in ["USA", "UNITED STATES", "UNITED STATES OF AMERICA"]:
            country = "US"
        elif country_upper in ["INDIA", "IND"]:
            country = "IN"
        elif country_upper in ["UK", "UNITED KINGDOM", "GREAT BRITAIN"]:
            country = "GB"
        elif country_upper in ["GERMANY", "DEU"]:
            country = "DE"
        elif country_upper in ["CANADA", "CAN"]:
            country = "CA"
        elif not country:
            country = "US" if exchange in ["US", "NASDAQ", "NYSE", "BATS", "AMEX"] else ("IN" if exchange in ["NSE", "BSE", "AMFI"] else "GLOBAL")
        else:
            country = country_upper

        if not currency:
            currency = "USD" if country == "US" else ("INR" if country == "IN" else "USD")

        market = "INDIA" if country == "IN" else ("US" if country == "US" else "GLOBAL")
        canonical_id = f"{exchange}:{code}"
        
        # Build symbol format compatible with live quote provider (e.g. AAPL or TCS.NS)
        if exchange == "NSE" and not code.endswith(".NS"):
            symbol = f"{code}.NS"
        elif exchange == "BSE" and not code.endswith(".BO"):
            symbol = f"{code}.BO"
        else:
            symbol = code

        asset_class = "EQUITY"
        if asset_type == "ETF":
            asset_class = "EQUITY"
        elif asset_type == "MUTUAL_FUND":
            asset_class = "EQUITY"

        aliases = [code, name]
        if code != symbol:
            aliases.append(symbol)

        return {
            "canonical_id": canonical_id,
            "figi": raw.get("Figi") or raw.get("figi"),
            "symbol": symbol,
            "ticker": code,
            "name": name,
            "short_name": name[:50] if len(name) > 50 else name,
            "asset_type": asset_type,
            "asset_class": asset_class,
            "market": market,
            "country": country,
            "exchange": exchange,
            "exchange_mic": raw.get("OperatingMIC") or None,
            "currency": currency,
            "provider": self.provider_name,
            "provider_symbol": code,
            "status": "ACTIVE",
            "is_active": True,
            "isin": isin,
            "sector": raw.get("Sector") or None,
            "industry": raw.get("Industry") or None,
            "aliases": aliases
        }

    @staticmethod
    def _map_asset_type(raw_type: str) -> str:
        """
        Maps provider-specific security type string to normalized SmartVest enum:
        STOCK, ETF, MUTUAL_FUND
        """
        t = raw_type.lower()
        if "etf" in t or "exchange traded fund" in t:
            return "ETF"
        elif "fund" in t or "mutual" in t or "unit trust" in t or "cef" in t:
            return "MUTUAL_FUND"
        elif "index" in t:
            return "INDEX"
        elif "commodity" in t or "gold" in t or "silver" in t:
            return "COMMODITY"
        return "STOCK"

eodhd_universe_provider = EODHDUniverseProvider()
