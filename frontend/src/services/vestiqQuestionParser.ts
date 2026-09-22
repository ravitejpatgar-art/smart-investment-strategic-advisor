/**
 * VestIQ Question Parser
 * Multi-layer deterministic natural language question parser.
 * ZERO LLM calls, zero generative AI.
 */

import {
  INDIAN_STOCK_SYMBOLS,
  US_STOCK_SYMBOLS,
  SECURITY_ALIASES,
  SYNONYM_CLUSTERS,
  FINANCIAL_CONTEXT_TERMS,
  OUT_OF_DOMAIN_PATTERNS,
  FINANCIAL_RELATIONSHIPS,
} from './vestiqKnowledgeBase';
import type { FinancialRelationship } from './vestiqKnowledgeBase';
import {
  FINANCE_CONCEPTS,
  findFinanceConcept,
  findConceptComparison,
  findMacroRelationship,
} from './vestiqFinanceKnowledge';

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
  | 'GLOBAL_MARKETS'
  | 'MARKET_RELATIONSHIP'
  | 'EXPLANATION'
  | 'CALCULATION'
  | 'ALLOCATION'
  | 'RISK_ANALYSIS'
  | 'SMARTVEST'
  | 'OUT_OF_DOMAIN'
  | 'UNSUPPORTED'
  | 'AMBIGUOUS';

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
  | 'MACRO'
  | 'FINANCIAL_CALCULATIONS'
  | 'FINANCIAL_EDUCATION'
  | 'SMARTVEST'
  | 'OUT_OF_DOMAIN'
  | 'AMBIGUOUS'
  | 'UNKNOWN';

export interface ConversationContext {
  lastSymbol?: string;
  lastIntent?: FinanceIntent;
  recentSymbols?: string[];
  lastQuery?: string;
  lastConcept?: string;
}

export interface SubQuestionGoal {
  type: 'VALUATION' | 'COMPARISON' | 'LONG_TERM' | 'TECHNICAL' | 'CALCULATION' | 'RELATIONSHIP' | 'EXPLANATION';
  symbol?: string;
  symbols?: string[];
  years?: number;
  description: string;
}

export interface ParsedFinanceQuery {
  intent: FinanceIntent;
  symbols: string[];
  metric?: string;
  conceptId?: string;
  conceptAspect?: 'definition' | 'howItWorks' | 'whyItMatters' | 'example' | 'risks' | 'keyPoints';
  comparisonId?: string;
  macroRelationshipId?: string;
  isPartialFinance?: boolean;
  partialFinanceTerms?: string[];
  unverifiedQueryPart?: string;
  years?: number;
  months?: number;
  amount?: number;
  monthlyAmount?: number;
  initialAmount?: number;
  currentAmount?: number;
  rate?: number;
  currency?: string;
  originalQuery: string;
  normalizedQuery: string;
  domain: FinanceDomain;
  isAmbiguous?: boolean;
  ambiguityClarification?: string;
  relationship?: FinancialRelationship;
  isCurrentEvent?: boolean;
  subGoals?: SubQuestionGoal[];
}

// ==========================================
// 1. Normalization & Tokenization
// ==========================================

