from sqlalchemy import Column, String, Integer, Float, Enum, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from enum import Enum as PyEnum
import uuid
from pydantic import BaseModel
from typing import Optional


from config.database import Base

class MediaType(str, PyEnum):
    movie = "movie"
    music = "music"
    video = "video"

class MediaMeta(BaseModel):
    width: int
    height: int
    bitrate: int

class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    type = Column(Enum(MediaType, name="mediatype"), nullable=False)

    thumbnail = Column(String)
    poster = Column(String)
    duration = Column(Integer)
    size = Column(Float, nullable=False)
    format = Column(String, nullable=False)
    quality = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    file_path = Column(String, nullable=False)

    meta =  Optional[MediaMeta]

    # Movie-specific
    year = Column(Integer)
    genre = Column(JSONB)          # list[str]
    director = Column(String)
    cast = Column(JSONB)           # list[str]
    rating = Column(Float)
    description = Column(String)
    trailer = Column(String)

    # Music-specific
    artist = Column(String)
    album = Column(String)
    track_number = Column(Integer)
    lyrics = Column(String)

    # Video-specific
    category = Column(String)
    tags = Column(JSONB)           # list[str]
