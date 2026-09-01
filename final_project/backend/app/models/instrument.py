from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Index, Text, JSON
from app.core.database import Base

class Instrument(Base):
    __tablename__ = "instruments"

    id = Column(Integer, primary_key=True, index=True)
    canonical_id = Column(String(120), unique=True, index=True, nullable=False)
    figi = Column(String(30), index=True, nullable=True)
    symbol = Column(String(50), index=True, nullable=False)
    ticker = Column(String(50), index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    short_name = Column(String(100), nullable=True)
    asset_type = Column(String(50), index=True, nullable=False)  # STOCK, ETF, MUTUAL_FUND, INDEX, COMMODITY, BOND
    asset_class = Column(String(50), index=True, nullable=False) # EQUITY, DEBT, COMMODITY, HYBRID, INDEX
    market = Column(String(50), index=True, nullable=False)       # INDIA, US, GLOBAL, TAIWAN, UK, GERMANY, JAPAN
    country = Column(String(50), index=True, nullable=False)      # IN, US, TW, GB, DE, JP, HK, NL, CN
    exchange = Column(String(50), index=True, nullable=False)     # NSE, BSE, NASDAQ, NYSE, AMEX, LSE, XETRA, TSE, HKEX, AMFI, MCX
    exchange_mic = Column(String(20), nullable=True)             # XNSE, XBOM, XNAS, XNYS, XLON, XETR, XHKG
    currency = Column(String(10), nullable=False, default="INR")  # INR, USD, GBP, EUR, JPY, HKD, TWD
    provider = Column(String(50), nullable=False)                 # GlobalMarketProvider, IndianEquitiesProvider, AMFI, ETFProvider
    provider_symbol = Column(String(80), nullable=False)
    status = Column(String(30), default="ACTIVE", index=True)
    is_active = Column(Boolean, default=True, index=True)
    
    # Fundamental & Classification Metadata
    sector = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    fund_house = Column(String(100), nullable=True)
    fund_category = Column(String(100), nullable=True)
    isin = Column(String(30), index=True, nullable=True)
    cusip = Column(String(30), nullable=True)
    sedol = Column(String(30), nullable=True)
    benchmark = Column(String(150), nullable=True)
    expense_ratio = Column(String(20), nullable=True)
    risk_level = Column(String(30), nullable=True)
    aliases = Column(JSON, default=list)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index('ix_instruments_search', 'symbol', 'name', 'ticker'),
        Index('ix_instruments_filter', 'asset_type', 'market', 'exchange'),
        Index('ix_instruments_canonical_provider', 'canonical_id', 'provider'),
    )
