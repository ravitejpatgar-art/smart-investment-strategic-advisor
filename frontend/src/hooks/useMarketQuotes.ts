import { useState, useEffect, useCallback } from 'react';
import { marketApi, type MarketQuote } from '../services/marketApi';

export function useMarketQuotes(symbols: string[], refreshIntervalMs: number = 60000) {
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    if (!symbols || symbols.length === 0) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await marketApi.getQuotes(symbols);
      setQuotes(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch batch quotes');
    } finally {
      setIsLoading(false);
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchQuotes();
    if (refreshIntervalMs > 0) {
      const interval = setInterval(fetchQuotes, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchQuotes, refreshIntervalMs]);

  return { quotes, isLoading, error, refetch: fetchQuotes };
}
