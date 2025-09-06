<template>
  <nav class="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-purple-400/10 dark:border-purple-500/20 sticky top-0 z-[1000] transition-all duration-300 ease-in-out">
    <div class="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-16 text-black dark:text-white">
      <!-- Logo -->
      <div class="nav-brand">
        <router-link to="/dashboard" class="brand-link">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h1 class="brand-text">Media Server</h1>
        </router-link>
      </div>
      
      <!-- Search Bar -->
      <div class="nav-search" v-if="isAuthenticated">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search movies, music, or chat..."
            class="search-input"
            @focus="showSearchResults = true"
            @blur="hideSearchResults"
            @input="handleSearch"
          />
          <button class="search-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          
          <!-- Search Results Dropdown -->
          <div v-if="showSearchResults && searchResults.length > 0" class="search-results">
            <div class="search-section" v-if="searchResults.movies.length > 0">
              <h4>Movies</h4>
              <div 
                v-for="movie in searchResults.movies.slice(0, 3)" 
                :key="'movie-' + movie.id"
                class="search-result-item"
                @click="selectSearchResult(movie, 'movie')"
              >
                <img :src="movie.thumbnail" :alt="movie.title" />
                <div class="result-info">
                  <span class="result-title">{{ movie.title }}</span>
                  <span class="result-meta">{{ movie.genre }} • {{ movie.year }}</span>
                </div>
              </div>
            </div>
            
            <div class="search-section" v-if="searchResults.music.length > 0">
              <h4>Music</h4>
              <div 
                v-for="track in searchResults.music.slice(0, 3)" 
                :key="'music-' + track.id"
                class="search-result-item"
                @click="selectSearchResult(track, 'music')"
              >
                <img :src="track.thumbnail" :alt="track.title" />
                <div class="result-info">
                  <span class="result-title">{{ track.title }}</span>
                  <span class="result-meta">{{ track.artist }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="nav-links desktop-nav" v-if="isAuthenticated">
        <router-link to="/dashboard" class="nav-link" :class="{ active: $route.path === '/dashboard' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Dashboard
        </router-link>
        
        <router-link to="/movies" class="nav-link" :class="{ active: $route.path === '/movies' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 4L8 16l-4-4"/>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Movies
        </router-link>
        
        <router-link to="/music" class="nav-link" :class="{ active: $route.path === '/music' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          Music
        </router-link>
        
        <router-link to="/chat" class="nav-link" :class="{ active: $route.path === '/chat' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chat
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </router-link>
      </div>
      
      <!-- User Actions -->
      <div class="nav-actions">
        <!-- Notifications -->
        <div v-if="isAuthenticated" class="notifications-dropdown">
          <button @click="toggleNotifications" class="notification-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span v-if="notificationCount > 0" class="notification-dot">{{ notificationCount }}</span>
          </button>
          
          <div v-if="showNotifications" class="notifications-panel">
            <div class="notifications-header">
              <h3>Notifications</h3>
              <button @click="markAllAsRead" class="mark-read-btn">Mark all as read</button>
            </div>
            
            <div class="notifications-list">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                :class="['notification-item', { unread: !notification.read }]"
              >
                <div class="notification-icon">
                  <img :src="notification.avatar" :alt="notification.user" />
                </div>
                <div class="notification-content">
                  <p>{{ notification.message }}</p>
                  <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Theme Toggle -->
        <button @click="themeStore.toggleMode" class="theme-toggle">
          <svg v-if="!themeStore.isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        
        <!-- User Menu -->
        <div v-if="isAuthenticated" class="user-menu-dropdown">
          <button @click="toggleUserMenu" class="user-menu-button">
            <img :src="user.avatar ? user.avatar : 'abstract-user-avatar.png'" :alt="user.name" class="user-avatar" />
            <span class="user-name">{{ user.name }}</span>
            <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>
          
          <div v-if="showUserMenu" class="user-menu-panel">
            <div class="user-menu-header">
              <img :src="user.avatar ? user.avatar : 'abstract-user-avatar.png'"  :alt="user.name" class="menu-avatar" />
              <div class="menu-user-info">
                <h4>{{ user.name }}</h4>
                <p>{{ user.email }}</p>
              </div>
            </div>
            
            
            <div class="user-menu-items">
              <router-link to="/profile">
              <button @click="viewProfile" class="menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile Settings
              </button>
              </router-link>

              <router-link to="/server-dashboard">
              <button @click="viewPreferences" class="menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
                Preferences
              </button>
              </router-link>

              <router-link to="/media">
              <button @click="viewPreferences" class="menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
                Manage Media
              </button>
              </router-link>

              <router-link to="/status">
              <button @click="viewStats" class="menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 3v18h18"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
                Statistics
              </button>
              </router-link>
              
              <div class="menu-divider"></div>
              
              <button @click="logout" class="menu-item logout-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        <!-- Login Button for non-authenticated users -->
        <router-link v-else to="/login" class="login-button">
          Sign In
        </router-link>
        
        <!-- Mobile Menu Toggle -->
        <button @click="toggleMobileMenu" class="mobile-menu-toggle">
          <svg v-if="!showMobileMenu" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Mobile Navigation Menu -->
    <div v-if="showMobileMenu && isAuthenticated" class="mobile-nav">
      <div class="mobile-nav-links">
        <router-link to="/dashboard" class="mobile-nav-link" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Dashboard
        </router-link>
        
        <router-link to="/movies" class="mobile-nav-link" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Movies
        </router-link>
        
        <router-link to="/music" class="mobile-nav-link" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          Music
        </router-link>
        
        <router-link to="/chat" class="mobile-nav-link" @click="closeMobileMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chat
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useChatStore } from '../stores/chat'
import { useMediaStore } from '../stores/media'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const chatStore = useChatStore()
const mediaStore = useMediaStore()

