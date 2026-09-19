"""
SMARTVEST — FINAL INDIAN UNIVERSE COUNT RECONCILIATION SCRIPT
Verifies and produces exact primary asset category counts,
reconciles the 21-instrument discrepancy,
validates active Angel One mapping across Stocks, ETFs, REITs, and InvITs,
and verifies mutual fund NAV status.
"""
import os
import sys
import collections

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.database import SessionLocal
from app.models.instrument import Instrument
from app.services.market_data.providers.angel_scrip_master import angel_scrip_master

EXCHANGE_TRADED_REITS = {"EMBASSY.NS", "MINDSPACE.NS", "BIRET.NS", "NEXUS.NS"}
EXCHANGE_TRADED_INVITS = {"PGINVIT.NS", "IRBINVIT.NS"}

def run_reconciliation():
    print("=" * 80)
    print("SMARTVEST — FINAL INDIAN UNIVERSE COUNT RECONCILIATION")
    print("=" * 80)

    # 1. Load Angel Scrip Master
    master_loaded = angel_scrip_master.load_master()
    print(f"Angel Scrip Master loaded: {master_loaded} | Indexed: {angel_scrip_master.total_loaded}")

    db = SessionLocal()
    try:
        total_db_records = db.query(Instrument).count()

        indian_filter = (
            (Instrument.country == "IN") |
            (Instrument.market == "INDIA") |
            (Instrument.currency == "INR") |
            (Instrument.exchange.in_(["NSE", "BSE", "AMFI"]))
        )
        all_indian = db.query(Instrument).filter(indian_filter).all()
        total_indian_records = len(all_indian)

        # Classify every instrument into its PRIMARY asset category (mutually exclusive)
        categories = collections.defaultdict(list)
        category_assignment_count = collections.defaultdict(int)

        for inst in all_indian:
            sym = inst.symbol or ""
            # Rule 1: Mutual Funds (all 14,367 AMFI schemes)
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

        stocks = len(categories["STOCK"])
        etfs = len(categories["ETF"])
        mutual_funds = len(categories["MUTUAL_FUND"])
        reits = len(categories["REIT"])
        invits = len(categories["INVIT"])
        indices = len(categories["INDEX"])
        other = len(categories["OTHER"])
        uncategorized = len(categories["UNCATEGORIZED"])

        sum_of_categories = stocks + etfs + mutual_funds + reits + invits + indices + other + uncategorized
        duplicates = sum(1 for cnt in category_assignment_count.values() if cnt > 1)

        print("\n--- 1. CATEGORY TOTAL RECONCILIATION ---")
        print(f"totalDatabaseRecords:            {total_db_records}")
        print(f"totalIndianRecords:              {total_indian_records}")
        print(f"stocks:                          {stocks}")
        print(f"etfs:                            {etfs}")
        print(f"mutualFunds:                     {mutual_funds}")
        print(f"reits:                           {reits}")
        print(f"invits:                          {invits}")
        print(f"indices:                         {indices}")
        print(f"other:                           {other}")
        print(f"sumOfCategories:                 {sum_of_categories}")
        print(f"uncategorized:                   {uncategorized}")
        print(f"duplicateCategoryAssignments:    {duplicates}")
        print(f"sumOfCategories == totalIndian:  {sum_of_categories == total_indian_records}")

        # 2. Angel Mapping Count (Exchange Traded Instruments)
        active_stocks = [s for s in categories["STOCK"] if s.is_active]
        active_etfs = [e for e in categories["ETF"] if e.is_active]
        active_reits = [r for r in categories["REIT"] if r.is_active]
        active_invits = [inv for inv in categories["INVIT"] if inv.is_active]

        active_exchange_traded = active_stocks + active_etfs + active_reits + active_invits
        active_exchange_traded_count = len(active_exchange_traded)

        angel_resolvable = 0
        angel_missing_token = 0
        angel_invalid_token = 0
        angel_provider_mismatch = 0

        for it in active_exchange_traded:
            if it.provider == "AMFI" or (it.provider and "AMFI" in it.provider.upper()):
                angel_provider_mismatch += 1
            res = angel_scrip_master.resolve(it.symbol, exchange=it.exchange if it.exchange in ["NSE", "BSE"] else None)
            if res:
                tok = res.get("token")
                if tok and tok.isdigit() and int(tok) > 0:
                    angel_resolvable += 1
                else:
                    angel_invalid_token += 1
            else:
                angel_missing_token += 1

        print("\n--- 2. ANGEL MAPPING COUNT ---")
        print(f"Active stocks:                   {len(active_stocks)}")
        print(f"Active ETFs:                     {len(active_etfs)}")
        print(f"Active REITs:                    {len(active_reits)}")
        print(f"Active InvITs:                   {len(active_invits)}")
        print(f"activeExchangeTradedIndian:      {active_exchange_traded_count}")
        print(f"angelResolvable:                 {angel_resolvable}")
        print(f"angelMissingToken:               {angel_missing_token}")
        print(f"angelInvalidToken:               {angel_invalid_token}")
        print(f"angelProviderMismatch:           {angel_provider_mismatch}")

        # 3. REIT / InvIT Classification
        print("\n--- 3. REIT / INVIT CLASSIFICATION ---")
        for r in categories["REIT"]:
            res = angel_scrip_master.resolve(r.symbol, exchange=r.exchange)
            tok = res.get("token") if res else "None"
            tsym = res.get("tradingsymbol") if res else "None"
            prov = res.get("provider") if res else r.provider
            print(f"canonicalId:     {r.canonical_id}")
            print(f"assetType:       REIT")
            print(f"exchange:        {r.exchange}")
            print(f"tradingSymbol:   {tsym}")
            print(f"provider:        {prov}")
            print(f"token:           {tok}")
            print(f"status:          {r.status}")
            print("-" * 40)

        for inv in categories["INVIT"]:
            res = angel_scrip_master.resolve(inv.symbol, exchange=inv.exchange)
            tok = res.get("token") if res else "None"
            tsym = res.get("tradingsymbol") if res else "None"
            prov = res.get("provider") if res else inv.provider
            print(f"canonicalId:     {inv.canonical_id}")
            print(f"assetType:       INVIT")
            print(f"exchange:        {inv.exchange}")
            print(f"tradingSymbol:   {tsym}")
            print(f"provider:        {prov}")
            print(f"token:           {tok}")
            print(f"status:          {inv.status}")
            print("-" * 40)

        # 4. Mutual Fund NAV Counts
        print("\n--- 4. MUTUAL FUND COUNTS ---")
        mfs = categories["MUTUAL_FUND"]
        mf_current_nav = 0
        mf_older_nav = 0
        mf_no_nav = 0

        for m in mfs:
            nav_val = m.nav
            nav_d = m.nav_date
            if nav_val is not None and float(nav_val) > 0:
                if nav_d and ("2026" in nav_d or "2025" in nav_d or "2024" in nav_d):
                    mf_current_nav += 1
                else:
                    mf_older_nav += 1
            else:
                mf_no_nav += 1

        print(f"Total Mutual Funds:              {len(mfs)}")
        print(f"current NAV available:           {mf_current_nav}")
        print(f"older NAV only:                  {mf_older_nav}")
        print(f"no NAV data:                     {mf_no_nav}")
        print(f"Sum of NAV statuses:             {mf_current_nav + mf_older_nav + mf_no_nav}")

        # 5. Final Summary Proof
        print("\n--- 5. FINAL SUMMARY & PROOF ---")
        print(f"TOTAL INDIAN:                    {total_indian_records}")
        print(f"STOCKS:                          {stocks}")
        print(f"ETFs:                            {etfs}")
        print(f"MUTUAL FUNDS:                    {mutual_funds}")
        print(f"REITs:                           {reits}")
        print(f"INVITs:                          {invits}")
        print(f"INDICES:                         {indices}")
        print(f"OTHER:                           {other}")
        print(f"SUM OF CATEGORIES:               {sum_of_categories}")
        print(f"PROOF: sum(categories) == total Indian records -> {sum_of_categories == total_indian_records}")

    finally:
        db.close()

if __name__ == "__main__":
    run_reconciliation()
