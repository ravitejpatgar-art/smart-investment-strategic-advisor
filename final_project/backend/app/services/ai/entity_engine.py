"""
SmartVest Conversational Entity Engine
======================================
Extracts financial instruments, markets, assets, amounts, time horizons,
metrics, and resolves conversational memory & pronouns (it, its, them, these,
first one, second one, both, safer one, etc.) with strict index vs ETF separation.
"""

import re
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

class AssetClass(str, Enum):
    EQUITIES = "EQUITIES"
    INDEX = "INDEX"
    ETFS = "ETFS"
    MUTUAL_FUNDS = "MUTUAL_FUNDS"
    COMMODITIES = "COMMODITIES"
    BONDS = "BONDS"
    GOLD = "GOLD"
    REAL_ESTATE = "REAL_ESTATE"
    CRYPTO = "CRYPTO"
    CASH = "CASH"

class MarketRegion(str, Enum):
    US = "US"
    INDIA = "INDIA"
    GLOBAL = "GLOBAL"
    UNKNOWN = "UNKNOWN"

@dataclass
class ResolvedEntity:
    raw_text: str
    canonical_name: str
    symbol: Optional[str]
    asset_class: AssetClass
    region: MarketRegion
    metadata: Dict[str, Any] = field(default_factory=dict)

# ============================================================================
# 1. KNOWN EQUITIES (US & INDIA)
# ============================================================================

