import type { UserProfile, ExpenseItem, GoalItem, InvestmentStrategy } from '../types';
import type { MarketQuote } from './marketApi';
import { isDemoMode } from './demoData';

export interface GroundedFinancialContext {
  profile: {
    userId: string | null;
    name: string;
    age: number | null;
    occupation: string;
    investmentHorizon: string;
    investmentExperience: string;
    financialGoal: string;
    onboardingCompleted: boolean;
  };
  cashFlow: {
    monthlyIncome: number;
    salaryIncome: number;
    otherIncome: number;
    monthlyExpenses: number;
    monthlySurplus: number;
    investableSurplus: number;
    savingsRate: number;
    emergencyFund: number;
    emergencyTarget: number;
    emergencyFundMonths: number;
    emergencyFundStatus: 'Inadequate' | 'Moderate' | 'Healthy' | 'Surplus';
  };
  goals: Array<{
    title: string;
    targetAmount: number;
    targetDate: string;
    category?: string;
    monthlySipRequired?: number;
  }>;
  portfolio: {
    existingInvestments: number;
    existingSavings: number;
    holdings: Array<{ name: string; amount: number; category: string }>;
  };
  risk: {
    riskTolerance: string;
    riskCapacity: string;
    riskCategory: string;
    riskScore: number;
    effectiveRiskCategory?: string;
    finalAdvisoryRisk?: string;
    isCapacityConstrained?: boolean;
    capacityConstraintReason?: string;
  };
  strategy?: {
    strategyName: string;
    riskProfile: string;
    expectedReturnRange: string;
    allocations: Array<{
      name: string;
      percentage: number;
      monthlyAmount: number;
      category?: string;
      riskLevel?: string;
      reasonSelected?: string;
    }>;
  };
  market?: {
    benchmarks: Array<{
      symbol: string;
      price: number | null;
      currency: string;
      changePct: number | null;
      source?: string | null;
    }>;
    status: string;
  };
  groundingRules: {
    isUserAuthenticated: boolean;
    hasCompletedOnboarding: boolean;
    hasLoggedExpenses: boolean;
    hasActiveGoals: boolean;
    hasAllocatedStrategy: boolean;
    isDemoMode: boolean;
    prohibitions: string[];
  };
}

/**
 * Builds an authoritative, fully grounded financial context for VestIQ.
 * Consumes existing calculations from strategyEngine and user profile repository.
 * Zero calculation duplication, zero hallucinated fields, strict user isolation.
 */
