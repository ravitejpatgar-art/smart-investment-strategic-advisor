import type {
  MarketQuote,
  MarketInstrument,
  MarketCoverageResponse,
  MarketStatusResponse,
  InstrumentResearchBundle
} from './marketApi';

/**
 * Evaluates whether Demo Mode is enabled.
 * Priority:
 * 1. Environment variable VITE_DEMO_MODE=true
 * 2. URL search parameter ?demo=true (convenient for presentation sessions without rebuild)
 * 3. LocalStorage override 'smartvest_demo_mode' === 'true'
 */
export function isDemoMode(): boolean {
  try {
    if (import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_DEMO_MODE === true) {
      return true;
    }
    if (typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('demo') === 'true') {
        return true;
      }
      if (localStorage.getItem('smartvest_demo_mode') === 'true') {
        return true;
      }
    }
  } catch {
    // Fail-safe to false
  }
  return false;
}

export const DEMO_COVERAGE: MarketCoverageResponse = {
  total_instruments: 125000,
  stocks_count: 62000,
  etfs_count: 14000,
  mutual_funds_count: 48000,
  indices_count: 120,
  exchanges_count: 55,
  exchanges: ['NSE', 'BSE', 'NASDAQ', 'NYSE', 'LSE', 'AMFI'],
  countries_count: 32,
  countries: ['IN', 'US', 'GB', 'DE', 'JP', 'SG'],
  last_synced_at: new Date().toISOString()
};

export const DEMO_MARKET_STATUS: MarketStatusResponse[] = [
  {
    market: 'INDIA',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    status: 'OPEN',
    isOpen: true,
    currentTime: new Date().toISOString()
  },
  {
    market: 'US',
    country: 'US',
    timezone: 'America/New_York',
    status: 'OPEN',
    isOpen: true,
    currentTime: new Date().toISOString()
  }
];

export const DEMO_MARKET_OVERVIEW = {
  indices: [
    { symbol: 'NIFTY 50', name: 'NIFTY 50 Index', price: 24540.20, change: 145.30, changePct: 0.60 },
    { symbol: 'SENSEX', name: 'BSE SENSEX', price: 80620.50, change: 480.10, changePct: 0.60 },
    { symbol: 'S&P 500', name: 'S&P 500 Index', price: 5490.80, change: 28.40, changePct: 0.52 },
    { symbol: 'NASDAQ', name: 'NASDAQ Composite', price: 17350.60, change: 112.90, changePct: 0.65 }
  ],
  gainers: [
    { symbol: 'INFY.NS', name: 'Infosys Limited', price: 1875.40, change: 42.20, changePct: 2.30 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 128.50, change: 4.10, changePct: 3.30 },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2980.00, change: 35.50, changePct: 1.21 }
  ],
  losers: [
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', price: 1642.00, change: -12.50, changePct: -0.76 },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 226.40, change: -1.80, changePct: -0.79 }
  ],
  marketStatus: 'OPEN'
};

