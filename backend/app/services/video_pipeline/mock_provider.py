"""
SmartVest P8 — Mock Video Generation Provider
Offline test provider for pipeline validation, test suites, and dry-run demonstrations.
"""

import os
import json
import time
from typing import Optional
from .provider_base import VideoGenerationProvider
from .models import (
    VideoGenerationRequest,
    VideoJobResponse,
    VideoJobStatus,
)


class MockVideoProvider(VideoGenerationProvider):
    """
    Mock provider for offline testing and pipeline verification.
    Simulates the lifecycle of job submission, status polling, and download.
    """

    def __init__(self):
        super().__init__(provider_name="mock")
        self._jobs = {}

    def generate_video(self, request: VideoGenerationRequest) -> VideoJobResponse:
        job_id = f"mock_job_{request.lesson_id}_{request.language}_{int(time.time())}"
        self._jobs[job_id] = {
            "status": "completed",
            "request": request,
            "created_at": time.time(),
        }
        return VideoJobResponse(
            job_id=job_id,
            provider="mock",
            status="submitted",
            estimated_duration_sec=request.duration_target_sec,
            metadata={"lesson_id": request.lesson_id, "language": request.language},
        )

    def get_job_status(self, job_id: str) -> VideoJobStatus:
        if not job_id.startswith("mock_job") and job_id not in self._jobs:
            return VideoJobStatus(
                job_id=job_id,
                provider="mock",
                status="failed",
                error_message="Mock job not found",
            )
        job_info = self._jobs.get(job_id)
        dur = float(job_info["request"].duration_target_sec) if job_info else 120.0
        return VideoJobStatus(
            job_id=job_id,
            provider="mock",
            status="completed",
            progress_percentage=100.0,
            video_url=f"http://localhost:8000/mock-media/{job_id}.mp4",
            duration_sec=dur,
        )

    def download_video(self, job_id: str, output_path: str) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        # Touch mock file if not exists
        if not os.path.exists(output_path):
            with open(output_path, "wb") as f:
                f.write(b"MOCK_VIDEO_CONTAINER_PAYLOAD")
        return output_path
