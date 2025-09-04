import { defineStore } from "pinia"
import { ref, readonly } from "vue"
import { apiClient } from "@/lib/api"
import { showToast } from "@/lib/toast"

interface Video {
  id: string
  title: string
  thumbnail?: string
}

export const useVideoStore = defineStore("video", () => {
  const videoUrl = ref<string>("")
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchVideoUrl = async (video: Video) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.get<{ url: string }>(`/video/${video.id}`)
      videoUrl.value = response.data.url
    } catch (err: any) {
      error.value = err.response?.data?.detail || "Failed to fetch video"
      showToast({ message: error.value, type: "error" })
    } finally {
      isLoading.value = false
    }
  }

  return {
    videoUrl: readonly(videoUrl),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchVideoUrl,
  }
})
