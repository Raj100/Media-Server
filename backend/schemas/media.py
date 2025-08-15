from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID

class MediaMetadata(BaseModel):
    width: Optional[int] = None
    height: Optional[int] = None
    bitrate: Optional[int] = None
    codec: Optional[str] = None
    fps: Optional[float] = None
    channels: Optional[int] = None
    sampleRate: Optional[int] = None

class MediaBase(BaseModel):
    title: str
    type: Literal["movie", "music", "video"]
    size: float
    format: str
    filePath: str = Field(alias="file_path")
    thumbnail: Optional[str] = None
    poster: Optional[str] = None
    duration: Optional[int] = None
    quality: Optional[str] = None
    metadata: Optional[MediaMetadata] = Field(default=None, alias="meta")  # maps ORM 'meta' ⇄ API 'metadata'

class MovieFields(BaseModel):
    year: Optional[int] = None
    genre: Optional[List[str]] = None
    director: Optional[str] = None
    cast: Optional[List[str]] = None
    rating: Optional[float] = None
    description: Optional[str] = None
    trailer: Optional[str] = None

class MusicFields(BaseModel):
    artist: Optional[str] = None
    album: Optional[str] = None
    trackNumber: Optional[int] = Field(default=None, alias="track_number")
    lyrics: Optional[str] = None

class VideoFields(BaseModel):
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class MediaCreate(MediaBase, MovieFields, MusicFields, VideoFields):
    class Config:
        populate_by_name = True

class MediaResponse(MediaBase, MovieFields, MusicFields, VideoFields):
    id: UUID
    createdAt: datetime = Field(alias="created_at")
    updatedAt: datetime = Field(alias="updated_at")

    class Config:
        from_attributes = True
        populate_by_name = True

class MediaLibrary(BaseModel):
    movies: List[MediaResponse]
    music: List[MediaResponse]
    videos: List[MediaResponse]
    totalCount: int
    totalSize: float
