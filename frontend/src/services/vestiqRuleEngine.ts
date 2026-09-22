/**
 * VestIQ Deterministic Finance Advisor Engine
 * Strictly frontend-only, typed TypeScript rule, calculation, and retrieval engine.
 * ZERO LLM calls, zero generative AI, zero fabricated numbers.
 */

import { marketApi } from './marketApi';
import { authApi } from './api';

// ==========================================
// 1. Interfaces & Types
// ==========================================

export type FinanceDomain =
  | 'STOCKS'
  | 'ETFS'
  | 'MUTUAL_FUNDS'
  | 'BONDS'
  | 'FIXED_INCOME'
  | 'MARKETS'
  | 'PORTFOLIO'
  | 'INVESTING'
  | 'PERSONAL_FINANCE'
  | 'TECHNICAL_ANALYSIS'
  | 'FUNDAMENTAL_ANALYSIS'
  | 'COMMODITIES'
  | 'GLOBAL_MARKETS'
  | 'FINANCIAL_CALCULATIONS'
  | 'FINANCIAL_EDUCATION'
  | 'SMARTVEST'
  | 'OUT_OF_DOMAIN'
  | 'AMBIGUOUS'
  | 'UNKNOWN';

export type FinanceIntent =
  | 'QUOTE'
  | 'FUNDAMENTALS'
  | 'TECHNICAL'
  | 'COMPARISON'
  | 'LONG_TERM'
  | 'RETURN'
  | 'PORTFOLIO'
  | 'EDUCATION'
  | 'MARKET'
  | 'PERSONAL_FINANCE'
  | 'FIXED_INCOME'
  | 'COMMODITY'
  | 'SMARTVEST'
  | 'OUT_OF_DOMAIN'
  | 'UNSUPPORTED';

export interface ParsedFinanceQuery {
  intent: FinanceIntent;
  symbols: string[];
  metric?: string;
  years?: number;
  amount?: number;
  rate?: number;
  currency?: string;
  originalQuery: string;
  domain: FinanceDomain;
  isAmbiguous?: boolean;
}

export interface VestiqRuleResult {
  query: ParsedFinanceQuery;
  title: string;
  summary: string;
  sections: {
    heading: string;
    items: string[];
  }[];
  metrics?: Record<string, number | string | null>;
  source?: string;
  timestamp?: string;
  freshness?: string;
  warnings?: string[];
  calculations?: Record<string, unknown> | null;
  followUps?: string[];
}

export interface LongTermFactorEvaluation {
  factor: 'GROWTH' | 'QUALITY' | 'VALUATION' | 'TREND' | 'RISK' | 'FINANCIAL_HEALTH';
  label: string;
  value: string | number | null;
  status: 'positive' | 'neutral' | 'negative' | 'insufficient_data';
  evidence: string;
}

export type LongTermOverallAssessment =
  | 'POSITIVE_EVIDENCE'
  | 'MIXED_EVIDENCE'
  | 'NEGATIVE_EVIDENCE'
  | 'INSUFFICIENT_DATA';

export interface LongTermAnalysisResult {
  symbol: string;
  overallAssessment: LongTermOverallAssessment;
  factors: LongTermFactorEvaluation[];
  summary: string;
  keyRisks: string[];
  whatWouldChangeAssessment: string[];
}

// ==========================================
// 2. Pure Financial Calculations
// ==========================================

export function calculateRoi(initial: number, final: number): number | null {
  if (typeof initial !== 'number' || typeof final !== 'number' || isNaN(initial) || isNaN(final)) return null;
  if (initial <= 0) return null;
  const roi = ((final - initial) / initial) * 100;
  return Math.round(roi * 100) / 100;
}

export function calculateCagr(initial: number, final: number, years: number): number | null {
  if (typeof initial !== 'number' || typeof final !== 'number' || typeof years !== 'number') return null;
  if (isNaN(initial) || isNaN(final) || isNaN(years)) return null;
  if (initial <= 0 || final <= 0 || years <= 0) return null;
  const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
  if (!isFinite(cagr) || isNaN(cagr)) return null;
  return Math.round(cagr * 100) / 100;
}

export function calculateSipFutureValue(
  monthlyAmount: number,
  annualReturnPct: number,
  years: number
): { totalInvested: number; futureValue: number; wealthGain: number } | null {
  if (
    typeof monthlyAmount !== 'number' ||
    typeof annualReturnPct !== 'number' ||
    typeof years !== 'number' ||
    isNaN(monthlyAmount) ||
    isNaN(annualReturnPct) ||
    isNaN(years)
  ) {
    return null;
  }
  if (monthlyAmount <= 0 || years <= 0 || annualReturnPct < -100) return null;

  const totalMonths = Math.round(years * 12);
  const totalInvested = Math.round(monthlyAmount * totalMonths);

  if (annualReturnPct === 0) {
    return {
      totalInvested,
      futureValue: totalInvested,
      wealthGain: 0,
    };
  }

  const i = annualReturnPct / 100 / 12;
  // Standard SIP Formula: FV = P * [ ((1 + i)^n - 1) / i ] * (1 + i)
  const fv = monthlyAmount * ((Math.pow(1 + i, totalMonths) - 1) / i) * (1 + i);
  if (!isFinite(fv) || isNaN(fv)) return null;

  const roundedFv = Math.round(fv);
  return {
    totalInvested,
    futureValue: roundedFv,
    wealthGain: Math.max(0, roundedFv - totalInvested),
  };
}

export function calculateAbsoluteReturn(initial: number, final: number): number | null {
  return calculateRoi(initial, final);
}

export function calculateAnnualizedReturn(initial: number, final: number, years: number): number | null {
  return calculateCagr(initial, final, years);
}

export function calculateMaxDrawdown(prices: number[]): {
  maxDrawdownPct: number;
  peakIndex: number;
  troughIndex: number;
} | null {
  if (!Array.isArray(prices) || prices.length < 2) return null;
  const validPrices = prices.filter((p) => typeof p === 'number' && !isNaN(p) && p > 0);
  if (validPrices.length < 2) return null;

  let peak = validPrices[0];
  let peakIdx = 0;
  let maxDd = 0;
  let maxPeakIdx = 0;
  let maxTroughIdx = 0;

  for (let i = 1; i < validPrices.length; i++) {
    const current = validPrices[i];
    if (current > peak) {
      peak = current;
      peakIdx = i;
    } else {
      const dd = ((peak - current) / peak) * 100;
      if (dd > maxDd) {
        maxDd = dd;
        maxPeakIdx = peakIdx;
        maxTroughIdx = i;
      }
    }
  }

  return {
    maxDrawdownPct: Math.round(maxDd * 100) / 100,
    peakIndex: maxPeakIdx,
    troughIndex: maxTroughIdx,
  };
}

export function calculatePortfolioAllocations(
  holdings: Array<{ name: string; amount: number; category?: string }>
): {
  total: number;
  allocations: Array<{ name: string; amount: number; percentage: number; category: string }>;
  topConcentrationPct: number;
} | null {
  if (!Array.isArray(holdings) || holdings.length === 0) return null;

  const sanitized = holdings.filter(
    (h) => h && typeof h.amount === 'number' && !isNaN(h.amount) && h.amount > 0
  );
  if (sanitized.length === 0) return null;

  const total = sanitized.reduce((sum, h) => sum + h.amount, 0);
  if (total <= 0) return null;

  const allocations = sanitized.map((h) => ({
    name: h.name || 'Unnamed Asset',
    amount: Math.round(h.amount),
    percentage: Math.round((h.amount / total) * 10000) / 100,
    category: h.category || 'Equity',
  }));

  allocations.sort((a, b) => b.amount - a.amount);
  const topConcentrationPct = allocations[0]?.percentage || 0;

  return {
    total: Math.round(total),
    allocations,
    topConcentrationPct,
  };
}

export function calculatePriceChange(
  current: number,
  previous: number
): { change: number; changePct: number } | null {
  if (
    typeof current !== 'number' ||
    typeof previous !== 'number' ||
    isNaN(current) ||
    isNaN(previous) ||
    previous <= 0
  ) {
    return null;
  }
  const change = Math.round((current - previous) * 100) / 100;
  const changePct = Math.round(((current - previous) / previous) * 10000) / 100;
  return { change, changePct };
}

export function calculateMovingAverage(prices: number[], period: number): number | null {
  if (!Array.isArray(prices) || period <= 0 || prices.length < period) return null;
  const slice = prices.slice(prices.length - period);
  const sum = slice.reduce((acc, val) => acc + (typeof val === 'number' && !isNaN(val) ? val : 0), 0);
  return Math.round((sum / period) * 100) / 100;
}

export function calculateRsi(closes: number[], period: number = 14): number | null {
  if (!Array.isArray(closes) || period <= 0 || closes.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return Math.round(rsi * 100) / 100;
}

export function calculateVolatility(prices: number[]): number | null {
  if (!Array.isArray(prices) || prices.length < 3) return null;

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0 && prices[i] > 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }

  if (returns.length < 2) return null;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const dailyStdDev = Math.sqrt(variance);

  // Annualized volatility (assuming 252 trading days)
  const annualizedVolPct = dailyStdDev * Math.sqrt(252) * 100;
  return Math.round(annualizedVolPct * 100) / 100;
}

// ==========================================
// 3. Symbol Dictionaries & Normalization
// ==========================================

