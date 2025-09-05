export interface DownloadItem {
  id: string
  url: string
  title: string
  type: "movie" | "music" | "video"
  status: DownloadStatus
  progress: number
  speed?: number
  eta?: number
  totalSize?: number
  downloadedSize: number
  quality?: string
  format?: string
  createdAt: string
  startedAt?: string
  completedAt?: string
  error?: string
}

export type DownloadStatus = "pending" | "downloading" | "paused" | "completed" | "failed" | "cancelled"

export interface DownloadRequest {
  url: string
  type: "movie" | "music" | "video"
  quality?: string
  format?: string
}
export interface UploadRequest {
  file: File
  type: "movie" | "music" | "video"
  quality?: string
  format?: string
}

export interface DownloadQueue {
  active: DownloadItem[]
  pending: DownloadItem[]
  completed: DownloadItem[]
  failed: DownloadItem[]
}

export interface DownloadStats {
  totalDownloads: number
  activeDownloads: number
  completedDownloads: number
  failedDownloads: number
  totalDownloaded: number
  averageSpeed: number
}

