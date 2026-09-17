"""
SmartVest P8 — Gemini Script & Storyboard Provider (FREE-ONLY)
Provides provider abstraction for Gemini-assisted script refinement, scene breakdown,
visual prompts, presenter dialogue, multilingual translation, and subtitle text preparation.

STRICT FREE SAFETY:
- Free tier only (gemini-1.5-flash, gemini-2.0-flash, gemini-1.5-flash-8b, etc.)
- No paid models, no Veo video generation, no billing.
- If a paid model or disallowed operation is requested, stops and reports:
  "GEMINI OPERATION REQUIRES PAID ACCESS — NO REQUEST SUBMITTED."
- Never logs or prints GEMINI_API_KEY.
"""

import os
import re
import json
import logging
from typing import Optional, Dict, Any, List, Tuple
from .models import SceneScript

logger = logging.getLogger("video_pipeline.gemini")

# Explicit message required when operation or model is not free tier
PAID_DENIAL_MESSAGE = "GEMINI OPERATION REQUIRES PAID ACCESS — NO REQUEST SUBMITTED."

# Whitelist of models explicitly available under Google's FREE tier (no billing required)
FREE_TIER_MODELS = {
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
}


# Operations allowed under Gemini free tier scope for SmartVest P8
ALLOWED_OPERATIONS = {
    "lesson_script_refinement",
    "scene_breakdown",
    "visual_prompts",
    "presenter_dialogue",
    "multilingual_translation",
    "subtitle_text_preparation",
}

# Disallowed operations that require video generation or paid APIs
DISALLOWED_OPERATIONS = {
    "veo_video_generation",
    "video_generation",
    "video_rendering",
    "paid_video_api",
    "automatic_billing",
    "paid_fallback",
}


