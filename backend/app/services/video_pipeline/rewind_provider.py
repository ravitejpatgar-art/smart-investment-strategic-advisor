"""
SmartVest P8 — Deprecated Rewind AI Video Generation Provider
Rewind has been removed from the active P8 video pipeline.
"""

from typing import Optional, Dict, Any
from .provider_base import VideoGenerationProvider
from .models import VideoGenerationRequest, VideoJobResponse, VideoJobStatus


class RewindVideoProvider(VideoGenerationProvider):
    """
    Deprecated Rewind video provider stub.
    Rewind AI has been removed from the active SmartVest P8 video pipeline.
    """

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(provider_name="rewind")
        self.api_key = api_key or ""

    def check_authentication(self) -> Dict[str, Any]:
        return {
            "authenticated": False,
            "provider": "rewind",
            "message": "Rewind video provider has been removed from the active P8 video pipeline.",
        }

    def generate_video(self, request: VideoGenerationRequest) -> VideoJobResponse:
        raise RuntimeError(
            "Rewind video provider has been removed from the active P8 video pipeline."
        )

    def get_job_status(self, job_id: str) -> VideoJobStatus:
        raise RuntimeError(
            "Rewind video provider has been removed from the active P8 video pipeline."
        )

    def download_video(self, job_id: str, output_path: str) -> str:
        raise RuntimeError(
            "Rewind video provider has been removed from the active P8 video pipeline."
        )
