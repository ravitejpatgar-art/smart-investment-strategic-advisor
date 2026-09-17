#!/usr/bin/env python3
"""
SmartVest P8 — Video Generation Pipeline CLI Runner
Command-line interface to orchestrate, track, and validate genuine AI presenter videos.
Uses D:\\SmartVestMedia\\p8\\ for all temporary renders and manifest tracking.
"""

import sys
import os
import argparse
import json

# Ensure project root & backend are in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Try loading root .env and backend/.env safely without committing it
try:
    from dotenv import load_dotenv
    for env_candidate in [
        os.path.join(PROJECT_ROOT, ".env"),
        os.path.join(BACKEND_DIR, ".env"),
    ]:
        if os.path.exists(env_candidate):
            load_dotenv(env_candidate, override=True)
except ImportError:
    pass

from app.services.video_pipeline import (
    VideoPipelineOrchestrator,
    get_video_provider,
    ManifestManager,
    validate_webvtt,
)


def main():
    parser = argparse.ArgumentParser(
        description="SmartVest P8 AI Talking-Presenter Video Generation Pipeline CLI"
    )
    parser.add_argument(
        "--batch",
        action="store_true",
        help="Execute batch production for all 96 videos (or filtered subset)",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume batch run, skipping already validated videos in the manifest",
    )
    parser.add_argument(
        "--lesson",
        type=int,
        help="Filter generation to a specific lesson number (1-12)",
    )
    parser.add_argument(
        "--language",
        type=str,
        help="Filter generation to a specific language code (en, hi, kn, bn, ml, mr, ta, te)",
    )
    parser.add_argument(
        "--phase-a",
        action="store_true",
        help="Execute Phase A: generate ONE English Lesson 1 prototype and stop for manual review",
    )
    parser.add_argument(
        "--provider",
        type=str,
        default=None,
        help="Video generation provider ('mock', 'wav2lip'). Defaults to VIDEO_PROVIDER env var or 'wav2lip'.",
    )
    parser.add_argument(
        "--auth-check",
        action="store_true",
        help="Perform non-destructive authentication and connectivity check against the video provider without generating a video",
    )
    parser.add_argument(
        "--status",
        nargs="?",
        const="summary",
        default=None,
        metavar="JOB_ID",
        help="Display batch progress summary or query status of an existing video generation job",
    )
    parser.add_argument(
        "--validate",
        type=str,
        metavar="VIDEO_PATH",
        help="Run full automated quality validation on a video file",
    )
    parser.add_argument(
        "--subtitle",
        type=str,
        metavar="SUBTITLE_PATH",
        help="Accompanying subtitle file path for validation",
    )
    parser.add_argument(
        "--poster",
        type=str,
        metavar="POSTER_PATH",
        help="Accompanying poster image path for validation",
    )
    parser.add_argument(
        "--manifest",
        action="store_true",
        help="Display the current manifest summary from D:\\SmartVestMedia\\p8\\manifests\\manifest.json",
    )

    args = parser.parse_args()

    # 1. Status / Manifest summary
    if args.manifest or (args.status and args.status == "summary"):
        mgr = ManifestManager()
        summary = mgr.get_summary()
        entries = mgr.list_entries()
        print("\n=== SMARTVEST VIDEO GENERATION MANIFEST ===")
        print(f"Location: {mgr.manifest_path}")
        print(f"Summary: {json.dumps(summary, indent=2)}")
        print("\nTracked Entries:")
        for e in entries:
            print(f" - [{e.validation_status.upper()}] Lesson {e.lesson_number} ({e.language}): {e.title} -> {e.video_path or e.output_mp4 or 'No path'}")
        return

    # 2. Status for specific Job ID
    if args.status and args.status != "summary":
        provider = get_video_provider(args.provider)
        print(f"Querying status for job '{args.status}' via provider '{provider.provider_name}'...")
        status = provider.get_job_status(args.status)
        print(json.dumps(status.model_dump(), indent=2))
        if status.status == "completed" and status.video_url:
            target_file = os.path.join(r"D:\SmartVestMedia\p8\renders", f"{args.status}.mp4")
            print(f"Job completed! Downloading to: {target_file}...")
            provider.download_video(args.status, target_file)
            print(f"Download complete: {target_file}")
        return

    # 3. Authentication Check (non-destructive)
    if args.auth_check:
        provider = get_video_provider(args.provider)
        print(f"\nPerforming authentication check for provider: '{provider.provider_name.upper()}'...")
        if hasattr(provider, "check_authentication"):
            res = provider.check_authentication()
            print(json.dumps(res, indent=2))
            if res.get("authenticated"):
                print("\n>>> AUTHENTICATION CHECK PASSED: Provider credentials and connectivity verified.")
                sys.exit(0)
            else:
                print(f"\n>>> AUTHENTICATION CHECK FAILED: {res.get('message', 'Auth failed')}")
                sys.exit(1)
        else:
            print(f"Provider '{provider.provider_name}' does not require remote authentication check.")
            sys.exit(0)

    # 4. Output Validation
    if args.validate:
        provider = get_video_provider(args.provider or "mock")
        print(f"\nValidating video asset: {args.validate}...")
        res = provider.validate_output(
            video_path=args.validate,
            subtitle_path=args.subtitle,
            poster_path=args.poster,
        )
        print(json.dumps(res.model_dump(), indent=2))
        if res.is_valid:
            print("\n>>> VALIDATION PASSED: Asset meets all technical standards (60-180s, 1080p, audio).")
            sys.exit(0)
        else:
            print("\n>>> VALIDATION FAILED: See errors listed above.")
            sys.exit(1)

    # 5. Phase A Execution: ONE English Lesson 1 prototype and stop
    if args.phase_a:
        if args.provider == "mock":
            orchestrator = VideoPipelineOrchestrator(provider_name="mock")
            result = orchestrator.execute_phase_a_prototype()
            print(json.dumps(result, indent=2))
            return

        print("\n========================================================")
        print("EXECUTING PHASE A: ONE ENGLISH LESSON 1 PROTOTYPE")
        print("========================================================")
        print("Target: Lesson 1 'What is Investment?' (English)")
        print("Provider: WAV2LIP (Local CPU, zero-cost, free edge-tts audio)")
        print("Storage: D:\\SmartVestMedia\\p8\\")
        print("Note: STOPS after Lesson 1 for manual quality review before scaling to 96 videos.\n")

        from scripts.run_p8_execution import main as run_phase_a
        run_phase_a()
        return

    # 6. Batch Execution
    if args.batch:
        print("\n========================================================")
        print("SMARTVEST P8 - BATCH VIDEO GENERATION PIPELINE")
        print("========================================================")
        mgr = ManifestManager()
        print(f"Manifest ledger: {mgr.manifest_path}")
        print(f"Filter - Lesson: {args.lesson or 'ALL (1-12)'}, Language: {args.language or 'ALL (8 languages)'}")
        print(f"Resume mode: {'ENABLED (skipping passed videos)' if args.resume else 'DISABLED'}")
        print("\n[SAFETY GATE NOTE]: As per strict production protocol, batch execution of all 96 videos")
        print("requires explicit manual approval of Lesson 1 English prototype before mass generation.")
        return

    parser.print_help()


if __name__ == "__main__":
    main()
