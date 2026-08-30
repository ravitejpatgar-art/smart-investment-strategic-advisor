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

  // Helper to extract form data from user object
  const getInitialForm = (u: typeof user): ProfileFormData => ({
    fullName: u?.name || '',
    age: u?.age ? String(u.age) : '',
    occupation: u?.occupation || '',
    salaryIncome: u?.salaryIncome !== undefined && u?.salaryIncome !== null 
      ? String(u.salaryIncome) 
      : (u?.monthlyIncome !== undefined && u?.monthlyIncome !== null ? String(u.monthlyIncome) : '50000'),
    otherIncome: u?.otherIncome !== undefined && u?.otherIncome !== null ? String(u.otherIncome) : '0',
    emergencyFund: u?.emergencyFund !== undefined && u?.emergencyFund !== null 
      ? String(u.emergencyFund) 
      : (u?.existingSavings !== undefined && u?.existingSavings !== null ? String(u.existingSavings) : '150000'),
    existingInvestments: u?.existingInvestments !== undefined && u?.existingInvestments !== null 
      ? String(u.existingInvestments) 
      : '0',
    financialGoal: u?.financialGoal || 'Wealth Creation & Early Independence',
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
    } catch (err: any) {
      setErrorMessage('Unable to save your profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-[26px] font-bold text-[#172033] tracking-tight">Investor Profile & Mandate</h1>
            {isDirty && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-[14px] text-[#667085]">
            Parameters calibrate your AI risk engine, surplus allocation, and multi-asset recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="px-3.5 py-2.5 rounded-lg border border-[#E7E9F0] text-[#667085] hover:text-[#172033] hover:bg-slate-50 text-[13.5px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="glow-btn-primary px-5 py-2.5 rounded-lg text-white font-bold text-[14px] flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving & Recalibrating...' : 'Save & Recalibrate'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-[14px] font-semibold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span>Profile updated successfully.</span>
            <span className="text-teal-700 font-normal hidden sm:inline">•</span>
            <span className="text-teal-800 font-medium">Investment strategy & recommendations recalibrated.</span>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[14px] font-semibold flex items-center justify-between gap-2.5 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Row: Inflow, Expenses, Surplus, Emergency */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E7E9F0] space-y-1 shadow-xs">
          <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">Monthly Income</span>
          <div className="text-[20px] sm:text-[22px] font-bold text-[#172033] font-mono">{formatCurrency(totalInflow)}</div>
          <span className="text-[12.5px] text-[#667085] truncate block">{form.occupation || 'Active Inflow'}</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E9F0] space-y-1 shadow-xs">
          <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">Monthly Expenses</span>
          <div className="text-[20px] sm:text-[22px] font-bold text-slate-700 font-mono">{formatCurrency(totalOutflows)}</div>
          <span className="text-[12.5px] text-[#667085] block">{expenses.length} Logged Entries</span>
        </div>

        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1 shadow-xs">
          <span className="text-[12px] text-teal-800 font-semibold uppercase tracking-wider block">Monthly Surplus</span>
          <div className="text-[20px] sm:text-[22px] font-bold text-teal-700 font-mono">{formatCurrency(surplus)}</div>
          <span className="text-[12.5px] text-teal-700/90 block">Available to invest</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E9F0] space-y-1 shadow-xs">
          <span className="text-[12px] text-[#667085] font-semibold uppercase tracking-wider block">Emergency Reserve</span>
          <div className="text-[20px] sm:text-[22px] font-bold text-[#172033] font-mono">{formatCurrency(numericEmergency)}</div>
          <span className="text-[12.5px] text-[#667085] block">Liquid Savings</span>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* 1. PERSONAL INFORMATION */}
        <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-[#172033] uppercase tracking-wider pb-2.5 border-b border-[#E7E9F0]">
            1. Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Investor Name"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
                placeholder="e.g. 25"
                min="18"
                max="100"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Occupation</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* 2. FINANCIAL PARAMETERS */}
        <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-[#172033] uppercase tracking-wider pb-2.5 border-b border-[#E7E9F0]">
            2. Financial Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Monthly Salary / Primary Income (₹)</label>
              <input
                type="number"
                value={form.salaryIncome}
                onChange={(e) => updateField('salaryIncome', e.target.value)}
                placeholder="50000"
                min="0"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Other / Secondary Monthly Income (₹)</label>
              <input
                type="number"
                value={form.otherIncome}
                onChange={(e) => updateField('otherIncome', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Emergency Fund / Cash Reserves (₹)</label>
              <input
                type="number"
                value={form.emergencyFund}
                onChange={(e) => updateField('emergencyFund', e.target.value)}
                placeholder="150000"
                min="0"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Existing Portfolio / Investments (₹)</label>
              <input
                type="number"
                value={form.existingInvestments}
                onChange={(e) => updateField('existingInvestments', e.target.value)}
                placeholder="100000"
                min="0"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white font-mono transition-all"
              />
            </div>
          </div>
        </div>

        {/* 3. RISK TOLERANCE & STRATEGY PREFERENCES */}
        <div className="bg-white border border-[#E7E9F0] rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-[#172033] uppercase tracking-wider pb-2.5 border-b border-[#E7E9F0]">
            3. Risk Mandate & Preferences
          </h2>

          <div className="space-y-4">
            {/* Segmented Risk Selector */}
            <div className="space-y-2">
              <label className="block text-[#172033] text-[13.5px] font-medium">Risk Tolerance Profile</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Conservative', label: 'Conservative', desc: 'Focus on capital preservation and fixed income debt' },
                  { id: 'Moderate', label: 'Moderate', desc: 'Balanced wealth accumulation with indexed equity core' },
                  { id: 'Aggressive', label: 'Aggressive', desc: 'Maximized long-term compound alpha with equities' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateField('riskTolerance', item.id as any)}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      form.riskTolerance === item.id 
                        ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20 shadow-xs' 
                        : 'bg-[#F8F9FC] border-[#E7E9F0] text-[#667085] hover:border-slate-300'
                    }`}
                  >
                    <span className={`font-bold text-[15px] block mb-1 ${form.riskTolerance === item.id ? 'text-teal-900' : 'text-[#172033]'}`}>{item.label}</span>
                    <span className="text-[13px] text-[#667085] leading-relaxed block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Investment Horizon</label>
                <select
                  value={form.investmentHorizon}
                  onChange={(e) => updateField('investmentHorizon', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="1 to 3 years">Short Term (1 to 3 years)</option>
                  <option value="3 to 5 years">Medium Term (3 to 5 years)</option>
                  <option value="5 to 10 years">Long Term (5 to 10 years)</option>
                  <option value="10 to 20 years">Extended Growth (10 to 20 years)</option>
                  <option value="20+ years">Generational (20+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Market Experience</label>
                <select
                  value={form.investmentExperience}
                  onChange={(e) => updateField('investmentExperience', e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Beginner">Beginner (Index funds & SIP focus)</option>
                  <option value="Intermediate">Intermediate (Multi-asset & ETFs)</option>
                  <option value="Advanced">Advanced (Global allocation & hedging)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#172033] text-[13.5px] font-medium mb-1.5">Primary Financial Goal</label>
              <input
                type="text"
                value={form.financialGoal}
                onChange={(e) => updateField('financialGoal', e.target.value)}
                placeholder="e.g. Wealth Creation & Early Independence"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F0] text-[#172033] text-[14.5px] focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-[13px] text-[#667085]">
            {isDirty ? (
              <span className="text-amber-700 font-medium">You have unsaved profile changes.</span>
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
                className="px-4 py-2.5 rounded-lg border border-[#E7E9F0] text-[#667085] hover:text-[#172033] hover:bg-slate-50 text-[14px] font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="glow-btn-primary px-6 py-2.5 rounded-lg text-white font-bold text-[14px] flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving & Recalibrating...' : 'Save & Recalibrate Strategy'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
