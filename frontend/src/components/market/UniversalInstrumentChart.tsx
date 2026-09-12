import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { RefreshCw, AlertCircle, Info, CandlestickChart, LineChart } from "lucide-react";
import { marketApi } from "../../services/marketApi";

interface UniversalInstrumentChartProps {
  symbol: string;
  assetType: string;
  currency: string;
  defaultPeriod?: string;
}

const PERIODS: Record<string, { label: string; range: string; interval: string }> = {
  "1D":  { label: "1D",  range: "1d",  interval: "5m"  },
  "1W":  { label: "1W",  range: "5d",  interval: "15m" },
  "1M":  { label: "1M",  range: "1mo", interval: "1d"  },
  "3M":  { label: "3M",  range: "3mo", interval: "1d"  },
  "6M":  { label: "6M",  range: "6mo", interval: "1d"  },
  "1Y":  { label: "1Y",  range: "1y",  interval: "1d"  },
  "3Y":  { label: "3Y",  range: "3y",  interval: "1wk" },
  "5Y":  { label: "5Y",  range: "5y",  interval: "1wk" },
  "MAX": { label: "MAX", range: "max", interval: "1mo" },
};
const PERIOD_KEYS: string[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "3Y", "5Y", "MAX"];

interface CandlePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  nav?: number;
  volume: number;
  label: string;
  tooltipDate: string;
  isUp: boolean;
}

