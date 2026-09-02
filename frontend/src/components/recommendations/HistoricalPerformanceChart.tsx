import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';
import { useMarketCandles } from '../../hooks/useMarketCandles';

export interface HistoricalPerformanceChartProps {
  symbol: string;
  assetName?: string;
  assetType?: string;
  category?: string;
  color?: string;
  currency?: string;
  currentPrice?: number | null;
  className?: string;
}

type TimeframeOption = '1Y' | '3Y' | '5Y';

// Custom Tooltip component for Recharts
const CustomChartTooltip = ({ 
  active, 
  payload, 
  label, 
  currency = '₹', 
  isMutualFund = false,
  startValue = null
}: any) => {
  if (!active || !payload || !payload.length) return null;

  const val = Number(payload[0].value);
  const changeFromStart = startValue && startValue > 0 ? (((val - startValue) / startValue) * 100) : null;

  let formattedDate = label;
  try {
    const dt = new Date(label);
    if (!isNaN(dt.getTime())) {
      formattedDate = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch {
    formattedDate = label;
  }

  return (
    <div className="bg-white dark:bg-[#101827] border border-slate-200 dark:border-white/[0.1] rounded-xl p-2.5 shadow-xl space-y-1 text-xs pointer-events-none min-w-[140px]">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-[#8A94A6] border-b border-slate-100 dark:border-white/[0.06] pb-1 flex items-center justify-between">
        <span>{formattedDate}</span>
        <span className="text-[10px] uppercase px-1 py-0.2 rounded bg-slate-100 dark:bg-[#0A1022] text-[#0D9488] dark:text-[#00D4AA] font-bold border border-slate-200 dark:border-white/[0.08]">
          {isMutualFund ? 'NAV' : 'Close'}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3 pt-0.5">
        <span className="text-slate-500 dark:text-[#8A94A6] font-medium text-xs">{isMutualFund ? 'NAV:' : 'Price:'}</span>
        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
          {currency}{val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      {changeFromStart !== null && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8A94A6] pt-0.5">
          <span>Return:</span>
          <span className={`font-mono font-bold ${changeFromStart >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
            {changeFromStart >= 0 ? '+' : ''}{changeFromStart.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
};

export const HistoricalPerformanceChart: React.FC<HistoricalPerformanceChartProps> = ({
  symbol,
  assetType = 'EQUITY',
  category,
  color = '#00D4AA',
  currency = '₹',
  className = ''
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('3Y');

  const rangeParam = useMemo(() => {
    switch (timeframe) {
      case '1Y': return '1y';
      case '3Y': return '3y';
      case '5Y': return '5y';
      default: return '3y';
    }
  }, [timeframe]);

  const isMutualFund = assetType === 'MUTUAL_FUND' || (category && category.toLowerCase().includes('mutual fund')) || false;
  const { candles, isLoading, error, refetch } = useMarketCandles(symbol, rangeParam, '1d');

  const chartData = useMemo(() => {
    if (!candles || !candles.observations || candles.observations.length === 0) {
      return [];
    }

    return candles.observations
      .map((obs) => {
        const val = typeof obs.nav === 'number' ? obs.nav : (typeof obs.close === 'number' ? obs.close : null);
        return {
          date: obs.date || obs.timestamp || '',
          value: val,
          raw: obs
        };
      })
      .filter((d): d is { date: string; value: number; raw: any } => d.value !== null && !isNaN(d.value) && d.value > 0);
  }, [candles]);

  const stats = useMemo(() => {
    if (chartData.length < 2) {
      return {
        startValue: null,
        endValue: null,
        periodReturnPct: null,
        minValue: null,
        maxValue: null
      };
    }

    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    const periodReturnPct = ((last - first) / first) * 100;
    const values = chartData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    return {
      startValue: first,
      endValue: last,
      periodReturnPct,
      minValue,
      maxValue
    };
  }, [chartData]);

  const yDomain = useMemo(() => {
    if (stats.minValue === null || stats.maxValue === null) return ['auto', 'auto'];
    const padding = (stats.maxValue - stats.minValue) * 0.1 || stats.minValue * 0.05;
    return [
      Math.max(0, Math.floor(stats.minValue - padding)),
      Math.ceil(stats.maxValue + padding)
    ];
  }, [stats]);

  const gradientId = useMemo(() => `chart_grad_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}_${timeframe}`, [symbol, timeframe]);
  const isStale = candles?.freshness === 'STALE';

  return (
    <div className={`w-full bg-slate-50 dark:bg-[#060811] rounded-xl border border-slate-200/80 dark:border-white/[0.06] p-3.5 flex flex-col justify-between space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {isMutualFund ? 'NAV Trajectory' : 'Price Trajectory'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-[#8A94A6] font-mono">
            {timeframe}
          </span>
          {isStale && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400">
              STALE
            </span>
          )}
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center bg-slate-200/70 dark:bg-[#101827] p-0.5 rounded-lg border border-slate-300/60 dark:border-white/[0.06]">
          {(['1Y', '3Y', '5Y'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#00D4AA] text-[#050816] font-bold'
                  : 'text-slate-600 dark:text-[#8A94A6] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      {stats.periodReturnPct !== null && stats.startValue !== null && stats.endValue !== null && (
        <div className="flex items-center justify-between text-xs text-slate-900 dark:text-white font-mono">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 dark:text-[#8A94A6] font-sans text-[11px]">Range:</span>
            <span>{currency}{stats.startValue.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
            <span className="text-slate-400">→</span>
            <span className="font-bold">{currency}{stats.endValue.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 dark:text-[#8A94A6] font-sans text-[11px]">Return:</span>
            <span className={`font-bold ${stats.periodReturnPct >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
              {stats.periodReturnPct >= 0 ? '+' : ''}{stats.periodReturnPct.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="w-full relative h-[145px] flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-500 dark:text-[#8A94A6] text-xs">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00D4AA]" />
            <span>Loading {timeframe} data...</span>
          </div>
        ) : error || chartData.length < 2 ? (
          <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500 dark:text-[#8A94A6] space-y-1">
            <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-medium text-slate-800 dark:text-white">
              {error || 'Historical observations unavailable'}
            </span>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-xs text-[#0D9488] dark:text-[#00D4AA] hover:underline font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 5, right: 5, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" className="dark:stroke-white/[0.06]" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
                tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val: string) => {
                  try {
                    const dt = new Date(val);
                    if (!isNaN(dt.getTime())) {
                      return dt.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                    }
                  } catch {}
                  return val.slice(0, 7);
                }}
                minTickGap={30}
              />
              <YAxis 
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val: number) => {
                  if (val >= 1000) return `${currency}${(val / 1000).toFixed(1)}k`;
                  return `${currency}${val.toFixed(0)}`;
                }}
              />
              <Tooltip 
                content={
                  <CustomChartTooltip 
                    currency={currency} 
                    isMutualFund={isMutualFund} 
                    startValue={stats.startValue} 
                  />
                } 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#${gradientId})`} 
                isAnimationActive={true}
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Source Footer */}
      <div className="flex items-center justify-between text-[10.5px] text-slate-400 dark:text-[#5A667A] pt-1 border-t border-slate-200/80 dark:border-white/[0.04]">
        <div className="flex items-center gap-1">
          <Database className="w-3 h-3 text-slate-400 dark:text-[#5A667A]" />
          <span>Source: {candles?.source || (isMutualFund ? 'AMFI' : 'NSE')}</span>
        </div>
        <span className="italic">Advisory illustration</span>
      </div>
    </div>
  );
};
