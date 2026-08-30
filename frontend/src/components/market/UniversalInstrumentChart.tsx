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
    <div className="bg-white border border-[#E7E9F0] rounded-xl shadow-lg px-3.5 py-2.5 text-[12px] space-y-0.5">
      <div className="text-[10.5px] text-[#94A3B8] font-semibold">{label}</div>
      <div className="text-[14px] font-bold font-mono text-[#172033]">
        {currency}{Number(payload[0].value).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:4})}
      </div>
      <div className="text-[11px] text-[#667085]">{isMF ? "NAV" : "Close"}</div>
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
    setIsLoading(true); setError(null); setData([]);
    try {
      const cfg = PERIODS[p] || PERIODS["1Y"];
      const resp = await marketApi.getCandles(symbol, cfg.range, cfg.interval);
      if (!resp?.observations?.length) { setError("unsupported"); return; }
      const pts: ChartPoint[] = resp.observations
        .map(o => {
          const v = isMF && o.nav && o.nav > 0 ? o.nav : o.close;
          return { date: o.date || o.timestamp || "", value: v, volume: o.volume, label: fmtLabel(o.date || "", p) };
        })
        .filter(o => o.value > 0);
      if (pts.length < 2) { setError("unsupported"); return; }
      setData(pts);
      setSource(resp.source || "Yahoo Finance");
      setFreshness(resp.freshness || "HISTORICAL");
    } catch (err: any) {
      if (err?.code === "ECONNREFUSED" || err?.response?.status === 503) setError("backend");
      else setError("provider");
    } finally { setIsLoading(false); }
  }, [symbol, isMF]);

  useEffect(() => { load(period); }, [period, symbol]);

  const startVal = data.length > 0 ? data[0].value : null;
  const endVal   = data.length > 0 ? data[data.length-1].value : null;
  const isPos    = startVal != null && endVal != null ? endVal >= startVal : true;
  const color    = isPos ? "#0d9488" : "#e11d48";
  const gid      = "cg" + symbol.replace(/[^a-zA-Z0-9]/g,"").slice(0,8) + period;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {PERIOD_KEYS.map(p => (
            <button key={p} type="button" disabled={isLoading} onClick={() => setPeriod(p)}
              className={"px-2.5 py-1 rounded-lg text-[11.5px] font-bold cursor-pointer " +
                (period === p ? "bg-teal-600 text-white" : "text-[#667085] bg-[#F8F9FC] border border-[#E7E9F0] hover:bg-slate-100")}>
              {PERIODS[p].label}
            </button>
          ))}
        </div>
        {endVal != null && startVal != null && (
          <div className={"text-[12.5px] font-mono font-bold " + (isPos ? "text-emerald-600" : "text-rose-600")}>
            {currency}{endVal.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
            <span className="ml-1 text-[11px]">
              ({(((endVal-startVal)/startVal)*100 >= 0 ? "+" : "") + ((endVal-startVal)/startVal*100).toFixed(2) + "%"})
            </span>
          </div>
        )}
      </div>

      <div className="h-[220px] sm:h-[260px] w-full">
        {isLoading && (
          <div className="h-full flex items-center justify-center gap-2 text-[#667085] text-[13px]">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-500" /><span>Loading chart...</span>
          </div>
        )}
        {!isLoading && error === "backend" && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <p className="text-[12.5px] text-[#667085]">Unable to connect to SmartVest market data service.</p>
            <button type="button" onClick={() => load(period)} className="text-[12px] text-teal-600 underline cursor-pointer">Retry</button>
          </div>
        )}
        {!isLoading && error === "provider" && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <p className="text-[12.5px] text-[#667085]">Historical market data is temporarily unavailable.</p>
            <button type="button" onClick={() => load(period)} className="text-[12px] text-teal-600 underline cursor-pointer">Retry</button>
          </div>
        )}
        {!isLoading && error === "unsupported" && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
            <Info className="w-5 h-5 text-slate-400" />
            <p className="text-[12.5px] text-[#667085]">Historical data is unavailable for this instrument ({period}).</p>
            <button type="button" onClick={() => load(period)} className="text-[12px] text-teal-600 underline cursor-pointer">Retry</button>
          </div>
        )}
        {!isLoading && !error && data.length >= 2 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{top:4,right:4,bottom:0,left:0}}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E9F0" vertical={false}/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:"#94A3B8"}} tickLine={false} axisLine={false} interval="preserveStartEnd"/>
              <YAxis domain={["auto","auto"]} tick={{fontSize:10,fill:"#94A3B8"}} tickLine={false} axisLine={false}
                tickFormatter={v => v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(1)+"K":v.toFixed(2)} width={54}/>
              <Tooltip content={<CustomTooltip currency={currency} isMF={isMF}/>}/>
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
                fill={"url(#"+gid+")"} dot={false} activeDot={{r:4,fill:color,strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {!isLoading && !error && data.length >= 2 && (
        <div className="flex items-center justify-between text-[11px] text-[#94A3B8] flex-wrap gap-1">
          <span>Source: {source} · <span className="uppercase font-semibold">{freshness}</span> · {isMF ? "NAV" : "Close"} History</span>
          <span className="font-mono">{data[0].date.slice(0,10)} to {data[data.length-1].date.slice(0,10)}</span>
        </div>
      )}
    </div>
  );
};