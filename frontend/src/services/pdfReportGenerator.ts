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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
        <h1>SmartVest AI Advisory Blueprint</h1>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">SEBI/SEC Compliant Strategic Investment Advisory Matrix</div>
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
    <strong>⚖️ Regulatory Compliance & Advisory Disclosure:</strong><br>
    SmartVest AI is an educational and independent strategic financial advisory platform. SmartVest is <strong>NOT a broker</strong> and does <strong>NOT execute trades</strong> or custody client funds. All investment recommendations should be executed directly through SEBI/SEC registered third-party brokerages (e.g. Groww, Zerodha, INDmoney, Upstox). Past market performance and CAGR compounding models do not guarantee future returns.
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
