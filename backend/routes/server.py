import psutil
import shutil
import socket
import subprocess
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models import server as models
from schemas import server as schemas
from config.database import get_db

router = APIRouter()

def log_event(db: Session, level: str, message: str, source: str, details: str = None):
    log = models.ActivityLog(level=level, message=message, source=source, details=details)
    db.add(log)
    db.commit()

def check_service_status(service_name: str, port: int = None):
    try:
        result = subprocess.run(
            ["systemctl", "is-active", service_name],
            capture_output=True, text=True
        )
        status = "running" if result.returncode == 0 else "stopped"
    except FileNotFoundError:
        status = "unknown"

    if port:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        try:
            s.connect(("127.0.0.1", port))
            s.close()
        except Exception:
            status = "stopped"

    return status

@router.get("/server/stats", response_model=schemas.ServerStatsSchema)
def get_server_stats(db: Session = Depends(get_db)):
    uptime_seconds = datetime.now() - datetime.fromtimestamp(psutil.boot_time())
    uptime_str = str(uptime_seconds).split(".")[0]

    disk = shutil.disk_usage("/")
    network_speed = {"download": 120.5, "upload": 45.3}

    stats = schemas.ServerStatsSchema(
        serverStatus="online",
        uptime=uptime_str,
        totalMovies=120,
        totalMusic=540,
        totalVideos=300,
        totalSize=f"{disk.total / (1024**3):.2f} GB",
        availableSpace=f"{disk.free / (1024**3):.2f} GB",
        activeDownloads=3,
        cpuUsage=psutil.cpu_percent(interval=0.5),
        memoryUsage=psutil.virtual_memory().percent,
        diskUsage=(disk.used / disk.total) * 100,
        networkSpeed=network_speed
    )

    db.add(models.ServerStats(
        server_status=stats.serverStatus,
        uptime=stats.uptime,
        total_movies=stats.totalMovies,
        total_music=stats.totalMusic,
        total_videos=stats.totalVideos,
        total_size=stats.totalSize,
        available_space=stats.availableSpace,
        active_downloads=stats.activeDownloads,
        cpu_usage=stats.cpuUsage,
        memory_usage=stats.memoryUsage,
        disk_usage=stats.diskUsage,
        network_speed=stats.networkSpeed.dict()
    ))
    db.commit()
    log_event(db, "info", "Fetched server stats", "system")
    return stats

@router.get("/server/health", response_model=schemas.SystemHealthSchema)
def get_system_health(db: Session = Depends(get_db)):
    cpu_info = schemas.CPUInfo(
        usage=psutil.cpu_percent(interval=0.5),
        temperature=None,
        cores=psutil.cpu_count(logical=True)
    )

    mem = psutil.virtual_memory()
    memory_info = schemas.MemoryInfo(
        total=mem.total / (1024**2),
        used=mem.used / (1024**2),
        free=mem.free / (1024**2),
        usage=mem.percent
    )

    disk = shutil.disk_usage("/")
    disk_info = schemas.DiskInfo(
        total=disk.total / (1024**3),
        used=disk.used / (1024**3),
        free=disk.free / (1024**3),
        usage=(disk.used / disk.total) * 100
    )

    net_io = psutil.net_io_counters()
    network_info = schemas.NetworkInfo(
        downloadSpeed=120.5,
        uploadSpeed=45.3,
        totalDownloaded=net_io.bytes_recv / (1024**2),
        totalUploaded=net_io.bytes_sent / (1024**2)
    )

    health = schemas.SystemHealthSchema(cpu=cpu_info, memory=memory_info, disk=disk_info, network=network_info)

    db.add(models.SystemHealth(
        cpu=cpu_info.dict(),
        memory=memory_info.dict(),
        disk=disk_info.dict(),
        network=network_info.dict()
    ))
    db.commit()
    log_event(db, "info", "Fetched system health", "system")
    return health

@router.get("/server/services", response_model=list[schemas.ServiceStatusSchema])
def get_services(db: Session = Depends(get_db)):
    services = [
        {"name": "postgresql", "port": 5432},
        {"name": "nginx", "port": 80},
        {"name": "redis", "port": 6379}
    ]

    result = []
    for svc in services:
        status = check_service_status(svc["name"], svc["port"])
        record = schemas.ServiceStatusSchema(
            name=svc["name"],
            status=status if status in ["running", "stopped"] else "error",
            port=svc["port"],
            uptime=None,
            lastCheck=datetime.utcnow()
        )
        db.add(models.ServiceStatus(
            name=record.name,
            status=record.status,
            port=record.port,
            uptime=record.uptime,
            last_check=record.lastCheck
        ))
        result.append(record)

    db.commit()
    log_event(db, "info", "Checked service statuses", "system")
    return result

@router.get("/server/logs", response_model=list[schemas.ActivityLogSchema])
def get_activity_logs(limit: int = Query(100, ge=1, le=500), db: Session = Depends(get_db)):
    logs = db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).limit(limit).all()
    return [
        schemas.ActivityLogSchema(
            id=str(log.id),
            timestamp=log.timestamp,
            level=log.level,
            message=log.message,
            details=log.details,
            source=log.source
        )
        for log in logs
    ]

@router.post("/server/services/{service_name}/restart", response_model=schemas.RestartServiceResponse)
def restart_service(service_name: str, db: Session = Depends(get_db)):
    try:
        subprocess.run(["sudo", "systemctl", "restart", service_name], check=True)
        log_event(db, "success", f"Restarted service {service_name}", "service")
        return schemas.RestartServiceResponse(success=True, message=f"Service '{service_name}' restarted successfully")
    except subprocess.CalledProcessError:
        log_event(db, "error", f"Failed to restart {service_name}", "service")
        raise HTTPException(status_code=500, detail=f"Failed to restart {service_name}")
