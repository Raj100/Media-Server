<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Download Manager</h1>
            <p class="text-gray-600 dark:text-gray-400">Manage your downloads from web and Telegram links</p>
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

    <!-- Download Form -->
    <div class="container mx-auto px-4 py-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Add New Download</h2>
        <select v-model="uploadtype" name="type" id="" class="border border-2 rounded my-2 dark:border-white px-2 py-1 ">
              <option value="upload">upload</option>
              <option value="web">web download link</option>
        </select>
        <form v-if="uploadtype=='upload'" @submit.prevent="handleAddUpload" class="space-y-4">
          <div>
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File</label>
      <input type="file" required @change="handleFileChange" class="input-field" />
    </div>


          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label  for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Type
              </label>
              <select id="type" v-model="uploadForm.type" class="input-field text-black border border-1 px-2 py-1 rounded my-2 dark:border-white">
                <option value="movie">Movie</option>
                <option value="music">Music</option>
                <option value="video">Video</option>
              </select>
            </div>
                        
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary"
          >
            <div v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border border-b-2 border-black mr-2 inline-block dark:border-white"></div>
            {{ isSubmitting ? "Processing..." : "Add Download" }}
          </button>
        </form>



        <form v-if="uploadtype=='web'" @submit.prevent="handleAddDownload" class="space-y-4">
          <div>
            <label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL (Web or Telegram link)
            </label>
            <input
              id="url"
              v-model="downloadForm.url"
              type="url"
              required
              placeholder="https://example.com/video or https://t.me/..."
              class="input-field"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Type
              </label>
              <select id="type" v-model="downloadForm.type" class="input-field text-black border border-1 px-2 py-1 rounded my-2 dark:border-white">
                <option value="movie">Movie</option>
                <option value="music">Music</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label for="quality" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quality (Optional)
              </label>
              <select id="quality" v-model="downloadForm.quality" class="input-field">
                <option value="">Auto</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4K">4K</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary"
          >
            <div v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
            Add Download
          </button>
        </form>
      </div>

      <!-- Downloads List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Downloads</h2>
            <div class="flex gap-2">
              <button
                v-for="status in ['all', 'downloading', 'completed', 'failed']"
                :key="status"
                @click="activeTab =  status as DownloadStatus | 'all'"
                :class="{
                  'px-3 py-1 text-sm rounded-lg transition-colors': true,
                  'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400': activeTab === status,
                  'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700': activeTab !== status,
                }"
              >
                {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                <span v-if="getDownloadCount(status) > 0" class="ml-1 text-xs">
                  ({{ getDownloadCount(status) }})
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="filteredDownloads.length === 0" class="text-center py-8">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No downloads found</h3>
            <p class="text-gray-600 dark:text-gray-400">Add a URL above to start downloading content</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="download in filteredDownloads"
              :key="download.id"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ download.title }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ download.url }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    :class="{
                      'status-indicator': true,
                      'status-online': download.status === 'completed',
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400': download.status === 'downloading',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400': download.status === 'pending',
                      'status-offline': download.status === 'failed',
                    }"
                  >
                    {{ download.status.charAt(0).toUpperCase() + download.status.slice(1) }}
                  </span>
                </div>
              </div>

              <div v-if="download.status === 'downloading'" class="mb-2">
                <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{{ download.progress }}%</span>
                  <span v-if="download.speed">{{ formatSpeed(download.speed) }}</span>
                </div>
                <div class="progress-bar">
                  <div
                    :style="{ width: download.progress + '%' }"
                    class="progress-fill"
                  ></div>
                </div>
              </div>

              <div class="flex items-center justify-between text-sm">
                <div class="text-gray-600 dark:text-gray-400">
                  <span class="capitalize">{{ download.type }}</span>
                  <span v-if="download.quality"> • {{ download.quality }}</span>
                  <span v-if="download.totalSize"> • {{ formatFileSize(download.totalSize) }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    v-if="download.status === 'downloading'"
                    @click="pauseDownload(download.id)"
                    class="text-yellow-600 hover:text-yellow-700 text-sm"
                  >
                    Pause
                  </button>
                  <button
                    v-if="download.status === 'paused'"
                    @click="resumeDownload(download.id)"
                    class="text-green-600 hover:text-green-700 text-sm"
                  >
                    Resume
                  </button>
                  <button
                    v-if="download.status === 'failed'"
                    @click="retryDownload(download.id)"
                    class="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Retry
                  </button>
                  <button
                    @click="deleteDownload(download.id)"
                    class="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useDownloadsStore } from "@/stores/downloads"
import type { DownloadRequest, DownloadStatus, UploadRequest } from "../types"

const downloadsStore = useDownloadsStore()

const downloadForm = ref<DownloadRequest>({
  url: "",
  type: "movie",
  quality: "",
})
const uploadtype = ref('upload')

const uploadForm = ref<UploadRequest>({
  file: null as File | null,
  type: "movie",
  quality: "",
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  uploadForm.value.file = target.files?.[0] ?? null
}

const isSubmitting = ref(false)
const activeTab = ref<"all" | DownloadStatus>("all")

const filteredDownloads = computed(() => {
  if (activeTab.value === "all") {
    return downloadsStore.downloads
  }
  return downloadsStore.downloads.filter(d => d.status === activeTab.value)
})

const getDownloadCount = (status: string): number => {
  if (status === "all") return downloadsStore.downloads.length
  return downloadsStore.downloads.filter(d => d.status === status).length
}

const handleAddUpload = async () => {
  if (!uploadForm.value.file) return
  isSubmitting.value = true


  const formData = new FormData()
  formData.append("file", uploadForm.value.file)
  formData.append("type", uploadForm.value.type)
  if (uploadForm.value.quality) formData.append("quality", uploadForm.value.quality)

  await downloadsStore.addUpload(formData)

  uploadForm.value.file = null
  isSubmitting.value = false
}
const handleAddDownload = async (): Promise<void> => {
  isSubmitting.value = true
  await downloadsStore.addDownload(downloadForm.value)
  downloadForm.value = { url: "", type: "movie", quality: "" }
  isSubmitting.value = false
}

const pauseDownload = async (id: string): Promise<void> => {
  await downloadsStore.pauseDownload(id)
}

const resumeDownload = async (id: string): Promise<void> => {
  await downloadsStore.resumeDownload(id)
}

const retryDownload = async (id: string): Promise<void> => {
  await downloadsStore.retryDownload(id)
}

const deleteDownload = async (id: string): Promise<void> => {
  await downloadsStore.deleteDownload(id)
}

const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i]
}

const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond) + "/s"
}

onMounted(() => {
  downloadsStore.fetchDownloads()
})
</script>
