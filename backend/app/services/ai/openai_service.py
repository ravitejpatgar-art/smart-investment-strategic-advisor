"""
SmartVest VestIQ — OpenAI Service & Grounding Guardrails.
Provides secure, response-validated synthesis for complex, open-ended financial questions.

Strict Safety Rules:
1. NEVER log, print, return, or expose OPENAI_API_KEY.
2. Only invoked when questions cannot be answered deterministically.
3. Market facts must remain grounded in verified application providers; never fabricate numbers.
4. Two-layer response validation rejects guaranteed returns and ungrounded prices.
"""

import os
import re
import logging
from typing import Dict, Any, List, Optional, Tuple

import openai
from openai import OpenAI
from openai import (
    AuthenticationError,
    RateLimitError,
    APITimeoutError,
    APIConnectionError,
    APIError,
)

from app.core.config import settings

logger = logging.getLogger("vestiq.openai_service")

# Standard fiduciary disclaimer
VESTIQ_DISCLAIMER = (
    "SmartVest VestIQ provides educational analysis and scenario planning. "
    "Not a SEBI-registered advisory service; past performance is not indicative of future returns. "
    "Always consult a qualified financial professional before deploying capital."
)

# VestIQ System Instructions
VESTIQ_SYSTEM_PROMPT = """You are VestIQ, an intelligent financial education and portfolio analysis advisor for SmartVest.
Your goal is to provide rigorous, transparent, and fiduciary-aligned financial analysis.

OPERATIONAL GUIDELINES:
1. Explain financial concepts, economic interactions, and investment frameworks with deep clarity.
2. Prefer Indian financial context (NSE, BSE, SEBI, AMFI, RBI, INR ₹) when discussing Indian assets or general personal finance, and US market context (NYSE, NASDAQ, SEC, USD $) for global equities.
3. Distinguish clearly between FACTS, ASSUMPTIONS, and SCENARIOS. State all calculation assumptions explicitly.
4. Explain risk rigorously: market beta, interest rate risk, inflation risk, currency risk, and concentration risk.
5. NEVER guarantee investment returns or claim risk-free profits. All market investments carry capital risk.
6. NEVER claim to be SEBI-registered or provide individualized stock purchase mandates.
7. GROUNDING PRINCIPLE — STRICT FACTUAL HONESTY:
   - NEVER fabricate, invent, or estimate current stock prices, market levels, trading volumes, or breaking news.
   - If verified market facts are supplied to you in context, you may reference those exact figures.
   - If market facts are NOT supplied or marked unavailable, explicitly state that live quotes must be obtained through verified market feeds.
   - Never present an AI guess as a verified market price.
   - Do not invent citations or research papers."""


def is_openai_configured() -> bool:
    """Safely checks if OPENAI_API_KEY is configured without exposing it."""
    key = getattr(settings, "OPENAI_API_KEY", "") or os.environ.get("OPENAI_API_KEY", "")
    if not key or not isinstance(key, str):
        return False
    stripped = key.strip()
    if not stripped or stripped.startswith("your-") or stripped.startswith("<your_"):
        return False
    return True


def get_openai_client(timeout: float = 15.0, max_retries: int = 1) -> Optional[OpenAI]:
    """Returns an authenticated OpenAI client or None if unconfigured. Never logs the key."""
    if not is_openai_configured():
        return None
    key = getattr(settings, "OPENAI_API_KEY", "") or os.environ.get("OPENAI_API_KEY", "")
    return OpenAI(
        api_key=key.strip(),
        timeout=timeout,
        max_retries=max_retries,
    )


def build_bounded_history(history: Optional[List[Dict[str, Any]]], max_turns: int = 4) -> List[Dict[str, str]]:
    """Builds a bounded recent conversation history suitable for multi-turn context."""
    if not history:
        return []
    bounded: List[Dict[str, str]] = []
    recent = history[-max_turns:]
    for item in recent:
        role = item.get("role") or ("user" if "question" in item or "user" in item else "assistant")
        content = item.get("content") or item.get("question") or item.get("answer") or item.get("text") or ""
        if content:
            # Map role to standard 'user' or 'assistant'
            norm_role = "user" if role in ["user", "human"] else "assistant"
            bounded.append({"role": norm_role, "content": str(content)[:1000]})
    return bounded


