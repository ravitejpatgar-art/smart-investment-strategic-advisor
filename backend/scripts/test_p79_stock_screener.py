#!/usr/bin/env python3
"""
SMARTVEST — P7.9 STOCK SCREENER VERIFICATION SCRIPT
Verifies backend screener API, multi-factor filtering, strict null safety,
sorting, pagination, preset translation, and deterministic beyond-30 candidate discovery.
"""

import sys
import os
from pathlib import Path
from unittest.mock import patch

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal, Base, engine
from app.models.instrument import Instrument
from app.schemas.market_screener import ScreenerFilterParams, ScreenerResultItem
from app.services.market_data.cache import market_cache
from app.services.market_data.screener_service import StockScreenerService, EVALUATED_METRICS
from app.services.market_data.universe_provider import GlobalUniverseManager


def mock_get_enhanced_fundamentals(symbol, asset_type="STOCK"):
    """Mock provider fallback to avoid external API rate limits during testing."""
    return {
        "symbol": symbol,
        "quote": {"price": 100.0, "change": 0.5, "changePct": 0.5, "freshness": "LIVE", "source": "MockFeed"},
        "valuation": {"peRatio": 22.0, "marketCap": 10_000_000_000.0},
        "financials": {"roe": 16.0, "debtEquity": 0.4},
        "balanceSheet": {"debtEquity": 0.4},
        "profitability": {"roe": 16.0},
        "dividends": {"dividendYield": 1.5},
        "technicals": {"rsi": 50.0}
    }


