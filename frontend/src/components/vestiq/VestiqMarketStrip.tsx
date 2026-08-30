import React from 'react';
import { useMarketQuotes } from '../../hooks/useMarketQuotes';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

export const VestiqMarketStrip: React.FC<{ onSelectSymbol?: (symbol: string) => void }> = ({ onSelectSymbol }) => {
  const symbols = ['NIFTY 50', 'SENSEX', 'NASDAQ 100', 'GOLDBEES'];
  const { quotes, isLoading } = useMarketQuotes(symbols);

  return (
    <div className="bg-white border border-[#E7EAF0] rounded-xl p-3 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F1F5F9] text-xs">
        <div className="flex items-center gap-2 font-bold text-[#172033] uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
          <span>Live Market Intelligence</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#667085] text-[11.5px]">
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
              className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7EAF0] hover:border-teal-400 hover:bg-white transition-all cursor-pointer group space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#172033] group-hover:text-teal-700 transition-colors">
                  {sym}
                </span>
                {q?.changePct !== undefined && q.changePct !== null && (
                  <span className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                    isPos ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {isPos ? '+' : ''}{q.changePct.toFixed(2)}%
                  </span>
                )}
              </div>

              <div className="text-[15px] sm:text-[16px] font-black text-[#172033] font-mono leading-tight">
                {priceStr}
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-[#98A2B3]">
                <span>{q?.freshness === 'REALTIME' ? 'Live' : (q?.freshness || 'Updated')}</span>
                <span className="group-hover:text-teal-600 font-medium transition-colors">Analyze →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
