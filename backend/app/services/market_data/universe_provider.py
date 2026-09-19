import logging
import re
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, cast, String
from app.models.instrument import Instrument
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)

# Base Provider Interface
class InstrumentUniverseProvider:
    provider_name: str = "BaseProvider"

    def list_exchanges(self) -> List[str]:
        raise NotImplementedError

    def search_instruments(self, query: str, asset_type: Optional[str] = None) -> List[Dict[str, Any]]:
        raise NotImplementedError

    def get_instrument(self, canonical_id: str) -> Optional[Dict[str, Any]]:
        raise NotImplementedError

    def sync_universe(self, db: Session) -> int:
        raise NotImplementedError


# Global Equities & ADRs (US, Asian, European Tech & Giants)
GLOBAL_EQUITIES_CATALOGUE: List[Dict[str, Any]] = [
    # Asian / Global Semis & Tech Giants
    {
        "canonical_id": "TWSE:2330",
        "symbol": "2330.TW",
        "ticker": "2330",
        "name": "Taiwan Semiconductor Manufacturing Company (TSMC)",
        "short_name": "TSMC",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "TAIWAN",
        "country": "TW",
        "exchange": "TWSE",
        "exchange_mic": "ROCO",
        "currency": "TWD",
        "sector": "Semiconductors",
        "industry": "Semiconductor Manufacturing",
        "figi": "BBG000BD7202",
        "isin": "TW0002330008",
        "aliases": ["TSMC", "TSM", "Taiwan Semi", "2330"]
    },
    {
        "canonical_id": "NYSE:TSM",
        "symbol": "TSM",
        "ticker": "TSM",
        "name": "Taiwan Semiconductor Manufacturing Co Ltd - ADR",
        "short_name": "TSMC ADR",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "TW",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Semiconductors",
        "industry": "Semiconductor Foundry",
        "figi": "BBG000BD86L1",
        "isin": "US8740391003",
        "aliases": ["TSMC", "TSM", "Taiwan Semiconductor ADR", "TSMC ADR"]
    },
    {
        "canonical_id": "NASDAQ:NVDA",
        "symbol": "NVDA",
        "ticker": "NVDA",
        "name": "NVIDIA Corporation",
        "short_name": "NVIDIA",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Semiconductors",
        "industry": "AI & Graphics Processors",
        "figi": "BBG000BBJQV0",
        "isin": "US67066G1040",
        "aliases": ["Nvidia", "NVDA", "Nvidia Corp", "NVIDIA AI"]
    },
    {
        "canonical_id": "NASDAQ:MSFT",
        "symbol": "MSFT",
        "ticker": "MSFT",
        "name": "Microsoft Corporation",
        "short_name": "Microsoft",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Software & Cloud Services",
        "figi": "BBG000BPH459",
        "isin": "US5949181045",
        "aliases": ["Microsoft", "MSFT", "Microsoft Corp", "Azure"]
    },
    {
        "canonical_id": "NASDAQ:AAPL",
        "symbol": "AAPL",
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "short_name": "Apple",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Consumer Electronics",
        "figi": "BBG000B9XRY4",
        "isin": "US0378331005",
        "aliases": ["Apple", "AAPL", "Apple Inc", "iPhone"]
    },
    {
        "canonical_id": "NASDAQ:GOOGL",
        "symbol": "GOOGL",
        "ticker": "GOOGL",
        "name": "Alphabet Inc. Class A",
        "short_name": "Alphabet",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Communication Services",
        "industry": "Internet Search & Cloud",
        "figi": "BBG009S39JX6",
        "isin": "US02079K3059",
        "aliases": ["Google", "Alphabet", "GOOGL", "GOOG"]
    },
    {
        "canonical_id": "NASDAQ:AMZN",
        "symbol": "AMZN",
        "ticker": "AMZN",
        "name": "Amazon.com Inc.",
        "short_name": "Amazon",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Consumer Discretionary",
        "industry": "E-Commerce & Cloud AWS",
        "figi": "BBG000BVPV84",
        "isin": "US0231351067",
        "aliases": ["Amazon", "AMZN", "AWS"]
    },
    {
        "canonical_id": "NASDAQ:META",
        "symbol": "META",
        "ticker": "META",
        "name": "Meta Platforms Inc.",
        "short_name": "Meta",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Communication Services",
        "industry": "Social Media & Metaverse",
        "figi": "BBG000MM2P62",
        "isin": "US30303M1027",
        "aliases": ["Meta", "Facebook", "META", "Instagram"]
    },
    {
        "canonical_id": "NASDAQ:TSLA",
        "symbol": "TSLA",
        "ticker": "TSLA",
        "name": "Tesla Inc.",
        "short_name": "Tesla",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Consumer Discretionary",
        "industry": "Electric Vehicles & Energy",
        "figi": "BBG000N9MNX3",
        "isin": "US88160R1014",
        "aliases": ["Tesla", "TSLA", "Elon Musk"]
    },
    {
        "canonical_id": "NASDAQ:ASML",
        "symbol": "ASML",
        "ticker": "ASML",
        "name": "ASML Holding N.V. - NY Registry Shares",
        "short_name": "ASML",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "NL",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Semiconductors",
        "industry": "Lithography Equipment",
        "figi": "BBG000BW09T9",
        "isin": "USN070592100",
        "aliases": ["ASML", "ASML Holding", "Lithography"]
    },
    {
        "canonical_id": "NYSE:BABA",
        "symbol": "BABA",
        "ticker": "BABA",
        "name": "Alibaba Group Holding Limited - ADR",
        "short_name": "Alibaba",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "CN",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Consumer Discretionary",
        "industry": "E-Commerce & Cloud",
        "figi": "BBG006G2JVL2",
        "isin": "US01609W1027",
        "aliases": ["Alibaba", "BABA", "Taobao", "Ali"]
    },
    {
        "canonical_id": "OTC:TCEHY",
        "symbol": "TCEHY",
        "ticker": "TCEHY",
        "name": "Tencent Holdings Ltd - ADR",
        "short_name": "Tencent",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "GLOBAL",
        "country": "CN",
        "exchange": "OTC",
        "exchange_mic": "OTCM",
        "currency": "USD",
        "sector": "Communication Services",
        "industry": "Gaming & Social Networks",
        "figi": "BBG000H8H8B4",
        "isin": "US88032Q1094",
        "aliases": ["Tencent", "TCEHY", "WeChat", "0700.HK"]
    },
    {
        "canonical_id": "NYSE:SONY",
        "symbol": "SONY",
        "ticker": "SONY",
        "name": "Sony Group Corporation - ADR",
        "short_name": "Sony",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "JP",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Consumer Discretionary",
        "industry": "Consumer Electronics & Gaming",
        "figi": "BBG000BYCK58",
        "isin": "US8356993076",
        "aliases": ["Sony", "SONY", "PlayStation"]
    },
    {
        "canonical_id": "NYSE:TM",
        "symbol": "TM",
        "ticker": "TM",
        "name": "Toyota Motor Corporation - ADR",
        "short_name": "Toyota",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "JP",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Consumer Discretionary",
        "industry": "Automotive",
        "figi": "BBG000BYCP12",
        "isin": "US8923313071",
        "aliases": ["Toyota", "TM", "Toyota Motor"]
    },
    {
        "canonical_id": "NASDAQ:ARM",
        "symbol": "ARM",
        "ticker": "ARM",
        "name": "Arm Holdings plc - ADR",
        "short_name": "Arm Holdings",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "GB",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Semiconductors",
        "industry": "Semiconductor IP Architecture",
        "figi": "BBG01G6N6Q69",
        "isin": "US0420682058",
        "aliases": ["ARM", "Arm Holdings", "Arm Architecture"]
    },
    {
        "canonical_id": "NASDAQ:AMD",
        "symbol": "AMD",
        "ticker": "AMD",
        "name": "Advanced Micro Devices Inc.",
        "short_name": "AMD",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Semiconductors",
        "industry": "Semiconductors & AI Compute",
        "figi": "BBG000BBQCY0",
        "isin": "US0079031078",
        "aliases": ["AMD", "Advanced Micro Devices", "Radeon", "Ryzen"]
    },
    {
        "canonical_id": "NYSE:PLTR",
        "symbol": "PLTR",
        "ticker": "PLTR",
        "name": "Palantir Technologies Inc.",
        "short_name": "Palantir",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Enterprise AI & Defense Analytics",
        "figi": "BBG00V054GG7",
        "isin": "US69608A1088",
        "aliases": ["Palantir", "PLTR", "AIP", "Foundry"]
    },
    {
        "canonical_id": "NASDAQ:AVGO",
        "symbol": "AVGO",
        "ticker": "AVGO",
        "name": "Broadcom Inc.",
        "short_name": "Broadcom",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Semiconductors",
        "industry": "Custom AI ASICs & Networking",
        "figi": "BBG00P3DFP94",
        "isin": "US11135F1012",
        "aliases": ["Broadcom", "AVGO", "VMware"]
    },
    {
        "canonical_id": "NYSE:BRK-B",
        "symbol": "BRK-B",
        "ticker": "BRK-B",
        "name": "Berkshire Hathaway Inc. Class B",
        "short_name": "Berkshire Hathaway",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Financials",
        "industry": "Conglomerate Holding",
        "figi": "BBG000BLNNH6",
        "isin": "US0846707026",
        "aliases": ["Berkshire", "BRK.B", "BRK-B", "Warren Buffett"]
    },
    {
        "canonical_id": "NYSE:JPM",
        "symbol": "JPM",
        "ticker": "JPM",
        "name": "JPMorgan Chase & Co.",
        "short_name": "JPMorgan",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Financials",
        "industry": "Diversified Banking",
        "figi": "BBG000GZQ728",
        "isin": "US46625H1005",
        "aliases": ["JPMorgan", "JPM", "Chase", "Jamie Dimon"]
    },
    {
        "canonical_id": "NYSE:V",
        "symbol": "V",
        "ticker": "V",
        "name": "Visa Inc. Class A",
        "short_name": "Visa",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Financials",
        "industry": "Payment Processing",
        "isin": "US92826C8394",
        "aliases": ["Visa", "V", "Visa Cards"]
    },
    {
        "canonical_id": "NYSE:MA",
        "symbol": "MA",
        "ticker": "MA",
        "name": "Mastercard Incorporated Class A",
        "short_name": "Mastercard",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Financials",
        "industry": "Payment Processing",
        "isin": "US57636Q1040",
        "aliases": ["Mastercard", "MA", "Master Card"]
    },
    {
        "canonical_id": "NYSE:WMT",
        "symbol": "WMT",
        "ticker": "WMT",
        "name": "Walmart Inc.",
        "short_name": "Walmart",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Consumer Staples",
        "industry": "Hypermarkets & Supercenters",
        "isin": "US9311421039",
        "aliases": ["Walmart", "WMT", "Wal-Mart"]
    },
    {
        "canonical_id": "NYSE:PG",
        "symbol": "PG",
        "ticker": "PG",
        "name": "The Procter & Gamble Company",
        "short_name": "Procter & Gamble",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Consumer Staples",
        "industry": "Household & Personal Products",
        "isin": "US7427181091",
        "aliases": ["P&G", "PG", "Procter & Gamble"]
    },
    {
        "canonical_id": "NYSE:JNJ",
        "symbol": "JNJ",
        "ticker": "JNJ",
        "name": "Johnson & Johnson",
        "short_name": "Johnson & Johnson",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Healthcare",
        "industry": "Pharmaceuticals & MedTech",
        "isin": "US4781601046",
        "aliases": ["JNJ", "Johnson and Johnson", "J&J"]
    },
    {
        "canonical_id": "NYSE:LLY",
        "symbol": "LLY",
        "ticker": "LLY",
        "name": "Eli Lilly and Company",
        "short_name": "Eli Lilly",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Healthcare",
        "industry": "Pharmaceuticals & Biotechnology",
        "isin": "US5324571083",
        "aliases": ["Eli Lilly", "LLY", "Mounjaro", "Zepbound"]
    },
    {
        "canonical_id": "NASDAQ:COST",
        "symbol": "COST",
        "ticker": "COST",
        "name": "Costco Wholesale Corporation",
        "short_name": "Costco",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Consumer Staples",
        "industry": "Consumer Retail & Wholesale",
        "isin": "US22160K1051",
        "aliases": ["Costco", "COST", "Costco Wholesale"]
    },
    {
        "canonical_id": "NASDAQ:NFLX",
        "symbol": "NFLX",
        "ticker": "NFLX",
        "name": "Netflix Inc.",
        "short_name": "Netflix",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Communication Services",
        "industry": "Digital Streaming & Media",
        "isin": "US64110L1061",
        "aliases": ["Netflix", "NFLX", "Streaming"]
    },
    {
        "canonical_id": "NYSE:DIS",
        "symbol": "DIS",
        "ticker": "DIS",
        "name": "The Walt Disney Company",
        "short_name": "Disney",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Communication Services",
        "industry": "Entertainment & Theme Parks",
        "isin": "US2546871060",
        "aliases": ["Disney", "DIS", "Walt Disney", "Disney Plus"]
    },
    {
        "canonical_id": "NYSE:ORCL",
        "symbol": "ORCL",
        "ticker": "ORCL",
        "name": "Oracle Corporation",
        "short_name": "Oracle",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Enterprise Cloud & Database Software",
        "isin": "US68389X1054",
        "aliases": ["Oracle", "ORCL", "Oracle Cloud"]
    },
    {
        "canonical_id": "NASDAQ:ADBE",
        "symbol": "ADBE",
        "ticker": "ADBE",
        "name": "Adobe Inc.",
        "short_name": "Adobe",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Creative Software & Cloud",
        "isin": "US00724F1012",
        "aliases": ["Adobe", "ADBE", "Photoshop", "Creative Cloud"]
    },
    {
        "canonical_id": "NYSE:CRM",
        "symbol": "CRM",
        "ticker": "CRM",
        "name": "Salesforce Inc.",
        "short_name": "Salesforce",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "sector": "Technology",
        "industry": "Enterprise Cloud CRM",
        "isin": "US79466L3024",
        "aliases": ["Salesforce", "CRM", "Agentforce"]
    },
    {
        "canonical_id": "NASDAQ:QCOM",
        "symbol": "QCOM",
        "ticker": "QCOM",
        "name": "QUALCOMM Incorporated",
        "short_name": "Qualcomm",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "sector": "Semiconductors",
        "industry": "Wireless & Snapdragon Mobile Processors",
        "isin": "US7475251036",
        "aliases": ["Qualcomm", "QCOM", "Snapdragon"]
    }
]


