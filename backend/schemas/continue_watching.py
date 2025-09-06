from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class ContinueWatchingItem(BaseModel):
    media_id: UUID
    title: str
    thumbnail: Optional[str]
    progress: float
    time_left: Optional[str]

class UpdateProgressRequest(BaseModel):
    media_id: UUID
    progress: float
    time_left: Optional[str]