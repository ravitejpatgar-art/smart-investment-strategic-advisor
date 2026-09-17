"""
SmartVest P8 — Video Pipeline Voice Manager
Dynamically inspects available edge-tts neural voices and deterministically selects the best natural
neural voice for each of the 8 production languages.
"""

import sys
import subprocess
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("video_pipeline.voice_manager")

# Deterministic default neural voice mappings for SmartVest Academy's 8 languages
DEFAULT_LANGUAGE_VOICES: Dict[str, Dict[str, str]] = {
    "en": {
        "language_name": "English",
        "primary_voice": "en-IN-PrabhatNeural",
        "fallback_voice": "en-IN-NeerjaNeural",
        "locale": "en-IN",
    },
    "hi": {
        "language_name": "Hindi",
        "primary_voice": "hi-IN-MadhurNeural",
        "fallback_voice": "hi-IN-SwaraNeural",
        "locale": "hi-IN",
    },
    "kn": {
        "language_name": "Kannada",
        "primary_voice": "kn-IN-GaganNeural",
        "fallback_voice": "kn-IN-SapnaNeural",
        "locale": "kn-IN",
    },
    "bn": {
        "language_name": "Bengali",
        "primary_voice": "bn-IN-BashkarNeural",
        "fallback_voice": "bn-IN-TanishaaNeural",
        "locale": "bn-IN",
    },
    "ml": {
        "language_name": "Malayalam",
        "primary_voice": "ml-IN-MidhunNeural",
        "fallback_voice": "ml-IN-SobhanaNeural",
        "locale": "ml-IN",
    },
    "mr": {
        "language_name": "Marathi",
        "primary_voice": "mr-IN-ManoharNeural",
        "fallback_voice": "mr-IN-AarohiNeural",
        "locale": "mr-IN",
    },
    "ta": {
        "language_name": "Tamil",
        "primary_voice": "ta-IN-ValluvarNeural",
        "fallback_voice": "ta-IN-PallaviNeural",
        "locale": "ta-IN",
    },
    "te": {
        "language_name": "Telugu",
        "primary_voice": "te-IN-MohanNeural",
        "fallback_voice": "te-IN-ShrutiNeural",
        "locale": "te-IN",
    },
}


class VoiceManager:
    """
    Manages deterministic voice selection and availability checks using free edge-tts.
    """

    _cached_available_voices = None

    @classmethod
    def get_available_voices(cls) -> Dict[str, str]:
        """
        Dynamically inspects available edge-tts voices using 'edge-tts --list-voices'.
        Caches the result to avoid redundant child process spawns.
        """
        if cls._cached_available_voices is not None:
            return cls._cached_available_voices

        available = {}
        try:
            proc = subprocess.run(
                [sys.executable, "-m", "edge_tts", "--list-voices"],
                capture_output=True,
                text=True,
                check=True,
            )
            for line in proc.stdout.splitlines():
                parts = line.strip().split()
                if len(parts) >= 2 and "Neural" in parts[0]:
                    voice_name = parts[0]
                    locale = parts[1] if len(parts) > 1 else ""
                    available[voice_name] = locale
        except Exception as e:
            logger.warning(f"Failed to inspect edge-tts voices dynamically: {e}. Using known defaults.")
            # Populate with defaults so offline testing still succeeds
            for cfg in DEFAULT_LANGUAGE_VOICES.values():
                available[cfg["primary_voice"]] = cfg["locale"]
                available[cfg["fallback_voice"]] = cfg["locale"]

        cls._cached_available_voices = available
        return cls._cached_available_voices

    @classmethod
    def get_voice_for_language(cls, language_code: str) -> str:
        """
        Deterministically selects and validates the natural neural voice for the given language code.
        """
        lang = language_code.lower().strip()
        cfg = DEFAULT_LANGUAGE_VOICES.get(lang)
        if not cfg:
            raise ValueError(
                f"Unsupported language code '{language_code}'. "
                f"Supported: {list(DEFAULT_LANGUAGE_VOICES.keys())}"
            )

        available = cls.get_available_voices()
        primary = cfg["primary_voice"]
        fallback = cfg["fallback_voice"]

        if primary in available:
            return primary
        elif fallback in available:
            logger.info(f"Primary voice '{primary}' not available, using fallback '{fallback}'.")
            return fallback
        else:
            # If dynamic check did not list it, return primary deterministically
            return primary

    @classmethod
    def get_language_name(cls, language_code: str) -> str:
        """Returns the human-readable English name of the language."""
        lang = language_code.lower().strip()
        cfg = DEFAULT_LANGUAGE_VOICES.get(lang)
        return cfg["language_name"] if cfg else language_code.upper()
