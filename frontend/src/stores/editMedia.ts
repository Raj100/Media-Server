import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { MediaItem, MediaFilter, Movie, Music, Video } from "@/types"
import { apiClient } from "@/lib/api"

export const editMedia = defineStore("editmedia", () => {
  // State
  const mediaLibrary = ref<MediaItem[]>([])
  const isLoading = ref(false)
  const searchQuery = ref("")
  const filterOptions = ref<MediaFilter>({})

  // Getters
  const filteredMovies = computed(() =>
    mediaLibrary.value.filter(
      (m) =>
        m.type === "movie" &&
        (!searchQuery.value || m.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  )

  const filteredMusic = computed(() =>
    mediaLibrary.value.filter(
      (m) =>
        m.type === "music" &&
        (!searchQuery.value || m.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  )

  const filteredVideos = computed(() =>
    mediaLibrary.value.filter(
      (m) =>
        m.type === "video" &&
        (!searchQuery.value || m.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  )

  // Actions
  const fetchMediaLibrary = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiClient.get<MediaItem[]>("/media")
      mediaLibrary.value = response.data || []
    } catch (error) {
      console.error("Failed to fetch media library:", error)
    } finally {
      isLoading.value = false
    }
  }

  const addMediaItem = async (media: Partial<MediaItem>): Promise<MediaItem | null> => {
    try {
      const response = await apiClient.post<MediaItem>("/media", media)
      if (response.data) {
        mediaLibrary.value.unshift(response.data)
        return response.data
      }
    } catch (error) {
      console.error("Failed to add media:", error)
    }
    return null
  }

  const deleteMediaItem = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/media/${id}`)
      mediaLibrary.value = mediaLibrary.value.filter((m) => m.id !== id)
      return true
    } catch (error) {
      console.error("Failed to delete media:", error)
      return false
    }
  }

  const editMediaItem = async (id: string, updates: Partial<MediaItem>): Promise<boolean> => {
    try {
      const response = await apiClient.patch<MediaItem>(`/media/${id}`, updates)
      if (response.data) {
        const index = mediaLibrary.value.findIndex((m) => m.id === id)
        if (index !== -1) Object.assign(mediaLibrary.value[index], response.data)
        return true
      }
    } catch (error) {
      console.error("Failed to edit media:", error)
      return false
    }
    return false
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const updateFilter = (filter: MediaFilter) => {
    filterOptions.value = { ...filter }
  }

  return {
    // State
    mediaLibrary,
    isLoading,
    searchQuery,
    filterOptions,

    // Getters
    filteredMovies,
    filteredMusic,
    filteredVideos,

    // Actions
    fetchMediaLibrary,
    addMediaItem,
    deleteMediaItem,
    editMediaItem,
    setSearchQuery,
    updateFilter,
  }
})