export function normalizeQuestion(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .trim()
    .replace(/â‚¹/g, '₹')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€[\u009d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ');
}

export function tokenizeQuestion(text: string): string[] {
  const norm = normalizeQuestion(text).toLowerCase();
  // Extract alphanumeric tokens and currency markers
  return norm.split(/[^a-z0-9₹$%.-]+/).filter((t) => t.length > 0);
}

// ==========================================
// 2. Out-of-Domain & Ambiguity Detection
// ==========================================

export function detectOutOfDomain(query: string): boolean {
  const norm = normalizeQuestion(query);
  for (const pattern of OUT_OF_DOMAIN_PATTERNS) {
    if (pattern.test(norm)) {
      // Ensure there's no strong financial context overriding it
      const hasStrongFinancial = /\b(stock|share|portfolio|sip|cagr|pe ratio|dividend|market cap)\b/i.test(norm);
      if (!hasStrongFinancial) return true;
    }
  }
  return false;
}

export function detectAmbiguity(query: string): { isAmbiguous: boolean; clarification?: string } {
  const norm = normalizeQuestion(query);
  const lower = norm.toLowerCase();

  // Ambiguity: "What is Apple?", "Tell me about apple", "What is an apple?"
  if (/\b(an? apple|apple)\b/i.test(lower)) {
    const hasFinancialWord = FINANCIAL_CONTEXT_TERMS.some((term) =>
      new RegExp(`\\b${term}\\b`, 'i').test(lower)
    );
    // Explicit general question without finance context
    if (
      !hasFinancialWord &&
      /\b(what is|define|who is|meaning of|tell me about|how is)\b/i.test(lower)
    ) {
      return {
        isAmbiguous: true,
        clarification: 'Do you mean Apple Inc. (AAPL) or the fruit?',
      };
    }
  }

  return { isAmbiguous: false };
}

// ==========================================
// 3. Pronoun & Context Resolution
// ==========================================

export function resolvePronouns(
  query: string,
  context?: ConversationContext
): { resolvedQuery: string; contextSymbol?: string } {
  let resolvedQuery = query;
  let contextSymbol: string | undefined;

  if (context?.lastSymbol) {
    const hasPronoun = /\b(it|its|this stock|the company|same stock)\b/i.test(query);
    if (hasPronoun) {
      contextSymbol = context.lastSymbol;
      // Replace pronoun references with context symbol for robust entity extraction
      resolvedQuery = query.replace(/\b(it|its|this stock|the company|same stock)\b/gi, context.lastSymbol);
    }
  }

  return { resolvedQuery, contextSymbol };
}

// ==========================================
// 4. Entity & Symbol Extraction
// ==========================================

export function extractSymbols(
  query: string,
  context?: ConversationContext
): { symbols: string[]; isAmbiguous?: boolean; ambiguityClarification?: string } {
  const { resolvedQuery, contextSymbol } = resolvePronouns(query, context);
  const lower = resolvedQuery.toLowerCase();
  const detectedSymbols: string[] = [];

  // Check ambiguity first
  const amb = detectAmbiguity(query);
  if (amb.isAmbiguous) {
    return {
      symbols: [],
      isAmbiguous: true,
      ambiguityClarification: amb.clarification,
    };
  }

  // 1. Check known aliases
  for (const entry of SECURITY_ALIASES) {
    let matched = false;
    for (const alias of entry.aliases) {
      const aliasRegex = new RegExp(`\\b${alias}\\b`, 'i');
      if (aliasRegex.test(lower)) {
        if (entry.requiresFinancialContext) {
          const hasContext = FINANCIAL_CONTEXT_TERMS.some((term) =>
            new RegExp(`\\b${term}\\b`, 'i').test(lower)
          );
          if (hasContext) {
            matched = true;
            break;
          }
        } else {
          matched = true;
          break;
        }
      }
    }

    if (matched && !detectedSymbols.includes(entry.symbol)) {
      detectedSymbols.push(entry.symbol);
    }
  }

  // 2. Check Indian stock symbols
  for (const sym of INDIAN_STOCK_SYMBOLS) {
    const regex = new RegExp(`\\b${sym}(?:\\.NS)?\\b`, 'i');
    if (regex.test(resolvedQuery) && !detectedSymbols.includes(sym)) {
      detectedSymbols.push(sym);
    }
  }

  // 3. Check US stock symbols (must be exact word match, case-sensitive for common dictionary words like COST)
  for (const sym of US_STOCK_SYMBOLS) {
    const isExactCaseRequired = sym === 'COST' || sym.length <= 1;
    const regex = isExactCaseRequired ? new RegExp(`\\b${sym}\\b`) : new RegExp(`\\b${sym}\\b`, 'i');
    if (regex.test(resolvedQuery) && !detectedSymbols.includes(sym)) {
      detectedSymbols.push(sym);
    }
  }

  // 4. Check Index Symbols
  if (/\b(s&p\s*500|sp500|spx)\b/i.test(resolvedQuery) && !detectedSymbols.includes('S&P 500')) {
    detectedSymbols.push('S&P 500');
  } else if (/\b(nasdaq|ndx)\b/i.test(resolvedQuery) && !detectedSymbols.includes('NASDAQ')) {
    detectedSymbols.push('NASDAQ');
  } else if (/\b(nifty\s*50|nifty)\b/i.test(resolvedQuery) && !detectedSymbols.includes('NIFTY 50')) {
    detectedSymbols.push('NIFTY 50');
  } else if (/\bsensex\b/i.test(resolvedQuery) && !detectedSymbols.includes('SENSEX')) {
    detectedSymbols.push('SENSEX');
  }

  // 5. Check Commodities
  if (/\bgold\b/i.test(resolvedQuery) && !detectedSymbols.includes('GOLD')) {
    detectedSymbols.push('GOLD');
  } else if (/\bsilver\b/i.test(resolvedQuery) && !detectedSymbols.includes('SILVER')) {
    detectedSymbols.push('SILVER');
  }

  // 6. If no symbols found, but context provided a fallback symbol and query has relative indicator
  if (detectedSymbols.length === 0 && contextSymbol) {
    detectedSymbols.push(contextSymbol);
  }

  return { symbols: detectedSymbols };
}

// ==========================================
// 5. Numeric, Currency & Time Extraction
// ==========================================

export function extractNumericAndTemporal(query: string): {
  amount?: number;
  monthlyAmount?: number;
  initialAmount?: number;
  currentAmount?: number;
  years?: number;
  months?: number;
  rate?: number;
  currency: string;
} {
  let currency = 'INR';
  if (query.includes('$') || /\b(usd|dollars?)\b/i.test(query)) currency = 'USD';
  else if (query.includes('₹') || /\b(rs|inr|rupees?)\b/i.test(query)) currency = 'INR';

  let amount: number | undefined;
  let monthlyAmount: number | undefined;
  let initialAmount: number | undefined;
  let currentAmount: number | undefined;
  let years: number | undefined;
  let months: number | undefined;
  let rate: number | undefined;

  // Initial vs Current Investment Extraction (e.g. "I invested 10000 and now have 12500" or "I invested ₹10000 in RELIANCE and now it's ₹12500")
  const investPairMatch = query.match(
    /(?:invested|put in|bought for|principal(?: of)?)\s*(?:₹|rs\.?|\$)?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:[^0-9]+?)(?:now(?: have| it's| it is| has)?\b|current(?:ly)?|worth|value is)\s*(?:₹|rs\.?|\$)?\s*(\d{1,3}(?:,\d{3})+|\d+)/i
  );
  if (investPairMatch) {
    initialAmount = parseFloat(investPairMatch[1].replace(/,/g, ''));
    currentAmount = parseFloat(investPairMatch[2].replace(/,/g, ''));
    amount = initialAmount;
  }

  // Monthly installment match
  const monthlyMatch = query.match(
    /(?:monthly|per month|\/mo|\/month|every month|sip of)\s*[₹$]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)\s*(k|lakh|lac|cr)?\b/i
  );
  if (monthlyMatch) {
    let base = parseFloat(monthlyMatch[1].replace(/,/g, ''));
    const unit = (monthlyMatch[2] || '').toLowerCase();
    if (unit === 'k') base *= 1000;
    else if (unit === 'lakh' || unit === 'lac') base *= 100000;
    else if (unit === 'cr') base *= 10000000;
    monthlyAmount = base;
    amount = base;
  }

  // General Amount extraction with k, lakh, crore multipliers
  if (amount === undefined) {
    const lakhMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lac|l)\b/i);
    const croreMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:crores?|cr)\b/i);
    const kMatch = query.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    const genericAmountMatch = query.match(/[₹$]\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)\b/);

    if (croreMatch) amount = parseFloat(croreMatch[1]) * 10000000;
    else if (lakhMatch) amount = parseFloat(lakhMatch[1]) * 100000;
    else if (kMatch) amount = parseFloat(kMatch[1]) * 1000;
    else if (genericAmountMatch) {
      amount = parseFloat(genericAmountMatch[1].replace(/,/g, ''));
    } else {
      // Plain numbers > 100
      const plainNumMatch = query.match(/\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d{3,})\b/);
      if (plainNumMatch) {
        const parsed = parseFloat(plainNumMatch[1].replace(/,/g, ''));
        if (parsed >= 100) amount = parsed;
      }
    }
  }

  // Duration extraction (Years & Months)
  const yearsMatch = query.match(/(\d+)\s*(?:years?|yrs?|y)\b/i);
  if (yearsMatch) {
    years = parseInt(yearsMatch[1], 10);
  }

  const monthsMatch = query.match(/(\d+)\s*(?:months?|mos?|m)\b/i);
  if (monthsMatch && !yearsMatch) {
    months = parseInt(monthsMatch[1], 10);
    years = Math.round((months / 12) * 10) / 10;
  }

  // Percentage / Rate extraction
  const rateMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:%|percent(?:age)?)/i);
  if (rateMatch) {
    rate = parseFloat(rateMatch[1]);
  }

  return {
    amount,
    monthlyAmount,
    initialAmount,
    currentAmount,
    years,
    months,
    rate,
    currency,
  };
}

