from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String, nullable=False, index=True)  # Rent, Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Other
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    description = Column(String, nullable=False)
    is_recurring = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index("ix_expenses_user_date", "user_id", "date"),
    )

    # Relationships
    user = relationship("User")
