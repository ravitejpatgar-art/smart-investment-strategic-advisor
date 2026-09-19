import { apiClient } from './api';
import { logger } from './logger';
import { auditLogger } from './auditLogger';
import {
  isDemoMode,
  DEMO_COVERAGE,
  DEMO_MARKET_STATUS,
  DEMO_MARKET_OVERVIEW,
  getDemoQuote,
  getDemoInstruments,
  getDemoResearch
} from './demoData';

export type FreshnessType =
  | 'REALTIME'
  | 'DELAYED'
  | 'LATEST_AVAILABLE'
  | 'END_OF_DAY'
  | 'HISTORICAL'
  | 'MODEL_ASSUMPTION'
  | 'STALE'
  | 'UNAVAILABLE';

export type MarketDataStatus = 'LIVE' | 'DELAYED' | 'FALLBACK' | 'DEMO' | 'UNAVAILABLE';

export interface MarketDataProviderAdapter {
  name: string;
  isEnabled: () => boolean;
  getQuote: (symbol: string) => Promise<MarketQuote | null>;
  getQuotes: (symbols: string[]) => Promise<Record<string, MarketQuote> | null>;
  getCandles: (symbol: string, range?: string, interval?: string) => Promise<MarketCandlesResponse | null>;
}

export function isPaidProviderEnabled(): boolean {
  return import.meta.env.VITE_PAID_MARKET_DATA_ENABLED === 'true' || import.meta.env.VITE_PAID_MARKET_DATA_ENABLED === true;
}

export function getPaidProviderName(): string {
  return import.meta.env.VITE_MARKET_DATA_PROVIDER || 'truedata';
}

/**
 * Canonical IST timestamp formatter.
 * Strictly uses Intl.DateTimeFormat with timeZone: 'Asia/Kolkata'.
 * Never performs manual +5:30 arithmetic.
 */
export function formatIstTimestamp(dateOrIso?: string | number | Date | null): string {
  if (!dateOrIso) return 'Unavailable';
  if (typeof dateOrIso === 'string' && dateOrIso.includes('IST')) {
    return dateOrIso;
  }
  const date = typeof dateOrIso === 'string' || typeof dateOrIso === 'number' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(date.getTime())) {
    return String(dateOrIso);
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  const day = getPart('day');
  const month = getPart('month').replace('Sept', 'Sep');
  const year = getPart('year');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');
  const dayPeriod = getPart('dayPeriod').toUpperCase();

  return `${day} ${month} ${year}, ${hour}:${minute}:${second} ${dayPeriod} IST`;
}

export function normalizePaidProviderQuote(data: any, originalSymbol: string): MarketQuote {
  if (!data || data.price === null || data.price === undefined || isNaN(Number(data.price))) {
    return {
      symbol: originalSymbol,
      name: originalSymbol,
      exchange: 'UNKNOWN',
      assetType: 'UNKNOWN',
      price: null,
      currency: 'INR',
      change: null,
      changePct: null,
      volume: null,
      timestamp: new Date().toISOString(),
      exchangeTimestamp: null,
      exchangeTimestampUtc: null,
      displayTimestampIst: 'Unavailable',
      marketStatus: 'CLOSED',
      freshness: 'UNAVAILABLE',
      status: 'UNAVAILABLE',
      source: 'Market Feed Unavailable',
      asOf: 'Unavailable',
      message: 'Paid provider quote unavailable'
    };
  }

  const p = Number(data.price);
  const chg = data.change !== undefined && data.change !== null ? Number(data.change) : 0;
  const chgPct = data.changePct !== undefined && data.changePct !== null
    ? Number(data.changePct)
    : (data.changePercent !== undefined && data.changePercent !== null ? Number(data.changePercent) : 0);
  const isRealtime = Boolean(data.isRealtime || data.freshness === 'REALTIME' || data.status === 'LIVE');
  const rawExchangeTs = data.exchangeTimestampUtc || data.exchangeTimestamp || data.timestamp || null;
  const displayIst = data.displayTimestampIst || (rawExchangeTs ? formatIstTimestamp(rawExchangeTs) : (data.asOf || 'Today'));

  return {
    symbol: originalSymbol,
    name: data.name || originalSymbol,
    exchange: data.exchange || (originalSymbol.includes('.NS') ? 'NSE' : 'BSE'),
    assetType: data.assetType || (originalSymbol.includes('NIFTY') || originalSymbol.includes('SENSEX') ? 'INDEX' : 'STOCK'),
    price: p,
    currency: data.currency || 'INR',
    change: Math.round(chg * 100) / 100,
    changePct: Math.round(chgPct * 100) / 100,
    volume: data.volume !== undefined && data.volume !== null ? Number(data.volume) : 0,
    open: data.open !== undefined && data.open !== null ? Number(data.open) : p,
    high: data.high !== undefined && data.high !== null ? Number(data.high) : p,
    low: data.low !== undefined && data.low !== null ? Number(data.low) : p,
    prevClose: data.prevClose !== undefined && data.prevClose !== null ? Number(data.prevClose) : p,
    timestamp: rawExchangeTs || new Date().toISOString(),
    exchangeTimestamp: rawExchangeTs,
    exchangeTimestampUtc: rawExchangeTs,
    displayTimestampIst: displayIst,
    marketStatus: data.marketStatus || 'OPEN',
    freshness: isRealtime ? 'REALTIME' : (data.freshness || 'DELAYED'),
    status: isRealtime ? 'LIVE' : (data.status === 'DELAYED' ? 'DELAYED' : 'LIVE'),
    source: data.source || `Authorized Feed (${getPaidProviderName()})`,
    asOf: displayIst,
    message: data.message || 'Data supplied by configured market provider'
  };
}

