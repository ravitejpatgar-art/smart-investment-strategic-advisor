"""
Financial Knowledge Package for SmartVest AI Universal Intelligence Engine.
"""

from app.services.financial_knowledge.glossary import (
    FINANCIAL_GLOSSARY,
    FinancialConcept,
    get_glossary_concept,
    search_glossary
)
from app.services.financial_knowledge.entity_resolver import (
    EntityType,
    ResolvedEntity,
    resolve_financial_entities,
    extract_currency_amounts,
    extract_time_horizons
)
from app.services.financial_knowledge.concept_retriever import (
    retrieve_concept_explanation,
    synthesize_financial_concept
)
from app.services.financial_knowledge.source_manager import (
    SourceType,
    SourceMetadata,
    create_source_entry
)
from app.services.financial_knowledge.validators import (
    verify_answer_relevance,
    validate_numerical_claims
)
from app.services.financial_knowledge.knowledge_router import (
    FinancialKnowledgeRouter,
    financial_knowledge_router
)

__all__ = [
    "FINANCIAL_GLOSSARY",
    "FinancialConcept",
    "get_glossary_concept",
    "search_glossary",
    "EntityType",
    "ResolvedEntity",
    "resolve_financial_entities",
    "extract_currency_amounts",
    "extract_time_horizons",
    "retrieve_concept_explanation",
    "synthesize_financial_concept",
    "SourceType",
    "SourceMetadata",
    "create_source_entry",
    "verify_answer_relevance",
    "validate_numerical_claims",
    "FinancialKnowledgeRouter",
    "financial_knowledge_router"
]
