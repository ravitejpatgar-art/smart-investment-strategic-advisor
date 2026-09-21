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
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. Header Banner & Preset Bar + Telemetry */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">WHAT-IF WEALTH SIMULATOR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Dynamic Scenario & Compounding Analysis</h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl">
              Model alternative SIP contributions, expected return rates, annual step-ups, and inflation impacts in real-time. Analytical projections only.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['Conservative', 'Base', 'Optimistic', 'Custom'] as ScenarioPreset[]).map((p) => (
              <button
                key={p}
                onClick={() => handleSelectPreset(p)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPreset === p
                    ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-xs'
                    : 'bg-[var(--color-surface-soft)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-[var(--color-surface-soft)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] transition-all ml-1 cursor-pointer shadow-xs"
              title="Reset to Strategy Baseline"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div>
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Total Invested</span>
              <DollarSign className="w-4 h-4 text-[var(--color-text-muted)]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--color-text-primary)]">
              {formatCurrency(activeResult.totalContributed)}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Over {inputs.horizonYears} Years
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Estimated Gain</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">
              +{formatCurrency(activeResult.totalEstimatedGrowth)}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Compound Returns
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Projected Corpus</span>
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--color-accent)]">
              {formatCurrency(activeResult.nominalCorpus)}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Nominal Value at Yr {inputs.horizonYears}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Real Purchasing Power</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
              {formatCurrency(activeResult.realCorpus)}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Inflation-Adjusted ({inputs.inflationPct}% p.a.)
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Body: Inputs & Interactive Comparison Chart */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Column */}
          <div className="space-y-5 lg:pr-6 lg:border-r border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--color-accent)]" />
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Assumption Sliders</h3>
              </div>
              <span className="text-[11px] font-bold text-[var(--color-accent)]">{selectedPreset}</span>
            </div>

            {/* Monthly SIP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
                <span>Monthly SIP</span>
                <span className="text-[var(--color-text-primary)] font-mono font-bold">{formatCurrency(inputs.monthlySip)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="2500"
                value={inputs.monthlySip}
                onChange={(e) => handleInputChange('monthlySip', Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] bg-[var(--color-surface-soft)] rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Expected Return */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
                <span>Expected Annual Return</span>
                <span className="text-[var(--color-text-primary)] font-mono font-bold">{inputs.annualReturnPct.toFixed(1)}% p.a.</span>
              </div>
              <input
                type="range"
                min="4"
                max="25"
                step="0.5"
                value={inputs.annualReturnPct}
                onChange={(e) => handleInputChange('annualReturnPct', Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] bg-[var(--color-surface-soft)] rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Step-Up Rate */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
                <span>Annual Step-Up</span>
                <span className="text-[var(--color-text-primary)] font-mono font-bold">{inputs.annualStepUpPct}%/yr</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={inputs.annualStepUpPct}
                onChange={(e) => handleInputChange('annualStepUpPct', Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] bg-[var(--color-surface-soft)] rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Horizon */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
                <span>Investment Horizon</span>
                <span className="text-[var(--color-text-primary)] font-mono font-bold">{inputs.horizonYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={inputs.horizonYears}
                onChange={(e) => handleInputChange('horizonYears', Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] bg-[var(--color-surface-soft)] rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Inflation Assumption */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
                <span>Assumed Inflation</span>
                <span className="text-[var(--color-text-primary)] font-mono font-bold">{inputs.inflationPct}%/yr</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="0.5"
                value={inputs.inflationPct}
                onChange={(e) => handleInputChange('inflationPct', Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] bg-[var(--color-surface-soft)] rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Lump Sum Addition */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--color-border-subtle)]">
              <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)]">
                <span>Initial / Lump Sum Added</span>
                <span className="text-[var(--color-text-primary)] font-mono font-bold">{formatCurrency(inputs.initialLumpSum || 0)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000000"
                step="50000"
                value={inputs.initialLumpSum || 0}
                onChange={(e) => handleInputChange('initialLumpSum', Number(e.target.value))}
                className="w-full accent-[var(--color-accent)] bg-[var(--color-surface-soft)] rounded-lg h-2 cursor-pointer"
              />
            </div>
          </div>

          {/* Chart Column */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Multi-Scenario Trajectory</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">Comparing Base, Conservative, Optimistic, and Current Simulation</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-[var(--color-accent)] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" /> Current
                </span>
                <span className="flex items-center gap-1 text-blue-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> Base
                </span>
                <span className="flex items-center gap-1 text-purple-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> Real (Inf. Adj)
                </span>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="customGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => currency === 'USD' ? `$${(v / 1000).toFixed(0)}k` : `₹${(v / 100000).toFixed(1)}L`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3 shadow-xl text-xs space-y-1">
                          <div className="text-[var(--color-text-primary)] font-bold mb-1">{label}</div>
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
                  <Area type="monotone" dataKey="custom" name="Simulated Corpus" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#customGradient)" />
                  <Area type="monotone" dataKey="base" name="Base Strategy" stroke="var(--color-text-secondary)" strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
                  <Area type="monotone" dataKey="realValue" name="Purchasing Power" stroke="#A855F7" strokeWidth={1.5} fillOpacity={1} fill="url(#realGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
              <span>Nominal Return: <strong className="text-[var(--color-text-primary)] font-mono">{inputs.annualReturnPct}%</strong></span>
              <span>Real Growth Rate: <strong className="text-purple-400 font-mono">{(inputs.annualReturnPct - inputs.inflationPct).toFixed(1)}%</strong></span>
              <span>Step-Up: <strong className="text-[var(--color-text-primary)] font-mono">{inputs.annualStepUpPct}%/yr</strong></span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Return Sensitivity Matrix Table */}
      <section className="financial-section-card p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
          <Activity className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Return Rate Sensitivity Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                <th className="py-2.5 px-3 font-semibold">Annualized Return</th>
                <th className="py-2.5 px-3 font-semibold">Total Invested</th>
                <th className="py-2.5 px-3 font-semibold">Projected Nominal Corpus</th>
                <th className="py-2.5 px-3 font-semibold">Inflation-Adjusted Real Value</th>
                <th className="py-2.5 px-3 font-semibold">Variance from Current</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {sensitivityData.map((row, idx) => {
                const isCurrent = Math.abs(row.returnPct - inputs.annualReturnPct) < 0.1;
                const diff = row.nominalCorpus - activeResult.nominalCorpus;
                return (
                  <tr key={idx} className={isCurrent ? 'bg-[var(--color-accent)]/10 font-bold' : 'hover:bg-[var(--color-surface-soft)]'}>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={isCurrent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}>{row.returnPct.toFixed(1)}% p.a.</span>
                      {isCurrent && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--color-accent)] text-[var(--color-accent-text)] uppercase font-bold">Active</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[var(--color-text-secondary)]">{formatCurrency(row.totalContributed)}</td>
                    <td className="py-2.5 px-3 font-mono text-[var(--color-text-primary)]">{formatCurrency(row.nominalCorpus)}</td>
                    <td className="py-2.5 px-3 font-mono text-purple-400">{formatCurrency(row.realCorpus)}</td>
                    <td className={`py-2.5 px-3 font-mono ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {diff > 0 ? `+${formatCurrency(diff)}` : (diff < 0 ? `-${formatCurrency(Math.abs(diff))}` : 'Base')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
