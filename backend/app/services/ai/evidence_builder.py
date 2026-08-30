"""
SmartVest Evidence Builder
==========================
Constructs verified, deterministic internal evidence objects before response planning.
Ensures the LLM is explaining verified facts/calculations rather than inventing them.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone

@dataclass
class EvidenceFact:
    field: str
    value: Any
    source: str
    as_of: str
    freshness: str = "REALTIME"

@dataclass
class RecommendationEvidenceRecord:
    symbol: str
    assetType: str
    riskFit: str
    goalFit: str
    horizonFit: str
    portfolioFit: str
    diversificationBenefit: str
    costScore: float
    volatility: str
    quality: str
    marketData: Dict[str, Any]
    risks: List[str]
    assumptions: List[str]
    source: str
    timestamp: str
    whySelected: str = ""
    whyNotSelected: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "symbol": self.symbol,
            "assetType": self.assetType,
            "riskFit": self.riskFit,
            "goalFit": self.goalFit,
            "horizonFit": self.horizonFit,
            "portfolioFit": self.portfolioFit,
            "diversificationBenefit": self.diversificationBenefit,
            "costScore": self.costScore,
            "volatility": self.volatility,
            "quality": self.quality,
            "marketData": self.marketData,
            "risks": self.risks,
            "assumptions": self.assumptions,
            "source": self.source,
            "timestamp": self.timestamp,
            "whySelected": self.whySelected,
            "whyNotSelected": self.whyNotSelected
        }

@dataclass
class EvidenceObject:
    task: str
    entities: List[Dict[str, Any]] = field(default_factory=list)
    facts: List[EvidenceFact] = field(default_factory=list)
    calculations: Dict[str, Any] = field(default_factory=dict)
    suitability: Dict[str, Any] = field(default_factory=dict)
    assumptions: List[str] = field(default_factory=list)
    sources: List[Dict[str, Any]] = field(default_factory=list)
    recommendation_evidence: List[RecommendationEvidenceRecord] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task": self.task,
            "entities": self.entities,
            "facts": [
                {
                    "field": f.field,
                    "value": f.value,
                    "source": f.source,
                    "asOf": f.as_of,
                    "freshness": f.freshness
                }
                for f in self.facts
            ],
            "calculations": self.calculations,
            "suitability": self.suitability,
            "assumptions": self.assumptions,
            "sources": self.sources,
            "recommendationEvidence": [r.to_dict() for r in self.recommendation_evidence]
        }

def build_evidence(
    task: str,
    entities: List[Dict[str, Any]],
    facts: Optional[List[EvidenceFact]] = None,
    calculations: Optional[Dict[str, Any]] = None,
    suitability: Optional[Dict[str, Any]] = None,
    assumptions: Optional[List[str]] = None,
    sources: Optional[List[Dict[str, Any]]] = None,
    recommendation_evidence: Optional[List[RecommendationEvidenceRecord]] = None
) -> EvidenceObject:
    """
    Constructs an immutable EvidenceObject.
    """
    return EvidenceObject(
        task=task,
        entities=entities or [],
        facts=facts or [],
        calculations=calculations or {},
        suitability=suitability or {},
        assumptions=assumptions or [],
        sources=sources or [],
        recommendation_evidence=recommendation_evidence or []
    )
