from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc, asc
from typing import List, Optional, Literal

from config.database import get_db
from models.media import MediaItem , MediaType
from schemas.media import MediaCreate, MediaResponse, MediaLibrary
from utils.scanner import scan_and_update_media, scan_first_level_hls_folders , update_existing_thumbnails

router = APIRouter()

def apply_filters(q, *, type_: Optional[str], genre: Optional[str], year: Optional[int],
                  quality: Optional[str], search: Optional[str]):
    if type_:
        q = q.filter(MediaItem.type == type_)
    if genre:
        # genre is JSONB array -> any match
        q = q.filter(func.jsonb_exists_any(MediaItem.genre, [genre]))
    if year:
        q = q.filter(MediaItem.year == year)
    if quality:
        q = q.filter(MediaItem.quality == quality)
    if search:
        s = f"%{search.lower()}%"
        q = q.filter(
            or_(
                func.lower(MediaItem.title).like(s),
                func.lower(func.coalesce(MediaItem.artist, "")).like(s),
                func.lower(func.coalesce(MediaItem.director, "")).like(s),
            )
        )
    return q

def apply_sort(q, *, sort_by: Optional[Literal["title","date","size","rating"]],
               sort_order: Optional[Literal["asc","desc"]]):
    if not sort_by:
        return q
    dir_fn = desc if sort_order == "desc" else asc
    col_map = {
        "title": MediaItem.title,
        "date": MediaItem.created_at,
        "size": MediaItem.size,
        "rating": MediaItem.rating,
    }
    col = col_map.get(sort_by)
    if col is not None:
        q = q.order_by(dir_fn(col))
    return q

@router.get("/", response_model=MediaLibrary)
def get_media_library(db: Session = Depends(get_db)):
    # scan_and_update_media(db) 

    movies = db.query(MediaItem).filter(MediaItem.type == "movie").all()
    music = db.query(MediaItem).filter(MediaItem.type == "music").all()
    videos = db.query(MediaItem).filter(MediaItem.type == "video").all()

    total_size = sum((i.size or 0) for i in [*movies, *music, *videos])
    total_count = len(movies) + len(music) + len(videos)

    return {
        "movies": movies,
        "music": music,
        "videos": videos,
        "totalCount": total_count,
        "totalSize": total_size,
    }
# def get_media_library(db: Session = Depends(get_db)):
#     movies_q = db.query(MediaItem).filter(MediaItem.type == "movie")
#     music_q  = db.query(MediaItem).filter(MediaItem.type == "music")
#     videos_q = db.query(MediaItem).filter(MediaItem.type == "video")

#     movies = movies_q.all()
#     music = music_q.all()
#     videos = videos_q.all()

#     total_size = sum((i.size or 0) for i in [*movies, *music, *videos])
#     total_count = len(movies) + len(music) + len(videos)

#     return {
#         "movies": movies,
#         "music": music,
#         "videos": videos,
#         "totalCount": total_count,
#         "totalSize": total_size,
#     }

# @router.get("/movies", response_model=List[MediaResponse])
# def get_movies(
#     db: Session = Depends(get_db),
#     genre: Optional[str] = Query(None),
#     year: Optional[int] = Query(None),
#     quality: Optional[str] = Query(None),
#     search: Optional[str] = Query(None),
#     sortBy: Optional[Literal["title","date","size","rating"]] = Query(None),
#     sortOrder: Optional[Literal["asc","desc"]] = Query(None),
# ):
#     # Ensure all media in the folder are added
#     scan_and_update_media(db) 
    
#     # Filter by actual movie type
#     q = db.query(MediaItem).filter(MediaItem.type == MediaType.movie)
    
#     # Debugging info
#     all_items = db.query(MediaItem.title, MediaItem.type).all()
#     print("all items in DB:", all_items)
#     print("full objects:", db.query(MediaItem).all())
    
#     # Apply filters and sorting
#     q = apply_filters(q, type_=MediaType.movie, genre=genre, year=year, quality=quality, search=search)
#     q = apply_sort(q, sort_by=sortBy, sort_order=sortOrder)
    
#     return q.all()



@router.get("/movies", response_model=List[MediaResponse])
def get_movies(
    db: Session = Depends(get_db),
    genre: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    quality: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sortBy: Optional[Literal["title","date","size","rating"]] = Query(None),
    sortOrder: Optional[Literal["asc","desc"]] = Query(None),
):
    # Update DB with new media if found
    # scan_and_update_media(db)

    # Start with all videos in DB
    # scan_first_level_hls_folders(db, "./videos")
    update_existing_thumbnails(db)
    q = db.query(MediaItem).filter(MediaItem.type == MediaType.video)

    # Debug: print all items in DB
    all_items = db.query(MediaItem.title, MediaItem.type).all()
    print("All items in DB:", [(t[0], t[1].value) for t in all_items])
    print("Full objects:", db.query(MediaItem).all())

    # Apply filters (genre, year, quality, search)
    q = apply_filters(
        q,
        type_=MediaType.video,  # use enum consistently
        genre=genre,
        year=year,
        quality=quality,
        search=search
    )

    # Apply sorting
    q = apply_sort(q, sort_by=sortBy, sort_order=sortOrder)

    # Return the final list
    return q.all()
@router.get("/music", response_model=List[MediaResponse])
def get_music(
    db: Session = Depends(get_db),
    genre: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    quality: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sortBy: Optional[Literal["title","date","size","rating"]] = Query(None),
    sortOrder: Optional[Literal["asc","desc"]] = Query(None),
):
    q = db.query(MediaItem).filter(MediaItem.type == "music")
    q = apply_filters(q, type_="music", genre=genre, year=year, quality=quality, search=search)
    q = apply_sort(q, sort_by=sortBy, sort_order=sortOrder)
    return q.all()

@router.get("/videos", response_model=List[MediaResponse])
def get_videos(
    db: Session = Depends(get_db),
    genre: Optional[str] = Query(None),  # ignored for videos but harmless
    year: Optional[int] = Query(None),   # ignored for videos but harmless
    quality: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sortBy: Optional[Literal["title","date","size","rating"]] = Query(None),
    sortOrder: Optional[Literal["asc","desc"]] = Query(None),
):
    q = db.query(MediaItem).filter(MediaItem.type == "video")
    q = apply_filters(q, type_="video", genre=genre, year=year, quality=quality, search=search)
    q = apply_sort(q, sort_by=sortBy, sort_order=sortOrder)
    return q.all()

@router.post("/", response_model=MediaResponse, status_code=201)
def add_media_item(payload: MediaCreate, db: Session = Depends(get_db)):
    # Map Pydantic → ORM (aliases already handle meta/file_path/track_number)
    data = payload.model_dump(by_alias=True)
    item = MediaItem(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{media_id}", response_model=dict)
def delete_media_item(media_id: str, db: Session = Depends(get_db)):
    item = db.query(MediaItem).filter(MediaItem.id == media_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Media item not found")
    db.delete(item)
    db.commit()
    return {"success": True}
