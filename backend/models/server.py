from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.sql import func
from config.database import Base

class ServerStats(Base):
    __tablename__ = "server_stats"
    id = Column(Integer, primary_key=True, index=True)
    server_status = Column(String)
    uptime = Column(String)
    total_movies = Column(Integer)
    total_music = Column(Integer)
    total_videos = Column(Integer)
    total_size = Column(String)
    available_space = Column(String)
    active_downloads = Column(Integer)
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    disk_usage = Column(Float)
    network_speed = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SystemHealth(Base):
    __tablename__ = "system_health"
    id = Column(Integer, primary_key=True, index=True)
    cpu = Column(JSON)
    memory = Column(JSON)
    disk = Column(JSON)
    network = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ServiceStatus(Base):
    __tablename__ = "service_status"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    status = Column(String)
    port = Column(Integer, nullable=True)
    uptime = Column(String, nullable=True)
    last_check = Column(DateTime(timezone=True), server_default=func.now())

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    level = Column(String)  # info, warning, error, success
    message = Column(String)
    details = Column(Text, nullable=True)
    source = Column(String)