// ==========================================
// 6. Relationship Detection
// ==========================================

export function detectRelationship(query: string): FinancialRelationship | null {
  const lower = query.toLowerCase();

  // 1. Crude Oil -> OMC
  if (
    (/\b(crude|crude oil|brent|brent crude|oil price|oil)\b/i.test(lower) &&
      /\b(omc|omcs|oil companies|oil marketing|refiners|iocl|bpcl|hpcl)\b/i.test(lower)) ||
    (/\bcrude\b/i.test(lower) && /\bomc\b/i.test(lower))
  ) {
    return FINANCIAL_RELATIONSHIPS.find((r) => r.id === 'CRUDE_OIL_TO_OMC') || null;
  }

  // 2. Interest Rates -> Bonds
  if (
    /\b(bonds?|treasury|g-sec|debt)\b/i.test(lower) &&
    /\b(rates?|interest rates?|yield|yields|repo rate|rate hike)\b/i.test(lower)
  ) {
    return FINANCIAL_RELATIONSHIPS.find((r) => r.id === 'INTEREST_RATES_TO_BONDS') || null;
  }

  // 3. Inflation -> Real Returns
  if (
    /\b(inflation|cpi|purchasing power)\b/i.test(lower) &&
    /\b(returns?|real return|savings|fixed deposit|fd)\b/i.test(lower)
  ) {
    return FINANCIAL_RELATIONSHIPS.find((r) => r.id === 'INFLATION_TO_REAL_RETURNS') || null;
  }

  // 4. Concentration -> Portfolio Risk
  if (
    /\b(concentrat\w*|one stock|single stock|70%|80%|90%)\b/i.test(lower) &&
    /\b(portfolio|risk|safe|risky)\b/i.test(lower)
  ) {
    return FINANCIAL_RELATIONSHIPS.find((r) => r.id === 'CONCENTRATION_TO_PORTFOLIO_RISK') || null;
  }

  // 5. PE -> Valuation
  if (
    /\b(high pe|pe matter|pe ratio)\b/i.test(lower) &&
    /\b(matter|why|valuation|expensive)\b/i.test(lower)
  ) {
    return FINANCIAL_RELATIONSHIPS.find((r) => r.id === 'PE_TO_VALUATION') || null;
  }

  // 6. Debt -> Financial Risk
  if (
    /\b(debt|leverage|borrowing)\b/i.test(lower) &&
    /\b(risk|solvency|default|financial health)\b/i.test(lower)
  ) {
    return FINANCIAL_RELATIONSHIPS.find((r) => r.id === 'DEBT_TO_FINANCIAL_RISK') || null;
  }

  return null;
}

