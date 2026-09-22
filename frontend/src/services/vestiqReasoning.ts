/**
 * VestIQ Deterministic Finance Reasoning Engine
 * Gathers required data via existing frontend APIs in parallel,
 * applies deterministic finance rules, and performs multi-factor evaluations.
 * ZERO LLM calls, zero generative AI.
 */

import { marketApi } from './marketApi';
import type { MarketQuote, MarketCandlesResponse, InstrumentResearchBundle } from './marketApi';
import { authApi } from './api';
import type { ParsedFinanceQuery, FinanceIntent } from './vestiqQuestionParser';
import {
  INDIAN_STOCK_SYMBOLS,
  US_STOCK_SYMBOLS,
} from './vestiqKnowledgeBase';

export { INDIAN_STOCK_SYMBOLS, US_STOCK_SYMBOLS };

export interface DataRequirementsPlan {
  quotes: string[];
  candles: string[];
  research: string[];
  portfolio: boolean;
  noApi: boolean;
}

export interface GatheredEvidence {
  quotes: Record<string, MarketQuote | null>;
  research: Record<string, InstrumentResearchBundle | null>;
  candles: Record<string, MarketCandlesResponse | null>;
  portfolio: any | null;
}

export interface FactorEvaluation {
  factor: 'GROWTH' | 'QUALITY' | 'VALUATION' | 'TREND' | 'RISK' | 'FINANCIAL_HEALTH';
  label: string;
  value: string | number | null;
  status: 'positive' | 'neutral' | 'negative' | 'insufficient_data';
  evidence: string;
  source?: string;
}

export type OverallEvidenceAssessment =
  | 'POSITIVE_EVIDENCE'
  | 'MIXED_EVIDENCE'
  | 'NEGATIVE_EVIDENCE'
  | 'INSUFFICIENT_DATA';

export interface ReasoningResult {
  query: ParsedFinanceQuery;
  title: string;
  directAnswer?: string;
  summary: string;
  sections: {
    heading: string;
    items: string[];
  }[];
  metrics?: Record<string, number | string | null>;
  calculations?: Record<string, unknown> | null;
  warnings?: string[];
  source?: string;
  timestamp?: string;
  freshness?: string;
  followUps?: string[];
}

export function isUsSymbol(rawSymbol: string): boolean {
  const clean = rawSymbol.trim().toUpperCase().replace(/\.NS$|\.BO$/i, '');
  return (US_STOCK_SYMBOLS as readonly string[]).includes(clean) || clean.includes(':US');
}

export function isIndianSymbol(rawSymbol: string): boolean {
  const clean = rawSymbol.trim().toUpperCase().replace(/\.NS$|\.BO$/i, '');
  return (INDIAN_STOCK_SYMBOLS as readonly string[]).includes(clean);
}

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
  if (['S&P 500', 'SPX', 'NASDAQ', 'DOW', 'GOLD', 'SILVER', 'CRUDE_OIL'].includes(clean)) {
    return clean;
  }
  if (!clean.includes('.') && isIndianSymbol(clean)) {
    return `${clean}.NS`;
  }
  return clean;
}

export function getCleanDisplaySymbol(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/\.NS$/i, '');
}

/**
 * Dynamic Entity Resolution (Task 2)
 * Performs dynamic instrument resolution using marketApi.getInstruments
 * when a symbol or company is not present in the static knowledge base.
 */
