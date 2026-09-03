# SmartVest — Technical Specifications & Mathematical Algorithms

---

## 1. Core Financial Algorithms (`strategyEngine.ts`)

### 1.1 Investable Cashflow Surplus & Buffer Allocation
$$\text{Total Monthly Inflow} = \text{Salary Income} + \text{Other Income}$$
$$\text{Total Monthly Expenses} = \sum_{k=1}^m \text{Expense}_k$$
$$\text{Raw Surplus} = \text{Total Monthly Inflow} - \text{Total Monthly Expenses}$$
$$\text{Investable Surplus} = \max(0, \text{Raw Surplus})$$
$$\text{Recommended Monthly SIP} = \text{Investable Surplus} \times 0.90$$
$$\text{Flexible Cash Buffer} = \text{Investable Surplus} \times 0.10$$

---

### 1.2 Emergency Runway & Resilience Scoring
$$\text{Emergency Coverage (Months)} = \frac{\text{Emergency Fund} + \text{Existing Savings}}{\text{Total Monthly Expenses}}$$
$$\text{Adequacy Rating} = \begin{cases} 
\text{Surplus / Robust}, & \text{Coverage} \ge 6 \text{ months} \\
\text{Moderate}, & 3 \le \text{Coverage} < 6 \text{ months} \\
\text{Inadequate / Deficit}, & \text{Coverage} < 3 \text{ months}
\end{cases}$$

---

### 1.3 Risk Capacity vs. Stated Risk Tolerance Matrix
$$\text{Savings Rate} = \frac{\text{Investable Surplus}}{\text{Total Monthly Inflow}} \times 100$$
$$\text{Risk Capacity Score} = \min(100, \text{Round}((\text{Savings Rate} \times 0.5) + (\text{Emergency Coverage} \times 8) + (\text{Horizon Years} \times 2)))$$
$$\text{Effective Risk Category} = \min(\text{Stated Risk Tolerance}, \text{Evaluated Risk Capacity})$$

*Rule*: If an investor indicates an "Aggressive" tolerance but has less than 2 months of emergency coverage, their Effective Risk Category is automatically constrained to "Conservative" to preserve downside capital safety.

---

### 1.4 Asset Allocation Bucketing Strategy
Allocations are assigned across 4 distinct functional buckets based on the effective risk category:

| Asset Class / Bucket | Target Instruments | Conservative Allocation | Moderate Allocation | Growth / Aggressive Allocation |
| :--- | :--- | :---: | :---: | :---: |
| **Core Domestic Growth** | Nifty 50 Index Fund, Active Flexi Cap | 30% | 45% | 55% |
| **Long-Term Alpha** | Nasdaq 100 ETF (`MON100`), Mid/Small Cap | 10% | 20% | 30% |
| **Inflation Hedges** | Sovereign Gold Bonds / Gold ETF (`GoldBeES`) | 15% | 15% | 10% |
| **Safety & Liquidity** | Corporate Debt, Liquid Fund, Arbitrage | 45% | 20% | 5% |

---

## 2. Scenario & Compounding Mathematics (`scenarioEngine.ts`)

### 2.1 Monthly Compounding with Annual Step-Up
Let $S_0$ be the initial monthly SIP, $g$ be the annual step-up percentage, $r$ be the annual expected return rate, and $Y$ be the investment horizon in years.
For each year $y \in [1, Y]$:
$$S_y = S_0 \times (1 + g)^{y-1}$$
$$\text{Monthly Rate } r_m = \frac{r}{12}$$
Within year $y$, for each month $m \in [1, 12]$:
$$C_{\text{new}} = (C_{\text{prev}} + S_y) \times (1 + r_m)$$

---

### 2.2 Inflation Purchasing Power Discounting
To determine the real value of the future nominal corpus $C_{\text{nominal}}$ in today's money under annual inflation $i$:
$$C_{\text{real}} = \frac{C_{\text{nominal}}}{(1 + i)^Y}$$

---

## 3. Portfolio Rebalancing Mathematics (`rebalancingEngine.ts`)

### 3.1 Allocation Drift & Threshold Categorization
Let $w_i^{\text{current}}$ be the current portfolio percentage and $w_i^{\text{target}}$ be the target blueprint percentage for asset $i$:
$$\Delta w_i = w_i^{\text{current}} - w_i^{\text{target}}$$
$$\text{Action}_i = \begin{cases}
\text{OVERWEIGHT}, & \Delta w_i > +T \\
\text{UNDERWEIGHT}, & \Delta w_i < -T \\
\text{ON\_TARGET}, & |\Delta w_i| \le T
\end{cases}$$
*(where $T \in \{1\%, 2\%, 5\%\}$ is the user-configured sensitivity threshold)*.

---

### 3.2 Overall Drift Score & Alignment Fit
$$\text{Overall Drift Score} = \frac{1}{2} \sum_{i=1}^k |\Delta w_i|$$
$$\text{Alignment Fit Score} = \max(0, \min(100, 100 - (\text{Overall Drift Score} \times 2)))$$

---

### 3.3 New-Contribution SIP Rebalancing Plan (Non-Liquidating)
Let $V_0$ be the current total portfolio value and $S_{\text{monthly}}$ be the new monthly SIP contribution.
Over a 1-year horizon, projected portfolio value is $V_{\text{future}} = V_0 + 12 \times S_{\text{monthly}}$.
For each asset $i$:
$$\text{Target Future Value } V_{i, \text{future}} = V_{\text{future}} \times \frac{w_i^{\text{target}}}{100}$$
$$\text{Deficit } D_i = \max(0, V_{i, \text{future}} - V_{i, \text{current}})$$
If $\sum D_i > 0$, the suggested monthly SIP to asset $i$ is:
$$\text{Suggested SIP}_i = S_{\text{monthly}} \times \frac{D_i}{\sum_{j=1}^k D_j}$$
*(Directs new inflows exclusively toward underweighted assets, eliminating forced selling and capital gains taxes)*.

---

## 4. Market Data Normalization Schema

Every quote object returned by the SmartVest market pipeline conforms to the strict TypeScript `MarketQuote` interface:

```typescript
export interface MarketQuote {
  symbol: string;
  name: string;
  exchange: string;
  assetType: 'STOCK' | 'INDEX' | 'MUTUAL_FUND' | 'ETF' | 'COMMODITY';
  price: number | null;
  currency: 'INR' | 'USD';
  change: number | null;
  changePct: number | null;
  volume: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  prevClose?: number | null;
  timestamp: string;
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'HOLIDAY';
  freshness: 'REALTIME' | 'DELAYED' | 'LATEST_AVAILABLE' | 'END_OF_DAY' | 'HISTORICAL' | 'MODEL_ASSUMPTION' | 'STALE' | 'UNAVAILABLE';
  status: 'LIVE' | 'DELAYED' | 'FALLBACK' | 'DEMO' | 'UNAVAILABLE';
  source: string;
  asOf: string;
  message?: string;
}
```
