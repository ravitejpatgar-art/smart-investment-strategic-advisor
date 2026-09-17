"""
SmartVest P8 — Video Generation Manifest Manager
Manages the generation manifest on D:\\SmartVestMedia\\p8\\manifests\\manifest.json
"""

import os
import json
from typing import Dict, List, Optional
from datetime import datetime, timezone
from .models import ManifestEntry


class ManifestManager:
    """
    Manages reading, updating, and saving the generation manifest on D: drive.
    Keeps a persistent, verifiable ledger of all generation jobs and validation results.
    """

    DEFAULT_MANIFEST_PATH = r"D:\SmartVestMedia\p8\manifests\manifest.json"

    def __init__(self, manifest_path: Optional[str] = None):
        self.manifest_path = manifest_path or self.DEFAULT_MANIFEST_PATH
        os.makedirs(os.path.dirname(self.manifest_path), exist_ok=True)
        self.entries: Dict[str, ManifestEntry] = {}
        self._load()

    def _key(self, lesson_id: str, language: str) -> str:
        return f"{lesson_id}_{language}"

    def _load(self):
        if os.path.exists(self.manifest_path):
            try:
                with open(self.manifest_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for k, item in data.items():
                        self.entries[k] = ManifestEntry(**item)
            except Exception as e:
                print(f"[ManifestManager] Warning: Could not read existing manifest ({e}). Starting fresh.")
                self.entries = {}

    def save(self):
        try:
            with open(self.manifest_path, "w", encoding="utf-8") as f:
                # Use model_dump if Pydantic v2, else dict
                serializable = {}
                for k, v in self.entries.items():
                    if hasattr(v, "model_dump"):
                        serializable[k] = v.model_dump()
                    else:
                        serializable[k] = v.dict()
                json.dump(serializable, f, indent=2)
        except Exception as e:
            print(f"[ManifestManager] Error saving manifest to {self.manifest_path}: {e}")

    def get_entry(self, lesson_id: str, language: str) -> Optional[ManifestEntry]:
        return self.entries.get(self._key(lesson_id, language))

    def update_entry(self, entry: ManifestEntry) -> None:
        key = self._key(entry.lesson_id, entry.language)
        entry.updated_at = datetime.now(timezone.utc).isoformat()
        self.entries[key] = entry
        self.save()

    def list_entries(self) -> List[ManifestEntry]:
        return list(self.entries.values())

    def get_summary(self) -> Dict[str, int]:
        total = len(self.entries)
        passed = sum(1 for e in self.entries.values() if e.validation_status == "passed")
        failed = sum(1 for e in self.entries.values() if e.validation_status == "failed")
        pending = sum(1 for e in self.entries.values() if e.validation_status == "pending")
        return {
            "total_tracked": total,
            "passed": passed,
            "failed": failed,
            "pending": pending,
        }