KNOWN_EQUITIES: Dict[str, Dict[str, Any]] = {
    # US Stocks
    "NVDA": {"name": "NVIDIA Corporation", "symbol": "NVDA", "region": MarketRegion.US, "sector": "Semiconductors & AI Compute", "pe": 45.2, "growth": "Ultra-High", "role": "AI Hardware & Datacenter Infrastructure Monopoly", "benchmark": "S&P 500 / Nasdaq-100", "why": "Essential full-stack hardware/software monopoly powering global generative AI and enterprise datacenter acceleration.", "risk_level": "High"},
    "NVIDIA": {"name": "NVIDIA Corporation", "symbol": "NVDA", "region": MarketRegion.US, "sector": "Semiconductors & AI Compute", "pe": 45.2, "growth": "Ultra-High", "role": "AI Hardware & Datacenter Infrastructure Monopoly", "benchmark": "S&P 500 / Nasdaq-100", "why": "Essential full-stack hardware/software monopoly powering global generative AI and enterprise datacenter acceleration.", "risk_level": "High"},
    "MSFT": {"name": "Microsoft Corporation", "symbol": "MSFT", "region": MarketRegion.US, "sector": "Enterprise Software & Cloud", "pe": 34.1, "growth": "Consistent", "role": "Enterprise Cloud & AI Software Compounder", "benchmark": "S&P 500", "why": "Unrivaled enterprise software lock-in, Azure cloud growth, and strong balance sheet with $80B+ annual free cash flow.", "risk_level": "Moderate"},
    "MICROSOFT": {"name": "Microsoft Corporation", "symbol": "MSFT", "region": MarketRegion.US, "sector": "Enterprise Software & Cloud", "pe": 34.1, "growth": "Consistent", "role": "Enterprise Cloud & AI Software Compounder", "benchmark": "S&P 500", "why": "Unrivaled enterprise software lock-in, Azure cloud growth, and strong balance sheet with $80B+ annual free cash flow.", "risk_level": "Moderate"},
    "AAPL": {"name": "Apple Inc.", "symbol": "AAPL", "region": MarketRegion.US, "sector": "Consumer Electronics & Services", "pe": 31.8, "growth": "Moderate", "role": "Consumer Tech Ecosystem & Cash Machine", "benchmark": "S&P 500", "why": "2+ billion active devices, unprecedented customer brand loyalty, and high-margin recurring Services revenue.", "risk_level": "Moderate"},
    "APPLE": {"name": "Apple Inc.", "symbol": "AAPL", "region": MarketRegion.US, "sector": "Consumer Electronics & Services", "pe": 31.8, "growth": "Moderate", "role": "Consumer Tech Ecosystem & Cash Machine", "benchmark": "S&P 500", "why": "2+ billion active devices, unprecedented customer brand loyalty, and high-margin recurring Services revenue.", "risk_level": "Moderate"},
    "GOOGL": {"name": "Alphabet Inc.", "symbol": "GOOGL", "region": MarketRegion.US, "sector": "Digital Advertising & Cloud", "pe": 24.5, "growth": "Consistent", "role": "Global Search Moat & Cloud Growth", "benchmark": "S&P 500", "why": "Dominant global search monopoly, YouTube monetization, and attractive ~24.5x P/E valuation relative to megacap peers.", "risk_level": "Moderate"},
    "ALPHABET": {"name": "Alphabet Inc.", "symbol": "GOOGL", "region": MarketRegion.US, "sector": "Digital Advertising & Cloud", "pe": 24.5, "growth": "Consistent", "role": "Global Search Moat & Cloud Growth", "benchmark": "S&P 500", "why": "Dominant global search monopoly, YouTube monetization, and attractive ~24.5x P/E valuation relative to megacap peers.", "risk_level": "Moderate"},
    "GOOGLE": {"name": "Alphabet Inc.", "symbol": "GOOGL", "region": MarketRegion.US, "sector": "Digital Advertising & Cloud", "pe": 24.5, "growth": "Consistent", "role": "Global Search Moat & Cloud Growth", "benchmark": "S&P 500", "why": "Dominant global search monopoly, YouTube monetization, and attractive ~24.5x P/E valuation relative to megacap peers.", "risk_level": "Moderate"},
    "AMZN": {"name": "Amazon.com, Inc.", "symbol": "AMZN", "region": MarketRegion.US, "sector": "E-Commerce & Cloud (AWS)", "pe": 39.0, "growth": "High", "role": "Cloud Infrastructure & Global E-Commerce", "benchmark": "S&P 500", "why": "AWS cloud profit engine, dominant North American retail logistics, and rapidly expanding digital advertising platform.", "risk_level": "Moderate-High"},
    "AMAZON": {"name": "Amazon.com, Inc.", "symbol": "AMZN", "region": MarketRegion.US, "sector": "E-Commerce & Cloud (AWS)", "pe": 39.0, "growth": "High", "role": "Cloud Infrastructure & Global E-Commerce", "benchmark": "S&P 500", "why": "AWS cloud profit engine, dominant North American retail logistics, and rapidly expanding digital advertising platform.", "risk_level": "Moderate-High"},
    "META": {"name": "Meta Platforms, Inc.", "symbol": "META", "region": MarketRegion.US, "sector": "Social Media & AI", "pe": 26.2, "growth": "High", "role": "Social Graph Monopolist & Open AI Leader", "benchmark": "S&P 500", "why": "Over 3.2 billion daily active users across Instagram, WhatsApp, and Facebook with unmatched direct-response advertising ROI.", "risk_level": "Moderate-High"},
    "TSLA": {"name": "Tesla, Inc.", "symbol": "TSLA", "region": MarketRegion.US, "sector": "EVs & Clean Energy", "pe": 68.0, "growth": "Volatile", "role": "Electric Mobility & Autonomous AI", "benchmark": "S&P 500", "why": "Leading global electric vehicle brand, industry-leading charging network, and expanding energy storage business.", "risk_level": "High"},
    "TESLA": {"name": "Tesla, Inc.", "symbol": "TSLA", "region": MarketRegion.US, "sector": "EVs & Clean Energy", "pe": 68.0, "growth": "Volatile", "role": "Electric Mobility & Autonomous AI", "benchmark": "S&P 500", "why": "Leading global electric vehicle brand, industry-leading charging network, and expanding energy storage business.", "risk_level": "High"},
    "V": {"name": "Visa Inc.", "symbol": "V", "region": MarketRegion.US, "sector": "Financial Payments Network", "pe": 29.5, "growth": "Steady", "role": "Global Payments Duopoly & Quality Tollbooth", "benchmark": "S&P 500", "why": "Asset-light payment network with 50%+ operating margins, direct beneficiary of global cashless transaction trends.", "risk_level": "Low-Moderate"},
    "VISA": {"name": "Visa Inc.", "symbol": "V", "region": MarketRegion.US, "sector": "Financial Payments Network", "pe": 29.5, "growth": "Steady", "role": "Global Payments Duopoly & Quality Tollbooth", "benchmark": "S&P 500", "why": "Asset-light payment network with 50%+ operating margins, direct beneficiary of global cashless transaction trends.", "risk_level": "Low-Moderate"},
    "AMD": {"name": "Advanced Micro Devices, Inc.", "symbol": "AMD", "region": MarketRegion.US, "sector": "Semiconductors", "pe": 48.0, "growth": "High", "role": "Datacenter CPU & AI GPU Challenger", "benchmark": "Nasdaq-100", "why": "Strong EPYC server market share gains and expanding MI300 AI accelerator adoption.", "risk_level": "High"},
    
    # Indian Stocks
    "RELIANCE": {"name": "Reliance Industries Ltd", "symbol": "RELIANCE.NS", "region": MarketRegion.INDIA, "sector": "Conglomerate (Retail, Jio, Energy)", "pe": 27.5, "growth": "Consistent", "role": "India Consumption, Telecom & Energy Giant", "benchmark": "Nifty 50", "why": "Unmatched domestic market leadership across telecom (Jio 450M+ subscribers), retail (18,000+ stores), and green energy transition.", "risk_level": "Moderate"},
    "TCS": {"name": "Tata Consultancy Services Ltd", "symbol": "TCS.NS", "region": MarketRegion.INDIA, "sector": "IT Services & Consulting", "pe": 30.2, "growth": "Steady", "role": "High-ROCE Global Tech Cash Cow", "benchmark": "Nifty 50", "why": "Pristine debt-free balance sheet, industry-leading 24%+ operating margins, and consistent 80%+ dividend/buyback payout ratio.", "risk_level": "Low-Moderate"},
    "HDFCBANK": {"name": "HDFC Bank Ltd", "symbol": "HDFCBANK.NS", "region": MarketRegion.INDIA, "sector": "Private Banking & Financials", "pe": 18.5, "growth": "Consistent", "role": "Leading Private Banking Institution", "benchmark": "Nifty 50", "why": "Premier private bank with superior asset quality, strong low-cost CASA deposit franchise, and post-merger synergy growth.", "risk_level": "Low-Moderate"},
    "HDFC": {"name": "HDFC Bank Ltd", "symbol": "HDFCBANK.NS", "region": MarketRegion.INDIA, "sector": "Private Banking & Financials", "pe": 18.5, "growth": "Consistent", "role": "Leading Private Banking Institution", "benchmark": "Nifty 50", "why": "Premier private bank with superior asset quality, strong low-cost CASA deposit franchise, and post-merger synergy growth.", "risk_level": "Low-Moderate"},
    "INFY": {"name": "Infosys Ltd", "symbol": "INFY.NS", "region": MarketRegion.INDIA, "sector": "IT Services", "pe": 26.8, "growth": "Steady", "role": "Global Enterprise Digital Transformation", "benchmark": "Nifty 50", "why": "Strong client relationships across Fortune 500 companies, deep capabilities in cloud and enterprise AI implementations.", "risk_level": "Moderate"},
    "INFOSYS": {"name": "Infosys Ltd", "symbol": "INFY.NS", "region": MarketRegion.INDIA, "sector": "IT Services", "pe": 26.8, "growth": "Steady", "role": "Global Enterprise Digital Transformation", "benchmark": "Nifty 50", "why": "Strong client relationships across Fortune 500 companies, deep capabilities in cloud and enterprise AI implementations.", "risk_level": "Moderate"},
    "TATAMOTORS": {"name": "Tata Motors Ltd", "symbol": "TATAMOTORS.NS", "region": MarketRegion.INDIA, "sector": "Automotive & Electric Mobility", "pe": 16.0, "growth": "Cyclical Growth", "role": "India & Global Automotive Leader", "benchmark": "Nifty 50", "why": "Dramatic turnaround in JLR luxury profitability, dominant 70%+ market share in Indian passenger EVs, and rapid debt reduction.", "risk_level": "Moderate-High"},
    "TATA MOTORS": {"name": "Tata Motors Ltd", "symbol": "TATAMOTORS.NS", "region": MarketRegion.INDIA, "sector": "Automotive & Electric Mobility", "pe": 16.0, "growth": "Cyclical Growth", "role": "India & Global Automotive Leader", "benchmark": "Nifty 50", "why": "Dramatic turnaround in JLR luxury profitability, dominant 70%+ market share in Indian passenger EVs, and rapid debt reduction.", "risk_level": "Moderate-High"},
    "ICICIBANK": {"name": "ICICI Bank Ltd", "symbol": "ICICIBANK.NS", "region": MarketRegion.INDIA, "sector": "Private Banking", "pe": 17.8, "growth": "Consistent", "role": "High-Return Private Banking Leader", "benchmark": "Nifty 50", "why": "Industry-leading Return on Assets (RoA ~2.3%), robust retail and SME loan underwriting, and strong digital adoption.", "risk_level": "Low-Moderate"},
    "ITC": {"name": "ITC Ltd", "symbol": "ITC.NS", "region": MarketRegion.INDIA, "sector": "FMCG, Cigarettes, Hotels & Agri", "pe": 25.4, "growth": "Steady", "role": "FMCG Giant & High Dividend Yield Compounder", "benchmark": "Nifty 50", "why": "Monopoly cigarette cash engine funding rapid expansion into non-cigarette FMCG, hotels demerger, and steady 3%+ dividend yield.", "risk_level": "Low"},
    "SBIN": {"name": "State Bank of India", "symbol": "SBIN.NS", "region": MarketRegion.INDIA, "sector": "Public Sector Banking", "pe": 10.5, "growth": "Moderate", "role": "India's Largest Public Lender", "benchmark": "Nifty 50", "why": "India's largest bank with unparalleled branch reach, low-cost deposit dominance, and historically low non-performing assets (NPAs).", "risk_level": "Low-Moderate"},
    "SBI": {"name": "State Bank of India", "symbol": "SBIN.NS", "region": MarketRegion.INDIA, "sector": "Public Sector Banking", "pe": 10.5, "growth": "Moderate", "role": "India's Largest Public Lender", "benchmark": "Nifty 50", "why": "India's largest bank with unparalleled branch reach, low-cost deposit dominance, and historically low non-performing assets (NPAs).", "risk_level": "Low-Moderate"},
    "LT": {"name": "Larsen & Toubro Ltd", "symbol": "LT.NS", "region": MarketRegion.INDIA, "sector": "Infrastructure & Capital Goods", "pe": 34.0, "growth": "High", "role": "India Capex & Infrastructure Proxy", "benchmark": "Nifty 50", "why": "Record order book exceeding ₹4.5 lakh crore spanning domestic infrastructure, defense manufacturing, and Middle East mega-projects.", "risk_level": "Moderate"},
}

