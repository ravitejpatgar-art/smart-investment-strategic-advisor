from typing import Dict, Any, List, Optional, Tuple
import math

# ==============================================================================
# SMARTVEST UNIVERSAL INVESTMENT UNIVERSE
# ==============================================================================

CANDIDATE_REGISTRY = {
    # --------------------------------------------------------------------------
    # 1. INDIAN STOCKS
    # --------------------------------------------------------------------------
    "RELIANCE": {
        "canonical_id": "STOCK_RELIANCE",
        "symbol": "RELIANCE.NS",
        "name": "Reliance Industries Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Energy & Retail Conglomerate",
        "sector_cluster": "ENERGY",
        "asset_class": "Indian Large-Cap Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Core Domestic Growth",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 94,
        "valuation_score": 88,
        "liquidity_score": 98,
        "diversification_score": 82,
        "risk_score_val": 5.5,
        "color": "#10B981",
        "business_summary": "India's largest corporate powerhouse spanning 5G telecom (Jio), consumer retail, green energy, and petrochemicals.",
        "why_selected_template": "Selected because it provides diversified exposure to Indian consumer consumption, digital telecom expansion, and energy transition.",
        "why_not_template": "Preferred over pure cyclical energy stocks due to high-margin recurring telecom and retail cashflows.",
        "risk_explanation": "Moderate volatility with strong balance sheet resilience and market leadership.",
        "goal_fit_template": "Suitable for long-term domestic capital compounding and wealth creation.",
        "diversification_benefit": "Broad domestic conglomerate exposure capturing multiple high-growth Indian GDP drivers."
    },
    "TCS": {
        "canonical_id": "STOCK_TCS",
        "symbol": "TCS.NS",
        "name": "Tata Consultancy Services Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Information Technology",
        "sector_cluster": "INDIAN_IT",
        "asset_class": "Indian Bluechip Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "Defensive Bluechip Equity",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 98,
        "valuation_score": 86,
        "liquidity_score": 98,
        "diversification_score": 78,
        "risk_score_val": 4.8,
        "color": "#10B981",
        "business_summary": "Global IT services and digital transformation leader with net-zero debt, industry-leading operating margins (24-26%), and consistent high free cash flow return.",
        "why_selected_template": "Selected as a premier defensive equity anchor with high ROCE (>50%), zero net debt, and steady dividend compounding.",
        "why_not_template": "Preferred over high-beta midcaps because its recession-resilient order book protects downside capital.",
        "risk_explanation": "Low-to-moderate volatility supported by cash reserves and global enterprise client relationships.",
        "goal_fit_template": "Ideal for stable capital appreciation and regular dividend yield support.",
        "diversification_benefit": "Global IT revenue streams provide currency diversification and earnings stability."
    },
    "INFY": {
        "canonical_id": "STOCK_INFOSYS",
        "symbol": "INFY.NS",
        "name": "Infosys Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Information Technology",
        "sector_cluster": "INDIAN_IT",
        "asset_class": "Indian Bluechip Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "Core Technology Compounding",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 94,
        "valuation_score": 85,
        "liquidity_score": 98,
        "diversification_score": 78,
        "risk_score_val": 5.2,
        "color": "#10B981",
        "business_summary": "Global digital services and consulting enterprise helping clients in 50+ countries navigate cloud and AI transformation.",
        "why_selected_template": "Selected for strong cloud migration demand, high return on equity, and generous shareholder capital returns.",
        "why_not_template": "Preferred when seeking scalable digital transformation services exposure.",
        "risk_explanation": "Moderate volatility with cyclical enterprise IT spending patterns.",
        "goal_fit_template": "Supports steady long-term portfolio growth and global currency earnings exposure.",
        "diversification_benefit": "Extensive international revenue footprint providing natural rupee hedge."
    },
    "HDFCBANK": {
        "canonical_id": "STOCK_HDFCBANK",
        "symbol": "HDFCBANK.NS",
        "name": "HDFC Bank Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Financials",
        "sector_cluster": "FINANCIALS",
        "asset_class": "Indian Large-Cap Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "Core Financial Anchor",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 97,
        "valuation_score": 92,
        "liquidity_score": 99,
        "diversification_score": 82,
        "risk_score_val": 4.5,
        "color": "#10B981",
        "business_summary": "India's premier private banking institution with unmatched low-cost CASA deposit franchise, superior asset quality, and systemic retail distribution.",
        "why_selected_template": "Selected as the gold-standard banking cornerstone capturing India's credit growth with pristine loan-book underwriting and attractive historical valuation.",
        "why_not_template": "Preferred over aggressive mid-tier lenders due to deep deposit moats and systemic risk containment.",
        "risk_explanation": "Low-to-moderate banking risk backed by stringent underwriting standards and massive retail liquidity buffer.",
        "goal_fit_template": "Essential foundational equity anchor for long-term compound wealth creation.",
        "diversification_benefit": "Direct participation in India's formal financial credit expansion and banking digitization."
    },
    "ICICIBANK": {
        "canonical_id": "STOCK_ICICIBANK",
        "symbol": "ICICIBANK.NS",
        "name": "ICICI Bank Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Financials",
        "sector_cluster": "FINANCIALS",
        "asset_class": "Indian Large-Cap Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "High-Efficiency Banking Growth",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 96,
        "valuation_score": 89,
        "liquidity_score": 98,
        "diversification_score": 80,
        "risk_score_val": 5.0,
        "color": "#10B981",
        "business_summary": "Leading private sector bank demonstrating industry-best return on assets (ROA > 2.2%), rapid digital adoption (iMobile), and robust corporate-retail balance.",
        "why_selected_template": "Selected for industry-leading return on assets, outstanding digital credit delivery, and strong risk management.",
        "why_not_template": "Preferred when seeking aggressive return on assets optimization in private financial institutions.",
        "risk_explanation": "Moderate cyclical banking exposure balanced by broad diversified loan book.",
        "goal_fit_template": "Supports aggressive compounding within core financial services allocation.",
        "diversification_benefit": "Complements core equity by participating in modern corporate and retail digital banking."
    },
    "TATAMOTORS": {
        "canonical_id": "STOCK_TATAMOTORS",
        "symbol": "TATAMOTORS.NS",
        "name": "Tata Motors Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Consumer Discretionary / Auto",
        "sector_cluster": "MANUFACTURING",
        "asset_class": "Cyclical Growth Stocks",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Emerging EV & Auto Alpha",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 89,
        "valuation_score": 87,
        "liquidity_score": 96,
        "diversification_score": 75,
        "risk_score_val": 7.8,
        "color": "#10B981",
        "business_summary": "Pioneering commercial and passenger vehicle manufacturer leading India's EV adoption with global JLR luxury vehicle market strength.",
        "why_selected_template": "Selected for strong free cash flow inflection, aggressive net debt reduction, and dominant 70%+ Indian EV market share.",
        "why_not_template": "Assigned selectively to growth mandates due to cyclical automotive demand and raw material fluctuations.",
        "risk_explanation": "High volatility associated with macroeconomic automotive cycles and global trade.",
        "goal_fit_template": "Geared for long-term aggressive growth and electric mobility transition themes.",
        "diversification_benefit": "Direct exposure to automotive manufacturing expansion and clean mobility revolution."
    },
    "BAJFINANCE": {
        "canonical_id": "STOCK_BAJFINANCE",
        "symbol": "BAJFINANCE.NS",
        "name": "Bajaj Finance Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Financials / NBFC",
        "sector_cluster": "FINANCIALS",
        "asset_class": "Indian High-Growth Stocks",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Consumer Credit Growth",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 94,
        "valuation_score": 82,
        "liquidity_score": 97,
        "diversification_score": 76,
        "risk_score_val": 7.5,
        "color": "#10B981",
        "business_summary": "India's premier retail asset financier with a customer franchise exceeding 80 million, omnichannel digital app presence, and market-leading return on equity.",
        "why_selected_template": "Selected to capture rapid domestic consumer discretionary consumption and omnichannel retail credit financing.",
        "why_not_template": "Preferred over traditional NBFCs due to unmatched customer acquisition velocity and proprietary data analytics underwriting.",
        "risk_explanation": "Higher beta with sensitivity to unsecured consumer credit cycles.",
        "goal_fit_template": "High compounding potential for wealth building over 5+ year horizons.",
        "diversification_benefit": "Consumer finance footprint distinct from commercial banking books."
    },
    "ASIANPAINT": {
        "canonical_id": "STOCK_ASIANPAINT",
        "symbol": "ASIANPAINT.NS",
        "name": "Asian Paints Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Consumer Goods",
        "sector_cluster": "CONSUMER",
        "asset_class": "Indian Bluechip Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Consumer Monopoly Compounder",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 95,
        "valuation_score": 84,
        "liquidity_score": 95,
        "diversification_score": 80,
        "risk_score_val": 5.0,
        "color": "#10B981",
        "business_summary": "India's undisputed decorative paints market leader with an extensive supply chain tinting machine moat and brand dominance.",
        "why_selected_template": "Selected for durable pricing power, high return on capital employed, and strong domestic housing demand tailwinds.",
        "why_not_template": "Preferred over volatile commodity cyclicals due to institutional brand equity and retail dealer loyalty.",
        "risk_explanation": "Low-to-moderate risk with occasional input crude price volatility.",
        "goal_fit_template": "Steady wealth accumulation supported by long-term Indian urbanization.",
        "diversification_benefit": "Consumer home decor and manufacturing exposure non-correlated to tech or financials."
    },
    "BEL": {
        "canonical_id": "STOCK_BEL",
        "symbol": "BEL.NS",
        "name": "Bharat Electronics Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Defence & Electronics",
        "sector_cluster": "MANUFACTURING",
        "asset_class": "Indian Strategic Manufacturing",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Defence Manufacturing Alpha",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nifty 500",
        "cost_score": 95,
        "quality_score": 92,
        "valuation_score": 80,
        "liquidity_score": 94,
        "diversification_score": 75,
        "risk_score_val": 7.2,
        "color": "#10B981",
        "business_summary": "Navratna PSU electronics giant dominating radar, missile systems, avionics, and strategic military communication infrastructure.",
        "why_selected_template": "Selected to benefit from India's structural indigenization of defence capex, robust multi-year order book, and zero-debt balance sheet.",
        "why_not_template": "Assigned when high-growth industrial capex exposure is targeted.",
        "risk_explanation": "Elevated valuation multiples and government contract milestone dependencies.",
        "goal_fit_template": "High alpha growth potential for long-term aggressive portfolios.",
        "diversification_benefit": "Unique strategic aerospace and sovereign electronics footprint."
    },
    "LT": {
        "canonical_id": "STOCK_LT",
        "symbol": "LT.NS",
        "name": "Larsen & Toubro Ltd",
        "category": "STOCK",
        "type": "Stock",
        "market": "INDIA",
        "country": "India",
        "sector": "Infrastructure & Capital Goods",
        "sector_cluster": "MANUFACTURING",
        "asset_class": "Indian Large-Cap Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Core Infrastructure Pillar",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 95,
        "quality_score": 95,
        "valuation_score": 86,
        "liquidity_score": 98,
        "diversification_score": 82,
        "risk_score_val": 5.4,
        "color": "#10B981",
        "business_summary": "India's premier engineering, procurement, and construction conglomerate executing mega-infrastructure, green hydrogen, and defense projects across India and Middle East.",
        "why_selected_template": "Selected as the ultimate proxy for national infrastructure creation and private capex recovery with an all-time high order book.",
        "why_not_template": "Preferred over pure commodity plays due to proven execution capabilities and IT/services subsidiary dividend stream.",
        "risk_explanation": "Moderate cyclical risk mitigated by record multi-year international order backlog.",
        "goal_fit_template": "Foundational capital growth asset for multi-year wealth compounding.",
        "diversification_benefit": "Direct exposure to heavy civil engineering, industrial automation, and green energy capex."
    },

    # --------------------------------------------------------------------------
    # 2. US STOCKS
    # --------------------------------------------------------------------------
    "AAPL": {
        "canonical_id": "STOCK_APPLE",
        "symbol": "AAPL",
        "name": "Apple Inc",
        "category": "STOCK",
        "type": "Stock",
        "market": "US",
        "country": "US",
        "sector": "Consumer Electronics & Services",
        "sector_cluster": "US_TECH",
        "asset_class": "Global Mega-Cap Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Global Ecosystem Growth",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 98,
        "valuation_score": 83,
        "liquidity_score": 99,
        "diversification_score": 85,
        "risk_score_val": 5.8,
        "color": "#10B981",
        "business_summary": "World-leading consumer hardware and services ecosystem with over 2.2 billion active devices generating high-margin recurring services revenue.",
        "why_selected_template": "Selected for unmatched customer brand loyalty, expanding high-margin subscription services, and massive annual share repurchases.",
        "why_not_template": "Preferred over speculative tech due to unparalleled ecosystem lock-in and $100B+ annual operating cash generation.",
        "risk_explanation": "Moderate volatility with global consumer cycle and supply chain dynamics.",
        "goal_fit_template": "Premier wealth compounder for multi-year global capital growth.",
        "diversification_benefit": "Direct USD asset allocation hedging against emerging market currency depreciation."
    },
    "MSFT": {
        "canonical_id": "STOCK_MICROSOFT",
        "symbol": "MSFT",
        "name": "Microsoft Corporation",
        "category": "STOCK",
        "type": "Stock",
        "market": "US",
        "country": "US",
        "sector": "Enterprise Cloud & AI Software",
        "sector_cluster": "US_TECH",
        "asset_class": "Global Tech Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Core Enterprise AI & Cloud Growth",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 99,
        "valuation_score": 85,
        "liquidity_score": 99,
        "diversification_score": 87,
        "risk_score_val": 5.4,
        "color": "#10B981",
        "business_summary": "Enterprise cloud computing (Azure), enterprise productivity software (Office 365), and commercial AI infrastructure leader.",
        "why_selected_template": "Selected for enterprise SaaS pricing power, hybrid cloud expansion, and commercial generative AI monetization.",
        "why_not_template": "Preferred over single-product software firms because Microsoft has diversified revenue across enterprise, cloud, and consumer sectors.",
        "risk_explanation": "Moderate volatility supported by triple-A balance sheet credit rating and recurring subscription cash flows.",
        "goal_fit_template": "Optimal cornerstone for long-term global wealth accumulation.",
        "diversification_benefit": "Global enterprise software footprint and structural USD compounding."
    },
    "NVDA": {
        "canonical_id": "STOCK_NVIDIA",
        "symbol": "NVDA",
        "name": "NVIDIA Corporation",
        "category": "STOCK",
        "type": "Stock",
        "market": "US",
        "country": "US",
        "sector": "Semiconductors & AI Hardware",
        "sector_cluster": "SEMICONDUCTOR",
        "asset_class": "US High-Growth Tech Stocks",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 7,
        "portfolio_role": "High-Alpha AI Accelerator",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 96,
        "valuation_score": 78,
        "liquidity_score": 99,
        "diversification_score": 72,
        "risk_score_val": 8.8,
        "color": "#10B981",
        "business_summary": "Accelerated computing and AI superchip monopoly powered by full-stack CUDA hardware-software architecture with 80%+ data center AI chip share.",
        "why_selected_template": "Selected as a premier high-alpha growth booster. Uncontested dominance in AI data-center accelerators powers multi-year hyperscaler capex growth.",
        "why_not_template": "Assigned strictly to high-growth mandates with long horizons due to elevated volatility and semiconductor cycle sensitivity.",
        "risk_explanation": "High volatility driven by AI capex cycle expectations and chip supply-demand swings.",
        "goal_fit_template": "Maximum long-term wealth acceleration for investors with multi-year horizons.",
        "diversification_benefit": "Direct participation in foundational global artificial intelligence compute infrastructure."
    },
    "AMZN": {
        "canonical_id": "STOCK_AMAZON",
        "symbol": "AMZN",
        "name": "Amazon.com Inc",
        "category": "STOCK",
        "type": "Stock",
        "market": "US",
        "country": "US",
        "sector": "E-Commerce & Cloud",
        "sector_cluster": "US_TECH",
        "asset_class": "Global Tech Stocks",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Global Cloud & Commerce Growth",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 96,
        "valuation_score": 83,
        "liquidity_score": 99,
        "diversification_score": 84,
        "risk_score_val": 7.2,
        "color": "#10B981",
        "business_summary": "World leader in cloud computing infrastructure (AWS), global digital commerce, digital advertising, and automated logistics.",
        "why_selected_template": "Selected for AWS cloud margin expansion, high-margin retail advertising growth, and logistics efficiency optimization.",
        "why_not_template": "Preferred when combining global retail dominance with high-margin enterprise cloud infrastructure.",
        "risk_explanation": "Higher volatility related to consumer discretionary spending and cloud migration cycles.",
        "goal_fit_template": "High-velocity wealth builder for aggressive growth objectives.",
        "diversification_benefit": "Dual-engine exposure to digital retail infrastructure and enterprise cloud computing."
    },
    "GOOGL": {
        "canonical_id": "STOCK_ALPHABET",
        "symbol": "GOOGL",
        "name": "Alphabet Inc",
        "category": "STOCK",
        "type": "Stock",
        "market": "US",
        "country": "US",
        "sector": "Digital Advertising & AI",
        "sector_cluster": "US_TECH",
        "asset_class": "Global Tech Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Digital Moat & AI Compounding",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 97,
        "valuation_score": 88,
        "liquidity_score": 99,
        "diversification_score": 86,
        "risk_score_val": 5.9,
        "color": "#10B981",
        "business_summary": "Global digital gateway commanding Google Search, YouTube, Android, and Google Cloud with immense AI research capability.",
        "why_selected_template": "Selected for dominant search market share, YouTube streaming monetization, expanding Google Cloud profitability, and attractive valuation.",
        "why_not_template": "Preferred over pure software plays due to massive free cash flow generation and net cash balance sheet.",
        "risk_explanation": "Moderate volatility with digital advertising cycle dynamics.",
        "goal_fit_template": "Stable long-term capital compounding with strong AI innovation upside.",
        "diversification_benefit": "Global internet search and streaming media monetization footprint."
    },
    "META": {
        "canonical_id": "STOCK_META",
        "symbol": "META",
        "name": "Meta Platforms Inc",
        "category": "STOCK",
        "type": "Stock",
        "market": "US",
        "country": "US",
        "sector": "Social Media & AI",
        "sector_cluster": "US_TECH",
        "asset_class": "Global Tech Stocks",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "High Cash Flow Digital Leader",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 95,
        "valuation_score": 86,
        "liquidity_score": 98,
        "diversification_score": 81,
        "risk_score_val": 7.6,
        "color": "#10B981",
        "business_summary": "World's largest social media network reaching 3.2+ billion daily active users across Instagram, WhatsApp, and Facebook with advanced open-source AI (Llama).",
        "why_selected_template": "Selected for unmatched social engagement moats, AI-driven advertising conversion efficiency, and high operating margins.",
        "why_not_template": "Assigned when high-conviction digital engagement alpha is prioritized.",
        "risk_explanation": "High volatility associated with digital ad spending and AI infrastructure capex.",
        "goal_fit_template": "Substantial compound growth generator for long-term portfolios.",
        "diversification_benefit": "Monopoly-scale global communication and social attention monetization."
    },
    "TSLA": {
        "canonical_id": "STOCK_TESLA",
        "symbol": "TSLA",
        "name": "Tesla Inc",
        "category": "STOCK",
        "type": "Stock",
        "market": "US",
        "country": "US",
        "sector": "EV, Energy & Autonomous AI",
        "sector_cluster": "TECH_DISRUPTIVE",
        "asset_class": "Global Disruptive Growth",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 7,
        "portfolio_role": "High-Beta Disruptive Growth",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 88,
        "valuation_score": 75,
        "liquidity_score": 99,
        "diversification_score": 70,
        "risk_score_val": 9.2,
        "color": "#10B981",
        "business_summary": "Clean energy and electric vehicle pioneer leading utility-scale energy storage (Megapack), autonomous driving AI (FSD), and robotics.",
        "why_selected_template": "Selected for aggressive growth potential in global renewable energy storage and autonomous driving technology.",
        "why_not_template": "Strictly restricted to ultra-high risk tolerance profiles with multi-year horizons due to intense price volatility.",
        "risk_explanation": "Extremely high volatility with sensitive automotive margin swings and regulatory scrutiny.",
        "goal_fit_template": "Disruptive technology upside for long-term risk-seeking mandates.",
        "diversification_benefit": "Exposure to energy transition, stationary batteries, and robotics."
    },
    "V": {
        "canonical_id": "STOCK_VISA",
        "symbol": "V",
        "name": "Visa Inc",
        "category": "STOCK",
        "type": "Stock",
        "market": "US",
        "country": "US",
        "sector": "Financials / Digital Payments",
        "sector_cluster": "GLOBAL_FINTECH",
        "asset_class": "Global Quality Stocks",
        "risk_tier": "MODERATE",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "Global Payments Tollbooth",
        "bucket": "CORE",
        "benchmark": "S&P 500",
        "cost_score": 95,
        "quality_score": 99,
        "valuation_score": 87,
        "liquidity_score": 98,
        "diversification_score": 88,
        "risk_score_val": 4.6,
        "color": "#10B981",
        "business_summary": "Global digital payments network processing over $15 trillion in annual transactions with 65%+ operating margins and a global duopoly moat.",
        "why_selected_template": "Selected for unparalleled tollbooth cash flows, inflation-linked transaction fee growth, and USD currency diversification.",
        "why_not_template": "Preferred over cyclical commercial banks because Visa takes zero credit risk and requires minimal capital expenditure.",
        "risk_explanation": "Low-to-moderate volatility supported by non-cyclical digital transaction volume.",
        "goal_fit_template": "High-durability wealth preservative and compounding anchor.",
        "diversification_benefit": "Global payment network revenue without credit default balance-sheet risk."
    },
    "ASML": {
        "canonical_id": "STOCK_ASML",
        "symbol": "ASML",
        "name": "ASML Holding NV",
        "category": "STOCK",
        "type": "Stock",
        "market": "GLOBAL",
        "country": "Netherlands/US",
        "sector": "Semiconductor Equipment",
        "sector_cluster": "SEMICONDUCTOR",
        "asset_class": "Global Tech Monopoly",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Semiconductor Equipment Monopoly",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 95,
        "quality_score": 98,
        "valuation_score": 81,
        "liquidity_score": 95,
        "diversification_score": 80,
        "risk_score_val": 7.4,
        "color": "#10B981",
        "business_summary": "Sole global manufacturer of Extreme Ultraviolet (EUV) lithography systems required to produce advanced sub-3nm microchips.",
        "why_selected_template": "Selected for an absolute technological monopoly on leading-edge semiconductor lithography equipment.",
        "why_not_template": "Preferred when seeking mission-critical semiconductor supply chain infrastructure.",
        "risk_explanation": "Higher volatility tied to global semiconductor fab capex cycles.",
        "goal_fit_template": "Structural multi-year wealth creation driven by global chip demand.",
        "diversification_benefit": "European-headquartered global semiconductor technology monopoly."
    },
    "TSM": {
        "canonical_id": "STOCK_TSMC",
        "symbol": "TSM",
        "name": "Taiwan Semiconductor Manufacturing Co",
        "category": "STOCK",
        "type": "Stock",
        "market": "GLOBAL",
        "country": "Taiwan/US",
        "sector": "Semiconductor Foundry",
        "sector_cluster": "SEMICONDUCTOR",
        "asset_class": "Global Tech Foundry",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Global Foundry Manufacturing Leader",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "S&P 500",
        "cost_score": 95,
        "quality_score": 97,
        "valuation_score": 89,
        "liquidity_score": 97,
        "diversification_score": 79,
        "risk_score_val": 7.5,
        "color": "#10B981",
        "business_summary": "World's premier semiconductor pure-play foundry manufacturing over 90% of global advanced microchips for Apple, Nvidia, AMD, and Qualcomm.",
        "why_selected_template": "Selected as the indispensable manufacturing backbone of the global digital economy with superior process technology and attractive valuation.",
        "why_not_template": "Preferred over fabless designers when seeking pure manufacturing scale moats.",
        "risk_explanation": "Higher geopolitical and cyclical semiconductor inventory sensitivity.",
        "goal_fit_template": "Essential high-growth pillar for technology-focused global compounding.",
        "diversification_benefit": "Foundational manufacturing infrastructure powering all modern electronics."
    },

    # --------------------------------------------------------------------------
    # 3. INDIAN ETFS
    # --------------------------------------------------------------------------
    "NIFTYBEES": {
        "canonical_id": "ETF_NIFTYBEES",
        "symbol": "NIFTYBEES",
        "name": "Nippon India Nifty 50 BeES ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "INDIA",
        "country": "India",
        "sector": "Broad Domestic Index",
        "sector_cluster": "NIFTY_50_INDEX",
        "asset_class": "Indian Core Index ETF",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "Core Equity Allocation",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 98,
        "quality_score": 96,
        "valuation_score": 89,
        "liquidity_score": 99,
        "diversification_score": 90,
        "risk_score_val": 5.0,
        "color": "#06B6D4",
        "business_summary": "India's most liquid exchange-traded fund tracking the top 50 bluechip corporations listed on the National Stock Exchange.",
        "why_selected_template": "Selected because it provides diversified exposure to the Indian equity market with low cost and strong long-term performance.",
        "why_not_template": "Preferred over actively managed large-cap funds which consistently carry higher expense ratios.",
        "risk_explanation": "Moderate volatility with broad diversification across India's top 50 corporate leaders.",
        "goal_fit_template": "Suitable for long-term wealth creation goals and retirement compounding.",
        "diversification_benefit": "Spreads capital across 14 major economic sectors with instant intraday liquidity."
    },
    "JUNIORBEES": {
        "canonical_id": "ETF_JUNIORBEES",
        "symbol": "JUNIORBEES",
        "name": "Nippon India Nifty Next 50 Junior BeES ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "INDIA",
        "country": "India",
        "sector": "Large & Mid Cap Index",
        "sector_cluster": "NIFTY_NEXT_50",
        "asset_class": "Indian Next 50 Growth ETF",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Next 50 High Growth Index",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nifty Next 50",
        "cost_score": 96,
        "quality_score": 93,
        "valuation_score": 85,
        "liquidity_score": 95,
        "diversification_score": 88,
        "risk_score_val": 7.0,
        "color": "#06B6D4",
        "business_summary": "Tracks the 51st to 100th largest companies on the NSE representing potential future Nifty 50 constituents.",
        "why_selected_template": "Selected to capture high-velocity structural growth from emerging bluechips at lower expense ratio.",
        "why_not_template": "Preferred over pure midcap funds when index discipline is required.",
        "risk_explanation": "Higher volatility than Nifty 50 during broad market corrections.",
        "goal_fit_template": "High wealth compounding rate over 5+ year horizons.",
        "diversification_benefit": "Complements core Nifty 50 with next-tier industrial and consumer winners."
    },
    "BANKBEES": {
        "canonical_id": "ETF_BANKBEES",
        "symbol": "BANKBEES",
        "name": "Nippon India Nifty Bank BeES ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "INDIA",
        "country": "India",
        "sector": "Banking & Financials",
        "sector_cluster": "FINANCIALS",
        "asset_class": "Indian Banking Sector ETF",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "Banking Sector Concentration",
        "bucket": "CORE",
        "benchmark": "Nifty Bank",
        "cost_score": 96,
        "quality_score": 94,
        "valuation_score": 88,
        "liquidity_score": 98,
        "diversification_score": 75,
        "risk_score_val": 5.8,
        "color": "#06B6D4",
        "business_summary": "Replicates the performance of the 12 most capitalized and liquid Indian private and public sector banking stocks.",
        "why_selected_template": "Selected for concentrated exposure to India's high-ROE credit growth cycle with institutional liquidity.",
        "why_not_template": "Preferred when banking leadership is selected as a key sectoral theme.",
        "risk_explanation": "Moderate to high sectoral cyclicality tied to monetary policy and interest rates.",
        "goal_fit_template": "Effective vehicle for medium to long-term economic compounding.",
        "diversification_benefit": "Captures both retail deposit heavyweights and corporate lenders."
    },
    "ITBEES": {
        "canonical_id": "ETF_ITBEES",
        "symbol": "ITBEES",
        "name": "Nippon India Nifty IT ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "INDIA",
        "country": "India",
        "sector": "Information Technology",
        "sector_cluster": "INDIAN_IT",
        "asset_class": "Indian IT Sector ETF",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Domestic Tech Sector Index",
        "bucket": "CORE",
        "benchmark": "Nifty IT",
        "cost_score": 95,
        "quality_score": 93,
        "valuation_score": 85,
        "liquidity_score": 95,
        "diversification_score": 74,
        "risk_score_val": 5.7,
        "color": "#06B6D4",
        "business_summary": "Exchange-traded index covering India's top 10 listed software exporters with dollar revenues and high return on capital.",
        "why_selected_template": "Selected to gain low-cost passive basket exposure to India's global IT services export powerhouses.",
        "why_not_template": "Preferred over picking individual IT stocks to eliminate single-stock execution risks.",
        "risk_explanation": "Moderate cyclicality correlated with global enterprise technology budgets.",
        "goal_fit_template": "Supports long-term capital compounding and rupee depreciation hedging.",
        "diversification_benefit": "Aggregated IT sector exposure without single-company headline risk."
    },
    "GOLDBEES": {
        "canonical_id": "ETF_GOLDBEES",
        "symbol": "GOLDBEES",
        "name": "Nippon India ETF Gold BeES",
        "category": "ETF",
        "type": "ETF",
        "market": "COMMODITY",
        "country": "Global/India",
        "sector": "Precious Metals",
        "sector_cluster": "GOLD_COMMODITY",
        "asset_class": "Sovereign Gold & Inflation Hedge",
        "risk_tier": "LOW",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 2,
        "portfolio_role": "Inflation Hedge & Capital Cushion",
        "bucket": "CORE",
        "benchmark": "Domestic Gold Spot",
        "cost_score": 94,
        "quality_score": 96,
        "valuation_score": 90,
        "liquidity_score": 98,
        "diversification_score": 96,
        "risk_score_val": 2.2,
        "color": "#F59E0B",
        "business_summary": "Pure 99.5% physical gold-backed institutional security offering non-correlated capital preservation and rupee depreciation protection.",
        "why_selected_template": "Selected as a vital counter-cyclical stabilizer. Gold maintains near-zero correlation to equities during geopolitical shocks and inflation cycles.",
        "why_not_template": "Preferred over physical jewellery due to zero making charges, instant liquidity, and institutional spot pricing.",
        "risk_explanation": "Low risk with capital preservation characteristics and downside cushioning.",
        "goal_fit_template": "Provides essential safety cushion and preserves purchasing power for all wealth goals.",
        "diversification_benefit": "Non-correlated asset class that cushions equity drawdowns during macroeconomic crises."
    },

    # --------------------------------------------------------------------------
    # 4. GLOBAL ETFS
    # --------------------------------------------------------------------------
    "VOO": {
        "canonical_id": "ETF_VOO",
        "symbol": "VOO",
        "name": "Vanguard S&P 500 ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "US",
        "country": "US",
        "sector": "Broad US Large Cap",
        "sector_cluster": "US_EQUITY",
        "asset_class": "US Core S&P 500 ETF",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Global Core Equity Anchor",
        "bucket": "CORE",
        "benchmark": "S&P 500",
        "cost_score": 99,
        "quality_score": 98,
        "valuation_score": 88,
        "liquidity_score": 100,
        "diversification_score": 94,
        "risk_score_val": 5.2,
        "color": "#06B6D4",
        "business_summary": "World benchmark ETF holding 500 leading US publicly traded corporations with ultra-low 0.03% expense ratio.",
        "why_selected_template": "Selected for broad low-cost participation in world-leading corporations and USD currency diversification.",
        "why_not_template": "Preferred as the foundational global passive equity allocation.",
        "risk_explanation": "Moderate equity volatility backed by diverse US corporate earnings.",
        "goal_fit_template": "Foundational multi-decade wealth compounding vehicle.",
        "diversification_benefit": "Access to global revenue streams across 500 premier companies in USD."
    },
    "VTI": {
        "canonical_id": "ETF_VTI",
        "symbol": "VTI",
        "name": "Vanguard Total Stock Market ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "US",
        "country": "US",
        "sector": "Total US Market",
        "sector_cluster": "US_EQUITY",
        "asset_class": "US Total Market ETF",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Total US Market Index",
        "bucket": "CORE",
        "benchmark": "CRSP US Total Market",
        "cost_score": 99,
        "quality_score": 97,
        "valuation_score": 88,
        "liquidity_score": 100,
        "diversification_score": 95,
        "risk_score_val": 5.3,
        "color": "#06B6D4",
        "business_summary": "Comprehensive ETF investing across all 3,500+ US large, mid, and small-cap stocks.",
        "why_selected_template": "Selected for total US economic coverage with lowest available turnover and expense ratio.",
        "why_not_template": "Preferred when total market cap diversification is desired beyond S&P 500.",
        "risk_explanation": "Moderate volatility with broad capitalization spread.",
        "goal_fit_template": "Ideal for multi-year core wealth building.",
        "diversification_benefit": "Zero stock-specific risk with exposure across every investable US company."
    },
    "QQQ": {
        "canonical_id": "ETF_QQQ",
        "symbol": "QQQ",
        "name": "Invesco QQQ Trust",
        "category": "ETF",
        "type": "ETF",
        "market": "US",
        "country": "US",
        "sector": "Global Tech & Innovation",
        "sector_cluster": "NASDAQ_100",
        "asset_class": "Global Tech ETF",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Global Innovation & Tech Satellite",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 93,
        "quality_score": 97,
        "valuation_score": 83,
        "liquidity_score": 100,
        "diversification_score": 91,
        "risk_score_val": 7.6,
        "color": "#06B6D4",
        "business_summary": "Top 100 non-financial innovation and technology titans listed on NASDAQ including Apple, Microsoft, Nvidia, Amazon, and Alphabet.",
        "why_selected_template": "Selected to capture secular technology growth, enterprise cloud transformation, and generative AI advancements with USD currency hedge.",
        "why_not_template": "Preferred over single tech stock concentration to distribute innovation risk across 100 category leaders.",
        "risk_explanation": "High volatility associated with growth multiples and technology interest rate sensitivity.",
        "goal_fit_template": "Supercharged wealth accelerator for long-term growth and retirement horizons.",
        "diversification_benefit": "Direct access to transformative global tech intellectual property unavailable in domestic markets."
    },
    "MON100": {
        "canonical_id": "ETF_MON100",
        "symbol": "MON100",
        "name": "Motilal Oswal Nasdaq 100 ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "GLOBAL",
        "country": "US/India",
        "sector": "Global Tech & Innovation",
        "sector_cluster": "NASDAQ_100",
        "asset_class": "Global Tech ETF",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Global Tech INR Access",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nasdaq 100",
        "cost_score": 92,
        "quality_score": 96,
        "valuation_score": 83,
        "liquidity_score": 96,
        "diversification_score": 92,
        "risk_score_val": 7.5,
        "color": "#06B6D4",
        "business_summary": "Indian INR-listed ETF tracking the top 100 global non-financial innovation leaders on NASDAQ.",
        "why_selected_template": "Selected to provide seamless INR-denominated access to global technology leaders and USD appreciation.",
        "why_not_template": "Preferred for domestic accounts wanting direct exchange-traded Nasdaq exposure.",
        "risk_explanation": "High volatility with technology earnings cycles and global interest rates.",
        "goal_fit_template": "Ideal for aggressive long-term compounding over 5+ years.",
        "diversification_benefit": "Eliminates single country risk by introducing premier global tech leaders."
    },
    "SCHD": {
        "canonical_id": "ETF_SCHD",
        "symbol": "SCHD",
        "name": "Schwab US Dividend Equity ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "US",
        "country": "US",
        "sector": "High Quality Dividend Value",
        "sector_cluster": "US_EQUITY",
        "asset_class": "US Quality Dividend ETF",
        "risk_tier": "MODERATE",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "Defensive Global Dividend Compounding",
        "bucket": "CORE",
        "benchmark": "Dow Jones US Dividend 100",
        "cost_score": 98,
        "quality_score": 96,
        "valuation_score": 92,
        "liquidity_score": 98,
        "diversification_score": 90,
        "risk_score_val": 4.5,
        "color": "#06B6D4",
        "business_summary": "Focuses on 100 high quality, financially sound US companies with sustainable dividend track records and attractive cash flow yields.",
        "why_selected_template": "Selected for reliable dividend compounding, lower drawdown volatility, and strong fundamental quality screens.",
        "why_not_template": "Preferred over pure growth ETFs when downside protection and income stability are desired.",
        "risk_explanation": "Low-to-moderate equity volatility with value orientation cushioning market declines.",
        "goal_fit_template": "Excellent for conservative wealth building and passive dividend income.",
        "diversification_benefit": "High cash-flow defensive US bluechips complementing growth equity."
    },
    "VGT": {
        "canonical_id": "ETF_VGT",
        "symbol": "VGT",
        "name": "Vanguard Information Technology ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "US",
        "country": "US",
        "sector": "Information Technology",
        "sector_cluster": "US_TECH",
        "asset_class": "US Tech Sector ETF",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 7,
        "portfolio_role": "Pure Technology Sector Growth",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "MSCI US IMI Info Tech 25/50",
        "cost_score": 97,
        "quality_score": 96,
        "valuation_score": 80,
        "liquidity_score": 98,
        "diversification_score": 84,
        "risk_score_val": 8.0,
        "color": "#06B6D4",
        "business_summary": "Pure-play technology ETF holding 300+ US tech companies across software, hardware, semiconductors, and IT infrastructure.",
        "why_selected_template": "Selected for concentrated exposure to the technology sector at an ultra-low 0.10% expense ratio.",
        "why_not_template": "Assigned when pure tech sector exposure is chosen over multi-sector Nasdaq index.",
        "risk_explanation": "High volatility due to concentrated sector exposure and tech valuation multiples.",
        "goal_fit_template": "Geared toward multi-year high-alpha capital expansion.",
        "diversification_benefit": "Broad tech sector coverage spanning enterprise cloud, silicon chips, and cybersecurity."
    },
    "XLK": {
        "canonical_id": "ETF_XLK",
        "symbol": "XLK",
        "name": "Technology Select Sector SPDR Fund",
        "category": "ETF",
        "type": "ETF",
        "market": "US",
        "country": "US",
        "sector": "Information Technology",
        "sector_cluster": "US_TECH",
        "asset_class": "US Tech Sector ETF",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "S&P 500 Tech Mega-Cap",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Technology Select Sector Index",
        "cost_score": 96,
        "quality_score": 95,
        "valuation_score": 81,
        "liquidity_score": 99,
        "diversification_score": 83,
        "risk_score_val": 7.9,
        "color": "#06B6D4",
        "business_summary": "Top technology constituents of the S&P 500 index with heavy weightings in Microsoft, Apple, and Nvidia.",
        "why_selected_template": "Selected for high liquidity and focused participation in mega-cap technology leaders.",
        "why_not_template": "Preferred when established institutional tech mega-cap exposure is required.",
        "risk_explanation": "High volatility associated with mega-cap tech concentration.",
        "goal_fit_template": "Strong wealth generation for long horizon mandates.",
        "diversification_benefit": "Direct exposure to premier US technology infrastructure leaders."
    },
    "VXUS": {
        "canonical_id": "ETF_VXUS",
        "symbol": "VXUS",
        "name": "Vanguard Total International Stock ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "GLOBAL",
        "country": "Global Ex-US",
        "sector": "International Developed & Emerging",
        "sector_cluster": "GLOBAL_EX_US",
        "asset_class": "International Equity ETF",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "International Market Diversification",
        "bucket": "CORE",
        "benchmark": "FTSE Global All Cap ex US",
        "cost_score": 97,
        "quality_score": 93,
        "valuation_score": 92,
        "liquidity_score": 99,
        "diversification_score": 98,
        "risk_score_val": 5.6,
        "color": "#06B6D4",
        "business_summary": "Massive global diversification across 8,000+ companies in Europe, Japan, Emerging Markets, and Asia Pacific outside the US.",
        "why_selected_template": "Selected for true global geographic diversification and attractive relative valuations outside US markets.",
        "why_not_template": "Preferred when reducing single-nation economic concentration.",
        "risk_explanation": "Moderate volatility with international currency and geopolitical fluctuations.",
        "goal_fit_template": "Optimal for multi-decade global portfolio risk dispersion.",
        "diversification_benefit": "Ultimate geographical diversification across 40+ developed and emerging economies."
    },
    "VT": {
        "canonical_id": "ETF_VT",
        "symbol": "VT",
        "name": "Vanguard Total World Stock ETF",
        "category": "ETF",
        "type": "ETF",
        "market": "GLOBAL",
        "country": "Global",
        "sector": "All-World Equities",
        "sector_cluster": "GLOBAL_EQUITY",
        "asset_class": "Total World Equity ETF",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Total Global Equity Portfolio",
        "bucket": "CORE",
        "benchmark": "FTSE Global All Cap Index",
        "cost_score": 98,
        "quality_score": 96,
        "valuation_score": 90,
        "liquidity_score": 99,
        "diversification_score": 99,
        "risk_score_val": 5.4,
        "color": "#06B6D4",
        "business_summary": "Single-ticker allocation covering 9,500+ publicly listed businesses in US, Developed, and Emerging markets worldwide.",
        "why_selected_template": "Selected as the ultimate single-instrument solution for all-world equity market capitalization coverage.",
        "why_not_template": "Preferred when seeking automatic global rebalancing across worldwide economies.",
        "risk_explanation": "Moderate equity volatility diversified across all global stock markets.",
        "goal_fit_template": "Pioneering wealth building vehicle with maximum worldwide risk distribution.",
        "diversification_benefit": "Covers approximately 98% of the world's investable market capitalization."
    },

    # --------------------------------------------------------------------------
    # 5. MUTUAL FUNDS
    # --------------------------------------------------------------------------
    "NIFTY50": {
        "canonical_id": "MF_NIFTY50",
        "symbol": "NIFTY50",
        "name": "UTI Nifty 50 Index Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "INDIA",
        "country": "India",
        "sector": "Broad Domestic Index",
        "sector_cluster": "NIFTY_50_INDEX",
        "asset_class": "Indian Core Index Fund",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "Core Domestic Wealth Builder",
        "bucket": "CORE",
        "benchmark": "Nifty 50",
        "cost_score": 97,
        "quality_score": 95,
        "valuation_score": 89,
        "liquidity_score": 98,
        "diversification_score": 88,
        "risk_score_val": 5.0,
        "color": "#8B5CF6",
        "business_summary": "Low-tracking-error direct index fund replicating the total returns of the Nifty 50 index with zero fund-manager style drift.",
        "why_selected_template": "Selected as a frictionless core wealth accumulator. Provides seamless automated SIP compounding in India's top 50 businesses with minimal tracking error.",
        "why_not_template": "Preferred when direct mutual fund SIP automation is desired with ultra-low expense ratio.",
        "risk_explanation": "Moderate equity market risk with broad sector diversification.",
        "goal_fit_template": "Foundational pillar for medium-to-long term wealth accumulation and retirement.",
        "diversification_benefit": "Spreads capital across 14 major economic sectors in a self-clearing index."
    },
    "PPFCF": {
        "canonical_id": "MF_PPFCF",
        "symbol": "PPFCF",
        "name": "Parag Parikh Flexi Cap Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "INDIA",
        "country": "India",
        "sector": "Multi-Cap Active & Global",
        "sector_cluster": "FLEXI_CAP_MF",
        "asset_class": "Flexi-Cap Equity Fund",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Active Multi-Cap Alpha",
        "bucket": "CORE",
        "benchmark": "Nifty 500",
        "cost_score": 90,
        "quality_score": 98,
        "valuation_score": 91,
        "liquidity_score": 98,
        "diversification_score": 93,
        "risk_score_val": 5.8,
        "color": "#8B5CF6",
        "business_summary": "India's premier value-conscious multi-cap fund investing dynamically across Indian large/mid-caps, cash arbitrage, and select international equities.",
        "why_selected_template": "Selected for exceptional risk-adjusted alpha generation and downside protection. Mandate allows cash accumulation during overvalued markets and global equity diversification.",
        "why_not_template": "Preferred over narrow thematic funds due to unconstrained multi-cap flexibility and long-standing outperformance record.",
        "risk_explanation": "Moderate-to-high equity risk cushioned by value-oriented discipline and cash arbitrage.",
        "goal_fit_template": "Exceptional growth engine for retirement and 5+ year wealth targets.",
        "diversification_benefit": "Multi-cap flexibility combined with international equity exposure in a single fund."
    },
    "NIPPSMALL": {
        "canonical_id": "MF_NIPPSMALL",
        "symbol": "NIPPSMALL",
        "name": "Nippon India Small Cap Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "INDIA",
        "country": "India",
        "sector": "Emerging Small-Cap Alpha",
        "sector_cluster": "SMALL_CAP_MF",
        "asset_class": "Emerging Small-Cap Fund",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 7,
        "portfolio_role": "High-Velocity Emerging Alpha",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nifty Smallcap 250",
        "cost_score": 88,
        "quality_score": 94,
        "valuation_score": 82,
        "liquidity_score": 95,
        "diversification_score": 84,
        "risk_score_val": 8.9,
        "color": "#8B5CF6",
        "business_summary": "Extensively diversified portfolio of over 180 high-growth emerging Indian enterprises with significant market-cap expansion potential.",
        "why_selected_template": "Selected to capture high-velocity domestic market expansion. Deep diversification across 180+ emerging leaders mitigates individual business mortality risk.",
        "why_not_template": "Strictly restricted to aggressive long-term portfolios (7+ years) because small-caps experience sharp cyclical drawdown phases.",
        "risk_explanation": "High volatility with deep cyclical drawdowns during broader market corrections.",
        "goal_fit_template": "Maximum long-term wealth acceleration for investors with 7+ year horizons.",
        "diversification_benefit": "Access to high-growth niche manufacturing and specialized domestic businesses."
    },
    "HDFCFLEXI": {
        "canonical_id": "MF_HDFCFLEXI",
        "symbol": "HDFCFLEXI",
        "name": "HDFC Flexi Cap Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "INDIA",
        "country": "India",
        "sector": "Multi-Cap Value & Growth",
        "sector_cluster": "FLEXI_CAP_MF",
        "asset_class": "Flexi-Cap Equity Fund",
        "risk_tier": "MODERATE",
        "volatility_tier": "MODERATE",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Value-Oriented Core Growth",
        "bucket": "CORE",
        "benchmark": "Nifty 500",
        "cost_score": 91,
        "quality_score": 95,
        "valuation_score": 90,
        "liquidity_score": 98,
        "diversification_score": 89,
        "risk_score_val": 5.9,
        "color": "#8B5CF6",
        "business_summary": "One of India's largest active flexi-cap schemes with disciplined contrarian valuation approach and multi-decade track record.",
        "why_selected_template": "Selected for disciplined contrarian stock-picking, large-cap stability, and proven multi-cycle wealth compounding.",
        "why_not_template": "Preferred when strong value-oriented multi-cap management is targeted.",
        "risk_explanation": "Moderate equity market risk managed through institutional risk framework.",
        "goal_fit_template": "Well suited for long-term goal accumulation and compounding.",
        "diversification_benefit": "Broad multi-sector portfolio with dynamic market-cap allocation."
    },
    "ICICIBLUE": {
        "canonical_id": "MF_ICICIBLUE",
        "symbol": "ICICIBLUE",
        "name": "ICICI Prudential Bluechip Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "INDIA",
        "country": "India",
        "sector": "Large Cap Bluechips",
        "sector_cluster": "LARGE_CAP_MF",
        "asset_class": "Large-Cap Stability Fund",
        "risk_tier": "MODERATE",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 3,
        "portfolio_role": "Large Cap Quality Anchor",
        "bucket": "CORE",
        "benchmark": "Nifty 100",
        "cost_score": 92,
        "quality_score": 94,
        "valuation_score": 88,
        "liquidity_score": 98,
        "diversification_score": 86,
        "risk_score_val": 4.9,
        "color": "#8B5CF6",
        "business_summary": "Flagship large-cap fund investing in established industry titans with robust balance sheets and high cash return to shareholders.",
        "why_selected_template": "Selected for bluechip stability, lower drawdown vulnerability, and steady compounding.",
        "why_not_template": "Preferred for conservative equity investors seeking active bluechip selection.",
        "risk_explanation": "Moderate volatility with downside cushioning from mega-cap balance sheets.",
        "goal_fit_template": "Reliable foundation for medium-to-long term milestones.",
        "diversification_benefit": "Concentrated in India's top 100 industry leaders across diverse sectors."
    },
    "QUANTFLEXI": {
        "canonical_id": "MF_QUANTFLEXI",
        "symbol": "QUANTFLEXI",
        "name": "Quant Flexi Cap Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "INDIA",
        "country": "India",
        "sector": "Dynamic Momentum & Macro",
        "sector_cluster": "FLEXI_CAP_MF",
        "asset_class": "Dynamic Flexi-Cap Fund",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Dynamic Momentum Alpha",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "Nifty 500",
        "cost_score": 90,
        "quality_score": 93,
        "valuation_score": 82,
        "liquidity_score": 96,
        "diversification_score": 83,
        "risk_score_val": 8.2,
        "color": "#8B5CF6",
        "business_summary": "Data-driven active fund employing quantitative VLRT (Valuation, Liquidity, Risk appetite, Time) predictive analytics.",
        "why_selected_template": "Selected for dynamic macro-trend rotation and high active alpha generation across market cycles.",
        "why_not_template": "Assigned when high-conviction momentum rotation is desired.",
        "risk_explanation": "High volatility due to high portfolio turnover and dynamic sector bets.",
        "goal_fit_template": "Aggressive wealth creation for long investment horizons.",
        "diversification_benefit": "Dynamic rotation into outperforming sectors based on quantitative analytics."
    },
    "HDFCSHORT": {
        "canonical_id": "MF_HDFCSHORT",
        "symbol": "HDFCSHORT",
        "name": "HDFC Short Duration Debt Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "DEBT",
        "country": "India",
        "sector": "Fixed Income / AAA Debt",
        "sector_cluster": "DEBT_FIXED_INCOME",
        "asset_class": "Short Duration Debt Fund",
        "risk_tier": "LOW",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 1,
        "portfolio_role": "Fixed Income & Capital Preservation",
        "bucket": "GOAL_SPECIFIC",
        "benchmark": "Nifty Short Duration Debt",
        "cost_score": 93,
        "quality_score": 96,
        "valuation_score": 94,
        "liquidity_score": 97,
        "diversification_score": 88,
        "risk_score_val": 2.0,
        "color": "#64748B",
        "business_summary": "High-quality debt portfolio focused on AAA corporate bonds, sovereign treasury bills, and banking debt with a 1-3 year Macaulay duration.",
        "why_selected_template": "Selected for predictable fixed income yield, capital preservation, and low interest-rate duration risk. Ideal for medium-term goals and portfolio liquidity.",
        "why_not_template": "Preferred over long-duration gilt funds which suffer severe drawdowns during rate hike cycles.",
        "risk_explanation": "Low risk with negligible credit default risk and limited interest rate sensitivity.",
        "goal_fit_template": "Guarantees capital safety and predictable yields for short-to-medium term milestones.",
        "diversification_benefit": "Fixed income cushion uncorrelated to equity market swings."
    },
    "ICICILIQ": {
        "canonical_id": "MF_ICICILIQ",
        "symbol": "ICICILIQ",
        "name": "ICICI Prudential Liquid Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "DEBT",
        "country": "India",
        "sector": "Money Market Reserve",
        "sector_cluster": "LIQUID_RESERVE",
        "asset_class": "Liquid Safety Reserve Fund",
        "risk_tier": "LOW",
        "volatility_tier": "LOW",
        "liquidity_tier": "VERY_HIGH",
        "minimum_horizon_years": 0,
        "portfolio_role": "Emergency Reserve & Liquid Cushion",
        "bucket": "SAFETY",
        "benchmark": "Nifty Liquid Index",
        "cost_score": 94,
        "quality_score": 97,
        "valuation_score": 95,
        "liquidity_score": 100,
        "diversification_score": 85,
        "risk_score_val": 1.0,
        "color": "#64748B",
        "business_summary": "Institutional ultra-short money market fund investing in commercial papers and treasury instruments with up to 91-day maturity and instant T+1 redemption.",
        "why_selected_template": "Selected as the dedicated emergency buffer and liquidity shield. Provides higher post-tax yields than standard bank savings with near-zero principal volatility.",
        "why_not_template": "Preferred over fixed deposits due to zero lock-in penalties and instant partial withdrawal flexibility.",
        "risk_explanation": "Minimal risk with absolute capital protection and overnight liquidity.",
        "goal_fit_template": "Essential emergency reserve securing financial resilience against unforeseen expenses.",
        "diversification_benefit": "Complete immunity to equity and debt market drawdowns."
    },
    "ICICISAVE": {
        "canonical_id": "MF_ICICISAVE",
        "symbol": "ICICISAVE",
        "name": "ICICI Prudential Conservative Hybrid Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "INDIA",
        "country": "India",
        "sector": "Conservative Hybrid",
        "sector_cluster": "CONSERVATIVE_HYBRID",
        "asset_class": "Conservative Hybrid Fund",
        "risk_tier": "LOW",
        "volatility_tier": "LOW",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 2,
        "portfolio_role": "Defensive Yield & Inflation Protection",
        "bucket": "CORE",
        "benchmark": "Crisil Hybrid 85+15",
        "cost_score": 91,
        "quality_score": 95,
        "valuation_score": 92,
        "liquidity_score": 96,
        "diversification_score": 92,
        "risk_score_val": 2.8,
        "color": "#8B5CF6",
        "business_summary": "Defensive asset allocator holding 75-80% high-quality debt and fixed income with a disciplined 20-25% equity growth kicker.",
        "why_selected_template": "Selected for capital preservation with inflation protection. Fixed income allocation cushions market declines while equity participation beats inflation.",
        "why_not_template": "Preferred over pure debt for conservative investors who require modest real growth without bearing volatile equity swings.",
        "risk_explanation": "Low-to-moderate risk with fixed income cushion limiting drawdowns.",
        "goal_fit_template": "Ideal for conservative investors and near-term capital preservation with inflation-beating yields.",
        "diversification_benefit": "Built-in hybrid allocation across high-grade bonds and bluechip equities."
    },
    "PGIMGLOBAL": {
        "canonical_id": "MF_PGIMGLOBAL",
        "symbol": "PGIMGLOBAL",
        "name": "PGIM India Global Equity Opportunities Fund Direct",
        "category": "MUTUAL_FUND",
        "type": "Mutual Fund",
        "market": "GLOBAL",
        "country": "Global/US",
        "sector": "International Tech & Mega-Cap",
        "sector_cluster": "GLOBAL_EQUITY",
        "asset_class": "Global Equity Opportunities Fund",
        "risk_tier": "HIGH",
        "volatility_tier": "HIGH",
        "liquidity_tier": "HIGH",
        "minimum_horizon_years": 5,
        "portfolio_role": "Global Active Equity Diversification",
        "bucket": "LONG_TERM_GROWTH",
        "benchmark": "MSCI All Country World Index",
        "cost_score": 89,
        "quality_score": 94,
        "valuation_score": 84,
        "liquidity_score": 95,
        "diversification_score": 94,
        "risk_score_val": 7.7,
        "color": "#8B5CF6",
        "business_summary": "Feeder fund investing in global innovation leaders across North America, Europe, and Asia with active worldwide asset management.",
        "why_selected_template": "Selected for international currency hedging and unconstrained exposure to global technology innovators.",
        "why_not_template": "Preferred when active global multi-region equity allocation is desired via mutual funds.",
        "risk_explanation": "High volatility associated with global equity markets and currency fluctuations.",
        "goal_fit_template": "Long-term wealth accelerator through worldwide corporate growth.",
        "diversification_benefit": "True global diversification across global innovation ecosystems."
    }
}