// ==========================================
// 7. Intent Detection
// ==========================================

export function detectIntent(
  query: string,
  symbols: string[],
  relationship: FinancialRelationship | null,
  numeric: ReturnType<typeof extractNumericAndTemporal>
): { intent: FinanceIntent; domain: FinanceDomain; metric?: string; isCurrentEvent?: boolean } {
  const lower = query.toLowerCase();

  // 1. Out of domain
  if (detectOutOfDomain(query)) {
    return { intent: 'OUT_OF_DOMAIN', domain: 'OUT_OF_DOMAIN', isCurrentEvent: false };
  }

  // 2. Current Event vs General Explanation Detection
  const isCurrentEvent = /\b(today|now|currently|right now|this morning|dropping today|falling today|rising today|down today|up today|latest session|why is it falling|why is it rising|what happened today|what is happening today)\b/i.test(lower);

  // 3. Portfolio: Concentration, Diversification, Risk Check
  if (
    /\b(portfolio|my holdings|asset allocation|how diversified|diversification|my assets)\b/i.test(lower) ||
    (/\b(concentrated|concentration|one stock|single stock)\b/i.test(lower) && /\b(portfolio|risk|risky|safe|drawdown|allocation)\b/i.test(lower))
  ) {
    const isRiskCheck = /\b(risk|risky|safe|drawdown|concentrated|concentration)\b/i.test(lower);
    return {
      intent: isRiskCheck ? 'RISK_ANALYSIS' : 'PORTFOLIO',
      domain: 'PORTFOLIO',
      metric: isRiskCheck ? 'CONCENTRATION_RISK' : 'ASSET_ALLOCATION',
      isCurrentEvent,
    };
  }

  // 3b. Single Stock Risk Analysis (e.g. "How risky is Reliance?", "Is Reliance risky?", "How risky is it?")
  if (symbols.length === 1 && /\b(risk|risky|safe|safety|volatility|drawdown|danger)\b/i.test(lower)) {
    return {
      intent: 'RISK_ANALYSIS',
      domain: 'STOCKS',
      metric: 'SINGLE_STOCK_RISK',
      isCurrentEvent,
    };
  }

  // 3c. Commodity Check: "What is gold doing right now?", "Gold price", "Silver"
  if (/\b(gold|silver|crude oil|natural gas)\b/i.test(lower) && !relationship) {
    const comm = lower.includes('gold') ? 'GOLD' : lower.includes('silver') ? 'SILVER' : 'CRUDE_OIL';
    return {
      intent: 'COMMODITY',
      domain: 'COMMODITIES',
      metric: comm,
      isCurrentEvent,
    };
  }

  // 3d. Broad Market Movement: "Why is the market falling today?", "What is the S&P 500 doing today?"
  if (
    (/\b(market|markets|stock market|dalal street|wall street)\b/i.test(lower) ||
      symbols.some((s) => ['NIFTY', 'NIFTY 50', 'SENSEX', 'SPX', 'S&P 500', 'NASDAQ', 'DOW'].includes(s))) &&
    (isCurrentEvent || /\b(falling|rising|crash|rally|drop|dip|doing|down|up)\b/i.test(lower))
  ) {
    return {
      intent: 'MARKET',
      domain: 'MARKETS',
      metric: 'BROAD_MARKET',
      isCurrentEvent,
    };
  }

  // 4. Fixed Income / Bond Explanation (e.g. "Why do bond prices change when rates rise?")
  if (/\b(bonds?|g-sec|treasury|fixed income|coupon rate|yield to maturity)\b/i.test(lower)) {
    return {
      intent: 'FIXED_INCOME',
      domain: 'FIXED_INCOME',
      metric: 'BOND_MECHANICS',
      isCurrentEvent,
    };
  }

  // 5. Calculation: Initial and current investment provided (e.g. "I invested 10000 and now have 12500")
  if (numeric.initialAmount !== undefined && numeric.currentAmount !== undefined) {
    return {
      intent: 'RETURN',
      domain: 'FINANCIAL_CALCULATIONS',
      metric: 'ROI_CALCULATION',
      isCurrentEvent,
    };
  }

  // 6. Explanation inquiry without symbols: "Why does a high PE matter?", "Why do ...", "Explain why ..."
  if (
    (/\b(why does|why do|why is|why can|why would|why matter|matter|how does|what causes)\b/i.test(lower) ||
      /\b(impact of|effect of)\b/i.test(lower)) &&
    symbols.length === 0 &&
    !/\b(crude|omc|brent)\b/i.test(lower)
  ) {
    let metric = 'EXPLANATION';
    if (/\b(pe|p\/e)\b/i.test(lower)) metric = 'PE';
    else if (/\bcagr\b/i.test(lower)) metric = 'CAGR';
    else if (/\b200 dma\b/i.test(lower)) metric = '200_DMA';

    return {
      intent: 'EXPLANATION',
      domain: 'FINANCIAL_EDUCATION',
      metric,
      isCurrentEvent,
    };
  }

  // 7. Macro Relationship / Market (e.g. "Why can rising crude affect OMC stocks?", "Brent crude hits $95 a barrel. Buy OMC stocks now or avoid?")
  if (relationship) {
    if (isCurrentEvent && !/\b(why|how|explain|mechanism|cause|impact of|effect of)\b/i.test(lower)) {
      return {
        intent: 'MARKET',
        domain: 'MARKETS',
        metric: relationship.id,
        isCurrentEvent: true,
      };
    }
    return {
      intent: 'MARKET_RELATIONSHIP',
      domain: 'MARKETS',
      metric: relationship.id,
      isCurrentEvent,
    };
  }

  // 8. Allocation (e.g. "How should I think about allocating 50000?", "How to allocate 100000?")
  if (
    /\b(allocat|how should i think about allocating|how to allocate|how should i allocate)\b/i.test(lower) &&
    numeric.amount !== undefined
  ) {
    return {
      intent: 'ALLOCATION',
      domain: 'PERSONAL_FINANCE',
      metric: 'ALLOCATION_PLANNING',
      isCurrentEvent,
    };
  }

  // 9. Personal Finance (e.g. "I earn 50000 and want to invest 15000 monthly")
  if (
    (/\b(invest monthly|salary|earn)\b/i.test(lower) && numeric.amount !== undefined) ||
    /\b(emergency fund|runway|monthly expense|savings rate)\b/i.test(lower)
  ) {
    return {
      intent: 'PERSONAL_FINANCE',
      domain: 'PERSONAL_FINANCE',
      metric: 'ALLOCATION_PLANNING',
      isCurrentEvent,
    };
  }

  // 10. Education inquiry without symbols (e.g. "What is CAGR?", "What is PE?", "Define 200 DMA", "What is an ETF?")
  if (
    /\b(what is|define|meaning of|what do you mean by)\b/i.test(lower) &&
    symbols.length === 0
  ) {
    let metric: string | undefined;
    if (/\bcagr\b/i.test(lower)) metric = 'CAGR';
    else if (/\b(pe|p\/e|price to earnings|pe ratio)\b/i.test(lower)) metric = 'PE';
    else if (/\b200 dma\b/i.test(lower)) metric = '200_DMA';
    else if (/\bsip\b/i.test(lower)) metric = 'SIP';
    else if (/\broe\b/i.test(lower)) metric = 'ROE';
    else if (/\b(etf|exchange traded fund)\b/i.test(lower)) metric = 'ETF';

    if (metric) {
      return {
        intent: 'EDUCATION',
        domain: 'FINANCIAL_EDUCATION',
        metric,
        isCurrentEvent,
      };
    }
  }

  // 11. Return / SIP / Compounding
  if (
    /\b(sip|cagr|future value|grow to|become|wealth gain|compound|monthly for|invested ₹|calculate return)\b/i.test(lower) ||
    (numeric.amount !== undefined && (numeric.years !== undefined || numeric.rate !== undefined))
  ) {
    return {
      intent: 'RETURN',
      domain: 'FINANCIAL_CALCULATIONS',
      metric: lower.includes('cagr') ? 'CAGR' : 'SIP',
      isCurrentEvent,
    };
  }

  // 12. Comparison: 2+ symbols OR comparison wording
  if (
    symbols.length >= 2 ||
    (/\b(compare|versus|vs|better than|relative to|which is stronger|which is better)\b/i.test(lower) &&
      symbols.length >= 1)
  ) {
    return {
      intent: 'COMPARISON',
      domain: 'STOCKS',
      metric: 'SIDE_BY_SIDE',
      isCurrentEvent,
    };
  }

  // 13. Long-term / Investment Horizon
  if (
    /\b(long term|long-term|hold for|suitable for|good for|wealth creator|multi-year|horizon|make sense over|invest in|should i invest)\b/i.test(lower) &&
    symbols.length > 0
  ) {
    return {
      intent: 'LONG_TERM',
      domain: 'STOCKS',
      metric: 'MULTI_FACTOR_EVALUATION',
      isCurrentEvent,
    };
  }

  // 14. Valuation / Fundamentals
  // Matches "PE", "expensive", "stretched", "cheap", "undervalued", "ROE", "ROCE", "earnings", "balance sheet"
  const isValuationQuery = SYNONYM_CLUSTERS.VALUATION.some((term) =>
    new RegExp(`\\b${term}\\b`, 'i').test(lower)
  );
  const isFundamentalsQuery = SYNONYM_CLUSTERS.FUNDAMENTALS.some((term) =>
    new RegExp(`\\b${term}\\b`, 'i').test(lower)
  );

  if ((isValuationQuery || isFundamentalsQuery) && symbols.length > 0) {
    let metric = 'FUNDAMENTALS';
    if (/\b(pe|p\/e|expensive|cheap|stretched|valuation|multiple)\b/i.test(lower)) metric = 'PE';
    else if (/\broe\b/i.test(lower)) metric = 'ROE';
    else if (/\broce\b/i.test(lower)) metric = 'ROCE';
    else if (/\beps\b/i.test(lower)) metric = 'EPS';
    else if (/\bdebt\b/i.test(lower)) metric = 'DEBT_EQUITY';

    return {
      intent: 'FUNDAMENTALS',
      domain: 'FUNDAMENTAL_ANALYSIS',
      metric,
      isCurrentEvent,
    };
  }

  // 15. Technical Analysis: RSI, 200 DMA, 50 DMA, moving average, overbought, oversold, MACD
  const isTechnicalQuery = SYNONYM_CLUSTERS.TREND.some((term) =>
    new RegExp(`\\b${term}\\b`, 'i').test(lower)
  );
  if (isTechnicalQuery && symbols.length > 0) {
    let metric = 'TECHNICALS';
    if (lower.includes('rsi') || lower.includes('overbought') || lower.includes('oversold')) metric = 'RSI';
    else if (lower.includes('200')) metric = '200_DMA';
    else if (lower.includes('50')) metric = '50_DMA';

    return {
      intent: 'TECHNICAL',
      domain: 'TECHNICAL_ANALYSIS',
      metric,
      isCurrentEvent,
    };
  }

  // 16. Quote inquiry: "RELIANCE price", "What is Reliance trading at?", "Current price of Reliance", or falling/rising today
  if (
    symbols.length > 0 &&
    (/\b(price|trading at|current price|quote|stock price|cmp|last price|rate|worth|falling|dropping|rising|down|up)\b/i.test(lower) ||
      symbols.length === 1)
  ) {
    return {
      intent: 'QUOTE',
      domain: 'STOCKS',
      isCurrentEvent,
    };
  }

  // 17. Default fallback
  return {
    intent: 'UNSUPPORTED',
    domain: 'UNKNOWN',
    isCurrentEvent,
  };
}

