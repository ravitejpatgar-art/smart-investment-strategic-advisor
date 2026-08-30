import { useState, useEffect, useCallback, useRef } from 'react';
import { marketApi, type MarketCandlesResponse } from '../services/marketApi';

export type MarketCandleErrorType = 'BACKEND_OFFLINE' | 'PROVIDER_UNAVAILABLE' | 'UNKNOWN_INSTRUMENT' | null;

export function useMarketCandles(symbol: string, range: string = '3y', interval: string = '1d') {
  const [candles, setCandles] = useState<MarketCandlesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<MarketCandleErrorType>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchCandles = useCallback(async () => {
    if (!symbol) return;
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      setErrorType(null);

      const data = await marketApi.getCandles(symbol, range, interval);

      // Development Diagnostic Logging (Requirement 14)
      if (import.meta.env.DEV) {
        const obs = data?.observations || [];
        console.log('[MarketCandles Diagnostic]', {
          requestedSymbol: symbol,
          resolvedSymbol: data?.symbol,
          provider: data?.source,
          range,
          interval,
          freshness: data?.freshness,
          observationCount: obs.length,
          firstObservation: obs.length > 0 ? obs[0] : null,
          lastObservation: obs.length > 0 ? obs[obs.length - 1] : null,
          message: data?.message
        });
      }
      
      if (data.freshness === 'UNAVAILABLE' || !data.observations || data.observations.length === 0) {
        const msg = data.message || '';
        if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('unknown')) {
          setError('Historical data is unavailable for this instrument.');
          setErrorType('UNKNOWN_INSTRUMENT');
        } else {
          setError('Historical market data is temporarily unavailable.');
          setErrorType('PROVIDER_UNAVAILABLE');
        }
      } else {
        setError(null);
        setErrorType(null);
      }
      setCandles(data);
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.warn('[MarketCandles Error Diagnostic]', {
          requestedSymbol: symbol,
          range,
          interval,
          status: err?.response?.status,
          error: err?.message || err
        });
      }

      if (!err?.response || err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
        setError('Unable to connect to SmartVest market data service.');
        setErrorType('BACKEND_OFFLINE');
      } else if (err?.response?.status === 404) {
        setError('Historical data is unavailable for this instrument.');
        setErrorType('UNKNOWN_INSTRUMENT');
      } else {
        setError(err?.response?.data?.detail || err?.message || 'Historical market data is temporarily unavailable.');
        setErrorType('PROVIDER_UNAVAILABLE');
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [symbol, range, interval]);

  useEffect(() => {
    fetchCandles();
  }, [fetchCandles]);

  return { candles, isLoading, error, errorType, refetch: fetchCandles };
}
