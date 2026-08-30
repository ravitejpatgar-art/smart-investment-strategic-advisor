import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Bot
} from 'lucide-react';

import { isAuthEnabled } from '../../services/firebase';

export const HeroSection: React.FC = () => {
  const { setActiveView, user } = useFintechStore();
  const authEnabled = isAuthEnabled();

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-mesh-dark">
      {/* Background ambient glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-12 relative z-10">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm font-medium shadow-xl shadow-emerald-950/50 backdrop-blur-md animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Financial Planning & Advisory Platform</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Take Control of Your <br className="hidden sm:inline" />
            <span className="gradient-text-emerald">Financial Future</span> with AI
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            SmartVest AI analyzes your finances, evaluates risk, and provides personalized investment recommendations with institutional-grade intelligence.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            {user?.onboardingCompleted ? (
              <>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => setActiveView('onboarding')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-base backdrop-blur-xl transition-all flex items-center justify-center gap-2.5 hover:border-slate-500 cursor-pointer shadow-lg"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Update Profile & Strategy</span>
                </button>
              </>
            ) : authEnabled ? (
              <>
                <button
                  onClick={() => setActiveView('onboarding')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Begin Financial Onboarding</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => setActiveView('auth')}
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-base backdrop-blur-xl transition-all flex items-center justify-center gap-2.5 hover:border-slate-500 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current text-cyan-400" />
                  <span>Sign In / Register</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveView('onboarding')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Start Financial Analysis</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
                <a
                  href="#calculator"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-base backdrop-blur-xl transition-all flex items-center justify-center gap-2.5 hover:border-slate-500 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current text-cyan-400" />
                  <span>Try SIP Simulator</span>
                </a>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400 font-medium pb-8 border-b border-slate-800/80 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Not a Broker • No Trade Execution</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>SEBI & SEC Aligned Advisory Principles</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>100% Zero-Commission Direct Strategy</span>
            </div>
          </div>
        </div>

        {/* Advisory Preview Dashboard Mockup */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-emerald-500/30 via-slate-700/40 to-cyan-500/20 shadow-2xl shadow-emerald-950/80">
            <div className="bg-slate-950/90 rounded-[22px] p-5 sm:p-8 backdrop-blur-2xl border border-white/10">
              
              {/* Preview Dashboard Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base sm:text-lg">SmartVest AI Strategy Architecture</h2>
                    <p className="text-xs text-slate-400">Institutional Multi-Asset Strategic Allocation</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    AI Advisory Engine Active
                  </span>
                </div>
              </div>

              {/* Grid of advisory preview widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Widget 1: Health Score */}
                <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Health</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">GRADE A</span>
                  </div>
                  <div className="flex items-baseline gap-3 my-2">
                    <span className="text-4xl font-extrabold text-white">88</span>
                    <span className="text-sm font-medium text-emerald-400">/ 100 · Optimal</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full w-[88%]" />
                  </div>
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 6 Months Emergency Runway Protected
                  </p>
                </div>

                {/* Widget 2: Cashflow & Surplus */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Investable Surplus</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" /> 45% Savings Rate
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400 my-2 font-mono">
                    ₹55,000<span className="text-xs text-slate-400 font-normal">/month</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
                    <span>Inflow: ₹1,20,000</span>
                    <span className="text-rose-400 font-semibold">Living Costs: ₹65,000</span>
                  </div>
                </div>

                {/* Widget 3: AI Recommended Allocation Mix */}
                <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Asset Allocation</span>
                    <span className="text-[10px] text-cyan-400 font-medium">Balanced Alpha</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                        <span>UTI Nifty 50 Index Fund</span>
                        <span className="text-emerald-400 font-semibold">35%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[35%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                        <span>Parag Parikh Flexi Cap Fund</span>
                        <span className="text-cyan-400 font-semibold">25%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full w-[25%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                        <span>Sovereign Gold Bonds & SGB</span>
                        <span className="text-amber-400 font-semibold">15%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full w-[15%]" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Strategic Advisory Strip */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-300 font-medium">
                    <strong className="text-white">AI Advisor:</strong> "Trimming ₹2,500/mo from discretionary leaks accelerates your Retirement milestone by 3.2 years."
                  </span>
                </div>
                <button
                  onClick={() => setActiveView('onboarding')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer"
                >
                  Start Your Onboarding →
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
