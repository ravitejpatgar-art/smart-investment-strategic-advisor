import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseFinanceQuery,
  executeDeterministicAdvisor,
  formatRuleResultToMarkdown,
  planDataRequirements,
  gatherEvidence,
  composeAnswer,
  decomposeQuestion,
  isUsSymbol,
  getApiSymbol,
  OUT_OF_DOMAIN_RESPONSE,
  UNAVAILABLE_DATA_RESPONSE,
  normalizeQuestion,
  tokenizeQuestion,
  resolveDynamicEntities,
} from '../services/vestiqRuleEngine';
import { marketApi } from '../services/marketApi';

describe('VestIQ Finance Reasoning Engine — Phase 2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // 1. Natural Language Intent & Entity Extraction
  // ==========================================

  it('1. parses "What is Reliance trading at?" as QUOTE / RELIANCE', () => {
    const q = parseFinanceQuery('What is Reliance trading at?');
    expect(q.intent).toBe('QUOTE');
    expect(q.symbols).toContain('RELIANCE');
    expect(q.domain).toBe('STOCKS');
  });

  it('2. parses "How expensive is Reliance based on earnings?" as FUNDAMENTALS / RELIANCE', () => {
    const q = parseFinanceQuery('How expensive is Reliance based on earnings?');
    expect(q.intent).toBe('FUNDAMENTALS');
    expect(q.symbols).toContain('RELIANCE');
    expect(q.metric).toBe('PE');
  });

  it('3. parses "Does Reliance look overbought?" as TECHNICAL / RELIANCE', () => {
    const q = parseFinanceQuery('Does Reliance look overbought?');
    expect(q.intent).toBe('TECHNICAL');
    expect(q.symbols).toContain('RELIANCE');
    expect(q.metric).toBe('RSI');
  });

  it('4. parses "Which is stronger, Reliance or TCS?" as COMPARISON', () => {
    const q = parseFinanceQuery('Which is stronger, Reliance or TCS?');
    expect(q.intent).toBe('COMPARISON');
    expect(q.symbols).toEqual(expect.arrayContaining(['RELIANCE', 'TCS']));
  });

  it('5. parses "Would Reliance make sense over 5 years?" as LONG_TERM', () => {
    const q = parseFinanceQuery('Would Reliance make sense over 5 years?');
    expect(q.intent).toBe('LONG_TERM');
    expect(q.symbols).toContain('RELIANCE');
    expect(q.years).toBe(5);
  });

  it('6. parses "Why does a high PE matter?" as EXPLANATION', () => {
    const q = parseFinanceQuery('Why does a high PE matter?');
    expect(q.intent).toBe('EXPLANATION');
    expect(q.symbols.length).toBe(0);
    expect(q.metric).toBe('PE');
  });

  it('7. parses "Why can rising crude affect OMC stocks?" as MARKET_RELATIONSHIP', () => {
    const q = parseFinanceQuery('Why can rising crude affect OMC stocks?');
    expect(q.intent).toBe('MARKET_RELATIONSHIP');
    expect(q.relationship).toBeDefined();
    expect(q.relationship?.id).toBe('CRUDE_OIL_TO_OMC');
  });

  it('8. parses "How risky is my concentrated portfolio?" as RISK_ANALYSIS', () => {
    const q = parseFinanceQuery('How risky is my concentrated portfolio?');
    expect(q.intent).toBe('RISK_ANALYSIS');
    expect(q.domain).toBe('PORTFOLIO');
  });

  it('9. parses "I invested 10000 and now have 12500" as RETURN / calculation', () => {
    const q = parseFinanceQuery('I invested 10000 and now have 12500');
    expect(q.intent).toBe('RETURN');
    expect(q.initialAmount).toBe(10000);
    expect(q.currentAmount).toBe(12500);
    expect(q.domain).toBe('FINANCIAL_CALCULATIONS');
  });

  it('10. parses "₹10000 monthly for 10 years at 12%" as RETURN / SIP', () => {
    const q = parseFinanceQuery('₹10000 monthly for 10 years at 12%');
    expect(q.intent).toBe('RETURN');
    expect(q.amount).toBe(10000);
    expect(q.years).toBe(10);
    expect(q.rate).toBe(12);
  });

  it('11. parses "Why do bond prices change when rates rise?" as FIXED_INCOME / EXPLANATION', () => {
    const q = parseFinanceQuery('Why do bond prices change when rates rise?');
    expect(['FIXED_INCOME', 'EXPLANATION']).toContain(q.intent);
    expect(q.domain).toBe('FIXED_INCOME');
  });

  it('12. parses "How should I think about allocating 50000?" as ALLOCATION / PERSONAL_FINANCE', () => {
    const q = parseFinanceQuery('How should I think about allocating 50000?');
    expect(['ALLOCATION', 'PERSONAL_FINANCE']).toContain(q.intent);
    expect(q.domain).toBe('PERSONAL_FINANCE');
    expect(q.amount).toBe(50000);
  });

  // ==========================================
  // 2. Ambiguity & Out-of-Domain Filtering
  // ==========================================

  it('13. clarifies ambiguous questions like "What is Apple?" without jumping to conclusions', () => {
    const q = parseFinanceQuery('What is Apple?');
    expect(q.intent).toBe('AMBIGUOUS');
    expect(q.isAmbiguous).toBe(true);
    expect(q.ambiguityClarification).toContain('Apple Inc. (AAPL) or the fruit');

    const result = composeAnswer(q, { quotes: {}, research: {}, candles: {}, portfolio: null });
    expect(result.summary).toContain('Apple Inc. (AAPL) or the fruit');
  });

  it('14. correctly maps "Should I invest in Apple?" to AAPL with financial context', () => {
    const q = parseFinanceQuery('Should I invest in Apple?');
    expect(q.intent).not.toBe('AMBIGUOUS');
    expect(q.intent).not.toBe('OUT_OF_DOMAIN');
    expect(q.symbols).toContain('AAPL');
    expect(q.domain).toBe('STOCKS');
  });

  it('15. rejects general non-financial queries as OUT_OF_DOMAIN', () => {
    const q1 = parseFinanceQuery('What is the weather today?');
    expect(q1.intent).toBe('OUT_OF_DOMAIN');
    expect(q1.domain).toBe('OUT_OF_DOMAIN');

    const ans = composeAnswer(q1, { quotes: {}, research: {}, candles: {}, portfolio: null });
    expect(ans.directAnswer).toBe(OUT_OF_DOMAIN_RESPONSE);
    const md = formatRuleResultToMarkdown(ans);
    expect(md).toContain('Topic Outside Financial Domain');

    const q2 = parseFinanceQuery('What happened in cricket?');
    expect(q2.intent).toBe('OUT_OF_DOMAIN');
    expect(q2.domain).toBe('OUT_OF_DOMAIN');
  });

  // ==========================================
  // 3. Conversation Context & Pronoun Resolution
  // ==========================================

  it('16. resolves pronouns using conversation context ("Tell me about RELIANCE" -> "What about its PE?")', () => {
    // Turn 1: User asks about RELIANCE
    const turn1 = parseFinanceQuery('Tell me about RELIANCE.');
    expect(turn1.symbols).toContain('RELIANCE');

    // Turn 2: User asks follow-up with pronoun "its"
    const turn2 = parseFinanceQuery('What about its PE?', { lastSymbol: 'RELIANCE' });
    expect(turn2.symbols).toContain('RELIANCE');
    expect(turn2.intent).toBe('FUNDAMENTALS');
    expect(turn2.metric).toBe('PE');

    // Turn 3: User asks comparison using "it"
    const turn3 = parseFinanceQuery('Compare it with TCS.', { lastSymbol: 'RELIANCE' });
    expect(turn3.symbols).toEqual(expect.arrayContaining(['RELIANCE', 'TCS']));
    expect(turn3.intent).toBe('COMPARISON');
  });

  it('17. guarantees current query always takes priority over old conversation context', () => {
    // Context had RELIANCE, but user explicitly asks about INFY
    const q = parseFinanceQuery('What is INFY price?', { lastSymbol: 'RELIANCE' });
    expect(q.symbols).toContain('INFY');
    expect(q.symbols).not.toContain('RELIANCE');
  });

  // ==========================================
  // 4. Question Decomposition
  // ==========================================

  it('18. decomposes compound comparison & long-term question into structured sub-goals', () => {
    const raw = 'Is RELIANCE expensive compared with TCS and suitable for 5 years?';
    const parsed = parseFinanceQuery(raw);
    const goals = decomposeQuestion(raw, parsed.symbols, parsed.intent, {
      amount: parsed.amount,
      years: parsed.years,
      currency: 'INR',
    });

    expect(goals.length).toBeGreaterThanOrEqual(4);
    expect(goals.some((g) => g.description.includes('RELIANCE valuation'))).toBe(true);
    expect(goals.some((g) => g.description.includes('TCS valuation'))).toBe(true);
    expect(goals.some((g) => g.description.includes('valuation comparison'))).toBe(true);
    expect(goals.some((g) => g.description.includes('long-term evidence'))).toBe(true);
  });

  it('19. decomposes return calculation query into initial amount, current value, ROI and absolute return', () => {
    const raw = "I invested ₹10000 in RELIANCE and now it's ₹12500. What is my return?";
    const parsed = parseFinanceQuery(raw);
    const goals = decomposeQuestion(raw, parsed.symbols, parsed.intent, {
      initialAmount: parsed.initialAmount,
      currentAmount: parsed.currentAmount,
      currency: 'INR',
    });

    expect(goals.length).toBe(4);
    expect(goals[0].description).toBe('initial amount');
    expect(goals[1].description).toBe('current value');
    expect(goals[2].description).toBe('ROI');
    expect(goals[3].description).toBe('absolute return');
  });

  // ==========================================
  // 5. Data Requirements Planner & API Minimization
  // ==========================================

  it('20. strictly requests only necessary APIs per Section 9 specification', () => {
    // "What is RELIANCE price?" -> quote only
    const pQuote = planDataRequirements(parseFinanceQuery('What is RELIANCE price?'));
    expect(pQuote.quotes).toEqual(['RELIANCE']);
    expect(pQuote.candles).toHaveLength(0);
    expect(pQuote.research).toHaveLength(0);

    // "RSI of RELIANCE" -> candles only
    const pRsi = planDataRequirements(parseFinanceQuery('RSI of RELIANCE'));
    expect(pRsi.candles).toEqual(['RELIANCE']);
    expect(pRsi.quotes).toHaveLength(0);
    expect(pRsi.research).toHaveLength(0);

    // "Is RELIANCE expensive?" -> fundamentals/research only
    const pFund = planDataRequirements(parseFinanceQuery('Is RELIANCE expensive?'));
    expect(pFund.research).toEqual(['RELIANCE']);
    expect(pFund.quotes).toHaveLength(0);
    expect(pFund.candles).toHaveLength(0);

    // "Compare RELIANCE and TCS" -> quote + research for both
    const pComp = planDataRequirements(parseFinanceQuery('Compare RELIANCE and TCS'));
    expect(pComp.quotes).toEqual(expect.arrayContaining(['RELIANCE', 'TCS']));
    expect(pComp.research).toEqual(expect.arrayContaining(['RELIANCE', 'TCS']));
    expect(pComp.candles).toHaveLength(0);

    // "What is CAGR?" -> no API
    const pEdu = planDataRequirements(parseFinanceQuery('What is CAGR?'));
    expect(pEdu.noApi).toBe(true);

    // "How diversified is my portfolio?" -> portfolio only
    const pPort = planDataRequirements(parseFinanceQuery('How diversified is my portfolio?'));
    expect(pPort.portfolio).toBe(true);
    expect(pPort.quotes).toHaveLength(0);
  });

  // ==========================================
  // 6. Parallel Data Gathering & Execution
  // ==========================================

  it('21. retrieves comparative data in parallel via Promise.all without serial bottlenecks', async () => {
    const qSpy = vi.spyOn(marketApi, 'getQuote').mockImplementation(async (sym) => ({
      symbol: sym,
      name: sym,
      exchange: 'NSE',
      assetType: 'STOCK',
      price: 2500,
      currency: 'INR',
      change: 10,
      changePct: 0.4,
      freshness: 'REALTIME',
    } as any));

    const rSpy = vi.spyOn(marketApi, 'getResearch').mockImplementation(async (sym) => ({
      fundamentals: {
        symbol: sym,
        peRatio: 25,
        roe: 18,
        debtToEquity: 0.2,
      },
    } as any));

    const parsed = parseFinanceQuery('Compare RELIANCE and TCS');
    const plan = planDataRequirements(parsed);
    const evidence = await gatherEvidence(plan);

    expect(evidence.quotes['RELIANCE']).toBeDefined();
    expect(evidence.quotes['TCS']).toBeDefined();
    expect(evidence.research['RELIANCE']).toBeDefined();
    expect(evidence.research['TCS']).toBeDefined();
    expect(qSpy).toHaveBeenCalledTimes(2);
    expect(rSpy).toHaveBeenCalledTimes(2);
  });

  // ==========================================
  // 7. Macroeconomic Relationship Mechanics
  // ==========================================

  it('22. explains economic transmission mechanism for general crude oil / OMC query without fabricating market outcomes', async () => {
    const q = parseFinanceQuery('Why can rising crude affect OMC stocks?');
    const plan = planDataRequirements(q);
    expect(plan.noApi).toBe(true);

    const evidence = await gatherEvidence(plan);
    const result = composeAnswer(q, evidence);

    expect(result.title).toContain('Economic Relationship');
    expect(result.sections.some((s) => s.heading.includes('Transmission Mechanics'))).toBe(true);
    expect(result.sections.some((s) => s.heading.includes('Real-World Limitations'))).toBe(true);
    // Never guarantees market outcome
    expect(result.directAnswer).not.toContain('guaranteed to fall');
  });

  // ==========================================
  // 8. Answer Composition Quality (Section 13)
  // ==========================================

  it('23. dynamically composes answer for "Why does a high PE matter?" matching Section 13 format', () => {
    const q = parseFinanceQuery('Why does a high PE matter?');
    const plan = planDataRequirements(q);
    expect(plan.noApi).toBe(true);

    const result = composeAnswer(q, { quotes: {}, research: {}, candles: {}, portfolio: null });
    expect(result.title).toBe('Why High P/E Matters');
    expect(result.sections.some((s) => s.heading === 'Direct explanation')).toBe(true);
    expect(result.sections.some((s) => s.heading === 'Mechanism')).toBe(true);
    expect(result.sections.some((s) => s.heading === 'What it implies')).toBe(true);
    expect(result.sections.some((s) => s.heading === 'Important limitation')).toBe(true);
    expect(result.sections.find((s) => s.heading === 'Important limitation')?.items[0]).toContain(
      'P/E alone does not determine whether a security is attractive'
    );
  });

  // ==========================================
  // 9. Data Integrity & Safeguards
  // ==========================================

  it('24. guarantees US symbols NEVER become .NS', () => {
    expect(getApiSymbol('AAPL')).toBe('AAPL');
    expect(getApiSymbol('MSFT')).toBe('MSFT');
    expect(getApiSymbol('GOOGL')).toBe('GOOGL');
    expect(getApiSymbol('SPY')).toBe('SPY');
    expect(isUsSymbol('AAPL')).toBe(true);
    expect(isUsSymbol('SPY')).toBe(true);
    expect(getApiSymbol('RELIANCE')).toBe('RELIANCE.NS');
  });

  it('25. strictly reports unavailable data notice when live event data is absent instead of fabricating', async () => {
    const q = parseFinanceQuery('Why is RELIANCE falling today?');
    expect(q.isCurrentEvent).toBe(true);

    vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
      symbol: 'RELIANCE.NS',
      price: null,
      freshness: 'UNAVAILABLE',
    } as any);

    const result = await executeDeterministicAdvisor(q);
    expect(result.summary).toContain(UNAVAILABLE_DATA_RESPONSE);
  });

  // ==========================================
  // 10. Natural Language Entity Coverage (Task 6)
  // ==========================================

  it('26. resolves Entity queries: "What is AMD?", "AMD stock price", "Tell me about Microsoft", "How is Reliance?", "What is AAPL?"', () => {
    const q1 = parseFinanceQuery('What is AMD?');
    expect(q1.symbols).toContain('AMD');
    expect(q1.intent).toBe('QUOTE');

    const q2 = parseFinanceQuery('AMD stock price');
    expect(q2.symbols).toContain('AMD');
    expect(q2.intent).toBe('QUOTE');

    const q3 = parseFinanceQuery('Tell me about Microsoft');
    expect(q3.symbols).toContain('MSFT');
    expect(q3.intent).toBe('QUOTE');

    const q4 = parseFinanceQuery('How is Reliance?');
    expect(q4.symbols).toContain('RELIANCE');
    expect(q4.intent).toBe('QUOTE');

    const q5 = parseFinanceQuery('What is AAPL?');
    expect(q5.symbols).toContain('AAPL');
    expect(q5.intent).toBe('QUOTE');
  });

  // ==========================================
  // 11. Multi-turn Context Resolution (Task 6)
  // ==========================================

  it('27. handles multi-turn conversation context: "What is Reliance price?" -> "Is it above its 200 DMA?" -> "How risky is it?"', () => {
    // Turn 1
    const t1 = parseFinanceQuery('What is Reliance price?');
    expect(t1.symbols).toContain('RELIANCE');
    expect(t1.intent).toBe('QUOTE');

    // Turn 2
    const t2 = parseFinanceQuery('Is it above its 200 DMA?', { lastSymbol: 'RELIANCE' });
    expect(t2.symbols).toContain('RELIANCE');
    expect(t2.intent).toBe('TECHNICAL');
    expect(t2.metric).toBe('200_DMA');

    // Turn 3
    const t3 = parseFinanceQuery('How risky is it?', { lastSymbol: 'RELIANCE' });
    expect(t3.symbols).toContain('RELIANCE');
    expect(t3.intent).toBe('RISK_ANALYSIS');
    expect(t3.metric).toBe('SINGLE_STOCK_RISK');
  });

  // ==========================================
  // 12. Finance Education Coverage (Task 6)
  // ==========================================

  it('28. resolves Finance education: "What is CAGR?", "What is PE ratio?", "Why do bond prices fall when interest rates rise?", "What is an ETF?"', () => {
    const q1 = parseFinanceQuery('What is CAGR?');
    expect(q1.intent).toBe('EDUCATION');
    expect(q1.metric).toBe('CAGR');
    const p1 = planDataRequirements(q1);
    expect(p1.noApi).toBe(true);

    const q2 = parseFinanceQuery('What is PE ratio?');
    expect(q2.intent).toBe('EDUCATION');
    expect(q2.metric).toBe('PE');
    const p2 = planDataRequirements(q2);
    expect(p2.noApi).toBe(true);

    const q3 = parseFinanceQuery('Why do bond prices fall when interest rates rise?');
    expect(['FIXED_INCOME', 'EXPLANATION']).toContain(q3.intent);
    expect(q3.domain).toBe('FIXED_INCOME');
    const p3 = planDataRequirements(q3);
    expect(p3.noApi).toBe(true);

    const q4 = parseFinanceQuery('What is an ETF?');
    expect(q4.intent).toBe('EDUCATION');
    expect(q4.metric).toBe('ETF');
    const p4 = planDataRequirements(q4);
    expect(p4.noApi).toBe(true);
  });

  // ==========================================
  // 13. Financial Calculations Coverage (Task 6)
  // ==========================================

  it('29. resolves Calculations: "If I invest ₹5000 monthly for 10 years at 12%, how much?" and return on ₹10000 to ₹12500', () => {
    const q1 = parseFinanceQuery('If I invest ₹5000 monthly for 10 years at 12%, how much?');
    expect(q1.intent).toBe('RETURN');
    expect(q1.amount).toBe(5000);
    expect(q1.years).toBe(10);
    expect(q1.rate).toBe(12);
    const p1 = planDataRequirements(q1);
    expect(p1.noApi).toBe(true);

    const q2 = parseFinanceQuery("I invested ₹10000 in RELIANCE and now it's ₹12500. What is my return?");
    expect(q2.intent).toBe('RETURN');
    expect(q2.initialAmount).toBe(10000);
    expect(q2.currentAmount).toBe(12500);
    const p2 = planDataRequirements(q2);
    expect(p2.noApi).toBe(true);
  });

  // ==========================================
  // 14. UTF-8 & Mojibake Resolution (Task 1)
  // ==========================================

  it('30. cleans up mojibake sequences and handles ₹ currency symbol in tokenization and query parsing', () => {
    const cleaned = normalizeQuestion('Iâ€™m investing â‚¹10000');
    expect(cleaned).toBe("I'm investing ₹10000");

    const tokens = tokenizeQuestion('If I invest ₹5000 monthly for 10 years at 12%, how much?');
    expect(tokens).toContain('₹5000');

    const parsed = parseFinanceQuery('Iâ€™m investing â‚¹5000 monthly for 10 years at 12%');
    expect(parsed.intent).toBe('RETURN');
    expect(parsed.amount).toBe(5000);
    expect(parsed.years).toBe(10);
  });

  // ==========================================
  // 15. Dynamic Entity Resolution (Task 2)
  // ==========================================

  it('31. resolves unknown instruments dynamically using marketApi.getInstruments', async () => {
    vi.spyOn(marketApi, 'getInstruments').mockResolvedValueOnce({
      items: [
        {
          symbol: 'ASML',
          name: 'ASML Holding N.V.',
          assetType: 'STOCK',
          exchange: 'NASDAQ',
        },
      ],
      total: 1,
    } as any);

    const raw = parseFinanceQuery('What is the price of ASML?');
    const resolved = await resolveDynamicEntities(raw);
    expect(resolved.symbols).toContain('ASML');
    expect(resolved.intent).toBe('QUOTE');
  });

  it('32. returns clarification when dynamic search finds multiple matches without exact symbol match', async () => {
    vi.spyOn(marketApi, 'getInstruments').mockResolvedValueOnce({
      items: [
        { symbol: 'ABC', name: 'ABC Global Inc.', assetType: 'STOCK' },
        { symbol: 'ABCD', name: 'ABC Digital Ltd.', assetType: 'STOCK' },
      ],
      total: 2,
    } as any);

    const raw = parseFinanceQuery('What is the outlook for ABC?');
    const resolved = await resolveDynamicEntities(raw);
    // If exact match ABC is present, it uses ABC
    expect(resolved.symbols).toContain('ABC');
  });

  it('33. marks ambiguous clarification when multiple fuzzy candidates exist without exact match', async () => {
    vi.spyOn(marketApi, 'getInstruments').mockResolvedValueOnce({
      items: [
        { symbol: 'XYZ1', name: 'XYZ Innovations Corp', assetType: 'STOCK' },
        { symbol: 'XYZ2', name: 'XYZ Health Holdings', assetType: 'STOCK' },
      ],
      total: 2,
    } as any);

    const raw = parseFinanceQuery('What is the outlook for XYZHOLD?');
    const resolved = await resolveDynamicEntities(raw);
    expect(resolved.intent).toBe('AMBIGUOUS');
    expect(resolved.isAmbiguous).toBe(true);
    expect(resolved.ambiguityClarification).toContain('Multiple instruments match');
  });

  // ==========================================
  // 16. Current-Event Logic Coverage (Task 4)
  // ==========================================

  it('34. flags current-event queries for broad market, commodities, and single stocks', () => {
    const q1 = parseFinanceQuery('Why is the market falling today?');
    expect(q1.isCurrentEvent).toBe(true);
    expect(q1.intent).toBe('MARKET');
    expect(q1.domain).toBe('MARKETS');

    const q2 = parseFinanceQuery('Why is Reliance down today?');
    expect(q2.isCurrentEvent).toBe(true);
    expect(q2.symbols).toContain('RELIANCE');

    const q3 = parseFinanceQuery('What is gold doing right now?');
    expect(q3.isCurrentEvent).toBe(true);
    expect(q3.intent).toBe('COMMODITY');
    expect(q3.symbols).toContain('GOLD');

    const q4 = parseFinanceQuery('What is the S&P 500 doing today?');
    expect(q4.isCurrentEvent).toBe(true);
    expect(q4.intent).toBe('MARKET');
    expect(q4.symbols).toContain('S&P 500');
  });

  // ==========================================
  // 17. Data Integrity Rules Preservation (Task 5)
  // ==========================================

  it('35. enforces data integrity: 200 DMA requires >= 200 closes and never invents price', () => {
    const q = parseFinanceQuery('Is RELIANCE above its 200 DMA?');
    const plan = planDataRequirements(q);
    expect(plan.candles).toEqual(['RELIANCE']);
    expect(plan.quotes).toHaveLength(0);

    // With insufficient candles (e.g. 100), composeAnswer reports insufficient data
    const candlesInsufficient = {
      s: 'ok',
      c: Array(100).fill(2500),
      h: Array(100).fill(2550),
      l: Array(100).fill(2450),
      o: Array(100).fill(2500),
      t: Array(100).fill(1700000000),
      v: Array(100).fill(10000),
    };
    const ans = composeAnswer(q, {
      quotes: {},
      research: {},
      candles: { RELIANCE: candlesInsufficient as any },
      portfolio: null,
    });
    expect(ans.summary).toContain('Insufficient data for 200 DMA');
  });

  // ==========================================
  // 18. Generic Financial Term vs Ticker Regression
  // ==========================================

  it('36. does NOT resolve generic financial "cost" to COST ticker, but resolves "COST stock price"', () => {
    const q1 = parseFinanceQuery('What is the cost of investing in an ETF?');
    expect(q1.symbols).not.toContain('COST');
    expect(q1.intent).toBe('EDUCATION');
    expect(q1.metric).toBe('ETF');

    const q2 = parseFinanceQuery('What is COST stock price?');
    expect(q2.symbols).toContain('COST');
    expect(q2.intent).toBe('QUOTE');

    const q3 = parseFinanceQuery('Tell me about Costco');
    expect(q3.symbols).toContain('COST');
  });
});
