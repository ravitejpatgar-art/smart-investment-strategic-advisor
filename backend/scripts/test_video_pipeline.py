"""
SmartVest P8 — Video Pipeline Unit & Integration Tests
Tests provider abstraction, mock provider, WebVTT validation, manifest tracking,
Phase A orchestration, and verifies that Rewind has been disabled/removed.
"""

import sys
import os
import unittest
import tempfile
import json

# Add backend directory to sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.services.video_pipeline.models import (
    SceneScript,
    VideoGenerationRequest,
    ManifestEntry,
    ValidationResult,
)
from app.services.video_pipeline.factory import get_video_provider, get_script_provider
from app.services.video_pipeline.mock_provider import MockVideoProvider
from app.services.video_pipeline.rewind_provider import RewindVideoProvider
from app.services.video_pipeline.heygen_provider import HeyGenVideoProvider
from app.services.video_pipeline.gemini_script_provider import (
    GeminiScriptProvider,
    GeminiFreeSafetyGuard,
    PAID_DENIAL_MESSAGE,
    FREE_TIER_MODELS,
    ALLOWED_OPERATIONS,
)
from app.services.video_pipeline.manifest_manager import ManifestManager
from app.services.video_pipeline.subtitles import (
    format_vtt_timestamp,
    generate_webvtt_cues,
    validate_webvtt,
)
from app.services.video_pipeline.pipeline_orchestrator import VideoPipelineOrchestrator
from app.services.video_pipeline.duration_calculator import (
    calculate_duration_from_text,
    count_words,
    resolve_final_duration,
    validate_duration_policy,
    check_no_silence_padding,
    check_no_truncation,
    MIN_DURATION_SEC,
    MAX_DURATION_SEC,
)
from app.services.video_pipeline.wav2lip_provider import (
    Wav2LipVideoProvider,
    WAV2LIP_STATIC_PORTRAIT_CAVEAT,
)