// Reactive data
const searchQuery = ref('')
const showSearchResults = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isDarkMode = computed(() => themeStore.isDarkMode)
const unreadCount = computed(() => chatStore.unreadCount)

// Mock notifications data
const notifications = ref([
  {
    id: 1,
    user: 'Sarah',
    avatar: '/placeholder.svg?height=32&width=32',
    message: 'Recommended "Dune" - you might love it!',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false
  },
  {
    id: 2,
    user: 'Mike',
    avatar: '/placeholder.svg?height=32&width=32',
    message: 'Started watching "Blade Runner 2049"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false
  },
  {
    id: 3,
    user: 'System',
    avatar: '/placeholder.svg?height=32&width=32',
    message: 'New movies added to your library',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true
  }
])

const notificationCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return { movies: [], music: [] }
  
  const query = searchQuery.value.toLowerCase()
  const movies = mediaStore.movies.filter(movie => 
    movie.title.toLowerCase().includes(query) ||
    movie.genre.toLowerCase().includes(query)
  )
  const music = mediaStore.music.filter(track => 
    track.title.toLowerCase().includes(query) ||
    track.artist.toLowerCase().includes(query)
  )
  
  return { movies, music }
})

// Methods
const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    showSearchResults.value = true
  }
}

const hideSearchResults = () => {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

const selectSearchResult = (item, type) => {
  if (type === 'movie') {
    router.push('/movies')
  } else if (type === 'music') {
    router.push('/music')
  }
  searchQuery.value = ''
  showSearchResults.value = false
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const viewProfile = () => {
  showUserMenu.value = false
  // Navigate to profile page
}

const viewPreferences = () => {
  showUserMenu.value = false
  // Navigate to preferences page
}

const viewStats = () => {
  showUserMenu.value = false
  // Navigate to stats page
}

const logout = () => {
  authStore.logout()
  router.push('/login')
  showUserMenu.value = false
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.notifications-dropdown')) {
    showNotifications.value = false
  }
  if (!event.target.closest('.user-menu-dropdown')) {
    showUserMenu.value = false
  }
  if (!event.target.closest('.nav-search')) {
    showSearchResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* .navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
} */

:global(.dark) .navbar {
  background: rgba(17, 24, 39, 0.95);
  border-bottom-color: rgba(139, 92, 246, 0.2);
}

/* .nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
} */

.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #8b5cf6;
  font-weight: 700;
  transition: all 0.3s ease;
}

.brand-link:hover {
  color: #7c3aed;
  transform: translateY(-1px);
}

.brand-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border-radius: 0.5rem;
  color: white;
}

.brand-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.brand-text {
  font-size: 1.5rem;
  margin: 0;
}

