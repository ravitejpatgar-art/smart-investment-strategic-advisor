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
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-24 overflow-hidden bg-[#050816]">
      {/* Subtle Structural Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A1022] border border-white/[0.08] text-[#8A94A6] text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#00D4AA]" />
              <span className="text-[#FFFFFF]">INSTITUTIONAL WEALTH PLATFORM</span>
              <span className="text-[#5A667A]">|</span>
              <span>FIDUCIARY STRATEGY</span>
            </div>

            {/* Authoritative Main Headline */}
            <h1 
              className="text-3xl sm:text-5xl lg:text-[52px] font-black tracking-[-0.03em] text-white leading-[1.12]"
              style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
            >
              Professional Investment Planning <br className="hidden sm:inline" />
              <span className="text-[#00D4AA]">For Long-Term Wealth Creation</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-[#A0AEC0] leading-relaxed max-w-xl font-normal">
              Personalized wealth strategies powered by institutional-grade analytics and disciplined portfolio construction.
            </p>

            {/* Key Institutional Benefits */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 text-sm text-[#FFFFFF]">
                <CheckCircle2 className="w-4 h-4 text-[#00D4AA] shrink-0" />
                <span><strong>Fiduciary Direct Architecture:</strong> 0% commissions, zero distributor bias.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#FFFFFF]">
                <CheckCircle2 className="w-4 h-4 text-[#00D4AA] shrink-0" />
                <span><strong>Modern Portfolio Theory (MPT):</strong> Multi-asset risk-adjusted diversification.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#FFFFFF]">
                <CheckCircle2 className="w-4 h-4 text-[#00D4AA] shrink-0" />
                <span><strong>Lifecycle Goal Projections:</strong> Inflation-adjusted milestone roadmaps.</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
              <button
                onClick={() => setActiveView(user?.onboardingCompleted ? 'dashboard' : 'onboarding')}
                className="px-6 py-3.5 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-sm hover:bg-[#00D4AA]/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{user?.onboardingCompleted ? 'Open Portfolio Dashboard' : 'Start Analysis'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView('market')}
                className="px-5 py-3.5 rounded-lg bg-[#0A1022] hover:bg-[#101827] text-white border border-white/[0.08] font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Markets</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4 text-xs text-[#8A94A6] border-t border-white/[0.06]">
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
            <div className="bg-[#101827] border border-white/[0.08] rounded-xl p-5 sm:p-6 shadow-2xl relative">
              
              {/* Dashboard Terminal Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0A1022] border border-white/[0.08] flex items-center justify-center">
                    <Layers className="w-4 h-4 text-[#00D4AA]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white tracking-tight">Institutional Portfolio Mandate</div>
                    <div className="text-[11px] text-[#8A94A6]">Client Portfolio #SV-9482 · Balanced Growth</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00D4AA]/10 border border-[#00D4AA]/20 text-[#00D4AA] text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
                  <span>ACTIVE BLUEPRINT</span>
                </div>
              </div>

              {/* Top Quick Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[#0A1022] border border-white/[0.06] rounded-lg p-3">
                  <span className="text-[10.5px] font-semibold text-[#8A94A6] uppercase tracking-wider block mb-0.5">Wealth Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white font-mono">88</span>
                    <span className="text-[11px] text-[#00D4AA] font-bold">Grade A</span>
                  </div>
                </div>

                <div className="bg-[#0A1022] border border-white/[0.06] rounded-lg p-3">
                  <span className="text-[10.5px] font-semibold text-[#8A94A6] uppercase tracking-wider block mb-0.5">Target Allocation</span>
                  <div className="text-xl font-bold text-[#00D4AA] font-mono">
                    {currency === 'INR' ? '₹50,000' : '$1,000'}<span className="text-xs text-[#8A94A6] font-normal">/mo</span>
                  </div>
                </div>

                <div className="bg-[#0A1022] border border-white/[0.06] rounded-lg p-3">
                  <span className="text-[10.5px] font-semibold text-[#8A94A6] uppercase tracking-wider block mb-0.5">Risk Mandate</span>
                  <div className="text-xl font-bold text-white font-mono">
                    68<span className="text-xs text-[#8A94A6] font-normal">/100 · Mod</span>
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-[#0A1022] p-1 rounded-lg border border-white/[0.06] mb-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('allocation')}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'allocation' ? 'bg-[#101827] text-[#00D4AA] shadow-xs' : 'text-[#8A94A6] hover:text-white'
                  }`}
                >
                  <PieIcon className="w-3.5 h-3.5" />
                  <span>Asset Allocation</span>
                </button>
                <button
                  onClick={() => setActiveTab('projection')}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'projection' ? 'bg-[#101827] text-[#00D4AA] shadow-xs' : 'text-[#8A94A6] hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Compounding Growth</span>
                </button>
                <button
                  onClick={() => setActiveTab('mandate')}
                  className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'mandate' ? 'bg-[#101827] text-[#00D4AA] shadow-xs' : 'text-[#8A94A6] hover:text-white'
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
                      <div key={idx} className="bg-[#0A1022] rounded-lg p-2.5 border border-white/[0.04] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-semibold text-[#FFFFFF] truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 font-mono">
                          <span className="text-[#8A94A6]">{item.amount}/mo</span>
                          <span className="font-bold text-[#00D4AA] w-10 text-right">{item.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Multi-Segment Allocation Bar */}
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800 my-2">
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
                <div className="bg-[#0A1022] rounded-lg p-4 border border-white/[0.04] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#8A94A6] uppercase tracking-wider block">15-Year Projected Corpus</span>
                      <div className="text-2xl font-black text-white font-mono mt-0.5">
                        {currency === 'INR' ? '₹3,07,45,000' : '$485,000'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#00D4AA] font-bold block">+13.8% CAGR</span>
                      <span className="text-[10.5px] text-[#8A94A6]">3.4x Capital Multiplier</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8A94A6]">Total Invested Capital:</span>
                      <span className="font-mono text-white">{currency === 'INR' ? '₹90,00,000' : '$180,000'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A94A6]">Estimated Wealth Creation:</span>
                      <span className="font-mono text-[#00D4AA] font-bold">+{currency === 'INR' ? '₹2,17,45,000' : '$305,000'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Risk Profile & Mandate */}
              {activeTab === 'mandate' && (
                <div className="bg-[#0A1022] rounded-lg p-4 border border-white/[0.04] space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A94A6]">Risk Capacity (Income Stability):</span>
                    <strong className="text-[#00D4AA] font-mono">75/100 · High</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00D4AA] h-full w-[75%]" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#8A94A6]">Risk Tolerance (Market Volatility):</span>
                    <strong className="text-[#1E88E5] font-mono">62/100 · Moderate</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#1E88E5] h-full w-[62%]" />
                  </div>

                  <div className="p-2.5 rounded-md bg-[#101827] border border-white/[0.06] text-[#8A94A6] leading-relaxed mt-2">
                    <strong className="text-white">Fiduciary Guardrail:</strong> Strategy capped at Balanced Growth to maintain 6-month liquidity reserve while compounding core equity indices.
                  </div>
                </div>
              )}

              {/* Card Footer Handoff */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-[#8A94A6]">Calibrated via Quantitative Asset Allocation</span>
                <button
                  onClick={() => setActiveView('onboarding')}
                  className="text-[#00D4AA] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
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
