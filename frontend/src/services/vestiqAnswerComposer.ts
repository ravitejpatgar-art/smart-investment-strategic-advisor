/**
 * VestIQ Answer Composer
 * Dynamically builds transparent, evidence-grounded financial advisory answers.
 * ZERO LLM calls, zero generative AI, zero fabricated numbers.
 */

import type { ParsedFinanceQuery } from './vestiqQuestionParser';
import type { GatheredEvidence, ReasoningResult } from './vestiqReasoning';
import {
  evaluateLongTermFactors,
  calculateRoi,
  calculateSipFutureValue,
  calculateMovingAverage,
  calculateRsi,
  calculateVolatility,
  isUsSymbol,
} from './vestiqReasoning';
import {
  FINANCE_CONCEPTS,
  CONCEPT_COMPARISONS,
  MACRO_RELATIONSHIPS,
  findFinanceConcept,
  findConceptComparison,
  findMacroRelationship,
} from './vestiqFinanceKnowledge';
import type {
  FinanceConcept,
  ConceptComparison,
  MacroRelationship,
} from './vestiqFinanceKnowledge';

export const OUT_OF_DOMAIN_RESPONSE =
  "I'm VestIQ, a finance and investing assistant. I can help with stocks, ETFs, mutual funds, markets, portfolios, returns, risk, and financial concepts. Please ask a finance-related question.";

export const UNAVAILABLE_DATA_RESPONSE =
  "I don't have enough verified data to answer this question reliably.";

