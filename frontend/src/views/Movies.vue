<template>
  <div class="movies-page">
    <Navbar />
    
    <div class="movies-container">
      <!-- Header Section -->
      <section class="movies-header">
        <div class="header-content">
          <h1 class="page-title">Movies & Shows</h1>
          <p class="page-subtitle">Discover and enjoy your collection</p>
        </div>
        
        <!-- Search and Filters -->
        <div class="search-filters">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search movies..."
              class="search-input"
            />
            <button class="search-button">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
          
          <div class="filter-controls">
            <select v-model="selectedGenre" class="filter-select">
              <option value="">All Genres</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Thriller">Thriller</option>
              <option value="Action">Action</option>
              <option value="Drama">Drama</option>
              <option value="Comedy">Comedy</option>
            </select>
            
            <select v-model="sortBy" class="filter-select">
              <option value="title">Sort by Title</option>
              <option value="year">Sort by Year</option>
              <option value="rating">Sort by Rating</option>
              <option value="duration">Sort by Duration</option>
            </select>
            
            <button @click="toggleView" class="view-toggle">
              <span v-if="viewMode === 'grid'">📋</span>
              <span v-else>⊞</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Movies Grid/List -->
      <section class="movies-content">
        <div :class="['movies-grid', { 'list-view': viewMode === 'list' }]">
          <div
            v-for="movie in filteredAndSortedMovies"
            :key="movie.id"
            :class="['movie-card', { 'list-card': viewMode === 'list' }]"
            @click="selectMovie(movie)"
          >
            <div class="movie-poster">
              <img :src="movie.thumbnail" :alt="movie.title" />
              <div class="movie-overlay">
                <button @click.stop="playMovie(movie)" class="play-button">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <button @click.stop="toggleFavorite(movie)" class="favorite-button">
                  <svg viewBox="0 0 24 24" :fill="movie.isFavorite ? 'currentColor' : 'none'" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
              <div class="movie-rating">
                <span>⭐ {{ movie.rating }}</span>
              </div>
            </div>
            
            <div class="movie-info">
              <h3 class="movie-title">{{ movie.title }}</h3>
              <div class="movie-meta">
                <span class="movie-genre">{{ movie.genre }}</span>
                <span class="movie-year">{{ movie.year }}</span>
                <span class="movie-duration">{{ movie.duration }}</span>
              </div>
              <p v-if="viewMode === 'list'" class="movie-description">
                {{ movie.description }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="filteredAndSortedMovies.length === 0" class="empty-state">
          <div class="empty-icon">🎬</div>
          <h3>No movies found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      </section>
    </div>

    <!-- Movie Detail Modal -->
    <div v-if="selectedMovie" class="modal-overlay" @click="closeModal">
      <div class="movie-modal" @click.stop>
        <button @click="closeModal" class="modal-close">×</button>
        
        <div class="modal-content">
          <div class="modal-poster">
            <img :src="selectedMovie.thumbnail" :alt="selectedMovie.title" />
          </div>
          
          <div class="modal-info">
            <h2>{{ selectedMovie.title }}</h2>
            <div class="modal-meta">
              <span class="rating">⭐ {{ selectedMovie.rating }}</span>
              <span class="year">{{ selectedMovie.year }}</span>
              <span class="duration">{{ selectedMovie.duration }}</span>
              <span class="genre">{{ selectedMovie.genre }}</span>
            </div>
            
            <p class="modal-description">{{ selectedMovie.description }}</p>
            
            <div class="modal-actions">
              <button @click="playMovie(selectedMovie)" class="modal-button primary">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play Now
              </button>
              
              <button @click="toggleFavorite(selectedMovie)" class="modal-button secondary">
                <svg viewBox="0 0 24 24" :fill="selectedMovie.isFavorite ? 'currentColor' : 'none'" stroke="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {{ selectedMovie.isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
              </button>
              
              <button class="modal-button secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16,6 12,2 8,6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMediaStore } from '../stores/media'
import Navbar from '../components/Navbar.vue'
import VideoPlayer from '../components/VideoPlayer.vue'

const router = useRouter()
const authStore = useAuthStore()
const mediaStore = useMediaStore()

const searchQuery = ref('')
const selectedGenre = ref('')
const sortBy = ref('title')
const viewMode = ref('grid')
const selectedMovie = ref(null)
const showVideoPlayer = ref(false)
const currentMovie = ref(null)

const filteredAndSortedMovies = computed(() => {
  let filtered = mediaStore.movies

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by genre
  if (selectedGenre.value) {
    filtered = filtered.filter(movie => movie.genre === selectedGenre.value)
  }

  // Sort
  return filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'year':
        return b.year - a.year
      case 'rating':
        return b.rating - a.rating
      case 'duration':
        return a.duration.localeCompare(b.duration)
      default:
        return a.title.localeCompare(b.title)
    }
  })
})

const toggleView = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const selectMovie = (movie) => {
  selectedMovie.value = movie
}

const closeModal = () => {
  selectedMovie.value = null
}

const playMovie = (movie) => {
  currentMovie.value = movie
  showVideoPlayer.value = true
  mediaStore.playMedia(movie)
  closeModal()
}

const closeVideoPlayer = () => {
  showVideoPlayer.value = false
  currentMovie.value = null
}

const onVideoEnded = () => {
  // Auto-play next movie or show recommendations
  console.log('Video ended, showing recommendations...')
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
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
