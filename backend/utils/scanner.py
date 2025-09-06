import os
import subprocess
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



def scan_first_level_hls_folders(db: Session, media_dir: str = "./videos"):
    media_path = Path(media_dir).resolve()
    if not media_path.exists():
        print(f"Media directory {media_path} does not exist.")
        return

    print(f"Scanning first-level folders in: {media_path}")

    added_videos = []

    for folder in media_path.iterdir():
        if not folder.is_dir():
            continue  # skip files

        video_id = folder.name

        # Skip if already exists in DB
        existing = db.query(MediaItem).filter(MediaItem.file_path == video_id).first()
        if existing:
            continue

        media_item = MediaItem(
            title=video_id,
            type=MediaType.video,
            size=0,
            file_path=video_id,  # store folder name / id
            format="hls",
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
            category="general",
            tags=[]
        )

        db.add(media_item)
        added_videos.append(video_id)

    if added_videos:
        db.commit()
        print(f"Added HLS videos: {added_videos}")
    else:
        print("No new HLS videos found.")


def update_existing_thumbnails(db: Session, videos_dir: str = "./videos", thumbs_dir: str = "./thumbnails"):
    videos_path = Path(videos_dir)
    for folder in videos_path.iterdir():
        if not folder.is_dir():
            continue
        
        media_item = db.query(MediaItem).filter(MediaItem.file_path == folder.name).first()
        if not media_item or media_item.thumbnail:
            continue  # already has thumbnail

        thumb_path = Path(thumbs_dir) / f"{folder.name}.jpg"
        success = generate_thumbnail_from_hls(folder, thumb_path)
        if success:
            media_item.thumbnail = f"/thumbnails/{folder.name}.jpg"
            db.add(media_item)

    db.commit()
    print("Thumbnails updated for existing videos.")

def generate_thumbnail_from_hls(hls_folder: str, thumb_path: str, segment_index: int = 000):
    """
    Generates a thumbnail from the first segment of an HLS folder.
    """
    hls_folder = Path(hls_folder)
    segment_file = hls_folder/ f"360p/segment_{segment_index:03d}.ts"
    print(segment_file)
    if not segment_file.exists():
        print(f"No segment found in {hls_folder}")
        return False

    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-i", str(segment_file),
        "-ss", "00:00:01",    # 1 second into the video
        "-vframes", "1",
        "-q:v", "2",
        str(thumb_path)
    ]
    subprocess.run(cmd, check=True)
    return True