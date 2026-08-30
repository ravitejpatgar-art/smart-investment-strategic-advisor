import { useState, useEffect, useCallback } from 'react';
import { marketApi, type MarketStatusResponse } from '../services/marketApi';

export function useMarketStatus(market: string = 'NSE', refreshIntervalMs: number = 60000) {
  const [status, setStatus] = useState<MarketStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await marketApi.getStatus(market);
      setStatus(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch market status');
    } finally {
      setIsLoading(false);
    }
  }, [market]);

  useEffect(() => {
    fetchStatus();
    if (refreshIntervalMs > 0) {
      const interval = setInterval(fetchStatus, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, refreshIntervalMs]);

  return { status, isLoading, error, refetch: fetchStatus };
}