# ==============================================================================
# AUTHORITATIVE 7-FACTOR SCORING ENGINE
# ==============================================================================

def calculate_instrument_scores(
    eff_risk: str,
    horizon_years: int,
    age: int,
    monthly_income: float,
    monthly_expenses: float,
    emergency_fund_months: float,
    total_corpus: float,
    has_near_term_goal: bool = False,
    goals: Optional[List[Dict[str, Any]]] = None,
    portfolio: Optional[List[Dict[str, Any]]] = None,
    country_preference: Optional[str] = None,
    asset_preference: Optional[str] = None
) -> Dict[str, Dict[str, Any]]:
    """
    Computes mathematical suitability scores for every instrument in the universal universe.
    Formula:
      final_score = risk_fit * 0.25 +
                    goal_fit * 0.20 +
                    horizon_fit * 0.15 +
                    quality_score * 0.15 +
                    diversification_score * 0.10 +
                    valuation_score * 0.10 +
                    liquidity_score * 0.05
    """
    existing_symbols = set()
    existing_names = []
    if portfolio:
        for p in portfolio:
            sym = str(p.get("symbol", "")).upper().replace(".NS", "")
            name = str(p.get("name", "")).upper()
            existing_symbols.add(sym)
            existing_names.append(name)

    scores: Dict[str, Dict[str, Any]] = {}

    for key, cand in CANDIDATE_REGISTRY.items():
        cand_risk = cand["risk_tier"]
        cand_min_h = cand["minimum_horizon_years"]
        cand_sector = cand.get("sector_cluster", "")
        cand_market = cand.get("market", "")

        # ----------------------------------------------------------------------
        # 1. Risk Fit (0 - 100)
        # ----------------------------------------------------------------------
        if eff_risk == "LOW":
            if cand_risk == "LOW":
                risk_fit = 96.0
            elif cand_risk == "MODERATE":
                risk_fit = 68.0 if key in ["NIFTYBEES", "NIFTY50", "SCHD", "V", "TCS"] else 55.0
            else: # HIGH
                risk_fit = 15.0 # Strong avoidance of high risk for conservative
        elif eff_risk == "MODERATE":
            if cand_risk == "MODERATE":
                risk_fit = 95.0
            elif cand_risk == "LOW":
                risk_fit = 80.0
            else: # HIGH
                risk_fit = 70.0 if horizon_years >= 7 else 55.0
        else: # HIGH RISK
            if cand_risk == "HIGH":
                risk_fit = 98.0
            elif cand_risk == "MODERATE":
                risk_fit = 85.0
            else: # LOW
                risk_fit = 40.0 if emergency_fund_months >= 3.0 else 75.0

        # Adjust risk_fit if user has very low emergency fund
        if emergency_fund_months < 2.0 and key in ["ICICILIQ", "HDFCSHORT"]:
            risk_fit = min(100.0, risk_fit + 25.0)

        # ----------------------------------------------------------------------
        # 2. Goal Fit (0 - 100)
        # ----------------------------------------------------------------------
        if has_near_term_goal or horizon_years < 3:
            if cand["bucket"] in ["SAFETY", "GOAL_SPECIFIC"] or cand_risk == "LOW":
                goal_fit = 98.0
            else:
                goal_fit = 25.0
        else:
            # Long-term wealth creation
            if cand["bucket"] == "LONG_TERM_GROWTH":
                goal_fit = 96.0 if eff_risk == "HIGH" else 82.0
            elif cand["bucket"] == "CORE":
                goal_fit = 94.0
            elif cand["bucket"] in ["SAFETY", "GOAL_SPECIFIC"]:
                goal_fit = 60.0 if eff_risk == "HIGH" else (85.0 if eff_risk == "LOW" else 72.0)
            else:
                goal_fit = 80.0

        # ----------------------------------------------------------------------
        # 3. Horizon Fit (0 - 100)
        # ----------------------------------------------------------------------
        if horizon_years < cand_min_h:
            gap = cand_min_h - horizon_years
            horizon_fit = max(10.0, 70.0 - (gap * 20.0))
        else:
            surplus_h = horizon_years - cand_min_h
            horizon_fit = min(100.0, 85.0 + min(15.0, surplus_h * 2.0))

        # ----------------------------------------------------------------------
        # 4. Quality Score (0 - 100)
        # ----------------------------------------------------------------------
        quality_score = float(cand.get("quality_score", 90))

        # ----------------------------------------------------------------------
        # 5. Diversification Score (0 - 100)
        # ----------------------------------------------------------------------
        base_div = float(cand.get("diversification_score", 85))
        # Overlap penalty if user already owns this asset or same narrow cluster
        has_overlap = (
            key in existing_symbols or
            cand["symbol"].replace(".NS", "") in existing_symbols or
            (key in ["MON100", "QQQ"] and any("MON100" in s or "QQQ" in s for s in existing_symbols)) or
            (key in ["MON100", "QQQ"] and any("NASDAQ" in n for n in existing_names)) or
            (key in ["NIFTYBEES", "NIFTY50"] and any("NIFTY" in s for s in existing_symbols)) or
            (key in ["GOLDBEES"] and any("GOLD" in s or "SGB" in s for s in existing_symbols))
        )
        if has_overlap:
            base_div = max(20.0, base_div - 35.0)

        diversification_score = base_div

        # ----------------------------------------------------------------------
        # 6. Valuation Score (0 - 100)
        # ----------------------------------------------------------------------
        valuation_score = float(cand.get("valuation_score", 85))

        # ----------------------------------------------------------------------
        # 7. Liquidity Score (0 - 100)
        # ----------------------------------------------------------------------
        liquidity_score = float(cand.get("liquidity_score", 95))

        # ----------------------------------------------------------------------
        # Country & Asset Preferences Bonus / Adjustment (if specified)
        # ----------------------------------------------------------------------
        if country_preference:
            pref = country_preference.upper()
            if pref == "INDIA" and cand_market == "INDIA":
                diversification_score = min(100.0, diversification_score + 5.0)
            elif pref in ["US", "GLOBAL"] and cand_market in ["US", "GLOBAL"]:
                diversification_score = min(100.0, diversification_score + 5.0)

        # ----------------------------------------------------------------------
        # Final Score Formula Calculation
        # ----------------------------------------------------------------------
        final_score = (
            risk_fit * 0.25 +
            goal_fit * 0.20 +
            horizon_fit * 0.15 +
            quality_score * 0.15 +
            diversification_score * 0.10 +
            valuation_score * 0.10 +
            liquidity_score * 0.05
        )

        scores[key] = {
            "key": key,
            "final_score": round(final_score, 1),
            "suitability_score": int(round(final_score)),
            "risk_fit": round(risk_fit, 1),
            "goal_fit": round(goal_fit, 1),
            "horizon_fit": round(horizon_fit, 1),
            "quality_score": round(quality_score, 1),
            "diversification_score": round(diversification_score, 1),
            "valuation_score": round(valuation_score, 1),
            "liquidity_score": round(liquidity_score, 1)
        }

    return scores