# ============================================================================
# 2. KNOWN ETFS, INDICES & MUTUAL FUNDS (STRICT INDEPENDENT RESOLUTION)
# ============================================================================

KNOWN_INDICES: Dict[str, Dict[str, Any]] = {
    "NIFTY 50": {"name": "NIFTY 50 Index", "symbol": "^NSEI", "region": MarketRegion.INDIA, "asset_class": AssetClass.INDEX, "sector": "Indian Benchmark Index (Top 50 Companies)", "pe": 22.8, "role": "Indian Large-Cap Benchmark Index"},
    "NIFTY": {"name": "NIFTY 50 Index", "symbol": "^NSEI", "region": MarketRegion.INDIA, "asset_class": AssetClass.INDEX, "sector": "Indian Benchmark Index (Top 50 Companies)", "pe": 22.8, "role": "Indian Large-Cap Benchmark Index"},
    "SENSEX": {"name": "BSE SENSEX Index", "symbol": "^BSESN", "region": MarketRegion.INDIA, "asset_class": AssetClass.INDEX, "sector": "BSE 30 Benchmark Index", "pe": 23.4, "role": "BSE Benchmark Index"},
    "NASDAQ 100": {"name": "NASDAQ-100 Index", "symbol": "^NDX", "region": MarketRegion.US, "asset_class": AssetClass.INDEX, "sector": "US Tech Benchmark Index (Top 100 Non-Financials)", "pe": 32.5, "role": "US Tech Benchmark Index"},
    "NASDAQ-100": {"name": "NASDAQ-100 Index", "symbol": "^NDX", "region": MarketRegion.US, "asset_class": AssetClass.INDEX, "sector": "US Tech Benchmark Index (Top 100 Non-Financials)", "pe": 32.5, "role": "US Tech Benchmark Index"},
    "NASDAQ": {"name": "NASDAQ Composite Index", "symbol": "^IXIC", "region": MarketRegion.US, "asset_class": AssetClass.INDEX, "sector": "US Tech & Growth Index", "pe": 33.1, "role": "US Tech Benchmark Index"},
    "S&P 500": {"name": "S&P 500 Index", "symbol": "^GSPC", "region": MarketRegion.US, "asset_class": AssetClass.INDEX, "sector": "US Large-Cap Benchmark", "pe": 26.5, "role": "US Core Equity Benchmark Index"},
}

