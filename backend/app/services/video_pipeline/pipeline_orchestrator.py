"""
SmartVest P8 — Video Generation Pipeline Orchestrator
Orchestrates staged generation, validation, and manifest tracking for SmartVest Academy.
Enforces the Phase A prototype rule: generate ONE English lesson first and stop for review.
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List
from .models import (
    SceneScript,
    VideoGenerationRequest,
    VideoJobResponse,
    VideoJobStatus,
    ValidationResult,
    ManifestEntry,
)
from .factory import get_video_provider
from .manifest_manager import ManifestManager
from .subtitles import generate_webvtt_cues, validate_webvtt

logger = logging.getLogger("video_pipeline.orchestrator")


from .duration_calculator import (
    calculate_duration_from_text,
    count_words,
    validate_duration_policy,
    MIN_DURATION_SEC,
    MAX_DURATION_SEC,
)


class VideoPipelineOrchestrator:
    """
    Orchestrates AI presenter video generation for SmartVest Academy.
    Operates strictly via the D:\\SmartVestMedia\\p8\\ storage hierarchy to protect C: drive space.
    Enforces variable duration policy (60-180 seconds based on narration length).
    """

    MEDIA_ROOT = r"D:\SmartVestMedia\p8"
    RENDERS_DIR = os.path.join(MEDIA_ROOT, "renders")
    VALIDATED_DIR = os.path.join(MEDIA_ROOT, "validated")
    SUBTITLES_DIR = os.path.join(MEDIA_ROOT, "subtitles")
    POSTERS_DIR = os.path.join(MEDIA_ROOT, "posters")

    def __init__(self, provider_name: Optional[str] = None):
        self.provider = get_video_provider(provider_name)
        self.manifest_manager = ManifestManager()

    def build_lesson_1_english_scenes(self) -> List[SceneScript]:
        """
        Builds the standard 6-scene structured educational broadcast script for
        Lesson 1: "What is Investment?" (Target: variable duration 150-180 seconds).
        """
        return [
            SceneScript(
                scene_index=1,
                scene_name="Opening",
                time_range="0:00-0:15",
                script_text=(
                    "Hello and welcome to the SmartVest Investing Academy. "
                    "Have you ever wondered why simply saving money in a bank account or cash locker "
                    "is no longer enough to protect and secure your long-term financial future? "
                    "Today, we explore the vital difference between saving and investing."
                ),
                camera_shot="medium",
                visual_action="Presenter addresses camera warmly, gestures with open palms as animated lesson badge appears beside him.",
                graphic_elements=["Lesson Title: What is Investment?", "SmartVest Academy Badge", "Presenter HUD"]
            ),
            SceneScript(
                scene_index=2,
                scene_name="Concept",
                time_range="0:15-0:45",
                script_text=(
                    "Saving means setting aside surplus income in low-risk places. While saving protects "
                    "your nominal rupees, it suffers from an invisible enemy: inflation. Over time, inflation "
                    "causes the prices of everyday groceries, housing, healthcare, and education to rise. "
                    "Consequently, the true purchasing power of uninvested, idle cash steadily declines."
                ),
                camera_shot="medium-wide",
                visual_action="Presenter gestures toward a floating conceptual graphic displaying cash purchasing power declining under inflation.",
                graphic_elements=["Savings vs Inflation Curve", "Purchasing Power HUD"]
            ),
            SceneScript(
                scene_index=3,
                scene_name="Explanation",
                time_range="0:45-1:30",
                script_text=(
                    "Investing, in contrast, means putting your hard-earned money to work in productive economic assets—"
                    "such as company shares, government and corporate debt, mutual funds, or real estate. "
                    "The fundamental objective is that these productive assets generate income, pay regular dividends, "
                    "or appreciate in value as the underlying businesses expand. "
                    "Investing is not gambling or speculative trading. Genuine investing is providing long-term capital "
                    "to businesses that build products, create employment, and generate economic wealth."
                ),
                camera_shot="presenter-chart",
                visual_action="Camera transitions smoothly to presenter standing beside an interactive multi-asset allocation matrix.",
                graphic_elements=["Productive Assets Breakdown", "Equity, Debt, Real Estate Cards", "Asset Return Drivers"]
            ),
            SceneScript(
                scene_index=4,
                scene_name="Real-World Example",
                time_range="1:30-2:15",
                script_text=(
                    "Let us examine an illustrative example with ten thousand rupees. "
                    "If you store ten thousand rupees in a safe deposit locker for ten years, you will still have exactly ten thousand rupees. "
                    "However, if inflation averages six percent annually, goods costing ten thousand rupees today will cost nearly eighteen thousand rupees in a decade. "
                    "Your saved cash has quietly surrendered almost half of its real purchasing power. "
                    "Deploying that capital into diversified productive investments allows your money to work alongside the economy to beat inflation."
                ),
                camera_shot="close-up",
                visual_action="Presenter points directly at the side-by-side comparison of ₹10,000 cash versus invested capital.",
                graphic_elements=["ILLUSTRATIVE EXAMPLE Badge", "₹10,000 Cash vs 6% Inflation Curve", "10-Year Purchasing Power Comparison"]
            ),
            SceneScript(
                scene_index=5,
                scene_name="Key Takeaways",
                time_range="2:15-2:45",
                script_text=(
                    "Before taking your first step, remember these three core principles: "
                    "First: Saving provides liquidity for unexpected emergencies today. "
                    "Second: Investing puts your capital to work to preserve and multiply your purchasing power for tomorrow. "
                    "Third: Investing always carries market risk—diversification and a disciplined time horizon are your greatest allies."
                ),
                camera_shot="medium",
                visual_action="Presenter returns front and center with confident hand emphasis as summary key takeaways appear sequentially.",
                graphic_elements=["Rule 1: Emergency Liquidity", "Rule 2: Inflation Beating Growth", "Rule 3: Disciplined Horizon"]
            ),
            SceneScript(
                scene_index=6,
                scene_name="SmartVest Outro",
                time_range="2:45-3:00",
                script_text=(
                    "Take your time, complete the quiz below, and prepare for our next lesson: What is a Stock? "
                    "Remember the golden rule of SmartVest: Learn first. Invest with understanding."
                ),
                camera_shot="medium-wide",
                visual_action="Presenter gives closing nod as SmartVest official branding animation and tagline resolve smoothly.",
                graphic_elements=["SmartVest Official Logo", "Tagline: Learn first. Invest with understanding.", "Next Lesson Card"]
            )
        ]

    def build_lesson_1_prototype_scene(self) -> List[SceneScript]:
        """
        Builds the Phase A educational narration scenes for Lesson 1: "What is Investment?".
        Provides approximately 1-2 minutes (~170 words, ~68s) of real educational content.
        Enforces variable duration policy: no silence padding, no repeated sentences, no truncation.
        """
        return [
            SceneScript(
                scene_index=1,
                scene_name="Introduction",
                time_range="0:00-0:21",
                script_text=(
                    "Welcome to the SmartVest Investing Academy. "
                    "Today, we explore the vital difference between saving money and investing. "
                    "Saving means setting aside surplus cash in a bank account or locker. "
                    "While saving protects your nominal balance, it leaves you vulnerable to inflation, "
                    "which quietly erodes your real purchasing power over time."
                ),
                camera_shot="medium",
                visual_action="Presenter addresses camera warmly, gesturing as animated lesson badge appears.",
                graphic_elements=["Lesson 1: What is Investment?", "SmartVest Academy Badge"]
            ),
            SceneScript(
                scene_index=2,
                scene_name="Core Principle & Real-World Example",
                time_range="0:21-0:50",
                script_text=(
                    "Investing, in contrast, means deploying your capital into productive economic assets—"
                    "such as company shares, mutual funds, government bonds, or real estate. "
                    "Consider ten thousand rupees stored in a safe locker for ten years: "
                    "with six percent average inflation, goods costing ten thousand rupees today will cost "
                    "nearly eighteen thousand rupees in a decade. "
                    "Idle cash loses almost half its purchasing power."
                ),
                camera_shot="presenter-chart",
                visual_action="Presenter points toward a chart illustrating ₹10,000 cash versus inflation.",
                graphic_elements=["₹10,000 Cash vs Inflation Curve", "Productive Assets Breakdown"]
            ),
            SceneScript(
                scene_index=3,
                scene_name="Summary & Outro",
                time_range="0:50-1:09",
                script_text=(
                    "Deploying capital into diversified productive investments allows your money to work alongside "
                    "the expanding economy to beat inflation and build long-term wealth. "
                    "Remember the golden rule of SmartVest: Learn first. Invest with understanding."
                ),
                camera_shot="medium-wide",
                visual_action="Presenter gives closing nod as SmartVest official branding animation appears.",
                graphic_elements=["SmartVest Official Logo", "Tagline: Learn first. Invest with understanding."]
            ),
        ]

    def execute_phase_a_prototype(self) -> Dict[str, Any]:
        """
        Executes Phase A: Generates ONE English prototype video for Lesson 1: "What is Investment?".
        Calculates video duration dynamically from educational narration length (~1-2 minutes).
        Clamps to policy range [60s, 180s] without silence padding or content truncation.
        Updates manifest on D: drive and STOPS for user review before generating remaining videos.
        """
        scenes = self.build_lesson_1_prototype_scene()
        combined_text = " ".join(s.script_text for s in scenes)
        dur_info = calculate_duration_from_text(combined_text)
        duration_sec = dur_info["clamped_duration_sec"]

        logger.info(
            f"=== STARTING PHASE A: LESSON 1 ENGLISH PROTOTYPE ({duration_sec:.1f}s VARIABLE DURATION) ==="
        )

        request = VideoGenerationRequest(
            lesson_id="what-is-investment",
            lesson_number=1,
            title="What is Investment?",
            language="en",
            duration_target_sec=int(round(duration_sec)),
            scenes=scenes,
            output_dir=self.RENDERS_DIR,
            metadata={
                "word_count": dur_info["word_count"],
                "speaking_wpm": dur_info["speaking_wpm"],
                "category": dur_info["category"],
            }
        )

        out_video_path = os.path.join(self.RENDERS_DIR, "investment_en_prototype.mp4")
        out_vtt_path = os.path.join(self.SUBTITLES_DIR, "investment.vtt")
        out_poster_path = os.path.join(self.POSTERS_DIR, "investment.webp")

        # Generate proportional WebVTT cues based on narration length
        total_words = dur_info["word_count"] or 1
        current_time = 0.0
        cues = []
        for s in scenes:
            scene_words = count_words(s.script_text)
            scene_dur = round((scene_words / total_words) * duration_sec, 2)
            end_time = round(current_time + scene_dur, 2)
            cues.append((current_time, end_time, s.script_text))
            current_time = end_time
        generate_webvtt_cues(cues, out_vtt_path)

        # Submit generation job to provider
        job_response = self.provider.generate_video(request)

        # Update manifest with submission
        manifest_entry = ManifestEntry(
            lesson_id=request.lesson_id,
            lesson_number=request.lesson_number,
            title=request.title,
            language=request.language,
            provider=self.provider.provider_name,
            job_id=job_response.job_id,
            video_path=out_video_path,
            subtitle_path=out_vtt_path,
            poster_path=out_poster_path,
            duration=duration_sec,
            validation_status="submitted",
            human_motion_notes=(
                f"Phase A English Lesson 1 prototype ({duration_sec:.1f}s narration duration). "
                "Wav2Lip with a static portrait primarily provides lip synchronization and does not create full independent head/body gestures."
            )
        )
        self.manifest_manager.update_entry(manifest_entry)

        return {
            "status": "submitted",
            "phase": "PHASE_A",
            "provider": self.provider.provider_name,
            "job_id": job_response.job_id,
            "lesson": request.title,
            "language": "en",
            "target_duration": f"{duration_sec:.1f} seconds ({duration_sec / 60.0:.1f} minutes)",
            "duration_sec": duration_sec,
            "word_count": dur_info["word_count"],
            "manifest_path": self.manifest_manager.manifest_path,
            "out_video_path": out_video_path,
            "subtitle_path": out_vtt_path,
            "poster_path": out_poster_path,
            "next_step": "Poll job status until completed, download to D:, run validation, and present for manual review."
        }
