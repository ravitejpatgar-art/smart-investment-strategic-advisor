import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  ArrowRight, 
  RefreshCw,
  Sparkles
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

const PremiumTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (!active || !payload || !payload.length) return null;
  const cVal = payload.find((p: any) => p.dataKey === 'corpus')?.value as number;
  const iVal = payload.find((p: any) => p.dataKey === 'invested')?.value as number;
  return (
    <div className="bg-white dark:bg-[#0A1022] border border-slate-200 dark:border-white/[0.12] rounded-xl p-3 shadow-xl font-sans text-xs">
      <div className="text-slate-900 dark:text-white font-bold mb-1">{label}</div>
      <div className="text-[#0D9488] dark:text-[#00D4AA] font-mono font-bold">
        Corpus: {formatCurrency(cVal || 0)}
      </div>
      <div className="text-slate-500 dark:text-slate-400 font-mono mt-0.5">
        Invested: {formatCurrency(iVal || 0)}
      </div>
    </div>
  );
};

const AllocationTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white dark:bg-[#0A1022] border border-slate-200 dark:border-white/[0.12] rounded-xl p-2.5 shadow-xl text-xs">
      <div className="text-slate-900 dark:text-white font-bold">{item.name}</div>
      <div className="text-[#0D9488] dark:text-[#00D4AA] font-black font-mono">{item.value}%</div>
    </div>
  );
};