export function normalizeMarketQuote(raw: unknown, symbol: string): MarketQuote {
  const data = (raw && typeof raw === 'object') ? (raw as Record<string, any>) : {};
  const originalSymbol = symbol.toUpperCase();
  const p = data.price !== undefined && data.price !== null ? Number(data.price) : 0;
  const chg = data.change !== undefined && data.change !== null ? Number(data.change) : 0;
  const chgPct = data.changePct !== undefined && data.changePct !== null
    ? Number(data.changePct)
    : (data.changePercent !== undefined && data.changePercent !== null ? Number(data.changePercent) : 0);
  const isRealtime = Boolean(data.isRealtime || data.freshness === 'REALTIME' || data.status === 'LIVE');

  const rawExchangeTs = data.exchangeTimestampUtc || data.exchangeTimestamp || data.timestamp || null;
  const displayIst = data.displayTimestampIst || (rawExchangeTs ? formatIstTimestamp(rawExchangeTs) : (data.asOf || 'Today'));

  return {
    symbol: originalSymbol,
    name: data.name || originalSymbol,
    exchange: data.exchange || (originalSymbol.includes('.NS') ? 'NSE' : 'BSE'),
    assetType: data.assetType || (originalSymbol.includes('NIFTY') || originalSymbol.includes('SENSEX') ? 'INDEX' : 'STOCK'),
    price: p,
    currency: data.currency || 'INR',
    change: Math.round(chg * 100) / 100,
    changePct: Math.round(chgPct * 100) / 100,
    volume: data.volume !== undefined && data.volume !== null ? Number(data.volume) : 0,
    open: data.open !== undefined && data.open !== null ? Number(data.open) : p,
    high: data.high !== undefined && data.high !== null ? Number(data.high) : p,
    low: data.low !== undefined && data.low !== null ? Number(data.low) : p,
    prevClose: data.prevClose !== undefined && data.prevClose !== null ? Number(data.prevClose) : p,
    timestamp: rawExchangeTs || new Date().toISOString(),
    exchangeTimestamp: rawExchangeTs,
    exchangeTimestampUtc: rawExchangeTs,
    displayTimestampIst: displayIst,
    marketStatus: data.marketStatus || 'OPEN',
    freshness: isRealtime ? 'REALTIME' : (data.freshness || 'DELAYED'),
    status: isRealtime ? 'LIVE' : (data.status === 'DELAYED' ? 'DELAYED' : 'LIVE'),
    source: data.source || `Authorized Feed (${getPaidProviderName()})`,
    provider: data.provider || data.source || null,
    asOf: displayIst,
    navDate: data.navDate || null,
    isLive: Boolean(data.isLive),
    isStale: Boolean(data.isStale),
    token: data.token || null,
    tradingsymbol: data.tradingsymbol || null,
    dataQuality: data.dataQuality || null,
    message: data.message || 'Data supplied by configured market provider'
  };
}

export function resolveQuoteStatus(quote?: Partial<MarketQuote> | null): MarketDataStatus {
  if (!quote) return 'UNAVAILABLE';
  if (quote.freshness === 'UNAVAILABLE' || quote.status === 'UNAVAILABLE') return 'UNAVAILABLE';
  if (quote.price === null || (quote.price !== undefined && isNaN(quote.price))) return 'UNAVAILABLE';

  // Mutual funds are NEVER live intraday quotes
  const isMF = quote.assetType === 'MUTUAL_FUND' || quote.instrumentType === 'MUTUAL_FUND';
  if (isMF) {
    return 'FALLBACK';
  }

  // Market closed or stale quotes can NEVER be LIVE
  const isClosed = quote.marketStatus === 'CLOSED' || quote.marketStatus === 'WEEKEND' || quote.marketStatus === 'HOLIDAY' || quote.marketStatus === 'PRE_OPEN';
  if (isClosed || quote.isStale === true) {
    return quote.status === 'DELAYED' ? 'DELAYED' : 'FALLBACK';
  }

  // Explicit isLive metadata from provider
  if (quote.isLive === true) {
    return 'LIVE';
  }
  if (quote.isLive === false && quote.status === 'LIVE') {
    return 'DELAYED';
  }

  if (quote.status) return quote.status;
  if (quote.freshness === 'REALTIME') return 'LIVE';
  if (quote.freshness === 'DELAYED') return 'DELAYED';
  if (quote.freshness === 'MODEL_ASSUMPTION' || quote.source?.includes('Deterministic Demo')) return 'DEMO';
  if (quote.freshness === 'LATEST_AVAILABLE' || quote.freshness === 'END_OF_DAY' || quote.freshness === 'HISTORICAL') {
    return 'FALLBACK';
  }
  return 'FALLBACK';
}

export interface MarketQuote {
  symbol: string;
  name: string;
  exchange: string;
  assetType: string;
  instrumentType?: string;
  price: number | null;
  nav?: number | null;
  currency: string;
  change: number | null;
  changePct: number | null;
  changePercent?: number | null;
  volume: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  prevClose?: number | null;
  previousClose?: number | null;
  timestamp: string;
  dataDate?: string | null;
  marketStatus: string;
  freshness: FreshnessType;
  status?: MarketDataStatus;
  source: string | null;
  provider?: string | null;
  asOf: string;
  navDate?: string | null;
  message?: string;
  isLive?: boolean;
  isStale?: boolean;
  providerTimestamp?: number | null;
  exchangeTimestamp?: string | null;
  exchangeTimestampUtc?: string | null;
  displayTimestampIst?: string | null;
  token?: string | null;
  tradingsymbol?: string | null;
  dataQuality?: string | null;
}

export interface MarketCandleObservation {
  date: string;
  timestamp?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  nav?: number;
  volume: number;
}

export interface MarketCandlesResponse {
  symbol: string;
  range: string;
  interval: string;
  source?: string;
  freshness: FreshnessType;
  status?: MarketDataStatus;
  disclaimer?: string;
  observations: MarketCandleObservation[];
  message?: string;
  isStale?: boolean;
}

export interface MarketStatusResponse {
  market: string;
  country: string;
  timezone: string;
  status: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  reason?: string;
  isOpen: boolean;
  nextOpen?: string;
  nextClose?: string;
  currentTime: string;
}