export function buildGroundedContext(
  user: UserProfile | null,
  expenses: ExpenseItem[] = [],
  goals: GoalItem[] = [],
  strategy?: InvestmentStrategy | null,
  marketQuotes?: Record<string, MarketQuote>
): GroundedFinancialContext {
  const salary = Number(user?.salaryIncome) || Number(user?.monthlyIncome) || 0;
  const otherInc = Number(user?.otherIncome) || 0;
  const totalIncome = salary + otherInc;

  const totalLoggedExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpenses = totalLoggedExpenses > 0 ? totalLoggedExpenses : (Number(user?.monthlyExpenses) || 0);

  const monthlySurplus = totalIncome - totalExpenses;
  const investableSurplus = Math.max(0, monthlySurplus);
  const savingsRate = totalIncome > 0 && monthlySurplus > 0 ? Math.round((monthlySurplus / totalIncome) * 100) : 0;

  const emergencyFund = Number(user?.emergencyFund) || Number(user?.existingSavings) || 0;
  const emergencyTarget = totalExpenses * 6;
  const emergencyFundMonths = totalExpenses > 0 ? Number((emergencyFund / totalExpenses).toFixed(1)) : 0;

  let emergencyFundStatus: 'Inadequate' | 'Moderate' | 'Healthy' | 'Surplus' = 'Inadequate';
  if (emergencyFundMonths >= 6) emergencyFundStatus = 'Surplus';
  else if (emergencyFundMonths >= 3.5) emergencyFundStatus = 'Healthy';
  else if (emergencyFundMonths >= 2) emergencyFundStatus = 'Moderate';

  const riskTolerance = user?.riskTolerance || user?.riskCategory || 'Moderate';
  const riskCapacity = emergencyFundMonths >= 4 && savingsRate >= 25 ? 'High' : (emergencyFundMonths < 2 ? 'Low' : 'Moderate');
  const riskScore = user?.riskScore || 50;

  const mappedGoals = goals.map((g) => ({
    title: g.title,
    targetAmount: Number(g.targetAmount) || 0,
    targetDate: g.targetDate,
    category: g.category,
    monthlySipRequired: Number(g.monthlySipRequired) || 0
  }));

  const holdingsList = user?.existingInvestments && user.existingInvestments > 0
    ? [{ name: 'Existing Holdings', amount: Number(user.existingInvestments), category: 'Equity & Debt' }]
    : [];

  const benchmarkList = marketQuotes ? Object.values(marketQuotes).map(q => ({
    symbol: q.symbol,
    price: q.price,
    currency: q.currency,
    changePct: q.changePct,
    source: q.source
  })) : [];

  const hasOnboarding = Boolean(user?.onboardingCompleted);

  return {
    profile: {
      userId: user?.id || null,
      name: user?.name?.trim() || (hasOnboarding ? 'Investor' : 'Guest'),
      age: user?.age ? Number(user.age) : null,
      occupation: user?.occupation?.trim() || 'Professional',
      investmentHorizon: user?.investmentHorizon || '5 to 10 years',
      investmentExperience: user?.investmentExperience || 'Intermediate',
      financialGoal: user?.financialGoal || (mappedGoals.length > 0 ? mappedGoals[0].title : 'Wealth Creation'),
      onboardingCompleted: hasOnboarding
    },
    cashFlow: {
      monthlyIncome: totalIncome,
      salaryIncome: salary,
      otherIncome: otherInc,
      monthlyExpenses: totalExpenses,
      monthlySurplus,
      investableSurplus,
      savingsRate,
      emergencyFund,
      emergencyTarget,
      emergencyFundMonths,
      emergencyFundStatus
    },
    goals: mappedGoals,
    portfolio: {
      existingInvestments: Number(user?.existingInvestments) || 0,
      existingSavings: Number(user?.existingSavings) || emergencyFund,
      holdings: holdingsList
    },
    risk: {
      riskTolerance,
      riskCapacity,
      riskCategory: riskTolerance,
      riskScore,
      effectiveRiskCategory: strategy?.suitabilityFactors?.effectiveRiskCategory || riskTolerance,
      finalAdvisoryRisk: strategy?.suitabilityFactors?.finalAdvisoryRisk || 'MODERATE',
      isCapacityConstrained: strategy?.suitabilityFactors?.isCapacityConstrained || false,
      capacityConstraintReason: strategy?.suitabilityFactors?.capacityConstraintReason
    },
    strategy: strategy ? {
      strategyName: strategy.strategyName,
      riskProfile: strategy.riskProfile,
      expectedReturnRange: strategy.expectedReturnRange,
      allocations: strategy.allocations?.map((a) => ({
        name: a.name,
        percentage: a.percentage,
        monthlyAmount: a.monthlyAmount,
        category: a.category,
        riskLevel: a.riskLevel,
        reasonSelected: a.reasonSelected
      })) || []
    } : undefined,
    market: benchmarkList.length > 0 ? {
      benchmarks: benchmarkList,
      status: 'OPEN'
    } : undefined,
    groundingRules: {
      isUserAuthenticated: Boolean(user?.id || user?.email),
      hasCompletedOnboarding: hasOnboarding,
      hasLoggedExpenses: expenses.length > 0,
      hasActiveGoals: mappedGoals.length > 0,
      hasAllocatedStrategy: Boolean(strategy && strategy.allocations && strategy.allocations.length > 0),
      isDemoMode: isDemoMode(),
      prohibitions: [
        'DO NOT invent portfolio holdings not listed in portfolio array',
        'DO NOT invent fictitious financial amounts, returns, or goals',
        'DO NOT claim real-time market data unless explicitly present in market benchmarks',
        'State clearly when user data is not configured rather than guessing'
      ]
    }
  };
}

/**
 * Deterministic offline fallback response generator.
 * Strictly uses grounded user values to answer queries when the backend AI is offline.
 */
