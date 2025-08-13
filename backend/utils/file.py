import os
import re
from pathlib import Path
from urllib.parse import urlparse

MEDIA_DIR = os.getenv("MEDIA_DIR", "/media/data")

def ensure_media_dir():
    Path(MEDIA_DIR).mkdir(parents=True, exist_ok=True)

def sanitize_filename(name: str) -> str:
    name = re.sub(r"[^\w\-.() ]+", "_", name)
    return name

def filename_from_url(url: str) -> str:
    p = urlparse(url)
    fname = os.path.basename(p.path) or f"file_{abs(hash(url))}"
    return sanitize_filename(fname)
