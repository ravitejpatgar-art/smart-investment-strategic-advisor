"""
SmartVest P8 — Video Generation Pipeline Models
Data models for the provider-based AI presenter video generation pipeline.
"""

from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field
from datetime import datetime, timezone


def get_utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class SceneScript(BaseModel):
    scene_index: int
    scene_name: str  # Opening, Concept, Explanation, Real-World Example, Key Takeaways, SmartVest Outro
    time_range: str  # e.g., "0:00-0:15"
    script_text: str
    camera_shot: str = "medium"  # medium, medium-wide, close-up, presenter-chart, side-angle
    visual_action: str = ""  # Description of presenter gesture & graphic interaction
    graphic_elements: List[str] = Field(default_factory=list)


class VideoGenerationRequest(BaseModel):
    lesson_id: str
    lesson_number: int
    title: str
    language: str = "en"
    duration_target_sec: int = 120  # Variable duration: 60-180s determined by narration length
    avatar_id: Optional[str] = None
    voice_id: Optional[str] = None
    scenes: List[SceneScript] = Field(default_factory=list)
    output_dir: str = r"D:\SmartVestMedia\p8\renders"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class VideoJobResponse(BaseModel):
    job_id: str
    provider: str
    status: str  # submitted, pending, processing, completed, failed
    created_at: str = Field(default_factory=get_utc_now_iso)
    estimated_duration_sec: int = 120  # Variable duration: 60-180s
    metadata: Dict[str, Any] = Field(default_factory=dict)


class VideoJobStatus(BaseModel):
    job_id: str
    provider: str
    status: str  # pending, processing, completed, failed
    progress_percentage: float = 0.0
    video_url: Optional[str] = None
    duration_sec: Optional[float] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ValidationResult(BaseModel):
    is_valid: bool
    video_path: str
    duration_sec: float = 0.0
    duration_valid: bool = False  # Must be 60-180s determined by narration length
    resolution: str = ""  # Expected "1920x1080"
    resolution_valid: bool = False
    fps: float = 0.0
    fps_valid: bool = False
    has_audio: bool = False
    audio_duration_match: bool = False
    subtitle_exists: bool = False
    subtitle_valid: bool = False
    poster_exists: bool = False
    checks_passed: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class ManifestEntry(BaseModel):
    lesson_id: str = ""
    lesson: str = ""
    lesson_number: int = 1
    title: str = ""
    language: str = "en"
    language_code: str = ""
    provider: str = "wav2lip"
    renderer: str = "wav2lip_cpu"
    job_id: Optional[str] = None
    video_path: Optional[str] = None
    output_mp4: Optional[str] = None
    captioned_mp4: Optional[str] = None
    subtitle_path: Optional[str] = None
    vtt: Optional[str] = None
    poster_path: Optional[str] = None
    poster: Optional[str] = None
    duration: float = 0.0
    narration_duration: float = 0.0
    narration_word_count: int = 0
    voice: str = ""
    presenter_source: str = r"D:\SmartVestMedia\p8\presenters\portrait.jpg"
    resolution: str = "1920x1080"
    fps: float = 25.0
    frame_rate: float = 25.0
    audio_status: str = "valid"
    lip_sync_status: str = "verified"
    validation_status: str = "pending"  # passed, failed, pending, submitted
    render_time: float = 0.0
    error_status: Optional[str] = None
    human_motion_notes: Optional[str] = None
    timestamp: str = Field(default_factory=get_utc_now_iso)
    updated_at: str = Field(default_factory=get_utc_now_iso)

    def __init__(self, **data):
        # Synchronize field aliases seamlessly
        if "lesson_id" in data and "lesson" not in data:
            data["lesson"] = data["lesson_id"]
        elif "lesson" in data and "lesson_id" not in data:
            data["lesson_id"] = data["lesson"]

        if "language" in data and "language_code" not in data:
            data["language_code"] = data["language"]
        elif "language_code" in data and "language" not in data:
            data["language"] = data["language_code"]

        if "video_path" in data and "output_mp4" not in data:
            data["output_mp4"] = data["video_path"]
        elif "output_mp4" in data and "video_path" not in data:
            data["video_path"] = data["output_mp4"]

        if "subtitle_path" in data and "vtt" not in data:
            data["vtt"] = data["subtitle_path"]
        elif "vtt" in data and "subtitle_path" not in data:
            data["subtitle_path"] = data["vtt"]

        if "poster_path" in data and "poster" not in data:
            data["poster"] = data["poster_path"]
        elif "poster" in data and "poster_path" not in data:
            data["poster_path"] = data["poster"]

        if "duration" in data and "narration_duration" not in data:
            data["narration_duration"] = data["duration"]
        elif "narration_duration" in data and "duration" not in data:
            data["duration"] = data["narration_duration"]

        if "fps" in data and "frame_rate" not in data:
            data["frame_rate"] = data["fps"]
        elif "frame_rate" in data and "fps" not in data:
            data["fps"] = data["frame_rate"]

        super().__init__(**data)
