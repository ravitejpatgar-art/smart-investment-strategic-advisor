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

// Category Config
const CATEGORY_CONFIG: Record<GoalItem['category'] | string, {
  icon: React.ElementType;
  color: string;
  badgeBg: string;
}> = {
  House: {
    icon: Home,
    color: '#0284c7',
    badgeBg: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  Car: {
    icon: Car,
    color: '#ea580c',
    badgeBg: 'bg-orange-50 text-orange-700 border border-orange-200',
  },
  Retirement: {
    icon: Palmtree,
    color: '#9333ea',
    badgeBg: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
  Education: {
    icon: GraduationCap,
    color: '#0891b2',
    badgeBg: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  },
  Travel: {
    icon: Plane,
    color: '#0d9488',
    badgeBg: 'bg-teal-50 text-teal-700 border border-teal-200',
  },
  'Wealth Building': {
    icon: TrendingUp,
    color: '#16a34a',
    badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  Other: {
    icon: Target,
    color: '#64748b',
    badgeBg: 'bg-slate-50 text-slate-700 border border-slate-200',
  },
};

// Circular Progress Component
const CircularProgress: React.FC<{ pct: number; size?: number; color?: string; label?: string }> = ({ 
  pct, 
  size = 64, 
  color = '#14B8A6',
  label 
}) => {
  const strokeWidth = 5.5;
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
          stroke="#E2E8F0"
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
        <span className="font-bold font-mono text-[#172033] text-[13px] leading-none">
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
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-[26px] font-bold text-[#172033] tracking-tight">Financial Milestone Goals</h1>
          </div>
          <p className="text-[14px] text-[#667085]">
            Define target dates and wealth targets to calculate required monthly SIP allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="glow-btn-primary px-4 py-2.5 rounded-lg text-white font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* 3 Summary Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E7E9F0] space-y-1.5 shadow-xs">
          <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">Total Target</span>
          <div className="text-[24px] sm:text-[26px] font-black text-[#172033] font-mono leading-tight">
            {formatCurrency(totalTargetAmount)}
          </div>
          <div className="flex justify-between text-[13px] text-[#667085]">
            <span>Saved: <strong className="text-[#172033] font-mono">{formatCurrency(totalCurrentSaved)}</strong></span>
            <span className="font-semibold text-teal-700">{totalProgressPct}% Funded</span>
          </div>
        </div>

        <div className={`p-4 sm:p-5 rounded-xl border space-y-1.5 shadow-xs ${
          isSurplusDeficit ? 'bg-amber-50 border-amber-200' : 'bg-teal-50/60 border-teal-200'
        }`}>
          <span className={`text-[12px] font-semibold uppercase tracking-wider block ${isSurplusDeficit ? 'text-amber-800' : 'text-teal-800'}`}>
            Required Monthly SIP
          </span>
          <div className={`text-[24px] sm:text-[26px] font-black font-mono leading-tight ${isSurplusDeficit ? 'text-amber-700' : 'text-teal-700'}`}>
            {formatCurrency(totalRequiredSIP)}/mo
          </div>
          <div className="text-[13px] font-medium text-slate-700">
            {isSurplusDeficit ? `Exceeds monthly surplus by ${formatCurrency(totalRequiredSIP - surplus)}` : `Comfortably funded from ${formatCurrency(surplus)} surplus`}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E7E9F0] space-y-1.5 shadow-xs">
          <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">Remaining Target Gap</span>
          <div className="text-[24px] sm:text-[26px] font-black text-slate-700 font-mono leading-tight">
            {formatCurrency(totalRemaining)}
          </div>
          <div className="text-[13px] text-[#667085]">
            Across {goals.length} Milestone Goals
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[13.5px] text-[#667085] pb-1.5 border-b border-[#E7E9F0]">
          <span className="font-bold uppercase tracking-wider text-[#172033] text-[17px]">Active Goals</span>
          <span>{goals.length} Defined Milestones</span>
        </div>

        {goals.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-[#E7E9F0] text-center space-y-3 shadow-xs">
            <Target className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-[14px] text-[#667085]">No milestone goals defined yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="glow-btn-primary px-4 py-2.5 rounded-lg text-white font-bold text-[14px] cursor-pointer inline-flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Goal</span>
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
                  className="bg-white border border-[#E7E9F0] rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] flex items-center justify-center" style={{ color: cfg.color }}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-[17px] font-bold text-[#172033]">{g.title}</h3>
                          <span className="text-[13px] text-[#667085]">Target Date: {g.targetDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(g)}
                          className="p-1.5 rounded text-[#667085] hover:text-[#172033] transition-colors cursor-pointer hover:bg-slate-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1.5 rounded text-[#667085] hover:text-rose-600 transition-colors cursor-pointer hover:bg-slate-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Dominant Target Amount & SIP */}
                    <div className="flex items-baseline justify-between pt-1.5 border-t border-[#F1F5F9]">
                      <div>
                        <span className="text-[12px] text-[#667085] font-semibold block uppercase">Target Goal</span>
                        <span className="text-[22px] sm:text-[24px] font-black text-[#172033] font-mono leading-tight">{formatCurrency(g.targetAmount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[12px] text-[#667085] font-semibold block uppercase">Required SIP</span>
                        <span className="text-[15px] font-bold font-mono text-teal-700">{formatCurrency(g.monthlySipRequired || 0)}/mo</span>
                      </div>
                    </div>

                    {/* Visual Progress Gauge & Breakdown */}
                    <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0]">
                      <CircularProgress pct={progressPct} size={58} color={cfg.color} label={`${progressPct}%`} />
                      <div className="flex-1 space-y-1.5 text-xs">
                        <div className="flex justify-between text-[13px]">
                          <span className="text-[#667085]">Current: <strong className="text-[#172033] font-mono">{formatCurrency(g.currentAmount)}</strong></span>
                          <span className="text-[#667085]">Gap: <strong className="text-slate-700 font-mono">{formatCurrency(remainingAmt)}</strong></span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: cfg.color }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feasibility Indicator */}
                  <div className="pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-[13px]">
                    <span className="text-[#667085]">Status:</span>
                    <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded ${
                      isFeasible ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {isFeasible ? '✓ FEASIBLE FROM SURPLUS' : '⚠ NEEDS CASHFLOW ADJUSTMENT'}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E7E9F0] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7E9F0]">
              <h3 className="text-[18px] font-bold text-[#172033] uppercase tracking-wider">
                {editingId ? 'Edit Milestone Goal' : 'Create New Milestone Goal'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#667085] hover:text-[#172033] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[13.5px] text-[#172033] font-medium">Goal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dream Home Downpayment"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[13.5px] text-[#172033] font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalItem['category'])}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white"
                >
                  {Object.keys(CATEGORY_CONFIG).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[13.5px] text-[#172033] font-medium">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 2500000"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[13.5px] text-[#172033] font-medium">Current Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[13.5px] text-[#172033] font-medium">Target Deadline Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-[#E7E9F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-[#667085] hover:text-[#172033] text-[13.5px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="glow-btn-primary px-4 py-2.5 rounded-lg text-white font-bold text-[14px] cursor-pointer shadow-xs"
                >
                  {editingId ? 'Update Goal' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