# Indian Equities Universe (Top NSE / BSE Bluechips & Growth Equities)
INDIAN_EQUITIES_CATALOGUE: List[Dict[str, Any]] = [
    {
        "canonical_id": "NSE:RELIANCE",
        "symbol": "RELIANCE.NS",
        "ticker": "RELIANCE",
        "name": "Reliance Industries Limited",
        "short_name": "Reliance",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Energy & Conglomerate",
        "industry": "Refining, Telecom & Retail",
        "isin": "INE002A01018",
        "aliases": ["Reliance", "RIL", "Jio", "Mukesh Ambani"]
    },
    {
        "canonical_id": "NSE:TCS",
        "symbol": "TCS.NS",
        "ticker": "TCS",
        "name": "Tata Consultancy Services Limited",
        "short_name": "TCS",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Information Technology",
        "industry": "IT Consulting & Software",
        "isin": "INE467B01029",
        "aliases": ["TCS", "Tata Consultancy", "Tata IT"]
    },
    {
        "canonical_id": "NSE:TATAMOTORS",
        "symbol": "TATAMOTORS.NS",
        "ticker": "TATAMOTORS",
        "name": "Tata Motors Limited",
        "short_name": "Tata Motors",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Automobile",
        "industry": "Passenger & Commercial Vehicles / EV",
        "isin": "INE155A01022",
        "aliases": ["Tata Motors", "TATAMOTORS", "Tata EV", "JLR", "Tata"]
    },
    {
        "canonical_id": "NSE:TATASTEEL",
        "symbol": "TATASTEEL.NS",
        "ticker": "TATASTEEL",
        "name": "Tata Steel Limited",
        "short_name": "Tata Steel",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Metals & Mining",
        "industry": "Steel Manufacturing",
        "isin": "INE081A01020",
        "aliases": ["Tata Steel", "TATASTEEL", "Tata"]
    },
    {
        "canonical_id": "NSE:TATACONSUM",
        "symbol": "TATACONSUM.NS",
        "ticker": "TATACONSUM",
        "name": "Tata Consumer Products Limited",
        "short_name": "Tata Consumer",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "FMCG",
        "industry": "Packaged Foods & Beverages",
        "isin": "INE192A01025",
        "aliases": ["Tata Consumer", "Tata Salt", "Tata Tea", "TATACONSUM", "Tata"]
    },
    {
        "canonical_id": "NSE:TITAN",
        "symbol": "TITAN.NS",
        "ticker": "TITAN",
        "name": "Titan Company Limited",
        "short_name": "Titan",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Consumer Discretionary",
        "industry": "Jewellery & Watches (Tata Group)",
        "isin": "INE280A01028",
        "aliases": ["Titan", "Tanishq", "Tata Titan", "TITAN"]
    },
    {
        "canonical_id": "NSE:HDFCBANK",
        "symbol": "HDFCBANK.NS",
        "ticker": "HDFCBANK",
        "name": "HDFC Bank Limited",
        "short_name": "HDFC Bank",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Financial Services",
        "industry": "Private Sector Banking",
        "isin": "INE040A01034",
        "aliases": ["HDFC Bank", "HDFCBANK", "HDFC"]
    },
    {
        "canonical_id": "NSE:INFY",
        "symbol": "INFY.NS",
        "ticker": "INFY",
        "name": "Infosys Limited",
        "short_name": "Infosys",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Information Technology",
        "industry": "IT Consulting & Digital Services",
        "isin": "INE009A01021",
        "aliases": ["Infosys", "INFY", "Infy"]
    },
    {
        "canonical_id": "NSE:ICICIBANK",
        "symbol": "ICICIBANK.NS",
        "ticker": "ICICIBANK",
        "name": "ICICI Bank Limited",
        "short_name": "ICICI Bank",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Financial Services",
        "industry": "Private Sector Banking",
        "isin": "INE090A01021",
        "aliases": ["ICICI Bank", "ICICIBANK", "ICICI"]
    },
    {
        "canonical_id": "NSE:BHARTIARTL",
        "symbol": "BHARTIARTL.NS",
        "ticker": "BHARTIARTL",
        "name": "Bharti Airtel Limited",
        "short_name": "Bharti Airtel",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Telecommunication",
        "industry": "Wireless & 5G Telecom",
        "isin": "INE397D01024",
        "aliases": ["Airtel", "Bharti Airtel", "BHARTIARTL"]
    },
    {
        "canonical_id": "NSE:ITC",
        "symbol": "ITC.NS",
        "ticker": "ITC",
        "name": "ITC Limited",
        "short_name": "ITC",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "FMCG",
        "industry": "Diversified FMCG, Hotels & Paper",
        "isin": "INE154A01025",
        "aliases": ["ITC", "ITC Limited", "Aashirvaad"]
    },
    {
        "canonical_id": "NSE:SBIN",
        "symbol": "SBIN.NS",
        "ticker": "SBIN",
        "name": "State Bank of India",
        "short_name": "SBI",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Financial Services",
        "industry": "Public Sector Banking",
        "isin": "INE062A01020",
        "aliases": ["SBI", "State Bank of India", "SBIN"]
    },
    {
        "canonical_id": "NSE:LT",
        "symbol": "LT.NS",
        "ticker": "LT",
        "name": "Larsen & Toubro Limited",
        "short_name": "L&T",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Capital Goods",
        "industry": "Infrastructure, EPC & Defense",
        "isin": "INE018A01030",
        "aliases": ["Larsen & Toubro", "L&T", "LT"]
    },
    {
        "canonical_id": "NSE:ZOMATO",
        "symbol": "ZOMATO.NS",
        "ticker": "ZOMATO",
        "name": "Zomato Limited",
        "short_name": "Zomato",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Consumer Services",
        "industry": "Food Delivery & Quick Commerce (Blinkit)",
        "isin": "INE758T01015",
        "aliases": ["Zomato", "Blinkit", "ZOMATO"]
    }
]

