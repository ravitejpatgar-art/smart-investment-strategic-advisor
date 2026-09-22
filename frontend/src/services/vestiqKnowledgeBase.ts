/**
 * VestIQ Finance Knowledge Base
 * Strictly frontend-only, typed deterministic knowledge repository for entities,
 * aliases, synonym clusters, economic relationships, and financial mechanisms.
 * ZERO LLM calls, zero generative AI.
 */

// ==========================================
// 1. Core Entity & Symbol Universes
// ==========================================

export const INDIAN_STOCK_SYMBOLS = [
  'RELIANCE',
  'TCS',
  'INFY',
  'HDFCBANK',
  'ICICIBANK',
  'SBIN',
  'BHARTIARTL',
  'ITC',
  'KOTAKBANK',
  'LT',
  'HINDUNILVR',
  'AXISBANK',
  'TATAMOTORS',
  'MARUTI',
  'BAJFINANCE',
  'SUNPHARMA',
  'ASIANPAINT',
  'TITAN',
  'WIPRO',
  'HCLTECH',
  'ONGC',
  'NTPC',
  'POWERGRID',
  'COALINDIA',
  'IOC',
  'BPCL',
  'HPCL',
  'TATACONSUM',
  'NESTLEIND',
  'ULTRACEMCO',
  'GRASIM',
  'JSWSTEEL',
  'TATASTEEL',
  'ADANIENT',
  'ADANIPORTS',
  'DIVISLAB',
  'CIPLA',
  'DRREDDY',
  'APOLLOHOSP',
  'EICHERMOT',
  'HEROMOTOCO',
  'BAJAJ-AUTO',
  'M&M',
  'TECHM',
  'INDUSINDBK',
  'BRITANNIA',
  'HINDALCO',
] as const;

export const US_STOCK_SYMBOLS = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'GOOG',
  'AMZN',
  'META',
  'NVDA',
  'TSLA',
  'BRK.A',
  'BRK.B',
  'JPM',
  'JNJ',
  'V',
  'PG',
  'MA',
  'UNH',
  'HD',
  'DIS',
  'BAC',
  'XOM',
  'CVX',
  'VZ',
  'KO',
  'PFE',
  'CSCO',
  'SPY',
  'QQQ',
  'VOO',
  'VTI',
  'AMD',
  'ADBE',
  'NFLX',
  'COST',
  'AVGO',
  'CRM',
  'TSM',
  'ASML',
] as const;

export const INDEX_SYMBOLS = [
  'NIFTY',
  'NIFTY 50',
  'BANKNIFTY',
  'NIFTY IT',
  'SENSEX',
  'SPX',
  'S&P 500',
  'DJI',
  'DOW',
  'NASDAQ',
] as const;

export const COMMODITY_ENTITIES = [
  'GOLD',
  'SILVER',
  'CRUDE_OIL',
  'BRENT_CRUDE',
  'NATURAL_GAS',
  'COPPER',
] as const;

export const MACRO_ENTITIES = [
  'INFLATION',
  'INTEREST_RATES',
  'REPO_RATE',
  'BONDS',
  'GOVERNMENT_SECURITIES',
  'TREASURY_YIELD',
  'USD_INR',
  'FIXED_DEPOSIT',
] as const;

export const SECTOR_ENTITIES = [
  'OMC',
  'OIL_MARKETING_COMPANIES',
  'BANKING',
  'IT_SERVICES',
  'AUTOMOBILE',
  'PHARMACEUTICALS',
  'FMCG',
  'METALS',
  'ENERGY',
  'INFRASTRUCTURE',
] as const;

// ==========================================
// 2. Company Aliases & Disambiguation Rules
// ==========================================

export interface SecurityAlias {
  symbol: string;
  aliases: string[];
  requiresFinancialContext?: boolean; // e.g. "Apple" requires financial context (invest, stock, etc.)
  country: 'IN' | 'US';
  sector?: string;
}