export const INDIAN_STOCK_SYMBOLS = [
  'RELIANCE',
  'TCS',
  'INFY',
  'HDFCBANK',
  'ICICIBANK',
  'NIFTYBEES',
  'NIFTY',
  'SENSEX',
  'SBIN',
  'BHARTIARTL',
  'ITC',
  'LT',
  'KOTAKBANK',
  'WIPRO',
  'HCLTECH',
  'TATAMOTORS',
  'MARUTI',
  'AXISBANK',
  'ASIANPAINT',
  'TITAN',
  'BAJFINANCE',
] as const;

export const US_STOCK_SYMBOLS = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'NVDA',
  'META',
  'SPY',
  'QQQ',
  'VTI',
  'VOO',
  'TSLA',
  'BRK.B',
  'JPM',
  'V',
] as const;

export function isUsSymbol(rawSymbol: string): boolean {
  const clean = rawSymbol.trim().toUpperCase().replace(/\.NS$|\.BO$/i, '');
  return (US_STOCK_SYMBOLS as readonly string[]).includes(clean);
}

export function isIndianSymbol(rawSymbol: string): boolean {
  const clean = rawSymbol.trim().toUpperCase().replace(/\.NS$|\.BO$/i, '');
  return (INDIAN_STOCK_SYMBOLS as readonly string[]).includes(clean);
}

/**
 * Normalizes symbol for API calls.
 * CRITICAL RULE: US symbols must NEVER become .NS!
 */
export function getApiSymbol(symbol: string): string {
  const clean = symbol.trim().toUpperCase();
  if (isUsSymbol(clean)) {
    return clean.replace(/\.NS$/i, '');
  }
  if (clean === 'NIFTY' || clean === 'NIFTY 50') {
    return 'NIFTY 50';
  }
  if (clean === 'SENSEX') {
    return 'SENSEX';
  }
  if (!clean.includes('.') && isIndianSymbol(clean)) {
    return `${clean}.NS`;
  }
  return clean;
}

export function getCleanDisplaySymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\.NS$/i, '');
}

// ==========================================
// 4. Out-of-Domain & Ambiguity Filtering
// ==========================================

const CLEARLY_OUT_OF_DOMAIN_PATTERNS = [
  /\b(weather|temperature|forecast|rain|sunny)\b/i,
  /\b(cricket|match|ipl|football|soccer|score|world cup|messi|ronaldo)\b/i,
  /\b(recipe|cook|cooking|biryani|pizza|burger|bake|pasta)\b/i,
  /\b(movie|film|actor|actress|cinema|trailer|song|music|lyrics)\b/i,
  /\b(joke|riddle|game|play|dating|flirt)\b/i,
];

export function isClearlyOutOfDomain(text: string): boolean {
  const q = text.trim();
  for (const pattern of CLEARLY_OUT_OF_DOMAIN_PATTERNS) {
    if (pattern.test(q)) return true;
  }
  return false;
}

export function isAmbiguousNonFinancialQuery(text: string): boolean {
  const trimmed = text.trim();
  // "What is an apple?" / "What is apple?" (food sense) vs "Should I invest in Apple?" / "What is AAPL?"
  if (/^what is (an? )?apple\??$/i.test(trimmed)) {
    return true;
  }
  if (/^what is (a )?banana\??$/i.test(trimmed) || /^what is (an? )?orange\??$/i.test(trimmed)) {
    return true;
  }
  return false;
}

export const OUT_OF_DOMAIN_RESPONSE =
  "I’m VestIQ, a finance and investing assistant. I can help with stocks, ETFs, mutual funds, markets, portfolios, returns, risk, and financial concepts. Please ask a finance-related question.";

export const UNAVAILABLE_DATA_RESPONSE =
  "I don't have enough verified data to answer this question reliably.";

// ==========================================
// 5. Question Parser
// ==========================================

