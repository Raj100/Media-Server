from typing import ClassVar
from pydantic_settings import BaseSettings
from fastapi.security import OAuth2PasswordBearer


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str = "super-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    MFA_ISSUER: str = "Media-App"
    ENV: str = "dev"
    APP_BASE_URL: str
    ALERT_EMAIL_TO :str

    OAUTH2_SCHEME: ClassVar[OAuth2PasswordBearer] = OAuth2PasswordBearer(
        tokenUrl="/auth/login"
    )

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
