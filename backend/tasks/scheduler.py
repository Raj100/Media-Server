from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from config.database import SessionLocal
from routes.server import get_server_stats, get_system_health
from utils.alerts import send_server_alert_email

def check_and_store_server_health():
    print("hello routine started")
    db: Session = SessionLocal()
    try:
        print("trying..")
        stats = get_server_stats(db=db)  
        health = get_system_health(db=db)  

        critical_conditions = []
        if stats.cpuUsage > 90:
            critical_conditions.append(f"High CPU usage: {stats.cpuUsage}%")
        if stats.memoryUsage > 90:
            critical_conditions.append(f"High memory usage: {stats.memoryUsage}%")
        if stats.diskUsage > 90:
            critical_conditions.append(f"Disk usage critically high: {stats.diskUsage:.2f}%")
        if health.network.downloadSpeed < 5:
            critical_conditions.append(
                f"Slow download speed: {health.network.downloadSpeed} Mbps"
            )
        print(" critical_conditions ======", critical_conditions)
        if critical_conditions:
            print("sending email")
            send_server_alert_email(stats, health, critical_conditions)
            print("sent Email success")

    except Exception as e:
        print(f"[!] Error in health check job: {e}",)
    finally:
        db.close()


def start_scheduler():
    print("Hello sheculler started ")
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_and_store_server_health, "interval", hours=1)
    scheduler.start()
