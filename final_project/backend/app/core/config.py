import os
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
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartvest.db")
    
    # AI Keys (Optional - has fallback intelligent engine)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Market Data Engine Configuration
    MARKET_DATA_MODE: str = os.getenv("MARKET_DATA_MODE", "REAL")  # REAL or MOCK
    MARKET_DATA_PROVIDER: str = os.getenv("MARKET_DATA_PROVIDER", "yfinance")
    MARKET_DATA_API_KEY: str = os.getenv("MARKET_DATA_API_KEY", "")
    
    INDIA_MARKET_DATA_PROVIDER: str = os.getenv("INDIA_MARKET_DATA_PROVIDER", "yfinance")
    INDIA_MARKET_DATA_API_KEY: str = os.getenv("INDIA_MARKET_DATA_API_KEY", "")
    
    US_MARKET_DATA_PROVIDER: str = os.getenv("US_MARKET_DATA_PROVIDER", "yfinance")
    US_MARKET_DATA_API_KEY: str = os.getenv("US_MARKET_DATA_API_KEY", "")
    
    MF_DATA_PROVIDER: str = os.getenv("MF_DATA_PROVIDER", "amfi")
    MF_DATA_API_KEY: str = os.getenv("MF_DATA_API_KEY", "")
    
    MARKET_DATA_CACHE_TTL_SECONDS: int = int(os.getenv("MARKET_DATA_CACHE_TTL_SECONDS", "30"))
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://smartvest-ai.onrender.com",
        "https://smartvest-frontend.onrender.com"
    ] if os.getenv("ENVIRONMENT") == "production" else [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