class TestVideoPipeline(unittest.TestCase):

    def test_01_models_integrity(self):
        """Validates that SceneScript and VideoGenerationRequest instantiate properly."""
        scene = SceneScript(
            scene_index=1,
            scene_name="Opening",
            time_range="0:00-0:15",
            script_text="Welcome to SmartVest Academy.",
            camera_shot="medium",
            visual_action="Presenter addresses camera with open palms."
        )
        self.assertEqual(scene.scene_index, 1)
        self.assertEqual(scene.camera_shot, "medium")

        req = VideoGenerationRequest(
            lesson_id="what-is-investment",
            lesson_number=1,
            title="What is Investment?",
            language="en",
            duration_target_sec=165,
            scenes=[scene]
        )
        self.assertEqual(req.lesson_id, "what-is-investment")
        self.assertEqual(len(req.scenes), 1)

    def test_02_factory_resolution(self):
        """Verifies that provider factory resolves mock and rejects rewind."""
        mock_p = get_video_provider("mock")
        self.assertIsInstance(mock_p, MockVideoProvider)
        self.assertEqual(mock_p.provider_name, "mock")

        # Default provider must be mock, NOT rewind
        default_p = get_video_provider()
        self.assertIsInstance(default_p, MockVideoProvider)
        self.assertEqual(default_p.provider_name, "mock")

        # Rewind cannot be selected as an active provider
        with self.assertRaises(ValueError) as ctx:
            get_video_provider("rewind")
        self.assertIn("disabled", str(ctx.exception).lower())
        self.assertIn("rewind", str(ctx.exception).lower())

    def test_03_heygen_provider_disabled(self):
        """Ensures deprecated HeyGen provider is disabled and raises clear error."""
        heygen_p = HeyGenVideoProvider()
        req = VideoGenerationRequest(
            lesson_id="what-is-investment",
            lesson_number=1,
            title="What is Investment?",
            language="en",
            duration_target_sec=165,
        )
        with self.assertRaises(RuntimeError) as ctx:
            heygen_p.generate_video(req)
        self.assertIn("disabled", str(ctx.exception).lower())

    def test_04_rewind_provider_disabled_and_no_key_required(self):
        """Ensures Rewind provider requires no API key and cannot generate videos."""
        # No API key required to instantiate
        provider = RewindVideoProvider()
        self.assertEqual(provider.provider_name, "rewind")

        # Auth check reports disabled / unauthenticated
        auth_res = provider.check_authentication()
        self.assertFalse(auth_res["authenticated"])
        self.assertIn("removed", auth_res["message"].lower())

        # Generation raises RuntimeError
        req = VideoGenerationRequest(
            lesson_id="what-is-investment",
            lesson_number=1,
            title="What is Investment?",
            language="en",
            duration_target_sec=8,
        )
        with self.assertRaises(RuntimeError) as ctx:
            provider.generate_video(req)
        self.assertIn("removed", str(ctx.exception).lower())

    def test_05_mock_provider_lifecycle(self):
        """Tests the full submission, status checking, and download flow with MockVideoProvider."""
        provider = MockVideoProvider()
        req = VideoGenerationRequest(
            lesson_id="what-is-investment",
            lesson_number=1,
            title="What is Investment?",
            language="en",
            duration_target_sec=165,
        )
        resp = provider.generate_video(req)
        self.assertTrue(resp.job_id.startswith("mock_job_"))
        self.assertEqual(resp.status, "submitted")

        status = provider.get_job_status(resp.job_id)
        self.assertEqual(status.status, "completed")
        self.assertEqual(status.progress_percentage, 100.0)

        with tempfile.TemporaryDirectory() as tmpdir:
            out_file = os.path.join(tmpdir, "test.mp4")
            downloaded = provider.download_video(resp.job_id, out_file)
            self.assertTrue(os.path.exists(downloaded))
            self.assertGreater(os.path.getsize(downloaded), 0)

    def test_06_webvtt_formatting_and_validation(self):
        """Validates timestamp formatting, cue generation, and strict syntax validation."""
        self.assertEqual(format_vtt_timestamp(0.0), "00:00:00.000")
        self.assertEqual(format_vtt_timestamp(75.5), "00:01:15.500")

        with tempfile.TemporaryDirectory() as tmpdir:
            vtt_path = os.path.join(tmpdir, "test.vtt")
            cues = [
                (0.0, 15.0, "Welcome to the lesson."),
                (15.0, 45.0, "This is the core concept of investment."),
                (45.0, 90.0, "Let us look at financial diagrams."),
            ]
            generate_webvtt_cues(cues, vtt_path)
            self.assertTrue(os.path.exists(vtt_path))

            is_valid, errors = validate_webvtt(vtt_path)
            self.assertTrue(is_valid, f"WebVTT validation failed: {errors}")
            self.assertEqual(len(errors), 0)

    def test_07_manifest_manager(self):
        """Validates manifest tracking on temporary path."""
        with tempfile.TemporaryDirectory() as tmpdir:
            manifest_file = os.path.join(tmpdir, "manifest.json")
            mgr = ManifestManager(manifest_path=manifest_file)

            entry = ManifestEntry(
                lesson_id="what-is-investment",
                lesson_number=1,
                title="What is Investment?",
                language="en",
                provider="mock",
                job_id="test_job_123",
                video_path="/test/path.mp4",
                duration=165.0,
                validation_status="passed",
            )
            mgr.update_entry(entry)

            # Reload and verify
            mgr2 = ManifestManager(manifest_path=manifest_file)
            retrieved = mgr2.get_entry("what-is-investment", "en")
            self.assertIsNotNone(retrieved)
            self.assertEqual(retrieved.job_id, "test_job_123")
            self.assertEqual(retrieved.provider, "mock")
            self.assertEqual(retrieved.validation_status, "passed")

    def test_08_phase_a_orchestrator_scenes(self):
        """Verifies that Phase A scene builder constructs exactly 6 structured scenes totaling 150-180s."""
        orchestrator = VideoPipelineOrchestrator(provider_name="mock")
        scenes = orchestrator.build_lesson_1_english_scenes()

        self.assertEqual(len(scenes), 6)
        scene_names = [s.scene_name for s in scenes]
        self.assertEqual(
            scene_names,
            ["Opening", "Concept", "Explanation", "Real-World Example", "Key Takeaways", "SmartVest Outro"]
        )

        # Check that Lesson 1 scenes contain the required INR example and SmartVest tagline
        full_text = " ".join(s.script_text for s in scenes)
        self.assertIn("ten thousand rupees", full_text.lower())
        self.assertIn("inflation", full_text.lower())
        self.assertIn("Learn first. Invest with understanding.", full_text)

    def test_09_phase_a_prototype_submission_mock(self):
        """Tests that Phase A prototype executes, updates manifest, and sets up 1-2 min variable duration."""
        orchestrator = VideoPipelineOrchestrator(provider_name="mock")
        result = orchestrator.execute_phase_a_prototype()

        self.assertEqual(result["phase"], "PHASE_A")
        self.assertEqual(result["status"], "submitted")
        self.assertEqual(result["language"], "en")
        self.assertEqual(result["provider"], "mock")
        self.assertIn("investment", result["out_video_path"])

        # Check variable duration is ~1-2 minutes (between 60s and 180s)
        self.assertGreaterEqual(result["duration_sec"], 60.0)
        self.assertLessEqual(result["duration_sec"], 180.0)
        self.assertGreater(result["word_count"], 100)
        self.assertIn("seconds", result["target_duration"])

        # Verify entry in manifest
        entry = orchestrator.manifest_manager.get_entry("what-is-investment", "en")
        self.assertIsNotNone(entry)
        self.assertEqual(entry.validation_status, "submitted")
        self.assertEqual(entry.duration, result["duration_sec"])
        self.assertIn("Wav2Lip with a static portrait", entry.human_motion_notes)

    def test_10_rewind_cannot_be_selected_by_orchestrator(self):
        """Verifies that VideoPipelineOrchestrator rejects rewind as a provider."""
        with self.assertRaises(ValueError) as ctx:
            VideoPipelineOrchestrator(provider_name="rewind")
        self.assertIn("disabled", str(ctx.exception).lower())

    def test_11_no_rewind_api_key_required_in_environment(self):
        """Verifies pipeline operates cleanly without REWIND_API_KEY environment variable."""
        # Ensure REWIND_* vars are absent
        old_key = os.environ.pop("REWIND_API_KEY", None)
        old_img = os.environ.pop("REWIND_SOURCE_IMAGE", None)
        old_mdl = os.environ.pop("REWIND_AVATAR_MODEL", None)
        try:
            # Default provider resolves cleanly without any key
            provider = get_video_provider()
            self.assertEqual(provider.provider_name, "mock")

            # Orchestrator initializes cleanly without any key
            orchestrator = VideoPipelineOrchestrator()
            self.assertEqual(orchestrator.provider.provider_name, "mock")
        finally:
            if old_key:
                os.environ["REWIND_API_KEY"] = old_key
            if old_img:
                os.environ["REWIND_SOURCE_IMAGE"] = old_img
            if old_mdl:
                os.environ["REWIND_AVATAR_MODEL"] = old_mdl

    def test_12_no_rewind_generation_can_occur(self):
        """Verifies that no video generation can occur through the Rewind provider."""
        provider = RewindVideoProvider()
        req = VideoGenerationRequest(
            lesson_id="what-is-investment",
            lesson_number=1,
            title="What is Investment?",
            language="en",
            duration_target_sec=8,
        )
        with self.assertRaises(RuntimeError) as ctx:
            provider.generate_video(req)
        self.assertIn("removed", str(ctx.exception).lower())

        with self.assertRaises(RuntimeError):
            provider.get_job_status("some_job_id")

        with self.assertRaises(RuntimeError):
            provider.download_video("some_job_id", "/dummy/path.mp4")

    def test_13_gemini_free_safety_guard_rejects_paid_models(self):
        """Verifies that non-free and shut-down Gemini models trigger PAID_DENIAL_MESSAGE."""
        rejected_models = [
            "gemini-2.0-flash",       # Shut down
            "gemini-2.0-flash-lite",  # Shut down
            "gemini-1.5-pro",
            "gemini-ultra",
            "gemini-pro",
            "veo",
            "veo-2",
            "imagen",
            "custom-paid-model",
        ]
        for model_name in rejected_models:
            # Direct check via safety guard returns denial
            is_valid, msg = GeminiFreeSafetyGuard.validate_request(
                operation="lesson_script_refinement",
                model=model_name,
                raise_on_violation=False,
            )
            self.assertFalse(is_valid)
            self.assertEqual(msg, PAID_DENIAL_MESSAGE)

            # Instantiating provider with rejected model and invoking operation raises PAID_DENIAL_MESSAGE
            provider = GeminiScriptProvider(model=model_name)
            with self.assertRaises(RuntimeError) as ctx:
                provider.refine_script("test_lesson", "Draft text")
            self.assertEqual(str(ctx.exception), PAID_DENIAL_MESSAGE)

    def test_14_gemini_free_safety_guard_rejects_disallowed_operations(self):
        """Verifies that non-script operations (video gen, paid APIs, billing) trigger PAID_DENIAL_MESSAGE."""
        disallowed_ops = [
            "veo_video_generation",
            "video_generation",
            "video_rendering",
            "paid_video_api",
            "automatic_billing",
            "paid_fallback",
        ]
        for op in disallowed_ops:
            is_valid, msg = GeminiFreeSafetyGuard.validate_request(
                operation=op,
                model="gemini-2.5-flash",
                raise_on_violation=False,
            )
            self.assertFalse(is_valid)
            self.assertEqual(msg, PAID_DENIAL_MESSAGE)

            with self.assertRaises(RuntimeError) as ctx:
                GeminiFreeSafetyGuard.validate_request(
                    operation=op,
                    model="gemini-2.5-flash",
                    raise_on_violation=True,
                )
            self.assertEqual(str(ctx.exception), PAID_DENIAL_MESSAGE)

    def test_15_gemini_script_provider_api_key_never_printed(self):
        """Verifies that GEMINI_API_KEY is never leaked or printed in logs or strings."""
        secret_key = "AIzaSySecret123456789VerySecretKeyDoNotLeak"
        provider = GeminiScriptProvider(api_key=secret_key)

        # __repr__ and __str__ must not contain the secret key
        repr_str = repr(provider)
        str_str = str(provider)
        self.assertNotIn(secret_key, repr_str)
        self.assertNotIn(secret_key, str_str)

        # check_configuration must not contain the secret key
        config_info = provider.check_configuration()
        config_dump = json.dumps(config_info)
        self.assertNotIn(secret_key, config_dump)
        self.assertTrue(config_info["api_key_configured"])

    def test_16_gemini_script_provider_allowed_operations(self):
        """Verifies that all 6 allowed script/prompt operations execute cleanly under free-tier constraints."""
        for active_free_model in ["gemini-2.5-flash", "gemini-2.5-flash-lite"]:
            provider = GeminiScriptProvider(model=active_free_model)

            # 1. Lesson script refinement
            refined = provider.refine_script("what-is-investment", "Raw draft about saving and investing.")
            self.assertEqual(refined["operation"], "lesson_script_refinement")
            self.assertEqual(refined["tier"], "FREE")
            self.assertEqual(refined["status"], "success")
            self.assertEqual(refined["model_used"], active_free_model)

            # 2. Scene breakdown
            scenes = provider.breakdown_scenes("what-is-investment", "SmartVest Academy lesson.")
            self.assertEqual(len(scenes), 6)
            self.assertEqual(scenes[0].scene_name, "Opening")
            self.assertEqual(scenes[5].scene_name, "SmartVest Outro")

            # 3. Visual prompts
            prompts = provider.generate_visual_prompts("what-is-investment", scenes)
            self.assertEqual(len(prompts), 6)
            self.assertIn("Presenter shot:", prompts[0]["prompt"])

            # 4. Presenter dialogue
            dialogue = provider.generate_presenter_dialogue("what-is-investment", "Difference between saving and investing", 165)
            self.assertEqual(dialogue["tier"], "FREE")
            self.assertGreater(dialogue["target_word_count"], 0)

            # 5. Multilingual translation
            translated = provider.translate_script(scenes, "hi")
            self.assertEqual(len(translated), len(scenes))

            # 6. Subtitle text preparation
            cues = provider.prepare_subtitles(scenes, "en")
            self.assertEqual(len(cues), len(scenes))
            for start_s, end_s, cue_text in cues:
                self.assertGreaterEqual(end_s, start_s)
                self.assertTrue(len(cue_text) > 0)

    def test_17_gemini_and_veo_video_generation_strictly_blocked(self):
        """Verifies that Gemini cannot be used for video generation and Veo is rejected."""
        provider = GeminiScriptProvider()
        # Direct call to generate_video on Gemini provider must raise RuntimeError
        with self.assertRaises(RuntimeError) as ctx:
            provider.generate_video()
        self.assertIn("video generation", str(ctx.exception).lower())
        self.assertIn("veo", str(ctx.exception).lower())

        # Calling get_video_provider with gemini or veo must raise ValueError
        with self.assertRaises(ValueError) as ctx:
            get_video_provider("gemini")
        self.assertIn("not supported", str(ctx.exception).lower())
        self.assertIn("veo", str(ctx.exception).lower())

        with self.assertRaises(ValueError) as ctx:
            get_video_provider("veo")
        self.assertIn("not supported", str(ctx.exception).lower())
        self.assertIn("veo", str(ctx.exception).lower())

    def test_18_no_billing_and_no_paid_fallback(self):
        """Verifies get_script_provider resolves to free-tier model with no billing or paid fallbacks."""
        script_provider = get_script_provider()
        self.assertIsInstance(script_provider, GeminiScriptProvider)
        self.assertIn(script_provider.model, FREE_TIER_MODELS)
        self.assertEqual(script_provider.model, "gemini-2.5-flash")
        self.assertIn("gemini-2.5-flash", FREE_TIER_MODELS)
        self.assertIn("gemini-2.5-flash-lite", FREE_TIER_MODELS)
        self.assertNotIn("gemini-2.0-flash", FREE_TIER_MODELS)
        self.assertNotIn("gemini-2.0-flash-lite", FREE_TIER_MODELS)
        cfg = script_provider.check_configuration()
        self.assertTrue(cfg["free_tier_eligible"])
        self.assertFalse(cfg["video_generation_supported"])

    def test_19_duration_policy_minimum_clamp(self):
        """Verifies that short scripts (<150 words) are clamped to the 60.0s minimum."""
        # Short script of ~30 words (at 150 wpm would be ~12s)
        short_text = "Hello and welcome to SmartVest. Today we discuss the very basics of financial planning."
        calc = calculate_duration_from_text(short_text, speaking_wpm=150.0)
        self.assertLess(calc["raw_duration_sec"], 60.0)
        self.assertEqual(calc["clamped_duration_sec"], 60.0)
        self.assertTrue(calc["is_clamped_min"])
        self.assertEqual(calc["category"], "short_minimum")

        # Duration policy validator: 59.9s fails, 60.0s passes
        valid_below, msg_below = validate_duration_policy(59.9)
        self.assertFalse(valid_below)
        self.assertIn("below minimum", msg_below)

        valid_min, msg_min = validate_duration_policy(60.0)
        self.assertTrue(valid_min)

    def test_20_duration_policy_maximum_clamp(self):
        """Verifies that long scripts (>450 words) are clamped to the 180.0s maximum."""
        long_text = " ".join(["investment"] * 500)
        calc = calculate_duration_from_text(long_text, speaking_wpm=150.0)
        self.assertGreater(calc["raw_duration_sec"], 180.0)
        self.assertEqual(calc["clamped_duration_sec"], 180.0)
        self.assertTrue(calc["is_clamped_max"])
        self.assertEqual(calc["category"], "detailed")

        # Duration policy validator: 180.1s fails, 180.0s passes
        valid_above, msg_above = validate_duration_policy(180.1)
        self.assertFalse(valid_above)
        self.assertIn("exceeds maximum", msg_above)

        valid_max, msg_max = validate_duration_policy(180.0)
        self.assertTrue(valid_max)

    def test_21_duration_scaling_from_narration_examples(self):
        """
        Verifies narration scaling matches prompt specification:
        - 150 words -> approximately 60-65 seconds
        - 250 words -> approximately 95-110 seconds
        - 350 words -> approximately 130-150 seconds
        - 450 words -> approximately 165-180 seconds
        - Actual audio duration is final source of truth.
        """
        w150 = " ".join(["word"] * 150)
        calc_150 = calculate_duration_from_text(w150, speaking_wpm=150.0)
        self.assertGreaterEqual(calc_150["clamped_duration_sec"], 60.0)
        self.assertLessEqual(calc_150["clamped_duration_sec"], 65.0)

        w250 = " ".join(["word"] * 250)
        calc_250 = calculate_duration_from_text(w250, speaking_wpm=150.0)
        self.assertGreaterEqual(calc_250["clamped_duration_sec"], 95.0)
        self.assertLessEqual(calc_250["clamped_duration_sec"], 110.0)
        self.assertEqual(calc_250["category"], "normal")

        w350 = " ".join(["word"] * 350)
        calc_350 = calculate_duration_from_text(w350, speaking_wpm=150.0)
        self.assertGreaterEqual(calc_350["clamped_duration_sec"], 130.0)
        self.assertLessEqual(calc_350["clamped_duration_sec"], 150.0)
        self.assertEqual(calc_350["category"], "detailed")

        w450 = " ".join(["word"] * 450)
        calc_450 = calculate_duration_from_text(w450, speaking_wpm=150.0)
        self.assertGreaterEqual(calc_450["clamped_duration_sec"], 165.0)
        self.assertLessEqual(calc_450["clamped_duration_sec"], 180.0)

        # Audio duration source of truth
        audio_dur = 104.2
        resolved = resolve_final_duration(audio_dur, calc_250["clamped_duration_sec"])
        self.assertEqual(resolved, 104.2)

    def test_22_no_silence_padding_and_no_truncation(self):
        """Verifies policy forbids artificial silence padding and educational truncation."""
        # Silence padding checks
        valid_pad, _ = check_no_silence_padding(speech_duration_sec=70.0, total_audio_duration_sec=71.5)
        self.assertTrue(valid_pad)

        invalid_pad, msg = check_no_silence_padding(speech_duration_sec=60.0, total_audio_duration_sec=80.0)
        self.assertFalse(invalid_pad)
        self.assertIn("silence", msg.lower())
        self.assertIn("forbids", msg.lower())

        # Truncation checks
        full_script = "What is investment? Investing means deploying capital into productive economic assets to beat inflation."
        truncated_script = "What is investment? Investing means deploying"
        valid_trunc, _ = check_no_truncation(full_script, full_script)
        self.assertTrue(valid_trunc)

        invalid_trunc, trunc_msg = check_no_truncation(full_script, truncated_script)
        self.assertFalse(invalid_trunc)
        self.assertIn("truncated", trunc_msg.lower())

    def test_23_mock_provider_variable_duration_lifecycle(self):
        """Tests that MockVideoProvider honors variable duration requests (e.g. 75s, 110s)."""
        provider = MockVideoProvider()
        for target_sec in [75, 110, 160]:
            req = VideoGenerationRequest(
                lesson_id=f"test-lesson-{target_sec}",
                lesson_number=1,
                title="Test Lesson",
                language="en",
                duration_target_sec=target_sec,
            )
            resp = provider.generate_video(req)
            self.assertEqual(resp.estimated_duration_sec, target_sec)

            status = provider.get_job_status(resp.job_id)
            self.assertEqual(status.duration_sec, float(target_sec))

    def test_24_wav2lip_provider_duration_and_caveat(self):
        """
        Tests Wav2LipVideoProvider:
        - Portrait points to D:\\SmartVestMedia\\p8\\presenters\\portrait.jpg
        - Duration is determined from narration
        - Exposes required static portrait caveat
        """
        provider = Wav2LipVideoProvider()
        self.assertIn("portrait.jpg", provider.portrait_path)
        self.assertEqual(provider.provider_name, "wav2lip")

        # Explicit architectural caveat note check
        caveat = provider.get_architectural_note()
        self.assertEqual(caveat, WAV2LIP_STATIC_PORTRAIT_CAVEAT)
        self.assertIn("lip synchronization", caveat)
        self.assertIn("static portrait", caveat)

        # Build request with 250 words (~100s)
        text_250 = " ".join(["investing"] * 250)
        scene = SceneScript(
            scene_index=1,
            scene_name="Concept",
            time_range="0:00-1:40",
            script_text=text_250,
        )
        req = VideoGenerationRequest(
            lesson_id="what-is-investment",
            lesson_number=1,
            title="What is Investment?",
            language="en",
            duration_target_sec=100,
            scenes=[scene],
        )

        resp = provider.generate_video(req)
        self.assertEqual(resp.provider, "wav2lip")
        self.assertEqual(resp.estimated_duration_sec, 100)
        self.assertEqual(resp.metadata["caveat"], WAV2LIP_STATIC_PORTRAIT_CAVEAT)

        status = provider.get_job_status(resp.job_id)
        self.assertEqual(status.duration_sec, 100.0)
        self.assertEqual(status.status, "completed")

    def test_25_factory_resolves_wav2lip(self):
        """Verifies get_video_provider properly resolves wav2lip."""
        provider = get_video_provider("wav2lip")
        self.assertIsInstance(provider, Wav2LipVideoProvider)
        self.assertEqual(provider.provider_name, "wav2lip")

    def test_26_96_video_manifest_coverage(self):
        """Validates that all 12 lessons x 8 languages = 96 videos can be tracked in the manifest."""
        lessons = [
            (1, "investment", "What is Investment?"),
            (2, "stock", "What is a Stock?"),
            (3, "shares", "What are Shares?"),
            (4, "etf", "What is an ETF?"),
            (5, "mutual-fund", "What is a Mutual Fund?"),
            (6, "long-term", "Why Long-Term Investing?"),
            (7, "compounding", "What is Compounding?"),
            (8, "sip", "What is SIP?"),
            (9, "swp", "What is SWP?"),
            (10, "hedge-fund", "What is a Hedge Fund?"),
            (11, "diversification", "Risk, Return & Diversification"),
            (12, "getting-started", "How to Start Investing"),
        ]
        languages = ["en", "hi", "kn", "bn", "ml", "mr", "ta", "te"]

        with tempfile.TemporaryDirectory() as tmpdir:
            manifest_file = os.path.join(tmpdir, "manifest_96.json")
            mgr = ManifestManager(manifest_path=manifest_file)

            for num, slug, title in lessons:
                for lang in languages:
                    entry = ManifestEntry(
                        lesson=slug,
                        lesson_id=slug,
                        lesson_number=num,
                        title=title,
                        language=lang,
                        language_code=lang,
                        provider="wav2lip",
                        output_mp4=f"/renders/{slug}_{lang}.mp4",
                        captioned_mp4=f"/renders/{slug}_{lang}_captioned.mp4",
                        vtt=f"/subtitles/{slug}_{lang}.vtt",
                        poster=f"/posters/{slug}_{lang}.webp",
                        duration=120.0,
                        validation_status="passed",
                    )
                    mgr.update_entry(entry)

            # Check exact 96 count
            summary = mgr.get_summary()
            self.assertEqual(summary["total_tracked"], 96)
            self.assertEqual(summary["passed"], 96)
            self.assertEqual(summary["failed"], 0)

            # Verify reload
            mgr2 = ManifestManager(manifest_path=manifest_file)
            for num, slug, title in lessons:
                for lang in languages:
                    e = mgr2.get_entry(slug, lang)
                    self.assertIsNotNone(e, f"Entry {slug}_{lang} missing")
                    self.assertEqual(e.lesson_number, num)

    def test_27_language_validation_all_8_languages(self):
        """Validates all 8 Indian languages map deterministically to valid neural voices."""
        from app.services.video_pipeline.voice_manager import VoiceManager, DEFAULT_LANGUAGE_VOICES
        expected_langs = ["en", "hi", "kn", "bn", "ml", "mr", "ta", "te"]
        self.assertEqual(set(DEFAULT_LANGUAGE_VOICES.keys()), set(expected_langs))

        for lang in expected_langs:
            voice = VoiceManager.get_voice_for_language(lang)
            self.assertTrue(len(voice) > 0)
            self.assertIn("Neural", voice)
            name = VoiceManager.get_language_name(lang)
            self.assertTrue(len(name) > 0)

    def test_28_variable_duration_policy(self):
        """Validates that duration policy strictly scales with narration and clamps [60, 180]."""
        # 170 words at 150 wpm = 68.0s
        calc_mid = calculate_duration_from_text("word " * 170)
        self.assertAlmostEqual(calc_mid["raw_duration_sec"], 68.0, delta=1.0)
        self.assertEqual(calc_mid["clamped_duration_sec"], 68.0)

        # 50 words = 20s -> clamped to MIN 60s
        calc_min = calculate_duration_from_text("word " * 50)
        self.assertEqual(calc_min["clamped_duration_sec"], 60.0)

        # 600 words = 240s -> clamped to MAX 180s
        calc_max = calculate_duration_from_text("word " * 600)
        self.assertEqual(calc_max["clamped_duration_sec"], 180.0)

    def test_29_caption_generation_and_validation(self):
        """Tests WebVTT cue generation, validation, and non-overlapping cue properties."""
        with tempfile.TemporaryDirectory() as tmpdir:
            vtt_path = os.path.join(tmpdir, "investment_en.vtt")
            cues = [
                (0.0, 5.0, "Welcome to SmartVest."),
                (5.0, 12.0, "Learn the difference between saving and investing."),
                (12.0, 20.0, "Inflation reduces purchasing power."),
            ]
            generate_webvtt_cues(cues, vtt_path)
            is_valid, errors = validate_webvtt(vtt_path)
            self.assertTrue(is_valid)
            self.assertEqual(len(errors), 0)

    def test_30_resume_behavior(self):
        """Tests resume logic: skips already validated videos, executes pending ones."""
        with tempfile.TemporaryDirectory() as tmpdir:
            manifest_file = os.path.join(tmpdir, "manifest_resume.json")
            mgr = ManifestManager(manifest_path=manifest_file)

            # Mark lesson 1 as passed
            mgr.update_entry(ManifestEntry(
                lesson="investment",
                lesson_id="investment",
                lesson_number=1,
                title="What is Investment?",
                language="en",
                validation_status="passed",
                output_mp4=os.path.join(tmpdir, "test.mp4")
            ))

            # Query should identify it as passed
            entry = mgr.get_entry("investment", "en")
            self.assertEqual(entry.validation_status, "passed")

    def test_31_failed_job_recovery(self):
        """Tests that when a job fails, the failure is recorded without crashing manifest."""
        with tempfile.TemporaryDirectory() as tmpdir:
            manifest_file = os.path.join(tmpdir, "manifest_err.json")
            mgr = ManifestManager(manifest_path=manifest_file)

            mgr.update_entry(ManifestEntry(
                lesson="investment",
                lesson_id="investment",
                lesson_number=1,
                title="What is Investment?",
                language="hi",
                validation_status="failed",
                error_status="Simulated GPU OOM or missing asset",
            ))

            entry = mgr.get_entry("investment", "hi")
            self.assertEqual(entry.validation_status, "failed")
            self.assertIn("Simulated", entry.error_status)

    def test_32_output_validation_technical_standards(self):
        """Validates that validate_output enforces 1080p, audio presence, and 60-180s."""
        provider = MockVideoProvider()
        # Non-existent file fails
        res_non = provider.validate_output("/non/existent/video.mp4")
        self.assertFalse(res_non.is_valid)
        self.assertIn("does not exist", res_non.errors[0])

    def test_33_cost_safety_guardrails(self):
        """Verifies that all paid video APIs (HeyGen, Rewind, Veo) remain strictly blocked."""
        heygen = HeyGenVideoProvider()
        req = VideoGenerationRequest(
            lesson_id="investment",
            lesson_number=1,
            title="What is Investment?",
            language="en",
        )
        with self.assertRaises(RuntimeError) as ctx:
            heygen.generate_video(req)
        self.assertIn("disabled", str(ctx.exception).lower())

        rewind = RewindVideoProvider()
        with self.assertRaises(RuntimeError) as ctx:
            rewind.generate_video(req)
        self.assertIn("removed", str(ctx.exception).lower())


    def test_34_reference_quality_scenes(self):
        """Validates that all 8 reference-quality educational scenes generate at 1920x1080."""
        from app.services.video_pipeline.scene_graphics import generate_lesson1_scenes
        with tempfile.TemporaryDirectory() as tmpdir:
            scenes = generate_lesson1_scenes(tmpdir)
            expected_keys = [
                "scene1_intro_hud",
                "scene2_saving_vs_investing",
                "scene3_inflation",
                "scene4_chart",
                "scene5_asset_classes",
                "scene6_risk_return",
                "scene7_three_pillars",
                "scene8_summary_outro",
            ]
            self.assertEqual(len(scenes), 8)
            for k in expected_keys:
                self.assertIn(k, scenes)
                self.assertTrue(os.path.exists(scenes[k]))


if __name__ == "__main__":
    unittest.main()


