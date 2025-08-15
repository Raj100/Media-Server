import os
import uuid
import math
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from routes.downloads import  router as downloads_router
from routes.auth.auth import router as auth_router
from routes.websocket import router as websocket_endpoint
from routes.stream import router as stream_router
from config.database import Base, engine
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging
from sqlalchemy.orm import Session
from config.database import SessionLocal
from models.user import AdminUser 
from utils.authentication.password import hash_password  


load_dotenv()
env = os.getenv("ENV", "dev")
if env == "prod":
    logging.basicConfig(level=logging.WARNING)
else:
    logging.basicConfig(level=logging.DEBUG)



Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db: Session = SessionLocal()
    try:
        admin_email = "ravariyaraj@gmail.com"
        admin_name = "Raj"
        admin_password = "Raj1234!"
        existing = db.query(AdminUser).filter(AdminUser.email == admin_email).first()
        if not existing:
            default_admin = AdminUser(
                email=admin_email,
                name=admin_name,
                password=hash_password(admin_password),
                mfa_enabled=False,
            )
            db.add(default_admin)
            db.commit()
            db.refresh(default_admin)
            print(f"Default admin created: {admin_email} | Password: {admin_password} | Name: {admin_name}")
        else:
            print(f"Default admin already exists: {admin_email}")
        yield
    finally:
        db.close()



app = FastAPI(
    title="Media Server",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(downloads_router, prefix="/download", tags=["Download"])
app.include_router(stream_router, tags=["Stream"])
app.include_router(websocket_endpoint, tags=["WebSocket"])

