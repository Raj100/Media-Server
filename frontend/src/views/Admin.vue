<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400">Manage your media server</p>
          </div>
          <router-link
            to="/dashboard"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </router-link>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Upload Media</h2>
        
        <div
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          :class="{
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors': true,
            'border-purple-300 bg-purple-50 dark:bg-purple-900/10': isDragging,
            'border-gray-300 dark:border-gray-600': !isDragging,
          }"
        >
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Drop files here or click to upload
          </p>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Supports movies, music, and video files
          </p>
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="video/*,audio/*"
            @change="handleFileSelect"
            class="hidden"
          />
          <button
            @click="triggerFileInput"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Select Files
          </button>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploadQueue.length > 0" class="mt-6">
          <h3 class="text-lg font-medium mb-4">Upload Progress</h3>
          <div class="space-y-3">
            <div
              v-for="upload in uploadQueue"
              :key="upload.id"
              class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">{{ upload.name }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ upload.progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  :style="{ width: upload.progress + '%' }"
                  class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Media Management -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Media Management</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ mediaStore.totalMovies }}</div>
            <div class="text-gray-600 dark:text-gray-400">Movies</div>
          </div>
          
          <div class="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ mediaStore.totalMusic }}</div>
            <div class="text-gray-600 dark:text-gray-400">Music Tracks</div>
          </div>
          
          <div class="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ mediaStore.totalVideos }}</div>
            <div class="text-gray-600 dark:text-gray-400">Videos</div>
          </div>
        </div>

        <div class="mt-6 flex gap-4">
          <button
            @click="refreshLibrary"
            :disabled="isRefreshing"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <div v-if="isRefreshing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
            Refresh Library
          </button>
          
          <button
            @click="scanForNewFiles"
            :disabled="isScanning"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <div v-if="isScanning" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
            Scan for New Files
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useMediaStore } from "@/stores/media"


const fileInput = ref<HTMLInputElement | null>(null)
interface UploadItem {
  id: string
  name: string
  progress: number
  file: File
}

const mediaStore = useMediaStore()

const isDragging = ref(false)
const uploadQueue = ref<UploadItem[]>([])
const isRefreshing = ref(false)
const isScanning = ref(false)

const handleDrop = (event: DragEvent): void => {
  event.preventDefault()
  isDragging.value = false
  
  const files = Array.from(event.dataTransfer?.files || [])
  handleFiles(files)
}

const handleFileSelect = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  handleFiles(files)
}
const triggerFileInput = (event: Event): void => {
 fileInput.value?.click()
}


const handleFiles = (files: File[]): void => {
  files.forEach((file) => {
    const uploadItem: UploadItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      progress: 0,
      file,
    }
    
    uploadQueue.value.push(uploadItem)
    simulateUpload(uploadItem)
  })
}

const simulateUpload = (uploadItem: UploadItem): void => {
  const interval = setInterval(() => {
    uploadItem.progress += Math.random() * 10
    
    if (uploadItem.progress >= 100) {
      uploadItem.progress = 100
      clearInterval(interval)
      
      // Remove from queue after a delay
      setTimeout(() => {
        const index = uploadQueue.value.findIndex(item => item.id === uploadItem.id)
        if (index > -1) {
          uploadQueue.value.splice(index, 1)
        }
      }, 2000)
    }
  }, 200)
}

const refreshLibrary = async (): Promise<void> => {
  isRefreshing.value = true
  await mediaStore.fetchMediaLibrary()
  isRefreshing.value = false
}

const scanForNewFiles = async (): Promise<void> => {
  isScanning.value = true
  // Simulate scanning process
  await new Promise(resolve => setTimeout(resolve, 3000))
  await mediaStore.fetchMediaLibrary()
  isScanning.value = false
}

onMounted(() => {
  mediaStore.fetchMediaLibrary()
})
</script>