export async function resolveDynamicEntities(
  parsed: ParsedFinanceQuery
): Promise<ParsedFinanceQuery> {
  // If static knowledge base already resolved symbols, return immediately
  if (parsed.symbols && parsed.symbols.length > 0) {
    return parsed;
  }

  // Do not attempt dynamic resolution for non-instrument queries
  const nonInstrumentIntents: FinanceIntent[] = [
    'OUT_OF_DOMAIN',
    'AMBIGUOUS',
    'EDUCATION',
    'FIXED_INCOME',
    'MARKET_RELATIONSHIP',
    'MARKET',
    'COMMODITY',
    'GLOBAL_MARKETS',
    'SMARTVEST',
    'ALLOCATION',
    'PERSONAL_FINANCE',
    'CALCULATION',
  ];
  if (
    nonInstrumentIntents.includes(parsed.intent) ||
    (parsed.intent === 'RETURN' && parsed.initialAmount !== undefined)
  ) {
    return parsed;
  }

  const stopWords = new Set([
    'what', 'is', 'the', 'price', 'of', 'stock', 'share', 'shares', 'quote', 'cmp',
    'how', 'tell', 'me', 'about', 'doing', 'today', 'now', 'why', 'falling', 'rising',
    'down', 'up', 'market', 'high', 'low', 'pe', 'ratio', 'rsi', 'dma', 'good', 'for',
    'years', 'year', 'suitable', 'invest', 'investing', 'should', 'i', 'a', 'an', 'in',
    'on', 'and', 'or', 'to', 'can', 'does', 'look', 'overbought', 'oversold', 'at', 'which',
    'stronger', 'better', 'compare', 'versus', 'vs', 'right', 'morning', 'this', 'that',
    'much', 'calculate', 'return', 'returns', 'portfolio', 'holdings', 'assets', 'risk', 'risky',
    'buy', 'sell', 'avoid', 'crude', 'barrel', 'oil', 'gold', 'silver', 'brent', 'rate', 'rates',
    'cut', 'hike', 'cagr', 'sip', 'fd', 'mutual', 'fund', 'etf', 'index', 'omc', 'omcs', 'stocks',
    'allocation', 'allocating', 'allocate', 'diversified', 'concentrated', 'rebalance', 'rebalancing',
    'it', 'its', 'my', 'your', 'his', 'her', 'their', 'we', 'they', 'them', 'if', 'when'
  ]);

  // Extract candidate tokens (preserving original case for ticker/proper-noun detection)
  const rawWords = (parsed.originalQuery || parsed.normalizedQuery)
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !/^\d+$/.test(w) && !stopWords.has(w.toLowerCase()));

  if (rawWords.length === 0) {
    return parsed;
  }

  // Prioritize uppercase tickers or capitalized proper nouns first
  const sortedCandidates = [...rawWords].sort((a, b) => {
    const aUpper = a === a.toUpperCase() ? 2 : /^[A-Z]/.test(a) ? 1 : 0;
    const bUpper = b === b.toUpperCase() ? 2 : /^[A-Z]/.test(b) ? 1 : 0;
    return bUpper - aUpper;
  });

  // Attempt dynamic search on top candidates
  for (const word of sortedCandidates.slice(0, 2)) {
    try {
      const res = await marketApi.getInstruments({ query: word, limit: 5 });
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        // Check for exact symbol match or exact name match
        const exactMatch = res.items.find(
          (item) =>
            item.symbol.toUpperCase() === word.toUpperCase() ||
            item.symbol.toUpperCase() === `${word.toUpperCase()}.NS` ||
            item.name.toLowerCase() === word.toLowerCase()
        );

        if (exactMatch) {
          const cleanSym = getCleanDisplaySymbol(exactMatch.symbol);
          return {
            ...parsed,
            symbols: [cleanSym],
            intent: parsed.intent === 'UNSUPPORTED' ? 'QUOTE' : parsed.intent,
            domain: exactMatch.assetType === 'ETF' ? 'ETFS' : exactMatch.assetType === 'MUTUAL_FUND' ? 'MUTUAL_FUNDS' : 'STOCKS',
          };
        }

        if (res.items.length === 1) {
          const item = res.items[0];
          const cleanSym = getCleanDisplaySymbol(item.symbol);
          return {
            ...parsed,
            symbols: [cleanSym],
            intent: parsed.intent === 'UNSUPPORTED' ? 'QUOTE' : parsed.intent,
            domain: item.assetType === 'ETF' ? 'ETFS' : item.assetType === 'MUTUAL_FUND' ? 'MUTUAL_FUNDS' : 'STOCKS',
          };
        }

        if (res.items.length > 1) {
          const suggestions = res.items.slice(0, 3).map((i) => `${i.symbol} (${i.name})`).join(', ');
          return {
            ...parsed,
            intent: 'AMBIGUOUS',
            isAmbiguous: true,
            ambiguityClarification: `Multiple instruments match "${word}": ${suggestions}. Please specify the exact ticker or full company name.`,
          };
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  return parsed;
}

// ==========================================
// 1. Data Requirements Planner (Task 3)
// ==========================================

export function planDataRequirements(query: ParsedFinanceQuery): DataRequirementsPlan {
  const { intent, symbols, isCurrentEvent } = query;

  const plan: DataRequirementsPlan = {
    quotes: [],
    candles: [],
    research: [],
    portfolio: false,
    noApi: false,
  };

  // 1. Static Educational & Pure Concept Intents
  if (
    intent === 'OUT_OF_DOMAIN' ||
    intent === 'AMBIGUOUS' ||
    intent === 'UNSUPPORTED' ||
    intent === 'SMARTVEST' ||
    intent === 'ALLOCATION' ||
    intent === 'PERSONAL_FINANCE' ||
    intent === 'CALCULATION' ||
    (intent === 'EDUCATION' && symbols.length === 0) ||
    (intent === 'EXPLANATION' && symbols.length === 0)
  ) {
    plan.noApi = true;
    return plan;
  }

  // 2. Fixed Income / Bond Mechanics (General mechanism -> static knowledge)
  if (intent === 'FIXED_INCOME') {
    plan.noApi = true;
    return plan;
  }

  // 3. Macro Relationship (e.g. Crude oil to OMC)
  if (intent === 'MARKET_RELATIONSHIP') {
    if (isCurrentEvent && symbols.length > 0) {
      plan.quotes = symbols.slice(0, 2);
      return plan;
    }
    plan.noApi = true;
    return plan;
  }

  // 4. Return Calculations (SIP, CAGR, ROI)
  if (intent === 'RETURN') {
    if (query.initialAmount !== undefined || query.monthlyAmount !== undefined || query.rate !== undefined) {
      plan.noApi = true;
      return plan;
    }
    if (symbols.length > 0) {
      plan.quotes = symbols.slice(0, 1);
      plan.candles = symbols.slice(0, 1);
      return plan;
    }
    plan.noApi = true;
    return plan;
  }

  // 5. Quote
  if (intent === 'QUOTE' && symbols.length > 0) {
    plan.quotes = symbols.slice(0, 1);
    return plan;
  }

  // 6. Fundamentals / Valuation: research only
  if (intent === 'FUNDAMENTALS' && symbols.length > 0) {
    plan.research = symbols.slice(0, 1);
    return plan;
  }

  // 7. Technical: candles only
  if (intent === 'TECHNICAL' && symbols.length > 0) {
    plan.candles = symbols.slice(0, 1);
    return plan;
  }

  // 8. Comparison: quote + research for both
  if (intent === 'COMPARISON') {
    const targets = symbols.slice(0, 2);
    plan.quotes = targets;
    plan.research = targets;
    return plan;
  }

  // 9. Long-Term Multi-Factor Analysis: quote + research + candles
  if (intent === 'LONG_TERM' && symbols.length > 0) {
    const target = symbols.slice(0, 1);
    plan.quotes = target;
    plan.research = target;
    plan.candles = target;
    return plan;
  }

  // 10. Portfolio & Risk Analysis
  if (intent === 'PORTFOLIO') {
    plan.portfolio = true;
    return plan;
  }

  if (intent === 'RISK_ANALYSIS') {
    if (symbols.length > 0) {
      // Single stock risk
      const target = symbols.slice(0, 1);
      plan.quotes = target;
      plan.research = target;
      plan.candles = target;
      return plan;
    }
    // Portfolio risk
    plan.portfolio = true;
    return plan;
  }

  // 11. Commodity
  if (intent === 'COMMODITY') {
    if (isCurrentEvent && symbols.length > 0) {
      plan.quotes = symbols.slice(0, 1);
      return plan;
    }
    plan.noApi = true;
    return plan;
  }

  // 12. Global Markets / Market
  if (intent === 'GLOBAL_MARKETS' || intent === 'MARKET') {
    if (isCurrentEvent && symbols.length > 0) {
      plan.quotes = symbols.slice(0, 1);
      return plan;
    }
    plan.noApi = true;
    return plan;
  }

  // 13. Default fallback: if symbols present, get quote
  if (symbols.length > 0) {
    plan.quotes = symbols.slice(0, 1);
  } else {
    plan.noApi = true;
  }

  return plan;
}

// ==========================================
// 2. Parallel Data Retrieval & Fusion
// ==========================================

export async function gatherEvidence(
  plan: DataRequirementsPlan,
  userContext?: any
): Promise<GatheredEvidence> {
  const evidence: GatheredEvidence = {
    quotes: {},
    research: {},
    candles: {},
    portfolio: null,
  };

  if (plan.noApi) return evidence;

  const quotePromises = plan.quotes.map(async (sym) => {
    const apiSym = getApiSymbol(sym);
    try {
      const q = await marketApi.getQuote(apiSym);
      evidence.quotes[sym] = q;
    } catch {
      evidence.quotes[sym] = null;
    }
  });

  const researchPromises = plan.research.map(async (sym) => {
    const apiSym = getApiSymbol(sym);
    try {
      const r = await marketApi.getResearch(apiSym);
      evidence.research[sym] = r;
    } catch {
      evidence.research[sym] = null;
    }
  });

  const candlePromises = plan.candles.map(async (sym) => {
    const apiSym = getApiSymbol(sym);
    try {
      const c = await marketApi.getCandles(apiSym, '1y', '1d');
      evidence.candles[sym] = c;
    } catch {
      evidence.candles[sym] = null;
    }
  });

  let portfolioPromise: Promise<void> | null = null;
  if (plan.portfolio) {
    portfolioPromise = (async () => {
      try {
        let pData = await authApi.getPortfolio();
        if (!pData || !Array.isArray(pData.holdings) || pData.holdings.length === 0) {
          if (userContext?.portfolio?.holdings && Array.isArray(userContext.portfolio.holdings) && userContext.portfolio.holdings.length > 0) {
            pData = { holdings: userContext.portfolio.holdings };
          }
        }
        evidence.portfolio = pData;
      } catch {
        if (userContext?.portfolio?.holdings && Array.isArray(userContext.portfolio.holdings) && userContext.portfolio.holdings.length > 0) {
          evidence.portfolio = { holdings: userContext.portfolio.holdings };
        } else {
          evidence.portfolio = null;
        }
      }
    })();
  }

  await Promise.all([
    ...quotePromises,
    ...researchPromises,
    ...candlePromises,
    ...(portfolioPromise ? [portfolioPromise] : []),
  ]);

  return evidence;
}

// ==========================================
// 3. Mathematical Helpers
// ==========================================

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
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const dailyStdDev = Math.sqrt(variance);

  // Annualized volatility (assuming 252 trading days)
  const annualizedVolPct = dailyStdDev * Math.sqrt(252) * 100;
  return Math.round(annualizedVolPct * 100) / 100;
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
  const fv = monthlyAmount * ((Math.pow(1 + i, totalMonths) - 1) / i) * (1 + i);
  if (!isFinite(fv) || isNaN(fv)) return null;

  const roundedFv = Math.round(fv);
  return {
    totalInvested,
    futureValue: roundedFv,
    wealthGain: Math.max(0, roundedFv - totalInvested),
  };
}

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

// ==========================================
// 4. Multi-Factor Long-Term Evaluator
// ==========================================

export function evaluateLongTermFactors(
  _symbol: string,
  quote: MarketQuote | null,
  research: InstrumentResearchBundle | null,
  candles: MarketCandlesResponse | null
): {
  overallAssessment: OverallEvidenceAssessment;
  factors: FactorEvaluation[];
  summary: string;
  keyRisks: string[];
  whatWouldChangeAssessment: string[];
} {
  const fund = research?.fundamentals;
  const factors: FactorEvaluation[] = [];

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
      source: fund.source || 'Financial Statements',
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
      source: fund.source || 'Financial Statements',
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
      source: fund.source || 'Fundamental Research Feed',
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

  // 4. Trend (200 DMA - strictly requires >= 200 closes)
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
          ? `Deterministic screening heuristic: Current price is above the 200 DMA (${dma}), indicating positive intermediate price trend.`
          : `Deterministic screening heuristic: Current price is below the 200 DMA (${dma}), indicating negative intermediate price trend.`,
        source: candles?.source || 'Historical Market Feed',
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
      source: research?.sources?.research || 'Risk Research Model',
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
        source: candles?.source || 'Historical Market Feed',
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
      source: fund.source || 'Balance Sheet Feed',
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

  const posCount = factors.filter((f) => f.status === 'positive').length;
  const negCount = factors.filter((f) => f.status === 'negative').length;
  const insCount = factors.filter((f) => f.status === 'insufficient_data').length;

  let overallAssessment: OverallEvidenceAssessment = 'MIXED_EVIDENCE';
  if (insCount >= 4) {
    overallAssessment = 'INSUFFICIENT_DATA';
  } else if (posCount >= 4 && negCount === 0) {
    overallAssessment = 'POSITIVE_EVIDENCE';
  } else if (negCount >= 2) {
    overallAssessment = 'NEGATIVE_EVIDENCE';
  }

  // Key risks derived strictly from verified negative / insufficient factors
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
    overallAssessment,
    factors,
    summary,
    keyRisks,
    whatWouldChangeAssessment,
  };
}
