from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr,Field
from sqlalchemy.orm import Session
from datetime import timedelta
import traceback
from datetime import datetime
from typing import Optional, Literal
from models.user import AdminUser, Nuser
from config.database import get_db
from utils.authentication import jwt, password as pwd
from utils.authentication.jwt import create_reset_token, decode_reset_token
from config.settings import settings
from utils.smtp import EmailService
from tasks.scheduler import check_and_store_server_health



router = APIRouter()
service = EmailService()

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class PublicUser(BaseModel):
    name: str
    email: str
    role: Literal["ADMIN", "USER"]
    mfa_enabled: bool
    createdAt: datetime

class AdminTokenResponse(BaseModel):
    success: bool
    user: PublicUser
    token: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)

@router.post("/login", response_model=AdminTokenResponse)
async def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    print("request",request)
    admin = db.query(AdminUser).filter(AdminUser.email == request.email).first()
    if admin and pwd.verify_password(request.password, admin.password):
        # print(f"Failed login attempt for admin: {request.email}")
        # raise HTTPException(
        #     status_code=status.HTTP_401_UNAUTHORIZED, error="Invalid credentials" ,detail="Invalid credentials"
        # )
        token_data = {"sub": str(admin.id), "role": "ADMIN"}
        token = jwt.create_access_token(data=token_data)
    
        user_data = PublicUser(
            name=admin.name,
            email=admin.email,
            role="ADMIN",
            mfa_enabled=admin.mfa_enabled,
            createdAt=admin.created_at
        )
        return AdminTokenResponse(success=True,user=user_data,token=token,role="ADMIN")
    
    user = db.query(Nuser).filter(Nuser.email == request.email).first()
    if user and pwd.verify_password(request.password, user.password):
        token_data = {"sub": str(user.id), "role": "USER"}
        token = jwt.create_access_token(data=token_data)
    
        user_data = PublicUser(
            name=user.name,
            email=user.email,
            role="USER",
            mfa_enabled=user.mfa_enabled,
            createdAt=user.created_at
        )
        return AdminTokenResponse(success=True,user=user_data,token=token,role="USER")
    
    print(f"Failed login attempt for admin: {request.email}")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, error="Invalid credentials" ,detail="Invalid credentials"
    )
