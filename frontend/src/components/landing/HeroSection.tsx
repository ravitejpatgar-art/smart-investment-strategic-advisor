import React, { useState } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
export const HeroSection: React.FC = () => {
  const { setActiveView, user, currency } = useFintechStore();

  // Interactive Tab for Right-Hand Financial Visualizer
  const [activeTab, setActiveTab] = useState<'allocation' | 'projection' | 'mandate'>('allocation');

  const allocationData = [
    { label: 'Core Large-Cap & Index', pct: 35, color: '#00D4AA', amount: currency === 'INR' ? '₹17,500' : '$350' },
    { label: 'Flexi-Cap & Alpha Equities', pct: 25, color: '#1E88E5', amount: currency === 'INR' ? '₹12,500' : '$250' },
    { label: 'US Tech & Global Equities', pct: 15, color: '#8B5CF6', amount: currency === 'INR' ? '₹7,500' : '$150' },
    { label: 'High-Yield Debt & Liquid', pct: 15, color: '#F59E0B', amount: currency === 'INR' ? '₹7,500' : '$150' },
    { label: 'Gold & Macro Commodity Hedge', pct: 10, color: '#10B981', amount: currency === 'INR' ? '₹5,000' : '$100' },
  ];

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-24 overflow-hidden bg-[var(--color-bg)]">
      {/* Subtle Structural Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ============================================================
              LEFT COLUMN: Institutional Value Proposition & CTAs
          ============================================================ */}
          <div className="lg:col-span-6 space-y-7">
            
            {/* Regulatory / Fiduciary Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA]" />
              <span className="text-[var(--color-text-primary)]">INSTITUTIONAL WEALTH PLATFORM</span>
              <span className="text-[var(--color-text-muted)]">|</span>
              <span>FIDUCIARY STRATEGY</span>
            </div>

            {/* Authoritative Main Headline */}
            <h1 
              className="text-3xl sm:text-5xl lg:text-[52px] font-black tracking-[-0.03em] text-[var(--color-text-primary)] leading-[1.12]"
            >
              Professional Investment Planning <br className="hidden sm:inline" />
              <span className="text-[var(--color-accent)]">For Long-Term Wealth Creation</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl font-normal">
              Personalized wealth strategies built on quantitative analytics and disciplined portfolio construction.
            </p>

            {/* Key Institutional Benefits */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Multi-asset allocation calibrated for Indian (NSE/BSE) & Global (NASDAQ) equity markets</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Modern Portfolio Theory (MPT) optimization with real-time exchange quotes</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--color-text-primary)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>Conversational portfolio analysis with VestIQ</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {user?.onboardingCompleted ? (
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-6 py-3.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:opacity-90 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-[var(--color-accent-soft)] transition-all cursor-pointer active:scale-95"
                >
                  <span>Go to Client Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveView('onboarding')}
                  className="px-6 py-3.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:opacity-90 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-[var(--color-accent-soft)] transition-all cursor-pointer active:scale-95"
                >
                  <span>Begin Wealth Discovery</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}

              <button
                onClick={() => setActiveView('market')}
                className="px-6 py-3.5 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] border border-[var(--color-border)] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Explore Live Markets</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Security & Fiduciary Trust Badges */}
            <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center gap-6 text-xs text-[var(--color-text-muted)]">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00D4AA]" />
                <span>Non-Custodial Advisory</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#1E88E5]" />
                <span>Multi-Asset Allocation Models</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span>256-Bit Encrypted</span>
              </div>
            </div>

          </div>

          {/* ============================================================
              RIGHT COLUMN: Interactive Institutional Financial Dashboard
          ============================================================ */}
          <div className="lg:col-span-6">
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 sm:p-6 shadow-2xl relative">
              
              {/* Dashboard Terminal Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
                    <Layers className="w-4 h-4 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">Institutional Portfolio Mandate</div>
                    <div className="text-[11px] text-[var(--color-text-secondary)]">Client Portfolio #SV-9482 · Balanced Growth</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-accent-soft)] border border-[var(--color-border-accent)] text-[var(--color-accent)] text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  <span>ACTIVE BLUEPRINT</span>
                </div>
              </div>

              {/* Top Quick Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3">
                  <span className="text-[10.5px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-0.5">Wealth Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-[var(--color-text-primary)] font-mono">88</span>
                    <span className="text-[11px] text-[var(--color-accent)] font-bold">Grade A</span>
                  </div>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3">
                  <span className="text-[10.5px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-0.5">Target Allocation</span>
                  <div className="text-xl font-bold text-[var(--color-accent)] font-mono">
                    {currency === 'INR' ? '₹50,000' : '$1,000'}<span className="text-xs text-[var(--color-text-secondary)] font-normal">/mo</span>
                  </div>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-3">
                  <span className="text-[10.5px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-0.5">Risk Mandate</span>
                  <div className="text-xl font-bold text-[var(--color-text-primary)] font-mono">
                    68<span className="text-xs text-[var(--color-text-secondary)] font-normal">/100 · Mod</span>
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-lg border border-[var(--color-border)] mb-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('allocation')}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'allocation' ? 'bg-[var(--color-card)] text-[var(--color-accent)] shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <PieIcon className="w-3.5 h-3.5" />
                  <span>Asset Allocation</span>
                </button>
                <button
                  onClick={() => setActiveTab('projection')}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'projection' ? 'bg-[var(--color-card)] text-[var(--color-accent)] shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Compounding Growth</span>
                </button>
                <button
                  onClick={() => setActiveTab('mandate')}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'mandate' ? 'bg-[var(--color-card)] text-[var(--color-accent)] shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Risk Profile</span>
                </button>
              </div>

              {/* Tab 1: Asset Allocation Breakdown */}
              {activeTab === 'allocation' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {allocationData.map((item, idx) => (
                      <div key={idx} className="bg-[var(--color-surface)] rounded-lg p-2.5 border border-[var(--color-border)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-semibold text-[var(--color-text-primary)] truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 font-mono">
                          <span className="text-[var(--color-text-secondary)]">{item.amount}/mo</span>
                          <span className="font-bold text-[var(--color-accent)] w-10 text-right">{item.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Multi-Segment Allocation Bar */}
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-[var(--color-surface-hover)] my-2">
                    {allocationData.map((item, idx) => (
                      <div 
                        key={idx} 
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }} 
                        title={`${item.label} (${item.pct}%)`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Projected Compounding Simulation */}
              {activeTab === 'projection' && (
                <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider block">15-Year Projected Corpus</span>
                      <div className="text-2xl font-black text-[var(--color-text-primary)] font-mono mt-0.5">
                        {currency === 'INR' ? '₹3,07,45,000' : '$485,000'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[var(--color-accent)] font-bold block">+13.8% CAGR</span>
                      <span className="text-[10.5px] text-[var(--color-text-secondary)]">3.4x Capital Multiplier</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--color-border)] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Total Invested Capital:</span>
                      <span className="font-mono text-[var(--color-text-primary)]">{currency === 'INR' ? '₹90,00,000' : '$180,000'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Estimated Wealth Creation:</span>
                      <span className="font-mono text-[var(--color-accent)] font-bold">+{currency === 'INR' ? '₹2,17,45,000' : '$305,000'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Risk Profile & Mandate */}
              {activeTab === 'mandate' && (
                <div className="bg-[var(--color-surface)] rounded-lg p-4 border border-[var(--color-border)] space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-secondary)]">Risk Capacity (Income Stability):</span>
                    <strong className="text-[var(--color-accent)] font-mono">75/100 · High</strong>
                  </div>
                  <div className="w-full bg-[var(--color-surface-hover)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[var(--color-accent)] h-full w-[75%]" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[var(--color-text-secondary)]">Risk Tolerance (Market Volatility):</span>
                    <strong className="text-[#1E88E5] font-mono">62/100 · Moderate</strong>
                  </div>
                  <div className="w-full bg-[var(--color-surface-hover)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#1E88E5] h-full w-[62%]" />
                  </div>

                  <div className="p-2.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] leading-relaxed mt-2">
                    <strong className="text-[var(--color-text-primary)]">Fiduciary Guardrail:</strong> Strategy capped at Balanced Growth to maintain 6-month liquidity reserve while compounding core equity indices.
                  </div>
                </div>
              )}

              {/* Card Footer Handoff */}
              <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">Calibrated via Quantitative Asset Allocation</span>
                <button
                  onClick={() => setActiveView('onboarding')}
                  className="text-[var(--color-accent)] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Build Your Blueprint</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
