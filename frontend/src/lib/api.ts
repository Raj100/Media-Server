interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

interface DownloadStatus {
  id: string
  url: string
  title: string
  status: "pending" | "downloading" | "completed" | "failed"
  progress: number
  size?: number
  downloadedSize?: number
  speed?: string
  eta?: string
  createdAt: string
}

interface ServerStats {
  totalMovies: number
  totalMusic: number
  totalSize: string
  availableSpace: string
  activeDownloads: number
  serverStatus: "online" | "offline" | "maintenance"
  uptime: string
}

interface MediaItem {
  id: string
  title: string
  type: "movie" | "music" | "video"
  genre?: string
  year?: number
  duration?: number
  size: string
  thumbnail?: string
  filePath: string
  createdAt: string
  updatedAt: string
}

class ApiService {
  private baseURL: string
  private headers: Record<string, string>

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"
    this.headers = {
      "Content-Type": "application/json",
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      }

      // Add auth token if available
      const token = localStorage.getItem("auth_token")
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      console.error("API Request failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  }

  async googleAuth(token: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  async getMovies(params?: { search?: string; genre?: string; page?: number }): Promise<
    ApiResponse<{ movies: MediaItem[]; total: number }>
  > {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append("search", params.search)
    if (params?.genre) searchParams.append("genre", params.genre)
    if (params?.page) searchParams.append("page", params.page.toString())

    return this.request(`/movies?${searchParams.toString()}`)
  }

  async getMusic(params?: { search?: string; artist?: string; page?: number }): Promise<
    ApiResponse<{ music: MediaItem[]; total: number }>
  > {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append("search", params.search)
    if (params?.artist) searchParams.append("artist", params.artist)
    if (params?.page) searchParams.append("page", params.page.toString())

    return this.request(`/music?${searchParams.toString()}`)
  }

  async getMediaItem(id: string): Promise<ApiResponse<MediaItem>> {
    return this.request(`/media/${id}`)
  }

  async deleteMediaItem(id: string): Promise<ApiResponse<void>> {
    return this.request(`/media/${id}`, { method: "DELETE" })
  }

  // Upload endpoints
  async uploadFile(
    file: File,
    type: "movie" | "music",
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<ApiResponse<MediaItem>> {
    return new Promise((resolve) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          }
          onProgress(progress)
        }
      })

      xhr.addEventListener("load", () => {
        try {
          const response = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ success: true, data: response.data })
          } else {
            resolve({ success: false, error: response.message || "Upload failed" })
          }
        } catch (error) {
          resolve({ success: false, error: "Invalid response format" })
        }
      })

      xhr.addEventListener("error", () => {
        resolve({ success: false, error: "Upload failed" })
      })

      const token = localStorage.getItem("auth_token")
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      }

      xhr.open("POST", `${this.baseURL}/upload`)
      xhr.send(formData)
    })
  }

  // Download management endpoints
  async addDownload(url: string, type: "movie" | "music" | "video"): Promise<ApiResponse<DownloadStatus>> {
    return this.request("/downloads", {
      method: "POST",
      body: JSON.stringify({ url, type }),
    })
  }

  async getDownloads(): Promise<ApiResponse<DownloadStatus[]>> {
    return this.request("/downloads")
  }

  async getDownloadStatus(id: string): Promise<ApiResponse<DownloadStatus>> {
    return this.request(`/downloads/${id}`)
  }

  async cancelDownload(id: string): Promise<ApiResponse<void>> {
    return this.request(`/downloads/${id}/cancel`, { method: "POST" })
  }

  async deleteDownload(id: string): Promise<ApiResponse<void>> {
    return this.request(`/downloads/${id}`, { method: "DELETE" })
  }

  // Server status endpoints
  async getServerStats(): Promise<ApiResponse<ServerStats>> {
    return this.request("/server/stats")
  }

  async getServerHealth(): Promise<ApiResponse<{ status: string; uptime: string }>> {
    return this.request("/server/health")
  }

  // Admin endpoints
  async getUsers(): Promise<ApiResponse<any[]>> {
    return this.request("/admin/users")
  }

  async updateUserRole(userId: string, role: string): Promise<ApiResponse<void>> {
    return this.request(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
  }

  async getSystemLogs(): Promise<ApiResponse<any[]>> {
    return this.request("/admin/logs")
  }
}

export const apiService = new ApiService()

export type { ApiResponse, UploadProgress, DownloadStatus, ServerStats, MediaItem }
