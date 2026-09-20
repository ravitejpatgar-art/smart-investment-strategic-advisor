import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Layers, 
  Target, 
  Wallet, 
  BarChart3, 
  ShieldCheck, 
  MessageSquareText, 
  ArrowUpRight 
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
      icon: MessageSquareText,
      title: 'VestIQ Advisory Workspace',
      tag: 'Portfolio Advisory',
      description: 'Contextual advisory workspace for portfolio inquiries, scenario evaluation, and asset comparisons.',
      highlights: ['Context-Aware Analysis', 'Affordability Simulation', 'Instant Citations & Metrics'],
      view: 'ai'
    }
  ];

  return (
    <section id="features" className="py-24 relative bg-[var(--color-bg)] border-t border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-semibold uppercase tracking-wider">
            <span>Institutional Wealth Capabilities</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] tracking-[-0.02em]"
          >
            Engineered For Disciplined Capital Growth
          </h2>
          <p className="text-[var(--color-text-secondary)] text-base sm:text-lg">
            SmartVest combines modern portfolio theory, institutional quantitative risk models, and direct zero-commission architecture.
          </p>
        </div>

        {/* Editorial Feature Grid with Subtle Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border-subtle)] border-t border-b border-[var(--color-border-subtle)]">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const numStr = (idx + 1) < 10 ? `0${idx + 1}` : `${idx + 1}`;
            return (
              <div
                key={idx}
                onClick={() => setActiveView(feature.view)}
                className="py-8 px-6 lg:px-8 flex flex-col justify-between group cursor-pointer hover:bg-[var(--color-surface-soft)]/50 transition-colors"
              >
                <div>
                  {/* Top Metadata: Monospace Index Number & Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-mono font-bold text-[var(--color-accent)]">
                      {numStr}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title & Icon Indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-[var(--color-accent)] stroke-[2] shrink-0" />
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors flex items-center justify-between w-full">
                      <span>{feature.title}</span>
                      <ArrowUpRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>
                  </div>
                  
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 font-normal">
                    {feature.description}
                  </p>
                </div>

                {/* Quantitative Highlights */}
                <div className="pt-3 border-t border-[var(--color-border-subtle)] space-y-1.5">
                  {feature.highlights.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <span className="w-1 h-1 rounded-full bg-[var(--color-accent)] shrink-0" />
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
