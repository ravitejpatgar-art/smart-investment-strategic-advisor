import time
import json
import threading
from typing import Dict, Any, Optional, Callable
from app.services.market_data.freshness import DataFreshness
from app.core.config import settings

class MarketDataCache:
    """
    Thread-safe dual-backend (Redis + in-memory fallback) cache for market quotes,
    candles, fundamentals, and NAV.
    Supports TTL policies, stale fallback, and deduplication.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MarketDataCache, cls).__new__(cls)
                cls._instance._store = {}
                cls._instance._store_lock = threading.Lock()
                cls._instance._redis = None
                cls._instance._init_redis()
            return cls._instance

    def _init_redis(self):
        """Attempt to connect to Redis if configured in settings."""
        if settings.REDIS_URL:
            try:
                import redis
                self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=2)
                self._redis.ping()
            except Exception:
                self._redis = None

    def get(self, key: str, allow_stale: bool = False) -> Optional[Dict[str, Any]]:
        # Check Redis if active
        if self._redis is not None:
            try:
                val_raw = self._redis.get(key)
                if val_raw:
                    val = json.loads(val_raw)
                    return dict(val)
            except Exception:
                pass

        with self._store_lock:
            item = self._store.get(key)
            if not item:
                return None
            
            now = time.time()
            val = item["value"]
            expires_at = item["expires_at"]
            
            if now <= expires_at:
                return dict(val)
            
            if allow_stale:
                stale_val = dict(val)
                stale_val["freshness"] = DataFreshness.STALE.value
                stale_val["isStale"] = True
                return stale_val
            
            return None

    def set(self, key: str, value: Dict[str, Any], ttl_seconds: int = 30) -> None:
        if self._redis is not None:
            try:
                self._redis.setex(key, ttl_seconds, json.dumps(value))
            except Exception:
                pass

        with self._store_lock:
            self._store[key] = {
                "value": value,
                "expires_at": time.time() + ttl_seconds,
                "cached_at": time.time()
            }

    def clear(self) -> None:
        with self._store_lock:
            self._store.clear()

    def size(self) -> int:
        with self._store_lock:
            return len(self._store)

def get_user_cache_key(user_id: str, key_suffix: str) -> str:
    """Helper for user-scoped cache keys to prevent cross-user data exposure (Phase 29)."""
    return f"user:{user_id}:{key_suffix}"

# Global singleton instance
market_cache = MarketDataCache()
