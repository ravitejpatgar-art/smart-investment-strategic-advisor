import time
import json
import threading
from typing import Dict, Any, Optional, Callable
from collections import OrderedDict
from app.services.market_data.freshness import DataFreshness
from app.core.config import settings

class MarketDataCache:
    """
    Thread-safe dual-backend (Redis + bounded in-memory LRU fallback) cache for market quotes,
    candles, fundamentals, and NAV.
    Supports TTL policies, bounded capacity eviction, stale fallback, and metrics telemetry.
    """
    _instance = None
    _lock = threading.Lock()
    MAX_IN_MEMORY_ENTRIES = 5000

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MarketDataCache, cls).__new__(cls)
                cls._instance._store = OrderedDict()
                cls._instance._store_lock = threading.Lock()
                cls._instance._redis = None
                cls._instance._hits = 0
                cls._instance._misses = 0
                cls._instance._sets = 0
                cls._instance._evictions = 0
                cls._instance._init_redis()
            return cls._instance

    def _init_redis(self):
        """Attempt to connect to Redis if configured in settings."""
        if getattr(settings, "REDIS_URL", None):
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
                    with self._store_lock:
                        self._hits += 1
                    return dict(val)
            except Exception:
                pass

        with self._store_lock:
            item = self._store.get(key)
            if not item:
                self._misses += 1
                return None
            
            now = time.time()
            val = item["value"]
            expires_at = item["expires_at"]
            
            if now <= expires_at:
                # Move to end (LRU touch)
                self._store.move_to_end(key)
                self._hits += 1
                return dict(val)
            
            if allow_stale:
                self._hits += 1
                stale_val = dict(val)
                stale_val["freshness"] = DataFreshness.STALE.value
                stale_val["isStale"] = True
                return stale_val
            
            self._misses += 1
            return None

    def set(self, key: str, value: Dict[str, Any], ttl_seconds: Optional[int] = None) -> None:
        actual_ttl = ttl_seconds if ttl_seconds is not None else getattr(settings, "MARKET_DATA_CACHE_TTL_SECONDS", 30)

        if self._redis is not None:
            try:
                self._redis.setex(key, actual_ttl, json.dumps(value))
            except Exception:
                pass

        with self._store_lock:
            now = time.time()
            # Bounded capacity eviction
            if len(self._store) >= self.MAX_IN_MEMORY_ENTRIES and key not in self._store:
                # First try to evict expired items
                expired_keys = [k for k, v in self._store.items() if now > v["expires_at"]]
                if expired_keys:
                    for ek in expired_keys[:100]:
                        self._store.pop(ek, None)
                        self._evictions += 1
                # If still at capacity, pop oldest (FIFO/LRU)
                if len(self._store) >= self.MAX_IN_MEMORY_ENTRIES:
                    self._store.popitem(last=False)
                    self._evictions += 1

            self._store[key] = {
                "value": value,
                "expires_at": now + actual_ttl,
                "cached_at": now
            }
            self._store.move_to_end(key)
            self._sets += 1

    def clear(self) -> None:
        with self._store_lock:
            self._store.clear()

    def size(self) -> int:
        with self._store_lock:
            return len(self._store)

    def get_stats(self) -> Dict[str, Any]:
        with self._store_lock:
            total_lookups = self._hits + self._misses
            hit_rate = round((self._hits / total_lookups * 100), 1) if total_lookups > 0 else 0.0
            return {
                "currentSize": len(self._store),
                "maxCapacity": self.MAX_IN_MEMORY_ENTRIES,
                "hits": self._hits,
                "misses": self._misses,
                "totalLookups": total_lookups,
                "hitRate": hit_rate,
                "totalSets": self._sets,
                "evictions": self._evictions,
                "redisConnected": self._redis is not None,
                "defaultTtlSeconds": getattr(settings, "MARKET_DATA_CACHE_TTL_SECONDS", 30)
            }

def get_user_cache_key(user_id: str, key_suffix: str) -> str:
    """Helper for user-scoped cache keys to prevent cross-user data exposure (Phase 29)."""
    return f"user:{user_id}:{key_suffix}"

# Global singleton instance
market_cache = MarketDataCache()