def seed_test_cache():
    """Pre-populates market_cache for representative universe items for fast deterministic execution."""
    known_stocks = [
        {"symbol": "AAPL", "name": "Apple Inc.", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Technology", "industry": "Consumer Electronics", "price": 180.0, "change": 1.5, "change_pct": 0.84, "market_cap": 2_800_000_000_000.0, "pe_ratio": 28.5, "roe": 45.0, "debt_equity": 0.35, "dividend_yield": 0.6, "rsi": 55.0},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Technology", "industry": "Software", "price": 400.0, "change": 2.0, "change_pct": 0.5, "market_cap": 3_000_000_000_000.0, "pe_ratio": 32.0, "roe": 38.0, "debt_equity": 0.40, "dividend_yield": 0.8, "rsi": 60.0},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Communication Services", "industry": "Internet", "price": 160.0, "change": -0.5, "change_pct": -0.31, "market_cap": 2_000_000_000_000.0, "pe_ratio": 24.0, "roe": 28.0, "debt_equity": 0.10, "dividend_yield": 0.0, "rsi": 48.0},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Technology", "industry": "Semiconductors", "price": 120.0, "change": 3.0, "change_pct": 2.56, "market_cap": 2_900_000_000_000.0, "pe_ratio": 45.0, "roe": 55.0, "debt_equity": 0.20, "dividend_yield": 0.05, "rsi": 68.0},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Consumer Cyclical", "industry": "Internet Retail", "price": 185.0, "change": 1.0, "change_pct": 0.54, "market_cap": 1_900_000_000_000.0, "pe_ratio": 42.0, "roe": 20.0, "debt_equity": 0.60, "dividend_yield": 0.0, "rsi": 52.0},
        {"symbol": "META", "name": "Meta Platforms Inc.", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Communication Services", "industry": "Internet", "price": 500.0, "change": 4.0, "change_pct": 0.81, "market_cap": 1_300_000_000_000.0, "pe_ratio": 26.0, "roe": 30.0, "debt_equity": 0.15, "dividend_yield": 0.4, "rsi": 58.0},
        {"symbol": "TSLA", "name": "Tesla Inc.", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Consumer Cyclical", "industry": "Auto Manufacturers", "price": 220.0, "change": -2.0, "change_pct": -0.9, "market_cap": 700_000_000_000.0, "pe_ratio": 65.0, "roe": 18.0, "debt_equity": 0.08, "dividend_yield": 0.0, "rsi": 42.0},
        {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "country": "US", "exchange": "NYSE", "currency": "USD", "sector": "Financial Services", "industry": "Banks", "price": 200.0, "change": 1.2, "change_pct": 0.6, "market_cap": 580_000_000_000.0, "pe_ratio": 12.0, "roe": 16.0, "debt_equity": 1.2, "dividend_yield": 2.4, "rsi": 54.0},
        {"symbol": "AMD", "name": "Advanced Micro Devices", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Technology", "industry": "Semiconductors", "price": 150.0, "change": -1.0, "change_pct": -0.66, "market_cap": 240_000_000_000.0, "pe_ratio": 50.0, "roe": 8.0, "debt_equity": 0.05, "dividend_yield": 0.0, "rsi": 46.0},
        {"symbol": "PLTR", "name": "Palantir Technologies", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Technology", "industry": "Software", "price": 30.0, "change": 0.5, "change_pct": 1.69, "market_cap": 65_000_000_000.0, "pe_ratio": 75.0, "roe": 14.0, "debt_equity": 0.02, "dividend_yield": 0.0, "rsi": 62.0},
        {"symbol": "AVGO", "name": "Broadcom Inc.", "country": "US", "exchange": "NASDAQ", "currency": "USD", "sector": "Technology", "industry": "Semiconductors", "price": 1400.0, "change": 12.0, "change_pct": 0.86, "market_cap": 650_000_000_000.0, "pe_ratio": 35.0, "roe": 22.0, "debt_equity": 1.1, "dividend_yield": 1.5, "rsi": 56.0},
        {"symbol": "BRK-B", "name": "Berkshire Hathaway Inc.", "country": "US", "exchange": "NYSE", "currency": "USD", "sector": "Financial Services", "industry": "Financial Conglomerates", "price": 420.0, "change": 1.0, "change_pct": 0.24, "market_cap": 900_000_000_000.0, "pe_ratio": 18.0, "roe": 12.0, "debt_equity": 0.25, "dividend_yield": 0.0, "rsi": 50.0},
        {"symbol": "RELIANCE", "name": "Reliance Industries Limited", "country": "IN", "exchange": "NSE", "currency": "INR", "sector": "Energy", "industry": "Oil & Gas", "price": 2900.0, "change": 15.0, "change_pct": 0.52, "market_cap": 19_000_000_000_000.0, "pe_ratio": 26.0, "roe": 10.0, "debt_equity": 0.45, "dividend_yield": 0.35, "rsi": 50.0},
        {"symbol": "TCS", "name": "Tata Consultancy Services", "country": "IN", "exchange": "NSE", "currency": "INR", "sector": "Technology", "industry": "IT Services", "price": 3800.0, "change": 25.0, "change_pct": 0.66, "market_cap": 14_000_000_000_000.0, "pe_ratio": 30.0, "roe": 48.0, "debt_equity": 0.01, "dividend_yield": 1.2, "rsi": 56.0},
        {"symbol": "INFY", "name": "Infosys Limited", "country": "IN", "exchange": "NSE", "currency": "INR", "sector": "Technology", "industry": "IT Services", "price": 1600.0, "change": 10.0, "change_pct": 0.63, "market_cap": 6_600_000_000_000.0, "pe_ratio": 25.0, "roe": 32.0, "debt_equity": 0.05, "dividend_yield": 2.1, "rsi": 52.0},
        {"symbol": "HDFCBANK", "name": "HDFC Bank Limited", "country": "IN", "exchange": "NSE", "currency": "INR", "sector": "Financial Services", "industry": "Banks", "price": 1500.0, "change": 5.0, "change_pct": 0.33, "market_cap": 11_400_000_000_000.0, "pe_ratio": 18.0, "roe": 17.0, "debt_equity": 1.4, "dividend_yield": 1.1, "rsi": 49.0},
    ]
    for s in known_stocks:
        item = ScreenerResultItem(
            symbol=s["symbol"],
            canonical_id=f"STOCK:{s['symbol']}",
            ticker=s["symbol"],
            name=s["name"],
            asset_type="STOCK",
            country=s["country"],
            exchange=s["exchange"],
            currency=s["currency"],
            sector=s["sector"],
            industry=s["industry"],
            price=s["price"],
            change=s["change"],
            change_pct=s["change_pct"],
            market_cap=s["market_cap"],
            pe_ratio=s["pe_ratio"],
            roe=s["roe"],
            debt_equity=s["debt_equity"],
            dividend_yield=s["dividend_yield"],
            rsi=s["rsi"],
            research_coverage=100.0,
            data_completeness="COMPLETE"
        )
        market_cache.set(f"screener:item:{s['symbol']}", item.model_dump(), ttl_seconds=3600)


@patch("app.services.market_data.screener_service.get_enhanced_fundamentals", side_effect=mock_get_enhanced_fundamentals)
def run_tests(mock_fundamentals):
    print("=" * 60)
    print("SMARTVEST — P7.9 STOCK SCREENER BACKEND VERIFICATION")
    print("=" * 60)

    # Ensure tables and seed instruments exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    passed = 0
    failed = 0

    def assert_test(cond, title):
        nonlocal passed, failed
        if cond:
            print(f"  [PASS] {title}")
            passed += 1
        else:
            print(f"  [FAIL] {title}")
            failed += 1

    try:
        if db.query(Instrument).count() == 0:
            GlobalUniverseManager.seed_initial_universe(db)

        # Pre-seed cache with test items for sub-second deterministic test runs
        seed_test_cache()

        # ── TEST GROUP 1: Default Screener & Bounded Pagination ──
        print("\n--- TEST GROUP 1: Default Stock Screener & Pagination ---")
        res1 = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", page=1, limit=10),
            db=db
        )
        assert_test(res1.total > 0, f"Default screen returns stocks (total={res1.total})")
        assert_test(len(res1.items) <= 10, f"Page limit respected (returned {len(res1.items)} items)")
        assert_test(res1.page == 1, "Page index is 1")
        assert_test(res1.total_pages >= 1, f"Total pages calculated ({res1.total_pages})")
        if res1.items:
            first = res1.items[0]
            assert_test(first.symbol is not None and len(first.symbol) > 0, f"Item has valid symbol: {first.symbol}")
            assert_test(first.asset_type in ["STOCK", "EQUITY"], f"Asset type is stock/equity: {first.asset_type}")
            assert_test(first.research_coverage >= 0.0 and first.research_coverage <= 100.0, f"Coverage score valid: {first.research_coverage}%")

        # ── TEST GROUP 2: Country, Exchange, and Metadata Filters ──
        print("\n--- TEST GROUP 2: Country & Exchange Filtering ---")
        # India Filter
        res_in = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="IN", limit=50),
            db=db
        )
        all_in = all(it.country == "IN" for it in res_in.items)
        assert_test(all_in and len(res_in.items) > 0, f"Country=IN filter matches only Indian stocks ({len(res_in.items)} found)")

        # US Filter
        res_us = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", limit=50),
            db=db
        )
        all_us = all(it.country == "US" for it in res_us.items)
        assert_test(all_us and len(res_us.items) > 0, f"Country=US filter matches only US stocks ({len(res_us.items)} found)")

        # Exchange Filter (NASDAQ)
        res_nasdaq = StockScreenerService.execute_screen(
            ScreenerFilterParams(exchange="NASDAQ", limit=50),
            db=db
        )
        all_nasdaq = all(it.exchange == "NASDAQ" for it in res_nasdaq.items)
        assert_test(all_nasdaq and len(res_nasdaq.items) > 0, f"Exchange=NASDAQ filter strictly matches NASDAQ stocks ({len(res_nasdaq.items)} found)")

        # ── TEST GROUP 3: Keyword Search (q) ──
        print("\n--- TEST GROUP 3: Keyword & Symbol Search ---")
        res_q = StockScreenerService.execute_screen(
            ScreenerFilterParams(q="AAPL", limit=10),
            db=db
        )
        has_aapl = any(it.symbol == "AAPL" or "Apple" in it.name for it in res_q.items)
        assert_test(has_aapl, "Search query 'AAPL' finds Apple Inc.")

        res_q_rel = StockScreenerService.execute_screen(
            ScreenerFilterParams(q="RELIANCE", limit=10),
            db=db
        )
        has_rel = any("RELIANCE" in it.symbol for it in res_q_rel.items)
        assert_test(has_rel, "Search query 'RELIANCE' finds Reliance Industries")

        # ── TEST GROUP 4: Strict Numerical Filtering & Null Safety ──
        print("\n--- TEST GROUP 4: Strict Numerical Filtering & Null Safety ---")
        # P/E Filter
        res_pe = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", pe_min=10.0, pe_max=40.0, limit=50),
            db=db
        )
        all_pe_valid = all(it.pe_ratio is not None and 10.0 <= it.pe_ratio <= 40.0 for it in res_pe.items)
        assert_test(all_pe_valid and len(res_pe.items) > 0, f"P/E range [10, 40] strictly enforced ({len(res_pe.items)} matched)")
        no_null_pe = all(it.pe_ratio is not None for it in res_pe.items)
        assert_test(no_null_pe, "No null P/E stocks accidentally passed range filter")

        # ROE Filter (ROE >= 15%)
        res_roe = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", roe_min=15.0, limit=50),
            db=db
        )
        all_roe_valid = all(it.roe is not None and it.roe >= 15.0 for it in res_roe.items)
        assert_test(all_roe_valid and len(res_roe.items) > 0, f"ROE >= 15% strictly enforced ({len(res_roe.items)} matched)")

        # Debt to Equity Filter (Debt/Equity <= 1.0)
        res_debt = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", debt_equity_max=1.0, limit=50),
            db=db
        )
        all_debt_valid = all(it.debt_equity is not None and it.debt_equity <= 1.0 for it in res_debt.items)
        assert_test(all_debt_valid and len(res_debt.items) > 0, f"Debt/Equity <= 1.0 strictly enforced ({len(res_debt.items)} matched)")

        # ── TEST GROUP 5: Presets Screen Translation ──
        print("\n--- TEST GROUP 5: Preset Screens Translation ---")
        # Preset: high_roe
        res_pre_roe = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", preset="high_roe", limit=50),
            db=db
        )
        assert_test(res_pre_roe.applied_preset == "high_roe", "Preset name recorded in response")
        assert_test(all(it.roe is not None and it.roe >= 15.0 for it in res_pre_roe.items) and len(res_pre_roe.items) > 0, "Preset 'high_roe' enforces ROE >= 15%")

        # Preset: low_debt
        res_pre_debt = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", preset="low_debt", limit=50),
            db=db
        )
        assert_test(all(it.debt_equity is not None and it.debt_equity <= 0.5 for it in res_pre_debt.items) and len(res_pre_debt.items) > 0, "Preset 'low_debt' enforces D/E <= 0.5")

        # ── TEST GROUP 6: Multi-Factor AND Combination Screen ──
        print("\n--- TEST GROUP 6: Multi-Factor AND Combination ---")
        # Combination: Country=US AND ROE >= 10 AND Debt/Equity <= 2.0
        res_combo = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", roe_min=10.0, debt_equity_max=2.0, limit=50),
            db=db
        )
        all_combo_valid = all(
            it.country == "US" and it.roe is not None and it.roe >= 10.0 and it.debt_equity is not None and it.debt_equity <= 2.0
            for it in res_combo.items
        )
        assert_test(all_combo_valid and len(res_combo.items) > 0, f"Multi-factor AND filter validated ({len(res_combo.items)} items)")

        # ── TEST GROUP 7: Sorting & Null Positioning ──
        print("\n--- TEST GROUP 7: Sorting Behavior ---")
        # Sort by Market Cap Descending
        res_sort_mc_desc = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", sort="marketCap", order="desc", limit=10),
            db=db
        )
        mc_vals = [it.market_cap for it in res_sort_mc_desc.items if it.market_cap is not None]
        is_sorted_desc = all(mc_vals[i] >= mc_vals[i+1] for i in range(len(mc_vals)-1))
        assert_test(is_sorted_desc and len(mc_vals) > 0, "Market Cap descending sort is mathematically monotonic")

        # Sort by P/E Ascending
        res_sort_pe_asc = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", sort="peRatio", order="asc", limit=10),
            db=db
        )
        pe_vals = [it.pe_ratio for it in res_sort_pe_asc.items if it.pe_ratio is not None]
        is_sorted_asc = all(pe_vals[i] <= pe_vals[i+1] for i in range(len(pe_vals)-1))
        assert_test(is_sorted_asc and len(pe_vals) > 0, "P/E ascending sort is mathematically monotonic")

        # ── TEST GROUP 8: Bounded Page Limits & Safety ──
        print("\n--- TEST GROUP 8: Bounded Page Limits & Safety ---")
        res_bound = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", page=1, limit=500),  # Attempting 500
            db=db
        )
        assert_test(res_bound.limit <= 100, f"Limit is clamped to max 100 (actual={res_bound.limit})")

        res_bound_page = StockScreenerService.execute_screen(
            ScreenerFilterParams(country="US", page=-5, limit=-20),
            db=db
        )
        assert_test(res_bound_page.page == 1 and res_bound_page.limit >= 1, f"Negative page/limit safely normalized (page={res_bound_page.page}, limit={res_bound_page.limit})")

        # ── TEST GROUP 9: Deterministic Beyond-30 Candidate Discovery & Completeness ──
        print("\n--- TEST GROUP 9: Deterministic Beyond-30 Candidate Discovery ---")
        TEST_SECTOR = "P79_DETERMINISTIC_TEST"
        # 1. Clean up any prior test instruments
        db.query(Instrument).filter(Instrument.sector == TEST_SECTOR).delete()
        db.commit()

        # 2. Seed 40 deterministic instruments into the database
        test_instruments = []
        for i in range(1, 41):
            sym = f"P79_TEST_{i:02d}"
            inst = Instrument(
                canonical_id=f"STOCK:{sym}",
                symbol=sym,
                ticker=sym,
                name=f"P79 Test Company {i:02d}",
                asset_type="STOCK",
                asset_class="EQUITY",
                market="US",
                country="US",
                exchange="NASDAQ",
                currency="USD",
                provider="GlobalMarketProvider",
                provider_symbol=sym,
                sector=TEST_SECTOR,
                industry="Software",
                is_active=True
            )
            db.add(inst)
            test_instruments.append(inst)
        db.commit()

        db_candidate_count = db.query(Instrument).filter(
            Instrument.sector == TEST_SECTOR,
            Instrument.is_active == True
        ).count()
        assert_test(db_candidate_count == 40, f"Deterministic universe has 40 candidates in DB (> 30 required, actual={db_candidate_count})")

        # Test Case 9A: Candidates 1-30 do NOT match, Candidate 31 MATCHES
        # If the screener stops at 30 or has a 30-candidate cap, total would be 0 (Regression Catch).
        for i in range(1, 41):
            sym = f"P79_TEST_{i:02d}"
            if i == 31:
                pe_val = 15.0  # Matches range [10.0, 25.0]
            else:
                pe_val = 99.0  # Fails range [10.0, 25.0]

            item = ScreenerResultItem(
                symbol=sym,
                canonical_id=f"STOCK:{sym}",
                ticker=sym,
                name=f"P79 Test Company {i:02d}",
                asset_type="STOCK",
                country="US",
                exchange="NASDAQ",
                currency="USD",
                sector=TEST_SECTOR,
                industry="Software",
                price=100.0,
                change=1.0,
                change_pct=1.0,
                market_cap=50_000_000.0,
                pe_ratio=pe_val,
                roe=20.0,
                debt_equity=0.2,
                dividend_yield=1.0,
                rsi=50.0,
                research_coverage=100.0,
                data_completeness="COMPLETE"
            )
            market_cache.set(f"screener:item:{sym}", item.model_dump(), ttl_seconds=3600)

        res_9a = StockScreenerService.execute_screen(
            ScreenerFilterParams(sector=TEST_SECTOR, pe_min=10.0, pe_max=25.0, page=1, limit=10),
            db=db
        )
        assert_test(res_9a.total == 1, f"Test 9A: Single match beyond candidate #30 discovered (total={res_9a.total}, expected=1)")
        assert_test(len(res_9a.items) == 1, f"Test 9A: Exactly 1 item returned on requested page (returned {len(res_9a.items)})")
        assert_test(res_9a.items[0].symbol == "P79_TEST_31", f"Test 9A: Candidate #31 specifically identified ({res_9a.items[0].symbol})")
        assert_test(res_9a.items[0].pe_ratio == 15.0, f"Test 9A: Candidate #31 P/E strictly satisfies filter (pe={res_9a.items[0].pe_ratio})")

        # Test Case 9B: Candidates 1-30 have matches (candidates 5 & 15), candidates > 30 have matches (candidates 31 & 38)
        # Verifies complete discovery, accurate total (4), totalPages (2), and pagination across both pages.
        for i in range(1, 41):
            sym = f"P79_TEST_{i:02d}"
            if i in [5, 15, 31, 38]:
                pe_val = 12.0 + (i % 10)  # e.g. 17.0, 17.0, 13.0, 20.0 -> all within [10, 25]
            else:
                pe_val = 99.0

            item = ScreenerResultItem(
                symbol=sym,
                canonical_id=f"STOCK:{sym}",
                ticker=sym,
                name=f"P79 Test Company {i:02d}",
                asset_type="STOCK",
                country="US",
                exchange="NASDAQ",
                currency="USD",
                sector=TEST_SECTOR,
                industry="Software",
                price=100.0,
                change=1.0,
                change_pct=1.0,
                market_cap=50_000_000.0 * i,
                pe_ratio=pe_val,
                roe=20.0,
                debt_equity=0.2,
                dividend_yield=1.0,
                rsi=50.0,
                research_coverage=100.0,
                data_completeness="COMPLETE"
            )
            market_cache.set(f"screener:item:{sym}", item.model_dump(), ttl_seconds=3600)

        # Page 1 (limit 2, sort by symbol asc)
        res_9b_p1 = StockScreenerService.execute_screen(
            ScreenerFilterParams(sector=TEST_SECTOR, pe_min=10.0, pe_max=25.0, sort="symbol", order="asc", page=1, limit=2),
            db=db
        )
        assert_test(res_9b_p1.total == 4, f"Test 9B: Total count reflects all 4 matches across candidate universe (total={res_9b_p1.total})")
        assert_test(res_9b_p1.total_pages == 2, f"Test 9B: Total pages correctly calculated as 2 (totalPages={res_9b_p1.total_pages})")
        assert_test(len(res_9b_p1.items) == 2, f"Test 9B: Page 1 returned exactly 2 items (limit=2)")
        assert_test([it.symbol for it in res_9b_p1.items] == ["P79_TEST_05", "P79_TEST_15"], f"Test 9B: Page 1 contains expected early matches ({[it.symbol for it in res_9b_p1.items]})")
        assert_test(res_9b_p1.has_next == True, "Test 9B: Page 1 has_next is True")

        # Page 2 (limit 2, sort by symbol asc)
        res_9b_p2 = StockScreenerService.execute_screen(
            ScreenerFilterParams(sector=TEST_SECTOR, pe_min=10.0, pe_max=25.0, sort="symbol", order="asc", page=2, limit=2),
            db=db
        )
        assert_test(res_9b_p2.page == 2, "Test 9B: Page 2 index is 2")
        assert_test(len(res_9b_p2.items) == 2, f"Test 9B: Page 2 returned exactly 2 items")
        assert_test([it.symbol for it in res_9b_p2.items] == ["P79_TEST_31", "P79_TEST_38"], f"Test 9B: Page 2 contains beyond-30 matches ({[it.symbol for it in res_9b_p2.items]})")
        assert_test(res_9b_p2.has_prev == True, "Test 9B: Page 2 has_prev is True")
        assert_test(res_9b_p2.has_next == False, "Test 9B: Page 2 has_next is False")
        assert_test(all(it.pe_ratio is not None and 10.0 <= it.pe_ratio <= 25.0 for it in res_9b_p1.items + res_9b_p2.items), "Test 9B: All returned items across all pages strictly satisfy P/E filter")

        # 3. Clean up test instruments
        db.query(Instrument).filter(Instrument.sector == TEST_SECTOR).delete()
        db.commit()

    finally:
        db.close()

    print("\n" + "=" * 60)
    print(f"VERIFICATION SUMMARY: {passed} PASSED, {failed} FAILED")
    print("=" * 60)
    return failed == 0


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
