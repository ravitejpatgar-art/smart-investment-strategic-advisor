import { useState, useEffect, useCallback, useRef } from 'react';
import { marketApi, type MarketQuote } from '../services/marketApi';

export function useMarketQuote(symbol: string, refreshIntervalMs: number = 30000) {
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef<boolean>(false);

  const fetchQuote = useCallback(async () => {
    if (!symbol || inFlightRef.current) return;
    try {
      inFlightRef.current = true;
      setIsLoading(true);
      setError(null);
      const data = await marketApi.getQuote(symbol);
      setQuote(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch quote');
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [symbol]);

  useEffect(() => {
    fetchQuote();

    // Do not continuously poll if market session is closed, weekend, or holiday
    const isMarketClosed = 
      quote?.marketStatus === 'CLOSED' || 
      quote?.marketStatus === 'WEEKEND' || 
      quote?.marketStatus === 'HOLIDAY' ||
      quote?.marketStatus === 'PUBLISHED';

    if (refreshIntervalMs > 0 && !isMarketClosed) {
      const interval = setInterval(fetchQuote, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchQuote, refreshIntervalMs, quote?.marketStatus]);

  return { quote, isLoading, error, refetch: fetchQuote };
}
