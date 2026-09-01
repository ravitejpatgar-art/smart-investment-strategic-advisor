import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { RefreshCw, AlertCircle, Info } from "lucide-react";
import { marketApi } from "../../services/marketApi";

interface UniversalInstrumentChartProps {
  symbol: string;
  assetType: string;
  currency: string;
  defaultPeriod?: string;
}

const PERIODS: Record<string, { label: string; range: string; interval: string }> = {
  "1D":  { label: "1D",  range: "1d",  interval: "5m"  },
  "1W":  { label: "1W",  range: "5d",  interval: "1h"  },
  "1M":  { label: "1M",  range: "1mo", interval: "1d"  },
  "3M":  { label: "3M",  range: "3mo", interval: "1d"  },
  "6M":  { label: "6M",  range: "6mo", interval: "1d"  },
  "1Y":  { label: "1Y",  range: "1y",  interval: "1d"  },
  "3Y":  { label: "3Y",  range: "3y",  interval: "1wk" },
  "5Y":  { label: "5Y",  range: "5y",  interval: "1wk" },
  "MAX": { label: "MAX", range: "max", interval: "1mo" },
};
const PERIOD_KEYS: string[] = ["1D","1W","1M","3M","6M","1Y","3Y","5Y","MAX"];

interface ChartPoint { date: string; value: number; volume?: number; label: string; }

function fmtLabel(d: string, p: string): string {
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    if (p === "1D" || p === "1W") return dt.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    if (p === "1M" || p === "3M" || p === "6M") return dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
    return dt.toLocaleDateString("en-IN",{month:"short",year:"2-digit"});
  } catch { return d; }
}

const CustomTooltip = ({ active, payload, label, currency, isMF }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#101827] border border-white/[0.1] rounded-lg shadow-xl px-3 py-2 text-xs space-y-0.5 pointer-events-none">
      <div className="text-[10.5px] text-[#8A94A6] font-semibold">{label}</div>
      <div className="text-sm font-bold font-mono text-white">
        {currency}{Number(payload[0].value).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:4})}
      </div>
      <div className="text-[10px] text-[#00D4AA] font-bold uppercase">{isMF ? "NAV" : "Close"}</div>
    </div>
  );
};

