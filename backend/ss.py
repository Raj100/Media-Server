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
@app.post("/upload_video")
async def upload_video(file: UploadFile):
    # Give video a unique ID
    video_id = str(uuid.uuid4())
    video_folder = os.path.join(VIDEO_DIR, video_id)
    os.makedirs(video_folder, exist_ok=True)

    # Save uploaded file temporarily
    temp_path = os.path.join(video_folder, file.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Convert to HLS using ffmpeg
    hls_path = os.path.join(video_folder, "index.m3u8")
    cmd = [
        "ffmpeg", "-i", temp_path,
        "-profile:v", "baseline", "-level", "3.0",
        "-start_number", "0",
        "-hls_time", "10",
        "-hls_list_size", "0",
        "-f", "hls", hls_path
        ]
    subprocess.run(cmd, check=True)

    # Remove original uploaded file (keep only HLS output)
    os.remove(temp_path)

    return {
        "video_id": video_id,
        "message": "Video uploaded and processed successfully"
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

    return {"url": f"http://localhost:8000/stream/{video_id}/index.m3u8?token={token}"}



# ------------------------------
# Secure Streaming Endpoint
# ------------------------------
@app.get("/stream/{video_id}/{file_name}")
def stream_video(video_id: str, file_name: str, token: str = Query(...)):
    decoded = verify_token(token)
    if decoded["video_id"] != video_id:
        raise HTTPException(status_code=403, detail="Unauthorized access")

    file_path = os.path.join(VIDEO_DIR, video_id, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    if file_name.endswith(".m3u8"):
        media_type = "application/vnd.apple.mpegurl"
    elif file_name.endswith(".ts"):
        media_type = "video/mp2t"
    else:
        media_type = "application/octet-stream"

    return FileResponse(file_path, media_type=media_type)

def inject_token_in_m3u8(video_id: str, token: str):
    playlist_path = os.path.join(VIDEO_DIR, video_id, "index.m3u8")
    with open(playlist_path, "r") as f:
        lines = f.readlines()

    new_lines = []
    for line in lines:
        if line.strip().endswith(".ts"):  # segment line
            new_lines.append(f"{line.strip()}?token={token}\n")
        else:
            new_lines.append(line)

    with open(playlist_path, "w") as f:
        f.writelines(new_lines)