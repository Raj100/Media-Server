<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>
            <p class="text-gray-600 dark:text-gray-400">
              Browse your collection of movies, music, and videos
            </p>
          </div>
          <div class="flex gap-2">
            <router-link
              to="/"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Dashboard
            </router-link>
            <button
              @click="handleAddMedia"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Media
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Search and Filters -->
    <div class="container mx-auto px-4 py-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search movies, music, videos..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div class="flex gap-2">
            <select
              v-model="selectedType"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="movie">Movies</option>
              <option value="music">Music</option>
              <option value="video">Videos</option>
            </select>
            <select
              v-model="sortBy"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="title">Sort by Title</option>
              <option value="date">Sort by Date</option>
              <option value="size">Sort by Size</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Media Grid -->
      <div v-if="mediaStore.isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="item in filteredMedia"
          :key="item.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
        >
          <div class="aspect-video bg-gray-200 dark:bg-gray-700 relative">
            <img
              v-if="item.thumbnail"
              :src="item.thumbnail"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg
                class="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z"
                />
              </svg>
            </div>
            <div class="absolute top-2 right-2">
              <span
                :class="{
                  'px-2 py-1 text-xs font-medium rounded': true,
                  'bg-purple-100 text-purple-800': item.type === 'movie',
                  'bg-blue-100 text-blue-800': item.type === 'music',
                  'bg-green-100 text-green-800': item.type === 'video',
                }"
              >
                {{ item.type.charAt(0).toUpperCase() + item.type.slice(1) }}
              </span>
            </div>
          </div>

          <div class="p-4">
            <h3
              class="font-semibold text-gray-900 dark:text-white mb-1 truncate"
            >
              {{ item.title }}
            </h3>
            <p
              v-if="item.type === 'music' && 'artist' in item"
              class="text-sm text-gray-600 dark:text-gray-400 mb-2"
            >
              {{ (item as Music).artist }}
            </p>
            <p
              v-if="item.type === 'movie' && 'director' in item"
              class="text-sm text-gray-600 dark:text-gray-400 mb-2"
            >
              Dir: {{ (item as Movie).director }}
            </p>
            <div
              class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
            >
              <span>{{ formatFileSize(item.size) }}</span>
              <span>{{ item.format.toUpperCase() }}</span>
            </div>

            <!-- Delete Button -->
            <div class="flex justify-end mt-3">
              <button
                @click="handleDeleteMedia(item.id)"
                class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="filteredMedia.length === 0 && !mediaStore.isLoading"
        class="text-center py-12"
      >
        <svg
          class="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z"
          />
        </svg>
        <h3
          class="text-lg font-medium text-gray-900 dark:text-white mb-2"
        >
          No media found
        </h3>
        <p class="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useMediaStore } from "@/stores/media"
import type { MediaItem, Movie, Music } from "@/types"
import axios from "axios"

const mediaStore = useMediaStore()

const searchQuery = ref("")
const selectedType = ref<"" | "movie" | "music" | "video">("")
const sortBy = ref<"title" | "date" | "size" | "rating">("title")

const filteredMedia = computed((): MediaItem[] => {
  let items: MediaItem[] = []

  if (selectedType.value === "movie") {
    items = [...mediaStore.filteredMovies]
  } else if (selectedType.value === "music") {
    items = [...mediaStore.filteredMusic]
  } else if (selectedType.value === "video") {
    items = [...mediaStore.filteredVideos]
  } else {
    items = [
      ...mediaStore.filteredMovies,
      ...mediaStore.filteredMusic,
      ...mediaStore.filteredVideos,
    ]
  }

  return items
})

const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (
    Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  )
}

// Add Media
const handleAddMedia = async () => {
  const url = prompt("Enter media URL to download:")
  if (!url) return

  try {

  } catch (err) {
    console.error("Failed to add media:", err)
  }
}

// Delete Media
const handleDeleteMedia = async (id: string) => {
  if (!confirm("Are you sure you want to delete this media?")) return

  try {
    await axios.delete(`/media/${id}`)
    mediaStore.deleteMediaItem(id)
  } catch (err) {
    console.error("Failed to delete media:", err)
  }
}

// Watch for filter changes
watch([searchQuery, selectedType, sortBy], () => {
  mediaStore.setSearchQuery(searchQuery.value)
  mediaStore.updateFilter({
    type: selectedType.value || undefined,
    sortBy: sortBy.value,
  })
})

onMounted(() => {
  mediaStore.fetchMediaLibrary()
})
</script>
