export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  speed?: number
  eta?: number
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export interface ApiConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
}