export function composeAnswer(
  parsed: ParsedFinanceQuery,
  evidence: GatheredEvidence,
  _userContext?: any
): ReasoningResult {
  const { intent, symbols, metric, relationship, isCurrentEvent } = parsed;

  // 1. Ambiguous Query
  if (intent === 'AMBIGUOUS' || parsed.isAmbiguous) {
    return {
      query: parsed,
      title: 'Clarification Needed',
      directAnswer: parsed.ambiguityClarification || 'Please clarify your question.',
      summary: parsed.ambiguityClarification || 'Please clarify whether your inquiry is financial.',
      sections: [
        {
          heading: 'Ambiguity Notice',
          items: [
            parsed.ambiguityClarification || 'Do you mean Apple Inc. (AAPL) or the fruit?',
            'VestIQ answers inquiries relating to financial markets, instruments, portfolios, and wealth planning.',
          ],
        },
      ],
      followUps: [
        'AAPL stock price',
        'Should I invest in Apple?',
        'What is RELIANCE price?',
      ],
    };
  }

  // 2. Out of Domain
  if (intent === 'OUT_OF_DOMAIN') {
    return {
      query: parsed,
      title: 'Topic Outside Financial Domain',
      directAnswer: OUT_OF_DOMAIN_RESPONSE,
      summary: OUT_OF_DOMAIN_RESPONSE,
      sections: [
        {
          heading: 'Supported Topics',
          items: [
            'Indian & US Equities (prices, valuations, technicals)',
            'Mutual Funds & ETFs',
            'Portfolio Asset Allocation & Concentration Risk',
            'Financial Calculations (SIP, CAGR, ROI, Drawdown)',
            'Macroeconomic Relationships & Financial Concepts',
          ],
        },
      ],
      followUps: [
        'What is RELIANCE price?',
        'What is AAPL price?',
        'Calculate SIP of ₹5000 for 5 years at 12%',
        'What is CAGR?',
      ],
    };
  }

  // 3. Concept Comparisons (e.g. "ETF vs Mutual Fund", "SIP vs Lumpsum", "FD vs Bond", "Stock vs Bond")
  if (parsed.comparisonId || (intent === 'COMPARISON' && symbols.length === 0)) {
    const comp =
      CONCEPT_COMPARISONS.find((c) => c.id === parsed.comparisonId) ||
      findConceptComparison(parsed.originalQuery);

    if (comp) {
      return composeConceptComparisonAnswer(parsed, comp);
    }
  }

  // 4. Macroeconomic Relationships (e.g. "Why do bond prices fall when interest rates rise?")
  if ((parsed.macroRelationshipId && !relationship) || (intent === 'MARKET_RELATIONSHIP' && !relationship)) {
    const rel =
      MACRO_RELATIONSHIPS.find((r) => r.id === parsed.macroRelationshipId) ||
      findMacroRelationship(parsed.originalQuery);

    if (rel) {
      return composeMacroRelationshipAnswer(parsed, rel);
    }
  }

  // 5. Concept Education (Single concept, e.g. "What is an IPO?", "What is EPS?", or context follow-up)
  if (parsed.conceptId || (intent === 'EDUCATION' && symbols.length === 0)) {
    const concept =
      FINANCE_CONCEPTS.find((c) => c.id === parsed.conceptId) ||
      findFinanceConcept(parsed.originalQuery);

    if (concept) {
      return composeFinanceConceptAnswer(parsed, concept);
    }
  }

  // 6. Safe Fallback for Partial / Unknown Finance Queries
  if (parsed.isPartialFinance) {
    return composePartialFinanceAnswer(parsed);
  }

  // 7. Macro / Economic Relationship
  if (intent === 'MARKET_RELATIONSHIP' && relationship) {
    if (isCurrentEvent) {
      return {
        query: parsed,
        title: `Market Impact Analysis: ${relationship.sourceEntity} vs ${relationship.targetEntity}`,
        directAnswer: UNAVAILABLE_DATA_RESPONSE,
        summary: `I don't have enough verified real-time event data to evaluate today's specific market movement for ${relationship.sourceEntity} and ${relationship.targetEntity}.`,
        sections: [
          {
            heading: 'Underlying Economic Transmission Mechanism',
            items: [relationship.explanationTemplate],
          },
          {
            heading: 'Key Drivers',
            items: relationship.keyDrivers,
          },
          {
            heading: 'Analytical Limitations',
            items: relationship.limitations,
          },
        ],
        source: 'SmartVest Macroeconomic Knowledge Base',
        timestamp: 'Verified Economic Mechanism',
        freshness: 'STATIC_KNOWLEDGE',
        followUps: [
          'Why are oil companies affected when crude rises?',
          'What happens to bond prices when interest rates rise?',
          'What is RELIANCE price?',
        ],
      };
    }

    return {
      query: parsed,
      title: `Economic Relationship: ${relationship.sourceEntity.replace('_', ' ')} & ${relationship.targetEntity.replace('_', ' ')}`,
      directAnswer: relationship.mechanism,
      summary: relationship.explanationTemplate,
      sections: [
        {
          heading: 'Transmission Mechanics',
          items: [relationship.explanationTemplate],
        },
        {
          heading: 'Key Operational Factors',
          items: relationship.keyDrivers,
        },
        {
          heading: 'Important Real-World Limitations',
          items: relationship.limitations,
        },
      ],
      source: 'SmartVest Macroeconomic Knowledge Base',
      timestamp: 'Verified Economic Mechanism',
      freshness: 'STATIC_KNOWLEDGE',
      followUps: [
        'Why do bond prices fall when interest rates rise?',
        'How does inflation affect real returns?',
        'What is RELIANCE price?',
      ],
    };
  }

  // 4. Fixed Income / Bond Mechanics
  if (intent === 'FIXED_INCOME') {
    return {
      query: parsed,
      title: 'Fixed Income & Bond Mechanics',
      directAnswer: 'Bond prices share an inverse mathematical relationship with interest rates and yields.',
      summary: 'When benchmark interest rates rise, existing fixed-rate bond prices fall because their fixed coupon becomes less attractive than newly issued debt.',
      sections: [
        {
          heading: 'Mechanism',
          items: [
            'Fixed Coupon Discounting: Bond coupon cash flows are fixed at issuance. When prevailing market rates rise, those cash flows must be discounted at a higher rate, driving down current market price.',
            'Duration Sensitivity: The longer the bond tenure/maturity, the higher its duration and the larger its percentage price drop for a given rate hike.',
            'Held to Maturity: Investors holding high-quality sovereign bonds until maturity receive the full face value regardless of interim price volatility.',
          ],
        },
        {
          heading: 'Important Distinction',
          items: [
            'Bond price fluctuation affects secondary market trading value, not the contractual coupon payment paid by non-defaulting issuers.',
          ],
        },
      ],
      source: 'SmartVest Educational Library',
      timestamp: 'Verified Bond Mechanics',
      freshness: 'STATIC_KNOWLEDGE',
      followUps: [
        'What is CAGR?',
        'What is inflation impact on savings?',
        'What is RELIANCE price?',
      ],
    };
  }

  // 5. Quote
  if (intent === 'QUOTE' && symbols.length > 0) {
    const sym = symbols[0];
    const q = evidence.quotes[sym];
    if (!q || q.price === null || q.price === undefined || q.freshness === 'UNAVAILABLE') {
      return makeUnavailableNotice(parsed, `Current market quote for ${sym} is currently unavailable.`);
    }

    const curr = q.currency === 'USD' ? '$' : '₹';
    const hasChg = typeof q.change === 'number' && !isNaN(q.change);
    const hasPct = typeof q.changePct === 'number' && !isNaN(q.changePct);
    const chgStr = hasChg ? `${q.change! >= 0 ? '+' : ''}${q.change}` : 'Unavailable';
    const pctStr = hasPct ? `${q.changePct! >= 0 ? '+' : ''}${q.changePct}%` : 'Unavailable';
    const exchStr = q.exchange && q.exchange !== 'UNKNOWN' ? q.exchange : 'Unavailable';

    return {
      query: parsed,
      title: `${q.name || sym} (${sym})`,
      directAnswer: `${sym} is trading at ${curr}${q.price.toLocaleString()}${hasPct ? ` (${pctStr})` : ''}.`,
      summary: `Current price: ${curr}${q.price.toLocaleString()} (${chgStr} / ${pctStr}) on ${exchStr}.`,
      sections: [
        {
          heading: 'Quote Details',
          items: [
            `**Current Price:** ${curr}${q.price.toLocaleString()}`,
            `**Day Change:** ${chgStr} (${pctStr})`,
            `**Exchange:** ${exchStr}`,
            `**Asset Type:** ${q.assetType || 'STOCK'}`,
            `**Data Status:** ${q.status || (q.freshness === 'REALTIME' ? 'LIVE' : 'DELAYED')}`,
            `**Source:** ${q.source || 'Authorized Market Feed'}`,
            `**As of:** ${q.asOf || q.displayTimestampIst || 'Today'}`,
          ],
        },
      ],
      metrics: {
        price: q.price,
        change: hasChg ? q.change : null,
        changePct: hasPct ? q.changePct : null,
        open: q.open ?? null,
        high: q.high ?? null,
        low: q.low ?? null,
        prevClose: q.prevClose ?? null,
      },
      source: q.source || 'Authorized Market Feed',
      timestamp: q.asOf || 'Today',
      freshness: q.freshness,
      followUps: [
        `How expensive is ${sym} based on earnings?`,
        `Does ${sym} look overbought?`,
        `Is ${sym} suitable for a 5-year horizon?`,
      ],
    };
  }

  // 6. Fundamentals / Valuation
  if (intent === 'FUNDAMENTALS' && symbols.length > 0) {
    const sym = symbols[0];
    const q = evidence.quotes[sym];
    const r = evidence.research[sym];
    const fund = r?.fundamentals;

    if (!fund || fund.freshness === 'UNAVAILABLE') {
      return makeUnavailableNotice(parsed, `Fundamental research data for ${sym} is currently unavailable.`);
    }

    const curr = isUsSymbol(sym) ? '$' : '₹';
    const pe = fund.peRatio;
    const isValuationQuestion = metric === 'PE' || parsed.normalizedQuery.toLowerCase().includes('expensive') || parsed.normalizedQuery.toLowerCase().includes('valuation');

    let valuationObservation = '';
    if (typeof pe === 'number' && !isNaN(pe)) {
      if (pe > 45) {
        valuationObservation = `${sym} trades at a P/E multiple of ${pe}, which exceeds the 45x conservative screening threshold, reflecting high growth expectations.`;
      } else if (pe < 25 && pe > 0) {
        valuationObservation = `${sym} trades at a P/E multiple of ${pe}, which is below the 25x screening threshold.`;
      } else {
        valuationObservation = `${sym} trades at a P/E multiple of ${pe}, within the moderate 25x–45x screening range.`;
      }
    } else {
      valuationObservation = `Verified P/E ratio is not available in the retrieved feed for ${sym}.`;
    }

    return {
      query: parsed,
      title: `${sym} Fundamentals`,
      directAnswer: valuationObservation,
      summary: `Fundamental snapshot for ${sym}: P/E is ${pe ?? 'N/A'}, ROE is ${fund.roe ? `${fund.roe}%` : 'N/A'}.`,
      sections: [
        {
          heading: isValuationQuestion ? 'Valuation Assessment' : 'Key Financial Ratios',
          items: [
            `**P/E Ratio:** ${pe ?? 'N/A'}`,
            `**Price-to-Book (P/B):** ${fund.pbRatio ?? 'N/A'}`,
            `**Earnings Per Share (EPS):** ${fund.eps !== undefined && fund.eps !== null ? `${curr}${fund.eps}` : 'N/A'}`,
            `**Return on Equity (ROE):** ${fund.roe ? `${fund.roe}%` : 'N/A'}`,
            `**ROCE:** ${fund.roce ? `${fund.roce}%` : 'N/A'}`,
            `**Debt-to-Equity:** ${fund.debtToEquity ?? 'N/A'}`,
            `**Revenue Growth:** ${fund.revenueGrowth ? `${fund.revenueGrowth}% YoY` : 'N/A'}`,
          ],
        },
        {
          heading: 'Analytical Disclosure',
          items: [
            'Deterministic screening heuristics categorize P/E multiples relative to broad historical thresholds.',
            'P/E multiple alone cannot determine whether a security is attractive; balance sheet health, return on equity, and earnings quality must be assessed concurrently.',
          ],
        },
      ],
      metrics: {
        peRatio: pe ?? null,
        pbRatio: fund.pbRatio ?? null,
        roe: fund.roe ?? null,
        debtToEquity: fund.debtToEquity ?? null,
        price: q?.price ?? null,
      },
      source: fund.source || 'Fundamental Research Engine',
      timestamp: fund.asOf || 'Latest Financial Filing',
      freshness: fund.freshness || 'LATEST_AVAILABLE',
      followUps: [
        `Does ${sym} look overbought?`,
        `Would ${sym} make sense over 5 years?`,
        `Compare ${sym} with ${sym === 'RELIANCE' ? 'TCS' : 'RELIANCE'}`,
      ],
    };
  }

  // 7. Technical Indicators
  if (intent === 'TECHNICAL' && symbols.length > 0) {
    const sym = symbols[0];
    const q = evidence.quotes[sym];
    const candles = evidence.candles[sym];
    const candlesAny = candles as any;
    const rawCloses: number[] = Array.isArray(candles?.observations) && candles.observations.length > 0
      ? candles.observations.map((o) => o.close)
      : Array.isArray(candlesAny?.c)
      ? candlesAny.c
      : Array.isArray(candlesAny?.closes)
      ? candlesAny.closes
      : [];
    const closes = rawCloses.filter((c: number): c is number => typeof c === 'number' && !isNaN(c));

    if (closes.length < 20) {
      return makeUnavailableNotice(parsed, `Insufficient historical price data for ${sym} to compute technical indicators.`);
    }
    const currentPrice = q?.price || closes[closes.length - 1];
    const rsi14 = calculateRsi(closes, 14);
    const sma50 = calculateMovingAverage(closes, 50);
    const has200Closes = closes.length >= 200;
    const sma200 = has200Closes ? calculateMovingAverage(closes, 200) : null;
    const vol = calculateVolatility(closes);

    if (metric === '200_DMA' && !has200Closes) {
      return {
        query: parsed,
        title: `${sym} 200-Day Moving Average`,
        directAnswer: 'Insufficient data for 200 DMA.',
        summary: 'Insufficient data for 200 DMA.',
        sections: [
          {
            heading: 'Data Integrity Notice',
            items: [
              'Calculating a valid 200 DMA requires at least 200 daily close observations.',
              `Only ${closes.length} valid daily close sessions were retrieved for ${sym}.`,
              'VestIQ never labels an average using fewer than 200 observations as 200 DMA.',
            ],
          },
        ],
        metrics: { currentPrice, sma200: null },
        source: candles?.source || 'Historical Market Feed',
        timestamp: 'Latest Session Close',
        freshness: candles?.freshness || 'HISTORICAL',
        followUps: [`What is 200 DMA?`, `RSI of ${sym}`],
      };
    }

    let directObservation = '';
    if (rsi14 !== null) {
      if (rsi14 >= 70) directObservation = `${sym} has an RSI of ${rsi14}, placing it in overbought territory based on standard 14-period Wilder thresholds.`;
      else if (rsi14 <= 30) directObservation = `${sym} has an RSI of ${rsi14}, placing it in oversold territory based on standard 14-period Wilder thresholds.`;
      else directObservation = `${sym} has an RSI of ${rsi14}, reflecting neutral momentum (neither overbought nor oversold).`;
    }

    return {
      query: parsed,
      title: `${sym} Technical Indicators`,
      directAnswer: directObservation || `Technical breakdown for ${sym}.`,
      summary: `14-period RSI is ${rsi14 ?? 'N/A'}. 50 DMA is ${sma50 ?? 'N/A'}. 200 DMA is ${sma200 ?? (has200Closes ? 'N/A' : 'Insufficient data for 200 DMA.')}.`,
      sections: [
        {
          heading: 'Indicator Values',
          items: [
            `**Last Closing Price:** ${isUsSymbol(sym) ? '$' : '₹'}${currentPrice}`,
            `**RSI (14-period):** ${rsi14 !== null ? `${rsi14} (${rsi14 >= 70 ? 'Overbought' : rsi14 <= 30 ? 'Oversold' : 'Neutral'})` : 'N/A'}`,
            `**50-Day Moving Average:** ${sma50 !== null ? `${sma50} (${currentPrice >= sma50 ? 'Above 50 DMA' : 'Below 50 DMA'})` : (closes.length < 50 ? 'Insufficient data for 50 DMA.' : 'N/A')}`,
            `**200-Day Moving Average:** ${sma200 !== null ? `${sma200} (${currentPrice >= sma200 ? 'Above 200 DMA' : 'Below 200 DMA'})` : 'Insufficient data for 200 DMA.'}`,
            `**Annualized Volatility:** ${vol !== null ? `${vol}%` : 'N/A'}`,
          ],
        },
        {
          heading: 'Methodology Disclosure',
          items: [
            'Wilder 14-period RSI and standard simple moving averages are computed directly from retrieved session closes.',
            has200Closes
              ? `200 DMA verified using ${closes.length} daily close observations.`
              : `Insufficient data for 200 DMA (requires >= 200 daily close observations; retrieved ${closes.length}).`,
            `**Data Freshness:** ${candles?.freshness || 'HISTORICAL'}`,
            `**Source:** ${candles?.source || 'Historical Market Feed'}`,
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
      source: candles?.source || 'Historical Market Feed',
      timestamp: 'Latest Session Close',
      freshness: candles?.freshness || 'HISTORICAL',
      followUps: [
        `How expensive is ${sym} based on earnings?`,
        `Would ${sym} make sense over 5 years?`,
      ],
    };
  }

  // 8. Comparison
  if (intent === 'COMPARISON' && symbols.length >= 2) {
    const [s1, s2] = symbols;
    const q1 = evidence.quotes[s1];
    const q2 = evidence.quotes[s2];
    const r1 = evidence.research[s1];
    const r2 = evidence.research[s2];

    if (!q1 || !q2 || q1.price === null || q2.price === null) {
      return makeUnavailableNotice(parsed, 'Comparative market quote data is unavailable for one or both symbols.');
    }

    const c1 = q1.currency === 'USD' ? '$' : '₹';
    const c2 = q2.currency === 'USD' ? '$' : '₹';
    const f1 = r1?.fundamentals;
    const f2 = r2?.fundamentals;

    const chg1 = typeof q1.changePct === 'number' && !isNaN(q1.changePct) ? `${q1.changePct >= 0 ? '+' : ''}${q1.changePct}%` : 'Unavailable';
    const chg2 = typeof q2.changePct === 'number' && !isNaN(q2.changePct) ? `${q2.changePct >= 0 ? '+' : ''}${q2.changePct}%` : 'Unavailable';
    const ex1 = q1.exchange && q1.exchange !== 'UNKNOWN' ? q1.exchange : 'Unavailable';
    const ex2 = q2.exchange && q2.exchange !== 'UNKNOWN' ? q2.exchange : 'Unavailable';

    return {
      query: parsed,
      title: `Comparison: ${s1} vs ${s2}`,
      directAnswer: `Side-by-side fundamentals between ${s1} and ${s2}.`,
      summary: `Deterministic comparison between ${s1} (P/E: ${f1?.peRatio ?? 'N/A'}, ROE: ${f1?.roe ? `${f1.roe}%` : 'N/A'}) and ${s2} (P/E: ${f2?.peRatio ?? 'N/A'}, ROE: ${f2?.roe ? `${f2.roe}%` : 'N/A'}).`,
      sections: [
        {
          heading: 'Side-by-Side Fundamentals',
          items: [
            `| Metric | ${s1} | ${s2} |`,
            `| :--- | :--- | :--- |`,
            `| **Price** | ${c1}${q1.price} | ${c2}${q2.price} |`,
            `| **Day Change** | ${chg1} | ${chg2} |`,
            `| **P/E Ratio** | ${f1?.peRatio ?? 'N/A'} | ${f2?.peRatio ?? 'N/A'} |`,
            `| **ROE** | ${f1?.roe ? `${f1.roe}%` : 'N/A'} | ${f2?.roe ? `${f2.roe}%` : 'N/A'} |`,
            `| **ROCE** | ${f1?.roce ? `${f1.roce}%` : 'N/A'} | ${f2?.roce ? `${f2.roce}%` : 'N/A'} |`,
            `| **Debt/Equity** | ${f1?.debtToEquity ?? 'N/A'} | ${f2?.debtToEquity ?? 'N/A'} |`,
            `| **Exchange** | ${ex1} | ${ex2} |`,
          ],
        },
      ],
      source: 'SmartVest Market & Fundamental Engine',
      timestamp: 'Latest Available Session',
      freshness: q1.freshness,
      followUps: [
        `Is ${s1} suitable for a 5-year horizon?`,
        `Is ${s2} suitable for a 5-year horizon?`,
      ],
    };
  }

  // 9. Long-Term Evaluation
  if (intent === 'LONG_TERM' && symbols.length > 0) {
    const sym = symbols[0];
    const q = evidence.quotes[sym];
    const r = evidence.research[sym];
    const c = evidence.candles[sym];

    const evaluation = evaluateLongTermFactors(sym, q, r, c);
    const factorBullets = evaluation.factors.map(
      (f) => `• **${f.label}:** ${f.value !== null ? f.value : 'N/A'} (${f.status.toUpperCase()}) — ${f.evidence}`
    );

    return {
      query: parsed,
      title: `${sym} — Long-Term Research Assessment`,
      directAnswer: `Evidence rating: ${evaluation.overallAssessment.replace('_', ' ')}.`,
      summary: evaluation.summary,
      sections: [
        {
          heading: 'Evidence by Measurable Dimension',
          items: factorBullets,
        },
        {
          heading: 'Deterministic Assessment',
          items: [
            `**Overall Evidence Rating:** **${evaluation.overallAssessment.replace('_', ' ')}**`,
            evaluation.summary,
          ],
        },
        {
          heading: 'Derived Factor Risks',
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
        `How expensive is ${sym} based on earnings?`,
        `Does ${sym} look overbought?`,
      ],
    };
  }

  // 10. Return / Calculation / SIP
  if (intent === 'RETURN') {
    // A. ROI from initial and current amounts (e.g. "I invested 10000 and now have 12500")
    if (parsed.initialAmount !== undefined && parsed.currentAmount !== undefined) {
      const roi = calculateRoi(parsed.initialAmount, parsed.currentAmount);
      const gain = Math.round((parsed.currentAmount - parsed.initialAmount) * 100) / 100;
      const curr = parsed.currency === 'USD' ? '$' : '₹';

      return {
        query: parsed,
        title: 'Investment Return Calculation',
        directAnswer: `Your absolute return is ${curr}${gain.toLocaleString()} (${roi !== null ? `${roi}%` : 'N/A'}).`,
        summary: `Investing ${curr}${parsed.initialAmount.toLocaleString()} with current value ${curr}${parsed.currentAmount.toLocaleString()} represents an absolute gain of ${curr}${gain.toLocaleString()} (${roi}% ROI).`,
        sections: [
          {
            heading: 'Calculation Breakdown',
            items: [
              `**Initial Investment:** ${curr}${parsed.initialAmount.toLocaleString()}`,
              `**Current Portfolio Value:** ${curr}${parsed.currentAmount.toLocaleString()}`,
              `**Absolute Wealth Gain:** ${curr}${gain.toLocaleString()}`,
              `**Return on Investment (ROI):** **${roi}%**`,
            ],
          },
          {
            heading: 'Formula & Methodology',
            items: [
              'Calculated via standard ROI formula: `ROI = ((Current Value - Initial Investment) / Initial Investment) * 100`.',
            ],
          },
        ],
        calculations: {
          initialAmount: parsed.initialAmount,
          currentAmount: parsed.currentAmount,
          wealthGain: gain,
          roiPct: roi,
        },
        followUps: [
          'What is CAGR?',
          'Calculate SIP of ₹5000 for 5 years at 12%',
        ],
      };
    }

    // B. SIP Future Value Calculation
    const hasAmount = typeof parsed.amount === 'number' && !isNaN(parsed.amount) && parsed.amount > 0;
    const hasYears = typeof parsed.years === 'number' && !isNaN(parsed.years) && parsed.years > 0;
    const hasRate = typeof parsed.rate === 'number' && !isNaN(parsed.rate) && parsed.rate > 0;

    const p = hasAmount ? parsed.amount! : 10000;
    const y = hasYears ? parsed.years! : 5;
    const r = hasRate ? parsed.rate! : 12;

    const sipCalc = calculateSipFutureValue(p, r, y);
    if (!sipCalc) {
      return makeUnavailableNotice(parsed, 'Invalid calculation parameters provided.');
    }

    const curr = parsed.currency === 'USD' ? '$' : '₹';
    const warnings: string[] = [];
    const assumptionItems: string[] = [];

    if (!hasAmount) {
      warnings.push('Monthly contribution not provided. Modeled with an illustrative ₹10,000/month.');
      assumptionItems.push('• **Monthly Contribution:** Not specified; modeled with an illustrative ₹10,000/month.');
    }
    if (!hasYears) {
      warnings.push('Investment duration not provided. Modeled with an illustrative 5-year horizon.');
      assumptionItems.push('• **Investment Duration:** Not specified; modeled with an illustrative 5-year duration.');
    }
    if (!hasRate) {
      warnings.push('Return rate not provided. Modeled with an illustrative 12% annual rate. This is not an expected or guaranteed return.');
      assumptionItems.push('• **Rate of Return:** Not specified; modeled at an illustrative 12% annual rate. This is a hypothetical mathematical assumption, not an expected or verified return.');
    }

    const allInputsProvided = hasAmount && hasYears && hasRate;
    const title = allInputsProvided
      ? `SIP Projection: ${curr}${p.toLocaleString()} Monthly for ${y} Years at ${r}%`
      : `Illustrative SIP Model: ${curr}${p.toLocaleString()}/mo for ${y}Y at ${r}% (${[!hasAmount && 'Amount', !hasYears && 'Duration', !hasRate && 'Rate'].filter(Boolean).join(', ')} Assumed)`;

    const summary = allInputsProvided
      ? `Investing ${curr}${p.toLocaleString()}/month for ${y} years at a modeled ${r}% annual rate yields a projected future corpus of ${curr}${sipCalc.futureValue.toLocaleString()} (wealth gain of ${curr}${sipCalc.wealthGain.toLocaleString()}).`
      : `Illustrative model (unspecified inputs assumed): Investing ${curr}${p.toLocaleString()}/month for ${y} years at a hypothetical ${r}% CAGR results in an estimated corpus of ${curr}${sipCalc.futureValue.toLocaleString()}. Note: Assumed return rates are hypothetical models and never expected or verified returns.`;

    return {
      query: parsed,
      title,
      directAnswer: `Estimated future corpus: ${curr}${sipCalc.futureValue.toLocaleString()} (total invested: ${curr}${sipCalc.totalInvested.toLocaleString()}).`,
      summary,
      sections: [
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
            `**Regulatory Notice:** Assumed return rates are purely illustrative mathematical inputs. They do NOT represent verified, expected, or guaranteed future returns. Actual returns fluctuate with market conditions.`,
          ],
        },
      ],
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

  // 11. Single Stock Risk Analysis
  if (intent === 'RISK_ANALYSIS' && symbols.length > 0) {
    const sym = symbols[0];
    const q = evidence.quotes[sym];
    const r = evidence.research[sym];
    const candles = evidence.candles[sym];
    const fund = r?.fundamentals;
    const candlesAny = candles as any;
    const closes: number[] = Array.isArray(candles?.observations)
      ? candles.observations.map((o) => o.close).filter((c: number): c is number => typeof c === 'number' && !isNaN(c))
      : Array.isArray(candlesAny?.c)
      ? candlesAny.c.filter((c: number): c is number => typeof c === 'number' && !isNaN(c))
      : Array.isArray(candlesAny?.closes)
      ? candlesAny.closes.filter((c: number): c is number => typeof c === 'number' && !isNaN(c))
      : [];

    const riskPoints: string[] = [];
    const curr = isUsSymbol(sym) ? '$' : '₹';

    if (fund && typeof fund.peRatio === 'number') {
      if (fund.peRatio > 45) {
        riskPoints.push(`Valuation Risk: Elevated P/E of ${fund.peRatio} leaves limited margin of safety against quarterly execution misses.`);
      } else {
        riskPoints.push(`Valuation Risk: P/E multiple of ${fund.peRatio} is within a moderate range.`);
      }
    } else {
      riskPoints.push('Valuation Risk: Verified P/E data is currently unavailable.');
    }

    if (fund && typeof fund.debtToEquity === 'number') {
      if (fund.debtToEquity > 1.2) {
        riskPoints.push(`Leverage Risk: Debt-to-Equity of ${fund.debtToEquity} indicates higher interest burden.`);
      } else {
        riskPoints.push(`Leverage Risk: Debt-to-Equity of ${fund.debtToEquity} reflects manageable leverage.`);
      }
    }

    if (closes.length >= 20) {
      const vol = calculateVolatility(closes);
      if (vol !== null) {
        riskPoints.push(`Price Volatility: Annualized realized volatility is ${vol}%.`);
      }
    }

    if (closes.length >= 200 && q && typeof q.price === 'number') {
      const sma200 = calculateMovingAverage(closes, 200);
      if (sma200 !== null) {
        const diff = Math.round(((q.price - sma200) / sma200) * 1000) / 10;
        riskPoints.push(`Trend Risk: Trading ${diff >= 0 ? `${diff}% above` : `${Math.abs(diff)}% below`} its 200 DMA (${curr}${sma200.toLocaleString()}).`);
      }
    }

    return {
      query: parsed,
      title: `${sym} Risk Profile Analysis`,
      directAnswer: `Deterministic risk screening evaluation for ${sym}.`,
      summary: `Risk screening assessment for ${sym} across valuation multiple, financial leverage, and price volatility.`,
      sections: [
        {
          heading: 'Deterministic Risk Factor Assessment',
          items: riskPoints.map((p) => `Deterministic screening heuristic: ${p}`),
        },
        {
          heading: 'Core Risk Considerations',
          items: [
            'Market Risk: All equities are subject to systematic market downturns and sector headwinds.',
            'Earnings Deceleration: High growth expectations require sustained quarterly earnings compounding.',
          ],
        },
      ],
      source: q?.source || 'Authorized Market Feed',
      timestamp: q?.asOf || 'Today',
      freshness: q?.freshness || 'HISTORICAL',
      followUps: [
        `What is ${sym} PE?`,
        `Is ${sym} above its 200 DMA?`,
        `Is ${sym} suitable for a 5-year horizon?`,
      ],
    };
  }

  // 12. Portfolio Risk & Asset Allocation
  if (intent === 'PORTFOLIO' || intent === 'RISK_ANALYSIS') {
    const portfolioData = evidence.portfolio;
    if (!portfolioData || !Array.isArray(portfolioData.holdings) || portfolioData.holdings.length === 0) {
      return {
        query: parsed,
        title: 'Portfolio Analysis',
        directAnswer: 'No active portfolio holdings found in your verified account record.',
        summary: 'Add your holdings under Portfolio to view allocation percentages, concentration risks, and diversification metrics.',
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

    const sanitized = portfolioData.holdings.filter((h: any) => h && typeof h.amount === 'number' && h.amount > 0);
    const total = sanitized.reduce((sum: number, h: any) => sum + h.amount, 0);
    const allocations = sanitized.map((h: any) => ({
      name: h.name || 'Unnamed Asset',
      amount: Math.round(h.amount),
      percentage: Math.round((h.amount / total) * 10000) / 100,
      category: h.category || 'Equity',
    }));
    allocations.sort((a: any, b: any) => b.percentage - a.percentage);

    const topPosition = allocations[0];
    const topPct = topPosition?.percentage || 0;
    const isConcentrated = topPct > 35;

    return {
      query: parsed,
      title: 'Portfolio Allocation & Risk Analysis',
      directAnswer: isConcentrated
        ? `Your portfolio exhibits elevated concentration: largest holding (${topPosition.name}) represents ${topPct}% of total assets.`
        : `Your portfolio exhibits balanced diversification: top holding (${topPosition?.name || 'N/A'}) is ${topPct}% of total value.`,
      summary: `Total portfolio value: ₹${total.toLocaleString()} across ${allocations.length} positions. Top concentration: ${topPct}% in ${topPosition?.name || 'N/A'}.`,
      sections: [
        {
          heading: 'Holdings Breakdown',
          items: allocations.map((a: any) => `• **${a.name}:** ₹${a.amount.toLocaleString()} (${a.percentage}%) [${a.category}]`),
        },
        {
          heading: 'Concentration Risk Assessment',
          items: [
            `**Top Position Concentration:** ${topPct}% in **${topPosition?.name || 'N/A'}**.`,
            isConcentrated
              ? `⚠️ **Elevated Single-Stock Risk:** Holding over 35% in one stock eliminates unsystematic risk diversification benefits.`
              : `✅ **Controlled Concentration:** Top position is within prudent diversification thresholds (<= 35%).`,
          ],
        },
      ],
      calculations: {
        type: 'portfolio_concentration',
        totalAmount: total,
        topConcentrationPct: topPct,
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
  }

  // 12. Personal Finance / Allocation Planning
  if (intent === 'PERSONAL_FINANCE' || intent === 'ALLOCATION') {
    const amt = parsed.amount || 50000;
    const curr = parsed.currency === 'USD' ? '$' : '₹';

    return {
      query: parsed,
      title: 'Capital Allocation Framework',
      directAnswer: `Deterministic allocation guideline for ${curr}${amt.toLocaleString()}.`,
      summary: `A disciplined allocation framework prioritizes emergency buffer, systematic index equity compounding, and capital preservation.`,
      sections: [
        {
          heading: 'Structured Asset Allocation Blueprint',
          items: [
            `• **Emergency Liquidity (20% - ${curr}${(amt * 0.2).toLocaleString()}):** Maintain in high-liquidity fixed income or bank deposits to cover 6 months of living expenses.`,
            `• **Core Equity Compounding (60% - ${curr}${(amt * 0.6).toLocaleString()}):** Diversified index funds or blue-chip equities for multi-year capital compounding.`,
            `• **Fixed Income & Gold (20% - ${curr}${(amt * 0.2).toLocaleString()}):** Capital preservation buffer to cushion against market volatility.`,
          ],
        },
        {
          heading: 'Fiduciary Rule of Thumb',
          items: [
            'Do not invest capital required within the next 3 years into volatile equity instruments.',
          ],
        },
      ],
      followUps: [
        'What is emergency fund?',
        'Calculate SIP of ₹10000 for 10 years at 12%',
        'What is CAGR?',
      ],
    };
  }

  // 13. Explanation & Education
  if (intent === 'EDUCATION' || intent === 'EXPLANATION') {
    if (metric === 'PE' || intent === 'EXPLANATION') {
      return {
        query: parsed,
        title: 'Why High P/E Matters',
        directAnswer: 'P/E indicates how much the market pays today per rupee or dollar of annual earnings.',
        summary: 'A high P/E ratio indicates that investors expect higher future earnings growth compared to companies with a lower P/E.',
        sections: [
          {
            heading: 'Direct explanation',
            items: [
              'The Price-to-Earnings (P/E) multiple reflects the valuation premium investors are willing to pay for each unit of annual earnings generated by the business.',
            ],
          },
          {
            heading: 'Mechanism',
            items: [
              "When buyers bid up share prices relative to reported net profits, the valuation multiple expands, discounting future cash flows into today's price.",
            ],
          },
          {
            heading: 'What it implies',
            items: [
              'High P/E securities reflect optimistic expectations for earnings compounding, competitive moats, or premium market sentiment.',
              'Such securities often experience elevated downside volatility if financial results decelerate below market forecasts.',
            ],
          },
          {
            heading: 'Important limitation',
            items: [
              'P/E alone does not determine whether a security is attractive. Growth rate (PEG), balance sheet debt, and return on equity (ROE) must be evaluated concurrently.',
            ],
          },
        ],
        followUps: ['What is ROE?', 'What is 200 DMA?', 'What is RELIANCE price?'],
      };
    }

    if (metric === 'CAGR') {
      return {
        query: parsed,
        title: 'Compound Annual Growth Rate (CAGR)',
        directAnswer: 'CAGR measures the annualized geometric return of an investment over a multi-year horizon.',
        summary: 'CAGR provides the smoothed constant annual rate at which an investment grew from initial to final value.',
        sections: [
          {
            heading: 'Concept Breakdown',
            items: [
              'Formula: `CAGR = (Final Value / Initial Value)^(1 / Years) - 1`.',
              'Smooths Year-to-Year Swings: Eliminates erratic intermediate volatility to show effective annualized capital compounding.',
            ],
          },
        ],
        followUps: ['Calculate SIP of ₹5000 for 5 years at 12%', 'What is RELIANCE price?'],
      };
    }

    if (metric === 'ETF') {
      return {
        query: parsed,
        title: 'Exchange-Traded Fund (ETF) Overview',
        directAnswer: 'An ETF is an investment fund traded on stock exchanges, holding a basket of underlying assets.',
        summary: 'ETFs hold collections of assets (stocks, bonds, or commodities) and generally track an underlying benchmark index with intraday liquidity.',
        sections: [
          {
            heading: 'Core Concept',
            items: [
              'Exchange Traded: Trades continuously throughout market hours on public exchanges at real-time market prices.',
              'Instant Diversification: A single unit of an index ETF (such as NIFTY BEES or SPY) provides exposure to a basket of underlying securities.',
            ],
          },
          {
            heading: 'Key Structural Characteristics',
            items: [
              'Cost Efficiency: Passively managed ETFs typically feature lower expense ratios compared to actively managed mutual funds.',
              'Creation / Redemption: Authorized participants arbitrage differences between market price and net asset value (NAV).',
            ],
          },
          {
            heading: 'Important Considerations',
            items: [
              'Tracking Error: Minor performance divergences can occur between the ETF and its underlying benchmark index.',
              'Trading Spreads: Less liquid ETFs may exhibit wider bid-ask spreads during regular trading sessions.',
            ],
          },
        ],
        followUps: ['What is CAGR?', 'What is PE ratio?', 'What is RELIANCE price?'],
      };
    }

    return {
      query: parsed,
      title: 'Financial Concept Education',
      directAnswer: 'VestIQ educational guide.',
      summary: 'Deterministic educational breakdown of key market concepts.',
      sections: [
        {
          heading: 'Concept Guide',
          items: [
            'CAGR: Geometric annual growth rate smoothing out intermediate annual swings.',
            'P/E Ratio: Market valuation multiple comparing share price to earnings per share.',
            '200 DMA: 200-day moving average identifying long-term macro price trend.',
          ],
        },
      ],
      followUps: ['What is CAGR?', 'What is 200 DMA?', 'What is RELIANCE price?'],
    };
  }

  // 13. Commodity Analysis
  if (intent === 'COMMODITY') {
    const comm = metric || (symbols.length > 0 ? symbols[0] : 'Commodity');
    const q = symbols.length > 0 ? evidence.quotes[symbols[0]] : null;

    return {
      query: parsed,
      title: `${comm} Market Overview`,
      directAnswer: `${comm} is a primary macroeconomic asset class often utilized as an inflation hedge and store of value.`,
      summary: `Macroeconomic analysis and structural drivers for ${comm}.`,
      sections: [
        {
          heading: 'Macro Transmission Factors',
          items: [
            'Inflation Hedge: Precious metals and commodities often help preserve purchasing power during prolonged inflationary periods.',
            'Currency Inverse Correlation: Commodities priced in US Dollars typically display inverse price sensitivity to US Dollar Index (DXY) strength.',
            'Opportunity Cost: When global real interest rates surge, non-yielding assets face relative yield headwinds.',
          ],
        },
        {
          heading: 'Analytical Limitations',
          items: [
            'Commodities generate zero cash flow, dividends, or coupon payments; returns depend entirely on terminal price appreciation.',
            'Futures and commodity ETFs can incur contango roll decay over extended holding periods.',
          ],
        },
      ],
      source: q?.source || 'Macroeconomic Knowledge Base',
      timestamp: q?.asOf || 'Verified Mechanism',
      freshness: q?.freshness || 'STATIC_KNOWLEDGE',
      followUps: [
        'How does inflation affect real returns?',
        'What is RELIANCE price?',
        'What is CAGR?',
      ],
    };
  }

  // 14. Broad Market Movement & Index Analysis
  if (intent === 'MARKET') {
    const sym = symbols.length > 0 ? symbols[0] : 'NIFTY 50';
    const q = evidence.quotes[sym];

    if (isCurrentEvent) {
      if (q && typeof q.price === 'number') {
        const curr = q.currency === 'USD' ? '$' : '₹';
        const hasPct = typeof q.changePct === 'number' && !isNaN(q.changePct);
        const pctStr = hasPct ? `${q.changePct! >= 0 ? '+' : ''}${q.changePct}%` : 'Unavailable';
        return {
          query: parsed,
          title: `${sym} Market Movement Today`,
          directAnswer: `${sym} is trading at ${curr}${q.price.toLocaleString()} (${pctStr}) today.`,
          summary: `Current session overview for ${sym}: trading at ${curr}${q.price.toLocaleString()} (${pctStr}).`,
          sections: [
            {
              heading: 'Current Session Snapshot',
              items: [
                `**Index / Security:** ${sym}`,
                `**Current Level:** ${curr}${q.price.toLocaleString()}`,
                `**Session Change:** ${pctStr}`,
                `**Data Status:** ${q.freshness === 'REALTIME' ? 'LIVE' : 'DELAYED'}`,
              ],
            },
            {
              heading: 'Typical Intraday Market Transmission Catalysts',
              items: [
                'Monetary Policy & Yields: Rising benchmark bond yields discount equity valuations and tighten liquidity.',
                'Foreign Institutional Flows: Net buying or selling by institutional participants heavily influences broad index direction.',
                'Global Cues & Currency: Overnight performance in US/Asian indices and currency shifts affect domestic market sentiment.',
              ],
            },
            {
              heading: 'Analytical Limitation',
              items: [
                'VestIQ refrains from inferring unverified causal intraday news events without confirmed real-time feeds.',
              ],
            },
          ],
          source: q.source || 'Authorized Market Feed',
          timestamp: q.asOf || 'Today',
          freshness: q.freshness,
          followUps: [
            'What is RELIANCE price?',
            'What is AAPL price?',
            'Why do bond prices fall when interest rates rise?',
          ],
        };
      }

      // If live quote is unavailable:
      return {
        query: parsed,
        title: 'Market Movement Analysis',
        directAnswer: UNAVAILABLE_DATA_RESPONSE,
        summary: UNAVAILABLE_DATA_RESPONSE,
        sections: [
          {
            heading: 'Typical Intraday Market Transmission Catalysts',
            items: [
              'Monetary Policy & Yields: Benchmark interest rate expectations and sovereign bond yield spikes tighten systemic liquidity.',
              'Institutional Liquidity: FII and DII net cash flows directly influence benchmark index trajectory.',
              'Input Cost Spikes: Sharp surges in energy (crude oil) compress corporate operating margins.',
            ],
          },
          {
            heading: 'Analytical Limitation',
            items: [
              'Specific real-time news catalysts and intraday news feeds for today are currently unavailable.',
              'VestIQ never fabricates causal market explanations without verified live evidence.',
            ],
          },
        ],
        source: 'SmartVest Macroeconomic Engine',
        timestamp: 'Verified Transmission Mechanics',
        freshness: 'STATIC_KNOWLEDGE',
        followUps: [
          'What is RELIANCE price?',
          'What is CAGR?',
          'Why do bond prices fall when interest rates rise?',
        ],
      };
    }
  }

  return makeUnavailableNotice(parsed);
}

function makeUnavailableNotice(parsed: ParsedFinanceQuery, detail?: string): ReasoningResult {
  return {
    query: parsed,
    title: 'Advisory Data Notice',
    directAnswer: UNAVAILABLE_DATA_RESPONSE,
    summary: detail ? `${UNAVAILABLE_DATA_RESPONSE} ${detail}` : UNAVAILABLE_DATA_RESPONSE,
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

function composeConceptComparisonAnswer(
  parsed: ParsedFinanceQuery,
  comp: ConceptComparison
): ReasoningResult {
  const c1 = FINANCE_CONCEPTS.find((c) => c.id === comp.concept1Id);
  const c2 = FINANCE_CONCEPTS.find((c) => c.id === comp.concept2Id);
  const name1 = c1?.name.split(' (')[0] || comp.concept1Id;
  const name2 = c2?.name.split(' (')[0] || comp.concept2Id;

  const tableHeader = `| Evaluation Factor | ${name1} | ${name2} |`;
  const tableDivider = '| :--- | :--- | :--- |';
  const tableRows = comp.differences.map(
    (d) => `| **${d.aspect}** | ${d.concept1Value} | ${d.concept2Value} |`
  );

  return {
    query: parsed,
    title: `${comp.name}: Comparative Analysis`,
    directAnswer: comp.summary,
    summary: comp.summary,
    sections: [
      {
        heading: 'Comparative Difference Matrix',
        items: [tableHeader, tableDivider, ...tableRows],
      },
      {
        heading: 'Deterministic Strategic Takeaway',
        items: [`• **Fiduciary Perspective:** ${comp.verdict}`],
      },
    ],
    source: 'VestIQ Deterministic Finance Knowledge Engine',
    timestamp: 'Authoritative Curriculum',
    freshness: 'STATIC_KNOWLEDGE',
    followUps: [
      `What is ${name1}?`,
      `What is ${name2}?`,
      'What is asset allocation?',
    ],
  };
}

function composeMacroRelationshipAnswer(
  parsed: ParsedFinanceQuery,
  rel: MacroRelationship
): ReasoningResult {
  return {
    query: parsed,
    title: rel.name,
    directAnswer: `Underlying transmission: changes in ${rel.driver} directly alter ${rel.target} through established financial channels.`,
    summary: `Economic transmission dynamics between ${rel.driver} and ${rel.target}.`,
    sections: [
      {
        heading: 'Economic Transmission Mechanics',
        items: rel.transmissionMechanics.map((m) => `• ${m}`),
      },
      {
        heading: 'Practical Market Example',
        items: [`• ${rel.example}`],
      },
      {
        heading: 'Market Nuance & Analytical Limitations',
        items: [`• ${rel.realWorldLimitation}`],
      },
    ],
    source: 'VestIQ Macroeconomic Transmission Engine',
    timestamp: 'Verified Economic Mechanism',
    freshness: 'STATIC_KNOWLEDGE',
    followUps: [
      `What is ${rel.driver}?`,
      `What is ${rel.target}?`,
      'How does inflation affect investments?',
    ],
  };
}

function composeFinanceConceptAnswer(
  parsed: ParsedFinanceQuery,
  concept: FinanceConcept
): ReasoningResult {
  const aspect = parsed.conceptAspect || 'definition';

  let title = concept.name;
  let directAnswer = concept.definition;

  if (aspect === 'howItWorks') {
    title = `${concept.name} — How It Works`;
    directAnswer =
      concept.howItWorks && concept.howItWorks.length > 0
        ? `${concept.name} operates through specific mechanics: ${concept.howItWorks[0]}`
        : concept.definition;
  } else if (aspect === 'risks') {
    title = `${concept.name} — Key Risks & Limitations`;
    directAnswer =
      concept.risks && concept.risks.length > 0
        ? `Primary risks of ${concept.name}: ${concept.risks[0]}`
        : `Primary risks for ${concept.name} include market exposure, liquidity constraints, and economic volatility.`;
  } else if (aspect === 'whyItMatters') {
    title = `${concept.name} — Why It Matters`;
    directAnswer =
      concept.whyItMatters && concept.whyItMatters.length > 0
        ? `Strategic importance of ${concept.name}: ${concept.whyItMatters[0]}`
        : concept.definition;
  } else if (aspect === 'example') {
    title = `${concept.name} — Practical Example`;
    directAnswer = concept.example
      ? `Practical example: ${concept.example}`
      : `Example for ${concept.name}: Illustrative financial application.`;
  }

  const sections: { heading: string; items: string[] }[] = [];

  // 1. Definition
  sections.push({
    heading: 'Core Definition',
    items: [`• **Definition:** ${concept.definition}`],
  });

  // 2. How it works
  if (concept.howItWorks && concept.howItWorks.length > 0) {
    sections.push({
      heading: 'How It Works',
      items: concept.howItWorks.map((h) => `• ${h}`),
    });
  }

  // 3. Why it matters
  if (concept.whyItMatters && concept.whyItMatters.length > 0) {
    sections.push({
      heading: 'Why It Matters',
      items: concept.whyItMatters.map((w) => `• ${w}`),
    });
  }

  // 4. Practical Example
  if (concept.example) {
    sections.push({
      heading: 'Practical Example',
      items: [`• **Illustrative Scenario:** ${concept.example}`],
    });
  }

  // 5. Key Points & Risks
  const pointsAndRisks: string[] = [];
  if (concept.keyPoints && concept.keyPoints.length > 0) {
    pointsAndRisks.push(...concept.keyPoints.map((k) => `• ${k}`));
  }
  if (concept.risks && concept.risks.length > 0) {
    pointsAndRisks.push(...concept.risks.map((r) => `• ⚠️ **Risk:** ${r}`));
  }
  if (pointsAndRisks.length > 0) {
    sections.push({
      heading: 'Key Considerations & Risks',
      items: pointsAndRisks,
    });
  }

  // 6. Related Concepts
  if (concept.relatedConcepts && concept.relatedConcepts.length > 0) {
    const formattedRelated = concept.relatedConcepts
      .map((rc) => {
        const found = FINANCE_CONCEPTS.find((c) => c.id === rc);
        return found ? found.name.split(' (')[0] : rc;
      })
      .join(', ');
    sections.push({
      heading: 'Related Financial Concepts',
      items: [`• **Connected Topics:** ${formattedRelated}`],
    });
  }

  // Follow-ups
  const followUps: string[] = [];
  if (aspect !== 'howItWorks' && concept.howItWorks) {
    followUps.push(`How does ${concept.name.split(' (')[0]} work?`);
  }
  if (aspect !== 'risks' && concept.risks) {
    followUps.push(`What are the risks of ${concept.name.split(' (')[0]}?`);
  }
  if (concept.commonQuestions && concept.commonQuestions.length > 0) {
    for (const q of concept.commonQuestions) {
      if (!followUps.includes(q) && followUps.length < 3) {
        followUps.push(q);
      }
    }
  }
  if (followUps.length < 3) {
    followUps.push('What is compounding?');
    followUps.push('What is asset allocation?');
  }

  return {
    query: parsed,
    title,
    directAnswer,
    summary: concept.definition,
    sections,
    source: 'VestIQ Deterministic Finance Knowledge Library',
    timestamp: 'Authoritative Financial Curriculum',
    freshness: 'STATIC_KNOWLEDGE',
    followUps: followUps.slice(0, 3),
  };
}

function composePartialFinanceAnswer(parsed: ParsedFinanceQuery): ReasoningResult {
  const recognizedItems: string[] = [];
  const recognizedFollowups: string[] = [];

  if (Array.isArray(parsed.partialFinanceTerms)) {
    for (const term of parsed.partialFinanceTerms) {
      const c =
        FINANCE_CONCEPTS.find(
          (concept) =>
            concept.name.toLowerCase() === term.toLowerCase() ||
            concept.aliases.some((a) => a.toLowerCase() === term.toLowerCase())
        ) || findFinanceConcept(term);

      if (c) {
        recognizedItems.push(`• **${c.name}:** ${c.definition}`);
        recognizedFollowups.push(`What is ${c.name.split(' (')[0]}?`);
      }
    }
  }

  if (recognizedItems.length === 0) {
    recognizedItems.push(
      '• **Financial Context:** Financial decisions are evaluated through structured metrics: Valuation (P/E), Profitability (EPS, Revenue), Risk-Adjusted Returns (CAGR), and Portfolio Diversification.'
    );
  }

  return {
    query: parsed,
    title: 'Financial Knowledge & Analysis',
    directAnswer: 'Analysis based on verified deterministic financial principles.',
    summary: `We identified relevant financial concepts in your inquiry. Below is the verified deterministic knowledge available for these concepts.`,
    sections: [
      {
        heading: 'Verified Knowledge Coverage',
        items: recognizedItems,
      },
      {
        heading: 'Unverified / Missing Concept',
        items: [
          `• **Custom Inquiry Notice:** "${parsed.originalQuery}" involves qualitative or unverified elements that cannot be confirmed from static financial rules alone.`,
          `• **Fiduciary Principle:** VestIQ strictly avoids fabricating non-standard financial ratios or unverified market narratives.`,
        ],
      },
    ],
    warnings: [
      `Certain qualitative aspects of your inquiry ("${parsed.originalQuery}") cannot be verified from deterministic financial rules alone. Only verified concepts are detailed above.`
    ],
    source: 'VestIQ Deterministic Finance Knowledge Engine',
    timestamp: 'Authoritative Curriculum',
    freshness: 'STATIC_KNOWLEDGE',
    followUps: [
      ...recognizedFollowups.slice(0, 2),
      'What is an IPO?',
      'What is CAGR?',
      'What is P/E ratio?',
    ].slice(0, 3),
  };
}

export function formatRuleResultToMarkdown(result: ReasoningResult): string {
  const parts: string[] = [];

  if (result.title) parts.push(`### ${result.title}\n`);
  if (result.directAnswer && result.directAnswer !== result.title) {
    parts.push(`**${result.directAnswer}**\n`);
  }
  if (result.summary && result.summary !== result.title && result.summary !== result.directAnswer) {
    parts.push(`${result.summary}\n`);
  }

  if (Array.isArray(result.sections)) {
    for (const sec of result.sections) {
      if (sec.heading) parts.push(`#### ${sec.heading}`);
      for (const item of sec.items) {
        if (item.startsWith('|') || item.startsWith('•') || item.startsWith('-') || item.startsWith('*')) {
          parts.push(item);
        } else {
          parts.push(`- ${item}`);
        }
      }
      parts.push('');
    }
  }

  if (Array.isArray(result.warnings) && result.warnings.length > 0) {
    parts.push('⚠️ **Notice:**');
    for (const w of result.warnings) parts.push(`- ${w}`);
    parts.push('');
  }

  const footerParts: string[] = [];
  if (result.source) footerParts.push(`**Source:** ${result.source}`);
  if (result.timestamp) footerParts.push(`**Timestamp:** ${result.timestamp}`);
  if (result.freshness) footerParts.push(`**Freshness:** ${result.freshness}`);

  if (footerParts.length > 0) {
    parts.push(`---\n*${footerParts.join(' | ')}*`);
  }

  return parts.join('\n').trim();
}
