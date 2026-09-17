"""
SmartVest P8 — Deprecated HeyGen Video Generation Provider
HeyGen has been removed from the active P8 video pipeline.
"""

from typing import Optional
from .provider_base import VideoGenerationProvider
from .models import VideoGenerationRequest, VideoJobResponse, VideoJobStatus


class HeyGenVideoProvider(VideoGenerationProvider):
    """
    Deprecated HeyGen provider stub.
    HeyGen is disabled in the SmartVest P8 video pipeline.
    """

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(provider_name="heygen")
        self.api_key = api_key

    def generate_video(self, request: VideoGenerationRequest) -> VideoJobResponse:
        raise RuntimeError(
            "HeyGen video provider has been disabled in the P8 video pipeline."
        )

    def get_job_status(self, job_id: str) -> VideoJobStatus:
        raise RuntimeError(
            "HeyGen video provider has been disabled in the P8 video pipeline."
        )

    def download_video(self, job_id: str, output_path: str) -> str:
        raise RuntimeError(
            "HeyGen video provider has been disabled in the P8 video pipeline."
        )
