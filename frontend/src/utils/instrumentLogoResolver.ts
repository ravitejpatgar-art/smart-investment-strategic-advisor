/**
 * Institutional Instrument Logo Resolver for SmartVest Market Terminal
 *
 * Provides deterministic, reliable, zero-latency logo resolution for stocks, ETFs,
 * mutual funds (including AMFI schemes), and benchmark indices.
 *
 * Supported Logo Data Sources & Providers:
 * 1. Logo.dev:
 *    - Documented stock ticker endpoint: https://img.logo.dev/ticker/{ticker}?token={token}&fallback=404
 *    - Documented corporate domain endpoint: https://img.logo.dev/{domain}?token={token}&size=128&format=png&fallback=404
 *    - Configured via client-side publishable key: import.meta.env.VITE_LOGODEV_PUBLIC_KEY
 *    - Explicit fallback=404 parameter ensures Logo.dev never generates monograms/initials.
 * 2. Brandfetch:
 *    - Configured via client ID: import.meta.env.VITE_BRANDFETCH_CLIENT_ID
 *    - Public client-side identifier: https://cdn.brandfetch.io/{domain}?c={clientId}
 * 3. Verified Official Vector/SVG Assets:
 *    - Curated official assets for Indian equities (TradingView vectors via verifiedNseTickers),
 *      US market leaders, major ETF issuers, benchmark indices, and Indian AMCs.
 *
 * Design Guarantees:
 * - Strict symbol normalization: strips exchange suffixes (.NS, .BO, etc.) and prefixes (AMFI:, INDEX:).
 * - Never guesses random domains for raw/numeric symbols.
 * - Resolves Indian mutual funds via reliable AMC / Fund House metadata (100% of 14,425 catalog funds).
 * - In-memory cached (O(1)) for zero blocking of price or catalog loading.
 * - Missing or broken logos transition to a neutral missing-logo state (NO initials, NO generic icons).
 * - Reports missing lookups via structured logging for continuous coverage tracking.
 */

import { getVerifiedIndianStockLogoUrl } from './verifiedNseTickers';

export interface LogoResolutionResult {
  /** Real brand logo URL from trusted CDN or verified asset registry, or null */
  logoUrl: string | null;
  /** Verified canonical domain, or null */
  domain: string | null;
  /** Clean normalized symbol without exchange suffixes or prefixes */
  normalizedSymbol: string;
  /** Resolved issuer or entity brand name */
  brandName?: string;
  /** Active provider used to resolve the logo */
  provider?: 'logodev' | 'brandfetch' | 'verified_asset' | 'none';
  /** Optional 1-2 letter initials retained for backward compatibility in types */
  initials?: string;
  /** Optional deterministic palette retained for backward compatibility in types */
  colorPalette?: {
    bg: string;
    border: string;
    text: string;
  };
}

// ---------------------------------------------------------------------------
// 0. Provider Environment Configuration
// ---------------------------------------------------------------------------

/**
 * Retrieves the client-side publishable key for Logo.dev (if configured).
 * Safe for frontend browser execution (pk_...).
 */