export const SECURITY_ALIASES: SecurityAlias[] = [
  {
    symbol: 'RELIANCE',
    aliases: ['reliance industries', 'reliance ind', 'reliance', 'ril'],
    country: 'IN',
    sector: 'Energy & Retail',
  },
  {
    symbol: 'TCS',
    aliases: ['tata consultancy services', 'tata consultancy', 'tcs'],
    country: 'IN',
    sector: 'IT Services',
  },
  {
    symbol: 'INFY',
    aliases: ['infosys limited', 'infosys tech', 'infosys', 'infy'],
    country: 'IN',
    sector: 'IT Services',
  },
  {
    symbol: 'HDFCBANK',
    aliases: ['hdfc bank', 'hdfc bank limited', 'hdfc'],
    country: 'IN',
    sector: 'Banking',
  },
  {
    symbol: 'ICICIBANK',
    aliases: ['icici bank', 'icici bank limited', 'icici'],
    country: 'IN',
    sector: 'Banking',
  },
  {
    symbol: 'SBIN',
    aliases: ['state bank of india', 'state bank', 'sbi'],
    country: 'IN',
    sector: 'Banking',
  },
  {
    symbol: 'BHARTIARTL',
    aliases: ['bharti airtel', 'airtel'],
    country: 'IN',
    sector: 'Telecom',
  },
  {
    symbol: 'TATAMOTORS',
    aliases: ['tata motors', 'tata motors passenger', 'ta mo'],
    country: 'IN',
    sector: 'Automobile',
  },
  {
    symbol: 'ITC',
    aliases: ['itc limited', 'itc'],
    country: 'IN',
    sector: 'FMCG',
  },
  {
    symbol: 'LT',
    aliases: ['larsen & toubro', 'larsen and toubro', 'l&t'],
    country: 'IN',
    sector: 'Infrastructure',
  },
  {
    symbol: 'IOC',
    aliases: ['indian oil corporation', 'indian oil', 'ioc', 'iocl'],
    country: 'IN',
    sector: 'OMC',
  },
  {
    symbol: 'BPCL',
    aliases: ['bharat petroleum corporation', 'bharat petroleum', 'bpcl'],
    country: 'IN',
    sector: 'OMC',
  },
  {
    symbol: 'HPCL',
    aliases: ['hindustan petroleum corporation', 'hindustan petroleum', 'hpcl'],
    country: 'IN',
    sector: 'OMC',
  },
  // US Stocks
  {
    symbol: 'AAPL',
    aliases: ['apple inc', 'apple computer', 'apple', 'aapl'],
    requiresFinancialContext: true,
    country: 'US',
    sector: 'Consumer Technology',
  },
  {
    symbol: 'MSFT',
    aliases: ['microsoft corporation', 'microsoft', 'msft'],
    country: 'US',
    sector: 'Enterprise Software',
  },
  {
    symbol: 'GOOGL',
    aliases: ['alphabet inc', 'alphabet', 'google', 'googl', 'goog'],
    country: 'US',
    sector: 'Internet Services',
  },
  {
    symbol: 'AMZN',
    aliases: ['amazon.com', 'amazon', 'amzn'],
    requiresFinancialContext: true,
    country: 'US',
    sector: 'E-commerce & Cloud',
  },
  {
    symbol: 'NVDA',
    aliases: ['nvidia corporation', 'nvidia', 'nvda'],
    country: 'US',
    sector: 'Semiconductors',
  },
  {
    symbol: 'TSLA',
    aliases: ['tesla motors', 'tesla', 'tsla'],
    country: 'US',
    sector: 'Automotive & Clean Energy',
  },
  {
    symbol: 'META',
    aliases: ['meta platforms', 'facebook', 'meta'],
    country: 'US',
    sector: 'Social Media & Tech',
  },
  {
    symbol: 'AMD',
    aliases: ['advanced micro devices', 'advanced micro', 'amd'],
    country: 'US',
    sector: 'Semiconductors',
  },
  {
    symbol: 'ADBE',
    aliases: ['adobe systems', 'adobe inc', 'adobe', 'adbe'],
    country: 'US',
    sector: 'Software',
  },
  {
    symbol: 'NFLX',
    aliases: ['netflix inc', 'netflix', 'nflx'],
    country: 'US',
    sector: 'Entertainment',
  },
  {
    symbol: 'COST',
    aliases: ['costco wholesale', 'costco'],
    country: 'US',
    sector: 'Retail',
  },
  {
    symbol: 'AVGO',
    aliases: ['broadcom inc', 'broadcom', 'avgo'],
    country: 'US',
    sector: 'Semiconductors',
  },
  {
    symbol: 'CRM',
    aliases: ['salesforce inc', 'salesforce.com', 'salesforce', 'crm'],
    country: 'US',
    sector: 'Cloud Software',
  },
  {
    symbol: 'TSM',
    aliases: ['taiwan semiconductor', 'tsmc', 'tsm'],
    country: 'US',
    sector: 'Semiconductors',
  },
  {
    symbol: 'ASML',
    aliases: ['asml holding', 'asml'],
    country: 'US',
    sector: 'Semiconductor Equipment',
  },
];

