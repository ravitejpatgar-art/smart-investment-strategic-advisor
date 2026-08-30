"""
Source & Freshness Manager for SmartVest Universal Intelligence Engine.
Attaches clear data provenance tags and freshness metadata to all assistant responses.
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from dataclasses import dataclass, asdict

class SourceType(str, Enum):
    KNOWN_STATIC_FACT = "KNOWN_STATIC_FACT"
    CURRENT_MARKET_DATA = "CURRENT_MARKET_DATA"
    USER_CALCULATION = "USER_CALCULATION"
    MODEL_ASSUMPTION = "MODEL_ASSUMPTION"

@dataclass
class SourceMetadata:
    source_type: SourceType
    provider: str
    description: str
    as_of: str
    is_live: bool = False
    details: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["source_type"] = self.source_type.value
        return d

def create_source_entry(
    source_type: SourceType,
    provider: str,
    description: str,
    is_live: bool = False,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Generates standard source metadata entry."""
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    entry = SourceMetadata(
        source_type=source_type,
        provider=provider,
        description=description,
        as_of=now_str,
        is_live=is_live,
        details=details or {}
    )
    return entry.to_dict()