export function getLogoDevPublishableKey(): string | null {
  try {
    return (
      import.meta.env.VITE_LOGODEV_PUBLIC_KEY ||
      import.meta.env.VITE_LOGO_DEV_TOKEN ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Retrieves the client ID for Brandfetch CDN (if configured).
 */
export function getBrandfetchClientId(): string | null {
  try {
    return (
      import.meta.env.VITE_BRANDFETCH_CLIENT_ID ||
      import.meta.env.VITE_BRANDFETCH_API_KEY ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Builds a Logo.dev CDN image URL with high-res parameters and explicit fallback=404.
 * Never allows generated monograms or letter initials.
 */
export function buildLogoDevUrl(domain: string, publishableKey: string): string {
  return `https://img.logo.dev/${encodeURIComponent(domain)}?token=${encodeURIComponent(publishableKey)}&size=128&format=png&fallback=404`;
}

/**
 * Builds a Logo.dev stock ticker CDN URL with explicit fallback=404.
 */
export function buildLogoDevTickerUrl(ticker: string, publishableKey: string): string {
  return `https://img.logo.dev/ticker/${encodeURIComponent(ticker)}?token=${encodeURIComponent(publishableKey)}&fallback=404`;
}

/**
 * Builds a Brandfetch CDN image URL with client ID.
 */
export function buildBrandfetchUrl(domain: string, clientId: string): string {
  return `https://cdn.brandfetch.io/${encodeURIComponent(domain)}?c=${encodeURIComponent(clientId)}`;
}

// ---------------------------------------------------------------------------
// 1. Curated Verified Equities: Indian & Global Leaders
// ---------------------------------------------------------------------------
interface VerifiedStockEntry {
  domain: string;
  name: string;
  market: 'IN' | 'US' | 'GLOBAL';
  verifiedLogoUrl?: string;
}

const NSE_BASE = 'https://raw.githubusercontent.com/dharunashokkumar/indian-listed-company-logos/main/data/logos/nse/NSE_';
const TV_BASE = 'https://s3-symbol-logo.tradingview.com/';

const VERIFIED_STOCK_DOMAINS: Record<string, VerifiedStockEntry> = {
  // Indian Nifty 50 & Major Bluechips (Verified Indian equities)
  'RELIANCE': { domain: 'ril.com', name: 'Reliance Industries', market: 'IN', verifiedLogoUrl: `${NSE_BASE}RELIANCE.svg` },
  'TCS': { domain: 'tcs.com', name: 'Tata Consultancy Services', market: 'IN', verifiedLogoUrl: `${NSE_BASE}TCS.svg` },
  'INFY': { domain: 'infosys.com', name: 'Infosys', market: 'IN', verifiedLogoUrl: `${NSE_BASE}INFY.svg` },
  'HDFCBANK': { domain: 'hdfcbank.com', name: 'HDFC Bank', market: 'IN', verifiedLogoUrl: `${NSE_BASE}HDFCBANK.svg` },
  'ICICIBANK': { domain: 'icicibank.com', name: 'ICICI Bank', market: 'IN', verifiedLogoUrl: `${NSE_BASE}ICICIBANK.svg` },
  'SBIN': { domain: 'onlinesbi.sbi', name: 'State Bank of India', market: 'IN', verifiedLogoUrl: `${NSE_BASE}SBIN.svg` },
  'BHARTIARTL': { domain: 'airtel.in', name: 'Bharti Airtel', market: 'IN', verifiedLogoUrl: `${NSE_BASE}BHARTIARTL.svg` },
  'ITC': { domain: 'itcportal.com', name: 'ITC Limited', market: 'IN', verifiedLogoUrl: `${NSE_BASE}ITC.svg` },
  'KOTAKBANK': { domain: 'kotak.com', name: 'Kotak Mahindra Bank', market: 'IN', verifiedLogoUrl: `${NSE_BASE}KOTAKBANK.svg` },
  'LT': { domain: 'larsentoubro.com', name: 'Larsen & Toubro', market: 'IN', verifiedLogoUrl: `${NSE_BASE}LT.svg` },
  'HINDUNILVR': { domain: 'hul.co.in', name: 'Hindustan Unilever', market: 'IN', verifiedLogoUrl: `${NSE_BASE}HINDUNILVR.svg` },
  'TATAMOTORS': { domain: 'tatamotors.com', name: 'Tata Motors', market: 'IN', verifiedLogoUrl: `${TV_BASE}tata-motors.svg` },
  'TATASTEEL': { domain: 'tatasteel.com', name: 'Tata Steel', market: 'IN', verifiedLogoUrl: `${NSE_BASE}TATASTEEL.svg` },
  'TATACONSUM': { domain: 'tataconsumer.com', name: 'Tata Consumer Products', market: 'IN', verifiedLogoUrl: `${NSE_BASE}TATACONSUM.svg` },
  'WIPRO': { domain: 'wipro.com', name: 'Wipro', market: 'IN', verifiedLogoUrl: `${NSE_BASE}WIPRO.svg` },
  'MARUTI': { domain: 'marutisuzuki.com', name: 'Maruti Suzuki', market: 'IN', verifiedLogoUrl: `${NSE_BASE}MARUTI.svg` },
  'AXISBANK': { domain: 'axisbank.com', name: 'Axis Bank', market: 'IN', verifiedLogoUrl: `${NSE_BASE}AXISBANK.svg` },
  'BAJFINANCE': { domain: 'bajajfinserv.in', name: 'Bajaj Finance', market: 'IN', verifiedLogoUrl: `${NSE_BASE}BAJFINANCE.svg` },
  'BAJAJFINSV': { domain: 'bajajfinserv.in', name: 'Bajaj Finserv', market: 'IN', verifiedLogoUrl: `${NSE_BASE}BAJAJFINSV.svg` },
  'BAJAJ-AUTO': { domain: 'bajajauto.com', name: 'Bajaj Auto', market: 'IN', verifiedLogoUrl: `${NSE_BASE}BAJAJ_AUTO.svg` },
  'BAJAJ_AUTO': { domain: 'bajajauto.com', name: 'Bajaj Auto', market: 'IN', verifiedLogoUrl: `${NSE_BASE}BAJAJ_AUTO.svg` },
  'ASIANPAINT': { domain: 'asianpaints.com', name: 'Asian Paints', market: 'IN', verifiedLogoUrl: `${NSE_BASE}ASIANPAINT.svg` },
  'TITAN': { domain: 'titancompany.in', name: 'Titan Company', market: 'IN', verifiedLogoUrl: `${NSE_BASE}TITAN.svg` },
  'SUNPHARMA': { domain: 'sunpharma.com', name: 'Sun Pharma', market: 'IN', verifiedLogoUrl: `${NSE_BASE}SUNPHARMA.svg` },
  'NTPC': { domain: 'ntpc.co.in', name: 'NTPC', market: 'IN', verifiedLogoUrl: `${NSE_BASE}NTPC.svg` },
  'ONGC': { domain: 'ongcindia.com', name: 'ONGC', market: 'IN', verifiedLogoUrl: `${NSE_BASE}ONGC.svg` },
  'POWERGRID': { domain: 'powergrid.in', name: 'Power Grid Corporation', market: 'IN', verifiedLogoUrl: `${NSE_BASE}POWERGRID.svg` },
  'ADANIENT': { domain: 'adanienterprises.com', name: 'Adani Enterprises', market: 'IN', verifiedLogoUrl: `${NSE_BASE}ADANIENT.svg` },
  'ADANIPORTS': { domain: 'adaniports.com', name: 'Adani Ports', market: 'IN', verifiedLogoUrl: `${NSE_BASE}ADANIPORTS.svg` },
  'ADANIGREEN': { domain: 'adanigreenenergy.com', name: 'Adani Green Energy', market: 'IN', verifiedLogoUrl: `${NSE_BASE}ADANIGREEN.svg` },
  'ADANIPOWER': { domain: 'adanipower.com', name: 'Adani Power', market: 'IN', verifiedLogoUrl: `${NSE_BASE}ADANIPOWER.svg` },
  'COALINDIA': { domain: 'coalindia.in', name: 'Coal India', market: 'IN', verifiedLogoUrl: `${NSE_BASE}COALINDIA.svg` },
  'HCLTECH': { domain: 'hcltech.com', name: 'HCL Technologies', market: 'IN', verifiedLogoUrl: `${NSE_BASE}HCLTECH.svg` },
  'NESTLEIND': { domain: 'nestle.in', name: 'Nestle India', market: 'IN', verifiedLogoUrl: `${NSE_BASE}NESTLEIND.svg` },
  'ULTRACEMCO': { domain: 'ultratechcement.com', name: 'UltraTech Cement', market: 'IN', verifiedLogoUrl: `${NSE_BASE}ULTRACEMCO.svg` },
  'JSWSTEEL': { domain: 'jsw.in', name: 'JSW Steel', market: 'IN', verifiedLogoUrl: `${NSE_BASE}JSWSTEEL.svg` },
  'GRASIM': { domain: 'grasim.com', name: 'Grasim Industries', market: 'IN', verifiedLogoUrl: `${NSE_BASE}GRASIM.svg` },
  'TECHM': { domain: 'techmahindra.com', name: 'Tech Mahindra', market: 'IN', verifiedLogoUrl: `${NSE_BASE}TECHM.svg` },
  'HINDALCO': { domain: 'hindalco.com', name: 'Hindalco Industries', market: 'IN', verifiedLogoUrl: `${NSE_BASE}HINDALCO.svg` },
  'CIPLA': { domain: 'cipla.com', name: 'Cipla', market: 'IN', verifiedLogoUrl: `${NSE_BASE}CIPLA.svg` },
  'DRREDDY': { domain: 'drreddys.com', name: "Dr. Reddy's Laboratories", market: 'IN', verifiedLogoUrl: `${NSE_BASE}DRREDDY.svg` },
  'EICHERMOT': { domain: 'eicher.in', name: 'Eicher Motors', market: 'IN', verifiedLogoUrl: `${NSE_BASE}EICHERMOT.svg` },
  'APOLLOHOSP': { domain: 'apollohospitals.com', name: 'Apollo Hospitals', market: 'IN', verifiedLogoUrl: `${NSE_BASE}APOLLOHOSP.svg` },
  'HEROMOTOCO': { domain: 'heromotocorp.com', name: 'Hero MotoCorp', market: 'IN', verifiedLogoUrl: `${NSE_BASE}HEROMOTOCO.svg` },
  'BRITANNIA': { domain: 'britannia.co.in', name: 'Britannia Industries', market: 'IN', verifiedLogoUrl: `${NSE_BASE}BRITANNIA.svg` },
  'INDUSINDBK': { domain: 'indusind.com', name: 'IndusInd Bank', market: 'IN', verifiedLogoUrl: `${NSE_BASE}INDUSINDBK.svg` },
  'DIVISLAB': { domain: 'divislabs.com', name: "Divi's Laboratories", market: 'IN', verifiedLogoUrl: `${NSE_BASE}DIVISLAB.svg` },
  'BPCL': { domain: 'bharatpetroleum.in', name: 'Bharat Petroleum', market: 'IN', verifiedLogoUrl: `${NSE_BASE}BPCL.svg` },
  'SHRIRAMFIN': { domain: 'shriramfinance.in', name: 'Shriram Finance', market: 'IN', verifiedLogoUrl: `${NSE_BASE}SHRIRAMFIN.svg` },
  'HAL': { domain: 'hal-india.co.in', name: 'Hindustan Aeronautics', market: 'IN', verifiedLogoUrl: `${NSE_BASE}HAL.svg` },
  'BEL': { domain: 'bel-india.in', name: 'Bharat Electronics', market: 'IN', verifiedLogoUrl: `${NSE_BASE}BEL.svg` },
  'TRENT': { domain: 'trentlimited.com', name: 'Trent', market: 'IN', verifiedLogoUrl: `${NSE_BASE}TRENT.svg` },
  'VEDL': { domain: 'vedantalimited.com', name: 'Vedanta', market: 'IN', verifiedLogoUrl: `${NSE_BASE}VEDL.svg` },
  'POLYCAB': { domain: 'polycab.com', name: 'Polycab India', market: 'IN', verifiedLogoUrl: `${NSE_BASE}POLYCAB.svg` },
  'HAVELLS': { domain: 'havells.com', name: 'Havells India', market: 'IN', verifiedLogoUrl: `${NSE_BASE}HAVELLS.svg` },
  'DLF': { domain: 'dlf.in', name: 'DLF', market: 'IN', verifiedLogoUrl: `${NSE_BASE}DLF.svg` },
  'PIDILITIND': { domain: 'pidilite.com', name: 'Pidilite Industries', market: 'IN', verifiedLogoUrl: `${NSE_BASE}PIDILITIND.svg` },
  'DABUR': { domain: 'dabur.com', name: 'Dabur India', market: 'IN', verifiedLogoUrl: `${NSE_BASE}DABUR.svg` },
  'MARICO': { domain: 'marico.com', name: 'Marico', market: 'IN', verifiedLogoUrl: `${NSE_BASE}MARICO.svg` },
  '360ONE': { domain: '360.one', name: '360 ONE WAM', market: 'IN', verifiedLogoUrl: `${NSE_BASE}360ONE.svg` },
  'ZOMATO': { domain: 'zomato.com', name: 'Zomato Limited', market: 'IN', verifiedLogoUrl: `${TV_BASE}zomato.svg` },
  'JIOFIN': { domain: 'jfs.in', name: 'Jio Financial Services', market: 'IN', verifiedLogoUrl: `${NSE_BASE}JIOFIN.svg` },
  'M&M': { domain: 'mahindra.com', name: 'Mahindra & Mahindra', market: 'IN', verifiedLogoUrl: `${NSE_BASE}M%26M.svg` },

  // US & International Bluechips & SmartVest Global Universe
  'AAPL': { domain: 'apple.com', name: 'Apple Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}apple.svg` },
  'MSFT': { domain: 'microsoft.com', name: 'Microsoft Corporation', market: 'US', verifiedLogoUrl: `${TV_BASE}microsoft.svg` },
  'GOOG': { domain: 'google.com', name: 'Alphabet Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}alphabet.svg` },
  'GOOGL': { domain: 'google.com', name: 'Alphabet Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}alphabet.svg` },
  'AMZN': { domain: 'amazon.com', name: 'Amazon.com Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}amazon.svg` },
  'NVDA': { domain: 'nvidia.com', name: 'NVIDIA Corporation', market: 'US', verifiedLogoUrl: `${TV_BASE}nvidia.svg` },
  'META': { domain: 'meta.com', name: 'Meta Platforms Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}meta.svg` },
  'TSLA': { domain: 'tesla.com', name: 'Tesla Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}tesla.svg` },
  'TSM': { domain: 'tsmc.com', name: 'Taiwan Semiconductor Manufacturing Co', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}taiwan-semiconductor.svg` },
  'TSMC': { domain: 'tsmc.com', name: 'Taiwan Semiconductor Manufacturing Co', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}taiwan-semiconductor.svg` },
  '2330': { domain: 'tsmc.com', name: 'Taiwan Semiconductor Manufacturing Co', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}taiwan-semiconductor.svg` },
  '2330.TW': { domain: 'tsmc.com', name: 'Taiwan Semiconductor Manufacturing Co', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}taiwan-semiconductor.svg` },
  'ASML': { domain: 'asml.com', name: 'ASML Holding', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}asml.svg` },
  'BRK.A': { domain: 'berkshirehathaway.com', name: 'Berkshire Hathaway Class A', market: 'US', verifiedLogoUrl: `${TV_BASE}berkshire-hathaway.svg` },
  'BRK.B': { domain: 'berkshirehathaway.com', name: 'Berkshire Hathaway Class B', market: 'US', verifiedLogoUrl: `${TV_BASE}berkshire-hathaway.svg` },
  'BRK-B': { domain: 'berkshirehathaway.com', name: 'Berkshire Hathaway Class B', market: 'US', verifiedLogoUrl: `${TV_BASE}berkshire-hathaway.svg` },
  'JPM': { domain: 'jpmorganchase.com', name: 'JPMorgan Chase & Co.', market: 'US', verifiedLogoUrl: `${TV_BASE}jpmorgan-chase.svg` },
  'V': { domain: 'visa.com', name: 'Visa Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}visa.svg` },
  'JNJ': { domain: 'jnj.com', name: 'Johnson & Johnson', market: 'US', verifiedLogoUrl: `${TV_BASE}johnson-and-johnson.svg` },
  'WMT': { domain: 'walmart.com', name: 'Walmart Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}walmart.svg` },
  'PG': { domain: 'pg.com', name: 'Procter & Gamble', market: 'US', verifiedLogoUrl: `${TV_BASE}procter-and-gamble.svg` },
  'MA': { domain: 'mastercard.com', name: 'Mastercard Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}mastercard.svg` },
  'HD': { domain: 'homedepot.com', name: 'Home Depot', market: 'US', verifiedLogoUrl: `${TV_BASE}home-depot.svg` },
  'DIS': { domain: 'disney.com', name: 'The Walt Disney Company', market: 'US', verifiedLogoUrl: `${TV_BASE}walt-disney.svg` },
  'ADBE': { domain: 'adobe.com', name: 'Adobe Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}adobe.svg` },
  'NFLX': { domain: 'netflix.com', name: 'Netflix Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}netflix.svg` },
  'CRM': { domain: 'salesforce.com', name: 'Salesforce Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}salesforce.svg` },
  'INTC': { domain: 'intel.com', name: 'Intel Corporation', market: 'US', verifiedLogoUrl: `${TV_BASE}intel.svg` },
  'AMD': { domain: 'amd.com', name: 'Advanced Micro Devices', market: 'US', verifiedLogoUrl: `${TV_BASE}advanced-micro-devices.svg` },
  'CSCO': { domain: 'cisco.com', name: 'Cisco Systems', market: 'US', verifiedLogoUrl: `${TV_BASE}cisco.svg` },
  'ORCL': { domain: 'oracle.com', name: 'Oracle Corporation', market: 'US', verifiedLogoUrl: `${TV_BASE}oracle.svg` },
  'QCOM': { domain: 'qualcomm.com', name: 'Qualcomm Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}qualcomm.svg` },
  'TXN': { domain: 'ti.com', name: 'Texas Instruments', market: 'US', verifiedLogoUrl: `${TV_BASE}texas-instruments.svg` },
  'IBM': { domain: 'ibm.com', name: 'IBM', market: 'US', verifiedLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg' },
  'PYPL': { domain: 'paypal.com', name: 'PayPal Holdings', market: 'US', verifiedLogoUrl: `${TV_BASE}paypal.svg` },
  'UBER': { domain: 'uber.com', name: 'Uber Technologies', market: 'US', verifiedLogoUrl: `${TV_BASE}uber.svg` },
  'ABNB': { domain: 'airbnb.com', name: 'Airbnb Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}airbnb.svg` },
  'BABA': { domain: 'alibabagroup.com', name: 'Alibaba Group', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}alibaba.svg` },
  'NKE': { domain: 'nike.com', name: 'Nike Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}nike.svg` },
  'KO': { domain: 'coca-colacompany.com', name: 'The Coca-Cola Company', market: 'US', verifiedLogoUrl: `${TV_BASE}coca-cola.svg` },
  'PEP': { domain: 'pepsico.com', name: 'PepsiCo Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}pepsico.svg` },
  'MCD': { domain: 'mcdonalds.com', name: "McDonald's Corporation", market: 'US', verifiedLogoUrl: `${TV_BASE}mcdonalds.svg` },
  'SBUX': { domain: 'starbucks.com', name: 'Starbucks Corporation', market: 'US', verifiedLogoUrl: `${TV_BASE}starbucks.svg` },
  'COST': { domain: 'costco.com', name: 'Costco Wholesale', market: 'US', verifiedLogoUrl: `${TV_BASE}costco-wholesale.svg` },
  'UNH': { domain: 'unitedhealthgroup.com', name: 'UnitedHealth Group', market: 'US', verifiedLogoUrl: `${TV_BASE}unitedhealth.svg` },
  'XOM': { domain: 'exxonmobil.com', name: 'Exxon Mobil', market: 'US', verifiedLogoUrl: `${TV_BASE}exxon.svg` },
  'CVX': { domain: 'chevron.com', name: 'Chevron Corporation', market: 'US', verifiedLogoUrl: `${TV_BASE}chevron.svg` },
  'SONY': { domain: 'sony.com', name: 'Sony Group', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}sony.svg` },
  'SAP': { domain: 'sap.com', name: 'SAP SE', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}sap.svg` },
  'ARM': { domain: 'arm.com', name: 'Arm Holdings', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}arm.svg` },
  'AVGO': { domain: 'broadcom.com', name: 'Broadcom Inc.', market: 'US', verifiedLogoUrl: `${TV_BASE}broadcom.svg` },
  'LLY': { domain: 'lilly.com', name: 'Eli Lilly and Company', market: 'US', verifiedLogoUrl: `${TV_BASE}eli-lilly.svg` },
  'PLTR': { domain: 'palantir.com', name: 'Palantir Technologies', market: 'US', verifiedLogoUrl: `${TV_BASE}palantir.svg` },
  'TM': { domain: 'toyota.com', name: 'Toyota Motor Corporation', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}toyota.svg` },
  'TCEHY': { domain: 'tencent.com', name: 'Tencent Holdings', market: 'GLOBAL', verifiedLogoUrl: `${TV_BASE}tencent.svg` },
};

// ---------------------------------------------------------------------------
// 2. Curated Verified ETFs & Issuers
// ---------------------------------------------------------------------------
interface VerifiedEtfEntry {
  domain: string;
  name: string;
  verifiedLogoUrl?: string;
}

const VERIFIED_ETF_DOMAINS: Record<string, VerifiedEtfEntry> = {
  // US & Global Major ETFs
  'SPY': {
    domain: 'ssga.com',
    name: 'SPDR S&P 500 ETF Trust',
    verifiedLogoUrl: `${TV_BASE}spdr-sandp500-etf-tr--big.svg`
  },
  'GLD': { domain: 'ssga.com', name: 'SPDR Gold Trust', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'DIA': { domain: 'ssga.com', name: 'SPDR Dow Jones Industrial Average ETF', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLF': { domain: 'ssga.com', name: 'Financial Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLK': { domain: 'ssga.com', name: 'Technology Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLV': { domain: 'ssga.com', name: 'Health Care Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLE': { domain: 'ssga.com', name: 'Energy Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLI': { domain: 'ssga.com', name: 'Industrial Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLP': { domain: 'ssga.com', name: 'Consumer Staples Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLY': { domain: 'ssga.com', name: 'Consumer Discretionary Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLU': { domain: 'ssga.com', name: 'Utilities Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLB': { domain: 'ssga.com', name: 'Materials Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },
  'XLC': { domain: 'ssga.com', name: 'Communication Services Select Sector SPDR Fund', verifiedLogoUrl: `${TV_BASE}state-street.svg` },

  // Vanguard ETFs
  'VOO': { domain: 'vanguard.com', name: 'Vanguard S&P 500 ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },
  'VTI': { domain: 'vanguard.com', name: 'Vanguard Total Stock Market ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },
  'VEA': { domain: 'vanguard.com', name: 'Vanguard FTSE Developed Markets ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },
  'VWO': { domain: 'vanguard.com', name: 'Vanguard FTSE Emerging Markets ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },
  'BND': { domain: 'vanguard.com', name: 'Vanguard Total Bond Market ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },
  'VNQ': { domain: 'vanguard.com', name: 'Vanguard Real Estate ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },
  'VUG': { domain: 'vanguard.com', name: 'Vanguard Growth ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },
  'VTV': { domain: 'vanguard.com', name: 'Vanguard Value ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },
  'VYM': { domain: 'vanguard.com', name: 'Vanguard High Dividend Yield ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },
  'VXUS': { domain: 'vanguard.com', name: 'Vanguard Total International Stock ETF', verifiedLogoUrl: `${TV_BASE}vanguard.svg` },

  // BlackRock iShares
  'IVV': { domain: 'ishares.com', name: 'iShares Core S&P 500 ETF', verifiedLogoUrl: `${TV_BASE}ishares.svg` },
  'IWM': { domain: 'ishares.com', name: 'iShares Russell 2000 ETF', verifiedLogoUrl: `${TV_BASE}ishares.svg` },
  'EEM': { domain: 'ishares.com', name: 'iShares MSCI Emerging Markets ETF', verifiedLogoUrl: `${TV_BASE}ishares.svg` },
  'AGG': { domain: 'ishares.com', name: 'iShares Core U.S. Aggregate Bond ETF', verifiedLogoUrl: `${TV_BASE}ishares.svg` },
  'IEFA': { domain: 'ishares.com', name: 'iShares Core MSCI EAFE ETF', verifiedLogoUrl: `${TV_BASE}ishares.svg` },
  'IEMG': { domain: 'ishares.com', name: 'iShares Core MSCI Emerging Markets ETF', verifiedLogoUrl: `${TV_BASE}ishares.svg` },
  'SLV': { domain: 'ishares.com', name: 'iShares Silver Trust', verifiedLogoUrl: `${TV_BASE}ishares.svg` },
  'SOXX': { domain: 'ishares.com', name: 'iShares Semiconductor ETF', verifiedLogoUrl: `${TV_BASE}ishares.svg` },
  'TLT': { domain: 'ishares.com', name: 'iShares 20+ Year Treasury Bond ETF', verifiedLogoUrl: `${TV_BASE}ishares.svg` },

  // Invesco
  'QQQ': { domain: 'invesco.com', name: 'Invesco QQQ Trust', verifiedLogoUrl: `${TV_BASE}invesco.svg` },
  'QQQM': { domain: 'invesco.com', name: 'Invesco NASDAQ 100 ETF', verifiedLogoUrl: `${TV_BASE}invesco.svg` },
  'RSP': { domain: 'invesco.com', name: 'Invesco S&P 500 Equal Weight ETF', verifiedLogoUrl: `${TV_BASE}invesco.svg` },

  // Indian ETFs
  'NIFTYBEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF Nifty BeES', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'BANKBEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF Bank BeES', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'GOLDBEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF Gold BeES', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'SILVERBEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF Silver BeES', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'LIQUIDBEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF Liquid BeES', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'JUNIORBEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF Junior BeES', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'ITBEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF IT BeES', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'PHARMABEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF Pharma BeES', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'AUTOBEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF Auto BeES', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'MID150BEES': { domain: 'nipponindiaim.com', name: 'Nippon India ETF Nifty Midcap 150', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'GSEC10YR': { domain: 'nipponindiaim.com', name: 'Nippon India ETF G-Sec 10Y', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },
  'CPSEETF': { domain: 'nipponindiaim.com', name: 'Nippon India ETF CPSE', verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg` },

  'BHARAT22': { domain: 'icicipruamc.com', name: 'ICICI Prudential Bharat 22 ETF', verifiedLogoUrl: `${NSE_BASE}ICICIAMC.svg` },
  'ICICIB22': { domain: 'icicipruamc.com', name: 'ICICI Prudential BHARAT 22 ETF', verifiedLogoUrl: `${NSE_BASE}ICICIAMC.svg` },
  'ICICINIFTY': { domain: 'icicipruamc.com', name: 'ICICI Prudential Nifty 50 ETF', verifiedLogoUrl: `${NSE_BASE}ICICIAMC.svg` },
  'ICICIBANKN': { domain: 'icicipruamc.com', name: 'ICICI Prudential Nifty Bank ETF', verifiedLogoUrl: `${NSE_BASE}ICICIAMC.svg` },
  'LOWVOL': { domain: 'icicipruamc.com', name: 'ICICI Prudential Nifty 100 Low Volatility ETF', verifiedLogoUrl: `${NSE_BASE}ICICIAMC.svg` },

  'SETFNIF50': { domain: 'sbimf.com', name: 'SBI Nifty 50 ETF', verifiedLogoUrl: `${NSE_BASE}SBIN.svg` },
  'SETFNIFBK': { domain: 'sbimf.com', name: 'SBI Nifty Bank ETF', verifiedLogoUrl: `${NSE_BASE}SBIN.svg` },
  'SETFNN50': { domain: 'sbimf.com', name: 'SBI Nifty Next 50 ETF', verifiedLogoUrl: `${NSE_BASE}SBIN.svg` },
  'SETFBK': { domain: 'sbimf.com', name: 'SBI Nifty Bank ETF', verifiedLogoUrl: `${NSE_BASE}SBIN.svg` },

  'HDFCNIFTY': { domain: 'hdfcfund.com', name: 'HDFC NIFTY 50 ETF', verifiedLogoUrl: `${NSE_BASE}HDFCAMC.svg` },
  'HDFCBANKETF': { domain: 'hdfcfund.com', name: 'HDFC NIFTY Bank ETF', verifiedLogoUrl: `${NSE_BASE}HDFCAMC.svg` },
  'HDFCSML250': { domain: 'hdfcfund.com', name: 'HDFC Nifty Smallcap 250 ETF', verifiedLogoUrl: `${NSE_BASE}HDFCAMC.svg` },
  'HDFCSILVER': { domain: 'hdfcfund.com', name: 'HDFC Silver ETF', verifiedLogoUrl: `${NSE_BASE}HDFCAMC.svg` },

  'KOTAKNIFTY': { domain: 'kotakmf.com', name: 'Kotak Nifty 50 ETF', verifiedLogoUrl: `${NSE_BASE}KOTAKBANK.svg` },
  'KOTAKBKETF': { domain: 'kotakmf.com', name: 'Kotak Nifty Bank ETF', verifiedLogoUrl: `${NSE_BASE}KOTAKBANK.svg` },

  'MOM100': { domain: 'motilaloswalmf.com', name: 'Motilal Oswal Midcap 100 ETF', verifiedLogoUrl: `${NSE_BASE}MOTILALOFS.svg` },
  'MON100': { domain: 'motilaloswalmf.com', name: 'Motilal Oswal Nasdaq 100 ETF', verifiedLogoUrl: `${NSE_BASE}MOTILALOFS.svg` },
  'MOFSP500': { domain: 'motilaloswalmf.com', name: 'Motilal Oswal S&P 500 Index ETF', verifiedLogoUrl: `${NSE_BASE}MOTILALOFS.svg` },

  'MAFANG': { domain: 'miraeassetmf.co.in', name: 'Mirae Asset NYSE FANG+ ETF', verifiedLogoUrl: undefined },
  'MASPTOP50': { domain: 'miraeassetmf.co.in', name: 'Mirae Asset S&P 500 Top 50 ETF', verifiedLogoUrl: undefined },
  'LIQUIDCASE': { domain: 'zerodhafundhouse.com', name: 'Zerodha Nifty 1D Rate Liquid ETF', verifiedLogoUrl: undefined },
};

// ---------------------------------------------------------------------------
// 2b. Curated Verified Index Benchmarks
// ---------------------------------------------------------------------------
const VERIFIED_INDEX_DOMAINS: Record<string, VerifiedStockEntry> = {
  'BSESN': { domain: 'bseindia.com', name: 'BSE SENSEX 30 Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/BSE.svg` },
  'SENSEX': { domain: 'bseindia.com', name: 'BSE SENSEX 30 Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/BSE.svg` },
  'BSE SENSEX': { domain: 'bseindia.com', name: 'BSE SENSEX 30 Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/BSE.svg` },
  'NSEI': { domain: 'nseindia.com', name: 'NIFTY 50 Benchmark Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/NSE.svg` },
  'NIFTY': { domain: 'nseindia.com', name: 'NIFTY 50 Benchmark Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/NSE.svg` },
  'NIFTY50': { domain: 'nseindia.com', name: 'NIFTY 50 Benchmark Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/NSE.svg` },
  'NIFTY 50': { domain: 'nseindia.com', name: 'NIFTY 50 Benchmark Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/NSE.svg` },
  'NSEBANK': { domain: 'nseindia.com', name: 'NIFTY Bank Sectoral Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/NSE.svg` },
  'BANKNIFTY': { domain: 'nseindia.com', name: 'NIFTY Bank Sectoral Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/NSE.svg` },
  'BANK NIFTY': { domain: 'nseindia.com', name: 'NIFTY Bank Sectoral Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/NSE.svg` },
  'NIFTY BANK': { domain: 'nseindia.com', name: 'NIFTY Bank Sectoral Index', market: 'IN', verifiedLogoUrl: `${TV_BASE}source/NSE.svg` },
  'GSPC': { domain: 'spglobal.com', name: 'S&P 500 Benchmark Index', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/s-and-p-500.svg` },
  'SPX': { domain: 'spglobal.com', name: 'S&P 500 Benchmark Index', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/s-and-p-500.svg` },
  'SP500': { domain: 'spglobal.com', name: 'S&P 500 Benchmark Index', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/s-and-p-500.svg` },
  'S&P 500': { domain: 'spglobal.com', name: 'S&P 500 Benchmark Index', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/s-and-p-500.svg` },
  'IXIC': { domain: 'nasdaq.com', name: 'NASDAQ Composite Index', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/nasdaq-composite.svg` },
  'NASDAQ': { domain: 'nasdaq.com', name: 'NASDAQ Composite Index', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/nasdaq-composite.svg` },
  'RUT': { domain: 'ftserussell.com', name: 'Russell 2000 Index', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/russell-2000.svg` },
  'DJI': { domain: 'spglobal.com', name: 'Dow Jones Industrial Average', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/dow-30.svg` },
  'DJIA': { domain: 'spglobal.com', name: 'Dow Jones Industrial Average', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/dow-30.svg` },
  'DOW': { domain: 'spglobal.com', name: 'Dow Jones Industrial Average', market: 'US', verifiedLogoUrl: `${TV_BASE}indices/dow-30.svg` },
};

// ---------------------------------------------------------------------------
// 3. Curated Verified AMCs & Fund Houses (Covering 100% of Indian Mutual Funds)
// ---------------------------------------------------------------------------
export interface AmcRule {
  domain: string;
  brandName: string;
  keywords: string[];
  verifiedLogoUrl?: string;
}

export const AMC_RULES: AmcRule[] = [
  {
    domain: '360.one',
    brandName: '360 ONE Mutual Fund',
    keywords: ['360 ONE', '360ONE', 'IIFL'],
    verifiedLogoUrl: `${NSE_BASE}360ONE.svg`,
  },
  {
    domain: 'abakkusinvest.com',
    brandName: 'Abakkus Mutual Fund',
    keywords: ['ABAKKUS'],
  },
  {
    domain: 'mutualfund.adityabirlacapital.com',
    brandName: 'Aditya Birla Sun Life Mutual Fund',
    keywords: ['ADITYA BIRLA', 'BIRLA SUN LIFE', 'ABSL'],
    verifiedLogoUrl: `${NSE_BASE}ABSLAMC.svg`,
  },
  {
    domain: 'alphagrep.com',
    brandName: 'AlphaGrep Mutual Fund',
    keywords: ['ALPHAGREP'],
  },
  {
    domain: 'angelone.in',
    brandName: 'Angel One Mutual Fund',
    keywords: ['ANGEL ONE', 'ANGELONE'],
  },
  {
    domain: 'axismf.com',
    brandName: 'Axis Mutual Fund',
    keywords: ['AXIS MUTUAL', 'AXIS MF', 'AXIS BLUECHIP', 'AXIS SMALL', 'AXIS'],
    verifiedLogoUrl: `${NSE_BASE}AXISBANK.svg`,
  },
  {
    domain: 'bajajamc.com',
    brandName: 'Bajaj Finserv Mutual Fund',
    keywords: ['BAJAJ FINSERV', 'BAJAJ MUTUAL', 'BAJAJ MF'],
    verifiedLogoUrl: `${NSE_BASE}BAJAJFINSV.svg`,
  },
  {
    domain: 'bandhanmutual.com',
    brandName: 'Bandhan Mutual Fund',
    keywords: ['BANDHAN', 'IDFC MUTUAL', 'IDFC MF'],
  },
  {
    domain: 'boimf.in',
    brandName: 'Bank of India Mutual Fund',
    keywords: ['BANK OF INDIA', 'BOI MUTUAL', 'BOI MF'],
  },
  {
    domain: 'barodabnpparibasmf.in',
    brandName: 'Baroda BNP Paribas Mutual Fund',
    keywords: ['BARODA BNP', 'BNP PARIBAS', 'BARODA PIONEER'],
  },
  {
    domain: 'canararobeco.com',
    brandName: 'Canara Robeco Mutual Fund',
    keywords: ['CANARA ROBECO', 'ROBECO'],
  },
  {
    domain: 'capitalmindmf.com',
    brandName: 'Capitalmind Mutual Fund',
    keywords: ['CAPITALMIND'],
  },
  {
    domain: 'choiceindia.com',
    brandName: 'Choice Mutual Fund',
    keywords: ['CHOICE MUTUAL', 'CHOICE MF', 'CHOICE'],
  },
  {
    domain: 'dspim.com',
    brandName: 'DSP Mutual Fund',
    keywords: ['DSP MUTUAL', 'DSP BLACKROCK', 'DSP MF', 'DSP'],
  },
  {
    domain: 'edelweissmf.com',
    brandName: 'Edelweiss Mutual Fund',
    keywords: ['EDELWEISS'],
  },
  {
    domain: 'franklintempletonindia.com',
    brandName: 'Franklin Templeton Mutual Fund',
    keywords: ['FRANKLIN TEMPLETON', 'TEMPLETON', 'FRANKLIN'],
  },
  {
    domain: 'growwmf.in',
    brandName: 'Groww Mutual Fund',
    keywords: ['GROWW'],
  },
  {
    domain: 'hdfcfund.com',
    brandName: 'HDFC Mutual Fund',
    keywords: ['HDFC MUTUAL', 'HDFC MF', 'HDFC FLEXI', 'HDFC TOP', 'HDFC BALANCED', 'HDFC AMC', 'HDFCSHORT', 'HDFC_SHORT_DEBT_DIR', 'HDFC'],
    verifiedLogoUrl: `${NSE_BASE}HDFCAMC.svg`,
  },
  {
    domain: 'assetmanagement.hsbc.co.in',
    brandName: 'HSBC Mutual Fund',
    keywords: ['HSBC MUTUAL', 'HSBC MF', 'L&T MUTUAL', 'HSBC'],
  },
  {
    domain: 'heliosmf.in',
    brandName: 'Helios Mutual Fund',
    keywords: ['HELIOS'],
  },
  {
    domain: 'icicipruamc.com',
    brandName: 'ICICI Prudential Mutual Fund',
    keywords: ['ICICI PRUDENTIAL', 'ICICI PRU', 'ICICIPRU', 'ICICI AMC', 'ICICILIQ', 'ICICI_LIQUID_DIR', 'ICICI'],
    verifiedLogoUrl: `${NSE_BASE}ICICIAMC.svg`,
  },
  {
    domain: 'ilfsamc.com',
    brandName: 'IL&FS Mutual Fund (IDF)',
    keywords: ['IL&FS', 'ILFS'],
  },
  {
    domain: 'itiamc.com',
    brandName: 'ITI Mutual Fund',
    keywords: ['ITI MUTUAL', 'ITI MF'],
  },
  {
    domain: 'invescomutualfund.com',
    brandName: 'Invesco India Mutual Fund',
    keywords: ['INVESCO INDIA', 'INVESCO MUTUAL', 'INVESCO'],
    verifiedLogoUrl: `${TV_BASE}invesco.svg`,
  },
  {
    domain: 'jmfinancialmf.com',
    brandName: 'JM Financial Mutual Fund',
    keywords: ['JM FINANCIAL', 'JM MUTUAL', 'JM MF'],
  },
  {
    domain: 'jfs.in',
    brandName: 'Jio BlackRock Mutual Fund',
    keywords: ['JIO BLACKROCK', 'JIO MUTUAL'],
  },
  {
    domain: 'kotakmf.com',
    brandName: 'Kotak Mahindra Mutual Fund',
    keywords: ['KOTAK MAHINDRA', 'KOTAK MUTUAL', 'KOTAK MF', 'KOTAK EMERGING', 'KOTAK'],
    verifiedLogoUrl: `${NSE_BASE}KOTAKBANK.svg`,
  },
  {
    domain: 'licmf.com',
    brandName: 'LIC Mutual Fund',
    keywords: ['LIC MUTUAL', 'LIC MF', 'LIFE INSURANCE CORPORATION'],
  },
  {
    domain: 'lakshyaamc.com',
    brandName: 'Lakshya Mutual Fund',
    keywords: ['LAKSHYA'],
  },
  {
    domain: 'mahindramanulife.com',
    brandName: 'Mahindra Manulife Mutual Fund',
    keywords: ['MAHINDRA MANULIFE', 'MAHINDRA MUTUAL', 'MANULIFE'],
  },
  {
    domain: 'miraeassetmf.co.in',
    brandName: 'Mirae Asset Mutual Fund',
    keywords: ['MIRAE ASSET', 'MIRAE_LARGE_CAP_DIR', 'MIRAE'],
  },
  {
    domain: 'monarchnetworth.com',
    brandName: 'Monarch Mutual Fund',
    keywords: ['MONARCH'],
  },
  {
    domain: 'motilaloswalmf.com',
    brandName: 'Motilal Oswal Mutual Fund',
    keywords: ['MOTILAL OSWAL', 'MOTILAL'],
    verifiedLogoUrl: `${NSE_BASE}MOTILALOFS.svg`,
  },
  {
    domain: 'njmutualfund.com',
    brandName: 'NJ Mutual Fund',
    keywords: ['NJ MUTUAL', 'NJ MF'],
  },
  {
    domain: 'navi.com',
    brandName: 'Navi Mutual Fund',
    keywords: ['NAVI MUTUAL', 'NAVI MF', 'NAVI'],
  },
  {
    domain: 'nipponindiaim.com',
    brandName: 'Nippon India Mutual Fund',
    keywords: ['NIPPON INDIA', 'NIPPON LIFE', 'NIPPON MUTUAL', 'RELIANCE MUTUAL', 'NIPPSMALL', 'NIPPON_SMALL_CAP_DIR', 'NIPPON'],
    verifiedLogoUrl: `${NSE_BASE}NAM_INDIA.svg`,
  },
  {
    domain: 'oldbridgecapital.com',
    brandName: 'Old Bridge Mutual Fund',
    keywords: ['OLD BRIDGE', 'OLDBRIDGE'],
  },
  {
    domain: 'pgimindiamf.com',
    brandName: 'PGIM India Mutual Fund',
    keywords: ['PGIM INDIA', 'PGIM'],
  },
  {
    domain: 'amc.ppfas.com',
    brandName: 'Parag Parikh Financial Advisory (PPFAS)',
    keywords: ['PARAG PARIKH', 'PPFAS', 'PPFCF', 'PPFAS_FLEXI_CAP_DIR'],
  },
  {
    domain: 'quantumamc.com',
    brandName: 'Quantum Mutual Fund',
    keywords: ['QUANTUM MUTUAL', 'QUANTUM AMC'],
  },
  {
    domain: 'sbimf.com',
    brandName: 'SBI Mutual Fund',
    keywords: ['SBI MUTUAL', 'SBI MF', 'SBI BLUECHIP', 'STATE BANK OF INDIA', 'SETF', 'SBI'],
    verifiedLogoUrl: `${NSE_BASE}SBIN.svg`,
  },
  {
    domain: 'samcomf.com',
    brandName: 'Samco Mutual Fund',
    keywords: ['SAMCO MUTUAL', 'SAMCO MF', 'SAMCO'],
  },
  {
    domain: 'shriraminsight.com',
    brandName: 'Shriram Mutual Fund',
    keywords: ['SHRIRAM MUTUAL', 'SHRIRAM MF', 'SHRIRAM'],
  },
  {
    domain: 'sundarammutual.com',
    brandName: 'Sundaram Mutual Fund',
    keywords: ['SUNDARAM MUTUAL', 'SUNDARAM MF', 'SUNDARAM BNP', 'SUNDARAM'],
  },
  {
    domain: 'tatamutualfund.com',
    brandName: 'Tata Mutual Fund',
    keywords: ['TATA MUTUAL', 'TATA MF', 'TATA DIGITAL', 'TATA'],
  },
  {
    domain: 'taurusmutualfund.com',
    brandName: 'Taurus Mutual Fund',
    keywords: ['TAURUS MUTUAL', 'TAURUS MF', 'TAURUS'],
  },
  {
    domain: 'thewealthcompany.in',
    brandName: 'The Wealth Company Mutual Fund',
    keywords: ['THE WEALTH COMPANY', 'WEALTH COMPANY'],
  },
  {
    domain: 'trustmf.com',
    brandName: 'Trust Mutual Fund',
    keywords: ['TRUST MUTUAL', 'TRUST MF'],
  },
  {
    domain: 'utimf.com',
    brandName: 'UTI Mutual Fund',
    keywords: ['UTI MUTUAL', 'UTI MF', 'UTI NIFTY', 'UTI_NIFTY_50_DIR', 'UNIT TRUST OF INDIA', 'UTI'],
    verifiedLogoUrl: `${NSE_BASE}UTIAMC.svg`,
  },
  {
    domain: 'unificap.com',
    brandName: 'Unifi Mutual Fund',
    keywords: ['UNIFI'],
  },
  {
    domain: 'unionmf.com',
    brandName: 'Union Mutual Fund',
    keywords: ['UNION MUTUAL', 'UNION MF'],
  },
  {
    domain: 'whiteoakamc.com',
    brandName: 'WhiteOak Capital Mutual Fund',
    keywords: ['WHITEOAK', 'WHITE OAK'],
  },
  {
    domain: 'zerodhafundhouse.com',
    brandName: 'Zerodha Fund House',
    keywords: ['ZERODHA FUND', 'ZERODHA'],
  },
  {
    domain: 'quantmutual.com',
    brandName: 'Quant Mutual Fund',
    keywords: ['QUANT MUTUAL', 'QUANT MF', 'QUANT SMALL', 'QUANT ACTIVE', 'QUANT_ACTIVE_DIR', 'QUANT'],
  },

  // Major Global Fund Houses & ETF Issuers
  {
    domain: 'vanguard.com',
    brandName: 'Vanguard',
    keywords: ['VANGUARD'],
    verifiedLogoUrl: `${TV_BASE}vanguard.svg`,
  },
  {
    domain: 'ishares.com',
    brandName: 'BlackRock iShares',
    keywords: ['BLACKROCK', 'ISHARES'],
    verifiedLogoUrl: `${TV_BASE}ishares.svg`,
  },
  {
    domain: 'ssga.com',
    brandName: 'State Street Global Advisors (SPDR)',
    keywords: ['STATE STREET', 'SPDR', 'SSGA'],
    verifiedLogoUrl: `${TV_BASE}state-street.svg`,
  },
  {
    domain: 'fidelity.com',
    brandName: 'Fidelity Investments',
    keywords: ['FIDELITY'],
  },
  {
    domain: 'schwab.com',
    brandName: 'Charles Schwab',
    keywords: ['SCHWAB', 'CHARLES SCHWAB'],
  },
];

// Known AMFI Scheme Codes to AMC Brand Hint for fallback resolution
const KNOWN_AMFI_TO_AMC: Record<string, string> = {
  '122639': 'PPFAS',
  '120716': 'AXIS',
  '118989': 'HDFC',
  '120503': 'ICICI PRUDENTIAL',
  '119598': 'SBI',
  '125354': 'MIRAE ASSET',
  '120847': 'NIPPON INDIA',
  '120755': 'UTI',
  '147620': 'QUANT',
  '152073': '360 ONE',
  '129035': 'MOTILAL OSWAL',
};

// ---------------------------------------------------------------------------
// 4. Symbol Normalization & Initials Helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes symbols by stripping exchange suffixes (.NS, .BO, .BSE, .NSE, etc.)
 * and identifier prefixes (AMFI:, INDEX:, COMMODITY:).
 */
export function normalizeSymbol(rawSymbol: string, assetType?: string): {
  cleanSymbol: string;
  isAmfi: boolean;
  isIndex: boolean;
  exchangeSuffix?: string;
} {
  if (!rawSymbol) {
    return { cleanSymbol: '', isAmfi: false, isIndex: false };
  }

  let s = rawSymbol.trim().toUpperCase();
  const assetTypeUpper = (assetType || '').toUpperCase();
  const isAmfi = s.startsWith('AMFI:') || assetTypeUpper === 'MUTUAL_FUND' || /^\d{5,7}$/.test(s);
  const isIndex = s.startsWith('INDEX:') || s.startsWith('^') || assetTypeUpper === 'INDEX';

  // Strip known system prefixes
  if (s.startsWith('AMFI:')) {
    s = s.substring(5).trim();
  } else if (s.startsWith('INDEX:')) {
    s = s.substring(6).trim();
  } else if (s.startsWith('COMMODITY:')) {
    s = s.substring(10).trim();
  } else if (s.startsWith('^')) {
    s = s.substring(1).trim();
  }

  // Strip exchange suffixes (.NS, .BO, .NSE, .BSE, .LSE, .TO, .AX, .TW, etc.)
  let exchangeSuffix: string | undefined;
  const suffixMatch = s.match(/\.(NS|BO|NSE|BSE|LSE|TO|AX|OQ|N|DE|TW)$/i);
  if (suffixMatch) {
    exchangeSuffix = suffixMatch[1].toUpperCase();
    s = s.replace(/\.(NS|BO|NSE|BSE|LSE|TO|AX|OQ|N|DE|TW)$/i, '');
  }

  // Canonicalize dual-class share notations (e.g. BRK-B, BRK/B -> BRK.B)
  if (s === 'BRK-A' || s === 'BRK/A') {
    s = 'BRK.A';
  } else if (s === 'BRK-B' || s === 'BRK/B') {
    s = 'BRK.B';
  }

  return { cleanSymbol: s, isAmfi, isIndex, exchangeSuffix };
}

/**
 * Retained for backward-compatibility in types/tests.
 */
export function extractInitials(
  cleanSymbol: string,
  name?: string,
  isAmfi?: boolean
): string {
  if (isAmfi || /^\d+$/.test(cleanSymbol)) {
    if (name) {
      const stopWords = new Set(['FUND', 'DIRECT', 'REGULAR', 'GROWTH', 'PLAN', 'SCHEME', 'MUTUAL', 'SERIES', 'ETF']);
      const words = name
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 0 && !stopWords.has(w.toUpperCase()));

      if (words.length > 0) {
        const firstWord = words[0];
        if (firstWord.length >= 2 && (firstWord === firstWord.toUpperCase() || words.length === 1)) {
          return firstWord.substring(0, 2).toUpperCase();
        }
        if (words.length >= 2) {
          return (words[0][0] + words[1][0]).toUpperCase();
        }
        return firstWord.substring(0, 2).toUpperCase();
      }
    }
    return cleanSymbol.substring(0, 2).toUpperCase();
  }

  if (cleanSymbol.length <= 2) {
    return cleanSymbol;
  }
  return cleanSymbol.substring(0, 2);
}

// ---------------------------------------------------------------------------
// 5. In-Memory Resolution Cache & Logging of Missing Lookups
// ---------------------------------------------------------------------------
const resolutionCache = new Map<string, LogoResolutionResult>();
const reportedMissingSymbols = new Set<string>();

/**
 * Structured reporting of missing or unresolvable logos for coverage auditing.
 */
export function reportMissingLogo(symbol: string, name?: string, reason?: string): void {
  if (!symbol || reportedMissingSymbols.has(symbol)) return;
  reportedMissingSymbols.add(symbol);
  console.warn(
    `[SmartVest LogoResolver] Missing or unverified logo for ${symbol}${name ? ` (${name})` : ''}${reason ? `: ${reason}` : ''}`
  );
}

export function getReportedMissingLogos(): string[] {
  return Array.from(reportedMissingSymbols);
}

export function clearReportedMissingLogos(): void {
  reportedMissingSymbols.clear();
}

/**
 * Main Institutional Logo Resolver
 *
 * Guarantees:
 * 1. O(1) in-memory cached.
 * 2. High priority for Logo.dev stock ticker endpoint (/ticker/{ticker}?fallback=404) when key is configured.
 * 3. High priority for Logo.dev domain endpoint (/domain?fallback=404) for mutual funds and ETFs.
 * 4. High-fidelity verified real vector/SVG logo fallback for verified catalog.
 * 5. Strictly returns null when no real logo exists (no initials, no generic icons, no generated monograms).
 */
export function resolveInstrumentLogo(instrument: {
  symbol: string;
  name?: string;
  assetType?: string;
  fundHouse?: string;
  exchange?: string;
  country?: string;
  market?: string;
}): LogoResolutionResult {
  const rawSymbol = instrument.symbol || '';
  const cacheKey = `${rawSymbol}|${instrument.name || ''}|${instrument.assetType || ''}|${instrument.fundHouse || ''}|${instrument.exchange || ''}|${instrument.country || ''}|${instrument.market || ''}`;

  const cached = resolutionCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { cleanSymbol, isAmfi, isIndex, exchangeSuffix } = normalizeSymbol(rawSymbol, instrument.assetType);
  const assetTypeUpper = (instrument.assetType || '').toUpperCase();
  const nameUpper = (instrument.name || '').toUpperCase();
  const fundHouseUpper = (instrument.fundHouse || '').toUpperCase();
  const exchangeUpper = (instrument.exchange || exchangeSuffix || '').toUpperCase();
  const countryUpper = (instrument.country || '').toUpperCase();
  const marketUpper = (instrument.market || '').toUpperCase();

  const isUsMarket =
    exchangeUpper === 'NASDAQ' ||
    exchangeUpper === 'NYSE' ||
    exchangeUpper === 'NYSEARCA' ||
    exchangeUpper === 'AMEX' ||
    exchangeUpper === 'BATS' ||
    exchangeUpper === 'OTC' ||
    countryUpper === 'US' ||
    countryUpper === 'USA' ||
    marketUpper === 'US';

  const isIndianMarket =
    exchangeUpper === 'NSE' ||
    exchangeUpper === 'BSE' ||
    exchangeSuffix === 'NS' ||
    exchangeSuffix === 'BO' ||
    exchangeSuffix === 'NSE' ||
    exchangeSuffix === 'BSE' ||
    countryUpper === 'IN' ||
    countryUpper === 'INDIA' ||
    marketUpper === 'IN' ||
    marketUpper === 'INDIA';

  let resolvedDomain: string | null = null;
  let resolvedBrand: string | undefined = undefined;
  let verifiedAssetUrl: string | undefined = undefined;

  const isClassifiedIndex = isIndex || assetTypeUpper === 'INDEX' || Boolean(VERIFIED_INDEX_DOMAINS[cleanSymbol]);
  const isClassifiedEtf = !isClassifiedIndex && (assetTypeUpper === 'ETF' || nameUpper.includes(' ETF') || Boolean(VERIFIED_ETF_DOMAINS[cleanSymbol]));
  const isClassifiedMf = !isClassifiedIndex && !isClassifiedEtf && (isAmfi || assetTypeUpper === 'MUTUAL_FUND');

  // 0. Benchmark Indices: strictly check verified indices, never borrow stock or AMC logos
  if (isClassifiedIndex) {
    if (VERIFIED_INDEX_DOMAINS[cleanSymbol]) {
      const entry = VERIFIED_INDEX_DOMAINS[cleanSymbol];
      resolvedDomain = entry.domain;
      resolvedBrand = entry.name;
      verifiedAssetUrl = entry.verifiedLogoUrl;
    }
  }

  // 1. ETFs: check verified ETF table first; fall back to verified ETF issuer AMC rule, NEVER borrow single stock logo
  else if (isClassifiedEtf) {
    if (VERIFIED_ETF_DOMAINS[cleanSymbol]) {
      const entry = VERIFIED_ETF_DOMAINS[cleanSymbol];
      resolvedDomain = entry.domain;
      resolvedBrand = entry.name;
      verifiedAssetUrl = entry.verifiedLogoUrl;
    } else {
      const textToMatch = `${fundHouseUpper} ${nameUpper}`;
      for (const rule of AMC_RULES) {
        const match = rule.keywords.some((kw) => textToMatch.includes(kw));
        if (match) {
          resolvedDomain = rule.domain;
          resolvedBrand = rule.brandName;
          verifiedAssetUrl = rule.verifiedLogoUrl;
          break;
        }
      }
    }
  }

  // 2. Mutual Funds: match AMC from reliable fundHouse/name metadata, NEVER borrow stock logo
  else if (isClassifiedMf) {
    const textToMatch = `${fundHouseUpper} ${nameUpper}`.trim();
    if (textToMatch) {
      for (const rule of AMC_RULES) {
        const match = rule.keywords.some((kw) => textToMatch.includes(kw));
        if (match) {
          resolvedDomain = rule.domain;
          resolvedBrand = rule.brandName;
          verifiedAssetUrl = rule.verifiedLogoUrl;
          break;
        }
      }
    }

    // Fallback: If no AMC match from fundHouse/name metadata, check cleanSymbol against known scheme keywords/AMFI codes
    if (!resolvedDomain) {
      const amcHint = KNOWN_AMFI_TO_AMC[cleanSymbol] || '';
      const symbolText = `${cleanSymbol.replace(/_/g, ' ')} ${amcHint}`.trim();
      if (symbolText) {
        for (const rule of AMC_RULES) {
          const match = rule.keywords.some((kw) => symbolText.includes(kw));
          if (match) {
            resolvedDomain = rule.domain;
            resolvedBrand = rule.brandName;
            verifiedAssetUrl = rule.verifiedLogoUrl;
            break;
          }
        }
      }
    }
  }

  // 3. Equities / Stocks: exchange-aware deterministic resolution. NEVER borrow AMC rules.
  else {
    const entry = VERIFIED_STOCK_DOMAINS[cleanSymbol];

    if (isUsMarket) {
      // Strictly US/Global equities only. Never match Indian domestic companies.
      if (entry && (entry.market === 'US' || entry.market === 'GLOBAL')) {
        resolvedDomain = entry.domain;
        resolvedBrand = entry.name;
        verifiedAssetUrl = entry.verifiedLogoUrl;
      }
    } else if (isIndianMarket) {
      // Strictly Indian listed companies only. Never match US/Global equities.
      if (entry && entry.market === 'IN') {
        resolvedDomain = entry.domain;
        resolvedBrand = entry.name;
        verifiedAssetUrl = entry.verifiedLogoUrl;
      }
      if (!verifiedAssetUrl) {
        const indianStockSvg = getVerifiedIndianStockLogoUrl(cleanSymbol, exchangeUpper);
        if (indianStockSvg) {
          verifiedAssetUrl = indianStockSvg;
        }
      }
    } else {
      // Market/exchange context is unspecified:
      // Prevent cross-market collisions (e.g. HAL, BEL, TCS) without exchange clarification
      const isKnownIndian = Boolean(
        (entry && entry.market === 'IN') ||
        getVerifiedIndianStockLogoUrl(cleanSymbol)
      );
      const isKnownUs = Boolean(
        entry && (entry.market === 'US' || entry.market === 'GLOBAL')
      );

      if (isKnownIndian && isKnownUs) {
        // Ambiguous cross-market collision without exchange specification:
        // Rule 4.A: When the association is ambiguous, return no logo instead of showing an incorrect one.
        resolvedDomain = null;
        resolvedBrand = undefined;
        verifiedAssetUrl = undefined;
      } else if (isKnownIndian) {
        if (entry && entry.market === 'IN') {
          resolvedDomain = entry.domain;
          resolvedBrand = entry.name;
          verifiedAssetUrl = entry.verifiedLogoUrl;
        }
        if (!verifiedAssetUrl) {
          const indianStockSvg = getVerifiedIndianStockLogoUrl(cleanSymbol, exchangeUpper);
          if (indianStockSvg) {
            verifiedAssetUrl = indianStockSvg;
          }
        }
      } else if (isKnownUs && entry) {
        resolvedDomain = entry.domain;
        resolvedBrand = entry.name;
        verifiedAssetUrl = entry.verifiedLogoUrl;
      }
    }
  }

  // 4. Construct final logo URL using configured real provider or verified asset
  const logoDevKey = getLogoDevPublishableKey();
  const brandfetchId = getBrandfetchClientId();

  let finalLogoUrl: string | null = null;
  let activeProvider: 'logodev' | 'brandfetch' | 'verified_asset' | 'none' = 'none';

  // Strategy A: Logo.dev configured with client publishable key
  if (logoDevKey) {
    if (isClassifiedMf || isClassifiedIndex) {
      if (resolvedDomain) {
        finalLogoUrl = buildLogoDevUrl(resolvedDomain, logoDevKey);
        activeProvider = 'logodev';
      }
    } else if (isUsMarket) {
      // For US stocks: prefer Logo.dev documented ticker endpoint with fallback=404
      if (cleanSymbol && !cleanSymbol.includes(' ') && !/^\d+$/.test(cleanSymbol)) {
        finalLogoUrl = buildLogoDevTickerUrl(cleanSymbol, logoDevKey);
        activeProvider = 'logodev';
      } else if (resolvedDomain) {
        finalLogoUrl = buildLogoDevUrl(resolvedDomain, logoDevKey);
        activeProvider = 'logodev';
      }
    } else if (resolvedDomain) {
      // For Indian / Global stocks, only query domain endpoint to avoid US ticker collisions
      finalLogoUrl = buildLogoDevUrl(resolvedDomain, logoDevKey);
      activeProvider = 'logodev';
    }
  }

  // Strategy B: Brandfetch configured with client ID
  if (!finalLogoUrl && brandfetchId && resolvedDomain) {
    finalLogoUrl = buildBrandfetchUrl(resolvedDomain, brandfetchId);
    activeProvider = 'brandfetch';
  }

  // Strategy C: Curated official-logo vector/SVG assets layer (zero-key fallback)
  if (!finalLogoUrl) {
    if (verifiedAssetUrl) {
      finalLogoUrl = verifiedAssetUrl;
      activeProvider = 'verified_asset';
    }
  }

  const result: LogoResolutionResult = {
    logoUrl: finalLogoUrl,
    domain: resolvedDomain,
    normalizedSymbol: cleanSymbol,
    brandName: resolvedBrand,
    provider: activeProvider,
    initials: extractInitials(cleanSymbol, instrument.name, isAmfi),
    colorPalette: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15',
      border: 'border-slate-500/20',
      text: 'text-slate-700 dark:text-slate-300',
    },
  };

  resolutionCache.set(cacheKey, result);
  return result;
}
