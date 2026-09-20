import React, { useState } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
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
    <div className="space-y-8 pb-12 font-sans">
      
      {/* 1. CASH FLOW & SURPLUS TELEMETRY */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[var(--color-accent-strong)]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">Expense Tracker</h1>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Audit fixed baseline expenditure, track discretionary leaks, and optimize investable capital capacity.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[var(--color-accent)] hover:brightness-105 text-[var(--color-accent-text)] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* 4 Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Monthly Inflow</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] font-mono leading-tight">
              {formatCurrency(totalIncome)}
            </div>
            <span className="text-xs text-[var(--color-text-secondary)] block">Gross Cash Inflow</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Monthly Outflow</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] font-mono leading-tight">
              {formatCurrency(totalExpenses)}
            </div>
            <span className="text-xs text-red-500 font-mono block">Burn Ratio: {burnRate}%</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Investable Surplus</span>
            <div className="text-2xl sm:text-3xl font-black text-[var(--color-accent-strong)] font-mono leading-tight">
              {formatCurrency(netSavings)}
            </div>
            <span className="text-xs text-emerald-600 block font-medium">Deployable / month</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Savings Rate</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] font-mono leading-tight">
              {savingsRate}%
            </div>
            <span className="text-xs text-[var(--color-text-secondary)] block">Target ≥30%</span>
          </div>
        </div>
      </section>

      {/* 2. ESSENTIALITY ALLOCATION (50 / 30 / 20 RULE) & COMPOUNDING */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        <div className="space-y-1 pb-3 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            Essentiality Allocation (50 / 30 / 20 Rule)
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Benchmark distribution vs. standard institutional financial guardrails
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] font-bold block uppercase">Needs (Core)</span>
            <div className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] font-mono">{formatCurrency(needsTotal)}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              {totalIncome > 0 ? Math.round((needsTotal / totalIncome) * 100) : 0}% (target ≤50%)
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] font-bold block uppercase">Wants (Discretionary)</span>
            <div className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] font-mono">{formatCurrency(wantsTotal)}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              {totalIncome > 0 ? Math.round((wantsTotal / totalIncome) * 100) : 0}% (target ≤30%)
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[var(--color-text-muted)] font-bold block uppercase">Fixed Commitments</span>
            <div className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] font-mono">{formatCurrency(fixedTotal)}</div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              {totalIncome > 0 ? Math.round((fixedTotal / totalIncome) * 100) : 0}% (target ≤20%)
            </div>
          </div>
        </div>

        {/* Compounding Opportunity Analysis */}
        {wantsTotal > 0 && (
          <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-start gap-2.5 text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <TrendingUp className="w-4 h-4 text-[var(--color-accent-strong)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--color-text-primary)]">Compounding Opportunity:</strong> Trimming discretionary spend by 25% ({formatCurrency(potentialMonthlySaved)}/mo) and redirecting into a 13.5% CAGR allocation could yield <strong className="text-emerald-600 font-mono">{formatCurrency(futureCorpus20Yr)}</strong> in 20 years.
            </div>
          </div>
        )}
      </section>

      {/* 3. CATEGORY BREAKDOWN */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        <div className="pb-3 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            Outflow by Expenditure Category
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(categoryMeta) as ExpenseItem['category'][]).map((cat) => {
            const meta = categoryMeta[cat];
            const catAmt = categoryTotals[cat] || 0;
            const pct = totalExpenses > 0 ? Math.round((catAmt / totalExpenses) * 100) : 0;

            return (
              <div key={cat} className="space-y-1.5 py-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-text-primary)] font-semibold">{meta.label}</span>
                  <span className="font-mono font-bold text-[var(--color-text-primary)]">{formatCurrency(catAmt)}</span>
                </div>
                <div className="w-full bg-[var(--color-surface-3)] h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                </div>
                <div className="flex justify-between text-[11px] text-[var(--color-text-secondary)]">
                  <span>{meta.group}</span>
                  <span className="font-mono font-bold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. AUDITED EXPENSE REGISTER & LEDGER */}
      <section className="financial-section-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[var(--color-accent-strong)]" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">Logged Outflows ({expenses.length})</h3>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="text-xs text-[var(--color-accent-strong)] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-[var(--color-border)] rounded-2xl">
            <Receipt className="w-8 h-8 text-[var(--color-text-muted)] mx-auto" />
            <p className="text-xs text-[var(--color-text-secondary)]">No expenditure logged yet. Add your living costs to compute cashflow surplus.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {expenses.map((item) => {
              const meta = categoryMeta[item.category] || categoryMeta.Other;
              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)]" style={{ color: meta.color }}>
                      {item.category.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-text-primary)] text-sm">{item.description}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">{item.date} · {meta.label}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-sm text-[var(--color-text-primary)]">{formatCurrency(item.amount)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                        title="Edit Expense"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExpense(item.id)}
                        className="p-1 rounded-md text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50/10 transition-colors cursor-pointer"
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
      </section>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                {editingId ? 'Edit Expenditure Record' : 'Add Expenditure Record'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] cursor-pointer active:scale-95" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseItem['category'])}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:border-[var(--color-accent)] focus:outline-none"
                >
                  {(Object.keys(categoryMeta) as ExpenseItem['category'][]).map((cat) => (
                    <option key={cat} value={cat} className="bg-[var(--color-card)] text-[var(--color-text-primary)]">{categoryMeta[cat].label} ({categoryMeta[cat].group})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Monthly Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:border-[var(--color-accent)] focus:bg-[var(--color-card)] focus:outline-none font-mono placeholder:text-[var(--color-text-muted)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Groceries and weekly dining"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:border-[var(--color-accent)] focus:bg-[var(--color-card)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:border-[var(--color-accent)] focus:bg-[var(--color-card)] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:brightness-105 text-[var(--color-accent-text)] font-bold text-xs cursor-pointer shadow-xs"
                >
                  {editingId ? 'Update Record' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
