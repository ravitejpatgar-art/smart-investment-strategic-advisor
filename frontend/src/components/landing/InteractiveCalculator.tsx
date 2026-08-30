import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { Calculator, ArrowRight } from 'lucide-react';

export const InteractiveCalculator: React.FC = () => {
  const { formatCurrency, currency, setActiveView } = useFintechStore();


  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(currency === 'INR' ? 25000 : 500);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(14); // 14% CAGR
  const [timeHorizonYears, setTimeHorizonYears] = useState<number>(10);

  // Calculate SIP Compounding
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
    <section id="calculator" className="py-24 bg-mesh-dark relative">
      <div className="max-w-7xl mx-auto px-4 lg:px-12 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
            <Calculator className="w-3.5 h-3.5" /> Interactive Wealth Simulator
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Simulate Your <span className="gradient-text-emerald">Compounding Potential</span>
          </h2>
          <p className="text-slate-400 text-base">
            See how small disciplined monthly investments grow exponentially with SmartVest AI's optimized multi-asset allocation.
          </p>
        </div>

        {/* Main Calculator Card */}
        <div className="max-w-5xl mx-auto glass-panel-glow rounded-3xl p-6 sm:p-10 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders Form (Left Col 7) */}
            <div className="lg:col-span-7 space-y-7">
              
              {/* Slider 1: Monthly SIP */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-300">Monthly Investment Amount</label>
                  <span className="text-lg font-bold text-emerald-400">
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>{formatCurrency(currency === 'INR' ? 1000 : 50)}</span>
                  <span>{formatCurrency(currency === 'INR' ? 100000 : 2500)}</span>
                  <span>{formatCurrency(currency === 'INR' ? 200000 : 5000)}</span>
                </div>
              </div>

              {/* Slider 2: Expected CAGR Return */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-300">Expected Annual Return (CAGR)</label>
                  <span className="text-lg font-bold text-cyan-400">
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>8% (Conservative Debt/Gold)</span>
                  <span>14% (SmartVest Balanced AI)</span>
                  <span>24% (Aggressive Tech/Alpha)</span>
                </div>
              </div>

              {/* Slider 3: Time Horizon */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-slate-300">Investment Horizon</label>
                  <span className="text-lg font-bold text-amber-400">
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 Year</span>
                  <span>15 Years</span>
                  <span>30 Years</span>
                </div>
              </div>

            </div>

            {/* Result Visualizer Card (Right Col 5) */}
            <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projected Portfolio Value</span>
                  <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20">
                    {calculation.wealthMultiplier}x Wealth Multiplier
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                  {formatCurrency(calculation.futureValue)}
                </div>

                {/* Progress bar breakdown */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Invested:</span>
                    <span className="font-semibold text-slate-200">{formatCurrency(calculation.totalInvested)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Estimated Returns:</span>
                    <span className="font-semibold text-emerald-400">+ {formatCurrency(calculation.estimatedGains)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-4 flex">
                  <div 
                    className="bg-slate-500 h-full"
                    style={{ width: `${(calculation.totalInvested / calculation.futureValue) * 100}%` }}
                    title="Invested"
                  />
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full"
                    style={{ width: `${(calculation.estimatedGains / calculation.futureValue) * 100}%` }}
                    title="Gains"
                  />
                </div>
              </div>

              <button
                onClick={() => setActiveView('onboarding')}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Automate This Strategy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
