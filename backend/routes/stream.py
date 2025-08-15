import os
from fastapi import APIRouter, Query, Request, HTTPException, Depends
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Response
from utils.file import MEDIA_DIR, ensure_media_dir, filename_from_url, sanitize_filename
from fastapi.responses import StreamingResponse, FileResponse

import asyncio
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()


# Streaming endpoint supporting Range requests
@router.get("/stream/{file_path:path}")
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
        # can detect content-type by extension as desired:
        "Content-Type": "video/mp4"
    }
    return StreamingResponse(iterfile(full_path, start, chunk_size), status_code=206, headers=headers)
