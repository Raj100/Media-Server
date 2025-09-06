from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import Optional, Literal
from models.user import AdminUser, Nuser
from config.database import get_db
from utils.authentication import jwt, password as pwd
from config.settings import settings
from httpx_oauth.clients.google import GoogleOAuth2
from jose import jwk ,jwt as jose_jwt # Renamed to avoid conflict
from fastapi.responses import RedirectResponse
import httpx

# --- Configuration ---


# The redirect URI on your FRONTEND

# FIX: Remove redirect_uri from the constructor.
# The redirect URI is passed to the methods that need it.
client = GoogleOAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

router = APIRouter()
jwks_cache = None


# --- Pydantic Models and other code (same as before) ---
class AdminLoginRequest(BaseModel):
    email: str
    password: str

class PublicUser(BaseModel):
    name: str
    email: str
    role: Literal["ADMIN", "USER"]
    mfa_enabled: bool
    createdAt: datetime
    last_login : datetime

class AdminTokenResponse(BaseModel):
    success: bool
    user: PublicUser
    token: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)

@router.post("/login", response_model=AdminTokenResponse)
async def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):

    admin = db.query(AdminUser).filter(AdminUser.email == request.email).first()
    if admin and admin.password and pwd.verify_password(request.password, admin.password):
        token_data = {"sub": str(admin.id), "role": "ADMIN"}
        token = jwt.create_access_token(data=token_data)
        user_data = PublicUser(
            name=admin.name,
            email=admin.email,
            role="ADMIN",
            mfa_enabled=admin.mfa_enabled,
            createdAt=admin.created_at
        )
        return AdminTokenResponse(success=True, user=user_data, token=token)

    user = db.query(Nuser).filter(Nuser.email == request.email).first()
    if user:
        if user.password:
            if pwd.verify_password(request.password, user.password):
                token_data = {"sub": str(user.id), "role": "USER"}
                token = jwt.create_access_token(data=token_data)
                user_data = PublicUser(
                name=user.name,
                email=user.email,
                role="USER",
                mfa_enabled=user.mfa_enabled,
                createdAt=user.created_at,
                last_login=datetime.now()
                )
                return AdminTokenResponse(success=True, user=user_data, token=token)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This account was created with Google. Please log in with Google."
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
    )

@router.get("/login/google")
async def google_login():
    """
    Returns the Google authorization URL to the frontend.
    """
    # FIX: Pass the redirect_uri to the get_authorization_url method.
    authorize_redirect = await client.get_authorization_url(redirect_uri=FRONTEND_REDIRECT_URI, scope=["email", "profile"])
    return {"url": authorize_redirect}

@router.get("/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    global jwks_cache
    """
    Receives the authorization code from Google, exchanges it for a token,
    and then redirects the user to the frontend with your own JWT.
    """
    try:
        # FIX: Pass the redirect_uri to the get_access_token method.
        token_data = await client.get_access_token(code, redirect_uri=FRONTEND_REDIRECT_URI)
        user_info = await client.get_id_email(token_data["access_token"])
        email, name = user_info
        id_token_jwt = token_data["id_token"]
        access_token_str = token_data.get("access_token")

        if not id_token_jwt:
            raise HTTPException(status_code=400, detail="ID token not found")
        
        if not jwks_cache:
            async with httpx.AsyncClient() as http_client:
                jwks_response = await http_client.get("https://www.googleapis.com/oauth2/v3/certs")
                jwks_response.raise_for_status()
                jwks_cache = jwks_response.json()

        # Step 3: Decode the header to find the 'kid' (Key ID)
        header = jose_jwt.get_unverified_header(id_token_jwt)
        kid = header.get("kid")
        if not kid:
            raise HTTPException(status_code=400, detail="Missing 'kid' in JWT header")

        # Step 4: Find the correct public key object from the JWKS using the 'kid'
        key_data = next((key for key in jwks_cache["keys"] if key["kid"] == kid), None)
        if not key_data:
            raise HTTPException(status_code=400, detail=f"Public key with kid '{kid}' not found")
        
        print("---------------------------")
        print("id_token_jwt",id_token_jwt)
        id_token_data = jose_jwt.decode(
            token=id_token_jwt,
            key=key_data,  # Pass the specific key data dictionary
            algorithms=["RS256"],
            audience=GOOGLE_CLIENT_ID, # Important: Verify the audience claim
            access_token=access_token_str
        )
        print("---------------------------")
        print(id_token_data)
        print("---------------------------")
        print(user_info)
        print("---------------------------")
        print("emial       ", user_info[1])
        print("---------------------------")
        print("name        ", )
        print("---------------------------")

        user = db.query(Nuser).filter(Nuser.email == id_token_data.get("email")).first()
        if not user:
            user = Nuser(email=id_token_data.get("email"), name=id_token_data.get("name") ,avatar= id_token_data.get("picture"),google_id=id_token_data.get("sub"),created_at=datetime.now(),last_login = datetime.now())
            db.add(user)
        else:
            user.name = id_token_data.get("name")
            user.avatar = id_token_data.get("picture")
            user.google_id = id_token_data.get("sub")
            user.last_login = datetime.now()
        db.commit()
        db.refresh(user)
        print("No Issues")
        payload = {
            "sub": str(user.id),
            "exp": datetime.utcnow() + timedelta(hours=24),
            "role": "USER",
        }
        print("No Issues1")
        app_token = jwt.create_access_token(data=payload)
        print("No Issues2")

        redirect_url = f"{FRONTEND_REDIRECT_URI}?token={app_token}&user_name={user.name}"
        print("No Issues3")
        return {"success": True, "user": user , "token":app_token,"redirect_url":redirect_url}

    except Exception as e:
        print(f"Authentication failed: {e}")
        return RedirectResponse("http://localhost:5173/login?error=auth_failed")