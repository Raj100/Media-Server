import os
import time
import jwt
import uuid
import shutil
import subprocess
from fastapi import FastAPI, UploadFile, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
from routes.downloads import  router as downloads_router
from routes.auth.auth import router as auth_router
from routes.websocket import router as websocket_endpoint
from routes.stream import router as stream_router
from routes.media import router as media_router
from routes.server import router as server_router
from backend.routes.normal_video import router as video_router
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

VIDEO_DIR = "./videos"
os.makedirs(VIDEO_DIR, exist_ok=True)
# app.mount("/stream", StaticFiles(directory="videos"), name="stream")


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


# ------------------------------
# Upload Endpoint
# ------------------------------
def get_video_resolution(path: str):
    """Return (width, height) of input video using ffprobe"""
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "json",
        path
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    info = json.loads(result.stdout)
    width = info["streams"][0]["width"]
    height = info["streams"][0]["height"]
    return width, height

@app.post("/upload_video")
async def upload_video(file: UploadFile):
    video_id = str(uuid.uuid4())
    video_folder = os.path.join(VIDEO_DIR, video_id)
    os.makedirs(video_folder, exist_ok=True)

    # Save uploaded file temporarily
    temp_path = os.path.join(video_folder, file.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # --- Get original resolution ---
    src_w, src_h = get_video_resolution(temp_path)
    print(f"Source resolution: {src_w}x{src_h}")

    renditions = [
        {"name": "360p", "scale": "640:360", "bitrate": "800k", "maxrate": "856k", "bufsize": "1200k", "height": 360},
        {"name": "480p", "scale": "842:480", "bitrate": "1400k", "maxrate": "1498k", "bufsize": "2100k", "height": 480},
        {"name": "720p", "scale": "1280:720", "bitrate": "2800k", "maxrate": "2996k", "bufsize": "4200k", "height": 720},
        {"name": "1080p", "scale": "1920:1080", "bitrate": "5000k", "maxrate": "5350k", "bufsize": "7500k", "height": 1080},
        {"name": "2160p", "scale": "3840:2160", "bitrate": "12000k", "maxrate": "12800k", "bufsize": "19200k", "height": 2160},
    ]

    # Filter renditions ≤ source height
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
            master.write(
            f'#EXT-X-STREAM-INF:BANDWIDTH={bandwidth},RESOLUTION={width}x{height}\n'
            f'{r["name"]}/index.m3u8\n')

    os.remove(temp_path)

    return {
        "video_id": video_id,
        "message": "Video uploaded and transcoded successfully",
        "playlist": f"/stream/{video_id}/master.m3u8"
    }


# ------------------------------
# Get Dynamic Stream URL
# ------------------------------
@app.get("/get_stream_url/{video_id}")
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
@app.get("/stream/{video_id}/{file_path:path}")
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



app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(downloads_router, prefix="/download", tags=["Download"])
app.include_router(stream_router, tags=["Stream"])
app.include_router(websocket_endpoint, tags=["WebSocket"])
app.include_router(media_router,prefix="/media", tags=["Media"])
app.include_router(server_router, tags=["Server"])
app.include_router(video_router, tags=["Video"])