export function parseFinanceQuery(queryText: string): ParsedFinanceQuery {
  const originalQuery = (queryText || '').trim();
  const lower = originalQuery.toLowerCase();

  // 1. Check out-of-domain and ambiguity immediately
  if (isClearlyOutOfDomain(lower)) {
    return {
      intent: 'OUT_OF_DOMAIN',
      symbols: [],
      originalQuery,
      domain: 'OUT_OF_DOMAIN',
    };
  }

  if (isAmbiguousNonFinancialQuery(originalQuery)) {
    return {
      intent: 'OUT_OF_DOMAIN',
      symbols: [],
      originalQuery,
      domain: 'OUT_OF_DOMAIN',
      isAmbiguous: true,
    };
  }

  // 2. Extract Numbers, Horizon & Currency
  let amount: number | undefined;
  let years: number | undefined;
  let rate: number | undefined;
  let currency = 'INR';

  if (originalQuery.includes('$')) currency = 'USD';
  else if (originalQuery.includes('₹') || originalQuery.includes('rs') || originalQuery.includes('inr')) currency = 'INR';

  // Extract amount: e.g. ₹10000, 10,000, $500, 50k, 1 lakh
  const lakhMatch = originalQuery.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lac|l)\b/i);
  const croreMatch = originalQuery.match(/(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/i);
  const kMatch = originalQuery.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  const amountMatch = originalQuery.match(/[₹$]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)\b/);

  if (croreMatch) {
    amount = parseFloat(croreMatch[1]) * 10000000;
  } else if (lakhMatch) {
    amount = parseFloat(lakhMatch[1]) * 100000;
  } else if (kMatch) {
    amount = parseFloat(kMatch[1]) * 1000;
  } else if (amountMatch) {
    const rawNum = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (!isNaN(rawNum) && rawNum > 20) {
      amount = rawNum;
    }
  }

  // Extract years: e.g. "for 5 years", "10y", "5 yr", "3-year"
  const yearsMatch = originalQuery.match(/(\d+)\s*(?:years?|yrs?|y)\b/i);
  if (yearsMatch) {
    years = parseInt(yearsMatch[1], 10);
  }

  // Extract rate / percentage: e.g. "at 12%", "12% return"
  const rateMatch = originalQuery.match(/(\d+(?:\.\d+)?)\s*%/);
  if (rateMatch) {
    rate = parseFloat(rateMatch[1]);
  }

  // 3. Extract Symbols (Case-insensitive matching against universe)
  const detectedSymbols: string[] = [];

  // Check Indian symbols
  for (const s of INDIAN_STOCK_SYMBOLS) {
    const regex = new RegExp(`\\b${s}(?:\\.NS)?\\b`, 'i');
    if (regex.test(originalQuery) && !detectedSymbols.includes(s)) {
      detectedSymbols.push(s);
    }
  }

  // Check US symbols
  for (const s of US_STOCK_SYMBOLS) {
    const regex = new RegExp(`\\b${s}\\b`, 'i');
    if (regex.test(originalQuery) && !detectedSymbols.includes(s)) {
      detectedSymbols.push(s);
    }
  }

  // Handle company name synonyms: e.g. "Apple" -> AAPL, "Microsoft" -> MSFT, "Google" -> GOOGL
  if (/\bapple\b/i.test(originalQuery) && !detectedSymbols.includes('AAPL')) {
    if (/\b(invest|buy|share|stock|price|holding|worth|aapl)\b/i.test(originalQuery)) {
      detectedSymbols.push('AAPL');
    }
  }
  if (/\bmicrosoft\b/i.test(originalQuery) && !detectedSymbols.includes('MSFT')) {
    detectedSymbols.push('MSFT');
  }
  if (/\b(google|alphabet)\b/i.test(originalQuery) && !detectedSymbols.includes('GOOGL')) {
    detectedSymbols.push('GOOGL');
  }
  if (/\bamazon\b/i.test(originalQuery) && !detectedSymbols.includes('AMZN')) {
    detectedSymbols.push('AMZN');
  }
  if (/\bnvidia\b/i.test(originalQuery) && !detectedSymbols.includes('NVDA')) {
    detectedSymbols.push('NVDA');
  }
  if (/\breliance\b/i.test(originalQuery) && !detectedSymbols.includes('RELIANCE')) {
    detectedSymbols.push('RELIANCE');
  }
  if (/\binfosys\b/i.test(originalQuery) && !detectedSymbols.includes('INFY')) {
    detectedSymbols.push('INFY');
  }
  if (/\bhdfc\b/i.test(originalQuery) && !detectedSymbols.includes('HDFCBANK')) {
    detectedSymbols.push('HDFCBANK');
  }
  if (/\bicici\b/i.test(originalQuery) && !detectedSymbols.includes('ICICIBANK')) {
    detectedSymbols.push('ICICIBANK');
  }

  // 4. Determine Intent

  // COMPARISON: 2 or more symbols + compare / vs / or
  if (
    detectedSymbols.length >= 2 ||
    /\b(compare|vs|versus|better than|between)\b/i.test(lower)
  ) {
    if (detectedSymbols.length >= 2) {
      return {
        intent: 'COMPARISON',
        symbols: detectedSymbols,
        originalQuery,
        domain: 'STOCKS',
        currency: isUsSymbol(detectedSymbols[0]) ? 'USD' : 'INR',
      };
    }
  }

  // TECHNICAL: RSI, DMA, SMA, MACD, 200 DMA, 50 DMA, moving average
  if (
    /\b(rsi|dma|sma|moving average|200 dma|50 dma|macd|bollinger|support|resistance|overbought|oversold)\b/i.test(lower)
  ) {
    return {
      intent: 'TECHNICAL',
      symbols: detectedSymbols,
      metric: lower.includes('rsi')
        ? 'RSI'
        : lower.includes('200')
        ? '200_DMA'
        : lower.includes('50')
        ? '50_DMA'
        : 'TECHNICALS',
      originalQuery,
      domain: 'TECHNICAL_ANALYSIS',
      currency: detectedSymbols.length > 0 && isUsSymbol(detectedSymbols[0]) ? 'USD' : 'INR',
    };
  }

  // LONG_TERM: hold for X years, long term, good for 5 years, suitable for long term
  if (
    /\b(long term|long-term|hold for|suitable for long|good for (\d+ )?years?|for (\d+ )?years?)\b/i.test(lower) &&
    detectedSymbols.length > 0
  ) {
    return {
      intent: 'LONG_TERM',
      symbols: detectedSymbols,
      years,
      originalQuery,
      domain: 'INVESTING',
      currency: isUsSymbol(detectedSymbols[0]) ? 'USD' : 'INR',
    };
  }

  // FUNDAMENTALS: PE, ROE, ROCE, EPS, Debt to Equity, Market Cap, Valuation
  if (
    /\b(pe|p\/e|pe ratio|roe|roce|eps|debt|debt to equity|debt\/equity|book value|market cap|ebitda|valuation|revenue growth)\b/i.test(lower)
  ) {
    let metric = 'FUNDAMENTALS';
    if (/\b(pe|p\/e)\b/i.test(lower)) metric = 'PE';
    else if (/\broe\b/i.test(lower)) metric = 'ROE';
    else if (/\broce\b/i.test(lower)) metric = 'ROCE';
    else if (/\beps\b/i.test(lower)) metric = 'EPS';
    else if (/\bdebt\b/i.test(lower)) metric = 'DEBT_EQUITY';

    return {
      intent: 'FUNDAMENTALS',
      symbols: detectedSymbols,
      metric,
      originalQuery,
      domain: 'FUNDAMENTAL_ANALYSIS',
      currency: detectedSymbols.length > 0 && isUsSymbol(detectedSymbols[0]) ? 'USD' : 'INR',
    };
  }

  // RETURN / SIP / COMPOUNDING: "what will 10000 become", "return on 10000", "cagr of", "sip of"
  if (
    /\b(become|grow to|future value|return on|sip of|investing ₹|invest ₹|calculate return)\b/i.test(lower) ||
    (amount !== undefined && (years !== undefined || rate !== undefined))
  ) {
    return {
      intent: 'RETURN',
      symbols: detectedSymbols,
      amount,
      years,
      rate,
      currency,
      originalQuery,
      domain: 'FINANCIAL_CALCULATIONS',
    };
  }

  // PORTFOLIO: "portfolio allocation", "my holdings", "how diversified is my portfolio", "my asset allocation"
  if (
    /\b(portfolio|my allocation|my holdings|asset allocation|diversification|diversified)\b/i.test(lower)
  ) {
    return {
      intent: 'PORTFOLIO',
      symbols: detectedSymbols,
      originalQuery,
      domain: 'PORTFOLIO',
    };
  }

  // PERSONAL FINANCE: emergency fund, runway, monthly expense, savings rate
  if (
    /\b(emergency fund|runway|monthly expense|savings rate|affordability|financial health)\b/i.test(lower)
  ) {
    return {
      intent: 'PERSONAL_FINANCE',
      symbols: detectedSymbols,
      originalQuery,
      domain: 'PERSONAL_FINANCE',
    };
  }

  // EDUCATION: "what is cagr", "what is p/e", "define etf", "meaning of bond", "what is a mutual fund"
  if (
    /\b(what is|define|meaning of|explain|how does)\b/i.test(lower) &&
    detectedSymbols.length === 0
  ) {
    let metric = 'EDUCATION';
    if (/\bcagr\b/i.test(lower)) metric = 'CAGR';
    else if (/\b(pe|p\/e)\b/i.test(lower)) metric = 'PE';
    else if (/\beps\b/i.test(lower)) metric = 'EPS';
    else if (/\broe\b/i.test(lower)) metric = 'ROE';
    else if (/\broce\b/i.test(lower)) metric = 'ROCE';
    else if (/\betf\b/i.test(lower)) metric = 'ETF';
    else if (/\bmutual fund\b/i.test(lower)) metric = 'MUTUAL_FUND';
    else if (/\bbond\b/i.test(lower)) metric = 'BOND';
    else if (/\byield\b/i.test(lower)) metric = 'YIELD';
    else if (/\bdividend\b/i.test(lower)) metric = 'DIVIDEND';
    else if (/\bmarket cap\b/i.test(lower)) metric = 'MARKET_CAP';
    else if (/\bvolatility\b/i.test(lower)) metric = 'VOLATILITY';
    else if (/\bdrawdown\b/i.test(lower)) metric = 'DRAWDOWN';
    else if (/\brsi\b/i.test(lower)) metric = 'RSI';
    else if (/\bmacd\b/i.test(lower)) metric = 'MACD';
    else if (/\b200 dma\b/i.test(lower) || /\b200-day\b/i.test(lower)) metric = '200_DMA';
    else if (/\b50 dma\b/i.test(lower) || /\b50-day\b/i.test(lower)) metric = '50_DMA';
    else if (/\bsip\b/i.test(lower)) metric = 'SIP';
    else if (/\bdiversification\b/i.test(lower)) metric = 'DIVERSIFICATION';

    return {
      intent: 'EDUCATION',
      symbols: [],
      metric,
      originalQuery,
      domain: 'FINANCIAL_EDUCATION',
    };
  }

  // MARKET / EVENT: Brent crude hits $95, OMC stocks, budget, rbi, fed, inflation
  if (
    /\b(brent|crude|omc|oil|inflation rate|rbi|federal reserve|fed rate|war|geopolitical|nifty today|market status)\b/i.test(lower)
  ) {
    return {
      intent: 'MARKET',
      symbols: detectedSymbols,
      originalQuery,
      domain: 'MARKETS',
    };
  }

  // QUOTE: Single symbol price inquiry e.g. "RELIANCE price", "What is AAPL price?", "INFY trading at"
  if (
    detectedSymbols.length === 1 ||
    /\b(price|current price|trading at|share price|quote|cmp|ltp)\b/i.test(lower)
  ) {
    if (detectedSymbols.length > 0) {
      return {
        intent: 'QUOTE',
        symbols: [detectedSymbols[0]],
        originalQuery,
        domain: 'STOCKS',
        currency: isUsSymbol(detectedSymbols[0]) ? 'USD' : 'INR',
      };
    }
  }

  return {
    intent: 'UNSUPPORTED',
    symbols: detectedSymbols,
    originalQuery,
    domain: 'UNKNOWN',
  };
}

// ==========================================
// 6. Educational Knowledge Base (Deterministic)
// ==========================================

export const FINANCIAL_EDUCATION_DICTIONARY: Record<
  string,
  {
    title: string;
    definition: string;
    formula?: string;
    interpretation: string;
    example: string;
  }
