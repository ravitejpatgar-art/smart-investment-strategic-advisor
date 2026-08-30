from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class PortfolioHolding(Base):
    __tablename__ = "portfolio_holdings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    asset_class = Column(String, default="Indian Stocks")  # Indian Stocks, US Stocks, Mutual Funds, ETFs, Gold, Bonds, Fixed Deposits, Crypto
    shares = Column(Float, nullable=False)
    avg_buy_price = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index("ix_portfolio_user_symbol", "user_id", "symbol"),
    )

    # Relationships
    user = relationship("User")