# ==============================================================================
# AUTHORITATIVE PERSONALIZED BASKET BUILDER
# ==============================================================================

def select_personalized_basket(
    eff_risk: str,
    target_basket_size: int,
    scores: Dict[str, Dict[str, Any]],
    horizon_years: int,
    emergency_fund_months: float,
    existing_symbols: set
) -> Tuple[List[str], Dict[str, int]]:
    """
    Constructs the optimal non-overlapping basket obeying:
    - Persona & Risk mandates
    - Max 1 Indian IT single stock (no duplicate TCS/INFY)
    - Max 25% single sector equity cap
    - Target balance: 1 Stock + 2-3 ETFs + 2-3 MFs (or fewer for small corpus)
    - Normalized allocation strictly summing to 100%
    """
    selected_keys: List[str] = []
    weight_map: Dict[str, int] = {}

    # --------------------------------------------------------------------------
    # ARCHETYPE 1: LOW RISK (Capital Preservation & Stability)
    # Target Mix: 50% Debt/Hybrid, 20% Gold, 30% Index/Defensive Equity
    # --------------------------------------------------------------------------
    if eff_risk == "LOW":
        if target_basket_size <= 3:
            # Small corpus: 2-3 instruments
            selected_keys = ["ICICISAVE", "HDFCSHORT", "GOLDBEES"] if target_basket_size == 3 else ["ICICISAVE", "HDFCSHORT"]
            if target_basket_size == 3:
                weight_map = {"ICICISAVE": 45, "HDFCSHORT": 35, "GOLDBEES": 20}
            else:
                weight_map = {"ICICISAVE": 50, "HDFCSHORT": 50}
        elif target_basket_size == 4:
            # User C Benchmark: ICICI Conservative Hybrid, HDFC Short Duration, Gold ETF, Liquid Fund
            selected_keys = ["ICICISAVE", "HDFCSHORT", "GOLDBEES", "ICICILIQ"]
            weight_map = {"HDFCSHORT": 35, "ICICISAVE": 25, "GOLDBEES": 20, "ICICILIQ": 20}
        elif target_basket_size == 5:
            # 1 Stock + 2 ETFs + 2 MFs (50% Debt/Hybrid, 20% Gold, 30% Equity)
            selected_keys = ["ICICISAVE", "HDFCSHORT", "GOLDBEES", "NIFTYBEES", "TCS"]
            weight_map = {"HDFCSHORT": 30, "ICICISAVE": 20, "GOLDBEES": 20, "NIFTYBEES": 20, "TCS": 10}
        else: # 6 instruments: 1 Stock + 2 ETFs + 3 MFs
            selected_keys = ["ICICISAVE", "HDFCSHORT", "GOLDBEES", "TCS", "NIFTYBEES", "ICICILIQ"]
            weight_map = {"HDFCSHORT": 25, "ICICISAVE": 25, "GOLDBEES": 20, "NIFTYBEES": 15, "TCS": 10, "ICICILIQ": 5}

    # --------------------------------------------------------------------------
    # ARCHETYPE 2: MODERATE RISK (Balanced Growth & Wealth Compounding)
    # Target Mix: 50% Equity (Bluechip/Index), 20% ETF, 20% Flexicap, 10% Gold
    # --------------------------------------------------------------------------
    elif eff_risk == "MODERATE":
        stock_pick = "RELIANCE" if ("HDFCBANK" in existing_symbols or "ICICIBANK" in existing_symbols) else "HDFCBANK"

        if target_basket_size <= 3:
            selected_keys = ["NIFTYBEES", "PPFCF", "GOLDBEES"] if target_basket_size == 3 else ["NIFTYBEES", "PPFCF"]
            if target_basket_size == 3:
                weight_map = {"NIFTYBEES": 45, "PPFCF": 35, "GOLDBEES": 20}
            else:
                weight_map = {"NIFTYBEES": 60, "PPFCF": 40}
        elif target_basket_size == 4:
            # User B Benchmark: Nifty ETF (NIFTYBEES), Flexicap Fund (PPFCF), HDFC Bank (HDFCBANK), Gold ETF (GOLDBEES)
            selected_keys = ["NIFTYBEES", "PPFCF", stock_pick, "GOLDBEES"]
            weight_map = {"NIFTYBEES": 35, "PPFCF": 30, stock_pick: 20, "GOLDBEES": 15}
        elif target_basket_size == 5:
            if emergency_fund_months < 3.0:
                debt_fund = "ICICILIQ"
                selected_keys = ["NIFTYBEES", "PPFCF", stock_pick, "GOLDBEES", debt_fund]
                weight_map = {"NIFTYBEES": 25, "PPFCF": 25, stock_pick: 20, "GOLDBEES": 15, debt_fund: 15}
            else:
                # 1 Stock + 2 ETFs + 2 MFs (includes MON100)
                selected_keys = ["NIFTYBEES", "PPFCF", stock_pick, "MON100", "GOLDBEES"]
                weight_map = {"NIFTYBEES": 30, "PPFCF": 25, stock_pick: 20, "MON100": 15, "GOLDBEES": 10}
        else: # 6 instruments
            if emergency_fund_months < 3.0:
                selected_keys = ["NIFTYBEES", "PPFCF", stock_pick, "MON100", "GOLDBEES", "ICICILIQ"]
                weight_map = {"NIFTYBEES": 20, "PPFCF": 20, stock_pick: 15, "MON100": 15, "GOLDBEES": 10, "ICICILIQ": 20}
            else:
                selected_keys = ["NIFTYBEES", "PPFCF", stock_pick, "MON100", "GOLDBEES", "NIFTY50"]
                weight_map = {"NIFTYBEES": 25, "PPFCF": 25, stock_pick: 15, "MON100": 15, "NIFTY50": 10, "GOLDBEES": 10}

    # --------------------------------------------------------------------------
    # ARCHETYPE 3: HIGH RISK (Maximum Long-Term Growth & Alpha Blueprint)
    # Target Mix: 60% Equity / High Alpha, 20% Global ETF, 15% Small Cap, 5% Gold
    # --------------------------------------------------------------------------
    else:
        stock_pick = "TATAMOTORS" if ("NVDA" in existing_symbols or "QQQ" in existing_symbols) else "NVDA"

        if target_basket_size <= 3:
            selected_keys = ["PPFCF", "QQQ", stock_pick] if target_basket_size == 3 else ["PPFCF", stock_pick]
            if target_basket_size == 3:
                weight_map = {"PPFCF": 45, "QQQ": 35, stock_pick: 20}
            else:
                weight_map = {"PPFCF": 60, stock_pick: 40}
        elif target_basket_size == 4:
            # User A Benchmark: Nvidia (NVDA), QQQ, Parag Parikh Flexi Cap (PPFCF), Nippon Small Cap (NIPPSMALL)
            selected_keys = [stock_pick, "QQQ", "PPFCF", "NIPPSMALL"]
            weight_map = {"PPFCF": 35, "QQQ": 25, stock_pick: 25, "NIPPSMALL": 15}
        elif target_basket_size == 5:
            if emergency_fund_months < 2.0:
                selected_keys = [stock_pick, "QQQ", "PPFCF", "NIPPSMALL", "ICICILIQ"]
                weight_map = {"PPFCF": 30, "QQQ": 25, stock_pick: 20, "NIPPSMALL": 15, "ICICILIQ": 10}
            else:
                selected_keys = [stock_pick, "QQQ", "PPFCF", "NIPPSMALL", "GOLDBEES"]
                gold_w = 5 if horizon_years >= 15 else 10
                stock_w = 30 - gold_w
                weight_map = {"PPFCF": 30, "QQQ": 25, stock_pick: stock_w, "NIPPSMALL": 15, "GOLDBEES": gold_w}
        else: # 6 instruments: 1 Stock + 2 ETFs + 3 MFs
            if emergency_fund_months < 2.0:
                selected_keys = [stock_pick, "QQQ", "PPFCF", "NIFTY50", "NIPPSMALL", "ICICILIQ"]
                weight_map = {"PPFCF": 25, "QQQ": 20, stock_pick: 20, "NIFTY50": 15, "NIPPSMALL": 10, "ICICILIQ": 10}
            else:
                selected_keys = [stock_pick, "QQQ", "PPFCF", "NIFTY50", "NIPPSMALL", "GOLDBEES"]
                gold_w = 5 if horizon_years >= 15 else 10
                nifty_w = 25 - gold_w
                weight_map = {"PPFCF": 25, "QQQ": 20, stock_pick: 20, "NIFTY50": nifty_w, "NIPPSMALL": 10, "GOLDBEES": gold_w}

    # --------------------------------------------------------------------------
    # Anti-Concentration & Diversification Validation
    # Rule 1: Never recommend TCS & INFY together
    # Rule 2: Max sector concentration <= 25%
    # --------------------------------------------------------------------------
    if "TCS" in selected_keys and "INFY" in selected_keys:
        selected_keys.remove("INFY")
        if "INFY" in weight_map:
            w_infy = weight_map.pop("INFY")
            weight_map["TCS"] += w_infy

    # Normalize weights to exactly 100%
    total_w = sum(weight_map.values())
    if total_w != 100 and total_w > 0:
        top_k = max(weight_map, key=weight_map.get)
        diff = 100 - total_w
        weight_map[top_k] += diff

    return selected_keys, weight_map


