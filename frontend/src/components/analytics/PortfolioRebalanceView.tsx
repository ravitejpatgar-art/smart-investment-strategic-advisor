import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Sparkles, 
  RotateCcw, 
  TrendingUp, 
  Shield, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  calculatePortfolioRebalance, 
  type AssetAllocationItem, 
  type PortfolioRebalanceAnalysis,
  type RebalanceAction
} from '../../services/rebalancingEngine';
import { auditLogger } from '../../services/auditLogger';

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 16,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)'
};

export const PortfolioRebalanceView: React.FC = () => {
  const { strategy, formatCurrency, user } = useFintechStore();

  const totalPortfolioValue = user?.existingInvestments || (user?.existingSavings ? user.existingSavings * 2 : 1000000);
  const monthlySip = strategy?.recommendedMonthlyInvestment || 25000;

  // Build baseline allocation items from authoritative strategy recommendations
  const defaultAssets: AssetAllocationItem[] = useMemo(() => {
    if (!strategy?.allocations || strategy.allocations.length === 0) {
      return [
        { id: 'nifty50', name: 'Nifty 50 Index Fund', category: 'Index Mutual Fund', currentPct: 35, targetPct: 30, color: '#00D4AA' },
        { id: 'flexicap', name: 'Parag Parikh Flexi Cap', category: 'Flexi Cap Fund', currentPct: 20, targetPct: 25, color: '#3B82F6' },
        { id: 'globaletf', name: 'Nasdaq 100 ETF (MON100)', category: 'Global ETF', currentPct: 15, targetPct: 20, color: '#A855F7' },
        { id: 'goldbees', name: 'Sovereign Gold Bond / Gold ETF', category: 'Gold / SGB', currentPct: 18, targetPct: 15, color: '#F59E0B' },
        { id: 'debtfund', name: 'Corporate Debt / Liquid Fund', category: 'Liquid / Emergency Debt', currentPct: 12, targetPct: 10, color: '#10B981' }
      ];
    }

    // Use actual target allocations from strategy, with illustrative initial current variance
    return strategy.allocations.map((alloc, idx) => {
      // Create slight illustrative current variance for analysis demonstration
      const driftDelta = (idx % 2 === 0 ? 3 : -3) + (idx === 0 ? 2 : 0);
      const simulatedCurrentPct = Math.max(2, Math.min(60, alloc.percentage + driftDelta));

      return {
        id: alloc.id || `alloc-${idx}`,
        name: alloc.name,
        category: alloc.category,
        currentPct: simulatedCurrentPct,
        targetPct: alloc.percentage,
        color: alloc.color || '#00D4AA'
      };
    });
  }, [strategy]);

  const [thresholdPct, setThresholdPct] = useState<number>(2.0);
  const [portfolioVal] = useState<number>(totalPortfolioValue);
  const [userAssets, setUserAssets] = useState<AssetAllocationItem[]>(defaultAssets);

  // Update current allocation of an asset
  const handleCurrentPctChange = (assetId: string, newPct: number) => {
    setUserAssets(prev => prev.map(a => a.id === assetId ? { ...a, currentPct: Math.max(0, Math.min(100, newPct)) } : a));
  };

  const handleResetToTarget = () => {
    setUserAssets(defaultAssets.map(a => ({ ...a, currentPct: a.targetPct })));
  };

  const analysis: PortfolioRebalanceAnalysis = useMemo(() => {
    const res = calculatePortfolioRebalance(userAssets, portfolioVal, monthlySip, thresholdPct);
    auditLogger.market('REBALANCE_ANALYSIS_RUN', 'info', {
      driftScore: res.overallDriftScore,
      isFullyAligned: res.isFullyAligned
    });
    return res;
  }, [userAssets, portfolioVal, monthlySip, thresholdPct]);

  const getActionBadge = (action: RebalanceAction, drift: number) => {
    switch (action) {
      case 'OVERWEIGHT':
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-[#FF5252] flex items-center gap-1">
            <span>+{drift.toFixed(1)}% OVERWEIGHT</span>
          </span>
        );
      case 'UNDERWEIGHT':
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#3B82F6] flex items-center gap-1">
            <span>{drift.toFixed(1)}% UNDERWEIGHT</span>
          </span>
        );
      case 'ON_TARGET':
      default:
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#00D4AA]/15 border border-[#00D4AA]/40 text-[#008769] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ON TARGET
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Banner & Threshold Controls */}
      <div style={{ ...cardStyle, padding: '20px 24px' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1E88E5]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E88E5]">PORTFOLIO REBALANCING ADVISORY</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A]">Asset Allocation Variance & Drift Engine</h2>
            <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
              Compare your current portfolio distribution against your target strategy blueprint. Identifies asset drift and calculates smart SIP adjustments to realign without selling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] text-xs">
              <span className="text-[#64748B] px-2 font-semibold">Drift Threshold:</span>
              {[1.0, 2.0, 5.0].map((t) => (
                <button
                  key={t}
                  onClick={() => setThresholdPct(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    thresholdPct === t
                      ? 'bg-[#1E88E5] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  ±{t}%
                </button>
              ))}
            </div>

            <button
              onClick={handleResetToTarget}
              className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Reset current allocation to target blueprint"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* 2. Drift KPIs & Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ ...cardStyle, padding: '16px 20px' }}>
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Portfolio Alignment Fit</span>
            <Shield className="w-4 h-4 text-[#00A884]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#00A884]">
            {analysis.alignmentFitScore}/100
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            {analysis.isFullyAligned ? 'Perfect Strategy Fit' : 'Mild Allocation Drift Detected'}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '16px 20px' }}>
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Portfolio Drift</span>
            <Activity className="w-4 h-4 text-[#1E88E5]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#0F172A]">
            {analysis.overallDriftScore.toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            Cumulative Absolute Variance
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '16px 20px' }}>
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Largest Overweight</span>
            <AlertTriangle className="w-4 h-4 text-[#FF5252]" />
          </div>
          <div className="text-sm font-bold text-[#FF5252] truncate">
            {analysis.maxOverweight ? `${analysis.maxOverweight.name} (+${analysis.maxOverweight.driftPct}%)` : 'None (> threshold)'}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            Candidate for Rebalance Trim
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '16px 20px' }}>
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Largest Underweight</span>
            <TrendingUp className="w-4 h-4 text-[#1E88E5]" />
          </div>
          <div className="text-sm font-bold text-[#1E88E5] truncate">
            {analysis.maxUnderweight ? `${analysis.maxUnderweight.name} (${analysis.maxUnderweight.driftPct}%)` : 'None (> threshold)'}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1">
            Priority for New SIP Inflows
          </div>
        </div>
      </div>

      {/* 3. Detailed Drift Breakdown Table */}
      <div style={{ ...cardStyle, padding: '20px 24px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Asset Allocation Drift & Rebalance Matrix</h3>
            <p className="text-xs text-[#64748B]">Interactive model: adjust your current portfolio percentages to inspect drift in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B]">Portfolio Value:</span>
            <span className="text-xs font-mono font-bold text-[#0F172A]">{formatCurrency(portfolioVal)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                <th className="py-2.5 px-3 font-semibold">Instrument & Asset Class</th>
                <th className="py-2.5 px-3 font-semibold text-center">Current %</th>
                <th className="py-2.5 px-3 font-semibold text-center">Target %</th>
                <th className="py-2.5 px-3 font-semibold">Drift Delta</th>
                <th className="py-2.5 px-3 font-semibold">Status / Action</th>
                <th className="py-2.5 px-3 font-semibold text-right">Illustrative Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {analysis.assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color || '#00D4AA', display: 'inline-block' }} />
                      <div>
                        <div className="font-bold text-[#0F172A] text-xs">{asset.name}</div>
                        <div className="text-[10px] text-[#64748B] uppercase">{asset.category}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={asset.currentPct}
                        onChange={(e) => handleCurrentPctChange(asset.id, Number(e.target.value))}
                        className="w-14 px-2 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-center font-mono font-bold text-[#0F172A] text-xs focus:border-[#00D4AA] focus:bg-white focus:outline-none"
                      />
                      <span className="text-[#64748B]">%</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center font-mono font-bold text-[#0F172A]">
                    {asset.targetPct}%
                  </td>

                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={asset.driftPct > 0 ? 'text-[#FF5252]' : (asset.driftPct < 0 ? 'text-[#3B82F6]' : 'text-[#00A884]')}>
                      {asset.driftPct > 0 ? `+${asset.driftPct.toFixed(1)}%` : `${asset.driftPct.toFixed(1)}%`}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {getActionBadge(asset.action, asset.driftPct)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-semibold">
                    {asset.adjustmentAmount > 0 ? (
                      <span className="text-[#3B82F6]">+{formatCurrency(asset.adjustmentAmount)}</span>
                    ) : asset.adjustmentAmount < 0 ? (
                      <span className="text-[#FF5252]">-{formatCurrency(Math.abs(asset.adjustmentAmount))}</span>
                    ) : (
                      <span className="text-[#64748B]">Aligned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Smart Rebalancing via New SIP Inflows */}
      <div style={{ ...cardStyle, padding: '20px 24px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00A884]" />
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">New-Contribution SIP Rebalancing Plan</h3>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Direct future monthly SIP of <strong className="text-[#0F172A] font-mono">{formatCurrency(monthlySip)}</strong> towards underweight buckets to realign your portfolio over time without selling existing holdings or incurring taxes.
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#008769] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#00D4AA]/15 border border-[#00D4AA]/40 shrink-0">
            Tax-Efficient Method
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {analysis.newContributionPlan.map((plan) => (
            <div key={plan.assetId} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#0F172A] truncate">{plan.name}</div>
                <div className="text-[10px] text-[#64748B] uppercase mt-0.5">{plan.category}</div>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#64748B]">Suggested SIP</div>
                  <div className="text-sm font-mono font-bold text-[#00A884]">{formatCurrency(plan.suggestedSipAmount)}/mo</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#64748B]">SIP Share</div>
                  <div className="text-sm font-mono font-bold text-[#0F172A]">{plan.suggestedSipPct.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2 text-xs text-[#64748B]">
          <Info className="w-4 h-4 text-[#1E88E5] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#0F172A]">Non-Execution Disclosure:</strong> SmartVest provides educational rebalancing analytics. SmartVest does not execute trades or place orders on discount brokers. Execute SIP modifications directly via your registered broker or AMFI platform.
          </span>
        </div>
      </div>

    </div>
  );
};
