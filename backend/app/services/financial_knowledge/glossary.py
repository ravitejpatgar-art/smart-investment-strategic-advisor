"""
SmartVest Financial Knowledge Glossary
Comprehensive dictionary of financial terminology, market concepts, instrument types, 
corporate actions, valuation multiples, and risk metrics.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass
class FinancialConcept:
    id: str
    title: str
    category: str
    aliases: List[str]
    summary: str
    content: str
    key_takeaways: List[str] = field(default_factory=list)
    follow_ups: List[str] = field(default_factory=list)
    related_concepts: List[str] = field(default_factory=list)
    formula: Optional[str] = None

# Comprehensive knowledge base repository with verified factual financial intelligence
FINANCIAL_GLOSSARY: Dict[str, FinancialConcept] = {
    # -------------------------------------------------------------
    # 1. CAPITAL MARKETS & PRIMARY ISSUES
    # -------------------------------------------------------------
    "ipo": FinancialConcept(
        id="ipo",
        title="Initial Public Offering (IPO)",
        category="Capital Markets",
        aliases=["ipo", "initial public offering", "public issue", "listing", "going public", "fresh issue"],
        summary="An IPO is the process where an unlisted private company offers shares to the public for the first time to raise capital and get listed on stock exchanges.",
        content=(
            "### Initial Public Offering (IPO)\n\n"
            "An **Initial Public Offering (IPO)** is the process by which a private company raises equity capital from institutional and retail public investors for the first time, listing its shares on stock exchanges like the NSE and BSE.\n\n"
            "#### How an IPO Works in India:\n"
            "1. **Draft Red Herring Prospectus (DRHP)**: Filed with SEBI disclosing business financials, risks, and use of proceeds.\n"
            "2. **Price Band & Bidding**: A price band (e.g. ₹450–₹480/share) is set with minimum lot sizes via ASBA (Application Supported by Blocked Amount) through UPI or NetBanking.\n"
            "3. **Allotment & Listing**: Shares are allotted proportionally or via lottery depending on oversubscription, followed by listing on stock exchanges.\n\n"
            "#### Key Components:\n"
            "- **Fresh Issue**: New shares issued by the company; capital goes into business expansion or debt repayment.\n"
            "- **Offer for Sale (OFS)**: Existing promoters/venture capital investors sell their shares; funds go to selling shareholders, not the company.\n\n"
            "#### Risks & Best Practices:\n"
            "- Beware of short-term listing gain hype and unverified Grey Market Premium (GMP).\n"
            "- Analyze Price-to-Earnings (P/E) valuation relative to listed industry peers."
        ),
        key_takeaways=[
            "Enables private companies to become publicly traded on NSE/BSE.",
            "Can consist of Fresh Issue (new capital) and Offer for Sale (OFS).",
            "Retail applications use ASBA via UPI mandate."
        ],
        follow_ups=[
            "How do I apply for an IPO via ASBA/UPI?",
            "What is the difference between Fresh Issue and Offer for Sale (OFS)?",
            "What is Grey Market Premium (GMP)?"
        ],
        related_concepts=["fpo", "ofs", "rights_issue", "stock"]
    ),
    "fpo": FinancialConcept(
        id="fpo",
        title="Follow-on Public Offering (FPO)",
        category="Capital Markets",
        aliases=["fpo", "follow-on public offer", "follow on public offering", "further issue"],
        summary="An FPO is an issuance of additional shares by an already publicly listed company to raise further capital from the market.",
        content=(
            "### Follow-on Public Offering (FPO)\n\n"
            "A **Follow-on Public Offering (FPO)** occurs when a company that is already listed on a stock exchange issues new shares or sells existing promoter shares to public investors.\n\n"
            "#### Key Differences from IPO:\n"
            "- **Listed Track Record**: The company already has an active market price, historical trading data, and quarterly filings.\n"
            "- **Dilution vs. Debt**: Allows companies to lower debt without taking expensive bank loans, though it may dilute existing shareholder EPS.\n\n"
            "#### Types of FPO:\n"
            "- **Dilutive FPO**: Company creates and issues new shares, expanding total share count.\n"
            "- **Non-Dilutive FPO**: Promoters or major stakeholders sell existing shares without increasing total share count."
        ),
        key_takeaways=["Occurs after a company is already listed", "Helps listed firms raise additional growth capital"],
        follow_ups=["What is the difference between an IPO and an FPO?", "How does an FPO impact existing stock price?"],
        related_concepts=["ipo", "rights_issue", "ofs"]
    ),
    "ofs": FinancialConcept(
        id="ofs",
        title="Offer for Sale (OFS)",
        category="Capital Markets",
        aliases=["ofs", "offer for sale"],
        summary="A transparent exchange-based mechanism enabling promoters and major shareholders of listed companies to reduce their holding.",
        content=(
            "### Offer for Sale (OFS)\n\n"
            "An **Offer for Sale (OFS)** is a fast-track mechanism provided by stock exchanges (NSE/BSE) allowing company promoters and institutional shareholders to sell down their stakes to the public or institutional buyers.\n\n"
            "#### Key Features:\n"
            "- **No Capital Infusion for the Company**: The proceeds go directly to selling shareholders, not to the company treasury.\n"
            "- **Fast Execution**: OFS bidding takes place over a 1 to 2 day trading window directly on exchange platforms.\n"
            "- **Floor Price & Retail Discount**: Promoters set a minimum floor price, often offering a 5% retail discount."
        ),
        key_takeaways=["Promoters sell existing shares; no new equity created", "Bidding takes place during normal trading hours"],
        follow_ups=["What is a promoter holding floor price?", "How to participate in an OFS as a retail investor?"],
        related_concepts=["ipo", "fpo", "buyback"]
    ),
    "rights_issue": FinancialConcept(
        id="rights_issue",
        title="Rights Issue",
        category="Corporate Actions",
        aliases=["rights issue", "rights entitlement", "re issue"],
        summary="An offering of rights to existing shareholders to buy additional shares directly from the company at a discounted price in proportion to their current holding.",
        content=(
            "### Rights Issue\n\n"
            "A **Rights Issue** gives existing shareholders the statutory right (not obligation) to purchase additional newly issued shares directly from the company at a discounted price before they are offered to the public.\n\n"
            "#### How it Works:\n"
            "- **Ratio**: Issued in a fixed ratio, e.g., 1:4 (1 rights share for every 4 shares owned).\n"
            "- **Rights Entitlements (REs)**: Credited to demat accounts and can be exercised or traded on the exchange.\n"
            "- **Shareholder Choice**: Shareholders can exercise rights, renounce (sell) their rights entitlements, or let them lapse."
        ),
        key_takeaways=["Exclusive offering to existing shareholders", "Often priced at a discount to current market price"],
        follow_ups=["What are Rights Entitlements (RE)?", "What happens if I ignore a rights issue?"],
        related_concepts=["bonus_issue", "fpo", "stock_split"]
    ),
    "bonus_issue": FinancialConcept(
        id="bonus_issue",
        title="Bonus Shares / Bonus Issue",
        category="Corporate Actions",
        aliases=["bonus issue", "bonus shares", "bonus share", "scrip dividend"],
        summary="Additional free shares given to existing shareholders in proportion to their existing holdings, funded from company reserves.",
        content=(
            "### Bonus Issue (Free Shares)\n\n"
            "A **Bonus Issue** is an allocation of additional shares given to existing shareholders for free, proportionate to their current ownership, funded by capitalizing the company's retained reserves.\n\n"
            "#### Impact on Investor & Stock Price:\n"
            "- **Total Investment Value Remains Same**: A 1:1 bonus doubles your shares, but the market price adjusts by half on the ex-bonus date.\n"
            "- **Improves Liquidity**: Makes the share price more accessible to retail traders.\n"
            "- **Tax Advantage**: Bonus shares have zero acquisition cost for capital gains calculations."
        ),
        key_takeaways=["Given free of cost from company free reserves", "Stock price adjusts downward proportionately on ex-date"],
        follow_ups=["What is the difference between a bonus issue and a stock split?", "How are bonus shares taxed in India?"],
        related_concepts=["stock_split", "dividend", "buyback"]
    ),
    "stock_split": FinancialConcept(
        id="stock_split",
        title="Stock Split",
        category="Corporate Actions",
        aliases=["stock split", "share split", "sub-division of shares"],
        summary="A corporate action dividing existing shares into multiple shares to lower the per-share price and improve liquidity, reducing the face value.",
        content=(
            "### Stock Split\n\n"
            "A **Stock Split** subdivides a company's existing shares into multiple units, reducing the nominal face value (e.g. from ₹10 to ₹2 or ₹1) without altering overall market capitalization or shareholder net worth.\n\n"
            "#### Why Companies Split Stocks:\n"
            "- **Affordability**: A ₹5,000 stock splitting 10-for-1 becomes ₹500, attracting retail participation.\n"
            "- **Liquidity**: Higher share volume eases buying and selling spreads on stock exchanges."
        ),
        key_takeaways=["Reduces face value and per-share market price", "Market capitalization and fundamental value remain unchanged"],
        follow_ups=["What is Face Value vs Market Value?", "How does a stock split differ from a bonus issue?"],
        related_concepts=["bonus_issue", "market_cap", "dividend"]
    ),
    "buyback": FinancialConcept(
        id="buyback",
        title="Share Buyback / Repurchase",
        category="Corporate Actions",
        aliases=["buyback", "share buyback", "stock repurchase", "tender offer buyback"],
        summary="When a company repurchases its own shares from shareholders, reducing outstanding shares and boosting EPS and Return on Equity.",
        content=(
            "### Share Buyback\n\n"
            "A **Share Buyback** (or stock repurchase) occurs when a cash-rich company purchases its own outstanding shares from the open market or via a tender offer, subsequently extinguishing those shares.\n\n"
            "#### Benefits:\n"
            "- **Boosts Financial Ratios**: Fewer outstanding shares increases Earnings Per Share (EPS) and Return on Equity (ROE).\n"
            "- **Sign of Confidence**: Indicates management believes its shares are undervalued.\n"
            "- **Tax Efficient Capital Return**: Alternate route to distribute excess cash compared to dividends."
        ),
        key_takeaways=["Company buys and extinguishes its own shares", "Increases EPS and ownership stake for remaining shareholders"],
        follow_ups=["What is a Tender Offer vs Open Market Buyback?", "How are buybacks taxed in India?"],
        related_concepts=["dividend", "eps", "roe"]
    ),
    "dividend": FinancialConcept(
        id="dividend",
        title="Dividend & Dividend Yield",
        category="Corporate Actions",
        aliases=["dividend", "dividend yield", "interim dividend", "final dividend", "dividends"],
        summary="A portion of company net profits distributed directly to shareholders as a cash payout, measured by Dividend Yield.",
        content=(
            "### Dividend & Dividend Yield\n\n"
            "A **Dividend** is a direct cash payment made by a profitable company to its shareholders from its retained earnings.\n\n"
            "#### Key Terms:\n"
            "- **Record Date & Ex-Dividend Date**: You must own shares before the ex-date to receive the payout.\n"
            "- **Dividend Yield**: Formula = `(Annual Dividend per Share / Current Market Price) * 100`.\n"
            "- **Taxation in India**: Dividends are added to taxable income and taxed at the investor's slab rate, with 10% TDS for amounts > ₹5,000."
        ),
        key_takeaways=["Direct cash distribution of corporate profits", "Dividend Yield = Annual Dividend / Stock Price * 100", "Taxed at your marginal income tax slab"],
        follow_ups=["What is the difference between Growth and Dividend Mutual Funds?", "What is a good dividend yield?"],
        related_concepts=["buyback", "eps", "free_cash_flow"]
    ),

    # -------------------------------------------------------------
    # 2. VALUATION MULTIPLES & FUNDAMENTALS
    # -------------------------------------------------------------
    "pe_ratio": FinancialConcept(
        id="pe_ratio",
        title="Price-to-Earnings Ratio (P/E Ratio)",
        category="Valuation",
        aliases=["pe", "pe ratio", "p/e", "price to earnings", "price earnings ratio", "trailing pe", "forward pe"],
        summary="A core valuation metric comparing a company's current share price to its Earnings Per Share (EPS), showing how much investors pay per ₹1 of earnings.",
        content=(
            "### Price-to-Earnings Ratio (P/E Ratio)\n\n"
            "The **P/E Ratio** measures the market price of a stock relative to its per-share earnings. It tells you how much investors are willing to pay for every ₹1 of profit the company generates.\n\n"
            "#### Formula:\n"
            "$$\\text{P/E Ratio} = \\frac{\\text{Current Market Price (CMP)}}{\\text{Earnings Per Share (EPS)}}$$\n\n"
            "#### Interpretation:\n"
            "- **High P/E**: Markets expect high future growth (or the stock is overvalued).\n"
            "- **Low P/E**: Company may be undervalued (value opportunity) or experiencing structural headwinds (value trap).\n"
            "- **Benchmark**: Always compare P/E against the industry sector average and historical 5-year averages."
        ),
        formula="P/E = Market Price / EPS",
        key_takeaways=[
            "Measures valuation: price paid per ₹1 of company earnings.",
            "Compare with industry peers, not across unrelated sectors.",
            "Trailing P/E uses past 12 months; Forward P/E uses estimated future earnings."
        ],
        follow_ups=["What is a good P/E ratio for Indian stocks?", "What is the difference between Trailing P/E and Forward P/E?", "What is P/B ratio?"],
        related_concepts=["pb_ratio", "eps", "roe", "market_cap"]
    ),
    "pb_ratio": FinancialConcept(
        id="pb_ratio",
        title="Price-to-Book Ratio (P/B Ratio)",
        category="Valuation",
        aliases=["pb", "pb ratio", "p/b", "price to book", "price to book value"],
        summary="Compares a company's market price to its book value (net assets), commonly used to value banks, NBFCs, and asset-heavy industries.",
        content=(
            "### Price-to-Book Ratio (P/B Ratio)\n\n"
            "The **P/B Ratio** compares a company's market capitalization to its net asset value (Book Value = Total Assets minus Total Liabilities).\n\n"
            "#### Formula:\n"
            "$$\\text{P/B Ratio} = \\frac{\\text{Stock Price}}{\\text{Book Value Per Share (BVPS)}}$$\n\n"
            "#### When to Use:\n"
            "- Crucial for capital-intensive companies, Banks, NBFCs, and manufacturing.\n"
            "- P/B < 1.0 indicates a stock trading below its liquidation net asset value."
        ),
        formula="P/B = Stock Price / Book Value Per Share",
        key_takeaways=["Measures price relative to net balance sheet assets", "Standard metric for financial institutions and banks"],
        follow_ups=["Why is P/B ratio used for banking stocks?", "What does P/B < 1 indicate?"],
        related_concepts=["pe_ratio", "roe", "roce"]
    ),
    "eps": FinancialConcept(
        id="eps",
        title="Earnings Per Share (EPS)",
        category="Valuation",
        aliases=["eps", "earnings per share", "diluted eps"],
        summary="A company's net profit divided by total outstanding common shares, serving as the foundational building block for stock valuation.",
        content=(
            "### Earnings Per Share (EPS)\n\n"
            "**Earnings Per Share (EPS)** represents the portion of a company's net income allocated to each outstanding share of common stock.\n\n"
            "#### Formula:\n"
            "$$\\text{EPS} = \\frac{\\text{Net Profit after Tax - Preferred Dividends}}{\\text{Total Number of Outstanding Shares}}$$\n\n"
            "#### Why EPS Matters:\n"
            "- Consistent year-on-year EPS growth is the single biggest driver of long-term stock price appreciation."
        ),
        formula="EPS = (Net Profit - Preferred Dividends) / Outstanding Shares",
        key_takeaways=["Core indicator of company profitability", "Direct input for P/E valuation"],
        follow_ups=["What is Basic EPS vs Diluted EPS?", "How does EPS growth impact share price?"],
        related_concepts=["pe_ratio", "roe", "dividend"]
    ),
    "roe": FinancialConcept(
        id="roe",
        title="Return on Equity (ROE)",
        category="Valuation",
        aliases=["roe", "return on equity"],
        summary="Measures how efficiently a company generates profits from shareholders' equity capital.",
        content=(
            "### Return on Equity (ROE)\n\n"
            "**Return on Equity (ROE)** gauges a company's profitability by revealing how much profit a company produces with the money shareholders have invested.\n\n"
            "#### Formula:\n"
            "$$\\text{ROE} = \\left(\\frac{\\text{Net Income}}{\\text{Shareholders' Equity}}\\right) \\times 100$$\n\n"
            "#### Benchmark:\n"
            "- Strong, compounding businesses in India typically maintain an ROE above 15%–20% consistently."
        ),
        formula="ROE = (Net Income / Shareholders Equity) * 100",
        key_takeaways=["Measures management efficiency in deploying equity", "Values above 15% generally indicate strong pricing power"],
        follow_ups=["What is the difference between ROE and ROCE?", "What is DuPont Analysis?"],
        related_concepts=["roce", "eps", "free_cash_flow"]
    ),
    "roce": FinancialConcept(
        id="roce",
        title="Return on Capital Employed (ROCE)",
        category="Valuation",
        aliases=["roce", "return on capital employed"],
        summary="Measures profitability relative to total capital (both equity and long-term debt) deployed in the business.",
        content=(
            "### Return on Capital Employed (ROCE)\n\n"
            "**ROCE** measures how efficiently a company generates operating profits from its entire capital base, including both equity and debt.\n\n"
            "#### Formula:\n"
            "$$\\text{ROCE} = \\frac{\\text{EBIT (Operating Profit)}}{\\text{Total Assets} - \\text{Current Liabilities}} \\times 100$$\n\n"
            "#### Why ROCE is Superior for Debt-Heavy Firms:\n"
            "- Unlike ROE, ROCE cannot be artificially inflated by taking on dangerous amounts of debt."
        ),
        formula="ROCE = EBIT / (Total Assets - Current Liabilities)",
        key_takeaways=["Evaluates returns on both equity and debt capital", "Essential metric for capital-heavy and infrastructure firms"],
        follow_ups=["Why is ROCE better than ROE for capital-intensive companies?", "What is a healthy ROCE threshold?"],
        related_concepts=["roe", "debt_to_equity", "free_cash_flow"]
    ),
    "free_cash_flow": FinancialConcept(
        id="free_cash_flow",
        title="Free Cash Flow (FCF)",
        category="Valuation",
        aliases=["free cash flow", "fcf", "operating cash flow", "cash flow"],
        summary="The actual cash generated by a business after accounting for operating expenses and capital expenditures (CapEx).",
        content=(
            "### Free Cash Flow (FCF)\n\n"
            "**Free Cash Flow (FCF)** is the cash a company generates after supporting operations and maintaining its capital assets.\n\n"
            "#### Formula:\n"
            "$$\\text{FCF} = \\text{Cash Flow from Operations (CFO)} - \\text{Capital Expenditures (CapEx)}$$\n\n"
            "#### Why it is the 'Gold Standard':\n"
            "- Unlike accounting net profit (which can be distorted by accruals), cash flow reflects real money available to pay dividends, reduce debt, or fund acquisitions."
        ),
        formula="FCF = Cash from Operations - CapEx",
        key_takeaways=["Real cash remaining after CapEx investments", "Hard to manipulate compared to accounting net profit"],
        follow_ups=["What is Free Cash Flow Yield?", "What is the difference between Net Income and Cash Flow?"],
        related_concepts=["dividend", "roce", "pe_ratio"]
    ),
    "debt_to_equity": FinancialConcept(
        id="debt_to_equity",
        title="Debt-to-Equity Ratio (D/E)",
        category="Valuation",
        aliases=["debt to equity", "d/e", "debt equity ratio", "leverage ratio"],
        summary="A solvency metric comparing a company's total liabilities to shareholder equity, indicating financial leverage and risk.",
        content=(
            "### Debt-to-Equity Ratio (D/E)\n\n"
            "The **Debt-to-Equity (D/E) Ratio** calculates the proportion of company financing that comes from creditors versus shareholders.\n\n"
            "#### Interpretation:\n"
            "- **D/E < 0.5**: Low debt / nearly debt-free (strong balance sheet safety).\n"
            "- **D/E > 1.5–2.0**: High financial leverage; company must generate consistent cash flow to service interest payments."
        ),
        formula="D/E = Total Debt / Total Shareholders Equity",
        key_takeaways=["Measures company leverage and solvency risk", "Lower D/E signifies greater resilience during economic slowdowns"],
        follow_ups=["What is an interest coverage ratio?", "Why do banks operate with higher D/E ratios?"],
        related_concepts=["roce", "risk", "free_cash_flow"]
    ),
    "market_cap": FinancialConcept(
        id="market_cap",
        title="Market Capitalization (Market Cap)",
        category="Valuation",
        aliases=["market cap", "market capitalization", "large cap", "mid cap", "small cap", "micro cap"],
        summary="The total market value of a publicly traded company's outstanding shares.",
        content=(
            "### Market Capitalization\n\n"
            "**Market Capitalization** represents the total equity valuation of a company in the stock market.\n\n"
            "#### Formula:\n"
            "$$\\text{Market Cap} = \\text{Current Share Price} \\times \\text{Total Outstanding Shares}$$\n\n"
            "#### SEBI Categorization in India:\n"
            "- **Large Cap**: Top 100 companies by market cap (e.g. Reliance, TCS, HDFC Bank). High stability.\n"
            "- **Mid Cap**: 101st to 250th companies. Higher growth, moderate volatility.\n"
            "- **Small Cap**: 251st company onwards. High growth potential, elevated volatility and risk."
        ),
        formula="Market Cap = Share Price * Total Outstanding Shares",
        key_takeaways=["Total value of company's equity", "Categorized by SEBI into Large Cap (Top 100), Mid Cap (101-250), Small Cap (251+)"],
        follow_ups=["What is Free Float Market Cap?", "How does market cap affect portfolio risk?"],
        related_concepts=["stock", "index_fund", "etf"]
    ),

    # -------------------------------------------------------------
    # 3. RISK & PERFORMANCE METRICS
    # -------------------------------------------------------------
    "beta": FinancialConcept(
        id="beta",
        title="Beta (Volatility Metric)",
        category="Risk Metrics",
        aliases=["beta", "stock beta", "market beta"],
        summary="A statistical measure of a stock or fund's volatility in comparison to the overall market benchmark (e.g. Nifty 50).",
        content=(
            "### Beta ($\beta$)\n\n"
            "**Beta** measures how sensitive a stock or portfolio is to movements in the broader market benchmark.\n\n"
            "#### Values:\n"
            "- **Beta = 1.0**: Moves in tandem with the market.\n"
            "- **Beta > 1.0 (High Beta)**: More volatile than the market (e.g., Beta 1.5 means if Nifty falls 2%, stock may fall 3%).\n"
            "- **Beta < 1.0 (Low Beta)**: Less volatile and defensive (e.g., FMCG, Utilities)."
        ),
        key_takeaways=["Beta 1.0 matches market volatility", "Beta > 1 is aggressive, Beta < 1 is defensive"],
        follow_ups=["What is Alpha vs Beta?", "How to build a low-beta portfolio?"],
        related_concepts=["alpha", "volatility", "sharpe_ratio"]
    ),
    "alpha": FinancialConcept(
        id="alpha",
        title="Alpha (Excess Return)",
        category="Risk Metrics",
        aliases=["alpha", "jensen alpha", "excess return"],
        summary="The excess return of an investment relative to the return of a benchmark index, measuring fund manager skill.",
        content=(
            "### Alpha ($\alpha$)\n\n"
            "**Alpha** is a measure of an active investment's performance compared to its market benchmark after adjusting for risk.\n\n"
            "#### Key Meaning:\n"
            "- **Positive Alpha (+2%)**: The fund outperformed its benchmark by 2% through superior security selection.\n"
            "- **Zero / Negative Alpha**: The active fund failed to beat the low-cost index benchmark after fees."
        ),
        key_takeaways=["Measures active outperformance against benchmark", "Positive alpha indicates value added by fund manager"],
        follow_ups=["Why is it hard for large-cap funds to generate alpha?", "What is Tracking Error?"],
        related_concepts=["beta", "sharpe_ratio", "index_fund"]
    ),
    "sharpe_ratio": FinancialConcept(
        id="sharpe_ratio",
        title="Sharpe Ratio (Risk-Adjusted Return)",
        category="Risk Metrics",
        aliases=["sharpe ratio", "sharpe", "risk adjusted return"],
        summary="Measures how much excess return an investment delivers for every unit of total risk (standard deviation) taken.",
        content=(
            "### Sharpe Ratio\n\n"
            "The **Sharpe Ratio** evaluates how well an investment compensates an investor for the risk taken.\n\n"
            "#### Formula:\n"
            "$$\\text{Sharpe Ratio} = \\frac{\\text{Portfolio Return} - \\text{Risk-Free Rate (e.g. 10Y G-Sec)}}{\\text{Portfolio Standard Deviation (Volatility)}}$$\n\n"
            "#### Interpretation:\n"
            "- Higher is better. A fund with a higher Sharpe ratio generated its returns through superior risk management rather than sheer reckless speculation."
        ),
        formula="Sharpe = (Return - Risk-Free Rate) / Standard Deviation",
        key_takeaways=["Standard measure of risk-adjusted returns", "Higher Sharpe ratio denotes superior efficiency per unit of risk"],
        follow_ups=["What is a good Sharpe ratio for mutual funds?", "What is the Sortino ratio?"],
        related_concepts=["beta", "volatility", "drawdown"]
    ),
    "volatility": FinancialConcept(
        id="volatility",
        title="Volatility & Standard Deviation",
        category="Risk Metrics",
        aliases=["volatility", "volatile", "standard deviation", "vix", "india vix"],
        summary="The rate and magnitude of price swings in a security or index over a given time period, measured statistically by standard deviation.",
        content=(
            "### Volatility\n\n"
            "**Volatility** refers to the degree of variation in trading prices over time. In Indian markets, it is tracked via **India VIX** (the market's fear gauge).\n\n"
            "#### Managing Volatility:\n"
            "- Long investment horizons (5–10+ years) smooth out short-term market fluctuations.\n"
            "- Systematic Investment Plans (SIPs) utilize rupee cost averaging during volatile drawdowns."
        ),
        key_takeaways=["Measures price fluctuations and uncertainty", "Disciplined SIPs turn volatility into an accumulation advantage"],
        follow_ups=["What is India VIX?", "How does rupee cost averaging help in volatile markets?"],
        related_concepts=["risk", "drawdown", "sharpe_ratio"]
    ),
    "drawdown": FinancialConcept(
        id="drawdown",
        title="Maximum Drawdown (MDD)",
        category="Risk Metrics",
        aliases=["drawdown", "max drawdown", "mdd", "peak to trough"],
        summary="The maximum observed percentage loss from an investment's peak to its lowest trough before a new peak is attained.",
        content=(
            "### Maximum Drawdown (MDD)\n\n"
            "**Drawdown** measures downside risk by calculating the largest peak-to-trough decline experienced by a stock, portfolio, or fund.\n\n"
            "#### Why Drawdown Matters:\n"
            "- A 50% drawdown requires a 100% gain just to break even.\n"
            "- Helps investors gauge emotional tolerance during market crashes."
        ),
        key_takeaways=["Measures worst-case peak-to-trough loss", "A 50% loss requires a 100% gain to recover"],
        follow_ups=["How to protect portfolio from deep drawdowns?", "What is portfolio rebalancing?"],
        related_concepts=["volatility", "risk", "asset_allocation"]
    ),

    # -------------------------------------------------------------
    # 4. INVESTMENT VEHICLES & ASSET CLASSES
    # -------------------------------------------------------------
    "etf": FinancialConcept(
        id="etf",
        title="Exchange Traded Fund (ETF)",
        category="Investment Vehicles",
        aliases=["etf", "exchange traded fund", "exchange traded funds", "etfs", "niftybees", "mon100", "goldbees"],
        summary="A marketable security that tracks an underlying index, commodity, or sector, trading on stock exchanges just like individual equities.",
        content=(
            "### Exchange Traded Fund (ETF)\n\n"
            "An **Exchange Traded Fund (ETF)** is an investment fund traded on stock exchanges like NSE and BSE, just like regular shares. ETFs track an underlying index (e.g. Nifty 50, Nasdaq-100), commodity (Gold, Silver), or debt basket.\n\n"
            "#### Key Characteristics:\n"
            "- **Intraday Trading**: Buy and sell throughout trading hours (9:15 AM – 3:30 PM) at real-time market prices.\n"
            "- **Ultra-Low Expense Ratio**: Typically 0.05%–0.25%, significantly lower than active mutual funds.\n"
            "- **Dematerialized Requirement**: Requires a Demat & Trading account to buy and sell.\n\n"
            "#### Common Indian Examples:\n"
            "- **NiftyBeES**: Tracks Nifty 50.\n"
            "- **MON100**: Tracks US Nasdaq-100.\n"
            "- **GOLDBEES**: Tracks physical domestic gold prices."
        ),
        key_takeaways=[
            "Trades on stock exchanges in real time like equities.",
            "Offers instant diversification with rock-bottom expense ratios.",
            "Requires a Demat and Trading account."
        ],
        follow_ups=[
            "What is the difference between an ETF and an Index Mutual Fund?",
            "What is Tracking Error and Tracking Difference in ETFs?",
            "How to buy NiftyBeES or MON100 on Zerodha/Groww?"
        ],
        related_concepts=["mutual_fund", "index_fund", "gold_etf", "expense_ratio"]
    ),
    "mutual_fund": FinancialConcept(
        id="mutual_fund",
        title="Mutual Fund",
        category="Investment Vehicles",
        aliases=["mutual fund", "mutual funds", "mf", "mfs", "amc"],
        summary="A pooled investment vehicle managed by professional asset management companies (AMCs) investing in stocks, bonds, and money market instruments.",
        content=(
            "### Mutual Fund\n\n"
            "A **Mutual Fund** pools capital from numerous retail and institutional investors to construct a diversified portfolio of equities, bonds, or money market instruments, professionally overseen by an Asset Management Company (AMC).\n\n"
            "#### Key Characteristics:\n"
            "- **End-of-Day NAV**: Units are priced once daily at 9:00 PM based on closing Net Asset Value (NAV).\n"
            "- **Automated SIP**: Frictionless automated monthly bank auto-debit (e-NACH).\n"
            "- **Direct vs. Regular Plans**: Direct plans eliminate distributor commissions, delivering 0.5%–1.5% higher annual compounding."
        ),
        key_takeaways=["Priced once daily via NAV", "Direct Plans yield significantly higher long-term compounding", "Ideal for automated monthly SIP discipline"],
        follow_ups=["What is the difference between Direct and Regular Mutual Funds?", "How does an ETF differ from a Mutual Fund?"],
        related_concepts=["etf", "index_fund", "nav", "sip", "expense_ratio"]
    ),
    "index_fund": FinancialConcept(
        id="index_fund",
        title="Index Fund",
        category="Investment Vehicles",
        aliases=["index fund", "index funds", "passive fund", "passive investing"],
        summary="A passive mutual fund designed to replicate the composition and returns of a target market benchmark index with minimal cost.",
        content=(
            "### Index Fund\n\n"
            "An **Index Fund** is a passive mutual fund designed to replicate the performance of a specific market index (e.g. Nifty 50, BSE Sensex, Nifty Next 50) by holding the identical basket of securities in the exact index weights.\n\n"
            "#### Why Choose Index Funds:\n"
            "- **Zero Fund Manager Bias**: Rules-based passive tracking eliminates human errors and bad stock picks.\n"
            "- **Ultra-Low Cost**: Low expense ratios (0.10%–0.20%) preserve compounding returns.\n"
            "- **No Demat Account Required**: Unlike ETFs, you can invest directly through AMCs or mutual fund platforms without demat brokerage."
        ),
        key_takeaways=["Passively tracks an index like Nifty 50", "Low cost without requiring a demat trading account"],
        follow_ups=["Should I choose an Index Fund or an ETF?", "What is Tracking Error?"],
        related_concepts=["etf", "mutual_fund", "expense_ratio"]
    ),
    "hedge_fund": FinancialConcept(
        id="hedge_fund",
        title="Hedge Fund (Category III AIF)",
        category="Investment Vehicles",
        aliases=["hedge fund", "hedge funds", "alternative investment fund", "aif category 3", "cat 3 aif"],
        summary="A pooled investment vehicle for accredited HNI/institutional investors using advanced strategies (long/short, leverage, derivatives) with a ₹1 Crore minimum ticket size.",
        content=(
            "### Hedge Fund (SEBI Category III AIF)\n\n"
            "A **Hedge Fund** (regulated in India as a **Category III Alternative Investment Fund - AIF**) is a specialized private investment pool accessible exclusively to High Net Worth Individuals (HNIs), family offices, and institutional investors.\n\n"
            "#### Regulatory & Operational Reality in India:\n"
            "- **Mandatory Minimum Investment**: SEBI mandates a minimum ticket size of **₹1 Crore** (₹10,000,000).\n"
            "- **Complex Strategies**: Employs long/short equity, derivative leverage, pairs trading, and market-neutral arbitrage.\n"
            "- **Fee Structure**: Typically '2 and 20' (2% management fee + 20% performance fee above a hurdle rate).\n"
            "- **Suitability**: Inappropriate for retail investors building wealth from monthly salary."
        ),
        key_takeaways=[
            "Requires a mandatory ₹1 Crore minimum investment by SEBI law.",
            "Uses complex derivatives, leverage, and short-selling strategies.",
            "Carries high fee hurdles (typically 2% management + 20% profit share)."
        ],
        follow_ups=[
            "What is the difference between an ETF and a Hedge Fund?",
            "What are SEBI AIF Categories I, II, and III?",
            "What are the alternatives to hedge funds for retail investors?"
        ],
        related_concepts=["private_equity", "etf", "mutual_fund", "risk"]
    ),
    "private_equity": FinancialConcept(
        id="private_equity",
        title="Private Equity & Venture Capital",
        category="Investment Vehicles",
        aliases=["private equity", "pe fund", "venture capital", "vc fund", "cat 2 aif"],
        summary="Direct equity investments in unlisted private companies, typically via SEBI Category II AIFs with multi-year lock-ins.",
        content=(
            "### Private Equity (PE) & Venture Capital (VC)\n\n"
            "**Private Equity** involves institutional pools of capital acquiring direct equity ownership in unlisted private operating companies to accelerate growth, restructure management, and achieve an eventual exit via IPO or strategic buyout.\n\n"
            "#### Characteristics:\n"
            "- **Illiquid Long-Term Horizon**: Capital is committed for 7 to 10 years with multi-year lock-ins.\n"
            "- **Minimum Ticket**: Minimum ₹1 Crore participation threshold under SEBI Category II AIF regulations."
        ),
        key_takeaways=["Invests directly in unlisted private companies", "Illiquid multi-year commitment with ₹1 Crore minimum entry"],
        follow_ups=["What is the difference between Venture Capital and Private Equity?", "How do PE funds exit their investments?"],
        related_concepts=["hedge_fund", "ipo", "stock"]
    ),
    "reit": FinancialConcept(
        id="reit",
        title="Real Estate Investment Trust (REIT)",
        category="Investment Vehicles",
        aliases=["reit", "reits", "real estate investment trust", "embassy reit", "mindspace reit", "brookfield reit"],
        summary="A company that owns, operates, or finances income-generating commercial real estate, trading on stock exchanges and distributing 90% of cash flows as dividends.",
        content=(
            "### Real Estate Investment Trust (REIT)\n\n"
            "A **REIT** allows retail investors to own a fractional share of institutional-grade, income-generating commercial real estate (Grade-A office parks, IT corridors) with minimal capital.\n\n"
            "#### How it Works:\n"
            "- **Exchange Traded**: Traded on NSE/BSE just like regular equities with 1-unit lot sizes.\n"
            "- **Mandatory Payout**: SEBI mandates that REITs distribute at least **90% of their net distributable cash flows** to unitholders semi-annually.\n"
            "- **Income Stream**: Yields quarterly income through dividends, interest, and capital repayment."
        ),
        key_takeaways=[
            "Exchange-traded fractional ownership of commercial Grade-A office spaces.",
            "Mandated to distribute >= 90% of net cash flow to unitholders.",
            "Provides inflation-hedged yields and liquidity."
        ],
        follow_ups=["What are the top listed REITs in India?", "How is REIT income taxed in India?"],
        related_concepts=["invit", "dividend", "bond", "etf"]
    ),
    "invit": FinancialConcept(
        id="invit",
        title="Infrastructure Investment Trust (InvIT)",
        category="Investment Vehicles",
        aliases=["invit", "invits", "infrastructure investment trust", "powergrid invit", "nhai invit"],
        summary="A pooled investment vehicle investing in revenue-generating infrastructure assets (toll roads, power transmission grids, pipelines).",
        content=(
            "### Infrastructure Investment Trust (InvIT)\n\n"
            "An **InvIT** works similarly to a REIT, but owns core infrastructure assets such as toll highways, power transmission lines, and gas pipelines.\n\n"
            "#### Features:\n"
            "- Generates long-term, predictable cash flows from government contracts and toll concessions.\n"
            "- Mandatory 90% cash flow distribution to unitholders."
        ),
        key_takeaways=["Owns operating infrastructure assets like toll roads and power grids", "Distributes 90% of cash flows"],
        follow_ups=["What is the difference between a REIT and an InvIT?", "What are the yield profiles of Indian InvITs?"],
        related_concepts=["reit", "bond", "dividend"]
    ),
    "sgb": FinancialConcept(
        id="sgb",
        title="Sovereign Gold Bond (SGB)",
        category="Investment Vehicles",
        aliases=["sgb", "sovereign gold bond", "sovereign gold bonds", "rbi gold bond"],
        summary="Government-backed securities denominated in grams of gold issued by the RBI, offering a 2.5% annual interest payout and tax-free capital gains at maturity.",
        content=(
            "### Sovereign Gold Bond (SGB)\n\n"
            "**Sovereign Gold Bonds (SGBs)** are government securities issued by the Reserve Bank of India (RBI) on behalf of the Government of India, denominated in grams of 999 purity gold.\n\n"
            "#### Unmatched Advantages:\n"
            "- **Fixed 2.5% Annual Interest**: Paid semi-annually directly to your bank account.\n"
            "- **100% Tax-Free Capital Gains**: If held till maturity (8 years), capital gains are completely exempt from tax.\n"
            "- **No Storage or Making Charges**: Eliminates physical gold theft risk and jeweller making charges.\n"
            "- **Secondary Market Trading**: Can be bought or sold on NSE/BSE before maturity."
        ),
        key_takeaways=[
            "Issued by RBI; 100% sovereign backing.",
            "Pays 2.50% annual fixed interest on the initial issue price.",
            "Capital gains are 100% tax-free if held until 8-year maturity."
        ],
        follow_ups=[
            "What is the difference between SGB and Gold ETF?",
            "How can I buy existing SGBs on the stock exchange discount?",
            "How is SGB interest taxed?"
        ],
        related_concepts=["gold_etf", "etf", "bond"]
    ),
    "gold_etf": FinancialConcept(
        id="gold_etf",
        title="Gold ETF",
        category="Investment Vehicles",
        aliases=["gold etf", "gold etfs", "goldbees", "paper gold", "digital gold"],
        summary="An open-ended exchange-traded fund tracking domestic physical 24-carat gold prices with high liquidity and fractional unit trading.",
        content=(
            "### Gold ETF\n\n"
            "A **Gold ETF** is an exchange-traded fund that invests in physical 99.5% pure standard gold bullion. Each unit represents a fraction of a gram of physical gold stored in secure bank vaults.\n\n"
            "#### Features:\n"
            "- **Instant Liquidity**: Buy and sell during market hours on NSE/BSE.\n"
            "- **Low Cost**: Average expense ratio around 0.15%–0.30%.\n"
            "- **Taxation**: Taxed at your individual slab rate as of current debt mutual fund tax rules."
        ),
        key_takeaways=["Backing by 99.5% physical vault gold", "High intraday liquidity compared to 8-year lock-in of SGB"],
        follow_ups=["SGB vs Gold ETF: Which is better for gold allocation?", "What percentage of gold should be in my portfolio?"],
        related_concepts=["sgb", "etf", "asset_allocation"]
    ),
    "bonds": FinancialConcept(
        id="bonds",
        title="Bonds & Government Securities (G-Secs)",
        category="Fixed Income",
        aliases=["bond", "bonds", "g-sec", "gsec", "government security", "treasury bill", "t-bill", "corporate bond", "ncd"],
        summary="Fixed-income debt instruments where an investor loans money to an entity (government or corporation) for a defined period at a fixed or floating coupon rate.",
        content=(
            "### Bonds & Fixed Income Securities\n\n"
            "A **Bond** is a fixed-income instrument representing a loan made by an investor to a borrower (typically corporate or governmental).\n\n"
            "#### Major Categories in India:\n"
            "- **Government Securities (G-Secs & T-Bills)**: Issued by the Central/State Government with zero default risk (Sovereign guarantee).\n"
            "- **Corporate Bonds & NCDs**: Issued by companies offering higher coupon yields to reflect credit risk (rated AAA to D by credit rating agencies like CRISIL/ICRA).\n"
            "- **Inverse Relationship with Interest Rates**: When RBI cuts repo rates, bond prices rise; when RBI hikes rates, bond prices fall."
        ),
        key_takeaways=["Fixed regular coupon income", "G-Secs carry zero default risk; corporate bonds carry credit risk", "Bond prices move inversely to market interest rates"],
        follow_ups=["How does RBI repo rate impact bond prices?", "What is Yield to Maturity (YTM)?"],
        related_concepts=["debt_fund", "liquid_fund", "reit", "inflation"]
    ),
    "debt_fund": FinancialConcept(
        id="debt_fund",
        title="Debt Mutual Fund",
        category="Fixed Income",
        aliases=["debt fund", "debt funds", "debt mutual fund", "bond fund", "gilt fund", "target maturity fund"],
        summary="Mutual funds that invest in fixed-income securities like treasury bills, government securities, corporate bonds, and commercial paper.",
        content=(
            "### Debt Mutual Funds\n\n"
            "**Debt Mutual Funds** invest in fixed-income securities (Government bonds, Corporate NCDs, Money Market instruments) seeking to generate stable income with lower volatility than equities.\n\n"
            "#### Categories:\n"
            "- **Liquid & Overnight Funds**: 1 to 91-day maturity, virtually zero interest rate risk.\n"
            "- **Short Duration & Corporate Bond Funds**: 1 to 3-year maturity for short-to-medium goals.\n"
            "- **Gilt Funds**: 100% government bonds; zero credit risk, but sensitive to interest rate cycles."
        ),
        key_takeaways=["Provides portfolio stability and fixed income allocation", "Zero credit risk in Gilt and Target Maturity Government funds"],
        follow_ups=["How are debt mutual funds taxed after April 2023?", "What is Modified Duration?"],
        related_concepts=["liquid_fund", "bonds", "asset_allocation"]
    ),
    "liquid_fund": FinancialConcept(
        id="liquid_fund",
        title="Liquid Mutual Fund",
        category="Fixed Income",
        aliases=["liquid fund", "liquid funds", "overnight fund", "money market fund"],
        summary="Ultra-short-term debt mutual funds investing in money market instruments with maturities up to 91 days, ideal for emergency funds.",
        content=(
            "### Liquid Fund (Liquid Mutual Fund)\n\n"
            "A **Liquid Mutual Fund** (or Liquid Fund) is a debt mutual fund category that invests in high-quality money market instruments (T-Bills, Commercial Paper, Certificates of Deposit) with a residual maturity of up to **91 days**.\n\n"
            "#### Key Benefits:\n"
            "- **Capital Preservation & Instant Liquidity**: Near-zero interest rate fluctuation, with redemption proceeds credited within 24 hours (T+1) or instant redemption up to ₹50,000.\n"
            "- **Ideal for Emergency Buffer**: Yields better returns than standard bank savings accounts while maintaining immediate accessibility."
        ),
        key_takeaways=["Maturity <= 91 days with minimal volatility", "Prime choice for emergency funds and short-term capital parking"],
        follow_ups=["Liquid Fund vs Bank Savings Account", "What is instant redemption in liquid funds?"],
        related_concepts=["emergency_fund", "debt_fund", "bonds"]
    ),

    # -------------------------------------------------------------
    # 5. FUNDAMENTAL CONCEPTS & METRICS
    # -------------------------------------------------------------
    "nav": FinancialConcept(
        id="nav",
        title="Net Asset Value (NAV)",
        category="Fund Metrics",
        aliases=["nav", "net asset value", "fund nav"],
        summary="The per-unit market value of a mutual fund or ETF scheme, calculated daily after subtracting scheme liabilities from total assets.",
        content=(
            "### Net Asset Value (NAV)\n\n"
            "**Net Asset Value (NAV)** represents the net market value of one unit of a mutual fund scheme.\n\n"
            "#### Formula:\n"
            "$$\\text{NAV} = \\frac{\\text{Total Market Value of Scheme Assets} - \\text{Total Liabilities}}{\\text{Total Number of Outstanding Units}}$$\n\n"
            "#### Critical Common Myth:\n"
            "- **Myth**: A mutual fund with a ₹20 NAV is 'cheaper' or better than one with a ₹200 NAV.\n"
            "- **Fact**: NAV reflects historical unit division, NOT valuation! A 15% portfolio gain produces exactly the same return whether NAV is ₹20 or ₹200."
        ),
        formula="NAV = (Total Assets - Liabilities) / Outstanding Units",
        key_takeaways=["Computed daily at the close of trading hours", "Low NAV does NOT mean a fund is cheap or superior"],
        follow_ups=["Why is low NAV not equivalent to a cheap stock?", "How is cut-off time for mutual fund NAV calculated?"],
        related_concepts=["aum", "expense_ratio", "mutual_fund"]
    ),
    "aum": FinancialConcept(
        id="aum",
        title="Assets Under Management (AUM)",
        category="Fund Metrics",
        aliases=["aum", "assets under management", "fund size"],
        summary="The total market value of financial assets that a mutual fund, ETF, or wealth management institution manages on behalf of clients.",
        content=(
            "### Assets Under Management (AUM)\n\n"
            "**Assets Under Management (AUM)** measures the overall size and market capitalization managed by a fund scheme or asset management company (AMC).\n\n"
            "#### Significance:\n"
            "- **In ETFs & Debt Funds**: High AUM is vital for tight bid-ask spreads and liquidity.\n"
            "- **In Small Cap Funds**: Massive AUM can become a drag on agility, making it difficult to deploy cash into high-conviction micro-cap stocks."
        ),
        key_takeaways=["Measures total pool of capital managed by the fund", "High AUM improves ETF liquidity; excessively high AUM may slow small-cap agility"],
        follow_ups=["Does high AUM hurt small cap mutual fund performance?", "How does AUM impact expense ratio slabs?"],
        related_concepts=["nav", "expense_ratio", "etf"]
    ),
    "expense_ratio": FinancialConcept(
        id="expense_ratio",
        title="Total Expense Ratio (TER)",
        category="Fund Metrics",
        aliases=["expense ratio", "ter", "total expense ratio", "management fee"],
        summary="The annual percentage of fund assets deducted daily by the AMC to cover management fees, operations, administration, and regulatory expenses.",
        content=(
            "### Total Expense Ratio (TER)\n\n"
            "The **Total Expense Ratio (TER)** is the annual operational fee charged by mutual funds and ETFs, expressed as an annualized percentage of the fund's daily average net assets.\n\n"
            "#### Compounding Impact of Fees:\n"
            "- A 1.5% regular plan expense ratio versus a 0.2% direct index fund ratio can consume **25%–35% of your total lifetime wealth** over 25 years due to the lost compounding on those fees.\n"
            "- Always opt for **Direct Plans** over Regular Plans."
        ),
        key_takeaways=["Annual fee deducted daily from NAV", "Direct plans have significantly lower TER than regular distributor plans"],
        follow_ups=["How much difference does a 1% expense ratio make over 20 years?", "What are the SEBI TER limits for mutual funds?"],
        related_concepts=["mutual_fund", "index_fund", "nav", "cagr"]
    ),
    "cagr": FinancialConcept(
        id="cagr",
        title="Compound Annual Growth Rate (CAGR)",
        category="Calculations",
        aliases=["cagr", "compound annual growth rate", "annualized return", "cagr return"],
        summary="The smoothed annualized rate of return that represents the geometric growth rate of an investment over a multi-year period.",
        content=(
            "### Compound Annual Growth Rate (CAGR)\n\n"
            "**CAGR** represents the constant annual rate at which an investment would have grown if it grew at a steady rate each year over a multi-year compounding horizon.\n\n"
            "#### Formula:\n"
            "$$\\text{CAGR} = \\left(\\frac{\\text{Final Value}}{\\text{Beginning Value}}\\right)^{\\frac{1}{n}} - 1$$\n\n"
            "#### Rule of 72:\n"
            "- Divide 72 by the CAGR to approximate how many years it takes to double your money (e.g. at 12% CAGR, money doubles in 6 years)."
        ),
        formula="CAGR = (Final / Beginning)^(1/n) - 1",
        key_takeaways=["Standard metric for multi-year lumpsum returns", "Use Rule of 72 to estimate money doubling time"],
        follow_ups=["What is the difference between CAGR and XIRR?", "What is a realistic CAGR for Indian equities?"],
        related_concepts=["compounding", "inflation", "sip"]
    ),
    "xirr": FinancialConcept(
        id="xirr",
        title="Extended Internal Rate of Return (XIRR)",
        category="Calculations",
        aliases=["xirr", "extended internal rate of return", "sip return"],
        summary="The exact annualized rate of return for multiple irregular cash inflows and outflows, serving as the industry standard for SIP performance.",
        content=(
            "### Extended Internal Rate of Return (XIRR)\n\n"
            "**XIRR** is the true mathematical annualized rate of return for investments with multiple cash inflows and outflows occurring at different dates (e.g. monthly SIPs, staggered withdrawals).\n\n"
            "#### Why CAGR Fails for SIPs:\n"
            "- CAGR only measures single lumpsum start and end values.\n"
            "- XIRR computes the exact internal rate of return for every individual monthly installment."
        ),
        key_takeaways=["The only accurate performance measure for SIPs and multiple cashflows", "Takes into account the exact date of every installment"],
        follow_ups=["Why does my SIP XIRR differ from fund CAGR?", "How to calculate XIRR in Excel/Google Sheets?"],
        related_concepts=["cagr", "sip", "compounding"]
    ),
    "compounding": FinancialConcept(
        id="compounding",
        title="The Power of Compounding",
        category="Calculations",
        aliases=["compounding", "compound interest", "power of compounding", "exponential growth"],
        summary="The financial mechanism where the earnings generated by an asset generate their own earnings over time, resulting in exponential wealth growth.",
        content=(
            "### The Power of Compounding\n\n"
            "**Compounding** is the process where the returns earned on an initial principal are reinvested to generate their own returns in subsequent periods, creating exponential 'hockey stick' growth.\n\n"
            "#### Compounding Formula:\n"
            "$$A = P \\left(1 + \\frac{r}{n}\\right)^{nt}$$\n\n"
            "#### Key Compounding Drivers:\n"
            "1. **Time in the market**: Starting 10 years earlier produces 3x to 4x more final corpus than starting late with double the monthly capital.\n"
            "2. **Discipline & Low Fees**: Avoiding premature panic selling and minimizing high expense ratios."
        ),
        formula="A = P * (1 + r/n)^(nt)",
        key_takeaways=["Growth is exponential, accelerating in the 2nd and 3rd decades", "Time in the market is vastly more powerful than timing the market"],
        follow_ups=["What is the Rule of 72?", "How does starting a SIP at age 25 vs 35 change retirement wealth?"],
        related_concepts=["cagr", "inflation", "sip", "expense_ratio"]
    ),
    "inflation": FinancialConcept(
        id="inflation",
        title="Inflation & Real Returns",
        category="Macroeconomics",
        aliases=["inflation", "cpi", "purchasing power", "real return", "inflation rate"],
        summary="The gradual decline of purchasing power of a currency over time, meaning fixed cash in bank accounts loses real value every year.",
        content=(
            "### Inflation & Real Rate of Return\n\n"
            "**Inflation** is the persistent rise in the general price level of goods and services over time, eroding the purchasing power of money.\n\n"
            "#### Real Return Formula:\n"
            "$$\\text{Real Return} \\approx \\text{Nominal Return} - \\text{Inflation Rate} - \\text{Taxes}$$\n\n"
            "#### The Cost of 'Safe' Cash:\n"
            "- A bank FD yielding 6.5% after 30% tax becomes 4.55% net. If inflation is 6.0%, your real wealth is **shrinking by 1.45% every year**!\n"
            "- Equity and Gold allocations are essential to generate real positive purchasing power growth."
        ),
        formula="Real Return = Nominal Return - Inflation - Taxes",
        key_takeaways=["Erodes currency purchasing power silently", "Equities are essential to generate real inflation-beating returns"],
        follow_ups=["What is India's historical CPI inflation rate?", "How does inflation affect my retirement target?"],
        related_concepts=["compounding", "asset_allocation", "bonds"]
    ),
    "sip": FinancialConcept(
        id="sip",
        title="Systematic Investment Plan (SIP)",
        category="Investment Strategies",
        aliases=["sip", "systematic investment plan", "monthly sip", "step-up sip", "step up sip", "top up sip"],
        summary="An automated investment method of deploying fixed rupee amounts at regular intervals into mutual funds or ETFs, achieving Rupee Cost Averaging.",
        content=(
            "### Systematic Investment Plan (SIP)\n\n"
            "A **Systematic Investment Plan (SIP)** is a disciplined strategy of investing a predetermined sum of money at regular intervals (monthly or weekly) into mutual funds or ETFs.\n\n"
            "#### Core Advantages:\n"
            "- **Rupee Cost Averaging**: You automatically buy more units when markets are down and fewer units when markets are high, lowering your average cost per unit without timing the market.\n"
            "- **Step-Up SIP Supercharger**: Increasing your monthly SIP by just 10% each year (aligned with annual salary increments) can **double your 15-year accumulated wealth** compared to a flat SIP."
        ),
        key_takeaways=[
            "Automates disciplined long-term wealth accumulation.",
            "Eliminates the stress and pitfalls of trying to time market tops and bottoms.",
            "A 10% annual Step-Up SIP dramatically accelerates goal achievement."
        ],
        follow_ups=[
            "What is a Step-Up SIP and how does it compound wealth?",
            "What is the best date of the month for a SIP?",
            "Lumpsum vs SIP: Which should I choose during market corrections?"
        ],
        related_concepts=["mutual_fund", "index_fund", "cagr", "xirr", "compounding"]
    ),
    "asset_allocation": FinancialConcept(
        id="asset_allocation",
        title="Asset Allocation & Diversification",
        category="Portfolio Strategy",
        aliases=["asset allocation", "diversification", "rebalancing", "portfolio allocation", "asset mix"],
        summary="The strategic distribution of an investment portfolio across distinct asset classes (Equities, Debt, Gold, Cash) to optimize returns for a target risk level.",
        content=(
            "### Strategic Asset Allocation\n\n"
            "**Asset Allocation** is the practice of dividing an investment portfolio among different asset categories (Domestic Equities, International Equities, Fixed Income/Debt, Gold, and Cash Reserves).\n\n"
            "#### The Primary Determinant of Returns:\n"
            "- Academic studies prove over **90% of long-term portfolio return variability** is determined by your asset allocation policy, not individual stock picking!\n\n"
            "#### SmartVest Core Framework:\n"
            "- **Equities (60%–75%)**: Growth engine to beat inflation.\n"
            "- **Debt / Fixed Income (15%–25%)**: Volatility dampener and capital preserver.\n"
            "- **Gold (5%–10%)**: Crisis and currency hedge.\n"
            "- **Liquid Cash**: 6-month emergency reserve."
        ),
        key_takeaways=["Determines over 90% of long-term risk and return", "Diversifies across uncorrelated asset classes (Equity, Debt, Gold)"],
        follow_ups=["How often should I rebalance my portfolio?", "What is the 100 minus age rule?"],
        related_concepts=["risk", "emergency_fund", "etf", "bonds", "gold_etf"]
    ),
    "emergency_fund": FinancialConcept(
        id="emergency_fund",
        title="Emergency Fund",
        category="Financial Planning",
        aliases=["emergency fund", "emergency buffer", "contingency fund", "rainy day fund"],
        summary="A dedicated liquid cash buffer equal to 6 to 12 months of mandatory living expenses to protect investments against job loss or medical emergencies.",
        content=(
            "### Emergency Fund (Financial Fortress)\n\n"
            "An **Emergency Fund** is a reserve of readily accessible cash set aside exclusively for unexpected financial shocks (medical emergencies, unexpected job loss, critical home/vehicle repairs).\n\n"
            "#### Golden Rules:\n"
            "- **Target Size**: **6 to 12 months** of mandatory fixed living expenses (rent, EMIs, utilities, groceries, insurance premiums).\n"
            "- **Where to Park**: 50% in a High-Yield Bank Savings Account / Sweep FD and 50% in an Instant-Access Liquid Mutual Fund.\n"
            "- **Never Invest in Equities**: Your emergency fund must never be exposed to stock market volatility."
        ),
        key_takeaways=["Must cover 6 to 12 months of mandatory expenses", "Park strictly in Savings Account and Liquid Funds; zero equity risk"],
        follow_ups=["How much emergency fund do I need?", "Where is the best place to keep my emergency fund?"],
        related_concepts=["liquid_fund", "asset_allocation", "risk"]
    ),
    "risk": FinancialConcept(
        id="risk",
        title="Risk Tolerance & Risk Capacity",
        category="Financial Planning",
        aliases=["risk", "risk tolerance", "risk capacity", "risk profile", "risk score"],
        summary="The combination of an investor's psychological ability (tolerance) and financial ability (capacity) to withstand market drawdowns.",
        content=(
            "### Risk Tolerance vs. Risk Capacity\n\n"
            "Understanding financial risk requires distinguishing between emotional willingness and actual financial ability to bear losses:\n\n"
            "#### The Critical Distinction:\n"
            "1. **Risk Tolerance (Psychological)**: How you feel when your portfolio drops 25% in a crash. Can you sleep soundly without panic selling?\n"
            "2. **Risk Capacity (Financial / Structural)**: Can your financial life survive a loss? Driven by age, steady income, debt obligations, emergency reserves, and time horizon."
        ),
        key_takeaways=["Tolerance is emotional; Capacity is mathematical and structural", "Time horizon is the single greatest risk dampener"],
        follow_ups=["How is my SmartVest Risk Score calculated?", "Should a 35-year-old invest in high-risk equities?"],
        related_concepts=["asset_allocation", "volatility", "drawdown"]
    ),
    "tax_ltcg_stcg": FinancialConcept(
        id="tax_ltcg_stcg",
        title="Capital Gains Tax (LTCG & STCG)",
        category="Taxation",
        aliases=["tax", "ltcg", "stcg", "capital gains", "capital gains tax", "taxation", "80c", "section 80c"],
        summary="Taxes levied on profits earned from selling capital assets, categorized into Short-Term (STCG) and Long-Term (LTCG) based on holding period.",
        content=(
            "### Capital Gains Taxation in India (Equities & Mutual Funds)\n\n"
            "Profits realized upon the sale of equities and equity mutual funds are categorized based on your holding period:\n\n"
            "#### 1. Long-Term Capital Gains (LTCG) - Listed Equities:\n"
            "- **Holding Period**: More than **12 months**.\n"
            "- **Tax Rate**: **12.5%** on gains exceeding **₹1.25 Lakhs per financial year** (Budget 2024 revised framework).\n\n"
            "#### 2. Short-Term Capital Gains (STCG) - Listed Equities:\n"
            "- **Holding Period**: Less than or equal to **12 months**.\n"
            "- **Tax Rate**: **20%** flat on all realized gains.\n\n"
            "#### 3. Debt Funds:\n"
            "- Gains from debt funds purchased after April 1, 2023 are taxed at your applicable individual income tax slab rate."
        ),
        key_takeaways=[
            "Equity LTCG (>12 months): 12.5% on gains above ₹1.25 Lakh/year.",
            "Equity STCG (<=12 months): Flat 20%.",
            "Debt funds are taxed at marginal slab rates."
        ],
        follow_ups=["How to harvest ₹1.25 Lakh tax-free equity gains annually?", "How are dividends taxed in India?"],
        related_concepts=["mutual_fund", "etf", "stock", "sgb"]
    )
}

def get_glossary_concept(concept_id: str) -> Optional[FinancialConcept]:
    """Retrieve financial concept by exact key or alias."""
    cid = concept_id.lower().strip().replace(" ", "_").replace("-", "_")
    if cid in FINANCIAL_GLOSSARY:
        return FINANCIAL_GLOSSARY[cid]
    
    # Search aliases
    for item in FINANCIAL_GLOSSARY.values():
        if any(alias == cid or alias == concept_id.lower().strip() for alias in item.aliases):
            return item
    return None

def search_glossary(query: str) -> List[FinancialConcept]:
    """Semantic substring and keyword search across all glossary entries."""
    q = query.lower().strip()
    matches = []
    for concept in FINANCIAL_GLOSSARY.values():
        # Exact alias match gets top priority
        if any(alias in q or q in alias for alias in concept.aliases):
            matches.append(concept)
        elif concept.title.lower() in q or q in concept.title.lower():
            matches.append(concept)
    return matches
