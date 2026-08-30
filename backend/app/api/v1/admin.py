from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, FinancialProfile
from app.models.portfolio import PortfolioHolding
from app.models.goal import Goal

router = APIRouter(prefix="/admin", tags=["Admin Panel & DevOps"])

@router.get("/stats")
def get_admin_system_stats(
    db: Session = Depends(get_db)
):
    users_count = db.query(User).count()
    holdings_count = db.query(PortfolioHolding).count()
    goals_count = db.query(Goal).count()

    return {
        "metrics": {
            "total_users": users_count,
            "total_active_holdings": holdings_count,
            "total_goals_tracked": goals_count,
            "system_uptime": "99.98%"
        },
        "services": [
            {"name": "FastAPI Core Gateway", "status": "Operational", "version": "v1.0.0"},
            {"name": "PostgreSQL / SQLite Storage Engine", "status": "Operational", "version": "v15.2"},
            {"name": "Market Data Engine", "status": "Operational", "version": "v2.1"},
            {"name": "SmartVest AI Advisory Pipeline", "status": "Operational", "version": "v4-turbo"}
        ]
    }

@router.get("/users")
def get_admin_user_directory(
    db: Session = Depends(get_db)
):
    users = db.query(User).limit(50).all()
    res = []
    for u in users:
        p = db.query(FinancialProfile).filter(FinancialProfile.user_id == u.id).first()
        res.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "risk_profile": p.risk_tolerance if p else "Moderate",
            "income": p.monthly_income if p else 0.0,
            "created_at": u.created_at.strftime("%Y-%m-%d") if u.created_at else "2026-08-27"
        })
    return res

@router.post("/instruments/sync")
def sync_market_instruments(
    db: Session = Depends(get_db)
):
    """
    Administrative trigger to synchronize the global instrument master universe into database.
    """
    from app.services.market_data.universe_provider import GlobalUniverseManager
    added_count = GlobalUniverseManager.seed_initial_universe(db=db)
    stats = GlobalUniverseManager.get_coverage_stats(db=db)
    return {
        "status": "SUCCESS",
        "message": f"Global Instrument Master synchronized successfully. Added/Verified {added_count} records.",
        "coverage": stats
    }
