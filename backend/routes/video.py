from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from models.media import MediaItem, MediaType
from config.database import get_db
from uuid import UUID
import os

router = APIRouter()

def iter_file(file_path: str, start: int = 0, end: int = None, chunk_size: int = 1024*1024):
    """Yield chunks of a file between start and end."""
    with open(file_path, "rb") as f:
        f.seek(start)
        remaining = (end - start + 1) if end is not None else None
        while True:
            read_size = chunk_size if remaining is None else min(chunk_size, remaining)
            data = f.read(read_size)
            if not data:
                break
            if remaining is not None:
                remaining -= len(data)
            yield data

@router.get("/video/{video_id}")
def stream_video(video_id: UUID, request: Request, db: Session = Depends(get_db)):
    """Stream video by UUID with HTTP Range support"""
    video = db.query(MediaItem).filter(MediaItem.id == str(video_id), MediaItem.type == MediaType.video).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    file_path = video.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video file missing on server")

    file_size = os.path.getsize(file_path)
    range_header = request.headers.get("range")
    
    if range_header:
        # Parse range: bytes=start-end
        range_val = range_header.strip().lower().replace("bytes=", "").split("-")
        start = int(range_val[0])
        end = int(range_val[1]) if len(range_val) > 1 and range_val[1] else file_size - 1

        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(end - start + 1),
            "Content-Type": "video/mp4",
        }
        return StreamingResponse(iter_file(file_path, start=start, end=end), status_code=206, headers=headers)
    else:
        # Full content fallback
        headers = {
            "Content-Length": str(file_size),
            "Content-Type": "video/mp4",
            "Accept-Ranges": "bytes",
        }
        return StreamingResponse(iter_file(file_path), headers=headers)
