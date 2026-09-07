/**
 * SMARTVEST ACADEMY — LESSON CATALOGUE
 * 12 structured, beginner-friendly investing lessons with comprehensive educational transcripts,
 * learning points, key takeaways, multiple-choice quizzes, and AI video generator prompts.
 */

import type { InvestmentLesson } from '../types/investmentAcademy';

export const INVESTMENT_LESSONS: InvestmentLesson[] = [
  // ── 1. WHAT IS INVESTMENT? ──
  {
    id: 'what-is-investment',
    number: 1,
    title: 'What is Investment?',
    category: 'Fundamentals',
    level: 'Beginner',
    durationSeconds: 90,
    description: 'Learn the difference between saving and investing, and how putting capital to work helps outpace inflation.',
    aiVideoPrompt: `Modern fintech education style, clean light background with teal and blue accents. Professional friendly presenter in a smart casual outfit. Minimal financial illustrations showing money growing into assets. Animated diagram comparing cash sitting idle in a bank vs. allocated into productive assets. Clear Indian English narration, simple subtitles. End screen: SmartVest Investing Academy - Learn first. Invest with understanding.`,
    transcript: `Have you ever wondered what actually happens when you invest money instead of just saving it?

Saving means keeping your money safe—for example, in a bank savings account or a cash locker. While saving protects your nominal capital, inflation gradually reduces what that money can buy over time.

Investing, on the other hand, means putting your money into assets—such as company stocks, bonds, mutual funds, or real estate—with the expectation that they may generate income or grow in value over time.

For example, imagine you have ₹10,000. If you leave it in a zero-interest locker for 5 years, it will still be ₹10,000, but groceries and rent will cost more. If you invest that ₹10,000 in productive businesses or diversified funds, your capital has the potential to grow alongside the economy.

Remember: investing involves risk, and asset values can fluctuate. The goal of investing is to balance risk and potential growth so your wealth maintains its purchasing power over the long term.`,
    learningPoints: [
      'The key difference between saving (capital preservation) and investing (wealth creation).',
      'How inflation silently reduces the purchasing power of idle cash.',
      'Core asset classes: equities, fixed income, real estate, and commodities.',
      'Why risk and potential return are always linked.'
    ],
    keyTakeaway: 'Saving preserves cash for today; investing puts capital to work to help beat inflation over tomorrow.',
    quiz: [
      {
        id: 'q1-1',
        question: 'What is the primary difference between saving and investing?',
        options: [
          'Saving involves high risk, while investing has zero risk.',
          'Saving preserves money in safe cash equivalents, while investing puts capital into productive assets for potential growth.',
          'Saving is only for retired people, while investing is only for students.',
          'There is no difference; they are the exact same thing.'
        ],
        correctAnswer: 1,
        explanation: 'Saving focuses on preserving nominal capital with immediate liquidity, whereas investing allocates capital into assets that have potential to grow over time.'
      },
      {
        id: 'q1-2',
        question: 'Why can leaving money idle in cash be a risk over long time horizons?',
        options: [
          'Banks might run out of paper currency.',
          'Inflation gradually reduces the real purchasing power of your money.',
          'Cash automatically disappears after 10 years.',
          'Stock markets will take your cash away.'
        ],
        correctAnswer: 1,
        explanation: 'Inflation causes the prices of goods and services to rise, meaning the same amount of cash buys less in the future.'
      }
    ],
    relatedLessons: ['what-is-a-stock', 'what-are-shares', 'why-long-term-investing'],
    vestiqPrompt: 'Explain the difference between saving and investing using a simple real-world example.'
  },

  // ── 2. WHAT IS A STOCK? ──
  {
    id: 'what-is-a-stock',
    number: 2,
    title: 'What is a Stock?',
    category: 'Fundamentals',
    level: 'Beginner',
    durationSeconds: 95,
    description: 'Understand what owning a company stock actually means and how shareholders participate in corporate growth.',
    aiVideoPrompt: `Modern fintech education style, light clean background, teal accents. Professional presenter. Animated graphics illustrating a company dividing into fractional pieces. Visual of a coffee shop chain expanding. Clear diagrams showing how business profits can translate to dividend income and share price appreciation. No buy/sell signals. End screen: SmartVest Investing Academy.`,
    transcript: `When you hear people talk about buying a 'stock', what are they actually purchasing?

A stock—also called equity—represents fractional ownership in a real corporation. When a business needs capital to build factories, invent technologies, or hire talent, it can issue stock to the public on a stock exchange like the NSE, BSE, or NASDAQ.

When you buy even a single stock of a company, you become a shareholder. That means you own a tiny piece of that company's assets and future profits.

For example, imagine a popular beverage company with 1 million total shares. If you buy 100 shares, you own 0.01% of that business. If the company creates popular drinks, grows its revenues, and expands internationally, the value of the whole company can increase, making your shares more valuable. The company may also distribute part of its profits to you as dividends.

However, if the company struggles or faces stiff competition, its market value may decline. That is why understanding the underlying business is essential before investing.`,
    learningPoints: [
      'A stock represents real partial ownership in a corporation.',
      'Companies issue stocks to raise capital for expansion and operations.',
      'Shareholders can benefit from price appreciation and potential dividend payouts.',
      'Stock prices fluctuate based on business performance, economic conditions, and market sentiment.'
    ],
    keyTakeaway: 'Buying a stock is not just trading tickers; it is becoming a part-owner of a real business.',
    quiz: [
      {
        id: 'q2-1',
        question: 'What does owning a stock in a company represent?',
        options: [
          'A guaranteed loan that the company must repay with fixed interest.',
          'Fractional ownership in the company and its future profits.',
          'A free gift coupon for the company\'s products.',
          'A deposit in the central bank.'
        ],
        correctAnswer: 1,
        explanation: 'A stock is equity—it gives you fractional ownership of the company\'s assets and a claim on its future earnings.'
      },
      {
        id: 'q2-2',
        question: 'What are the two primary ways equity investors may earn returns?',
        options: [
          'Government subsidies and fixed tax refunds.',
          'Stock price appreciation over time and potential dividend distributions.',
          'Free merchandise and lottery tickets.',
          'Guaranteed monthly interest paid by the stock exchange.'
        ],
        correctAnswer: 1,
        explanation: 'Investors can benefit when the market value of their shares increases and when profitable companies distribute dividends.'
      }
    ],
    relatedLessons: ['what-are-shares', 'what-is-an-etf', 'what-is-a-mutual-fund'],
    vestiqPrompt: 'Explain what a stock is using a simple analogy like a local bakery.'
  },

  // ── 3. WHAT ARE SHARES? ──
  {
    id: 'what-are-shares',
    number: 3,
    title: 'What are Shares?',
    category: 'Fundamentals',
    level: 'Beginner',
    durationSeconds: 85,
    description: 'Explore how total company ownership is divided into individual units called shares, and how market cap is calculated.',
    aiVideoPrompt: `Clean light fintech background, elegant teal/blue theme. Young presenter explaining shares vs. stock. Graphic visual of a pizza sliced into equal pieces, representing total shares outstanding multiplied by price per share to show Market Capitalization. Clear subtitles in Indian English. End screen: SmartVest Investing Academy.`,
    transcript: `People often use the words 'stock' and 'shares' interchangeably, but there is a slight, helpful distinction.

While 'stock' refers to the general concept of corporate ownership, a 'share' is the specific individual unit of that ownership.

Think of a pizza: the entire pizza represents the company's equity stock, and each individual slice is a share.

If a company divides its total ownership into 10 million shares, and each share is trading on the stock exchange for ₹500, the total market value of the entire company—known as its Market Capitalization—is 10 million multiplied by ₹500, which equals ₹500 Crore.

When you buy 50 shares, you hold 50 individual units of ownership. If the company decides to split its shares 2-for-1 to make them more accessible to retail investors, you would receive 100 shares at ₹250 each—your total invested value remains identical.`,
    learningPoints: [
      'A share is an individual unit of stock representing a measurable portion of ownership.',
      'Total shares outstanding multiplied by the current share price equals Market Capitalization.',
      'Share count changes through splits or buybacks do not change total company value automatically.',
      'Understanding share counts helps you evaluate the true scale and valuation of a company.'
    ],
    keyTakeaway: 'Shares are the countable units of company ownership; share price times total shares equals market cap.',
    quiz: [
      {
        id: 'q3-1',
        question: 'How is a company\'s Market Capitalization calculated?',
        options: [
          'By adding yesterday\'s profit to today\'s revenue.',
          'By multiplying the total number of shares outstanding by the current share price.',
          'By dividing total debt by cash in the bank.',
          'By counting the number of employees in the company.'
        ],
        correctAnswer: 1,
        explanation: 'Market Capitalization = Total Shares Outstanding × Current Price per Share.'
      },
      {
        id: 'q3-2',
        question: 'If a company performs a 2-for-1 stock split, what happens to your investment value immediately?',
        options: [
          'Your investment value doubles instantly.',
          'Your investment value is cut in half.',
          'You hold double the number of shares at half the price per share, so total value remains the same.',
          'You lose all your shares.'
        ],
        correctAnswer: 2,
        explanation: 'A stock split divides existing shares into smaller units without changing the underlying market value of your total holding.'
      }
    ],
    relatedLessons: ['what-is-a-stock', 'what-is-an-etf', 'risk-return-diversification'],
    vestiqPrompt: 'What is the relationship between share price, total shares, and market capitalization?'
  },

  // ── 4. WHAT IS AN ETF? ──
  {
    id: 'what-is-an-etf',
    number: 4,
    title: 'What is an ETF?',
    category: 'Investment Products',
    level: 'Beginner',
    durationSeconds: 105,
    description: 'Learn how Exchange-Traded Funds package a diversified basket of securities into a single tradeable instrument.',
    aiVideoPrompt: `Modern fintech education style, light clean aesthetic with vibrant teal and blue accents. Animated graphics displaying a shopping cart or basket filled with 50 top company logos representing the NIFTY 50 or S&P 500. Diagram showing real-time trading during market hours with low expense ratio callouts. Professional presenter with clear subtitles. End screen: SmartVest Investing Academy.`,
    transcript: `What if you want to invest in dozens or hundreds of top companies without having to research and buy each stock individually? That is where an ETF, or Exchange-Traded Fund, comes in.

An ETF is an investment fund that holds a collection of assets—such as 50 of India's largest companies in the NIFTY 50, or 500 of America's leading firms in the S&P 500.

Instead of buying 50 individual company stocks, which would require significant capital and transaction costs, you can buy a single unit of a NIFTY 50 ETF for around ₹250 to ₹300.

Key advantages of ETFs include:
First, instant diversification. If one company in the basket has a bad quarter, your overall investment is cushioned by the other 49 companies.
Second, real-time trading. ETFs trade on public stock exchanges just like regular stocks during market hours.
Third, low cost. Most index ETFs have minimal annual management fees, called expense ratios.`,
    learningPoints: [
      'An ETF holds a diversified basket of stocks, bonds, or commodities.',
      'ETFs trade on stock exchanges throughout the trading day at market prices.',
      'Index ETFs replicate benchmarks like NIFTY 50 or S&P 500 with low expense ratios.',
      'ETFs offer broad diversification with low minimum investment amounts.'
    ],
    keyTakeaway: 'An ETF gives you a diversified basket of many companies in a single, low-cost, liquid trade.',
    quiz: [
      {
        id: 'q4-1',
        question: 'What is the primary benefit of investing in an Index ETF?',
        options: [
          'Guaranteed 100% annual profits without any market risk.',
          'Instant diversification across a broad basket of companies at low expense ratios.',
          'Free trading without having to open a demat account.',
          'Direct appointment to the board of directors of each company.'
        ],
        correctAnswer: 1,
        explanation: 'Index ETFs provide broad market exposure across dozens or hundreds of securities in a single transaction with low management costs.'
      },
      {
        id: 'q4-2',
        question: 'How do ETFs differ from traditional mutual funds in trading mechanics?',
        options: [
          'ETFs can only be traded on weekends.',
          'ETFs can be bought and sold in real-time during market hours on a stock exchange.',
          'ETFs do not hold any real assets.',
          'Mutual funds trade every second, while ETFs trade once a month.'
        ],
        correctAnswer: 1,
        explanation: 'ETFs trade on stock exchanges throughout active market hours at real-time prices, just like individual stocks.'
      }
    ],
    relatedLessons: ['what-is-a-mutual-fund', 'risk-return-diversification', 'how-to-start-investing'],
    vestiqPrompt: 'Explain how an ETF works and compare it to buying individual stocks.'
  },

  // ── 5. WHAT IS A MUTUAL FUND? ──
  {
    id: 'what-is-a-mutual-fund',
    number: 5,
    title: 'What is a Mutual Fund?',
    category: 'Investment Products',
    level: 'Beginner',
    durationSeconds: 110,
    description: 'Understand pooled capital, professional portfolio managers, Net Asset Value (NAV), and mutual fund categories.',
    aiVideoPrompt: `Fintech education aesthetic, bright clean environment, teal and navy graphics. Visual representation of thousands of individual investors pooling money into a large reservoir managed by a professional fund manager holding diverse equities and debt instruments. Infographic explaining NAV calculated at the end of each trading day. Clear Indian English. End screen: SmartVest Investing Academy.`,
    transcript: `A Mutual Fund is an investment vehicle that pools money from thousands of individual investors to build a diversified portfolio of securities.

Here is how it works:
Instead of managing your own portfolio, you invest your money into a fund managed by professional fund managers and research analysts at an Asset Management Company (AMC).

The fund manager uses the pooled capital to buy equities, government bonds, corporate debt, or money market instruments based on the fund's stated objective—such as large-cap growth, small-cap exploration, or balanced hybrid income.

When you invest, you receive 'units' of the mutual fund based on its Net Asset Value, or NAV. NAV is the total market value of the fund's assets minus its liabilities, divided by the number of outstanding units, calculated once at the end of each business day.

Mutual funds make it easy to start investing with small recurring amounts through a Systematic Investment Plan (SIP).`,
    learningPoints: [
      'Mutual funds pool resources from multiple investors to achieve scale and diversification.',
      'Professional fund managers research and manage the underlying portfolio.',
      'NAV (Net Asset Value) represents the per-unit price of the fund, calculated daily.',
      'Fund categories include Equity funds, Debt funds, Hybrid funds, and Solution-oriented funds.'
    ],
    keyTakeaway: 'Mutual funds pool collective investor capital for professional management and built-in diversification.',
    quiz: [
      {
        id: 'q5-1',
        question: 'What is Net Asset Value (NAV) in a mutual fund?',
        options: [
          'The maximum loan amount you can take against your fund.',
          'The per-unit market value of the fund\'s assets minus liabilities, calculated at the end of the day.',
          'The guaranteed interest rate promised by the fund house.',
          'The total salary of the fund manager.'
        ],
        correctAnswer: 1,
        explanation: 'NAV is the per-unit price of a mutual fund scheme, updated at the end of every trading day based on the closing value of its holdings.'
      },
      {
        id: 'q5-2',
        question: 'Who manages the investments inside an active mutual fund?',
        options: [
          'A government committee of politicians.',
          'Professional fund managers and research analysts at an Asset Management Company (AMC).',
          'The individual investors vote on every single trade.',
          'Computer hackers.'
        ],
        correctAnswer: 1,
        explanation: 'AMCs employ professional fund managers who make buying and selling decisions in accordance with the scheme\'s regulatory mandate.'
      }
    ],
    relatedLessons: ['what-is-an-etf', 'what-is-sip', 'what-is-swp'],
    vestiqPrompt: 'Explain how mutual funds work and what NAV means for a beginner.'
  },

  // ── 6. WHY LONG-TERM INVESTING? ──
  {
    id: 'why-long-term-investing',
    number: 6,
    title: 'Why Long-Term Investing?',
    category: 'Investing Strategy',
    level: 'Beginner',
    durationSeconds: 100,
    description: 'Discover why time in the market beats timing the market, and how long investment horizons smooth out volatility.',
    aiVideoPrompt: `Sleek light fintech visual, calming teal and deep slate palette. Animated chart comparing short-term daily volatility (jagged line) against a smooth upward long-term trendline spanning 10 to 20 years. Illustration of economic cycles: expansion, correction, recovery. Clear subtitles. End screen: SmartVest Investing Academy - Learn first. Invest with understanding.`,
    transcript: `If you watch daily financial news, you might think investing is about constantly buying and selling based on daily headlines. But history shows that the most successful investors take a long-term approach.

Why? Because in the short term, markets are driven by emotion, news events, and short-term speculation. Prices can rise or fall sharply over days or weeks.

In the long term, however, stock markets reflect the underlying earnings power of businesses and economic productivity. As companies innovate, increase profits, and expand, their intrinsic value grows.

For example, over any single 1-year period, equity markets can have positive or negative returns. But as you extend your time horizon to 7, 10, or 15 years, the probability of positive real returns has historically increased significantly.

Long-term investing also saves you money on frequent brokerage fees, short-term capital gains taxes, and the emotional stress of trying to time market tops and bottoms.`,
    learningPoints: [
      'Short-term price moves are noisy; long-term returns track business earnings and economic growth.',
      'Holding investments over years helps absorb temporary market corrections and bear cycles.',
      'Attempting to time market highs and lows is statistically difficult even for professionals.',
      'Long-term investing reduces transaction costs, taxes, and emotional fatigue.'
    ],
    keyTakeaway: 'Time in the market beats timing the market; patience allows businesses and compounding to work for you.',
    quiz: [
      {
        id: 'q6-1',
        question: 'Why is long-term investing generally considered more reliable than short-term trading?',
        options: [
          'Because long-term investors are guaranteed never to experience any loss.',
          'Because over multi-year horizons, market values reflect economic growth and earnings rather than short-term speculation.',
          'Because stock exchanges ban selling for 10 years.',
          'Because governments fix stock prices over 5-year plans.'
        ],
        correctAnswer: 1,
        explanation: 'Over longer horizons, business fundamentals and economic expansion dominate the emotional fluctuations of daily trading.'
      },
      {
        id: 'q6-2',
        question: 'What is a major downside of frequent short-term buying and selling?',
        options: [
          'It is too relaxing.',
          'Higher transaction costs, capital gains taxes, and risk of mistiming the market.',
          'You receive too many dividend cheques.',
          'Companies will cancel your shares.'
        ],
        correctAnswer: 1,
        explanation: 'Frequent turnover incurs brokerage fees, triggers short-term tax liabilities, and increases the likelihood of selling low during panics.'
      }
    ],
    relatedLessons: ['what-is-compounding', 'what-is-sip', 'risk-return-diversification'],
    vestiqPrompt: 'Why does a long-term investment horizon reduce risk compared to short-term trading?'
  },

  // ── 7. WHAT IS COMPOUNDING? ──
  {
    id: 'what-is-compounding',
    number: 7,
    title: 'What is Compounding?',
    category: 'Investing Strategy',
    level: 'Beginner',
    durationSeconds: 105,
    description: 'Learn how mathematical compounding allows returns to generate their own returns over time when reinvested.',
    aiVideoPrompt: `High-quality modern fintech education style, bright clean background. Animated snowball rolling down a gentle hill, picking up snow and accelerating in size. Interactive bar chart demonstrating 5, 10, 20, and 30-year exponential compounding curves. Clear Indian rupee examples (₹10,000 growing over time). Professional narration with clear captions. End screen: SmartVest Investing Academy.`,
    transcript: `Albert Einstein is often said to have called compound interest the eighth wonder of the world. But what is it mathematically, and why does it matter to you?

Simple growth means earning returns only on your original principal. Compounding means earning returns on your principal PLUS all the accumulated returns from previous years.

Think of it like a snowball rolling down a snowy hill. At first, it grows slowly. But as it rolls further, its larger surface area picks up even more snow on every rotation.

Imagine you invest ₹1,00,000 at a hypothetical return of 10% per year.
In Year 1, you earn ₹10,000, bringing your total to ₹1,10,000.
In Year 2, you earn 10% not on ₹1,00,000, but on ₹1,10,000—which is ₹11,000.
By Year 10, your money grows to over ₹2.59 Lakhs.
By Year 20, it reaches approximately ₹6.72 Lakhs—without adding a single extra rupee!

The most critical ingredient in compounding is not how much money you start with—it is TIME. The earlier you start, the more powerful the compounding snowball becomes.`,
    learningPoints: [
      'Compounding happens when investment earnings are reinvested to generate their own subsequent earnings.',
      'Growth is non-linear: it accelerates dramatically in the later years of an investment.',
      'Time is the single most powerful factor in the compounding formula.',
      'Starting early with small amounts can outperform starting late with larger amounts.'
    ],
    keyTakeaway: 'Compounding is mathematical momentum: returns earning returns over uninterrupted time.',
    quiz: [
      {
        id: 'q7-1',
        question: 'What is the core mechanism of compounding?',
        options: [
          'Borrowing money from friends to buy more lottery tickets.',
          'Reinvesting earned returns so that future returns are calculated on a progressively larger balance.',
          'Withdrawing all profits every week to spend on luxuries.',
          'Asking the bank manager for a discretionary bonus.'
        ],
        correctAnswer: 1,
        explanation: 'Compounding occurs when your accumulated returns remain invested and generate additional returns alongside your original principal.'
      },
      {
        id: 'q7-2',
        question: 'Which factor has the greatest multiplier effect on compounding over a lifetime?',
        options: [
          'Checking the stock market price every 5 minutes.',
          'The length of time your money stays invested.',
          'Picking only the highest risk micro-cap stocks.',
          'Timing the exact day of the year to buy.'
        ],
        correctAnswer: 1,
        explanation: 'Time is the exponent in the compound interest formula; more years create exponentially larger growth.'
      }
    ],
    relatedLessons: ['why-long-term-investing', 'what-is-sip', 'how-to-start-investing'],
    vestiqPrompt: 'Explain compounding with a simple example using ₹5,000 invested monthly.'
  },

  // ── 8. WHAT IS SIP? ──
  {
    id: 'what-is-sip',
    number: 8,
    title: 'What is SIP?',
    category: 'India Investing',
    level: 'Beginner',
    durationSeconds: 95,
    description: 'Understand Systematic Investment Plans, Rupee Cost Averaging, and how regular investing builds disciplined habits.',
    aiVideoPrompt: `Fintech education aesthetic, clean light theme, teal and emerald green accents. Calendar animation showing an automated deduction of ₹2,000 on the 5th of every month into a mutual fund. Visual diagram showing Rupee Cost Averaging: buying more units when prices dip and fewer units when prices rise. Professional presenter in Indian English. End screen: SmartVest Investing Academy.`,
    transcript: `In India, one of the most popular ways to invest in mutual funds is through a SIP—which stands for Systematic Investment Plan.

A SIP is NOT a separate investment product; it is an automated METHOD of investing.

Instead of trying to save up a large lump sum like ₹1,00,000 and stressing over the 'right time' to enter the market, a SIP lets you invest a fixed amount—such as ₹1,000, ₹5,000, or ₹10,000—at regular intervals, usually every month.

The major benefit of a SIP is Rupee Cost Averaging.
When markets go down, your fixed monthly amount buys MORE units of the fund at a discount.
When markets go up, your fixed monthly amount buys FEWER units at higher prices.
Over time, this averages out your acquisition cost and removes the emotional stress of timing the market.

SIPs also build financial discipline: money gets invested automatically right after your monthly salary arrives.`,
    learningPoints: [
      'A SIP (Systematic Investment Plan) is a disciplined method of recurring investment, not an asset class.',
      'Rupee Cost Averaging automatically buys more units during market dips and fewer during peaks.',
      'SIP eliminates the stressful guesswork of trying to time the market.',
      'You can start with as little as ₹500 per month and increase your SIP amount as your income grows.'
    ],
    keyTakeaway: 'A SIP turns regular savings into automated investing through disciplined Rupee Cost Averaging.',
    quiz: [
      {
        id: 'q8-1',
        question: 'What does SIP stand for?',
        options: [
          'Standard Insurance Policy',
          'Systematic Investment Plan',
          'State Interest Program',
          'Securities Index Portfolio'
        ],
        correctAnswer: 1,
        explanation: 'SIP stands for Systematic Investment Plan, a popular method for investing a fixed amount regularly in mutual funds.'
      },
      {
        id: 'q8-2',
        question: 'How does Rupee Cost Averaging help a SIP investor during market downturns?',
        options: [
          'It automatically pauses your investments until markets recover.',
          'Your fixed monthly contribution buys more units at cheaper NAV prices.',
          'It forces the fund to refund all your previous losses.',
          'It guarantees an immediate dividend from the government.'
        ],
        correctAnswer: 1,
        explanation: 'Because your investment amount is fixed, lower unit prices during market dips mean you purchase more units, lowering your average cost per unit.'
      }
    ],
    relatedLessons: ['what-is-swp', 'what-is-a-mutual-fund', 'what-is-compounding'],
    vestiqPrompt: 'Explain SIP using ₹5,000 per month and how Rupee Cost Averaging works.'
  },

  // ── 9. WHAT IS SWP? ──
  {
    id: 'what-is-swp',
    number: 9,
    title: 'What is SWP?',
    category: 'India Investing',
    level: 'Beginner',
    durationSeconds: 95,
    description: 'Learn how Systematic Withdrawal Plans allow structured cash flow from accumulated corpus during retirement or financial goals.',
    aiVideoPrompt: `Modern light fintech aesthetic, teal and slate color accents. Animated diagram demonstrating the reverse of SIP: a large accumulated corpus in a mutual fund releasing a steady monthly cash flow (e.g. ₹25,000) directly to an investor's bank account while the remaining balance stays invested. Professional presenter with clear subtitles. End screen: SmartVest Investing Academy.`,
    transcript: `If a SIP is how you build wealth over time, how do you harvest that wealth when you retire or need regular income? The answer is a Systematic Withdrawal Plan, or SWP.

An SWP is the exact mirror image of a SIP.

Instead of depositing money into a mutual fund each month, an SWP allows you to withdraw a fixed sum of money—say ₹25,000 every month—directly into your bank account from your existing mutual fund corpus.

Here is what happens behind the scenes:
Every month, the mutual fund house redeems just enough units from your folio at the current NAV to match your requested withdrawal amount. The rest of your corpus stays invested in the fund, continuing to generate potential returns.

SWPs are widely used by retirees in India because they provide predictable cash flow and are often more tax-efficient than receiving traditional bank fixed deposit interest or dividends.`,
    learningPoints: [
      'An SWP (Systematic Withdrawal Plan) allows scheduled periodic cash withdrawals from an existing fund corpus.',
      'Only the necessary number of fund units are redeemed each cycle, leaving the balance invested.',
      'SWPs offer cash-flow customization for retirees and individuals needing passive income.',
      'Withdrawal rates must be managed carefully so the corpus does not deplete prematurely during bear markets.'
    ],
    keyTakeaway: 'An SWP provides structured periodic income by systematically redeeming units while keeping your remaining capital invested.',
    quiz: [
      {
        id: 'q9-1',
        question: 'What is the primary purpose of a Systematic Withdrawal Plan (SWP)?',
        options: [
          'To invest fresh money every week into small-cap stocks.',
          'To withdraw a fixed sum periodically from an existing mutual fund corpus to create steady cash flow.',
          'To take a bank loan without paying interest.',
          'To close your bank account permanently.'
        ],
        correctAnswer: 1,
        explanation: 'An SWP enables investors to redeem a specified amount on a recurring schedule from their existing mutual fund holdings.'
      },
      {
        id: 'q9-2',
        question: 'What happens to the money that remains in the fund after an SWP monthly payout?',
        options: [
          'It is confiscated by the stock exchange.',
          'It stays invested in the fund and continues to participate in market returns.',
          'It gets converted into physical gold coins.',
          'It is taxed at 100% immediately.'
        ],
        correctAnswer: 1,
        explanation: 'Only the units needed to fund the withdrawal are sold; the rest of your portfolio stays invested in the scheme.'
      }
    ],
    relatedLessons: ['what-is-sip', 'what-is-a-mutual-fund', 'risk-return-diversification'],
    vestiqPrompt: 'Explain how an SWP works for retirement cash flow in simple terms.'
  },

  // ── 10. WHAT IS A HEDGE FUND? ──
  {
    id: 'what-is-a-hedge-fund',
    number: 10,
    title: 'What is a Hedge Fund?',
    category: 'Investment Products',
    level: 'Beginner',
    durationSeconds: 115,
    description: 'Understand alternative investment funds, sophisticated strategies, leverage, short selling, and accredited investor requirements.',
    aiVideoPrompt: `Clean light fintech background, navy and teal modern graphics. Visual showing the difference between a retail mutual fund (open to everyone, strictly regulated) vs. a hedge fund / AIF (high minimum investment, sophisticated tools like long/short and derivatives). Clear diagrams of risk and fee structures (e.g. 2 and 20). Professional presenter. End screen: SmartVest Investing Academy.`,
    transcript: `You might hear financial news mention 'Hedge Funds' moving markets. But what are they, and how do they differ from normal mutual funds?

A Hedge Fund is an alternative pooled investment fund designed for institutional investors and high-net-worth individuals. In India, these are often categorized under Category III Alternative Investment Funds (AIFs).

Unlike standard mutual funds—which have strict limits on risk and generally only buy assets expecting them to rise—hedge funds use sophisticated and aggressive strategies to seek returns in any market environment:

1. Long and Short positions: Buying undervalued assets and short-selling overvalued assets to profit when they fall.
2. Leverage: Borrowing money to magnify investment exposure.
3. Derivatives: Using options and futures for hedging and directional bets.

Because of their complexity and risk, hedge funds have high minimum investment thresholds (often ₹1 Crore or more in India) and carry higher management and performance fees. For everyday retail investors, standard low-cost index ETFs and mutual funds are usually the practical choice.`,
    learningPoints: [
      'Hedge funds are alternative pooled vehicles primarily for institutional and accredited high-net-worth investors.',
      'They utilize complex strategies including short-selling, leverage, and derivatives.',
      'Hedge funds typically charge management fees plus performance fees on profits.',
      'Retail investors generally achieve broad, cost-effective diversification through regular mutual funds and ETFs.'
    ],
    keyTakeaway: 'Hedge funds are specialized, high-minimum funds using complex strategies and leverage to pursue returns in all market conditions.',
    quiz: [
      {
        id: 'q10-1',
        question: 'Who are hedge funds typically designed for?',
        options: [
          'High-school students opening their first pocket-money bank account.',
          'Accredited, high-net-worth, and institutional investors who can handle high minimums and complex risks.',
          'Anyone with ₹100 looking for a zero-risk deposit.',
          'Government pension officers only.'
        ],
        correctAnswer: 1,
        explanation: 'Hedge funds require significant minimum capital and are restricted to institutional or sophisticated accredited investors.'
      },
      {
        id: 'q10-2',
        question: 'Which of the following is a common strategy used by hedge funds that is rarely used by standard retail mutual funds?',
        options: [
          'Short-selling (betting on price drops) and aggressive leverage (borrowed funds).',
          'Opening basic savings bank accounts.',
          'Giving free loans to the general public.',
          'Buying physical lottery tickets.'
        ],
        correctAnswer: 0,
        explanation: 'Hedge funds frequently use short positions, leverage, and complex derivatives to execute multi-directional market strategies.'
      }
    ],
    relatedLessons: ['what-is-an-etf', 'what-is-a-mutual-fund', 'risk-return-diversification'],
    vestiqPrompt: 'What is a hedge fund and how does it differ from a retail mutual fund?'
  },

  // ── 11. RISK, RETURN & DIVERSIFICATION ──
  {
    id: 'risk-return-diversification',
    number: 11,
    title: 'Risk, Return & Diversification',
    category: 'Core Principles',
    level: 'Beginner',
    durationSeconds: 120,
    description: 'Learn the foundational relationship between risk and potential return, and how asset allocation cushions market shocks.',
    aiVideoPrompt: `Modern light fintech educational visual, teal and warm slate palette. Interactive seesaw balance graphic showing Higher Risk on one side and Higher Potential Return on the other. Visual metaphor of not putting all eggs in one basket: spreading capital across equities, bonds, gold, and liquid cash. Clean Indian English narration with subtitles. End screen: SmartVest Investing Academy.`,
    transcript: `There is a fundamental rule in the financial world that every investor must understand: Risk and Potential Return are inextricably linked.

If an investment promises high potential returns, it inevitably comes with higher risk of capital loss or volatility. Conversely, low-risk options like government treasury bills offer safety, but their returns may barely keep up with inflation.

No investment is completely risk-free. Even cash carries the silent risk of inflation.

This is why experienced investors rely on the most powerful risk-management tool available: Diversification.

Diversification means not putting all your eggs in one basket. By spreading your money across different asset classes (like equities, debt, and gold), different industries (like technology, healthcare, and banking), and different geographies (like India and the US), you protect your portfolio.

If one sector suffers a downturn, gains in another asset class can cushion the blow. Diversification does not eliminate market risk, but it helps ensure that a single bad event does not derail your financial future.`,
    learningPoints: [
      'Higher potential returns always require taking on higher risk or volatility.',
      'No asset is entirely risk-free; holding cash exposes you to inflation risk.',
      'Diversification spreads capital across uncorrelated assets, sectors, and geographies.',
      'Asset allocation is the primary driver of portfolio risk and long-term stability.'
    ],
    keyTakeaway: 'You cannot eliminate risk, but smart diversification balances risk and return across asset classes.',
    quiz: [
      {
        id: 'q11-1',
        question: 'What is the financial relationship between risk and potential return?',
        options: [
          'High potential return investments always carry zero risk.',
          'Higher potential returns generally require taking on greater risk and volatility.',
          'Risk and return have no connection whatsoever.',
          'Low risk always guarantees double-digit returns.'
        ],
        correctAnswer: 1,
        explanation: 'In financial markets, higher potential returns compensate investors for bearing greater uncertainty and potential volatility.'
      },
      {
        id: 'q11-2',
        question: 'What is the primary purpose of diversifying your investment portfolio?',
        options: [
          'To guarantee you will become a billionaire in 30 days.',
          'To reduce overall portfolio volatility and protect against losses in any single company or sector.',
          'To pay higher brokerage fees to stock exchanges.',
          'To avoid paying for internet connection.'
        ],
        correctAnswer: 1,
        explanation: 'Diversification spreads exposure across different asset classes and sectors so that no single adverse event severely harms the total portfolio.'
      }
    ],
    relatedLessons: ['why-long-term-investing', 'what-is-an-etf', 'how-to-start-investing'],
    vestiqPrompt: 'Explain risk, return, and diversification using a balanced asset allocation example.'
  },

  // ── 12. HOW TO START INVESTING ──
  {
    id: 'how-to-start-investing',
    number: 12,
    title: 'How to Start Investing',
    category: 'Core Principles',
    level: 'Beginner',
    durationSeconds: 110,
    description: 'A step-by-step practical beginner framework: emergency funds, goal setting, opening accounts, and starting with small steps.',
    aiVideoPrompt: `Inspiring modern fintech educational visual, bright clean background with teal and emerald accents. Step-by-step 4-stage road map: 1. Build Emergency Fund, 2. Define Goals, 3. Complete KYC / Open Demat, 4. Start Small via Index SIP. Confident young presenter with clear subtitles. End screen: SmartVest Investing Academy - Learn first. Invest with understanding.`,
    transcript: `Congratulations on learning the foundational concepts of investing! Now, how do you actually take your first step?

Here is a practical 4-step framework for absolute beginners:

Step 1: Build an Emergency Fund.
Before investing in market-linked assets, save 3 to 6 months of living expenses in a safe, liquid bank savings account or liquid fund. This ensures you never have to sell investments in a panic during unexpected medical or personal emergencies.

Step 2: Define Your Goals and Time Horizon.
Money you need within 1 to 2 years belongs in low-risk fixed income. Money for goals 5, 10, or 20 years away—like retirement or buying a home—can be invested in equity mutual funds or index ETFs.

Step 3: Complete KYC and Open Accounts.
Complete your digital Know-Your-Customer (KYC) process with a registered broker or direct mutual fund platform to obtain your demat and trading account.

Step 4: Start Small and Stay Consistent.
You don't need a huge sum. Start with a simple monthly SIP of ₹1,000 in a broad market index fund or ETF. Focus on building the habit of consistency.

Learn first, start small, and invest with understanding.`,
    learningPoints: [
      'Always maintain a 3–6 month emergency fund before investing in volatile markets.',
      'Match your investments to your timeline: short-term in fixed income, long-term in equities.',
      'Complete digital KYC with regulatory-compliant platforms.',
      'Start with small, consistent SIPs in broad-market index funds and scale up as your knowledge grows.'
    ],
    keyTakeaway: 'Start by securing an emergency fund, defining your time horizon, and building a consistent monthly investing habit.',
    quiz: [
      {
        id: 'q12-1',
        question: 'What is the recommended first step before starting to invest in the stock market?',
        options: [
          'Borrow money from a personal loan to buy speculative stocks.',
          'Build a 3 to 6 month emergency fund in safe, liquid savings.',
          'Quit your job to trade full-time immediately.',
          'Buy cryptocurrency based on social media tips.'
        ],
        correctAnswer: 1,
        explanation: 'An emergency fund provides a financial cushion so you never have to liquidate your long-term investments during unexpected emergencies.'
      },
      {
        id: 'q12-2',
        question: 'What is the best approach for a beginner starting their investment journey?',
        options: [
          'Put all your life savings into one single micro-cap stock.',
          'Start small with a consistent monthly SIP in a diversified index fund or ETF, and learn continuously.',
          'Wait until you have at least ₹50 Lakhs before investing anything.',
          'Follow anonymous tips on messaging apps.'
        ],
        correctAnswer: 1,
        explanation: 'Starting with small, automated SIPs in diversified broad-market funds allows beginners to build confidence and long-term wealth sustainably.'
      }
    ],
    relatedLessons: ['what-is-investment', 'what-is-sip', 'risk-return-diversification'],
    vestiqPrompt: 'What are the first 3 steps a beginner in India should take to start investing safely?'
  }
];

