import React, { useState } from 'react';
import { useFintechStore } from '../../store/useFintechStore';
import { 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Home, 
  GraduationCap, 
  Palmtree, 
  Car,
  Plane
} from 'lucide-react';
import type { UserProfile, ExpenseItem } from '../../types';

export const OnboardingWizard: React.FC = () => {
  const { user, setUser, addExpense, runAiAnalysis, formatCurrency, currency } = useFintechStore();

  const [step, setStep] = useState<number>(1);

  // STEP 1: Personal Information
  const [fullName, setFullName] = useState(user?.name || '');
  const [age, setAge] = useState<string>(user?.age ? String(user.age) : '');
  const [occupation, setOccupation] = useState(user?.occupation || '');

  // STEP 2: Income Information
  const [monthlySalary, setMonthlySalary] = useState<string>(user?.salaryIncome ? String(user.salaryIncome) : '');
  const [otherIncome, setOtherIncome] = useState<string>(user?.otherIncome ? String(user.otherIncome) : '0');

  // STEP 3: Expense Information
  const [rent, setRent] = useState<string>('');
  const [food, setFood] = useState<string>('');
  const [transport, setTransport] = useState<string>('');
  const [shopping, setShopping] = useState<string>('');
  const [entertainment, setEntertainment] = useState<string>('');
  const [emi, setEmi] = useState<string>('');
  const [utilities, setUtilities] = useState<string>('');
  const [otherExpenses, setOtherExpenses] = useState<string>('');

  // STEP 4: Current Financial Status
  const [emergencyFund, setEmergencyFund] = useState<string>(user?.emergencyFund ? String(user.emergencyFund) : '');
  const [existingInvestments, setExistingInvestments] = useState<string>(user?.existingInvestments ? String(user.existingInvestments) : '');
  const [savingsBalance, setSavingsBalance] = useState<string>(user?.existingSavings ? String(user.existingSavings) : '');

  // STEP 5: Goals (Multiple Allowed)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'Wealth Building',
    'Retirement'
  ]);

  // STEP 6: Investment Horizon
  const [investmentHorizon, setInvestmentHorizon] = useState<string>('5 to 10 years');

  // STEP 7: 10-Question Professional Risk Assessment Questionnaire
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

  // Calculate live numbers
  const totalIncomeVal = (Number(monthlySalary) || 0) + (Number(otherIncome) || 0);
  const totalExpensesVal = 
    (Number(rent) || 0) + 
    (Number(food) || 0) + 
    (Number(transport) || 0) + 
    (Number(shopping) || 0) + 
    (Number(entertainment) || 0) + 
    (Number(emi) || 0) + 
    (Number(utilities) || 0) + 
    (Number(otherExpenses) || 0);

  const surplusVal = Math.max(0, totalIncomeVal - totalExpensesVal);

  // Compute Risk Score (0-100) & Category
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
    if (Number(shopping) > 0) initialExpenseList.push({ category: 'Shopping', amount: Number(shopping), date: today, description: 'Apparel & Discretionary' });
    if (Number(entertainment) > 0) initialExpenseList.push({ category: 'Entertainment', amount: Number(entertainment), date: today, description: 'Subscriptions & Outings' });
    if (Number(emi) > 0) initialExpenseList.push({ category: 'EMI', amount: Number(emi), date: today, description: 'Loan EMI / Debt Service' });
    if (Number(utilities) > 0) initialExpenseList.push({ category: 'Utilities', amount: Number(utilities), date: today, description: 'Electricity, Water & Internet' });
    if (Number(otherExpenses) > 0) initialExpenseList.push({ category: 'Other', amount: Number(otherExpenses), date: today, description: 'Miscellaneous Expenses' });

    // Add each expense cleanly
    initialExpenseList.forEach(exp => addExpense(exp));

    runAiAnalysis();
  };

  const goalOptions = [
    { id: 'House', title: 'House Down Payment', desc: 'Accumulate target corpus for property purchase', icon: Home },
    { id: 'Car', title: 'Car Purchase', desc: 'Fund a dream vehicle without high-interest EMI', icon: Car },
    { id: 'Retirement', title: 'Retirement (FIRE)', desc: 'Achieve early financial independence', icon: Palmtree },
    { id: 'Wealth Building', title: 'Wealth Building', desc: 'Maximize long-term equity compounding', icon: TrendingUp },
    { id: 'Education', title: 'Higher Education', desc: 'Tuition and executive education fund', icon: GraduationCap },
    { id: 'Travel', title: 'International Travel', desc: 'Fund luxury vacations & sabbatical', icon: Plane },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      
      {/* Top Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation / Progress Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between z-10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">SmartVest</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AI Advisory
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Institutional Financial Planning Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">
            Step <strong className="text-emerald-400">{step}</strong> of 7
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            {step === 1 && 'Personal Details'}
            {step === 2 && 'Income Inflow'}
            {step === 3 && 'Living Outflow'}
            {step === 4 && 'Current Capital'}
            {step === 5 && 'Milestones'}
            {step === 6 && 'Horizon'}
            {step === 7 && 'Risk Matrix'}
          </span>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-3xl mx-auto w-full bg-slate-950/85 border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl z-10 space-y-7">
        
        {/* Step Progress Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* STEP 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 1 of 7</span>
              <h2 className="text-2xl font-extrabold text-white">Personal Information</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Let's calibrate your investor profile and lifecycle timeline for personalized strategy recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Age (Years)</label>
                  <input
                    type="number"
                    required
                    min={18}
                    max={95}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Occupation / Profession</label>
                  <input
                    type="text"
                    required
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Software Engineer / Consultant"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Income Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 2 of 7</span>
              <h2 className="text-2xl font-extrabold text-white">Monthly Inflow & Earnings</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Specify your net take-home salary and auxiliary cash inflows to calculate your investment capacity.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Monthly Take-Home Salary ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 125000"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-emerald-400 font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Other Monthly Inflows ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. Freelance, Rental, Dividends (0 if none)"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-cyan-400 font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-300 font-medium">Total Monthly Inflow:</span>
                <span className="font-mono font-bold text-emerald-400 text-base sm:text-lg">
                  {formatCurrency(totalIncomeVal)}/month
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Expense Information */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 3 of 7</span>
              <h2 className="text-2xl font-extrabold text-white">Monthly Living Expenses</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Log your standard monthly costs across major categories. These will automatically initialize your Expense Tracker.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Rent / Housing ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Food & Groceries ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Transport & Fuel ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 4000"
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Shopping & Apparel ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 4000"
                  value={shopping}
                  onChange={(e) => setShopping(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Entertainment & Dining ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 3000"
                  value={entertainment}
                  onChange={(e) => setEntertainment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Loan EMI & Debt ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 0 (if no loans)"
                  value={emi}
                  onChange={(e) => setEmi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Utilities & Bills ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 3000"
                  value={utilities}
                  onChange={(e) => setUtilities(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Other Miscellaneous ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={otherExpenses}
                  onChange={(e) => setOtherExpenses(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Surplus Indicator */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Total Monthly Expenses:</span>
                <span className="font-mono font-bold text-rose-400 ml-1.5">{formatCurrency(totalExpensesVal)}</span>
              </div>
              <div>
                <span className="text-slate-400">Investable Surplus:</span>
                <span className="font-mono font-bold text-emerald-400 ml-1.5 text-sm">{formatCurrency(surplusVal)}/mo</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Current Financial Status */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 4 of 7</span>
              <h2 className="text-2xl font-extrabold text-white">Current Financial Status</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Understanding existing savings and investments prevents over-allocation and guarantees emergency fund safety.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Emergency Fund Reserve ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 200000"
                    value={emergencyFund}
                    onChange={(e) => setEmergencyFund(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Liquid cash kept for emergencies</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Existing Investments ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 350000"
                    value={existingInvestments}
                    onChange={(e) => setExistingInvestments(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-cyan-400 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Mutual funds, stocks, PF, gold</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Savings Bank Balance ({currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 80000"
                    value={savingsBalance}
                    onChange={(e) => setSavingsBalance(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Current checking/savings accounts</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>SmartVest AI will evaluate whether your emergency cushion covers 3-6 months of living expenses.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Goals */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 5 of 7</span>
              <h2 className="text-2xl font-extrabold text-white">Financial Goals & Objectives</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Select all milestone objectives you want to target (Multiple selection allowed):
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
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white">{g.title}</div>
                      <div className="text-[11px] text-slate-400">{g.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                      isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Investment Horizon */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 6 of 7</span>
              <h2 className="text-2xl font-extrabold text-white">Investment Horizon</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                How long do you intend to systematically invest before liquidating your primary corpus?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { horizon: 'Less than 3 years', tag: 'Short-Term', desc: 'Prioritizes high capital safety, debt funds & liquid preservation' },
                { horizon: '3 to 5 years', tag: 'Medium-Term', desc: 'Balanced distribution of index equities, gold & AAA corporate bonds' },
                { horizon: '5 to 10 years', tag: 'Long-Term', desc: 'Strong equity & ETF wealth compounding with time to absorb cycles' },
                { horizon: '10+ years', tag: 'Multi-Decade', desc: 'Maximum aggressive compounding multiplier across broad equities' },
              ].map((item) => (
                <div
                  key={item.horizon}
                  onClick={() => setInvestmentHorizon(item.horizon)}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                    investmentHorizon === item.horizon
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{item.horizon}</span>
                    {investmentHorizon === item.horizon && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 block">{item.tag}</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: 10 Risk Assessment Questions */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 7 of 7</span>
              <h2 className="text-2xl font-extrabold text-white">Risk Assessment Matrix</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                10 professional questions evaluating emotional resilience, volatility tolerance, and return requirements.
              </p>
            </div>

            <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2 text-xs">
              {riskQuestions.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                  <span className="font-bold text-white block text-xs">{q.question}</span>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isChosen = riskAnswers[q.id] === opt.score;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => setRiskAnswers(prev => ({ ...prev, [q.id]: opt.score }))}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isChosen
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isChosen && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculated Risk Profile Result Strip */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Generated Risk Profile:</span>
                <div className="text-base font-extrabold text-emerald-400">
                  {riskCategory} Investor ({normalizedRiskScore}/100)
                </div>
                <span className="text-[11px] text-slate-300">
                  Monthly Investable Surplus: <strong className="text-white font-mono">{formatCurrency(surplusVal)}/mo</strong>
                </span>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-800/80">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 7 ? (
            <button
              type="button"
              onClick={() => {
                // Validation for step 1
                if (step === 1 && !fullName.trim()) {
                  alert('Please enter your full name.');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Strategic Blueprint</span>
            </button>
          )}
        </div>

      </div>

      {/* Compliance Footer */}
      <div className="max-w-2xl mx-auto w-full text-center text-[11px] text-slate-500 pt-6">
        SmartVest AI provides educational and advisory investment recommendations. SmartVest is <strong>NOT a broker</strong> and does <strong>NOT execute trades</strong>.
      </div>

    </div>
  );
};
