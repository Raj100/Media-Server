<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-purple-950">
    <Navbar />

    <div class="max-w-[1400px] mx-auto px-8 py-8 md:px-4">
      <!-- Header Section -->
      <section class="mb-8 text-center">
        <div class="mb-8">
          <h1 class="text-5xl md:text-3xl font-extrabold bg-gradient-to-br from-purple-900 to-purple-500 bg-clip-text text-transparent">
            Movies & Shows
          </h1>
          <p class="text-lg text-gray-700 dark:text-gray-300 opacity-80">
            Discover and enjoy your collection
          </p>
        </div>

        <!-- Search and Filters -->
        <div class="flex flex-wrap justify-center gap-4 items-center">
          <div class="relative flex-1 max-w-sm">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search movies..."
              class="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-full text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition"
            />
            <button
              class="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>

          <div class="flex flex-wrap gap-4 items-center">
            <select
              v-model="selectedGenre"
              class="px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-sm cursor-pointer focus:outline-none focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
            >
              <option value="">All Genres</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Thriller">Thriller</option>
              <option value="Action">Action</option>
              <option value="Drama">Drama</option>
              <option value="Comedy">Comedy</option>
            </select>

            <select
              v-model="sortBy"
              class="px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-sm cursor-pointer focus:outline-none focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
            >
              <option value="title">Sort by Title</option>
              <option value="year">Sort by Year</option>
              <option value="rating">Sort by Rating</option>
              <option value="duration">Sort by Duration</option>
            </select>

            <button
              @click="toggleView"
              class="px-3 py-3 border-2 border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-lg hover:scale-110 hover:border-purple-500 transition"
            >
              <span v-if="viewMode === 'grid'">📋</span>
              <span v-else>⊞</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Movies Grid/List -->
      <section class="mt-8">
        <div
          :class="[
            'grid gap-8',
            viewMode === 'grid' ? 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]' : 'grid-cols-1 gap-4'
          ]"
        >
          <div
            v-for="movie in filteredAndSortedMovies"
            :key="movie.id"
            :class="[
              'bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition cursor-pointer overflow-hidden',
              viewMode === 'list' ? 'flex items-center p-4' : ''
            ]"
            @click="selectMovie(movie)"
          >
            <div
              class="relative overflow-hidden"
              :class="viewMode === 'list' ? 'w-32 h-48 flex-shrink-0 rounded-lg mr-6' : ''"
            >
              <img
                :src="`${baseUrl}${movie.thumbnail}`"
                :alt="movie.title"
                class="w-full h-full object-cover transition-transform hover:scale-105"
              />
              <div
                class="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center gap-4 opacity-0 hover:opacity-100 transition"
              >
                <button class="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 transition" @click.stop="playMovie(movie)">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-purple-900">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button class="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 transition" @click.stop="toggleFavorite(movie)">
                  <svg
                    viewBox="0 0 24 24"
                    :fill="movie.isFavorite ? 'currentColor' : 'none'"
                    stroke="currentColor"
                    class="w-6 h-6 text-purple-900"
                  >
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    />
                  </svg>
                </button>
              </div>
              <div class="absolute top-3 right-3 bg-black bg-opacity-80 text-white px-2 py-1 rounded-full text-xs font-semibold">
                ⭐ {{ movie.rating }}
              </div>
            </div>

            <div class="p-6 flex-1" v-if="viewMode === 'grid'">
              <h3 class="text-purple-900 dark:text-purple-500 text-lg font-semibold mb-2">{{ movie.title }}</h3>
              <div class="flex flex-wrap gap-2 text-sm opacity-80 mb-2">
                <span>{{ movie.genre }}</span>
                <span>{{ movie.year }}</span>
                <span>{{ movie.duration }}</span>
              </div>
              <p class="text-sm opacity-80" v-if="viewMode as 'grid' | 'list' === 'list'">{{ movie.description }}</p>
            </div>

            <div class="flex-1" v-else>
              <h3 class="text-purple-900 dark:text-purple-500 text-lg font-semibold mb-2">{{ movie.title }}</h3>
              <div class="flex flex-wrap gap-2 text-sm opacity-80 mb-2">
                <span>{{ movie.genre }}</span>
                <span>{{ movie.year }}</span>
                <span>{{ movie.duration }}</span>
              </div>
              <p class="text-sm opacity-80">{{ movie.description }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredAndSortedMovies.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">🎬</div>
          <h3 class="text-purple-900 dark:text-purple-500 text-2xl font-semibold mb-2">No movies found</h3>
          <p class="text-gray-600 dark:text-gray-300">Try adjusting your search or filters</p>
        </div>
      </section>
    </div>

    <!-- Movie Detail Modal -->
    <div v-if="selectedMovie" class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8" @click="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative" @click.stop>
        <button
          class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black bg-opacity-50 text-white text-2xl hover:bg-opacity-80 hover:scale-110 transition"
          @click="closeModal"
        >
          ×
        </button>

        <div class="flex gap-8 p-8 md:flex-col md:p-4">
          <div class="flex-shrink-0 w-72 md:w-full md:mx-auto">
            <img :src="`${baseUrl}${selectedMovie.thumbnail}`" :alt="selectedMovie.title" class="w-full rounded-lg" />
          </div>

          <div class="flex-1">
            <h2 class="text-3xl md:text-2xl font-extrabold mb-4 text-purple-900 dark:text-purple-500">
              {{ selectedMovie.title }}
            </h2>
            <div class="flex flex-wrap gap-4 mb-6">
              <span class="bg-purple-200 dark:bg-purple-900 px-4 py-2 rounded-full text-sm font-medium">⭐ {{ selectedMovie.rating ?selectedMovie.rating:"NaN" }}</span>
              <span class="bg-purple-200 dark:bg-purple-900 px-4 py-2 rounded-full text-sm font-medium">{{ selectedMovie.year ?selectedMovie.year:"Year unknown" }}</span>
              <span class="bg-purple-200 dark:bg-purple-900 px-4 py-2 rounded-full text-sm font-medium">{{ selectedMovie.duration ? `${selectedMovie.duration}s`:"undefined" }} </span>
              <span class="bg-purple-200 dark:bg-purple-900 px-4 py-2 rounded-full text-sm font-medium">{{ selectedMovie.genre.length>0? selectedMovie.genre: "unknown genre" }}</span>
            </div>
            <p class="text-lg mb-6 opacity-90">{{ selectedMovie.description }}</p>

            <div class="flex flex-wrap gap-4 justify-start md:justify-center">
              <button
                @click="playMovie(selectedMovie)"
                class="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gradient-to-br from-purple-900 to-purple-500 text-white hover:-translate-y-1 hover:shadow-lg transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Now
              </button>

              <button
                @click="toggleFavorite(selectedMovie)"
                class="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-500 border-2 border-purple-500 hover:-translate-y-1 hover:shadow-lg transition"
              >
                <svg viewBox="0 0 24 24" :fill="selectedMovie.isFavorite ? 'currentColor' : 'none'" stroke="currentColor" class="w-5 h-5">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
                {{ selectedMovie.isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
              </button>

              <button class="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-transparent border-2 border-purple-500 text-purple-900 dark:text-purple-500 hover:-translate-y-1 hover:shadow-lg transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16,6 12,2 8,6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Player -->
    <VideoPlayer
      v-if="currentMovie"
      :media="currentMovie"
      :isVisible="showVideoPlayer"
      @close="closeVideoPlayer"
      @ended="onVideoEnded"
    />
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMediaStore } from '../stores/media'
import Navbar from '../components/Navbar.vue'
import VideoPlayer from '../components/VideoPlayer.vue'
import { useVideoStore } from "@/stores/videoStore"
import type {Movie} from "../types/media"
const videoStore = useVideoStore()

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const router = useRouter()
const authStore = useAuthStore()
const mediaStore = useMediaStore()


// Search & Filters
const searchQuery = ref<string>('')
const selectedGenre = ref<string>('')
const sortBy = ref<'title' | 'year' | 'rating' | 'duration'>('title')
const viewMode = ref<'grid' | 'list'>('grid')

// Selected Movie & Player
const selectedMovie = ref<Movie | null>(null)
const currentMovie = ref<Movie | null>(null)
const showVideoPlayer = ref<boolean>(false)

console.log(currentMovie)
// Fetch movies from backend
const fetchMovies = async () => {
  try {
    await mediaStore.fetchMovies() // Make sure your mediaStore has an async fetchMovies method
  } catch (error) {
    console.error('Error fetching movies:', error)
  }
}

const filteredAndSortedMovies = computed(() => {
  // Spread to make a mutable copy for sorting
  let filtered = [...mediaStore.movies]

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(movie =>
      movie.title.toLowerCase().includes(query) ||
      movie.genre.some(g => g.toLowerCase().includes(query)) ||
      (movie.description?.toLowerCase().includes(query))
    )
  }

  // Filter by selected genre
  if (selectedGenre.value) {
    filtered = filtered.filter(movie => movie.genre.includes(selectedGenre.value))
  }

  // Sort
return filtered.sort((a, b) => {
  switch (sortBy.value) {
    case "year":
      return (b.year ?? 0) - (a.year ?? 0)
    case "rating":
      return (b.rating ?? 0) - (a.rating ?? 0)
    case "duration":
      // Treat undefined as 0
      return (a.duration ?? 0) - (b.duration ?? 0)
    default:
      return a.title.localeCompare(b.title)
  }
})})



// UI actions
const toggleView = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const selectMovie = (movie: Movie) => {
  selectedMovie.value = movie
}

const closeModal = () => {
  selectedMovie.value = null
}

const playMovie = async (movie: Movie) => {
  currentMovie.value = movie
  showVideoPlayer.value = true
  // mediaStore.playMedia(movie)
  // await videoStore.fetchVideoUrl("ad9c5496-b81b-4f8c-954a-e353186d43e8")
  console.log("movie",movie.id)
  closeModal()
}

const closeVideoPlayer = () => {
  showVideoPlayer.value = false
  currentMovie.value = null
}

const toggleFavorite = (movie: Movie) => {
  // mediaStore.toggleFavorite(movie)
}

// Auto-fetch & auth check
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  } else {
    fetchMovies()
  }
})

