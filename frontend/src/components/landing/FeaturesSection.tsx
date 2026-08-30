import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Sparkles, 
  Target, 
  Wallet, 
  Bot, 
  User, 
  Layers,
  ArrowUpRight, 
  Zap, 
  CheckCircle 
} from 'lucide-react';
import type { ActiveNavTab } from '../../store/useFintechStore';

export const FeaturesSection: React.FC = () => {
  const { setActiveView } = useFintechStore();

  const features: {
    icon: React.FC<{ className?: string }>;
    title: string;
    tag: string;
    color: string;
    description: string;
    highlights: string[];
    view: ActiveNavTab;
  }[] = [
    {
      icon: Sparkles,
      title: 'AI Investment Recommendations',
      tag: 'Core Advisor',
      color: 'from-emerald-500 to-teal-400',
      description: 'Personalized multi-asset portfolio recommendations calibrated specifically to your age, income, surplus, and risk tolerance.',
      highlights: ['Exact ₹/$ Monthly Inflow per Asset', 'Modern Portfolio Theory (MPT)', 'Expected 12-16% CAGR Modeling'],
      view: 'recommendations'
    },
    {
      icon: Layers,
      title: 'Explainable AI Strategy',
      tag: 'Full Transparency',
      color: 'from-cyan-500 to-blue-500',
      description: 'Never invest blindly. Every single recommendation is paired with institutional rationale and risk mitigation checklists.',
      highlights: ['Profile-Compatibility Checks', 'Downside Cushion Analytics', '5-20 Year Compounding Projections'],
      view: 'recommendations'
    },
    {
      icon: Target,
      title: 'Goal-Based Financial Planning',
      tag: 'FIRE & Milestones',
      color: 'from-amber-500 to-orange-500',
      description: 'Target retirement, dream homes, education, or financial freedom with automated SIP feasibility simulations.',
      highlights: ['Interactive SIP Calculators', 'Goal Probability Scores', 'Inflation-Adjusted Target Timelines'],
      view: 'goals'
    },
    {
      icon: Wallet,
      title: 'Expense & Cashflow Tracker',
      tag: 'Cashflow IQ',
      color: 'from-indigo-500 to-purple-500',
      description: 'Monitor monthly inflows, fixed living costs, and discretionary leaks to maximize your investable surplus.',
      highlights: ['Category Breakdown', 'Discretionary Leak Detection', 'Live Capacity Calculations'],
      view: 'expenses'
    },
    {
      icon: Bot,
      title: 'AI Financial Advisor',
      tag: 'ChatGPT for Wealth',
      color: 'from-emerald-400 to-cyan-400',
      description: '24/7 personal wealth strategic advisor. Ask questions about major purchases, surplus deployment, or risk management.',
      highlights: ['Full Context of Income & Goals', 'Affordability Math Models', 'Zero Broker Bias'],
      view: 'advisor'
    },
    {
      icon: User,
      title: 'Investor Profile & Settings',
      tag: 'Financial DNA',
      color: 'from-rose-500 to-pink-500',
      description: 'Calibrate risk preferences, timeline horizons, and financial goals with instant AI strategy recalibration.',
      highlights: ['Editable Demographics', 'Risk Score Recalibration', 'Instant AI Re-analysis'],
      view: 'profile'
    }
  ];

  return (
    <section id="features" className="py-24 relative bg-slate-950/80 border-t border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" /> AI Strategic Wealth Advisor
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-5">
            Engineered for Modern <span className="gradient-text-emerald">Wealth Builders</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            SmartVest AI provides pure personalized investment guidance with institutional rigor and zero broker conflict of interest.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div 
                key={idx}
                onClick={() => setActiveView(feature.view)}
                className="bg-slate-900/60 hover:bg-slate-900/90 rounded-3xl p-7 border border-slate-800/80 hover:border-emerald-500/40 flex flex-col justify-between group cursor-pointer transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feature.color} flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-slate-950 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  <div className="space-y-2 border-t border-slate-800/80 pt-4 mb-6">
                    {feature.highlights.map((highlight, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <span>Explore Feature</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