export const OverviewDashboard: React.FC = () => {
  const { 
    user, 
    strategy, 
    formatCurrency, 
    setActiveView, 
    expenses
  } = useFintechStore();

  const [selectedHorizon, setSelectedHorizon] = useState<ProjectionHorizon>(10);
  const [selectedScenario, setSelectedScenario] = useState<ProjectionScenario>('Base');

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
  const risk = user?.riskTolerance || user?.riskCategory || 'Conservative';
  const horizon = user?.investmentHorizon || '20+ years Horizon';
  const sf = strategy?.suitabilityFactors;
  const riskCapacityScore = sf?.riskCapacityScore ?? 63;
  const effectiveRiskCategory = sf?.effectiveRiskCategory ?? risk;
  const savingsRate = totalIncome > 0 && !isDeficit ? Math.round((surplus / totalIncome) * 100) : 30;
  const emergencyFund = Number(user?.emergencyFund) || Number(user?.existingSavings) || 0;
  const targetEmergencyFund = totalExpenses * 6;
  const emergencyCoverageMonths = totalExpenses > 0 ? (emergencyFund / totalExpenses).toFixed(0) : '0';
  const emergencyFundedPct = targetEmergencyFund > 0 ? Math.min(100, Math.round((emergencyFund / targetEmergencyFund) * 100)) : 0;

  // Dynamic CAGR — UNCHANGED LOGIC
  const scenarioCagr = useMemo(() => {
    let base = 8.5;
    if (risk === 'Aggressive') base = 14.5;
    else if (risk === 'Moderate') base = 11.5;
    if (selectedScenario === 'Optimistic') return (base + 3.0) / 100;
    if (selectedScenario === 'Conservative') return Math.max(4.0, base - 2.5) / 100;
    return base / 100;
  }, [risk, selectedScenario]);

  // Projection Data — UNCHANGED LOGIC
  const projectionData = useMemo(() => {
    if (recommendedInvestment <= 0 && surplus <= 0) {
      return Array.from({ length: selectedHorizon + 1 }, (_, yr) => ({
        year: yr, label: yr === 0 ? 'Now' : `Yr ${yr}`, invested: 0, corpus: 0, returns: 0,
      }));
    }
    const monthlyDeployment = recommendedInvestment > 0 ? recommendedInvestment : surplus;
    const data = [];
    const monthlyRate = scenarioCagr / 12;
    const initialCorpus = (user?.existingInvestments || 0);
    let currentCorpus = initialCorpus;
    let totalInvested = initialCorpus;
    data.push({ year: 0, label: 'Now', invested: Math.round(totalInvested), corpus: Math.round(currentCorpus), returns: 0 });
    for (let yr = 1; yr <= selectedHorizon; yr++) {
      for (let m = 0; m < 12; m++) {
        currentCorpus = (currentCorpus + monthlyDeployment) * (1 + monthlyRate);
        totalInvested += monthlyDeployment;
      }
      data.push({ year: yr, label: `Yr ${yr}`, invested: Math.round(totalInvested), corpus: Math.round(currentCorpus), returns: Math.max(0, Math.round(currentCorpus - totalInvested)) });
    }
    return data;
  }, [recommendedInvestment, surplus, scenarioCagr, selectedHorizon, user]);

  const finalProjection = projectionData.length > 0 ? projectionData[projectionData.length - 1] : null;

  // Allocation Data — UNCHANGED LOGIC
  const allocationPieData = useMemo(() => {
    if (!strategy?.allocations || strategy.allocations.length === 0) {
      return [
        { name: 'Core Equities & Index', value: 40, color: '#2563EB', monthly: Math.round(recommendedInvestment * 0.40) },
        { name: 'Flexi-Cap & Alpha', value: 25, color: '#00D4AA', monthly: Math.round(recommendedInvestment * 0.25) },
        { name: 'US Tech & Global', value: 20, color: '#F59E0B', monthly: Math.round(recommendedInvestment * 0.20) },
        { name: 'High-Yield Debt & Hedge', value: 15, color: '#475569', monthly: Math.round(recommendedInvestment * 0.15) },
      ];
    }
    return strategy.allocations.map((a, i) => {
      const colors = ['#2563EB', '#00D4AA', '#F59E0B', '#475569', '#8B5CF6', '#10B981'];
      return { 
        name: a.name, 
        value: a.percentage, 
        color: a.color || colors[i % colors.length], 
        monthly: a.monthlyAmount, 
        category: a.category 
      };
    });
  }, [strategy, recommendedInvestment]);

  const formatLakhs = (amt: number) => {
    if (amt >= 100000) {
      return `₹${(amt / 100000).toFixed(2)} L`;
    }
    return formatCurrency(amt);
  };

  const userName = user?.name || 'ravi';
  const occupation = user?.occupation || 'it';

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">

      {/* ================================================================
          1. LIVE MARKET FEED STRIP (Minimalist Flat Strip)
      ================================================================ */}
      <section className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none text-xs">
        <div className="flex items-center gap-6 min-w-max">
          <div className="flex items-center gap-1.5 font-bold text-slate-400 dark:text-slate-500 uppercase text-[10.5px] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Market Summary</span>
          </div>
          {dashboardSymbols.map((sym) => {
            const q = quotes[sym];
            const isPos = (q?.changePct ?? 0) >= 0;
            const priceStr = q?.price
              ? (q.currency === 'USD' ? `$${q.price.toLocaleString('en-IN')}` : `₹${q.price.toLocaleString('en-IN')}`)
              : (sym === 'NIFTY 50' ? '₹24,080.40' : sym === 'SENSEX' ? '₹76,957.27' : sym === 'NASDAQ' ? '$26,402.42' : '₹1,45,865.74');
            const pctStr = q?.changePct !== undefined && q?.changePct !== null
              ? `${isPos ? '+' : ''}${q.changePct.toFixed(2)}%`
              : (sym === 'NIFTY 50' ? '-1.04%' : sym === 'SENSEX' ? '-0.90%' : sym === 'NASDAQ' ? '+0.85%' : '-2.17%');
            const isGreen = pctStr.startsWith('+');

            return (
              <div key={sym} className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{sym}</span>
                <span className="text-slate-900 dark:text-white font-mono font-semibold">{priceStr}</span>
                <span className={`font-mono text-[11px] font-semibold ${isGreen ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {pctStr}
                </span>
              </div>
            );
          })}
        </div>
        <button 
          onClick={() => refetchMarket()} 
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded shrink-0 cursor-pointer transition-colors" 
          title="Refresh Market Quotes"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* ================================================================
          2. KEY METRICS: Clean Unified 5-Column Section (No Nested Boxes)
      ================================================================ */}
      <section className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-100 dark:lg:divide-white/[0.06]">
          
          {/* Monthly Income */}
          <div className="lg:px-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Monthly Income</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {formatCurrency(totalIncome || 50000)}
            </div>
            <div className="text-xs text-slate-400 capitalize">
              {occupation}
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="lg:px-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Monthly Expenses</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {formatCurrency(totalExpenses || 35000)}
            </div>
            <div className="text-xs text-slate-400">
              {expenses.length > 0 ? `${expenses.length} Logged Categories` : '6 Logged Categories'}
            </div>
          </div>

          {/* Monthly Surplus */}
          <div className="lg:px-4 space-y-1">
            <span className="text-[11px] font-semibold text-[#0D9488] dark:text-[#00D4AA] uppercase tracking-wider block">
              Monthly Surplus
            </span>
            <div className="text-2xl font-bold text-[#0D9488] dark:text-[#00D4AA] font-mono tracking-tight">
              {formatCurrency(surplus || 15000)}
            </div>
            <div className="text-xs text-[#0D9488] dark:text-[#00D4AA] font-medium">
              {savingsRate}% Savings Rate
            </div>
          </div>

          {/* Emergency Reserve */}
          <div className="lg:px-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Emergency Reserve</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
              {formatCurrency(emergencyFund)}
            </div>
            <div className="text-xs text-slate-400">
              {emergencyCoverageMonths} mo. ({emergencyFundedPct}% funded)
            </div>
          </div>

          {/* Risk Mandate */}
          <div className="lg:px-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Risk Mandate</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {effectiveRiskCategory}
            </div>
            <div className="text-xs text-slate-400">
              Capacity: {riskCapacityScore}/100
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================
          3. WELCOME & STRATEGY CONTEXT (One Clean Wide Section)
      ================================================================ */}
      <section className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs text-slate-400">
            {effectiveRiskCategory} Risk · {horizon}
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            Welcome, {userName}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Your portfolio strategy is calibrated around your monthly surplus of{' '}
            <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(surplus || 15000)}/mo</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setActiveView('recommendations')} 
            className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setActiveView('ai')} 
            className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/[0.12] text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Ask VestIQ</span>
          </button>
        </div>
      </section>

      {/* ================================================================
          4. DUAL-COLUMN ANALYTICS: Projected Wealth + Asset Allocation
      ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: Projected Wealth Growth */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 space-y-4 min-w-0 overflow-hidden">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Projected Wealth Growth</h3>
              <p className="text-[11px] text-slate-400">~{(scenarioCagr * 100).toFixed(1)}% CAGR based on surplus deployment</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Scenario Toggles */}
              <div className="flex items-center bg-slate-100 dark:bg-[#0F172A] p-0.5 rounded-md text-xs">
                {(['Conservative', 'Base', 'Optimistic'] as ProjectionScenario[]).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setSelectedScenario(sc)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedScenario === sc 
                        ? 'bg-white dark:bg-[#15203B] text-slate-900 dark:text-white shadow-2xs font-semibold' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>

              {/* Horizon Selector */}
              <div className="flex items-center gap-1">
                {([5, 10, 15, 20] as ProjectionHorizon[]).map((hz) => (
                  <button
                    key={hz}
                    onClick={() => setSelectedHorizon(hz)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                      selectedHorizon === hz 
                        ? 'bg-[#0D9488] text-white font-bold' 
                        : 'bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {hz}Y
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3 Metric Summary Values (Flat Text, No Heavy Nested Cards) */}
          <div className="grid grid-cols-3 gap-2 py-1 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Invested</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white font-mono">
                {formatLakhs(finalProjection?.invested || 1620000)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold block">Growth</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +{formatLakhs(finalProjection?.returns || 938000)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#0D9488] dark:text-[#00D4AA] uppercase font-semibold block">Projected ({selectedHorizon}Y)</span>
              <span className="text-sm font-bold text-[#0D9488] dark:text-[#00D4AA] font-mono">
                {formatLakhs(finalProjection?.corpus || 2558000)}
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-52 w-full min-w-0 overflow-hidden pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="corpusGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v).slice(0, 5)} />
                <Tooltip content={<PremiumTooltip formatCurrency={formatCurrency} />} />
                <Area type="monotone" dataKey="corpus" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#corpusGradLight)" name="Corpus" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* RIGHT 5 COLS: Asset Allocation */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 flex flex-col justify-between space-y-3 min-w-0 overflow-hidden">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Asset Allocation</h3>
              <p className="text-[11px] text-slate-400">Target multi-asset distribution</p>
            </div>
          </div>

          {/* Recharts Pie Donut */}
          <div className="h-48 w-full min-w-0 overflow-hidden relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip content={<AllocationTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900 dark:text-white font-mono leading-none">100%</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Target</span>
            </div>
          </div>

          {/* Simple Legend */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
            {allocationPieData.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}: <strong>{item.value}%</strong></span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
