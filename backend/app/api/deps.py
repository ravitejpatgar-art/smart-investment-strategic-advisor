from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def get_or_create_demo_user(db: Session) -> User:
    demo_user = db.query(User).filter(User.email == "demo@smartvest.ai").first()
    if not demo_user:
        from app.core.security import get_password_hash
        from app.models.user import FinancialProfile
        demo_user = User(
            email="demo@smartvest.ai",
            full_name="SmartVest Investor",
            hashed_password=get_password_hash("DemoPassword123!"),
            role="user",
            is_active=True,
            is_verified=True
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        # Initialize profile if not present
        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == demo_user.id).first()
        if not profile:
            profile = FinancialProfile(
                user_id=demo_user.id,
                monthly_income=120000.0,
                monthly_expenses=50000.0,
                existing_savings=300000.0,
                existing_investments=500000.0,
                risk_tolerance="Moderate",
                risk_score=70,
                financial_goal="Wealth Creation",
                investment_horizon="5-10 years",
                investment_experience="Intermediate",
                onboarding_completed=True
            )
            db.add(profile)
            db.commit()
    return demo_user

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    if not token:
        # Seamless fallback for guest/demo sessions
        return get_or_create_demo_user(db)
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return get_or_create_demo_user(db)
    except JWTError:
        return get_or_create_demo_user(db)
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        return get_or_create_demo_user(db)
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
    return user

def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user

def get_current_user_optional(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        return None