// ==========================================
// 8. Question Decomposition
// ==========================================

export function decomposeQuestion(
  query: string,
  symbols: string[],
  _intent: FinanceIntent,
  numeric: ReturnType<typeof extractNumericAndTemporal>
): SubQuestionGoal[] {
  const lower = query.toLowerCase();
  const goals: SubQuestionGoal[] = [];

  // Compound: Valuation Comparison + Long-term Suitability
  // e.g. "Is RELIANCE expensive compared with TCS and suitable for 5 years?"
  if (
    symbols.length >= 2 &&
    /\b(expensive|valuation|pe|compare|versus|vs)\b/i.test(lower) &&
    /\b(suitable|good for|hold for|5 years|long term|make sense)\b/i.test(lower)
  ) {
    goals.push({
      type: 'VALUATION',
      symbol: symbols[0],
      description: `${symbols[0]} valuation`,
    });
    goals.push({
      type: 'VALUATION',
      symbol: symbols[1],
      description: `${symbols[1]} valuation`,
    });
    goals.push({
      type: 'COMPARISON',
      symbols: [symbols[0], symbols[1]],
      description: 'valuation comparison',
    });
    goals.push({
      type: 'LONG_TERM',
      symbol: symbols[0],
      description: `${symbols[0]} long-term evidence`,
    });
    goals.push({
      type: 'LONG_TERM',
      years: numeric.years || 5,
      description: `${numeric.years || 5}-year context`,
    });
    goals.push({
      type: 'EXPLANATION',
      description: 'combined explanation',
    });
    return goals;
  }

  // Return calculation decomposition
  // e.g. "I invested ₹10000 in RELIANCE and now it's ₹12500. What is my return?"
  if (numeric.initialAmount !== undefined && numeric.currentAmount !== undefined) {
    goals.push({
      type: 'CALCULATION',
      description: 'initial amount',
    });
    goals.push({
      type: 'CALCULATION',
      description: 'current value',
    });
    goals.push({
      type: 'CALCULATION',
      description: 'ROI',
    });
    goals.push({
      type: 'CALCULATION',
      description: 'absolute return',
    });
    return goals;
  }

  return goals;
}