> = {
  CAGR: {
    title: 'Compound Annual Growth Rate (CAGR)',
    definition:
      'CAGR represents the mean annual growth rate of an investment over a specified time period longer than one year, smoothing out volatility.',
    formula: 'CAGR = (Ending Value / Beginning Value)^(1 / n) - 1',
    interpretation:
      'A higher CAGR indicates stronger annualized compounding. It provides a standardized basis to compare performance across asset classes.',
    example:
      'An investment growing from ₹1,00,000 to ₹2,00,000 in 5 years has a CAGR of ~14.87%.',
  },
  PE: {
    title: 'Price-to-Earnings (P/E) Ratio',
    definition:
      'The P/E ratio measures a company’s current share price relative to its per-share earnings (EPS). It indicates how much investors are willing to pay for each rupee/dollar of earnings.',
    formula: 'P/E = Market Price per Share / Earnings Per Share (EPS)',
    interpretation:
      'High P/E often reflects high growth expectations or premium valuation. Low P/E can signal undervaluation or structural challenges.',
    example:
      'If a stock trades at ₹3,000 and has an EPS of ₹100, its P/E ratio is 30.0.',
  },
  EPS: {
    title: 'Earnings Per Share (EPS)',
    definition:
      'EPS measures the portion of a company’s net profit allocated to each outstanding share of common stock.',
    formula: 'EPS = Net Income / Total Outstanding Shares',
    interpretation:
      'Consistently growing EPS is one of the strongest indicators of long-term corporate profitability and business durability.',
    example:
      'A company with ₹1,000 crore net profit and 100 crore outstanding shares delivers an EPS of ₹10.',
  },
  ROE: {
    title: 'Return on Equity (ROE)',
    definition:
      'ROE measures how efficiently management generates profit from the equity capital provided by shareholders.',
    formula: 'ROE = (Net Income / Shareholders’ Equity) * 100',
    interpretation:
      'Institutional investors generally view an ROE sustainably above 15% as a sign of competitive moat and capital efficiency.',
    example:
      '₹150 crore net income generated on ₹1,000 crore shareholder equity yields a 15% ROE.',
  },
  ROCE: {
    title: 'Return on Capital Employed (ROCE)',
    definition:
      'ROCE measures profitability relative to total capital (both equity and debt). It assesses capital efficiency regardless of capital structure.',
    formula: 'ROCE = (EBIT / Capital Employed) * 100',
    interpretation:
      'Crucial for debt-financed capital-intensive sectors. ROCE should comfortably exceed the company’s cost of capital.',
    example:
      '₹200 crore EBIT on ₹1,000 crore capital employed yields a 20% ROCE.',
  },
  ETF: {
    title: 'Exchange-Traded Fund (ETF)',
    definition:
      'An ETF is a pooled investment vehicle traded on stock exchanges like individual shares, typically tracking an index, sector, or commodity.',
    interpretation:
      'Combines the diversification of a mutual fund with the intraday liquidity, transparency, and low expense ratios of common equities.',
    example:
      'NIFTYBEES tracks the Nifty 50 Index on the NSE with fractional intraday execution.',
  },
  MUTUAL_FUND: {
    title: 'Mutual Fund',
    definition:
      'A professionally managed fund pooling money from multiple investors to purchase securities like stocks, bonds, or money market instruments.',
    interpretation:
      'Units are transacted once daily at the end-of-day Net Asset Value (NAV), making them ideal for disciplined automated SIP accumulation.',
    example:
      'A diversified flexi-cap mutual fund investing across large, mid, and small-cap companies.',
  },
  BOND: {
    title: 'Bond (Fixed Income Security)',
    definition:
      'A bond is a debt instrument where an investor loans money to an entity (government or corporation) that borrows funds for a defined period at a fixed or variable interest rate.',
    interpretation:
      'Provides capital preservation, portfolio stability, and predictable periodic coupon income.',
    example:
      'Government of India 10-Year Benchmark Bond paying a semi-annual coupon.',
  },
  YIELD: {
    title: 'Yield',
    definition:
      'Yield refers to the earnings generated and realized on an investment over a specific time, expressed as a percentage of cost or current market value.',
    interpretation:
      'Includes dividend yield for equities and yield to maturity (YTM) for fixed-income instruments.',
    example:
      'A bond priced at ₹1,000 paying ₹70 annual coupon yields 7.0%.',
  },
  DIVIDEND: {
    title: 'Dividend',
    definition:
      'A distribution of a portion of a company’s earnings to shareholders, approved by the board of directors.',
    interpretation:
      'Regular dividend payouts signal cash flow maturity and capital discipline.',
    example:
      'A company declaring a dividend of ₹15 per share on a face value of ₹10.',
  },
  MARKET_CAP: {
    title: 'Market Capitalization',
    definition:
      'The total dollar or rupee market value of a company’s outstanding shares of stock.',
    formula: 'Market Cap = Current Share Price * Total Outstanding Shares',
    interpretation:
      'Categorizes companies into Large-cap, Mid-cap, and Small-cap tiers with varying risk/liquidity profiles.',
    example:
      'A company with 100 crore shares trading at ₹2,500 has a market cap of ₹2,50,000 crore.',
  },
  VOLATILITY: {
    title: 'Volatility',
    definition:
      'A statistical measure of the dispersion of returns for a given security or market index, typically measured using standard deviation.',
    interpretation:
      'Higher volatility implies wider price swings and higher investment risk or uncertainty.',
    example:
      'An annualized standard deviation of 18% indicates expected price fluctuation bandwidth.',
  },
  DRAWDOWN: {
    title: 'Maximum Drawdown',
    definition:
      'The maximum observed loss from a peak to a trough of a portfolio before a new peak is attained.',
    interpretation:
      'Quantifies downside risk over a specific time horizon.',
    example:
      'If a portfolio drops from ₹10 lakh to ₹7 lakh, the maximum drawdown is -30%.',
  },
  RSI: {
    title: 'Relative Strength Index (RSI)',
    definition:
      'A momentum oscillator that measures the speed and change of price movements on a scale of 0 to 100.',
    interpretation:
      'RSI above 70 typically suggests overbought conditions; RSI below 30 indicates oversold conditions.',
    example:
      'A 14-day RSI of 28 reflects short-term oversold momentum.',
  },
  MACD: {
    title: 'Moving Average Convergence Divergence (MACD)',
    definition:
      'A trend-following momentum indicator showing the relationship between two exponential moving averages of a security’s price.',
    interpretation:
      'Bullish crossover occurs when the MACD line crosses above the signal line; bearish when crossing below.',
    example:
      '12-day EMA crossing above 26-day EMA generates an upward momentum trigger.',
  },
  '200_DMA': {
    title: '200-Day Moving Average (200 DMA)',
    definition:
      'The average closing price of a security over the past 200 trading sessions, serving as a primary indicator of long-term trend.',
    interpretation:
      'Trading above the 200 DMA indicates a long-term bull trend; trading below indicates a bear trend.',
    example:
      'A stock at ₹2,800 with a 200 DMA at ₹2,500 confirms a sustained upward macro structure.',
  },
  '50_DMA': {
    title: '50-Day Moving Average (50 DMA)',
    definition:
      'The average closing price of a security over the past 50 trading sessions, highlighting intermediate trend direction.',
    interpretation:
      'Useful for identifying medium-term support and resistance dynamic zones.',
    example:
      'A golden cross occurs when the 50 DMA crosses above the 200 DMA.',
  },
  SIP: {
    title: 'Systematic Investment Plan (SIP)',
    definition:
      'An automated investing mechanism where a fixed sum is invested at regular intervals (monthly/quarterly) into a mutual fund or equity basket.',
    interpretation:
      'Takes advantage of Rupee Cost Averaging and eliminates the need to time the market.',
    example:
      'Investing ₹5,000 on the 5th of every month into an index fund.',
  },
  DIVERSIFICATION: {
    title: 'Portfolio Diversification',
    definition:
      'A risk management strategy mixing a wide variety of investments within a portfolio to limit exposure to any single asset or risk factor.',
    interpretation:
      'Lowers unsystematic (company-specific) risk without necessarily reducing expected long-term return.',
    example:
      'Holding a mix of Indian large-cap equities, global ETFs, short-duration debt, and gold.',
  },
};

// ==========================================
// 7. Deterministic Handlers & Execution
// ==========================================

