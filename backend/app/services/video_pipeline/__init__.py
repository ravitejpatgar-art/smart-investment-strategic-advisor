"""
SmartVest P8 — Video Generation Pipeline Package
Provider-based architecture for generating AI talking-presenter videos.
"""

from .models import (
    SceneScript,
    VideoGenerationRequest,
    VideoJobResponse,
    VideoJobStatus,
    ValidationResult,
    ManifestEntry,
)
from .provider_base import VideoGenerationProvider
from .mock_provider import MockVideoProvider
from .gemini_script_provider import (
    GeminiScriptProvider,
    GeminiFreeSafetyGuard,
    PAID_DENIAL_MESSAGE,
    FREE_TIER_MODELS,
    ALLOWED_OPERATIONS,
)
from .factory import get_video_provider, get_script_provider
from .manifest_manager import ManifestManager
from .subtitles import generate_webvtt_cues, validate_webvtt
from .pipeline_orchestrator import VideoPipelineOrchestrator
from .wav2lip_provider import Wav2LipVideoProvider, WAV2LIP_STATIC_PORTRAIT_CAVEAT
from .duration_calculator import (
    calculate_duration_from_text,
    count_words,
    resolve_final_duration,
    validate_duration_policy,
    check_no_silence_padding,
    check_no_truncation,
    MIN_DURATION_SEC,
    MAX_DURATION_SEC,
)

__all__ = [
    "SceneScript",
    "VideoGenerationRequest",
    "VideoJobResponse",
    "VideoJobStatus",
    "ValidationResult",
    "ManifestEntry",
    "VideoGenerationProvider",
    "MockVideoProvider",
    "Wav2LipVideoProvider",
    "WAV2LIP_STATIC_PORTRAIT_CAVEAT",
    "GeminiScriptProvider",
    "GeminiFreeSafetyGuard",
    "PAID_DENIAL_MESSAGE",
    "FREE_TIER_MODELS",
    "ALLOWED_OPERATIONS",
    "get_video_provider",
    "get_script_provider",
    "ManifestManager",
    "generate_webvtt_cues",
    "validate_webvtt",
    "VideoPipelineOrchestrator",
    "calculate_duration_from_text",
    "count_words",
    "resolve_final_duration",
    "validate_duration_policy",
    "check_no_silence_padding",
    "check_no_truncation",
    "MIN_DURATION_SEC",
    "MAX_DURATION_SEC",
]