# Global & Indian ETFs Universe
GLOBAL_ETF_CATALOGUE: List[Dict[str, Any]] = [
    {
        "canonical_id": "NYSEARCA:SPY",
        "symbol": "SPY",
        "ticker": "SPY",
        "name": "SPDR S&P 500 ETF Trust",
        "short_name": "S&P 500 ETF (SPY)",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "State Street Global Advisors",
        "benchmark": "S&P 500 Index",
        "figi": "BBG000BDTBL9",
        "isin": "US78462F1030",
        "aliases": ["S&P 500 ETF", "SPY", "SPDR S&P 500", "US Large Cap ETF"]
    },
    {
        "canonical_id": "NASDAQ:QQQ",
        "symbol": "QQQ",
        "ticker": "QQQ",
        "name": "Invesco QQQ Trust Series 1",
        "short_name": "Invesco QQQ (Nasdaq 100 ETF)",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "fund_house": "Invesco",
        "benchmark": "NASDAQ-100 Index",
        "figi": "BBG000BD7ZZ7",
        "isin": "US46090E1038",
        "aliases": ["QQQ", "Nasdaq 100 ETF", "Invesco QQQ", "US Tech ETF"]
    },
    {
        "canonical_id": "NYSEARCA:VOO",
        "symbol": "VOO",
        "ticker": "VOO",
        "name": "Vanguard S&P 500 ETF",
        "short_name": "Vanguard S&P 500",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "Vanguard Group",
        "benchmark": "S&P 500 Index",
        "figi": "BBG000K6B2B7",
        "isin": "US9229083632",
        "aliases": ["VOO", "Vanguard S&P 500", "Vanguard 500"]
    },
    {
        "canonical_id": "NYSEARCA:VTI",
        "symbol": "VTI",
        "ticker": "VTI",
        "name": "Vanguard Total Stock Market ETF",
        "short_name": "Vanguard Total Stock",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "Vanguard Group",
        "benchmark": "CRSP US Total Market Index",
        "figi": "BBG000BTHV29",
        "isin": "US9229087690",
        "aliases": ["VTI", "Total US Stock ETF", "Vanguard Total Market"]
    },
    {
        "canonical_id": "NYSEARCA:GLD",
        "symbol": "GLD",
        "ticker": "GLD",
        "name": "SPDR Gold Shares",
        "short_name": "SPDR Gold ETF",
        "asset_type": "ETF",
        "asset_class": "COMMODITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "State Street Global Advisors",
        "benchmark": "LBMA Gold Price PM",
        "figi": "BBG000BCV4S1",
        "isin": "US78463V1070",
        "aliases": ["GLD", "Gold ETF US", "SPDR Gold"]
    },
    {
        "canonical_id": "NSE:NIFTYBEES",
        "symbol": "NIFTYBEES.NS",
        "ticker": "NIFTYBEES",
        "name": "Nippon India ETF Nifty 50 BeES",
        "short_name": "Nifty BeES",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY 50 Total Returns Index",
        "isin": "INF204KB14I2",
        "aliases": ["NIFTYBEES", "Nifty BeES", "Nifty 50 ETF", "Nippon Nifty ETF"]
    },
    {
        "canonical_id": "NSE:GOLDBEES",
        "symbol": "GOLDBEES.NS",
        "ticker": "GOLDBEES",
        "name": "Nippon India ETF Gold BeES",
        "short_name": "Gold BeES",
        "asset_type": "ETF",
        "asset_class": "COMMODITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "Domestic Price of Physical Gold",
        "isin": "INF204KB17I5",
        "aliases": ["GOLDBEES", "Gold BeES", "Gold ETF India"]
    },
    {
        "canonical_id": "NSE:MON100",
        "symbol": "MON100.NS",
        "ticker": "MON100",
        "name": "Motilal Oswal Nasdaq 100 ETF",
        "short_name": "Motilal Nasdaq 100",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Motilal Oswal Asset Management",
        "benchmark": "NASDAQ-100 Index (INR)",
        "isin": "INF247L01AU4",
        "aliases": ["MON100", "Motilal Nasdaq", "Nasdaq 100 India ETF"]
    },
    {
        "canonical_id": "NSE:BANKBEES",
        "symbol": "BANKBEES.NS",
        "ticker": "BANKBEES",
        "name": "Nippon India ETF Nifty Bank BeES",
        "short_name": "Bank BeES",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY Bank Index",
        "isin": "INF204KB18I3",
        "aliases": ["BANKBEES", "Bank BeES", "Nifty Bank ETF"]
    },
    {
        "canonical_id": "NSE:ITBEES",
        "symbol": "ITBEES.NS",
        "ticker": "ITBEES",
        "name": "Nippon India ETF Nifty IT",
        "short_name": "Nifty IT BeES",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY IT Index",
        "isin": "INF204KB1U55",
        "aliases": ["ITBEES", "Nifty IT ETF", "IT BeES"]
    },
    # Indian Commodity & Precious Metals ETFs
    {
        "canonical_id": "NSE:SILVERBEES",
        "symbol": "SILVERBEES.NS",
        "ticker": "SILVERBEES",
        "name": "Nippon India ETF Silver BeES",
        "short_name": "Silver BeES",
        "asset_type": "ETF",
        "asset_class": "COMMODITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "Domestic Price of Physical Silver",
        "isin": "INF204KB10R9",
        "aliases": ["SILVERBEES", "Silver BeES", "Silver ETF", "Nippon Silver"]
    },
    {
        "canonical_id": "NSE:HDFCSILVER",
        "symbol": "HDFCSILVER.NS",
        "ticker": "HDFCSILVER",
        "name": "HDFC Silver ETF",
        "short_name": "HDFC Silver",
        "asset_type": "ETF",
        "asset_class": "COMMODITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "HDFC Mutual Fund",
        "benchmark": "Domestic Price of Silver",
        "isin": "INF179KC1CF9",
        "aliases": ["HDFCSILVER", "HDFC Silver ETF"]
    },
    # Indian Index & Sectoral ETFs
    {
        "canonical_id": "NSE:JUNIORBEES",
        "symbol": "JUNIORBEES.NS",
        "ticker": "JUNIORBEES",
        "name": "Nippon India ETF Nifty Next 50 Junior BeES",
        "short_name": "Junior BeES",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY Next 50 Index",
        "isin": "INF204KB14L6",
        "aliases": ["JUNIORBEES", "Junior BeES", "Nifty Next 50 ETF"]
    },
    {
        "canonical_id": "NSE:MID150BEES",
        "symbol": "MID150BEES.NS",
        "ticker": "MID150BEES",
        "name": "Nippon India ETF Nifty Midcap 150",
        "short_name": "Midcap 150 BeES",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY Midcap 150 Index",
        "isin": "INF204KB19S9",
        "aliases": ["MID150BEES", "Nifty Midcap ETF", "Midcap 150"]
    },
    {
        "canonical_id": "NSE:AUTOBEES",
        "symbol": "AUTOBEES.NS",
        "ticker": "AUTOBEES",
        "name": "Nippon India ETF Nifty Auto",
        "short_name": "Auto BeES",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY Auto Index",
        "isin": "INF204KB12W7",
        "aliases": ["AUTOBEES", "Nifty Auto ETF", "Auto BeES"]
    },
    {
        "canonical_id": "NSE:PHARMABEES",
        "symbol": "PHARMABEES.NS",
        "ticker": "PHARMABEES",
        "name": "Nippon India ETF Nifty Pharma",
        "short_name": "Pharma BeES",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY Pharma Index",
        "isin": "INF204KB18V6",
        "aliases": ["PHARMABEES", "Nifty Pharma ETF", "Pharma BeES"]
    },
    {
        "canonical_id": "NSE:CPSEETF",
        "symbol": "CPSEETF.NS",
        "ticker": "CPSEETF",
        "name": "CPSE ETF",
        "short_name": "CPSE ETF",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY CPSE Index",
        "isin": "INF204KB16I7",
        "aliases": ["CPSEETF", "CPSE ETF", "PSU ETF"]
    },
    {
        "canonical_id": "NSE:BHARAT22",
        "symbol": "BHARAT22.NS",
        "ticker": "BHARAT22",
        "name": "ICICI Prudential BHARAT 22 ETF",
        "short_name": "Bharat 22 ETF",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "ICICI Prudential Mutual Fund",
        "benchmark": "S&P BSE BHARAT 22 Index",
        "isin": "INF109K015Y2",
        "aliases": ["BHARAT22", "Bharat 22", "Bharat 22 ETF"]
    },
    # Indian Debt & Liquid ETFs
    {
        "canonical_id": "NSE:LIQUIDBEES",
        "symbol": "LIQUIDBEES.NS",
        "ticker": "LIQUIDBEES",
        "name": "Nippon India ETF Nifty 1D Rate Liquid BeES",
        "short_name": "Liquid BeES",
        "asset_type": "ETF",
        "asset_class": "DEBT",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY 1D Rate Index",
        "isin": "INF204KB17D6",
        "aliases": ["LIQUIDBEES", "Liquid BeES", "Liquid ETF"]
    },
    {
        "canonical_id": "NSE:LIQUIDCASE",
        "symbol": "LIQUIDCASE.NS",
        "ticker": "LIQUIDCASE",
        "name": "Zerodha Nifty 1D Rate Liquid ETF",
        "short_name": "Zerodha Liquid ETF",
        "asset_type": "ETF",
        "asset_class": "DEBT",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Zerodha Fund House",
        "benchmark": "NIFTY 1D Rate Index",
        "isin": "INF0QN601015",
        "aliases": ["LIQUIDCASE", "Zerodha Liquid", "Zerodha Liquid ETF"]
    },
    {
        "canonical_id": "NSE:GSEC10YR",
        "symbol": "GSEC10YR.NS",
        "ticker": "GSEC10YR",
        "name": "Nippon India ETF Nifty 8-13 yr G-Sec",
        "short_name": "G-Sec 10Y ETF",
        "asset_type": "ETF",
        "asset_class": "DEBT",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Nippon Life India Asset Management",
        "benchmark": "NIFTY 8-13 yr G-Sec Index",
        "isin": "INF204KB18V6",
        "aliases": ["GSEC10YR", "G-Sec ETF", "10 Year G-Sec"]
    },
    # Indian International ETFs
    {
        "canonical_id": "NSE:MAFANG",
        "symbol": "MAFANG.NS",
        "ticker": "MAFANG",
        "name": "Mirae Asset NYSE FANG+ ETF",
        "short_name": "Mirae FANG+ ETF",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Mirae Asset Mutual Fund",
        "benchmark": "NYSE FANG+ Index (INR)",
        "isin": "INF769K01HK2",
        "aliases": ["MAFANG", "Mirae FANG+", "FANG ETF India"]
    },
    {
        "canonical_id": "NSE:MOFSP500",
        "symbol": "MOFSP500.NS",
        "ticker": "MOFSP500",
        "name": "Motilal Oswal S&P 500 Index ETF",
        "short_name": "Motilal S&P 500",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "fund_house": "Motilal Oswal Asset Management",
        "benchmark": "S&P 500 Index (INR)",
        "isin": "INF247L01BK3",
        "aliases": ["MOFSP500", "Motilal S&P 500", "S&P 500 India ETF"]
    },
    # US Market Major ETFs
    {
        "canonical_id": "NYSEARCA:SPY",
        "symbol": "SPY",
        "ticker": "SPY",
        "name": "SPDR S&P 500 ETF Trust",
        "short_name": "SPDR S&P 500",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "State Street Global Advisors",
        "benchmark": "S&P 500 Index",
        "isin": "US78462F1030",
        "aliases": ["SPY", "SPDR S&P 500", "S&P 500 ETF"]
    },
    {
        "canonical_id": "NYSEARCA:IWM",
        "symbol": "IWM",
        "ticker": "IWM",
        "name": "iShares Russell 2000 ETF",
        "short_name": "iShares Russell 2000",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "BlackRock iShares",
        "benchmark": "Russell 2000 Index",
        "isin": "US4642876555",
        "aliases": ["IWM", "Russell 2000 ETF", "US Small Cap ETF"]
    },
    {
        "canonical_id": "NYSEARCA:DIA",
        "symbol": "DIA",
        "ticker": "DIA",
        "name": "SPDR Dow Jones Industrial Average ETF Trust",
        "short_name": "SPDR Dow Jones",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "State Street Global Advisors",
        "benchmark": "Dow Jones Industrial Average",
        "isin": "US78467X1090",
        "aliases": ["DIA", "Dow Jones ETF", "Dow ETF"]
    },
    {
        "canonical_id": "NASDAQ:BND",
        "symbol": "BND",
        "ticker": "BND",
        "name": "Vanguard Total Bond Market ETF",
        "short_name": "Vanguard Total Bond",
        "asset_type": "ETF",
        "asset_class": "DEBT",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "fund_house": "Vanguard Group",
        "benchmark": "Bloomberg U.S. Aggregate Float Adjusted Index",
        "isin": "US9219378356",
        "aliases": ["BND", "Total Bond ETF", "Vanguard Bond"]
    },
    {
        "canonical_id": "NASDAQ:TLT",
        "symbol": "TLT",
        "ticker": "TLT",
        "name": "iShares 20+ Year Treasury Bond ETF",
        "short_name": "iShares 20+ Year Treasury",
        "asset_type": "ETF",
        "asset_class": "DEBT",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "fund_house": "BlackRock iShares",
        "benchmark": "ICE U.S. Treasury 20+ Year Bond Index",
        "isin": "US4642874329",
        "aliases": ["TLT", "20 Year Treasury ETF", "US Treasuries"]
    },
    {
        "canonical_id": "NYSEARCA:SLV",
        "symbol": "SLV",
        "ticker": "SLV",
        "name": "iShares Silver Trust",
        "short_name": "iShares Silver",
        "asset_type": "ETF",
        "asset_class": "COMMODITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "BlackRock iShares",
        "benchmark": "LBMA Silver Price",
        "isin": "US46428Q1094",
        "aliases": ["SLV", "Silver ETF US", "iShares Silver"]
    },
    {
        "canonical_id": "NYSEARCA:XLK",
        "symbol": "XLK",
        "ticker": "XLK",
        "name": "Technology Select Sector SPDR Fund",
        "short_name": "Tech SPDR",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "State Street Global Advisors",
        "benchmark": "Technology Select Sector Index",
        "isin": "US81369Y8030",
        "aliases": ["XLK", "US Tech Sector ETF", "Tech SPDR"]
    },
    {
        "canonical_id": "NYSEARCA:XLF",
        "symbol": "XLF",
        "ticker": "XLF",
        "name": "Financial Select Sector SPDR Fund",
        "short_name": "Financial SPDR",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "State Street Global Advisors",
        "benchmark": "Financial Select Sector Index",
        "isin": "US81369Y6059",
        "aliases": ["XLF", "Financial Sector ETF", "US Bank ETF"]
    },
    {
        "canonical_id": "NYSEARCA:SOXX",
        "symbol": "SOXX",
        "ticker": "SOXX",
        "name": "iShares Semiconductor ETF",
        "short_name": "iShares Semiconductor",
        "asset_type": "ETF",
        "asset_class": "EQUITY",
        "market": "US",
        "country": "US",
        "exchange": "NYSEARCA",
        "exchange_mic": "ARCX",
        "currency": "USD",
        "fund_house": "BlackRock iShares",
        "benchmark": "NYSE Semiconductor Index",
        "isin": "US4642875235",
        "aliases": ["SOXX", "Semiconductor ETF", "Chippies"]
    }
]