export async function executeDeterministicAdvisor(
  parsed: ParsedFinanceQuery,
  userContext?: any
): Promise<VestiqRuleResult> {
  const { intent, symbols, metric, years, amount, rate, currency } = parsed;

  // Handler: OUT_OF_DOMAIN
  if (intent === 'OUT_OF_DOMAIN') {
    return {
      query: parsed,
      title: 'VestIQ Finance Assistant',
      summary: OUT_OF_DOMAIN_RESPONSE,
      sections: [
        {
          heading: 'Supported Topics',
          items: [
            'Real-time quotes & historical trends for Indian and US equities',
            'Fundamental valuation ratios (P/E, ROE, ROCE, EPS, Debt-to-Equity)',
            'Technical indicators (RSI, 50 DMA, 200 DMA, volatility)',
            'SIP wealth projections, CAGR, and compound interest calculations',
            'Portfolio asset allocation and concentration checks',
            'Financial definitions and education (ETFs, mutual funds, bonds)',
          ],
        },
      ],
      followUps: [
        'What is RELIANCE price?',
        'Compare RELIANCE and TCS',
        'What is CAGR?',
        'Calculate SIP of ₹5000 for 10 years at 12%',
      ],
    };
  }

  // Handler: EDUCATION
  if (intent === 'EDUCATION') {
    const key = (metric || 'CAGR').toUpperCase();
    const entry = FINANCIAL_EDUCATION_DICTIONARY[key] || FINANCIAL_EDUCATION_DICTIONARY.CAGR;

    const sections = [
      {
        heading: 'Definition',
        items: [entry.definition],
      },
    ];

    if (entry.formula) {
      sections.push({
        heading: 'Formula',
        items: [`\`${entry.formula}\``],
      });
    }

    sections.push(
      {
        heading: 'How to Interpret',
        items: [entry.interpretation],
      },
      {
        heading: 'Practical Example',
        items: [entry.example],
      }
    );

    return {
      query: parsed,
      title: entry.title,
      summary: entry.definition,
      sections,
      followUps: [
        `What is P/E?`,
        `What is 200 DMA?`,
        `What is SIP?`,
        `What is ROE?`,
      ],
    };
  }

  // Handler: QUOTE
  if (intent === 'QUOTE') {
    if (symbols.length === 0) {
      return makeUnavailableResult(parsed, 'No recognized stock or ETF symbol was provided.');
    }
    const cleanSym = symbols[0];
    const apiSym = getApiSymbol(cleanSym);

    try {
      const quote = await marketApi.getQuote(apiSym);
      if (!quote || quote.price === null || quote.price === undefined || quote.freshness === 'UNAVAILABLE') {
        return makeUnavailableResult(parsed, `Current market quote for ${cleanSym} is currently unavailable.`);
      }

      const currSymbol = quote.currency === 'USD' ? '$' : '₹';
      const hasChange = typeof quote.change === 'number' && !isNaN(quote.change);
      const hasChangePct = typeof quote.changePct === 'number' && !isNaN(quote.changePct);
      const chgText = hasChange ? `${quote.change! >= 0 ? '+' : ''}${quote.change}` : 'Unavailable';
      const chgPctText = hasChangePct ? `${quote.changePct! >= 0 ? '+' : ''}${quote.changePct}%` : 'Unavailable';
      const exchangeText = quote.exchange && quote.exchange !== 'UNKNOWN' ? quote.exchange : 'Unavailable';
      const changeSummary = hasChange || hasChangePct
        ? ` (${hasChange ? chgText : 'N/A'} / ${hasChangePct ? chgPctText : 'N/A'})`
        : '';

      return {
        query: parsed,
        title: `${quote.name || cleanSym} (${cleanSym})`,
        summary: `Current price: ${currSymbol}${quote.price.toLocaleString()}${changeSummary}`,
        sections: [
          {
            heading: 'Quote Details',
            items: [
              `**Current Price:** ${currSymbol}${quote.price.toLocaleString()}`,
              `**Day Change:** ${hasChange ? chgText : 'Unavailable'} (${hasChangePct ? chgPctText : 'Unavailable'})`,
              `**Exchange:** ${exchangeText}`,
              `**Asset Type:** ${quote.assetType && quote.assetType !== 'UNKNOWN' ? quote.assetType : 'Unavailable'}`,
              `**Data Status:** ${quote.status || (quote.freshness === 'REALTIME' ? 'LIVE' : 'DELAYED')}`,
              `**Source:** ${quote.source || 'Authorized Live Market Engine'}`,
              `**As of:** ${quote.asOf || quote.displayTimestampIst || 'Today'}`,
            ],
          },
        ],
        metrics: {
          price: quote.price,
          change: hasChange ? quote.change : null,
          changePct: hasChangePct ? quote.changePct : null,
          open: quote.open || null,
          high: quote.high || null,
          low: quote.low || null,
          prevClose: quote.prevClose || null,
        },
        source: quote.source || 'Authorized Live Market Engine',
        timestamp: quote.asOf || quote.displayTimestampIst || 'Today',
        freshness: quote.freshness,
        calculations: {
          type: 'stock_snapshot',
          symbol: cleanSym,
          title: quote.name || cleanSym,
          price: quote.price,
          changePct: quote.changePct,
        },
        followUps: [
          `What is ${cleanSym} PE?`,
          `RSI of ${cleanSym}`,
          `Is ${cleanSym} good for 5 years?`,
        ],
      };
    } catch {
      return makeUnavailableResult(parsed);
    }
  }

  // Handler: FUNDAMENTALS
  if (intent === 'FUNDAMENTALS') {
    if (symbols.length === 0) {
      return makeUnavailableResult(parsed, 'No stock symbol identified for fundamental analysis.');
    }
    const cleanSym = symbols[0];
    const apiSym = getApiSymbol(cleanSym);

    try {
      const research = await marketApi.getResearch(apiSym);
      const fund = research?.fundamentals;

      if (!fund || fund.freshness === 'UNAVAILABLE') {
        return makeUnavailableResult(parsed, `Fundamental data for ${cleanSym} is currently unavailable.`);
      }

      const curr = isUsSymbol(cleanSym) ? '$' : '₹';
      const items = [
        `**P/E Ratio:** ${fund.peRatio !== undefined && fund.peRatio !== null ? fund.peRatio : 'N/A'}`,
        `**Price-to-Book (P/B):** ${fund.pbRatio !== undefined && fund.pbRatio !== null ? fund.pbRatio : 'N/A'}`,
        `**Earnings Per Share (EPS):** ${fund.eps !== undefined && fund.eps !== null ? `${curr}${fund.eps}` : 'N/A'}`,
        `**Return on Equity (ROE):** ${fund.roe !== undefined && fund.roe !== null ? `${fund.roe}%` : 'N/A'}`,
        `**ROCE:** ${fund.roce !== undefined && fund.roce !== null ? `${fund.roce}%` : 'N/A'}`,
        `**Debt-to-Equity:** ${fund.debtToEquity !== undefined && fund.debtToEquity !== null ? fund.debtToEquity : 'N/A'}`,
        `**Dividend Yield:** ${fund.dividendYield !== undefined && fund.dividendYield !== null ? `${fund.dividendYield}%` : 'N/A'}`,
        `**Revenue Growth:** ${fund.revenueGrowth !== undefined && fund.revenueGrowth !== null ? `${fund.revenueGrowth}%` : 'N/A'}`,
      ];

      return {
        query: parsed,
        title: `${cleanSym} Fundamentals`,
        summary: `Institutional fundamental valuation snapshot for ${cleanSym}.`,
        sections: [
          {
            heading: 'Key Valuation & Financial Metrics',
            items,
          },
          {
            heading: 'Data Disclosures',
            items: [
              `**Data Freshness:** ${fund.freshness || 'LATEST_AVAILABLE'}`,
              `**Source:** ${fund.source || 'SmartVest Fundamental Research Engine'}`,
              `**As of:** ${fund.asOf || 'Latest Financial Filing'}`,
            ],
          },
        ],
        metrics: {
          peRatio: fund.peRatio ?? null,
          pbRatio: fund.pbRatio ?? null,
          eps: fund.eps ?? null,
          roe: fund.roe ?? null,
          roce: fund.roce ?? null,
          debtToEquity: fund.debtToEquity ?? null,
          dividendYield: fund.dividendYield ?? null,
        },
        source: fund.source || 'SmartVest Fundamental Research Engine',
        timestamp: fund.asOf || 'Today',
        freshness: fund.freshness,
        followUps: [
          `Is ${cleanSym} good for 5 years?`,
          `RSI of ${cleanSym}`,
          `Compare ${cleanSym} and ${cleanSym === 'RELIANCE' ? 'TCS' : 'RELIANCE'}`,
        ],
      };
    } catch {
      return makeUnavailableResult(parsed);
    }
  }

  // Handler: TECHNICAL
  if (intent === 'TECHNICAL') {
    if (symbols.length === 0) {
      return makeUnavailableResult(parsed, 'No stock symbol identified for technical analysis.');
    }
    const cleanSym = symbols[0];
    const apiSym = getApiSymbol(cleanSym);

    try {
      const candles = await marketApi.getCandles(apiSym, '1y', '1d');
      const obs = candles?.observations || [];

      if (!obs || obs.length < 20) {
        return makeUnavailableResult(parsed, `Insufficient historical price data for ${cleanSym} to compute technical indicators.`);
      }

      const closes = obs.map((o) => o.close).filter((c) => typeof c === 'number' && !isNaN(c));
      const currentPrice = closes[closes.length - 1];
      const rsi14 = calculateRsi(closes, 14);
      const sma50 = calculateMovingAverage(closes, 50);
      const has200Closes = closes.length >= 200;
      const sma200 = has200Closes ? calculateMovingAverage(closes, 200) : null;
      const vol = calculateVolatility(closes);

      // If user specifically requested 200 DMA and < 200 observations exist:
      if (parsed.metric === '200_DMA' && !has200Closes) {
        return {
          query: parsed,
          title: `${cleanSym} 200-Day Moving Average`,
          summary: 'Insufficient data for 200 DMA.',
          sections: [
            {
              heading: 'Data Integrity Notice',
              items: [
                'Calculating a valid 200 DMA requires at least 200 daily close observations.',
                `Only ${closes.length} valid daily close observations were retrieved for ${cleanSym}.`,
                'VestIQ never labels an average using fewer than 200 observations as 200 DMA.',
              ],
            },
          ],
          metrics: {
            currentPrice,
            sma200: null,
          },
          source: candles.source || 'Historical Market Feed',
          timestamp: 'Latest Session Close',
          freshness: candles.freshness || 'HISTORICAL',
          followUps: [
            `What is 200 DMA?`,
            `RSI of ${cleanSym}`,
            `What is ${cleanSym} price?`,
          ],
        };
      }

      const items = [
        `**Last Closing Price:** ${isUsSymbol(cleanSym) ? '$' : '₹'}${currentPrice}`,
        `**RSI (14-period):** ${rsi14 !== null ? `${rsi14} (${rsi14 >= 70 ? 'Overbought' : rsi14 <= 30 ? 'Oversold' : 'Neutral'})` : 'N/A'}`,
        `**50-Day Moving Average:** ${sma50 !== null ? `${sma50} (${currentPrice >= sma50 ? 'Above 50 DMA' : 'Below 50 DMA'})` : (closes.length < 50 ? 'Insufficient data for 50 DMA.' : 'N/A')}`,
        `**200-Day Moving Average:** ${sma200 !== null ? `${sma200} (${currentPrice >= sma200 ? 'Above 200 DMA' : 'Below 200 DMA'})` : 'Insufficient data for 200 DMA.'}`,
        `**Annualized Realized Volatility:** ${vol !== null ? `${vol}%` : 'N/A'}`,
      ];

      return {
        query: parsed,
        title: `${cleanSym} Technical Indicators`,
        summary: `Deterministic technical indicator breakdown for ${cleanSym} computed from ${obs.length} daily sessions.`,
        sections: [
          {
            heading: 'Indicator Values',
            items,
          },
          {
            heading: 'Methodology & Data Integrity',
            items: [
              `Calculated using standard 14-period Wilder RSI and simple moving averages.`,
              has200Closes
                ? `200 DMA verified using ${closes.length} daily close observations.`
                : `Insufficient data for 200 DMA (requires >= 200 daily close observations; retrieved ${closes.length}).`,
              `**Data Freshness:** ${candles.freshness || 'HISTORICAL'}`,
              `**Source:** ${candles.source || 'Historical Market Feed'}`,
            ],
          },
        ],
        metrics: {
          currentPrice,
          rsi14,
          sma50,
          sma200,
          volatility: vol,
        },
        source: candles.source || 'Historical Market Feed',
        timestamp: 'Latest Session Close',
        freshness: candles.freshness,
        followUps: [
          `What is ${cleanSym} PE?`,
          `Is ${cleanSym} good for 5 years?`,
          `What is 200 DMA?`,
        ],
      };
    } catch {
      return makeUnavailableResult(parsed);
    }
  }

  // Handler: COMPARISON
  if (intent === 'COMPARISON') {
    if (symbols.length < 2) {
      return makeUnavailableResult(parsed, 'At least two symbols are required for comparative analysis.');
    }
    const sym1 = symbols[0];
    const sym2 = symbols[1];
    const api1 = getApiSymbol(sym1);
    const api2 = getApiSymbol(sym2);

    try {
      const [q1, q2, r1, r2] = await Promise.all([
        marketApi.getQuote(api1).catch(() => null),
        marketApi.getQuote(api2).catch(() => null),
        marketApi.getResearch(api1).catch(() => null),
        marketApi.getResearch(api2).catch(() => null),
      ]);

      if (!q1 || !q2 || q1.price === null || q2.price === null) {
        return makeUnavailableResult(parsed, `Comparative market data is currently unavailable for one or both symbols.`);
      }

      const curr1 = q1.currency === 'USD' ? '$' : '₹';
      const curr2 = q2.currency === 'USD' ? '$' : '₹';
      const f1 = r1?.fundamentals;
      const f2 = r2?.fundamentals;

      const hasChg1 = typeof q1.changePct === 'number' && !isNaN(q1.changePct);
      const hasChg2 = typeof q2.changePct === 'number' && !isNaN(q2.changePct);
      const chg1Text = hasChg1 ? `${q1.changePct! >= 0 ? '+' : ''}${q1.changePct}%` : 'Unavailable';
      const chg2Text = hasChg2 ? `${q2.changePct! >= 0 ? '+' : ''}${q2.changePct}%` : 'Unavailable';

      const exch1 = q1.exchange && q1.exchange !== 'UNKNOWN' ? q1.exchange : 'Unavailable';
      const exch2 = q2.exchange && q2.exchange !== 'UNKNOWN' ? q2.exchange : 'Unavailable';

      const items = [
        `| Metric | ${sym1} | ${sym2} |`,
        `| :--- | :--- | :--- |`,
        `| **Price** | ${curr1}${q1.price} | ${curr2}${q2.price} |`,
        `| **Day Change** | ${chg1Text} | ${chg2Text} |`,
        `| **P/E Ratio** | ${f1?.peRatio !== undefined && f1?.peRatio !== null ? f1.peRatio : 'N/A'} | ${f2?.peRatio !== undefined && f2?.peRatio !== null ? f2.peRatio : 'N/A'} |`,
        `| **ROE** | ${typeof f1?.roe === 'number' ? `${f1.roe}%` : 'N/A'} | ${typeof f2?.roe === 'number' ? `${f2.roe}%` : 'N/A'} |`,
        `| **ROCE** | ${typeof f1?.roce === 'number' ? `${f1.roce}%` : 'N/A'} | ${typeof f2?.roce === 'number' ? `${f2.roce}%` : 'N/A'} |`,
        `| **Debt/Equity** | ${typeof f1?.debtToEquity === 'number' ? f1.debtToEquity : 'N/A'} | ${typeof f2?.debtToEquity === 'number' ? f2.debtToEquity : 'N/A'} |`,
        `| **Exchange** | ${exch1} | ${exch2} |`,
      ];

      return {
        query: parsed,
        title: `Comparison: ${sym1} vs ${sym2}`,
        summary: `Deterministic side-by-side metric comparison between ${sym1} and ${sym2}.`,
        sections: [
          {
            heading: 'Side-by-Side Fundamentals & Market Data',
            items,
          },
        ],
        source: 'SmartVest Market & Fundamental Engine',
        timestamp: 'Latest Available Session',
        freshness: q1.freshness,
        followUps: [
          `What is ${sym1} price?`,
          `What is ${sym2} price?`,
          `Is ${sym1} good for 5 years?`,
        ],
      };
    } catch {
      return makeUnavailableResult(parsed);
    }
  }

  // Handler: LONG_TERM
  if (intent === 'LONG_TERM') {
    if (symbols.length === 0) {
      return makeUnavailableResult(parsed, 'No stock symbol identified for long-term evaluation.');
    }
    const cleanSym = symbols[0];
    const apiSym = getApiSymbol(cleanSym);

    try {
      const evaluation = await evaluateLongTermFactors(cleanSym, apiSym);

      const factorBullets = evaluation.factors.map(
        (f) => `• **${f.label}:** ${f.value !== null ? f.value : 'N/A'} (${f.status.toUpperCase()}) — ${f.evidence}`
      );

      return {
        query: parsed,
        title: `${cleanSym} — Long-Term Research Assessment`,
        summary: `Transparent multi-factor evidence evaluation for a ${years || 5}-year investment horizon.`,
        sections: [
          {
            heading: 'Evidence by Measurable Dimension',
            items: factorBullets,
          },
          {
            heading: 'Long-Term Assessment',
            items: [
              `**Overall Evidence Rating:** **${evaluation.overallAssessment.replace('_', ' ')}**`,
              evaluation.summary,
            ],
          },
          {
            heading: 'Key Structural Risks',
            items: evaluation.keyRisks,
          },
          {
            heading: 'What Would Change This Assessment',
            items: evaluation.whatWouldChangeAssessment,
          },
        ],
        source: 'SmartVest Transparent Rule Engine',
        timestamp: 'Current Fundamental Baseline',
        freshness: 'LATEST_AVAILABLE',
        followUps: [
          `What is ${cleanSym} PE?`,
          `RSI of ${cleanSym}`,
          `Compare ${cleanSym} and ${cleanSym === 'RELIANCE' ? 'TCS' : 'RELIANCE'}`,
        ],
      };
    } catch {
      return makeUnavailableResult(parsed);
    }
  }

  // Handler: RETURN (SIP / Compound Growth)
  if (intent === 'RETURN') {
    const hasAmount = typeof amount === 'number' && !isNaN(amount) && amount > 0;
    const hasYears = typeof years === 'number' && !isNaN(years) && years > 0;
    const hasRate = typeof rate === 'number' && !isNaN(rate) && rate > 0;

    const p = hasAmount ? amount! : 10000;
    const y = hasYears ? years! : 5;
    const r = hasRate ? rate! : 12;

    const sipCalc = calculateSipFutureValue(p, r, y);
    if (!sipCalc) {
      return makeUnavailableResult(parsed, 'Invalid calculation parameters provided.');
    }

    const curr = currency === 'USD' ? '$' : '₹';
    const warnings: string[] = [];
    const assumptionItems: string[] = [];

    if (!hasAmount) {
      warnings.push('Monthly contribution not provided. Modeled with an illustrative ₹10,000/month.');
      assumptionItems.push('• **Monthly Contribution:** Not specified by user; modeled with an illustrative ₹10,000/month.');
    }
    if (!hasYears) {
      warnings.push('Investment duration not provided. Modeled with an illustrative 5-year horizon.');
      assumptionItems.push('• **Investment Duration:** Not specified by user; modeled with an illustrative 5-year duration.');
    }
    if (!hasRate) {
      warnings.push('Return rate not provided. Modeled with an illustrative 12% annual rate. This is not an expected or guaranteed return.');
      assumptionItems.push('• **Rate of Return:** Not specified by user; modeled at an illustrative 12% annual rate. This is a hypothetical mathematical assumption, not an expected or verified return.');
    }

    const allInputsProvided = hasAmount && hasYears && hasRate;
    const title = allInputsProvided
      ? `SIP Projection: ${curr}${p.toLocaleString()} Monthly for ${y} Years at ${r}%`
      : `Illustrative SIP Model: ${curr}${p.toLocaleString()}/mo for ${y}Y at ${r}% (${[!hasAmount && 'Amount', !hasYears && 'Duration', !hasRate && 'Rate'].filter(Boolean).join(', ')} Assumed)`;

    const summary = allInputsProvided
      ? `Investing ${curr}${p.toLocaleString()}/month for ${y} years at a modeled ${r}% annual rate yields a projected future corpus of ${curr}${sipCalc.futureValue.toLocaleString()} (wealth gain of ${curr}${sipCalc.wealthGain.toLocaleString()}).`
      : `Illustrative model (unspecified inputs assumed): Investing ${curr}${p.toLocaleString()}/month for ${y} years at a hypothetical ${r}% CAGR results in an estimated corpus of ${curr}${sipCalc.futureValue.toLocaleString()}. Note: Assumed return rates are hypothetical models and never expected or verified returns.`;

    const sections = [
      ...(assumptionItems.length > 0
        ? [
            {
              heading: 'Stated Assumptions & Missing Inputs',
              items: [
                ...assumptionItems,
                'To calculate without assumptions, provide your specific inputs (e.g., "Calculate SIP of ₹5000 for 10 years at 12%").',
              ],
            },
          ]
        : []),
      {
        heading: 'Calculation Breakdown',
        items: [
          `**Monthly Contribution:** ${curr}${p.toLocaleString()}${hasAmount ? '' : ' (Illustrative Assumption)'}`,
          `**Time Horizon:** ${y} Years (${y * 12} Monthly Installments)${hasYears ? '' : ' (Illustrative Assumption)'}`,
          `**Model Return Rate:** ${r}% annual${hasRate ? '' : ' (Hypothetical Assumption — Not Guaranteed)'}`,
          `**Total Principal Invested:** ${curr}${sipCalc.totalInvested.toLocaleString()}`,
          `**Estimated Wealth Gain:** ${curr}${sipCalc.wealthGain.toLocaleString()}`,
          `**Estimated Final Corpus:** **${curr}${sipCalc.futureValue.toLocaleString()}**`,
        ],
      },
      {
        heading: 'Mathematical Transparency & Compliance',
        items: [
          `Calculated using standard monthly compounding annuity formula: \`FV = P * [ ((1 + i)^n - 1) / i ] * (1 + i)\`.`,
          `**Regulatory Notice:** Assumed return rates are purely illustrative mathematical inputs. They do NOT represent verified, expected, or guaranteed future returns. Actual returns will fluctuate with market conditions.`,
        ],
      },
    ];

    return {
      query: parsed,
      title,
      summary,
      sections,
      warnings: warnings.length > 0 ? warnings : undefined,
      calculations: {
        type: 'sip_calculation',
        monthlyInvestment: p,
        investedAmount: sipCalc.totalInvested,
        estimatedReturns: sipCalc.wealthGain,
        totalValue: sipCalc.futureValue,
        years: y,
        cagr: r,
        assumedInputs: {
          amount: !hasAmount,
          years: !hasYears,
          rate: !hasRate,
        },
      },
      followUps: [
        `Calculate SIP of ${curr}${p} for ${y} years at 10%`,
        `Calculate SIP of ${curr}${p} for ${y + 5} years at 12%`,
        `What is CAGR?`,
      ],
    };
  }

  // Handler: PORTFOLIO
  if (intent === 'PORTFOLIO') {
    try {
      let portfolioData = await authApi.getPortfolio().catch(() => null);
      if (!portfolioData || !Array.isArray(portfolioData.holdings) || portfolioData.holdings.length === 0) {
        // Fallback to userContext holdings if passed
        if (userContext?.portfolio?.holdings && Array.isArray(userContext.portfolio.holdings) && userContext.portfolio.holdings.length > 0) {
          portfolioData = { holdings: userContext.portfolio.holdings };
        }
      }

      if (!portfolioData || !Array.isArray(portfolioData.holdings) || portfolioData.holdings.length === 0) {
        return {
          query: parsed,
          title: 'Portfolio Analysis',
          summary: 'No active portfolio holdings found in your verified account record.',
          sections: [
            {
              heading: 'Getting Started',
              items: [
                'Add your holdings under Portfolio to view allocation percentages, concentration risks, and diversification metrics.',
              ],
            },
          ],
          followUps: [
            'What is diversification?',
            'What is CAGR?',
            'What is RELIANCE price?',
          ],
        };
      }

      const analysis = calculatePortfolioAllocations(portfolioData.holdings);
      if (!analysis) {
        return makeUnavailableResult(parsed, 'Unable to compute portfolio allocations from recorded holdings.');
      }

      const allocationItems = analysis.allocations.map(
        (a) => `• **${a.name}:** ₹${a.amount.toLocaleString()} (${a.percentage}%) [${a.category}]`
      );

      return {
        query: parsed,
        title: 'Portfolio Asset Allocation & Concentration',
        summary: `Your total recorded portfolio stands at ₹${analysis.total.toLocaleString()} across ${analysis.allocations.length} positions.`,
        sections: [
          {
            heading: 'Holdings Breakdown',
            items: allocationItems,
          },
          {
            heading: 'Concentration Risk Check',
            items: [
              `**Top Position Concentration:** ${analysis.topConcentrationPct}% in **${analysis.allocations[0]?.name || 'N/A'}**.`,
              analysis.topConcentrationPct > 35
                ? `⚠️ **Elevated Single-Stock Risk:** Your largest position exceeds 35% of total portfolio value. Consider rebalancing.`
                : `✅ **Controlled Concentration:** Top position is within prudent institutional diversification thresholds.`,
            ],
          },
        ],
        calculations: {
          type: 'portfolio_concentration',
          existingAmount: analysis.total,
          concentrationPct: analysis.topConcentrationPct,
        },
        source: portfolioData?.source || 'SmartVest Verified Portfolio Ledger',
        timestamp: portfolioData?.asOf || portfolioData?.timestamp || 'Latest Ledger Record',
        freshness: (portfolioData?.freshness === 'REALTIME' || portfolioData?.status === 'LIVE' || portfolioData?.isRealtime === true)
          ? 'REALTIME'
          : (portfolioData?.freshness || 'LATEST_AVAILABLE'),
        followUps: [
          'What is diversification?',
          'Calculate SIP of ₹5000 for 10 years at 12%',
          'What is RELIANCE price?',
        ],
      };
    } catch {
      return makeUnavailableResult(parsed);
    }
  }

  // Handler: PERSONAL_FINANCE
  if (intent === 'PERSONAL_FINANCE') {
    const cashFlow = userContext?.cashFlow;
    if (!cashFlow || cashFlow.monthlyExpenses <= 0) {
      return {
        query: parsed,
        title: 'Personal Finance & Emergency Runway Guidance',
        summary: 'A robust personal financial foundation begins with an emergency fund of 6 months of mandatory living expenses.',
        sections: [
          {
            heading: 'Standard Fiduciary Runway Guidelines',
            items: [
              '**Target Emergency Buffer:** 6 months of essential living expenses kept in liquid, zero-risk instruments (Savings Account / Liquid Debt Funds).',
              '**Order of Priority:** 1) Term & Health Insurance, 2) Emergency Fund, 3) Long-term Goal Investing via SIP.',
            ],
          },
        ],
        followUps: [
          'What is SIP?',
          'What will ₹10000 become in 5 years?',
          'What is CAGR?',
        ],
      };
    }

    const target6m = cashFlow.monthlyExpenses * 6;
    const currentFund = cashFlow.emergencyFund || 0;
    const runwayMonths = Math.round((currentFund / cashFlow.monthlyExpenses) * 10) / 10;

    return {
      query: parsed,
      title: 'Emergency Runway & Financial Health',
      summary: `Your recorded monthly expenses are ₹${cashFlow.monthlyExpenses.toLocaleString()}. Your recommended 6-month safety buffer is ₹${target6m.toLocaleString()}.`,
      sections: [
        {
          heading: 'Runway Metrics',
          items: [
            `**Monthly Living Expenses:** ₹${cashFlow.monthlyExpenses.toLocaleString()}`,
            `**Current Emergency Reserves:** ₹${currentFund.toLocaleString()}`,
            `**Current Runway:** ${runwayMonths} Months`,
            `**Target Buffer (6 Months):** ₹${target6m.toLocaleString()}`,
            `**Status:** **${cashFlow.emergencyFundStatus || (runwayMonths >= 6 ? 'Healthy' : 'Inadequate')}**`,
          ],
        },
      ],
      calculations: {
        type: 'emergency_runway',
        monthlyExpenses: cashFlow.monthlyExpenses,
        targetFund: target6m,
        currentFund: currentFund,
        status: cashFlow.emergencyFundStatus,
      },
      source: 'SmartVest Financial Profile Ledger',
      timestamp: 'Active User Profile',
      freshness: 'REALTIME',
      followUps: [
        'What will ₹10000 become in 5 years?',
        'What is my portfolio allocation?',
        'What is CAGR?',
      ],
    };
  }

  // Handler: MARKET (e.g. Brent crude $95, OMC stocks)
  if (intent === 'MARKET') {
    // Check if live event data exists in verified frontend API
    return makeUnavailableResult(
      parsed,
      "I don't have enough verified data to answer this question reliably. Event-based or geopolitical conclusions require real-time commodity data and policy feeds not currently available in the verified market ledger."
    );
  }

  return makeUnavailableResult(parsed);
}

