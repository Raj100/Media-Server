from pydantic import BaseModel
from typing import Literal, Optional, List
from datetime import datetime

class NetworkSpeed(BaseModel):
    download: float
    upload: float

class ServerStatsSchema(BaseModel):
    serverStatus: Literal["online", "offline", "maintenance"]
    uptime: str
    totalMovies: int
    totalMusic: int
    totalVideos: int
    totalSize: str
    availableSpace: str
    activeDownloads: int
    cpuUsage: float
    memoryUsage: float
    diskUsage: float
    networkSpeed: NetworkSpeed

class CPUInfo(BaseModel):
    usage: float
    temperature: Optional[float]
    cores: int

class MemoryInfo(BaseModel):
    total: float
    used: float
    free: float
    usage: float

class DiskInfo(BaseModel):
    total: float
    used: float
    free: float
    usage: float

class NetworkInfo(BaseModel):
    downloadSpeed: float
    uploadSpeed: float
    totalDownloaded: float
    totalUploaded: float

class SystemHealthSchema(BaseModel):
    cpu: CPUInfo
    memory: MemoryInfo
    disk: DiskInfo
    network: NetworkInfo

class ServiceStatusSchema(BaseModel):
    name: str
    status: Literal["running", "stopped", "error"]
    port: Optional[int]
    uptime: Optional[str]
    lastCheck: datetime

class ActivityLogSchema(BaseModel):
    id: str
    timestamp: datetime
    level: Literal["info", "warning", "error", "success"]
    message: str
    details: Optional[str]
    source: str

class RestartServiceResponse(BaseModel):
    success: bool
    message: str