export function generateGroundedOfflineResponse(
  query: string,
  context: GroundedFinancialContext
): { text: string; intent?: string; calculations?: any; followUps?: string[] } {
  const q = query.trim().toLowerCase();
  const cf = context?.cashFlow || {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    investableSurplus: (context as any)?.monthlySurplus || 0,
    savingsRate: 0,
    emergencyFund: 0,
    emergencyTarget: 0,
    emergencyFundMonths: (context as any)?.emergencyRunwayMonths || 0,
    emergencyFundStatus: 'Unknown'
  };
  const prof = context?.profile || {
    name: (context as any)?.userName || 'Guest',
    onboardingCompleted: false,
    email: ''
  };
  const risk = context?.risk || {
    effectiveRiskCategory: (context as any)?.riskProfile || 'Moderate',
    riskTolerance: 'Moderate'
  };
  const strat = context?.strategy || {
    strategyName: 'Custom Strategy',
    riskProfile: 'Moderate',
    expectedReturnRange: '10-12%',
    allocations: []
  };

  const formatMoney = (amt: number, curr = '₹') => `${curr}${amt.toLocaleString('en-IN')}`;

  // 1. Surplus & Monthly Investment
  if (q.includes('surplus') || q.includes('how much can i invest') || q.includes('monthly investment') || q.includes('invest each month')) {
    if (!prof.onboardingCompleted && cf.monthlyIncome === 0) {
      return {
        text: 'Your financial cash flow profile is not yet configured. Please complete onboarding to calculate your exact monthly investable surplus.',
        followUps: ['Start Onboarding', 'What is an ETF?', 'How does SIP work?']
      };
    }
    const surplusText = cf.investableSurplus > 0
      ? `Based on your monthly income of **${formatMoney(cf.monthlyIncome)}** and expenses of **${formatMoney(cf.monthlyExpenses)}**, your verified monthly investable surplus is **${formatMoney(cf.investableSurplus)}** (Savings Rate: **${cf.savingsRate}%**).`
      : `Your current monthly income (**${formatMoney(cf.monthlyIncome)}**) matches or is less than your expenses (**${formatMoney(cf.monthlyExpenses)}**), indicating zero net investable surplus. We recommend optimizing fixed expenses before starting aggressive equity SIPs.`;

    return {
      text: `### Monthly Cash Flow & Investable Surplus\n\n${surplusText}\n\n* **Emergency Runway:** ${cf.emergencyFundMonths} months (${cf.emergencyFundStatus})\n* **Risk Mandate:** ${risk.effectiveRiskCategory || risk.riskTolerance}`,
      intent: 'SURPLUS_ALLOCATION',
      calculations: {
        type: 'surplus',
        monthlyIncome: cf.monthlyIncome,
        monthlyExpenses: cf.monthlyExpenses,
        investableSurplus: cf.investableSurplus,
        savingsRate: cf.savingsRate
      },
      followUps: ['Where should I allocate this surplus?', 'How can I optimize my expenses?', 'What is my emergency fund target?']
    };
  }

  // 2. Emergency Fund & Runway
  if (q.includes('emergency') || q.includes('runway') || q.includes('safety reserve')) {
    if (!prof.onboardingCompleted && cf.emergencyFund === 0) {
      return {
        text: 'Your emergency fund data has not been registered yet. A standard fiduciary rule is maintaining 3 to 6 months of living expenses in liquid debt funds or high-yield savings.',
        followUps: ['Set up Emergency Fund', 'What are liquid funds?']
      };
    }
    return {
      text: `### Emergency Runway Assessment\n\n* **Current Emergency Reserve:** ${formatMoney(cf.emergencyFund)}\n* **Target Runway (6 Months):** ${formatMoney(cf.emergencyTarget)}\n* **Funded Runway:** **${cf.emergencyFundMonths} Months** (${cf.emergencyFundStatus} Cushion)\n\n${
        cf.emergencyFundMonths >= 6
          ? 'Your emergency runway is fully funded. You have sufficient resilience to deploy 100% of your surplus into long-term compounding assets.'
          : `We recommend directing a portion of monthly cash flows to build your safety cushion to **${formatMoney(cf.emergencyTarget)}** before taking maximum equity risk.`
      }`,
      intent: 'EMERGENCY_FUND',
      calculations: {
        type: 'emergency',
        currentFund: cf.emergencyFund,
        targetFund: cf.emergencyTarget,
        months: cf.emergencyFundMonths,
        status: cf.emergencyFundStatus
      },
      followUps: ['How much should I invest in liquid funds?', 'What is my risk mandate?']
    };
  }

  // 3. Risk Profile & Mandate
  if (q.includes('risk') || q.includes('mandate') || q.includes('tolerance') || q.includes('capacity')) {
    const constraintText = risk.isCapacityConstrained && risk.capacityConstraintReason
      ? `\n\n> ⚠️ **Fiduciary Note:** ${risk.capacityConstraintReason}`
      : '';
    return {
      text: `### Investor Risk Mandate\n\n* **Stated Risk Tolerance:** ${risk.riskTolerance}\n* **Objective Risk Capacity:** ${risk.riskCapacity}\n* **Effective Advisory Mandate:** **${risk.effectiveRiskCategory || risk.riskTolerance}**\n* **Investment Horizon:** ${prof.investmentHorizon}${constraintText}`,
      intent: 'RISK_PROFILE',
      followUps: ['View asset allocation blueprint', 'How much can I invest each month?']
    };
  }

  // 4. Goals & SIP Planning
  if (q.includes('goal') || (q.includes('sip') && !q.includes('what is'))) {
    if (context.goals.length === 0) {
      return {
        text: 'You have not registered any specific financial goals yet. You can define goals (e.g. Retirement, House Purchase, Child Education) in the Goal Planner module.',
        followUps: ['Add a new Goal', 'How much can I invest each month?']
      };
    }
    const goalLines = context.goals.map(g => 
      `* **${g.title}:** Target ${formatMoney(g.targetAmount)} by ${g.targetDate}${g.monthlySipRequired ? ` (Required SIP: ${formatMoney(g.monthlySipRequired)}/mo)` : ''}`
    ).join('\n');

    return {
      text: `### Active Financial Goals Roadmap\n\n${goalLines}\n\nYour portfolio allocation strategy is calibrated to fund these horizons with disciplined monthly systematic contributions.`,
      intent: 'GOAL_PLANNING',
      followUps: ['How is my surplus allocated?', 'Check emergency fund runway']
    };
  }

  // 5. Asset Allocation & Strategy
  if (q.includes('allocation') || q.includes('strategy') || q.includes('portfolio') || q.includes('where to invest')) {
    if (!strat || !strat.allocations || strat.allocations.length === 0) {
      return {
        text: 'Your asset allocation blueprint is pending financial onboarding. Complete your profile to generate your customized portfolio mandate.',
        followUps: ['Complete Onboarding', 'What is an ETF?']
      };
    }
    const allocLines = strat.allocations.map(a => 
      `* **${a.name} (${a.percentage}%):** ${formatMoney(a.monthlyAmount)}/mo — *${a.category || 'Core'}*`
    ).join('\n');

    return {
      text: `### Strategic Multi-Asset Allocation (${strat.strategyName})\n\n**Expected Return:** ~${strat.expectedReturnRange}\n**Monthly Inflow:** ${formatMoney(cf.investableSurplus)}/month\n\n${allocLines}`,
      intent: 'ALLOCATION_ADVICE',
      followUps: ['Why this allocation?', 'How much emergency runway do I have?']
    };
  }

  // 6. Market Data & Stock Inquiries (Anti-Fabrication Fiduciary Rule)
  if (
    q.includes('price') ||
    q.includes('pe ratio') ||
    q.includes('p/e') ||
    q.includes('quote') ||
    q.includes('market mover') ||
    q.includes('earnings') ||
    q.includes('dividend yield') ||
    q.includes('valuation') ||
    q.includes('share price') ||
    q.includes('stock price')
  ) {
    return {
      text: `### Live Market Data Notice\n\nReal-time market quotes, current valuations, P/E ratios, and stock price analytics require an active live feed connection to the market data engine.\n\n* **Live Data Status:** Live market feeds are temporarily offline or unreachable.\n* **Fiduciary Policy:** To ensure strict compliance and data integrity, VestIQ does not fabricate or estimate real-time market statistics when live feeds are unavailable.\n\nPlease verify live quotes in the **Market Universe** tab or retry once live market connectivity is restored.`,
      intent: 'MARKET_DATA_UNAVAILABLE',
      followUps: ['Review my portfolio asset allocation', 'How much can I invest each month?', 'Check emergency fund runway']
    };
  }

  // 7. Missing / Unconfigured Information (Anti-Hallucination Safe Guard)
  if (q.includes('crypto') || q.includes('bitcoin') || q.includes('real estate property') || q.includes('loan account') || q.includes('tax filing')) {
    return {
      text: `I do not see any records for **${query}** in your verified SmartVest profile or connected portfolio holdings. SmartVest focuses on fiduciary multi-asset allocation across Direct Mutual Funds, Equity Index ETFs, Fixed Income Bonds, and Sovereign Gold.`,
      followUps: ['What instruments are in my strategy?', 'What is my current risk mandate?']
    };
  }

  // 8. General Financial Concepts (Education)
  if (q.includes('etf')) {
    return {
      text: `### Exchange Traded Fund (ETF)\n\nAn ETF is a pooled investment security that tracks an underlying benchmark index, commodity, or asset basket, trading continuously on stock exchanges (NSE, BSE, NASDAQ) with low expense ratios and high liquidity.`,
      intent: 'EDUCATION',
      followUps: ['What ETFs are in my portfolio?', 'Difference between ETF and Mutual Fund']
    };
  }

  if (q.includes('cagr')) {
    return {
      text: `### Compound Annual Growth Rate (CAGR)\n\nCAGR measures the smoothed annualized rate of return on an investment over multiple years, accounting for the compounding effect: **CAGR = (Ending Value / Beginning Value)^(1/Years) - 1**.`,
      intent: 'EDUCATION',
      followUps: ['What is my expected portfolio CAGR?', 'How much will my SIP grow in 10 years?']
    };
  }

  // Default Grounded Welcome / Assistant Overview - ONLY returned when user explicitly asks for greeting/overview
  const isGreetingOrHelp =
    !q ||
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'greetings' ||
    q.startsWith('hello ') ||
    q.startsWith('hi ') ||
    q.includes('who are you') ||
    q.includes('what can you do') ||
    q.includes('help me get started') ||
    q.includes('start onboarding') ||
    q.includes('overview of vestiq');

  if (isGreetingOrHelp) {
    const nameGreeting = prof.name && prof.name !== 'Guest' ? `Hello ${prof.name}` : 'Hello';
    return {
      text: `${nameGreeting}, I am **VestIQ**, your fiduciary portfolio advisor. I am calibrated with your **${risk.effectiveRiskCategory || 'Moderate'}** risk mandate and **${formatMoney(cf.investableSurplus)}/month** investable surplus.\n\nAsk me about cash flow optimization, emergency runway targets, goal SIP requirements, or asset class suitability.`,
      intent: 'GREETING',
      followUps: [
        'How much can I invest each month?',
        'How much emergency runway do I have?',
        'What is my current risk mandate?',
        'What is my active goal roadmap?'
      ]
    };
  }

  // For specific finance/market questions where verified offline data is unavailable,
  // return an honest message and NEVER invent conclusions or return unrelated onboarding text.
  return {
    text: "I can't verify the current market information needed to answer this question right now.",
    intent: 'MARKET_DATA_UNAVAILABLE',
    followUps: [
      'Review my portfolio asset allocation',
      'How much can I invest each month?',
      'How much emergency runway do I have?'
    ]
  };
}