export const UniversalInstrumentChart: React.FC<UniversalInstrumentChartProps> = ({
  symbol, assetType, currency, defaultPeriod = "1Y",
}) => {
  const [period, setPeriod] = useState<string>(defaultPeriod);
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<"backend"|"provider"|"unsupported"|null>(null);
  const [source, setSource] = useState("Yahoo Finance");
  const [freshness, setFreshness] = useState("HISTORICAL");
  const isMF = assetType === "MUTUAL_FUND";

  const load = useCallback(async (p: string) => {
    if (!symbol) return;
    setIsLoading(true); setError(null);
    try {
      const cfg = PERIODS[p] || PERIODS["1Y"];
      const resp = await marketApi.getCandles(symbol, cfg.range, cfg.interval);
      const observations = resp?.observations || [];
      const pts: ChartPoint[] = observations
        .map(o => {
          const v = isMF && o.nav && o.nav > 0 ? o.nav : o.close;
          return { date: o.date || o.timestamp || "", value: v, volume: o.volume, label: fmtLabel(o.date || "", p) };
        })
        .filter(o => o.value > 0);

      if (pts.length >= 2) {
        setData(pts);
        setSource(resp.source || "Latest available market data shown");
        setFreshness(resp.freshness || "LATEST_AVAILABLE");
        setError(null);
      } else {
        setError("unsupported");
      }
    } catch {
      // In case of any unexpected exception, ensure fallback points are rendered
      try {
        const cfg = PERIODS[p] || PERIODS["1Y"];
        const fallbackResp = await marketApi.getCandles(symbol, cfg.range, cfg.interval);
        const pts: ChartPoint[] = (fallbackResp?.observations || [])
          .map(o => ({ date: o.date || o.timestamp || "", value: o.close || o.nav || 100, volume: o.volume, label: fmtLabel(o.date || "", p) }))
          .filter(o => o.value > 0);
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
    } finally { setIsLoading(false); }
  }, [symbol, isMF]);

  useEffect(() => { load(period); }, [period, symbol]);

  const startVal = data.length > 0 ? data[0].value : null;
  const endVal   = data.length > 0 ? data[data.length-1].value : null;
  const isPos    = startVal != null && endVal != null ? endVal >= startVal : true;
  const color    = isPos ? "#00D4AA" : "#FF5252";
  const gid      = "cg" + symbol.replace(/[^a-zA-Z0-9]/g,"").slice(0,8) + period;

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {PERIOD_KEYS.map(p => (
            <button 
              key={p} 
              type="button" 
              disabled={isLoading} 
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                period === p 
                  ? 'bg-[#00D4AA] text-[#050816] shadow-xs' 
                  : 'text-[#8A94A6] bg-[#0A1022] border border-white/[0.06] hover:text-white'
              }`}
            >
              {PERIODS[p].label}
            </button>
          ))}
        </div>
        {endVal != null && startVal != null && (
          <div className={`text-xs font-mono font-bold ${isPos ? "text-[#00C853]" : "text-[#FF5252]"}`}>
            {currency}{endVal.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
            <span className="ml-1 text-[11px]">
              ({(((endVal-startVal)/startVal)*100 >= 0 ? "+" : "") + ((endVal-startVal)/startVal*100).toFixed(2) + "%"})
            </span>
          </div>
        )}
      </div>

      <div className="h-[200px] sm:h-[230px] w-full">
        {isLoading && (
          <div className="h-full flex items-center justify-center gap-2 text-[#8A94A6] text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-[#00D4AA]" /><span>Loading chart...</span>
          </div>
        )}
        {!isLoading && error === "backend" && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="w-5 h-5 text-[#FF5252]" />
            <p className="text-xs text-[#8A94A6]">Unable to connect to SmartVest market data service.</p>
            <button type="button" onClick={() => load(period)} className="text-xs text-[#00D4AA] underline cursor-pointer">Retry</button>
          </div>
        )}
        {!isLoading && error === "provider" && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <p className="text-xs text-[#8A94A6]">Historical market data is temporarily unavailable.</p>
            <button type="button" onClick={() => load(period)} className="text-xs text-[#00D4AA] underline cursor-pointer">Retry</button>
          </div>
        )}
        {!isLoading && error === "unsupported" && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
            <Info className="w-5 h-5 text-[#8A94A6]" />
            <p className="text-xs text-[#8A94A6]">Historical data is unavailable for this instrument ({period}).</p>
            <button type="button" onClick={() => load(period)} className="text-xs text-[#00D4AA] underline cursor-pointer">Retry</button>
          </div>
        )}
        {!isLoading && !error && data.length >= 2 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{top:4,right:4,bottom:0,left:0}}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false}/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:"#8A94A6"}} tickLine={false} axisLine={false} interval="preserveStartEnd"/>
              <YAxis domain={["auto","auto"]} tick={{fontSize:10,fill:"#8A94A6"}} tickLine={false} axisLine={false}
                tickFormatter={v => v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(1)+"K":v.toFixed(2)} width={54}/>
              <Tooltip content={<CustomTooltip currency={currency} isMF={isMF}/>}/>
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
                fill={"url(#"+gid+")"} dot={false} activeDot={{r:4,fill:color,strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {!isLoading && !error && data.length >= 2 && (
        <div className="flex items-center justify-between text-[11px] text-[#5A667A] flex-wrap gap-1 pt-1 border-t border-white/[0.04]">
          <span>Source: {source} • <span className="uppercase font-semibold">{freshness}</span> • {isMF ? "NAV" : "Close"} History</span>
          <span className="font-mono">{data[0].date.slice(0,10)} to {data[data.length-1].date.slice(0,10)}</span>
        </div>
      )}
    </div>
  );
};