// ==========================================
// 8. Long-Term Multi-Factor Evaluator
// ==========================================

async function evaluateLongTermFactors(
  symbol: string,
  apiSymbol: string
): Promise<LongTermAnalysisResult> {
  const [quote, research, candles] = await Promise.all([
    marketApi.getQuote(apiSymbol).catch(() => null),
    marketApi.getResearch(apiSymbol).catch(() => null),
    marketApi.getCandles(apiSymbol, '1y', '1d').catch(() => null),
  ]);

  const fund = research?.fundamentals;
  const factors: LongTermFactorEvaluation[] = [];

  // 1. Growth
  if (fund && typeof fund.revenueGrowth === 'number' && !isNaN(fund.revenueGrowth)) {
    const isPos = fund.revenueGrowth >= 8;
    factors.push({
      factor: 'GROWTH',
      label: 'Revenue Growth',
      value: `${fund.revenueGrowth}% YoY`,
      status: isPos ? 'positive' : 'neutral',
      evidence: isPos
        ? `Deterministic screening heuristic: Reported YoY revenue growth of ${fund.revenueGrowth}% meets the >= 8% screening threshold.`
        : `Deterministic screening heuristic: Reported YoY revenue growth of ${fund.revenueGrowth}% is below the 8% screening threshold.`,
    });
  } else {
    factors.push({
      factor: 'GROWTH',
      label: 'Revenue Growth',
      value: null,
      status: 'insufficient_data',
      evidence: 'Historical revenue growth metric is not available in retrieved feed.',
    });
  }

  // 2. Quality
  if (fund && typeof fund.roe === 'number' && !isNaN(fund.roe)) {
    const isGoodRoe = fund.roe >= 15;
    factors.push({
      factor: 'QUALITY',
      label: 'Return on Equity (ROE)',
      value: `${fund.roe}%`,
      status: isGoodRoe ? 'positive' : 'neutral',
      evidence: isGoodRoe
        ? `Deterministic screening heuristic: Reported ROE of ${fund.roe}% meets the >= 15% capital productivity threshold.`
        : `Deterministic screening heuristic: Reported ROE of ${fund.roe}% is below the 15% capital productivity threshold.`,
    });
  } else {
    factors.push({
      factor: 'QUALITY',
      label: 'Return on Equity (ROE)',
      value: null,
      status: 'insufficient_data',
      evidence: 'Verified ROE metric not reported in retrieved fundamentals.',
    });
  }

  // 3. Valuation
  if (fund && typeof fund.peRatio === 'number' && !isNaN(fund.peRatio)) {
    const isRich = fund.peRatio > 45;
    const isAttractive = fund.peRatio > 0 && fund.peRatio < 25;
    factors.push({
      factor: 'VALUATION',
      label: 'Price-to-Earnings (P/E)',
      value: fund.peRatio,
      status: isAttractive ? 'positive' : isRich ? 'negative' : 'neutral',
      evidence: isAttractive
        ? `Deterministic screening heuristic: P/E ratio of ${fund.peRatio} is below the 25x screening threshold.`
        : isRich
        ? `Deterministic screening heuristic: P/E ratio of ${fund.peRatio} exceeds the 45x screening threshold.`
        : `Deterministic screening heuristic: P/E ratio of ${fund.peRatio} falls within the 25x-45x baseline range.`,
    });
  } else {
    factors.push({
      factor: 'VALUATION',
      label: 'Price-to-Earnings (P/E)',
      value: null,
      status: 'insufficient_data',
      evidence: 'P/E multiple is not available in retrieved feed.',
    });
  }

  // 4. Trend (200 DMA)
  const obs = candles?.observations || [];
  const closes = obs.map((o) => o.close).filter((c): c is number => typeof c === 'number' && !isNaN(c));
  if (closes.length >= 200 && quote?.price) {
    const dma = calculateMovingAverage(closes, 200);
    if (dma !== null && quote.price) {
      const isAbove = quote.price >= dma;
      factors.push({
        factor: 'TREND',
        label: 'Price vs 200 DMA',
        value: `${quote.currency === 'USD' ? '$' : '₹'}${quote.price} vs 200 DMA (${dma})`,
        status: isAbove ? 'positive' : 'negative',
        evidence: isAbove
          ? `Deterministic screening heuristic: Price is above the 200 DMA (${dma}), indicating positive intermediate price trend.`
          : `Deterministic screening heuristic: Price is below the 200 DMA (${dma}), indicating negative intermediate price trend.`,
      });
    }
  } else {
    factors.push({
      factor: 'TREND',
      label: 'Price vs 200 DMA',
      value: null,
      status: 'insufficient_data',
      evidence: 'Insufficient data for 200 DMA (requires >= 200 valid daily closes).',
    });
  }

  // 5. Risk (evaluated separately from financial health)
  const beta = research?.risk?.beta;
  if (typeof beta === 'number' && !isNaN(beta)) {
    const isModerate = beta <= 1.2;
    factors.push({
      factor: 'RISK',
      label: 'Market Sensitivity (Beta)',
      value: beta,
      status: isModerate ? 'positive' : 'negative',
      evidence: `Deterministic screening heuristic: Beta of ${beta} indicates ${beta <= 1.0 ? 'lower volatility relative to benchmark' : 'higher volatility relative to benchmark'}.`,
    });
  } else if (closes.length >= 20) {
    const vol = calculateVolatility(closes);
    if (vol !== null) {
      const isLowVol = vol <= 30;
      factors.push({
        factor: 'RISK',
        label: 'Realized Volatility',
        value: `${vol}%`,
        status: isLowVol ? 'positive' : 'negative',
        evidence: `Deterministic screening heuristic: Realized 1-year annualized volatility of ${vol}% ${isLowVol ? 'is within <= 30% screening limit' : 'exceeds 30% screening limit'}.`,
      });
    } else {
      factors.push({
        factor: 'RISK',
        label: 'Risk Assessment',
        value: null,
        status: 'insufficient_data',
        evidence: 'Verified risk metrics (beta / volatility) are unavailable in retrieved feed.',
      });
    }
  } else {
    factors.push({
      factor: 'RISK',
      label: 'Risk Assessment',
      value: null,
      status: 'insufficient_data',
      evidence: 'Verified risk metrics (beta / volatility) are unavailable in retrieved feed.',
    });
  }

  // 6. Financial Health
  if (fund && typeof fund.debtToEquity === 'number' && !isNaN(fund.debtToEquity)) {
    const isPrudent = fund.debtToEquity <= 1.0;
    factors.push({
      factor: 'FINANCIAL_HEALTH',
      label: 'Debt-to-Equity',
      value: fund.debtToEquity,
      status: isPrudent ? 'positive' : 'negative',
      evidence: isPrudent
        ? `Deterministic screening heuristic: Debt-to-Equity of ${fund.debtToEquity} meets conservative leverage threshold (<= 1.0).`
        : `Deterministic screening heuristic: Debt-to-Equity of ${fund.debtToEquity} exceeds conservative leverage threshold (> 1.0).`,
    });
  } else {
    factors.push({
      factor: 'FINANCIAL_HEALTH',
      label: 'Debt-to-Equity',
      value: null,
      status: 'insufficient_data',
      evidence: 'Debt-to-equity ratio not disclosed in retrieved fundamentals.',
    });
  }

  // Determine Overall Assessment
  const posCount = factors.filter((f) => f.status === 'positive').length;
  const negCount = factors.filter((f) => f.status === 'negative').length;
  const insCount = factors.filter((f) => f.status === 'insufficient_data').length;

  let overallAssessment: LongTermOverallAssessment = 'MIXED_EVIDENCE';
  if (insCount >= 4) {
    overallAssessment = 'INSUFFICIENT_DATA';
  } else if (posCount >= 4 && negCount === 0) {
    overallAssessment = 'POSITIVE_EVIDENCE';
  } else if (negCount >= 2) {
    overallAssessment = 'NEGATIVE_EVIDENCE';
  }

  // Derive key risks strictly from retrieved negative/insufficient evidence:
  const keyRisks: string[] = [];
  for (const f of factors) {
    if (f.status === 'negative') {
      keyRisks.push(`${f.label}: ${f.evidence}`);
    } else if (f.status === 'insufficient_data') {
      keyRisks.push(`${f.label}: Unverified or missing feed data (${f.evidence})`);
    }
  }
  if (keyRisks.length === 0) {
    keyRisks.push('No adverse screening thresholds triggered among available verified metrics.');
  }

  const whatWouldChangeAssessment: string[] = [];
  for (const f of factors) {
    if (f.status === 'negative' || f.status === 'insufficient_data') {
      if (f.factor === 'VALUATION') whatWouldChangeAssessment.push('P/E multiple contracting below screening threshold or earnings expanding.');
      else if (f.factor === 'TREND') whatWouldChangeAssessment.push('Price consolidating above verified 200 DMA with >= 200 daily sessions.');
      else if (f.factor === 'FINANCIAL_HEALTH') whatWouldChangeAssessment.push('Deleveraging reducing debt-to-equity to <= 1.0.');
      else if (f.factor === 'GROWTH') whatWouldChangeAssessment.push('Reported revenue growth accelerating to >= 8% YoY.');
      else if (f.factor === 'QUALITY') whatWouldChangeAssessment.push('Reported ROE improving to >= 15%.');
      else if (f.factor === 'RISK') whatWouldChangeAssessment.push('Verified volatility or beta metrics returning within conservative screening limits.');
    }
  }
  if (whatWouldChangeAssessment.length === 0) {
    whatWouldChangeAssessment.push('Deterioration in reported revenue growth, ROE, or leverage metrics below screening thresholds.');
  }

  const summary =
    overallAssessment === 'POSITIVE_EVIDENCE'
      ? `Deterministic screening heuristic indicates positive evidence across ${posCount} of ${factors.length} evaluated factors.`
      : overallAssessment === 'NEGATIVE_EVIDENCE'
      ? `Deterministic screening heuristic indicates adverse flags across ${negCount} of ${factors.length} evaluated factors.`
      : overallAssessment === 'INSUFFICIENT_DATA'
      ? `Deterministic screening heuristic: Insufficient verified factor data (${insCount} of ${factors.length} metrics missing) to form an assessment.`
      : `Deterministic screening heuristic indicates mixed evidence across evaluated fundamental and technical metrics (${posCount} positive, ${negCount} adverse, ${insCount} insufficient).`;

  return {
    symbol,
    overallAssessment,
    factors,
    summary,
    keyRisks,
    whatWouldChangeAssessment,
  };
}