# Indian REITs & InvITs Catalogue
INDIAN_REIT_INVIT_CATALOGUE: List[Dict[str, Any]] = [
    {
        "canonical_id": "NSE:EMBASSY",
        "symbol": "EMBASSY.NS",
        "ticker": "EMBASSY",
        "name": "Embassy Office Parks REIT",
        "short_name": "Embassy REIT",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Real Estate",
        "industry": "Commercial Office REIT",
        "isin": "INE041025011",
        "aliases": ["EMBASSY", "Embassy REIT", "Embassy Office Parks"]
    },
    {
        "canonical_id": "NSE:MINDSPACE",
        "symbol": "MINDSPACE.NS",
        "ticker": "MINDSPACE",
        "name": "Mindspace Business Parks REIT",
        "short_name": "Mindspace REIT",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Real Estate",
        "industry": "Commercial Office REIT",
        "isin": "INE0CCU25019",
        "aliases": ["MINDSPACE", "Mindspace REIT", "Mindspace Business Parks"]
    },
    {
        "canonical_id": "NSE:BIRET",
        "symbol": "BIRET.NS",
        "ticker": "BIRET",
        "name": "Brookfield India Real Estate Trust",
        "short_name": "Brookfield REIT",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Real Estate",
        "industry": "Commercial Office REIT",
        "isin": "INE0FDU25010",
        "aliases": ["BIRET", "Brookfield REIT", "Brookfield India"]
    },
    {
        "canonical_id": "NSE:NEXUS",
        "symbol": "NEXUS.NS",
        "ticker": "NEXUS",
        "name": "Nexus Select Trust REIT",
        "short_name": "Nexus Select REIT",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Real Estate",
        "industry": "Retail Shopping Mall REIT",
        "isin": "INE0OD725013",
        "aliases": ["NEXUS", "Nexus REIT", "Nexus Select Trust"]
    },
    {
        "canonical_id": "NSE:PGINVIT",
        "symbol": "PGINVIT.NS",
        "ticker": "PGINVIT",
        "name": "POWERGRID Infrastructure Investment Trust",
        "short_name": "PowerGrid InvIT",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Utilities",
        "industry": "Power Transmission Infrastructure",
        "isin": "INE0GGX23010",
        "aliases": ["PGINVIT", "Powergrid InvIT", "Powergrid Infrastructure"]
    },
    {
        "canonical_id": "NSE:IRBINVIT",
        "symbol": "IRBINVIT.NS",
        "ticker": "IRBINVIT",
        "name": "IRB InvIT Fund",
        "short_name": "IRB InvIT",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Infrastructure",
        "industry": "Toll Roads & Highways InvIT",
        "isin": "INE183W23014",
        "aliases": ["IRBINVIT", "IRB InvIT", "IRB Infrastructure"]
    },
    {
        "canonical_id": "NSE:INDIGRID",
        "symbol": "INDIGRID.NS",
        "ticker": "INDIGRID",
        "name": "India Grid Trust",
        "short_name": "IndiGrid InvIT",
        "asset_type": "STOCK",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "sector": "Utilities",
        "industry": "Power Transmission Infrastructure",
        "isin": "INE219X23014",
        "aliases": ["INDIGRID", "IndiGrid", "India Grid Trust"]
    }
]


