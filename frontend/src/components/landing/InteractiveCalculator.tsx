import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { Calculator, ArrowRight } from 'lucide-react';

export const InteractiveCalculator: React.FC = () => {
  const { formatCurrency, currency, setActiveView } = useFintechStore();

  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(currency === 'INR' ? 25000 : 500);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(14); // 14% CAGR
  const [timeHorizonYears, setTimeHorizonYears] = useState<number>(10);

  // Calculate SIP Compounding — UNCHANGED BUSINESS LOGIC
  const calculation = useMemo(() => {
    const months = timeHorizonYears * 12;
    const monthlyRate = expectedReturnRate / 100 / 12;
    const totalInvested = monthlyInvestment * months;
    
    // Future Value = P * [((1 + r)^n - 1) / r] * (1 + r)
    const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const estimatedGains = Math.max(0, futureValue - totalInvested);
    const wealthMultiplier = totalInvested > 0 ? (futureValue / totalInvested).toFixed(1) : '1.0';

    return {
      totalInvested,
      futureValue,
      estimatedGains,
      wealthMultiplier
    };
  }, [monthlyInvestment, expectedReturnRate, timeHorizonYears]);

  return (
    <section id="calculator" className="py-24 bg-[#F8FAFC] dark:bg-[#060811] relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-12 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Calculator className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#00D4AA]" />
            <span>Capital Growth Simulator</span>
          </div>
          <h2 
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-[-0.025em]"
            style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
          >
            Simulate Your Compounding Trajectory
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Project expected capital accumulation over multi-year market cycles using disciplined monthly deployment.
          </p>
        </div>

        {/* Main Calculator Card */}
        <div className="max-w-5xl mx-auto bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-9 border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders Form (Left Col 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Slider 1: Monthly Deployment */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Deployment</label>
                  <span className="text-base font-bold text-[#0D9488] dark:text-[#00D4AA] font-mono">
                    {formatCurrency(monthlyInvestment)}/mo
                  </span>
                </div>
                <input 
                  type="range"
                  min={currency === 'INR' ? 1000 : 50}
                  max={currency === 'INR' ? 200000 : 5000}
                  step={currency === 'INR' ? 1000 : 50}
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-[#0D9488] dark:accent-[#00D4AA]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>{formatCurrency(currency === 'INR' ? 1000 : 50)}</span>
                  <span>{formatCurrency(currency === 'INR' ? 100000 : 2500)}</span>
                  <span>{formatCurrency(currency === 'INR' ? 200000 : 5000)}</span>
                </div>
              </div>

              {/* Slider 2: Expected CAGR Return */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expected Annual Return (CAGR)</label>
                  <span className="text-base font-bold text-[#0284C7] dark:text-[#38BDF8] font-mono">
                    {expectedReturnRate}% p.a.
                  </span>
                </div>
                <input 
                  type="range"
                  min={8}
                  max={24}
                  step={0.5}
                  value={expectedReturnRate}
                  onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-[#0284C7] dark:accent-[#38BDF8]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>8% (Debt/Gold Hedge)</span>
                  <span>14% (SmartVest Balanced)</span>
                  <span>24% (High Alpha Equities)</span>
                </div>
              </div>

              {/* Slider 3: Time Horizon */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Investment Horizon</label>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {timeHorizonYears} Years
                  </span>
                </div>
                <input 
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={timeHorizonYears}
                  onChange={(e) => setTimeHorizonYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-[#0B1120] rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                  <span>1 Year</span>
                  <span>15 Years</span>
                  <span>30 Years</span>
                </div>
              </div>

            </div>

            {/* Result Visualizer Card (Right Col 5) */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-[#0B1120] rounded-2xl p-6 border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-white/[0.06]">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projected Portfolio Value</span>
                  <span className="text-xs font-bold text-[#0D9488] dark:text-[#00D4AA] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#00D4AA]/10 font-mono border border-emerald-200 dark:border-[#00D4AA]/20">
                    {calculation.wealthMultiplier}x Multiplier
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight font-mono">
                  {formatCurrency(calculation.futureValue)}
                </div>

                {/* Breakdown */}
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Total Capital Deployed:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(calculation.totalInvested)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Estimated Compounding Gains:</span>
                    <span className="font-mono font-bold text-[#0D9488] dark:text-[#00D4AA]">+{formatCurrency(calculation.estimatedGains)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-[#15203B] h-2 rounded-full overflow-hidden my-4 flex shadow-inner">
                  <div 
                    className="bg-slate-400 dark:bg-slate-600 h-full"
                    style={{ width: `${(calculation.totalInvested / calculation.futureValue) * 100}%` }}
                    title="Invested Capital"
                  />
                  <div 
                    className="bg-[#0D9488] dark:bg-[#00D4AA] h-full"
                    style={{ width: `${(calculation.estimatedGains / calculation.futureValue) * 100}%` }}
                    title="Compounded Gains"
                  />
                </div>
              </div>

              <button
                onClick={() => setActiveView('onboarding')}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Automate This Allocation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