const onVideoEnded = () => {
  console.log('Video ended')
}
</script>


<style scoped>
.movies-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
}

.dark .movies-page {
  background: linear-gradient(135deg, #1a1a1a, #2a1a2a);
}

.movies-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.movies-header {
  margin-bottom: 2rem;
}

.header-content {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #581c87, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.2rem;
  opacity: 0.8;
}

.search-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 2rem;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
}

.dark .search-input {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.search-input:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.search-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #581c87, #a855f7);
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-button:hover {
  transform: translateY(-50%) scale(1.1);
}

.search-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: white;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark .filter-select {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.filter-select:focus {
  outline: none;
  border-color: #a855f7;
}

.view-toggle {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.dark .view-toggle {
  background: #374151;
  border-color: #4b5563;
}

.view-toggle:hover {
  border-color: #a855f7;
  transform: scale(1.1);
}

.movies-content {
  margin-top: 2rem;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.movies-grid.list-view {
  grid-template-columns: 1fr;
  gap: 1rem;
}

.movie-card {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.dark .movie-card {
  background: #2a2a2a;
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(88, 28, 135, 0.2);
}

.movie-card.list-card {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.movie-poster {
  position: relative;
  overflow: hidden;
}

.list-card .movie-poster {
  width: 120px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 0.75rem;
  margin-right: 1.5rem;
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.movie-card:hover .movie-poster img {
  transform: scale(1.05);
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: all 0.3s ease;
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.play-button,
.favorite-button {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button:hover,
.favorite-button:hover {
  background: white;
  transform: scale(1.1);
}

.play-button svg,
.favorite-button svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #581c87;
}

.movie-rating {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.movie-info {
  padding: 1.5rem;
}

.list-card .movie-info {
  padding: 0;
  flex: 1;
}

.movie-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #581c87;
}

.dark .movie-title {
  color: #a855f7;
}

.movie-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  opacity: 0.8;
  flex-wrap: wrap;
}

.movie-description {
  font-size: 0.95rem;
  line-height: 1.5;
  opacity: 0.8;
  margin-top: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #581c87;
}

.dark .empty-state h3 {
  color: #a855f7;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.movie-modal {
  background: white;
  border-radius: 1.5rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.dark .movie-modal {
  background: #2a2a2a;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.modal-content {
  display: flex;
  gap: 2rem;
  padding: 2rem;
}

.modal-poster {
  flex-shrink: 0;
  width: 300px;
}

.modal-poster img {
  width: 100%;
  border-radius: 1rem;
}

.modal-info {
  flex: 1;
}

.modal-info h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #581c87;
}

.dark .modal-info h2 {
  color: #a855f7;
}

.modal-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.modal-meta span {
  background: rgba(168, 85, 247, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.modal-button {
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-button.primary {
  background: linear-gradient(135deg, #581c87, #a855f7);
  color: white;
}

.modal-button.secondary {
  background: rgba(168, 85, 247, 0.1);
  color: #581c87;
  border: 2px solid #a855f7;
}

.dark .modal-button.secondary {
  color: #a855f7;
}

.modal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(88, 28, 135, 0.3);
}

.modal-button svg {
  width: 1.2rem;
  height: 1.2rem;
}

@media (max-width: 768px) {
  .movies-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .search-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-controls {
    justify-content: center;
  }
  
  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .movie-card.list-card {
    flex-direction: column;
    text-align: center;
  }
  
  .list-card .movie-poster {
    width: 100%;
    height: 300px;
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .modal-content {
    flex-direction: column;
    padding: 1rem;
  }
  
  .modal-poster {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
  
  .modal-actions {
    justify-content: center;
  }
}
</style>
