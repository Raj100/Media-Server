from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr,Field
from sqlalchemy.orm import Session
from datetime import timedelta
import traceback
# from Authentication.schemas.auth import (
#     # AdminRegisterRequest,
#     UserLoginRequest,
#     TokenResponse,
#     UserResponse,
# )
from models.user import AdminUser
from config.database import get_db
from utils.authentication import jwt, password as pwd
from utils.authentication.jwt import create_reset_token, decode_reset_token
from config.settings import settings
from utils.smtp import EmailService



router = APIRouter()
service = EmailService()

class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminTokenResponse(BaseModel):
    token: str
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)

@router.post("/login", response_model=AdminTokenResponse)
def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    print("request",request)
    admin = db.query(AdminUser).filter(AdminUser.email == request.email).first()
    print("admin",admin)
    if not admin or not pwd.verify_password(request.password, admin.password):
        print(f"Failed login attempt for admin: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    token_data = {"sub": str(admin.id), "role": "PGN_ADMIN"}
    token = jwt.create_access_token(data=token_data)
    return AdminTokenResponse(token=token, email=admin.email)
