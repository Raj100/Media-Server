"use client"

import { useState, useEffect, useCallback } from "react"
import { apiService, type ApiResponse } from "@/lib/api"

interface UseApiOptions {
  immediate?: boolean
  dependencies?: any[]
}

export function useApi<T>(apiCall: () => Promise<ApiResponse<T>>, options: UseApiOptions = {}) {
  const { immediate = true, dependencies = [] } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall()
      if (response.success) {
        setData(response.data || null)
      } else {
        setError(response.error || "Unknown error occurred")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  const refetch = useCallback(() => {
    execute()
  }, [execute])

  return {
    data,
    loading,
    error,
    refetch,
    execute,
  }
}

// Specific hooks for common API calls
export function useMovies(params?: { search?: string; genre?: string; page?: number }) {
  return useApi(() => apiService.getMovies(params), { dependencies: [params?.search, params?.genre, params?.page] })
}

export function useMusic(params?: { search?: string; artist?: string; page?: number }) {
  return useApi(() => apiService.getMusic(params), { dependencies: [params?.search, params?.artist, params?.page] })
}

export function useDownloads() {
  return useApi(() => apiService.getDownloads())
}

export function useServerStats() {
  return useApi(() => apiService.getServerStats())
}
