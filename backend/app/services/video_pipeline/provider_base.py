"""
SmartVest P8 — Video Generation Provider Interface
Abstract base class defining the provider contract for AI presenter video generation.
"""

from abc import ABC, abstractmethod
import os
import json
import subprocess
from typing import Optional, Tuple
from .models import (
    VideoGenerationRequest,
    VideoJobResponse,
    VideoJobStatus,
    ValidationResult,
)


class VideoGenerationProvider(ABC):
    """
    Abstract Video Generation Provider.
    Encapsulates cloud video generation APIs (e.g., HeyGen, Synthesia, D-ID).
    All provider implementations must implement this interface.
    """

    def __init__(self, provider_name: str):
        self.provider_name = provider_name

    @abstractmethod
    def generate_video(self, request: VideoGenerationRequest) -> VideoJobResponse:
        """
        Submit an asynchronous video generation job to the provider.
        """
        pass

    @abstractmethod
    def get_job_status(self, job_id: str) -> VideoJobStatus:
        """
        Query the current status of an ongoing video generation job.
        """
        pass

    @abstractmethod
    def download_video(self, job_id: str, output_path: str) -> str:
        """
        Download the rendered MP4 video to the local filesystem.
        Returns the absolute local path to the saved video file.
        """
        pass

    def validate_output(
        self,
        video_path: str,
        subtitle_path: Optional[str] = None,
        poster_path: Optional[str] = None,
        min_duration_sec: float = 60.0,
        max_duration_sec: float = 180.0,
        target_duration_sec: Optional[float] = None,
        duration_tolerance_sec: float = 5.0,
    ) -> ValidationResult:
        """
        Perform automated technical and quality validation on the generated video file.
        Checks:
        - File existence and non-zero size
        - Video duration between min_duration_sec (60s) and max_duration_sec (180s)
        - If target_duration_sec is supplied, verifies video duration matches narration target
        - Resolution is 1920x1080
        - Frame rate is 24 or 30 FPS
        - Audio stream exists and matches video duration
        - Associated subtitle file exists and has valid WebVTT headers
        - Associated poster image exists and is readable
        """
        res = ValidationResult(is_valid=False, video_path=video_path)

        if not os.path.exists(video_path):
            res.errors.append(f"Video file does not exist at: {video_path}")
            return res

        file_size = os.path.getsize(video_path)
        if file_size < 1024 * 1024:  # Less than 1MB
            res.errors.append(f"Video file is abnormally small ({file_size} bytes). Likely truncated or corrupt.")
            return res

        res.checks_passed.append("File exists and has valid size")

        # Inspect using ffprobe
        meta, err = self._probe_media(video_path)
        if err or not meta:
            res.errors.append(f"FFprobe inspection failed: {err}")
            return res

        # Check duration against variable policy [60.0, 180.0]
        duration = meta.get("duration", 0.0)
        res.duration_sec = duration
        if min_duration_sec <= duration <= max_duration_sec:
            res.duration_valid = True
            res.checks_passed.append(f"Duration {duration:.1f}s is within policy range ({min_duration_sec}s - {max_duration_sec}s)")
        else:
            res.duration_valid = False
            res.errors.append(f"Duration {duration:.1f}s outside policy range ({min_duration_sec}s - {max_duration_sec}s)")

        # If target duration specified from narration, verify fidelity (no excessive drift or padding)
        if target_duration_sec is not None:
            diff = abs(duration - target_duration_sec)
            if diff <= duration_tolerance_sec:
                res.checks_passed.append(
                    f"Duration {duration:.1f}s closely matches narration target ({target_duration_sec:.1f}s ±{duration_tolerance_sec}s)"
                )
            else:
                res.warnings.append(
                    f"Duration {duration:.1f}s deviates from narration target ({target_duration_sec:.1f}s) by {diff:.1f}s"
                )

        # Check resolution
        width = meta.get("width", 0)
        height = meta.get("height", 0)
        res.resolution = f"{width}x{height}"
        if width == 1920 and height == 1080:
            res.resolution_valid = True
            res.checks_passed.append("Resolution is 1920x1080")
        else:
            res.resolution_valid = False
            res.errors.append(f"Resolution {res.resolution} does not match required 1920x1080")

        # Check FPS
        fps = meta.get("fps", 0.0)
        res.fps = fps
        if 23.9 <= fps <= 30.5:
            res.fps_valid = True
            res.checks_passed.append(f"FPS {fps:.2f} is within acceptable standard (24-30 fps)")
        else:
            res.fps_valid = False
            res.warnings.append(f"FPS {fps:.2f} outside standard 24-30 fps range")

        # Check Audio
        has_audio = meta.get("has_audio", False)
        audio_dur = meta.get("audio_duration", 0.0)
        res.has_audio = has_audio
        if has_audio:
            res.checks_passed.append("Audio stream present")
            if abs(duration - audio_dur) < 2.0:
                res.audio_duration_match = True
                res.checks_passed.append(f"Audio duration ({audio_dur:.1f}s) matches video duration ({duration:.1f}s)")
            else:
                res.audio_duration_match = False
                res.warnings.append(f"Audio duration ({audio_dur:.1f}s) differs from video ({duration:.1f}s)")
        else:
            res.errors.append("No audio stream detected in video container")

        # Check Subtitles
        if subtitle_path:
            if os.path.exists(subtitle_path) and os.path.getsize(subtitle_path) > 50:
                with open(subtitle_path, "r", encoding="utf-8", errors="ignore") as f:
                    header = f.readline()
                if "WEBVTT" in header:
                    res.subtitle_exists = True
                    res.subtitle_valid = True
                    res.checks_passed.append("Subtitle file (.vtt) exists and is valid WebVTT")
                else:
                    res.errors.append("Subtitle file exists but lacks valid 'WEBVTT' header")
            else:
                res.errors.append(f"Subtitle file missing or empty at {subtitle_path}")

        # Check Poster
        if poster_path:
            if os.path.exists(poster_path) and os.path.getsize(poster_path) > 1024:
                res.poster_exists = True
                res.checks_passed.append("Poster image (.webp) exists and is valid")
            else:
                res.errors.append(f"Poster image missing or empty at {poster_path}")

        # Overall validity
        res.is_valid = len(res.errors) == 0
        return res

    def _probe_media(self, video_path: str) -> Tuple[Optional[dict], Optional[str]]:
        """
        Helper method to run ffprobe on a media file, with robust fallback to ffmpeg.
        """
        try:
            import imageio_ffmpeg
            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
            ffprobe_exe = os.path.join(os.path.dirname(ffmpeg_exe), "ffprobe.exe")
            if not os.path.exists(ffprobe_exe):
                ffprobe_exe = "ffprobe"
        except Exception:
            ffmpeg_exe = r"D:\SmartVestMedia\p8\wav2lip\bin\ffmpeg.exe"
            ffprobe_exe = "ffprobe"

        cmd = [
            ffprobe_exe,
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            video_path,
        ]

        try:
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
            if result.returncode == 0:
                data = json.loads(result.stdout)
                format_info = data.get("format", {})
                duration = float(format_info.get("duration", 0.0))

                video_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
                audio_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)

                width = int(video_stream.get("width", 0)) if video_stream else 0
                height = int(video_stream.get("height", 0)) if video_stream else 0

                fps = 0.0
                if video_stream:
                    r_frame_rate = video_stream.get("r_frame_rate", "0/0")
                    if "/" in r_frame_rate:
                        num, den = r_frame_rate.split("/")
                        if float(den) > 0:
                            fps = float(num) / float(den)

                has_audio = audio_stream is not None
                audio_duration = float(audio_stream.get("duration", duration)) if audio_stream else 0.0

                return {
                    "duration": duration,
                    "width": width,
                    "height": height,
                    "fps": fps,
                    "has_audio": has_audio,
                    "audio_duration": audio_duration,
                }, None
        except Exception:
            pass

        # Fallback to ffmpeg -i inspection
        try:
            import re
            ff_bin = ffmpeg_exe if os.path.exists(ffmpeg_exe) else r"D:\SmartVestMedia\p8\wav2lip\bin\ffmpeg.exe"
            if not os.path.exists(ff_bin):
                ff_bin = "ffmpeg"
            ff_res = subprocess.run([ff_bin, "-i", video_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
            text = ff_res.stderr

            dur_m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", text)
            duration = 0.0
            if dur_m:
                h, m, s = dur_m.groups()
                duration = int(h) * 3600 + int(m) * 60 + float(s)

            res_m = re.search(r",\s*(\d{3,4})x(\d{3,4})", text)
            width = int(res_m.group(1)) if res_m else 0
            height = int(res_m.group(2)) if res_m else 0

            fps_m = re.search(r"(\d+(?:\.\d+)?)\s*fps", text)
            fps = float(fps_m.group(1)) if fps_m else 0.0

            has_audio = bool(re.search(r"Stream #\d+:\d+.*Audio:", text))
            audio_duration = duration if has_audio else 0.0

            if duration > 0 or width > 0:
                return {
                    "duration": duration,
                    "width": width,
                    "height": height,
                    "fps": fps,
                    "has_audio": has_audio,
                    "audio_duration": audio_duration,
                }, None
            return None, "Unable to parse media stream metadata from ffmpeg output"
        except Exception as e:
            return None, str(e)
