/**
 * VestIQ Deterministic Finance Knowledge Engine
 * Broad library of typed finance concepts, comparisons, and macroeconomic relationships.
 * ZERO LLM calls, zero generative AI, strictly deterministic TypeScript.
 */

import type { FinanceDomain } from './vestiqQuestionParser';

export interface FinanceConcept {
  id: string;
  name: string;
  aliases: string[];
  domain: FinanceDomain;
  category: 'STOCKS' | 'MUTUAL_FUNDS' | 'ETF' | 'BONDS' | 'MARKETS' | 'MACRO' | 'PERSONAL_FINANCE' | 'CALCULATIONS';
  definition: string;
  howItWorks?: string[];
  whyItMatters?: string[];
  example?: string;
  keyPoints?: string[];
  risks?: string[];
  relatedConcepts?: string[];
  commonQuestions?: string[];
}

export interface ConceptComparison {
  id: string;
  concept1Id: string;
  concept2Id: string;
  name: string;
  aliases: string[];
  summary: string;
  differences: {
    aspect: string;
    concept1Value: string;
    concept2Value: string;
  }[];
  verdict: string;
}

export interface MacroRelationship {
  id: string;
  name: string;
  aliases: string[];
  driver: string;
  target: string;
  transmissionMechanics: string[];
  realWorldLimitation: string;
  example: string;
}

// ============================================================================
// 1. FINANCE CONCEPTS LIBRARY
// ============================================================================