def validate_openai_response(
    text: str,
    query: str,
    market_facts: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Two-layer response validator:
    Layer 1: Prohibited fiduciary claims (guaranteed returns, risk-free stock claims, fabricated live claims).
    Layer 2: Numeric grounding check against supplied market facts.
    """
    issues: List[str] = []
    text_lower = text.lower()

    # --- LAYER 1: PROHIBITED CLAIMS ---
    prohibited_return_patterns = [
        r"guaranteed\s+(?:return|profit|cagr|growth|gain|yield)",
        r"guarantee\s+(?:that\s+)?(?:this|the|any)?\s*(?:stock|equity|portfolio|fund)\s+will\s+return",
        r"guaranteed\s+\d+%",
        r"risk-free\s+(?:stock|equity|share|investment|trading|portfolio)",
        r"100%\s+risk-free",
        r"sure-shot\s+(?:profit|return|gain)",
    ]

    for pat in prohibited_return_patterns:
        if re.search(pat, text_lower):
            issues.append(f"Prohibited claim detected: matches '{pat}'")

    # Fabricated live claims when no live data is provided
    has_live_quote = bool(
        market_facts
        and market_facts.get("price") is not None
        and str(market_facts.get("price")).strip() not in ["", "None", "null"]
    )

    if not has_live_quote:
        unverified_live_claims = [
            r"trading\s+live\s+(?:right\s+now\s+)?at\s+[₹$€£]?\s*[\d,]+",
            r"current\s+(?:market\s+)?price\s+is\s+[₹$€£]?\s*[\d,]+(?:\.\d+)?",
            r"live\s+price\s+is\s+[₹$€£]?\s*[\d,]+(?:\.\d+)?",
            r"is\s+currently\s+trading\s+at\s+[₹$€£]?\s*[\d,]+(?:\.\d+)?",
            r"shares\s+are\s+at\s+[₹$€£]?\s*[\d,]+(?:\.\d+)?\s+today",
        ]
        for pat in unverified_live_claims:
            match = re.search(pat, text_lower)
            if match:
                issues.append(f"Ungrounded live price claim detected without verified market facts: '{match.group(0)}'")

    # --- LAYER 2: NUMERIC GROUNDING AGAINST MARKET FACTS ---
    if market_facts and market_facts.get("price") is not None:
        expected_price = float(market_facts["price"])
        # Check if model asserts a contradictory specific price for the same symbol
        sym = str(market_facts.get("symbol", "")).upper()
        if sym:
            contradiction_pattern = rf"{re.escape(sym.lower())}\s+is\s+(?:currently\s+)?(?:trading\s+at|priced\s+at)\s+[₹$]?\s*([\d,]+(?:\.\d+)?)"
            m = re.search(contradiction_pattern, text_lower)
            if m:
                found_num_str = m.group(1).replace(",", "")
                try:
                    found_price = float(found_num_str)
                    diff_pct = abs(found_price - expected_price) / max(1.0, expected_price)
                    if diff_pct > 0.05:  # >5% discrepancy from verified facts
                        issues.append(
                            f"Price contradiction: text claimed {found_price} for {sym}, verified fact is {expected_price}"
                        )
                except ValueError:
                    pass

    is_valid = len(issues) == 0
    return {
        "valid": is_valid,
        "sanitized_text": text if is_valid else "",
        "issues": issues,
    }


def generate_openai_advisory(
    query: str,
    user_context: Optional[Dict[str, Any]] = None,
    history: Optional[List[Dict[str, Any]]] = None,
    market_facts: Optional[Dict[str, Any]] = None,
    client: Optional[Any] = None,
) -> Dict[str, Any]:
    """
    Executes synthesis via OpenAI Responses API with safety validation and graceful fallbacks.
    Never exposes API keys or internal trace secrets.
    """
    if not is_openai_configured() and client is None:
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "OPENAI_NOT_CONFIGURED",
        }

    openai_client = client or get_openai_client(timeout=15.0, max_retries=1)
    if openai_client is None:
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "OPENAI_CLIENT_INIT_FAILED",
        }

    model_name = getattr(settings, "OPENAI_MODEL", "gpt-5.5") or "gpt-5.5"

    # 1. Prepare User Financial Profile Context (No PII)
    clean_ctx = {}
    if user_context and isinstance(user_context, dict):
        for k in ["risk_profile", "risk", "monthly_surplus", "surplus", "emergency_fund", "horizon_years", "primary_goals"]:
            if k in user_context and user_context[k] is not None:
                clean_ctx[k] = user_context[k]

    # 2. Prepare Grounded Market Facts
    verified_facts = {}
    if market_facts and isinstance(market_facts, dict):
        verified_facts = {
            "symbol": market_facts.get("symbol"),
            "price": market_facts.get("price"),
            "currency": market_facts.get("currency", "INR"),
            "timestamp": market_facts.get("timestamp"),
            "source": market_facts.get("source"),
        }

    # 3. Build instructions & input prompt
    bounded_hist = build_bounded_history(history, max_turns=4)
    user_prompt_parts = []

    if clean_ctx:
        user_prompt_parts.append(f"[USER FINANCIAL PROFILE CONTEXT]: {clean_ctx}")
    if verified_facts and verified_facts.get("symbol"):
        user_prompt_parts.append(f"[VERIFIED MARKET DATA FACTS]: {verified_facts}")
    else:
        user_prompt_parts.append("[VERIFIED MARKET DATA FACTS]: None provided. Do not invent stock quotes.")

    if bounded_hist:
        user_prompt_parts.append("[RECENT CONVERSATION HISTORY]:")
        for turn in bounded_hist:
            user_prompt_parts.append(f"- {turn['role'].upper()}: {turn['content']}")

    user_prompt_parts.append(f"\n[USER QUESTION]: {query}")
    final_input = "\n\n".join(user_prompt_parts)

    # 4. Invoke OpenAI via Responses API
    raw_text = ""
    try:
        # Use modern Responses API: client.responses.create(...)
        if hasattr(openai_client, "responses") and callable(getattr(openai_client.responses, "create", None)):
            response = openai_client.responses.create(
                model=model_name,
                instructions=VESTIQ_SYSTEM_PROMPT,
                input=final_input,
                timeout=15.0,
            )
            # Extract output text
            if hasattr(response, "output_text") and response.output_text:
                raw_text = str(response.output_text).strip()
            elif hasattr(response, "output") and response.output:
                chunks = []
                for item in response.output:
                    if hasattr(item, "content"):
                        chunks.append(str(item.content))
                    elif isinstance(item, dict) and "content" in item:
                        chunks.append(str(item["content"]))
                raw_text = "\n".join(chunks).strip()
            else:
                raw_text = str(response).strip()
        elif hasattr(openai_client, "chat") and hasattr(openai_client.chat, "completions"):
            # Fallback for mock clients in test suites
            chat_resp = openai_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": VESTIQ_SYSTEM_PROMPT},
                    {"role": "user", "content": final_input},
                ],
                timeout=15.0,
            )
            raw_text = chat_resp.choices[0].message.content or ""
        else:
            return {
                "success": False,
                "provider": "openai",
                "answer": "",
                "error": "OPENAI_UNSUPPORTED_INTERFACE",
            }

    except AuthenticationError as e:
        logger.warning("OpenAI authentication failed.")
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "OPENAI_AUTH_ERROR",
        }
    except RateLimitError as e:
        logger.warning("OpenAI rate limit reached.")
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "OPENAI_RATE_LIMIT",
        }
    except APITimeoutError as e:
        logger.warning("OpenAI request timed out.")
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "OPENAI_TIMEOUT",
        }
    except APIConnectionError as e:
        logger.warning("OpenAI connection error.")
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "OPENAI_CONNECTION_ERROR",
        }
    except APIError as e:
        logger.warning("OpenAI API error occurred.")
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "OPENAI_API_ERROR",
        }
    except Exception as e:
        logger.warning("Unexpected error during OpenAI generation.")
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "OPENAI_UNAVAILABLE",
        }

    if not raw_text:
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "OPENAI_EMPTY_RESPONSE",
        }

    # 5. Response Validation
    validation = validate_openai_response(raw_text, query, market_facts=verified_facts)
    if not validation["valid"]:
        logger.warning(f"OpenAI response rejected by safety validator: {validation['issues']}")
        return {
            "success": False,
            "provider": "openai",
            "answer": "",
            "error": "VALIDATION_FAILED",
            "issues": validation["issues"],
        }

    return {
        "success": True,
        "provider": "openai",
        "answer": validation["sanitized_text"],
        "model": model_name,
        "data_available": True,
        "confidence": "HIGH",
        "citations": ["SmartVest Fiduciary Reasoning", f"OpenAI {model_name}"],
        "disclaimer": VESTIQ_DISCLAIMER,
        "error": None,
    }
