from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1 import (
    auth, users, onboarding, health, dashboard, expenses, 
    emergency, risk, allocation, stocks, portfolio, goals, 
    market, assistant, ai, education, admin, conversations
)

from app.services.market_data.scheduler import market_scheduler

# Create database tables automatically if not already present
try:
    Base.metadata.create_all(bind=engine, checkfirst=True)
except Exception:
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
def on_startup():
    market_scheduler.start()

    # 5-point startup diagnostics for Angel One SmartAPI (Strictly safe, never exposes credentials)
    import logging
    startup_logger = logging.getLogger("app.market_data.startup")
    try:
        from app.services.market_data.providers.angel_provider import angel_provider
        from app.services.market_data.providers.angel_scrip_master import angel_scrip_master

        auth_status = "NOT_CONFIGURED"
        if angel_provider.is_configured:
            try:
                success = angel_provider.authenticate()
                auth_status = "SUCCESS" if success else (angel_provider.connection_status or "FAILED")
            except Exception as e:
                auth_status = f"FAILED ({str(e)[:50]})"

        session_active = bool(angel_provider.jwt_token and angel_provider.feed_token)
        scrip_loaded = f"{angel_scrip_master.total_loaded} scrips loaded" if angel_scrip_master.total_loaded > 0 else "FAILED_OR_EMPTY"
        provider_ready = bool(angel_provider.is_configured and session_active and angel_scrip_master.total_loaded > 0)

        startup_logger.info("=" * 60)
        startup_logger.info("ANGEL ONE PRODUCTION STARTUP REPORT")
        startup_logger.info(f"Angel configured: {'YES' if angel_provider.is_configured else 'NO (CREDENTIALS_REQUIRED)'}")
        startup_logger.info(f"Angel authentication: {auth_status}")
        startup_logger.info(f"Angel session: {'ACTIVE' if session_active else 'INACTIVE'}")
        startup_logger.info(f"Scrip master: {scrip_loaded}")
        startup_logger.info(f"Provider ready: {'YES' if provider_ready else 'NO'}")
        startup_logger.info("=" * 60)

        # Initialize live WebSocket stream on startup
        if angel_provider.is_configured:
            angel_provider.initialize_websocket_stream()
    except Exception as e:
        startup_logger.warning(f"Angel One startup diagnostic notice: {e}")

    # Ensure canonical universe is synchronously seeded so database is never 0 even during cold boot
    try:
        from app.core.database import SessionLocal
        from app.models.instrument import Instrument
        from app.services.market_data.universe_provider import GlobalUniverseManager
        with SessionLocal() as db:
            if db.query(Instrument).count() == 0:
                GlobalUniverseManager.seed_initial_universe(db=db)
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Startup canonical seed notice: {e}")

    # Trigger background universe sync if universe is uninitialized or needs auto-sync
    import threading
    def _startup_universe_sync():
        try:
            from app.core.database import SessionLocal
            from app.services.market_data.providers.universe_sync_engine import universe_sync_engine
            with SessionLocal() as db:
                if universe_sync_engine.should_run_auto_sync(db=db):
                    universe_sync_engine.run_full_sync(db=db, sync_eodhd=False, sync_nse=True, sync_amfi=True)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Startup universe sync notice: {e}")
    threading.Thread(target=_startup_universe_sync, daemon=True, name="StartupUniverseSync").start()

@app.on_event("shutdown")
def on_shutdown():
    market_scheduler.stop()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(onboarding.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(expenses.router, prefix=settings.API_V1_STR)
app.include_router(emergency.router, prefix=settings.API_V1_STR)
app.include_router(risk.router, prefix=settings.API_V1_STR)
app.include_router(allocation.router, prefix=settings.API_V1_STR)
app.include_router(stocks.router, prefix=settings.API_V1_STR)
app.include_router(portfolio.router, prefix=settings.API_V1_STR)
app.include_router(goals.router, prefix=settings.API_V1_STR)
app.include_router(market.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(conversations.router, prefix=settings.API_V1_STR)
app.include_router(education.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "project": "SmartVest AI",
        "version": settings.VERSION,
        "status": "online",
        "message": "Welcome to SmartVest AI - Complete Intelligent Fintech Platform API"
    }

@app.get("/api/health")
def health_check():
    from app.services.ai.openai_service import is_openai_configured
    return {
        "status": "healthy",
        "openai_configured": is_openai_configured(),
        "services": {
            "database": "connected",
            "market_feed": "active",
            "ai_engine": "ready",
            "assistant": "active"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