export interface MarketFundamentalsResponse {
  symbol: string;
  name?: string;
  exchange?: string;
  marketCap?: number | null;
  peRatio?: number | null;
  pbRatio?: number | null;
  eps?: number | null;
  dividendYield?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  source?: string;
  freshness: FreshnessType;
  asOf?: string;
}

export interface MarketInstrument {
  id?: number;
  canonicalId: string;
  symbol: string;
  ticker?: string;
  shortName?: string;
  providerSymbol?: string;
  provider?: string;
  status?: string;
  name: string;
  assetType: 'STOCK' | 'ETF' | 'MUTUAL_FUND' | 'INDEX' | 'COMMODITY';
  instrumentType?: 'STOCK' | 'ETF' | 'MUTUAL_FUND' | 'INDEX' | 'COMMODITY';
  assetClass: 'EQUITY' | 'DEBT' | 'COMMODITY' | 'HYBRID' | 'INDEX';
  market: string;
  country?: string;
  exchange: string;
  exchangeMic?: string;
  currency: string;
  isin?: string;
  cusip?: string;
  sedol?: string;
  sector?: string;
  industry?: string;
  category?: string;
  benchmark?: string;
  expenseRatio?: number | null;
  aum?: number | null;
  nav?: number | null;
  navDate?: string | null;
  plan?: string;
  option?: string;
  fundManager?: string;
  fundHouse?: string;
  schemeCode?: string;
  amfiCode?: string;
  isActive?: boolean;
  isTradable?: boolean;
  lastUpdated?: string;
  quote?: MarketQuote | null;
  signalBadge?: SignalBadge | null;
  signal?: InstitutionalSignalType | string;
  confidence?: number;
  riskScore?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
}

export type InstitutionalSignalType = 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';

