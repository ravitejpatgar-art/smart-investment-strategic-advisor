import React from 'react';
import { 
  Calculator, 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { useFintechStore } from '../../store/useFintechStore';
import { formatInvestorRiskLabel } from '../dashboard/DashboardLayout';

export interface CalculationData {
  type?: string;
  title?: string;
  monthlyInvestment?: number;
  investedAmount?: number;
  estimatedReturns?: number;
  totalValue?: number;
  cagr?: number;
  years?: number;
  itemCost?: number;
  downPayment?: number;
  monthlyEmi?: number;
  surplusImpact?: string;
  verdict?: string;
  remainingSurplus?: number;
  targetAmount?: number;
  estimatedYears?: number;
  sip10y?: number;
  sip15y?: number;
  sip20y?: number;
  monthlyExpenses?: number;
  targetFund?: number;
  currentFund?: number;
  status?: string;
  existingAmount?: number;
  concentrationPct?: number;
  riskLevel?: string;
  symbol?: string;
  price?: number;
  changePct?: number;
  suitabilityScore?: number;
  rationale?: string;
  keyRisks?: string;
}

export const VestiqAnalysisCard: React.FC<{ calc: CalculationData }> = ({ calc }) => {
  const { formatCurrency } = useFintechStore();

  // 1. Stock / Asset Snapshot Section
  if (calc.symbol || calc.type === 'stock_snapshot') {
    const isPos = (calc.changePct ?? 0) >= 0;
    return (
      <div className="mt-3 py-3.5 border-t border-b border-[var(--color-border-subtle)] space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--color-text-primary)] text-[16px]">{calc.title || calc.symbol}</span>
              <span className="text-[11px] font-mono font-bold text-[var(--color-accent)]">
                {calc.symbol}
              </span>
            </div>
            {calc.price !== undefined && (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[22px] font-black text-[var(--color-text-primary)] font-mono">
                  ${calc.price.toFixed(2)}
                </span>
                {calc.changePct !== undefined && (
                  <span className={`text-[12px] font-bold font-mono flex items-center gap-0.5 ${
                    isPos ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPos ? '+' : ''}{calc.changePct.toFixed(2)}%
                  </span>
                )}
              </div>
            )}
          </div>

          {calc.suitabilityScore !== undefined && (
            <div className="text-right">
              <span className="text-[10.5px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider block">Suitability</span>
              <span className="text-[15px] font-bold text-[var(--color-accent)] font-mono">
                {calc.suitabilityScore}/100
              </span>
            </div>
          )}
        </div>

        {calc.rationale && (
          <div className="pt-2 border-t border-[var(--color-border-subtle)] text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--color-text-primary)] block mb-0.5 flex items-center gap-1.5 text-xs">
              <Compass className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Strategic Rationale:
            </span>
            {calc.rationale}
          </div>
        )}

        {calc.keyRisks && (
          <div className="pt-2 border-t border-[var(--color-border-subtle)] text-[12.5px] text-amber-500 leading-relaxed">
            <span className="font-semibold text-amber-400 block mb-0.5 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              Key Risks:
            </span>
            {calc.keyRisks}
          </div>
        )}
      </div>
    );
  }

  // 2. SIP Compounding Projection Section
  if (calc.type === 'sip' && calc.monthlyInvestment) {
    return (
      <div className="mt-3 py-3.5 border-t border-b border-[var(--color-border-subtle)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
          <span className="font-bold text-[var(--color-text-primary)] text-[14px] flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-[var(--color-accent)]" />
            <span>{calc.title || 'Wealth Compounding Simulation'}</span>
          </span>
          <span className="text-[11px] font-mono font-semibold text-[var(--color-accent)]">
            ~{calc.cagr || 13.5}% Target CAGR
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase block">Monthly SIP</span>
            <span className="text-[16px] font-bold text-[var(--color-text-primary)] font-mono">{formatCurrency(calc.monthlyInvestment)}</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase block">Invested Capital</span>
            <span className="text-[16px] font-bold text-[var(--color-text-secondary)] font-mono">{formatCurrency(calc.investedAmount || (calc.monthlyInvestment * (calc.years || 15) * 12))}</span>
          </div>

          <div className="space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono text-[var(--color-accent)] uppercase block">Projected Corpus</span>
            <span className="text-[18px] font-black text-[var(--color-accent)] font-mono">{formatCurrency(calc.totalValue || 0)}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Affordability Analysis Section
  if (calc.type === 'affordability') {
    const isComfortable = calc.verdict === 'Comfortable' || calc.verdict === 'Affordable';
    return (
      <div className="mt-3 py-3.5 border-t border-b border-[var(--color-border-subtle)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
          <span className="font-bold text-[var(--color-text-primary)] text-[14px] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Affordability & Cashflow Impact</span>
          </span>
          <span className={`text-[12px] font-bold flex items-center gap-1 ${
            isComfortable ? 'text-emerald-500' : 'text-amber-500'
          }`}>
            {isComfortable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {calc.verdict || (isComfortable ? 'Comfortable' : 'Stretched')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase block">Estimated Monthly EMI</span>
            <span className="text-[16px] font-bold text-[var(--color-accent)] font-mono">{formatCurrency(calc.monthlyEmi || 0)}/mo</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase block">Surplus Impact</span>
            <span className="text-[13px] font-semibold text-[var(--color-text-primary)] block pt-0.5">{calc.surplusImpact || 'Feasible from surplus'}</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Portfolio / Concentration Review Section
  if (calc.type === 'portfolio_review' || calc.concentrationPct !== undefined) {
    return (
      <div className="mt-3 py-3 border-t border-b border-[var(--color-border-subtle)] space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
          <span className="font-bold text-[var(--color-text-primary)] text-[14px] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Portfolio Allocation Diagnostics</span>
          </span>
          <span className="text-[12px] font-bold text-[var(--color-text-secondary)]">
            {formatInvestorRiskLabel(calc.riskLevel)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[13px] pt-1">
          <span className="text-[var(--color-text-secondary)]">Concentration Assessment:</span>
          <span className="font-mono font-bold text-[var(--color-text-primary)]">{calc.concentrationPct || 35}% In Core Equities</span>
        </div>
      </div>
    );
  }

  return null;
};
