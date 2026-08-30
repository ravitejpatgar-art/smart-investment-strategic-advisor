from datetime import timedelta
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, FinancialProfile
from app.schemas.auth import UserRegister, UserLogin, GoogleAuthRequest, GitHubAuthRequest, ForgotPasswordRequest, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # Check existing email
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    # Create user
    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role="user",
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Initialize empty financial profile
    profile = FinancialProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    
    # Generate token
    token_str = create_access_token(user.id)
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User account is deactivated")
    
    token_str = create_access_token(user.id)
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "user": user
    }

@router.post("/google", response_model=Token)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        # Auto register Google user
        random_pwd = secrets.token_urlsafe(24)
        user = User(
            email=payload.email.lower(),
            full_name=payload.full_name or "Google Investor",
            hashed_password=get_password_hash(random_pwd),
            role="user",
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        profile = FinancialProfile(user_id=user.id)
        db.add(profile)
        db.commit()
    
    token_str = create_access_token(user.id)
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "user": user
    }

@router.post("/github", response_model=Token)
def github_auth(payload: GitHubAuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        # Auto register GitHub user
        random_pwd = secrets.token_urlsafe(24)
        user = User(
            email=payload.email.lower(),
            full_name=payload.full_name or "GitHub Investor",
            hashed_password=get_password_hash(random_pwd),
            role="user",
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        profile = FinancialProfile(user_id=user.id)
        db.add(profile)
        db.commit()
    
    token_str = create_access_token(user.id)
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "user": user
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    # Always return success message for security to prevent user enumeration
    return {
        "status": "success",
        "message": "If an account exists with this email, password recovery instructions have been sent."
    }
