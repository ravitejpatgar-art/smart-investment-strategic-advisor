import React from 'react';
import { useMarketQuotes } from '../../hooks/useMarketQuotes';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

export const VestiqMarketStrip: React.FC<{ onSelectSymbol?: (symbol: string) => void }> = ({ onSelectSymbol }) => {
  const symbols = ['NIFTY 50', 'SENSEX', 'NASDAQ 100', 'GOLDBEES'];
  const { quotes, isLoading } = useMarketQuotes(symbols);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#F1F5F9] text-xs">
        <div className="flex items-center gap-2 font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
          <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <span>Live Market Intelligence</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#64748B] text-[11px]">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Real-time Feeds</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {symbols.map((sym) => {
          const q = quotes[sym];
          const isPos = (q?.changePct ?? 0) >= 0;
          const priceStr = q?.price
            ? (q.currency === 'USD' ? `$${q.price.toLocaleString('en-IN')}` : `₹${q.price.toLocaleString('en-IN')}`)
            : (isLoading ? 'Loading...' : 'Live Feed');

          return (
            <div
              key={sym}
              onClick={() => onSelectSymbol?.(sym)}
              className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] hover:border-teal-400 hover:bg-white transition-all cursor-pointer group space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#0F172A] group-hover:text-teal-700 transition-colors">
                  {sym}
                </span>
                {q?.changePct !== undefined && q.changePct !== null && (
                  <span className={`text-[10.5px] font-bold font-mono px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                    isPos ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {isPos ? '+' : ''}{q.changePct.toFixed(2)}%
                  </span>
                )}
              </div>

              <div className="text-[15px] sm:text-[16px] font-black text-[#0F172A] font-mono leading-tight">
                {priceStr}
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-[#94A3B8] pt-0.5">
                <span>{q?.status === 'LIVE' || q?.freshness === 'REALTIME' ? 'Live' : (q?.status === 'DEMO' ? 'Demo' : (q?.status === 'FALLBACK' ? 'Fallback' : (q?.freshness || 'Updated')))}</span>
                <span className="group-hover:text-teal-700 font-medium transition-colors">Analyze →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