// ==========================================
// 8b. Concept Aspect Detection
// ==========================================

export function detectConceptAspect(
  query: string
): 'definition' | 'howItWorks' | 'whyItMatters' | 'example' | 'risks' | 'keyPoints' {
  const lower = query.toLowerCase();
  if (
    /\b(how does .* work|how it works|how do they work|how does this work|how work|mechanism|workings?)\b/i.test(lower) ||
    /^(how does it work\??|how it works\??)$/i.test(lower.trim())
  ) {
    return 'howItWorks';
  }
  if (
    /\b(risks?|drawbacks?|dangers?|disadvantages?|downside|limitations?)\b/i.test(lower) ||
    /^(what are the risks\??|what are its risks\??|risks\??)$/i.test(lower.trim())
  ) {
    return 'risks';
  }
  if (
    /\b(why does .* matter|why is .* important|importance|significance|why matter)\b/i.test(lower) ||
    /^(why does it matter\??|why is it important\??)$/i.test(lower.trim())
  ) {
    return 'whyItMatters';
  }
  if (
    /\b(example|illustration|sample|instance)\b/i.test(lower) ||
    /^(give me an example\??|example\??)$/i.test(lower.trim())
  ) {
    return 'example';
  }
  if (
    /\b(key points?|features?|key takeaways?|highlights?)\b/i.test(lower) ||
    /^(key points\??|key takeaways\??)$/i.test(lower.trim())
  ) {
    return 'keyPoints';
  }
  return 'definition';
}