KNOWN_ETFS: Dict[str, Dict[str, Any]] = {
    "MON100": {
        "name": "Motilal Oswal Nasdaq 100 ETF",
        "symbol": "MON100.NS",
        "region": MarketRegion.US,
        "asset_class": AssetClass.ETFS,
        "sector": "US Mega-Cap Technology & Growth ETF",
        "pe": 32.5,
        "expense_ratio": "0.58%",
        "underlying": "Nasdaq-100 Index (USD)",
        "role": "Global Tech Satellite Allocation & Currency Hedge",
        "growth": "High",
        "top_holdings": "Apple, Microsoft, NVIDIA, Amazon, Alphabet, Meta, Broadcom",
        "why": "Enables Indian investors to buy top 100 US technology powerhouses in INR on the NSE/BSE, providing geographic diversification and an indirect hedge against Rupee depreciation.",
        "risk_level": "High"
    },
    "NIFTYBEES": {
        "name": "Nippon India ETF Nifty BeES",
        "symbol": "NIFTYBEES.NS",
        "region": MarketRegion.INDIA,
        "asset_class": AssetClass.ETFS,
        "sector": "Indian Large-Cap Equity ETF (Top 50)",
        "pe": 22.8,
        "expense_ratio": "0.04%",
        "underlying": "Nifty 50 Index",
        "role": "Core Domestic Equity Foundation",
        "growth": "Consistent",
        "top_holdings": "HDFC Bank, Reliance, ICICI Bank, Infosys, ITC, TCS, L&T",
        "why": "Ultra-low-cost (0.04% TER) passive vehicle holding the top 50 bluechip corporations driving India's multi-trillion dollar economy.",
        "risk_level": "Moderate"
    },
    "GOLDBEES": {
        "name": "Nippon India ETF Gold BeES",
        "symbol": "GOLDBEES.NS",
        "region": MarketRegion.INDIA,
        "asset_class": AssetClass.ETFS,
        "sector": "Precious Metals / Gold ETF",
        "pe": "N/A",
        "expense_ratio": "0.79%",
        "underlying": "Physical Gold (99.5% Purity)",
        "role": "Inflation & Geopolitical Downside Hedge",
        "growth": "Capital Preservation",
        "top_holdings": "Physical Gold Bullion in Bank Vaults",
        "why": "Provides liquid, dematerialized gold exposure with zero making charges or storage risks, acting as an uncorrelated safe haven during equity drawdowns.",
        "risk_level": "Low-Moderate"
    },
    "JUNIORBEES": {
        "name": "Nippon India ETF Nifty Next 50 Junior BeES",
        "symbol": "JUNIORBEES.NS",
        "region": MarketRegion.INDIA,
        "asset_class": AssetClass.ETFS,
        "sector": "Indian Large/Mid-Cap Growth ETF (Rank 51-100)",
        "pe": 26.4,
        "expense_ratio": "0.15%",
        "underlying": "Nifty Next 50 Index",
        "role": "High-Alpha Large/Mid-Cap Expansion",
        "growth": "High",
        "top_holdings": "Trent, Bharat Electronics, Siemens, HAL, Tata Power, DLF",
        "why": "Invests in high-growth companies positioned to become the next generation of Nifty 50 constituents.",
        "risk_level": "Moderate-High"
    },
    "BANKBEES": {
        "name": "Nippon India ETF Nifty Bank BeES",
        "symbol": "BANKBEES.NS",
        "region": MarketRegion.INDIA,
        "asset_class": AssetClass.ETFS,
        "sector": "Indian Banking & Credit ETF",
        "pe": 16.2,
        "expense_ratio": "0.19%",
        "underlying": "Nifty Bank Index",
        "role": "Financial Sector Growth Proxy",
        "growth": "Consistent",
        "top_holdings": "HDFC Bank, ICICI Bank, SBI, Kotak Bank, Axis Bank",
        "why": "Concentrated exposure to India's credit cycle and dominant private and public financial institutions.",
        "risk_level": "Moderate-High"
    },
    "SILVERBEES": {
        "name": "Nippon India ETF Silver BeES",
        "symbol": "SILVERBEES.NS",
        "region": MarketRegion.INDIA,
        "asset_class": AssetClass.ETFS,
        "sector": "Precious & Industrial Metals ETF",
        "pe": "N/A",
        "expense_ratio": "0.52%",
        "underlying": "Physical Silver (99.9% Purity)",
        "role": "Industrial Transition & Commodity Hedge",
        "growth": "Cyclical",
        "top_holdings": "Physical Silver Bullion",
        "why": "Dual play on monetary store of value and industrial demand from solar PV, EVs, and electronics.",
        "risk_level": "Moderate-High"
    },
    "ITBEES": {
        "name": "Nippon India ETF Nifty IT BeES",
        "symbol": "ITBEES.NS",
        "region": MarketRegion.INDIA,
        "asset_class": AssetClass.ETFS,
        "sector": "Indian Information Technology ETF",
        "pe": 29.5,
        "expense_ratio": "0.22%",
        "underlying": "Nifty IT Index",
        "role": "Indian IT Export & USD Revenue Play",
        "growth": "Steady",
        "top_holdings": "TCS, Infosys, HCL Tech, Wipro, Tech Mahindra",
        "why": "High-ROCE, cash-generative export companies benefiting from global cloud migration and INR depreciation.",
        "risk_level": "Moderate"
    }
}

