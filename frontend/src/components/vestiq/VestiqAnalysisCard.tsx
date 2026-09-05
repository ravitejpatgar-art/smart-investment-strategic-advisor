import React from 'react';
import { 
  Calculator, 
  Compass, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { useFintechStore } from '../../store/useFintechStore';

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

  // 1. Stock / Asset Snapshot Card
  if (calc.symbol || calc.type === 'stock_snapshot') {
    const isPos = (calc.changePct ?? 0) >= 0;
    return (
      <div className="mt-3 p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3 shadow-2xs">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0F172A] text-[16px]">{calc.title || calc.symbol}</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {calc.symbol}
              </span>
            </div>
            {calc.price !== undefined && (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[20px] font-black text-[#0F172A] font-mono">
                  ${calc.price.toFixed(2)}
                </span>
                {calc.changePct !== undefined && (
                  <span className={`text-[12px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    isPos ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
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
              <span className="text-[10.5px] text-[#64748B] uppercase font-semibold block">Suitability</span>
              <span className="text-[13px] font-bold text-teal-800 font-mono px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 inline-block">
                {calc.suitabilityScore}/100
              </span>
            </div>
          )}
        </div>

        {calc.rationale && (
          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] text-[13px] text-slate-700 leading-relaxed">
            <span className="font-semibold text-[#0F172A] block mb-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Strategic Rationale:
            </span>
            {calc.rationale}
          </div>
        )}

        {calc.keyRisks && (
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[12.5px] text-amber-900 leading-relaxed">
            <span className="font-semibold text-amber-800 block mb-0.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Key Risks:
            </span>
            {calc.keyRisks}
          </div>
        )}
      </div>
    );
  }

  // 2. SIP Compounding Projection Card
  if (calc.type === 'sip' && calc.monthlyInvestment) {
    return (
      <div className="mt-3 p-4 rounded-xl bg-white border border-teal-200 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
          <span className="font-bold text-teal-900 text-[14.5px] flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-teal-600" />
            <span>{calc.title || 'Wealth Compounding Simulation'}</span>
          </span>
          <span className="text-[12px] font-semibold text-[#64748B] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
            ~{calc.cagr || 13.5}% Target CAGR
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] block mb-0.5">Monthly SIP</span>
            <span className="text-[15px] font-bold text-[#0F172A] font-mono">{formatCurrency(calc.monthlyInvestment)}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] block mb-0.5">Invested Capital</span>
            <span className="text-[15px] font-bold text-slate-700 font-mono">{formatCurrency(calc.investedAmount || (calc.monthlyInvestment * (calc.years || 15) * 12))}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-teal-800 font-semibold block mb-0.5">Projected Corpus</span>
            <span className="text-[15px] font-black text-teal-800 font-mono">{formatCurrency(calc.totalValue || 0)}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Affordability Analysis Card
  if (calc.type === 'affordability') {
    const isComfortable = calc.verdict === 'Comfortable' || calc.verdict === 'Affordable';
    return (
      <div className="mt-3 p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
          <span className="font-bold text-[#0F172A] text-[14.5px] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-teal-600" />
            <span>Affordability & Cashflow Impact</span>
          </span>
          <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
            isComfortable ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {isComfortable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {calc.verdict || (isComfortable ? 'Comfortable' : 'Stretched')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] block mb-0.5">Estimated Monthly EMI</span>
            <span className="text-[15px] font-bold text-teal-700 font-mono">{formatCurrency(calc.monthlyEmi || 0)}/mo</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] block mb-0.5">Surplus Impact</span>
            <span className="text-[13px] font-semibold text-[#0F172A] mt-0.5 block">{calc.surplusImpact || 'Feasible from surplus'}</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Portfolio / Concentration Review Card
  if (calc.type === 'portfolio_review' || calc.concentrationPct !== undefined) {
    return (
      <div className="mt-3 p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
          <span className="font-bold text-[#0F172A] text-[14px] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Portfolio Allocation Diagnostics</span>
          </span>
          <span className="text-[12px] font-bold text-slate-700">
            {calc.riskLevel || 'Moderate'} Mandate
          </span>
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[#64748B]">Concentration Score:</span>
          <span className="font-mono font-bold text-[#0F172A]">{calc.concentrationPct || 35}% In Core Equities</span>
        </div>
      </div>
    );
  }

  return null;
};
