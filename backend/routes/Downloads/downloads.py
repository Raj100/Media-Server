import asyncio
import os
import json
import subprocess
from typing import Dict, Any, Set
from .utils import MEDIA_DIR, ensure_media_dir, filename_from_url, sanitize_filename
import httpx
import aiofiles

ensure_media_dir()

# in-memory task registry
TASKS: Dict[str, Dict[str, Any]] = {}
WS_CONNECTIONS: Set[Any] = set()  # set of WebSocket objects

def broadcast_tasks():
    """Send current TASKS snapshot to all connected websockets (async)."""
    data = json.dumps({"type":"tasks_snapshot","tasks":TASKS})
    # schedule sends asynchronously — WS send is awaited in main to avoid import of starlette's ws here
    for ws in list(WS_CONNECTIONS):
        try:
            # ws is starlette.websockets.WebSocket; use .send_text in main
            asyncio.create_task(ws.send_text(data))
        except Exception:
            try:
                WS_CONNECTIONS.remove(ws)
            except Exception:
                pass

async def download_from_http(url: str, task_id: str):
    """Download file by streaming from url using httpx, update TASKS with progress."""
    fname = filename_from_url(url)
    fname = sanitize_filename(fname)
    dest = os.path.join(MEDIA_DIR, fname)
    TASKS[task_id] = {"id": task_id, "url": url, "filename": fname, "status": "starting", "progress": 0}
    broadcast_tasks()

    async with httpx.AsyncClient(timeout=None) as client:
        resp = await client.stream("GET", url)
        # get content-length if present
        total = int(resp.headers.get("content-length") or 0)
        downloaded = 0
        TASKS[task_id]["status"] = "downloading"
        broadcast_tasks()

        async with aiofiles.open(dest, "wb") as f:
            async for chunk in resp.aiter_bytes(1024 * 1024):  # 1 MB chunks
                await f.write(chunk)
                downloaded += len(chunk)
                if total:
                    TASKS[task_id]["progress"] = round(downloaded * 100 / total, 2)
                else:
                    # unknown total; show bytes downloaded as progress-like value capped at 100
                    TASKS[task_id]["progress"] = round(min(downloaded / (1024*1024), 100), 2)
                broadcast_tasks()

    TASKS[task_id]["status"] = "completed"
    TASKS[task_id]["progress"] = 100.0
    broadcast_tasks()
    return TASKS[task_id]

async def download_from_yt_dlp(link: str, task_id: str):
    """Use yt-dlp to download content (works for many Telegram public links)."""
    fname = f"telegram_{task_id}"
    dest_template = os.path.join(MEDIA_DIR, sanitize_filename(fname) + ".%(ext)s")
    TASKS[task_id] = {"id": task_id, "url": link, "filename": None, "status": "starting", "progress": 0}
    broadcast_tasks()

    TASKS[task_id]["status"] = "downloading"
    broadcast_tasks()

    # spawn yt-dlp and parse its stdout for progress info
    proc = await asyncio.create_subprocess_exec(
        "yt-dlp", "-o", dest_template, link,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )

    # read stdout lines asynchronously
    filename_set = None
    while True:
        line = await proc.stdout.readline()
        if not line:
            break
        text = line.decode(errors="ignore").strip()
        # parse percentage like " 12.3% "
        m = None
        import re
        m = re.search(r"(\d{1,3}\.\d)%", text)
        if m:
            try:
                TASKS[task_id]["progress"] = float(m.group(1))
            except:
                pass
            broadcast_tasks()
        # If we can detect output file name from text:
        m2 = re.search(r"Destination: (.+)", text)
        if m2:
            filename_set = os.path.basename(m2.group(1).strip())
            TASKS[task_id]["filename"] = filename_set
            broadcast_tasks()

    await proc.wait()
    if proc.returncode == 0:
        TASKS[task_id]["status"] = "completed"
        TASKS[task_id]["progress"] = 100.0
    else:
        TASKS[task_id]["status"] = "error"
    broadcast_tasks()
    return TASKS[task_id]

def start_http_download_in_background(url: str, task_id: str):
    asyncio.create_task(download_from_http(url, task_id))

def start_yt_dlp_download_in_background(link: str, task_id: str):
    asyncio.create_task(download_from_yt_dlp(link, task_id))
