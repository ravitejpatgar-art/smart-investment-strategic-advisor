import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseFinanceQuery,
  planDataRequirements,
  executeDeterministicAdvisor,
  formatRuleResultToMarkdown,
} from '../services/vestiqRuleEngine';
import { marketApi } from '../services/marketApi';
import { authApi } from '../services/api';

describe('VestIQ Assistant Routing & Deployment Behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Static Finance Questions (Zero Backend Dependency)', () => {
    const staticQueries = [
      { q: 'What is an IPO?', expectedKey: 'Initial Public Offering' },
      { q: 'What is EPS?', expectedKey: 'Earnings Per Share' },
      { q: 'Explain EPS', expectedKey: 'Earnings Per Share' },
      { q: 'What is an ETF?', expectedKey: 'Exchange Traded Fund' },
      { q: 'What is P/E ratio?', expectedKey: 'P/E' },
      { q: 'What is NAV?', expectedKey: 'Net Asset Value' },
      { q: 'What is a demat account?', expectedKey: 'Demat' },
      { q: 'How does compounding work?', expectedKey: 'Compounding' },
      { q: 'Why do bond prices fall when interest rates rise?', expectedKey: 'Bond' },
      { q: 'ETF vs mutual fund', expectedKey: 'ETF' },
      { q: 'SIP vs lumpsum', expectedKey: 'SIP' },
      { q: 'Why does inflation affect investments?', expectedKey: 'Inflation' },
      { q: 'What is diversification?', expectedKey: 'Diversification' },
    ];

    for (const { q, expectedKey } of staticQueries) {
      it(`resolves "${q}" locally with plan.noApi = true and zero backend calls`, async () => {
        const getQuoteSpy = vi.spyOn(marketApi, 'getQuote');
        const getInstrumentsSpy = vi.spyOn(marketApi, 'getInstruments');
        const getPortfolioSpy = vi.spyOn(authApi, 'getPortfolio');

        const parsed = parseFinanceQuery(q);
        const plan = planDataRequirements(parsed);
        expect(plan.noApi).toBe(true);

        const result = await executeDeterministicAdvisor(parsed);
        const markdown = formatRuleResultToMarkdown(result);

        // Verification: Zero network/API calls executed
        expect(getQuoteSpy).not.toHaveBeenCalled();
        expect(getInstrumentsSpy).not.toHaveBeenCalled();
        expect(getPortfolioSpy).not.toHaveBeenCalled();

        // Verification: Deterministic answer content
        expect(markdown.toLowerCase()).toContain(expectedKey.toLowerCase());
        expect(result.freshness).toBe('STATIC_KNOWLEDGE');
      });
    }
  });

  describe('2. Random Finance Questions (Conceptual Matching)', () => {
    it('handles "Why do company profits matter to investors?" without exact matching', async () => {
      const getQuoteSpy = vi.spyOn(marketApi, 'getQuote');
      const parsed = parseFinanceQuery('Why do company profits matter to investors?');
      const plan = planDataRequirements(parsed);
      expect(plan.noApi).toBe(true);

      const result = await executeDeterministicAdvisor(parsed);
      const md = formatRuleResultToMarkdown(result);

      expect(getQuoteSpy).not.toHaveBeenCalled();
      expect(md.toLowerCase()).toMatch(/profit|earnings/);
      expect(result.directAnswer || result.summary).toBeTruthy();
    });

    it('handles "Why would someone choose an ETF?" and explains why it matters', async () => {
      const parsed = parseFinanceQuery('Why would someone choose an ETF?');
      const plan = planDataRequirements(parsed);
      expect(plan.noApi).toBe(true);

      const result = await executeDeterministicAdvisor(parsed);
      const md = formatRuleResultToMarkdown(result);

      expect(result.query.conceptAspect).toBe('whyItMatters');
      expect(md.toLowerCase()).toContain('expense ratio');
      expect(md.toLowerCase()).toContain('liquidity');
    });

    it('handles "What happens when interest rates rise?" deterministically', async () => {
      const parsed = parseFinanceQuery('What happens when interest rates rise?');
      const plan = planDataRequirements(parsed);
      expect(plan.noApi).toBe(true);

      const result = await executeDeterministicAdvisor(parsed);
      const md = formatRuleResultToMarkdown(result);

      expect(md.toLowerCase()).toMatch(/interest rate|bond|borrowing|coupon/);
    });

    it('handles "Why is diversification important?" as educational concept, not personal portfolio', async () => {
      const getPortfolioSpy = vi.spyOn(authApi, 'getPortfolio');
      const parsed = parseFinanceQuery('Why is diversification important?');
      const plan = planDataRequirements(parsed);
      expect(plan.noApi).toBe(true);

      const result = await executeDeterministicAdvisor(parsed);
      const md = formatRuleResultToMarkdown(result);

      expect(getPortfolioSpy).not.toHaveBeenCalled();
      expect(result.query.conceptId).toBe('DIVERSIFICATION');
      expect(md.toLowerCase()).toContain('unsystematic');
    });

    it('handles "Why does diversification matter?" deterministically', async () => {
      const parsed = parseFinanceQuery('Why does diversification matter?');
      const plan = planDataRequirements(parsed);
      expect(plan.noApi).toBe(true);

      const result = await executeDeterministicAdvisor(parsed);
      expect(result.query.conceptId).toBe('DIVERSIFICATION');
      expect(result.query.conceptAspect).toBe('whyItMatters');
    });
  });

  describe('3. Unknown Finance Concept (Partial Decomposition & Explicit Boundaries)', () => {
    it('decomposes recognized finance terms for an unknown concept without inventing facts', async () => {
      const query = 'How does a debt-service coverage ratio impact mezzanine financing and leverage?';
      const parsed = parseFinanceQuery(query);
      const plan = planDataRequirements(parsed);
      expect(plan.noApi).toBe(true);

      const result = await executeDeterministicAdvisor(parsed);
      const md = formatRuleResultToMarkdown(result);

      // Must not be the generic unavailable response
      expect(result.directAnswer).not.toBe("I don't have enough verified data to answer this question reliably.");

      // Must identify recognized terms
      expect(parsed.isPartialFinance).toBe(true);
      expect(parsed.partialFinanceTerms && parsed.partialFinanceTerms.length).toBeGreaterThan(0);

      // Must explicitly declare unverified boundary and avoid fabricating facts
      expect(md.toLowerCase()).toContain('unverified');
      expect(md.toLowerCase()).toContain('fiduciary principle');
    });
  });

  describe('4. Live Market Questions (Requires Live Data & Transparent Unavailability)', () => {
    it('queries live quote for "What is RELIANCE price?" and uses marketApi pipeline', async () => {
      vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
        symbol: 'RELIANCE.NS',
        name: 'Reliance Industries Limited',
        price: 2950.5,
        change: 15.2,
        changePct: 0.52,
        open: 2940,
        high: 2965,
        low: 2935,
        prevClose: 2935.3,
        volume: 5000000,
        source: 'NSE Realtime Feed',
        freshness: 'REALTIME',
        assetType: 'EQUITY',
        status: 'LIVE',
      } as any);

      const parsed = parseFinanceQuery('What is RELIANCE price?');
      const plan = planDataRequirements(parsed);
      expect(plan.noApi).toBe(false);
      expect(plan.quotes).toContain('RELIANCE');

      const result = await executeDeterministicAdvisor(parsed);
      const md = formatRuleResultToMarkdown(result);

      expect(md).toContain('₹2,950.5');
      expect(md).toContain('NSE Realtime Feed');
    });

    it('returns transparent unavailable response if live quote is unavailable (never fabricates price)', async () => {
      vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
        symbol: 'AAPL',
        price: null,
        change: null,
        changePct: null,
        source: 'Market Feed',
        freshness: 'UNAVAILABLE',
        status: 'UNAVAILABLE',
      } as any);

      const parsed = parseFinanceQuery('What is AAPL price?');
      const result = await executeDeterministicAdvisor(parsed);
      const md = formatRuleResultToMarkdown(result);

      expect(md).toContain("I don't have enough verified data to answer this question reliably");
      expect(md).toContain('unavailable');
      // Must not fabricate a price
      expect(md).not.toContain('$');
    });

    it('handles commodity question "What is gold doing right now?"', async () => {
      vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
        symbol: 'GOLD',
        name: 'Gold spot',
        price: 72000,
        change: 250,
        changePct: 0.35,
        source: 'Commodity Feed',
        freshness: 'REALTIME',
        status: 'LIVE',
      } as any);

      const parsed = parseFinanceQuery('What is gold doing right now?');
      const plan = planDataRequirements(parsed);
      expect(plan.noApi).toBe(false);
      expect(plan.quotes).toContain('GOLD');

      const result = await executeDeterministicAdvisor(parsed);
      expect(result.metrics?.price).toBe(72000);
    });
  });

  describe('5. Backend & History Failure Simulation', () => {
    it('serves static finance answers even when backend conversations API throws connection refused', async () => {
      vi.spyOn(authApi, 'getConversations').mockRejectedValueOnce(new Error('Connection refused'));
      vi.spyOn(authApi, 'createConversation').mockRejectedValueOnce(new Error('Connection refused'));

      // Static finance inquiry
      const parsed = parseFinanceQuery('What is an IPO?');
      expect(planDataRequirements(parsed).noApi).toBe(true);

      const result = await executeDeterministicAdvisor(parsed);
      const md = formatRuleResultToMarkdown(result);

      expect(md).toContain('Initial Public Offering');
      // Never a generic onboarding response
      expect(md.toLowerCase()).not.toContain('monthly surplus');
      expect(md.toLowerCase()).not.toContain('risk mandate');
    });

    it('returns transparent unavailable response for live data when market backend is unreachable', async () => {
      vi.spyOn(marketApi, 'getQuote').mockRejectedValueOnce(new Error('Market backend down'));

      const parsed = parseFinanceQuery('What is RELIANCE price?');
      const result = await executeDeterministicAdvisor(parsed);
      const md = formatRuleResultToMarkdown(result);

      expect(md).toContain("I don't have enough verified data to answer this question reliably");
      expect(md.toLowerCase()).not.toContain('monthly surplus');
    });
  });

  describe('6. Hybrid VestIQ canAnswerCompletely Routing Contract', () => {
    it('deterministic concept sets canAnswerCompletely = true', async () => {
      const parsed = parseFinanceQuery('What is an IPO?');
      const result = await executeDeterministicAdvisor(parsed);
      expect(result.canAnswerCompletely).toBe(true);
      expect(result.directAnswer).toContain('Initial Public Offering');
    });

    it('deterministic calculation sets canAnswerCompletely = true', async () => {
      const parsed = parseFinanceQuery('Calculate SIP of ₹5000 for 10 years at 12%');
      const result = await executeDeterministicAdvisor(parsed);
      expect(result.canAnswerCompletely).toBe(true);
      expect(result.calculations).toBeDefined();
    });

    it('live-data query with verified market data sets canAnswerCompletely = true', async () => {
      vi.spyOn(marketApi, 'getQuote').mockResolvedValueOnce({
        symbol: 'RELIANCE.NS',
        name: 'Reliance Industries Limited',
        price: 2950.5,
        change: 15.2,
        changePct: 0.52,
        source: 'NSE Realtime Feed',
        freshness: 'REALTIME',
        assetType: 'EQUITY',
        status: 'LIVE',
      } as any);

      const parsed = parseFinanceQuery('What is RELIANCE price?');
      const result = await executeDeterministicAdvisor(parsed);
      expect(result.canAnswerCompletely).toBe(true);
      expect(result.metrics?.price).toBe(2950.5);
    });

    it('open-ended / unrecognized synthesis sets canAnswerCompletely = false for backend delegation', async () => {
      const parsed = parseFinanceQuery('How does a debt-service coverage ratio impact mezzanine financing and leverage?');
      const result = await executeDeterministicAdvisor(parsed);
      expect(result.canAnswerCompletely).toBe(false);
    });

    it('static finance question works immediately without backend connection', async () => {
      // Both authApi and marketApi fail
      vi.spyOn(authApi, 'getConversations').mockRejectedValue(new Error('Network offline'));
      vi.spyOn(marketApi, 'getQuote').mockRejectedValue(new Error('Network offline'));

      const parsed = parseFinanceQuery('What is P/E ratio?');
      const result = await executeDeterministicAdvisor(parsed);
      expect(result.canAnswerCompletely).toBe(true);
      const md = formatRuleResultToMarkdown(result);
      expect(md.toLowerCase()).toContain('price-to-earnings');
    });
  });
});