function makeUnavailableResult(parsed: ParsedFinanceQuery, detail?: string): VestiqRuleResult {
  return {
    query: parsed,
    title: 'Advisory Data Notice',
    summary: detail || UNAVAILABLE_DATA_RESPONSE,
    sections: [
      {
        heading: 'Why This Happened',
        items: [
          'VestIQ operates strictly on verified, authoritative financial data and pure deterministic rules.',
          'When verified live quotes, fundamentals, or reliable macro feeds are not accessible, the engine refrains from fabricating estimates.',
        ],
      },
    ],
    followUps: [
      'What is RELIANCE price?',
      'What is AAPL price?',
      'What is CAGR?',
      'Calculate SIP of ₹5000 for 5 years at 12%',
    ],
  };
}

/**
 * Converts structured VestiqRuleResult to clean, readable markdown for VestiqMessage rendering.
 */
export function formatRuleResultToMarkdown(result: VestiqRuleResult): string {
  const parts: string[] = [];

  // Title
  if (result.title) {
    parts.push(`### ${result.title}\n`);
  }

  // Summary
  if (result.summary && result.summary !== result.title) {
    parts.push(`${result.summary}\n`);
  }

  // Sections
  if (Array.isArray(result.sections)) {
    for (const sec of result.sections) {
      if (sec.heading) {
        parts.push(`#### ${sec.heading}`);
      }
      for (const item of sec.items) {
        if (item.startsWith('|') || item.startsWith('•') || item.startsWith('-') || item.startsWith('*')) {
          parts.push(item);
        } else {
          parts.push(`- ${item}`);
        }
      }
      parts.push(''); // newline after section
    }
  }

  // Warnings
  if (Array.isArray(result.warnings) && result.warnings.length > 0) {
    parts.push('⚠️ **Notice:**');
    for (const w of result.warnings) {
      parts.push(`- ${w}`);
    }
    parts.push('');
  }

  // Data Quality & Attribution Footer
  const footerParts: string[] = [];
  if (result.source) footerParts.push(`**Source:** ${result.source}`);
  if (result.timestamp) footerParts.push(`**Timestamp:** ${result.timestamp}`);
  if (result.freshness) footerParts.push(`**Freshness:** ${result.freshness}`);

  if (footerParts.length > 0) {
    parts.push(`---\n*${footerParts.join(' | ')}*`);
  }

  return parts.join('\n').trim();
}
