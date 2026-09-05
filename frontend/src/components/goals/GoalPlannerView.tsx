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
        <span className="font-bold font-mono text-[#0F172A] text-[12px] leading-none">
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

  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
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
            <Target className="w-5 h-5 text-[#00A884]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">Lifecycle Milestone Roadmaps</h1>
          </div>
          <p className="text-xs text-[#64748B]">
            Quantify capital required for primary milestones and model monthly SIP allocations.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#00D4AA] hover:bg-[#00BFA0] text-[#050816] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* 3 Summary Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div style={{ ...cardStyle, padding: '18px 20px' }} className="space-y-1">
          <span className="text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider block">Total Milestone Target</span>
          <div className="text-2xl font-black text-[#0F172A] font-mono leading-tight">
            {formatCurrency(totalTargetAmount)}
          </div>
          <div className="flex justify-between text-xs text-[#64748B] pt-1">
            <span>Saved: <strong className="text-[#0F172A] font-mono">{formatCurrency(totalCurrentSaved)}</strong></span>
            <span className="font-semibold text-[#00A884]">{totalProgressPct}% Funded</span>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '18px 20px' }} className="space-y-1">
          <span className="text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider block">Required Monthly Deployment</span>
          <div className={`text-2xl font-black font-mono leading-tight ${isSurplusDeficit ? 'text-[#FF5252]' : 'text-[#00A884]'}`}>
            {formatCurrency(totalRequiredSIP)}/mo
          </div>
          <div className="text-xs text-[#64748B] pt-1">
            {isSurplusDeficit ? `Exceeds monthly surplus by ${formatCurrency(totalRequiredSIP - surplus)}` : `Comfortably funded from ${formatCurrency(surplus)} surplus`}
          </div>
        </div>

        <div style={{ ...cardStyle, padding: '18px 20px' }} className="space-y-1">
          <span className="text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider block">Remaining Funding Gap</span>
          <div className="text-2xl font-black text-[#0F172A] font-mono leading-tight">
            {formatCurrency(totalRemaining)}
          </div>
          <div className="text-xs text-[#64748B] pt-1">
            Across {goals.length} Defined Goals
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#64748B] pb-2 border-b border-[#E2E8F0]">
          <span className="font-bold uppercase tracking-wider text-[#0F172A]">Active Milestone Portfolios</span>
          <span>{goals.length} Goals Registered</span>
        </div>

        {goals.length === 0 ? (
          <div style={{ ...cardStyle, padding: '36px 20px' }} className="text-center space-y-3">
            <Target className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <p className="text-sm text-[#64748B]">No milestone portfolios configured yet.</p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#00D4AA] hover:bg-[#00BFA0] text-[#050816] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
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
                        <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center" style={{ color: cfg.color }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#0F172A]">{g.title}</h3>
                          <span className="text-xs text-[#64748B]">Target Date: {g.targetDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(g)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#FF5252] hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Dominant Target Amount & SIP */}
                    <div className="flex items-baseline justify-between pt-2 border-t border-[#E2E8F0]">
                      <div>
                        <span className="text-[10.5px] text-[#64748B] font-bold block uppercase">Target Corpus</span>
                        <span className="text-xl font-black text-[#0F172A] font-mono">{formatCurrency(g.targetAmount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10.5px] text-[#64748B] font-bold block uppercase">Required Monthly SIP</span>
                        <span className="text-sm font-bold font-mono text-[#00A884]">{formatCurrency(g.monthlySipRequired || 0)}/mo</span>
                      </div>
                    </div>

                    {/* Visual Progress Gauge */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <CircularProgress pct={progressPct} size={50} color={cfg.color} label={`${progressPct}%`} />
                      <div className="flex-1 space-y-1 text-xs">
                        <div className="flex justify-between text-[11.5px]">
                          <span className="text-[#64748B]">Funded: <strong className="text-[#0F172A] font-mono">{formatCurrency(g.currentAmount)}</strong></span>
                          <span className="text-[#64748B]">Gap: <strong className="text-[#64748B] font-mono">{formatCurrency(remainingAmt)}</strong></span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: cfg.color }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feasibility Indicator */}
                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Feasibility Status:</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isFeasible ? 'bg-[#00C853]/10 text-[#008769] border border-[#00C853]/20' : 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] uppercase tracking-wider">
                {editingId ? 'Edit Milestone Portfolio' : 'Configure Milestone Portfolio'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer active:scale-95" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Milestone Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dream Home Downpayment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm focus:border-[#00D4AA] focus:bg-white focus:outline-none placeholder:text-[#94A3B8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalItem['category'])}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm focus:border-[#00D4AA] focus:bg-white focus:outline-none"
                >
                  {Object.keys(CATEGORY_CONFIG).map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-[#0F172A]">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Target Corpus (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 2500000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm focus:border-[#00D4AA] focus:bg-white focus:outline-none font-mono placeholder:text-[#94A3B8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Current Saved (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm focus:border-[#00D4AA] focus:bg-white focus:outline-none font-mono placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#64748B] font-bold uppercase tracking-wider">Target Deadline Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-sm focus:border-[#00D4AA] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00D4AA] hover:bg-[#00BFA0] text-[#050816] font-bold text-xs cursor-pointer shadow-xs"
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
