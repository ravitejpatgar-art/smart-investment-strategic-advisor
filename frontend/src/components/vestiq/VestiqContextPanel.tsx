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
      <div className="financial-section-card p-4 space-y-3.5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--color-accent-strong)]" />
            <span className="text-[12px] font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              SmartVest Context
            </span>
          </div>
          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] border border-[var(--color-accent)]/20">
            Active Profile
          </span>
        </div>

        <div className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
          VestIQ tailors financial analysis, allocations, and simulations to your verified parameters.
        </div>

        {/* 5 Real Personal Metrics */}
        <div className="space-y-2.5">
          
          {/* Monthly Surplus */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] space-y-0.5">
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block">
              Investable Surplus
            </span>
            <div className="text-[17px] font-black text-[var(--color-accent-strong)] font-mono">
              {formatCurrency(surplus)}/mo
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              From {formatCurrency(totalIncome)} Inflow
            </span>
          </div>

          {/* Risk Tolerance */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] space-y-0.5">
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block">
              Risk Mandate
            </span>
            <div className="text-[14.5px] font-bold text-[var(--color-text-primary)]">
              {risk} Strategy
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              Calibrated Asset Core
            </span>
          </div>

          {/* Horizon */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] space-y-0.5">
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block">
              Investment Horizon
            </span>
            <div className="text-[14.5px] font-bold text-[var(--color-text-primary)]">
              {horizon}
            </div>
          </div>

          {/* Emergency Fund */}
          <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-semibold text-[var(--color-text-secondary)] uppercase">Emergency Reserve</span>
              <span className="font-bold text-[var(--color-accent-strong)] font-mono">{emergencyPct}%</span>
            </div>
            <div className="w-full bg-[var(--color-surface-3)] h-2 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-accent)] rounded-full transition-all" style={{ width: `${emergencyPct}%` }} />
            </div>
          </div>

          {/* Primary Goal */}
          {primaryGoal && (
            <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] space-y-0.5">
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                Primary Milestone
              </span>
              <div className="text-[14px] font-bold text-[var(--color-text-primary)] truncate">
                {primaryGoal.title}
              </div>
              <span className="text-[11px] text-[var(--color-accent-strong)] font-mono font-semibold">
                Target: {formatCurrency(primaryGoal.targetAmount)} ({primaryGoal.targetDate || '2030'})
              </span>
            </div>
          )}

        </div>

        {/* Update Profile CTA */}
        {onNavigateToProfile && (
          <button
            onClick={onNavigateToProfile}
            className="w-full py-2 px-3 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Update Mandate</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
          </button>
        )}

      </div>

      {/* Trust & Privacy Pill */}
      <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-secondary)] space-y-1 shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)]">
          <Lock className="w-3.5 h-3.5 text-[var(--color-accent-strong)]" />
          <span>Fiduciary Confidentiality</span>
        </div>
        <p className="leading-relaxed text-[10.5px]">
          Session intelligence is encrypted and grounded exclusively against your active verified financial profile.
        </p>
      </div>

    </aside>
  );
};
