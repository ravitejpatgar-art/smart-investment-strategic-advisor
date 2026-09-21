import React, { useState, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
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

export const PortfolioRebalanceView: React.FC = () => {
  const { strategy, formatCurrency, user } = useFintechStore();

  const totalPortfolioValue = user?.existingInvestments || (user?.existingSavings ? user.existingSavings * 2 : 1000000);
  const monthlySip = strategy?.recommendedMonthlyInvestment || 25000;

  // Build baseline allocation items from authoritative strategy recommendations
  const defaultAssets: AssetAllocationItem[] = useMemo(() => {
    if (!strategy?.allocations || strategy.allocations.length === 0) {
      return [
        { id: 'nifty50', name: 'Nifty 50 Index Fund', category: 'Index Mutual Fund', currentPct: 35, targetPct: 30, color: 'var(--color-accent)' },
        { id: 'flexicap', name: 'Parag Parikh Flexi Cap', category: 'Flexi Cap Fund', currentPct: 20, targetPct: 25, color: '#1B86DC' },
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
        color: alloc.color || '#388DEB'
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
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-rose-500/30 bg-red-500/10 text-rose-400 flex items-center gap-1">
            <span>+{drift.toFixed(1)}% OVERWEIGHT</span>
          </span>
        );
      case 'UNDERWEIGHT':
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 flex items-center gap-1">
            <span>{drift.toFixed(1)}% UNDERWEIGHT</span>
          </span>
        );
      case 'ON_TARGET':
      default:
        return (
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ON TARGET
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* 1. Header Banner & Threshold Controls + 4 KPIs */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">PORTFOLIO REBALANCING ADVISORY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Asset Allocation Variance & Drift Engine</h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl">
              Compare your current portfolio distribution against your target strategy blueprint. Identifies asset drift and calculates smart SIP adjustments to realign without selling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[var(--color-surface-soft)] p-1 rounded-lg border border-[var(--color-border)] text-xs">
              <span className="text-[var(--color-text-secondary)] px-2 font-semibold">Drift Threshold:</span>
              {[1.0, 2.0, 5.0].map((t) => (
                <button
                  key={t}
                  onClick={() => setThresholdPct(t)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    thresholdPct === t
                      ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  ±{t}%
                </button>
              ))}
            </div>

            <button
              onClick={handleResetToTarget}
              className="p-2.5 rounded-lg bg-[var(--color-surface-soft)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Reset current allocation to target blueprint"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* 4 Drift KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div>
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Portfolio Alignment Fit</span>
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">
              {analysis.alignmentFitScore}/100
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              {analysis.isFullyAligned ? 'Perfect Strategy Fit' : 'Mild Allocation Drift Detected'}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Total Portfolio Drift</span>
              <Activity className="w-4 h-4 text-[var(--color-accent)]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--color-text-primary)]">
              {analysis.overallDriftScore.toFixed(1)}%
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Cumulative Absolute Variance
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Largest Overweight</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-rose-500 truncate font-mono">
              {analysis.maxOverweight ? `${analysis.maxOverweight.name} (+${analysis.maxOverweight.driftPct}%)` : 'None (> threshold)'}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Candidate for Rebalance Trim
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Largest Underweight</span>
              <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
            </div>
            <div className="text-base sm:text-lg font-bold text-[var(--color-accent)] truncate font-mono">
              {analysis.maxUnderweight ? `${analysis.maxUnderweight.name} (${analysis.maxUnderweight.driftPct}%)` : 'None (> threshold)'}
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Priority for New SIP Inflows
            </div>
          </div>
        </div>
      </section>

      {/* 2. Detailed Drift Breakdown Table */}
      <section className="financial-section-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Asset Allocation Drift & Rebalance Matrix</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">Interactive model: adjust your current portfolio percentages to inspect drift in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)]">Portfolio Value:</span>
            <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">{formatCurrency(portfolioVal)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                <th className="py-2.5 px-3 font-semibold">Instrument & Asset Class</th>
                <th className="py-2.5 px-3 font-semibold text-center">Current %</th>
                <th className="py-2.5 px-3 font-semibold text-center">Target %</th>
                <th className="py-2.5 px-3 font-semibold">Drift Delta</th>
                <th className="py-2.5 px-3 font-semibold">Status / Action</th>
                <th className="py-2.5 px-3 font-semibold text-right">Illustrative Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {analysis.assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[var(--color-surface-soft)]">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: asset.color || 'var(--color-accent)', display: 'inline-block' }} />
                      <div>
                        <div className="font-bold text-[var(--color-text-primary)] text-xs">{asset.name}</div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] uppercase">{asset.category}</div>
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
                        className="w-14 px-2 py-1 rounded-lg bg-[var(--color-surface-soft)] border border-[var(--color-border)] text-center font-mono font-bold text-[var(--color-text-primary)] text-xs focus:border-[var(--color-accent)] focus:outline-none"
                      />
                      <span className="text-[var(--color-text-secondary)]">%</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center font-mono font-bold text-[var(--color-text-primary)]">
                    {asset.targetPct}%
                  </td>

                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={asset.driftPct > 0 ? 'text-rose-500' : (asset.driftPct < 0 ? 'text-[var(--color-accent)]' : 'text-emerald-500')}>
                      {asset.driftPct > 0 ? `+${asset.driftPct.toFixed(1)}%` : `${asset.driftPct.toFixed(1)}%`}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {getActionBadge(asset.action, asset.driftPct)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-semibold">
                    {asset.adjustmentAmount > 0 ? (
                      <span className="text-[var(--color-accent)]">+{formatCurrency(asset.adjustmentAmount)}</span>
                    ) : asset.adjustmentAmount < 0 ? (
                      <span className="text-rose-500">-{formatCurrency(Math.abs(asset.adjustmentAmount))}</span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">Aligned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Smart Rebalancing via New SIP Inflows */}
      <section className="financial-section-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[var(--color-accent)]" />
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">New-Contribution SIP Rebalancing Plan</h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Direct future monthly SIP of <strong className="text-[var(--color-text-primary)] font-mono">{formatCurrency(monthlySip)}</strong> towards underweight buckets to realign your portfolio over time without selling existing holdings or incurring taxes.
            </p>
          </div>
          <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 shrink-0">
            Tax-Efficient Method
          </span>
        </div>

        <div className="divide-y divide-[var(--color-border-subtle)] border-y border-[var(--color-border-subtle)]">
          {analysis.newContributionPlan.map((plan) => (
            <div key={plan.assetId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 sm:w-1/2">
                <div className="text-xs font-bold text-[var(--color-text-primary)] truncate">{plan.name}</div>
                <div className="text-[10px] text-[var(--color-text-secondary)] uppercase">{plan.category}</div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-8 sm:w-1/2">
                <div>
                  <div className="text-[10px] text-[var(--color-text-secondary)]">Suggested Monthly SIP</div>
                  <div className="text-sm font-mono font-bold text-emerald-500">{formatCurrency(plan.suggestedSipAmount)}/mo</div>
                </div>
                <div className="text-right min-w-[70px]">
                  <div className="text-[10px] text-[var(--color-text-secondary)]">SIP Share</div>
                  <div className="text-sm font-mono font-bold text-[var(--color-text-primary)]">{plan.suggestedSipPct.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
          <Info className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[var(--color-text-primary)]">Non-Execution Disclosure:</strong> SmartVest provides educational rebalancing analytics. SmartVest does not execute trades or place orders on discount brokers. Execute SIP modifications directly via your registered broker or AMFI platform.
          </span>
        </div>
      </section>

    </div>
  );
};
