import React from 'react';
import { Globe, BarChart3, PieChart, Layers, ShieldCheck } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const coverageMetrics = [
    {
      icon: BarChart3,
      value: '10,000+',
      label: 'Stocks Analyzed',
      description: 'NSE, BSE, NASDAQ, NYSE, & global equity instruments.',
      color: 'text-[#00D4AA]'
    },
    {
      icon: Layers,
      value: '5,000+',
      label: 'ETFs Tracked',
      description: 'Broad index, sector, thematic, commodity, and international ETFs.',
      color: 'text-[#1E88E5]'
    },
    {
      icon: PieChart,
      value: '50,000+',
      label: 'Mutual Funds',
      description: 'Direct plan AMFI feeds with comprehensive historical NAVs.',
      color: 'text-amber-400'
    },
    {
      icon: Globe,
      value: '100+',
      label: 'Global Exchanges',
      description: 'Multi-market coverage spanning India, US, Europe, and Asia.',
      color: 'text-[#00C853]'
    }
  ];

  return (
    <section id="stats" className="py-20 bg-[var(--color-bg)] relative border-t border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-12 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold tracking-wide text-[var(--color-accent)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>INSTITUTIONAL MARKET COVERAGE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
            Comprehensive Real-Time Research Universe
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Multi-asset execution and deep quantitative analytics across the entire global investment landscape.
          </p>
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {coverageMetrics.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="bg-[var(--color-card)] rounded-2xl p-6 border border-[var(--color-border)] flex flex-col justify-between hover:border-[var(--color-border-hover)] transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[var(--color-border)] tracking-wider uppercase">
                    LIVE FEED
                  </span>
                </div>

                <div>
                  <div className={`text-3xl sm:text-4xl font-black tracking-tight mb-1 font-mono ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-[var(--color-text-primary)] mb-1.5">
                    {stat.label}
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-normal">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
