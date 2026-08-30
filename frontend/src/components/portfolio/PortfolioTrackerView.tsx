import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { Sparkles, ArrowRight } from 'lucide-react';

export const PortfolioTrackerView: React.FC = () => {
  const { setActiveView } = useFintechStore();

  return (
    <div className="p-8 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-4 max-w-lg mx-auto mt-12">
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
        <Sparkles className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-white">SmartVest AI Advisory Focus</h2>
      <p className="text-xs text-slate-400 leading-relaxed">
        SmartVest is a pure AI Investment Advisory Platform. We analyze your finances and recommend optimal asset allocations. To review your recommendations, navigate to the Recommendations section.
      </p>
      <button
        onClick={() => setActiveView('recommendations')}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
      >
        <span>Open Recommendations</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