KNOWN_MUTUAL_FUNDS: Dict[str, Dict[str, Any]] = {
    "PPFCF": {
        "name": "Parag Parikh Flexi Cap Fund Direct-Growth",
        "symbol": "PPFCF",
        "region": MarketRegion.INDIA,
        "asset_class": AssetClass.MUTUAL_FUNDS,
        "sector": "Multi-Cap + International Equity Mutual Fund",
        "pe": 24.1,
        "expense_ratio": "0.62%",
        "underlying": "Indian Equities (65%+) & Global Tech (Alphabet, Microsoft)",
        "role": "Active Multi-Cap Core Wealth Compounder",
        "growth": "Consistent Long-Term Alpha",
        "top_holdings": "HDFC Bank, Bajaj Holdings, ITC, Power Grid, Alphabet, Microsoft",
        "why": "Disciplined value investing philosophy with conservative cash management and international diversification.",
        "risk_level": "Moderate"
    },
    "UTI_NIFTY50": {
        "name": "UTI Nifty 50 Index Fund Direct-Growth",
        "symbol": "UTINIFTY",
        "region": MarketRegion.INDIA,
        "asset_class": AssetClass.MUTUAL_FUNDS,
        "sector": "Indian Large-Cap Index Mutual Fund",
        "pe": 22.8,
        "expense_ratio": "0.18%",
        "underlying": "Nifty 50 Total Return Index",
        "role": "Passive Core Large-Cap Foundation",
        "growth": "Consistent",
        "top_holdings": "HDFC Bank, Reliance Industries, ICICI Bank, Infosys",
        "why": "Minimal tracking error and ultra-low expense ratio for capturing India's long-term GDP compounding.",
        "risk_level": "Moderate"
    },
    "ICICI_LIQUID": {
        "name": "ICICI Prudential Liquid Fund Direct-Growth",
        "symbol": "ICICILIQ",
        "region": MarketRegion.INDIA,
        "asset_class": AssetClass.MUTUAL_FUNDS,
        "sector": "Money Market / Overnight Debt Mutual Fund",
        "pe": "N/A",
        "expense_ratio": "0.20%",
        "underlying": "Short-Term T-Bills and High-Grade Commercial Paper",
        "role": "Emergency Liquidity & Tactical Capital Buffer",
        "growth": "Stable (~6.8% Yield)",
        "top_holdings": "Sovereign Treasury Bills, AAA Corporate Debt",
        "why": "High liquidity with instant redemption (up to ₹50,000) and zero equity correlation for emergency fund reserves.",
        "risk_level": "Low"
    }
}