# AMFI Direct Mutual Funds Catalogue
AMFI_MUTUAL_FUNDS_CATALOGUE: List[Dict[str, Any]] = [
    {
        "canonical_id": "AMFI:122639",
        "symbol": "PPFAS_FLEXI_CAP_DIR",
        "ticker": "122639",
        "name": "Parag Parikh Flexi Cap Fund Direct Plan - Growth",
        "short_name": "Parag Parikh Flexi Cap",
        "asset_type": "MUTUAL_FUND",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "AMFI",
        "exchange_mic": "AMFI",
        "currency": "INR",
        "fund_house": "PPFAS Mutual Fund",
        "fund_category": "Flexi Cap Fund",
        "benchmark": "NIFTY 500 TRI",
        "isin": "INF879O01027",
        "aliases": ["Parag Parikh", "PPFAS", "Parag Parikh Flexi Cap Fund", "PPFCF"]
    },
    {
        "canonical_id": "AMFI:120716",
        "symbol": "UTI_NIFTY_50_DIR",
        "ticker": "120716",
        "name": "UTI Nifty 50 Index Fund Direct Plan - Growth",
        "short_name": "UTI Nifty 50 Index Fund",
        "asset_type": "MUTUAL_FUND",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "AMFI",
        "exchange_mic": "AMFI",
        "currency": "INR",
        "fund_house": "UTI Mutual Fund",
        "fund_category": "Index Fund - Large Cap",
        "benchmark": "NIFTY 50 TRI",
        "isin": "INF789F01AX7",
        "aliases": ["UTI Nifty 50", "UTI Nifty Index Fund", "UTI Nifty 50 Index Fund Direct"]
    },
    {
        "canonical_id": "AMFI:118989",
        "symbol": "NIPPON_SMALL_CAP_DIR",
        "ticker": "118989",
        "name": "Nippon India Small Cap Fund Direct Plan - Growth",
        "short_name": "Nippon Small Cap Fund",
        "asset_type": "MUTUAL_FUND",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "AMFI",
        "exchange_mic": "AMFI",
        "currency": "INR",
        "fund_house": "Nippon India Mutual Fund",
        "fund_category": "Small Cap Fund",
        "benchmark": "NIFTY Smallcap 250 TRI",
        "isin": "INF204K01T27",
        "aliases": ["Nippon Small Cap", "Nippon India Small Cap Fund", "Reliance Small Cap"]
    },
    {
        "canonical_id": "AMFI:120503",
        "symbol": "HDFC_SHORT_DEBT_DIR",
        "ticker": "120503",
        "name": "HDFC Short Duration Debt Fund Direct Plan - Growth",
        "short_name": "HDFC Short Duration Fund",
        "asset_type": "MUTUAL_FUND",
        "asset_class": "DEBT",
        "market": "INDIA",
        "country": "IN",
        "exchange": "AMFI",
        "exchange_mic": "AMFI",
        "currency": "INR",
        "fund_house": "HDFC Mutual Fund",
        "fund_category": "Short Duration Debt Fund",
        "benchmark": "NIFTY Short Duration Debt Index",
        "isin": "INF179K01BE8",
        "aliases": ["HDFC Short Duration", "HDFC Debt Fund", "HDFC Short Term"]
    },
    {
        "canonical_id": "AMFI:120324",
        "symbol": "ICICI_LIQUID_DIR",
        "ticker": "120324",
        "name": "ICICI Prudential Liquid Fund Direct Plan - Growth",
        "short_name": "ICICI Liquid Fund",
        "asset_type": "MUTUAL_FUND",
        "asset_class": "DEBT",
        "market": "INDIA",
        "country": "IN",
        "exchange": "AMFI",
        "exchange_mic": "AMFI",
        "currency": "INR",
        "fund_house": "ICICI Prudential Mutual Fund",
        "fund_category": "Liquid Fund",
        "benchmark": "CRISIL Liquid Debt Index",
        "isin": "INF109K01586",
        "aliases": ["ICICI Liquid", "ICICI Prudential Liquid Fund", "ICICI Cash Reserve"]
    },
    {
        "canonical_id": "AMFI:119598",
        "symbol": "MIRAE_LARGE_CAP_DIR",
        "ticker": "119598",
        "name": "Mirae Asset Large Cap Fund Direct Plan - Growth",
        "short_name": "Mirae Asset Large Cap",
        "asset_type": "MUTUAL_FUND",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "AMFI",
        "exchange_mic": "AMFI",
        "currency": "INR",
        "fund_house": "Mirae Asset Mutual Fund",
        "fund_category": "Large Cap Fund",
        "benchmark": "NIFTY 100 TRI",
        "isin": "INF769K01DZ0",
        "aliases": ["Mirae Large Cap", "Mirae Asset Large Cap", "Mirae India Equity"]
    },
    {
        "canonical_id": "AMFI:120823",
        "symbol": "QUANT_ACTIVE_DIR",
        "ticker": "120823",
        "name": "Quant Active Fund Direct Plan - Growth",
        "short_name": "Quant Active Fund",
        "asset_type": "MUTUAL_FUND",
        "asset_class": "EQUITY",
        "market": "INDIA",
        "country": "IN",
        "exchange": "AMFI",
        "exchange_mic": "AMFI",
        "currency": "INR",
        "fund_house": "Quant Mutual Fund",
        "fund_category": "Multi Cap Fund",
        "benchmark": "NIFTY 500 MultiCap 50:25:25 TRI",
        "isin": "INF966L01AB9",
        "aliases": ["Quant Active", "Quant Active Fund", "Quant Mutual Fund"]
    }
]

