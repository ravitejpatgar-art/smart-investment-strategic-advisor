import React from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  ShieldCheck, 
  Lock,
  ChevronRight
} from 'lucide-react';

export const VestiqContextPanel: React.FC<{ onNavigateToProfile?: () => void }> = ({ onNavigateToProfile }) => {
  const { user, expenses, goals, formatCurrency } = useFintechStore();

  const salary = user?.salaryIncome || user?.monthlyIncome || 0;
  const otherInc = user?.otherIncome || 0;
  const totalIncome = salary + otherInc;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0) || (user?.monthlyExpenses || 0);
  const surplus = Math.max(0, totalIncome - totalExpenses);
  const risk = user?.riskTolerance || user?.riskCategory || 'Moderate';
  const horizon = user?.investmentHorizon || '5 to 10 years';

  const emergencyFund = Number(user?.emergencyFund) || Number(user?.existingSavings) || 0;
  const targetEmergencyFund = totalExpenses * 6;
  const emergencyPct = targetEmergencyFund > 0 ? Math.min(100, Math.round((emergencyFund / targetEmergencyFund) * 100)) : 0;

  const primaryGoal = goals.length > 0 ? goals[0] : null;

  return (
    <aside className="w-full lg:w-[270px] shrink-0 space-y-4 font-sans">
      
      {/* Active Context Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-3.5 shadow-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider">
              SmartVest Context
            </span>
          </div>
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            Active Profile
          </span>
        </div>

        <div className="text-[12px] text-[#64748B] leading-relaxed">
          VestIQ tailors financial analysis, allocations, and simulations to your verified parameters.
        </div>

        {/* 5 Real Personal Metrics */}
        <div className="space-y-2.5">
          
          {/* Monthly Surplus */}
          <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-0.5">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Investable Surplus
            </span>
            <div className="text-[17px] font-black text-teal-800 font-mono">
              {formatCurrency(surplus)}/mo
            </div>
            <span className="text-[11px] text-[#94A3B8]">
              From {formatCurrency(totalIncome)} Inflow
            </span>
          </div>

          {/* Risk Tolerance */}
          <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-0.5">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Risk Mandate
            </span>
            <div className="text-[14.5px] font-bold text-[#0F172A]">
              {risk} Strategy
            </div>
            <span className="text-[11px] text-[#94A3B8]">
              Calibrated Asset Core
            </span>
          </div>

          {/* Horizon */}
          <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-0.5">
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
              Investment Horizon
            </span>
            <div className="text-[14.5px] font-bold text-[#0F172A]">
              {horizon}
            </div>
          </div>

          {/* Emergency Fund */}
          <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-[#64748B] uppercase">Emergency Reserve</span>
              <span className="font-bold text-teal-700 font-mono">{emergencyPct}%</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
              <div className="h-full bg-[#00D4AA] rounded-full transition-all" style={{ width: `${emergencyPct}%` }} />
            </div>
          </div>

          {/* Primary Goal */}
          {primaryGoal && (
            <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] space-y-0.5">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
                Primary Milestone
              </span>
              <div className="text-[14px] font-bold text-[#0F172A] truncate">
                {primaryGoal.title}
              </div>
              <span className="text-[11px] text-teal-700 font-mono font-semibold">
                Target: {formatCurrency(primaryGoal.targetAmount)} ({primaryGoal.targetDate || '2030'})
              </span>
            </div>
          )}

        </div>

        {/* Update Profile CTA */}
        {onNavigateToProfile && (
          <button
            onClick={onNavigateToProfile}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-[#0F172A] flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Update Mandate</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" />
          </button>
        )}

      </div>

      {/* Trust & Privacy Pill */}
      <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-[11px] text-[#64748B] space-y-1 shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          <span>Fiduciary Confidentiality</span>
        </div>
        <p className="leading-relaxed text-[10.5px]">
          Session intelligence is encrypted and grounded exclusively against your active verified financial profile.
        </p>
      </div>

    </aside>
  );
};