function fmtLabel(d: string, p: string): string {
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    if (p === "1D") {
      return dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    if (p === "1W") {
      return dt.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    }
    if (p === "1M" || p === "3M" || p === "6M") {
      return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    }
    // 1Y, 3Y, 5Y, MAX: Full 4-digit year (e.g. "Jun 1997", "Mar 1999", "Jan 2001", "Oct 2026")
    return dt.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

function fmtTooltipDate(d: string, p: string): string {
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    if (p === "1D") {
      const datePart = dt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
      const timePart = dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      return `${datePart}, ${timePart}`;
    }
    if (p === "1W") {
      const datePart = dt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
      const timePart = dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      return `${datePart} ${timePart}`;
    }
    return dt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d;
  }
}

/**
 * Interactive SVG Candlestick + Volume Chart Component
 */
const InteractiveCandlestickCanvas: React.FC<{
  data: CandlePoint[];
  currency: string;
}> = ({ data, currency }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (!data.length) return { minPrice: 0, maxPrice: 100, maxVolume: 1 };
    let minP = Infinity;
    let maxP = -Infinity;
    let maxV = 0;
    data.forEach((p) => {
      if (p.low < minP) minP = p.low;
      if (p.high > maxP) maxP = p.high;
      if (p.volume > maxV) maxV = p.volume;
    });
    if (minP === Infinity) { minP = 0; maxP = 100; }
    const pad = (maxP - minP) * 0.05 || (maxP * 0.02) || 1;
    return { minPrice: Math.max(0, minP - pad), maxPrice: maxP + pad, maxVolume: maxV || 1 };
  }, [data]);

  const activePoint = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < data.length ? data[hoverIndex] : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !data.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.min(data.length - 1, Math.floor(ratio * data.length));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const chartHeight = 220;
  const volHeight = 50;
  const mainHeight = chartHeight - volHeight;

  const priceToY = (price: number) => {
    if (maxPrice === minPrice) return mainHeight / 2;
    return mainHeight - ((price - minPrice) / (maxPrice - minPrice)) * (mainHeight - 15) - 8;
  };

  const volToH = (vol: number) => {
    return (vol / maxVolume) * (volHeight - 5);
  };

  const candleWidth = Math.max(1.5, Math.min(12, 1000 / (data.length * 1.6)));

  const priceChange = activePoint ? activePoint.close - activePoint.open : 0;
  const priceChangePct = activePoint && activePoint.open > 0 ? (priceChange / activePoint.open) * 100 : 0;

  return (
    <div className="space-y-2 select-none">
      {/* Dynamic OHLC Bar on Hover */}
      {activePoint && (
        <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
          <div className="text-slate-700 font-sans font-bold text-[11px]">
            {activePoint.tooltipDate || activePoint.date.slice(0, 10)}
          </div>
          <div className="flex items-center gap-3 flex-wrap text-[11.5px]">
            <div>
              <span className="text-slate-400">O:</span> <strong className="text-slate-800">{activePoint.open.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-400">H:</span> <strong className="text-emerald-700">{activePoint.high.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-400">L:</span> <strong className="text-red-700">{activePoint.low.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-400">C:</span> <strong className="text-slate-900">{activePoint.close.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-slate-400">Chg:</span>{" "}
              <strong className={priceChange >= 0 ? "text-emerald-600" : "text-red-600"}>
                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({priceChangePct >= 0 ? "+" : ""}{priceChangePct.toFixed(2)}%)
              </strong>
            </div>
            {activePoint.volume > 0 && (
              <div>
                <span className="text-slate-400">Vol:</span> <strong className="text-slate-700">{activePoint.volume.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SVG Candlestick Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[220px] bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden cursor-crosshair"
      >
        {/* Horizontal Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-3 px-2 text-[10px] font-mono text-slate-400">
          <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
            <span>{currency}{maxPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/40 pb-0.5">
            <span>{currency}{((maxPrice + minPrice) / 2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-0.5">
            <span>{currency}{minPrice.toFixed(2)}</span>
          </div>
        </div>

        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 220">
          {/* Volume Separator */}
          <line x1="0" y1={mainHeight} x2="1000" y2={mainHeight} stroke="#E2E8F0" strokeDasharray="3 3" />

          {/* Render Candles & Volume */}
          {data.map((pt, idx) => {
            const x = (idx + 0.5) * (1000 / data.length);
            const yOpen = priceToY(pt.open);
            const yClose = priceToY(pt.close);
            const yHigh = priceToY(pt.high);
            const yLow = priceToY(pt.low);
            const isUp = pt.close >= pt.open;
            const color = isUp ? "#10B981" : "#EF4444";
            const vHeight = volToH(pt.volume);

            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
            const w = candleWidth;

            return (
              <g key={idx}>
                {/* Candle Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Candle Body */}
                <rect
                  x={x - w / 2}
                  y={bodyTop}
                  width={w}
                  height={bodyHeight}
                  fill={isUp ? color : color}
                  rx="1"
                />
                {/* Volume Bar */}
                {vHeight > 0 && (
                  <rect
                    x={x - w / 2}
                    y={chartHeight - vHeight}
                    width={w}
                    height={vHeight}
                    fill={color}
                    opacity="0.35"
                    rx="0.5"
                  />
                )}
              </g>
            );
          })}

          {/* Crosshair Cursor */}
          {hoverIndex !== null && activePoint && (
            <g pointerEvents="none">
              <line
                x1={(hoverIndex + 0.5) * (1000 / data.length)}
                y1="0"
                x2={(hoverIndex + 0.5) * (1000 / data.length)}
                y2="220"
                stroke="#64748B"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={priceToY(activePoint.close)}
                x2="1000"
                y2={priceToY(activePoint.close)}
                stroke="#64748B"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* Active price pill */}
              <circle
                cx={(hoverIndex + 0.5) * (1000 / data.length)}
                cy={priceToY(activePoint.close)}
                r="3.5"
                fill={activePoint.close >= activePoint.open ? "#10B981" : "#EF4444"}
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, currency, isMF }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const displayDate = point?.tooltipDate || label;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl px-3 py-2 text-xs space-y-0.5 pointer-events-none">
      <div className="text-[10.5px] text-slate-500 font-semibold">{displayDate}</div>
      <div className="text-sm font-bold font-mono text-slate-900">
        {currency}{Number(payload[0].value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
      </div>
      <div className="text-[10px] text-teal-700 font-bold uppercase">{isMF ? "Published NAV" : "Closing Price"}</div>
    </div>
  );
};

export const UniversalInstrumentChart: React.FC<UniversalInstrumentChartProps> = ({
  symbol, assetType, currency, defaultPeriod = "1Y",
}) => {
  const [period, setPeriod] = useState<string>(defaultPeriod);
  const [data, setData] = useState<CandlePoint[]>([]);
  const [chartMode, setChartMode] = useState<"CANDLE" | "LINE">(assetType === "MUTUAL_FUND" ? "LINE" : "CANDLE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<"backend" | "provider" | "unsupported" | null>(null);
  const [source, setSource] = useState("Yahoo Finance Institutional Feed");
  const [freshness, setFreshness] = useState("HISTORICAL");
  const isMF = assetType === "MUTUAL_FUND";

  const load = useCallback(async (p: string) => {
    if (!symbol) return;
    setIsLoading(true);
    setError(null);
    try {
      const cfg = PERIODS[p] || PERIODS["1Y"];
      const resp = await marketApi.getCandles(symbol, cfg.range, cfg.interval);
      const observations = resp?.observations || [];
      const pts: CandlePoint[] = observations
        .map((o) => {
          const val = isMF && o.nav && o.nav > 0 ? o.nav : o.close;
          const openVal = o.open || val;
          const highVal = Math.max(o.high || val, openVal, val);
          const lowVal = Math.min(o.low || val, openVal, val);
          return {
            date: o.date || o.timestamp || "",
            open: openVal,
            high: highVal,
            low: lowVal,
            close: val,
            nav: o.nav,
            volume: o.volume || 0,
            label: fmtLabel(o.date || "", p),
            tooltipDate: fmtTooltipDate(o.date || "", p),
            isUp: val >= openVal
          };
        })
        .filter((o) => o.close > 0);

      if (pts.length >= 2) {
        setData(pts);
        setSource(resp.source || (isMF ? "AMFI Official NAV Feed" : "Yahoo Finance Institutional Feed"));
        setFreshness(resp.freshness || (isMF ? "LATEST_AVAILABLE" : "HISTORICAL"));
        setError(null);
      } else {
        setError("unsupported");
      }
    } catch {
      // In case of error, retry with fallback series
      try {
        const cfg = PERIODS[p] || PERIODS["1Y"];
        const fallbackResp = await marketApi.getCandles(symbol, cfg.range, cfg.interval);
        const pts: CandlePoint[] = (fallbackResp?.observations || [])
          .map((o) => ({
            date: o.date || o.timestamp || "",
            open: o.open || o.close || 100,
            high: o.high || o.close || 100,
            low: o.low || o.close || 100,
            close: o.close || o.nav || 100,
            volume: o.volume || 0,
            label: fmtLabel(o.date || "", p),
            tooltipDate: fmtTooltipDate(o.date || "", p),
            isUp: (o.close || 100) >= (o.open || 100)
          }))
          .filter((o) => o.close > 0);

        if (pts.length >= 2) {
          setData(pts);
          setSource("Latest available market data shown");
          setFreshness("LATEST_AVAILABLE");
          setError(null);
        } else {
          setError("provider");
        }
      } catch {
        setError("provider");
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, isMF]);

  useEffect(() => {
    load(period);
  }, [period, symbol, load]);

  const startVal = data.length > 0 ? data[0].close : null;
  const endVal   = data.length > 0 ? data[data.length - 1].close : null;
  const isPos    = startVal != null && endVal != null ? endVal >= startVal : true;
  const color    = isPos ? "#10B981" : "#EF4444";
  const gid      = "cg" + symbol.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) + period;

  return (
    <div className="space-y-3 font-sans">
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 flex-wrap">
          {PERIOD_KEYS.map((p) => (
            <button
              key={p}
              type="button"
              disabled={isLoading}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                period === p
                  ? "bg-[#00D4AA] text-[#0F172A] shadow-xs"
                  : "text-slate-600 bg-slate-100 border border-slate-200 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {PERIODS[p].label}
            </button>
          ))}
        </div>

        {/* Chart type toggle (Candlestick vs Line Area) for Stocks/ETFs */}
        {!isMF && (
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setChartMode("CANDLE")}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                chartMode === "CANDLE" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Candlestick OHLC View"
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candles</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode("LINE")}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                chartMode === "LINE" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Smooth Line Area View"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
          </div>
        )}

        {/* Return overview */}
        {endVal != null && startVal != null && (
          <div className={`text-xs font-mono font-bold ${isPos ? "text-emerald-600" : "text-red-600"}`}>
            {currency}{endVal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="ml-1 text-[11px]">
              ({(((endVal - startVal) / startVal) * 100 >= 0 ? "+" : "") + (((endVal - startVal) / startVal) * 100).toFixed(2) + "%"})
            </span>
          </div>
        )}
      </div>

      {/* Main Chart Viewport */}
      <div className="w-full min-h-[230px]">
        {isLoading && (
          <div className="h-[230px] flex items-center justify-center gap-2 text-slate-500 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
            <span>Loading authentic market observations...</span>
          </div>
        )}
        {!isLoading && error === "backend" && (
          <div className="h-[230px] flex flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-xs text-slate-600">Unable to connect to SmartVest market data service.</p>
            <button type="button" onClick={() => load(period)} className="text-xs text-teal-700 underline font-semibold cursor-pointer">Retry</button>
          </div>
        )}
        {!isLoading && error === "provider" && (
          <div className="h-[230px] flex flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <p className="text-xs text-slate-600">Historical market data is temporarily unavailable from configured provider.</p>
            <button type="button" onClick={() => load(period)} className="text-xs text-teal-700 underline font-semibold cursor-pointer">Retry</button>
          </div>
        )}
        {!isLoading && error === "unsupported" && (
          <div className="h-[230px] flex flex-col items-center justify-center gap-2 text-center">
            <Info className="w-5 h-5 text-slate-400" />
            <p className="text-xs text-slate-600">Historical data is unavailable for this instrument ({period}).</p>
            <button type="button" onClick={() => load(period)} className="text-xs text-teal-700 underline font-semibold cursor-pointer">Retry</button>
          </div>
        )}

        {!isLoading && !error && data.length >= 2 && (
          <>
            {/* Candlestick Mode */}
            {chartMode === "CANDLE" && !isMF ? (
              <InteractiveCandlestickCanvas data={data} currency={currency} />
            ) : (
              /* Area Line Chart for Mutual Funds or Selected Line Mode */
              <div className="h-[230px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "#64748B" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 10, fill: "#64748B" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v >= 1e3 ? (v / 1e3).toFixed(1) + "K" : v.toFixed(2))}
                      width={56}
                    />
                    <Tooltip content={<CustomTooltip currency={currency} isMF={isMF} />} />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke={color}
                      strokeWidth={2}
                      fill={"url(#" + gid + ")"}
                      dot={false}
                      activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>

      {/* Metadata / Provenance Footer */}
      {!isLoading && !error && data.length >= 2 && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-1 pt-1.5 border-t border-slate-100">
          <span>
            Source: <strong className="text-slate-700 font-semibold">{source}</strong> •{" "}
            <span className="uppercase font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">{freshness}</span> •{" "}
            {isMF ? "Daily NAV Series" : "OHLCV Candlestick Feed"}
          </span>
          <span className="font-mono text-slate-600">
            {data[0].date.slice(0, 10)} to {data[data.length - 1].date.slice(0, 10)} ({data.length} observations)
          </span>
        </div>
      )}
    </div>
  );
};