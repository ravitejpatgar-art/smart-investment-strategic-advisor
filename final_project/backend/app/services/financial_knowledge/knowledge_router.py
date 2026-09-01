"""
Financial Knowledge Router for SmartVest Universal Intelligence Engine.
Orchestrates entity resolution, concept retrieval, data source attribution,
and response validation.
"""

from typing import Dict, Any, List, Optional
from app.services.financial_knowledge.entity_resolver import (
    resolve_financial_entities,
    EntityType,
    ResolvedEntity
)
from app.services.financial_knowledge.concept_retriever import (
    retrieve_concept_explanation,
    synthesize_financial_concept
)
from app.services.financial_knowledge.validators import (
    verify_answer_relevance,
    validate_numerical_claims
)
from app.services.financial_knowledge.source_manager import (
    SourceType,
    create_source_entry
)

class FinancialKnowledgeRouter:
    """Unified routing layer for financial concepts, entities, and validation."""

    def resolve_entities(self, query: str) -> List[ResolvedEntity]:
        """Resolves all financial entities (instruments, concepts, amounts, dates) from query."""
        return resolve_financial_entities(query)

    def get_educational_knowledge(self, query: str, concept_id: Optional[str] = None) -> Dict[str, Any]:
        """Retrieves verified financial intelligence for educational queries."""
        return retrieve_concept_explanation(query, concept_id=concept_id)

    def validate_response(
        self,
        question: str,
        topic: str,
        answer: str,
        context_mode: str = "EDUCATIONAL"
    ) -> bool:
        """Validates that the answer matches the topic and contains no cashflow leaks."""
        is_valid, _ = verify_answer_relevance(question, topic, answer, context_mode)
        return is_valid

financial_knowledge_router = FinancialKnowledgeRouter()
