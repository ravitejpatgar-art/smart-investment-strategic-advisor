import os
import json
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartVest AI API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartvest_super_secret_production_key_2026_jwt_token_auth")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database — defaults to local SQLite for dev; Render injects DATABASE_URL for production
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartvest.db")
    
    # AI Keys (Optional - has fallback intelligent engine)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_API_KEY_BACKUP: str = os.getenv("OPENAI_API_KEY_BACKUP", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_API_KEY_BACKUP: str = os.getenv("GEMINI_API_KEY_BACKUP", "")

    # Market Data Engine Configuration
    MARKET_DATA_MODE: str = os.getenv("MARKET_DATA_MODE", "REAL")  # REAL or MOCK
    MARKET_DATA_PROVIDER: str = os.getenv("MARKET_DATA_PROVIDER", "yfinance")
    MARKET_DATA_API_KEY: str = os.getenv("MARKET_DATA_API_KEY", "")
    MARKET_DATA_API_KEY_BACKUP: str = os.getenv("MARKET_DATA_API_KEY_BACKUP", "")
    
    INDIA_MARKET_DATA_PROVIDER: str = os.getenv("INDIA_MARKET_DATA_PROVIDER", "yfinance")
    INDIA_MARKET_DATA_API_KEY: str = os.getenv("INDIA_MARKET_DATA_API_KEY", "")
    INDIA_MARKET_DATA_API_KEY_BACKUP: str = os.getenv("INDIA_MARKET_DATA_API_KEY_BACKUP", "")
    
    # Optional Paid Indian Market Data Provider (e.g. TrueData) — Disabled by default
    PAID_MARKET_DATA_ENABLED: bool = os.getenv("PAID_MARKET_DATA_ENABLED", "false").lower() in ("true", "1", "yes")
    PAID_MARKET_DATA_PROVIDER: str = os.getenv("PAID_MARKET_DATA_PROVIDER", "truedata")
    PAID_MARKET_DATA_API_KEY: str = os.getenv("PAID_MARKET_DATA_API_KEY", "")
    TRUEDATA_API_KEY: str = os.getenv("TRUEDATA_API_KEY", "")
    TRUEDATA_API_SECRET: str = os.getenv("TRUEDATA_API_SECRET", "")
    
    US_MARKET_DATA_PROVIDER: str = os.getenv("US_MARKET_DATA_PROVIDER", "yfinance")
    US_MARKET_DATA_API_KEY: str = os.getenv("US_MARKET_DATA_API_KEY", "")
    US_MARKET_DATA_API_KEY_BACKUP: str = os.getenv("US_MARKET_DATA_API_KEY_BACKUP", "")
    
    FINNHUB_API_KEY: str = os.getenv("FINNHUB_API_KEY", "")
    FINNHUB_API_KEY_BACKUP: str = os.getenv("FINNHUB_API_KEY_BACKUP", "")
    
    TWELVEDATA_API_KEY: str = os.getenv("TWELVEDATA_API_KEY", "")
    TWELVEDATA_API_KEY_BACKUP: str = os.getenv("TWELVEDATA_API_KEY_BACKUP", "")
    
    POLYGON_API_KEY: str = os.getenv("POLYGON_API_KEY", "")
    POLYGON_API_KEY_BACKUP: str = os.getenv("POLYGON_API_KEY_BACKUP", "")
    
    ALPHAVANTAGE_API_KEY: str = os.getenv("ALPHAVANTAGE_API_KEY", "")
    ALPHAVANTAGE_API_KEY_BACKUP: str = os.getenv("ALPHAVANTAGE_API_KEY_BACKUP", "")
    
    MF_DATA_PROVIDER: str = os.getenv("MF_DATA_PROVIDER", "amfi")
    MF_DATA_API_KEY: str = os.getenv("MF_DATA_API_KEY", "")
    MF_DATA_API_KEY_BACKUP: str = os.getenv("MF_DATA_API_KEY_BACKUP", "")

    # Global Instrument Universe Provider Configuration (EODHD)
    EODHD_API_KEY: str = os.getenv("EODHD_API_KEY", "")
    EODHD_API_URL: str = os.getenv("EODHD_API_URL", "https://eodhd.com/api")
    UNIVERSE_SYNC_SECRET: str = os.getenv("UNIVERSE_SYNC_SECRET", "")
    
    MARKET_DATA_CACHE_TTL_SECONDS: int = int(os.getenv("MARKET_DATA_CACHE_TTL_SECONDS", "30"))
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    # CORS — always include local dev + Vercel production origin
    # BACKEND_CORS_ORIGINS env var can override as a JSON array string
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        env_val = os.getenv("BACKEND_CORS_ORIGINS", "")
        if env_val:
            try:
                parsed = json.loads(env_val)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
        # Default origins — always safe to include both dev and prod
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "https://smart-investment-strategic-advisor.vercel.app",
            "https://smartvest-backend.onrender.com",
        ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
