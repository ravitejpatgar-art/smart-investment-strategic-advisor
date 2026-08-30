from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user") # "user" | "admin"
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Personal Info
    age = Column(Integer, nullable=True)
    occupation = Column(String, nullable=True)
    
    # Financial Snapshot
    monthly_income = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    existing_savings = Column(Float, default=0.0)
    existing_investments = Column(Float, default=0.0)
    
    # Goals & Strategy
    financial_goal = Column(String, default="Wealth Creation & Early Independence")
    investment_horizon = Column(String, default="5-10 Years")
    
    # Risk & Experience
    investment_experience = Column(String, default="Beginner") # "Beginner" | "Intermediate" | "Advanced"
    risk_tolerance = Column(String, default="Moderate") # "Conservative" | "Moderate" | "Aggressive"
    risk_score = Column(Integer, default=75) # 0-100
    
    # Goals (stored as JSON array of strings)
    primary_goals = Column(JSON, default=list)
    
    # Status
    onboarding_completed = Column(Boolean, default=False)
    baseline_health_score = Column(Integer, default=75)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