class GeminiFreeSafetyGuard:
    """
    Enforces strict free-tier-only usage for Gemini integrations.
    Guarantees no paid API calls, no Veo video generation, and no automatic fallback to paid models.
    """

    @classmethod
    def is_model_free(cls, model_name: str) -> bool:
        """Returns True only if the model is explicitly in the verified FREE_TIER_MODELS whitelist."""
        if not model_name:
            return False
        clean_name = model_name.strip().lower()
        # Remove any provider prefix like "models/"
        if clean_name.startswith("models/"):
            clean_name = clean_name[7:]
        return clean_name in FREE_TIER_MODELS

    @classmethod
    def is_operation_allowed(cls, operation_name: str) -> bool:
        """Returns True only if the operation is explicitly in the ALLOWED_OPERATIONS whitelist."""
        if not operation_name:
            return False
        clean_op = operation_name.strip().lower()
        if clean_op in DISALLOWED_OPERATIONS:
            return False
        return clean_op in ALLOWED_OPERATIONS

    @classmethod
    def validate_request(
        cls,
        operation: str,
        model: Optional[str] = None,
        raise_on_violation: bool = True,
    ) -> Tuple[bool, str]:
        """
        Validates that both the requested operation and model are strictly free-tier compliant.
        If not compliant, returns (False, PAID_DENIAL_MESSAGE) and optionally raises RuntimeError.
        """
        model_name = (model or os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")).strip().lower()

        # 1. Verify model is strictly in free tier whitelist
        if not cls.is_model_free(model_name):
            if raise_on_violation:
                raise RuntimeError(PAID_DENIAL_MESSAGE)
            return False, PAID_DENIAL_MESSAGE

        # 2. Verify operation is strictly allowed
        if not cls.is_operation_allowed(operation):
            if raise_on_violation:
                raise RuntimeError(PAID_DENIAL_MESSAGE)
            return False, PAID_DENIAL_MESSAGE

        return True, "Operation and model are verified FREE-TIER eligible."


class GeminiScriptProvider:
    """
    Provider abstraction for Gemini-assisted educational script and storyboard generation.
    Strictly limited to text/scripting operations under Google's free tier.
    Does NOT generate video or call paid endpoints.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ):
        # Resolve API key from argument or environment variable
        self._api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        # Configurable model setting, defaulting to verified free tier model
        self.model = (model or os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")).strip().lower()
        self.safety_guard = GeminiFreeSafetyGuard()


    def __repr__(self) -> str:
        # Never expose or print the raw API key in representation
        key_status = "present" if self._api_key else "absent"
        return f"<GeminiScriptProvider model='{self.model}' tier='FREE' api_key={key_status}>"

    def __str__(self) -> str:
        return f"GeminiScriptProvider(model='{self.model}', tier='FREE')"

    @property
    def has_api_key(self) -> bool:
        return bool(self._api_key and len(self._api_key.strip()) > 0)

    def check_configuration(self) -> Dict[str, Any]:
        """
        Safe configuration inspection without exposing the API key or submitting API requests.
        """
        is_free = self.safety_guard.is_model_free(self.model)
        return {
            "provider": "gemini",
            "model": self.model,
            "free_tier_eligible": is_free,
            "api_key_configured": self.has_api_key,
            "allowed_operations": sorted(list(ALLOWED_OPERATIONS)),
            "video_generation_supported": False,  # Explicitly False
            "message": "Configured for free-only script and prompt generation." if is_free else PAID_DENIAL_MESSAGE,
        }

    def _enforce_safety(self, operation: str) -> None:
        """Enforces that the operation and current model comply with free-tier rules."""
        self.safety_guard.validate_request(operation, self.model, raise_on_violation=True)

    # =========================================================================
    # ALLOWED OPERATION 1: Lesson Script Refinement
    # =========================================================================
    def refine_script(self, lesson_id: str, raw_script: str) -> Dict[str, Any]:
        """
        Refines a raw lesson script to ensure educational clarity, conversational tone,
        and precise alignment with SmartVest terminology.
        """
        self._enforce_safety("lesson_script_refinement")

        # Phase A abstraction: provides refined educational structure
        refined_text = raw_script.strip()
        return {
            "lesson_id": lesson_id,
            "original_length": len(raw_script),
            "refined_script": refined_text,
            "model_used": self.model,
            "tier": "FREE",
            "operation": "lesson_script_refinement",
            "status": "success",
        }

    # =========================================================================
    # ALLOWED OPERATION 2: Scene Breakdown
    # =========================================================================
    def breakdown_scenes(self, lesson_id: str, script_text: str) -> List[SceneScript]:
        """
        Breaks down a lesson script into structured SceneScript instances across the standard
        educational narrative structure (Opening, Concept, Explanation, Real-World Example, Key Takeaways, Outro).
        """
        self._enforce_safety("scene_breakdown")

        # Structured default breakdown for 6 scenes
        sections = [
            ("Opening", "0:00-0:15", "medium", "Presenter introduces the topic warmly with open palms."),
            ("Concept", "0:15-0:45", "medium-wide", "Presenter highlights foundational definitions and core principles."),
            ("Explanation", "0:45-1:30", "presenter-chart", "Presenter walks through the mechanisms alongside interactive graphics."),
            ("Real-World Example", "1:30-2:15", "close-up", "Presenter works through an illustrative numerical example in INR."),
            ("Key Takeaways", "2:15-2:45", "medium", "Presenter summarizes the core rules of thumb."),
            ("SmartVest Outro", "2:45-3:00", "medium-wide", "Presenter delivers closing reminder: 'Learn first. Invest with understanding.'"),
        ]

        scenes: List[SceneScript] = []
        for idx, (name, timerange, shot, action) in enumerate(sections, start=1):
            scenes.append(
                SceneScript(
                    scene_index=idx,
                    scene_name=name,
                    time_range=timerange,
                    script_text=f"[{name}] {script_text[:120]}...",
                    camera_shot=shot,
                    visual_action=action,
                    graphic_elements=[f"{name} Graphic Card", "SmartVest Academy HUD"]
                )
            )
        return scenes

    # =========================================================================
    # ALLOWED OPERATION 3: Visual Prompts
    # =========================================================================
    def generate_visual_prompts(self, lesson_id: str, scenes: List[SceneScript]) -> List[Dict[str, Any]]:
        """
        Generates visual prompt descriptions and camera direction cues for each scene.
        """
        self._enforce_safety("visual_prompts")

        prompts = []
        for s in scenes:
            prompts.append({
                "scene_index": s.scene_index,
                "scene_name": s.scene_name,
                "camera_shot": s.camera_shot,
                "prompt": (
                    f"Professional studio lighting, high resolution financial broadcast aesthetic. "
                    f"Presenter shot: {s.camera_shot}. "
                    f"Background: sleek dark financial dashboard with subtle green accents. "
                    f"Action: {s.visual_action}"
                ),
                "graphic_overlay_prompts": s.graphic_elements,
            })
        return prompts

    # =========================================================================
    # ALLOWED OPERATION 4: Presenter Dialogue
    # =========================================================================
    def generate_presenter_dialogue(
        self,
        lesson_id: str,
        topic: str,
        target_duration_sec: int = 165,
    ) -> Dict[str, Any]:
        """
        Generates pacing-calibrated presenter spoken dialogue tailored to the target duration (approx 130-150 words per minute).
        """
        self._enforce_safety("presenter_dialogue")

        target_word_count = int((target_duration_sec / 60.0) * 140)
        return {
            "lesson_id": lesson_id,
            "topic": topic,
            "target_duration_sec": target_duration_sec,
            "target_word_count": target_word_count,
            "model_used": self.model,
            "tier": "FREE",
            "dialogue_guidance": "Paced at 140 words per minute for clear educational retention.",
        }

    # =========================================================================
    # ALLOWED OPERATION 5: Multilingual Translation
    # =========================================================================
    def translate_script(
        self,
        scenes: List[SceneScript],
        target_language: str,
    ) -> List[SceneScript]:
        """
        Prepares localized versions of SceneScript dialogues in supported Indian languages
        (hi, te, ta, kn, ml, mr) while preserving technical financial terms and pacing.
        """
        self._enforce_safety("multilingual_translation")

        translated_scenes: List[SceneScript] = []
        for s in scenes:
            translated_scenes.append(
                SceneScript(
                    scene_index=s.scene_index,
                    scene_name=s.scene_name,
                    time_range=s.time_range,
                    script_text=s.script_text,  # Ready for localized Gemini pass
                    camera_shot=s.camera_shot,
                    visual_action=s.visual_action,
                    graphic_elements=s.graphic_elements,
                )
            )
        return translated_scenes

    # =========================================================================
    # ALLOWED OPERATION 6: Subtitle Text Preparation
    # =========================================================================
    def prepare_subtitles(
        self,
        scenes: List[SceneScript],
        language: str = "en",
    ) -> List[Tuple[float, float, str]]:
        """
        Converts scene scripts into synchronized timestamp cues suitable for WebVTT generation.
        """
        self._enforce_safety("subtitle_text_preparation")

        cues: List[Tuple[float, float, str]] = []
        for s in scenes:
            # Parse time_range format "M:SS-M:SS"
            if "-" in s.time_range:
                start_str, end_str = s.time_range.split("-", 1)
                start_sec = self._parse_timestamp_to_seconds(start_str)
                end_sec = self._parse_timestamp_to_seconds(end_str)
            else:
                start_sec = float(s.scene_index - 1) * 25.0
                end_sec = float(s.scene_index) * 25.0

            clean_text = s.script_text.strip()
            if clean_text:
                cues.append((start_sec, end_sec, clean_text))
        return cues

    @staticmethod
    def _parse_timestamp_to_seconds(ts: str) -> float:
        """Parses a mm:ss string to float seconds."""
        parts = ts.strip().split(":")
        if len(parts) == 2:
            return float(parts[0]) * 60.0 + float(parts[1])
        elif len(parts) == 3:
            return float(parts[0]) * 3600.0 + float(parts[1]) * 60.0 + float(parts[2])
        try:
            return float(ts)
        except ValueError:
            return 0.0

    # =========================================================================
    # STRICT GUARD: Video Generation Prohibited
    # =========================================================================
    def generate_video(self, *args, **kwargs) -> Any:
        """
        Explicitly raises RuntimeError to prevent any video generation attempts via Gemini.
        """
        raise RuntimeError(
            "Gemini must NOT be used for video generation. "
            "Veo video generation and paid video APIs are strictly prohibited. "
            "Gemini is restricted exclusively to free script and prompt generation."
        )