KNOWN_COMMODITIES_AND_BONDS: Dict[str, Dict[str, Any]] = {
    "GOLD": {"name": "Gold (10g / MCX / Spot)", "symbol": "GOLD", "region": MarketRegion.GLOBAL, "asset_class": AssetClass.GOLD, "sector": "Precious Metals Commodity", "pe": "N/A", "role": "Safe Haven Store of Value", "risk_level": "Low-Moderate"},
    "SILVER": {"name": "Silver (1kg / MCX / Spot)", "symbol": "SILVER", "region": MarketRegion.GLOBAL, "asset_class": AssetClass.COMMODITIES, "sector": "Precious & Industrial Metals", "pe": "N/A", "role": "Industrial & Monetary Store of Value", "risk_level": "Moderate"},
    "SGB": {"name": "Sovereign Gold Bond (RBI)", "symbol": "SGB", "region": MarketRegion.INDIA, "asset_class": AssetClass.BONDS, "sector": "Government Sovereign Gold Security", "pe": "N/A", "role": "2.5% Annual Interest + Gold Capital Gains Exemption", "risk_level": "Low-Moderate"},
    "SOVEREIGN GOLD BOND": {"name": "Sovereign Gold Bond (RBI)", "symbol": "SGB", "region": MarketRegion.INDIA, "asset_class": AssetClass.BONDS, "sector": "Government Sovereign Gold Security", "pe": "N/A", "role": "2.5% Annual Interest + Gold Capital Gains Exemption", "risk_level": "Low-Moderate"},
    "TREASURY": {"name": "US 10-Year Treasury Bond", "symbol": "^TNX", "region": MarketRegion.US, "asset_class": AssetClass.BONDS, "sector": "Sovereign Fixed Income", "pe": "N/A", "role": "Risk-Free US Dollar Benchmark Yield", "risk_level": "Low"},
    "GSEC": {"name": "Government of India 10-Year G-Sec", "symbol": "IN10Y", "region": MarketRegion.INDIA, "asset_class": AssetClass.BONDS, "sector": "Sovereign Fixed Income", "pe": "N/A", "role": "Risk-Free Indian Sovereign Benchmark Yield", "risk_level": "Low"}
}

# Fuzzy Alias Map for Spelling Errors & Common Names
FUZZY_ENTITY_MAP: Dict[str, str] = {
    "nvdia": "NVDA",
    "nvidia": "NVDA",
    "nvda": "NVDA",
    "microsft": "MSFT",
    "microsoft": "MSFT",
    "msft": "MSFT",
    "tesala": "TSLA",
    "tesla": "TSLA",
    "tsla": "TSLA",
    "relaince": "RELIANCE",
    "reliance": "RELIANCE",
    "appl": "AAPL",
    "apple": "AAPL",
    "aapl": "AAPL",
    "gogl": "GOOGL",
    "google": "GOOGL",
    "alphabet": "GOOGL",
    "googl": "GOOGL",
    "amzn": "AMZN",
    "amazon": "AMZN",
    "hdfc": "HDFCBANK",
    "hdfcbank": "HDFCBANK",
    "infy": "INFY",
    "infosys": "INFY",
    "tatamotors": "TATAMOTORS",
    "tata motors": "TATAMOTORS",
    "icicibank": "ICICIBANK",
    "icici": "ICICIBANK",
    "itc": "ITC",
    "sbi": "SBIN",
    "sbin": "SBIN",
    "lt": "LT",
    "l&t": "LT",
    "larsen": "LT",
    "nasdaq": "NASDAQ",
    "nasdaq 100": "NASDAQ 100",
    "nasdaq-100": "NASDAQ 100",
    "nifty": "NIFTY",
    "nifty 50": "NIFTY 50",
    "nifty50": "NIFTY 50",
    "sensex": "SENSEX",
    "mon100": "MON100",
    "niftybees": "NIFTYBEES",
    "goldbees": "GOLDBEES",
    "juniorbees": "JUNIORBEES",
    "bankbees": "BANKBEES",
    "silverbees": "SILVERBEES",
    "itbees": "ITBEES",
    "ppfcf": "PPFCF",
    "utinifty": "UTI_NIFTY50",
    "sgb": "SGB",
    "gold": "GOLD",
    "silver": "SILVER",
    "tcs": "TCS",
    "meta": "META",
    "visa": "V",
    "v": "V",
    "amd": "AMD"
}

# ============================================================================
# 3. CONVERSATIONAL MEMORY CLASS
# ============================================================================

class ConversationalMemory:
    """Stores active dialogue context, entity stack, and recent comparison history."""
    def __init__(self):
        self.last_instrument: Optional[str] = None
        self.last_entity_symbol: Optional[str] = None
        self.last_market: MarketRegion = MarketRegion.UNKNOWN
        self.last_asset_class: AssetClass = AssetClass.EQUITIES
        self.last_goal: Optional[str] = None
        self.last_candidates: List[str] = []
        self.last_intent: Optional[str] = None
        self.entity_stack: List[ResolvedEntity] = []
        self.comparison_entities: List[ResolvedEntity] = []

    def push_entity(self, entity: ResolvedEntity):
        self.last_instrument = entity.canonical_name
        self.last_entity_symbol = entity.symbol
        self.last_asset_class = entity.asset_class
        if entity.region != MarketRegion.UNKNOWN:
            self.last_market = entity.region
        # Avoid duplicate top of stack
        if not self.entity_stack or self.entity_stack[-1].canonical_name != entity.canonical_name:
            self.entity_stack.append(entity)
        if len(self.entity_stack) > 10:
            self.entity_stack.pop(0)
        if len(self.entity_stack) >= 2:
            self.comparison_entities = [self.entity_stack[-2], self.entity_stack[-1]]

    def update_from_turn(
        self,
        entities: List[ResolvedEntity],
        market: MarketRegion,
        intent: str,
        candidates: Optional[List[str]] = None
    ):
        if entities:
            for ent in entities:
                self.push_entity(ent)
            if len(entities) >= 2:
                self.comparison_entities = list(entities[:2])
            elif len(self.entity_stack) >= 2:
                self.comparison_entities = [self.entity_stack[-2], self.entity_stack[-1]]
        if market != MarketRegion.UNKNOWN:
            self.last_market = market
        self.last_intent = intent
        if candidates:
            self.last_candidates = candidates