// ==========================================
// 3. Deterministic Synonym Clusters
// ==========================================

export const SYNONYM_CLUSTERS = {
  VALUATION: [
    'pe',
    'p/e',
    'p e',
    'pe ratio',
    'p/e ratio',
    'price to earnings',
    'price earnings',
    'earnings multiple',
    'valuation multiple',
    'valuation',
    'valued',
    'expensive',
    'costly',
    'overvalued',
    'cheap',
    'undervalued',
    'stretched valuation',
    'fair value',
    'price to book',
    'pb ratio',
    'p/b',
  ],
  RETURN: [
    'return',
    'returns',
    'profit',
    'profits',
    'gain',
    'gains',
    'growth',
    'performance',
    'roi',
    'yield',
    'how much did i make',
    'how much will i make',
    'what will i get',
    'what will it become',
    'grow to',
  ],
  RISK: [
    'risk',
    'risks',
    'risky',
    'safe',
    'safety',
    'volatile',
    'volatility',
    'downside',
    'drawdown',
    'drawdowns',
    'loss',
    'losses',
    'fluctuation',
    'beta',
    'swings',
    'crash',
  ],
  TREND: [
    'trend',
    'trending',
    'momentum',
    'moving average',
    'sma',
    'dma',
    '200 dma',
    '50 dma',
    '200 day',
    '50 day',
    'rsi',
    'macd',
    'support',
    'resistance',
    'breakout',
    'overbought',
    'oversold',
    'bullish',
    'bearish',
  ],
  FUNDAMENTALS: [
    'fundamentals',
    'fundamental',
    'earnings',
    'financials',
    'balance sheet',
    'profitability',
    'revenue',
    'top line',
    'bottom line',
    'sales',
    'net income',
    'roe',
    'return on equity',
    'roce',
    'return on capital',
    'debt',
    'debt to equity',
    'leverage',
    'eps',
    'earnings per share',
    'cash flow',
    'free cash flow',
    'dividends',
    'dividend yield',
  ],
  COMPARISON: [
    'compare',
    'comparison',
    'versus',
    'vs',
    'better than',
    'relative to',
    'which is stronger',
    'which is better',
    'differ between',
    'between',
  ],
  LONG_TERM: [
    'long term',
    'long-term',
    'multiannual',
    'multi year',
    'horizon',
    'hold for',
    'suitable for',
    'invest for',
    'compounder',
    'wealth creator',
    '5 years',
    '7 years',
    '10 years',
    'years',
  ],
  CALCULATION: [
    'calculate',
    'calculation',
    'how much',
    'what will',
    'future value',
    'fv',
    'cagr',
    'sip',
    'systematic investment',
    'compound',
    'compounding',
    'projected value',
  ],
  PORTFOLIO: [
    'portfolio',
    'holdings',
    'allocation',
    'allocations',
    'asset allocation',
    'diversification',
    'diversified',
    'concentration',
    'concentrated',
    'single stock',
    'weighting',
    'weights',
    'exposure',
  ],
  EXPLANATION: [
    'why',
    'how',
    'what causes',
    'what happens when',
    'what happens if',
    'what is the impact',
    'how does it work',
    'explain',
    'explain why',
    'reason for',
    'mechanics of',
  ],
} as const;

// Words indicating explicit financial inquiry when evaluating ambiguous entities
export const FINANCIAL_CONTEXT_TERMS = [
  'stock',
  'share',
  'invest',
  'investing',
  'investment',
  'buy',
  'sell',
  'price',
  'quote',
  'valuation',
  'pe',
  'earnings',
  'shares',
  'market cap',
  'ticker',
  'nasdaq',
  'dividend',
  'holding',
  'portfolio',
  'aapl',
  'msft',
  'trading',
  'worth',
];

