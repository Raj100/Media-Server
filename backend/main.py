import os
import uuid
import math
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Response
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from .utils import MEDIA_DIR, ensure_media_dir, filename_from_url, sanitize_filename
from .downloads import TASKS, WS_CONNECTIONS, broadcast_tasks, start_http_download_in_background, start_yt_dlp_download_in_background

ensure_media_dir()

app = FastAPI(title="Dive Tools - FastAPI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set specific origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/download/web")
async def download_web(payload: dict):
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="url required")
    task_id = str(uuid.uuid4())
    # start background task
    start_http_download_in_background(url, task_id)
    return {"task_id": task_id}

@app.post("/api/download/telegram")
async def download_telegram(payload: dict):
    link = payload.get("telegramLink") or payload.get("link")
    if not link:
        raise HTTPException(status_code=400, detail="telegram link required")
    task_id = str(uuid.uuid4())
    start_yt_dlp_download_in_background(link, task_id)
    return {"task_id": task_id}

@app.get("/api/tasks")
async def list_tasks():
    # return summary of TASKS
    return {"tasks": list(TASKS.values())}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # register
    WS_CONNECTIONS.add(websocket)
    # send initial snapshot
    await websocket.send_text(json_tasks_snapshot := __import__("json").dumps({"type":"tasks_snapshot","tasks":TASKS}))
    try:
        while True:
            # keep the connection alive, optionally listen for client messages
            data = await websocket.receive_text()
            # If client requests current tasks, send snapshot
            if data == "get_tasks":
                await websocket.send_text(__import__("json").dumps({"type":"tasks_snapshot","tasks":TASKS}))
    except WebSocketDisconnect:
        try:
            WS_CONNECTIONS.remove(websocket)
        except:
            pass

# Streaming endpoint supporting Range requests
@app.get("/stream/{file_path:path}")
async def stream_file(request: Request, file_path: str):
    # file_path is relative inside MEDIA_DIR
    # prevent path traversal
    safe_name = os.path.normpath(file_path)
    if safe_name.startswith(".."):
        raise HTTPException(status_code=400, detail="invalid path")
    full_path = os.path.join(MEDIA_DIR, safe_name)
    if not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="file not found")

    file_size = os.path.getsize(full_path)
    range_header = request.headers.get("range")
    if range_header is None:
        # return whole file
        return FileResponse(full_path, media_type="application/octet-stream")

    # parse range like 'bytes=START-END'
    try:
        units, range_spec = range_header.split("=")
        start_str, end_str = range_spec.split("-")
        start = int(start_str) if start_str else 0
        end = int(end_str) if end_str else file_size - 1
    except Exception:
        # malformed range; return 416
        return Response(status_code=416)

    if start >= file_size:
        return Response(status_code=416)

    chunk_size = (end - start) + 1
    def iterfile(path, start, chunk_size):
        with open(path, "rb") as f:
            f.seek(start)
            bytes_remaining = chunk_size
            while bytes_remaining > 0:
                read_len = min(4096, bytes_remaining)
                chunk = f.read(read_len)
                if not chunk:
                    break
                bytes_remaining -= len(chunk)
                yield chunk

    content_range = f"bytes {start}-{end}/{file_size}"
    headers = {
        "Content-Range": content_range,
        "Accept-Ranges": "bytes",
        "Content-Length": str(chunk_size),
        # You can detect content-type by extension if desired:
        "Content-Type": "video/mp4"
    }
    return StreamingResponse(iterfile(full_path, start, chunk_size), status_code=206, headers=headers)
