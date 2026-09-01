import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Target, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useMarketQuotes } from '../../hooks/useMarketQuotes';

type ProjectionHorizon = 5 | 10 | 15 | 20 | 25;
type ProjectionScenario = 'Conservative' | 'Base' | 'Optimistic';

// ---- Institutional Tooltips ----
const PremiumTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (!active || !payload || !payload.length) return null;
  const cVal = payload.find((p: any) => p.dataKey === 'corpus')?.value as number;
  const iVal = payload.find((p: any) => p.dataKey === 'invested')?.value as number;
  return (
    <div className="bg-[#0A1022] border border-white/[0.12] rounded-lg p-3 shadow-xl font-sans text-xs">
      <div className="text-white font-bold mb-1.5">{label}</div>
      <div className="text-[#00D4AA] font-mono font-bold">
        Corpus: {formatCurrency(cVal || 0)}
      </div>
      <div className="text-[#8A94A6] font-mono mt-0.5">
        Invested: {formatCurrency(iVal || 0)}
      </div>
    </div>
  );
};

const AllocationTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-[#0A1022] border border-white/[0.12] rounded-lg p-2.5 shadow-xl text-xs">
      <div className="text-white font-bold">{item.name}</div>
      <div className="text-[#00D4AA] font-extrabold font-mono">{item.value}%</div>
    </div>
  );
};

