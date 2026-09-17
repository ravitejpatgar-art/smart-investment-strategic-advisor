"""
SmartVest P8 — Video Duration Calculator & Policy Enforcement
Calculates variable video duration based on educational narration content length.
Enforces SmartVest P8 variable duration policy:
- Minimum duration: 60.0 seconds
- Normal lessons: approximately 90–120 seconds
- Detailed lessons: up to 180.0 seconds
- Maximum duration: 180.0 seconds
- Approximate speaking speed: 140–160 words per minute (default 150 WPM)
- Formula: duration_seconds = (word_count / speaking_words_per_minute) * 60
- Actual generated audio duration is the final source of truth.
- Zero padding with silence, zero artificial sentence repetition, zero truncation.
"""

import re
from typing import Optional, Tuple, List, Dict, Any

# Policy constants
MIN_DURATION_SEC = 60.0
MAX_DURATION_SEC = 180.0
DEFAULT_SPEAKING_WPM = 150.0  # 140-160 WPM acceptable range
MIN_SPEAKING_WPM = 140.0
MAX_SPEAKING_WPM = 160.0


def count_words(text: str) -> int:
    """
    Accurately counts spoken words in a script text, ignoring punctuation and markdown formatting.
    """
    if not text:
        return 0
    # Strip markdown/tags if any, keep alphanumeric words
    words = re.findall(r"\b\w+[\w'-]*\b", text)
    return len(words)


def calculate_duration_from_text(
    text: str,
    speaking_wpm: float = DEFAULT_SPEAKING_WPM,
    min_sec: float = MIN_DURATION_SEC,
    max_sec: float = MAX_DURATION_SEC,
) -> Dict[str, Any]:
    """
    Calculates estimated duration in seconds based on narration word count and speaking rate.
    Applies the [60.0s, 180.0s] policy clamp.

    Returns a dictionary with:
    - word_count: total spoken words
    - speaking_wpm: rate used
    - raw_duration_sec: unconstrained duration
    - clamped_duration_sec: duration clamped to [min_sec, max_sec]
    - is_clamped_min: True if clamped to minimum
    - is_clamped_max: True if clamped to maximum
    - category: 'short/intro' (60-90s), 'normal' (90-120s), 'detailed' (120-180s)
    """
    words = count_words(text)
    wpm = max(MIN_SPEAKING_WPM, min(MAX_SPEAKING_WPM, speaking_wpm))
    raw_duration = (words / wpm) * 60.0 if words > 0 else 0.0

    clamped_duration = max(min_sec, min(max_sec, raw_duration))

    # Categorize lesson scale
    if clamped_duration < 90.0:
        category = "short_minimum"
    elif clamped_duration <= 125.0:
        category = "normal"
    else:
        category = "detailed"

    return {
        "word_count": words,
        "speaking_wpm": wpm,
        "raw_duration_sec": round(raw_duration, 2),
        "clamped_duration_sec": round(clamped_duration, 2),
        "is_clamped_min": raw_duration < min_sec,
        "is_clamped_max": raw_duration > max_sec,
        "category": category,
    }


def resolve_final_duration(
    audio_duration_sec: Optional[float],
    estimated_duration_sec: float,
    min_sec: float = MIN_DURATION_SEC,
    max_sec: float = MAX_DURATION_SEC,
) -> float:
    """
    Resolves the final video duration.
    The actual generated audio narration duration is the final source of truth.
    If audio duration is provided and valid, it clamps to [min_sec, max_sec].
    Otherwise falls back to estimated duration.
    """
    if audio_duration_sec is not None and audio_duration_sec > 0.0:
        return round(max(min_sec, min(max_sec, audio_duration_sec)), 2)
    return round(max(min_sec, min(max_sec, estimated_duration_sec)), 2)


def validate_duration_policy(
    duration_sec: float,
    min_sec: float = MIN_DURATION_SEC,
    max_sec: float = MAX_DURATION_SEC,
) -> Tuple[bool, str]:
    """
    Validates that a video duration satisfies the SmartVest P8 variable duration policy.
    """
    if duration_sec < min_sec:
        return False, f"Duration {duration_sec:.1f}s is below minimum policy threshold of {min_sec:.1f}s."
    if duration_sec > max_sec:
        return False, f"Duration {duration_sec:.1f}s exceeds maximum policy threshold of {max_sec:.1f}s."
    return True, f"Duration {duration_sec:.1f}s is valid within [{min_sec:.1f}s, {max_sec:.1f}s]."


def check_no_silence_padding(
    speech_duration_sec: float,
    total_audio_duration_sec: float,
    max_padding_tolerance_sec: float = 3.0,
) -> Tuple[bool, str]:
    """
    Ensures a short lesson is NOT padded with artificial silence to force duration.
    """
    excess_silence = total_audio_duration_sec - speech_duration_sec
    if excess_silence > max_padding_tolerance_sec:
        return (
            False,
            f"Excess silence detected ({excess_silence:.1f}s > {max_padding_tolerance_sec:.1f}s tolerance). "
            "Policy strictly forbids padding short lessons with silence.",
        )
    return True, "No artificial silence padding detected."


def check_no_truncation(
    original_text: str,
    spoken_text: str,
    min_coverage_ratio: float = 0.95,
) -> Tuple[bool, str]:
    """
    Ensures educational content was NOT truncated just to meet a duration target.
    """
    orig_words = count_words(original_text)
    spoken_words = count_words(spoken_text)
    if orig_words == 0:
        return True, "Empty script."

    coverage = spoken_words / orig_words
    if coverage < min_coverage_ratio:
        return (
            False,
            f"Script coverage {coverage:.1%} is below required {min_coverage_ratio:.1%}. "
            "Educational content must NOT be truncated to force duration.",
        )
    return True, f"Full educational content preserved ({coverage:.1%} coverage)."
