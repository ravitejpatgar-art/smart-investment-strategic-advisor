from typing import Dict, Any
from app.services.market_data.registry import market_registry

def get_market_intelligence_data() -> Dict[str, Any]:
    """
    Global Market Intelligence Center routing through MarketDataProviderRegistry.
    """
    return market_registry.get_market_overview()