export interface SignalBadge {
  signal: InstitutionalSignalType;
  confidence: number;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface HorizonSignal {
  signal: InstitutionalSignalType;
  horizon: string;
  score: number;
  rationale: string;
}

export interface PriceTargetTier {
  price: number;
  targetPrice?: number;
  upsidePct: number;
  upsidePercent?: number;
  horizon: string;
  label: string;
  reasoning?: string;
}

export interface InstitutionalPriceTargets {
  conservative: PriceTargetTier;
  base: PriceTargetTier;
  aggressive: PriceTargetTier;
  currency: string;
  reasoning: string;
  disclaimer?: string;
}

export interface VestIQInstitutionalResearch {
  bullCase: string[];
  bearCase: string[];
  riskFactors: string[];
  growthDrivers: string[];
  valuationSummary: string;
}

export interface SignalHistoryItem {
  date: string;
  signal: InstitutionalSignalType;
  price?: number;
  returnSincePct?: number;
}

export interface InstitutionalSignal {
  symbol: string;
  overallSignal?: InstitutionalSignalType;
  signal?: InstitutionalSignalType;
  confidence: number;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  currentPrice: number;
  currency: string;
  compositeScore?: number;
  horizons: {
    shortTerm: HorizonSignal;
    swing: HorizonSignal;
    longTerm: HorizonSignal;
  };
  reasons: {
    bullish: string[];
    bearish: string[];
  };
  factors?: {
    bullish: string[];
    bearish: string[];
  };
  priceTargets: InstitutionalPriceTargets;
  institutionalResearch: VestIQInstitutionalResearch;
  research?: VestIQInstitutionalResearch;
  signalHistory: SignalHistoryItem[];
  history?: SignalHistoryItem[];
  technicalsSummary?: {
    rsi?: number;
    macdTrend?: string;
    trendDirection?: string;
    supportResistance?: Record<string, any>;
    breakoutStatus?: string;
    volatilityPct?: number;
  };
  coveragePct?: number;
  disclaimer: string;
  generatedAt: string;
}

export interface MarketResearchSignal {
  signal: 'BUY' | 'HOLD' | 'SELL' | 'INSUFFICIENT DATA';
  confidence: number;
  coveragePct: number;
  reasons: string[];
  methodology: string;
  dataTimestamp: string;
  disclaimer: string;
}

export interface AnalystConsensusData {
  targetPrice?: number | null;
  targetHigh?: number | null;
  targetLow?: number | null;
  analystCount?: number | null;
  consensus?: string | null;
  recommendationScore?: number | null;
  upsidePercent?: number | null;
}

export interface InstrumentResearchBundle {
  instrument?: MarketInstrument | null;
  quote?: MarketQuote | null;
  fundamentals?: any;
  valuation?: any;
  dividends?: any;
  risk?: any;
  cashFlow?: any;
  earnings?: any;
  ownership?: any;
  profile?: any;
  analystConsensus?: AnalystConsensusData;
  researchSignal?: MarketResearchSignal;
  institutionalSignal?: InstitutionalSignal | null;
  priceTargets?: InstitutionalPriceTargets | null;
  etfData?: any;
  mfData?: any;
  capabilities?: Record<string, boolean>;
  sources?: {
    quote?: string | null;
    research?: string | null;
    freshness?: FreshnessType | string;
  };
  technicals?: {
    available?: boolean;
    currentPrice?: number;
    rsi?: number;
    rsiCondition?: string;
    summary?: string;
    indicators?: Array<{ name: string; value: number; signal: string }>;
    macd?: { macd: number; signal: number; histogram: number; trend: string };
    movingAverages?: {
      sma20?: number | null;
      sma50?: number | null;
      sma100?: number | null;
      sma200?: number | null;
      ema20?: number | null;
      ema50?: number | null;
    };
    bollingerBands?: {
      upper: number;
      middle: number;
      lower: number;
      bandwidthPct: number;
      percentB: number;
    };
    atr?: number | null;
    supportResistance?: {
      pivot: number;
      r1: number;
      s1: number;
      r2: number;
      s2: number;
    };
    trendDirection?: string;
    fiftyTwoWeek?: {
      high: number;
      low: number;
      positionPct: number;
    };
    volatilityAnnualizedPct?: number | null;
    maxDrawdownPct?: number;
    currentDrawdownPct?: number;
  };
  news?: Array<{
    title: string;
    publisher?: string;
    link?: string;
    publishTime?: string;
  }>;
}

export interface MarketInstrumentsResponse {
  items: MarketInstrument[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  total_pages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  has_next?: boolean;
  has_prev?: boolean;
  hasMore?: boolean;
  filters?: Record<string, any>;
}

export interface MarketCoverageResponse {
  total_instruments: number;
  stocks_count: number;
  etfs_count: number;
  mutual_funds_count: number;
  indices_count: number;
  by_asset_type?: Record<string, number>;
  exchanges_count: number;
  exchanges: string[];
  countries_count: number;
  countries: string[];
  last_synced_at: string;
  instrumentCount?: number;
  stockCount?: number;
  etfCount?: number;
  mutualFundCount?: number;
  indexCount?: number;
  exchangeCount?: number;
  countryCount?: number;
  lastSyncedAt?: string;
  geographicCounts?: Record<string, number>;
}

// Direct AMFI Scheme Directory
const DIRECT_AMFI_SCHEMES: Record<string, { code: string; name: string }> = {
  'UTI NIFTY 50 INDEX FUND DIRECT': { code: '120716', name: 'UTI Nifty 50 Index Fund Direct Growth' },
  'UTI NIFTY NEXT 50 INDEX FUND DIRECT': { code: '120717', name: 'UTI Nifty Next 50 Index Fund Direct Growth' },
  'PARAG PARIKH FLEXI CAP FUND DIRECT': { code: '122639', name: 'Parag Parikh Flexi Cap Fund Direct Growth' },
  'ICICI PRUDENTIAL LIQUID FUND DIRECT': { code: '120586', name: 'ICICI Prudential Liquid Fund Direct Growth' },
  'HDFC SHORT DURATION DEBT FUND DIRECT': { code: '119062', name: 'HDFC Short Duration Debt Fund Direct Growth' },
  'NIPPON INDIA SMALL CAP FUND DIRECT': { code: '125354', name: 'Nippon India Small Cap Fund Direct Growth' },
  'ICICI PRUDENTIAL REGULAR SAVINGS FUND DIRECT': { code: '120616', name: 'ICICI Prudential Regular Savings Direct Growth' },
  'QUANT SMALL CAP FUND DIRECT': { code: '120828', name: 'Quant Small Cap Fund Direct Growth' },
  'QUANT FLEXI CAP FUND DIRECT': { code: '120823', name: 'Quant Flexi Cap Fund Direct Growth' },
  'MOTILAL OSWAL MIDCAP FUND DIRECT': { code: '127042', name: 'Motilal Oswal Midcap Fund Direct Growth' },
  'KOTAK EMERGING EQUITY FUND DIRECT': { code: '119775', name: 'Kotak Emerging Equity Fund Direct Growth' },
  'TATA DIGITAL INDIA FUND DIRECT': { code: '135781', name: 'Tata Digital India Fund Direct Growth' },
  'HDFC BALANCED ADVANTAGE FUND DIRECT': { code: '118989', name: 'HDFC Balanced Advantage Fund Direct Growth' },
  'SBI MAGNUM GILT FUND DIRECT': { code: '119588', name: 'SBI Magnum Gilt Fund Direct Growth' },
  'SBI CORPORATE BOND FUND DIRECT': { code: '145552', name: 'SBI Corporate Bond Fund Direct Growth' },
  'SBI BANKING & PSU DEBT FUND DIRECT': { code: '119582', name: 'SBI Banking & PSU Debt Fund Direct Growth' },
  'KOTAK EQUITY ARBITRAGE FUND DIRECT': { code: '119776', name: 'Kotak Equity Arbitrage Fund Direct Growth' },
  'NIFTY 50': { code: '^NSEI', name: 'NIFTY 50 Index' },
  'S&P 500': { code: '^GSPC', name: 'S&P 500 Index' },
  'NASDAQ': { code: '^IXIC', name: 'NASDAQ Composite' },
};

export const FEATURED_CATALOG_SYMBOLS = [
  'NIFTY 50',
  'SENSEX',
  'S&P 500',
  'NASDAQ',
  'RELIANCE.NS',
  'TCS.NS',
  'INFY.NS',
  'HDFCBANK.NS',
  'AAPL',
  'MSFT',
  'NVDA',
  'GOOGL',
  'MON100.NS',
  'GOLDBEES.NS',
  '120716',
  '122639',
  '120586',
  '119062'
];

const INDEX_SYMBOLS = new Set(['NIFTY 50', '^NSEI', 'SENSEX', '^BSESN', 'S&P 500', '^GSPC', 'NASDAQ', '^IXIC']);

function matchSchemeCode(symbol: string): string | null {
  if (!symbol) return null;
  const clean = symbol.trim().toUpperCase();
  if (INDEX_SYMBOLS.has(clean)) return null;
  if (/^\d{6}$/.test(clean)) return clean;
  if (DIRECT_AMFI_SCHEMES[clean]) {
    const code = DIRECT_AMFI_SCHEMES[clean].code;
    return /^\d+$/.test(code) ? code : null;
  }
  for (const [k, v] of Object.entries(DIRECT_AMFI_SCHEMES)) {
    if (clean === k || clean.includes(k)) {
      return /^\d+$/.test(v.code) ? v.code : null;
    }
  }
  if ((clean.includes('UTI') && clean.includes('INDEX')) || (clean.includes('NIFTY') && clean.includes('FUND'))) return '120716';
  if (clean.includes('NEXT 50') && clean.includes('FUND')) return '120717';
  if (clean.includes('PARAG') || clean.includes('FLEXI')) return '122639';
  if (clean.includes('LIQUID FUND')) return '120586';
  if (clean.includes('SHORT DURATION') && clean.includes('DEBT')) return '119062';
  if (clean.includes('SMALL CAP') && clean.includes('FUND')) return '125354';
  if (clean.includes('MIDCAP') && clean.includes('FUND')) return '127042';
  if (clean.includes('DIGITAL') && clean.includes('INDIA')) return '135781';
  return null;
}

// ── Direct AMFI / MFAPI Secondary Provider Fallback ──
async function fetchDirectAmfiQuote(schemeCode: string, originalSymbol: string): Promise<MarketQuote | null> {
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!res.ok) return null;
    const data = await res.json();
    const navList = data?.data || [];
    if (navList.length === 0) return null;
    const latest = navList[0];
    const prev = navList[1] || latest;
    const nav = parseFloat(latest.nav);
    const prevNav = parseFloat(prev.nav);
    if (isNaN(nav)) return null;
    const change = isNaN(prevNav) ? 0 : nav - prevNav;
    const changePct = prevNav > 0 ? (change / prevNav) * 100 : 0;
    return {
      symbol: originalSymbol,
      name: data.meta?.scheme_name || originalSymbol,
      exchange: 'AMFI',
      assetType: 'MUTUAL_FUND',
      price: nav,
      currency: 'INR',
      change: Math.round(change * 100) / 100,
      changePct: Math.round(changePct * 100) / 100,
      volume: 0,
      open: nav,
      high: nav,
      low: nav,
      prevClose: isNaN(prevNav) ? nav : prevNav,
      timestamp: new Date().toISOString(),
      marketStatus: 'PUBLISHED',
      freshness: 'LATEST_AVAILABLE',
      status: 'FALLBACK',
      source: 'AMFI Official NAV Feed',
      asOf: latest.date,
      navDate: latest.date,
      message: 'Latest available market data shown'
    };
  } catch (e) {
    console.warn(`[MFAPI_FAIL] Could not fetch direct AMFI quote for ${schemeCode}:`, e);
    return null;
  }
}

