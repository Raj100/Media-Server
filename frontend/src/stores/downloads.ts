import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { DownloadItem, DownloadRequest, DownloadStats, UploadRequest } from "@/types"
import { apiClient } from "@/lib/api"
import { showToast } from "@/lib/toast"

export const useDownloadsStore = defineStore("downloads", () => {
  // State
  const downloads = ref<DownloadItem[]>([])
  const isLoading = ref(false)

  // Getters
  const activeDownloads = computed(() => downloads.value.filter((d) => d.status === "downloading"))

  const pendingDownloads = computed(() => downloads.value.filter((d) => d.status === "pending"))

  const completedDownloads = computed(() => downloads.value.filter((d) => d.status === "completed"))

  const failedDownloads = computed(() => downloads.value.filter((d) => d.status === "failed"))

  const downloadStats = computed(
    (): DownloadStats => ({
      totalDownloads: downloads.value.length,
      activeDownloads: activeDownloads.value.length,
      completedDownloads: completedDownloads.value.length,
      failedDownloads: failedDownloads.value.length,
      totalDownloaded: completedDownloads.value.reduce((sum, d) => sum + d.downloadedSize, 0),
      averageSpeed:
        activeDownloads.value.reduce((sum, d) => sum + (d.speed || 0), 0) / Math.max(activeDownloads.value.length, 1),
    }),
  )

  // Actions
  const fetchDownloads = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiClient.get<DownloadItem[]>("/downloads")
      downloads.value = response.data || []
    } catch (error) {
      console.error("Failed to fetch downloads:", error)
    } finally {
      isLoading.value = false
    }
  }

  const addDownload = async (request: DownloadRequest): Promise<DownloadItem | null> => {
    try {
      const response = await apiClient.post<DownloadItem>("/download/web", request)
      if (response.data) {
        downloads.value.unshift(response.data)
        return response.data
      }
    } catch (error) {
      console.error("Failed to add download:", error)
    }
    return null
  }
    const addUpload = async (formData: FormData): Promise<DownloadItem | null> => {
    try {
      const response = await apiClient.post<DownloadItem>("/upload_video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      if (response.data) {
        showToast({ message: "Upload successful. Media will be ready soon after Preprocessing..", type: "success" })
        downloads.value.unshift(response.data)
        return response.data
      }
    } catch (error) {
      console.error("Failed to add upload:", error)
    }
    return null
  }

  const pauseDownload = async (id: string): Promise<boolean> => {
    try {
      await apiClient.post(`/downloads/${id}/pause`)
      const download = downloads.value.find((d) => d.id === id)
      if (download) {
        download.status = "paused"
      }
      return true
    } catch (error) {
      console.error("Failed to pause download:", error)
      return false
    }
  }

  const resumeDownload = async (id: string): Promise<boolean> => {
    try {
      await apiClient.post(`/downloads/${id}/resume`)
      const download = downloads.value.find((d) => d.id === id)
      if (download) {
        download.status = "downloading"
      }
      return true
    } catch (error) {
      console.error("Failed to resume download:", error)
      return false
    }
  }

  const cancelDownload = async (id: string): Promise<boolean> => {
    try {
      await apiClient.post(`/downloads/${id}/cancel`)
      const download = downloads.value.find((d) => d.id === id)
      if (download) {
        download.status = "cancelled"
      }
      return true
    } catch (error) {
      console.error("Failed to cancel download:", error)
      return false
    }
  }

  const retryDownload = async (id: string): Promise<boolean> => {
    try {
      await apiClient.post(`/downloads/${id}/retry`)
      const download = downloads.value.find((d) => d.id === id)
      if (download) {
        download.status = "pending"
        download.error = undefined
      }
      return true
    } catch (error) {
      console.error("Failed to retry download:", error)
      return false
    }
  }

  const deleteDownload = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/downloads/${id}`)
      downloads.value = downloads.value.filter((d) => d.id !== id)
      return true
    } catch (error) {
      console.error("Failed to delete download:", error)
      return false
    }
  }

  const updateDownloadProgress = (id: string, progress: Partial<DownloadItem>): void => {
    const download = downloads.value.find((d) => d.id === id)
    if (download) {
      Object.assign(download, progress)
    }
  }

  const clearCompleted = (): void => {
    downloads.value = downloads.value.filter((d) => d.status !== "completed")
  }

  const clearFailed = (): void => {
    downloads.value = downloads.value.filter((d) => d.status !== "failed")
  }

  return {
    // State
    downloads: downloads,
    isLoading: isLoading,

    // Getters
    activeDownloads,
    pendingDownloads,
    completedDownloads,
    failedDownloads,
    downloadStats,

    // Actions
    fetchDownloads,
    addDownload,
    addUpload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    retryDownload,
    deleteDownload,
    updateDownloadProgress,
    clearCompleted,
    clearFailed,
  }
})
