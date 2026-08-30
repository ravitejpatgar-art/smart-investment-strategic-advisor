import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { Users, Briefcase, FileCheck, Award } from 'lucide-react';


export const StatsSection: React.FC = () => {
  const { currency } = useFintechStore();

  const stats = [
    {
      icon: Users,
      value: '185,000+',
      label: 'Active Wealth Builders',
      description: 'Across 45+ countries making data-driven decisions daily.',
      color: 'text-emerald-400'
    },
    {
      icon: Briefcase,
      value: currency === 'INR' ? '₹1,650 Cr+' : '$195M+',
      label: 'Portfolios Analyzed',
      description: 'In assets under advisory across multi-asset allocations.',
      color: 'text-cyan-400'
    },
    {
      icon: FileCheck,
      value: '920,000+',
      label: 'Investment Plans Generated',
      description: 'Personalized SIP strategies & goal projections delivered.',
      color: 'text-amber-400'
    },
    {
      icon: Award,
      value: '99.4%',
      label: 'AI Recommendation Precision',
      description: 'Backtested against 15-year historical market cycles.',
      color: 'text-indigo-400'
    }
  ];

  return (
    <section id="stats" className="py-20 bg-slate-950 relative overflow-hidden">
      {/* Background glow lines */}
      <div className="max-w-7xl mx-auto px-4 lg:px-12 relative z-10">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="glass-panel rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    LIVE METRIC
                  </span>
                </div>

                <div>
                  <div className={`text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1.5 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mb-2">
                    {stat.label}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
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
