from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import jwt

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"


class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/stream"):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer"):
                raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

            token = auth_header.split(" ")[1]

            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                request.state.user = payload 
            except jwt.ExpiredSignatureError:
                raise HTTPException(status_code=403, detail="Token expired")
            except jwt.InvalidTokenError:
                raise HTTPException(status_code=403, detail="Invalid token")

        response = await call_next(request)
        return response