// Unrelated out-of-domain topic keywords
export const OUT_OF_DOMAIN_PATTERNS = [
  /\b(weather|temperature|forecast|rain|cloudy|sunny|climate)\b/i,
  /\b(cricket|football|soccer|ipl|world cup|messi|ronaldo|score|match|tournament|game)\b/i,
  /\b(movie|film|actor|actress|cinema|hollywood|bollywood|netflix|trailer)\b/i,
  /\b(recipe|cooking|cook|dinner|lunch|breakfast|food|taste|bake|cake|restaurant)\b/i,
  /\b(playstation|xbox|video game|gaming|fortnite|minecraft)\b/i,
  /\b(joke|riddle|funny|meme)\b/i,
  /\b(write a python script|react code|javascript loop|compile c\+\+|write sql to join)\b/i,
  /\b(an apple|banana|orange fruit)\b/i,
];

// ==========================================
// 4. Financial Relationship Registry
// ==========================================

export interface FinancialRelationship {
  id: string;
  sourceEntity: string;
  targetEntity: string;
  mechanism: string;
  keyDrivers: string[];
  limitations: string[];
  explanationTemplate: string;
  requiresLiveMarketData: boolean;
}

export const FINANCIAL_RELATIONSHIPS: FinancialRelationship[] = [
  {
    id: 'CRUDE_OIL_TO_OMC',
    sourceEntity: 'CRUDE_OIL',
    targetEntity: 'OMC',
    mechanism: 'Crude oil is the primary feedstock for Oil Marketing Companies (OMCs like IOCL, BPCL, HPCL).',
    keyDrivers: [
      'Input Costs: Rising crude prices increase raw material procurement costs for refiners.',
      'Retail Price Revisions: When retail fuel prices (petrol/diesel) are frozen or capped by policy, marketing margins compress.',
      'Inventory Gains/Losses: Sharp crude price moves generate accounting inventory gains (on price spikes) or inventory losses (on price drops).',
      'Refining Margins (GRMs): Gross Refining Margins vary based on crack spreads between crude and refined petroleum products.',
    ],
    limitations: [
      'Crude price movement does not guarantee an immediate stock price drop or rise.',
      'The actual financial effect depends on retail pricing autonomy, subsidy mechanisms, refining crack spreads, and current valuation.',
    ],
    explanationTemplate:
      'Rising crude oil prices impact Oil Marketing Companies (OMCs) primarily through feedstock procurement costs and marketing margins. When crude benchmarks rise, OMCs face higher working capital and procurement costs. If retail petrol and diesel prices cannot be adjusted proportionally to pass through costs, marketing margins compress. However, OMCs may temporarily benefit from inventory gains on earlier lower-cost stockpiles. The net equity impact depends on crack spreads, government retail pricing policy, and the prevailing valuation of each company.',
    requiresLiveMarketData: false,
  },
  {
    id: 'INTEREST_RATES_TO_BONDS',
    sourceEntity: 'INTEREST_RATES',
    targetEntity: 'BONDS',
    mechanism: 'Bond prices and interest rates share an inverse mathematical relationship driven by fixed coupon discounting.',
    keyDrivers: [
      'Discount Rate: Higher benchmark rates discount future fixed bond coupon cash flows at higher yields, reducing present market value.',
      'Opportunity Cost: Newly issued bonds offer higher coupon rates, making existing lower-coupon bonds less attractive unless priced at a discount.',
      'Duration Sensitivity: Longer-maturity bonds exhibit higher modified duration, resulting in larger percentage price swings for a given rate shift.',
    ],
    limitations: [
      'Bonds held to maturity return their full face value (assuming zero sovereign or issuer default).',
      'Floating-rate bonds adjust their coupon and do not exhibit the same price drop as fixed-rate debt.',
    ],
    explanationTemplate:
      "When benchmark interest rates rise, existing fixed-rate bond prices fall. Because existing bonds pay a fixed coupon rate established at issuance, investors require a comparable yield to newly issued higher-coupon debt. Existing bonds must therefore trade at a market discount to equate their yield to current prevailing rates. The magnitude of price fluctuation is proportional to the bond's duration.",
    requiresLiveMarketData: false,
  },
  {
    id: 'INFLATION_TO_REAL_RETURNS',
    sourceEntity: 'INFLATION',
    targetEntity: 'REAL_RETURNS',
    mechanism: 'Inflation erodes purchasing power, creating a gap between nominal investment return and real wealth creation.',
    keyDrivers: [
      'Real Return Formula: Real Return = Nominal Return - Inflation Rate.',
      'Fixed-Income Vulnerability: Fixed-income instruments with yields below inflation deliver negative real purchasing power gains.',
      'Pricing Power in Equities: High-quality companies with pricing power can pass inflationary costs through to consumers, preserving real earnings growth.',
    ],
    limitations: [
      'Headline inflation indices (CPI) may not match individual lifestyle inflation.',
    ],
    explanationTemplate:
      'Inflation directly reduces the real return of an investment by eroding future purchasing power. If a fixed deposit yields 7% while consumer inflation runs at 6%, the real pre-tax wealth expansion is approximately 1%. For long-term capital compounding, asset classes must generate post-tax nominal returns comfortably exceeding the prevailing inflation rate.',
    requiresLiveMarketData: false,
  },
  {
    id: 'CONCENTRATION_TO_PORTFOLIO_RISK',
    sourceEntity: 'CONCENTRATION',
    targetEntity: 'PORTFOLIO_RISK',
    mechanism: 'Single-stock or single-sector concentration eliminates non-systematic risk diversification benefits.',
    keyDrivers: [
      'Unsystematic Risk: Company-specific events (governance, earnings misses, regulatory sanctions) directly jeopardize total portfolio capital.',
      'Prudent Screening Threshold: Holding more than 25–35% of an equity portfolio in a single security represents elevated idiosyncratic risk.',
      'Correlation Benefits: Allocating across low-correlation asset classes (equity, debt, gold) reduces overall portfolio drawdown.',
    ],
    limitations: [
      'Diversification reduces volatility and severe drawdowns, but does not eliminate systematic market-wide risk.',
    ],
    explanationTemplate:
      'Portfolio concentration in a single stock or sector exposes total capital to idiosyncratic company risk. In a diversified multi-asset portfolio, operational or regulatory issues in one company are buffered by other uncorrelated holdings. When a single holding exceeds 30–35% of total value, total portfolio performance becomes disproportionately dependent on that single entity.',
    requiresLiveMarketData: false,
  },
  {
    id: 'PE_TO_VALUATION',
    sourceEntity: 'PE',
    targetEntity: 'VALUATION',
    mechanism: 'The Price-to-Earnings (P/E) multiple measures the market price paid per unit of annual net profit.',
    keyDrivers: [
      'Growth Expectations: A high P/E indicates that the market prices in substantial multi-year earnings expansion or premium capital efficiency.',
      'Sensitivity to Disappointment: High-multiple stocks experience severe price corrections when quarterly earnings fail to meet heightened market expectations.',
      'Sector Context: Capital-intensive sectors (utilities, heavy industrials) typically trade at lower P/E ranges than asset-light technology companies.',
    ],
    limitations: [
      'P/E multiple alone cannot determine whether a stock is a buy or avoid; earnings quality, balance sheet debt, and return on equity (ROE) must be evaluated concurrently.',
    ],
    explanationTemplate:
      'The Price-to-Earnings ratio reflects how much investors are paying today for each rupee or dollar of annual earnings. A high P/E ratio indicates that the market expects significant future profit growth or assigns a quality premium to business resilience. However, elevated multiples leave less room for operational execution misses, as any earnings slowdown can trigger sharp multiple contraction.',
    requiresLiveMarketData: false,
  },
  {
    id: 'DEBT_TO_FINANCIAL_RISK',
    sourceEntity: 'DEBT',
    targetEntity: 'FINANCIAL_RISK',
    mechanism: 'Financial leverage increases interest obligations and heightens vulnerability during economic slowdowns.',
    keyDrivers: [
      'Debt-to-Equity Ratio: Ratios exceeding 1.0 indicate that a company is financed more by creditor obligations than shareholder equity.',
      'Interest Coverage: Lower interest coverage limits free cash flow flexibility for capital expenditure and dividend distribution.',
      'Cycle Sensitivity: Heavily leveraged businesses face acute refinancing or insolvency risks during economic downturns and high interest-rate regimes.',
    ],
    limitations: [
      'Financial companies (banks, NBFCs) operate with leverage as a core business model, making debt-to-equity inappropriate for them without evaluating Capital Adequacy (CAR).',
    ],
    explanationTemplate:
      'High corporate leverage increases fixed financial interest burdens. In economic expansions, debt can amplify returns on equity; however, during macro slowdowns or rising rate cycles, fixed debt servicing costs compress profit margins and elevate solvency risk. Conservative screening models typically favor non-financial companies with Debt-to-Equity below 1.0.',
    requiresLiveMarketData: false,
  },
];
