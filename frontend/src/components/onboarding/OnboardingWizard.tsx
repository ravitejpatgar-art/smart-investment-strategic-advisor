import React, { useState } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Home, 
  GraduationCap, 
  Palmtree, 
  Car,
  Plane,
  TrendingUp,
  User,
  DollarSign,
  Target,
  Activity,
  Clock,
  SlidersHorizontal,
  CheckCircle
} from 'lucide-react';
import type { UserProfile, ExpenseItem } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

export const OnboardingWizard: React.FC = () => {
  const { user, setUser, addExpense, runAiAnalysis, formatCurrency, currency } = useFintechStore();

  const [step, setStep] = useState<number>(1);

  // STEP 1: Personal Profile
  const [fullName, setFullName] = useState(user?.name || '');
  const [age, setAge] = useState<string>(user?.age ? String(user.age) : '');
  const [occupation, setOccupation] = useState(user?.occupation || '');

  // STEP 2: Income & Capital Assets
  const [monthlySalary, setMonthlySalary] = useState<string>(user?.salaryIncome ? String(user.salaryIncome) : '');
  const [otherIncome, setOtherIncome] = useState<string>(user?.otherIncome ? String(user.otherIncome) : '');
  const [emergencyFund, setEmergencyFund] = useState<string>(user?.emergencyFund ? String(user.emergencyFund) : '');
  const [existingInvestments, setExistingInvestments] = useState<string>(user?.existingInvestments ? String(user.existingInvestments) : '');
  const [savingsBalance, setSavingsBalance] = useState<string>(user?.existingSavings ? String(user.existingSavings) : '');

  // Optional Monthly Expenses (pre-fills Expense Tracker)
  const [rent, setRent] = useState<string>('');
  const [food, setFood] = useState<string>('');
  const [transport, setTransport] = useState<string>('');
  const [emi, setEmi] = useState<string>('');

  // STEP 3: Financial Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Wealth Building',
    'Retirement'
  ]);

  // STEP 4: 10-Question Professional Risk Assessment Questionnaire
  const riskQuestions = [
    {
      id: 'q1',
      question: '1. What is your primary objective for this investment portfolio?',
      options: [
        { label: 'Preserve my capital with guaranteed minimum downside', score: 2 },
        { label: 'Generate steady income beating bank inflation rates', score: 5 },
        { label: 'Maximize long-term wealth compounding and alpha', score: 10 }
      ]
    },
    {
      id: 'q2',
      question: '2. If the stock market drops 25% in 3 months, what would you do?',
      options: [
        { label: 'Panic and sell all holdings to liquid cash', score: 1 },
        { label: 'Do nothing, feel anxious and wait for recovery', score: 5 },
        { label: 'Buy more aggressively at discounted valuations', score: 10 }
      ]
    },
    {
      id: 'q3',
      question: '3. How stable and predictable is your primary monthly income?',
      options: [
        { label: 'Highly irregular or contract-dependent freelance income', score: 3 },
        { label: 'Stable salary with occasional variable bonus', score: 7 },
        { label: 'Very secure multi-year tenure or recession-proof profession', score: 10 }
      ]
    },
    {
      id: 'q4',
      question: '4. What investment experience do you have with equities/mutual funds?',
      options: [
        { label: 'Complete beginner (Mostly fixed deposits & bank savings)', score: 2 },
        { label: 'Intermediate (Active SIPs in mutual funds & index ETFs)', score: 6 },
        { label: 'Advanced (Active equities, global assets, macro cycles)', score: 10 }
      ]
    },
    {
      id: 'q5',
      question: '5. Which hypothetical 1-year investment outcome do you prefer?',
      options: [
        { label: 'Best Case: +8% gain | Worst Case: 0% loss (Guaranteed)', score: 2 },
        { label: 'Best Case: +18% gain | Worst Case: -8% loss (Balanced)', score: 6 },
        { label: 'Best Case: +38% gain | Worst Case: -22% loss (Aggressive)', score: 10 }
      ]
    },
    {
      id: 'q6',
      question: '6. When will you need to liquidate a major portion of this capital?',
      options: [
        { label: 'Within the next 1 to 3 years', score: 2 },
        { label: 'In 3 to 7 years', score: 6 },
        { label: 'More than 7 to 10+ years from today', score: 10 }
      ]
    },
    {
      id: 'q7',
      question: '7. How do you view short-term portfolio price fluctuations?',
      options: [
        { label: 'Deeply stressful; I prefer fixed return certainty', score: 2 },
        { label: 'Acceptable as part of normal market behavior', score: 6 },
        { label: 'Exciting opportunities to deploy cash reserves', score: 10 }
      ]
    },
    {
      id: 'q8',
      question: '8. What proportion of your total net worth is this portfolio?',
      options: [
        { label: 'Over 80% (Almost all my liquid net worth)', score: 3 },
        { label: 'Around 40% to 60% of my total financial assets', score: 6 },
        { label: 'Less than 30% (I have diverse real estate & reserves)', score: 10 }
      ]
    },
    {
      id: 'q9',
      question: '9. How frequently do you plan to review and monitor investments?',
      options: [
        { label: 'Daily or weekly (High emotional sensitivity)', score: 3 },
        { label: 'Monthly or quarterly review', score: 7 },
        { label: 'Set automated SIP and rebalance semi-annually (FIRE mindset)', score: 10 }
      ]
    },
    {
      id: 'q10',
      question: '10. What is your reaction to foreign exchange and global asset exposure?',
      options: [
        { label: 'Stick 100% strictly to domestic Indian rupee assets', score: 3 },
        { label: 'Comfortable with 10-15% US Tech ETF allocation', score: 7 },
        { label: 'Strongly desire high global multi-currency diversification', score: 10 }
      ]
    }
  ];

  const [riskAnswers, setRiskAnswers] = useState<Record<string, number>>({
    q1: 5,
    q2: 5,
    q3: 7,
    q4: 6,
    q5: 6,
    q6: 6,
    q7: 6,
    q8: 6,
    q9: 7,
    q10: 6
  });

  // STEP 5: Investment Horizon
  const [investmentHorizon, setInvestmentHorizon] = useState<string>('5 to 10 years');

  // STEP 6: Preferences (Asset Diversification Mandate)
  const [includeGlobalAssets, setIncludeGlobalAssets] = useState<boolean>(true);
  const [includeGoldHedge, setIncludeGoldHedge] = useState<boolean>(true);
  const [directPlansOnly, setDirectPlansOnly] = useState<boolean>(true);

  // Live Calculations — UNCHANGED LOGIC
  const totalIncomeVal = (Number(monthlySalary) || 0) + (Number(otherIncome) || 0);
  const totalExpensesVal = 
    (Number(rent) || 0) + 
    (Number(food) || 0) + 
    (Number(transport) || 0) + 
    (Number(emi) || 0);

  const surplusVal = Math.max(0, totalIncomeVal - totalExpensesVal);

  // Risk Score (0-100) & Category — UNCHANGED LOGIC
  const totalRiskScore = Object.values(riskAnswers).reduce((sum, val) => sum + val, 0);
  const normalizedRiskScore = Math.min(98, Math.max(20, Math.round(totalRiskScore)));
  const riskCategory: 'Conservative' | 'Moderate' | 'Aggressive' = 
    normalizedRiskScore >= 72 ? 'Aggressive' : (normalizedRiskScore <= 45 ? 'Conservative' : 'Moderate');

  const toggleGoal = (g: string) => {
    if (selectedGoals.includes(g)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter(item => item !== g));
      }
    } else {
      setSelectedGoals([...selectedGoals, g]);
    }
  };

  const handleFinish = () => {
    const updatedProfile: UserProfile = {
      id: user?.id || `usr_${Date.now()}`,
      email: user?.email || 'investor@smartvest.ai',
      name: fullName.trim() || 'Investor',
      age: Number(age) || undefined,
      occupation: occupation.trim() || undefined,
      salaryIncome: Number(monthlySalary) || 0,
      otherIncome: Number(otherIncome) || 0,
      monthlyIncome: totalIncomeVal,
      monthlyExpenses: totalExpensesVal,
      emergencyFund: Number(emergencyFund) || 0,
      existingSavings: Number(savingsBalance) || 0,
      existingInvestments: Number(existingInvestments) || 0,
      financialGoal: selectedGoals.join(' & '),
      investmentHorizon,
      investmentExperience: normalizedRiskScore >= 70 ? 'Advanced' : (normalizedRiskScore <= 40 ? 'Beginner' : 'Intermediate'),
      riskTolerance: riskCategory,
      riskCategory,
      riskScore: normalizedRiskScore,
      riskAnswers,
      goals: selectedGoals,
      primaryGoals: selectedGoals,
      onboardingCompleted: true,
    };

    setUser(updatedProfile);

    // Populate initial expense items into the Expense Tracker
    const today = new Date().toISOString().split('T')[0];
    const initialExpenseList: Omit<ExpenseItem, 'id'>[] = [];

    if (Number(rent) > 0) initialExpenseList.push({ category: 'Rent', amount: Number(rent), date: today, description: 'Monthly Rent / Housing' });
    if (Number(food) > 0) initialExpenseList.push({ category: 'Food', amount: Number(food), date: today, description: 'Groceries & Dining' });
    if (Number(transport) > 0) initialExpenseList.push({ category: 'Transport', amount: Number(transport), date: today, description: 'Commute & Fuel' });
    if (Number(emi) > 0) initialExpenseList.push({ category: 'EMI', amount: Number(emi), date: today, description: 'Loan EMI / Debt Service' });

    initialExpenseList.forEach(exp => addExpense(exp));
    runAiAnalysis();
  };

  const stepsList = [
    { num: 1, label: 'Personal Profile', icon: User },
    { num: 2, label: 'Income & Assets', icon: DollarSign },
    { num: 3, label: 'Financial Goals', icon: Target },
    { num: 4, label: 'Risk Assessment', icon: Activity },
    { num: 5, label: 'Investment Horizon', icon: Clock },
    { num: 6, label: 'Preferences', icon: SlidersHorizontal },
    { num: 7, label: 'Strategy Review', icon: CheckCircle },
  ];

  const goalOptions = [
    { id: 'House', title: 'Real Estate / Property', desc: 'Accumulate target down-payment corpus', icon: Home },
    { id: 'Car', title: 'Vehicle Acquisition', desc: 'Fund purchase without high-interest debt', icon: Car },
    { id: 'Retirement', title: 'Retirement (FIRE)', desc: 'Accelerate early financial independence', icon: Palmtree },
    { id: 'Wealth Building', title: 'Long-Term Compounding', desc: 'Maximize multi-asset equity compounding', icon: TrendingUp },
    { id: 'Education', title: 'Higher Education', desc: 'Tuition and academic capital reserves', icon: GraduationCap },
    { id: 'Travel', title: 'Sabbatical & Travel', desc: 'Fund lifestyle milestones & leisure', icon: Plane },
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative">
      
      {/* Top Header with Institutional Brand Logo */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between z-10 pb-6 border-b border-white/[0.06]">
        <BrandLogo size="md" subtitleText="WEALTH DISCOVERY" />

        <div className="flex items-center gap-2 text-xs text-[#8A94A6]">
          <span>Step <strong className="text-white">{step}</strong> of 7</span>
          <span className="text-[#5A667A]">|</span>
          <span className="text-[#00D4AA] font-semibold">{stepsList[step - 1]?.label}</span>
        </div>
      </div>

      {/* Step Timeline Indicator */}
      <div className="max-w-4xl mx-auto w-full py-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[580px] px-2">
          {stepsList.map((s, idx) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            const StepIcon = s.icon;

            return (
              <React.Fragment key={s.num}>
                <div 
                  onClick={() => {
                    if (s.num < step) setStep(s.num);
                  }}
                  className={`flex flex-col items-center gap-1.5 cursor-pointer group`}
                >
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent 
                        ? 'bg-[#00D4AA] text-[#050816] shadow-sm'
                        : isCompleted
                        ? 'bg-[#0A1022] text-[#00D4AA] border border-[#00D4AA]/30'
                        : 'bg-[#0A1022] text-[#5A667A] border border-white/[0.06]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[10.5px] font-semibold tracking-wider uppercase ${isCurrent ? 'text-white' : isCompleted ? 'text-[#8A94A6]' : 'text-[#5A667A]'}`}>
                    {s.label}
                  </span>
                </div>

                {idx < stepsList.length - 1 && (
                  <div className={`flex-1 h-[1.5px] mx-2 transition-all ${step > s.num ? 'bg-[#00D4AA]/50' : 'bg-white/[0.06]'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto w-full bg-[#101827] border border-white/[0.08] rounded-xl p-6 sm:p-9 shadow-xl z-10 space-y-6 my-auto">
        
        {/* STEP 1: Personal Profile */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1 pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-bold text-[#00D4AA] uppercase tracking-wider">Step 1 — Profile Identity</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Investor Demographics</h2>
              <p className="text-xs text-[#8A94A6]">
                Calibrate your investment profile and lifecycle horizon for fiduciary portfolio modeling.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider block mb-1.5">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full px-4 py-3 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-sm focus:border-[#00D4AA] focus:outline-none placeholder:text-[#5A667A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider block mb-1.5">Age (Years)</label>
                  <input
                    type="number"
                    required
                    min={18}
                    max={95}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-4 py-3 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-sm focus:border-[#00D4AA] focus:outline-none placeholder:text-[#5A667A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider block mb-1.5">Occupation / Professional Field</label>
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Software Engineer / Consultant"
                    className="w-full px-4 py-3 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white text-sm focus:border-[#00D4AA] focus:outline-none placeholder:text-[#5A667A]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Income & Assets */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1 pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-bold text-[#00D4AA] uppercase tracking-wider">Step 2 — Financial Balance Sheet</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Income Inflow & Existing Capital</h2>
              <p className="text-xs text-[#8A94A6]">
                Provide your cash inflow and current balance sheet to calculate surplus capacity and emergency reserve targets.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider block mb-1.5">Monthly Net Salary ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 125000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white font-mono font-bold text-sm focus:border-[#00D4AA] focus:outline-none placeholder:text-[#5A667A]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider block mb-1.5">Other Monthly Income ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. Freelance, Dividends (0 if none)"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white font-mono text-sm focus:border-[#00D4AA] focus:outline-none placeholder:text-[#5A667A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider block mb-1.5">Emergency Fund ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 200000"
                    value={emergencyFund}
                    onChange={(e) => setEmergencyFund(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white font-mono text-xs focus:border-[#00D4AA] focus:outline-none"
                  />
                  <span className="text-[10.5px] text-[#5A667A] mt-1 block">Liquid cash in savings</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider block mb-1.5">Existing Portfolios ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 350000"
                    value={existingInvestments}
                    onChange={(e) => setExistingInvestments(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white font-mono text-xs focus:border-[#00D4AA] focus:outline-none"
                  />
                  <span className="text-[10.5px] text-[#5A667A] mt-1 block">Mutual funds, stocks, PF</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider block mb-1.5">Savings Account ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 80000"
                    value={savingsBalance}
                    onChange={(e) => setSavingsBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white font-mono text-xs focus:border-[#00D4AA] focus:outline-none"
                  />
                  <span className="text-[10.5px] text-[#5A667A] mt-1 block">Operating cash balance</span>
                </div>
              </div>

              {/* Monthly Outflow Fields */}
              <div className="pt-2">
                <label className="text-xs font-bold text-[#8A94A6] uppercase tracking-wider block mb-2">Monthly Living Costs (Optional Baseline)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#8A94A6] block mb-1">Housing/Rent</span>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white font-mono text-xs focus:border-[#00D4AA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[#8A94A6] block mb-1">Food & Groceries</span>
                    <input
                      type="number"
                      placeholder="e.g. 10000"
                      value={food}
                      onChange={(e) => setFood(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white font-mono text-xs focus:border-[#00D4AA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[#8A94A6] block mb-1">Commute/Transport</span>
                    <input
                      type="number"
                      placeholder="e.g. 4000"
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white font-mono text-xs focus:border-[#00D4AA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[#8A94A6] block mb-1">Debt / EMI</span>
                    <input
                      type="number"
                      placeholder="e.g. 0"
                      value={emi}
                      onChange={(e) => setEmi(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A1022] border border-white/[0.08] text-white font-mono text-xs focus:border-[#00D4AA] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0A1022] border border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#8A94A6]">Monthly Inflow: </span>
                  <strong className="text-white font-mono">{formatCurrency(totalIncomeVal)}</strong>
                </div>
                <div>
                  <span className="text-[#8A94A6]">Investable Surplus: </span>
                  <strong className="text-[#00D4AA] font-mono text-sm">{formatCurrency(surplusVal)}/mo</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Financial Goals */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1 pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-bold text-[#00D4AA] uppercase tracking-wider">Step 3 — Strategic Objectives</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Target Financial Milestones</h2>
              <p className="text-xs text-[#8A94A6]">
                Select the target objectives you wish to fund. SmartVest models dedicated SIP allocations for each goal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goalOptions.map((g) => {
                const isSelected = selectedGoals.includes(g.id);
                const Icon = g.icon;

                return (
                  <div
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40 text-white'
                        : 'bg-[#0A1022] border-white/[0.06] text-[#8A94A6] hover:border-white/[0.14]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#00D4AA]/20 text-[#00D4AA]' : 'bg-[#101827] text-[#5A667A]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{g.title}</div>
                      <div className="text-[11px] text-[#8A94A6] truncate">{g.desc}</div>
                    </div>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected ? 'bg-[#00D4AA] border-[#00D4AA] text-[#050816]' : 'border-white/[0.14]'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Risk Assessment Questionnaire */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1 pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-bold text-[#00D4AA] uppercase tracking-wider">Step 4 — Quantitative Risk Assessment</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Risk Matrix & Capacity Questionnaire</h2>
              <p className="text-xs text-[#8A94A6]">
                10 institutional questions evaluating psychological volatility tolerance and financial loss absorption capacity.
              </p>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 text-xs scrollbar-none">
              {riskQuestions.map((q) => (
                <div key={q.id} className="p-3.5 rounded-lg bg-[#0A1022] border border-white/[0.06] space-y-2">
                  <span className="font-bold text-white block text-xs">{q.question}</span>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isChosen = riskAnswers[q.id] === opt.score;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => setRiskAnswers(prev => ({ ...prev, [q.id]: opt.score }))}
                          className={`p-2.5 rounded-md border transition-all cursor-pointer flex items-center justify-between ${
                            isChosen
                              ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40 text-[#00D4AA] font-bold'
                              : 'bg-[#101827] border-white/[0.04] text-[#8A94A6] hover:border-white/[0.10]'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isChosen && <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4AA] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Risk Profile Badge */}
            <div className="p-3.5 rounded-lg bg-[#0A1022] border border-white/[0.06] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider block">Calculated Risk Mandate:</span>
                <div className="text-sm font-bold text-white">
                  {riskCategory} Profile ({normalizedRiskScore}/100 Score)
                </div>
              </div>
              <ShieldCheck className="w-6 h-6 text-[#00D4AA]" />
            </div>
          </div>
        )}

        {/* STEP 5: Investment Horizon */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1 pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-bold text-[#00D4AA] uppercase tracking-wider">Step 5 — Time Horizon</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Deployment Timeline</h2>
              <p className="text-xs text-[#8A94A6]">
                Specify your primary capital compounding timeframe before major liquidation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { horizon: 'Less than 3 years', tag: 'Short-Term', desc: 'Prioritizes high capital safety, debt funds & liquid preservation' },
                { horizon: '3 to 5 years', tag: 'Medium-Term', desc: 'Balanced distribution of index equities, gold & corporate debt' },
                { horizon: '5 to 10 years', tag: 'Long-Term', desc: 'Strong equity & ETF wealth compounding with multi-cycle horizon' },
                { horizon: '10+ years', tag: 'Multi-Decade', desc: 'Maximum compounding multiplier across diversified broad equities' },
              ].map((item) => (
                <div
                  key={item.horizon}
                  onClick={() => setInvestmentHorizon(item.horizon)}
                  className={`p-4 rounded-lg border text-left transition-all cursor-pointer space-y-1 ${
                    investmentHorizon === item.horizon
                      ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40'
                      : 'bg-[#0A1022] border-white/[0.06] hover:border-white/[0.14]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{item.horizon}</span>
                    {investmentHorizon === item.horizon && <CheckCircle2 className="w-4 h-4 text-[#00D4AA]" />}
                  </div>
                  <span className="text-xs font-semibold text-[#00D4AA] block">{item.tag}</span>
                  <p className="text-xs text-[#8A94A6] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Preferences & Asset Mix */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="space-y-1 pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-bold text-[#00D4AA] uppercase tracking-wider">Step 6 — Strategic Preferences</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Asset Class & Fiduciary Governance</h2>
              <p className="text-xs text-[#8A94A6]">
                Configure multi-currency exposure and zero-commission execution preferences.
              </p>
            </div>

            <div className="space-y-3">
              <div 
                onClick={() => setIncludeGlobalAssets(!includeGlobalAssets)}
                className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  includeGlobalAssets ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40 text-white' : 'bg-[#0A1022] border-white/[0.06] text-[#8A94A6]'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white">Global US Equities Satellites (10–15%)</div>
                  <div className="text-xs text-[#8A94A6]">Include NASDAQ-100 and S&P 500 ETFs for dollar-hedged growth.</div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${includeGlobalAssets ? 'bg-[#00D4AA] border-[#00D4AA] text-[#050816]' : 'border-white/[0.14]'}`}>
                  {includeGlobalAssets && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div 
                onClick={() => setIncludeGoldHedge(!includeGoldHedge)}
                className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  includeGoldHedge ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40 text-white' : 'bg-[#0A1022] border-white/[0.06] text-[#8A94A6]'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white">Sovereign Gold / Macro Commodity Hedge (10%)</div>
                  <div className="text-xs text-[#8A94A6]">Preserve purchasing power against currency depreciation and macro turbulence.</div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${includeGoldHedge ? 'bg-[#00D4AA] border-[#00D4AA] text-[#050816]' : 'border-white/[0.14]'}`}>
                  {includeGoldHedge && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div 
                onClick={() => setDirectPlansOnly(!directPlansOnly)}
                className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                  directPlansOnly ? 'bg-[#00D4AA]/10 border-[#00D4AA]/40 text-white' : 'bg-[#0A1022] border-white/[0.06] text-[#8A94A6]'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white">Direct Zero-Commission Architecture (Fiduciary)</div>
                  <div className="text-xs text-[#8A94A6]">Only recommend Direct-plan funds to save 0.5%–1.5% in distributor commissions.</div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${directPlansOnly ? 'bg-[#00D4AA] border-[#00D4AA] text-[#050816]' : 'border-white/[0.14]'}`}>
                  {directPlansOnly && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Strategy Review & Final Handoff */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="space-y-1 pb-3 border-b border-white/[0.06]">
              <span className="text-[11px] font-bold text-[#00D4AA] uppercase tracking-wider">Step 7 — Mandate Review</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Verify Your Investment Mandate</h2>
              <p className="text-xs text-[#8A94A6]">
                Confirm parameters before generating your institutional multi-asset strategic blueprint.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#0A1022] rounded-lg p-4 border border-white/[0.06] space-y-2">
                <span className="text-[#8A94A6] uppercase font-semibold text-[10.5px] block">Investor Identity</span>
                <div className="text-sm font-bold text-white">{fullName}</div>
                <div className="text-[#8A94A6]">{age} Years Old · {occupation}</div>
                <div className="text-[#8A94A6] pt-2 border-t border-white/[0.06]">
                  Time Horizon: <strong className="text-white">{investmentHorizon}</strong>
                </div>
              </div>

              <div className="bg-[#0A1022] rounded-lg p-4 border border-white/[0.06] space-y-2">
                <span className="text-[#8A94A6] uppercase font-semibold text-[10.5px] block">Financial Parameters</span>
                <div className="text-sm font-bold text-[#00D4AA] font-mono">{formatCurrency(totalIncomeVal)}/mo Inflow</div>
                <div className="text-[#8A94A6]">Goals: <strong className="text-white">{selectedGoals.join(', ')}</strong></div>
                <div className="text-[#8A94A6] pt-2 border-t border-white/[0.06]">
                  Risk Category: <strong className="text-white">{riskCategory} ({normalizedRiskScore}/100)</strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0A1022] border border-white/[0.06] flex items-center gap-3 text-xs text-[#8A94A6]">
              <ShieldCheck className="w-5 h-5 text-[#00D4AA] shrink-0" />
              <span>SmartVest will immediately compile your multi-asset blueprint with exact monthly deployment targets across Indian equities, global ETFs, and debt hedges.</span>
            </div>
          </div>
        )}

        {/* Wizard Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg bg-[#0A1022] hover:bg-[#141F36] text-[#8A94A6] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/[0.06]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 7 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !fullName.trim()) {
                  alert('Please enter your full name.');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-5 py-2.5 rounded-lg bg-[#00D4AA] text-[#050816] text-xs font-bold flex items-center gap-1.5 hover:bg-[#00D4AA]/90 transition-all cursor-pointer shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-lg bg-[#00D4AA] text-[#050816] text-xs font-bold flex items-center gap-2 hover:bg-[#00D4AA]/90 transition-all cursor-pointer shadow-sm"
            >
              <span>Compile Wealth Strategy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Institutional Compliance Notice */}
      <div className="max-w-2xl mx-auto w-full text-center text-[11px] text-[#5A667A] pt-4">
        SmartVest Capital Advisory operates under fiduciary non-custodial principles. Client data is encrypted with 256-bit SSL.
      </div>

    </div>
  );
};
