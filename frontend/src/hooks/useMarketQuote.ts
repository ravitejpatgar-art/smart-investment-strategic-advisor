import { useState, useEffect, useCallback } from 'react';
import { marketApi, type MarketQuote } from '../services/marketApi';

export function useMarketQuote(symbol: string, refreshIntervalMs: number = 30000) {
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!symbol) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await marketApi.getQuote(symbol);
      setQuote(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch quote');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchQuote();
    if (refreshIntervalMs > 0) {
      const interval = setInterval(fetchQuote, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchQuote, refreshIntervalMs]);

  return { quote, isLoading, error, refetch: fetchQuote };
}