# Major Global & Indian Benchmark Indices & Commodities
GLOBAL_INDICES_CATALOGUE: List[Dict[str, Any]] = [
    {
        "canonical_id": "INDEX:NIFTY50",
        "symbol": "^NSEI",
        "ticker": "NIFTY 50",
        "name": "NIFTY 50 Benchmark Index",
        "short_name": "NIFTY 50 Index",
        "asset_type": "INDEX",
        "asset_class": "INDEX",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "aliases": ["NIFTY 50", "NIFTY", "Nifty 50 Index", "NSE Nifty"]
    },
    {
        "canonical_id": "INDEX:SENSEX",
        "symbol": "^BSESN",
        "ticker": "SENSEX",
        "name": "BSE SENSEX 30 Index",
        "short_name": "SENSEX Index",
        "asset_type": "INDEX",
        "asset_class": "INDEX",
        "market": "INDIA",
        "country": "IN",
        "exchange": "BSE",
        "exchange_mic": "XBOM",
        "currency": "INR",
        "aliases": ["SENSEX", "BSE SENSEX", "Sensex 30"]
    },
    {
        "canonical_id": "INDEX:BANKNIFTY",
        "symbol": "^NSEBANK",
        "ticker": "BANKNIFTY",
        "name": "NIFTY Bank Sectoral Index",
        "short_name": "Bank Nifty",
        "asset_type": "INDEX",
        "asset_class": "INDEX",
        "market": "INDIA",
        "country": "IN",
        "exchange": "NSE",
        "exchange_mic": "XNSE",
        "currency": "INR",
        "aliases": ["BANKNIFTY", "Bank Nifty", "Nifty Bank"]
    },
    {
        "canonical_id": "INDEX:NDX",
        "symbol": "^IXIC",
        "ticker": "NASDAQ",
        "name": "NASDAQ Composite Index",
        "short_name": "NASDAQ Index",
        "asset_type": "INDEX",
        "asset_class": "INDEX",
        "market": "US",
        "country": "US",
        "exchange": "NASDAQ",
        "exchange_mic": "XNAS",
        "currency": "USD",
        "aliases": ["NASDAQ", "Nasdaq Composite", "NDX", "Nasdaq 100 Index"]
    },
    {
        "canonical_id": "INDEX:SPX",
        "symbol": "^GSPC",
        "ticker": "S&P 500",
        "name": "S&P 500 Benchmark Index",
        "short_name": "S&P 500 Index",
        "asset_type": "INDEX",
        "asset_class": "INDEX",
        "market": "US",
        "country": "US",
        "exchange": "NYSE",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "aliases": ["S&P 500", "SP500", "S&P 500 Index", "SPX"]
    },
    {
        "canonical_id": "INDEX:RUT",
        "symbol": "^RUT",
        "ticker": "^RUT",
        "name": "Russell 2000 Index",
        "short_name": "Russell 2000",
        "asset_type": "INDEX",
        "asset_class": "INDEX",
        "market": "US",
        "country": "US",
        "exchange": "INDEX",
        "exchange_mic": "XNYS",
        "currency": "USD",
        "aliases": ["RUSSELL 2000", "Russell 2000", "RUT", "^RUT", "Russell 2000 Index"]
    },
    {
        "canonical_id": "COMMODITY:GOLD",
        "symbol": "GC=F",
        "ticker": "GOLD",
        "name": "Gold Spot Bullion (10g / Troy Oz)",
        "short_name": "Gold Spot",
        "asset_type": "COMMODITY",
        "asset_class": "COMMODITY",
        "market": "GLOBAL",
        "country": "GLOBAL",
        "exchange": "MCX",
        "exchange_mic": "MCXX",
        "currency": "INR",
        "aliases": ["Gold", "Gold Bullion", "GOLD (10g)", "XAUUSD"]
    }
]

