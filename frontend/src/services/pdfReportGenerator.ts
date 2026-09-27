import type { UserProfile, InvestmentStrategy, ExpenseItem, GoalItem, Currency } from '../types';

export function generateAdvisoryPdfReport({
  user,
  strategy,
  expenses,
  goals,
  currencySymbol
}: {
  user: UserProfile | null;
  strategy: InvestmentStrategy;
  expenses: ExpenseItem[];
  goals: GoalItem[];
  currency: Currency;
  currencySymbol: string;
}) {
  const userName = user?.name || 'Investor';
  const age = user?.age || 'N/A';
  const occupation = user?.occupation || 'Professional';
  const salary = user?.salaryIncome || user?.monthlyIncome || 0;
  const otherInc = user?.otherIncome || 0;
  const totalIncome = salary + otherInc;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0) || (user?.monthlyExpenses || 0);
  const surplus = Math.max(0, totalIncome - totalExpenses);
  const emergencyFund = user?.emergencyFund || user?.existingSavings || 0;
  const risk = user?.riskTolerance || 'Moderate';
  const riskScore = user?.riskScore || 75;
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and print your PDF report.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartVest AI — Strategic Financial Advisory Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    body {
      background-color: #ffffff;
      color: #0f172a;
      padding: 40px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #059669;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-badge {
      background: #059669;
      color: #fff;
      font-weight: 800;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 16px;
    }
    .brand h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .meta-info {
      text-align: right;
      font-size: 12px;
      color: #64748b;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }
    .section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
    }
    .card-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
      font-variant-numeric: tabular-nums;
    }
    .card-value.highlight {
      color: #059669;
    }
    .card-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 8px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
    }
    td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .highlight-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12px;
      color: #065f46;
      line-height: 1.6;
    }
    .disclaimer {
      border-top: 1px solid #cbd5e1;
      padding-top: 16px;
      margin-top: 30px;
      font-size: 10px;
      color: #64748b;
      line-height: 1.5;
      text-align: center;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  
  <div class="header">
    <div class="brand">
      <span class="logo-badge">SmartVest</span>
      <div>
        <h1>SmartVest Strategic Advisory Blueprint</h1>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Quantitative Multi-Asset Strategic Allocation Blueprint</div>
      </div>
    </div>
    <div class="meta-info">
      <div><strong>Report Date:</strong> ${dateStr}</div>
      <div><strong>Investor:</strong> ${userName} (Age: ${age})</div>
      <div><strong>Advisory Mandate:</strong> ${risk} Profile</div>
    </div>
  </div>

  <!-- SECTION 1: INVESTOR PROFILE & EXECUTIVE CASHFLOW SUMMARY -->
  <div class="section">
    <div class="section-title">
      <span>1. Executive Financial Snapshot & Capacity</span>
      <span class="badge">${strategy.strategyName}</span>
    </div>
    <div class="grid-4">
      <div class="card">
        <div class="card-label">Monthly Inflow</div>
        <div class="card-value">${currencySymbol}${totalIncome.toLocaleString()}</div>
        <div class="card-sub">${occupation}</div>
      </div>
      <div class="card">
        <div class="card-label">Living Outflows</div>
        <div class="card-value" style="color: #e11d48;">${currencySymbol}${totalExpenses.toLocaleString()}</div>
        <div class="card-sub">${totalIncome > 0 ? Math.round((totalExpenses/totalIncome)*100) : 0}% of Monthly Income</div>
      </div>
      <div class="card">
        <div class="card-label">Investable Surplus</div>
        <div class="card-value highlight">${currencySymbol}${surplus.toLocaleString()}/mo</div>
        <div class="card-sub">${totalIncome > 0 ? Math.round((surplus/totalIncome)*100) : 0}% Savings Rate</div>
      </div>
      <div class="card">
        <div class="card-label">Risk Profile</div>
        <div class="card-value" style="color: #0284c7;">${risk}</div>
        <div class="card-sub">Score: ${riskScore}/100</div>
      </div>
    </div>
  </div>

  <!-- SECTION 2: SMART INSIGHTS & READINESS -->
  <div class="section">
    <div class="section-title">
      <span>2. Institutional Smart Readiness Index</span>
      <span style="font-size: 12px; font-weight: 700; color: #059669;">AI Confidence: ${strategy.smartInsights.overallConfidencePercentage}%</span>
    </div>
    <div class="grid-4">
      <div class="card">
        <div class="card-label">Financial Health</div>
        <div class="card-value">${strategy.smartInsights.financialHealthScore} / 100</div>
      </div>
      <div class="card">
        <div class="card-label">Emergency Buffer</div>
        <div class="card-value">${strategy.smartInsights.emergencyFundScore}% Covered</div>
        <div class="card-sub">${currencySymbol}${emergencyFund.toLocaleString()} Liquid</div>
      </div>
      <div class="card">
        <div class="card-label">Goal Readiness</div>
        <div class="card-value">${strategy.smartInsights.goalReadinessScore} / 100</div>
      </div>
      <div class="card">
        <div class="card-label">Investment Capacity</div>
        <div class="card-value">${strategy.smartInsights.investmentReadinessScore} / 100</div>
      </div>
    </div>
  </div>

  <!-- SECTION 3: PERSONALIZED INVESTMENT RECOMMENDATIONS -->
  <div class="section">
    <div class="section-title">
      <span>3. Personalized Monthly Investment Blueprint (Surplus: ${currencySymbol}${surplus.toLocaleString()}/mo)</span>
      <span>${strategy.expectedReturnRange}</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>Asset / Recommended Instrument</th>
          <th>Category</th>
          <th>Monthly SIP</th>
          <th>Allocation %</th>
          <th>Risk Level</th>
          <th>Strategic Rationale</th>
        </tr>
      </thead>
      <tbody>
        ${strategy.allocations.map(a => `
          <tr>
            <td><strong>${a.name}</strong><br><span style="font-size: 10px; color: #64748b;">${a.suggestedInstruments.join(', ')}</span></td>
            <td>${a.category}</td>
            <td><strong>${currencySymbol}${a.monthlyAmount.toLocaleString()}</strong></td>
            <td>${a.percentage}%</td>
            <td><span style="font-size: 10px; font-weight: 700; color: ${a.riskLevel === 'High' ? '#dc2626' : (a.riskLevel === 'Moderate' ? '#d97706' : '#16a34a')};">${a.riskLevel}</span></td>
            <td style="font-size: 11px;">${a.reasonSelected}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <!-- SECTION 4: GOAL PLANNING & COMPOUNDING PROJECTIONS -->
  <div class="section">
    <div class="section-title">
      <span>4. Financial Milestone Roadmaps (${goals.length} Goals Created)</span>
    </div>
    ${goals.length === 0 ? `
      <div class="card" style="text-align: center; color: #64748b; font-size: 12px; padding: 20px;">
        No active milestone goals logged. Create goals in SmartVest to track required monthly SIPs.
      </div>
    ` : `
      <table>
        <thead>
          <tr>
            <th>Goal Name</th>
            <th>Category</th>
            <th>Target Corpus</th>
            <th>Current Saved</th>
            <th>Target Horizon</th>
            <th>Required Monthly SIP</th>
            <th>Probability</th>
          </tr>
        </thead>
        <tbody>
          ${goals.map(g => `
            <tr>
              <td><strong>${g.title}</strong></td>
              <td>${g.category}</td>
              <td>${currencySymbol}${g.targetAmount.toLocaleString()}</td>
              <td>${currencySymbol}${g.currentAmount.toLocaleString()}</td>
              <td>${g.targetDate}</td>
              <td style="color: #059669; font-weight: 700;">${currencySymbol}${g.monthlySipRequired.toLocaleString()}/mo</td>
              <td><strong>${g.probability}%</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `}
  </div>

  <!-- SECTION 5: 10-YEAR COMPOUNDING FORECAST -->
  <div class="section">
    <div class="section-title">
      <span>5. Expected Future Compounding Outcomes</span>
    </div>
    <div class="grid-4">
      <div class="card">
        <div class="card-label">5-Year Projected Corpus</div>
        <div class="card-value highlight">${currencySymbol}${strategy.projections.year5.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-label">10-Year Projected Corpus</div>
        <div class="card-value highlight">${currencySymbol}${strategy.projections.year10.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-label">15-Year Projected Corpus</div>
        <div class="card-value highlight">${currencySymbol}${strategy.projections.year15.toLocaleString()}</div>
      </div>
      <div class="card">
        <div class="card-label">20-Year Projected Corpus</div>
        <div class="card-value highlight">${currencySymbol}${strategy.projections.year20.toLocaleString()}</div>
      </div>
    </div>
  </div>

  <!-- SECTION 6: AI EXPLAINABLE REASONING -->
  <div class="section">
    <div class="section-title">
      <span>6. Strategic Algorithm Rationale</span>
    </div>
    <div class="highlight-box">
      <strong>Institutional Strategy Evaluation:</strong> ${strategy.whyThisStrategy.deepRationale}
    </div>
  </div>

  <!-- DISCLAIMER -->
  <div class="disclaimer">
    <strong>⚖️ Regulatory Notice & Non-Guarantee Advisory Disclosure:</strong><br>
    SmartVest is an educational and strategic financial planning decision-support platform. SmartVest is <strong>NOT a broker-dealer</strong>, does <strong>NOT execute securities transactions</strong>, and does <strong>NOT custody client assets</strong> or accept deposits. All strategic allocations and mathematical simulations are for planning purposes. Investments must be evaluated independently and executed through third-party registered brokerages. Past market performance and CAGR compounding models are estimates and do not guarantee future returns.
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>

</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export interface ExpensePdfReportData {
  user: UserProfile | null;
  currency: Currency;
  currencySymbol: string;
  formatCurrency?: (amount: number) => string;
  totalIncome?: number;
  totalExpenses?: number;
  netSavings?: number;
  savingsRate?: number;
  burnRate?: number;
  needsTotal?: number;
  wantsTotal?: number;
  fixedTotal?: number;
  categoryMeta?: Record<string, { color?: string; label: string; group: 'Needs' | 'Wants' | 'Fixed' }>;
  categoryTotals?: Record<string, number>;
  expenses: ExpenseItem[];
  compoundingOpportunity?: {
    potentialMonthlySaved: number;
    futureCorpus20Yr: number;
  };
  reportDate?: Date;
}

export function getExpensePdfFilename(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `SmartVest-Expense-Report-${yyyy}-${mm}-${dd}.pdf`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const defaultCategoryMeta: Record<string, { color: string; label: string; group: 'Needs' | 'Wants' | 'Fixed' }> = {
  Food: { color: '#00D4AA', label: 'Food & Dining', group: 'Needs' },
  Rent: { color: '#1E88E5', label: 'Housing & Rent', group: 'Needs' },
  Shopping: { color: '#FF5252', label: 'Shopping & Lifestyle', group: 'Wants' },
  Transport: { color: '#00C853', label: 'Transport & Commute', group: 'Needs' },
  Entertainment: { color: '#8B5CF6', label: 'Entertainment & Leisure', group: 'Wants' },
  Utilities: { color: '#F59E0B', label: 'Bills & Utilities', group: 'Fixed' },
  EMI: { color: '#FF5252', label: 'Debt Service & EMIs', group: 'Fixed' },
  Other: { color: '#8A94A6', label: 'Miscellaneous', group: 'Wants' },
};

export function generateExpensePdfReport(data: ExpensePdfReportData): boolean {
  try {
    const expenses = data.expenses || [];
    const user = data.user;
    const currency = data.currency || 'INR';
    const currencySymbol = data.currencySymbol || (currency === 'USD' ? '$' : '₹');

    const formatCurrency = data.formatCurrency || ((amt: number) => {
      if (currency === 'INR') {
        return `${currencySymbol}${amt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
      }
      return `${currencySymbol}${amt.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    });

    const categoryMeta = data.categoryMeta || defaultCategoryMeta;

    // Use passed values from ExpenseTrackerView or compute identically as fallback
    const salary = user?.salaryIncome || user?.monthlyIncome || 0;
    const otherInc = user?.otherIncome || 0;
    const totalIncome = typeof data.totalIncome === 'number' ? data.totalIncome : (salary + otherInc);

    const totalExpenses = typeof data.totalExpenses === 'number'
      ? data.totalExpenses
      : expenses.reduce((sum, e) => sum + e.amount, 0);

    const netSavings = typeof data.netSavings === 'number'
      ? data.netSavings
      : Math.max(0, totalIncome - totalExpenses);

    const savingsRate = typeof data.savingsRate === 'number'
      ? data.savingsRate
      : (totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0);

    const burnRate = typeof data.burnRate === 'number'
      ? data.burnRate
      : (totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0);

    // Category totals
    const categoryTotals = data.categoryTotals || expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    const needsTotal = typeof data.needsTotal === 'number'
      ? data.needsTotal
      : ((categoryTotals['Food'] || 0) + (categoryTotals['Rent'] || 0) + (categoryTotals['Transport'] || 0));

    const wantsTotal = typeof data.wantsTotal === 'number'
      ? data.wantsTotal
      : ((categoryTotals['Shopping'] || 0) + (categoryTotals['Entertainment'] || 0) + (categoryTotals['Other'] || 0));

    const fixedTotal = typeof data.fixedTotal === 'number'
      ? data.fixedTotal
      : ((categoryTotals['Utilities'] || 0) + (categoryTotals['EMI'] || 0));

    const needsPct = totalIncome > 0 ? Math.round((needsTotal / totalIncome) * 100) : 0;
    const wantsPct = totalIncome > 0 ? Math.round((wantsTotal / totalIncome) * 100) : 0;
    const fixedPct = totalIncome > 0 ? Math.round((fixedTotal / totalIncome) * 100) : 0;

    // Compounding opportunity
    const compoundingOpportunity = data.compoundingOpportunity || (wantsTotal > 0 ? (() => {
      const potentialMonthlySaved = Math.round(wantsTotal * 0.25);
      const months20Yr = 20 * 12;
      const rateMonth = 0.135 / 12;
      const futureCorpus20Yr = Math.round(
        potentialMonthlySaved * ((Math.pow(1 + rateMonth, months20Yr) - 1) / rateMonth) * (1 + rateMonth)
      );
      return { potentialMonthlySaved, futureCorpus20Yr };
    })() : undefined);

    // Active categories (only categories with actual recorded outflows)
    const activeCategories = Object.keys(categoryMeta)
      .map(key => {
        const meta = categoryMeta[key] || { color: '#8A94A6', label: key, group: 'Wants' as const };
        const amount = categoryTotals[key] || 0;
        const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
        return { key, label: meta.label, group: meta.group, color: meta.color || '#3b82f6', amount, pct };
      })
      .filter(c => c.amount > 0);

    // Top outflow category
    const topCategory = activeCategories.length > 0
      ? [...activeCategories].sort((a, b) => b.amount - a.amount)[0]
      : null;

    const reportDate = data.reportDate || new Date();
    const filename = getExpensePdfFilename(reportDate);
    const docTitle = filename.replace(/\.pdf$/i, '');
    const dateFormatted = reportDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const reportingMonth = reportDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });

    const userName = user?.name ? user.name : 'N/A';

    const printWindow = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    if (!printWindow) {
      if (typeof alert === 'function') {
        alert('Please allow popups to generate and print your PDF report.');
      }
      return false;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(docTitle)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    body {
      background-color: #ffffff;
      color: #0f172a;
      padding: 36px;
      line-height: 1.5;
      font-size: 13px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #059669;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      background: #059669;
      color: #ffffff;
      font-weight: 800;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 15px;
      letter-spacing: -0.3px;
    }
    .brand h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.4px;
      line-height: 1.2;
    }
    .brand p {
      font-size: 11.5px;
      color: #64748b;
      margin-top: 2px;
    }
    .meta-info {
      text-align: right;
      font-size: 11.5px;
      color: #64748b;
      line-height: 1.6;
    }
    .meta-info strong {
      color: #0f172a;
    }
    .section {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
    }
    .card-label {
      font-size: 10.5px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      font-family: 'JetBrains Mono', monospace;
      font-variant-numeric: tabular-nums;
    }
    .card-value.highlight-emerald {
      color: #059669;
    }
    .card-value.highlight-red {
      color: #dc2626;
    }
    .card-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 6px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .badge-needs {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
    }
    .badge-wants {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }
    .badge-fixed {
      background: #fffbeb;
      color: #d97706;
      border: 1px solid #fde68a;
    }
    .highlight-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 12px;
      color: #065f46;
      line-height: 1.5;
      margin-top: 10px;
    }
    .empty-state-notice {
      padding: 16px;
      text-align: center;
      color: #64748b;
      font-style: italic;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      font-size: 12px;
    }
    .disclaimer {
      border-top: 1px solid #cbd5e1;
      padding-top: 14px;
      margin-top: 24px;
      font-size: 10px;
      color: #64748b;
      line-height: 1.5;
      text-align: center;
    }
    .no-print {
      margin-top: 24px;
      text-align: center;
    }
    .btn-print {
      background: #059669;
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-print:hover {
      background: #047857;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="brand">
      <span class="logo-badge">SmartVest</span>
      <div>
        <h1>SmartVest Expense & Cash Flow Report</h1>
        <p>Audited Expenditure, Essentiality Breakdown & Investable Surplus Blueprint</p>
      </div>
    </div>
    <div class="meta-info">
      <div>Report Date: <strong>${escapeHtml(dateFormatted)}</strong></div>
      <div>Investor: <strong>${escapeHtml(userName)}</strong></div>
      <div>Selected Currency: <strong>${escapeHtml(currency)} (${escapeHtml(currencySymbol)})</strong></div>
      <div>Reporting Period: <strong>${escapeHtml(reportingMonth)}</strong></div>
    </div>
  </div>

  <!-- 1. EXECUTIVE CASH-FLOW SUMMARY -->
  <div class="section">
    <div class="section-title">
      <span>1. Executive Cash-Flow Summary</span>
    </div>
    <div class="grid-4">
      <div class="card">
        <div class="card-label">Monthly Inflow</div>
        <div class="card-value">${escapeHtml(formatCurrency(totalIncome))}</div>
        <div class="card-sub">Gross Cash Inflow</div>
      </div>
      <div class="card">
        <div class="card-label">Monthly Outflow</div>
        <div class="card-value highlight-red">${escapeHtml(formatCurrency(totalExpenses))}</div>
        <div class="card-sub">Burn Ratio: ${burnRate}%</div>
      </div>
      <div class="card">
        <div class="card-label">Investable Surplus</div>
        <div class="card-value highlight-emerald">${escapeHtml(formatCurrency(netSavings))}</div>
        <div class="card-sub">Deployable / month</div>
      </div>
      <div class="card">
        <div class="card-label">Savings Rate</div>
        <div class="card-value">${savingsRate}%</div>
        <div class="card-sub">Target ≥30%</div>
      </div>
    </div>
  </div>

  <!-- 2. ESSENTIALITY ALLOCATION (50 / 30 / 20 RULE) -->
  <div class="section">
    <div class="section-title">
      <span>2. Essentiality Allocation (50 / 30 / 20 Rule)</span>
    </div>
    <div class="grid-3">
      <div class="card">
        <div class="card-label">Needs (Core)</div>
        <div class="card-value">${escapeHtml(formatCurrency(needsTotal))}</div>
        <div class="card-sub">${needsPct}% (target ≤50%)</div>
      </div>
      <div class="card">
        <div class="card-label">Wants (Discretionary)</div>
        <div class="card-value">${escapeHtml(formatCurrency(wantsTotal))}</div>
        <div class="card-sub">${wantsPct}% (target ≤30%)</div>
      </div>
      <div class="card">
        <div class="card-label">Fixed Commitments</div>
        <div class="card-value">${escapeHtml(formatCurrency(fixedTotal))}</div>
        <div class="card-sub">${fixedPct}% (target ≤20%)</div>
      </div>
    </div>

    ${compoundingOpportunity ? `
    <div class="highlight-box">
      <strong>Compounding Opportunity:</strong> Trimming discretionary spend by 25% (${escapeHtml(formatCurrency(compoundingOpportunity.potentialMonthlySaved))}/mo) and redirecting into a 13.5% CAGR allocation could yield <strong>${escapeHtml(formatCurrency(compoundingOpportunity.futureCorpus20Yr))}</strong> in 20 years.
    </div>
    ` : ''}
  </div>

  <!-- 3. EXPENDITURE CATEGORY BREAKDOWN -->
  <div class="section">
    <div class="section-title">
      <span>3. Outflow by Expenditure Category</span>
    </div>
    ${activeCategories.length === 0 ? `
    <div class="empty-state-notice">No category outflows recorded.</div>
    ` : `
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Allocation Group</th>
          <th style="text-align: right;">Monthly Amount</th>
          <th style="text-align: right;">% of Total Outflow</th>
        </tr>
      </thead>
      <tbody>
        ${activeCategories.map(cat => `
        <tr>
          <td><strong>${escapeHtml(cat.label)}</strong></td>
          <td><span class="badge ${cat.group === 'Needs' ? 'badge-needs' : cat.group === 'Wants' ? 'badge-wants' : 'badge-fixed'}">${escapeHtml(cat.group)}</span></td>
          <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${escapeHtml(formatCurrency(cat.amount))}</td>
          <td style="text-align: right; font-family: 'JetBrains Mono', monospace;">${cat.pct}%</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    `}
  </div>

  <!-- 4. EXPENSE TRANSACTION REGISTER -->
  <div class="section">
    <div class="section-title">
      <span>4. Expense Transaction Register</span>
      <span style="font-size: 11px; color: #64748b; font-weight: 600;">Count: ${expenses.length}</span>
    </div>
    ${expenses.length === 0 ? `
    <p class="empty-state-notice">No expense transactions recorded.</p>
    ` : `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Type</th>
          <th style="text-align: right;">Amount</th>
          <th style="text-align: center;">Currency</th>
        </tr>
      </thead>
      <tbody>
        ${expenses.map(item => {
          const meta = categoryMeta[item.category] || { label: item.category, group: 'Wants' as const };
          return `
          <tr>
            <td style="white-space: nowrap; font-family: 'JetBrains Mono', monospace; font-size: 11px;">${escapeHtml(item.date || 'N/A')}</td>
            <td><strong>${escapeHtml(item.description || `${item.category} expense`)}</strong></td>
            <td>${escapeHtml(meta.label)}</td>
            <td><span class="badge ${meta.group === 'Needs' ? 'badge-needs' : meta.group === 'Wants' ? 'badge-wants' : 'badge-fixed'}">${escapeHtml(meta.group)}</span></td>
            <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${escapeHtml(formatCurrency(item.amount))}</td>
            <td style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 11px;">${escapeHtml(currency)}</td>
          </tr>
          `;
        }).join('')}
      </tbody>
    </table>
    `}
  </div>

  <!-- 5. FINANCIAL HEALTH INSIGHTS -->
  <div class="section">
    <div class="section-title">
      <span>5. Financial Health & Cash-Flow Insights</span>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-label">Savings Rate Status</div>
        <div class="card-value ${savingsRate >= 30 ? 'highlight-emerald' : ''}">${savingsRate}%</div>
        <div class="card-sub">${savingsRate >= 30 ? 'Meets or exceeds 30% surplus target.' : 'Below recommended 30% target.'}</div>
      </div>
      <div class="card">
        <div class="card-label">Burn Ratio (Living Outflows)</div>
        <div class="card-value ${burnRate > 70 ? 'highlight-red' : ''}">${burnRate}%</div>
        <div class="card-sub">${burnRate <= 70 ? 'Living outflows are well-controlled.' : 'Outflows consume over 70% of income.'}</div>
      </div>
      <div class="card">
        <div class="card-label">Essential vs Discretionary</div>
        <div class="card-value" style="font-size: 14px;">
          ${escapeHtml(formatCurrency(needsTotal + fixedTotal))} / ${escapeHtml(formatCurrency(wantsTotal))}
        </div>
        <div class="card-sub">Needs & Fixed: ${totalExpenses > 0 ? Math.round(((needsTotal + fixedTotal) / totalExpenses) * 100) : 0}% · Wants: ${totalExpenses > 0 ? Math.round((wantsTotal / totalExpenses) * 100) : 0}%</div>
      </div>
      <div class="card">
        <div class="card-label">Category Concentration</div>
        <div class="card-value" style="font-size: 14px;">
          ${topCategory ? `${escapeHtml(topCategory.label)} (${topCategory.pct}%)` : 'N/A'}
        </div>
        <div class="card-sub">${topCategory ? `Highest single outflow: ${escapeHtml(formatCurrency(topCategory.amount))}` : 'No outflows logged'}</div>
      </div>
    </div>
  </div>

  <!-- DISCLAIMER -->
  <div class="disclaimer">
    SmartVest is an advisory decision-support platform. This report summarizes user-entered expense and cash-flow information and is provided for planning and educational purposes.
  </div>

  <!-- ACTION BAR -->
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">
      Print / Save as PDF
    </button>
  </div>

  <script>
    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch (e) {
          // Ignore
        }
      }, 350);
    });
  </script>

</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  } catch {
    return false;
  }
}