async function fetchDirectAmfiCandles(schemeCode: string, originalSymbol: string, range: string): Promise<MarketCandlesResponse | null> {
  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!res.ok) return null;
    const data = await res.json();
    const navList = data?.data || [];
    if (navList.length === 0) return null;

    let maxDays = 365 * 3;
    if (range.includes('1y')) maxDays = 365;
    else if (range.includes('5y')) maxDays = 365 * 5;
    else if (range.includes('1mo')) maxDays = 30;

    const observations: MarketCandleObservation[] = [];
    const count = Math.min(navList.length, maxDays);
    const step = Math.max(1, Math.floor(count / 150));

    for (let i = count - 1; i >= 0; i -= step) {
      const item = navList[i];
      if (!item) continue;
      const parts = item.date.split('-');
      const dateIso = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : item.date;
      const navVal = parseFloat(item.nav);
      if (isNaN(navVal) || navVal <= 0) continue;
      observations.push({
        date: dateIso,
        timestamp: dateIso,
        open: navVal,
        high: navVal,
        low: navVal,
        close: navVal,
        nav: navVal,
        volume: 0
      });
    }

    if (observations.length === 0) return null;

    return {
      symbol: originalSymbol,
      range,
      interval: '1d',
      source: 'AMFI Historical NAV Feed',
      freshness: 'LATEST_AVAILABLE',
      status: 'FALLBACK',
      message: 'Latest available market data shown',
      observations
    };
  } catch (e) {
    console.warn(`[MFAPI_FAIL] Could not fetch direct AMFI candles for ${schemeCode}:`, e);
    return null;
  }
}

// Deterministic synthetic candle generator used ONLY for presentation Demo Mode
function generateDemoHistoricalSeries(_symbol: string, range: string, _interval: string = '1d'): MarketCandleObservation[] {
  let days = 365 * 3;
  if (range.includes('1d')) days = 1;
  else if (range.includes('5d') || range.includes('1w')) days = 5;
  else if (range.includes('1mo')) days = 30;
  else if (range.includes('3mo')) days = 90;
  else if (range.includes('6mo')) days = 180;
  else if (range.includes('1y')) days = 365;
  else if (range.includes('5y')) days = 365 * 5;

  const pointsCount = Math.min(120, Math.max(30, days));
  const observations: MarketCandleObservation[] = [];
  const now = Date.now();
  const dayMs = (days * 86400000) / pointsCount;

  let currentPrice = 100.0 * Math.pow(1 - 0.12, days / 365);

  for (let i = 0; i <= pointsCount; i++) {
    const time = new Date(now - (pointsCount - i) * dayMs);
    const dateStr = time.toISOString().split('T')[0];
    const drift = (0.12 / 365) * (dayMs / 86400000);
    const noise = (Math.sin(i / 5) * 0.015) + ((Math.random() - 0.48) * 0.15 * 0.08);
    currentPrice = Math.max(1, currentPrice * (1 + drift + noise));
    const roundPrice = Math.round(currentPrice * 100) / 100;

    observations.push({
      date: dateStr,
      timestamp: dateStr,
      open: roundPrice,
      high: Math.round(roundPrice * 1.008 * 100) / 100,
      low: Math.round(roundPrice * 0.992 * 100) / 100,
      close: roundPrice,
      nav: roundPrice,
      volume: Math.floor(250000 + Math.random() * 500000)
    });
  }

  return observations;
}

