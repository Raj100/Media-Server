import os
import time
import jwt
import uuid
import shutil
import subprocess
from fastapi import UploadFile, HTTPException, Query,Depends, APIRouter
from fastapi.responses import FileResponse
import json
from sqlalchemy.orm import Session
from models.media import MediaItem, MediaType
from config.database import get_db

VIDEO_DIR = "./videos"
router = APIRouter()

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

VIDEO_DIR = "./videos"
os.makedirs(VIDEO_DIR, exist_ok=True)
# router.mount("/stream", StaticFiles(directory="videos"), name="stream")


# ------------------------------
# JWT Token Helpers
# ------------------------------
def create_stream_token(video_id: str, expire_seconds: int = 300):
    payload = {
        "video_id": video_id,
        "exp": time.time() + expire_seconds
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid token")



def get_video_info(path: str):
    """
    Uses ffprobe to get video width, height, duration (seconds), and bitrate (bps)
    """
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,bit_rate,duration",
        "-of", "json",
        path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    info = json.loads(result.stdout)
    stream = info["streams"][0]
    width = int(stream["width"])
    height = int(stream["height"])
    duration = float(stream.get("duration") or 0)
    bitrate = int(stream.get("bit_rate") or 0)
    return width, height, duration, bitrate

@router.post("/upload_video")
async def upload_video(file: UploadFile, db: Session = Depends(get_db)):
    video_id = str(uuid.uuid4())
    video_folder = os.path.join(VIDEO_DIR, video_id)
    os.makedirs(video_folder, exist_ok=True)

    # Save uploaded file temporarily
    temp_path = os.path.join(video_folder, file.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # --- Get video info ---
    src_w, src_h, duration, bitrate = get_video_info(temp_path)
    print(f"Video info - Resolution: {src_w}x{src_h}, Duration: {duration}s, Bitrate: {bitrate}bps")

    # --- Get file size ---
    size_bytes = os.path.getsize(temp_path)

    # --- Transcode to HLS ---
    renditions = [
        {"name": "360p", "scale": "640:360", "bitrate": "800k", "maxrate": "856k", "bufsize": "1200k", "height": 360},
        {"name": "480p", "scale": "842:480", "bitrate": "1400k", "maxrate": "1498k", "bufsize": "2100k", "height": 480},
        {"name": "720p", "scale": "1280:720", "bitrate": "2800k", "maxrate": "2996k", "bufsize": "4200k", "height": 720},
        {"name": "1080p", "scale": "1920:1080", "bitrate": "5000k", "maxrate": "5350k", "bufsize": "7500k", "height": 1080},
        {"name": "2160p", "scale": "3840:2160", "bitrate": "12000k", "maxrate": "12800k", "bufsize": "19200k", "height": 2160},
    ]
    valid_renditions = [r for r in renditions if r["height"] <= src_h]

    master_playlist_path = os.path.join(video_folder, "master.m3u8")
    with open(master_playlist_path, "w") as master:
        master.write("#EXTM3U\n")
        for r in valid_renditions:
            stream_path = os.path.join(video_folder, r["name"])
            os.makedirs(stream_path, exist_ok=True)
            playlist = os.path.join(stream_path, "index.m3u8")
            cmd = [
                "ffmpeg", "-y", "-i", temp_path,
                "-vf", f"scale={r['scale']}",
                "-c:a", "aac", "-ar", "48000", "-c:v", "h264",
                "-profile:v", "main", "-crf", "20",
                "-sc_threshold", "0",
                "-g", "48", "-keyint_min", "48",
                "-b:v", r["bitrate"], "-maxrate", r["maxrate"], "-bufsize", r["bufsize"],
                "-b:a", "128k",
                "-hls_time", "6", "-hls_playlist_type", "vod",
                "-hls_segment_filename", os.path.join(stream_path, "segment_%03d.ts"),
                playlist
            ]
            subprocess.run(cmd, check=True)

            bandwidth = int(r["bitrate"].replace("k", "")) * 1000
            width, height = r["scale"].split(":")
            master.write(f'#EXT-X-STREAM-INF:BANDWIDTH={bandwidth},RESOLUTION={width}x{height}\n{r["name"]}/index.m3u8\n')

    # Remove temp file
    os.remove(temp_path)

    # --- Save metadata to DB ---
    media_item = MediaItem(
        title=file.filename,
        type=MediaType.video,
        size=size_bytes,
        file_path=video_id,  # HLS folder
        format="hls",
        duration=duration,
        quality=f"{src_h}p",
        thumbnail=None,
        poster=None,
        meta=json.dumps({
            "width": src_w,
            "height": src_h,
            "bitrate": bitrate
        }),
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
    db.commit()
    db.refresh(media_item)

    return {
        "video_id": video_id,
        "message": "Video uploaded, transcoded to HLS, and saved in DB",
        "playlist": f"/stream/{video_id}/master.m3u8",
        "duration": duration,
        "resolution": f"{src_w}x{src_h}",
        "bitrate": bitrate
    }


# ------------------------------
# Get Dynamic Stream URL
# ------------------------------
@router.get("/get_stream_url/{video_id}")
def get_stream_url(video_id: str):
    if not os.path.exists(os.path.join(VIDEO_DIR, video_id)):
        raise HTTPException(status_code=404, detail="Video not found")

    token = create_stream_token(video_id)

    # rewrite .m3u8 so that all .ts URLs include ?token=...
    inject_token_in_m3u8(video_id, token)

    return {"url": f"http://localhost:8000/stream/{video_id}/master.m3u8?token={token}"}



# ------------------------------
# Secure Streaming Endpoint
# ------------------------------
@router.get("/stream/{video_id}/{file_path:path}")
async def stream_file(video_id: str, file_path: str, token: str = Query(...)):
    # Verify token
    # print("token",token)
    # decoded = verify_token(token) 
    # if decoded["video_id"] != video_id:
    #     raise HTTPException(status_code=403, detail="Invalid token")

    # Resolve full path
    video_folder = os.path.join(VIDEO_DIR, video_id)
    full_path = os.path.join(video_folder, file_path)

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(full_path, media_type="application/vnd.apple.mpegurl" if file_path.endswith(".m3u8") else "video/MP2T")


def inject_token_in_m3u8(video_id: str, token: str):
    video_folder = os.path.join(VIDEO_DIR, video_id)

    # Walk through master + child playlists
    for root, _, files in os.walk(video_folder):
        for file in files:
            if file.endswith(".m3u8"):
                playlist_path = os.path.join(root, file)
                with open(playlist_path, "r") as f:
                    lines = f.readlines()

                new_lines = []
                for line in lines:
                    line_strip = line.strip()
                    if line_strip.endswith(".ts"):
                        # Add token to .ts URLs
                        new_lines.append(f"{line_strip}?token={token}\n")
                    elif line_strip.endswith(".m3u8") and file == "master.m3u8":
                        # Add token to child playlists in master
                        new_lines.append(f"{line_strip}?token={token}\n")
                    else:
                        new_lines.append(line)

                with open(playlist_path, "w") as f:
                    f.writelines(new_lines)

