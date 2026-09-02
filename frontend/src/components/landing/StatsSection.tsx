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
      color: 'text-[#38BDF8]'
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
      color: 'text-[#10B981]'
    }
  ];

  return (
    <section id="stats" className="py-20 bg-white dark:bg-[#060811] relative border-t border-b border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 lg:px-12 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold tracking-wide text-[#0D9488] dark:text-[#00D4AA]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#00D4AA]" />
            <span>INSTITUTIONAL MARKET COVERAGE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Comprehensive Real-Time Research Universe
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
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
                className="bg-slate-50 dark:bg-[#0F172A] rounded-2xl p-6 border border-slate-200/90 dark:border-white/[0.08] flex flex-col justify-between hover:border-[#0D9488]/40 dark:hover:border-[#00D4AA]/30 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center shadow-2xs">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 bg-white dark:bg-[#0B1120] px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-white/[0.06] tracking-wider uppercase">
                    LIVE FEED
                  </span>
                </div>

                <div>
                  <div className={`text-3xl sm:text-4xl font-black tracking-tight mb-1 font-mono ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {stat.label}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
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