# ============================================================================
# 4. RESOLUTION UTILITIES
# ============================================================================

def extract_market_region(query: str) -> MarketRegion:
    q_low = query.lower()
    if any(k in q_low for k in ["us stock", "us equities", "american stock", "us market", "wall street", "nasdaq", "nyse", "us companies", "from america", "in us"]):
        return MarketRegion.US
    if any(k in q_low for k in ["indian stock", "india stock", "nse", "bse", "dalal street", "nifty", "sensex", "in india", "indian equities", "indian companies"]):
        return MarketRegion.INDIA
    if any(k in q_low for k in ["global", "international", "worldwide"]):
        return MarketRegion.GLOBAL
    return MarketRegion.UNKNOWN

def extract_asset_class(query: str) -> AssetClass:
    q_low = query.lower()
    if any(k in q_low for k in ["etf", "etfs", "exchange traded fund", "mon100", "niftybees", "goldbees"]):
        return AssetClass.ETFS
    if any(k in q_low for k in ["mutual fund", "mf", "mfs", "index fund", "ppfcf", "uti nifty"]):
        return AssetClass.MUTUAL_FUNDS
    if any(k in q_low for k in ["gold", "sgb", "sovereign gold", "yellow metal"]):
        return AssetClass.GOLD
    if any(k in q_low for k in ["bond", "debt", "fixed income", "g-sec", "treasury", "fd", "fixed deposit"]):
        return AssetClass.BONDS
    if any(k in q_low for k in ["reit", "real estate", "property"]):
        return AssetClass.REAL_ESTATE
    if any(k in q_low for k in ["crypto", "bitcoin", "btc", "ethereum"]):
        return AssetClass.CRYPTO
    return AssetClass.EQUITIES

def extract_numerical_entities(query: str) -> Dict[str, Any]:
    res = {
        "amounts": [],
        "percentages": [],
        "years": None
    }
    
    # Extract Rupee amounts (e.g. ₹10 lakh, ₹1 crore, 20k, 20000, 1.5 cr)
    cr_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b', query, re.I)
    if cr_match:
        val = float(cr_match.group(1)) * 10000000.0
        res["amounts"].append(val)

    lakh_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b', query, re.I)
    if lakh_match:
        val = float(lakh_match.group(1)) * 100000.0
        res["amounts"].append(val)

    k_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand)\b', query, re.I)
    if k_match:
        val = float(k_match.group(1)) * 1000.0
        res["amounts"].append(val)

    num_match = re.findall(r'(?:₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)', query, re.I)
    for m in num_match:
        cleaned = float(m.replace(',', ''))
        if cleaned not in res["amounts"]:
            res["amounts"].append(cleaned)

    # Years
    year_match = re.search(r'(\d+)\s*(?:year|years|yr|yrs)\b', query, re.I)
    if year_match:
        res["years"] = int(year_match.group(1))

    # Percentages
    pct_match = re.findall(r'(\d+(?:\.\d+)?)\s*%', query)
    for p in pct_match:
        res["percentages"].append(float(p))

    return res