export const FINANCE_CONCEPTS: FinanceConcept[] = [
  // --------------------------------------------------------------------------
  // STOCKS & EQUITIES
  // --------------------------------------------------------------------------
  {
    id: 'IPO',
    name: 'Initial Public Offering (IPO)',
    aliases: ['ipo', 'initial public offering', 'going public', 'public issue', 'listing on exchange', 'fresh issue', 'offer for sale'],
    domain: 'STOCKS',
    category: 'STOCKS',
    definition: 'An Initial Public Offering (IPO) is the process by which a private corporation sells shares of its stock to the general public for the first time to raise equity capital and list on a stock exchange.',
    howItWorks: [
      'The company hires merchant bankers/underwriters to audit financials, value the company, and file a draft prospectus (DRHP) with regulators (e.g. SEBI in India, SEC in US).',
      'A price band and lot size are announced, opening for retail and institutional bids over 3 to 5 business days.',
      'Shares are allotted based on demand; if oversubscribed, allotment occurs via a lottery or proportionate quota.',
      'Allotted shares begin trading openly on the secondary exchange (NSE, BSE, NYSE, NASDAQ).'
    ],
    whyItMatters: [
      'Provides companies with expansion capital and debt-reduction funds without incurring interest payments.',
      'Enables founders and early venture capital investors to monetize part of their holdings.',
      'Gives retail investors early access to participating in a company’s corporate growth trajectory.'
    ],
    example: 'A private tech startup valued at ₹1,000 Cr offers 20% of its equity to the public at ₹200 per share, raising ₹200 Cr in expansion capital.',
    keyPoints: [
      'Consists of Fresh Issue (new capital to the company) and/or Offer for Sale (OFS - existing shareholders selling their stakes).',
      'Retail investors can bid via ASBA (Application Supported by Blocked Amount) or UPI mandates.',
      'Listing price is determined by market demand on the morning of listing day.'
    ],
    risks: [
      'Listing gains are never guaranteed; overhyped IPOs with aggressive valuations often trade below their issue price.',
      'Limited public operational history compared to seasoned blue-chip enterprises.'
    ],
    relatedConcepts: ['MARKET_CAP', 'EPS', 'FREE_FLOAT', 'PE_RATIO'],
    commonQuestions: ['What is an IPO?', 'Explain IPO', 'IPO meaning', 'How does an IPO work?', 'What happens in an IPO?', 'How does a company go public?']
  },
  {
    id: 'EPS',
    name: 'Earnings Per Share (EPS)',
    aliases: ['eps', 'earnings per share', 'diluted eps', 'basic eps', 'per share earnings'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'Earnings Per Share (EPS) represents the portion of a company’s net profit allocated to each individual outstanding share of common stock.',
    howItWorks: [
      'Calculated as: `EPS = (Net Profit - Preferred Dividends) / Total Outstanding Common Shares`.',
      'Reported on both a Basic (existing shares) and Diluted (accounting for convertible bonds, ESOPs, and warrants) basis each quarter.',
      'A rising EPS over 3 to 5 years indicates healthy operational profitability and growing bottom-line efficiency.'
    ],
    whyItMatters: [
      'Primary metric for calculating Price-to-Earnings (P/E) valuation multiples.',
      'Allows apples-to-apples earnings comparison across companies regardless of share count variations.',
      'Drives long-term stock price appreciation because equity values track underlying earnings power.'
    ],
    example: 'If a company earns ₹100 Crores in net profit and has 10 Crore outstanding shares, its EPS is ₹10 per share.',
    keyPoints: [
      'Higher EPS reflects higher profitability per equity unit.',
      'Share buybacks can artificially boost EPS even if net profit is flat by reducing outstanding share count.'
    ],
    risks: [
      'One-time exceptional gains (e.g. selling a plant) can inflate EPS temporarily without operational growth.',
      'Always examine operating cash flow alongside accounting EPS.'
    ],
    relatedConcepts: ['PE_RATIO', 'REVENUE', 'EARNINGS', 'SHARE_BUYBACK'],
    commonQuestions: ['What is EPS?', 'Explain EPS', 'What does earnings per share mean?']
  },
  {
    id: 'PE_RATIO',
    name: 'Price-to-Earnings Ratio (P/E)',
    aliases: ['pe ratio', 'p/e', 'price to earnings', 'pe multiple', 'valuation multiple', 'trailing pe', 'forward pe'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'The Price-to-Earnings (P/E) ratio measures the relationship between a company’s current share price and its per-share earnings, showing how much investors are willing to pay for each rupee or dollar of annual earnings.',
    howItWorks: [
      'Calculated as: `P/E = Current Stock Price / Earnings Per Share (EPS)`.',
      'Trailing P/E uses historical 12-month net profits; Forward P/E uses consensus analyst forecasts for the next 12 months.',
      'High P/E typically indicates high future growth expectations; Low P/E can suggest value or underlying fundamental distress.'
    ],
    whyItMatters: [
      'Standard valuation baseline across equities within the same industry sector.',
      'Highlights whether a stock is trading at a premium or discount relative to peers and historical averages.',
      'Assists investors in avoiding overpaying for earnings growth.'
    ],
    example: 'A stock trading at ₹500 with an annual EPS of ₹25 has a P/E multiple of 20x (₹500 / ₹25).',
    keyPoints: [
      'Must always be compared within the same sector (e.g. comparing IT to IT, not IT to capital goods).',
      'Cyclical companies (steel, commodities) often have artificially low P/E at cycle peaks and high P/E at troughs.'
    ],
    risks: [
      'A low P/E might be a "value trap" indicating declining business prospects or governance risks.',
      'Negative P/E (when companies post net losses) cannot be evaluated meaningfully.'
    ],
    relatedConcepts: ['EPS', 'PB_RATIO', 'PEG_RATIO', 'MARKET_CAP'],
    commonQuestions: ['What is PE ratio?', 'What does P/E mean?', 'Explain price to earnings ratio', 'What is a high PE?']
  },
  {
    id: 'PB_RATIO',
    name: 'Price-to-Book Ratio (P/B)',
    aliases: ['pb ratio', 'p/b', 'price to book', 'price to book value', 'pb multiple'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'The Price-to-Book (P/B) ratio compares a company’s market market capitalization with its book value (net asset value per balance sheet).',
    howItWorks: [
      'Calculated as: `P/B = Current Share Price / Book Value Per Share (BVPS)`.',
      'Book value equals Total Assets minus Total Liabilities, representing theoretical liquidation value.',
      'P/B < 1 indicates the stock trades for less than the net book value of its balance sheet assets.'
    ],
    whyItMatters: [
      'Essential valuation metric for asset-heavy sectors such as commercial banks, NBFCs, real estate, and manufacturing.',
      'Identifies potential bargain opportunities when fundamentally sound banks trade near or below tangible book value.'
    ],
    example: 'A bank with net assets of ₹100 per share trading at ₹150 in the market has a P/B ratio of 1.5x.',
    keyPoints: [
      'Highly effective for financial institutions where book value closely reflects marked-to-market loans and securities.',
      'Less useful for technology and asset-light service companies whose value lies in intellectual property and software.'
    ],
    risks: [
      'Reported book value can be distorted by bad loans (NPAs) or obsolete physical inventory.',
      'Intangible assets may be written off, drastically reducing book equity.'
    ],
    relatedConcepts: ['BOOK_VALUE', 'PE_RATIO', 'ROE', 'DEBT_TO_EQUITY'],
    commonQuestions: ['What is PB ratio?', 'What is price to book?', 'When to use PB ratio?']
  },
  {
    id: 'MARKET_CAP',
    name: 'Market Capitalization',
    aliases: ['market cap', 'market capitalization', 'm-cap', 'company valuation', 'total market value'],
    domain: 'STOCKS',
    category: 'STOCKS',
    definition: 'Market Capitalization is the total aggregate market value of a publicly traded company’s outstanding equity shares.',
    howItWorks: [
      'Calculated as: `Market Cap = Total Outstanding Shares * Current Market Price Per Share`.',
      'Categorized into tiers: Large-Cap (top 100 companies by size), Mid-Cap (101st to 250th), and Small-Cap (251st onwards in India per SEBI).',
      'Fluctuates dynamically continuously throughout trading hours based on daily stock price movements.'
    ],
    whyItMatters: [
      'Determines index weighting in benchmark indices like NIFTY 50 and S&P 500.',
      'Reflects the company size, maturity stage, stability profile, and liquidity characteristics.',
      'Guides portfolio asset allocation based on investor risk tolerance.'
    ],
    example: 'A company with 10 Crore outstanding shares trading at ₹2,500 has a Market Capitalization of ₹25,000 Crores (Large-Cap).',
    keyPoints: [
      'Free-float market cap counts only shares freely tradable by public investors (excluding promoter/locked-in shares).',
      'Large caps offer stability and lower drawdowns; small caps offer higher growth potential with sharp volatility.'
    ],
    risks: [
      'High market cap does not guarantee immunity from structural corporate decline or cyclical recessions.'
    ],
    relatedConcepts: ['FREE_FLOAT', 'IPO', 'INDEX_FUND', 'PE_RATIO'],
    commonQuestions: ['What is market capitalization?', 'What is market cap?', 'How is market cap calculated?']
  },
  {
    id: 'DIVIDEND',
    name: 'Dividend',
    aliases: ['dividend', 'dividends', 'interim dividend', 'final dividend', 'payout', 'corporate dividend'],
    domain: 'STOCKS',
    category: 'STOCKS',
    definition: 'A Dividend is a direct payment made by a corporation to its shareholders out of accumulated post-tax profits or cash reserves.',
    howItWorks: [
      'The board of directors declares a dividend along with a Record Date and Ex-Dividend Date.',
      'Investors holding shares before the ex-dividend date receive direct cash credit into their registered bank accounts.',
      'On the ex-dividend date, the stock price typically adjusts downward by approximately the dividend payout amount.'
    ],
    whyItMatters: [
      'Provides regular passive income stream without requiring liquidation of underlying shares.',
      'Signals management confidence in steady operational cash flows and balance sheet liquidity.'
    ],
    example: 'If you hold 500 shares of TCS and the company declares a dividend of ₹28 per share, you receive ₹14,000 cash directly.',
    keyPoints: [
      'Dividends in India are taxable in the hands of the investor at their applicable marginal income tax slab rates.',
      'TDS of 10% is deducted by the company if annual dividend payout exceeds ₹5,000.'
    ],
    risks: [
      'Dividends are discretionary; boards can cut or suspend payouts during economic recessions or cash crunches.',
      'High dividend payout can indicate limited high-return internal reinvestment opportunities.'
    ],
    relatedConcepts: ['DIVIDEND_YIELD', 'EARNINGS', 'FREE_FLOAT'],
    commonQuestions: ['What is a dividend?', 'How do dividends work?', 'When are dividends paid?']
  },
  {
    id: 'DIVIDEND_YIELD',
    name: 'Dividend Yield',
    aliases: ['dividend yield', 'div yield', 'yield on stock', 'dividend return'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'Dividend Yield is a financial ratio that shows the annual dividend cash income paid by a stock relative to its current market share price.',
    howItWorks: [
      'Calculated as: `Dividend Yield = (Annual Dividend Per Share / Current Stock Price) * 100`.',
      'For example, a stock trading at ₹200 that paid ₹10 in total annual dividends has a dividend yield of 5.0%.',
      'Varies inversely with stock price: as price rises, yield drops, and vice versa.'
    ],
    whyItMatters: [
      'Measures the pure cash yield return component independent of capital appreciation.',
      'Key metric for income-focused portfolios, retirement corpus withdrawals, and defensive value investing.'
    ],
    example: 'A PSU utility stock trading at ₹100 paying ₹7 annual dividend provides a 7% annual dividend yield, comparable to a bank FD with potential equity upside.',
    keyPoints: [
      'Compare yield against sovereign bond yields and benchmark fixed deposits.',
      'Mature, cash-generative sectors (utilities, telecom, consumer FMCG, energy) typically boast higher yields than fast-growing tech firms.'
    ],
    risks: [
      'A suspiciously high dividend yield (>10%) often signals a collapsing stock price due to deteriorating business fundamentals ("dividend yield trap").'
    ],
    relatedConcepts: ['DIVIDEND', 'PE_RATIO', 'BOND_YIELD'],
    commonQuestions: ['What is dividend yield?', 'Explain dividend yield', 'How to calculate dividend yield?']
  },
  {
    id: 'STOCK_SPLIT',
    name: 'Stock Split',
    aliases: ['stock split', 'split shares', 'share split', 'split ratio', 'subdivision of shares'],
    domain: 'STOCKS',
    category: 'STOCKS',
    definition: 'A Stock Split is a corporate action in which a company divides its existing shares into multiple new shares to enhance market liquidity and make individual share prices more affordable to retail participants.',
    howItWorks: [
      'In a 1:2 split, each existing share is split into 2 shares, and the face value is halved (e.g. from ₹10 to ₹5).',
      'The market price per share automatically adjusts downward proportionally so total portfolio value remains unchanged.',
      'Total market capitalization, company valuation, and investor ownership percentage remain identical.'
    ],
    whyItMatters: [
      'Increases liquidity and trading activity on the exchange by lowering the per-unit hurdle price.',
      'Broadens the retail shareholder base without diluting existing owners.'
    ],
    example: 'You hold 100 shares of a company trading at ₹1,000 (total value ₹1,00,000). After a 1:2 split, you hold 200 shares trading at ₹500 (total value ₹1,00,000).',
    keyPoints: [
      'Creates no immediate fundamental financial value or wealth creation by itself.',
      'Does not trigger capital gains tax liability because no sale or transfer of capital occurs.'
    ],
    risks: [
      'Retail investors often mistakenly view splits as "free bonus gains", ignoring that intrinsic company value is unchanged.'
    ],
    relatedConcepts: ['BONUS_SHARES', 'MARKET_CAP', 'FREE_FLOAT'],
    commonQuestions: ['What is a stock split?', 'How does a stock split work?', 'Do I make money in a stock split?']
  },
  {
    id: 'BONUS_SHARES',
    name: 'Bonus Shares',
    aliases: ['bonus shares', 'bonus issue', 'free shares', 'scrip issue', 'capitalization of reserves'],
    domain: 'STOCKS',
    category: 'STOCKS',
    definition: 'Bonus Shares are additional shares issued free of charge by a company to its existing shareholders in proportion to their current shareholdings, funded by capitalizing accumulated company reserves.',
    howItWorks: [
      'Declared in a specified ratio (e.g. 1:1, meaning 1 free bonus share for every 1 share held).',
      'The company converts accumulated retained earnings/reserves on its balance sheet into share capital.',
      'Post-bonus, the stock price drops proportionally on the ex-bonus date, keeping total market capitalization and investor portfolio value constant.'
    ],
    whyItMatters: [
      'Demonstrates strong accumulated retained earnings and management confidence in business continuity.',
      'Increases share liquidity and floating stock in the secondary market.'
    ],
    example: 'You hold 100 shares of a firm trading at ₹800 (worth ₹80,000). After a 1:1 bonus issue, you hold 200 shares trading at ₹400 (worth ₹80,000).',
    keyPoints: [
      'Differs from stock splits: bonus shares do not change the face value of the stock; splits reduce the face value.',
      'Acquisition cost of bonus shares is treated as ₹0 for Indian capital gains tax purposes.'
    ],
    risks: [
      'EPS drops proportionally due to expanded equity base unless net profit rises commensurately.'
    ],
    relatedConcepts: ['STOCK_SPLIT', 'DIVIDEND', 'SHARE_BUYBACK'],
    commonQuestions: ['What are bonus shares?', 'Difference between bonus and stock split', 'How are bonus shares taxed?']
  },
  {
    id: 'SHARE_BUYBACK',
    name: 'Share Buyback',
    aliases: ['share buyback', 'stock buyback', 'repurchase of shares', 'tender offer buyback', 'open market buyback'],
    domain: 'STOCKS',
    category: 'STOCKS',
    definition: 'A Share Buyback is a corporate event in which a company uses its cash reserves to repurchase its own outstanding equity shares from shareholders, either via a tender offer or from the open market.',
    howItWorks: [
      'The company offers to buy back shares, usually at a premium to the prevailing market price.',
      'Repurchased shares are permanently extinguished (cancelled), decreasing the total outstanding share count.',
      'Because total earnings are distributed over fewer remaining shares, future EPS and Return on Equity (ROE) increase.'
    ],
    whyItMatters: [
      'Efficient mechanism for returning surplus cash to shareholders when the stock is undervalued.',
      'Prevents equity dilution from employee stock options (ESOPs) and boosts per-share metrics.'
    ],
    example: 'A company with 10 Crore shares buys back 1 Crore shares. Future profits are now split over only 9 Crore shares, raising EPS by 11.1% without extra revenue.',
    keyPoints: [
      'In India, buybacks are taxed under the revised regime directly in the hands of shareholders as deemed dividend income.',
      'Signals that management believes their own shares represent the best return on capital available.'
    ],
    risks: [
      'Can be misused by management to artificially inflate EPS to hit bonus milestones rather than investing in productive Capex.'
    ],
    relatedConcepts: ['EPS', 'DIVIDEND', 'ROE'],
    commonQuestions: ['What is a share buyback?', 'Why do companies buy back shares?', 'Is buyback better than dividend?']
  },
  {
    id: 'FREE_FLOAT',
    name: 'Free Float',
    aliases: ['free float', 'floating stock', 'public shareholding', 'free float market cap'],
    domain: 'STOCKS',
    category: 'STOCKS',
    definition: 'Free Float refers to the proportion and total number of a company’s outstanding shares that are freely available for trading by public investors in the open secondary market.',
    howItWorks: [
      'Calculated by taking total outstanding shares and subtracting strategic promoter holdings, government stakes, locked-in employee trusts, and insider shares.',
      'Major global and domestic market indices (NIFTY 50, S&P 500, MSCI) calculate index weights based on Free Float Market Cap, not total market cap.'
    ],
    whyItMatters: [
      'Determines real market liquidity and resilience against speculative price manipulation.',
      'High free float ensures smooth trading with tight bid-ask spreads and low impact costs.'
    ],
    example: 'A firm has ₹10,000 Cr total market cap, but promoters own 75%. The free-float market cap is only ₹2,500 Cr (25%).',
    keyPoints: [
      'SEBI mandates minimum 25% public shareholding for all listed Indian companies.',
      'Stocks with very low free float often experience sharp volatility and sudden price spikes or lockouts in circuits.'
    ],
    risks: [
      'Low free float increases liquidity risk during heavy sell-offs, causing wide slippage.'
    ],
    relatedConcepts: ['MARKET_CAP', 'LIQUIDITY', 'IPO'],
    commonQuestions: ['What is free float?', 'What is free float market capitalization?']
  },
  {
    id: 'BOOK_VALUE',
    name: 'Book Value',
    aliases: ['book value', 'net asset value of company', 'accounting value', 'tangible book value'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'Book Value is the net asset value of a company according to its official audited balance sheet, representing the total amount equity shareholders would receive if the company liquidated all assets and paid all debts.',
    howItWorks: [
      'Calculated as: `Book Value = Total Assets - Total Liabilities - Preferred Stock`.',
      '`Book Value Per Share (BVPS) = Total Book Value / Total Outstanding Common Shares`.',
      'Grows over time as the company earns profits and retains them as reserves rather than paying all out as dividends.'
    ],
    whyItMatters: [
      'Acts as a fundamental baseline floor for valuation, particularly in capital-intensive and banking sectors.',
      'Used directly in computing the Price-to-Book (P/B) ratio.'
    ],
    example: 'A manufacturing firm has ₹500 Cr in assets and ₹300 Cr in debt. Its book value is ₹200 Cr. With 2 Cr shares, BVPS is ₹100.',
    keyPoints: [
      'Represents historical cost accounting; may not reflect current market values of land, patents, or real estate.',
      'Software and digital firms often carry low book value despite possessing immense cash generation power.'
    ],
    risks: [
      'Book value can be abruptly wiped out if assets (e.g. loans or inventory) suffer sudden write-downs or impairments.'
    ],
    relatedConcepts: ['PB_RATIO', 'DEBT_TO_EQUITY', 'ROE'],
    commonQuestions: ['What is book value?', 'How is book value calculated?', 'Difference between market value and book value']
  },
  {
    id: 'EARNINGS',
    name: 'Earnings (Net Profit)',
    aliases: ['earnings', 'net profit', 'profit after tax', 'pat', 'bottom line', 'corporate net income'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'Earnings (also called Net Profit or Profit After Tax - PAT) is the net amount of profit a company retains after subtracting all operating expenses, cost of goods sold, interest, depreciation, and corporate income taxes from total revenue.',
    howItWorks: [
      'Appears as the ultimate "bottom line" on the quarterly and annual Profit & Loss (P&L) statement.',
      'Can be reinvested into expanding the business (retained earnings) or distributed to shareholders as dividends/buybacks.',
      'Sustained earnings growth is the single most verified historical driver of long-term share price performance.'
    ],
    whyItMatters: [
      'Direct measure of true commercial profitability and shareholder value creation.',
      'Serves as the numerator in EPS calculations and denominator in P/E ratios.'
    ],
    example: 'A company records ₹1,000 Cr in revenue, ₹700 Cr in operating costs, ₹50 Cr in interest, and ₹62.5 Cr in taxes, leaving ₹187.5 Cr in Earnings.',
    keyPoints: [
      'Evaluate whether earnings growth stems from revenue expansion (quality growth) or just cost-cutting (finite growth).',
      'Cross-verify operating cash flows against net earnings to detect aggressive accounting accruals.'
    ],
    risks: [
      'Accounting earnings can be managed via non-cash provisions and depreciation adjustments.'
    ],
    relatedConcepts: ['REVENUE', 'EBITDA', 'EPS', 'PE_RATIO'],
    commonQuestions: ['What are company earnings?', 'What is net profit?', 'Why do earnings matter for stock prices?']
  },
  {
    id: 'REVENUE',
    name: 'Revenue (Top Line)',
    aliases: ['revenue', 'turnover', 'gross sales', 'top line', 'net sales', 'gross revenue'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'Revenue (also called Top Line or Turnover) is the total gross dollar or rupee amount of income generated by a company from the sale of its goods or services before deducting any operating costs or taxes.',
    howItWorks: [
      'The starting figure at the top of the income statement (`Total Sales = Units Sold * Selling Price`).',
      'Revenue growth reflects market share expansion, customer demand, and product pricing power.',
      'Consistent revenue CAGR of 15%+ over 5 years indicates a strong underlying business franchise.'
    ],
    whyItMatters: [
      'Without top-line revenue growth, sustainable bottom-line earnings growth is impossible over the long term.',
      'Used in calculating Price-to-Sales (P/S) multiples for early-stage or high-growth tech companies.'
    ],
    example: 'An automobile firm sells 50,000 vehicles at an average price of ₹10 Lakhs each, generating ₹5,000 Crores in quarterly revenue.',
    keyPoints: [
      'Look for organic revenue growth driven by volume rather than one-time price hikes alone.',
      'Differentiate between recurring subscription revenue and cyclical one-off contract sales.'
    ],
    risks: [
      'High revenue growth with shrinking or negative profit margins destroys shareholder capital ("profitless prosperity").'
    ],
    relatedConcepts: ['EARNINGS', 'EBITDA', 'EPS'],
    commonQuestions: ['What is revenue?', 'Difference between revenue and profit', 'What is top line?']
  },
  {
    id: 'EBITDA',
    name: 'EBITDA',
    aliases: ['ebitda', 'operating cash profit', 'operating profit before depreciation', 'core operating profit'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortization. It evaluates pure operational profitability by removing the effects of capital financing structures, accounting policies, and tax jurisdictions.',
    howItWorks: [
      'Calculated as: `EBITDA = Operating Revenue - Operating Expenses` (excluding depreciation and amortization).',
      'Provides a clean view of cash generated solely by day-to-day business operations.',
      'Widely used in Enterprise Value (EV/EBITDA) multiples for comparing cross-border or debt-heavy companies.'
    ],
    whyItMatters: [
      'Allows unbiased comparison between companies with different debt levels or asset depreciation schedules.',
      'Key covenant metric used by commercial credit rating agencies and corporate lenders.'
    ],
    example: 'A telecom company with ₹10,000 Cr revenue spends ₹6,000 Cr on network operations, yielding ₹4,000 Cr EBITDA (40% EBITDA margin).',
    keyPoints: [
      'EBITDA Margin = `(EBITDA / Revenue) * 100`. Higher margins indicate pricing power and operational efficiency.'
    ],
    risks: [
      'Famously criticized by Warren Buffett: EBITDA ignores real capital expenditure costs required to maintain physical equipment and plant assets.'
    ],
    relatedConcepts: ['REVENUE', 'EARNINGS', 'DEBT_TO_EQUITY'],
    commonQuestions: ['What is EBITDA?', 'What does EBITDA stand for?', 'Why use EBITDA instead of net profit?']
  },
  {
    id: 'DEBT_TO_EQUITY',
    name: 'Debt-to-Equity Ratio',
    aliases: ['debt to equity', 'd/e', 'd/e ratio', 'leverage ratio', 'debt equity', 'financial leverage'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'The Debt-to-Equity (D/E) ratio measures the degree to which a company is financing its operations and capital expansion through borrowed funds versus wholly-owned shareholder equity.',
    howItWorks: [
      'Calculated as: `D/E = Total Debt / Total Shareholder Equity`.',
      'D/E < 0.5 indicates conservative, safe capital structure with low bankruptcy risk.',
      'D/E > 1.5 indicates significant financial leverage, making earnings sensitive to interest rate hikes or operational downturns.'
    ],
    whyItMatters: [
      'Critical solvency indicator: excessive debt is the number one cause of corporate bankruptcy during economic slowdowns.',
      'Companies with zero debt (Debt-Free) possess superior resilience during severe recessions.'
    ],
    example: 'A company with ₹200 Cr in bank loans and ₹400 Cr in shareholder net worth has a healthy D/E ratio of 0.5x.',
    keyPoints: [
      'Capital-intensive infrastructure, telecom, and real estate sectors naturally carry higher D/E than IT or FMCG.',
      'Banks and NBFCs are excluded from standard D/E comparisons because debt (deposits/borrowing) is their core operational raw material.'
    ],
    risks: [
      'High leverage magnifies losses during revenue declines, as fixed interest payments must still be serviced.'
    ],
    relatedConcepts: ['BOOK_VALUE', 'ROE', 'EARNINGS'],
    commonQuestions: ['What is debt to equity ratio?', 'What is a good debt to equity ratio?', 'Why does debt matter in stocks?']
  },
  {
    id: 'DEMAT_ACCOUNT',
    name: 'Demat Account',
    aliases: ['demat account', 'dematerialized account', 'demat', 'trading account', 'depository account'],
    domain: 'PERSONAL_FINANCE',
    category: 'STOCKS',
    definition: 'A Demat (Dematerialized) Account is an electronic repository that holds an investor’s financial securities (shares, bonds, mutual funds, government securities, ETFs) in safe digital format rather than physical paper certificates.',
    howItWorks: [
      'Opened through registered Depository Participants (DPs) such as Zerodha, Groww, Angel One, ICICI Direct, or HDFC Securities.',
      'Maintained by central national depositories (NSDL or CDSL in India).',
      'Works seamlessly with your Trading Account (used to execute buy/sell orders) and your Bank Account (used to transfer funds).'
    ],
    whyItMatters: [
      'Legally mandatory in India to buy, hold, or sell equity shares and ETFs.',
      'Eliminated physical certificate forgery, theft, loss, delays, and stamp duty complications.'
    ],
    example: 'When you buy 10 shares of Infosys on your broker app, the funds leave your bank account, the trade executes via the exchange, and within 1 business day (T+1 settlement), the 10 shares are credited to your Demat Account at CDSL/NSDL.',
    keyPoints: [
      'T+1 rolling settlement cycle in India: shares enter your demat account within 24 hours of execution.',
      'Investors can link a single bank account to multiple Demat accounts across different brokers.'
    ],
    risks: [
      'Brokers charge annual maintenance charges (AMC) and DP transaction charges upon selling shares.'
    ],
    relatedConcepts: ['IPO', 'MUTUAL_FUND', 'ETF'],
    commonQuestions: ['What is a demat account?', 'How does a demat account work?', 'Difference between trading and demat account']
  },
  {
    id: 'MOAT',
    name: 'Economic Moat',
    aliases: ['moat', 'economic moat', 'competitive advantage', 'wide moat', 'narrow moat', 'pricing power'],
    domain: 'FUNDAMENTAL_ANALYSIS',
    category: 'STOCKS',
    definition: 'An Economic Moat is a company’s distinct, durable competitive advantage that protects its market share, pricing power, and long-term profitability from being eroded by competing firms.',
    howItWorks: [
      'Popularized by Warren Buffett, drawing an analogy to a medieval water-filled moat protecting a castle.',
      'Sources of moats include: Network Effects (Visa, Apple), High Switching Costs (SAP, Oracle), Cost Advantages (Costco, Reliance Jio), Intangible Assets/Brands (Coca-Cola, Titan), and Government Licenses/Regulations.'
    ],
    whyItMatters: [
      'Allows companies to sustain high Return on Equity (ROE) and capital returns over decades without mean-reverting.',
      'Enables companies to raise prices during inflationary spikes without losing customer demand.'
    ],
    example: 'Apple possesses a wide moat through its integrated hardware/software ecosystem; users find it friction-heavy and costly to switch to Android.',
    keyPoints: [
      'A wide moat does not mean an enterprise can never fail; technological disruptions can bridge ancient moats.',
      'Look for persistent 15%+ ROE and stable gross profit margins as quantitative evidence of an economic moat.'
    ],
    risks: [
      'Overpaying for a wide-moat company when its P/E multiple is unreasonably stretched.'
    ],
    relatedConcepts: ['ROE', 'PE_RATIO', 'EARNINGS'],
    commonQuestions: ['What is an economic moat?', 'What is a moat in investing?', 'Examples of economic moat']
  },

  // --------------------------------------------------------------------------
  // MUTUAL FUNDS & PASSIVE INVESTING
  // --------------------------------------------------------------------------
  {
    id: 'MUTUAL_FUND',
    name: 'Mutual Fund',
    aliases: ['mutual fund', 'mutual funds', 'amc', 'mf', 'open ended fund', 'equity fund', 'debt fund'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'A Mutual Fund is an investment vehicle that pools money from thousands of retail and institutional investors to purchase a professionally managed, diversified portfolio of stocks, bonds, or money market instruments.',
    howItWorks: [
      'Managed by a professional Asset Management Company (AMC) and regulated fund managers.',
      'Investors own proportional "units" representing their stake in the aggregate portfolio.',
      'The portfolio value is calculated at the end of each trading day to determine the Net Asset Value (NAV).'
    ],
    whyItMatters: [
      'Provides instant portfolio diversification starting with as little as ₹100 or ₹500.',
      'Eliminates the requirement for individual investors to conduct exhaustive balance-sheet research on hundreds of stocks.'
    ],
    example: 'An equity mutual fund pools ₹5,000 Crores across 1,00,000 investors and holds 60 vetted stocks across banking, IT, healthcare, and auto.',
    keyPoints: [
      'Categorized into Equity (growth), Debt (capital preservation/income), and Hybrid (balanced).',
      'Choose between Direct plans (lower expense, higher return) and Regular plans (via broker/agent with commissions).'
    ],
    risks: [
      'Returns fluctuate with underlying market conditions; capital is not guaranteed unlike bank fixed deposits.'
    ],
    relatedConcepts: ['SIP', 'NAV', 'EXPENSE_RATIO', 'INDEX_FUND', 'DIRECT_PLAN'],
    commonQuestions: ['What is a mutual fund?', 'How do mutual funds work?', 'Are mutual funds safe?']
  },
  {
    id: 'SIP',
    name: 'Systematic Investment Plan (SIP)',
    aliases: ['sip', 'systematic investment plan', 'monthly sip', 'regular investing', 'disciplined investing'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'A Systematic Investment Plan (SIP) is a disciplined facility offered by mutual funds allowing investors to automatically invest a predetermined fixed sum of money at regular intervals (monthly or weekly) into a chosen scheme.',
    howItWorks: [
      'Funds are automatically debited from your linked bank account on a fixed date each month.',
      'Utilizes Rupee Cost Averaging: buys more units when prices fall and fewer units when prices rise, smoothing out market volatility.',
      'Harnesses the compounding principle by consistently reinvesting gains over multi-year horizons.'
    ],
    whyItMatters: [
      'Removes the psychological urge to time market peaks and troughs.',
      'Builds financial discipline and turns small savings into substantial long-term wealth.'
    ],
    example: 'Investing ₹5,000 every month for 15 years at an assumed 12% CAGR yields a total corpus of approx ₹25.2 Lakhs on an invested principal of ₹9 Lakhs.',
    keyPoints: [
      'Can be paused, stepped up (Top-up SIP), or stopped at any time without penalty in open-ended schemes.',
      'Mathematical compounding formula: `FV = P * [ ((1+i)^n - 1) / i ] * (1+i)`.'
    ],
    risks: [
      'In a prolonged multi-year bear market, SIP portfolio values may temporarily drop below invested principal.'
    ],
    relatedConcepts: ['LUMPSUM', 'MUTUAL_FUND', 'COMPOUNDING', 'CAGR'],
    commonQuestions: ['What is a SIP?', 'How does SIP work?', 'SIP vs lumpsum', 'Can I stop SIP anytime?']
  },
  {
    id: 'LUMPSUM',
    name: 'Lumpsum Investment',
    aliases: ['lumpsum', 'lump sum', 'one time investment', 'bulk investment'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'A Lumpsum Investment is the commitment of a large single block of capital in one single transaction into a mutual fund scheme, stock, or bond, rather than spreading it across regular installments.',
    howItWorks: [
      'The entire capital amount is deployed on day one at the prevailing Net Asset Value (NAV) or stock price.',
      'All invested capital immediately begins compounding and participating in market upside from that session forward.'
    ],
    whyItMatters: [
      'Historically outperforms staggered investing in secular bull markets because capital spends maximum time compounded.',
      'Suitable when receiving a windfall (bonus, property sale, inheritance, retirement gratuity).'
    ],
    example: 'Investing ₹5,00,000 at once into an index fund after receiving an annual corporate bonus.',
    keyPoints: [
      'Can be paired with a Systematic Transfer Plan (STP) into equity funds to mitigate timing risk if markets are near historic valuation highs.'
    ],
    risks: [
      'Timing risk: deploying a large lumpsum right before a major market correction can lead to painful short-term drawdowns.'
    ],
    relatedConcepts: ['SIP', 'MUTUAL_FUND', 'DOLLAR_COST_AVERAGING'],
    commonQuestions: ['What is lumpsum?', 'SIP vs lumpsum which is better?', 'When should I invest lumpsum?']
  },
  {
    id: 'NAV',
    name: 'Net Asset Value (NAV)',
    aliases: ['nav', 'net asset value', 'fund unit price', 'mutual fund nav'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'Net Asset Value (NAV) is the per-unit market value of a mutual fund scheme, calculated by taking the total value of all underlying securities minus liabilities, divided by total outstanding units.',
    howItWorks: [
      'Calculated once daily by the AMC at the close of every trading session (usually by 9:00 PM IST).',
      '`NAV = (Total Market Value of Assets - Liabilities & Expenses) / Total Units Outstanding`.',
      'Purchases and redemptions are processed at the declared closing NAV.'
    ],
    whyItMatters: [
      'The definitive benchmark price at which investors buy or sell mutual fund units.',
      'Measures historical fund performance by tracking NAV growth over time.'
    ],
    example: 'If a fund manages ₹1,000 Cr in assets, has ₹10 Cr in liabilities, and 10 Cr units, its NAV is ₹99 per unit (₹990 Cr / 10 Cr).',
    keyPoints: [
      'Common myth: A fund with ₹20 NAV is NOT "cheaper" or better than a fund with ₹200 NAV. Both appreciate at the exact percentage rate of the underlying portfolio.',
      'High NAV simply indicates that a scheme has been compounding successfully over many years.'
    ],
    risks: [
      'NAV reflects closing prices and does not fluctuate second-by-second during intraday hours unlike stock prices.'
    ],
    relatedConcepts: ['MUTUAL_FUND', 'EXPENSE_RATIO', 'AUM'],
    commonQuestions: ['What is NAV?', 'Does lower NAV mean higher return?', 'How is NAV calculated?']
  },
  {
    id: 'EXPENSE_RATIO',
    name: 'Total Expense Ratio (TER)',
    aliases: ['expense ratio', 'ter', 'total expense ratio', 'fund management fee', 'fund charges'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'The Total Expense Ratio (TER) is the annual percentage of a mutual fund’s total assets that is deducted by the AMC to cover management fees, administrative expenses, auditing, and marketing costs.',
    howItWorks: [
      'Deducted automatically and proportionately on a daily basis before declaring the scheme’s daily NAV.',
      'SEBI imposes regulatory caps on expense ratios in India based on the total AUM of the scheme.',
      'Direct plans carry lower expense ratios (typically 0.1% to 0.8%) because they bypass distributor commissions; Regular plans carry higher expense ratios (1.0% to 2.2%).'
    ],
    whyItMatters: [
      'Directly reduces your net investment returns compounded over time.',
      'A 1% higher expense ratio over 25 years can consume up to 20% to 25% of your total potential final retirement wealth.'
    ],
    example: 'On an investment of ₹10 Lakhs in a fund with 1.5% expense ratio, ₹15,000 per year is deducted by the AMC for operational overhead.',
    keyPoints: [
      'Passive index funds and ETFs feature ultra-low expense ratios (often 0.05% to 0.20%).',
      'Always verify that active fund managers are generating enough alpha over their benchmark to justify higher fees.'
    ],
    risks: [
      'Underperforming active funds with high expense ratios erode investor capital relative to low-cost passive indices.'
    ],
    relatedConcepts: ['DIRECT_PLAN', 'REGULAR_PLAN', 'INDEX_FUND', 'NAV'],
    commonQuestions: ['What is expense ratio?', 'Why is direct plan expense ratio lower?', 'How does expense ratio affect returns?']
  },
  {
    id: 'AUM',
    name: 'Assets Under Management (AUM)',
    aliases: ['aum', 'assets under management', 'fund size', 'scheme corpus', 'total managed assets'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'Assets Under Management (AUM) is the total cumulative market value of financial assets that an investment company, mutual fund scheme, or wealth management institution currently manages on behalf of its clients.',
    howItWorks: [
      'Grows via two channels: net capital inflows from new and existing investors, and capital appreciation of underlying portfolio securities.',
      'Decreases when investors redeem units or when market security prices fall.'
    ],
    whyItMatters: [
      'Indicates fund size, institutional credibility, investor trust, and scheme liquidity.',
      'Large AUM in large-cap funds lowers impact costs; however, in small-cap funds, excessively bloated AUM can restrict the manager’s ability to enter and exit micro-cap stocks.'
    ],
    example: 'HDFC AMC manages over ₹6,00,000 Crores in total AUM across equity, debt, and liquid schemes.',
    keyPoints: [
      'Economy of scale: larger AUM generally forces the expense ratio down under SEBI slab-rate regulations.',
      'In small-cap schemes, monitor whether bloated AUM forces the manager to hold large-cap stocks or sit on heavy cash piles.'
    ],
    risks: [
      'Massive sudden outflows during market panic can force fund managers to sell liquid securities, affecting remaining holders.'
    ],
    relatedConcepts: ['MUTUAL_FUND', 'EXPENSE_RATIO', 'NAV'],
    commonQuestions: ['What is AUM?', 'What does assets under management mean?', 'Does higher AUM mean better fund?']
  },
  {
    id: 'DIRECT_PLAN',
    name: 'Direct Plan (Mutual Funds)',
    aliases: ['direct plan', 'direct mutual fund', 'direct growth', 'direct vs regular'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'A Direct Plan is a mutual fund scheme option purchased directly from the AMC or via direct execution platforms (e.g. Zerodha Coin, Groww, CAMS) without involving any distributor, agent, or intermediary.',
    howItWorks: [
      'Contains zero distributor commissions or trail commissions built into the fees.',
      'Has a substantially lower Total Expense Ratio (TER) than the identical scheme’s Regular Plan.',
      'Has a higher NAV and delivers 0.5% to 1.5% higher annualized returns every single year.'
    ],
    whyItMatters: [
      'Over a 15 to 25 year investment horizon, compounding that extra 1.0% annual difference creates Lakhs or Crores in additional wealth for the exact same underlying portfolio risk.',
      'The modern standard for self-directed and fiduciary-guided investors.'
    ],
    example: 'Investing ₹10,000 monthly for 20 years at 13% in a Direct Plan yields ₹1.15 Cr, while a Regular Plan delivering 11.5% yields ₹96.7 Lakhs — a ₹18.3 Lakh difference for zero extra risk.',
    keyPoints: [
      'Both Direct and Regular plans hold the exact same stocks, managed by the same fund manager, under the same portfolio mandate.'
    ],
    risks: [
      'Self-directed investors must handle their own scheme selection and portfolio rebalancing.'
    ],
    relatedConcepts: ['REGULAR_PLAN', 'EXPENSE_RATIO', 'MUTUAL_FUND'],
    commonQuestions: ['What is a direct plan?', 'Difference between direct and regular mutual fund', 'Why are direct plans better?']
  },
  {
    id: 'REGULAR_PLAN',
    name: 'Regular Plan (Mutual Funds)',
    aliases: ['regular plan', 'regular mutual fund', 'regular plan commission', 'distributor plan'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'A Regular Plan is a mutual fund scheme option purchased through an intermediary, broker, mutual fund distributor (MFD), or bank.',
    howItWorks: [
      'Includes an ongoing annual trail commission (typically 0.5% to 1.5%) paid by the AMC to the distributor out of your fund assets for as long as you stay invested.',
      'Has a higher Total Expense Ratio (TER) and a lower daily NAV than the corresponding Direct Plan.'
    ],
    whyItMatters: [
      'Compensates distributors and relationship managers for providing onboarding assistance, paperwork handling, and financial planning advice.',
      'Important to understand so investors can assess whether the intermediary’s ongoing advice justifies the long-term compounding cost.'
    ],
    example: 'If your bank sells you a mutual fund, it is almost always a Regular Plan where the bank earns an ongoing trail commission from your portfolio every month.',
    keyPoints: [
      'Investors can switch existing holdings from Regular Plans to Direct Plans via their fund portal or registrars (CAMS/KFintech), bearing in mind applicable exit loads and capital gains tax.'
    ],
    risks: [
      'Ongoing distributor trail commissions erode long-term compounding returns without any performance guarantee.'
    ],
    relatedConcepts: ['DIRECT_PLAN', 'EXPENSE_RATIO', 'MUTUAL_FUND'],
    commonQuestions: ['What is a regular plan?', 'Why avoid regular mutual funds?', 'How to switch from regular to direct?']
  },
  {
    id: 'INDEX_FUND',
    name: 'Index Fund',
    aliases: ['index fund', 'index funds', 'passive fund', 'nifty index fund', 'sp500 index fund', 'passive investing'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'An Index Fund is a passively managed mutual fund that mirrors the composition and performance of a specific benchmark market index (such as NIFTY 50, Sensex, or S&P 500) by holding the exact same securities in identical proportions.',
    howItWorks: [
      'No active fund manager picking individual stocks or attempting to forecast market timing.',
      'Automated rebalancing occurs whenever the official index provider reconstitutes its constituent weights.',
      'Transacts at end-of-day NAV like a standard mutual fund, without requiring a Demat account.'
    ],
    whyItMatters: [
      'Over 80% of actively managed large-cap mutual funds fail to outperform standard benchmark index funds over 10+ year horizons after deducting active management fees (SPIVA reports).',
      'Features rock-bottom expense ratios (often 0.10% to 0.20%).'
    ],
    example: 'A NIFTY 50 Index Fund holds all 50 stocks of the NIFTY index in exact proportion (Reliance ~10%, HDFC Bank ~11%, etc.), matching the index performance minus minor tracking error.',
    keyPoints: [
      'Zero style drift: guaranteed to deliver market returns without relying on star fund manager discretion.',
      'Ideal core foundational building block for beginner and conservative long-term portfolios.'
    ],
    risks: [
      'Full downside exposure: index funds fall exactly as much as the overall market during deep bear market crashes.'
    ],
    relatedConcepts: ['ETF', 'TRACKING_ERROR', 'EXPENSE_RATIO', 'MUTUAL_FUND'],
    commonQuestions: ['What is an index fund?', 'Index fund vs mutual fund', 'Why invest in index funds?']
  },
  {
    id: 'ELSS',
    name: 'Equity Linked Savings Scheme (ELSS)',
    aliases: ['elss', 'tax saving mutual fund', 'equity linked savings scheme', '80c mutual fund', 'tax saver fund'],
    domain: 'MUTUAL_FUNDS',
    category: 'MUTUAL_FUNDS',
    definition: 'An Equity Linked Savings Scheme (ELSS) is a diversified equity mutual fund category in India that qualifies for income tax deductions up to ₹1.5 Lakhs annually under Section 80C of the Income Tax Act, featuring a mandatory 3-year lock-in period.',
    howItWorks: [
      'Invests a minimum of 80% of its total portfolio in listed equity shares across large, mid, and small-cap companies.',
      'Each investment installment (whether lumpsum or monthly SIP) is locked in for exactly 36 months from the date of unit allotment.',
      'After 3 years, units can be redeemed freely or held indefinitely to continue compounding.'
    ],
    whyItMatters: [
      'Shortest lock-in period (3 years) among all tax-saving instruments under Section 80C (compared to PPF 15 years, Tax FD 5 years, NPS until 60).',
      'Historically generates superior inflation-beating wealth returns compared to fixed-income tax options.'
    ],
    example: 'Investing ₹1,50,000 in an ELSS fund reduces your taxable income under the old tax regime by ₹1,50,000, saving up to ₹46,800 in taxes for someone in the 30% slab.',
    keyPoints: [
      'Applicable primarily under the Old Tax Regime in India; the New Tax Regime does not offer Section 80C deductions.',
      'In monthly SIPs, each monthly installment has its own independent 3-year lock-in countdown.'
    ],
    risks: [
      'Capital is subject to equity market volatility and cannot be accessed before the 3-year lock-in expires.'
    ],
    relatedConcepts: ['MUTUAL_FUND', 'SIP', 'TAX_BASICS'],
    commonQuestions: ['What is ELSS?', 'Lock in period for ELSS', 'ELSS vs PPF', 'How is ELSS taxed?']
  },

  // --------------------------------------------------------------------------
  // EXCHANGE TRADED FUNDS (ETFs)
  // --------------------------------------------------------------------------
  {
    id: 'ETF',
    name: 'Exchange Traded Fund (ETF)',
    aliases: ['etf', 'exchange traded fund', 'etfs', 'gold etf', 'nifty etf', 'index etf', 'liquid etf'],
    domain: 'ETFS',
    category: 'ETF',
    definition: 'An Exchange Traded Fund (ETF) is an investment fund holding a diversified basket of underlying assets (stocks, bonds, or commodities like gold) that trades continuously on stock exchanges throughout the trading day at live market prices, just like an individual stock.',
    howItWorks: [
      'Bought and sold through any standard demat/trading brokerage account during normal market hours.',
      'Authorized Participants (APs) create and redeem units in large institutional creation blocks, keeping market prices tightly aligned with real-time Indicative Net Asset Value (iNAV).',
      'Delivers immediate intraday execution and limit-order flexibility.'
    ],
    whyItMatters: [
      'Combines the broad diversification of an open-ended mutual fund with the real-time liquidity and trading flexibility of an equity share.',
      'Usually carries even lower expense ratios than index mutual funds.'
    ],
    example: 'Buying 100 units of NIFTYBEES on the NSE at 11:30 AM gives you instant real-time proportional ownership of all 50 NIFTY companies.',
    keyPoints: [
      'Requires an active Demat and Trading account to purchase.',
      'Available across equities (NiftyBees, JuniorBees), commodities (GoldBees, SilverBees), and fixed income (Bharat Bond, LiquidBees).'
    ],
    risks: [
      'Low-volume niche ETFs can suffer from illiquidity, causing market execution prices to deviate significantly from actual iNAV.'
    ],
    relatedConcepts: ['INDEX_FUND', 'TRACKING_ERROR', 'ETF_LIQUIDITY', 'MUTUAL_FUND'],
    commonQuestions: ['What is an ETF?', 'Explain ETF', 'Difference between ETF and mutual fund', 'How to buy an ETF?']
  },
  {
    id: 'TRACKING_ERROR',
    name: 'Tracking Error',
    aliases: ['tracking error', 'etf tracking error', 'tracking difference', 'index tracking divergence'],
    domain: 'ETFS',
    category: 'ETF',
    definition: 'Tracking Error is the statistical measure (annualized standard deviation) of the divergence between the price returns of an ETF or Index Fund and the actual returns of the benchmark index it aims to replicate.',
    howItWorks: [
      'Measures consistency: how faithfully the fund mirrors its underlying index over daily, monthly, and yearly intervals.',
      'Caused by: fund management expense ratios, cash drag (holding cash for redemptions), transaction costs, and corporate dividend timing differences.'
    ],
    whyItMatters: [
      'The single most important quality metric when evaluating passive index funds and ETFs: lower tracking error means superior index replication quality.'
    ],
    example: 'If NIFTY 50 gains 15.0% and an index fund gains 14.8%, the 0.2% return shortfall reflects tracking difference, while the variance in daily deviations measures tracking error.',
    keyPoints: [
      'A great index fund should have a Tracking Error close to 0.05% to 0.15%.',
      'Distinguish Tracking Error (volatility of excess return) from Tracking Difference (cumulative return gap).'
    ],
    risks: [
      'High tracking error in niche thematic ETFs erodes the primary benefit of passive investing.'
    ],
    relatedConcepts: ['ETF', 'INDEX_FUND', 'EXPENSE_RATIO'],
    commonQuestions: ['What is tracking error?', 'Why does tracking error happen?', 'How to choose best index fund using tracking error?']
  },
  {
    id: 'ETF_LIQUIDITY',
    name: 'ETF Liquidity',
    aliases: ['etf liquidity', 'trading volume in etf', 'etf bid ask spread', 'market maker in etf'],
    domain: 'ETFS',
    category: 'ETF',
    definition: 'ETF Liquidity refers to the ease and speed with which an investor can buy or sell ETF units on an exchange without triggering substantial adverse price slippage away from the fund’s intrinsic Net Asset Value.',
    howItWorks: [
      'Composed of two tiers: Primary Market Liquidity (provided by institutional Authorized Participants creating/redeeming units) and Secondary Market Liquidity (daily screen trading volume between investors).',
      'High liquidity is signaled by narrow bid-ask spreads and tight alignment with real-time iNAV.'
    ],
    whyItMatters: [
      'Illiquid ETFs can force retail investors to buy at an unjustified premium or sell at a severe discount to real NAV.'
    ],
    example: 'A large liquid ETF like NiftyBees trades millions of shares daily with a ₹0.05 spread, whereas a micro-cap sector ETF might trade only 500 shares with a wide ₹3.00 spread.',
    keyPoints: [
      'Always use Limit Orders rather than Market Orders when trading ETFs to prevent executing at bad prices.'
    ],
    risks: [
      'During sudden flash crashes, ETF liquidity can evaporate momentarily if market makers withdraw quotes.'
    ],
    relatedConcepts: ['ETF', 'LIQUIDITY', 'NAV'],
    commonQuestions: ['What is ETF liquidity?', 'Why do ETFs trade at a premium or discount?']
  },

  // --------------------------------------------------------------------------
  // BONDS & FIXED INCOME
  // --------------------------------------------------------------------------
  {
    id: 'BOND',
    name: 'Bond',
    aliases: ['bond', 'bonds', 'fixed income security', 'debt security', 'debenture', 'government security'],
    domain: 'FIXED_INCOME',
    category: 'BONDS',
    definition: 'A Bond is a fixed-income debt instrument representing an investor’s formal loan to a borrower (typically a sovereign government or corporation) in exchange for regular periodic interest payments and full principal repayment at maturity.',
    howItWorks: [
      'Has a Face Value (principal par value, e.g. ₹1,000 or ₹100), a Coupon Rate (interest rate), and a Maturity Date.',
      'The borrower pays periodic interest (annually or semi-annually) throughout the term.',
      'Upon reaching the maturity date, the borrower repays the initial principal face value back to the bondholder.'
    ],
    whyItMatters: [
      'Provides portfolio stability, capital preservation, and predictable cash flow.',
      'Acts as a defensive cushion during equity market bear crashes due to low correlation with equities.'
    ],
    example: 'Buying a 10-year Government of India bond with face value ₹10,000 and 7.1% coupon pays you ₹710 interest every year for 10 years, returning your ₹10,000 principal in full at maturity.',
    keyPoints: [
      'Bonds are tradable on secondary exchanges; market prices fluctuate inversely with benchmark interest rates.',
      'Issued by governments (zero default risk) or private corporations (varying credit risk).'
    ],
    risks: [
      'Interest Rate Risk: when prevailing interest rates rise, existing bond market prices fall.',
      'Credit/Default Risk: corporate issuers can default on interest or principal obligations.'
    ],
    relatedConcepts: ['COUPON', 'BOND_YIELD', 'DURATION', 'CREDIT_RISK', 'FIXED_DEPOSIT'],
    commonQuestions: ['What is a bond?', 'How do bonds work?', 'Difference between stocks and bonds', 'Are bonds safe?']
  },
  {
    id: 'COUPON',
    name: 'Coupon Rate',
    aliases: ['coupon', 'coupon rate', 'bond coupon', 'nominal yield', 'stated interest rate'],
    domain: 'FIXED_INCOME',
    category: 'BONDS',
    definition: 'The Coupon Rate is the fixed annual interest rate that a bond issuer contractually pledges to pay to bondholders, expressed as an annual percentage of the bond’s nominal face value.',
    howItWorks: [
      'Remains fixed throughout the lifespan of a standard fixed-rate bond regardless of secondary market price changes.',
      'Annual payment = `Face Value * Coupon Rate`. Paid annually, semi-annually, or quarterly.'
    ],
    whyItMatters: [
      'Determines the contractual cash flow payout generated by the fixed-income asset.'
    ],
    example: 'A bond with ₹1,000 face value and an 8% coupon pays ₹80 annual interest (or ₹40 every six months).',
    keyPoints: [
      'Zero-coupon bonds pay no periodic interest; they are issued at a deep discount to face value and redeemed at par upon maturity.'
    ],
    risks: [
      'Inflation Risk: a fixed 6% coupon loses real purchasing power if consumer inflation accelerates to 7% or 8%.'
    ],
    relatedConcepts: ['BOND', 'BOND_YIELD', 'INFLATION'],
    commonQuestions: ['What is coupon rate?', 'Difference between coupon rate and bond yield']
  },
  {
    id: 'BOND_YIELD',
    name: 'Bond Yield (Yield to Maturity - YTM)',
    aliases: ['bond yield', 'yield to maturity', 'ytm', 'current yield', 'yield curve', 'benchmark yield'],
    domain: 'FIXED_INCOME',
    category: 'BONDS',
    definition: 'Bond Yield is the effective rate of annual return an investor realizes on a bond, taking into account its current secondary market trading price, coupon payments, and capital gain or loss realized upon maturity.',
    howItWorks: [
      'Has an INVERSE relationship with bond prices: when market bond prices fall, bond yields rise; when bond prices rise, yields fall.',
      'If you buy a bond at a discount below face value, your yield exceeds the coupon rate; if you buy at a premium, your yield is lower than the coupon rate.'
    ],
    whyItMatters: [
      'Sovereign 10-year government bond yields serve as the benchmark "risk-free rate" used globally to discount and value all equities, real estate, and corporate loans.',
      'Rising yields discount corporate equity valuations and tighten liquidity.'
    ],
    example: 'A bond with ₹1,000 face value paying ₹70 annual coupon (7%) drops in the market to ₹950 due to rate hikes. The Current Yield rises to 7.37% (₹70 / ₹950).',
    keyPoints: [
      'Yield to Maturity (YTM) assumes all intermediate coupon cash flows are reinvested at the same yield until maturity.'
    ],
    risks: [
      'Reinvestment Risk: intermediate coupons received during low-rate environments must be reinvested at lower prevailing rates.'
    ],
    relatedConcepts: ['BOND', 'COUPON', 'DURATION', 'INTEREST_RATES'],
    commonQuestions: ['What is bond yield?', 'Why do bond prices fall when interest rates rise?', 'What is yield to maturity?']
  },
  {
    id: 'DURATION',
    name: 'Bond Duration (Macaulay & Modified)',
    aliases: ['duration', 'macaulay duration', 'modified duration', 'interest rate sensitivity', 'effective duration'],
    domain: 'FIXED_INCOME',
    category: 'BONDS',
    definition: 'Duration is a financial metric measuring a bond’s price sensitivity to changes in benchmark interest rates, expressed in years. It represents the weighted average time until all cash flows (coupons and principal) are received.',
    howItWorks: [
      'Modified Duration estimates percentage price change: if a bond has a duration of 7 years and interest rates rise by 1% (100 bps), the bond’s price falls by approximately 7%.',
      'Bonds with longer maturities and lower coupon rates carry higher duration (higher volatility).'
    ],
    whyItMatters: [
      'Enables fixed-income fund managers to structure portfolios according to anticipated central bank interest rate cycles.',
      'Short-duration funds protect capital during rate-hiking cycles; long-duration funds deliver explosive capital gains when rate cuts begin.'
    ],
    example: 'A 10-year G-Sec with a duration of 6.8 years gains ~6.8% in price if the central bank slashes interest rates by 100 bps.',
    keyPoints: [
      'Macaulay Duration: time in years to recoup cash flows; Modified Duration: price sensitivity percentage per 1% yield change.'
    ],
    risks: [
      'Holding long-duration bond funds during aggressive rate-hiking cycles causes severe capital losses.'
    ],
    relatedConcepts: ['BOND', 'BOND_YIELD', 'INTEREST_RATES'],
    commonQuestions: ['What is bond duration?', 'How does duration measure bond risk?', 'Macaulay vs modified duration']
  },
  {
    id: 'CREDIT_RISK',
    name: 'Credit Risk (Default Risk)',
    aliases: ['credit risk', 'default risk', 'credit rating', 'downgrade risk', 'credit spread', 'junk bond risk'],
    domain: 'FIXED_INCOME',
    category: 'BONDS',
    definition: 'Credit Risk is the possibility that a corporate or municipal bond borrower will fail to meet their contractual obligations to pay scheduled interest coupons or repay the principal face value at maturity.',
    howItWorks: [
      'Evaluated by certified independent credit rating agencies (CRISIL, ICRA, CARE in India; Moody’s, S&P, Fitch globally).',
      'Ratings range from highest quality (AAA, AA) down to speculative high-yield (BBB, BB, B) and default status (D).',
      'Lower-rated issuers must offer higher coupon yields (credit spread) to compensate investors for bearing greater default risk.'
    ],
    whyItMatters: [
      'Safeguards debt mutual fund investors from permanent capital destruction when corporate debt paper defaults (e.g. IL&FS, DHFL crises).'
    ],
    example: 'A sovereign government bond has practically 0% credit risk (backed by taxing power), whereas an indebted real estate firm rated BBB must pay 11% coupon to attract buyers.',
    keyPoints: [
      'Credit downgrades (e.g. AA to BBB) cause bond prices to drop sharply in the secondary market even before any actual default occurs.'
    ],
    risks: [
      'Chasing high yields in credit-risk debt funds often backfires when risky corporate borrowers enter insolvency.'
    ],
    relatedConcepts: ['BOND', 'BOND_YIELD', 'GOVERNMENT_BOND'],
    commonQuestions: ['What is credit risk?', 'What do bond credit ratings mean?', 'What happens if a bond defaults?']
  },
  {
    id: 'FIXED_DEPOSIT',
    name: 'Fixed Deposit (FD)',
    aliases: ['fixed deposit', 'fd', 'term deposit', 'bank fd', 'corporate fd', 'recurring deposit'],
    domain: 'PERSONAL_FINANCE',
    category: 'BONDS',
    definition: 'A Fixed Deposit (FD) is a savings instrument provided by scheduled commercial banks and NBFCs where an investor deposits a lump sum for a fixed tenure at a guaranteed, predetermined rate of interest.',
    howItWorks: [
      'Tenures range from 7 days up to 10 years.',
      'Interest can be paid out periodically (monthly, quarterly) or compounded cumulatively upon maturity.',
      'Insured in India by the Deposit Insurance and Credit Guarantee Corporation (DICGC - a wholly owned subsidiary of RBI) up to ₹5,0,000 per depositor per bank.'
    ],
    whyItMatters: [
      'The foundational risk-free capital preservation standard for retail and senior citizen investors.',
      'Zero market price fluctuation or principal loss risk if held within insured bank limits.'
    ],
    example: 'Depositing ₹2,00,000 in a scheduled commercial bank at 7.0% cumulative interest for 3 years returns ₹2,46,288 upon maturity.',
    keyPoints: [
      'Premature withdrawal is permitted but typically incurs a 0.5% to 1.0% interest penalty.',
      'Interest earned is fully taxable according to the depositor’s individual income tax slab rate.'
    ],
    risks: [
      'Inflation Drag: post-tax real returns on bank FDs often hover near or below inflation, failing to build real purchasing power over multi-decade horizons.'
    ],
    relatedConcepts: ['BOND', 'COMPOUNDING', 'INFLATION', 'REAL_RETURN'],
    commonQuestions: ['What is a fixed deposit?', 'Is FD better than mutual fund?', 'How is FD interest taxed?']
  },

  // --------------------------------------------------------------------------
  // MARKETS & MACROECONOMICS
  // --------------------------------------------------------------------------
  {
    id: 'BULL_MARKET',
    name: 'Bull Market',
    aliases: ['bull market', 'bullish', 'bull run', 'raging bull', 'market expansion'],
    domain: 'MARKETS',
    category: 'MARKETS',
    definition: 'A Bull Market is an extended financial market condition characterized by sustained rising asset prices, robust investor confidence, economic expansion, strong corporate earnings, and optimistic sentiment.',
    howItWorks: [
      'Typically defined as a rally of 20% or more from recent cyclical market lows across major benchmark indices.',
      'Supported by positive macroeconomic drivers: low interest rates, corporate profit growth, expanding GDP, and abundant institutional liquidity inflows.',
      'Characterized by shallow, short-lived price pullbacks as investors aggressively "buy the dip".'
    ],
    whyItMatters: [
      'The primary historical wealth-generating phase for equity investors.',
      'Fosters broad optimism, aggressive corporate IPO issuance, and capital expenditure.'
    ],
    example: 'The post-2020 global equity surge where the NIFTY 50 rallied from ~7,500 lows in March 2020 to cross 18,000+ by late 2021.',
    keyPoints: [
      'Bull markets climb a "wall of worry" and often run longer and higher than initial consensus estimates predict.'
    ],
    risks: [
      'Complacency and speculative euphoria can inflate valuations to unsustainable extremes near market peaks.'
    ],
    relatedConcepts: ['BEAR_MARKET', 'MARKET_CORRECTION', 'VOLATILITY'],
    commonQuestions: ['What is a bull market?', 'Difference between bull and bear market', 'How long do bull markets last?']
  },
  {
    id: 'BEAR_MARKET',
    name: 'Bear Market',
    aliases: ['bear market', 'bearish', 'market downturn', 'equity winter', 'prolonged market slump'],
    domain: 'MARKETS',
    category: 'MARKETS',
    definition: 'A Bear Market is a prolonged market downturn during which major stock indices experience a cumulative decline of 20% or more from their recent peak levels, accompanied by widespread investor pessimism and economic deceleration.',
    howItWorks: [
      'Usually triggered by systemic economic headwinds: central bank rate hikes to combat inflation, geopolitical crises, asset bubble collapses, or corporate earnings recessions.',
      'Lasts historically between 9 months to 2 years, punctuated by sharp counter-trend rallies ("dead cat bounces").'
    ],
    whyItMatters: [
      'Tests investor psychological discipline and asset allocation resilience.',
      'Presents the greatest historical generational wealth accumulation opportunities for disciplined investors continuing SIPs at discounted valuations.'
    ],
    example: 'The 2008 Global Financial Crisis where benchmark indices fell over 50% from January 2008 peaks amid a banking credit freeze.',
    keyPoints: [
      'Every historical bear market has eventually ended, followed by new all-time market highs in healthy economies.'
    ],
    risks: [
      'Panic selling near bear market bottoms permanently locks in paper losses and misses the subsequent sharp recovery.'
    ],
    relatedConcepts: ['BULL_MARKET', 'MARKET_CORRECTION', 'DRAWDOWN', 'MARKET_CRASH'],
    commonQuestions: ['What is a bear market?', 'How to survive a bear market?', 'What triggers a bear market?']
  },
  {
    id: 'MARKET_CORRECTION',
    name: 'Market Correction',
    aliases: ['market correction', 'correction', 'healthy correction', 'market pullback', 'technical correction'],
    domain: 'MARKETS',
    category: 'MARKETS',
    definition: 'A Market Correction is a temporary, short-term price drop of between 10% and 20% from a recent peak across major market indices or individual stocks.',
    howItWorks: [
      'A routine, healthy phase of the normal market cycle that cools down short-term speculative excesses and resets stretched valuation multiples.',
      'Typically resolves within several weeks to a few months without turning into a full-blown 20%+ bear market.'
    ],
    whyItMatters: [
      'Corrections are mathematically normal and occur roughly once every 12 to 18 months on average in equity indices.',
      'Provide attractive entry points for disciplined investors deploying cash reserves.'
    ],
    example: 'An index trading at 25,000 points drops 12% to 22,000 points over 6 weeks amid rising bond yields before resuming its upward trajectory.',
    keyPoints: [
      'Distinguish a correction (10-20% drop) from a minor dip (<10%) and a bear market (>20% drop).'
    ],
    risks: [
      'Mistaking an evolving structural economic recession for a temporary routine correction.'
    ],
    relatedConcepts: ['BULL_MARKET', 'BEAR_MARKET', 'VOLATILITY'],
    commonQuestions: ['What is a market correction?', 'How deep is a market correction?', 'Should I sell during a correction?']
  },
  {
    id: 'MARKET_CRASH',
    name: 'Market Crash',
    aliases: ['market crash', 'stock crash', 'black monday', 'panic selling', 'circuit breaker crash'],
    domain: 'MARKETS',
    category: 'MARKETS',
    definition: 'A Market Crash is a sudden, precipitous, and dramatic collapse in asset prices across major stock exchanges over a very compressed time horizon (a single day or few sessions), driven by widespread panic and forced liquidations.',
    howItWorks: [
      'Triggered by unanticipated black swan events, catastrophic financial failures, or sudden systemic shocks.',
      'Automated stop-loss orders and margin calls trigger cascades of forced selling, overwhelming exchange order books.',
      'Exchange circuit breakers halt trading automatically (at 10%, 15%, 20% drops in India) to allow market participants to absorb information.'
    ],
    whyItMatters: [
      'Creates extreme price misallocations where fundamentally high-quality companies are dumped indiscriminately.'
    ],
    example: 'The March 2020 COVID-19 shock where indices hit lower circuit limits multiple times in a single week.',
    keyPoints: [
      'Market crashes are rare, acute events; long-term recoveries from crashes have historically rewarded patient long-term investors.'
    ],
    risks: [
      'Margin traders using heavy leverage can be completely wiped out within hours during a crash.'
    ],
    relatedConcepts: ['CIRCUIT_BREAKER', 'BEAR_MARKET', 'VOLATILITY', 'LIQUIDITY'],
    commonQuestions: ['What is a market crash?', 'What happens in a market crash?', 'What triggers circuit breakers?']
  },
  {
    id: 'VOLATILITY',
    name: 'Volatility (India VIX / Beta)',
    aliases: ['volatility', 'vix', 'india vix', 'price fluctuations', 'market volatility', 'standard deviation of returns'],
    domain: 'MARKETS',
    category: 'MARKETS',
    definition: 'Volatility is a statistical measure of the dispersion and speed of price changes for a security or market index over a specific period, reflecting the degree of risk and uncertainty.',
    howItWorks: [
      'Measured quantitatively by Standard Deviation and Beta for stocks, and implied volatility indices (India VIX, CBOE VIX) for broad markets.',
      'High VIX (>20) reflects fear and wide intraday price swings; low VIX (<13) indicates market complacency and orderly price movements.'
    ],
    whyItMatters: [
      'Volatility is the price investors pay for equity market returns: without volatility, equity risk premiums would not exist.',
      'Assists in sizing portfolio positions to match individual emotional and financial risk tolerance.'
    ],
    example: 'A high-beta mid-cap stock swings ±4% daily while a low-beta consumer staples stock moves only ±0.6% daily.',
    keyPoints: [
      'Volatility is NOT permanent loss of capital: it represents temporary quote fluctuation along the growth path.'
    ],
    risks: [
      'Emotional investors misinterpret normal volatility as permanent destruction and make panicked exits.'
    ],
    relatedConcepts: ['DRAWDOWN', 'RISK_TOLERANCE', 'BETA'],
    commonQuestions: ['What is volatility?', 'What is India VIX?', 'Is volatility good or bad?']
  },
  {
    id: 'INFLATION',
    name: 'Inflation (CPI / WPI)',
    aliases: ['inflation', 'cpi', 'wpi', 'consumer price index', 'purchasing power loss', 'rising prices', 'cost of living'],
    domain: 'MARKETS',
    category: 'MACRO',
    definition: 'Inflation is the broad, sustained increase in the prices of goods and services across an economy over time, which systematically diminishes the purchasing power of money.',
    howItWorks: [
      'Measured via Consumer Price Index (CPI) tracking a representative basket of retail food, housing, transport, and energy goods.',
      'Driven by Demand-Pull (excessive money chasing scarce goods) or Cost-Push (surges in raw material/energy input costs).',
      'Central banks (RBI, Fed) mandate inflation targets (typically 4% ±2% in India) and hike benchmark interest rates when inflation overheats.'
    ],
    whyItMatters: [
      'The silent destroyer of idle cash: at 6% inflation, ₹1,00,000 in a savings account loses half its real purchasing power in 12 years.',
      'Forces investors into productive assets (equities, real estate, gold) that outpace inflation over time.'
    ],
    example: 'A basket of monthly groceries costing ₹10,000 today will cost approximately ₹17,900 in 10 years at a 6% annual inflation rate.',
    keyPoints: [
      'Real Return = `Nominal Return - Inflation Rate`. A 7% FD during 6% inflation yields only 1% real return before taxes.'
    ],
    risks: [
      'Stagflation: the damaging combination of high inflation coupled with stagnant GDP growth and high unemployment.'
    ],
    relatedConcepts: ['INTEREST_RATES', 'REAL_RETURN', 'COMPOUNDING', 'GOLD'],
    commonQuestions: ['What is inflation?', 'How does inflation affect my investments?', 'What is CPI?']
  },
  {
    id: 'INTEREST_RATES',
    name: 'Interest Rates & Repo Rate',
    aliases: ['interest rates', 'repo rate', 'rbi policy rate', 'monetary policy', 'rate cut', 'rate hike', 'central bank rate'],
    domain: 'MARKETS',
    category: 'MACRO',
    definition: 'The benchmark Interest Rate (specifically the Repo Rate in India) is the rate at which the central bank (Reserve Bank of India - RBI) lends short-term funds to commercial banks, serving as the foundational cost of capital across the financial system.',
    howItWorks: [
      'Rate Hikes: Implemented to cool runaway inflation by making borrowing costlier, discouraging consumption, and slowing economic overheating.',
      'Rate Cuts: Implemented during economic slumps to stimulate business lending, promote consumer borrowing, and spur growth.',
      'Dictates commercial bank loan interest rates (MCLR, repo-linked home loans) and fixed deposit yields.'
    ],
    whyItMatters: [
      'Fundamental gravity for asset prices: higher interest rates raise discount rates, which automatically lowers the present value of future corporate earnings and pulls equity valuation multiples downward.',
      'Bond prices move inversely with interest rates.'
    ],
    example: 'When the RBI raises the repo rate by 50 bps, banks raise home loan EMI rates from 8.5% to 9.0%, and fixed deposit rates from 6.75% to 7.25%.',
    keyPoints: [
      'Decided by the Monetary Policy Committee (MPC) during bi-monthly review meetings.'
    ],
    risks: [
      'Aggressive rate hikes can precipitate an economic recession by strangling corporate capital expenditure.'
    ],
    relatedConcepts: ['INFLATION', 'BOND_YIELD', 'BOND', 'REPO_RATE'],
    commonQuestions: ['What is the repo rate?', 'How do interest rates affect stock prices?', 'Why does RBI hike rates?']
  },
  {
    id: 'GDP',
    name: 'Gross Domestic Product (GDP)',
    aliases: ['gdp', 'gross domestic product', 'economic growth', 'real gdp', 'nominal gdp', 'national output'],
    domain: 'MARKETS',
    category: 'MACRO',
    definition: 'Gross Domestic Product (GDP) is the total aggregate monetary value of all finished goods and services produced within a nation’s domestic borders over a specific fiscal quarter or year.',
    howItWorks: [
      'Calculated as: `GDP = Consumption (C) + Investment (I) + Government Spending (G) + Net Exports (X - M)`.',
      'Real GDP accounts for inflation; Nominal GDP is measured at current market prices.',
      'GDP growth rate reflects national economic health and corporate revenue expansion potential.'
    ],
    whyItMatters: [
      'Fast-growing economies (e.g. India growing at 6.5% - 7.5% Real GDP) provide fertile ground for double-digit corporate revenue and earnings compounding.',
      'Global institutional funds allocate capital toward countries with superior structural GDP trajectories.'
    ],
    example: 'India’s GDP expanding past $4 Trillion driven by domestic consumer spending, public infrastructure Capex, and digital services exports.',
    keyPoints: [
      'Two consecutive quarters of negative real GDP growth is the traditional technical definition of an Economic Recession.'
    ],
    risks: [
      'GDP growth does not automatically guarantee stock market rallies if valuations are already priced for perfection.'
    ],
    relatedConcepts: ['INFLATION', 'INTEREST_RATES', 'MARKETS'],
    commonQuestions: ['What is GDP?', 'Difference between real and nominal GDP', 'How does GDP affect stocks?']
  },
  {
    id: 'USD_INR',
    name: 'USD/INR Currency Exchange Rate',
    aliases: ['usd inr', 'usd/inr', 'dollar rupee', 'rupee depreciation', 'forex rate', 'currency exchange rate'],
    domain: 'GLOBAL_MARKETS',
    category: 'MACRO',
    definition: 'The USD/INR exchange rate indicates how many Indian Rupees are required to purchase one United States Dollar in the global foreign exchange (Forex) market.',
    howItWorks: [
      'Determined by supply and demand of dollars vs rupees, trade deficit/surplus, foreign institutional investment flows (FII), and inflation differentials.',
      'Rupee historically depreciates against the USD by an average of 3% to 4% annually due to structural inflation differentials between India and the US.'
    ],
    whyItMatters: [
      'Directly affects national import costs: India imports >80% of its crude oil; a weaker rupee increases fuel bills and widens the current account deficit.',
      'Benefits export-oriented sectors (IT services, Pharmaceuticals) because their revenues are earned in USD but incur costs in INR, boosting quarterly operating margins.'
    ],
    example: 'If USD/INR rises from ₹83 to ₹85, an Indian IT firm earning $1 Million revenue receives ₹8.5 Cr instead of ₹8.3 Cr.',
    keyPoints: [
      'Investing in US equities (via feeder funds or LRS) provides Indian investors with natural currency depreciation diversification.'
    ],
    risks: [
      'Sharp, disorderly rupee depreciation reduces dollar-adjusted returns for Foreign Institutional Investors (FIIs), often triggering equity outflows.'
    ],
    relatedConcepts: ['CRUDE_OIL', 'INFLATION', 'GLOBAL_MARKETS'],
    commonQuestions: ['What is USD INR?', 'Why is the rupee falling against the dollar?', 'How does weak rupee affect stock market?']
  },
  {
    id: 'GOLD',
    name: 'Gold (Commodity & Asset Class)',
    aliases: ['gold', 'sovereign gold bond', 'sgb', 'gold etf', 'digital gold', 'yellow metal', 'precious metal'],
    domain: 'COMMODITIES',
    category: 'MACRO',
    definition: 'Gold is a precious metal that serves as a global monetary reserve asset, a store of value, and a traditional hedge against currency debasement, runaway inflation, and geopolitical turmoil.',
    howItWorks: [
      'Carries zero counterparty default risk and cannot be arbitrarily printed by central banks.',
      'Tends to have low or negative correlation with equity indices during severe macroeconomic crashes.',
      'Invested in via Gold ETFs, Sovereign Gold Bonds (SGBs), physical bars/coins, or digital gold.'
    ],
    whyItMatters: [
      'A standard 5% to 10% portfolio allocation reduces overall volatility and preserves capital during bear markets.',
      'Historically maintains purchasing power across centuries.'
    ],
    example: 'During the 2008 crash and 2020 pandemic onset, gold appreciated significantly while global equities suffered severe drawdowns.',
    keyPoints: [
      'Gold generates no internal cash flow, dividends, or interest coupons; its returns depend entirely on capital appreciation.',
      'Sovereign Gold Bonds (SGBs) issued by the RBI uniquely paid 2.5% annual interest on face value alongside tax-free redemption gains.'
    ],
    risks: [
      'Can experience multi-year stagnant sideways periods during strong economic bull markets when equities surge.'
    ],
    relatedConcepts: ['INFLATION', 'COMMODITY', 'ASSET_ALLOCATION', 'USD_INR'],
    commonQuestions: ['What is gold as an investment?', 'How much gold should be in my portfolio?', 'SGB vs Gold ETF']
  },

  // --------------------------------------------------------------------------
  // PERSONAL FINANCE & WEALTH BUILDING
  // --------------------------------------------------------------------------
  {
    id: 'COMPOUNDING',
    name: 'Compounding',
    aliases: ['compounding', 'compound interest', 'eighth wonder', 'exponential growth', 'power of compounding'],
    domain: 'PERSONAL_FINANCE',
    category: 'PERSONAL_FINANCE',
    definition: 'Compounding is the process in which an asset’s earnings, interest, or dividends are continuously reinvested to generate their own additional earnings over time, resulting in exponential rather than linear wealth growth.',
    howItWorks: [
      'Governed by the compound interest formula: `A = P * (1 + r/n)^(n*t)`.',
      'In early years, growth appears gradual and modest; in later decades, the accumulated interest dwarfs the original principal.',
      'Time in the market is vastly more critical than initial capital amount.'
    ],
    whyItMatters: [
      'The foundational mathematical bedrock of all long-term investing and financial independence.',
      'Starting 10 years earlier with a modest sum routinely creates more final wealth than starting late with double the capital.'
    ],
    example: '₹10,000 invested at 12% annual return grows to ₹31,000 in 10 years, ₹96,000 in 20 years, and ₹2,99,000 in 30 years — almost 30x the initial sum without adding a single extra rupee.',
    keyPoints: [
      'Compound interest works for you in investments, but aggressively against you in credit card debt and personal loans.',
      'Avoid interrupting the compounding process unnecessarily by frequent trading or market-timing exits.'
    ],
    risks: [
      'Inflation compounds in reverse, silently eating away future purchasing power.'
    ],
    relatedConcepts: ['SIP', 'CAGR', 'REAL_RETURN', 'RETIREMENT_PLANNING'],
    commonQuestions: ['What is compounding?', 'How does compounding work?', 'Power of compounding example']
  },
  {
    id: 'EMERGENCY_FUND',
    name: 'Emergency Fund',
    aliases: ['emergency fund', 'contingency fund', 'rainy day fund', 'financial safety net', 'emergency runway'],
    domain: 'PERSONAL_FINANCE',
    category: 'PERSONAL_FINANCE',
    definition: 'An Emergency Fund is a dedicated reserve of liquid cash or near-cash savings designed exclusively to cover 3 to 6 months of mandatory household living expenses in the event of an unexpected crisis (e.g. job loss, medical emergency, sudden home repairs).',
    howItWorks: [
      'Must be parked in ultra-safe, highly liquid instruments: high-yield savings accounts, fixed deposits with instant overdraft, or liquid mutual funds.',
      'Must NEVER be invested in volatile equities, lock-in products, or speculative assets.'
    ],
    whyItMatters: [
      'Protects your long-term equity SIPs and retirement corpus from being distress-sold at market bottoms during personal emergencies.',
      'Provides peace of mind and financial security.'
    ],
    example: 'If your household mandatory expenses (rent, groceries, EMIs, insurance, utilities) are ₹50,000/month, your ideal emergency fund is ₹1.5 to ₹3.0 Lakhs.',
    keyPoints: [
      'Replenish the fund immediately after utilizing any portion.',
      'The goal of an emergency fund is Liquidity and Capital Safety, NOT return maximization.'
    ],
    risks: [
      'Keeping too little exposes you to high-interest debt; keeping excessively huge sums in cash incurs heavy inflation drag.'
    ],
    relatedConcepts: ['ASSET_ALLOCATION', 'FIXED_DEPOSIT', 'PERSONAL_FINANCE'],
    commonQuestions: ['What is an emergency fund?', 'How much emergency fund do I need?', 'Where should I keep emergency fund?']
  },
  {
    id: 'ASSET_ALLOCATION',
    name: 'Asset Allocation',
    aliases: ['asset allocation', 'portfolio allocation', 'capital allocation', 'asset mix', 'portfolio diversification'],
    domain: 'PORTFOLIO',
    category: 'PERSONAL_FINANCE',
    definition: 'Asset Allocation is an investment strategy that divides an investor’s total portfolio among distinct, uncorrelated asset categories—principally Equities, Fixed Income/Debt, Gold/Commodities, and Cash—based on the investor’s goals, risk tolerance, and time horizon.',
    howItWorks: [
      'Recognizes that different asset classes perform differently across economic cycles (e.g. when equities crash, bonds and gold often hold steady).',
      'Classic models include Age-Based rule (`Equity % = 100 - Age`) or Strategic 60/40 Equity/Debt portfolio.',
      'Involves periodic rebalancing (annually) to restore target percentages as asset values fluctuate.'
    ],
    whyItMatters: [
      'Academic studies (Brinson, Hood, Beebower) prove that asset allocation determines over 90% of a portfolio’s long-term return variability and risk profile, far overshadowing individual stock picking.',
      'Maximizes risk-adjusted returns while minimizing painful drawdowns.'
    ],
    example: 'A 30-year-old with a 15-year horizon allocates 70% to Equities (wealth creation), 20% to Debt (stability), and 10% to Gold (inflation hedge).',
    keyPoints: [
      'Rebalance when any asset class drifts more than 5% to 10% from its strategic target.',
      'Asset allocation should evolve as retirement approaches to lock in gains and reduce sequence-of-returns risk.'
    ],
    risks: [
      'Failing to rebalance allows equity risk to expand excessively during late bull markets.'
    ],
    relatedConcepts: ['DIVERSIFICATION', 'RISK_TOLERANCE', 'REBALANCING'],
    commonQuestions: ['What is asset allocation?', 'How to choose asset allocation?', 'What is 60 40 portfolio?']
  },
  {
    id: 'DIVERSIFICATION',
    name: 'Diversification',
    aliases: ['diversification', 'diversify', 'portfolio diversification', 'dont put all eggs in one basket', 'unsystematic risk reduction'],
    domain: 'PORTFOLIO',
    category: 'PERSONAL_FINANCE',
    definition: 'Diversification is a risk management technique that blends a wide variety of different investments within a portfolio to eliminate company-specific (unsystematic) risks without sacrificing expected return.',
    howItWorks: [
      'Rooted in Harry Markowitz’s Modern Portfolio Theory: "Diversification is the only free lunch in finance."',
      'Spread capital across multiple companies (25 to 35 stocks), diverse industry sectors (banking, IT, FMCG, pharma), and geographic regions.',
      'The poor performance of one bankrupt company or struggling sector is offset by the positive performance of others.'
    ],
    whyItMatters: [
      'Protects your net worth from catastrophic ruin if a single company commits fraud or goes bankrupt (e.g. Enron, Yes Bank).',
      'Smooths out overall portfolio return trajectory.'
    ],
    example: 'Holding 30 diverse stocks across 8 industries ensures that even if one stock drops 80% to zero, your overall portfolio suffers less than a 3% impact.',
    keyPoints: [
      'Avoid "diworsification": holding 150+ stocks or 15 overlapping mutual funds adds complexity and expenses without reducing further risk.',
      'Systematic Market Risk (e.g. severe recessions) cannot be diversified away within the same asset class.'
    ],
    risks: [
      'Excessive diversification dilutes high-conviction winning investments, limiting extraordinary alpha.'
    ],
    relatedConcepts: ['ASSET_ALLOCATION', 'RISK_REWARD', 'MUTUAL_FUND'],
    commonQuestions: ['What is diversification?', 'Why diversify investments?', 'How many stocks for proper diversification?']
  },
  {
    id: 'CAGR',
    name: 'Compound Annual Growth Rate (CAGR)',
    aliases: ['cagr', 'compound annual growth rate', 'annualized return rate', 'cagr formula', 'smoothed annual return'],
    domain: 'FINANCIAL_CALCULATIONS',
    category: 'CALCULATIONS',
    definition: 'Compound Annual Growth Rate (CAGR) is the constant annual rate of return that would be required for an investment to grow from its initial beginning balance to its final ending balance over a specified multi-year period, assuming all profits were reinvested.',
    howItWorks: [
      'Calculated as: `CAGR = ((Ending Value / Beginning Value) ^ (1 / Number of Years)) - 1`.',
      'Smoothes out erratic annual market swings into a single, standardized annual growth rate for easy comparison.',
      'Valid only for periods strictly greater than 1.0 year (minimum 365 days).'
    ],
    whyItMatters: [
      'The gold standard benchmark for comparing performance across stocks, mutual funds, real estate, and fixed deposits over multi-year horizons.',
      'Prevents misleading arithmetic averages: a stock that drops 50% in Year 1 and gains 50% in Year 2 has an arithmetic average of 0%, but a real CAGR of -13.4% (you lost money).'
    ],
    example: 'An investment of ₹1,00,000 grows to ₹2,00,000 over exactly 5 years. Its CAGR is `((2,00,000 / 1,00,000) ^ (1 / 5)) - 1 = 14.87%`.',
    keyPoints: [
      'CAGR is a geometric return, not an arithmetic average.',
      'Used exclusively for single lumpsum investments; for staggered cash flows like SIPs, use XIRR (Extended Internal Rate of Return).'
    ],
    risks: [
      'CAGR hides interim volatility: an investment could have plunged 60% midway before recovering to hit its final value.'
    ],
    relatedConcepts: ['ROI', 'COMPOUNDING', 'ANNUALIZED_RETURN', 'SIP'],
    commonQuestions: ['What is CAGR?', 'How is CAGR calculated?', 'Difference between CAGR and absolute return', 'What is a good CAGR?']
  },
  {
    id: 'ROI',
    name: 'Return on Investment (ROI)',
    aliases: ['roi', 'return on investment', 'rate of return', 'total return percentage', 'investment gain'],
    domain: 'FINANCIAL_CALCULATIONS',
    category: 'CALCULATIONS',
    definition: 'Return on Investment (ROI) is a fundamental performance metric that measures the total percentage gain or loss generated on an investment relative to its initial cost basis.',
    howItWorks: [
      'Calculated as: `ROI (%) = ((Current Value - Initial Investment) / Initial Investment) * 100`.',
      'Evaluates overall net profitability regardless of complexity.',
      'If you invest ₹10,000 and the value reaches ₹12,500, your net gain is ₹2,500 and ROI is 25.0%.'
    ],
    whyItMatters: [
      'Universal, straightforward profitability measure accessible to every investor.',
      'Useful for quick comparative checks across individual trades and business initiatives.'
    ],
    example: 'Buying a stock for ₹50,000 and selling it for ₹65,000 generates an ROI of 30.0% (`((65,000 - 50,000) / 50,000) * 100`).',
    keyPoints: [
      'ROI does NOT account for the holding time horizon: a 30% ROI over 1 year is stellar; a 30% ROI over 10 years is poor (less than 2.7% CAGR).'
    ],
    risks: [
      'Misleading when comparing investments held for wildly different time periods; always pair with CAGR.'
    ],
    relatedConcepts: ['CAGR', 'ABSOLUTE_RETURN', 'ANNUALIZED_RETURN'],
    commonQuestions: ['What is ROI?', 'How to calculate ROI?', 'Difference between ROI and CAGR']
  },
  {
    id: 'ETF_EXPENSE_RATIO',
    name: 'ETF Expense Ratio (TER)',
    aliases: ['etf expense ratio', 'etf ter', 'etf fees', 'etf cost', 'etf management fee'],
    domain: 'ETFS',
    category: 'ETF',
    definition: 'The ETF Expense Ratio is the annual percentage fee deducted by the fund sponsor from the ETF’s assets to cover administrative, management, and regulatory costs.',
    howItWorks: [
      'Calculated as: `Expense Ratio = (Annual Operating Expenses / Total Fund Assets)`.',
      'Accrued on a daily basis and deducted directly from the fund’s Net Asset Value (NAV).',
      'Passive index ETFs typically charge between 0.05% and 0.30%, significantly lower than actively managed funds.'
    ],
    whyItMatters: [
      'Minimizes fee drag, allowing more of the underlying index compounding returns to reach the investor.',
      'Over a 20-year horizon, a 1% fee difference can erode more than 25% of total terminal wealth.'
    ],
    example: 'An ETF with a 0.10% expense ratio charges ₹10 annually for every ₹10,000 invested.',
    keyPoints: [
      'Check tracking error alongside expense ratio: a fund with low TER but high tracking error may underperform.',
      'Deducted automatically, so investors do not receive an explicit bill.'
    ],
    risks: [
      'Brokerage fees, exchange transaction charges, and STT apply separately when buying or selling ETFs on the exchange.'
    ],
    relatedConcepts: ['ETF', 'EXPENSE_RATIO', 'TRACKING_ERROR', 'INDEX_FUND'],
    commonQuestions: ['What is ETF expense ratio?', 'Are ETF expense ratios lower than mutual funds?']
  },
  {
    id: 'GOVERNMENT_BOND',
    name: 'Government Bond (G-Sec)',
    aliases: ['government bond', 'government bonds', 'g-sec', 'gsec', 'sovereign debt', 'gilts', 'central government bond'],
    domain: 'FIXED_INCOME',
    category: 'BONDS',
    definition: 'A Government Bond (G-Sec) is a debt security issued by a sovereign government (such as the Government of India) to finance public infrastructure, fiscal deficits, and military spending.',
    howItWorks: [
      'Backed by the full faith and sovereign taxing power of the issuing nation, carrying zero credit default risk.',
      'Pays fixed, semi-annual coupon interest and repays the full principal upon maturity.',
      'Retail investors can purchase G-Secs directly via RBI Retail Direct or NSE goBID.'
    ],
    whyItMatters: [
      'Serves as the risk-free foundation of a nation’s financial system and benchmark for all other interest rates.',
      'Offers unmatched capital safety for conservative investors and pension portfolios.'
    ],
    example: 'A 10-year G-Sec with a 7.10% coupon issued at ₹100 face value pays ₹3.55 every six months for 10 years and ₹100 at redemption.',
    keyPoints: [
      'Zero credit risk, but subject to price fluctuations (interest rate risk) prior to maturity.',
      'Held to maturity guarantees nominal capital preservation.'
    ],
    risks: [
      'If benchmark rates rise, existing G-Sec prices fall in secondary trading.',
      'Inflation can erode the real purchasing power of the fixed coupon payments.'
    ],
    relatedConcepts: ['BOND', 'TREASURY_BOND', 'COUPON', 'BOND_YIELD', 'DURATION'],
    commonQuestions: ['What is a government bond?', 'How to buy government bonds in India?', 'Are G-Secs safe?']
  },
  {
    id: 'TREASURY_BOND',
    name: 'Treasury Bond (T-Bill / T-Bond)',
    aliases: ['treasury bond', 'treasury bonds', 't-bills', 'treasury bills', 't-bonds', 'us treasury', 'sovereign treasury'],
    domain: 'FIXED_INCOME',
    category: 'BONDS',
    definition: 'Treasury Bonds and Treasury Bills (T-Bills) are sovereign debt obligations issued by national treasuries (e.g. US Department of the Treasury or RBI) with maturities ranging from 91 days to 30 years.',
    howItWorks: [
      'T-Bills are short-term (91, 182, 364 days), zero-coupon instruments issued at a discount and redeemed at par face value.',
      'Treasury Bonds (T-Bonds) are long-term instruments (10 to 30 years) paying periodic coupons.',
      'Considered the global benchmark for risk-free dollar assets.'
    ],
    whyItMatters: [
      'US Treasury yields set the global cost of borrowing and influence cross-border capital flows into emerging markets like India.',
      'Crucial for short-term liquidity management for corporations and banks.'
    ],
    example: 'A 91-day T-bill with face value ₹100 issued at ₹98.25 delivers ₹1.75 profit upon maturity, giving an annualized yield of ~7.12%.',
    keyPoints: [
      'Highest liquidity among fixed-income markets globally.',
      'T-Bills carry almost negligible duration risk due to short maturity.'
    ],
    risks: [
      'Reinvestment risk: as short-term T-bills mature, yields may be lower on renewal.'
    ],
    relatedConcepts: ['GOVERNMENT_BOND', 'BOND', 'INTEREST_RATES'],
    commonQuestions: ['What is a treasury bond?', 'What is a T-Bill?', 'Difference between T-bills and government bonds']
  },
  {
    id: 'LIQUIDITY',
    name: 'Liquidity',
    aliases: ['liquidity', 'market liquidity', 'liquid asset', 'illiquidity', 'trading volume liquidity'],
    domain: 'MARKETS',
    category: 'MARKETS',
    definition: 'Liquidity refers to the ease and speed with which an asset can be converted into cash without triggering a significant change in its market price.',
    howItWorks: [
      'High liquidity means large trading volumes, tight bid-ask spreads, and instant order execution (e.g. large-cap stocks, Nifty 50 ETFs, cash).',
      'Low liquidity (illiquidity) features wide bid-ask spreads, low trading volume, and sharp price slippage when executing large orders (e.g. microcaps, real estate).'
    ],
    whyItMatters: [
      'Ensures investors can exit positions immediately during market stress without suffering severe losses due to impact cost.',
      'A liquidity crunch can force healthy institutions into insolvency if they cannot access cash to meet short-term obligations.'
    ],
    example: 'Selling ₹10 Lakhs of Reliance Industries shares executes in milliseconds with virtually zero price difference; selling a flat worth ₹10 Lakhs takes months and involves substantial negotiation discounts.',
    keyPoints: [
      'Cash is the most liquid asset in the world.',
      'Illiquidity premium: investors typically demand higher potential returns to lock capital in illiquid investments.'
    ],
    risks: [
      'During market panics, liquidity can dry up suddenly in mid and small-cap securities, locking investors in falling positions.'
    ],
    relatedConcepts: ['VOLATILITY', 'EMERGENCY_FUND', 'MARKET_CAP', 'ETF_LIQUIDITY'],
    commonQuestions: ['What is liquidity?', 'Why does liquidity matter in stock markets?', 'What is a liquid asset?']
  },
  {
    id: 'MARKET_SENTIMENT',
    name: 'Market Sentiment',
    aliases: ['market sentiment', 'investor sentiment', 'bullish sentiment', 'bearish sentiment', 'fear and greed', 'market mood'],
    domain: 'MARKETS',
    category: 'MARKETS',
    definition: 'Market Sentiment is the overarching psychological mood and prevailing attitude of investors and traders toward financial markets, oscillating between extreme greed (euphoria) and extreme fear (panic).',
    howItWorks: [
      'Measured using indicators like the Put-Call Ratio (PCR), India VIX (volatility index), advance-decline ratios, and market sentiment indices.',
      'Bullish sentiment drives buying pressure and expands valuation multiples; Bearish sentiment triggers capital preservation and selling.',
      'Contrarian investors look for extreme sentiment extremes to take opposing positions (Warren Buffett: "Be greedy when others are fearful").'
    ],
    whyItMatters: [
      'Explains why stock prices decouple from fundamentals in the short term, becoming excessively overvalued during hype or undervalued during crises.',
      'Essential for understanding short-term momentum and market tops/bottoms.'
    ],
    example: 'During March 2020, extreme fear sentiment caused fundamentally robust businesses to sell off by 30-40% over weeks, offering generational buying entry points.',
    keyPoints: [
      'Short-term price action is dominated by sentiment and liquidity; long-term returns are governed by earnings and cash flows.',
      'High VIX signifies intense fear; low VIX suggests investor complacency.'
    ],
    risks: [
      'Following herd sentiment at extremes leads to buying near market peaks and panic-selling near bottoms.'
    ],
    relatedConcepts: ['VOLATILITY', 'BULL_MARKET', 'BEAR_MARKET', 'MARKET_CRASH'],
    commonQuestions: ['What is market sentiment?', 'How to measure market sentiment?', 'What is the fear and greed index?']
  },
  {
    id: 'REPO_RATE',
    name: 'Repo Rate',
    aliases: ['repo rate', 'policy repo rate', 'rbi repo rate', 'repurchase rate', 'benchmark lending rate', 'reverse repo'],
    domain: 'MACRO',
    category: 'MACRO',
    definition: 'The Repo Rate (Repurchase Rate) is the key benchmark interest rate at which the central bank (e.g. RBI in India) lends short-term money to commercial banks against government securities collateral.',
    howItWorks: [
      'When inflation rises above tolerance thresholds, the central bank raises the Repo Rate to make borrowing more expensive, slowing credit growth and cooling demand.',
      'When economic growth slows, the central bank cuts the Repo Rate to encourage borrowing, business expansion, and consumer spending.',
      'Commercial banks adjust their MCLR, home loan rates, and fixed deposit interest rates in response to repo rate changes.'
    ],
    whyItMatters: [
      'The primary lever of monetary policy controlling national money supply and inflation.',
      'Directly impacts home loan EMIs, corporate borrowing expenses, bond yields, and stock market valuations.'
    ],
    example: 'If the RBI hikes the repo rate by 50 bps from 6.50% to 7.00%, floating home loan rates rise, increasing monthly EMIs for borrowers.',
    keyPoints: [
      'Rate hikes increase fixed deposit returns but make equities and housing loans more expensive.',
      'Rate cuts provide liquidity and support stock market expansions.'
    ],
    risks: [
      'Aggressive rate hikes can trigger economic slowdowns or recessions by suffocating credit growth.'
    ],
    relatedConcepts: ['INTEREST_RATES', 'INFLATION', 'BOND_YIELD', 'GDP'],
    commonQuestions: ['What is repo rate?', 'How does repo rate affect home loans?', 'Difference between repo rate and reverse repo']
  },
  {
    id: 'CRUDE_OIL',
    name: 'Crude Oil',
    aliases: ['crude oil', 'crude', 'brent crude', 'wti crude', 'oil prices', 'petroleum barrel'],
    domain: 'COMMODITIES',
    category: 'MACRO',
    definition: 'Crude Oil is the world’s most critical unrefined liquid petroleum commodity, serving as the foundational energy source for global transportation, petrochemicals, and industrial manufacturing.',
    howItWorks: [
      'Traded on international commodity exchanges principally via Brent Crude (North Sea/Europe) and WTI (West Texas Intermediate/US).',
      'Prices are governed by OPEC+ production quotas, geopolitical tensions in producing regions, and global macroeconomic demand.',
      'India imports over 85% of its crude oil requirements, making oil price swings a primary macroeconomic driver.'
    ],
    whyItMatters: [
      'Rising crude prices widen India’s Current Account Deficit (CAD), put depreciation pressure on the Indian Rupee (INR), and elevate domestic inflation.',
      'Directly impacts profit margins of Oil Marketing Companies (IOCL, BPCL, HPCL), paint manufacturers, airlines, and logistics firms.'
    ],
    example: 'When Brent crude jumps from $75 to $95 per barrel, transportation costs rise, increasing logistics expenses for FMCG and retail sectors.',
    keyPoints: [
      'Priced globally in US Dollars per barrel (42 US gallons / ~159 liters).',
      'High crude oil is generally a headwind for oil-importing emerging economies like India.'
    ],
    risks: [
      'Extreme volatility driven by geopolitical conflicts and supply disruptions.'
    ],
    relatedConcepts: ['INFLATION', 'USD_INR', 'COMMODITY', 'GDP'],
    commonQuestions: ['What is crude oil?', 'How does crude oil affect Indian stock market?', 'How does crude oil impact OMCs?']
  },
  {
    id: 'UNEMPLOYMENT',
    name: 'Unemployment Rate',
    aliases: ['unemployment', 'unemployment rate', 'jobless rate', 'job growth', 'employment data', 'non-farm payrolls'],
    domain: 'MACRO',
    category: 'MACRO',
    definition: 'The Unemployment Rate is the percentage of the total labor force that is actively seeking employment but unable to find work, serving as a primary lagging indicator of national economic health.',
    howItWorks: [
      'Calculated as: `(Unemployed Workers / Total Active Labor Force) * 100`.',
      'During economic expansions, business hiring accelerates and unemployment drops; during recessions, layoffs mount and unemployment rises.',
      'Central banks monitor unemployment data alongside inflation when deciding interest rate policies.'
    ],
    whyItMatters: [
      'Consumer spending drives roughly 60% of GDP; low unemployment supports consumer confidence and retail demand.',
      'Rising unemployment dampens discretionary spending and increases loan delinquency rates for banks.'
    ],
    example: 'A declining unemployment rate from 7.5% to 6.2% indicates robust job creation, giving consumers higher disposable income to spend on autos, real estate, and consumer goods.',
    keyPoints: [
      'Underemployment (working below skill level or part-time involuntarily) is often tracked alongside headline unemployment.',
      'Extremely low unemployment can lead to wage inflation, prompting central banks to raise interest rates.'
    ],
    risks: [
      'Sudden surges in layoffs signal imminent economic contractions.'
    ],
    relatedConcepts: ['GDP', 'INFLATION', 'INTEREST_RATES'],
    commonQuestions: ['What is unemployment rate?', 'How does unemployment affect the economy?', 'Why do markets care about jobs data?']
  },
  {
    id: 'RISK_TOLERANCE',
    name: 'Risk Tolerance',
    aliases: ['risk tolerance', 'risk appetite', 'risk profile', 'investor risk capacity', 'willingness to take risk'],
    domain: 'PERSONAL_FINANCE',
    category: 'PERSONAL_FINANCE',
    definition: 'Risk Tolerance is an investor’s emotional willingness and financial capacity to endure temporary fluctuations and paper declines in portfolio value in pursuit of higher potential long-term returns.',
    howItWorks: [
      'Combines Risk Capacity (objective financial ability to absorb losses without endangering lifestyle) and Risk Attitude (psychological comfort with volatility).',
      'Categorized into Conservative (capital preservation focus), Moderate (balanced equity/debt mix), and Aggressive (growth-oriented equity focus).',
      'Evaluated through questionnaire assessments covering investment horizon, emergency reserves, debt load, and past behavior during crashes.'
    ],
    whyItMatters: [
      'Aligning portfolio asset allocation with risk tolerance prevents panic-selling at market bottoms.',
      'A technically optimal portfolio that exceeds your risk tolerance will cause emotional distress and erratic decision-making.'
    ],
    example: 'An investor with a 20-year horizon and stable income has high risk capacity; if they lose sleep when their portfolio drops 10%, their risk attitude is conservative, requiring a balanced 50/50 allocation.',
    keyPoints: [
      'True risk tolerance is revealed during bear markets, not during euphoric bull rallies.',
      'Time horizon is the single largest factor expanding risk tolerance.'
    ],
    risks: [
      'Overestimating risk tolerance during bull markets leads to severe distress during inevitable market corrections.'
    ],
    relatedConcepts: ['ASSET_ALLOCATION', 'RISK_REWARD', 'DIVERSIFICATION', 'VOLATILITY'],
    commonQuestions: ['What is risk tolerance?', 'How to determine my risk tolerance?', 'Difference between risk capacity and risk tolerance']
  },
  {
    id: 'RISK_REWARD',
    name: 'Risk-Reward Ratio',
    aliases: ['risk reward', 'risk to reward', 'risk reward ratio', 'risk return tradeoff', 'risk vs return'],
    domain: 'PERSONAL_FINANCE',
    category: 'PERSONAL_FINANCE',
    definition: 'The Risk-Reward Ratio evaluates the potential profit of an investment or trade relative to the maximum potential loss tolerated, embodying the fundamental financial principle that higher expected return requires taking on higher risk.',
    howItWorks: [
      'Calculated as: `Risk-Reward Ratio = (Entry Price - Stop Loss Price) / (Target Price - Entry Price)`.',
      'A 1:3 risk-reward ratio means you risk ₹1 of downside to capture ₹3 of potential upside.',
      'Ensures a trader or investor can be profitable over time even with a modest win rate (e.g. winning 40% of trades with a 1:3 ratio generates strong net profits).'
    ],
    whyItMatters: [
      'Prevents asymmetrical trades where small gains are pursued at the expense of catastrophic ruin.',
      'Guides disciplined portfolio management and position sizing.'
    ],
    example: 'Buying a stock at ₹100 with a stop-loss at ₹90 (risk ₹10) and a target of ₹130 (reward ₹30) offers an attractive 1:3 risk-reward profile.',
    keyPoints: [
      'No investment offers high returns with zero risk; promises of guaranteed 20%+ annual returns without downside are financial scams.',
      'Diversification improves portfolio risk-adjusted returns without reducing expected performance.'
    ],
    risks: [
      'Target prices may never be reached, while stop-losses can be triggered by short-term market noise.'
    ],
    relatedConcepts: ['RISK_TOLERANCE', 'VOLATILITY', 'DRAWDOWN', 'ASSET_ALLOCATION'],
    commonQuestions: ['What is risk reward ratio?', 'What is a good risk reward ratio?', 'Explain risk return tradeoff']
  },
  {
    id: 'RETURNS',
    name: 'Investment Returns',
    aliases: ['returns', 'investment return', 'total return', 'capital return', 'yield return', 'return types'],
    domain: 'PERSONAL_FINANCE',
    category: 'PERSONAL_FINANCE',
    definition: 'Investment Returns represent the financial gain or loss generated on an invested sum over a given evaluation period, comprising both capital appreciation (price growth) and income yield (dividends or interest).',
    howItWorks: [
      'Total Return = Capital Gain/Loss + Dividend/Interest Income.',
      'Expressed either as an absolute percentage or annualized (CAGR/XIRR).',
      'Returns can be Nominal (raw percentage) or Real (adjusted for consumer inflation and taxes).'
    ],
    whyItMatters: [
      'Measures the effectiveness of capital allocation in growing wealth over time.',
      'Helps track progress toward achieving financial independence and long-term milestones.'
    ],
    example: 'Buying shares for ₹1,00,000, receiving ₹3,000 in dividends, and selling for ₹1,12,000 generates a total return of ₹15,000 (15.0%).',
    keyPoints: [
      'Always focus on Total Return rather than price change alone.',
      'Net real return after taxes and inflation is what actually enhances living standards.'
    ],
    risks: [
      'Past returns do not guarantee future performance.'
    ],
    relatedConcepts: ['REAL_RETURN', 'NOMINAL_RETURN', 'CAGR', 'ROI', 'DIVIDEND_YIELD'],
    commonQuestions: ['What are investment returns?', 'What is total return?', 'How are stock returns calculated?']
  },
  {
    id: 'REAL_RETURN',
    name: 'Real Return',
    aliases: ['real return', 'real returns', 'inflation adjusted return', 'real rate of return', 'purchasing power gain'],
    domain: 'PERSONAL_FINANCE',
    category: 'PERSONAL_FINANCE',
    definition: 'Real Return is the actual annual percentage gain on an investment after subtracting the rate of inflation, reflecting the true increase in an investor’s purchasing power.',
    howItWorks: [
      'Calculated via the Fisher approximation: `Real Return ≈ Nominal Return - Inflation Rate`.',
      'More precise formula: `Real Return = ((1 + Nominal Return) / (1 + Inflation Rate)) - 1`.',
      'If an investment yields 7% nominally while inflation is 6%, the real return is roughly +1%.'
    ],
    whyItMatters: [
      'Exposes the hidden illusion of wealth: a positive nominal return can still result in wealth destruction if inflation outpaces returns.',
      'Explains why parking all long-term savings in traditional fixed deposits often loses real purchasing power after taxes and inflation.'
    ],
    example: 'Earning 7.0% on a fixed deposit in a 30% tax bracket leaves 4.9% post-tax; if inflation is 5.5%, your real post-tax return is negative (-0.6% annually).',
    keyPoints: [
      'Equities historically deliver the highest positive real return (+6% to +8% above inflation over 10+ years).',
      'Cash and standard savings accounts reliably deliver negative real returns over long horizons.'
    ],
    risks: [
      'Ignoring inflation leads to under-saving for retirement as future expenses will be vastly higher.'
    ],
    relatedConcepts: ['NOMINAL_RETURN', 'INFLATION', 'COMPOUNDING', 'RETURNS'],
    commonQuestions: ['What is real return?', 'Difference between real return and nominal return', 'Why is inflation adjusted return important?']
  },
  {
    id: 'NOMINAL_RETURN',
    name: 'Nominal Return',
    aliases: ['nominal return', 'nominal returns', 'nominal rate of return', 'unadjusted return', 'headline return'],
    domain: 'PERSONAL_FINANCE',
    category: 'PERSONAL_FINANCE',
    definition: 'Nominal Return is the raw percentage gain or loss generated on an investment before making any adjustments for inflation, fees, or taxes.',
    howItWorks: [
      'The headline figure shown on bank statements, mutual fund fact sheets, and stock trade summaries.',
      'Reflects the actual monetary currency growth: ₹100 becoming ₹110 is a 10% nominal return, regardless of what goods ₹110 can buy.'
    ],
    whyItMatters: [
      'Standardized baseline starting point for evaluating investment contracts and stated interest rates.',
      'Used as the input for calculating real returns and tax obligations.'
    ],
    example: 'A fixed deposit advertising 7.5% annual interest offers a nominal return of 7.5%.',
    keyPoints: [
      'Nominal return does not measure purchasing power; always adjust for inflation and tax brackets to understand true wealth creation.',
      'During periods of hyperinflation, nominal returns can be enormous while real returns are catastrophically negative.'
    ],
    risks: [
      'Money illusion: mistaking high nominal returns for genuine prosperity when living costs are rising just as quickly.'
    ],
    relatedConcepts: ['REAL_RETURN', 'INFLATION', 'RETURNS', 'CAGR'],
    commonQuestions: ['What is nominal return?', 'Nominal return vs real return example']
  },
  {
    id: 'TAX_BASICS',
    name: 'Investment Tax Basics (LTCG / STCG)',
    aliases: ['tax basics', 'investment taxation', 'ltcg', 'stcg', 'capital gains tax', 'equity taxation', 'tax on stocks'],
    domain: 'PERSONAL_FINANCE',
    category: 'PERSONAL_FINANCE',
    definition: 'Investment Tax Basics covers how returns from financial assets are taxed upon realization, fundamentally classified into Short-Term Capital Gains (STCG), Long-Term Capital Gains (LTCG), and dividend taxation.',
    howItWorks: [
      'In India (Budget 2024 rules): Listed equity held > 12 months incurs LTCG at 12.5% (with ₹1.25 Lakh annual exemption); held ≤ 12 months incurs STCG at 20%.',
      'Unlisted securities and debt funds are taxed according to the investor’s applicable slab rate or specific holding period rules.',
      'Taxes apply only upon realization (selling); unrealized paper profits compound completely tax-free.'
    ],
    whyItMatters: [
      'Taxes significantly reduce net compound wealth; efficient tax planning keeps more money working for you.',
      'Long-term investing benefits from deferred taxation, compounding profits without annual tax friction.'
    ],
    example: 'Booking ₹2,00,000 of LTCG on equity shares after 2 years: the first ₹1,25,000 is exempt; the remaining ₹75,000 is taxed at 12.5% (₹9,375 tax).',
    keyPoints: [
      'Tax-loss harvesting: selling loss-making positions before financial year-end to offset taxable realized capital gains.',
      'Dividends are added to taxable income and taxed at the investor’s marginal income slab rate.'
    ],
    risks: [
      'Tax laws and rates are subject to legislative changes in annual government budgets.'
    ],
    relatedConcepts: ['RETURNS', 'REAL_RETURN', 'ELSS', 'RETIREMENT_PLANNING'],
    commonQuestions: ['What is LTCG and STCG?', 'How are stock gains taxed in India?', 'What is tax loss harvesting?']
  },
  {
    id: 'RETIREMENT_PLANNING',
    name: 'Retirement Planning',
    aliases: ['retirement planning', 'retirement corpus', 'pension planning', 'financial independence', 'fire movement', 'post retirement income'],
    domain: 'PERSONAL_FINANCE',
    category: 'PERSONAL_FINANCE',
    definition: 'Retirement Planning is the systematic financial process of estimating post-retirement living expenses, calculating the required nest egg (corpus), and investing in growth and income assets to achieve lifelong financial freedom.',
    howItWorks: [
      'Estimate future monthly expenses adjusted for lifestyle inflation to retirement age.',
      'Calculate Required Corpus using the 25x or 30x annual expenses rule (4% safe withdrawal rate).',
      'Accumulate via equity SIPs, EPF, PPF, and NPS during working years; transition to debt, annuities, and SWP (Systematic Withdrawal Plan) in retirement.'
    ],
    whyItMatters: [
      'With increasing life expectancy and the absence of universal state pensions, personal retirement planning is essential to avoid outliving your savings.',
      'Starting early allows compounding to shoulder the vast majority of the required savings burden.'
    ],
    example: 'If you need ₹1,00,000 monthly in retirement (₹12 Lakhs/year), a 25x rule suggests targeting a retirement corpus of approximately ₹3 Crores.',
    keyPoints: [
      'Sequence of returns risk: poor market returns in the first 3-5 years of retirement can severely impair corpus longevity.',
      'Healthcare and medical inflation often runs at 10-14%, exceeding headline CPI.'
    ],
    risks: [
      'Underestimating inflation and healthcare costs is the most frequent planning error.'
    ],
    relatedConcepts: ['COMPOUNDING', 'ASSET_ALLOCATION', 'EMERGENCY_FUND', 'SIP', 'REAL_RETURN'],
    commonQuestions: ['How much money do I need to retire?', 'How to plan for retirement?', 'What is the 4 percent rule?']
  },
  {
    id: 'ABSOLUTE_RETURN',
    name: 'Absolute Return',
    aliases: ['absolute return', 'point to point return', 'total percentage gain', 'simple return'],
    domain: 'FINANCIAL_CALCULATIONS',
    category: 'CALCULATIONS',
    definition: 'Absolute Return is the simple percentage gain or loss an investment achieves from beginning to end, calculated without any reference to the passage of time or market benchmarks.',
    howItWorks: [
      'Calculated as: `Absolute Return (%) = ((Current Value - Purchase Price) / Purchase Price) * 100`.',
      'Directly answers: "How much total money in percentage terms did I make or lose?"',
      'Ideal for investments held for periods under 1 year where annualization could produce misleading distortions.'
    ],
    whyItMatters: [
      'Intuitive and immediately clear without requiring compound math.',
      'Standard measure for short-term trades and single-period evaluations.'
    ],
    example: 'Buying a stock at ₹200 and selling at ₹250 delivers an absolute return of 25.0% (`((250 - 200) / 200) * 100`).',
    keyPoints: [
      'Does not distinguish between 25% made in 3 months versus 25% made over 7 years.',
      'For periods longer than 1 year, always convert to CAGR or Annualized Return.'
    ],
    risks: [
      'Fails to measure capital efficiency across different holding periods.'
    ],
    relatedConcepts: ['CAGR', 'ROI', 'ANNUALIZED_RETURN'],
    commonQuestions: ['What is absolute return?', 'Difference between absolute return and CAGR']
  },
  {
    id: 'ANNUALIZED_RETURN',
    name: 'Annualized Return',
    aliases: ['annualized return', 'annual return', 'per annum return', 'annualized percentage return', 'p.a. return'],
    domain: 'FINANCIAL_CALCULATIONS',
    category: 'CALCULATIONS',
    definition: 'Annualized Return scales the cumulative return of an investment to an equivalent 12-month (per annum) period, allowing meaningful comparisons between investments held for different durations.',
    howItWorks: [
      'For periods over 1 year: uses the CAGR geometric formula: `(Ending Value / Beginning Value) ^ (1 / Years) - 1`.',
      'For short periods under 1 year: simple scaling is `(Absolute Return) * (365 / Holding Days)`.',
      'Ensures a 6-month trade and a 4-year holding can be evaluated side-by-side on an annual standard.'
    ],
    whyItMatters: [
      'Prevents apples-to-oranges comparisons across diverse financial assets.',
      'Essential for evaluating mutual fund performance against annual benchmarks like Nifty 50 TRI.'
    ],
    example: 'Making 6% in 3 months annualizes to approximately 24% p.a., while making 20% over 5 years annualizes to only 3.71% p.a.',
    keyPoints: [
      'Annualizing extremely short periods (e.g. 2 days) creates absurd, unrealistic percentage rates.',
      'CAGR is the preferred geometric annualized return metric.'
    ],
    risks: [
      'Short-term annualized rates should not be extrapolated as guaranteed future multi-year performance.'
    ],
    relatedConcepts: ['CAGR', 'ABSOLUTE_RETURN', 'ROI'],
    commonQuestions: ['What is annualized return?', 'How to annualize investment returns?']
  },
  {
    id: 'SIP_FUTURE_VALUE',
    name: 'SIP Future Value',
    aliases: ['sip future value', 'sip maturity value', 'sip calculation', 'sip returns formula', 'sip compounding value'],
    domain: 'FINANCIAL_CALCULATIONS',
    category: 'CALCULATIONS',
    definition: 'SIP Future Value is the projected terminal wealth accumulated through disciplined, recurring periodic monthly contributions compounding over time at an assumed rate of return.',
    howItWorks: [
      'Calculated using the annuity formula: `FV = P * [((1 + i)^n - 1) / i] * (1 + i)`, where P is monthly deposit, i is monthly interest rate (`Annual Rate / 12`), and n is total months (`Years * 12`).',
      'Each monthly installment has its own separate compounding duration: the first installment compounds for the full tenure, while the last installment compounds for only 1 month.'
    ],
    whyItMatters: [
      'Shows how modest, manageable monthly savings transform into multi-crore wealth through regular compounding.',
      'Forms the foundation of financial goal planning for children’s education, home purchases, and retirement.'
    ],
    example: 'Investing ₹10,000/month for 15 years at an expected 12% annual return requires ₹18 Lakhs total capital invested and grows to a future value of approximately ₹50.45 Lakhs.',
    keyPoints: [
      'Step-up SIPs (increasing monthly contribution by 10% each year) can double your final future corpus.',
      'The compounding effect accelerates dramatically in the final 5 years of any multi-decade SIP.'
    ],
    risks: [
      'Market returns fluctuate unpredictably; future values are projections, not contractual guarantees.'
    ],
    relatedConcepts: ['SIP', 'COMPOUNDING', 'MUTUAL_FUND', 'CAGR'],
    commonQuestions: ['What is SIP future value?', 'How to calculate SIP maturity amount?', 'How much will 5000 monthly SIP become in 10 years?']
  },
  {
    id: 'INFLATION_ADJUSTED_VALUE',
    name: 'Inflation-Adjusted Future Value',
    aliases: ['inflation adjusted value', 'purchasing power value', 'real future value', 'future cost of living'],
    domain: 'FINANCIAL_CALCULATIONS',
    category: 'CALCULATIONS',
    definition: 'Inflation-Adjusted Value calculates the actual future purchasing power of money or the future required cost of an expense after accounting for cumulative inflation over time.',
    howItWorks: [
      'Future Cost formula: `Future Cost = Present Cost * (1 + Inflation Rate)^Years`.',
      'Discounting to Present Value: `Real Value = Future Money / (1 + Inflation Rate)^Years`.',
      'Shows how much a goal that costs ₹50 Lakhs today will actually require in 15 or 20 years.'
    ],
    whyItMatters: [
      'Prevents under-saving: targeting a ₹1 Crore corpus 25 years from now will only have the purchasing power of ~₹23 Lakhs today at 6% inflation.',
      'Essential for realistic long-term education, wedding, and retirement goal modeling.'
    ],
    example: 'College tuition costing ₹20 Lakhs today will require ₹51.8 Lakhs in 15 years assuming a conservative 6.5% education inflation rate.',
    keyPoints: [
      'Rule of 72: divide 72 by the inflation rate to determine how many years it takes for prices to double (at 6% inflation, costs double in 12 years).',
      'Always calculate long-term financial targets using inflation-adjusted estimates.'
    ],
    risks: [
      'Lifestyle and medical inflation often significantly exceeds headline CPI.'
    ],
    relatedConcepts: ['INFLATION', 'REAL_RETURN', 'COMPOUNDING', 'RETIREMENT_PLANNING'],
    commonQuestions: ['What is inflation adjusted value?', 'How does inflation affect future savings?', 'How to calculate future cost with inflation?']
  },
  {
    id: 'DRAWDOWN',
    name: 'Drawdown (Maximum Drawdown - MDD)',
    aliases: ['drawdown', 'maximum drawdown', 'mdd', 'portfolio drawdown', 'peak to trough decline', 'peak drawdown'],
    domain: 'FINANCIAL_CALCULATIONS',
    category: 'CALCULATIONS',
    definition: 'Drawdown measures the peak-to-trough percentage decline in the value of an investment portfolio or asset during a specific continuous period before a new peak is reached.',
    howItWorks: [
      'Calculated as: `Drawdown (%) = ((Trough Value - Peak Value) / Peak Value) * 100`.',
      'Maximum Drawdown (MDD) records the single worst observed historical crash from all-time highs.',
      'Evaluates the downside capital risk an investor must endure.'
    ],
    whyItMatters: [
      'Crucial risk metric: two mutual funds might both show a 12% CAGR, but one had a maximum drawdown of 15% while the other suffered a gut-wrenching 55% drawdown.',
      'Measures recovery hurdle: a 50% drawdown requires a subsequent 100% gain just to break even.'
    ],
    example: 'A portfolio rises to ₹10 Lakhs, plunges to ₹7 Lakhs during a bear market, and then recovers. The drawdown is -30.0% (`((7 - 10) / 10) * 100`).',
    keyPoints: [
      'Assists investors in selecting strategies compatible with their psychological threshold for pain.',
      'Asset allocation and stop-losses limit severe drawdowns.'
    ],
    risks: [
      'Severe drawdowns cause investors to abandon disciplined long-term plans at the worst possible time.'
    ],
    relatedConcepts: ['VOLATILITY', 'RISK_TOLERANCE', 'BEAR_MARKET', 'RISK_REWARD'],
    commonQuestions: ['What is drawdown in finance?', 'What is maximum drawdown?', 'How to recover from a 50% drawdown?']
  }
];

// ============================================================================
// 2. CONCEPT COMPARISONS LIBRARY
// ============================================================================

export const CONCEPT_COMPARISONS: ConceptComparison[] = [
  {
    id: 'ETF_VS_MUTUAL_FUND',
    concept1Id: 'ETF',
    concept2Id: 'MUTUAL_FUND',
    name: 'ETF vs Mutual Fund',
    aliases: [
      'etf vs mutual fund', 'mutual fund vs etf', 'etf vs mf', 'etfs vs mutual funds',
      'difference between etf and mutual fund', 'which is better etf or mutual fund'
    ],
    summary: 'ETFs trade real-time throughout the day on stock exchanges like individual shares with lower expense ratios, while traditional Mutual Funds transact only at the end-of-day NAV without requiring a Demat account.',
    differences: [
      {
        aspect: 'Trading Mechanism',
        concept1Value: 'Traded continuously intraday on stock exchanges (NSE/BSE) at live market prices with limit orders.',
        concept2Value: 'Bought or redeemed directly via AMC at the single end-of-day closing NAV (typically by 9:00 PM).'
      },
      {
        aspect: 'Demat Account Requirement',
        concept1Value: 'Mandatory: Requires a Demat and Trading account with a broker.',
        concept2Value: 'Optional: Can be held in non-demat statement of account (SoA) format via apps or AMC portal.'
      },
      {
        aspect: 'Expense Ratio (TER)',
        concept1Value: 'Typically ultra-low (0.05% to 0.30% for broad indices).',
        concept2Value: 'Direct plans: 0.10% to 1.0%; Regular plans: 1.0% to 2.2%.'
      },
      {
        aspect: 'SIP Automation',
        concept1Value: 'Requires stock-SIP features at broker; can incur minor brokerage and slippage.',
        concept2Value: 'Seamless native automated bank debit (NACH/e-mandate) on chosen dates without slippage.'
      },
      {
        aspect: 'Liquidity Risk',
        concept1Value: 'Subject to secondary market trading volume and bid-ask spreads; illiquid ETFs can trade away from iNAV.',
        concept2Value: 'Direct liquidity with the AMC: transactions execute at verified NAV regardless of market volume.'
      }
    ],
    verdict: 'Choose Index Mutual Funds if you want hassle-free automated monthly SIPs without a Demat account; choose ETFs if you already have a Demat account, want intraday trading flexibility, and seek the lowest possible expense ratios.'
  },
  {
    id: 'SIP_VS_LUMPSUM',
    concept1Id: 'SIP',
    concept2Id: 'LUMPSUM',
    name: 'SIP vs Lumpsum',
    aliases: [
      'sip vs lumpsum', 'lumpsum vs sip', 'sip versus lumpsum', 'lump sum vs sip',
      'difference between sip and lumpsum', 'should i invest sip or lumpsum'
    ],
    summary: 'A SIP spreads investments across regular monthly installments to benefit from rupee-cost averaging and eliminate timing risk, whereas a Lumpsum deploys the entire capital upfront, maximizing market exposure time.',
    differences: [
      {
        aspect: 'Deployment Strategy',
        concept1Value: 'Staggered: Fixed amounts invested at recurring intervals (e.g. ₹5,000 monthly).',
        concept2Value: 'One-time: Entire capital sum deployed immediately in a single transaction.'
      },
      {
        aspect: 'Market Timing Risk',
        concept1Value: 'Zero timing risk: Automatically buys more units during market dips and fewer at peaks (Rupee Cost Averaging).',
        concept2Value: 'High timing risk: Deploying right before a sharp market crash results in temporary drawdowns.'
      },
      {
        aspect: 'Bull Market Performance',
        concept1Value: 'May lag lumpsum in a secular one-way bull market because later installments enter at higher NAVs.',
        concept2Value: 'Maximizes compounding returns when invested at reasonable or undervalued market levels.'
      },
      {
        aspect: 'Psychological Discipline',
        concept1Value: 'High: Removes emotional hesitation, building automated savings habits from salary cash flows.',
        concept2Value: 'Requires emotional fortitude to endure short-term paper drawdowns on a large capital block.'
      }
    ],
    verdict: 'Use SIPs for monthly salary income to automate long-term wealth building; use Lumpsum (or a 6-month Systematic Transfer Plan - STP) when you receive a large windfall, bonus, or sale proceeds.'
  },
  {
    id: 'DIRECT_VS_REGULAR',
    concept1Id: 'DIRECT_PLAN',
    concept2Id: 'REGULAR_PLAN',
    name: 'Direct vs Regular Mutual Funds',
    aliases: [
      'direct vs regular', 'regular vs direct', 'direct mutual fund vs regular',
      'difference between direct and regular mutual fund', 'why choose direct plan'
    ],
    summary: 'Direct plans bypass distributor commissions, resulting in a lower expense ratio and higher daily NAV, while Regular plans include ongoing trail commissions paid to the intermediary.',
    differences: [
      {
        aspect: 'Intermediary Commission',
        concept1Value: '0% distributor commission: AMC pays nothing to any broker or distributor.',
        concept2Value: '0.5% to 1.5% annual trail commission paid to the distributor for as long as you stay invested.'
      },
      {
        aspect: 'Expense Ratio',
        concept1Value: 'Substantially lower (typically 0.5% to 1.2% cheaper per year).',
        concept2Value: 'Higher, directly deducting commission costs from your portfolio assets.'
      },
      {
        aspect: 'Annualized Returns',
        concept1Value: 'Consistently delivers 0.5% to 1.5% higher net annualized CAGR every year.',
        concept2Value: 'Lower net CAGR due to drag from ongoing embedded commissions.'
      },
      {
        aspect: 'Compounded Long-term Impact',
        concept1Value: 'Maximizes final wealth: a 1% difference over 25 years can add 20%+ to your final corpus.',
        concept2Value: 'Cumulative commission deductions erode substantial potential wealth over multi-decade horizons.'
      }
    ],
    verdict: 'Direct plans are the definitive recommendation for all self-directed and digitally savvy investors. Only choose Regular plans if you genuinely receive ongoing, high-quality, comprehensive financial planning from a licensed distributor.'
  },
  {
    id: 'STOCK_VS_BOND',
    concept1Id: 'IPO',
    concept2Id: 'BOND',
    name: 'Stock vs Bond',
    aliases: [
      'stock vs bond', 'stocks vs bonds', 'equity vs debt', 'equity vs bond',
      'difference between stock and bond', 'should i invest in stocks or bonds'
    ],
    summary: 'Stocks represent fractional equity ownership in a corporation with high growth potential and higher volatility, while Bonds represent a formal debt loan to a borrower offering contractual periodic interest and capital preservation.',
    differences: [
      {
        aspect: 'Nature of Investment',
        concept1Value: 'Equity Ownership: You are a part-owner of the company.',
        concept2Value: 'Debt Lending: You are a creditor lending money to the issuer.'
      },
      {
        aspect: 'Return Potential',
        concept1Value: 'High long-term capital appreciation and dividend growth (historically 12-15% CAGR in India).',
        concept2Value: 'Fixed, predictable coupon interest plus principal repayment (typically 6.5-8.5% yield).'
      },
      {
        aspect: 'Volatility & Risk',
        concept1Value: 'High volatility: Share prices can fluctuate wildly and drop 20-50% during bear markets.',
        concept2Value: 'Low to moderate volatility: Higher certainty, lower drawdowns, sovereign backing for G-Secs.'
      },
      {
        aspect: 'Liquidation Priority',
        concept1Value: 'Last in line: Equity holders receive residual assets only after all creditors are paid in bankruptcy.',
        concept2Value: 'Priority claim: Bondholders must be repaid before any equity shareholder receives a rupee.'
      }
    ],
    verdict: 'Do not choose one over the other: combine both through disciplined Asset Allocation. Equities build long-term purchasing power and beat inflation, while Bonds stabilize the portfolio and fund short-to-medium-term goals.'
  },
  {
    id: 'FD_VS_BOND',
    concept1Id: 'FIXED_DEPOSIT',
    concept2Id: 'BOND',
    name: 'Fixed Deposit (FD) vs Bond',
    aliases: [
      'fd vs bond', 'bond vs fd', 'fixed deposit vs bond', 'bank fd vs government bond',
      'difference between fd and bond', 'is bond better than fd'
    ],
    summary: 'Bank Fixed Deposits provide guaranteed, non-tradable returns insured up to ₹5 Lakhs, while Bonds are tradable debt instruments whose secondary market prices fluctuate with interest rate movements.',
    differences: [
      {
        aspect: 'Tradability & Liquidity',
        concept1Value: 'Non-tradable: Must be broken or liquidated with the bank (often with 0.5-1% penalty).',
        concept2Value: 'Tradable on exchanges: Can be sold anytime in the secondary market at prevailing market prices.'
      },
      {
        aspect: 'Price Sensitivity',
        concept1Value: 'Zero capital fluctuation: Your principal does not change regardless of rate swings.',
        concept2Value: 'Price moves inversely with interest rates: Can generate capital gains when rates fall.'
      },
      {
        aspect: 'Default Safety',
        concept1Value: 'Backed by bank balance sheet and DICGC insurance up to ₹5,00,000 per depositor per bank.',
        concept2Value: 'Government bonds (G-Secs) possess absolute sovereign backing with zero default risk for any amount.'
      },
      {
        aspect: 'Tenure Range',
        concept1Value: 'Typically 7 days up to 10 years.',
        concept2Value: 'Can span from 91 days (T-Bills) up to 30 or 40 years for long-term sovereign paper.'
      }
    ],
    verdict: 'Use Bank FDs for short-term emergency liquidity (under 1-3 years); use Government Bonds or Target Maturity Debt Index Funds for long-term fixed income allocations (5-10+ years).'
  },
  {
    id: 'LARGE_CAP_VS_MID_CAP',
    concept1Id: 'MARKET_CAP',
    concept2Id: 'MARKET_CAP',
    name: 'Large Cap vs Mid Cap Stocks',
    aliases: [
      'large cap vs mid cap', 'mid cap vs large cap', 'large cap vs small cap',
      'difference between large cap and mid cap', 'which is better large cap or mid cap'
    ],
    summary: 'Large Cap companies are mature industry leaders offering stability and lower drawdowns, whereas Mid Cap companies are faster-growing emerging businesses with higher upside potential and higher volatility.',
    differences: [
      {
        aspect: 'Market Cap Definition',
        concept1Value: 'Top 100 companies by market capitalization on Indian exchanges (typically >₹20,000 Cr).',
        concept2Value: 'Companies ranked 101st to 250th by market cap (typically ₹5,000 Cr to ₹20,000 Cr).'
      },
      {
        aspect: 'Stability vs Growth',
        concept1Value: 'Established cash flows, market dominance, and lower drawdowns during market crashes.',
        concept2Value: 'Higher revenue and profit growth runway, but more vulnerable to economic slowdowns.'
      },
      {
        aspect: 'Volatility',
        concept1Value: 'Lower beta and orderly price trends.',
        concept2Value: 'Higher volatility with sharper rallies in bull markets and deeper pullbacks in bear markets.'
      },
      {
        aspect: 'Institutional Research',
        concept1Value: 'Heavily tracked by institutional analysts; mispricings are rarer.',
        concept2Value: 'Under-researched gems can offer superior alpha generation opportunities for active managers.'
      }
    ],
    verdict: 'Maintain Large Caps as the core anchor (50-70%) of your equity portfolio for stability, and allocate 20-30% to Mid Caps for accelerated long-term wealth compounding.'
  },
  {
    id: 'GROWTH_VS_VALUE',
    concept1Id: 'PE_RATIO',
    concept2Id: 'BOOK_VALUE',
    name: 'Growth vs Value Investing',
    aliases: [
      'growth vs value', 'value vs growth', 'growth investing vs value investing',
      'difference between growth and value investing'
    ],
    summary: 'Growth investing targets companies expanding revenues and earnings rapidly (often at high P/E multiples), while Value investing targets established companies trading at a discount to their intrinsic book value.',
    differences: [
      {
        aspect: 'Core Philosophy',
        concept1Value: 'Buy future potential: Invest in companies compounding sales and profits at above-average rates.',
        concept2Value: 'Buy margin of safety: Invest in out-of-favor companies trading below tangible asset worth or normal earnings.'
      },
      {
        aspect: 'Valuation Multiples',
        concept1Value: 'Higher P/E and P/B multiples; dividend yields are usually low or zero as cash is reinvested.',
        concept2Value: 'Lower P/E and P/B multiples; often accompanied by attractive dividend yields.'
      },
      {
        aspect: 'Risk Factor',
        concept1Value: 'Execution risk: If earnings miss elevated analyst estimates, the stock price crashes violently.',
        concept2Value: 'Value trap risk: Cheap stocks can remain cheap indefinitely if business fundamentals stay permanently impaired.'
      }
    ],
    verdict: 'A balanced blend (GARP - Growth at a Reasonable Price) captures the operational upside of expanding market leaders while protecting capital with sensible valuation discipline.'
  },
  {
    id: 'DIVIDEND_VS_GROWTH',
    concept1Id: 'DIVIDEND',
    concept2Id: 'PE_RATIO',
    name: 'Dividend vs Growth Investing',
    aliases: [
      'dividend vs growth', 'growth vs dividend', 'dividend investing vs growth investing',
      'difference between dividend and growth investing', 'dividend stocks vs growth stocks'
    ],
    summary: 'Dividend investing prioritizes immediate cash flow distributions and stable established blue-chips, while Growth investing prioritizes capital reinvestment and share price appreciation at the expense of current yield.',
    differences: [
      {
        aspect: 'Primary Objective',
        concept1Value: 'Passive income and cash flow generation from mature, cash-rich companies.',
        concept2Value: 'Rapid capital appreciation by compounding profits back into business expansion.'
      },
      {
        aspect: 'Payout Policy',
        concept1Value: 'Distributes 30% to 70%+ of net earnings as quarterly or annual dividends.',
        concept2Value: 'Distributes minimal or zero dividends; all free cash flow is reinvested into R&D and acquisitions.'
      },
      {
        aspect: 'Volatility & Downside',
        concept1Value: 'Lower volatility; high dividend yields provide a price floor during market downturns.',
        concept2Value: 'Higher volatility; sensitive to macroeconomic interest rates and quarterly revenue guidance.'
      },
      {
        aspect: 'Tax Friction',
        concept1Value: 'Dividends are taxed annually in the investor’s hands at marginal income slab rates.',
        concept2Value: 'Tax is deferred until shares are sold; benefits from long-term capital gains tax treatment.'
      }
    ],
    verdict: 'Early-stage and working investors building wealth generally benefit from Growth investing; retirees seeking predictable living cash flows benefit from Dividend-focused portfolios.'
  }
];

// ============================================================================
// 3. MACROECONOMIC RELATIONSHIPS LIBRARY
// ============================================================================

export const MACRO_RELATIONSHIPS: MacroRelationship[] = [
  {
    id: 'BOND_PRICES_VS_INTEREST_RATES',
    name: 'Bond Prices vs Interest Rates',
    aliases: [
      'why do bond prices fall when interest rates rise',
      'why do bond prices fall when rates rise',
      'relationship between bond prices and interest rates',
      'how do interest rates affect bond prices',
      'bond prices and yields inverse relationship'
    ],
    driver: 'Benchmark Interest Rates',
    target: 'Bond Market Prices',
    transmissionMechanics: [
      'Existing bonds carry fixed contractual coupon payments based on the rate environment when they were issued.',
      'When the central bank hikes benchmark rates, new bonds are issued with higher, more attractive coupon rates.',
      'To entice buyers, older bonds with lower coupon rates must fall in price on secondary exchanges until their effective Yield to Maturity (YTM) matches the new higher market rate.',
      'Conversely, when interest rates drop, existing higher-coupon bonds surge in price, creating capital gains.'
    ],
    realWorldLimitation: 'If an investor holds an individual high-quality bond until its final maturity date, intermediate secondary market price drops are irrelevant because the issuer repays full principal face value at par.',
    example: 'A ₹1,000 bond paying 7% interest drops to ₹950 when new bonds offer 8%, so that a buyer at ₹950 earns the equivalent 8% effective yield.'
  },
  {
    id: 'INFLATION_VS_INVESTMENTS',
    name: 'Inflation vs Investment Returns',
    aliases: [
      'how does inflation affect investments',
      'impact of inflation on stock market',
      'how inflation affects stock prices',
      'why is inflation bad for bonds',
      'inflation and purchasing power'
    ],
    driver: 'Consumer Price Inflation (CPI)',
    target: 'Real Portfolio Returns & Corporate Margins',
    transmissionMechanics: [
      'Inflation increases raw material, transport, and labor input costs; companies without strong pricing power suffer profit margin compression.',
      'Central banks respond to accelerating inflation by raising benchmark interest rates, which tightens systemic liquidity and lowers equity valuation multiples.',
      'Fixed-income assets suffering fixed coupon payouts lose real purchasing power (`Real Return = Nominal Yield - Inflation`).',
      'High-quality equities with pricing power (wide economic moats) pass cost spikes to consumers and outpace inflation over multi-year horizons.'
    ],
    realWorldLimitation: 'Moderate, predictable inflation (3-5%) is actually healthy and necessary for expanding consumer demand and corporate revenue growth.',
    example: 'During 7% inflation, a 7% bank FD produces 0% real pre-tax return, whereas an equity portfolio compounding at 13% preserves purchasing power.'
  },
  {
    id: 'CRUDE_OIL_VS_OMCS',
    name: 'Crude Oil vs Oil Marketing Companies (OMCs)',
    aliases: [
      'how does crude oil affect omcs',
      'crude oil impact on omc stocks',
      'why rising crude affects omc stocks',
      'brent crude impact on reliance ioc bpcl',
      'crude oil price and petrol diesel margins'
    ],
    driver: 'International Crude Oil (Brent/WTI)',
    target: 'Oil Marketing Companies (IOC, BPCL, HPCL, Reliance)',
    transmissionMechanics: [
      'Crude oil is the primary raw material input for downstream petroleum refiners and marketers.',
      'When international crude prices spike, refining raw material costs rise immediately.',
      'If retail pump fuel prices (petrol/diesel) are not increased proportionally due to government inflation controls or election sensitivities, OMC marketing margins turn negative.',
      'Conversely, when crude prices fall while retail pump prices remain stable, OMCs capture windfall marketing and refining margins.'
    ],
    realWorldLimitation: 'Integrated upstream/downstream refiners with complex petrochemical operations (like Reliance) can mitigate marketing losses through elevated Gross Refining Margins (GRMs) and export sales.',
    example: 'Brent crude jumping from $75 to $95 per barrel squeezes OMC marketing margins unless retail prices are allowed to rise.'
  },
  {
    id: 'USD_INR_VS_MARKETS',
    name: 'USD/INR Exchange Rate vs Indian Markets',
    aliases: [
      'how does usd inr affect indian investors',
      'impact of dollar on indian stock market',
      'weak rupee impact on stocks',
      'how rupee depreciation affects nifty',
      'usd inr relationship with indian equities'
    ],
    driver: 'USD/INR Currency Pair',
    target: 'Domestic Inflation & Sectoral Winners/Losers',
    transmissionMechanics: [
      'Import Heavy Sectors (Losers): India imports over 80% of its crude oil and electronics; a falling rupee widens the national trade deficit and sparks imported inflation.',
      'Export Oriented Sectors (Winners): IT services, pharmaceuticals, and textile exporters earn revenues in USD but incur costs in INR, boosting quarterly operating margins.',
      'Foreign Capital Flows: Sharp, disorderly rupee depreciation reduces dollar-adjusted returns for Foreign Institutional Investors (FIIs), often triggering equity outflows.'
    ],
    realWorldLimitation: 'Gradual, predictable rupee depreciation of 3-4% annually is already priced into long-term financial models and does not disrupt domestic corporate growth.',
    example: 'When the rupee weakens from ₹82 to ₹84 against the USD, Infosys and TCS record immediate currency translation tailwinds, while crude oil importers face higher rupee costs.'
  },
  {
    id: 'HIGHER_PE_VS_VALUATION',
    name: 'High P/E Ratio vs Valuation Expectations',
    aliases: [
      'why does higher pe indicate higher valuation',
      'why does a high pe matter',
      'what does a high pe multiple imply',
      'is high pe expensive',
      'high pe ratio risk'
    ],
    driver: 'High Price-to-Earnings (P/E) Multiple',
    target: 'Stock Valuation & Margin of Safety',
    transmissionMechanics: [
      'A high P/E ratio indicates that market participants are paying a substantial price premium per rupee of current earnings.',
      'Mathematically, a stock trading at 60x P/E is priced for perfection: the market assumes rapid, uninterrupted double-digit profit growth for years to come.',
      'If the company subsequently reports a single quarterly earnings slowdown or margin contraction, investors swiftly re-rate the multiple downward, causing sharp price drawdowns.'
    ],
    realWorldLimitation: 'A high P/E alone does not make a security an automatic sell; high-return capital compounders with massive total addressable markets (e.g. Titan, Asian Paints historically) have sustained elevated P/Es for decades.',
    example: 'A company trading at 80x P/E that grows profits by only 10% suffers a severe valuation de-rating, while one growing profits at 45% quickly normalizes its multiple.'
  },
  {
    id: 'PROFITS_VS_STOCK_PRICES',
    name: 'Corporate Profits vs Long-Term Stock Prices',
    aliases: [
      'why do company profits matter for stock prices',
      'how do earnings drive stock prices',
      'relationship between profits and stock returns',
      'why do earnings matter',
      'do stock prices follow earnings'
    ],
    driver: 'Corporate Net Earnings & Free Cash Flow',
    target: 'Long-Term Share Price Appreciation',
    transmissionMechanics: [
      'A share of stock represents a legal claim on a company’s future cash flows and residual assets.',
      'The intrinsic value of an equity security is mathematically equal to the discounted present value of all future cash flows it generates over its lifetime.',
      'In the short run, stock prices are driven by sentiment, interest rate headlines, and liquidity ("a voting machine").',
      'In the long run, stock prices inevitably track the compounding trajectory of underlying net profits and return on invested capital ("a weighing machine").'
    ],
    realWorldLimitation: 'If a company’s starting stock price was wildly overvalued during a speculative bubble, it can take years for rising earnings to catch up with the stock price before capital gains materialize.',
    example: 'If a company sustainably doubles its net profit every 5 years with a stable P/E multiple, its share price will naturally double alongside earnings.'
  }
];

// ============================================================================
// 4. NATURAL LANGUAGE MATCHING HELPERS
// ============================================================================

/**
 * Searches the deterministic finance concepts library for a matching concept.
 * Handles exact concept ID, exact name, aliases, and natural language query phrasing.
 */
export function findFinanceConcept(query: string): FinanceConcept | null {
  const clean = query
    .trim()
    .toLowerCase()
    .replace(/[/_-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');

  // 1. Direct exact alias matching — prefer longest matching alias to avoid shadowing
  let bestMatch: { concept: FinanceConcept; aliasLength: number } | null = null;

  for (const concept of FINANCE_CONCEPTS) {
    if (concept.id.toLowerCase() === clean) return concept;
    for (const alias of concept.aliases) {
      const cleanAlias = alias
        .toLowerCase()
        .replace(/[/_-]/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ');
      const regex = new RegExp(`\\b${cleanAlias}\\b`, 'i');
      if (regex.test(clean)) {
        if (!bestMatch || cleanAlias.length > bestMatch.aliasLength) {
          bestMatch = { concept, aliasLength: cleanAlias.length };
        }
      }
    }
  }

  if (bestMatch) {
    return bestMatch.concept;
  }

  // 2. Generic query pattern matching: "what is an X", "explain X", "X meaning", "how does X work"
  const patterns = [
    /\b(?:what is|what are|define|meaning of|what do you mean by)\s+(?:an?|the)?\s*([a-z0-9/]+(?:\s+[a-z0-9/]+)?)/i,
    /\b(?:explain|tell me about|how does|what happens in|how does a)\s+([a-z0-9/]+(?:\s+[a-z0-9/]+)?)/i,
    /\b([a-z0-9/]+(?:\s+[a-z0-9/]+)?)\s+(?:meaning|definition|explained|work|works)\b/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      for (const concept of FINANCE_CONCEPTS) {
        if (concept.id.toLowerCase() === candidate) return concept;
        if (concept.aliases.some((a) => a === candidate || new RegExp(`\\b${a}\\b`, 'i').test(candidate))) {
          return concept;
        }
      }
    }
  }

  return null;
}

/**
 * Searches the concept comparisons library for comparisons like "ETF vs Mutual Fund", "SIP vs Lumpsum".
 */
export function findConceptComparison(query: string): ConceptComparison | null {
  const clean = query.trim().toLowerCase().replace(/[^a-z0-9\s/]/g, ' ');

  for (const comp of CONCEPT_COMPARISONS) {
    for (const alias of comp.aliases) {
      const regex = new RegExp(`\\b${alias.replace(/\//g, '\\/')}\\b`, 'i');
      if (regex.test(clean)) {
        return comp;
      }
    }
  }

  // Match general "X vs Y" or "difference between X and Y"
  const vsMatch = clean.match(/\b([a-z0-9]+(?:\s+[a-z0-9]+)?)\s+(?:vs|versus|compared to|or)\s+([a-z0-9]+(?:\s+[a-z0-9]+)?)\b/i) ||
                  clean.match(/\bdifference between\s+([a-z0-9]+(?:\s+[a-z0-9]+)?)\s+and\s+([a-z0-9]+(?:\s+[a-z0-9]+)?)\b/i);

  if (vsMatch && vsMatch[1] && vsMatch[2]) {
    const term1 = vsMatch[1].trim();
    const term2 = vsMatch[2].trim();
    const c1 = findFinanceConcept(term1);
    const c2 = findFinanceConcept(term2);
    if (c1 && c2 && c1.id !== c2.id) {
      // Find a pre-defined comparison
      const match = CONCEPT_COMPARISONS.find(
        (c) =>
          (c.concept1Id === c1.id && c.concept2Id === c2.id) ||
          (c.concept1Id === c2.id && c.concept2Id === c1.id)
      );
      if (match) return match;

      // Dynamically build a comparison from the two concepts
      return {
        id: `${c1.id}_VS_${c2.id}`,
        concept1Id: c1.id,
        concept2Id: c2.id,
        name: `${c1.name} vs ${c2.name}`,
        aliases: [`${c1.name.toLowerCase()} vs ${c2.name.toLowerCase()}`],
        summary: `Comparing ${c1.name} (${c1.category}) with ${c2.name} (${c2.category}).`,
        differences: [
          {
            aspect: 'Primary Definition',
            concept1Value: c1.definition,
            concept2Value: c2.definition,
          },
          {
            aspect: 'Operational Mechanism',
            concept1Value: (c1.howItWorks && c1.howItWorks[0]) || 'Standard asset mechanism',
            concept2Value: (c2.howItWorks && c2.howItWorks[0]) || 'Standard asset mechanism',
          },
          {
            aspect: 'Strategic Purpose',
            concept1Value: (c1.whyItMatters && c1.whyItMatters[0]) || 'Strategic portfolio role',
            concept2Value: (c2.whyItMatters && c2.whyItMatters[0]) || 'Strategic portfolio role',
          },
        ],
        verdict: `Both ${c1.name} and ${c2.name} fulfill distinct financial objectives. Align selection with your horizon and risk tolerance.`,
      };
    }
  }

  return null;
}

/**
 * Searches the macroeconomic relationships library for queries like:
 * "Why do bond prices fall when interest rates rise?", "How does crude oil affect OMCs?"
 */
export function findMacroRelationship(query: string): MacroRelationship | null {
  const clean = query
    .trim()
    .toLowerCase()
    .replace(/[/_-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');

  for (const rel of MACRO_RELATIONSHIPS) {
    for (const alias of rel.aliases) {
      const cleanAlias = alias
        .toLowerCase()
        .replace(/[/_-]/g, ' ')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ');
      const regex = new RegExp(`\\b${cleanAlias}\\b`, 'i');
      if (regex.test(clean)) {
        return rel;
      }
    }
  }

  return null;
}
