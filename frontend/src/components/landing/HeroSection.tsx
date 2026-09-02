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
  Activity,
  Lock
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveView, user, currency } = useFintechStore();

  // Interactive Tab for Right-Hand Financial Visualizer
  const [activeTab, setActiveTab] = useState<'allocation' | 'projection' | 'mandate'>('allocation');

  const allocationData = [
    { label: 'Core Large-Cap & Index', pct: 35, color: '#00D4AA', amount: currency === 'INR' ? '₹17,500' : '$350' },
    { label: 'Flexi-Cap & Alpha Equities', pct: 25, color: '#38BDF8', amount: currency === 'INR' ? '₹12,500' : '$250' },
    { label: 'US Tech & Global Equities', pct: 15, color: '#818CF8', amount: currency === 'INR' ? '₹7,500' : '$150' },
    { label: 'High-Yield Debt & Liquid', pct: 15, color: '#F59E0B', amount: currency === 'INR' ? '₹7,500' : '$150' },
    { label: 'Gold & Macro Commodity Hedge', pct: 10, color: '#10B981', amount: currency === 'INR' ? '₹5,000' : '$100' },
  ];

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-24 overflow-hidden bg-[#F8FAFC] dark:bg-[#060811]">
      {/* Subtle Structural Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* ============================================================
              LEFT COLUMN: Institutional Value Proposition & CTAs
          ============================================================ */}
          <div className="lg:col-span-6 space-y-7">
            
            {/* Regulatory / Fiduciary Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
              <span className="text-slate-900 dark:text-white font-bold">INSTITUTIONAL WEALTH PLATFORM</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-[#0D9488] dark:text-[#00D4AA]">FIDUCIARY STRATEGY</span>
            </div>

            {/* Authoritative Main Headline */}
            <h1 
              className="text-3xl sm:text-5xl lg:text-[52px] font-black tracking-[-0.035em] text-slate-900 dark:text-white leading-[1.12]"
              style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
            >
              Professional Investment Planning <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] via-teal-600 to-emerald-500 dark:from-[#00D4AA] dark:via-[#38BDF8] dark:to-emerald-300">
                For Long-Term Wealth Creation
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal">
              Personalized wealth strategies powered by institutional-grade analytics, direct zero-commission execution, and disciplined multi-asset portfolio construction.
            </p>

            {/* Key Institutional Benefits */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] dark:text-[#00D4AA] shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Fiduciary Direct Architecture:</strong> 0% commissions, zero distributor bias.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] dark:text-[#00D4AA] shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Modern Portfolio Theory (MPT):</strong> Multi-asset risk-adjusted diversification.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] dark:text-[#00D4AA] shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Lifecycle Goal Projections:</strong> Inflation-adjusted milestone roadmaps.</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
              <button
                onClick={() => setActiveView(user?.onboardingCompleted ? 'dashboard' : 'onboarding')}
                className="px-7 py-3.5 rounded-xl bg-[#00D4AA] text-[#060811] font-bold text-sm hover:bg-[#00BFA5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-[#00D4AA]/25"
              >
                <span>{user?.onboardingCompleted ? 'Open Portfolio Dashboard' : 'Start Analysis'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView('market')}
                className="px-6 py-3.5 rounded-xl bg-white dark:bg-[#0B1120] hover:bg-slate-50 text-slate-800 dark:text-white border border-slate-200 dark:border-white/[0.10] font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <span>Explore Markets</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-5 pt-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#00D4AA]" />
                <span className="text-slate-700 dark:text-slate-300">Non-Custodial Advisory</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-teal-600 dark:text-[#38BDF8]" />
                <span className="text-slate-700 dark:text-slate-300">SEBI & Global Benchmarks</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-700 dark:text-slate-300">256-Bit SSL Encrypted</span>
              </div>
            </div>

          </div>

          {/* ============================================================
              RIGHT COLUMN: Interactive Institutional Financial Dashboard
          ============================================================ */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.10] rounded-2xl p-5 sm:p-6 shadow-md dark:shadow-2xl relative">
              
              {/* Dashboard Terminal Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center">
                    <Layers className="w-4.5 h-4.5 text-[#0D9488] dark:text-[#00D4AA]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Institutional Portfolio Mandate</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Client Portfolio #SV-9482 · Balanced Growth</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-[#00D4AA]/10 border border-emerald-200 dark:border-[#00D4AA]/25 text-emerald-700 dark:text-[#00D4AA] text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#00D4AA] animate-pulse" />
                  <span>ACTIVE BLUEPRINT</span>
                </div>
              </div>

              {/* Top Quick Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Wealth Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">88</span>
                    <span className="text-[10.5px] text-[#0D9488] dark:text-[#00D4AA] font-bold">Grade A</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Target Deployment</span>
                  <div className="text-xl font-bold text-[#0D9488] dark:text-[#00D4AA] font-mono">
                    {currency === 'INR' ? '₹50,000' : '$1,000'}<span className="text-xs text-slate-400 font-normal">/mo</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-white/[0.06] rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Risk Mandate</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                    68<span className="text-xs text-slate-400 font-normal">/100 · Mod</span>
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200 dark:border-white/[0.06] mb-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('allocation')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'allocation' ? 'bg-[#15203B] text-[#00D4AA] shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PieIcon className="w-3.5 h-3.5" />
                  <span>Asset Allocation</span>
                </button>
                <button
                  onClick={() => setActiveTab('projection')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'projection' ? 'bg-[#15203B] text-[#00D4AA] shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Compounding Growth</span>
                </button>
                <button
                  onClick={() => setActiveTab('mandate')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'mandate' ? 'bg-[#15203B] text-[#00D4AA] shadow-xs' : 'text-slate-400 hover:text-white'
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
                      <div key={idx} className="bg-[#0B1120] rounded-xl p-2.5 border border-white/[0.04] flex items-center justify-between text-xs hover:border-white/[0.10] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-semibold text-slate-100 truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 font-mono">
                          <span className="text-slate-400">{item.amount}/mo</span>
                          <span className="font-bold text-[#00D4AA] w-10 text-right">{item.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Multi-Segment Allocation Bar */}
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800 my-2 shadow-inner">
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
                <div className="bg-[#0B1120] rounded-xl p-4 border border-white/[0.04] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10.5px] text-slate-400 uppercase tracking-wider block font-bold">15-Year Projected Corpus</span>
                      <div className="text-2xl font-black text-white font-mono mt-0.5">
                        {currency === 'INR' ? '₹3,07,45,000' : '$485,000'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#00D4AA] font-bold block font-mono">+13.8% CAGR</span>
                      <span className="text-[10.5px] text-slate-400">3.4x Capital Multiplier</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Invested Capital:</span>
                      <span className="font-mono text-white font-semibold">{currency === 'INR' ? '₹90,00,000' : '$180,000'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Wealth Creation:</span>
                      <span className="font-mono text-[#00D4AA] font-bold">+{currency === 'INR' ? '₹2,17,45,000' : '$305,000'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Risk Profile & Mandate */}
              {activeTab === 'mandate' && (
                <div className="bg-[#0B1120] rounded-xl p-4 border border-white/[0.04] space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Risk Capacity (Income Stability):</span>
                    <strong className="text-[#00D4AA] font-mono">75/100 · High</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00D4AA] h-full w-[75%]" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-300">Risk Tolerance (Market Volatility):</span>
                    <strong className="text-[#38BDF8] font-mono">62/100 · Moderate</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#38BDF8] h-full w-[62%]" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#15203B] border border-white/[0.06] text-slate-300 leading-relaxed mt-2 text-xs">
                    <strong className="text-white">Fiduciary Guardrail:</strong> Strategy capped at Balanced Growth to maintain 6-month liquidity reserve while compounding core equity indices.
                  </div>
                </div>
              )}

              {/* Card Footer Handoff */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-400">Calibrated via Quantitative Asset Allocation</span>
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
