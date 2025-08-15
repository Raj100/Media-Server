from fastapi import APIRouter, Query, Request, HTTPException, Depends
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Response

import asyncio
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws")
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