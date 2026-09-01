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
          stroke="rgba(255, 255, 255, 0.08)"
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
        <span className="font-bold font-mono text-white text-[12px] leading-none">
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

  const cardStyle = {
    background: '#101827',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
  };

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
      
      {/* Top Header Banner */}
      <div style={{ ...cardStyle, padding: '20px 24px' }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00D4AA]" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Lifecycle Milestone Roadmaps</h1>
          </div>
          <p className="text-xs text-[#8A94A6]">
            Quantify capital required for primary milestones and model monthly SIP allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs hover:bg-[#00D4AA]/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* 3 Summary Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div style={{ ...cardStyle, padding: '18px 20px' }} className="space-y-1">
          <span className="text-[10.5px] font-bold text-[#8A94A6] uppercase tracking-wider block">Total Milestone Target</span>
          <div className="text-2xl font-black text-white font-mono leading-tight">
            {formatCurrency(totalTargetAmount)}
          </div>
          <div className="flex justify-between text-xs text-[#8A94A6] pt-1">
            <span>Saved: <strong className="text-white font-mono">{formatCurrency(totalCurrentSaved)}</strong></span>
            <span className="font-semibold text-[#00D4AA]">{totalProgressPct}% Funded</span>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '18px 20px' }} className="space-y-1">
          <span className="text-[10.5px] font-bold text-[#8A94A6] uppercase tracking-wider block">Required Monthly Deployment</span>
          <div className={`text-2xl font-black font-mono leading-tight ${isSurplusDeficit ? 'text-[#FF5252]' : 'text-[#00D4AA]'}`}>
            {formatCurrency(totalRequiredSIP)}/mo
          </div>
          <div className="text-xs text-[#8A94A6] pt-1">
            {isSurplusDeficit ? `Exceeds monthly surplus by ${formatCurrency(totalRequiredSIP - surplus)}` : `Comfortably funded from ${formatCurrency(surplus)} surplus`}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '18px 20px' }} className="space-y-1">
          <span className="text-[10.5px] font-bold text-[#8A94A6] uppercase tracking-wider block">Remaining Funding Gap</span>
          <div className="text-2xl font-black text-white font-mono leading-tight">
            {formatCurrency(totalRemaining)}
          </div>
          <div className="text-xs text-[#8A94A6] pt-1">
            Across {goals.length} Defined Goals
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8A94A6] pb-2 border-b border-white/[0.06]">
          <span className="font-bold uppercase tracking-wider text-white">Active Milestone Portfolios</span>
          <span>{goals.length} Goals Registered</span>
        </div>

        {goals.length === 0 ? (
          <div style={{ ...cardStyle, padding: '36px 20px' }} className="text-center space-y-3">
            <Target className="w-8 h-8 text-[#5A667A] mx-auto" />
            <p className="text-sm text-[#8A94A6]">No milestone portfolios configured yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
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
                  style={{ ...cardStyle, padding: '18px 20px' }}
                  className="flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#0A1022] border border-white/[0.08] flex items-center justify-center" style={{ color: cfg.color }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">{g.title}</h3>
                          <span className="text-xs text-[#8A94A6]">Target Date: {g.targetDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(g)}
                          className="p-1 rounded text-[#8A94A6] hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1 rounded text-[#8A94A6] hover:text-[#FF5252] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dominant Target Amount & SIP */}
                    <div className="flex items-baseline justify-between pt-2 border-t border-white/[0.06]">
                      <div>
                        <span className="text-[10.5px] text-[#8A94A6] font-bold block uppercase">Target Corpus</span>
                        <span className="text-xl font-black text-white font-mono">{formatCurrency(g.targetAmount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10.5px] text-[#8A94A6] font-bold block uppercase">Required Monthly SIP</span>
                        <span className="text-sm font-bold font-mono text-[#00D4AA]">{formatCurrency(g.monthlySipRequired || 0)}/mo</span>
                      </div>
                    </div>

                    {/* Visual Progress Gauge */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A1022] border border-white/[0.04]">
                      <CircularProgress pct={progressPct} size={50} color={cfg.color} label={`${progressPct}%`} />
                      <div className="flex-1 space-y-1 text-xs">
                        <div className="flex justify-between text-[11.5px]">
                          <span className="text-[#8A94A6]">Funded: <strong className="text-white font-mono">{formatCurrency(g.currentAmount)}</strong></span>
                          <span className="text-[#8A94A6]">Gap: <strong className="text-[#8A94A6] font-mono">{formatCurrency(remainingAmt)}</strong></span>
                        </div>
                        <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: cfg.color }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feasibility Indicator */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[#8A94A6]">Feasibility Status:</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isFeasible ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#101827] border border-white/[0.12] rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                {editingId ? 'Edit Milestone Portfolio' : 'Configure Milestone Portfolio'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#8A94A6] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-[#8A94A6] font-bold uppercase tracking-wider">Milestone Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dream Home Downpayment"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-sm focus:border-[#00D4AA] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8A94A6] font-bold uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalItem['category'])}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-sm focus:border-[#00D4AA] focus:outline-none"
                >
                  {Object.keys(CATEGORY_CONFIG).map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0A1022] text-white">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#8A94A6] font-bold uppercase tracking-wider">Target Corpus (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 2500000"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-sm focus:border-[#00D4AA] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#8A94A6] font-bold uppercase tracking-wider">Current Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-sm focus:border-[#00D4AA] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8A94A6] font-bold uppercase tracking-wider">Target Deadline Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-sm focus:border-[#00D4AA] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-lg text-[#8A94A6] hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs cursor-pointer"
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