export const DEMO_INSTRUMENTS: MarketInstrument[] = [
  // Indices
  {
    canonicalId: 'INDEX:NSE:NIFTY50',
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Index',
    assetType: 'INDEX',
    assetClass: 'INDEX',
    market: 'INDIA',
    exchange: 'NSE',
    currency: 'INR',
    category: 'Large Cap Benchmark',
    benchmark: 'NIFTY 50',
    isActive: true,
    isTradable: false,
    quote: {
      symbol: 'NIFTY 50',
      name: 'NIFTY 50 Index',
      exchange: 'NSE',
      assetType: 'INDEX',
      price: 24540.20,
      currency: 'INR',
      change: 145.30,
      changePct: 0.60,
      volume: 450000000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'INDEX:BSE:SENSEX',
    symbol: 'SENSEX',
    name: 'BSE SENSEX Index',
    assetType: 'INDEX',
    assetClass: 'INDEX',
    market: 'INDIA',
    exchange: 'BSE',
    currency: 'INR',
    category: 'Large Cap Benchmark',
    benchmark: 'SENSEX',
    isActive: true,
    isTradable: false,
    quote: {
      symbol: 'SENSEX',
      name: 'BSE SENSEX Index',
      exchange: 'BSE',
      assetType: 'INDEX',
      price: 80620.50,
      currency: 'INR',
      change: 480.10,
      changePct: 0.60,
      volume: 320000000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'INDEX:US:SP500',
    symbol: 'S&P 500',
    name: 'S&P 500 Index',
    assetType: 'INDEX',
    assetClass: 'INDEX',
    market: 'US',
    exchange: 'US_EXCHANGES',
    currency: 'USD',
    category: 'US Large Cap',
    benchmark: 'S&P 500',
    isActive: true,
    isTradable: false,
    quote: {
      symbol: 'S&P 500',
      name: 'S&P 500 Index',
      exchange: 'US_EXCHANGES',
      assetType: 'INDEX',
      price: 5490.80,
      currency: 'USD',
      change: 28.40,
      changePct: 0.52,
      volume: 2400000000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'INDEX:US:NASDAQ',
    symbol: 'NASDAQ',
    name: 'NASDAQ Composite Index',
    assetType: 'INDEX',
    assetClass: 'INDEX',
    market: 'US',
    exchange: 'NASDAQ',
    currency: 'USD',
    category: 'US Tech Benchmark',
    benchmark: 'NASDAQ',
    isActive: true,
    isTradable: false,
    quote: {
      symbol: 'NASDAQ',
      name: 'NASDAQ Composite Index',
      exchange: 'NASDAQ',
      assetType: 'INDEX',
      price: 17350.60,
      currency: 'USD',
      change: 112.90,
      changePct: 0.65,
      volume: 3100000000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },

  // Indian Stocks
  {
    canonicalId: 'STOCK:NSE:RELIANCE',
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Limited',
    assetType: 'STOCK',
    assetClass: 'EQUITY',
    market: 'INDIA',
    exchange: 'NSE',
    currency: 'INR',
    sector: 'Energy & Conglomerate',
    industry: 'Oil & Gas Refining',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries Limited',
      exchange: 'NSE',
      assetType: 'STOCK',
      price: 2980.00,
      currency: 'INR',
      change: 35.50,
      changePct: 1.21,
      volume: 4800000,
      open: 2950.00,
      high: 2995.00,
      low: 2942.00,
      prevClose: 2944.50,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'STOCK:NSE:TCS',
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services Ltd',
    assetType: 'STOCK',
    assetClass: 'EQUITY',
    market: 'INDIA',
    exchange: 'NSE',
    currency: 'INR',
    sector: 'Information Technology',
    industry: 'IT Consulting & Services',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'TCS.NS',
      name: 'Tata Consultancy Services Ltd',
      exchange: 'NSE',
      assetType: 'STOCK',
      price: 4220.00,
      currency: 'INR',
      change: 28.00,
      changePct: 0.67,
      volume: 1800000,
      open: 4195.00,
      high: 4240.00,
      low: 4180.00,
      prevClose: 4192.00,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'STOCK:NSE:INFY',
    symbol: 'INFY.NS',
    name: 'Infosys Limited',
    assetType: 'STOCK',
    assetClass: 'EQUITY',
    market: 'INDIA',
    exchange: 'NSE',
    currency: 'INR',
    sector: 'Information Technology',
    industry: 'IT Consulting',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'INFY.NS',
      name: 'Infosys Limited',
      exchange: 'NSE',
      assetType: 'STOCK',
      price: 1875.40,
      currency: 'INR',
      change: 42.20,
      changePct: 2.30,
      volume: 6200000,
      open: 1840.00,
      high: 1882.00,
      low: 1835.00,
      prevClose: 1833.20,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'STOCK:NSE:HDFCBANK',
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank Limited',
    assetType: 'STOCK',
    assetClass: 'EQUITY',
    market: 'INDIA',
    exchange: 'NSE',
    currency: 'INR',
    sector: 'Financial Services',
    industry: 'Private Banks',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'HDFCBANK.NS',
      name: 'HDFC Bank Limited',
      exchange: 'NSE',
      assetType: 'STOCK',
      price: 1642.00,
      currency: 'INR',
      change: -12.50,
      changePct: -0.76,
      volume: 8900000,
      open: 1655.00,
      high: 1660.00,
      low: 1638.00,
      prevClose: 1654.50,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },

  // US Stocks
  {
    canonicalId: 'STOCK:NASDAQ:AAPL',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetType: 'STOCK',
    assetClass: 'EQUITY',
    market: 'US',
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Consumer Electronics & Services',
    industry: 'Hardware & Ecosystem',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      assetType: 'STOCK',
      price: 226.40,
      currency: 'USD',
      change: -1.80,
      changePct: -0.79,
      volume: 48000000,
      open: 228.00,
      high: 229.20,
      low: 225.80,
      prevClose: 228.20,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'STOCK:NASDAQ:NVDA',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    assetType: 'STOCK',
    assetClass: 'EQUITY',
    market: 'US',
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Semiconductors',
    industry: 'AI & GPU Computing',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      exchange: 'NASDAQ',
      assetType: 'STOCK',
      price: 128.50,
      currency: 'USD',
      change: 4.10,
      changePct: 3.30,
      volume: 72000000,
      open: 125.00,
      high: 129.40,
      low: 124.50,
      prevClose: 124.40,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'STOCK:NASDAQ:MSFT',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    assetType: 'STOCK',
    assetClass: 'EQUITY',
    market: 'US',
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Enterprise Software & Cloud',
    industry: 'Cloud & AI Infrastructure',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      exchange: 'NASDAQ',
      assetType: 'STOCK',
      price: 428.20,
      currency: 'USD',
      change: 3.80,
      changePct: 0.90,
      volume: 21000000,
      open: 425.00,
      high: 430.50,
      low: 423.80,
      prevClose: 424.40,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'STOCK:NASDAQ:GOOGL',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    assetType: 'STOCK',
    assetClass: 'EQUITY',
    market: 'US',
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Internet Content & AI',
    industry: 'Search & Cloud',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      exchange: 'NASDAQ',
      assetType: 'STOCK',
      price: 169.80,
      currency: 'USD',
      change: 2.10,
      changePct: 1.25,
      volume: 24000000,
      open: 168.00,
      high: 171.00,
      low: 167.50,
      prevClose: 167.70,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },

  // ETFs
  {
    canonicalId: 'ETF:NSE:GOLDBEES',
    symbol: 'GOLDBEES.NS',
    name: 'Nippon India ETF Gold BeES',
    assetType: 'ETF',
    assetClass: 'COMMODITY',
    market: 'INDIA',
    exchange: 'NSE',
    currency: 'INR',
    category: 'Gold Commodity ETF',
    benchmark: 'Domestic Gold Spot Price',
    expenseRatio: 0.79,
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'GOLDBEES.NS',
      name: 'Nippon India ETF Gold BeES',
      exchange: 'NSE',
      assetType: 'ETF',
      price: 84.80,
      currency: 'INR',
      change: 0.45,
      changePct: 0.53,
      volume: 1850000,
      open: 84.40,
      high: 85.00,
      low: 84.30,
      prevClose: 84.35,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'ETF:NSE:MON100',
    symbol: 'MON100.NS',
    name: 'Motilal Oswal Nasdaq 100 ETF',
    assetType: 'ETF',
    assetClass: 'EQUITY',
    market: 'INDIA',
    exchange: 'NSE',
    currency: 'INR',
    category: 'International Tech ETF',
    benchmark: 'NASDAQ-100',
    expenseRatio: 0.57,
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'MON100.NS',
      name: 'Motilal Oswal Nasdaq 100 ETF',
      exchange: 'NSE',
      assetType: 'ETF',
      price: 164.50,
      currency: 'INR',
      change: 1.80,
      changePct: 1.11,
      volume: 980000,
      open: 163.00,
      high: 165.20,
      low: 162.80,
      prevClose: 162.70,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },

  // Mutual Funds (AMFI Direct Schemes)
  {
    canonicalId: 'MF:AMFI:122639',
    symbol: '122639',
    name: 'Parag Parikh Flexi Cap Fund Direct Growth',
    assetType: 'MUTUAL_FUND',
    assetClass: 'EQUITY',
    market: 'INDIA',
    exchange: 'AMFI',
    currency: 'INR',
    category: 'Flexi Cap Equity',
    benchmark: 'NIFTY 500 TRI',
    expenseRatio: 0.62,
    aum: 65400,
    nav: 79.45,
    navDate: 'Today',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: '122639',
      name: 'Parag Parikh Flexi Cap Fund Direct Growth',
      exchange: 'AMFI',
      assetType: 'MUTUAL_FUND',
      price: 79.45,
      currency: 'INR',
      change: 0.55,
      changePct: 0.70,
      volume: 0,
      timestamp: new Date().toISOString(),
      marketStatus: 'PUBLISHED',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'MF:AMFI:120716',
    symbol: '120716',
    name: 'UTI Nifty 50 Index Fund Direct Growth',
    assetType: 'MUTUAL_FUND',
    assetClass: 'EQUITY',
    market: 'INDIA',
    exchange: 'AMFI',
    currency: 'INR',
    category: 'Large Cap Index Fund',
    benchmark: 'NIFTY 50 TRI',
    expenseRatio: 0.18,
    aum: 18200,
    nav: 174.20,
    navDate: 'Today',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: '120716',
      name: 'UTI Nifty 50 Index Fund Direct Growth',
      exchange: 'AMFI',
      assetType: 'MUTUAL_FUND',
      price: 174.20,
      currency: 'INR',
      change: 1.05,
      changePct: 0.61,
      volume: 0,
      timestamp: new Date().toISOString(),
      marketStatus: 'PUBLISHED',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },
  {
    canonicalId: 'MF:AMFI:120586',
    symbol: '120586',
    name: 'ICICI Prudential Liquid Fund Direct Growth',
    assetType: 'MUTUAL_FUND',
    assetClass: 'DEBT',
    market: 'INDIA',
    exchange: 'AMFI',
    currency: 'INR',
    category: 'Liquid / Cash Equivalent',
    benchmark: 'CRISIL Liquid Debt Index',
    expenseRatio: 0.20,
    aum: 42100,
    nav: 384.10,
    navDate: 'Today',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: '120586',
      name: 'ICICI Prudential Liquid Fund Direct Growth',
      exchange: 'AMFI',
      assetType: 'MUTUAL_FUND',
      price: 384.10,
      currency: 'INR',
      change: 0.08,
      changePct: 0.02,
      volume: 0,
      timestamp: new Date().toISOString(),
      marketStatus: 'PUBLISHED',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  },

  // Commodities
  {
    canonicalId: 'COMMODITY:INDIA:GOLD',
    symbol: 'GOLD (10g)',
    name: '24K Domestic Gold Spot (10g)',
    assetType: 'COMMODITY',
    assetClass: 'COMMODITY',
    market: 'INDIA',
    exchange: 'MCX',
    currency: 'INR',
    category: 'Precious Metals',
    isActive: true,
    isTradable: true,
    quote: {
      symbol: 'GOLD (10g)',
      name: '24K Domestic Gold Spot (10g)',
      exchange: 'MCX',
      assetType: 'COMMODITY',
      price: 74250.00,
      currency: 'INR',
      change: 320.00,
      changePct: 0.43,
      volume: 45000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'MODEL_ASSUMPTION',
      source: 'Deterministic Demo Market Feed',
      asOf: 'Today'
    }
  }
];

export function getDemoQuote(symbol: string): MarketQuote {
  const clean = symbol.trim().toUpperCase();
  const matched = DEMO_INSTRUMENTS.find(
    i => i.symbol.toUpperCase() === clean || 
         i.canonicalId.toUpperCase().includes(clean) ||
         i.name.toUpperCase().includes(clean)
  );

  if (matched && matched.quote) {
    return {
      ...matched.quote,
      status: 'DEMO'
    };
  }

  // Fallback deterministic structure
  return {
    symbol,
    name: symbol,
    exchange: clean.includes('.NS') ? 'NSE' : 'GLOBAL',
    assetType: 'STOCK',
    price: 100.0,
    currency: clean.includes('.NS') ? 'INR' : 'USD',
    change: 0.50,
    changePct: 0.50,
    volume: 500000,
    timestamp: new Date().toISOString(),
    marketStatus: 'OPEN',
    freshness: 'MODEL_ASSUMPTION',
    status: 'DEMO',
    source: 'Deterministic Demo Market Feed',
    asOf: 'Today',
    message: 'Deterministic demonstration baseline'
  };
}

export function getDemoInstruments(params: {
  q?: string;
  asset_type?: string;
  assetType?: string;
  market?: string;
  exchange?: string;
  country?: string;
  page?: number;
  limit?: number;
} = {}): { items: MarketInstrument[]; total: number; page: number; limit: number; totalPages: number; hasMore: boolean } {
  let list = [...DEMO_INSTRUMENTS];

  const query = (params.q || '').trim().toLowerCase();
  if (query) {
    list = list.filter(
      item => item.name.toLowerCase().includes(query) ||
              item.symbol.toLowerCase().includes(query) ||
              (item.sector && item.sector.toLowerCase().includes(query)) ||
              (item.category && item.category.toLowerCase().includes(query))
    );
  }

  const assetTypeFilter = (params.assetType || params.asset_type || '').toUpperCase();
  if (assetTypeFilter && assetTypeFilter !== 'ALL') {
    list = list.filter(
      item => item.assetType.toUpperCase() === assetTypeFilter ||
              item.assetClass.toUpperCase() === assetTypeFilter
    );
  }

  const marketFilter = (params.market || '').toUpperCase();
  if (marketFilter && marketFilter !== 'ALL') {
    list = list.filter(item => item.market.toUpperCase() === marketFilter);
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 50);
  const start = (page - 1) * limit;
  const paginated = list.slice(start, start + limit);

  return {
    items: paginated,
    total: list.length,
    page,
    limit,
    totalPages: Math.ceil(list.length / limit) || 1,
    hasMore: start + limit < list.length
  };
}

export function getDemoResearch(symbol: string): InstrumentResearchBundle {
  const quote = getDemoQuote(symbol);
  return {
    quote,
    fundamentals: {
      symbol,
      marketCap: quote.currency === 'INR' ? 1850000000000 : 2800000000000,
      peRatio: 24.5,
      pbRatio: 4.2,
      dividendYield: 1.15,
      fiftyTwoWeekHigh: (quote.price || 100) * 1.18,
      fiftyTwoWeekLow: (quote.price || 100) * 0.82,
      freshness: 'MODEL_ASSUMPTION',
      asOf: 'Today',
      source: 'Deterministic Demo Market Feed'
    },
    technicals: {
      rsi: 56.4,
      macd: { macd: 1.25, signal: 0.95, hist: 0.30 },
      indicators: [
        { name: 'RSI (14)', value: 56.4, signal: 'NEUTRAL' },
        { name: 'MACD (12, 26, 9)', value: 1.25, signal: 'BULLISH' },
        { name: '200 DMA', value: (quote.price || 100) * 0.94, signal: 'BULLISH' }
      ],
      summary: 'Constructive Momentum / Low Volatility'
    }
  };
}
