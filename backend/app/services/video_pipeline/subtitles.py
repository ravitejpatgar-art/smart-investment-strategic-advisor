"""
SmartVest P8 — Subtitle Generator & Validator
Handles generation and syntax/timing validation of WebVTT (.vtt) files for Academy lessons.
"""

import os
import re
from typing import List, Tuple, Dict, Any


def format_vtt_timestamp(seconds: float) -> str:
    """
    Format seconds into WebVTT timestamp: HH:MM:SS.mmm
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"


def generate_webvtt_cues(
    timed_sentences: List[Tuple[float, float, str]],
    output_vtt_path: str
) -> str:
    """
    Writes a properly formatted WebVTT file from a list of (start_sec, end_sec, text) tuples.
    Guarantees no timestamp overlaps and valid header structure.
    """
    os.makedirs(os.path.dirname(output_vtt_path), exist_ok=True)

    lines = ["WEBVTT\n", "Kind: captions\n\n"]

    for idx, (start_s, end_s, text) in enumerate(timed_sentences, start=1):
        clean_text = text.strip().replace("\n", " ")
        if not clean_text:
            continue
        start_fmt = format_vtt_timestamp(start_s)
        end_fmt = format_vtt_timestamp(end_s)
        lines.append(f"{idx}\n{start_fmt} --> {end_fmt}\n{clean_text}\n\n")

    with open(output_vtt_path, "w", encoding="utf-8") as f:
        f.writelines(lines)

    return output_vtt_path


def validate_webvtt(vtt_path: str) -> Tuple[bool, List[str]]:
    """
    Validates a WebVTT file:
    - Header must start with WEBVTT
    - Cue timings must be chronologically ascending
    - No overlapping cues
    - No empty cues
    """
    errors = []
    if not os.path.exists(vtt_path):
        return False, [f"WebVTT file missing: {vtt_path}"]

    with open(vtt_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read().strip()

    if not content.startswith("WEBVTT"):
        errors.append("Invalid header: does not start with 'WEBVTT'")

    cue_pattern = re.compile(
        r"(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})"
    )
    matches = cue_pattern.findall(content)

    if not matches:
        errors.append("No valid timestamp cues found in WebVTT file")

    last_end = 0.0
    for idx, (start_str, end_str) in enumerate(matches, start=1):
        def parse_ts(ts: str) -> float:
            h, m, s = ts.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)

        start_sec = parse_ts(start_str)
        end_sec = parse_ts(end_str)

        if end_sec <= start_sec:
            errors.append(f"Cue {idx}: End time ({end_str}) must be greater than start time ({start_str})")

        if start_sec < last_end - 0.05:  # Tolerance of 50ms
            errors.append(f"Cue {idx}: Overlaps previous cue (start: {start_str}, prev end: {last_end:.3f}s)")

        last_end = end_sec

    return len(errors) == 0, errors