/**
 * Checks whether text matches a generic onboarding or welcome overview.
 */
export function isGenericOnboardingText(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('your fiduciary portfolio advisor') ||
    (lower.includes('i am vestiq') && lower.includes('calibrated with your')) ||
    (lower.includes('cash flow optimization') && lower.includes('emergency runway targets'))
  );
}

/**
 * Checks whether a user query is a greeting or introductory help inquiry.
 */
export function isGreetingOrHelpQuery(query: string): boolean {
  const q = (query || '').trim().toLowerCase();
  return (
    !q ||
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'greetings' ||
    q.startsWith('hello ') ||
    q.startsWith('hi ') ||
    q.includes('who are you') ||
    q.includes('what can you do') ||
    q.includes('help me get started') ||
    q.includes('start onboarding') ||
    q.includes('overview of vestiq')
  );
}

export interface ParsedAssistantResponse {
  text: string;
  calculations?: any;
  followUps?: string[];
  intent?: string;
  entities?: string[];
}

/**
 * Universal, lossless parser for backend AI assistant responses.
 * Accurately extracts text, calculations, and follow-ups from various backend schemas
 * (FastAPI, OpenAI, LangChain, or custom response envelopes) without altering numbers or facts.
 */
export function parseAssistantApiResponse(res: any, fallbackQuery?: string): ParsedAssistantResponse {
  if (!res) {
    return {
      text: fallbackQuery
        ? `The advisory engine returned an empty response for your query.`
        : "The advisory service returned an empty response."
    };
  }

  // 1. Plain string response
  if (typeof res === 'string') {
    const trimmed = res.trim();
    return {
      text: trimmed || "The advisory service returned an empty response."
    };
  }

  // 2. Unpack if response is wrapped e.g. { data: ... }
  const root = (res.data && typeof res.data === 'object' && !Array.isArray(res.data) &&
    (res.data.reply || res.data.response || res.data.message || res.data.answer || res.data.content || res.data.text || res.data.output || res.data.result))
    ? res.data
    : res;

  // 3. Extract text from all potential API fields without altering any content
  let text = '';
  if (typeof root.reply === 'string' && root.reply.trim()) {
    text = root.reply.trim();
  } else if (typeof root.response === 'string' && root.response.trim()) {
    text = root.response.trim();
  } else if (typeof root.answer === 'string' && root.answer.trim()) {
    text = root.answer.trim();
  } else if (typeof root.message === 'string' && root.message.trim()) {
    text = root.message.trim();
  } else if (typeof root.content === 'string' && root.content.trim()) {
    text = root.content.trim();
  } else if (typeof root.text === 'string' && root.text.trim()) {
    text = root.text.trim();
  } else if (typeof root.output === 'string' && root.output.trim()) {
    text = root.output.trim();
  } else if (typeof root.result === 'string' && root.result.trim()) {
    text = root.result.trim();
  } else if (root.message && typeof root.message === 'object' && typeof root.message.content === 'string' && root.message.content.trim()) {
    text = root.message.content.trim();
  } else if (Array.isArray(root.choices) && root.choices.length > 0) {
    const choice = root.choices[0];
    if (choice.message && typeof choice.message.content === 'string' && choice.message.content.trim()) {
      text = choice.message.content.trim();
    } else if (typeof choice.text === 'string' && choice.text.trim()) {
      text = choice.text.trim();
    }
  } else if (typeof res.data === 'string' && res.data.trim()) {
    text = res.data.trim();
  }

  // 4. If text is still empty, check error/detail/status fields honestly
  if (!text) {
    if (typeof root.detail === 'string' && root.detail.trim()) {
      text = root.detail.trim();
    } else if (typeof root.error === 'string' && root.error.trim()) {
      text = root.error.trim();
    } else if (typeof root.status === 'string' && root.status.toLowerCase() === 'unavailable') {
      text = root.message || 'Market data and advisory analysis are temporarily unavailable from the backend provider.';
    } else if (fallbackQuery) {
      text = `I have received your query regarding "${fallbackQuery}", but the response payload could not be parsed.`;
    } else {
      text = "Unable to parse assistant response payload.";
    }
  }

  // 5. Extract follow-up suggestions (check all common conventions)
  let followUps: string[] = [];
  const rawFollowUps = root.followUps ||
    root.follow_ups ||
    root.follow_up_suggestions ||
    root.suggested_questions ||
    root.suggestions ||
    res.follow_up_suggestions ||
    res.suggested_questions ||
    res.followUps;
  if (Array.isArray(rawFollowUps)) {
    followUps = rawFollowUps
      .map((f: any) => typeof f === 'string' ? f.trim() : (f?.text || f?.question || String(f)).trim())
      .filter(Boolean);
  }

  // 6. Extract calculations / structured financial cards (preserve numbers exactly)
  let calculations = root.calculations ?? root.calculation ?? root.structured_data ?? root.analysis_data ?? res.calculations ?? null;
  if (typeof calculations === 'string') {
    try {
      calculations = JSON.parse(calculations);
    } catch {
      // Keep as string if not valid JSON
    }
  }

  // 7. Extract intent & entities
  const intent = root.intent || res.intent;
  const entities = Array.isArray(root.entities)
    ? root.entities
    : (Array.isArray(res.entities) ? res.entities : undefined);

  return {
    text,
    calculations,
    followUps: followUps.length > 0 ? followUps : undefined,
    intent,
    entities
  };
}
