import os
from pathlib import Path
from sqlalchemy.orm import Session
from typing import List
from models.media import MediaItem, MediaType

def scan_and_update_media(db: Session, media_dir: str = "media/data"):
    """
    Scans the media directory, detects media files, and updates the database.
    """
    media_path = Path(media_dir).resolve()  # convert to absolute path
    if not media_path.exists():
        print(f"Media directory {media_path} does not exist.")
        return

    print(f"Scanning directory: {media_path}")

    # Supported file extensions
    video_exts = {".mp4", ".mkv", ".avi", ".mov"}
    music_exts = {".mp3", ".flac", ".wav", ".aac"}

    added_files = []

    for file in media_path.iterdir():  # just direct files in folder
        if not file.is_file():
            continue

        ext = file.suffix.lower()
        size = file.stat().st_size
        file_format = ext[1:] if ext else "unknown"

        if ext in video_exts:
            media_type = MediaType.video
            category = "general"
        elif ext in music_exts:
            media_type = MediaType.music
            category = None
        else:
            continue  # unsupported file type

        # Check if already exists
        existing = db.query(MediaItem).filter(MediaItem.file_path == str(file)).first()
        if existing:
            continue

        media_item = MediaItem(
            title=file.stem,
            type=media_type,
            size=size,
            file_path=str(file),
            format=file_format,
            duration=None,
            thumbnail=None,
            poster=None,
            quality=None,
            meta=None,
            year=None,
            genre=[],
            director=None,
            cast=[],
            rating=None,
            description=None,
            trailer=None,
            artist=None,
            album=None,
            track_number=None,
            lyrics=None,
            category=category,
            tags=[]
        )

        db.add(media_item)
        added_files.append(file.name)

    if added_files:
        db.commit()
        print(f"Added files: {added_files}")
    else:
        print("No new media files found.")
