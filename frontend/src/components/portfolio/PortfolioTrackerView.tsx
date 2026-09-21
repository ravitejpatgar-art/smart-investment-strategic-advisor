import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { Layers, ArrowRight } from 'lucide-react';

export const PortfolioTrackerView: React.FC = () => {
  const { setActiveView } = useFintechStore();

  return (
    <div className="financial-section-card p-6 sm:p-8 text-center space-y-4 max-w-lg mx-auto mt-12">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center">
        <Layers className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Portfolio Allocation & Asset Blueprint</h2>
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        SmartVest provides quantitative asset allocation models aligned with your risk profile and horizon. Review your target holdings, historical performance backtests, and rebalancing blueprints.
      </p>
      <button
        onClick={() => setActiveView('recommendations')}
        className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all hover:brightness-105"
      >
        <span>Open Strategic Recommendations</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