export const OverviewDashboard: React.FC = () => {
  const { 
    user, 
    strategy, 
    formatCurrency, 
    setActiveView, 
    expenses,
    goals
  } = useFintechStore();

  const [selectedHorizon, setSelectedHorizon] = useState<ProjectionHorizon>(15);
  const [selectedScenario, setSelectedScenario] = useState<ProjectionScenario>('Base');
  const [showHealthFactors, setShowHealthFactors] = useState(false);

  // Live Market Quotes for Dashboard
  const dashboardSymbols = ['NIFTY 50', 'SENSEX', 'NASDAQ', 'GOLD (10g)'];
  const { quotes, refetch: refetchMarket } = useMarketQuotes(dashboardSymbols, 30000);

  // Cashflow Numbers — UNCHANGED LOGIC
  const salary = user?.salaryIncome || user?.monthlyIncome || 0;
  const otherInc = user?.otherIncome || 0;
  const totalIncome = salary + otherInc;
  const totalLoggedExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpenses = totalLoggedExpenses > 0 ? totalLoggedExpenses : (Number(user?.monthlyExpenses) || 0);
  const rawSurplus = totalIncome - totalExpenses;
  const isDeficit = rawSurplus < 0;
  const surplus = Math.max(0, rawSurplus);
  const recommendedInvestment = isDeficit ? 0 : (strategy?.recommendedMonthlyInvestment ?? Math.round(surplus * 0.90));
  const risk = user?.riskTolerance || user?.riskCategory || 'Moderate';
  const horizon = user?.investmentHorizon || '10+ Years';
  const primaryGoal = goals.length > 0 ? goals[0] : null;
  const sf = strategy?.suitabilityFactors;
  const riskCapacityScore = sf?.riskCapacityScore ?? 50;
  const effectiveRiskCategory = sf?.effectiveRiskCategory ?? risk;
  const savingsRate = totalIncome > 0 && !isDeficit ? Math.round((surplus / totalIncome) * 100) : 0;
  const emergencyFund = Number(user?.emergencyFund) || Number(user?.existingSavings) || 0;
  const targetEmergencyFund = totalExpenses * 6;
  const emergencyCoverageMonths = totalExpenses > 0 ? (emergencyFund / totalExpenses).toFixed(1) : '0';
  const emergencyFundedPct = targetEmergencyFund > 0 ? Math.min(100, Math.round((emergencyFund / targetEmergencyFund) * 100)) : 0;

  // Financial Health Score Factors — UNCHANGED LOGIC
  const healthFactors = useMemo(() => {
    const savingsScore = Math.min(100, Math.max(10, Math.round((savingsRate / 40) * 100)));
    const emergencyScore = Math.min(100, Math.max(10, Math.round((Number(emergencyCoverageMonths) / 6) * 100)));
    const goalScore = goals.length > 0 ? 80 : 30;
    const debtScore = totalIncome > 0 ? Math.max(20, Math.round(100 - ((totalExpenses * 0.3) / totalIncome) * 100)) : 70;
    const investScore = isDeficit ? 15 : (surplus > 10000 ? 90 : 65);
    const overallScore = Math.round(
      savingsScore * 0.25 + emergencyScore * 0.25 + goalScore * 0.20 + debtScore * 0.15 + investScore * 0.15
    );
    return {
      overall: Math.min(99, Math.max(30, overallScore)),
      savings: savingsScore, emergency: emergencyScore, goals: goalScore, debt: debtScore, investReadiness: investScore
    };
  }, [savingsRate, emergencyCoverageMonths, goals, totalIncome, totalExpenses, isDeficit, surplus]);

  // Dynamic CAGR — UNCHANGED LOGIC
  const scenarioCagr = useMemo(() => {
    let base = 12.0;
    if (risk === 'Aggressive') base = 14.5;
    else if (risk === 'Conservative') base = 8.5;
    else base = 11.5;
    if (selectedScenario === 'Optimistic') return (base + 3.0) / 100;
    if (selectedScenario === 'Conservative') return Math.max(4.0, base - 4.5) / 100;
    return base / 100;
  }, [risk, selectedScenario]);

  // Projection Data — UNCHANGED LOGIC
  const projectionData = useMemo(() => {
    if (recommendedInvestment <= 0) {
      return Array.from({ length: selectedHorizon + 1 }, (_, yr) => ({
        year: yr, label: yr === 0 ? 'Now' : `Yr ${yr}`, invested: 0, corpus: 0, returns: 0,
      }));
    }
    const data = [];
    const monthlyRate = scenarioCagr / 12;
    const initialCorpus = (user?.existingInvestments || 0);
    let currentCorpus = initialCorpus;
    let totalInvested = initialCorpus;
    data.push({ year: 0, label: 'Now', invested: Math.round(totalInvested), corpus: Math.round(currentCorpus), returns: 0 });
    for (let yr = 1; yr <= selectedHorizon; yr++) {
      for (let m = 0; m < 12; m++) {
        currentCorpus = (currentCorpus + recommendedInvestment) * (1 + monthlyRate);
        totalInvested += recommendedInvestment;
      }
      data.push({ year: yr, label: `Yr ${yr}`, invested: Math.round(totalInvested), corpus: Math.round(currentCorpus), returns: Math.max(0, Math.round(currentCorpus - totalInvested)) });
    }
    return data;
  }, [recommendedInvestment, scenarioCagr, selectedHorizon, user]);

  const finalProjection = projectionData.length > 0 ? projectionData[projectionData.length - 1] : null;

  // Allocation Data — UNCHANGED LOGIC
  const allocationPieData = useMemo(() => {
    if (!strategy?.allocations || strategy.allocations.length === 0) {
      return [
        { name: 'Core Equities & Index', value: 40, color: '#00D4AA', monthly: Math.round(recommendedInvestment * 0.40) },
        { name: 'Flexi-Cap Alpha Equities', value: 25, color: '#1E88E5', monthly: Math.round(recommendedInvestment * 0.25) },
        { name: 'US Tech & Global ETFs', value: 15, color: '#8B5CF6', monthly: Math.round(recommendedInvestment * 0.15) },
        { name: 'High-Yield Debt & Liquid', value: 10, color: '#F59E0B', monthly: Math.round(recommendedInvestment * 0.10) },
        { name: 'Sovereign Gold Hedge', value: 10, color: '#00C853', monthly: Math.round(recommendedInvestment * 0.10) },
      ];
    }
    return strategy.allocations.map(a => ({ name: a.name, value: a.percentage, color: a.color || '#00D4AA', monthly: a.monthlyAmount, category: a.category }));
  }, [strategy, recommendedInvestment]);

  const cardStyle = {
    background: '#101827',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
  };

  const riskColor = { Conservative: '#1E88E5', Moderate: '#F59E0B', Aggressive: '#FF5252' }[effectiveRiskCategory as string] || '#F59E0B';

  return (
    <div className="space-y-5 pb-10">

      {/* ================================================================
          1. INSTITUTIONAL CLIENT WELCOME STRIP
      ================================================================ */}
      <section
        style={{ ...cardStyle, padding: '20px 24px' }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20">
              {effectiveRiskCategory} Mandate
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0A1022] text-[#8A94A6] border border-white/[0.06]">
              {horizon}
            </span>
            {primaryGoal && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1E88E5]/10 text-[#1E88E5] border border-[#1E88E5]/20">
                Primary Goal: {primaryGoal.title}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Client Portfolio Overview · {user?.name || 'Investor'}
          </h2>
          <p className="text-xs text-[#8A94A6]">
            Monthly deployment capacity calibrated at{' '}
            <strong className="text-white font-mono">{formatCurrency(surplus)}/mo</strong>{' '}
            targeting {(scenarioCagr * 100).toFixed(1)}% CAGR multi-asset compounding.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={() => setActiveView('recommendations')} 
            className="px-4 py-2 rounded-lg bg-[#00D4AA] text-[#050816] text-xs font-bold hover:bg-[#00D4AA]/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>View Asset Allocation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setActiveView('ai')} 
            className="px-3.5 py-2 rounded-lg bg-[#0A1022] hover:bg-[#141F36] text-white border border-white/[0.08] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00D4AA]" />
            <span>Ask VestIQ</span>
          </button>
        </div>
      </section>

      {/* ================================================================
          2. LIVE MARKET TICKER STRIP
      ================================================================ */}
      <section
        style={{ ...cardStyle, padding: '10px 18px' }}
        className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none text-xs"
      >
        <div className="flex items-center gap-6 min-w-max">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D4AA]" />
            <span className="text-[11px] font-bold text-white tracking-wider uppercase">Market Radar</span>
          </div>
          {dashboardSymbols.map((sym) => {
            const q = quotes[sym];
            const isPos = (q?.changePct ?? 0) >= 0;
            const priceStr = q?.price
              ? (q.currency === 'USD' ? `$${q.price.toLocaleString('en-IN')}` : `₹${q.price.toLocaleString('en-IN')}`)
              : '—';
            return (
              <div key={sym} className="flex items-center gap-2">
                <span className="text-[#8A94A6] font-semibold">{sym}</span>
                <span className="text-white font-mono font-bold">{priceStr}</span>
                {q?.changePct !== undefined && q?.changePct !== null && (
                  <span className={`font-mono font-bold text-[11px] ${isPos ? 'text-[#00C853]' : 'text-[#FF5252]'}`}>
                    {isPos ? '+' : ''}{q.changePct.toFixed(2)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={() => refetchMarket()} className="text-[#8A94A6] hover:text-white p-1 shrink-0 cursor-pointer" title="Refresh Live Data">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* ================================================================
          3. TOP 5 INSTITUTIONAL KPI STRIP
      ================================================================ */}
      <section style={{ ...cardStyle, padding: '16px 20px' }}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-0">
          {[
            { label: 'Monthly Inflow', value: formatCurrency(totalIncome), sub: 'Gross Cash Flow', accent: '#FFFFFF', icon: TrendingUp, iconColor: '#00C853' },
            { label: 'Monthly Outflow', value: formatCurrency(totalExpenses), sub: `${expenses.length} Categories`, accent: '#FFFFFF', icon: TrendingDown, iconColor: '#FF5252' },
            { label: isDeficit ? 'Monthly Deficit' : 'Investable Surplus', value: isDeficit ? `-${formatCurrency(Math.abs(rawSurplus))}` : formatCurrency(surplus), sub: `${savingsRate}% Savings Rate`, accent: isDeficit ? '#FF5252' : '#00D4AA', icon: Activity, iconColor: isDeficit ? '#FF5252' : '#00D4AA' },
            { label: 'Emergency Runway', value: formatCurrency(emergencyFund), sub: `${emergencyCoverageMonths} Months (${emergencyFundedPct}%)`, accent: '#FFFFFF', icon: ShieldCheck, iconColor: '#1E88E5' },
            { label: 'Risk Mandate', value: effectiveRiskCategory, sub: `Capacity: ${riskCapacityScore}/100`, accent: riskColor, icon: Target, iconColor: riskColor },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <div key={i} className={`sm:px-4 py-2 ${i > 0 ? 'sm:border-l sm:border-white/[0.06]' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10.5px] font-bold text-[#8A94A6] uppercase tracking-wider">{kpi.label}</span>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: kpi.iconColor }} />
                </div>
                <div className="text-lg sm:text-xl font-bold font-mono tracking-tight" style={{ color: kpi.accent }}>
                  {kpi.value}
                </div>
                <div className="text-[11px] text-[#8A94A6] truncate mt-0.5">
                  {kpi.sub}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          4. MAIN DUAL-COLUMN AREA: Allocation Ring + Compounding Chart
      ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT 7 COLS: Compounding Growth Projections */}
        <div className="lg:col-span-7 space-y-5">
          <div style={{ ...cardStyle, padding: '22px 24px' }} className="space-y-4">
            
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Projected Wealth Trajectory</h3>
                <p className="text-xs text-[#8A94A6]">Simulated compounding at {(scenarioCagr * 100).toFixed(1)}% CAGR over {selectedHorizon} years</p>
              </div>

              {/* Scenario Toggles */}
              <div className="flex items-center gap-1 bg-[#0A1022] p-1 rounded-lg border border-white/[0.06] text-xs">
                {(['Conservative', 'Base', 'Optimistic'] as ProjectionScenario[]).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setSelectedScenario(sc)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedScenario === sc ? 'bg-[#101827] text-[#00D4AA] border border-white/[0.08]' : 'text-[#8A94A6] hover:text-white'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizon Selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A94A6] font-semibold">Time Horizon:</span>
              <div className="flex items-center gap-1.5">
                {([5, 10, 15, 20, 25] as ProjectionHorizon[]).map((hz) => (
                  <button
                    key={hz}
                    onClick={() => setSelectedHorizon(hz)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold cursor-pointer transition-all ${
                      selectedHorizon === hz ? 'bg-[#00D4AA] text-[#050816]' : 'bg-[#0A1022] text-[#8A94A6] hover:text-white border border-white/[0.04]'
                    }`}
                  >
                    {hz}Y
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#1E88E5" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#5A667A" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                  <YAxis stroke="#5A667A" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v).slice(0, 5)} />
                  <Tooltip content={<PremiumTooltip formatCurrency={formatCurrency} />} />
                  <Area type="monotone" dataKey="corpus" stroke="#00D4AA" strokeWidth={2} fillOpacity={1} fill="url(#corpusGrad)" name="Corpus" />
                  <Area type="monotone" dataKey="invested" stroke="#1E88E5" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#investedGrad)" name="Invested" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Final Target Summary Strip */}
            {finalProjection && (
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg bg-[#0A1022] border border-white/[0.06] text-xs">
                <div>
                  <span className="text-[10.5px] text-[#8A94A6] uppercase tracking-wider block">Target Corpus</span>
                  <div className="text-base font-bold text-[#00D4AA] font-mono">{formatCurrency(finalProjection.corpus)}</div>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#8A94A6] uppercase tracking-wider block">Total Deployed</span>
                  <div className="text-base font-bold text-white font-mono">{formatCurrency(finalProjection.invested)}</div>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#8A94A6] uppercase tracking-wider block">Est. Growth</span>
                  <div className="text-base font-bold text-[#00C853] font-mono">+{formatCurrency(finalProjection.returns)}</div>
                </div>
              </div>
            )}

          </div>

          {/* Strategic Milestones & Goals Tracker */}
          <div style={{ ...cardStyle, padding: '20px 24px' }} className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00D4AA]" />
                <span>Active Financial Goals</span>
              </h3>
              <button onClick={() => setActiveView('goals')} className="text-xs font-semibold text-[#00D4AA] hover:underline cursor-pointer">
                Manage Goals →
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="p-5 text-center text-xs text-[#8A94A6] bg-[#0A1022] rounded-lg">
                No active milestones configured. <button onClick={() => setActiveView('goals')} className="text-[#00D4AA] font-bold underline ml-1 cursor-pointer">Set Goal</button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {goals.slice(0, 3).map((g) => {
                  const pct = Math.min(100, Math.round(((g.currentAmount || 0) / (g.targetAmount || 1)) * 100));
                  return (
                    <div key={g.id} className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{g.title}</span>
                        <span className="font-mono text-[#00D4AA] font-semibold">{formatCurrency(g.targetAmount)} ({g.targetDate})</span>
                      </div>
                      <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#00D4AA] h-full rounded-full" style={{ width: `${Math.max(5, pct)}%` }} />
                      </div>
                      <div className="flex justify-between text-[10.5px] text-[#8A94A6]">
                        <span>Funded: {formatCurrency(g.currentAmount || 0)}</span>
                        <span>{pct}% Completed</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: Portfolio Allocation Ring & Strategy Legend */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Asset Allocation Donut Card */}
          <div style={{ ...cardStyle, padding: '22px 24px' }} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Asset Allocation Ring</h3>
                <p className="text-[11px] text-[#8A94A6]">Target portfolio diversification</p>
              </div>
              <span className="text-xs font-bold text-[#00D4AA] font-mono">
                {formatCurrency(recommendedInvestment)}/mo
              </span>
            </div>

            {/* Recharts Pie Donut */}
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#101827" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<AllocationTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-white font-mono">{allocationPieData.length}</span>
                <span className="text-[9.5px] font-bold text-[#8A94A6] uppercase tracking-wider">ASSETS</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2 pt-1 border-t border-white/[0.06]">
              {allocationPieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-[#0A1022] border border-white/[0.04] text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-white truncate max-w-[130px]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono">
                    <span className="text-[#8A94A6]">{formatCurrency(item.monthly)}/mo</span>
                    <span className="font-bold text-[#00D4AA] w-8 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveView('recommendations')}
              className="w-full py-2.5 rounded-lg bg-[#0A1022] hover:bg-[#141F36] border border-white/[0.08] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Inspect Full Strategy Blueprint</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00D4AA]" />
            </button>
          </div>

          {/* Financial Health Score Audit Widget */}
          <div style={{ ...cardStyle, padding: '20px 24px' }} className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider">Financial Health Audit</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30">
                GRADE A
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-black text-white font-mono leading-none">
                  {healthFactors.overall}<span className="text-sm text-[#8A94A6] font-normal">/100</span>
                </div>
                <span className="text-[11px] text-[#00D4AA] font-semibold mt-1 block">Optimal Stability Profile</span>
              </div>

              <button
                onClick={() => setShowHealthFactors(!showHealthFactors)}
                className="text-xs text-[#8A94A6] hover:text-white underline cursor-pointer"
              >
                {showHealthFactors ? 'Hide Factors' : 'View Breakdown'}
              </button>
            </div>

            {showHealthFactors && (
              <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8A94A6]">Savings Discipline:</span>
                  <strong className="text-white font-mono">{healthFactors.savings}/100</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A6]">Emergency Cushion:</span>
                  <strong className="text-white font-mono">{healthFactors.emergency}/100</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A94A6]">Debt Service Buffer:</span>
                  <strong className="text-white font-mono">{healthFactors.debt}/100</strong>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
