<template>
  <div class="advanced-search">
    <div class="search-container">
      <div class="search-input-wrapper">
        <input
          v-model="localSearchQuery"
          type="text"
          placeholder="Search movies, music, artists, genres..."
          class="search-input"
          @input="handleSearch"
          @focus="showSuggestions = true"
          @blur="hideSuggestions"
        />
        <button class="search-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
        
        <button 
          v-if="localSearchQuery" 
          @click="clearSearch" 
          class="clear-button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <!-- Search Suggestions -->
      <div v-if="showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0)" class="suggestions-dropdown">
        <div v-if="searchSuggestions.length > 0" class="suggestions-section">
          <h4>Suggestions</h4>
          <div 
            v-for="suggestion in searchSuggestions" 
            :key="suggestion"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            {{ suggestion }}
          </div>
        </div>
        
        <div v-if="searchHistory.length > 0" class="suggestions-section">
          <div class="history-header">
            <h4>Recent Searches</h4>
            <button @click="clearHistory" class="clear-history-btn">
              Clear
            </button>
          </div>
          <div 
            v-for="historyItem in searchHistory.slice(0, 5)" 
            :key="historyItem"
            class="suggestion-item"
            @click="selectSuggestion(historyItem)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
            {{ historyItem }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Filters -->
    <div class="quick-filters">
      <button 
        v-for="filter in quickFilters" 
        :key="filter.label"
        @click="applyQuickFilter(filter)"
        :class="['quick-filter-btn', { active: isQuickFilterActive(filter) }]"
      >
        <component :is="filter.icon" />
        {{ filter.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMediaStore } from '../stores/media'

const mediaStore = useMediaStore()

// Local state
const localSearchQuery = ref(mediaStore.searchQuery)
const showSuggestions = ref(false)

// Computed properties
const searchSuggestions = computed(() => mediaStore.searchSuggestions)
const searchHistory = computed(() => mediaStore.searchHistory)

// Quick filters
const quickFilters = ref([
  {
    label: 'Favorites',
    type: 'favorites',
    icon: 'HeartIcon'
  },
  {
    label: 'Recent',
    type: 'recent',
    icon: 'ClockIcon'
  },
  {
    label: 'High Rated',
    type: 'highRated',
    icon: 'StarIcon'
  },
  {
    label: 'Sci-Fi',
    type: 'genre',
    value: 'Sci-Fi',
    icon: 'SparklesIcon'
  },
  {
    label: 'Action',
    type: 'genre',
    value: 'Action',
    icon: 'BoltIcon'
  }
])

// Watch for external search changes
watch(() => mediaStore.searchQuery, (newQuery) => {
  localSearchQuery.value = newQuery
})

// Methods
const handleSearch = () => {
  mediaStore.setSearchQuery(localSearchQuery.value)
}

const clearSearch = () => {
  localSearchQuery.value = ''
  mediaStore.setSearchQuery('')
}

const selectSuggestion = (suggestion) => {
  localSearchQuery.value = suggestion
  mediaStore.setSearchQuery(suggestion)
  showSuggestions.value = false
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const clearHistory = () => {
  mediaStore.clearSearchHistory()
}

const applyQuickFilter = (filter) => {
  switch (filter.type) {
    case 'favorites':
      // Toggle favorites view
      break
    case 'recent':
      // Show recent items
      break
    case 'highRated':
      mediaStore.setMovieFilters({ rating: '8.0' })
      break
    case 'genre':
      mediaStore.setMovieFilters({ genre: filter.value })
      break
  }
}

const isQuickFilterActive = (filter) => {
  if (filter.type === 'genre') {
    return mediaStore.movieFilters.genre === filter.value
  }
  if (filter.type === 'highRated') {
    return mediaStore.movieFilters.rating === '8.0'
  }
  return false
}
</script>

<style scoped>
.advanced-search {
  margin-bottom: 2rem;
}

.search-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem 1rem 3.5rem;
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-radius: 1.5rem;
  background: white;
  color: #374151;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

:global(.dark) .search-input {
  background: #1f2937;
  color: #f3f4f6;
  border-color: rgba(139, 92, 246, 0.3);
}

.search-button {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #8b5cf6;
  cursor: pointer;
  padding: 0.5rem;
}

.search-button svg {
  width: 1.5rem;
  height: 1.5rem;
}

.clear-button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.clear-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 0.5rem;
}

:global(.dark) .suggestions-dropdown {
  background: #1f2937;
  border-color: rgba(139, 92, 246, 0.3);
}

.suggestions-section {
  padding: 1rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
}

.suggestions-section:last-child {
  border-bottom: none;
}

.suggestions-section h4 {
  margin: 0 0 0.75rem 0;
  color: #8b5cf6;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
}

.suggestion-item:hover {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

:global(.dark) .suggestion-item {
  color: #f3f4f6;
}

.suggestion-item svg {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.quick-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: #6b7280;
  border-radius: 2rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.quick-filter-btn:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}

.quick-filter-btn.active {
  background: #8b5cf6;
  color: white;
  border-color: #8b5cf6;
}

:global(.dark) .quick-filter-btn {
  background: #1f2937;
  border-color: rgba(139, 92, 246, 0.3);
  color: #9ca3af;
}

:global(.dark) .quick-filter-btn:hover {
  background: rgba(139, 92, 246, 0.1);
}

@media (max-width: 768px) {
  .quick-filters {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  
  .quick-filter-btn {
    flex-shrink: 0;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
