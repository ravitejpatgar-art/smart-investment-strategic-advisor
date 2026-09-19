"""
SMARTVEST — FULL INDIAN MARKET UNIVERSE AUDIT SCRIPT
Performs comprehensive, read-only audit across:
- Stocks (NSE / BSE)
- ETFs
- Mutual Funds
- REITs / InvITs
- Provider contamination
- Duplicate identification
- Scrip Master token resolution
- Search audit
"""
import os
import sys
import json
import collections
from datetime import datetime, timezone
from typing import Dict, Any, List

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.instrument import Instrument
from app.services.market_data.providers.angel_scrip_master import angel_scrip_master

client = TestClient(app)

KNOWN_REIT_SYMBOLS = {"EMBASSY.NS", "MINDSPACE.NS", "BIRET.NS", "NEXUS.NS", "BROOKFIELD.NS", "EMBASSY", "MINDSPACE", "BIRET", "NEXUS"}
KNOWN_INVIT_SYMBOLS = {"PGINVIT.NS", "IRBINVIT.NS", "POWERGRID.NS", "INDIAGRID.NS", "PGINVIT", "IRBINVIT", "INDIAGRID"}

def run_universe_audit():
    print("=" * 85)
    print("SMARTVEST — FULL INDIAN MARKET UNIVERSE AUDIT")
    print("=" * 85)

    # 1. Load Angel One Scrip Master
    print("[1/11] Loading Angel One Scrip Master...")
    master_loaded = angel_scrip_master.load_master()
    print(f"       Scrip Master loaded: {master_loaded} | Total Indexed: {angel_scrip_master.total_loaded}")

    # 2. Database Connection
    db = SessionLocal()

    try:
        # 3. Query All Indian Instruments
        print("[2/11] Querying Indian Instruments Database...")
        indian_filter = (
            (Instrument.country == "IN") |
            (Instrument.market == "INDIA") |
            (Instrument.currency == "INR") |
            (Instrument.exchange.in_(["NSE", "BSE", "AMFI"]))
        )
        all_indian = db.query(Instrument).filter(indian_filter).all()
        total_count = len(all_indian)
        print(f"       Total Indian Instruments in Database: {total_count}")

        # Primary asset categorization (mutually exclusive)
        EXCHANGE_TRADED_REITS = {"EMBASSY.NS", "MINDSPACE.NS", "BIRET.NS", "NEXUS.NS"}
        EXCHANGE_TRADED_INVITS = {"PGINVIT.NS", "IRBINVIT.NS"}

        categories = collections.defaultdict(list)
        category_assignment_count = collections.defaultdict(int)

        for inst in all_indian:
            sym = inst.symbol or ""
            # Rule 1: Mutual Funds (all 14,367 AMFI schemes, including REIT FoF/index funds)
            if inst.asset_type == "MUTUAL_FUND" or inst.exchange == "AMFI" or sym.startswith("AMFI:"):
                primary = "MUTUAL_FUND"
            # Rule 2: ETFs
            elif inst.asset_type == "ETF":
                primary = "ETF"
            # Rule 3: Exchange-traded REITs
            elif sym in EXCHANGE_TRADED_REITS or (inst.sector and "REIT" in inst.sector.upper()) or (inst.industry and "REIT" in inst.industry.upper()):
                primary = "REIT"
            # Rule 4: Exchange-traded InvITs
            elif sym in EXCHANGE_TRADED_INVITS or (inst.industry and "INVIT" in inst.industry.upper()):
                primary = "INVIT"
            # Rule 5: Indices
            elif inst.asset_type == "INDEX":
                primary = "INDEX"
            # Rule 6: Other (Commodity)
            elif inst.asset_type == "COMMODITY":
                primary = "OTHER"
            # Rule 7: Pure Stocks
            elif inst.asset_type == "STOCK":
                primary = "STOCK"
            else:
                primary = "UNCATEGORIZED"

            categories[primary].append(inst)
            category_assignment_count[inst.id] += 1

        stocks = categories["STOCK"]
        etfs = categories["ETF"]
        mfs = categories["MUTUAL_FUND"]
        reits = categories["REIT"]
        invits = categories["INVIT"]
        indices = categories["INDEX"]
        other_types = categories["OTHER"]
        uncat = categories["UNCATEGORIZED"]

        sum_of_cats = len(stocks) + len(etfs) + len(mfs) + len(reits) + len(invits) + len(indices) + len(other_types) + len(uncat)
        dup_cats = sum(1 for cnt in category_assignment_count.values() if cnt > 1)

        print(f"       Primary Categories Reconciliation:")
        print(f"       Stocks: {len(stocks)} | ETFs: {len(etfs)} | Mutual Funds: {len(mfs)} | REITs: {len(reits)} | InvITs: {len(invits)} | Indices: {len(indices)} | Other: {len(other_types)}")
        print(f"       Sum of Categories: {sum_of_cats} (Match: {sum_of_cats == total_count}) | Uncategorized: {len(uncat)} | Duplicate Assignments: {dup_cats}")

        # 4. Indian Stock Audit
        print("\n[3/11] Auditing Indian Stocks...")
        active_stocks = [s for s in stocks if s.is_active]
        inactive_stocks = [s for s in stocks if not s.is_active]

        stock_resolvable = 0
        stock_missing_token = 0
        stock_unresolvable = []
        stock_provider_mismatches = 0
        stock_wrong_exchange = 0
        stock_wrong_asset_type = 0

        for s in active_stocks:
            # Exchange check
            if s.exchange not in ["NSE", "BSE"]:
                stock_wrong_exchange += 1
            # Provider check
            if s.provider == "AMFI" or "AMFI" in s.provider:
                stock_provider_mismatches += 1
            # Resolution against Angel Scrip Master
            res = angel_scrip_master.resolve(s.symbol, exchange=s.exchange if s.exchange in ["NSE", "BSE"] else None)
            if res:
                stock_resolvable += 1
            else:
                stock_missing_token += 1
                stock_unresolvable.append((s.symbol, s.name, s.exchange, s.status))

        print(f"       Active Stocks: {len(active_stocks)} | Inactive Stocks: {len(inactive_stocks)}")
        print(f"       Resolvable with Angel Scrip Master: {stock_resolvable} ({round(stock_resolvable/len(active_stocks)*100, 2) if active_stocks else 0}%)")
        print(f"       Unresolvable / Missing Token: {stock_missing_token}")
        if stock_unresolvable:
            print(f"       Sample unresolvable stocks: {stock_unresolvable[:10]}")

        # 5. Indian ETF Audit
        print("\n[4/11] Auditing Indian ETFs...")
        active_etfs = [e for e in etfs if e.is_active]
        inactive_etfs = [e for e in etfs if not e.is_active]

        etf_resolvable = 0
        etf_missing_token = 0
        etf_unresolvable = []
        etf_using_amfi = 0
        etf_wrong_exchange = 0

        for e in active_etfs:
            if e.provider == "AMFI" or "AMFI" in e.provider:
                etf_using_amfi += 1
            if e.exchange not in ["NSE", "BSE"]:
                etf_wrong_exchange += 1
            res = angel_scrip_master.resolve(e.symbol, exchange=e.exchange if e.exchange in ["NSE", "BSE"] else None)
            if res:
                etf_resolvable += 1
            else:
                etf_missing_token += 1
                etf_unresolvable.append((e.symbol, e.name, e.exchange, e.status))

        print(f"       Active ETFs: {len(active_etfs)} | Inactive ETFs: {len(inactive_etfs)}")
        print(f"       Resolvable with Angel Scrip Master: {etf_resolvable} ({round(etf_resolvable/len(active_etfs)*100, 2) if active_etfs else 0}%)")
        print(f"       ETFs mistakenly routed to AMFI: {etf_using_amfi}")
        print(f"       Unresolvable ETFs: {etf_missing_token}")
        if etf_unresolvable:
            print(f"       Sample unresolvable ETFs: {etf_unresolvable[:5]}")

        # 6. Mutual Fund Audit
        print("\n[5/11] Auditing Indian Mutual Funds...")
        active_mfs = [m for m in mfs if m.is_active]
        inactive_mfs = [m for m in mfs if not m.is_active]

        mf_using_angel = 0
        mf_with_ns_bo = 0
        mf_with_current_nav = 0
        mf_with_older_nav = 0
        mf_with_no_nav = 0
        mf_missing_scheme_code = 0

        for m in mfs:
            if m.provider == "Angel One" or "ANGEL" in (m.provider or "").upper():
                mf_using_angel += 1
            if m.exchange in ["NSE", "BSE"]:
                mf_using_angel += 1
            if m.symbol and (".NS" in m.symbol or ".BO" in m.symbol):
                mf_with_ns_bo += 1
            if not m.scheme_code and not (m.symbol and m.symbol.startswith("AMFI:")):
                mf_missing_scheme_code += 1

            # NAV coverage
            nav_val = m.nav
            nav_d = m.nav_date
            if nav_val is not None and float(nav_val) > 0:
                if nav_d and ("2026" in nav_d or "2025" in nav_d or "2024" in nav_d):
                    mf_with_current_nav += 1
                else:
                    mf_with_older_nav += 1
            else:
                mf_with_no_nav += 1

        print(f"       Active MFs: {len(active_mfs)} | Inactive MFs: {len(inactive_mfs)}")
        print(f"       Mutual Funds using Angel One / NSE / BSE: {mf_using_angel}")
        print(f"       Mutual Funds with .NS / .BO suffix: {mf_with_ns_bo}")
        print(f"       Mutual Funds with CURRENT_NAV: {mf_with_current_nav}")
        print(f"       Mutual Funds with OLDER_NAV: {mf_with_older_nav}")
        print(f"       Mutual Funds with NO_NAV: {mf_with_no_nav}")
        print(f"       Mutual Funds missing scheme code: {mf_missing_scheme_code}")

        # 7. REIT / InvIT Audit
        print("\n[6/11] Auditing Indian REITs & InvITs...")
        for r in reits:
            res = angel_scrip_master.resolve(r.symbol, exchange=r.exchange)
            tok = res.get("token") if res else None
            tsym = res.get("tradingsymbol") if res else None
            prov = res.get("provider") if res else r.provider
            print(f"       REIT: {r.symbol} | canonicalId: {r.canonical_id} | assetType: REIT | exchange: {r.exchange} | tradingSymbol: {tsym} | provider: {prov} | token: {tok} | status: {r.status}")
        for inv in invits:
            res = angel_scrip_master.resolve(inv.symbol, exchange=inv.exchange)
            tok = res.get("token") if res else None
            tsym = res.get("tradingsymbol") if res else None
            prov = res.get("provider") if res else inv.provider
            print(f"       InvIT: {inv.symbol} | canonicalId: {inv.canonical_id} | assetType: INVIT | exchange: {inv.exchange} | tradingSymbol: {tsym} | provider: {prov} | token: {tok} | status: {inv.status}")

        # 8. Complete Provider Contamination Scan
        print("\n[7/11] Complete Provider Contamination Scan...")
        contamination = {
            "mf_using_angel": db.query(Instrument).filter(
                (Instrument.asset_type == "MUTUAL_FUND") &
                ((Instrument.provider.ilike("%ANGEL%")) | (Instrument.exchange.in_(["NSE", "BSE"])))
            ).count(),
            "etf_using_amfi": db.query(Instrument).filter(
                (Instrument.asset_type == "ETF") &
                ((Instrument.provider.ilike("%AMFI%")) | (Instrument.exchange == "AMFI"))
            ).count(),
            "stock_using_amfi": db.query(Instrument).filter(
                (Instrument.asset_type == "STOCK") &
                ((Instrument.provider.ilike("%AMFI%")) | (Instrument.exchange == "AMFI"))
            ).count(),
            "mf_with_ns_bo_suffix": db.query(Instrument).filter(
                (Instrument.asset_type == "MUTUAL_FUND") &
                ((Instrument.symbol.ilike("%.NS%")) | (Instrument.symbol.ilike("%.BO%")))
            ).count(),
            "stock_with_amfi_prefix": db.query(Instrument).filter(
                (Instrument.asset_type == "STOCK") &
                (Instrument.symbol.ilike("AMFI:%"))
            ).count(),
        }
        for k, v in contamination.items():
            print(f"       {k:26}: {v}")

        # 9. Duplicate Identity Audit
        print("\n[8/11] Auditing Duplicate Identities...")
        canonical_counts = collections.Counter(i.canonical_id for i in all_indian if i.canonical_id)
        dup_canonical = {k: v for k, v in canonical_counts.items() if v > 1}

        symbol_counts = collections.Counter(i.symbol for i in all_indian if i.symbol)
        dup_symbols = {k: v for k, v in symbol_counts.items() if v > 1}

        isin_counts = collections.Counter(i.isin for i in all_indian if i.isin and i.isin.strip())
        dup_isins = {k: v for k, v in isin_counts.items() if v > 1}

        scheme_counts = collections.Counter(i.scheme_code for i in mfs if i.scheme_code and i.scheme_code.strip())
        dup_schemes = {k: v for k, v in scheme_counts.items() if v > 1}

        print(f"       Duplicate canonicalIds: {len(dup_canonical)}")
        print(f"       Duplicate symbols:      {len(dup_symbols)}")
        print(f"       Duplicate ISINs:        {len(dup_isins)}")
        print(f"       Duplicate schemeCodes:  {len(dup_schemes)}")

        # 10. Quote Coverage Classification
        print("\n[9/11] Classifying Quote Coverage Across Universe...")
        # Exchange-traded active instruments with valid Angel token = REALTIME_CAPABLE during session
        active_reits_res = sum(1 for r in reits if r.is_active and angel_scrip_master.resolve(r.symbol, exchange=r.exchange))
        active_invits_res = sum(1 for inv in invits if inv.is_active and angel_scrip_master.resolve(inv.symbol, exchange=inv.exchange))
        realtime_capable = stock_resolvable + etf_resolvable + active_reits_res + active_invits_res
        latest_available_mf = mf_with_current_nav + mf_with_older_nav
        unavailable_total = stock_missing_token + etf_missing_token + mf_with_no_nav
        invalid_mapping_total = stock_wrong_exchange + etf_using_amfi + contamination["mf_using_angel"]

        print(f"       REALTIME_CAPABLE (Stocks + ETFs + REITs + InvITs with Angel Token): {realtime_capable}")
        print(f"       LATEST_AVAILABLE (Published NAV Mutual Funds):                      {latest_available_mf}")
        print(f"       UNAVAILABLE (Unresolved or No NAV):                                 {unavailable_total}")
        print(f"       INVALID_MAPPING:                                   {invalid_mapping_total}")

        # 11. Search Audit
        print("\n[10/11] Auditing Marketplace Search...")
        SEARCH_TARGETS = [
            ("RELIANCE", "STOCK", "NSE"),
            ("TCS", "STOCK", "NSE"),
            ("INFY", "STOCK", "NSE"),
            ("HDFCBANK", "STOCK", "NSE"),
            ("MON100", "ETF", "NSE"),
            ("NIFTYBEES", "ETF", "NSE"),
            ("GOLDBEES", "ETF", "NSE"),
            ("HDFC Flexi Cap", "MUTUAL_FUND", "AMFI"),
            ("Parag Parikh Flexi Cap", "MUTUAL_FUND", "AMFI")
        ]

        search_pass = True
        for query_str, expected_type, expected_exch in SEARCH_TARGETS:
            res = client.get(f"/api/v1/market/search?q={query_str}&limit=5")
            data = res.json() if res.status_code == 200 else {}
            items = data.get("items", []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
            matched = False
            top_item = None
            if items:
                top_item = items[0]
                # Check top matches
                for it in items[:3]:
                    sym = it.get("symbol", "")
                    name = it.get("name", "")
                    atype = it.get("assetType") or it.get("instrument_type")
                    exch = it.get("exchange")
                    if (query_str.upper() in sym.upper() or query_str.upper() in name.upper()):
                        matched = True
                        top_item = it
                        break

            status = "PASS" if matched else "FAIL"
            if not matched:
                search_pass = False
            top_sym = top_item.get("symbol") if top_item else "NOT FOUND"
            top_type = top_item.get("assetType") if top_item else "NONE"
            top_exch = top_item.get("exchange") if top_item else "NONE"
            print(f"       {status:4} | Query: '{query_str:22}' -> Matched: {top_sym:18} | Type: {top_type:11} | Exchange: {top_exch}")

        print("\n" + "=" * 85)
        print(f"INDIAN MARKET UNIVERSE AUDIT COMPLETE | Search Audit: {'PASS' if search_pass else 'FAIL'}")
        print("=" * 85)

    finally:
        db.close()

if __name__ == "__main__":
    run_universe_audit()