// ==========================================
// 9. Main Parser Pipeline
// ==========================================

export function parseFinanceQuery(
  rawQuery: string,
  context?: ConversationContext
): ParsedFinanceQuery {
  const normalizedQuery = normalizeQuestion(rawQuery);
  const lower = normalizedQuery.toLowerCase();

  // 1. Out of domain check first
  if (detectOutOfDomain(normalizedQuery)) {
    return {
      intent: 'OUT_OF_DOMAIN',
      domain: 'OUT_OF_DOMAIN',
      symbols: [],
      originalQuery: rawQuery,
      normalizedQuery,
    };
  }

  // 2. Ambiguity check
  const ambiguity = detectAmbiguity(normalizedQuery);
  if (ambiguity.isAmbiguous) {
    return {
      intent: 'AMBIGUOUS',
      domain: 'AMBIGUOUS',
      symbols: [],
      originalQuery: rawQuery,
      normalizedQuery,
      isAmbiguous: true,
      ambiguityClarification: ambiguity.clarification,
    };
  }

  const { symbols } = extractSymbols(normalizedQuery, context);
  const numeric = extractNumericAndTemporal(normalizedQuery);
  const relationship = detectRelationship(normalizedQuery);
  const { intent: baseIntent, domain: baseDomain, metric: baseMetric, isCurrentEvent } = detectIntent(
    normalizedQuery,
    symbols,
    relationship,
    numeric
  );

  // If no symbols are detected, check the educational finance engine:
  if (symbols.length === 0) {
    // 1. Concept Comparisons (e.g. "ETF vs mutual fund", "SIP vs lumpsum", "FD vs bond", "Stock vs bond")
    const conceptComparison = findConceptComparison(normalizedQuery);
    if (conceptComparison) {
      return {
        intent: 'COMPARISON',
        domain: 'INVESTING',
        comparisonId: conceptComparison.id,
        symbols: [],
        originalQuery: rawQuery,
        normalizedQuery,
        isCurrentEvent: false,
      };
    }

    // 2. Follow-Up context for previous concept (e.g. "How does it work?", "What are the risks?")
    if (context?.lastConcept) {
      const isPronounFollowup =
        /\b(it|its|this|that)\b/i.test(lower) ||
        /\b(how does it work|how it works|what are the risks|what are its risks|risks|example|why does it matter|key points)\b/i.test(lower) ||
        /^(how does it work\??|what are the risks\??|how it works\??|risks\??|example\??)$/i.test(lower.trim());

      const explicitConcept = findFinanceConcept(normalizedQuery);
      if (isPronounFollowup && !explicitConcept) {
        const prevConcept = FINANCE_CONCEPTS.find((c) => c.id === context.lastConcept);
        if (prevConcept) {
          const aspect = detectConceptAspect(normalizedQuery);
          return {
            intent: 'EDUCATION',
            domain: prevConcept.domain,
            conceptId: prevConcept.id,
            metric: prevConcept.id === 'PE_RATIO' ? 'PE' : prevConcept.id,
            conceptAspect: aspect,
            symbols: [],
            originalQuery: rawQuery,
            normalizedQuery,
            isCurrentEvent: false,
          };
        }
      }
    }

    // 3. Macroeconomic Relationship Detection (e.g. "How does inflation affect investments?", "How does USD/INR affect Indian investors?")
    // Only if not already handled by a more specific intent/relationship (like PE explanation, Fixed Income bond mechanics, or CRUDE_OIL_TO_OMC)
    if (
      !relationship &&
      (baseIntent === 'UNSUPPORTED' ||
        baseIntent === 'MARKET_RELATIONSHIP' ||
        (baseIntent === 'EXPLANATION' && baseMetric === 'EXPLANATION'))
    ) {
      const macroRelationship = findMacroRelationship(normalizedQuery);
      if (macroRelationship) {
        return {
          intent: 'MARKET_RELATIONSHIP',
          domain: 'MARKETS',
          macroRelationshipId: macroRelationship.id,
          symbols: [],
          originalQuery: rawQuery,
          normalizedQuery,
          isCurrentEvent: false,
        };
      }
    }

    // 4. Direct Educational Finance Concept (e.g. "What is an IPO?", "IPO meaning", "Explain IPO", "What is EPS?", "What is compounding?")
    // Only apply if not already handled by a specific structured handler (e.g. EXPLANATION with PE, or explicit return calculation with amounts)
    const financeConcept = findFinanceConcept(normalizedQuery);
    const isExplicitEducationalInquiry =
      /\b(what is|what are|define|meaning of|what do you mean by|tell me about)\b/i.test(lower) ||
      /^(explain|tell me about)\b/i.test(lower);

    if (
      financeConcept &&
      numeric.amount === undefined &&
      (baseIntent === 'UNSUPPORTED' ||
        baseIntent === 'EDUCATION' ||
        baseDomain === 'UNKNOWN' ||
        (baseIntent === 'EXPLANATION' && baseMetric === 'EXPLANATION') ||
        (baseIntent === 'FIXED_INCOME' && isExplicitEducationalInquiry) ||
        ((baseIntent === 'PORTFOLIO' || baseIntent === 'RISK_ANALYSIS') &&
          isExplicitEducationalInquiry &&
          !/\b(my|our|current)\b/i.test(lower)))
    ) {
      const aspect = detectConceptAspect(normalizedQuery);
      const metricName = financeConcept.id === 'PE_RATIO' ? 'PE' : financeConcept.id;
      return {
        intent: 'EDUCATION',
        domain: financeConcept.domain,
        conceptId: financeConcept.id,
        metric: metricName,
        conceptAspect: aspect,
        symbols: [],
        originalQuery: rawQuery,
        normalizedQuery,
        isCurrentEvent: false,
      };
    }

    // 5. Safe Fallback: Check if query is finance-related when intent is UNSUPPORTED
    if (baseIntent === 'UNSUPPORTED') {
      if (
        /\b(financial concept|company profits|moat|economic moat|capital allocation framework|finance|investing|market|stocks?)\b/i.test(lower)
      ) {
        return {
          intent: 'EXPLANATION',
          domain: 'FINANCIAL_EDUCATION',
          symbols: [],
          originalQuery: rawQuery,
          normalizedQuery,
          isPartialFinance: true,
          partialFinanceTerms: ['Financial Fundamentals'],
          unverifiedQueryPart: rawQuery,
          isCurrentEvent: false,
        };
      }
    }
  }

  // Decompose compound questions
  const subGoals = decomposeQuestion(normalizedQuery, symbols, baseIntent, numeric);

  return {
    intent: baseIntent,
    domain: baseDomain,
    symbols,
    metric: baseMetric,
    years: numeric.years,
    months: numeric.months,
    amount: numeric.amount,
    monthlyAmount: numeric.monthlyAmount,
    initialAmount: numeric.initialAmount,
    currentAmount: numeric.currentAmount,
    rate: numeric.rate,
    currency: numeric.currency,
    originalQuery: rawQuery,
    normalizedQuery,
    relationship: relationship || undefined,
    isCurrentEvent,
    subGoals: subGoals.length > 0 ? subGoals : undefined,
  };
}
