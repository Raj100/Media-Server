import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from config.database import Base


class AdminUser(Base):
    __tablename__ = "admin_user"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    mfa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Nuser(Base):
    __tablename__ = "n_user"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String)
    avatar = Column(String)
    google_id = Column(String)
    mfa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
