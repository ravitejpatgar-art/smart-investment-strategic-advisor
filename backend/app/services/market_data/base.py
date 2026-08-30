from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from app.services.market_data.freshness import DataFreshness

@dataclass
class ProviderCapabilities:
    name: str
    realtime: bool = False
    delayed: bool = True
    historical: bool = True
    mutual_funds_nav: bool = False
    fundamentals: bool = True
    commercial_display: bool = True
    api_key_required: bool = False
    is_configured: bool = True
    entitlement_verified: bool = False

class BaseMarketDataProvider(ABC):
    """
    Abstract base class for all SmartVest market data adapters.
    """
    def __init__(self, name: str, capabilities: ProviderCapabilities):
        self.name = name
        self.capabilities = capabilities

    @abstractmethod
    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Fetch normalized quote for a single instrument."""
        pass

    def get_quotes(self, symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """Fetch quotes for a batch of instruments."""
        results = {}
        for s in symbols:
            results[s] = self.get_quote(s)
        return results

    @abstractmethod
    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        """Fetch historical candle/observation series."""
        pass

    @abstractmethod
    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        """Fetch fundamental metrics (PE, PB, EPS, Market Cap, etc.)."""
        pass

    @abstractmethod
    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        """Fetch canonical instrument metadata."""
        pass