// Helper functions for Academy querying and navigation
export function getLessonById(id: string): InvestmentLesson | undefined {
  return INVESTMENT_LESSONS.find((lesson) => lesson.id === id);
}

export function getLessonByNumber(num: number): InvestmentLesson | undefined {
  return INVESTMENT_LESSONS.find((lesson) => lesson.number === num);
}

export function getNextLesson(currentId: string): InvestmentLesson | undefined {
  const currentIndex = INVESTMENT_LESSONS.findIndex((lesson) => lesson.id === currentId);
  if (currentIndex >= 0 && currentIndex < INVESTMENT_LESSONS.length - 1) {
    return INVESTMENT_LESSONS[currentIndex + 1];
  }
  return undefined;
}

export function getPreviousLesson(currentId: string): InvestmentLesson | undefined {
  const currentIndex = INVESTMENT_LESSONS.findIndex((lesson) => lesson.id === currentId);
  if (currentIndex > 0) {
    return INVESTMENT_LESSONS[currentIndex - 1];
  }
  return undefined;
}

export function getRelatedLessons(lesson: InvestmentLesson): InvestmentLesson[] {
  return lesson.relatedLessons
    .map((id) => getLessonById(id))
    .filter((l): l is InvestmentLesson => l !== undefined);
}

export const ACADEMY_CATEGORIES: { id: InvestmentLesson['category']; label: string }[] = [
  { id: 'Fundamentals', label: 'Fundamentals' },
  { id: 'Investment Products', label: 'Investment Products' },
  { id: 'Investing Strategy', label: 'Investing Strategy' },
  { id: 'India Investing', label: 'India Investing' },
  { id: 'Core Principles', label: 'Core Principles' },
];
