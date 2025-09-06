from sqlalchemy import Column, Integer, Float, ForeignKey, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from config.database import Base

class ContinueWatching(Base):
    __tablename__ = "continue_watching"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)  
    media_id = Column(UUID(as_uuid=True), ForeignKey("media_items.id"), nullable=False)
    progress = Column(Float, nullable=False, default=0.0) 
    time_left = Column(String, nullable=True)              
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())