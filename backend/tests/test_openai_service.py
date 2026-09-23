"""
Unit tests for VestIQ Hybrid OpenAI Service & Response Validation Guardrails.
Tests cover:
1. Missing API key detection
2. Configured API key detection
3. Mocked successful OpenAI Responses API call
4. AuthenticationError handling
5. RateLimitError handling
6. APITimeoutError handling
7. APIConnectionError handling
8. Deterministic IPO question causes ZERO OpenAI calls
9. Deterministic SIP calculation causes ZERO OpenAI calls
10. Complex macro question invokes OpenAI when configured
11. Ungrounded stock-price claim is rejected
12. Guaranteed-return claim is rejected
13. Missing market data never becomes fabricated data
"""

import pytest
from unittest.mock import MagicMock, patch

import openai
from openai import (
    AuthenticationError,
    RateLimitError,
    APITimeoutError,
    APIConnectionError,
    APIError,
)

from app.services.ai.openai_service import (
    is_openai_configured,
    get_openai_client,
    validate_openai_response,
    generate_openai_advisory,
    build_bounded_history,
)
from app.services.ai.conversation_engine import (
    process_conversational_query,
    is_complex_finance_synthesis,
)


# =====================================================================
# 1. Missing API Key Detection
# =====================================================================
def test_missing_api_key():
    """Verify that is_openai_configured returns False and generation fails cleanly when key is absent."""
    with patch("app.core.config.settings.OPENAI_API_KEY", ""), \
         patch.dict("os.environ", {"OPENAI_API_KEY": ""}, clear=True):
        assert is_openai_configured() is False
        res = generate_openai_advisory(query="Explain macroeconomic policy impact")
        assert res["success"] is False
        assert res["provider"] == "openai"
        assert res["error"] == "OPENAI_NOT_CONFIGURED"


# =====================================================================
# 2. Configured API Key Detection
# =====================================================================
def test_configured_api_key():
    """Verify that a valid non-placeholder API key is safely detected as configured."""
    dummy_key = "sk-test-proj-1234567890abcdefghijklmnopqrstuvwxyz"
    with patch("app.core.config.settings.OPENAI_API_KEY", dummy_key):
        assert is_openai_configured() is True

    # Placeholder keys should be treated as unconfigured
    with patch("app.core.config.settings.OPENAI_API_KEY", "your-openai-api-key"):
        assert is_openai_configured() is False


