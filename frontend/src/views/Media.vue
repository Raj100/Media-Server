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
              to="/dashboard"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Dashboard
            </router-link>
            <button
              @click="selectedAddMedia=!selectedAddMedia"
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
              :src="`${baseUrl}${item.thumbnail}`"
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



    <div v-if="selectedAddMedia" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8" @click="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative" @click.stop>
        <button
          class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black bg-opacity-50 text-white text-2xl hover:bg-opacity-80 hover:scale-110 transition"
          @click="closeModal"
        >
          ×
        </button>

         <div class="flex gap-8 p-4 md:flex-col lg:p-12 lg:text-lg ">
          <form @submit.prevent="handleAddMedia" class="space-y-6">
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >Media Type</label
        >
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input
              type="radio"
              name="file"
              value="movie"
              v-model="mediaType"
              class="form-radio text-purple-600 dark:text-purple-400"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">Movie</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="file"
              value="music"
              v-model="mediaType"
              class="form-radio text-purple-600 dark:text-purple-400"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">Music</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              name="file"
              value="video"
              v-model="mediaType"
              class="form-radio text-purple-600 dark:text-purple-400"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">Video</span>
          </label>
        </div>
      </div>

      <div>
        <label
          for="file-upload"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >Upload File</label
        >
        <input
          id="file-upload"
          type="file"
          @change="handleFileChange"
          class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2"
        />
      </div>

      <div>
        <button
          type="submit"
          class="w-full py-3 px-6 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Submit Media
        </button>
      </div>
    </form>
          </div>


      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useMediaStore } from "@/stores/media"
import type { MediaItem, Movie, Music } from "@/types"
import {apiClient} from "../lib/api"
import { useDownloadsStore } from "@/stores/downloads"
import type { DownloadRequest, DownloadStatus, UploadRequest } from "../types"

const downloadsStore = useDownloadsStore()
const mediaStore = useMediaStore()
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const searchQuery = ref("")
const selectedType = ref<"" | "movie" | "music" | "video">("")
const sortBy = ref<"title" | "date" | "size" | "rating">("title")
const mediaType = ref<'movie' | 'music' | 'video' | null>(null);
const file = ref<File | null>(null);
let selectedAddMedia =ref<boolean>(false)
const isSubmitting = ref(false)

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

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
    console.log('File selected:', file.value.name);
  }
};

const handleAddMedia = async (e: SubmitEvent) => {
  // const url = prompt("Enter media URL to download:")
  // if (!url) return
   e.preventDefault();
  try {
    if (!mediaType.value || !file.value) {
    alert('Please select a media type and a file.');
    return;
  }
  isSubmitting.value = true

  // Create FormData to submit the file and other data
  const formData = new FormData();
  formData.append('type', mediaType.value);
  formData.append('file', file.value);

  await downloadsStore.addUpload(formData)

  mediaType.value = null;
  file.value = null;
  isSubmitting.value = false;
  closeModal();
  } catch (err) {
    console.error("Failed to add media:", err)
  }
}

// Delete Media
const handleDeleteMedia = async (id: string) => {
  if (!confirm("Are you sure you want to delete this media?")) return

  try {
    mediaStore.deleteMediaItem(id)
  } catch (err) {
    console.error("Failed to delete media:", err)
  }
}



const closeModal = () => {
  selectedAddMedia.value = false;
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
