import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Layers, 
  Target, 
  Wallet, 
  BarChart3, 
  ShieldCheck, 
  Bot, 
  ArrowUpRight, 
  CheckCircle2 
} from 'lucide-react';
import type { ActiveNavTab } from '../../store/useFintechStore';

export const FeaturesSection: React.FC = () => {
  const { setActiveView } = useFintechStore();

  const features: {
    icon: React.ElementType;
    title: string;
    tag: string;
    description: string;
    highlights: string[];
    view: ActiveNavTab;
  }[] = [
    {
      icon: Layers,
      title: 'Portfolio Construction',
      tag: 'Modern Portfolio Theory',
      description: 'Personalized multi-asset allocation optimized across direct index funds, equity growth satellites, commodities, and high-yield debt.',
      highlights: ['Monthly Deployment Blueprint', 'MPT Risk-Adjusted Optimization', '12%–16% Compounding Model'],
      view: 'recommendations'
    },
    {
      icon: BarChart3,
      title: 'Global Market Research',
      tag: 'Exchange Feeds',
      description: 'Institutional research terminal covering Indian Equities (NSE/BSE), US Equities (NASDAQ/NYSE), Global ETFs, and Sovereign Gold.',
      highlights: ['Exchange-Verified Quotes & NAVs', 'Personal Watchlist Tracking', 'Detailed Financial Metrics'],
      view: 'market'
    },
    {
      icon: Target,
      title: 'Goal-Based Investing',
      tag: 'Lifecycle Milestones',
      description: 'Quantify capital required for retirement (FIRE), home acquisition, higher education, and financial freedom with inflation-adjusted models.',
      highlights: ['Inflation-Adjusted Projections', 'Monthly SIP Feasibility Math', 'Milestone Probability Scoring'],
      view: 'goals'
    },
    {
      icon: ShieldCheck,
      title: 'Risk Analytics',
      tag: 'Fiduciary Mandate',
      description: 'Multi-factor quantitative assessment separating financial risk capacity from psychological volatility tolerance to prevent panic selling.',
      highlights: ['Capacity vs Tolerance Separation', 'Conservative Guardrail Overrides', 'Downside Drawdown Stress Testing'],
      view: 'recommendations'
    },
    {
      icon: Wallet,
      title: 'Expense Tracking',
      tag: 'Capital Management',
      description: 'Categorize fixed structural commitments versus discretionary leaks to expand your investable surplus without lifestyle friction.',
      highlights: ['Categorized Expenditure Tracking', 'Discretionary Leak Detection', '50/30/20 Rule Distribution'],
      view: 'expenses'
    },
    {
      icon: Bot,
      title: 'AI Advisory Workspace',
      tag: 'VestIQ Intelligence',
      description: 'Interactive Bloomberg + ChatGPT hybrid workspace providing contextual portfolio reasoning, affordability math, and fund comparisons.',
      highlights: ['Context-Aware Reasoning', 'Affordability Simulation', 'Instant Citations & Metrics'],
      view: 'ai'
    }
  ];

  return (
    <section id="features" className="py-24 relative bg-[#060811] border-t border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B1120] border border-white/[0.08] text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
            <span>Institutional Wealth Capabilities</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-[-0.025em]"
            style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
          >
            Engineered For Disciplined Capital Growth
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            SmartVest combines modern portfolio theory, institutional quantitative risk models, and direct zero-commission architecture.
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
                className="bg-[#0F172A] rounded-2xl p-7 border border-white/[0.08] hover:border-[#00D4AA]/30 transition-all flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  {/* Card Header: Icon & Category Tag */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#0B1120] border border-white/[0.08] flex items-center justify-center text-[#00D4AA] group-hover:bg-[#00D4AA]/10 group-hover:border-[#00D4AA]/30 transition-all">
                      <Icon className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#0B1120] border border-white/[0.06]">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-[#00D4AA] transition-colors flex items-center justify-between">
                    <span>{feature.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>
                  
                  <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Quantitative Highlights */}
                <div className="pt-4 border-t border-white/[0.06] space-y-2">
                  {feature.highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4AA] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
