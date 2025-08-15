from fastapi import APIRouter, Query, Request, HTTPException, Depends

from utils.file import MEDIA_DIR, ensure_media_dir, filename_from_url, sanitize_filename
from services.downloads import TASKS, WS_CONNECTIONS, broadcast_tasks, start_http_download_in_background, start_yt_dlp_download_in_background
import asyncio
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()
ensure_media_dir()


@router.post("/web")
async def download_web(payload: dict):
    url = payload.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="url required")
    task_id = str(uuid.uuid4())
    # start background task
    start_http_download_in_background(url, task_id)
    return {"task_id": task_id}

@router.post("/telegram")
async def download_telegram(payload: dict):
    link = payload.get("telegramLink") or payload.get("link")
    if not link:
        raise HTTPException(status_code=400, detail="telegram link required")
    task_id = str(uuid.uuid4())
    start_yt_dlp_download_in_background(link, task_id)
    return {"task_id": task_id}

@router.get("/tasks")
async def list_tasks():
    return {"tasks": list(TASKS.values())}