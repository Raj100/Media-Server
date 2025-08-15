from config.settings import settings
from utils.smtp import EmailService  

service= EmailService()

def send_server_alert_email(stats, health, issues: list[str]):
    try:
        context = {
            "server_status": stats.serverStatus,
            "uptime": stats.uptime,
            "cpu_usage": stats.cpuUsage,
            "memory_usage": stats.memoryUsage,
            "disk_usage": stats.diskUsage,
            "network_speed": {
            "downloadSpeed": health.network.downloadSpeed,
            "uploadSpeed": health.network.uploadSpeed
            },
            "issues": issues,
        }

        sent = service.send_email(
            settings.ALERT_EMAIL_TO, 
            "⚠ Media Server Alert - Action Required",
            "alert.html",
            True,
            context
        )

    except Exception as e:
        print(f"[!] Error sending server alert email: {e}")
        raise ValueError("Error sending server alert email")

    if not sent:
        raise ValueError("Failed to send server alert email")
