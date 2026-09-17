"""
SmartVest P8 — Video Provider Factory
Resolves the active VideoGenerationProvider based on configuration or environment.
Defaults to 'mock'.
"""

import os
from typing import Optional
from .provider_base import VideoGenerationProvider
from .mock_provider import MockVideoProvider
from .gemini_script_provider import GeminiScriptProvider


def get_video_provider(provider_name: Optional[str] = None) -> VideoGenerationProvider:
    """
    Returns an instance of the configured video generation provider.
    Defaults to 'mock'.
    """
    resolved_name = (provider_name or os.environ.get("VIDEO_PROVIDER", "mock")).lower()

    if resolved_name == "mock":
        return MockVideoProvider()
    elif resolved_name == "wav2lip":
        from .wav2lip_provider import Wav2LipVideoProvider
        return Wav2LipVideoProvider()
    elif resolved_name in ("rewind", "heygen"):
        raise ValueError(
            f"Video provider '{resolved_name}' has been disabled and removed from the active pipeline. Supported providers: 'mock', 'wav2lip'"
        )
    elif resolved_name in ("veo", "gemini"):
        raise ValueError(
            f"Video provider '{resolved_name}' is not supported. Gemini is restricted strictly to free script and prompt generation only, not video generation. Veo and paid video APIs are prohibited."
        )
    else:
        raise ValueError(
            f"Unknown or unsupported video provider: '{resolved_name}'. Supported providers: 'mock', 'wav2lip'"
        )


def get_script_provider(provider_name: Optional[str] = None) -> GeminiScriptProvider:
    """
    Returns a script/storyboard generation provider.
    Supported: 'gemini' (strictly free-tier text/prompt generation only).
    """
    resolved_name = (provider_name or os.environ.get("SCRIPT_PROVIDER", "gemini")).lower()
    if resolved_name == "gemini":
        return GeminiScriptProvider()
    raise ValueError(
        f"Unsupported script provider: '{resolved_name}'. Supported provider: 'gemini'"
    )

