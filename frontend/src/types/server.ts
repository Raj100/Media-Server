export interface ServerStats {
  serverStatus: "online" | "offline" | "maintenance"
  uptime: string
  totalMovies: number
  totalMusic: number
  totalVideos: number
  totalSize: string
  availableSpace: string
  activeDownloads: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkSpeed: {
    download: number
    upload: number
  }
}

export interface SystemHealth {
  cpu: {
    usage: number
    temperature?: number
    cores: number
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
  network: {
    downloadSpeed: number
    uploadSpeed: number
    totalDownloaded: number
    totalUploaded: number
  }
}

export interface ServiceStatus {
  name: string
  status: "running" | "stopped" | "error"
  port?: number
  uptime?: string
  lastCheck: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "success"
  message: string
  details?: string
  source: string
}
