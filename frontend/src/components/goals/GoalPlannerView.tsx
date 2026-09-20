import React, { useState } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Target, 
  Plus, 
  Trash2, 
  Home, 
  Car, 
  Palmtree, 
  GraduationCap, 
  Plane, 
  X, 
  TrendingUp, 
  Edit3
} from 'lucide-react';
import type { GoalItem } from '../../types';

// Category Config with Institutional Colors
const CATEGORY_CONFIG: Record<GoalItem['category'] | string, {
  icon: React.ElementType;
  color: string;
}> = {
  House: { icon: Home, color: '#1E88E5' },
  Car: { icon: Car, color: '#F59E0B' },
  Retirement: { icon: Palmtree, color: '#8B5CF6' },
  Education: { icon: GraduationCap, color: '#00D4AA' },
  Travel: { icon: Plane, color: '#00C853' },
  'Wealth Building': { icon: TrendingUp, color: '#00D4AA' },
  Other: { icon: Target, color: '#8A94A6' },
};

export const GoalPlannerView: React.FC = () => {
  const { 
    goals, 
    addGoal, 
    editGoal, 
    deleteGoal, 
    user, 
    expenses, 
    formatCurrency 
  } = useFintechStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<GoalItem['category']>('House');

  // Income / Expense for feasibility check
  const salary = user?.salaryIncome || user?.monthlyIncome || 0;
  const otherInc = user?.otherIncome || 0;
  const totalIncome = salary + otherInc;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0) || (user?.monthlyExpenses || 0);
  const surplus = Math.max(0, totalIncome - totalExpenses);
  const userRisk = user?.riskTolerance || 'Moderate';

  // Aggregated Goal Metrics
  const totalTargetAmount = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
  const totalCurrentSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
  const totalRequiredSIP = goals.reduce((s, g) => s + (g.monthlySipRequired || 0), 0);
  const totalProgressPct = totalTargetAmount > 0 ? Math.min(100, Math.round((totalCurrentSaved / totalTargetAmount) * 100)) : 0;
  const totalRemaining = Math.max(0, totalTargetAmount - totalCurrentSaved);
  const isSurplusDeficit = totalRequiredSIP > surplus;

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setTargetDate('');
    setCategory('House');
    setShowModal(true);
  };

  const handleOpenEditModal = (g: GoalItem) => {
    setEditingId(g.id);
    setTitle(g.title);
    setTargetAmount(String(g.targetAmount));
    setCurrentAmount(String(g.currentAmount));
    setTargetDate(g.targetDate);
    setCategory(g.category);
    setShowModal(true);
  };

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || Number(targetAmount) <= 0 || !targetDate) return;

    const tAmt = Number(targetAmount);
    const cAmt = Number(currentAmount) || 0;

    // Calculate months to target
    const targetYear = new Date(targetDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const months = Math.max(12, (targetYear - currentYear) * 12);
    const remaining = Math.max(0, tAmt - cAmt);

    // Dynamic SIP calculation with ~12.5% CAGR assumption
    const monthlyRate = 0.125 / 12;
    const requiredSip = months > 0
      ? Math.round(remaining / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate))
      : Math.round(remaining / 12);

    const goalData = {
      title: title.trim(),
      targetAmount: tAmt,
      currentAmount: cAmt,
      targetDate,
      category,
      riskProfile: userRisk,
      monthlySipRequired: requiredSip,
      probability: requiredSip <= surplus ? 90 : 60,
      projectedCorpus: tAmt,
      status: (requiredSip <= surplus ? 'On Track' : 'Attention') as 'On Track' | 'Attention'
    };

    if (editingId) {
      editGoal(editingId, goalData);
    } else {
      addGoal(goalData);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* 1. LIFECYCLE SUMMARY & TELEMETRY */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--color-accent-strong)]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Lifecycle Milestone Roadmaps</h1>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Quantify capital required for primary milestones and model monthly SIP allocations.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[var(--color-accent)] hover:brightness-105 text-[var(--color-accent-text)] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Goal</span>
          </button>
        </div>

        {/* 3 Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total Milestone Target</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] font-mono leading-tight">
              {formatCurrency(totalTargetAmount)}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] pt-0.5">
              <span>Saved: <strong className="text-[var(--color-text-primary)] font-mono">{formatCurrency(totalCurrentSaved)}</strong></span>
              <span>·</span>
              <span className="font-semibold text-emerald-600">{totalProgressPct}% Funded</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Required Monthly Deployment</span>
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono leading-tight ${isSurplusDeficit ? 'text-red-500' : 'text-[var(--color-accent-strong)]'}`}>
              {formatCurrency(totalRequiredSIP)}/mo
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] pt-0.5">
              {isSurplusDeficit ? `Exceeds monthly surplus by ${formatCurrency(totalRequiredSIP - surplus)}` : `Comfortably funded from ${formatCurrency(surplus)} surplus`}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Remaining Funding Gap</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] font-mono leading-tight">
              {formatCurrency(totalRemaining)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] pt-0.5">
              Across {goals.length} defined milestones
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACTIVE GOAL ROADMAPS */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pb-3 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">Active Milestone Portfolios</h2>
          <span>{goals.length} Goals Registered</span>
        </div>

        {goals.length === 0 ? (
          <div className="py-12 text-center space-y-3 border border-dashed border-[var(--color-border)] rounded-lg">
            <Target className="w-8 h-8 text-[var(--color-text-muted)] mx-auto" />
            <p className="text-sm text-[var(--color-text-secondary)]">No milestone portfolios configured yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Milestone</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {goals.map((g) => {
              const cfg = CATEGORY_CONFIG[g.category] || CATEGORY_CONFIG.Other;
              const Icon = cfg.icon;
              const progressPct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
              const remainingAmt = Math.max(0, g.targetAmount - g.currentAmount);
              const isFeasible = (g.monthlySipRequired || 0) <= surplus;

              return (
                <div 
                  key={g.id}
                  className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left Column: Icon, Title, Category, Dates */}
                  <div className="space-y-1.5 md:w-1/3 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center shrink-0" style={{ color: cfg.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-[var(--color-text-primary)] truncate">{g.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                          <span>{g.category}</span>
                          <span>·</span>
                          <span>Target: {g.targetDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Quantitative Financial Figures */}
                  <div className="grid grid-cols-2 gap-4 md:w-1/3">
                    <div>
                      <span className="text-[11px] text-[var(--color-text-muted)] font-bold uppercase block">Target Corpus</span>
                      <span className="text-lg font-bold text-[var(--color-text-primary)] font-mono">{formatCurrency(g.targetAmount)}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[var(--color-text-muted)] font-bold uppercase block">Required SIP</span>
                      <span className="text-lg font-bold font-mono text-[var(--color-accent-strong)]">{formatCurrency(g.monthlySipRequired || 0)}/mo</span>
                    </div>
                  </div>

                  {/* Right Column: Progress Bar + Feasibility Status + Actions */}
                  <div className="space-y-2 md:w-1/3">
                    <div className="flex justify-between items-baseline text-xs text-[var(--color-text-secondary)]">
                      <span>Funded: <strong className="text-[var(--color-text-primary)] font-mono">{formatCurrency(g.currentAmount)}</strong> ({progressPct}%)</span>
                      <span className="font-mono text-xs">Gap: {formatCurrency(remainingAmt)}</span>
                    </div>
                    <div className="w-full bg-[var(--color-surface-3)] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.max(5, progressPct)}%`, backgroundColor: cfg.color }} />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[11px] font-semibold ${
                        isFeasible ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {isFeasible ? '✓ Feasible from surplus' : '⚠ Adjust cash flow'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(g)}
                          className="p-1 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                          title="Edit Goal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1 rounded-md text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50/10 transition-colors cursor-pointer"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add / Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                {editingId ? 'Edit Milestone Portfolio' : 'Configure Milestone Portfolio'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] cursor-pointer active:scale-95" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Milestone Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dream Home Downpayment"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:bg-[var(--color-card)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalItem['category'])}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none"
                >
                  {Object.keys(CATEGORY_CONFIG).map((cat) => (
                    <option key={cat} value={cat} className="bg-[var(--color-card)] text-[var(--color-text-primary)]">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Target Corpus (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 2500000"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:bg-[var(--color-card)] focus:outline-none font-mono placeholder:text-[var(--color-text-muted)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Current Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:bg-[var(--color-card)] focus:outline-none font-mono placeholder:text-[var(--color-text-muted)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Target Deadline Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:bg-[var(--color-card)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:brightness-105 text-[var(--color-accent-text)] font-bold text-xs cursor-pointer shadow-xs"
                >
                  {editingId ? 'Update Milestone' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
