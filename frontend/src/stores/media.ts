import { defineStore } from "pinia"
import { ref, computed, readonly } from "vue"
import type { MediaItem, Movie, Music, Video, MediaLibrary, MediaFilter } from "@/types"
import { apiClient } from "@/lib/api"
import { showToast } from "@/lib/toast"

export const useMediaStore = defineStore("media", () => {
  // State
  const movies = ref<Movie[]>([])
  const music = ref<Music[]>([])
  const videos = ref<Video[]>([])
  const isLoading = ref(false)
  const currentFilter = ref<MediaFilter>({})
  const searchQuery = ref("")
  const favoriteMovies = ref<Movie[]>([])
  const favoriteMusic = ref<Music[]>([])

  // Getters
  const totalMovies = computed(() => movies.value.length)
  const totalMusic = computed(() => music.value.length)
  const totalVideos = computed(() => videos.value.length)
  const totalItems = computed(() => totalMovies.value + totalMusic.value + totalVideos.value)

  const filteredMovies = computed(() => {
    return filterMedia(movies.value, currentFilter.value, searchQuery.value) as Movie[]
  })

  const filteredMusic = computed(() => {
    return filterMedia(music.value, currentFilter.value, searchQuery.value) as Music[]
  })

  const filteredVideos = computed(() => {
    return filterMedia(videos.value, currentFilter.value, searchQuery.value) as Video[]
  })

  // Actions
  const fetchMediaLibrary = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiClient.get<MediaLibrary>("/media")
      if (response.data) {
        movies.value = response.data.movies || []
        music.value = response.data.music || []
        videos.value = response.data.videos || []
      }
    } catch (error) {
      console.error("Failed to fetch media library:", error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchMovies = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiClient.get<Movie[]>("/media/movies")
      movies.value = response.data || []
    } catch (error) {
      console.error("Failed to fetch movies:", error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchMusic = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiClient.get<Music[]>("/media/music")
      music.value = response.data || []
    } catch (error) {
      console.error("Failed to fetch music:", error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchVideos = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiClient.get<Video[]>("/media/videos")
      videos.value = response.data || []
    } catch (error) {
      console.error("Failed to fetch videos:", error)
    } finally {
      isLoading.value = false
    }
  }

  const addMediaItem = async (item: Omit<MediaItem, "id" | "createdAt" | "updatedAt">): Promise<MediaItem | null> => {
    try {
      const response = await apiClient.post<MediaItem>("/media", item)
      if (response.data) {
        const newItem = response.data
        switch (newItem.type) {
          case "movie":
            movies.value.push(newItem as Movie)
            break
          case "music":
            music.value.push(newItem as Music)
            break
          case "video":
            videos.value.push(newItem as Video)
            break
        }
        return newItem
      }
    } catch (error) {
      console.error("Failed to add media item:", error)
    }
    return null
  }

  const deleteMediaItem = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/media/${id}`)

      movies.value = movies.value.filter((item) => item.id !== id)
      music.value = music.value.filter((item) => item.id !== id)
      videos.value = videos.value.filter((item) => item.id !== id)
      showToast({ message: "Delete successful", type: "success" })
      return true
    } catch (error) {
      console.error("Failed to delete media item:", error)
      return false
    }
  }

  const updateFilter = (filter: Partial<MediaFilter>): void => {
    currentFilter.value = { ...currentFilter.value, ...filter }
  }

  const setSearchQuery = (query: string): void => {
    searchQuery.value = query
  }

  const clearFilters = (): void => {
    currentFilter.value = {}
    searchQuery.value = ""
  }

  // Helper function
  const filterMedia = (items: MediaItem[], filter: MediaFilter, search: string): MediaItem[] => {
    let filtered = [...items]

    if (filter.type) {
      filtered = filtered.filter((item) => item.type === filter.type)
    }

    if (filter.genre && "genre" in filtered[0]) {
      filtered = filtered.filter((item) => (item as Movie | Music).genre?.includes(filter.genre!))
    }

    if (filter.year && "year" in filtered[0]) {
      filtered = filtered.filter((item) => (item as Movie | Music).year === filter.year)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          ("artist" in item && (item as Music).artist.toLowerCase().includes(searchLower)) ||
          ("director" in item && (item as Movie).director?.toLowerCase().includes(searchLower)),
      )
    }

    if (filter.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any

        switch (filter.sortBy) {
          case "title":
            aValue = a.title
            bValue = b.title
            break
          case "date":
            aValue = a.createdAt
            bValue = b.createdAt
            break
          case "size":
            aValue = a.size
            bValue = b.size
            break
          case "rating":
            aValue = "rating" in a ? (a as Movie).rating || 0 : 0
            bValue = "rating" in b ? (b as Movie).rating || 0 : 0
            break
          default:
            return 0
        }

        if (filter.sortOrder === "desc") {
          return bValue > aValue ? 1 : -1
        }
        return aValue > bValue ? 1 : -1
      })
    }

    return filtered
  }

  const playMedia = (media: any) => {
    console.log(media)
    }
  return {
    // State
    movies: readonly(movies),
    music: readonly(music),
    videos: readonly(videos),
    isLoading: readonly(isLoading),
    currentFilter: readonly(currentFilter),
    searchQuery: readonly(searchQuery),
    favoriteMovies: readonly(favoriteMovies),
    favoriteMusic: readonly(favoriteMusic),

    // Getters
    totalMovies,
    totalMusic,
    totalVideos,
    totalItems,
    filteredMovies,
    filteredMusic,
    filteredVideos,

    // Actions
    fetchMediaLibrary,
    fetchMovies,
    fetchMusic,
    fetchVideos,
    addMediaItem,
    deleteMediaItem,
    updateFilter,
    setSearchQuery,
    clearFilters,
    playMedia,
  }
})
