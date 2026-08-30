import { apiClient } from './api';

export type FreshnessType = 
  | 'REALTIME' 
  | 'DELAYED' 
  | 'LATEST_AVAILABLE' 
  | 'END_OF_DAY' 
  | 'HISTORICAL' 
  | 'MODEL_ASSUMPTION' 
  | 'STALE' 
  | 'UNAVAILABLE';

export interface MarketQuote {
  symbol: string;
  name: string;
  exchange: string;
  assetType: string;
  price: number | null;
  currency: string;
  change: number | null;
  changePct: number | null;
  volume: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  prevClose?: number | null;
  timestamp: string;
  marketStatus: string;
  freshness: FreshnessType;
  source: string | null;
  asOf: string;
  navDate?: string | null;
  message?: string;
  isStale?: boolean;
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
  disclaimer?: string;
  observations: MarketCandleObservation[];
  message?: string;
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
  name: string;
  assetType: 'STOCK' | 'ETF' | 'MUTUAL_FUND' | 'INDEX' | 'COMMODITY';
  assetClass: 'EQUITY' | 'DEBT' | 'COMMODITY' | 'HYBRID' | 'INDEX';
  market: string;
  country?: string;
  exchange: string;
  exchangeMic?: string;
  currency: string;
  provider: string;
  status: string;
  sector?: string;
  industry?: string;
  benchmark?: string;
  category?: string;
  fundHouse?: string;
  fundCategory?: string;
  isin?: string;
  figi?: string;
  expenseRatio?: string | number | null;
  aum?: string;
  riskLevel?: string;
  aliases?: string[];
  quote?: MarketQuote | null;
  fundamentals?: MarketFundamentalsResponse | null;
  watchlistedAt?: string;
}

