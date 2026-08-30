import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Target, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Compass,
  Sparkles,
  Send
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

export const OverviewDashboard: React.FC = () => {
  const { 
    user, 
    strategy, 
    formatCurrency, 
    setActiveView, 
    expenses,
    goals
  } = useFintechStore();

  const [selectedHorizon, setSelectedHorizon] = useState<ProjectionHorizon>(10);
  const [selectedScenario, setSelectedScenario] = useState<ProjectionScenario>('Base');
  const [showHealthFactors, setShowHealthFactors] = useState(false);
  const [quickAiInput, setQuickAiInput] = useState('');

  // Live Market Quotes for Dashboard
  const dashboardSymbols = ['NIFTY 50', 'SENSEX', 'NASDAQ', 'GOLD (10g)'];
  const { quotes, refetch: refetchMarket } = useMarketQuotes(dashboardSymbols, 30000);

  // Cashflow Numbers
  const salary = user?.salaryIncome || user?.monthlyIncome || 0;
  const otherInc = user?.otherIncome || 0;
  const totalIncome = salary + otherInc;

  const totalLoggedExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpenses = totalLoggedExpenses > 0 ? totalLoggedExpenses : (Number(user?.monthlyExpenses) || 0);
  
  const rawSurplus = totalIncome - totalExpenses;
  const isDeficit = rawSurplus < 0;
  const surplus = Math.max(0, rawSurplus);

  // Allocation values from Strategy Engine
  const recommendedInvestment = isDeficit ? 0 : (strategy?.recommendedMonthlyInvestment ?? Math.round(surplus * 0.90));

  // Profile & Risk
  const risk = user?.riskTolerance || user?.riskCategory || 'Moderate';
  const horizon = user?.investmentHorizon || '10+ Years';
  const primaryGoal = goals.length > 0 ? goals[0] : null;

  // Risk breakdown from Strategy Engine
  const sf = strategy?.suitabilityFactors;
  const riskCapacityScore = sf?.riskCapacityScore ?? 50;
  const effectiveRiskCategory = sf?.effectiveRiskCategory ?? risk;

  // Occupation sanitizer
  const GARBAGE_PATTERNS = /^(uyu|undefined|null|n\/a|test|demo|placeholder|sample|unknown|string|none)$/i;
  const rawOccupation = user?.occupation?.trim() || '';
  const occupation = rawOccupation && !GARBAGE_PATTERNS.test(rawOccupation) ? rawOccupation : null;

  const savingsRate = totalIncome > 0 && !isDeficit ? Math.round((surplus / totalIncome) * 100) : 0;

  // Emergency Fund Metrics
  const emergencyFund = Number(user?.emergencyFund) || Number(user?.existingSavings) || 0;
  const targetEmergencyFund = totalExpenses * 6;
  const emergencyTarget = targetEmergencyFund;
  const emergencyGap = Math.max(0, emergencyTarget - emergencyFund);
  const emergencyPct = targetEmergencyFund > 0 ? Math.min(100, Math.round((emergencyFund / targetEmergencyFund) * 100)) : 0;
  const emergencyMonths = totalExpenses > 0 ? (emergencyFund / totalExpenses).toFixed(1) : '0';
  const emergencyFundedPct = emergencyPct;
  const emergencyCoverageMonths = Number(emergencyMonths);

  // Financial Health Score Factors
  const healthFactors = useMemo(() => {
    const savingsScore = Math.min(100, Math.max(10, Math.round((savingsRate / 40) * 100)));
    const emergencyScore = Math.min(100, Math.max(10, Math.round((emergencyCoverageMonths / 6) * 100)));
    const goalScore = goals.length > 0 ? 80 : 30;
    const debtScore = totalIncome > 0 ? Math.max(20, Math.round(100 - ((totalExpenses * 0.3) / totalIncome) * 100)) : 70;
    const investScore = isDeficit ? 15 : (surplus > 10000 ? 90 : 65);

    const overallScore = Math.round(
      savingsScore * 0.25 + 
      emergencyScore * 0.25 + 
      goalScore * 0.20 + 
      debtScore * 0.15 + 
      investScore * 0.15
    );

    return {
      overall: Math.min(99, Math.max(30, overallScore)),
      savings: savingsScore,
      emergency: emergencyScore,
      goals: goalScore,
      debt: debtScore,
      investReadiness: investScore
    };
  }, [savingsRate, emergencyCoverageMonths, goals, totalIncome, totalExpenses, isDeficit, surplus]);

  // Dynamic CAGR by Risk Profile
  const scenarioCagr = useMemo(() => {
    let base = 12.0;
    if (risk === 'Aggressive') base = 14.5;
    else if (risk === 'Conservative') base = 8.5;
    else base = 11.5;

    if (selectedScenario === 'Optimistic') return (base + 3.0) / 100;
    if (selectedScenario === 'Conservative') return Math.max(4.0, base - 4.5) / 100;
    return base / 100;
  }, [risk, selectedScenario]);

  // Dynamic Wealth Compounding Projection Data
  const projectionData = useMemo(() => {
    if (recommendedInvestment <= 0) {
      return Array.from({ length: selectedHorizon + 1 }, (_, yr) => ({
        year: yr,
        label: yr === 0 ? 'Now' : `Yr ${yr}`,
        invested: 0,
        corpus: 0,
        returns: 0,
      }));
    }

    const data = [];
    const monthlyRate = scenarioCagr / 12;
    const initialCorpus = (user?.existingInvestments || 0);

    let currentCorpus = initialCorpus;
    let totalInvested = initialCorpus;

    data.push({
      year: 0,
      label: 'Now',
      invested: Math.round(totalInvested),
      corpus: Math.round(currentCorpus),
      returns: 0,
    });

    for (let yr = 1; yr <= selectedHorizon; yr++) {
      for (let m = 0; m < 12; m++) {
        currentCorpus = (currentCorpus + recommendedInvestment) * (1 + monthlyRate);
        totalInvested += recommendedInvestment;
      }
      data.push({
        year: yr,
        label: `Yr ${yr}`,
        invested: Math.round(totalInvested),
        corpus: Math.round(currentCorpus),
        returns: Math.max(0, Math.round(currentCorpus - totalInvested)),
      });
    }

    return data;
  }, [recommendedInvestment, scenarioCagr, selectedHorizon, user]);

  const finalProjection = projectionData.length > 0 ? projectionData[projectionData.length - 1] : null;

  // Donut Chart Allocation Data
  const allocationPieData = useMemo(() => {
    if (!strategy?.allocations || strategy.allocations.length === 0) {
      return [
        { name: 'Core Equities', value: 40, color: '#14B8A6', monthly: Math.round(recommendedInvestment * 0.40) },
        { name: 'Flexi-Cap Alpha', value: 25, color: '#6366F1', monthly: Math.round(recommendedInvestment * 0.25) },
        { name: 'Global Tech', value: 15, color: '#06B6D4', monthly: Math.round(recommendedInvestment * 0.15) },
        { name: 'Liquid Buffer', value: 10, color: '#8B5CF6', monthly: Math.round(recommendedInvestment * 0.10) },
        { name: 'Gold Hedge', value: 10, color: '#F59E0B', monthly: Math.round(recommendedInvestment * 0.10) },
      ];
    }
    return strategy.allocations.map(a => ({
      name: a.name,
      value: a.percentage,
      color: a.color || '#14B8A6',
      monthly: a.monthlyAmount,
      category: a.category
    }));
  }, [strategy, recommendedInvestment]);

  return (
    <div className="space-y-4 pb-8">

      {/* =========================================================================
          1. MARKET STRIP (Top Horizontal Bar)
      ========================================================================= */}
      <section className="bg-white border border-[#E7E9F0] rounded-xl px-4 py-2.5 flex items-center justify-between overflow-x-auto gap-4 scrollbar-none shadow-xs">
        <div className="flex items-center gap-5 min-w-max">
          <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-teal-600">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="tracking-wider uppercase">MARKET FEED</span>
          </div>

          {dashboardSymbols.map((sym) => {
            const q = quotes[sym];
            const isPos = (q?.changePct ?? 0) >= 0;
            const priceStr = q?.price 
              ? (q.currency === 'USD' ? `$${q.price.toLocaleString('en-IN')}` : `₹${q.price.toLocaleString('en-IN')}`)
              : 'Live Feed';

            return (
              <div key={sym} className="flex items-center gap-2 text-[13.5px]">
                <span className="font-medium text-[#667085]">{sym}</span>
                <span className="font-mono font-bold text-[#172033] text-[14.5px]">{priceStr}</span>
                {q?.changePct !== undefined && q?.changePct !== null && (
                  <span className={`font-mono text-[13px] font-semibold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPos ? '+' : ''}{q.changePct.toFixed(2)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => refetchMarket()}
          className="p-1.5 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="Refresh Market Quotes"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* =========================================================================
          2. HORIZONTAL KPI STRIP (Inline 5-Metric Strip with Dividers)
      ========================================================================= */}
      <section className="bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#E7E9F0] gap-4 md:gap-0">
          
          {/* Monthly Inflow */}
          <div className="px-3 md:px-4 py-1 space-y-0.5">
            <span className="text-[12px] font-semibold text-[#667085] uppercase tracking-wider block">Monthly Income</span>
            <div className="text-[24px] sm:text-[26px] font-black text-[#172033] font-mono leading-tight">
              {formatCurrency(totalIncome)}
            </div>
            <span className="text-[12px] text-[#98A2B3]">{occupation || 'Active Primary Income'}</span>
          </div>

          {/* Monthly Outflow */}
          <div className="px-3 md:px-4 py-1 space-y-0.5 pt-3 md:pt-1">
            <span className="text-[12px] font-semibold text-[#667085] uppercase tracking-wider block">Monthly Expenses</span>
            <div className="text-[24px] sm:text-[26px] font-black text-slate-700 font-mono leading-tight">
              {formatCurrency(totalExpenses)}
            </div>
            <span className="text-[12px] text-[#98A2B3]">{expenses.length} Logged Categories</span>
          </div>

          {/* Monthly Surplus (Dominant Anchor) */}
          <div className="px-3 md:px-4 py-1 space-y-0.5 pt-3 md:pt-1 bg-teal-50/50 md:bg-transparent rounded-lg md:rounded-none">
            <div className="flex items-center justify-between">
              <span className={`text-[12px] font-bold uppercase tracking-wider ${isDeficit ? 'text-rose-700' : 'text-teal-700'}`}>
                {isDeficit ? 'Monthly Deficit' : 'Monthly Surplus'}
              </span>
              <Zap className={`w-3.5 h-3.5 ${isDeficit ? 'text-rose-600' : 'text-teal-600'}`} />
            </div>
            <div className={`text-[26px] sm:text-[28px] font-black font-mono leading-tight ${isDeficit ? 'text-rose-600' : 'text-teal-600'}`}>
              {isDeficit ? `-${formatCurrency(Math.abs(rawSurplus))}` : formatCurrency(surplus)}
            </div>
            <span className="text-[12px] font-semibold text-teal-800">{savingsRate}% Savings Rate</span>
          </div>

          {/* Emergency Fund */}
          <div className="px-3 md:px-4 py-1 space-y-0.5 pt-3 md:pt-1">
            <span className="text-[12px] font-semibold text-[#667085] uppercase tracking-wider block">Emergency Reserve</span>
            <div className="text-[24px] sm:text-[26px] font-black text-[#172033] font-mono leading-tight">
              {formatCurrency(emergencyFund)}
            </div>
            <span className="text-[12px] text-[#667085]">{emergencyCoverageMonths} mo. ({emergencyFundedPct}% funded)</span>
          </div>

          {/* Risk Profile */}
          <div className="px-3 md:px-4 py-1 space-y-0.5 pt-3 md:pt-1">
            <span className="text-[12px] font-semibold text-[#667085] uppercase tracking-wider block">Risk Mandate</span>
            <div className="text-[22px] sm:text-[24px] font-black text-[#172033] leading-tight">
              {effectiveRiskCategory}
            </div>
            <span className="text-[12px] text-[#667085]">Capacity Score: <strong className="font-mono text-[#172033]">{riskCapacityScore}/100</strong></span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. DASHBOARD HERO (Compact Strategy Welcome Banner)
      ========================================================================= */}
      <section className="bg-gradient-to-r from-white via-slate-50 to-teal-50/40 border border-[#E7E9F0] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-teal-700">
              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold border border-teal-200">
                {effectiveRiskCategory} Risk
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[#667085]">{horizon} Horizon</span>
              {primaryGoal && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#667085]">Goal: <strong className="text-[#172033] font-semibold">{primaryGoal.title}</strong></span>
                </>
              )}
            </div>

            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#172033] tracking-tight leading-tight">
              Welcome, {user?.name || 'Investor'}
            </h2>

            <p className="text-[14px] text-[#667085] max-w-3xl leading-relaxed">
              Your SmartVest strategy is calibrated around your cashflow surplus of <strong className="text-[#172033] font-mono">{formatCurrency(surplus)}/mo</strong>, risk capacity, and long-term milestone goals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveView('recommendations')}
              className="glow-btn-primary px-4 py-2 rounded-lg text-white font-semibold text-[13.5px] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>View Recommendations</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveView('ai')}
              className="glow-btn-secondary px-4 py-2 rounded-lg text-[13.5px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Ask VestIQ</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PRIMARY ANALYTICS: 2-Column Grid (Projected Wealth + Asset Allocation Donut)
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Projected Wealth AreaChart (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 space-y-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E7E9F0]">
            <div>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#172033]">Projected Wealth Growth</h3>
              <p className="text-[13px] text-[#667085]">Compounding projection at ~{(scenarioCagr * 100).toFixed(1)}% CAGR based on surplus deployment.</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Scenario */}
              <div className="flex bg-[#F8F9FC] rounded-lg p-0.5 border border-[#E7E9F0]">
                {(['Conservative', 'Base', 'Optimistic'] as ProjectionScenario[]).map((scen) => (
                  <button
                    key={scen}
                    onClick={() => setSelectedScenario(scen)}
                    className={`px-2.5 py-1 rounded text-[12px] font-semibold transition-all cursor-pointer ${
                      selectedScenario === scen ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-[#667085] hover:text-[#172033]'
                    }`}
                  >
                    {scen}
                  </button>
                ))}
              </div>

              {/* Horizon */}
              <div className="flex bg-[#F8F9FC] rounded-lg p-0.5 border border-[#E7E9F0]">
                {([5, 10, 15, 20, 25] as ProjectionHorizon[]).map((hz) => (
                  <button
                    key={hz}
                    onClick={() => setSelectedHorizon(hz)}
                    className={`px-2.5 py-1 rounded text-[12px] font-semibold transition-all cursor-pointer ${
                      selectedHorizon === hz ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-[#667085] hover:text-[#172033]'
                    }`}
                  >
                    {hz}Y
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3 Metrics Row */}
          {finalProjection && (
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] space-y-0.5">
                <span className="text-[11.5px] text-[#667085] uppercase font-semibold block">Total Invested</span>
                <span className="text-[15px] font-bold text-[#172033] font-mono">{formatCurrency(finalProjection.invested)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200/60 space-y-0.5">
                <span className="text-[11.5px] text-teal-800 uppercase font-semibold block">Estimated Growth</span>
                <span className="text-[15px] font-bold text-teal-700 font-mono">+{formatCurrency(finalProjection.returns)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-white space-y-0.5">
                <span className="text-[11.5px] text-slate-300 uppercase font-semibold block">Projected Corpus ({selectedHorizon}Y)</span>
                <span className="text-[16px] sm:text-[17px] font-black text-teal-300 font-mono">{formatCurrency(finalProjection.corpus)}</span>
              </div>
            </div>
          )}

          {/* Recharts Area Chart */}
          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="corpusGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis 
                  stroke="#94A3B8" 
                  tick={{ fontSize: 11 }} 
                  tickLine={false}
                  tickFormatter={(val) => {
                    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
                    return `₹${val}`;
                  }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const cVal = payload.find(p => p.dataKey === 'corpus')?.value as number;
                    const iVal = payload.find(p => p.dataKey === 'invested')?.value as number;
                    return (
                      <div className="bg-white border border-[#E7E9F0] rounded-lg p-2.5 text-xs shadow-md space-y-1">
                        <div className="font-bold text-[#172033] text-[13px]">{label}</div>
                        <div className="text-teal-700 font-mono font-semibold">Corpus: {formatCurrency(cVal || 0)}</div>
                        <div className="text-[#667085] font-mono">Invested: {formatCurrency(iVal || 0)}</div>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="corpus" stroke="#14B8A6" strokeWidth={2.5} fillOpacity={1} fill="url(#corpusGradLight)" />
                <Area type="monotone" dataKey="invested" stroke="#6366F1" strokeWidth={1.5} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-1.5 border-t border-[#E7E9F0] text-[11.5px] text-[#667085]">
            <strong className="text-[#172033]">MODEL ASSUMPTION:</strong> Compounding illustrated at ~{(scenarioCagr * 100).toFixed(1)}% CAGR. Past performance does not guarantee future returns.
          </div>
        </div>

        {/* Right: Asset Allocation Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E9F0]">
            <div>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#172033]">Asset Allocation</h3>
              <p className="text-[13px] text-[#667085]">Target multi-asset distribution</p>
            </div>
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              {strategy?.diversificationScore || 88}/100 Fit
            </span>
          </div>

          {/* Donut Chart Visual */}
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="bg-white border border-[#E7E9F0] rounded-lg p-2 text-xs shadow-md">
                        <div className="font-bold text-[#172033]">{item.name}</div>
                        <div className="text-teal-700 font-mono font-bold">{item.value}%</div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[18px] font-black text-[#172033] font-mono leading-none">100%</span>
              <span className="text-[10.5px] text-[#667085] uppercase font-semibold mt-0.5">ALLOCATED</span>
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-1.5 pt-1">
            {allocationPieData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[13px] py-1 border-b border-[#F8F9FC] last:border-0">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#172033] font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold text-[#172033] shrink-0">
                  <span>{item.value}%</span>
                  {item.monthly && (
                    <span className="text-[11.5px] font-normal text-[#667085]">({formatCurrency(item.monthly)})</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveView('recommendations')}
            className="w-full py-2 rounded-lg bg-[#F8F9FC] hover:bg-slate-100 border border-[#E7E9F0] text-[#172033] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Explore All Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
          </button>
        </div>

      </section>

      {/* =========================================================================
          5. SECONDARY ANALYTICS: Financial Health + Emergency / Goal (2-Column)
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Financial Health Score (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E9F0]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h3 className="text-[17px] font-bold text-[#172033]">Financial Health Score</h3>
            </div>
            <button
              onClick={() => setShowHealthFactors(!showHealthFactors)}
              className="text-[12.5px] text-teal-700 hover:underline font-semibold cursor-pointer"
            >
              {showHealthFactors ? 'Hide Details' : 'View Factors'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Radial Gauge */}
            <div className="relative flex items-center justify-center shrink-0" style={{ width: 84, height: 84 }}>
              <svg width={84} height={84} viewBox="0 0 84 84" className="-rotate-90">
                <circle cx={42} cy={42} r={34} fill="none" stroke="#E2E8F0" strokeWidth={7} />
                <circle
                  cx={42} cy={42} r={34} fill="none" stroke="#14B8A6" strokeWidth={7}
                  strokeDasharray={`${(2 * Math.PI * 34 * healthFactors.overall) / 100} ${2 * Math.PI * 34}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[32px] font-black text-[#172033] font-mono leading-none">{healthFactors.overall}</span>
                <span className="text-[11.5px] text-[#667085] font-semibold leading-none mt-0.5">/ 100</span>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#667085]">Savings Discipline</span>
                  <span className="font-mono font-bold text-[#172033]">{healthFactors.savings}%</span>
                </div>
                <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${healthFactors.savings}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#667085]">Emergency Runway</span>
                  <span className="font-mono font-bold text-[#172033]">{healthFactors.emergency}%</span>
                </div>
                <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${healthFactors.emergency}%` }} />
                </div>
              </div>
            </div>
          </div>

          {showHealthFactors && (
            <div className="pt-2 border-t border-[#E7E9F0] space-y-1.5 text-[12.5px] animate-fade-in">
              <div className="flex justify-between text-[#667085]">
                <span>Goal Readiness:</span>
                <span className="font-mono font-semibold text-[#172033]">{healthFactors.goals}/100</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Debt Manageability:</span>
                <span className="font-mono font-semibold text-[#172033]">{healthFactors.debt}/100</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>Investment Readiness:</span>
                <span className="font-mono font-semibold text-[#172033]">{healthFactors.investReadiness}/100</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Emergency Fund + Goal Progress (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E9F0]">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <h3 className="text-[17px] font-bold text-[#172033]">Milestone & Safety Reserves</h3>
            </div>
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Active Tracking
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Emergency Reserve */}
            <div className="p-3 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-[#667085] font-semibold uppercase">Emergency Fund</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                  emergencyFundedPct >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {emergencyCoverageMonths} mo
                </span>
              </div>
              <div className="text-[18px] font-bold text-[#172033] font-mono">
                {formatCurrency(emergencyFund)}
              </div>
              <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600" style={{ width: `${emergencyFundedPct}%` }} />
              </div>
              <div className="text-[11.5px] text-[#667085]">
                Gap: <strong className="font-mono text-[#172033]">{formatCurrency(emergencyGap)}</strong>
              </div>
            </div>

            {/* Primary Goal */}
            <div className="p-3 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-[#667085] font-semibold uppercase truncate">
                  {primaryGoal?.title || 'Wealth Goal'}
                </span>
                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                  Target
                </span>
              </div>
              <div className="text-[18px] font-bold text-indigo-700 font-mono">
                {formatCurrency(primaryGoal?.targetAmount || 10000000)}
              </div>
              <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600" style={{ width: `${primaryGoal ? Math.min(100, Math.round(((primaryGoal.currentAmount || 0) / primaryGoal.targetAmount) * 100)) : 20}%` }} />
              </div>
              <div className="text-[11.5px] text-[#667085]">
                Req. SIP: <strong className="font-mono text-[#172033]">{formatCurrency(primaryGoal?.monthlySipRequired || recommendedInvestment)}/mo</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('goals')}
            className="w-full py-2 rounded-lg bg-[#F8F9FC] hover:bg-slate-100 border border-[#E7E9F0] text-[#172033] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Manage All Financial Goals</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
          </button>
        </div>

      </section>

      {/* =========================================================================
          6. STRUCTURED PORTFOLIO / FINANCIAL HOLDINGS TABLE (Reference Table Style)
      ========================================================================= */}
      <section className="bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E9F0]">
          <div>
            <h3 className="text-[17px] sm:text-[18px] font-bold text-[#172033]">Fiduciary Recommended Portfolio Holdings</h3>
            <p className="text-[13px] text-[#667085]">Calibrated allocations based on your risk capacity and investment horizon.</p>
          </div>
          <button
            onClick={() => setActiveView('recommendations')}
            className="text-[13px] text-teal-700 hover:underline font-semibold cursor-pointer"
          >
            Full Analysis →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-[#E7E9F0] text-[12px] font-semibold text-[#667085] uppercase tracking-wider">
                <th className="py-2.5 px-3">Instrument</th>
                <th className="py-2.5 px-3">Asset Class</th>
                <th className="py-2.5 px-3 text-right">Target Allocation</th>
                <th className="py-2.5 px-3 text-right">Monthly Deployment</th>
                <th className="py-2.5 px-3 text-center">Fit Score</th>
                <th className="py-2.5 px-3 text-right">Risk Mandate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {(strategy?.allocations || []).map((item) => (
                <tr key={item.id} className="hover:bg-[#F8F9FC] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#172033]">{item.name}</div>
                    <div className="text-[12px] text-[#667085] font-mono">{item.ticker || item.category}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11.5px] font-medium bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#172033]">
                    {item.percentage}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-teal-700">
                    {formatCurrency(item.monthlyAmount)}/mo
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[11.5px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {item.suitabilityScore || 85}/100
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-[12.5px] font-medium text-[#667085]">
                    {item.riskLevel || 'Moderate'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          7. ASK VESTIQ AI & QUICK ACTIONS
      ========================================================================= */}
      <section className="bg-white border border-[#E7EAF0] rounded-xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-1 border-b border-[#E7EAF0]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h3 className="text-[17px] font-bold text-[#172033]">Ask VestIQ</h3>
          </div>
          <span className="text-[12px] text-[#667085]">Your intelligent financial co-pilot</span>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2.5">
          <input
            type="text"
            value={quickAiInput}
            onChange={(e) => setQuickAiInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && quickAiInput.trim()) {
                setQuickAiInput('');
                setActiveView('ai');
              }
            }}
            placeholder="Ask about your portfolio, market outlook, goals or affordability..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7EAF0] text-[#172033] text-[14px] placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-xs"
          />
          <button
            onClick={() => {
              setQuickAiInput('');
              setActiveView('ai');
            }}
            className="glow-btn-primary px-4 py-2.5 rounded-lg text-white font-semibold text-[13.5px] flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <span>Ask VestIQ</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[12px] font-bold text-[#667085] uppercase tracking-wider mr-1">Suggested:</span>
          {[
            'Suggest some US stocks',
            'Analyze my portfolio',
            'How much SIP do I need?',
            'Can I afford a ₹10 lakh car?',
            'What is an ETF?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setActiveView('ai')}
              className="px-2.5 py-1 rounded-md bg-[#F8FAFC] hover:bg-slate-100 border border-[#E7EAF0] text-[#667085] hover:text-[#172033] text-[12.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================================
          8. SMART INSIGHTS + NEXT ACTION (2-Column Grid)
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Smart Insights Feed (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E7E9F0]">
            <Compass className="w-4 h-4 text-teal-600" />
            <h3 className="text-[17px] font-bold text-[#172033]">SmartVest Portfolio Insights</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#172033] block text-[14px]">✓ Strong Monthly Savings Rate ({savingsRate}%)</span>
                <span className="text-[#667085] text-[13px] leading-relaxed">Your disciplined savings rate allows regular compounding into core index equities.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#172033] block text-[14px]">✓ Multi-Asset Allocation Diversified</span>
                <span className="text-[#667085] text-[13px] leading-relaxed">Portfolio allocates across index funds, international equities, and gold hedges.</span>
              </div>
            </div>

            {emergencyGap > 0 && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-800 block text-[14px]">⚠ Emergency Reserve Runway Gap</span>
                  <span className="text-amber-700 text-[13px] leading-relaxed">You have a {formatCurrency(emergencyGap)} gap towards reaching a full 6-month safety buffer.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Next Action (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-white to-teal-50/50 border border-teal-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-600" />
              <h3 className="text-[17px] font-bold text-teal-900 uppercase tracking-wider">SmartVest Next Action</h3>
            </div>

            <p className="text-[14.5px] font-bold text-[#172033] leading-snug">
              {emergencyGap > 0 
                ? `Build ${formatCurrency(emergencyGap)} more emergency reserves.`
                : 'Deploy your investable surplus into the fiduciary multi-asset recommendation blueprint.'}
            </p>

            <p className="text-[13px] text-[#667085] leading-relaxed">
              Review your personalized asset weights and execute via SEBI-registered direct-plan platforms.
            </p>
          </div>

          <button
            onClick={() => setActiveView(emergencyGap > 0 ? 'expenses' : 'recommendations')}
            className="glow-btn-primary w-full py-2.5 rounded-lg text-white font-semibold text-[13.5px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{emergencyGap > 0 ? 'Review Emergency Fund →' : 'Review Recommendations →'}</span>
          </button>
        </div>

      </section>

    </div>
  );
};

