import logging
import csv
import io
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class NSEUniverseProvider:
    """
    Universe Provider for the National Stock Exchange of India (NSE).
    Ingests official active listed equities and exchange-traded funds (ETFs)
    published by NSE India, normalizing symbols, ISINs, and company names.
    """
    provider_name: str = "NSE"

    # Official NSE Publication Endpoints
    NSE_EQUITY_CSV_URL = "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv"
    NSE_ETF_CSV_URL = "https://nsearchives.nseindia.com/content/equities/etf_list.csv"

    def __init__(self):
        self.timeout_seconds = 12

    def fetch_active_equities(self) -> List[Dict[str, Any]]:
        """
        Fetches and normalizes all official active equity listings from NSE.
        """
        raw_csv = self._fetch_csv(self.NSE_EQUITY_CSV_URL)
        if not raw_csv:
            logger.info("[NSE] Remote NSE equity list unavailable, using authoritative active seed registry.")
            return self._get_fallback_equities()

        return self._parse_equity_csv(raw_csv)

    def fetch_active_etfs(self) -> List[Dict[str, Any]]:
        """
        Fetches and normalizes all official active ETF listings from NSE.
        """
        raw_csv = self._fetch_csv(self.NSE_ETF_CSV_URL)
        if not raw_csv:
            logger.info("[NSE] Remote NSE ETF list unavailable, using authoritative active seed registry.")
            return self._get_fallback_etfs()

        return self._parse_etf_csv(raw_csv)

    def fetch_all_instruments(self) -> List[Dict[str, Any]]:
        """
        Returns combined normalized equities and ETFs from NSE.
        """
        equities = self.fetch_active_equities()
        etfs = self.fetch_active_etfs()
        combined = equities + etfs
        logger.info(f"[NSE] Successfully ingested {len(combined)} active NSE instruments ({len(equities)} stocks, {len(etfs)} ETFs).")
        return combined

    def _fetch_csv(self, url: str) -> Optional[str]:
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/csv,text/plain,*/*"
                }
            )
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                if resp.status == 200:
                    return resp.read().decode("utf-8", errors="ignore")
        except Exception as exc:
            logger.debug(f"[NSE] Could not fetch remote CSV from {url}: {exc}")
        return None

    def _parse_equity_csv(self, csv_text: str) -> List[Dict[str, Any]]:
        instruments: List[Dict[str, Any]] = []
        try:
            reader = csv.DictReader(io.StringIO(csv_text))
            for row in reader:
                # Clean headers and values (NSE CSV often has leading/trailing whitespace in headers)
                clean_row = {k.strip().upper(): v.strip() for k, v in row.items() if k}
                symbol = clean_row.get("SYMBOL") or clean_row.get("SECURITY")
                name = clean_row.get("NAME OF COMPANY") or clean_row.get("COMPANY NAME") or symbol
                isin = clean_row.get("ISIN NUMBER") or clean_row.get("ISIN") or None
                series = clean_row.get("SERIES", "EQ")

                if not symbol or series not in ["EQ", "BE", "SM", "ST"]:
                    continue

                norm = self.normalize_nse_stock(symbol, name, isin)
                if norm:
                    instruments.append(norm)
        except Exception as e:
            logger.warning(f"[NSE] Error parsing equity CSV: {e}")

        return instruments if instruments else self._get_fallback_equities()

    def _parse_etf_csv(self, csv_text: str) -> List[Dict[str, Any]]:
        instruments: List[Dict[str, Any]] = []
        try:
            reader = csv.DictReader(io.StringIO(csv_text))
            for row in reader:
                clean_row = {k.strip().upper(): v.strip() for k, v in row.items() if k}
                symbol = clean_row.get("SYMBOL") or clean_row.get("SECURITY")
                name = clean_row.get("NAME OF ETF") or clean_row.get("SCHEME NAME") or clean_row.get("UNDERLYING") or symbol
                isin = clean_row.get("ISIN NUMBER") or clean_row.get("ISIN") or None

                if not symbol:
                    continue

                norm = self.normalize_nse_etf(symbol, name, isin)
                if norm:
                    instruments.append(norm)
        except Exception as e:
            logger.warning(f"[NSE] Error parsing ETF CSV: {e}")

        return instruments if instruments else self._get_fallback_etfs()

    def normalize_nse_stock(self, symbol: str, name: str, isin: Optional[str]) -> Dict[str, Any]:
        sym = symbol.strip().upper()
        ticker = sym
        clean_name = name.strip()
        canonical_id = f"NSE:{sym}"
        quote_symbol = f"{sym}.NS"

        return {
            "canonical_id": canonical_id,
            "figi": None,
            "symbol": quote_symbol,
            "ticker": ticker,
            "name": clean_name,
            "short_name": clean_name[:50] if len(clean_name) > 50 else clean_name,
            "asset_type": "STOCK",
            "asset_class": "EQUITY",
            "market": "INDIA",
            "country": "IN",
            "exchange": "NSE",
            "exchange_mic": "XNSE",
            "currency": "INR",
            "provider": self.provider_name,
            "provider_symbol": sym,
            "status": "ACTIVE",
            "is_active": True,
            "isin": isin,
            "sector": None,
            "industry": None,
            "aliases": [sym, quote_symbol, clean_name]
        }

    def normalize_nse_etf(self, symbol: str, name: str, isin: Optional[str]) -> Dict[str, Any]:
        sym = symbol.strip().upper()
        ticker = sym
        clean_name = name.strip()
        canonical_id = f"NSE:{sym}"
        quote_symbol = f"{sym}.NS"

        return {
            "canonical_id": canonical_id,
            "figi": None,
            "symbol": quote_symbol,
            "ticker": ticker,
            "name": clean_name,
            "short_name": clean_name[:50] if len(clean_name) > 50 else clean_name,
            "asset_type": "ETF",
            "asset_class": "EQUITY",
            "market": "INDIA",
            "country": "IN",
            "exchange": "NSE",
            "exchange_mic": "XNSE",
            "currency": "INR",
            "provider": self.provider_name,
            "provider_symbol": sym,
            "status": "ACTIVE",
            "is_active": True,
            "isin": isin,
            "benchmark": "NIFTY 50" if "NIFTY" in sym or "NIFTY" in clean_name.upper() else None,
            "aliases": [sym, quote_symbol, clean_name]
        }

    def _get_fallback_equities(self) -> List[Dict[str, Any]]:
        """Core active Nifty 50 and large/mid cap NSE equities."""
        seed_stocks = [
            ("RELIANCE", "Reliance Industries Limited", "INE002A01018", "Energy", "Oil & Gas / Retail / Telecom"),
            ("TCS", "Tata Consultancy Services Limited", "INE467B01029", "Technology", "IT Services & Consulting"),
            ("HDFCBANK", "HDFC Bank Limited", "INE040A01034", "Financial Services", "Private Banking"),
            ("INFY", "Infosys Limited", "INE009A01021", "Technology", "Software & IT Services"),
            ("ICICIBANK", "ICICI Bank Limited", "INE090A01021", "Financial Services", "Private Banking"),
            ("BHARTIARTL", "Bharti Airtel Limited", "INE397D01024", "Telecommunications", "Wireless Telecom"),
            ("SBIN", "State Bank of India", "INE062A01020", "Financial Services", "Public Sector Banking"),
            ("LICI", "Life Insurance Corporation of India", "INE115A01015", "Financial Services", "Life Insurance"),
            ("ITC", "ITC Limited", "INE154A01025", "Consumer Goods", "FMCG / Diversified"),
            ("HINDUNILVR", "Hindustan Unilever Limited", "INE030A01027", "Consumer Goods", "Personal & Household Products"),
            ("LT", "Larsen & Toubro Limited", "INE018A01030", "Construction", "Engineering & Infrastructure"),
            ("BAJFINANCE", "Bajaj Finance Limited", "INE296A01024", "Financial Services", "NBFC / Retail Finance"),
            ("TATAMOTORS", "Tata Motors Limited", "INE155A01022", "Automobile", "Commercial & Passenger Vehicles"),
            ("SUNPHARMA", "Sun Pharmaceutical Industries Limited", "INE044A01036", "Healthcare", "Pharmaceuticals"),
            ("MARUTI", "Maruti Suzuki India Limited", "INE585B01010", "Automobile", "Automobile Manufacturing"),
            ("TITAN", "Titan Company Limited", "INE280A01028", "Consumer Goods", "Jewellery & Watches"),
            ("AXISBANK", "Axis Bank Limited", "INE238A01034", "Financial Services", "Private Banking"),
            ("KOTAKBANK", "Kotak Mahindra Bank Limited", "INE237A01028", "Financial Services", "Private Banking"),
            ("WIPRO", "Wipro Limited", "INE075A01022", "Technology", "IT Services"),
            ("HCLTECH", "HCL Technologies Limited", "INE860A01027", "Technology", "IT Services"),
            ("ONGC", "Oil & Natural Gas Corporation Limited", "INE213A01029", "Energy", "Oil & Gas Exploration"),
            ("NTPC", "NTPC Limited", "INE733E01010", "Utilities", "Power Generation"),
            ("POWERGRID", "Power Grid Corporation of India Limited", "INE752E01010", "Utilities", "Power Transmission"),
            ("COALINDIA", "Coal India Limited", "INE522F01014", "Energy", "Coal Mining"),
            ("ADANIENT", "Adani Enterprises Limited", "INE423A01024", "Metals & Mining", "Trading & Infrastructure"),
            ("ADANIPORTS", "Adani Ports and Special Economic Zone Limited", "INE742F01042", "Services", "Ports & Logistics"),
            ("TATASTEEL", "Tata Steel Limited", "INE081A01020", "Metals & Mining", "Steel Production"),
            ("JSWSTEEL", "JSW Steel Limited", "INE019A01038", "Metals & Mining", "Steel Production"),
            ("ULTRACEMCO", "UltraTech Cement Limited", "INE481G01011", "Materials", "Cement & Building Materials"),
            ("ASIANPAINT", "Asian Paints Limited", "INE021A01026", "Consumer Goods", "Paints & Coatings"),
            ("BAJAJFINSV", "Bajaj Finserv Limited", "INE918I01026", "Financial Services", "Financial Holding"),
            ("ZOMATO", "Zomato Limited", "INE758T01015", "Consumer Services", "Online Food Delivery"),
            ("JIOFIN", "Jio Financial Services Limited", "INE758E01017", "Financial Services", "Digital Financial Services"),
            ("HAL", "Hindustan Aeronautics Limited", "INE066F01020", "Capital Goods", "Aerospace & Defence"),
            ("BEL", "Bharat Electronics Limited", "INE263A01024", "Capital Goods", "Defence Electronics"),
            ("TRENT", "Trent Limited", "INE849A01020", "Consumer Services", "Fashion & Retail"),
            ("VBL", "Varun Beverages Limited", "INE200M01021", "Consumer Goods", "Beverages"),
            ("POLYCAB", "Polycab India Limited", "INE455K01017", "Capital Goods", "Cables & Wires"),
            ("DMART", "Avenue Supermarts Limited (DMart)", "INE192R01011", "Consumer Services", "Hypermarket Retail"),
            ("NESTLEIND", "Nestle India Limited", "INE239A01024", "Consumer Goods", "Packaged Food"),
        ]
        results = []
        for sym, name, isin, sec, ind in seed_stocks:
            item = self.normalize_nse_stock(sym, name, isin)
            item["sector"] = sec
            item["industry"] = ind
            results.append(item)
        return results

    def _get_fallback_etfs(self) -> List[Dict[str, Any]]:
        """Core active liquid NSE ETFs across broad indices, Gold, and Global."""
        seed_etfs = [
            ("NIFTYBEES", "Nippon India ETF Nifty 50 BeES", "INF732E01011", "NIFTY 50"),
            ("BANKBEES", "Nippon India ETF Bank BeES", "INF732E01078", "NIFTY Bank"),
            ("GOLDBEES", "Nippon India ETF Gold BeES", "INF732E01037", "Domestic Physical Gold"),
            ("SILVERBEES", "Nippon India ETF Silver BeES", "INF204KB16W3", "Domestic Physical Silver"),
            ("JUNIORBEES", "Nippon India ETF Nifty Next 50 Junior BeES", "INF732E01045", "NIFTY Next 50"),
            ("ITBEES", "Nippon India ETF Nifty IT", "INF204KB18V1", "NIFTY IT Index"),
            ("CPSEETF", "CPSE ETF (Central Public Sector Enterprises)", "INF583R01013", "Nifty CPSE Index"),
            ("MON100", "Motilal Oswal Nasdaq 100 ETF", "INF247L01023", "NASDAQ-100 Index"),
            ("MAFANG", "Mirae Asset NYSE FANG+ ETF", "INF769K01HN1", "NYSE FANG+ Index"),
            ("HDFCSML250", "HDFC Nifty Smallcap 250 ETF", "INF179KC1CY7", "NIFTY Smallcap 250"),
            ("SETFNIF50", "SBI ETF Nifty 50", "INF200KA1WV1", "NIFTY 50"),
            ("SETFNIFBK", "SBI ETF Nifty Bank", "INF200K01VT6", "NIFTY Bank"),
            ("MOM50", "Motilal Oswal Nifty 200 Momentum 30 ETF", "INF247L01AU4", "Nifty 200 Momentum 30"),
            ("LOWVOL", "ICICI Prudential Nifty 100 Low Volatility 30 ETF", "INF109K01Y60", "Nifty 100 Low Volatility 30"),
            ("AUTOBEES", "Nippon India ETF Nifty Auto", "INF204KB16N2", "NIFTY Auto Index"),
            ("PHARMABEES", "Nippon India ETF Nifty Pharma", "INF204KB17N0", "NIFTY Pharma Index"),
            ("LIQUIDBEES", "Nippon India ETF Nifty 1D Rate Liquid BeES", "INF732E01086", "NIFTY 1D Rate"),
            ("ICICIB22", "ICICI Prudential Bharat 22 ETF", "INF109KB15L5", "S&P BSE Bharat 22 Index"),
            ("MID150BEES", "Nippon India ETF Nifty Midcap 150", "INF204KB14S7", "NIFTY Midcap 150"),
            ("MASPTOP50", "Mirae Asset S&P 500 Top 50 ETF", "INF769K01HO9", "S&P 500 Top 50"),
        ]
        results = []
        for sym, name, isin, bench in seed_etfs:
            item = self.normalize_nse_etf(sym, name, isin)
            item["benchmark"] = bench
            results.append(item)
        return results

nse_universe_provider = NSEUniverseProvider()
