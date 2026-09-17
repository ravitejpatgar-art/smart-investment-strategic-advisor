import { useState, useEffect, useCallback, useRef } from 'react';
import { marketApi, type MarketQuote } from '../services/marketApi';

export function useMarketQuotes(symbols: string[], refreshIntervalMs: number = 60000) {
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef<boolean>(false);

  const fetchQuotes = useCallback(async () => {
    if (!symbols || symbols.length === 0 || inFlightRef.current) return;
    try {
      inFlightRef.current = true;
      setIsLoading(true);
      setError(null);
      const data = await marketApi.getQuotes(symbols);
      setQuotes(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch batch quotes');
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [symbols.join(',')]);

  useEffect(() => {
    fetchQuotes();

    // Check if quotes are predominantly closed/weekend
    const firstQuote = Object.values(quotes)[0];
    const isMarketClosed = 
      firstQuote?.marketStatus === 'CLOSED' || 
      firstQuote?.marketStatus === 'WEEKEND' || 
      firstQuote?.marketStatus === 'HOLIDAY';

    if (refreshIntervalMs > 0 && !isMarketClosed) {
      const interval = setInterval(fetchQuotes, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchQuotes, refreshIntervalMs, Object.keys(quotes).length]);

  return { quotes, isLoading, error, refetch: fetchQuotes };
}
