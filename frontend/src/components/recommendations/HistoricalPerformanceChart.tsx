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
  } catch (e) {
    formattedDate = label;
  }

  return (
    <div className="bg-white border border-[#E7E9F0] rounded-xl p-3 shadow-md space-y-1 text-xs pointer-events-none min-w-[150px]">
      <div className="text-[12px] font-semibold text-[#667085] border-b border-[#F1F5F9] pb-1 flex items-center justify-between">
        <span>{formattedDate}</span>
        <span className="text-[11px] uppercase px-1.5 py-0.2 rounded bg-[#F8F9FC] text-[#172033] font-bold border border-[#E7E9F0]">
          {isMutualFund ? 'NAV' : 'Close'}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3 pt-0.5">
        <span className="text-[#667085] font-medium text-[13px]">{isMutualFund ? 'NAV:' : 'Price:'}</span>
        <span className="font-mono font-bold text-[#172033] text-[13.5px]">
          {currency}{val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      {changeFromStart !== null && (
        <div className="flex items-center justify-between text-[12px] text-[#667085] pt-0.5">
          <span>Return:</span>
          <span className={`font-mono font-bold ${changeFromStart >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
  color = '#14B8A6',
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
    <div className={`w-full bg-[#F8F9FC] rounded-xl border border-[#E7E9F0] p-3.5 flex flex-col justify-between space-y-2.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E7E9F0]">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-[#172033]">
            {isMutualFund ? 'NAV History' : 'Price History'}
          </span>
          <span className="text-[12px] text-[#667085] font-mono">
            {timeframe}
          </span>
          {isStale && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800">
              STALE
            </span>
          )}
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#E7E9F0] shadow-xs">
          {(['1Y', '3Y', '5Y'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-0.5 rounded-md text-[12px] font-mono transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      {stats.periodReturnPct !== null && stats.startValue !== null && stats.endValue !== null && (
        <div className="flex items-center justify-between text-[13px] text-[#172033] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[#667085] font-sans text-[12px]">Range:</span>
            <span>{currency}{stats.startValue.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
            <span className="text-slate-400">→</span>
            <span className="font-bold">{currency}{stats.endValue.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[#667085] font-sans text-[12px]">Return:</span>
            <span className={`font-bold ${stats.periodReturnPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stats.periodReturnPct >= 0 ? '+' : ''}{stats.periodReturnPct.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="w-full relative h-[160px] flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center gap-2 text-[#667085] text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
            <span>Loading {timeframe} data...</span>
          </div>
        ) : error || chartData.length < 2 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center text-[#667085] space-y-1">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-[#172033]">
              {error || 'Historical observations unavailable'}
            </span>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="text-[13px] text-teal-700 hover:text-teal-900 underline font-medium cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(val: string) => {
                  try {
                    const dt = new Date(val);
                    if (!isNaN(dt.getTime())) {
                      return dt.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                    }
                  } catch (e) {}
                  return val.slice(0, 7);
                }}
                minTickGap={30}
              />
              <YAxis 
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'monospace' }}
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
      <div className="flex items-center justify-between text-[11.5px] text-[#667085] pt-1 border-t border-[#E7E9F0]">
        <div className="flex items-center gap-1">
          <Database className="w-3 h-3 text-slate-400" />
          <span>Source: {candles?.source || (isMutualFund ? 'AMFI' : 'NSE')}</span>
        </div>
        <span className="italic">Advisory illustration only</span>
      </div>
    </div>
  );
};
