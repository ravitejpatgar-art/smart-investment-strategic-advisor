import { describe, it, expect } from 'vitest';
import { formatIstTimestamp, normalizeMarketQuote } from '../services/marketApi';

describe('Indian Market Timestamp Conversion & IST Formatting', () => {
  it('converts 2026-09-18T10:28:33Z to 18 Sep 2026, 03:58:33 PM IST', () => {
    const input = '2026-09-18T10:28:33Z';
    const result = formatIstTimestamp(input);
    expect(result).toBe('18 Sep 2026, 03:58:33 PM IST');
  });

  it('converts 2026-09-18T09:59:59Z to 18 Sep 2026, 03:29:59 PM IST', () => {
    const input = '2026-09-18T09:59:59Z';
    const result = formatIstTimestamp(input);
    expect(result).toBe('18 Sep 2026, 03:29:59 PM IST');
  });

  it('converts 2026-09-18T00:00:00Z to 18 Sep 2026, 05:30:00 AM IST', () => {
    const input = '2026-09-18T00:00:00Z';
    const result = formatIstTimestamp(input);
    expect(result).toBe('18 Sep 2026, 05:30:00 AM IST');
  });

  it('normalizes quote preserving exchangeTimestampUtc and producing displayTimestampIst', () => {
    const rawQuote = {
      price: 1226.4,
      change: -17.5,
      changePct: -1.41,
      exchangeTimestampUtc: '2026-09-18T10:28:33Z',
      marketStatus: 'CLOSED'
    };

    const normalized = normalizeMarketQuote(rawQuote, 'RELIANCE');
    expect(normalized.exchangeTimestampUtc).toBe('2026-09-18T10:28:33Z');
    expect(normalized.displayTimestampIst).toBe('18 Sep 2026, 03:58:33 PM IST');
    expect(normalized.asOf).toBe('18 Sep 2026, 03:58:33 PM IST');
  });
});