def resolve_entities(query: str, memory: Optional[ConversationalMemory] = None) -> List[ResolvedEntity]:
    """
    Extracts all explicit or pronoun-referenced financial entities with strict Index vs ETF separation.
    Handles fuzzy typos (e.g. nvdia -> NVDA, microsft -> MSFT, tesala -> TSLA).
    """
    q_upper = query.upper()
    q_low = query.lower()
    found_entities: List[ResolvedEntity] = []

    # 1. Check fuzzy aliases first
    words = re.findall(r'\b[a-zA-Z0-9\.\-\&]+\b', q_low)
    for w in words:
        if w in FUZZY_ENTITY_MAP:
            canon_key = FUZZY_ENTITY_MAP[w]
            # Match against indices, ETFs, Equities, Commodities
            if canon_key in KNOWN_INDICES and not any(e.canonical_name == KNOWN_INDICES[canon_key]["name"] for e in found_entities):
                meta = KNOWN_INDICES[canon_key]
                found_entities.append(ResolvedEntity(
                    raw_text=w, canonical_name=meta["name"], symbol=meta["symbol"],
                    asset_class=meta["asset_class"], region=meta["region"], metadata=meta
                ))
            elif canon_key in KNOWN_ETFS and not any(e.canonical_name == KNOWN_ETFS[canon_key]["name"] for e in found_entities):
                meta = KNOWN_ETFS[canon_key]
                found_entities.append(ResolvedEntity(
                    raw_text=w, canonical_name=meta["name"], symbol=meta["symbol"],
                    asset_class=meta["asset_class"], region=meta["region"], metadata=meta
                ))
            elif canon_key in KNOWN_MUTUAL_FUNDS and not any(e.canonical_name == KNOWN_MUTUAL_FUNDS[canon_key]["name"] for e in found_entities):
                meta = KNOWN_MUTUAL_FUNDS[canon_key]
                found_entities.append(ResolvedEntity(
                    raw_text=w, canonical_name=meta["name"], symbol=meta["symbol"],
                    asset_class=meta["asset_class"], region=meta["region"], metadata=meta
                ))
            elif canon_key in KNOWN_COMMODITIES_AND_BONDS and not any(e.canonical_name == KNOWN_COMMODITIES_AND_BONDS[canon_key]["name"] for e in found_entities):
                meta = KNOWN_COMMODITIES_AND_BONDS[canon_key]
                found_entities.append(ResolvedEntity(
                    raw_text=w, canonical_name=meta["name"], symbol=meta["symbol"],
                    asset_class=meta["asset_class"], region=meta["region"], metadata=meta
                ))
            elif canon_key in KNOWN_EQUITIES and not any(e.canonical_name == KNOWN_EQUITIES[canon_key]["name"] for e in found_entities):
                meta = KNOWN_EQUITIES[canon_key]
                found_entities.append(ResolvedEntity(
                    raw_text=w, canonical_name=meta["name"], symbol=meta["symbol"],
                    asset_class=AssetClass.EQUITIES, region=meta["region"], metadata=meta
                ))

    # Multi-word matches (e.g. "Tata Motors", "Nasdaq 100", "Nifty 50", "Sovereign Gold Bond")
    for key, meta in {**KNOWN_INDICES, **KNOWN_ETFS, **KNOWN_MUTUAL_FUNDS, **KNOWN_COMMODITIES_AND_BONDS, **KNOWN_EQUITIES}.items():
        if " " in key and key in q_upper and not any(e.canonical_name == meta["name"] for e in found_entities):
            found_entities.append(
                ResolvedEntity(
                    raw_text=key,
                    canonical_name=meta["name"],
                    symbol=meta.get("symbol"),
                    asset_class=meta.get("asset_class", AssetClass.EQUITIES),
                    region=meta.get("region", MarketRegion.UNKNOWN),
                    metadata=meta
                )
            )

    # 2. Pronoun & Anaphora Resolution ("it", "its", "them", "these", "both", "first one", "second one", "safer one")
    if not found_entities and memory:
        # Check relative reference to comparison items
        if ("first" in q_low or "first one" in q_low) and memory.comparison_entities:
            first_ent = memory.comparison_entities[0]
            found_entities.append(ResolvedEntity(
                raw_text="the first one",
                canonical_name=first_ent.canonical_name,
                symbol=first_ent.symbol,
                asset_class=first_ent.asset_class,
                region=first_ent.region,
                metadata=first_ent.metadata
            ))
        elif ("second" in q_low or "second one" in q_low) and len(memory.comparison_entities) >= 2:
            second_ent = memory.comparison_entities[1]
            found_entities.append(ResolvedEntity(
                raw_text="the second one",
                canonical_name=second_ent.canonical_name,
                symbol=second_ent.symbol,
                asset_class=second_ent.asset_class,
                region=second_ent.region,
                metadata=second_ent.metadata
            ))
        elif ("safer" in q_low or "which is safer" in q_low or "safer one" in q_low) and len(memory.comparison_entities) >= 2:
            # Pick conservative fit / lower risk
            e1, e2 = memory.comparison_entities[0], memory.comparison_entities[1]
            found_entities.extend([e1, e2])
        elif ("both" in q_low or "all of them" in q_low) and memory.comparison_entities:
            found_entities.extend(memory.comparison_entities)
        elif memory.last_instrument:
            has_pronoun = bool(re.search(r'\b(it|its|this|that|them|these|this stock|that stock|the stock|this company|the company|the fund|the etf|it risky|how much should i invest in it)\b', q_low))
            if has_pronoun or "why" in q_low or "should i invest" in q_low or "how much" in q_low or "is it" in q_low:
                inst = memory.last_instrument
                # Lookup in entity universe
                meta = {}
                sym = memory.last_entity_symbol
                region = memory.last_market
                ac = memory.last_asset_class
                for d in [KNOWN_EQUITIES, KNOWN_ETFS, KNOWN_INDICES, KNOWN_MUTUAL_FUNDS, KNOWN_COMMODITIES_AND_BONDS]:
                    for k, v in d.items():
                        if v["name"].lower() == inst.lower() or k.lower() == inst.lower():
                            sym = v.get("symbol", sym)
                            region = v.get("region", region)
                            ac = v.get("asset_class", ac)
                            meta = v
                            break
                    if meta:
                        break
                found_entities.append(ResolvedEntity(
                    raw_text="it (contextual reference)",
                    canonical_name=inst,
                    symbol=sym,
                    asset_class=ac,
                    region=region,
                    metadata=meta
                ))

    return found_entities
