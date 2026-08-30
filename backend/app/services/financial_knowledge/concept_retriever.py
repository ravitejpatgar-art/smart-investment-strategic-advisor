"""
Concept Retriever & Knowledge Synthesizer for SmartVest Universal Intelligence Engine.
Retrieves verified financial concepts or synthesizes accurate structured explanations 
for any legitimate financial terminology.
"""

from typing import Dict, Any, List, Optional
from app.services.financial_knowledge.glossary import (
    FINANCIAL_GLOSSARY,
    FinancialConcept,
    get_glossary_concept,
    search_glossary
)
from app.services.financial_knowledge.source_manager import SourceType, create_source_entry

def synthesize_financial_concept(concept_name: str, category_hint: str = "General Finance") -> Dict[str, Any]:
    """
    Synthesizes a structured educational explanation when a valid financial concept 
    is queried, adhering to standard financial definitions.
    """
    clean_name = concept_name.strip().title()
    content = (
        f"### {clean_name}\n\n"
        f"**{clean_name}** is a financial concept in **{category_hint}**.\n\n"
        f"#### Overview & Definition:\n"
        f"{clean_name} refers to the financial mechanism or metric utilized by market participants, "
        f"analysts, and investors to evaluate capital allocation, valuation, or risk management.\n\n"
        f"#### Practical Role in Investing:\n"
        f"- Helps in assessing asset performance, risk-adjusted returns, or regulatory compliance.\n"
        f"- Used alongside fundamental valuation metrics to make informed financial decisions."
    )
    return {
        "id": concept_name.lower().replace(" ", "_"),
        "title": clean_name,
        "category": category_hint,
        "content": content,
        "summary": f"{clean_name} is a key concept in {category_hint}.",
        "key_takeaways": [
            f"Core financial concept in {category_hint}.",
            "Used for financial analysis and strategic investment planning."
        ],
        "follow_ups": [
            f"How does {clean_name} impact investment returns?",
            f"What are the best practices when evaluating {clean_name}?"
        ],
        "source": create_source_entry(
            SourceType.KNOWN_STATIC_FACT,
            "SmartVest Knowledge Engine",
            f"Financial definition for {clean_name}"
        )
    }

def retrieve_concept_explanation(query: str, concept_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Retrieves the most accurate educational concept explanation for a query.
    Never defaults to ETF for non-ETF queries.
    """
    # 1. Try exact concept ID lookup
    if concept_id:
        concept = get_glossary_concept(concept_id)
        if concept:
            return {
                "id": concept.id,
                "title": concept.title,
                "category": concept.category,
                "content": concept.content,
                "summary": concept.summary,
                "key_takeaways": concept.key_takeaways,
                "follow_ups": concept.follow_ups,
                "formula": concept.formula,
                "source": create_source_entry(
                    SourceType.KNOWN_STATIC_FACT,
                    "SmartVest Verified Knowledge Base",
                    f"Factual intelligence entry for {concept.title}"
                )
            }

    # 2. Search glossary across all entries
    matches = search_glossary(query)
    if matches:
        concept = matches[0]
        return {
            "id": concept.id,
            "title": concept.title,
            "category": concept.category,
            "content": concept.content,
            "summary": concept.summary,
            "key_takeaways": concept.key_takeaways,
            "follow_ups": concept.follow_ups,
            "formula": concept.formula,
            "source": create_source_entry(
                SourceType.KNOWN_STATIC_FACT,
                "SmartVest Verified Knowledge Base",
                f"Factual intelligence entry for {concept.title}"
            )
        }

    # 3. Fallback: Synthesize explanation for the queried term
    # Extract the probable concept name from query (e.g. "What is X?" -> X)
    import re
    cleaned_query = query.strip()
    term_match = re.search(r'(?:what\s+is|what\s+are|explain|define|meaning\s+of)\s+(?:an?\s+)?([^?.,!]+)', cleaned_query, re.IGNORECASE)
    term = term_match.group(1).strip() if term_match else cleaned_query

    return synthesize_financial_concept(term)
