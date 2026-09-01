# SmartVest Production-Grade Market Data Architecture & Compliance

## 1. Executive Summary & Advisory Mandate

**SmartVest is an ADVISORY PLATFORM.**

- It is **NOT** a broker.
- It does **NOT** execute trades.
- It does **NOT** place orders.
- It does **NOT** request broker credentials or authentication tokens.
- It does **NOT** custody or handle client funds.

All market intelligence and quotes are provided strictly for educational and decision-support purposes. Execution takes place independently by the user through licensed, SEBI-registered discount brokers (Groww, Zerodha, INDmoney, Upstox) or AMFI-registered mutual fund houses.

---

## 2. Provider Capability & Entitlement Matrix

SmartVest enforces strict entitlement-aware data ingestion. The platform never claims delayed or published data as "real-time" or "LIVE".

| Provider | Market / Asset Class | Realtime | Delayed (15m) | Historical (OHLC) | NAV Published | Entitlement Verified | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NSE Authorized Feed** (Configured via `INDIA_MARKET_DATA_PROVIDER`) | Indian Equities & Indices (NSE/BSE) | Yes (when subscription is verified) | Yes | Yes | No | Runtime checked via `INDIA_MARKET_DATA_API_KEY` | Configurable |
| **Yahoo Finance Feed** (Fallback) | Global Indices (`^NSEI`, `^BSESN`, `^IXIC`, `^GSPC`), Equities, ETFs (`NIFTYBEES.NS`, `GOLDBEES.NS`), Commodities (`GC=F`) | US Markets / Crypto | NSE / BSE (15m Delayed Fallback) | Yes (1D to 5Y) | No | Optional / Public API | Active (Delayed) |
| **AMFI / MF API Feed** | Indian Direct Mutual Funds (UTI Nifty 50, Parag Parikh Flexi Cap, ICICI Liquid, HDFC Debt, Nippon Small Cap) | No | No | Yes (NAV Daily Series) | Yes (`LATEST NAV` with NAV date) | Open / Official AMFI | Active |
| **US Market Provider** (Configured via `US_MARKET_DATA_PROVIDER`) | US Equities & Indices (NASDAQ / NYSE) | Yes (when API key is verified) | Yes | Yes | No | Runtime checked via `US_MARKET_DATA_API_KEY` | Configurable / Active |

---

## 3. Data Freshness Classifications

Every data point rendered across the SmartVest API and Frontend UI carries an explicit freshness classification:

1. `REALTIME`: Authentic live tick or quote during open exchange hours with direct feed entitlement.
2. `DELAYED`: Standard 15-minute delayed exchange feed (e.g. NSE/BSE fallback delayed quotes).
3. `LATEST_AVAILABLE`: Most recent official published value (e.g. Mutual Fund Daily NAV, labeled `LATEST NAV` with exact `navDate`). Never labeled "LIVE".
4. `END_OF_DAY`: Official market closing price after market settlement.
5. `HISTORICAL`: Verified historical daily/weekly candle observations for charting.
6. `MODEL_ASSUMPTION`: Long-term institutional asset-class return and risk assumptions (e.g. 13.5% equity CAGR for 10-year roadmaps).
7. `STALE`: Cached data served when provider is temporarily unreachable, clearly tagged with the amber `STALE` badge.
8. `UNAVAILABLE`: Explicit indicator when an instrument has no configured provider or data cannot be retrieved. **Never substitutes fake/mock values.**

---

## 4. Indian Real-Time Market Data Compliance & Policy

### 4.1 Strict Regulatory Compliance
- **No Web Scraping:** SmartVest strictly prohibits scraping NSE/BSE web pages or using undocumented exchange endpoints.
- **Authorized Vendors Only:** Real-time Indian equity and index market data is sourced exclusively through authorized market data vendors holding valid NSE/BSE data redistribution licenses (e.g., TrueData, GlobalDataFeeds, or direct broker market data APIs with market data subscription).
- **Fallback Classification:** In the absence of a verified authorized vendor subscription key (`INDIA_MARKET_DATA_API_KEY`), Indian market data automatically defaults to the standard 15-minute delayed feed and is strictly labeled as `DELAYED`. It is **never** represented as real-time.

### 4.2 Display & Caching Terms
| Parameter | Policy |
| :--- | :--- |
| **Exchange** | National Stock Exchange of India (NSE) / Bombay Stock Exchange (BSE) |
| **Product** | Level 1 (L1) Top of Book / Best Bid-Offer & Snapshot Feed |
| **Subscription Type** | Non-Professional Educational / Decision-Support Display |
| **Realtime Entitlement** | Dependent on active vendor API key validation |
| **Display Rights** | Internal user interface display only; not for public rebroadcast |
| **Caching Restrictions** | Ephemeral server-side caching strictly capped at 30 seconds for quote snapshots to prevent downstream redistribution |
| **Redistribution Restrictions** | Third-party retransmission, automated scraping, and commercial syndication are strictly prohibited |

---

## 5. Market Hours Engine

The Market Hours engine (`backend/app/services/market_data/market_hours.py`) evaluates real exchange schedules:

- **Indian Equities (NSE / BSE):**
  - Timezone: IST (UTC+5:30)
  - Pre-market: 09:00 AM – 09:15 AM IST
  - Regular Trading: 09:15 AM – 03:30 PM IST (Mon–Fri)
  - Exchange Holidays: Monitored and marked as `CLOSED (EXCHANGE_HOLIDAY)`.
- **US Equities (NASDAQ / NYSE):**
  - Timezone: Eastern Time (ET)
  - Pre-market: 04:00 AM – 09:30 AM ET
  - Regular Trading: 09:30 AM – 04:00 PM ET (07:00 PM – 01:30 AM IST)

---

## 6. Server-Side Caching & Rate-Limit Protections

To protect upstream providers and guarantee sub-50ms API response times, the thread-safe `MarketDataCache` enforces distinct TTL policies:

- **Live / Delayed Quotes:** 20 to 30 seconds TTL.
- **Historical Observations & Candles:** 5 minutes (300s) TTL.
- **Mutual Fund Published NAVs:** 1 hour (3600s) TTL.
- **Instrument Fundamentals:** 1 hour (3600s) TTL.
- **Global Overview Strip:** 20 seconds TTL.

---

## 7. Environment Configuration Variables

Backend configuration settings in `.env`:

```env
# Mode: REAL (Production default) or MOCK (Automated testing only)
MARKET_DATA_MODE=REAL

# General Provider
MARKET_DATA_PROVIDER=yfinance
MARKET_DATA_API_KEY=

# India Markets (Set to authorized vendor e.g. truedata, globaldatafeeds)
INDIA_MARKET_DATA_PROVIDER=yfinance
INDIA_MARKET_DATA_API_KEY=

# US Markets (e.g. alpaca, polygon, finnhub, yfinance)
US_MARKET_DATA_PROVIDER=yfinance
US_MARKET_DATA_API_KEY=

# Mutual Funds (AMFI)
MF_DATA_PROVIDER=amfi
MF_DATA_API_KEY=

# Cache Settings
MARKET_DATA_CACHE_TTL_SECONDS=30
```

---

## 8. Fiduciary & Compliance Disclaimers

1. **Past Performance Disclaimer:** "Past performance does not guarantee future results. Projections are educational simulations."
2. **Mutual Fund Direct Plan Notice:** "All recommended mutual funds are Direct-Growth plans to eliminate compounding commission drag."
3. **Fiduciary Role:** "SmartVest operates under fiduciary principles, providing conflict-free asset allocation advice without receiving affiliate commissions from financial product issuers."
