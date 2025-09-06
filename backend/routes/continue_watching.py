from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from config.database import get_db
from models.continue_watching import ContinueWatching
from models.media import MediaItem
from schemas.continue_watching import ContinueWatchingItem, UpdateProgressRequest

router = APIRouter(prefix="/continue-watching", tags=["Continue Watching"])

@router.get("/{user_id}", response_model=list[ContinueWatchingItem])
def get_continue_watching(user_id: UUID, db: Session = Depends(get_db)):
    items = db.query(ContinueWatching).filter(ContinueWatching.user_id == user_id).all()
    result = []
    for item in items:
        media = db.query(MediaItem).filter(MediaItem.id == item.media_id).first()
        if not media:
            continue
        result.append(
            ContinueWatchingItem(
                media_id=media.id,
                title=media.title,
                thumbnail=media.thumbnail,
                progress=item.progress,
                time_left=item.time_left,
            )
        )
    return result

@router.post("/update")
def update_progress(request: UpdateProgressRequest, db: Session = Depends(get_db)):
    entry = db.query(ContinueWatching).filter(ContinueWatching.media_id == request.media_id).first()
    if entry:
        entry.progress = request.progress
        entry.time_left = request.time_left
    else:
        entry = ContinueWatching(
            user_id=UUID("11111111-1111-1111-1111-111111111111"),
            media_id=request.media_id,
            progress=request.progress,
            time_left=request.time_left
        )
        db.add(entry)
    db.commit()
    return {"success": True}