export interface MarketInstrumentsResponse {
  items: MarketInstrument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface MarketCoverageResponse {
  total_instruments: number;
  stocks_count: number;
  etfs_count: number;
  mutual_funds_count: number;
  indices_count: number;
  exchanges_count: number;
  exchanges: string[];
  countries_count: number;
  countries: string[];
  last_synced_at: string;
}

// ── Research Bundle Types ──────────────────────────────────────────────────

export interface ResearchCapabilities {
  hasQuote: boolean;
  hasHistorical: boolean;
  hasFundamentals: boolean;
  hasValuation: boolean;
  hasDividends: boolean;
  hasRisk: boolean;
  hasETFData: boolean;
  hasMFData: boolean;
  hasExpenseRatio: boolean;
  hasAUM: boolean;
  hasBenchmark: boolean;
  hasNAV: boolean;
  hasFundManager: boolean;
  hasHoldings: boolean;
  hasSectorBreakdown: boolean;
  hasCountryBreakdown: boolean;
  hasTechnicals: boolean;
  hasPerformance: boolean;
}

export interface ResearchFundamentals {
  revenue?: number | null;
  revenueGrowth?: number | null;
  grossProfit?: number | null;
  ebitda?: number | null;
  ebit?: number | null;
  netIncome?: number | null;
  eps?: number | null;
  forwardEPS?: number | null;
  operatingCashFlow?: number | null;
  freeCashFlow?: number | null;
  profitMargin?: number | null;
  operatingMargin?: number | null;
  grossMargin?: number | null;
  roe?: number | null;
  roa?: number | null;
  totalDebt?: number | null;
  totalCash?: number | null;
  debtToEquity?: number | null;
  currentRatio?: number | null;
  bookValuePerShare?: number | null;
}

export interface ResearchValuation {
  peRatio?: number | null;
  forwardPE?: number | null;
  pbRatio?: number | null;
  psRatio?: number | null;
  evEbitda?: number | null;
  evSales?: number | null;
  peg?: number | null;
  marketCap?: number | null;
  enterpriseValue?: number | null;
}

export interface ResearchDividends {
  yield?: number | null;
  annualDividend?: number | null;
  payoutRatio?: number | null;
  exDividendDate?: string | null;
  lastDividend?: number | null;
}

export interface ResearchRisk {
  beta?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  averageVolume?: number | null;
  averageVolume10d?: number | null;
}

export interface ResearchETFData {
  aum?: number | null;
  expenseRatio?: number | null;
  issuer?: string | null;
  category?: string | null;
  inceptionDate?: string | null;
  nav?: number | null;
  ytdReturn?: number | null;
  threeYearReturn?: number | null;
  fiveYearReturn?: number | null;
}

export interface InstrumentResearchBundle {
  instrument: MarketInstrument | null;
  quote: MarketQuote | null;
  fundamentals: ResearchFundamentals | null;
  valuation: ResearchValuation | null;
  dividends: ResearchDividends | null;
  risk: ResearchRisk | null;
  etfData: ResearchETFData | null;
  mfData: ResearchETFData | null;
  capabilities: ResearchCapabilities;
  sources: {
    quote: string | null;
    research: string | null;
    freshness: string;
  };
}

export const marketApi = {
  getCoverage: async (): Promise<MarketCoverageResponse> => {
    const res = await apiClient.get<MarketCoverageResponse>('/market/coverage');
    return res.data;
  },

  getQuote: async (symbol: string): Promise<MarketQuote> => {
    const res = await apiClient.get<MarketQuote>(`/market/quote/${encodeURIComponent(symbol)}`);
    return res.data;
  },

  getQuotes: async (symbols: string[]): Promise<Record<string, MarketQuote>> => {
    const res = await apiClient.get<Record<string, MarketQuote>>(`/market/quotes?symbols=${encodeURIComponent(symbols.join(','))}`);
    return res.data;
  },

  getCandles: async (symbol: string, range: string = '1mo', interval: string = '1d'): Promise<MarketCandlesResponse> => {
    const res = await apiClient.get<MarketCandlesResponse>(`/market/candles/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`);
    return res.data;
  },

  getInstruments: async (params: {
    q?: string;
    asset_type?: string;
    market?: string;
    exchange?: string;
    country?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<MarketInstrumentsResponse> => {
    const queryParts: string[] = [];
    if (params.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);
    if (params.asset_type && params.asset_type !== 'ALL') queryParts.push(`asset_type=${encodeURIComponent(params.asset_type)}`);
    if (params.market && params.market !== 'ALL') queryParts.push(`market=${encodeURIComponent(params.market)}`);
    if (params.exchange && params.exchange !== 'ALL') queryParts.push(`exchange=${encodeURIComponent(params.exchange)}`);
    if (params.country && params.country !== 'ALL') queryParts.push(`country=${encodeURIComponent(params.country)}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.limit) queryParts.push(`limit=${params.limit}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const res = await apiClient.get<MarketInstrumentsResponse>(`/market/instruments${queryString}`);
    return res.data;
  },

  getInstrumentDetail: async (canonicalId: string): Promise<MarketInstrument> => {
    const res = await apiClient.get<MarketInstrument>(`/market/instruments/${encodeURIComponent(canonicalId)}`);
    return res.data;
  },

  getWatchlist: async (): Promise<MarketInstrument[]> => {
    const res = await apiClient.get<MarketInstrument[]>('/market/watchlist');
    return res.data;
  },

  addToWatchlist: async (canonicalId: string): Promise<any> => {
    const res = await apiClient.post(`/market/watchlist/${encodeURIComponent(canonicalId)}`);
    return res.data;
  },

  removeFromWatchlist: async (canonicalId: string): Promise<any> => {
    const res = await apiClient.delete(`/market/watchlist/${encodeURIComponent(canonicalId)}`);
    return res.data;
  },

  getStatus: async (market: string = 'NSE'): Promise<MarketStatusResponse> => {
    const res = await apiClient.get<MarketStatusResponse>(`/market/status/${encodeURIComponent(market)}`);
    return res.data;
  },

  getFundamentals: async (symbol: string): Promise<MarketFundamentalsResponse> => {
    const res = await apiClient.get<MarketFundamentalsResponse>(`/market/fundamentals/${encodeURIComponent(symbol)}`);
    return res.data;
  },

  getOverview: async (): Promise<any> => {
    const res = await apiClient.get('/market/overview');
    return res.data;
  },

  getCapabilities: async (): Promise<any> => {
    const res = await apiClient.get('/market/capabilities');
    return res.data;
  },

  getHealth: async (): Promise<any> => {
    const res = await apiClient.get('/market/health');
    return res.data;
  },

  getResearch: async (symbol: string): Promise<InstrumentResearchBundle> => {
    const res = await apiClient.get<InstrumentResearchBundle>(`/market/research/${encodeURIComponent(symbol)}`);
    return res.data;
  },
};