# =====================================================================
# 3. Mocked Successful OpenAI Responses API Call
# =====================================================================
def test_mocked_successful_openai_response():
    """Verify that modern client.responses.create(...) is called and output text is properly parsed."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.output_text = (
        "Inflation, interest rates, and currency movements interact dynamically to affect long-term equity portfolios. "
        "Rising inflation generally prompts central banks to hike benchmark policy rates, which increases discount rates for equities."
    )
    mock_client.responses.create.return_value = mock_response

    res = generate_openai_advisory(
        query="Explain how inflation, interest rates, currency movements and economic growth can interact to affect a long-term equity portfolio.",
        client=mock_client,
    )

    assert res["success"] is True
    assert res["provider"] == "openai"
    assert "Inflation, interest rates, and currency movements interact" in res["answer"]
    assert res["error"] is None
    assert mock_client.responses.create.called
    call_kwargs = mock_client.responses.create.call_args[1]
    assert call_kwargs["timeout"] == 15.0
    assert "instructions" in call_kwargs
    assert "input" in call_kwargs


# =====================================================================
# 4. AuthenticationError Handling
# =====================================================================
def test_authentication_error_handling():
    """Verify AuthenticationError returns a safe structured error without leaking secrets."""
    mock_client = MagicMock()
    mock_client.responses.create.side_effect = AuthenticationError(
        message="Incorrect API key provided",
        response=MagicMock(status_code=401),
        body={"error": {"message": "Invalid API key"}},
    )

    res = generate_openai_advisory(
        query="Explain macroeconomic policy",
        client=mock_client,
    )

    assert res["success"] is False
    assert res["provider"] == "openai"
    assert res["error"] == "OPENAI_AUTH_ERROR"
    assert res["answer"] == ""


# =====================================================================
# 5. RateLimitError Handling
# =====================================================================
def test_rate_limit_error_handling():
    """Verify RateLimitError returns safe structured error code."""
    mock_client = MagicMock()
    mock_client.responses.create.side_effect = RateLimitError(
        message="Rate limit reached for requests",
        response=MagicMock(status_code=429),
        body={"error": {"message": "Rate limit exceeded"}},
    )

    res = generate_openai_advisory(
        query="Explain market cycles",
        client=mock_client,
    )

    assert res["success"] is False
    assert res["provider"] == "openai"
    assert res["error"] == "OPENAI_RATE_LIMIT"
    assert res["answer"] == ""


# =====================================================================
# 6. APITimeoutError Handling
# =====================================================================
def test_timeout_error_handling():
    """Verify APITimeoutError (15-second timeout) returns OPENAI_TIMEOUT."""
    mock_client = MagicMock()
    mock_client.responses.create.side_effect = APITimeoutError(
        request=MagicMock()
    )

    res = generate_openai_advisory(
        query="Explain quantitative tightening",
        client=mock_client,
    )

    assert res["success"] is False
    assert res["provider"] == "openai"
    assert res["error"] == "OPENAI_TIMEOUT"
    assert res["answer"] == ""


# =====================================================================
# 7. APIConnectionError Handling
# =====================================================================
def test_connection_error_handling():
    """Verify APIConnectionError returns OPENAI_CONNECTION_ERROR."""
    mock_client = MagicMock()
    mock_client.responses.create.side_effect = APIConnectionError(
        request=MagicMock()
    )

    res = generate_openai_advisory(
        query="Explain foreign portfolio investments",
        client=mock_client,
    )

    assert res["success"] is False
    assert res["provider"] == "openai"
    assert res["error"] == "OPENAI_CONNECTION_ERROR"
    assert res["answer"] == ""


# =====================================================================
# 8. Deterministic IPO Question Causes ZERO OpenAI Calls
# =====================================================================
def test_deterministic_ipo_question_bypasses_openai():
    """Verify that 'What is an IPO?' is answered purely deterministically with zero OpenAI calls."""
    with patch("app.services.ai.conversation_engine.generate_openai_advisory") as mock_openai, \
         patch("app.services.ai.openai_service.generate_openai_advisory") as mock_openai_direct:

        res = process_conversational_query("What is an IPO?")

        assert mock_openai.called is False
        assert mock_openai_direct.called is False
        assert res.get("provider") == "deterministic"
        assert "Initial Public Offering" in res.get("answer", "") or "IPO" in res.get("answer", "")


# =====================================================================
# 9. Deterministic SIP Calculation Causes ZERO OpenAI Calls
# =====================================================================
def test_deterministic_sip_calculation_bypasses_openai():
    """Verify that 'Calculate SIP of ₹5000 for 10 years at 12%' causes ZERO OpenAI calls."""
    with patch("app.services.ai.conversation_engine.generate_openai_advisory") as mock_openai, \
         patch("app.services.ai.openai_service.generate_openai_advisory") as mock_openai_direct:

        res = process_conversational_query("Calculate SIP of ₹5000 for 10 years at 12%.")

        assert mock_openai.called is False
        assert mock_openai_direct.called is False
        assert res.get("provider") == "deterministic"
        # Verify deterministic SIP calculation was executed
        assert res.get("calculations") is not None
        assert "future_value" in res.get("calculations", {}) or "total_invested" in res.get("calculations", {}) or "futureValue" in str(res)


# =====================================================================
# 10. Complex Macro Question Invokes OpenAI When Configured
# =====================================================================
def test_complex_macro_question_invokes_openai():
    """Verify that open-ended macroeconomic queries trigger the OpenAI path when configured."""
    query = "Explain how inflation, interest rates, currency movements and economic growth can interact to affect a long-term equity portfolio."

    mock_openai_res = {
        "success": True,
        "provider": "openai",
        "answer": "Macro factors interact across several key transmission channels: interest rate discounting, margin compression, and currency translation.",
        "model": "gpt-5.5",
        "citations": ["SmartVest Fiduciary Reasoning", "OpenAI gpt-5.5"],
        "disclaimer": "SmartVest VestIQ provides educational analysis.",
        "data_available": True,
        "confidence": "HIGH",
    }

    with patch("app.services.ai.conversation_engine.is_openai_configured", return_value=True), \
         patch("app.services.ai.conversation_engine.generate_openai_advisory", return_value=mock_openai_res) as mock_advisory:

        res = process_conversational_query(query)

        assert mock_advisory.called is True
        assert res["provider"] == "openai"
        assert "Macro factors interact" in res["answer"]


# =====================================================================
# 11. Ungrounded Stock-Price Claim is Rejected
# =====================================================================
def test_ungrounded_stock_price_rejected():
    """Layer 2 Validator must reject fabricated current prices when market data is not supplied."""
    fabricated_text = "Reliance Industries is currently trading at ₹3,250.50 per share in today's session."

    # Validation with NO verified price in market facts
    val = validate_openai_response(
        text=fabricated_text,
        query="What is RELIANCE price?",
        market_facts={"symbol": "RELIANCE", "price": None, "source": None}
    )

    assert val["valid"] is False
    assert len(val["issues"]) > 0
    assert any("Ungrounded live price claim" in issue for issue in val["issues"])


# =====================================================================
# 12. Guaranteed-Return Claim is Rejected
# =====================================================================
def test_guaranteed_return_claim_rejected():
    """Layer 1 Validator must reject claims promising guaranteed returns or risk-free equity profits."""
    unsafe_text = (
        "You can expect a guaranteed return of 25% every year by investing in high-beta equities. "
        "This is a 100% risk-free stock strategy."
    )

    val = validate_openai_response(
        text=unsafe_text,
        query="Can you guarantee that this stock will return 20% every year?"
    )

    assert val["valid"] is False
    assert len(val["issues"]) >= 1
    assert any("Prohibited claim detected" in issue for issue in val["issues"])


# =====================================================================
# 13. Missing Market Data Never Becomes Fabricated Data
# =====================================================================
def test_missing_market_data_never_fabricated():
    """If market facts are missing/null, an OpenAI response asserting a live quote is rejected and returns failure."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.output_text = "The live price is ₹2,890.00 right now."
    mock_client.responses.create.return_value = mock_response

    res = generate_openai_advisory(
        query="What is RELIANCE price?",
        market_facts={"symbol": "RELIANCE", "price": None, "source": None},
        client=mock_client
    )

    # Must be rejected by validation
    assert res["success"] is False
    assert res["error"] == "VALIDATION_FAILED"
    assert "issues" in res
    assert res["answer"] == ""
