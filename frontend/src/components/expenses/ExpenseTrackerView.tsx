import React, { useState } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  X, 
  Receipt
} from 'lucide-react';
import type { ExpenseItem } from '../../types';

export const ExpenseTrackerView: React.FC = () => {
  const { 
    user, 
    expenses, 
    addExpense, 
    editExpense, 
    deleteExpense, 
    formatCurrency 
  } = useFintechStore();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [category, setCategory] = useState<ExpenseItem['category']>('Food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const salary = user?.salaryIncome || user?.monthlyIncome || 0;
  const otherInc = user?.otherIncome || 0;
  const totalIncome = salary + otherInc;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  const burnRate = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;

  // Institutional Category Meta
  const categoryMeta: Record<ExpenseItem['category'], { color: string; label: string; group: 'Needs' | 'Wants' | 'Fixed' }> = {
    Food: { color: '#00D4AA', label: 'Food & Dining', group: 'Needs' },
    Rent: { color: '#1E88E5', label: 'Housing & Rent', group: 'Needs' },
    Shopping: { color: '#FF5252', label: 'Shopping & Lifestyle', group: 'Wants' },
    Transport: { color: '#00C853', label: 'Transport & Commute', group: 'Needs' },
    Entertainment: { color: '#8B5CF6', label: 'Entertainment & Leisure', group: 'Wants' },
    Utilities: { color: '#F59E0B', label: 'Bills & Utilities', group: 'Fixed' },
    EMI: { color: '#FF5252', label: 'Debt Service & EMIs', group: 'Fixed' },
    Other: { color: '#8A94A6', label: 'Miscellaneous', group: 'Wants' },
  };

  const cardStyle = {
    background: '#101827',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
  };

  // Group totals
  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  // Needs vs Wants vs Fixed breakdown
  const needsTotal = (categoryTotals['Food'] || 0) + (categoryTotals['Rent'] || 0) + (categoryTotals['Transport'] || 0);
  const wantsTotal = (categoryTotals['Shopping'] || 0) + (categoryTotals['Entertainment'] || 0) + (categoryTotals['Other'] || 0);
  const fixedTotal = (categoryTotals['Utilities'] || 0) + (categoryTotals['EMI'] || 0);

  // Discretionary 25% Reduction Compounding Benefit at 13.5% CAGR over 20 years
  const potentialMonthlySaved = Math.round(wantsTotal * 0.25);
  const months20Yr = 20 * 12;
  const rateMonth = 0.135 / 12;
  const futureCorpus20Yr = potentialMonthlySaved > 0 
    ? Math.round(potentialMonthlySaved * ((Math.pow(1 + rateMonth, months20Yr) - 1) / rateMonth) * (1 + rateMonth))
    : 0;

  const handleOpenAddModal = () => {
    setEditingId(null);
    setCategory('Food');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleOpenEditModal = (item: ExpenseItem) => {
    setEditingId(item.id);
    setCategory(item.category);
    setAmount(String(item.amount));
    setDescription(item.description);
    setDate(item.date);
    setShowModal(true);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    if (editingId) {
      editExpense(editingId, {
        category,
        amount: Number(amount),
        date,
        description: description.trim() || `${category} expense`,
      });
    } else {
      addExpense({
        category,
        amount: Number(amount),
        date,
        description: description.trim() || `${category} expense`,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div style={{ ...cardStyle, padding: '20px 24px' }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#00D4AA]" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Monthly Cash Flow & Surplus</h1>
          </div>
          <p className="text-xs text-[#8A94A6]">
            Audit fixed baseline expenditure, track discretionary leaks, and optimize investable capital capacity.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs hover:bg-[#00D4AA]/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Analytics Overview: Total Expense + Needs / Wants / Fixed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left: Total Expense & Burn Metric */}
        <div style={{ ...cardStyle, padding: '20px 22px' }} className="md:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10.5px] text-[#8A94A6] font-bold uppercase tracking-wider block">Total Monthly Outflow</span>
            <div className="text-3xl font-black text-white font-mono leading-tight">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#8A94A6] pt-1">
              <span>Burn Ratio: <strong className="text-[#FF5252] font-mono">{burnRate}%</strong></span>
              <span>•</span>
              <span>Savings Rate: <strong className="text-[#00D4AA] font-mono">{savingsRate}%</strong></span>
            </div>
          </div>

          {/* Progress Split Bar */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between text-xs text-[#8A94A6]">
              <span>Inflow: <strong className="text-white font-mono">{formatCurrency(totalIncome)}</strong></span>
              <span>Surplus: <strong className="text-[#00D4AA] font-mono">{formatCurrency(netSavings)}</strong></span>
            </div>
            <div className="w-full bg-[#0A1022] h-2 rounded-full overflow-hidden flex">
              <div className="h-full bg-[#FF5252]" style={{ width: `${Math.min(100, burnRate)}%` }} />
              <div className="h-full bg-[#00D4AA]" style={{ width: `${Math.min(100 - burnRate, savingsRate)}%` }} />
            </div>
          </div>
        </div>

        {/* Right: Essentiality Distribution (50/30/20 Rule) */}
        <div style={{ ...cardStyle, padding: '20px 22px' }} className="md:col-span-7 space-y-3.5">
          <span className="text-[10.5px] text-[#8A94A6] font-bold uppercase tracking-wider block">
            Essentiality Allocation (50 / 30 / 20 Rule)
          </span>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] space-y-1">
              <span className="text-[10.5px] text-[#00D4AA] font-bold block uppercase">NEEDS (CORE)</span>
              <div className="text-base font-black text-white font-mono">{formatCurrency(needsTotal)}</div>
              <div className="text-[11px] text-[#8A94A6]">
                {totalIncome > 0 ? Math.round((needsTotal / totalIncome) * 100) : 0}% (≤50%)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] space-y-1">
              <span className="text-[10.5px] text-amber-400 font-bold block uppercase">WANTS (DISCRETIONARY)</span>
              <div className="text-base font-black text-white font-mono">{formatCurrency(wantsTotal)}</div>
              <div className="text-[11px] text-[#8A94A6]">
                {totalIncome > 0 ? Math.round((wantsTotal / totalIncome) * 100) : 0}% (≤30%)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] space-y-1">
              <span className="text-[10.5px] text-[#8B5CF6] font-bold block uppercase">FIXED & EMIS</span>
              <div className="text-base font-black text-white font-mono">{formatCurrency(fixedTotal)}</div>
              <div className="text-[11px] text-[#8A94A6]">
                {totalIncome > 0 ? Math.round((fixedTotal / totalIncome) * 100) : 0}% (≤20%)
              </div>
            </div>
          </div>

          {/* 20-Year Compounding Leak Analysis */}
          {wantsTotal > 0 && (
            <div className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.06] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#00D4AA] shrink-0 mt-0.5" />
              <div className="text-xs text-[#8A94A6] leading-relaxed">
                <strong className="text-white">Compounding Opportunity:</strong> Trimming discretionary spend by 25% ({formatCurrency(potentialMonthlySaved)}/mo) and redirecting into a 13.5% CAGR allocation could yield <strong className="text-[#00D4AA] font-mono">{formatCurrency(futureCorpus20Yr)}</strong> in 20 years.
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Category Breakdown */}
      <div style={{ ...cardStyle, padding: '20px 22px' }} className="space-y-3.5">
        <span className="text-[10.5px] text-[#8A94A6] font-bold uppercase tracking-wider block">
          Outflow by Expenditure Category
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(categoryMeta) as ExpenseItem['category'][]).map((cat) => {
            const meta = categoryMeta[cat];
            const catAmt = categoryTotals[cat] || 0;
            const pct = totalExpenses > 0 ? Math.round((catAmt / totalExpenses) * 100) : 0;

            return (
              <div key={cat} className="p-3 rounded-lg bg-[#0A1022] border border-white/[0.04] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white font-medium">{meta.label}</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(catAmt)}</span>
                </div>
                <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                </div>
                <div className="flex justify-between text-[10.5px] text-[#8A94A6]">
                  <span>{meta.group}</span>
                  <span className="font-mono font-bold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div style={{ ...cardStyle, padding: '20px 22px' }} className="space-y-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#00D4AA]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Logged Outflows ({expenses.length})</h3>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="text-xs text-[#00D4AA] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-[#0A1022] rounded-lg">
            <Receipt className="w-8 h-8 text-[#5A667A] mx-auto" />
            <p className="text-xs text-[#8A94A6]">No expenditure logged yet. Add your living costs to compute cashflow surplus.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {expenses.map((item) => {
              const meta = categoryMeta[item.category] || categoryMeta.Other;
              return (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-md transition-colors text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-[11px] bg-[#0A1022] border border-white/[0.06]" style={{ color: meta.color }}>
                      {item.category.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{item.description}</div>
                      <div className="text-[11px] text-[#8A94A6]">{item.date} • {meta.label}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">{formatCurrency(item.amount)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1 rounded text-[#8A94A6] hover:text-white transition-colors cursor-pointer"
                        title="Edit Expense"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExpense(item.id)}
                        className="p-1 rounded text-[#8A94A6] hover:text-[#FF5252] transition-colors cursor-pointer"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#101827] border border-white/[0.12] rounded-xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                {editingId ? 'Edit Expenditure Record' : 'Add Expenditure Record'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded text-[#8A94A6] hover:text-white cursor-pointer active:scale-95" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-[#8A94A6] font-bold uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-xs focus:border-[#00D4AA] focus:outline-none"
                >
                  {(Object.keys(categoryMeta) as ExpenseItem['category'][]).map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0A1022] text-white">{categoryMeta[cat].label} ({categoryMeta[cat].group})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8A94A6] font-bold uppercase tracking-wider">Monthly Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-xs focus:border-[#00D4AA] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8A94A6] font-bold uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Groceries and weekly dining"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-xs focus:border-[#00D4AA] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8A94A6] font-bold uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-xs focus:border-[#00D4AA] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-[#8A94A6] hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00D4AA] text-[#050816] font-bold text-xs cursor-pointer"
                >
                  {editingId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
