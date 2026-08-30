from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    category = Column(String, default="Wealth Creation")  # Retirement, House, Education, Car, Wealth Creation, Vacation, Custom
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    risk_profile = Column(String, default="Moderate")  # Conservative, Moderate, Aggressive
    monthly_sip_required = Column(Float, default=0.0)
    probability = Column(Integer, default=85)  # 0 - 100%
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index("ix_goals_user_target_date", "user_id", "target_date"),
    )

    # Relationships
    user = relationship("User")
