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
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      
      {/* Page Header (no card wrapper — just text + button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Milestone Roadmaps</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set financial milestones and model required monthly SIP allocations.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] text-white font-medium text-xs hover:bg-[#0F766E] transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Metrics: flat unified band */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-slate-100 dark:divide-white/[0.06] border border-slate-100 dark:border-white/[0.06] rounded-xl bg-white dark:bg-[#0B1120]">
          <div className="px-5 py-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block">Total Target</span>
            <div className="text-base font-semibold text-slate-900 dark:text-white font-mono">{formatCurrency(totalTargetAmount)}</div>
            <div className="text-xs text-slate-400">{totalProgressPct}% funded · {formatCurrency(totalCurrentSaved)} saved</div>
          </div>

          <div className="px-5 py-4 space-y-1">
            <span className={`text-[11px] font-medium uppercase tracking-wide block ${isSurplusDeficit ? 'text-rose-500' : 'text-[#0D9488] dark:text-[#00D4AA]'}`}>Monthly SIP Needed</span>
            <div className={`text-base font-semibold font-mono ${isSurplusDeficit ? 'text-rose-600' : 'text-[#0D9488] dark:text-[#00D4AA]'}`}>{formatCurrency(totalRequiredSIP)}/mo</div>
            <div className="text-xs text-slate-400">
              {isSurplusDeficit ? `Shortfall: ${formatCurrency(totalRequiredSIP - surplus)}` : `Within ${formatCurrency(surplus)} surplus`}
            </div>
          </div>

          <div className="px-5 py-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block">Remaining Gap</span>
            <div className="text-base font-semibold text-slate-900 dark:text-white font-mono">{formatCurrency(totalRemaining)}</div>
            <div className="text-xs text-slate-400">{goals.length} active {goals.length === 1 ? 'goal' : 'goals'}</div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/[0.04]">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Active Goals</span>
          {goals.length > 0 && <span className="text-xs text-slate-400">{goals.length} registered</span>}
        </div>

        {goals.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Target className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600" />
            <div className="text-sm text-slate-500 dark:text-slate-400">No goals yet</div>
            <p className="text-xs text-slate-400">Set a target amount and timeline to model your SIP plan.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-1 px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const cfg = CATEGORY_CONFIG[g.category] || CATEGORY_CONFIG.Other;
              const Icon = cfg.icon;
              const progressPct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
              const remainingAmt = Math.max(0, g.targetAmount - g.currentAmount);

              return (
                <div 
                  key={g.id}
                  className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 flex flex-col justify-between space-y-3 min-w-0 overflow-hidden"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-[#060811] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center" style={{ color: cfg.color }}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{g.title}</h3>
                          <span className="text-[11px] text-slate-400">Target: {g.targetDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(g)}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Target Amount & SIP */}
                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target Corpus</span>
                        <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(g.targetAmount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Required Monthly SIP</span>
                        <span className="text-xs font-bold font-mono text-[#0D9488] dark:text-[#00D4AA]">{formatCurrency(g.monthlySipRequired || 0)}/mo</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1 text-xs pt-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Saved: <strong className="text-slate-700 dark:text-slate-200 font-mono">{formatCurrency(g.currentAmount)}</strong></span>
                        <span>{progressPct}% ({formatCurrency(remainingAmt)} gap)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0D9488] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl p-6 space-y-4 font-sans animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editingId ? 'Edit Milestone Portfolio' : 'Configure Milestone Portfolio'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Milestone Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dream Home Downpayment"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-[#00D4AA]"
                />
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalItem['category'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-[#00D4AA]"
                >
                  {Object.keys(CATEGORY_CONFIG).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Target Corpus (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 2500000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-[#00D4AA] font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Current Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-[#00D4AA] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Target Deadline Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-[#00D4AA]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00D4AA] text-[#060811] text-xs font-bold hover:bg-[#00BFA5] cursor-pointer"
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
