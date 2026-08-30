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
      <div className="bg-white border border-[#E7EAF0] rounded-xl p-4 space-y-3.5 shadow-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="text-[12px] font-bold text-[#172033] uppercase tracking-wider">
              SmartVest Context
            </span>
          </div>
          <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
            Active Profile
          </span>
        </div>

        <div className="text-[12px] text-[#667085] leading-relaxed">
          VestIQ tailors financial analysis, allocations, and simulations to your verified parameters.
        </div>

        {/* 5 Real Personal Metrics */}
        <div className="space-y-2.5">
          
          {/* Monthly Surplus */}
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7EAF0] space-y-0.5">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
              Investable Surplus
            </span>
            <div className="text-[16px] font-black text-teal-700 font-mono">
              {formatCurrency(surplus)}/mo
            </div>
            <span className="text-[11px] text-[#98A2B3]">
              From {formatCurrency(totalIncome)} Inflow
            </span>
          </div>

          {/* Risk Tolerance */}
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7EAF0] space-y-0.5">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
              Risk Mandate
            </span>
            <div className="text-[14.5px] font-bold text-[#172033]">
              {risk} Strategy
            </div>
            <span className="text-[11px] text-[#98A2B3]">
              Calibrated Asset Core
            </span>
          </div>

          {/* Horizon */}
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7EAF0] space-y-0.5">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
              Investment Horizon
            </span>
            <div className="text-[14.5px] font-bold text-[#172033]">
              {horizon}
            </div>
          </div>

          {/* Emergency Fund */}
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7EAF0] space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-[#667085] uppercase">Emergency Reserve</span>
              <span className="font-bold text-teal-700 font-mono">{emergencyPct}%</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${emergencyPct}%` }} />
            </div>
          </div>

          {/* Primary Goal */}
          {primaryGoal && (
            <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E7EAF0] space-y-0.5">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Primary Goal
              </span>
              <div className="text-[13.5px] font-bold text-[#172033] truncate">
                {primaryGoal.title}
              </div>
              <div className="text-[11px] text-[#667085] font-mono">
                {formatCurrency(primaryGoal.targetAmount)} by {primaryGoal.targetDate}
              </div>
            </div>
          )}

        </div>

        {/* Security / Privacy Indicator */}
        <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#98A2B3]">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Encrypted Session</span>
          </div>
          {onNavigateToProfile && (
            <button
              onClick={onNavigateToProfile}
              className="text-teal-700 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Edit</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>

    </aside>
  );
};
