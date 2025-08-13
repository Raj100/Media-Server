<template>
  <div class="search-filters">
    <div class="filters-header">
      <h3>Filters & Sort</h3>
      <button @click="resetFilters" class="reset-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M3 21v-5h5"/>
        </svg>
        Reset
      </button>
    </div>
    
    <div class="filters-content">
      <!-- Movie Filters -->
      <div v-if="type === 'movies'" class="filter-section">
        <div class="filter-group">
          <label>Genre</label>
          <select v-model="localMovieFilters.genre" @change="updateFilters">
            <option v-for="genre in movieGenres" :key="genre" :value="genre">
              {{ genre === 'all' ? 'All Genres' : genre }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Year</label>
          <select v-model="localMovieFilters.year" @change="updateFilters">
            <option v-for="year in movieYears" :key="year" :value="year">
              {{ year === 'all' ? 'All Years' : year }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Min Rating</label>
          <select v-model="localMovieFilters.rating" @change="updateFilters">
            <option value="all">Any Rating</option>
            <option value="8.5">8.5+ Stars</option>
            <option value="8.0">8.0+ Stars</option>
            <option value="7.5">7.5+ Stars</option>
            <option value="7.0">7.0+ Stars</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Sort By</label>
          <select v-model="localMovieFilters.sortBy" @change="updateFilters">
            <option value="title">Title</option>
            <option value="year">Year</option>
            <option value="rating">Rating</option>
            <option value="duration">Duration</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Order</label>
          <select v-model="localMovieFilters.sortOrder" @change="updateFilters">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
      
      <!-- Music Filters -->
      <div v-if="type === 'music'" class="filter-section">
        <div class="filter-group">
          <label>Artist</label>
          <select v-model="localMusicFilters.artist" @change="updateFilters">
            <option v-for="artist in musicArtists" :key="artist" :value="artist">
              {{ artist === 'all' ? 'All Artists' : artist }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Album</label>
          <select v-model="localMusicFilters.album" @change="updateFilters">
            <option v-for="album in musicAlbums" :key="album" :value="album">
              {{ album === 'all' ? 'All Albums' : album }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Sort By</label>
          <select v-model="localMusicFilters.sortBy" @change="updateFilters">
            <option value="title">Title</option>
            <option value="artist">Artist</option>
            <option value="album">Album</option>
            <option value="duration">Duration</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Order</label>
          <select v-model="localMusicFilters.sortOrder" @change="updateFilters">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMediaStore } from '../stores/media'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: value => ['movies', 'music'].includes(value)
  }
})

const mediaStore = useMediaStore()

// Local filter state
const localMovieFilters = ref({ ...mediaStore.movieFilters })
const localMusicFilters = ref({ ...mediaStore.musicFilters })

// Computed properties
const movieGenres = computed(() => mediaStore.movieGenres)
const movieYears = computed(() => mediaStore.movieYears)
const musicArtists = computed(() => mediaStore.musicArtists)
const musicAlbums = computed(() => mediaStore.musicAlbums)

// Watch for external filter changes
watch(() => mediaStore.movieFilters, (newFilters) => {
  localMovieFilters.value = { ...newFilters }
}, { deep: true })

watch(() => mediaStore.musicFilters, (newFilters) => {
  localMusicFilters.value = { ...newFilters }
}, { deep: true })

// Methods
const updateFilters = () => {
  if (props.type === 'movies') {
    mediaStore.setMovieFilters(localMovieFilters.value)
  } else {
    mediaStore.setMusicFilters(localMusicFilters.value)
  }
}

const resetFilters = () => {
  if (props.type === 'movies') {
    mediaStore.resetMovieFilters()
  } else {
    mediaStore.resetMusicFilters()
  }
}
</script>

<style scoped>
.search-filters {
  background: white;
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

:global(.dark) .search-filters {
  background: #1f2937;
  border-color: rgba(139, 92, 246, 0.3);
}

.filters-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.filters-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

:global(.dark) .filters-header h3 {
  color: #f3f4f6;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #8b5cf6;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
}

.reset-btn svg {
  width: 1rem;
  height: 1rem;
}

.filters-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.filter-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

:global(.dark) .filter-group label {
  color: #9ca3af;
}

.filter-group select {
  padding: 0.75rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 0.5rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-group select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

:global(.dark) .filter-group select {
  background: #374151;
  color: #f3f4f6;
  border-color: rgba(139, 92, 246, 0.3);
}

:global(.dark) .filter-group select:focus {
  background: #4b5563;
}

@media (max-width: 768px) {
  .filter-section {
    grid-template-columns: 1fr;
  }
  
  .filters-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .reset-btn {
    justify-content: center;
  }
}
</style>
