// import { defineStore } from "pinia"
// import { ref, readonly } from "vue"
// import { apiClient } from "@/lib/api"
// import { showToast } from "@/lib/toast"

// interface Video {
//   id: string
//   title: string
//   thumbnail?: string
// }

// export const useVideoStore = defineStore("video", () => {
//   const videoUrl = ref<string>("")
//   const isLoading = ref<boolean>(false)
//   const error = ref<string | null>(null)

//   const fetchVideoUrl = async (video: Video) => {
//     if (!video?.id) return
//     isLoading.value = true
//     error.value = null
//     try {
//       const response = await apiClient.get<{ url: string }>(`/video/${video.id}`)
//       videoUrl.value = response.data.url
//     } catch (err: any) {
//       error.value = err.response?.data?.detail || "Failed to fetch video"
//       showToast({ message: error.value|| "", type: "error" })
//       console.error(err)
//     } finally {
//       isLoading.value = false
//     }
//   }

//   return {
//     videoUrl: readonly(videoUrl),
//     isLoading: readonly(isLoading),
//     error: readonly(error),
//     fetchVideoUrl,
//   }
// })

// src/stores/videoStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/lib/api'

export const useVideoStore = defineStore('videoStore', () => {
  const videoUrl = ref<string>('')       // The HLS master URL
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch HLS stream from backend
  async function fetchVideoUrl(videoId: string) {
    try {
      isLoading.value = true
      error.value = null

      const res = await apiClient.get(`/get_stream_url/${videoId}`)
      videoUrl.value = res.data.url  // backend returns { url: 'master.m3u8' }

    } catch (err: any) {
      console.error(err)
      error.value = err.response?.data?.detail || 'Failed to fetch video URL'
    } finally {
      isLoading.value = false
    }
  }

  return {
    videoUrl,
    isLoading,
    error,
    fetchVideoUrl
  }
})