.nav-search {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  position: relative;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid rgba(139, 92, 246, 0.2);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: white;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

:global(.dark) .search-input {
  background: rgba(31, 41, 55, 0.8);
  color: #f3f4f6;
  border-color: rgba(139, 92, 246, 0.3);
}

:global(.dark) .search-input:focus {
  background: #1f2937;
}

.search-button {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #8b5cf6;
  cursor: pointer;
  padding: 0.25rem;
}

.search-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 0.5rem;
}

:global(.dark) .search-results {
  background: #1f2937;
  border-color: rgba(139, 92, 246, 0.3);
}

.search-section {
  padding: 1rem;
}

.search-section h4 {
  margin: 0 0 0.75rem 0;
  color: #8b5cf6;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-result-item:hover {
  background: rgba(139, 92, 246, 0.1);
}

.search-result-item img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  object-fit: cover;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.result-title {
  font-weight: 500;
  color: #374151;
}

:global(.dark) .result-title {
  color: #f3f4f6;
}

.result-meta {
  font-size: 0.75rem;
  color: #6b7280;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.nav-link.active {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.15);
}

.nav-link svg {
  width: 1.125rem;
  height: 1.125rem;
}

.notification-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  min-width: 1.25rem;
  text-align: center;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notifications-dropdown,
.user-menu-dropdown {
  position: relative;
}

.notification-button,
.theme-toggle {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.notification-button:hover,
.theme-toggle:hover {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.notification-button svg,
.theme-toggle svg {
  width: 1.25rem;
  height: 1.25rem;
}

.notification-dot {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: 0.5rem;
  min-width: 1rem;
  text-align: center;
}

.notifications-panel,
.user-menu-panel {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  z-index: 1000;
  margin-top: 0.5rem;
}

:global(.dark) .notifications-panel,
:global(.dark) .user-menu-panel {
  background: #1f2937;
  border-color: rgba(139, 92, 246, 0.3);
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
}

.notifications-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

:global(.dark) .notifications-header h3 {
  color: #f3f4f6;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #8b5cf6;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.mark-read-btn:hover {
  background: rgba(139, 92, 246, 0.1);
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.05);
  transition: all 0.2s ease;
}

.notification-item:hover {
  background: rgba(139, 92, 246, 0.05);
}

.notification-item.unread {
  background: rgba(139, 92, 246, 0.05);
}

.notification-icon img {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.notification-content {
  flex: 1;
}

.notification-content p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #374151;
}

:global(.dark) .notification-content p {
  color: #f3f4f6;
}

.notification-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.user-menu-button:hover {
  background: rgba(139, 92, 246, 0.1);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

:global(.dark) .user-name {
  color: #f3f4f6;
}

.dropdown-arrow {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
}

.menu-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.menu-user-info h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.menu-user-info p {
  margin: 0.125rem 0 0 0;
  font-size: 0.75rem;
  color: #6b7280;
}

:global(.dark) .menu-user-info h4 {
  color: #f3f4f6;
}

.user-menu-items {
  padding: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.2s ease;
  text-align: left;
}

.menu-item:hover {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.menu-item svg {
  width: 1.125rem;
  height: 1.125rem;
}

.menu-divider {
  height: 1px;
  background: rgba(139, 92, 246, 0.1);
  margin: 0.5rem 0;
}

.logout-item {
  color: #ef4444;
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.login-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  text-decoration: none;
  border-radius: 0.75rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.mobile-menu-toggle svg {
  width: 1.5rem;
  height: 1.5rem;
}

.mobile-nav {
  display: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(139, 92, 246, 0.1);
  padding: 1rem;
}

:global(.dark) .mobile-nav {
  background: rgba(17, 24, 39, 0.95);
  border-top-color: rgba(139, 92, 246, 0.2);
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.mobile-nav-link:hover {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.mobile-nav-link svg {
  width: 1.25rem;
  height: 1.25rem;
}

@media (max-width: 768px) {
  .nav-search {
    display: none;
  }
  
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: block;
  }
  
  .mobile-nav {
    display: block;
  }
  
  .user-name {
    display: none;
  }
  
  .nav-container {
    padding: 0 0.75rem;
  }
  
  .brand-text {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .nav-actions {
    gap: 0.5rem;
  }
  
  .notifications-panel,
  .user-menu-panel {
    min-width: 280px;
    right: -1rem;
  }
}
</style>
