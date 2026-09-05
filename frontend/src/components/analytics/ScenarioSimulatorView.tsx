import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Sparkles, 
  RotateCcw, 
  TrendingUp, 
  Shield, 
  Activity, 
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';
import { 
  calculateScenarioProjection, 
  getDefaultPresets, 
  calculateSensitivityMatrix,
  type ScenarioPreset,
  type ScenarioInputs
} from '../../services/scenarioEngine';
import { auditLogger } from '../../services/auditLogger';

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 16,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)'
};

export const ScenarioSimulatorView: React.FC = () => {
  const { user, strategy, formatCurrency, currency } = useFintechStore();

  const baseSip = strategy?.recommendedMonthlyInvestment || (user?.monthlyIncome ? Math.round(user.monthlyIncome * 0.3) : 25000);
  const baseHorizon = user?.investmentHorizon === '10+ years' ? 15 : (user?.investmentHorizon === '5 to 10 years' ? 8 : 5);
  
  // Extract base return from strategy if available
  const baseReturn = useMemo(() => {
    if (strategy?.expectedReturnRange) {
      const match = strategy.expectedReturnRange.match(/([\d.]+)%/);
      if (match) return parseFloat(match[1]) + 1.0;
    }
    return user?.riskTolerance === 'Aggressive' ? 14.5 : (user?.riskTolerance === 'Conservative' ? 8.5 : 12.0);
  }, [strategy, user]);

  const presets = useMemo(() => {
    return getDefaultPresets(baseSip, baseHorizon, baseReturn, 6.0);
  }, [baseSip, baseHorizon, baseReturn]);

  const [selectedPreset, setSelectedPreset] = useState<ScenarioPreset>('Base');
  const [inputs, setInputs] = useState<ScenarioInputs>(presets.base);

  // Switch presets
  const handleSelectPreset = (preset: ScenarioPreset) => {
    setSelectedPreset(preset);
    if (preset === 'Conservative') setInputs(presets.conservative);
    else if (preset === 'Base') setInputs(presets.base);
    else if (preset === 'Optimistic') setInputs(presets.optimistic);
    
    auditLogger.system('SCENARIO_ANALYSIS_RUN', 'info', {
      preset,
      horizon: inputs.horizonYears
    });
  };

  const handleInputChange = (field: keyof ScenarioInputs, value: number) => {
    setSelectedPreset('Custom');
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setSelectedPreset('Base');
    setInputs(presets.base);
  };

  // Run scenario calculations
  const activeResult = useMemo(() => {
    return calculateScenarioProjection(inputs, selectedPreset);
  }, [inputs, selectedPreset]);

  const conservativeResult = useMemo(() => calculateScenarioProjection(presets.conservative, 'Conservative'), [presets]);
  const baseResult = useMemo(() => calculateScenarioProjection(presets.base, 'Base'), [presets]);
  const optimisticResult = useMemo(() => calculateScenarioProjection(presets.optimistic, 'Optimistic'), [presets]);

  // Combine chart data for comparison
  const chartData = useMemo(() => {
    const maxYears = Math.max(
      activeResult.trajectory.length,
      baseResult.trajectory.length,
      conservativeResult.trajectory.length,
      optimisticResult.trajectory.length
    );

    const points = [];
    for (let i = 0; i < maxYears; i++) {
      const yearLabel = `Yr ${i}`;
      const customPt = activeResult.trajectory[i];
      const basePt = baseResult.trajectory[i];
      const conPt = conservativeResult.trajectory[i];
      const optPt = optimisticResult.trajectory[i];

      points.push({
        year: yearLabel,
        invested: customPt?.invested ?? basePt?.invested ?? 0,
        custom: customPt?.nominalCorpus ?? null,
        base: basePt?.nominalCorpus ?? null,
        conservative: conPt?.nominalCorpus ?? null,
        optimistic: optPt?.nominalCorpus ?? null,
        realValue: customPt?.realCorpus ?? null
      });
    }
    return points;
  }, [activeResult, baseResult, conservativeResult, optimisticResult]);

  // Sensitivity Matrix
  const sensitivityData = useMemo(() => {
    return calculateSensitivityMatrix(inputs);
  }, [inputs]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Banner & Preset Bar */}
      <div style={{ ...cardStyle, padding: '20px 24px' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00A884]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#00A884]">WHAT-IF WEALTH SIMULATOR</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A]">Dynamic Scenario & Compounding Analysis</h2>
            <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
              Model alternative SIP contributions, expected return rates, annual step-ups, and inflation impacts in real-time. Analytical projections only.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['Conservative', 'Base', 'Optimistic', 'Custom'] as ScenarioPreset[]).map((p) => (
              <button
                key={p}
                onClick={() => handleSelectPreset(p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedPreset === p
                    ? 'bg-[#00D4AA] text-[#050816] shadow-xs'
                    : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] transition-all ml-1 cursor-pointer shadow-xs"
              title="Reset to Strategy Baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Output Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ ...cardStyle, padding: '16px 20px' }}>
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Invested</span>
            <DollarSign className="w-4 h-4 text-[#64748B]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#0F172A]">
            {formatCurrency(activeResult.totalContributed)}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            Over {inputs.horizonYears} Years
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '16px 20px' }}>
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Estimated Gain</span>
            <TrendingUp className="w-4 h-4 text-[#00A884]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#00A884]">
            +{formatCurrency(activeResult.totalEstimatedGrowth)}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            Compound Returns
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '16px 20px' }}>
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Projected Corpus</span>
            <Sparkles className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#3B82F6]">
            {formatCurrency(activeResult.nominalCorpus)}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            Nominal Value at Yr {inputs.horizonYears}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '16px 20px' }}>
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Real Purchasing Power</span>
            <Shield className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#8B5CF6]">
            {formatCurrency(activeResult.realCorpus)}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            Inflation-Adjusted ({inputs.inflationPct}% p.a.)
          </div>
        </div>
      </div>

      {/* 3. Main Body: Inputs & Interactive Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div style={{ ...cardStyle, padding: '20px 24px' }} className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00A884]" />
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Assumption Sliders</h3>
            </div>
            <span className="text-[11px] font-bold text-[#00A884]">{selectedPreset}</span>
          </div>

          {/* Monthly SIP */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[#64748B]">
              <span>Monthly SIP</span>
              <span className="text-[#0F172A] font-mono font-bold">{formatCurrency(inputs.monthlySip)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="2500"
              value={inputs.monthlySip}
              onChange={(e) => handleInputChange('monthlySip', Number(e.target.value))}
              className="w-full accent-[#00D4AA] bg-[#E2E8F0] rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* Expected Return */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[#64748B]">
              <span>Expected Annual Return</span>
              <span className="text-[#0F172A] font-mono font-bold">{inputs.annualReturnPct.toFixed(1)}% p.a.</span>
            </div>
            <input
              type="range"
              min="4"
              max="25"
              step="0.5"
              value={inputs.annualReturnPct}
              onChange={(e) => handleInputChange('annualReturnPct', Number(e.target.value))}
              className="w-full accent-[#00D4AA] bg-[#E2E8F0] rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* Horizon */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[#64748B]">
              <span>Horizon</span>
              <span className="text-[#0F172A] font-mono font-bold">{inputs.horizonYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={inputs.horizonYears}
              onChange={(e) => handleInputChange('horizonYears', Number(e.target.value))}
              className="w-full accent-[#00D4AA] bg-[#E2E8F0] rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* Annual Step-Up */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[#64748B]">
              <span>Annual SIP Step-Up</span>
              <span className="text-[#0F172A] font-mono font-bold">{inputs.annualStepUpPct}% / yr</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={inputs.annualStepUpPct}
              onChange={(e) => handleInputChange('annualStepUpPct', Number(e.target.value))}
              className="w-full accent-[#00D4AA] bg-[#E2E8F0] rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* Inflation Assumption */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[#64748B]">
              <span>Inflation Rate</span>
              <span className="text-[#0F172A] font-mono font-bold">{inputs.inflationPct}% p.a.</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={inputs.inflationPct}
              onChange={(e) => handleInputChange('inflationPct', Number(e.target.value))}
              className="w-full accent-[#00D4AA] bg-[#E2E8F0] rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* Initial Lump Sum */}
          <div className="space-y-1.5 pt-1 border-t border-[#E2E8F0]">
            <div className="flex justify-between text-xs font-semibold text-[#64748B]">
              <span>Starting Portfolio (Optional)</span>
              <span className="text-[#0F172A] font-mono font-bold">{formatCurrency(inputs.initialLumpSum || 0)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000000"
              step="50000"
              value={inputs.initialLumpSum || 0}
              onChange={(e) => handleInputChange('initialLumpSum', Number(e.target.value))}
              className="w-full accent-[#00D4AA] bg-[#E2E8F0] rounded-lg h-2 cursor-pointer"
            />
          </div>
        </div>

        {/* Chart Column */}
        <div style={{ ...cardStyle, padding: '20px 24px' }} className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Multi-Scenario Trajectory</h3>
              <p className="text-xs text-[#64748B]">Comparing Base, Conservative, Optimistic, and Current Simulation</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#008769] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#00D4AA]" /> Current
              </span>
              <span className="flex items-center gap-1 text-[#3B82F6] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Base
              </span>
              <span className="flex items-center gap-1 text-[#8B5CF6] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Real (Inf. Adj)
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="customGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => currency === 'USD' ? `$${(v / 1000).toFixed(0)}k` : `₹${(v / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xl text-xs space-y-1">
                        <div className="text-[#0F172A] font-bold mb-1">{label}</div>
                        {payload.map((entry: any, index: number) => (
                          <div key={index} style={{ color: entry.color }} className="font-mono flex justify-between gap-4">
                            <span>{entry.name}:</span>
                            <span className="font-bold">{formatCurrency(entry.value)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="custom" name="Simulated Corpus" stroke="#00D4AA" strokeWidth={2} fillOpacity={1} fill="url(#customGradient)" />
                <Area type="monotone" dataKey="base" name="Base Strategy" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
                <Area type="monotone" dataKey="realValue" name="Purchasing Power" stroke="#8B5CF6" strokeWidth={1.5} fillOpacity={1} fill="url(#realGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span>Nominal Return: <strong className="text-[#0F172A] font-mono">{inputs.annualReturnPct}%</strong></span>
            <span>Real Growth Rate: <strong className="text-[#8B5CF6] font-mono">{(inputs.annualReturnPct - inputs.inflationPct).toFixed(1)}%</strong></span>
            <span>Step-Up: <strong className="text-[#0F172A] font-mono">{inputs.annualStepUpPct}%/yr</strong></span>
          </div>
        </div>

      </div>

      {/* 4. Return Sensitivity Matrix Table */}
      <div style={{ ...cardStyle, padding: '20px 24px' }}>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E2E8F0]">
          <Activity className="w-4 h-4 text-[#00A884]" />
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Return Rate Sensitivity Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                <th className="py-2.5 px-3 font-semibold">Annualized Return</th>
                <th className="py-2.5 px-3 font-semibold">Total Invested</th>
                <th className="py-2.5 px-3 font-semibold">Projected Nominal Corpus</th>
                <th className="py-2.5 px-3 font-semibold">Inflation-Adjusted Real Value</th>
                <th className="py-2.5 px-3 font-semibold">Variance from Current</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {sensitivityData.map((row, idx) => {
                const isCurrent = Math.abs(row.returnPct - inputs.annualReturnPct) < 0.1;
                const diff = row.nominalCorpus - activeResult.nominalCorpus;
                return (
                  <tr key={idx} className={isCurrent ? 'bg-[#00D4AA]/10 font-bold' : 'hover:bg-[#F8FAFC]'}>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={isCurrent ? 'text-[#008769]' : 'text-[#0F172A]'}>{row.returnPct.toFixed(1)}% p.a.</span>
                      {isCurrent && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-[#00D4AA] text-[#050816] uppercase font-bold">Active</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#64748B]">{formatCurrency(row.totalContributed)}</td>
                    <td className="py-2.5 px-3 font-mono text-[#0F172A]">{formatCurrency(row.nominalCorpus)}</td>
                    <td className="py-2.5 px-3 font-mono text-[#8B5CF6]">{formatCurrency(row.realCorpus)}</td>
                    <td className={`py-2.5 px-3 font-mono ${diff >= 0 ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
                      {diff > 0 ? `+${formatCurrency(diff)}` : (diff < 0 ? `-${formatCurrency(Math.abs(diff))}` : 'Base')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
