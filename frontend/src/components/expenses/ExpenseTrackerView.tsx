import React, { useState } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
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
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      
      {/* Page Header (no card wrapper) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Cash Flow & Expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track monthly expenditure, identify trends, and manage investable surplus.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-1.5 rounded-lg bg-[#0D9488] text-white font-medium text-xs hover:bg-[#0F766E] transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left: cashflow summary */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 md:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block">Total Monthly Outflow</span>
            <div className="text-2xl font-semibold text-slate-900 dark:text-white font-mono">{formatCurrency(totalExpenses)}</div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Burn: <strong className="text-rose-600 font-mono">{burnRate}%</strong></span>
              <span>·</span>
              <span>Savings: <strong className="text-[#0D9488] dark:text-[#00D4AA] font-mono">{savingsRate}%</strong></span>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Inflow: <strong className="text-slate-700 dark:text-slate-200 font-mono">{formatCurrency(totalIncome)}</strong></span>
              <span>Surplus: <strong className="text-[#0D9488] dark:text-[#00D4AA] font-mono">{formatCurrency(netSavings)}</strong></span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#060811] h-1.5 rounded-full overflow-hidden flex">
              <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, burnRate)}%` }} />
              <div className="h-full bg-[#0D9488]" style={{ width: `${Math.min(100 - burnRate, savingsRate)}%` }} />
            </div>
          </div>
        </div>

        {/* Right: 50/30/20 */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 md:col-span-7 space-y-3">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block">50 / 30 / 20 Rule</span>

          <div className="space-y-2">
            {[
              { label: 'Needs', sub: '≤50%', amount: needsTotal, color: '#0D9488' },
              { label: 'Wants', sub: '≤30%', amount: wantsTotal, color: '#D97706' },
              { label: 'Fixed & EMIs', sub: '≤20%', amount: fixedTotal, color: '#0284C7' },
            ].map(item => {
              const pct = totalIncome > 0 ? Math.round((item.amount / totalIncome) * 100) : 0;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.sub}</div>
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-[#060811] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: item.color }} />
                  </div>
                  <div className="text-right w-28 shrink-0">
                    <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</div>
                    <div className="text-[10px] text-slate-400">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {wantsTotal > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488] shrink-0 mt-0.5" />
              <span>
                Trim discretionary by 25% ({formatCurrency(potentialMonthlySaved)}/mo) → <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(futureCorpus20Yr)}</strong> in 20yr at 13.5% CAGR.
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 space-y-3">
        <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wide block">By Category</span>
        <div className="space-y-2">
          {(Object.keys(categoryMeta) as ExpenseItem['category'][]).filter(cat => (categoryTotals[cat] || 0) > 0).map((cat) => {
            const meta = categoryMeta[cat];
            const catAmt = categoryTotals[cat] || 0;
            const pct = totalExpenses > 0 ? Math.round((catAmt / totalExpenses) * 100) : 0;

            return (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{meta.label}</div>
                  <div className="text-[10px] text-slate-400">{meta.group}</div>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-[#060811] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                </div>
                <div className="text-right w-24 shrink-0">
                  <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(catAmt)}</div>
                  <div className="text-[10px] text-slate-400">{pct}%</div>
                </div>
              </div>
            );
          })}
          {Object.keys(categoryTotals).length === 0 && (
            <p className="text-xs text-slate-400 py-2">No expenses logged yet.</p>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-white/[0.06] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.04]">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Logged Transactions ({expenses.length})</h3>
          <button
            onClick={handleOpenAddModal}
            className="text-xs text-[#0D9488] dark:text-[#00D4AA] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-slate-50 dark:bg-[#060811] rounded-lg">
            <Receipt className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">No expenditure logged yet. Add your living costs to compute cashflow surplus.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {expenses.map((item) => {
              const meta = categoryMeta[item.category] || categoryMeta.Other;
              return (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] px-2 rounded-lg transition-colors text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs bg-slate-100 dark:bg-[#060811]" style={{ color: meta.color }}>
                      {item.category.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{item.description}</div>
                      <div className="text-[11px] text-slate-400">{item.date} • {meta.label}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                        title="Edit Expense"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExpense(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-xl p-6 space-y-4 font-sans animate-fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editingId ? 'Edit Expenditure' : 'Log New Outflow'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-[#00D4AA]"
                >
                  {(Object.keys(categoryMeta) as ExpenseItem['category'][]).map((c) => (
                    <option key={c} value={c}>{categoryMeta[c].label} ({categoryMeta[c].group})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Monthly Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  required
                  min="1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-[#00D4AA] font-mono"
                />
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Flat rent / Groceries"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:border-[#00D4AA]"
                />
              </div>

              <div>
                <label className="text-slate-500 dark:text-slate-400 font-semibold block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  {editingId ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