ALL_CANONICAL_SEEDS = (
    GLOBAL_EQUITIES_CATALOGUE +
    INDIAN_EQUITIES_CATALOGUE +
    INDIAN_REIT_INVIT_CATALOGUE +
    GLOBAL_ETF_CATALOGUE +
    AMFI_MUTUAL_FUNDS_CATALOGUE +
    GLOBAL_INDICES_CATALOGUE
)

class GlobalUniverseManager:
    """
    Manages the global multi-asset instrument master database,
    synchronization, server-side search, filtering, and live metadata.
    """

    @classmethod
    def seed_initial_universe(cls, db: Optional[Session] = None) -> int:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        count = 0
        seen_canonical = set()
        try:
            for item in ALL_CANONICAL_SEEDS:
                cid = item["canonical_id"]
                if cid in seen_canonical:
                    continue
                seen_canonical.add(cid)
                existing = db.query(Instrument).filter(Instrument.canonical_id == cid).first()
                if not existing:
                    inst = Instrument(
                        canonical_id=item["canonical_id"],
                        figi=item.get("figi"),
                        symbol=item["symbol"],
                        ticker=item["ticker"],
                        name=item["name"],
                        short_name=item.get("short_name", item["name"]),
                        asset_type=item["asset_type"],
                        asset_class=item["asset_class"],
                        market=item["market"],
                        country=item["country"],
                        exchange=item["exchange"],
                        exchange_mic=item.get("exchange_mic"),
                        currency=item["currency"],
                        provider="GlobalMarketProvider",
                        provider_symbol=item["symbol"],
                        status="ACTIVE",
                        is_active=True,
                        sector=item.get("sector"),
                        industry=item.get("industry"),
                        fund_house=item.get("fund_house"),
                        fund_category=item.get("fund_category"),
                        isin=item.get("isin"),
                        benchmark=item.get("benchmark"),
                        aliases=item.get("aliases", [])
                    )
                    db.add(inst)
                    count += 1
                else:
                    # Update aliases and attributes if modified
                    existing.aliases = item.get("aliases", existing.aliases or [])
                    existing.name = item["name"]
                    existing.short_name = item.get("short_name", existing.short_name)
                    existing.updated_at = datetime.now(timezone.utc)
            db.commit()
            logger.info(f"Seeded/Verified {len(ALL_CANONICAL_SEEDS)} canonical instruments into database (added {count} new).")
        except Exception as e:
            db.rollback()
            logger.error(f"Error seeding initial universe: {e}")
        finally:
            if close_db:
                db.close()
        return count

    @classmethod
    def get_coverage_stats(cls, db: Session) -> Dict[str, Any]:
        total = db.query(Instrument).filter(Instrument.is_active == True).count()
        if total == 0:
            cls.seed_initial_universe(db)
            total = db.query(Instrument).filter(Instrument.is_active == True).count()
        stocks = db.query(Instrument).filter(Instrument.is_active == True, Instrument.asset_type == "STOCK").count()
        etfs = db.query(Instrument).filter(Instrument.is_active == True, Instrument.asset_type == "ETF").count()
        mutual_funds = db.query(Instrument).filter(Instrument.is_active == True, Instrument.asset_type == "MUTUAL_FUND").count()
        indices = db.query(Instrument).filter(Instrument.is_active == True, Instrument.asset_type.in_(["INDEX", "COMMODITY"])).count()
        
        exchanges = [r[0] for r in db.query(Instrument.exchange).filter(Instrument.is_active == True).distinct().all()]
        countries = [r[0] for r in db.query(Instrument.country).filter(Instrument.is_active == True).distinct().all()]

        last_inst = db.query(Instrument).order_by(Instrument.updated_at.desc()).first()
        last_synced = last_inst.updated_at.isoformat() if last_inst and last_inst.updated_at else datetime.now(timezone.utc).isoformat()

        # Geographic distribution breakdown
        in_count = db.query(Instrument).filter(Instrument.is_active == True, Instrument.country == "IN").count()
        us_count = db.query(Instrument).filter(Instrument.is_active == True, Instrument.country == "US").count()
        gb_count = db.query(Instrument).filter(Instrument.is_active == True, Instrument.country == "GB").count()
        other_count = max(0, total - (in_count + us_count + gb_count))

        return {
            # Legacy snake_case keys for strict contract preservation
            "total_instruments": total,
            "stocks_count": stocks,
            "etfs_count": etfs,
            "mutual_funds_count": mutual_funds,
            "indices_count": indices,
            "exchanges_count": len(exchanges),
            "exchanges": exchanges,
            "countries_count": len(countries),
            "countries": countries,
            "last_synced_at": last_synced,
            # Enhanced camelCase & breakdown telemetry
            "instrumentCount": total,
            "stockCount": stocks,
            "etfCount": etfs,
            "mutualFundCount": mutual_funds,
            "indexCount": indices,
            "geographicCounts": {
                "IN": in_count,
                "US": us_count,
                "GB": gb_count,
                "OTHER": other_count
            },
            "inCount": in_count,
            "usCount": us_count,
            "gbCount": gb_count,
            "otherCount": other_count
        }

    @classmethod
    def search_instruments(
        cls, 
        db: Session,
        query: Optional[str] = None,
        asset_type: Optional[str] = None,
        market: Optional[str] = None,
        country: Optional[str] = None,
        exchange: Optional[str] = None,
        currency: Optional[str] = None,
        page: int = 1,
        limit: int = 25
    ) -> Dict[str, Any]:
        """
        Server-side multi-stage ranked search across global instruments with exact ticker/symbol/ISIN matching,
        prefix matching, alias matching, and bounded database pagination.
        """
        # Ensure base seeding exists
        if db.query(Instrument).count() == 0:
            cls.seed_initial_universe(db)

        # Enforce page and limit constraints
        safe_page = max(1, page)
        safe_limit = max(1, min(limit, 100))

        # Normalize query: uppercase, trim spaces, remove extra whitespace
        q_raw = (query or "").strip()
        q_clean = " ".join(re.split(r'\s+', q_raw)).upper() if q_raw else ""

        raw_type = (asset_type or "").strip().upper()
        # Normalize filter string aliases (e.g. STOCKS -> STOCK, MUTUAL_FUNDS -> MUTUAL_FUND)
        type_mapping = {
            "STOCKS": "STOCK",
            "STOCK": "STOCK",
            "ETFS": "ETF",
            "ETF": "ETF",
            "MUTUAL_FUNDS": "MUTUAL_FUND",
            "MUTUAL_FUND": "MUTUAL_FUND",
            "FUNDS": "MUTUAL_FUND",
            "INDICES": "INDEX",
            "INDEX": "INDEX",
            "COMMODITIES": "COMMODITY",
            "COMMODITY": "COMMODITY",
        }
        asset_type_filter = type_mapping.get(raw_type) if raw_type and raw_type != "ALL" else None

        query_builder = db.query(Instrument).filter(Instrument.is_active == True)

        if asset_type_filter:
            if asset_type_filter == "COMMODITY":
                query_builder = query_builder.filter(Instrument.asset_type.in_(["COMMODITY", "GOLD"]))
            else:
                query_builder = query_builder.filter(Instrument.asset_type == asset_type_filter)

        if market and market.upper() != "ALL":
            query_builder = query_builder.filter(Instrument.market == market.upper())
        if country and country.upper() != "ALL":
            query_builder = query_builder.filter(Instrument.country == country.upper())
        if exchange and exchange.upper() != "ALL":
            query_builder = query_builder.filter(Instrument.exchange == exchange.upper())
        if currency and currency.upper() != "ALL":
            query_builder = query_builder.filter(Instrument.currency == currency.upper())

        # If no query string, apply default sorting (Index -> ETF -> Stock -> MF -> Commodity)
        if not q_clean:
            def default_rank(item: Instrument):
                type_prio = {"INDEX": 1, "ETF": 2, "STOCK": 3, "MUTUAL_FUND": 4, "COMMODITY": 5}
                return (type_prio.get(item.asset_type, 9), item.name)

            all_candidates = query_builder.all()
            sorted_candidates = sorted(all_candidates, key=default_rank)
            total = len(sorted_candidates)
            start_idx = (safe_page - 1) * safe_limit
            end_idx = start_idx + safe_limit
            page_items = sorted_candidates[start_idx:end_idx]

            return {
                "items": page_items,
                "page": safe_page,
                "limit": safe_limit,
                "total": total,
                "has_next": end_idx < total
            }

        # Multi-stage Candidate Pre-Filtering across all search fields:
        # ticker, symbol, name, shortName, isin, sector, industry, fundHouse, aliases
        tokens = [t for t in q_clean.split() if len(t) > 1]
        
        filter_clauses = [
            Instrument.ticker.ilike(f"%{q_clean}%"),
            Instrument.symbol.ilike(f"%{q_clean}%"),
            Instrument.name.ilike(f"%{q_clean}%"),
            Instrument.short_name.ilike(f"%{q_clean}%"),
            Instrument.isin.ilike(f"{q_clean}%"),
            Instrument.scheme_code.ilike(f"{q_clean}%"),
            Instrument.sector.ilike(f"%{q_clean}%"),
            Instrument.industry.ilike(f"%{q_clean}%"),
            Instrument.fund_house.ilike(f"%{q_clean}%"),
            Instrument.fund_category.ilike(f"%{q_clean}%"),
            cast(Instrument.aliases, String).ilike(f"%{q_clean}%")
        ]

        if len(tokens) > 1:
            filter_clauses.append(and_(*[
                or_(
                    Instrument.name.ilike(f"%{t}%"),
                    Instrument.ticker.ilike(f"%{t}%"),
                    Instrument.symbol.ilike(f"%{t}%"),
                    Instrument.fund_house.ilike(f"%{t}%"),
                    Instrument.fund_category.ilike(f"%{t}%"),
                    Instrument.sector.ilike(f"%{t}%"),
                    Instrument.industry.ilike(f"%{t}%"),
                    cast(Instrument.aliases, String).ilike(f"%{t}%")
                ) for t in tokens
            ]))

        candidates = query_builder.filter(or_(*filter_clauses)).all()

        # Multi-stage ranking algorithm
        def score_candidate(inst: Instrument) -> int:
            ticker_up = (inst.ticker or "").upper().strip()
            symbol_up = (inst.symbol or "").upper().strip()
            base_sym_up = symbol_up.split(".")[0] if "." in symbol_up else symbol_up
            name_up = (inst.name or "").upper().strip()
            short_up = (inst.short_name or "").upper().strip()
            isin_up = (inst.isin or "").upper().strip()
            scheme_up = (inst.scheme_code or "").upper().strip()
            sector_up = (inst.sector or "").upper().strip()
            industry_up = (inst.industry or "").upper().strip()
            fund_house_up = (inst.fund_house or "").upper().strip()
            fund_cat_up = (inst.fund_category or "").upper().strip()
            aliases_up = [str(a).upper().strip() for a in (inst.aliases or [])]

            # Priority 1: Exact ticker match (e.g. QQQ == QQQ, AAPL == AAPL, MON100 == MON100, RELIANCE == RELIANCE)
            if ticker_up == q_clean:
                return 100000

            # Priority 2: Exact symbol match (e.g. MON100.NS == MON100.NS or base MON100 == MON100, exact ISIN, exact scheme code)
            if symbol_up == q_clean or base_sym_up == q_clean:
                return 80000
            if isin_up == q_clean or (scheme_up and scheme_up == q_clean):
                return 75000

            # Priority 3: Starts-with match (e.g. RELIANCE -> RELIANCEPOWER, etc.)
            if ticker_up.startswith(q_clean):
                return 65000 - min(len(ticker_up) - len(q_clean), 1000)
            if symbol_up.startswith(q_clean) or base_sym_up.startswith(q_clean):
                return 60000 - min(len(symbol_up) - len(q_clean), 1000)
            if name_up.startswith(q_clean) or short_up.startswith(q_clean):
                return 55000 - min(len(name_up) - len(q_clean), 2000)

            # Priority 4: Contains match (e.g. HDFC Flexi Cap, Parag Parikh Flexi Cap)
            if q_clean in ticker_up:
                return 45000
            if q_clean in symbol_up:
                return 40000
            if q_clean in name_up or q_clean in short_up:
                return 35000 - min(len(name_up) - len(q_clean), 2000)
            if tokens and all(t in name_up for t in tokens):
                return 30000 - min(len(name_up) - len(q_clean), 2000)

            # Priority 5: Alias match
            if any(q_clean == a for a in aliases_up):
                return 25000
            if any(a.startswith(q_clean) for a in aliases_up):
                return 22000
            if any(q_clean in a for a in aliases_up):
                return 20000

            # Priority 6: Sector / category match
            if q_clean in fund_house_up or q_clean in fund_cat_up or q_clean in sector_up or q_clean in industry_up:
                return 10000
            if tokens and all(t in (fund_house_up + " " + fund_cat_up + " " + sector_up + " " + industry_up) for t in tokens):
                return 7500
            if tokens and any(t in (fund_house_up + " " + fund_cat_up + " " + sector_up + " " + industry_up) for t in tokens):
                return 5000

            return 0

        scored_candidates = []
        for inst in candidates:
            score = score_candidate(inst)
            if score > 0:
                scored_candidates.append((score, inst))

        # Sort only filtered candidates: score descending, shorter names first, then alphabetical
        scored_candidates.sort(key=lambda x: (-x[0], len(x[1].name), x[1].name))
        ranked_instruments = [item for _, item in scored_candidates]

        total = len(ranked_instruments)
        start_idx = (safe_page - 1) * safe_limit
        end_idx = start_idx + safe_limit
        page_items = ranked_instruments[start_idx:end_idx]

        return {
            "items": page_items,
            "page": safe_page,
            "limit": safe_limit,
            "total": total,
            "has_next": end_idx < total
        }

# Backward compatibility singleton instances
global_universe_manager = GlobalUniverseManager()
global_equities_provider = global_universe_manager
CORE_GLOBAL_UNIVERSE = GLOBAL_EQUITIES_CATALOGUE
