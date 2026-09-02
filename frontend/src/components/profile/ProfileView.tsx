import React, { useState, useEffect, useMemo } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  User, 
  CheckCircle2, 
  RefreshCw,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface ProfileFormData {
  fullName: string;
  age: string;
  occupation: string;
  salaryIncome: string;
  otherIncome: string;
  emergencyFund: string;
  existingInvestments: string;
  financialGoal: string;
  investmentHorizon: string;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  investmentExperience: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const ProfileView: React.FC = () => {
  const { 
    user, 
    updateUserProfile, 
    formatCurrency, 
    runAiAnalysis,
    expenses
  } = useFintechStore();

  // Helper to extract form data from user object (clean empty state for new users)
  const getInitialForm = (u: typeof user): ProfileFormData => ({
    fullName: u?.name || '',
    age: u?.age ? String(u.age) : '',
    occupation: u?.occupation || '',
    salaryIncome: u?.salaryIncome !== undefined && u?.salaryIncome !== null 
      ? String(u.salaryIncome) 
      : (u?.monthlyIncome !== undefined && u?.monthlyIncome !== null ? String(u.monthlyIncome) : ''),
    otherIncome: u?.otherIncome !== undefined && u?.otherIncome !== null ? String(u.otherIncome) : '',
    emergencyFund: u?.emergencyFund !== undefined && u?.emergencyFund !== null 
      ? String(u.emergencyFund) 
      : (u?.existingSavings !== undefined && u?.existingSavings !== null ? String(u.existingSavings) : ''),
    existingInvestments: u?.existingInvestments !== undefined && u?.existingInvestments !== null 
      ? String(u.existingInvestments) 
      : '',
    financialGoal: u?.financialGoal || '',
    investmentHorizon: u?.investmentHorizon || '5 to 10 years',
    riskTolerance: (u?.riskTolerance as any) || 'Moderate',
    investmentExperience: (u?.investmentExperience as any) || 'Intermediate',
  });

  // Local Controlled Form State
  const [form, setForm] = useState<ProfileFormData>(() => getInitialForm(user));
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync with store only when store user changes from external source and form is not dirty
  useEffect(() => {
    if (!isDirty && user) {
      setForm(getInitialForm(user));
    }
  }, [user, isDirty]);

  // Update a single field in controlled form state
  const updateField = <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    setSavedSuccess(false);
    setErrorMessage(null);
  };

  // Reset local edits back to last saved profile
  const handleReset = () => {
    setForm(getInitialForm(user));
    setIsDirty(false);
    setErrorMessage(null);
    setSavedSuccess(false);
  };

  // Calculated Metrics (Real-time dynamic display from form inputs)
  const numericSalary = Number(form.salaryIncome) || 0;
  const numericOther = Number(form.otherIncome) || 0;
  const totalInflow = numericSalary + numericOther;
  const totalOutflows = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0) || (user?.monthlyExpenses || 0);
  const surplus = Math.max(0, totalInflow - totalOutflows);
  const numericEmergency = Number(form.emergencyFund) || 0;

  // Validation
  const validationError = useMemo(() => {
    if (!form.fullName.trim()) return 'Full Name cannot be empty.';
    if (form.age && (Number(form.age) < 18 || Number(form.age) > 100)) {
      return 'Please enter a valid age between 18 and 100.';
    }
    if (numericSalary < 0 || numericOther < 0) {
      return 'Income amounts cannot be negative.';
    }
    if (numericEmergency < 0) {
      return 'Emergency fund cannot be negative.';
    }
    if (Number(form.existingInvestments) < 0) {
      return 'Existing portfolio value cannot be negative.';
    }
    return null;
  }, [form, numericSalary, numericOther, numericEmergency]);

  // Save & Recalibrate Strategy
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const riskScore = form.riskTolerance === 'Aggressive' ? 85 : (form.riskTolerance === 'Conservative' ? 25 : 55);
      
      const updatedProfilePayload = {
        name: form.fullName.trim(),
        age: form.age ? Number(form.age) : undefined,
        occupation: form.occupation.trim() || undefined,
        salaryIncome: numericSalary,
        otherIncome: numericOther,
        monthlyIncome: totalInflow,
        monthlyExpenses: totalOutflows,
        emergencyFund: numericEmergency,
        existingSavings: numericEmergency,
        existingInvestments: Number(form.existingInvestments) || 0,
        financialGoal: form.financialGoal,
        investmentHorizon: form.investmentHorizon,
        investmentExperience: form.investmentExperience,
        riskTolerance: form.riskTolerance,
        riskCategory: form.riskTolerance,
        riskScore
      };

      await updateUserProfile(updatedProfilePayload);
      await runAiAnalysis();

      setIsDirty(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      setErrorMessage('Unable to save your profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E6FDF7] dark:bg-[#00D4AA]/10 flex items-center justify-center border border-[#00D4AA]/30 text-[#00D4AA]">
              <User className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Investor Mandate & Profile</h1>
            {isDirty && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30">
                Unsaved Edits
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure your capital parameters, volatility tolerances, and lifecycle horizon to recalibrate portfolio strategy.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-[#00D4AA] text-[#060811] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-[#00D4AA]/25 transition-all hover:bg-[#00BFA5] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Recalibrating...' : 'Save & Recalibrate'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-[#00D4AA]/10 border border-emerald-200 dark:border-[#00D4AA]/30 text-emerald-800 dark:text-[#00D4AA] text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#00D4AA] shrink-0" />
          <span>Profile parameters updated. Multi-asset investment strategy successfully recalibrated.</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-[#FF5252]/10 border border-red-200 dark:border-[#FF5252]/30 text-red-700 dark:text-[#FF5252] text-xs font-semibold flex items-center justify-between gap-2.5 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FF5252] shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-3 py-1 bg-[#FF5252] text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Inflow</span>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(totalInflow)}</div>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">{form.occupation || 'Active Inflow'}</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Outflow</span>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(totalOutflows)}</div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">{expenses.length} Logged Categories</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Investable Surplus</span>
          <div className="text-xl font-black text-[#0D9488] dark:text-[#00D4AA] font-mono">{formatCurrency(surplus)}</div>
          <span className="text-xs text-[#0D9488] dark:text-[#00D4AA]/80 block">Capacity to deploy</span>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Emergency Reserve</span>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(numericEmergency)}</div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">Liquid Reserves</span>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* 1. PERSONAL INFORMATION */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-white/[0.06]">
            1. Investor Demographics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Full Legal Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Investor Name"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Age (Years)</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
                placeholder="e.g. 28"
                min="18"
                max="100"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none font-mono placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Occupation</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* 2. FINANCIAL PARAMETERS */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-white/[0.06]">
            2. Capital Inflows & Assets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Monthly Take-Home Salary (₹)</label>
              <input
                type="number"
                value={form.salaryIncome}
                onChange={(e) => updateField('salaryIncome', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none font-mono placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Other Monthly Cash Inflows (₹)</label>
              <input
                type="number"
                value={form.otherIncome}
                onChange={(e) => updateField('otherIncome', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none font-mono placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Emergency Cash Reserves (₹)</label>
              <input
                type="number"
                value={form.emergencyFund}
                onChange={(e) => updateField('emergencyFund', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none font-mono placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Existing Investments Portfolio (₹)</label>
              <input
                type="number"
                value={form.existingInvestments}
                onChange={(e) => updateField('existingInvestments', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none font-mono placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* 3. RISK TOLERANCE & STRATEGY PREFERENCES */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-white/[0.06]">
            3. Risk Mandate & Governance
          </h2>

          <div className="space-y-4">
            {/* Segmented Risk Selector */}
            <div className="space-y-2">
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Risk Profile Strategy</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Conservative', label: 'Conservative', desc: 'Focus on capital safety and high-yield fixed debt' },
                  { id: 'Moderate', label: 'Moderate', desc: 'Balanced wealth accumulation with indexed core equity' },
                  { id: 'Aggressive', label: 'Aggressive', desc: 'Maximized long-term alpha with broad equity satellites' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateField('riskTolerance', item.id as any)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      form.riskTolerance === item.id 
                        ? 'bg-[#E6FDF7] dark:bg-[#00D4AA]/10 border-[#00D4AA] dark:border-[#00D4AA]/40 text-slate-900 dark:text-white shadow-xs' 
                        : 'bg-slate-50 dark:bg-[#060811] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.14]'
                    }`}
                  >
                    <span className={`font-bold text-sm block mb-1 ${form.riskTolerance === item.id ? 'text-[#0D9488] dark:text-[#00D4AA]' : 'text-slate-900 dark:text-white'}`}>{item.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Investment Horizon</label>
                <select
                  value={form.investmentHorizon}
                  onChange={(e) => updateField('investmentHorizon', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none cursor-pointer"
                >
                  <option value="1 to 3 years">Short Term (1 to 3 years)</option>
                  <option value="3 to 5 years">Medium Term (3 to 5 years)</option>
                  <option value="5 to 10 years">Long Term (5 to 10 years)</option>
                  <option value="10 to 20 years">Extended Growth (10 to 20 years)</option>
                  <option value="20+ years">Multi-Decade (20+ years)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Market Experience</label>
                <select
                  value={form.investmentExperience}
                  onChange={(e) => updateField('investmentExperience', e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none cursor-pointer"
                >
                  <option value="Beginner">Beginner (Index funds & SIP focus)</option>
                  <option value="Intermediate">Intermediate (Multi-asset & ETFs)</option>
                  <option value="Advanced">Advanced (Global allocation & hedging)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Primary Financial Mandate</label>
              <input
                type="text"
                value={form.financialGoal}
                onChange={(e) => updateField('financialGoal', e.target.value)}
                placeholder="e.g. Wealth Creation & Early Independence"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#060811] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm focus:border-[#00D4AA] focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isDirty ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">Unsaved parameters detected.</span>
            ) : (
              <span>Profile parameters are synchronized.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#00D4AA] text-[#060811] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-[#00D4AA]/25 transition-all hover:bg-[#00BFA5] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Recalibrating...' : 'Save & Recalibrate Strategy'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
