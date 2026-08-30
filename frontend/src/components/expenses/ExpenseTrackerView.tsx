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

  // Category Meta
  const categoryMeta: Record<ExpenseItem['category'], { color: string; label: string; group: 'Needs' | 'Wants' | 'Fixed' }> = {
    Food: { color: '#0d9488', label: 'Food & Dining', group: 'Needs' },
    Rent: { color: '#0284c7', label: 'Housing & Rent', group: 'Needs' },
    Shopping: { color: '#f43f5e', label: 'Shopping & Lifestyle', group: 'Wants' },
    Transport: { color: '#06b6d4', label: 'Transport & Fuel', group: 'Needs' },
    Entertainment: { color: '#a855f7', label: 'Entertainment', group: 'Wants' },
    Utilities: { color: '#f59e0b', label: 'Bills & Utilities', group: 'Fixed' },
    EMI: { color: '#ef4444', label: 'Loans & EMI', group: 'Fixed' },
    Other: { color: '#64748b', label: 'Miscellaneous', group: 'Wants' },
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
      <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-[26px] font-bold text-[#172033] tracking-tight">Monthly Spending & Cashflows</h1>
          </div>
          <p className="text-[14px] text-[#667085]">
            Categorize living costs, track discretionary spending leaks, and unlock investable surplus.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="glow-btn-primary px-4 py-2.5 rounded-lg text-white font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Analytics Overview: Total Expense + Needs / Wants / Fixed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left: Total Expense & Burn Metric */}
        <div className="md:col-span-5 p-5 sm:p-6 rounded-xl bg-white border border-[#E7E9F0] space-y-3.5 flex flex-col justify-between shadow-xs">
          <div className="space-y-1.5">
            <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">Total Monthly Expenses</span>
            <div className="text-[30px] sm:text-[34px] font-black text-[#172033] font-mono leading-tight">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#667085] pt-1">
              <span>Burn Ratio: <strong className="text-rose-600 font-mono font-bold">{burnRate}% of Inflow</strong></span>
              <span>•</span>
              <span>Savings Rate: <strong className="text-teal-700 font-mono font-bold">{savingsRate}%</strong></span>
            </div>
          </div>

          {/* Progress Split Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[13px] text-[#667085]">
              <span>Monthly Inflow: <strong className="text-[#172033] font-mono">{formatCurrency(totalIncome)}</strong></span>
              <span>Surplus: <strong className="text-teal-700 font-mono">{formatCurrency(netSavings)}</strong></span>
            </div>
            <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden flex">
              <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, burnRate)}%` }} />
              <div className="h-full bg-teal-500" style={{ width: `${Math.min(100 - burnRate, savingsRate)}%` }} />
            </div>
          </div>
        </div>

        {/* Right: Essentiality Distribution (Needs vs Wants vs Fixed) */}
        <div className="md:col-span-7 p-5 sm:p-6 rounded-xl bg-white border border-[#E7E9F0] space-y-3.5 shadow-xs">
          <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">
            Essentiality Distribution (50/30/20 Rule)
          </span>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] space-y-1">
              <span className="text-[11.5px] text-teal-700 font-bold block">NEEDS (CORE)</span>
              <span className="text-[17px] sm:text-[19px] font-black text-[#172033] font-mono leading-tight">{formatCurrency(needsTotal)}</span>
              <div className="text-[12px] text-[#667085]">
                {totalIncome > 0 ? Math.round((needsTotal / totalIncome) * 100) : 0}% of Inflow (≤50%)
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] space-y-1">
              <span className="text-[11.5px] text-amber-700 font-bold block">WANTS (DISCRETIONARY)</span>
              <span className="text-[17px] sm:text-[19px] font-black text-[#172033] font-mono leading-tight">{formatCurrency(wantsTotal)}</span>
              <div className="text-[12px] text-[#667085]">
                {totalIncome > 0 ? Math.round((wantsTotal / totalIncome) * 100) : 0}% of Inflow (≤30%)
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] space-y-1">
              <span className="text-[11.5px] text-purple-700 font-bold block">FIXED & EMIs</span>
              <span className="text-[17px] sm:text-[19px] font-black text-[#172033] font-mono leading-tight">{formatCurrency(fixedTotal)}</span>
              <div className="text-[12px] text-[#667085]">
                {totalIncome > 0 ? Math.round((fixedTotal / totalIncome) * 100) : 0}% of Inflow (≤20%)
              </div>
            </div>
          </div>

          {/* 20-Year Compounding Leak Analysis */}
          {wantsTotal > 0 && (
            <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-200 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-900 block text-[14px]">Opportunity: Compounding Leak Analysis</span>
                <span className="text-slate-700 text-[13px] leading-relaxed">
                  Trimming discretionary spend by 25% ({formatCurrency(potentialMonthlySaved)}/mo) and redirecting it into your 13.5% CAGR strategy could create an additional <strong className="text-teal-800 font-mono font-bold">{formatCurrency(futureCorpus20Yr)}</strong> in 20 years.
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-[#E7E9F0] space-y-3.5 shadow-xs">
        <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">
          Outflow by Category
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(Object.keys(categoryMeta) as ExpenseItem['category'][]).map((cat) => {
            const meta = categoryMeta[cat];
            const catAmt = categoryTotals[cat] || 0;
            const pct = totalExpenses > 0 ? Math.round((catAmt / totalExpenses) * 100) : 0;

            return (
              <div key={cat} className="p-3.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] space-y-1.5">
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-[#172033] font-medium">{meta.label}</span>
                  <span className="font-mono font-bold text-[#172033]">{formatCurrency(catAmt)}</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                </div>
                <div className="flex justify-between text-[12px] text-[#667085]">
                  <span>{meta.group}</span>
                  <span className="font-mono font-bold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E9F0]">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <h3 className="text-[17px] font-bold text-[#172033] uppercase tracking-wider">Recent Transactions ({expenses.length})</h3>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="text-[13px] text-teal-700 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#F8F9FC] border border-[#E7E9F0] text-center space-y-2">
            <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-[14px] text-[#667085]">No expenses logged yet. Add your living costs to unlock cashflow analysis.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {expenses.map((item) => {
              const meta = categoryMeta[item.category] || categoryMeta.Other;
              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 hover:bg-[#F8F9FC] px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                      {item.category.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#172033] text-[14.5px]">{item.description}</div>
                      <div className="text-[12.5px] text-[#667085]">{item.date} • {meta.label} ({meta.group})</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-[16px] text-[#172033]">{formatCurrency(item.amount)}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded text-[#667085] hover:text-[#172033] transition-colors cursor-pointer hover:bg-slate-100"
                        title="Edit Expense"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteExpense(item.id)}
                        className="p-1.5 rounded text-[#667085] hover:text-rose-600 transition-colors cursor-pointer hover:bg-slate-100"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E7E9F0] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7E9F0]">
              <h3 className="text-[18px] font-bold text-[#172033] uppercase tracking-wider">
                {editingId ? 'Edit Expense Record' : 'Add Expense Record'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#667085] hover:text-[#172033] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[13.5px] text-[#172033] font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white"
                >
                  {(Object.keys(categoryMeta) as ExpenseItem['category'][]).map((cat) => (
                    <option key={cat} value={cat}>{categoryMeta[cat].label} ({categoryMeta[cat].group})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[13.5px] text-[#172033] font-medium">Monthly Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[13.5px] text-[#172033] font-medium">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Groceries and weekly dining"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[13.5px] text-[#172033] font-medium">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  {editingId ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
