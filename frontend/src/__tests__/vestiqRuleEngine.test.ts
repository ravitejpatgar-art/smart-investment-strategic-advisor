import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseFinanceQuery,
  calculateRoi,
  calculateCagr,
  calculateSipFutureValue,
  calculateAbsoluteReturn,
  calculateAnnualizedReturn,
  calculateMaxDrawdown,
  calculatePortfolioAllocations,
  calculatePriceChange,
  calculateMovingAverage,
  calculateRsi,
  calculateVolatility,
  getApiSymbol,
  isUsSymbol,
  isIndianSymbol,
  executeDeterministicAdvisor,
  formatRuleResultToMarkdown,
  OUT_OF_DOMAIN_RESPONSE,
  UNAVAILABLE_DATA_RESPONSE,
} from '../services/vestiqRuleEngine';
import { marketApi } from '../services/marketApi';
import { authApi } from '../services/api';

describe('VestIQ Deterministic Finance Advisor Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. RELIANCE price → QUOTE
  it('1. parses "What is RELIANCE price?" as QUOTE intent', () => {
    const q = parseFinanceQuery('What is RELIANCE price?');
    expect(q.intent).toBe('QUOTE');
    expect(q.symbols).toContain('RELIANCE');
    expect(q.domain).toBe('STOCKS');
  });

  // 2. AAPL price → QUOTE
  it('2. parses "AAPL price" as QUOTE intent with US symbol', () => {
    const q = parseFinanceQuery('AAPL price');
    expect(q.intent).toBe('QUOTE');
    expect(q.symbols).toContain('AAPL');
    expect(isUsSymbol(q.symbols[0])).toBe(true);
  });

  // 3. RELIANCE PE → FUNDAMENTALS
  it('3. parses "RELIANCE PE" as FUNDAMENTALS intent', () => {
    const q = parseFinanceQuery('RELIANCE PE');
    expect(q.intent).toBe('FUNDAMENTALS');
    expect(q.symbols).toContain('RELIANCE');
    expect(q.metric).toBe('PE');
  });

  // 4. RSI RELIANCE → TECHNICAL
  it('4. parses "RSI RELIANCE" as TECHNICAL intent', () => {
    const q = parseFinanceQuery('RSI RELIANCE');
    expect(q.intent).toBe('TECHNICAL');
    expect(q.symbols).toContain('RELIANCE');
    expect(q.metric).toBe('RSI');
  });

  // 5. Compare RELIANCE TCS → COMPARISON
  it('5. parses "Compare RELIANCE and TCS" as COMPARISON intent', () => {
    const q = parseFinanceQuery('Compare RELIANCE and TCS');
    expect(q.intent).toBe('COMPARISON');
    expect(q.symbols).toEqual(expect.arrayContaining(['RELIANCE', 'TCS']));
  });

  // 6. RELIANCE for 5 years → LONG_TERM
  it('6. parses "Is RELIANCE good for 5 years?" as LONG_TERM intent', () => {
    const q = parseFinanceQuery('Is RELIANCE good for 5 years?');
    expect(q.intent).toBe('LONG_TERM');
    expect(q.symbols).toContain('RELIANCE');
    expect(q.years).toBe(5);
  });

  // 7. CAGR → EDUCATION
  it('7. parses "What is CAGR?" as EDUCATION intent', () => {
    const q = parseFinanceQuery('What is CAGR?');
    expect(q.intent).toBe('EDUCATION');
    expect(q.metric).toBe('CAGR');
    expect(q.symbols.length).toBe(0);
  });

  // 8. ₹10000 return → RETURN
  it('8. parses "What will ₹10000 become at 12% for 5 years?" as RETURN intent', () => {
    const q = parseFinanceQuery('What will ₹10000 become at 12% for 5 years?');
    expect(q.intent).toBe('RETURN');
    expect(q.amount).toBe(10000);
    expect(q.rate).toBe(12);
    expect(q.years).toBe(5);
  });

  // 9. Portfolio allocation → PORTFOLIO
  it('9. parses "How diversified is my portfolio?" as PORTFOLIO intent', () => {
    const q = parseFinanceQuery('How diversified is my portfolio?');
    expect(q.intent).toBe('PORTFOLIO');
    expect(q.domain).toBe('PORTFOLIO');
  });

  // 10. Unknown question → UNSUPPORTED
  it('10. classifies unknown / underspecified queries as UNSUPPORTED', () => {
    const q = parseFinanceQuery('xyzzqq123 foo bar something completely random');
    expect(q.intent).toBe('UNSUPPORTED');
  });

  // 11. What is weather → OUT_OF_DOMAIN
  it('11. classifies "What is the weather?" as OUT_OF_DOMAIN', () => {
    const q = parseFinanceQuery('What is the weather today?');
    expect(q.intent).toBe('OUT_OF_DOMAIN');
    expect(q.domain).toBe('OUT_OF_DOMAIN');
  });

  // 12. What is an apple → OUT_OF_DOMAIN
  it('12. classifies "What is an apple?" as OUT_OF_DOMAIN (ambiguous non-financial)', () => {
    const q = parseFinanceQuery('What is an apple?');
    expect(q.intent).toBe('OUT_OF_DOMAIN');
    expect(q.domain).toBe('OUT_OF_DOMAIN');
  });

  // 13. Should I invest in Apple → STOCKS
  it('13. classifies "Should I invest in Apple?" as financial stock inquiry', () => {
    const q = parseFinanceQuery('Should I invest in Apple?');
    expect(q.domain).toBe('STOCKS');
    expect(q.symbols).toContain('AAPL');
    expect(q.intent).not.toBe('OUT_OF_DOMAIN');
  });

  // 14. US symbols never become .NS
  it('14. guarantees US symbols NEVER have .NS appended', () => {
    expect(getApiSymbol('AAPL')).toBe('AAPL');
    expect(getApiSymbol('MSFT')).toBe('MSFT');
    expect(getApiSymbol('GOOGL')).toBe('GOOGL');
    expect(getApiSymbol('NVDA')).toBe('NVDA');
    expect(getApiSymbol('SPY')).toBe('SPY');
    expect(isUsSymbol('AAPL')).toBe(true);
    expect(isIndianSymbol('RELIANCE')).toBe(true);
    expect(getApiSymbol('RELIANCE')).toBe('RELIANCE.NS');
  });

  // 15. ROI accuracy
  it('15. verifies ROI calculation accuracy and edge-case handling', () => {
    expect(calculateRoi(100, 150)).toBe(50);
    expect(calculateRoi(200, 180)).toBe(-10);
    expect(calculateRoi(0, 100)).toBeNull(); // rejects division by zero
    expect(calculateRoi(-50, 100)).toBeNull(); // rejects negative initial
    expect(calculateAbsoluteReturn(1000, 1250)).toBe(25);
  });

  // 16. CAGR accuracy
  it('16. verifies CAGR calculation accuracy and time validation', () => {
    // 100 to 200 in 5 years => ~14.87%
    const cagr5 = calculateCagr(100, 200, 5);
    expect(cagr5).toBe(14.87);
    // 100 to 100 in 3 years => 0%
    expect(calculateCagr(100, 100, 3)).toBe(0);
    // Invalid periods
    expect(calculateCagr(100, 200, 0)).toBeNull();
    expect(calculateCagr(100, 200, -2)).toBeNull();
    expect(calculateAnnualizedReturn(100, 200, 5)).toBe(14.87);
  });

  // 17. SIP accuracy
  it('17. verifies SIP future value calculation with monthly compounding formula', () => {
    // ₹10,000 monthly, 12% p.a., 5 years
    const sip = calculateSipFutureValue(10000, 12, 5);
    expect(sip).not.toBeNull();
    expect(sip?.totalInvested).toBe(600000);
    // Future value should be ~824,864 with standard annuity formula
    expect(sip?.futureValue).toBeGreaterThan(800000);
    expect(sip?.futureValue).toBeLessThan(850000);
    expect(sip?.wealthGain).toBe((sip?.futureValue ?? 0) - (sip?.totalInvested ?? 0));

    // Zero return check
    const zeroSip = calculateSipFutureValue(5000, 0, 2);
    expect(zeroSip?.totalInvested).toBe(120000);
    expect(zeroSip?.futureValue).toBe(120000);
    expect(zeroSip?.wealthGain).toBe(0);
  });

  // 18. Drawdown accuracy
  it('18. verifies maximum drawdown calculation accuracy', () => {
    const series = [100, 120, 150, 105, 130, 90, 140];
    // Peak is 150, trough is 90 -> ((150 - 90) / 150) * 100 = 40%
    const dd = calculateMaxDrawdown(series);
    expect(dd).not.toBeNull();
    expect(dd?.maxDrawdownPct).toBe(40);
    expect(dd?.peakIndex).toBe(2);
    expect(dd?.troughIndex).toBe(5);

    expect(calculateMaxDrawdown([100])).toBeNull();
    expect(calculateMaxDrawdown([])).toBeNull();
  });

  // 19. Allocation accuracy
  it('19. verifies portfolio allocation and concentration percentage accuracy', () => {
    const holdings = [
      { name: 'Reliance', amount: 60000, category: 'Energy' },
      { name: 'TCS', amount: 30000, category: 'IT' },
      { name: 'HDFC Bank', amount: 10000, category: 'Banking' },
    ];
    const res = calculatePortfolioAllocations(holdings);
    expect(res).not.toBeNull();
    expect(res?.total).toBe(100000);
    expect(res?.topConcentrationPct).toBe(60);
    expect(res?.allocations[0].percentage).toBe(60);
    expect(res?.allocations[1].percentage).toBe(30);
    expect(res?.allocations[2].percentage).toBe(10);

    // Verify price change, moving average, RSI, volatility pure calculations
    const pc = calculatePriceChange(3000, 2500);
    expect(pc).toEqual({ change: 500, changePct: 20 });
    expect(calculatePriceChange(100, 0)).toBeNull();

    const ma = calculateMovingAverage([10, 20, 30, 40], 3);
    expect(ma).toBe(30);
    expect(calculateMovingAverage([10], 5)).toBeNull();

    const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    expect(calculateRsi(prices, 14)).toBe(100);

    const vol = calculateVolatility([100, 102, 101, 103, 102]);
    expect(vol).toBeTypeOf('number');

    // Verify markdown renderer and message constants
    expect(OUT_OF_DOMAIN_RESPONSE).toContain('VestIQ');
    expect(UNAVAILABLE_DATA_RESPONSE).toContain('verified data');
    const md = formatRuleResultToMarkdown({
      query: parseFinanceQuery('RELIANCE price'),
      title: 'Reliance Industries',
      summary: 'Current price is ₹2980',
      sections: [{ heading: 'Details', items: ['Current price: ₹2980'] }],
      source: 'NSE Live',
      timestamp: 'Today',
      freshness: 'REALTIME',
    });
    expect(md).toContain('### Reliance Industries');
    expect(md).toContain('**Source:** NSE Live');
  });

  // 20. Historical data never labelled REALTIME
  it('20. ensures historical candle and delayed data preserve their authentic freshness label', async () => {
    vi.spyOn(marketApi, 'getCandles').mockResolvedValueOnce({
      symbol: 'RELIANCE.NS',
      range: '1y',
      interval: '1d',
      source: 'NSE Historical Feed',
      freshness: 'HISTORICAL',
      status: 'FALLBACK',
      observations: Array(50).fill(0).map((_, i) => ({
        date: `2026-01-${i + 1}`,
        open: 2800 + i,
        high: 2850 + i,
        low: 2790 + i,
        close: 2820 + i,
        volume: 100000,
      })),
    });

    const parsed = parseFinanceQuery('RSI of RELIANCE');
    const result = await executeDeterministicAdvisor(parsed);

    expect(result.freshness).toBe('HISTORICAL');
    expect(result.freshness).not.toBe('REALTIME');
    expect(result.sections.some(s => s.items.some(it => it.includes('HISTORICAL')))).toBe(true);
  });

  // 21. Missing data never guessed
  it('21. produces transparent unavailable notice when required data is missing', async () => {
    vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      exchange: 'NSE',
      assetType: 'STOCK',
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
    });

    const parsed = parseFinanceQuery('What is RELIANCE price?');
    const result = await executeDeterministicAdvisor(parsed);

    expect(result.summary).toContain("Current market quote for RELIANCE is currently unavailable.");
    expect(result.metrics).toBeUndefined();
  });

  // 22. Brent/OMC event question never fabricates a conclusion
  it('22. never invents an answer or buy/avoid decision for Brent crude / OMC event query', async () => {
    const q = parseFinanceQuery('Brent crude hits $95 a barrel. Buy OMC stocks now or avoid?');
    expect(q.intent).toBe('MARKET');

    const result = await executeDeterministicAdvisor(q);
    expect(result.summary).toContain("I don't have enough verified data to answer this question reliably.");
    expect(result.summary).not.toContain("Buy");
    expect(result.summary).not.toContain("Avoid");
  });

  // 23. Current query remains associated with current result
  it('23. maintains strict association between original submitted query and result structure', async () => {
    const raw = 'What is TCS PE?';
    const parsed = parseFinanceQuery(raw);
    expect(parsed.originalQuery).toBe(raw);

    vi.spyOn(marketApi, 'getResearch').mockResolvedValueOnce({
      fundamentals: {
        symbol: 'TCS.NS',
        peRatio: 31.4,
        pbRatio: 12.8,
        roe: 48.2,
        roce: 59.0,
        debtToEquity: 0.05,
        freshness: 'LATEST_AVAILABLE',
      },
    });

    const result = await executeDeterministicAdvisor(parsed);
    expect(result.query.originalQuery).toBe(raw);
    expect(result.title).toBe('TCS Fundamentals');
    expect(result.metrics?.peRatio).toBe(31.4);
  });

  // 24. Only required API method is called for each intent
  it('24. executes only the strictly required API method for QUOTE without extraneous calls', async () => {
    const quoteSpy = vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
      symbol: 'INFY.NS',
      name: 'Infosys Limited',
      exchange: 'NSE',
      assetType: 'STOCK',
      price: 1850.0,
      currency: 'INR',
      change: 15.0,
      changePct: 0.82,
      volume: 2000000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'REALTIME',
      source: 'NSE Live Feed',
      asOf: 'Today',
    });

    const candlesSpy = vi.spyOn(marketApi, 'getCandles');
    const researchSpy = vi.spyOn(marketApi, 'getResearch');
    const portfolioSpy = vi.spyOn(authApi, 'getPortfolio');

    const parsed = parseFinanceQuery('INFY price');
    await executeDeterministicAdvisor(parsed);

    expect(quoteSpy).toHaveBeenCalledTimes(1);
    expect(candlesSpy).not.toHaveBeenCalled();
    expect(researchSpy).not.toHaveBeenCalled();
    expect(portfolioSpy).not.toHaveBeenCalled();
  });

  // 25. 200 DMA requires >=200 observations
  it('25. strictly requires >= 200 observations for 200 DMA and never labels shorter averages as 200 DMA', async () => {
    // Math function verification
    const arr199 = Array(199).fill(100);
    expect(calculateMovingAverage(arr199, 200)).toBeNull();
    const arr200 = Array(200).fill(100);
    expect(calculateMovingAverage(arr200, 200)).toBe(100);

    // Advisory engine verification with 100 observations
    vi.spyOn(marketApi, 'getCandles').mockResolvedValueOnce({
      symbol: 'RELIANCE.NS',
      range: '1y',
      interval: '1d',
      freshness: 'HISTORICAL',
      observations: Array(100).fill(0).map((_, i) => ({
        date: `2025-01-${i + 1}`,
        open: 2500,
        high: 2550,
        low: 2490,
        close: 2500,
        volume: 50000,
      })),
    });

    const parsed = parseFinanceQuery('200 DMA of RELIANCE');
    const result = await executeDeterministicAdvisor(parsed);

    expect(result.summary).toBe('Insufficient data for 200 DMA.');
    expect(result.metrics?.sma200).toBeNull();
    expect(result.sections[0].items.some(it => it.includes('requires at least 200 daily close observations'))).toBe(true);

    // Advisory engine verification with 205 observations
    vi.spyOn(marketApi, 'getCandles').mockResolvedValueOnce({
      symbol: 'RELIANCE.NS',
      range: '1y',
      interval: '1d',
      freshness: 'HISTORICAL',
      observations: Array(205).fill(0).map((_, i) => ({
        date: `2025-01-${i + 1}`,
        open: 2500,
        high: 2550,
        low: 2490,
        close: 2500,
        volume: 50000,
      })),
    });

    const parsedValid = parseFinanceQuery('200 DMA of RELIANCE');
    const resultValid = await executeDeterministicAdvisor(parsedValid);

    expect(resultValid.metrics?.sma200).toBe(2500);
    expect(resultValid.summary).not.toContain('Insufficient data for 200 DMA.');
  });

  // 26. Missing change is not 0
  it('26. never converts missing percentage or price change to 0 or 0%', async () => {
    vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
      symbol: 'TCS.NS',
      name: 'Tata Consultancy Services',
      exchange: 'NSE',
      assetType: 'STOCK',
      price: 3900.0,
      currency: 'INR',
      change: null,
      changePct: null,
      volume: 120000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'REALTIME',
      source: 'NSE Live',
      asOf: 'Today',
    });

    const parsed = parseFinanceQuery('TCS price');
    const result = await executeDeterministicAdvisor(parsed);

    expect(result.metrics?.change).toBeNull();
    expect(result.metrics?.changePct).toBeNull();
    expect(result.metrics?.change).not.toBe(0);
    expect(result.metrics?.changePct).not.toBe(0);

    const changeItem = result.sections[0].items.find(it => it.includes('Day Change'));
    expect(changeItem).toBeDefined();
    expect(changeItem).toContain('Unavailable');
    expect(changeItem).not.toContain('0.00%');
    expect(changeItem).not.toContain('+0');
  });

  // 27. Missing exchange is not NSE
  it('27. never defaults missing exchange to NSE', async () => {
    vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      exchange: undefined as any,
      assetType: 'STOCK',
      price: 2800.0,
      currency: 'INR',
      change: 10.0,
      changePct: 0.35,
      volume: 5000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      freshness: 'REALTIME',
      source: 'Market Feed',
      asOf: 'Today',
    });

    const parsed = parseFinanceQuery('RELIANCE price');
    const result = await executeDeterministicAdvisor(parsed);

    const exchangeItem = result.sections[0].items.find(it => it.includes('Exchange'));
    expect(exchangeItem).toBeDefined();
    expect(exchangeItem).toContain('Unavailable');
    expect(exchangeItem).not.toContain('NSE');
  });

  // 28. Missing SIP rate/year is handled explicitly
  it('28. explicitly declares illustrative assumptions and disclaims guaranteed returns when SIP inputs are missing', async () => {
    // User specifies amount only, omitting years and rate
    const parsed = parseFinanceQuery('Calculate SIP of ₹5000');
    expect(parsed.amount).toBe(5000);
    expect(parsed.years).toBeUndefined();
    expect(parsed.rate).toBeUndefined();

    const result = await executeDeterministicAdvisor(parsed);

    expect(result.warnings).toBeDefined();
    expect(result.warnings?.some(w => w.includes('duration not provided'))).toBe(true);
    expect(result.warnings?.some(w => w.includes('Return rate not provided'))).toBe(true);

    const assumptionsSec = result.sections.find(s => s.heading.includes('Stated Assumptions'));
    expect(assumptionsSec).toBeDefined();
    expect(assumptionsSec?.items.some(it => it.includes('hypothetical mathematical assumption'))).toBe(true);

    const complianceSec = result.sections.find(s => s.heading.includes('Compliance'));
    expect(complianceSec).toBeDefined();
    expect(complianceSec?.items.some(it => it.includes('NOT represent verified, expected, or guaranteed'))).toBe(true);

    expect(result.calculations?.assumedInputs).toEqual({
      amount: false,
      years: true,
      rate: true,
    });
  });

  // 29. Portfolio freshness is not falsely REALTIME
  it('29. does not mark portfolio ledger data as REALTIME unless explicitly reported as live', async () => {
    // Non-realtime / historical ledger data
    vi.spyOn(authApi, 'getPortfolio').mockResolvedValueOnce({
      holdings: [
        { name: 'HDFC Bank', amount: 50000, category: 'Equity' },
        { name: 'ICICI Bank', amount: 30000, category: 'Equity' },
      ],
      freshness: 'DELAYED',
      status: 'RECORDED',
    });

    const parsed = parseFinanceQuery('my portfolio allocation');
    const result = await executeDeterministicAdvisor(parsed);

    expect(result.freshness).toBe('DELAYED');
    expect(result.freshness).not.toBe('REALTIME');

    // Live portfolio state
    vi.spyOn(authApi, 'getPortfolio').mockResolvedValueOnce({
      holdings: [
        { name: 'HDFC Bank', amount: 50000, category: 'Equity' },
      ],
      freshness: 'REALTIME',
      status: 'LIVE',
    });

    const resultLive = await executeDeterministicAdvisor(parsed);
    expect(resultLive.freshness).toBe('REALTIME');
  });

  // 30. RISK can be insufficient independently
  it('30. evaluates RISK independently and marks it insufficient without substituting financial health', async () => {
    vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      exchange: 'NSE',
      assetType: 'STOCK',
      price: 2900.0,
      currency: 'INR',
      change: 10,
      changePct: 0.35,
      volume: 10000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      source: 'NSE Live',
      asOf: 'Today',
      freshness: 'REALTIME',
    } as any);

    // Fundamentals available (debt to equity healthy), but NO risk metric and < 20 candles
    vi.spyOn(marketApi, 'getResearch').mockResolvedValueOnce({
      fundamentals: {
        symbol: 'RELIANCE.NS',
        debtToEquity: 0.35,
        peRatio: 24.5,
        roe: 16.8,
        revenueGrowth: 12.0,
      },
      risk: undefined,
    });

    vi.spyOn(marketApi, 'getCandles').mockResolvedValueOnce({
      symbol: 'RELIANCE.NS',
      range: '1y',
      interval: '1d',
      freshness: 'HISTORICAL',
      observations: Array(10).fill(0).map((_, i) => ({
        date: `2026-01-${i + 1}`,
        open: 2900,
        high: 2910,
        low: 2890,
        close: 2900,
        volume: 1000,
      })),
    } as any);

    const parsed = parseFinanceQuery('Is RELIANCE good for 5 years?');
    const result = await executeDeterministicAdvisor(parsed);

    // Inspect factors in sections
    const factorsSection = result.sections.find(s => s.heading.includes('Evidence'));
    expect(factorsSection).toBeDefined();

    // Risk should be insufficient independently
    const riskBullet = factorsSection?.items.find(it => it.includes('Risk Assessment') || it.includes('Beta') || it.includes('Volatility'));
    expect(riskBullet).toBeDefined();
    expect(riskBullet).toContain('INSUFFICIENT_DATA');

    // Financial health should be positive
    const healthBullet = factorsSection?.items.find(it => it.includes('Debt-to-Equity'));
    expect(healthBullet).toBeDefined();
    expect(healthBullet).toContain('POSITIVE');

    // Ensure language does NOT claim "margin of safety" or "institutional support"
    const fullText = JSON.stringify(result);
    expect(fullText).not.toContain('margin of safety');
    expect(fullText).not.toContain('institutional support');
  });

  // 31. No fabricated numeric output
  it('31. guarantees that all numeric metrics are strictly from API data or deterministic math with no fabricated values', async () => {
    vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
      symbol: 'INFY.NS',
      name: 'Infosys Limited',
      exchange: 'NSE',
      assetType: 'STOCK',
      price: 1750.25,
      currency: 'INR',
      change: 12.5,
      changePct: 0.72,
      open: 1740.0,
      high: 1760.0,
      low: 1735.0,
      prevClose: 1737.75,
      volume: 3500000,
      timestamp: new Date().toISOString(),
      marketStatus: 'OPEN',
      source: 'NSE Live',
      asOf: 'Today',
      freshness: 'REALTIME',
    } as any);

    const parsed = parseFinanceQuery('What is INFY price?');
    const result = await executeDeterministicAdvisor(parsed);

    expect(result.metrics?.price).toBe(1750.25);
    expect(result.metrics?.change).toBe(12.5);
    expect(result.metrics?.changePct).toBe(0.72);
    expect(result.metrics?.open).toBe(1740.0);
    expect(result.metrics?.high).toBe(1760.0);
    expect(result.metrics?.low).toBe(1735.0);
    expect(result.metrics?.prevClose).toBe(1737.75);
  });
});