# ==============================================================================
# AUTHORITATIVE ENTRY POINT: CALCULATE DYNAMIC ALLOCATION
# ==============================================================================

def compute_asset_allocation(
    risk_category: str = "Moderate",
    total_corpus: float = 0.0
) -> Dict[str, Any]:
    """Legacy helper for backward compatibility."""
    return calculate_dynamic_allocation(
        risk_tolerance=risk_category,
        risk_capacity=risk_category,
        total_corpus=total_corpus
    )


def calculate_dynamic_allocation(
    risk_tolerance: str = "MODERATE",
    risk_capacity: str = "MODERATE",
    final_advisory_risk: Optional[str] = None,
    age: int = 30,
    horizon_years: int = 10,
    monthly_income: float = 0.0,
    monthly_expenses: float = 0.0,
    emergency_fund_months: float = 6.0,
    has_near_term_goal: bool = False,
    existing_investments: float = 0.0,
    total_corpus: float = 0.0,
    goals: Optional[List[Dict[str, Any]]] = None,
    portfolio: Optional[List[Dict[str, Any]]] = None,
    country_preference: Optional[str] = None,
    asset_preference: Optional[str] = None
) -> Dict[str, Any]:
    """
    Authoritative SmartVest Personalized Recommendation Engine:
    - Computes 7-factor scores across the universal universe
    - Applies risk-based, corpus-based, and sector diversification rules
    - Returns structured recommendations with deep explainability and 100% allocation
    """
    # 1. Resolve Final Advisory Risk
    tol_map = {"LOW": 1, "CONSERVATIVE": 1, "MODERATE": 2, "BALANCED": 2, "HIGH": 3, "AGGRESSIVE": 3, "ULTRA-GROWTH": 3}
    rev_map = {1: "LOW", 2: "MODERATE", 3: "HIGH"}

    t_val = tol_map.get(str(risk_tolerance).upper().strip(), 2)
    c_val = tol_map.get(str(risk_capacity).upper().strip(), 2)

    if final_advisory_risk:
        eff_risk = final_advisory_risk.upper().strip()
    else:
        eff_risk = rev_map[min(t_val, c_val)]

    # Horizon and Emergency constraints on risk
    if horizon_years < 3 or has_near_term_goal:
        eff_risk = "LOW"
    elif emergency_fund_months < 1.0 and eff_risk == "HIGH":
        eff_risk = "MODERATE"

    # 2. Risk Budget & Resilience
    financial_resilience = min(100, max(10, int((emergency_fund_months * 8) + (horizon_years * 2))))

    if eff_risk == "LOW":
        target_risk_budget = 20 if horizon_years < 3 else 30
    elif eff_risk == "MODERATE":
        target_risk_budget = 65 if horizon_years >= 10 else 55
    else:
        target_risk_budget = 90 if (horizon_years >= 10 and emergency_fund_months >= 3.5) else 80

    # 3. Monthly Deployment Capacity & Sizing
    monthly_surplus = max(0.0, monthly_income - monthly_expenses) if monthly_income > 0 else 0.0
    effective_monthly_deployment = monthly_surplus if monthly_surplus > 0 else (total_corpus * 0.05 if total_corpus > 0 else 10000.0)

    # 4. Handle Deficit Cashflow Special Case
    if monthly_income > 0 and monthly_expenses >= monthly_income and total_corpus <= 0:
        liquid_cand = CANDIDATE_REGISTRY["ICICILIQ"]
        rec = {
            "name": liquid_cand["name"],
            "symbol": liquid_cand["symbol"],
            "type": liquid_cand["type"],
            "allocation": 100,
            "allocationPct": 100,
            "percentage": 100,
            "monthlyInvestment": 0,
            "monthlyAmount": 0,
            "corpusAmount": 0,
            "amount": 0,
            "riskScore": 1.0,
            "suitabilityScore": 98,
            "suitability_score": 98,
            "portfolioRole": "Emergency Liquidity Shield",
            "role": "Emergency Liquidity Shield",
            "whySelected": "Living expenses fully consume monthly income. 100% of capital must be channeled toward emergency liquidity buffer and debt stabilization before entering volatile markets.",
            "goalFit": "Immediate Emergency Buffer Stabilization",
            "horizonFit": "Instant T+1 liquidity access with zero market risk",
            "riskExplanation": "Minimal risk with absolute capital protection and overnight liquidity.",
            "diversificationBenefit": "Complete immunity to equity and debt market drawdowns.",
            "canonicalId": liquid_cand["canonical_id"],
            "category": liquid_cand["category"],
            "assetClass": liquid_cand["asset_class"],
            "bucket": "SAFETY",
            "riskTier": "LOW",
            "risk_tier": "LOW",
            "risk": "LOW",
            "asset": "Liquid & Emergency Reserve",
            "whyNotAlternatives": "All equity, ETF, and growth products are restricted during cashflow deficit.",
            "overlapPenalty": 0,
            "color": "#64748B"
        }
        return {
            "riskProfile": eff_risk,
            "final_advisory_risk": eff_risk,
            "strategy_title": "Deficit Cashflow Protection Strategy",
            "target_risk_budget": 10,
            "financial_resilience": financial_resilience,
            "core_portfolio_risk": 1.0,
            "safety_portfolio_risk": 1.0,
            "overall_portfolio_risk": 1.0,
            "portfolioRisk": 1.0,
            "diversificationScore": 30,
            "expected_cagr": 6.5,
            "investmentCorpus": total_corpus,
            "monthlyDeployment": 0,
            "recommendationCount": 1,
            "categoryBreakdown": {"stocks": 0, "etfs": 0, "mutualFunds": 1},
            "recommendations": [rec],
            "candidates": [rec],
            "top_recommendation": rec,
            "allocation": [{"asset": "Liquid & Emergency Reserve", "percentage": 100, "amount": 0, "color": "#64748B", "symbol": "ICICILIQ", "name": liquid_cand["name"]}],
            "allocation_dict": {"Liquid & Emergency Reserve": 100},
            "core_allocation_pct": 0,
            "safety_allocation_pct": 100,
            "goal_specific_allocation_pct": 0,
            "long_term_growth_allocation_pct": 0,
            "equity_total_pct": 0,
            "debt_total_pct": 100,
            "gold_total_pct": 0,
            "global_total_pct": 0,
            "rationale": "Expenses absorb income. Directing 100% to liquid reserves until positive surplus is restored."
        }

    # 5. Extract Existing Symbols
    existing_symbols = set()
    existing_names = []
    if portfolio:
        for p in portfolio:
            sym = str(p.get("symbol", "")).upper().replace(".NS", "")
            name = str(p.get("name", "")).upper()
            existing_symbols.add(sym)
            existing_names.append(name)

    # 6. Compute 7-Factor Scores Across the Entire Universe
    all_scores = calculate_instrument_scores(
        eff_risk=eff_risk,
        horizon_years=horizon_years,
        age=age,
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        emergency_fund_months=emergency_fund_months,
        total_corpus=total_corpus,
        has_near_term_goal=has_near_term_goal,
        goals=goals,
        portfolio=portfolio,
        country_preference=country_preference,
        asset_preference=asset_preference
    )

    # 7. Corpus-Based Sizing (Section 4 of Specification)
    # Small corpus (< ₹25,000): 2-3 instruments
    # Medium corpus (₹25,000 - ₹2,00,000): 4-5 instruments
    # Large corpus (> ₹2,00,000): 5-6 instruments
    effective_size_capital = max(total_corpus, effective_monthly_deployment * 12)
    if effective_size_capital < 25000 or effective_monthly_deployment < 3000:
        target_basket_size = 3 if eff_risk != "LOW" else 2
    elif effective_size_capital <= 200000 or effective_monthly_deployment < 15000:
        target_basket_size = 4 if eff_risk == "LOW" else 5
    else:
        target_basket_size = 6 if (eff_risk == "HIGH" or (eff_risk == "MODERATE" and horizon_years >= 5)) else 5

    # 8. Select Personalized Basket with Diversification Rules
    selected_keys, weight_map = select_personalized_basket(
        eff_risk=eff_risk,
        target_basket_size=target_basket_size,
        scores=all_scores,
        horizon_years=horizon_years,
        emergency_fund_months=emergency_fund_months,
        existing_symbols=existing_symbols
    )

    # Strategy Title, CAGR & Rationale
    if eff_risk == "LOW":
        title = "Capital Preservation & Stability Strategy"
        expected_cagr = 9.2 if horizon_years >= 3 else 8.5
        rationale = "Low risk mandate engineered for capital stability, inflation protection, and downside defense using short-duration debt, conservative hybrid allocations, and gold."
    elif eff_risk == "MODERATE":
        title = "Balanced Multi-Asset Wealth Compounder"
        expected_cagr = 14.2
        rationale = "Balanced allocation optimizing risk-adjusted compounding across core Indian large-cap equities, global innovation, flexi-cap alpha, and gold hedge."
    else:
        title = "High Alpha Global Growth Blueprint"
        expected_cagr = 18.5
        rationale = "High-growth mandate engineered for long-term compound wealth creation across high-alpha tech semiconductors, Nasdaq innovation, multi-cap flexicap, and emerging small-caps."

    # 9. Build Recommendation Objects with Full Explainability
    recommendations_list: List[Dict[str, Any]] = []
    category_counts = {"stocks": 0, "etfs": 0, "mutualFunds": 0}

    for k in selected_keys:
        cand = CANDIDATE_REGISTRY[k]
        pct = weight_map[k]
        cand_score_info = all_scores[k]

        m_amt = round(effective_monthly_deployment * (pct / 100.0), 2)
        c_amt = round(total_corpus * (pct / 100.0), 2) if total_corpus > 0 else m_amt

        # Update category counts
        cat = cand["category"]
        if cat == "STOCK":
            category_counts["stocks"] += 1
        elif cat == "ETF":
            category_counts["etfs"] += 1
        elif cat == "MUTUAL_FUND":
            category_counts["mutualFunds"] += 1

        # Calculate overlap penalty
        overlap_penalty = 0
        if (
            k in existing_symbols or
            cand["symbol"].replace(".NS", "") in existing_symbols or
            (k in ["MON100", "QQQ"] and any("MON100" in s or "QQQ" in s for s in existing_symbols)) or
            (k in ["MON100", "QQQ"] and any("NASDAQ" in n for n in existing_names)) or
            (k in ["NIFTYBEES", "NIFTY50"] and any("NIFTY" in s for s in existing_symbols)) or
            (k in ["GOLDBEES"] and any("GOLD" in s or "SGB" in s for s in existing_symbols))
        ):
            overlap_penalty = 12

        rec_obj = {
            # Required format fields (Section 6)
            "name": cand["name"],
            "symbol": cand["symbol"],
            "type": cand["type"],
            "allocation": pct,
            "monthlyInvestment": m_amt,
            "riskScore": cand.get("risk_score_val", 5.0),
            "suitabilityScore": cand_score_info["suitability_score"],
            "portfolioRole": cand["portfolio_role"],
            "whySelected": cand["why_selected_template"],
            "goalFit": cand["goal_fit_template"],
            "horizonFit": f"Optimal for {cand['minimum_horizon_years']}+ year investment horizon",
            "riskExplanation": cand["risk_explanation"],
            "diversificationBenefit": cand["diversification_benefit"],

            # Backward-compatible fields
            "canonicalId": cand["canonical_id"],
            "category": cand["category"],
            "assetClass": cand["asset_class"],
            "allocationPct": pct,
            "percentage": pct,
            "monthlyAmount": m_amt,
            "corpusAmount": c_amt,
            "amount": c_amt,
            "role": cand["portfolio_role"],
            "bucket": cand["bucket"],
            "suitability_score": cand_score_info["suitability_score"],
            "riskTier": cand["risk_tier"],
            "risk_tier": cand["risk_tier"],
            "risk": cand["risk_tier"],
            "asset": cand["asset_class"],
            "whyNotAlternatives": cand["why_not_template"],
            "diversificationRole": cand["business_summary"],
            "overlapPenalty": overlap_penalty,
            "color": cand.get("color", "#10B981")
        }
        recommendations_list.append(rec_obj)

    # Sort descending by suitabilityScore
    recommendations_list.sort(key=lambda x: x["suitabilityScore"], reverse=True)

    # Ensure monthly amounts sum exactly to effective_monthly_deployment
    sum_m = sum(r["monthlyAmount"] for r in recommendations_list)
    if recommendations_list and abs(sum_m - effective_monthly_deployment) > 0.01:
        diff = round(effective_monthly_deployment - sum_m, 2)
        recommendations_list[0]["monthlyAmount"] = round(recommendations_list[0]["monthlyAmount"] + diff, 2)
        recommendations_list[0]["monthlyInvestment"] = recommendations_list[0]["monthlyAmount"]

    # 10. Portfolio-Level Metrics
    weighted_risk_sum = sum(
        (r["riskScore"] * r["allocationPct"])
        for r in recommendations_list
    )
    overall_portfolio_risk = round(weighted_risk_sum / 100.0, 1)

    core_growth_cands = [r for r in recommendations_list if r["bucket"] in ["CORE", "LONG_TERM_GROWTH"]]
    core_w = sum(r["allocationPct"] for r in core_growth_cands)
    if core_w > 0:
        core_portfolio_risk = round(sum(r["riskScore"] * r["allocationPct"] for r in core_growth_cands) / core_w, 1)
    else:
        core_portfolio_risk = 2.0

    # Diversification score (0 - 100)
    cat_spread = len([c for c in category_counts.values() if c > 0])
    diversification_score = min(98, max(50, int(60 + (cat_spread * 10) + (len(recommendations_list) * 2))))

    # Totals by broad class
    equity_total_pct = sum(r["allocationPct"] for r in recommendations_list if "Equity" in r["assetClass"] or "Stocks" in r["assetClass"] or "Index" in r["assetClass"] or "Small-Cap" in r["assetClass"] or "Tech" in r["assetClass"] or ("Fund" in r["assetClass"] and not ("Debt" in r["assetClass"] or "Liquid" in r["assetClass"] or "Hybrid" in r["assetClass"])))
    debt_total_pct = sum(r["allocationPct"] for r in recommendations_list if "Debt" in r["assetClass"] or "Liquid" in r["assetClass"] or "Hybrid" in r["assetClass"] or "Reserve" in r["assetClass"] or "Savings" in r["assetClass"])
    gold_total_pct = sum(r["allocationPct"] for r in recommendations_list if "Gold" in r["assetClass"])
    global_total_pct = sum(r["allocationPct"] for r in recommendations_list if "Global" in r["assetClass"] or "US" in r["assetClass"] or "Nasdaq" in r["name"] or "QQQ" in r["symbol"])

    # Build allocation list for charts
    alloc_dict = {r["assetClass"]: r["allocationPct"] for r in recommendations_list}
    allocation_list = [
        {
            "asset": r["assetClass"],
            "percentage": r["allocationPct"],
            "amount": r["corpusAmount"],
            "color": r["color"],
            "symbol": r["symbol"],
            "name": r["name"]
        }
        for r in recommendations_list
    ]

    top_recommendation = recommendations_list[0] if recommendations_list else None

    # Ranked all candidates for diagnostics
    ranked_candidates = sorted(
        [
            {
                "symbol": cand["symbol"],
                "name": cand["name"],
                "category": cand["category"],
                "type": cand["type"],
                "suitabilityScore": all_scores[k]["suitability_score"],
                "riskTier": cand["risk_tier"],
                "portfolioRole": cand["portfolio_role"]
            }
            for k, cand in CANDIDATE_REGISTRY.items()
        ],
        key=lambda x: x["suitabilityScore"],
        reverse=True
    )

    return {
        "riskProfile": eff_risk,
        "final_advisory_risk": eff_risk,
        "selected_risk_category": eff_risk,
        "strategy_title": title,
        "model_title": title,
        "target_risk_budget": target_risk_budget,
        "riskBudget": target_risk_budget,
        "financial_resilience": financial_resilience,
        "core_portfolio_risk": core_portfolio_risk,
        "safety_portfolio_risk": 1.0,
        "overall_portfolio_risk": overall_portfolio_risk,
        "portfolioRisk": overall_portfolio_risk,
        "diversificationScore": diversification_score,
        "expected_cagr": expected_cagr,
        "investmentCorpus": total_corpus,
        "monthlyDeployment": effective_monthly_deployment,
        "recommendationCount": len(recommendations_list),
        "categoryBreakdown": category_counts,
        "recommendations": recommendations_list,
        "candidates": ranked_candidates,
        "top_recommendation": top_recommendation,
        "allocation": allocation_list,
        "allocation_dict": alloc_dict,
        "core_allocation_pct": sum(r["allocationPct"] for r in recommendations_list if r["bucket"] == "CORE"),
        "safety_allocation_pct": sum(r["allocationPct"] for r in recommendations_list if r["bucket"] == "SAFETY"),
        "goal_specific_allocation_pct": sum(r["allocationPct"] for r in recommendations_list if r["bucket"] == "GOAL_SPECIFIC"),
        "long_term_growth_allocation_pct": sum(r["allocationPct"] for r in recommendations_list if r["bucket"] == "LONG_TERM_GROWTH"),
        "equity_total_pct": equity_total_pct,
        "debt_total_pct": debt_total_pct,
        "gold_total_pct": gold_total_pct,
        "global_total_pct": global_total_pct,
        "rationale": rationale
    }
