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

// Circular Progress Component
const CircularProgress: React.FC<{ pct: number; size?: number; color?: string; label?: string }> = ({ 
  pct, 
  size = 56, 
  color = '#00D4AA',
  label 
}) => {
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 0, 0, 0.06)"
          className="dark:stroke-white/[0.08]"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold font-mono text-slate-900 dark:text-white text-[12px] leading-none">
          {label || `${pct}%`}
        </span>
      </div>
    </div>
  );
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
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E6FDF7] dark:bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/30 text-[#00D4AA]">
              <Target className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Lifecycle Milestone Roadmaps</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quantify capital required for primary milestones and model monthly SIP allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#00D4AA] text-[#060811] font-bold text-xs hover:bg-[#00BFA5] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[#00D4AA]/25"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* 3 Summary Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Milestone Target</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono leading-tight">
            {formatCurrency(totalTargetAmount)}
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Saved: <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(totalCurrentSaved)}</strong></span>
            <span className="font-semibold text-[#0D9488] dark:text-[#00D4AA]">{totalProgressPct}% Funded</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Monthly Deployment</span>
          <div className={`text-2xl font-black font-mono leading-tight ${isSurplusDeficit ? 'text-[#FF5252]' : 'text-[#0D9488] dark:text-[#00D4AA]'}`}>
            {formatCurrency(totalRequiredSIP)}/mo
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
            {isSurplusDeficit ? `Exceeds monthly surplus by ${formatCurrency(totalRequiredSIP - surplus)}` : `Comfortably funded from ${formatCurrency(surplus)} surplus`}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Funding Gap</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono leading-tight">
            {formatCurrency(totalRemaining)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
            Across {goals.length} Defined Goals
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200/80 dark:border-white/[0.06]">
          <span className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">Active Milestone Portfolios</span>
          <span>{goals.length} Goals Registered</span>
        </div>

        {goals.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-10 text-center space-y-3">
            <Target className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No milestone portfolios configured yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-[#00D4AA] text-[#060811] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-[#00D4AA]/25"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Milestone</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const cfg = CATEGORY_CONFIG[g.category] || CATEGORY_CONFIG.Other;
              const Icon = cfg.icon;
              const progressPct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
              const remainingAmt = Math.max(0, g.targetAmount - g.currentAmount);
              const isFeasible = (g.monthlySipRequired || 0) <= surplus;

              return (
                <div 
                  key={g.id}
                  className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#00D4AA]/50 transition-all"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#060811] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center shadow-xs" style={{ color: cfg.color }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{g.title}</h3>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Target Date: {g.targetDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(g)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF5252] hover:bg-red-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dominant Target Amount & SIP */}
                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Target Corpus</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(g.targetAmount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Required Monthly SIP</span>
                        <span className="text-sm font-black font-mono text-[#0D9488] dark:text-[#00D4AA]">{formatCurrency(g.monthlySipRequired || 0)}/mo</span>
                      </div>
                    </div>

                    {/* Visual Progress Gauge */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200/80 dark:border-white/[0.04]">
                      <CircularProgress pct={progressPct} size={50} color={cfg.color} label={`${progressPct}%`} />
                      <div className="flex-1 space-y-1.5 text-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400">Funded: <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(g.currentAmount)}</strong></span>
                          <span className="text-slate-500 dark:text-slate-400">Gap: <strong className="text-slate-600 dark:text-slate-300 font-mono">{formatCurrency(remainingAmt)}</strong></span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-[#0F172A] h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: cfg.color }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feasibility Indicator */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Feasibility Status:</span>
                    <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${
                      isFeasible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#00D4AA]/10 dark:text-[#00D4AA] dark:border-[#00D4AA]/30' : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                    }`}>
                      {isFeasible ? '✓ FEASIBLE FROM SURPLUS' : '⚠ ADJUST CASH FLOW'}
                    </span>
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
