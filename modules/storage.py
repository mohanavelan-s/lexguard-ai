import os
import secrets
from datetime import datetime
from pathlib import Path

from werkzeug.utils import secure_filename

from modules.database import DATA_DIR


def _get_upload_dir():
    configured_dir = os.getenv("LEXGUARD_UPLOAD_DIR")
    upload_dir = Path(configured_dir) if configured_dir else DATA_DIR / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


UPLOAD_DIR = _get_upload_dir()


def build_upload_name(original_name, prefix):
    safe_name = secure_filename(original_name or "")
    extension = Path(safe_name).suffix if safe_name else ""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"{prefix}_{timestamp}_{secrets.token_hex(4)}{extension}"


def save_uploaded_file(file_storage, prefix="upload"):
    filename = build_upload_name(file_storage.filename, prefix)
    file_path = UPLOAD_DIR / filename
    file_storage.save(file_path)
    return file_path, filename


def get_storage_backend():
    return "filesystem"