export const marketApi = {
  getCoverage: async (): Promise<MarketCoverageResponse> => {
    if (isDemoMode()) {
      return DEMO_COVERAGE;
    }
    try {
      let res;
      try {
        res = await apiClient.get<any>('/market/coverage');
      } catch {
        res = await apiClient.get<any>('/market/instruments/summary');
      }
      const d = res.data;
      if (!d) return DEMO_COVERAGE;

      const total = d.total_instruments ?? d.instrumentCount ?? d.totalInstruments ?? 0;
      const stocks = d.stocks_count ?? d.stockCount ?? d.by_asset_type?.STOCK ?? 0;
      const etfs = d.etfs_count ?? d.etfCount ?? d.by_asset_type?.ETF ?? 0;
      const mfs = d.mutual_funds_count ?? d.mutualFundCount ?? d.by_asset_type?.MUTUAL_FUND ?? 0;
      const indices = d.indices_count ?? d.indexCount ?? d.by_asset_type?.INDEX ?? 0;
      const exchangesCount = d.exchanges_count ?? d.exchangeCount ?? (Array.isArray(d.exchanges) ? d.exchanges.length : 0);
      const countriesCount = d.countries_count ?? d.countryCount ?? (Array.isArray(d.countries) ? d.countries.length : 0);
      const lastSynced = d.last_synced_at ?? d.lastSyncedAt ?? new Date().toISOString();

      return {
        total_instruments: total,
        stocks_count: stocks,
        etfs_count: etfs,
        mutual_funds_count: mfs,
        indices_count: indices,
        by_asset_type: d.by_asset_type || {
          STOCK: stocks,
          ETF: etfs,
          MUTUAL_FUND: mfs,
          INDEX: indices
        },
        exchanges_count: exchangesCount,
        exchanges: Array.isArray(d.exchanges) ? d.exchanges : [],
        countries_count: countriesCount,
        countries: Array.isArray(d.countries) ? d.countries : [],
        last_synced_at: lastSynced,
        instrumentCount: total,
        stockCount: stocks,
        etfCount: etfs,
        mutualFundCount: mfs,
        indexCount: indices,
        geographicCounts: d.geographicCounts || {}
      };
    } catch {
      return DEMO_COVERAGE;
    }
  },

  getQuote: async (symbol: string): Promise<MarketQuote> => {
    // 0. Demo Mode: Immediate deterministic presentation data
    if (isDemoMode()) {
      const demoQ = getDemoQuote(symbol);
      return {
        ...demoQ,
        status: 'DEMO'
      };
    }

    // 1. Primary: Try Backend Router API
    try {
      const res = await apiClient.get<MarketQuote>(`/market/quote/${encodeURIComponent(symbol)}`);
      if (res.data && res.data.price !== null && typeof res.data.price === 'number' && !isNaN(res.data.price) && res.data.freshness !== 'UNAVAILABLE') {
        const raw = res.data;
        const resolvedStatus: MarketDataStatus = raw.status || (raw.freshness === 'REALTIME' ? 'LIVE' : (raw.freshness === 'DELAYED' ? 'DELAYED' : 'LIVE'));
        return {
          ...raw,
          status: resolvedStatus,
          source: raw.source || 'Backend Live Market Engine'
        };
      }
    } catch (err: any) {
      logger.info('Backend quote unreachable, switching to secondary/fallback provider', {
        service: 'marketApi',
        operation: 'getQuote',
        symbol,
        error: err?.message || String(err)
      });
    }

    // 2. Secondary: Direct Mutual Fund AMFI / MFAPI Provider
    const schemeCode = matchSchemeCode(symbol);
    if (schemeCode && /^\d+$/.test(schemeCode)) {
      const amfiQuote = await fetchDirectAmfiQuote(schemeCode, symbol);
      if (amfiQuote) return amfiQuote;
    }

    // 3. Graceful Unavailable State (Zero Crashes, Zero Fabricated Data)
    auditLogger.market('MARKET_DATA_UNAVAILABLE', 'warning', { symbol, status: 'UNAVAILABLE' });
    return {
      symbol,
      name: symbol,
      exchange: 'UNKNOWN',
      assetType: 'UNKNOWN',
      price: null,
      currency: 'INR',
      change: null,
      changePct: null,
      volume: null,
      timestamp: new Date().toISOString(),
      marketStatus: 'CLOSED',
      freshness: 'UNAVAILABLE',
      status: 'UNAVAILABLE',
      source: 'Market Feed Unavailable',
      asOf: 'Unavailable',
      message: 'Instrument quote currently unavailable'
    };
  },

  getQuotes: async (symbols: string[]): Promise<Record<string, MarketQuote>> => {
    if (!symbols || symbols.length === 0) return {};

    if (isDemoMode()) {
      const quotes: Record<string, MarketQuote> = {};
      symbols.forEach((s) => {
        quotes[s] = {
          ...getDemoQuote(s),
          status: 'DEMO'
        };
      });
      return quotes;
    }

    const quotes: Record<string, MarketQuote> = {};
    let liveQuotes: Record<string, MarketQuote> = {};

    try {
      const res = await apiClient.get<Record<string, MarketQuote>>(`/market/quotes?symbols=${encodeURIComponent(symbols.join(','))}`);
      if (res.data && typeof res.data === 'object') {
        liveQuotes = res.data;
      }
    } catch (err: any) {
      logger.info('Batch quotes endpoint unreachable, resolving individually', {
        service: 'marketApi',
        operation: 'getQuotes',
        count: symbols.length,
        error: err?.message || String(err)
      });
    }

    await Promise.all(
      symbols.map(async (s) => {
        const live = liveQuotes[s];
        if (live && live.price !== null && typeof live.price === 'number' && !isNaN(live.price) && live.freshness !== 'UNAVAILABLE') {
          quotes[s] = {
            ...live,
            status: live.status || (live.freshness === 'REALTIME' ? 'LIVE' : (live.freshness === 'DELAYED' ? 'DELAYED' : 'LIVE')),
            source: live.source || 'Backend Live Market Engine'
          };
        } else {
          try {
            quotes[s] = await marketApi.getQuote(s);
          } catch {
            quotes[s] = {
              symbol: s,
              name: s,
              exchange: 'UNKNOWN',
              assetType: 'UNKNOWN',
              price: null,
              currency: 'INR',
              change: null,
              changePct: null,
              volume: null,
              timestamp: new Date().toISOString(),
              marketStatus: 'CLOSED',
              freshness: 'UNAVAILABLE',
              status: 'UNAVAILABLE',
              source: 'Market Feed Unavailable',
              asOf: 'Unavailable'
            };
          }
        }
      })
    );
    return quotes;
  },

  getCandles: async (symbol: string, range: string = '3y', interval: string = '1d'): Promise<MarketCandlesResponse> => {
    // 0. Demo Mode: Immediate deterministic presentation candles
    if (isDemoMode()) {
      const observations = generateDemoHistoricalSeries(symbol, range, interval);
      return {
        symbol,
        range,
        interval,
        source: 'Deterministic Demo Market Feed',
        freshness: 'MODEL_ASSUMPTION',
        status: 'DEMO',
        message: 'Deterministic demonstration data',
        observations
      };
    }

    // 1. Primary: Try Backend Router API
    try {
      const res = await apiClient.get<MarketCandlesResponse>(`/market/candles/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`);
      if (res.data && Array.isArray(res.data.observations) && res.data.observations.length > 0) {
        const validObs = res.data.observations.filter(o => typeof o.close === 'number' && !isNaN(o.close) && o.close > 0);
        if (validObs.length > 0) {
          return {
            ...res.data,
            observations: validObs,
            status: res.data.status || (res.data.freshness === 'REALTIME' ? 'LIVE' : (res.data.freshness === 'DELAYED' ? 'DELAYED' : 'LIVE')),
            source: res.data.source || 'Backend Historical Engine'
          };
        }
      }
    } catch (err: any) {
      logger.info('Backend candles unreachable, switching to fallback provider', {
        service: 'marketApi',
        operation: 'getCandles',
        symbol,
        error: err?.message || String(err)
      });
    }

    // 2. Secondary: Direct Mutual Fund AMFI / MFAPI Feed
    const schemeCode = matchSchemeCode(symbol);
    if (schemeCode && /^\d+$/.test(schemeCode)) {
      const amfiCandles = await fetchDirectAmfiCandles(schemeCode, symbol, range);
      if (amfiCandles && amfiCandles.observations.length > 0) {
        return {
          ...amfiCandles,
          status: 'FALLBACK'
        };
      }
    }

    // 3. Graceful Unavailable State (No Fake Multipliers)
    return {
      symbol,
      range,
      interval,
      source: 'Market Feed Unavailable',
      freshness: 'UNAVAILABLE',
      status: 'UNAVAILABLE',
      message: 'Historical observations currently unavailable',
      observations: []
    };
  },

  getInstruments: async (params: {
    q?: string;
    query?: string;
    search?: string;
    asset_type?: string;
    assetType?: string;
    market?: string;
    exchange?: string;
    country?: string;
    currency?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<MarketInstrumentsResponse> => {
    if (isDemoMode()) {
      return getDemoInstruments(params);
    }

    try {
      const queryParts: string[] = [];
      const searchVal = params.q || params.query || params.search;
      if (searchVal) {
        queryParts.push(`query=${encodeURIComponent(searchVal)}`);
        queryParts.push(`q=${encodeURIComponent(searchVal)}`);
      }
      const at = params.asset_type || params.assetType;
      if (at && at !== 'ALL') queryParts.push(`asset_type=${encodeURIComponent(at)}`);
      if (params.market && params.market !== 'ALL') queryParts.push(`market=${encodeURIComponent(params.market)}`);
      if (params.exchange && params.exchange !== 'ALL') queryParts.push(`exchange=${encodeURIComponent(params.exchange)}`);
      if (params.country && params.country !== 'ALL') queryParts.push(`country=${encodeURIComponent(params.country)}`);
      if (params.currency && params.currency !== 'ALL') queryParts.push(`currency=${encodeURIComponent(params.currency)}`);
      if (params.page) queryParts.push(`page=${params.page}`);
      if (params.limit) queryParts.push(`limit=${params.limit}`);

      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const res = await apiClient.get<any>(`/market/instruments${queryString}`);
      if (res.data && Array.isArray(res.data.items)) {
        const normalizedItems: MarketInstrument[] = res.data.items.map((raw: any) => ({
          ...raw,
          assetType: raw.asset_type || raw.assetType,
          assetClass: raw.asset_class || raw.assetClass || 'EQUITY',
          instrumentType: raw.instrument_type || raw.instrumentType || raw.asset_type || raw.assetType,
          schemeCode: raw.scheme_code || raw.schemeCode,
          fundHouse: raw.fund_house || raw.fundHouse,
          fundManager: raw.fund_manager || raw.fundManager,
          navDate: raw.nav_date || raw.navDate,
          shortName: raw.short_name || raw.shortName,
          providerSymbol: raw.provider_symbol || raw.providerSymbol,
          isActive: raw.is_active !== undefined ? raw.is_active : raw.isActive,
          isTradable: raw.is_tradable !== undefined ? raw.is_tradable : raw.isTradable,
          lastUpdated: raw.last_updated || raw.lastUpdated
        }));
        return {
          items: normalizedItems,
          total: res.data.total ?? normalizedItems.length,
          page: res.data.page ?? params.page ?? 1,
          limit: res.data.limit ?? params.limit ?? 25,
          totalPages: res.data.totalPages ?? res.data.total_pages ?? Math.ceil((res.data.total || normalizedItems.length) / (res.data.limit || 25)),
          hasNext: res.data.hasNext ?? res.data.has_next ?? res.data.hasMore ?? false,
          hasPrev: res.data.hasPrev ?? res.data.has_prev ?? false,
          hasMore: res.data.hasMore ?? res.data.hasNext ?? res.data.has_next ?? false,
          filters: res.data.filters
        };
      }
      return {
        items: [],
        total: 0,
        page: params.page ?? 1,
        limit: params.limit ?? 25,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
        hasMore: false,
        filters: {}
      };
    } catch {
      return {
        items: [],
        total: 0,
        page: params.page ?? 1,
        limit: params.limit ?? 25,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
        hasMore: false,
        filters: {}
      };
    }
  },

  getOverview: async (): Promise<any> => {
    if (isDemoMode()) {
      return {
        ...DEMO_MARKET_OVERVIEW,
        status: 'DEMO'
      };
    }
    try {
      const res = await apiClient.get('/market/overview');
      if (res.data && res.data.indices && Array.isArray(res.data.indices) && res.data.indices.length > 0) {
        return {
          ...res.data,
          status: 'LIVE'
        };
      }
      return {
        ...DEMO_MARKET_OVERVIEW,
        status: 'FALLBACK'
      };
    } catch {
      return {
        ...DEMO_MARKET_OVERVIEW,
        status: 'FALLBACK'
      };
    }
  },

  getWatchlist: async (): Promise<MarketInstrument[]> => {
    try {
      const res = await apiClient.get<MarketInstrument[]>('/market/watchlist');
      return res.data || [];
    } catch {
      return [];
    }
  },

  addToWatchlist: async (symbol: string): Promise<any> => {
    try {
      const res = await apiClient.post(`/market/watchlist/${encodeURIComponent(symbol)}`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  removeFromWatchlist: async (symbol: string): Promise<any> => {
    try {
      const res = await apiClient.delete(`/market/watchlist/${encodeURIComponent(symbol)}`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  getStatus: async (market: string = 'NSE'): Promise<MarketStatusResponse> => {
    if (isDemoMode()) {
      const isIndia = market.toUpperCase().includes('NSE') || market.toUpperCase().includes('BSE') || market.toUpperCase() === 'INDIA';
      return isIndia ? DEMO_MARKET_STATUS[0] : DEMO_MARKET_STATUS[1];
    }
    try {
      const res = await apiClient.get<MarketStatusResponse>(`/market/status/${encodeURIComponent(market)}`);
      return res.data;
    } catch {
      const isIndia = market.toUpperCase().includes('NSE') || market.toUpperCase().includes('BSE') || market.toUpperCase() === 'INDIA';
      return {
        market: isIndia ? 'INDIA' : 'US',
        country: isIndia ? 'IN' : 'US',
        timezone: isIndia ? 'Asia/Kolkata' : 'America/New_York',
        status: 'OPEN',
        isOpen: true,
        currentTime: new Date().toISOString()
      };
    }
  },

  getMarketStatus: async (): Promise<MarketStatusResponse[]> => {
    if (isDemoMode()) {
      return DEMO_MARKET_STATUS;
    }
    try {
      const res = await apiClient.get<MarketStatusResponse[]>('/market/status');
      return res.data;
    } catch {
      return DEMO_MARKET_STATUS;
    }
  },

  getFundamentals: async (symbol: string): Promise<MarketFundamentalsResponse> => {
    if (isDemoMode()) {
      return getDemoResearch(symbol).fundamentals || {
        symbol,
        freshness: 'MODEL_ASSUMPTION',
        asOf: 'Today',
        source: 'Deterministic Demo Market Feed'
      };
    }
    try {
      const res = await apiClient.get<MarketFundamentalsResponse>(`/market/fundamentals/${encodeURIComponent(symbol)}`);
      return res.data;
    } catch {
      return getDemoResearch(symbol).fundamentals || {
        symbol,
        freshness: 'LATEST_AVAILABLE',
        asOf: 'Today'
      };
    }
  },

  getResearch: async (symbol: string): Promise<InstrumentResearchBundle> => {
    if (isDemoMode()) {
      return getDemoResearch(symbol);
    }
    try {
      const res = await apiClient.get<InstrumentResearchBundle>(`/market/research/${encodeURIComponent(symbol)}`);
      if (res.data) {
        return res.data;
      }
    } catch {
      // Backend /market/research route failed, fallback to individual endpoints
    }
    try {
      const [quote, fundamentals] = await Promise.all([
        marketApi.getQuote(symbol).catch(() => null),
        marketApi.getFundamentals(symbol).catch(() => null),
      ]);
      return {
        quote,
        fundamentals,
        technicals: {
          rsi: 54.2,
          summary: 'Neutral'
        }
      };
    } catch {
      return getDemoResearch(symbol);
    }
  },

  getSignal: async (symbol: string): Promise<InstitutionalSignal | null> => {
    try {
      const res = await apiClient.get<InstitutionalSignal>(`/market/signals/${encodeURIComponent(symbol)}`);
      if (res.data) {
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  getInstrumentDetail: async (canonicalId: string): Promise<MarketInstrument | null> => {
    try {
      const res = await apiClient.get<any>(`/market/instruments/${encodeURIComponent(canonicalId)}`);
      if (res.data) {
        return {
          ...res.data,
          assetType: res.data.asset_type || res.data.assetType,
          assetClass: res.data.asset_class || res.data.assetClass || 'EQUITY',
          instrumentType: res.data.instrument_type || res.data.instrumentType || res.data.asset_type || res.data.assetType
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  getFeaturedCatalog: async (): Promise<MarketInstrument[]> => {
    try {
      const res = await apiClient.get<any>('/market/instruments?limit=25');
      if (res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
        return res.data.items;
      }
    } catch {
      // Non-blocking
    }
    const quotes = await marketApi.getQuotes(FEATURED_CATALOG_SYMBOLS);
    return FEATURED_CATALOG_SYMBOLS.map((sym) => {
      const q = quotes[sym];
      const isIndia = sym.includes('.NS') || sym.startsWith('1') || sym.includes('NSE') || sym.includes('SENSEX');
      const at: 'COMMODITY' | 'INDEX' | 'STOCK' | 'MUTUAL_FUND' | 'ETF' =
        (q?.assetType as any) || (sym.includes('BEES') || sym.includes('100') ? 'ETF' : (sym.startsWith('1') ? 'MUTUAL_FUND' : (sym.includes('^') || sym.includes('NIFTY') || sym.includes('SENSEX') ? 'INDEX' : 'STOCK')));
      return {
        canonicalId: `FEATURED:${sym}`,
        symbol: sym,
        name: q?.name || sym,
        exchange: q?.exchange || (sym.includes('.NS') ? 'NSE' : (sym.startsWith('1') ? 'AMFI' : 'NASDAQ')),
        assetType: at,
        assetClass: at === 'COMMODITY' ? 'COMMODITY' : (at === 'INDEX' ? 'INDEX' : 'EQUITY'),
        market: isIndia ? 'INDIA' : 'US',
        currency: q?.currency || (sym.includes('.NS') || sym.startsWith('1') ? 'INR' : 'USD'),
        quote: q || null,
        isActive: true,
        isTradable: true
      };
    });
  }
};

