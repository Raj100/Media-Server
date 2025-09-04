<template>
  <div class="dashboard">
    <Navbar />
    
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-text">
            <h1 class="welcome-title">Welcome back, {{ user?.name }}!</h1>
            <p class="welcome-subtitle">Ready to dive into your media collection?</p>
            <div class="welcome-actions">
              <router-link to="/movies" class="quick-action-btn primary">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Continue Watching
              </router-link>
              <button @click="discoverNew" class="quick-action-btn secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Discover New
              </button>
            </div>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon movies">🎬</div>
            <div class="stat-content">
              <div class="stat-number">{{ movies.length }}</div>
              <div class="stat-label">Movies</div>
              <div class="stat-change">+2 this week</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon music">🎵</div>
            <div class="stat-content">
              <div class="stat-number">{{ music.length }}</div>
              <div class="stat-label">Songs</div>
              <div class="stat-change">+5 this week</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon time">⏱️</div>
            <div class="stat-content">
              <div class="stat-number">24h</div>
              <div class="stat-label">Watch Time</div>
              <div class="stat-change">+3h this week</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon favorites">❤️</div>
            <div class="stat-content">
              <div class="stat-number">{{ favoriteCount }}</div>
              <div class="stat-label">Favorites</div>
              <div class="stat-change">+1 this week</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Continue Watching -->
        <section class="dashboard-section continue-watching">
          <div class="section-header">
            <h2 class="section-title">Continue Watching</h2>
            <router-link to="/movies" class="section-link">View All</router-link>
          </div>
          
          <div class="continue-grid">
            <div 
              v-for="item in continueWatching" 
              :key="item.id"
              class="continue-item"
              @click="resumeWatching(item)"
            >
              <div class="continue-thumbnail">
                <img :src="item.thumbnail" :alt="item.title" />
                <div class="progress-overlay">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
                  </div>
                  <div class="progress-time">{{ item.timeLeft }} left</div>
                </div>
                <button class="resume-button">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
              
              <div class="continue-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.progress }}% complete</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Recently Added -->
        <section class="dashboard-section recently-added">
          <div class="section-header">
            <h2 class="section-title">Recently Added</h2>
            <button @click="refreshRecent" class="refresh-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </button>
          </div>
          
          <div class="media-carousel">
            <div 
              v-for="item in recentlyAdded" 
              :key="item.id"
              class="media-card"
              @click="playMedia(item)"
            >
              <div class="media-poster">
                <img :src="item.thumbnail" :alt="item.title" />
                <div class="media-overlay">
                  <button class="play-button">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                <div class="media-type">{{ item.genre || item.artist }}</div>
              </div>
              
              <div class="media-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.year || 'Music' }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Recommendations -->
        <section class="dashboard-section recommendations">
          <div class="section-header">
            <h2 class="section-title">Recommended for You</h2>
            <button @click="refreshRecommendations" class="section-link">Refresh</button>
          </div>
          
          <div class="recommendations-grid">
            <div 
              v-for="item in recommendations" 
              :key="item.id"
              class="recommendation-card"
              @click="playMedia(item)"
            >
              <div class="recommendation-poster">
                <img :src="item.thumbnail" :alt="item.title" />
                <div class="recommendation-overlay">
                  <div class="recommendation-rating">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {{ item.rating }}
                  </div>
                  <button class="add-to-list">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="recommendation-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.genre || item.artist }}</p>
                <div class="recommendation-reason">Because you liked similar content</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Activity Feed -->
        <section class="dashboard-section activity-feed">
          <div class="section-header">
            <h2 class="section-title">Recent Activity</h2>
            <router-link to="/chat" class="section-link">View Chat</router-link>
          </div>
          
          <div class="activity-list">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <img :src="activity.user.avatar" :alt="activity.user.name" />
              </div>
              
              <div class="activity-content">
                <div class="activity-text">
                  <strong>{{ activity.user.name }}</strong> {{ activity.action }}
                  <strong>{{ activity.item.title }}</strong>
                </div>
                <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
              </div>
              
              <div class="activity-media">
                <img :src="activity.item.thumbnail" :alt="activity.item.title" />
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="dashboard-section quick-actions">
          <div class="section-header">
            <h2 class="section-title">Quick Actions</h2>
          </div>
          
          <div class="actions-grid">
            <button @click="uploadMedia" class="action-card upload">
              <div class="action-icon">📁</div>
              <h3>Upload Media</h3>
              <p>Add new content</p>
            </button>
            
            <button @click="createPlaylist" class="action-card playlist">
              <div class="action-icon">🎵</div>
              <h3>Create Playlist</h3>
              <p>Organize your music</p>
            </button>
            
            <router-link to="/chat" class="action-card chat">
              <div class="action-icon">💬</div>
              <h3>Start Chat</h3>
              <p>Connect with friends</p>
            </router-link>
            
            <button @click="shareCollection" class="action-card share">
              <div class="action-icon">📤</div>
              <h3>Share Collection</h3>
              <p>Show your favorites</p>
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMediaStore } from '../stores/media'
import Navbar from '../components/Navbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const mediaStore = useMediaStore()

const user = computed(() => authStore.user)
const movies = computed(() => mediaStore.movies)
const music = computed(() => mediaStore.music)

const favoriteCount = computed(() => {
  return mediaStore.favoriteMovies.length + mediaStore.favoriteMusic.length
})

const continueWatching = ref([
  {
    id: 1,
    title: 'The Matrix',
    thumbnail: '/matrix-movie-poster.png',
    progress: 65,
    timeLeft: '45 min'
  },
  {
    id: 2,
    title: 'Inception',
    thumbnail: '/inception-movie-poster.png',
    progress: 30,
    timeLeft: '1h 20min'
  },
  {
    id: 3,
    title: 'Interstellar',
    thumbnail: '/interstellar-inspired-poster.png',
    progress: 85,
    timeLeft: '25 min'
  }
])

const recentlyAdded = computed(() => {
  return [...movies.value, ...music.value].slice(-6)
})

const recommendations = computed(() => {
  return movies.value.slice(0, 4)
})

const recentActivity = ref([
  {
    id: 1,
    user: { name: 'Sarah Johnson', avatar: '/diverse-user-avatars.png' },
    action: 'recommended',
    item: { title: 'Dune', thumbnail: '/inspired-by-dune-poster.png' },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 2,
    user: { name: 'Mike Chen', avatar: '/google-user-avatar.png' },
    action: 'shared',
    item: { title: 'Bohemian Rhapsody', thumbnail: '/queen-album-cover.png' },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: 3,
    user: { name: 'Emma Wilson', avatar: '/abstract-user-avatar.png' },
    action: 'added to favorites',
    item: { title: 'Mad Max: Fury Road', thumbnail: '/mad-max-inspired-poster.png' },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
])

const playMedia = (media) => {
  mediaStore.playMedia(media)
  if (media.genre) {
    router.push('/movies')
  } else {
    router.push('/music')
  }
}

const resumeWatching = (item) => {
  // Resume watching functionality
  playMedia(item)
}

const discoverNew = () => {
  router.push('/movies')
}

const uploadMedia = () => {
  alert('Upload functionality would be implemented here')
}

const createPlaylist = () => {
  router.push('/music')
}

const shareCollection = () => {
  alert('Share collection functionality would be implemented here')
}

const refreshRecent = () => {
  // Refresh recently added content
  console.log('Refreshing recent content...')
}

const refreshRecommendations = () => {
  // Refresh recommendations
  console.log('Refreshing recommendations...')
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInHours = (now - time) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else {
    return time.toLocaleDateString()
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
}

.dark .dashboard {
  background: linear-gradient(135deg, #1a1a1a, #2a1a2a);
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-section {
  background: white;
  border-radius: 2rem;
  padding: 2.5rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 40px rgba(88, 28, 135, 0.1);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3rem;
  align-items: center;
}

.dark .welcome-section {
  background: #2a2a2a;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #581c87, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 2rem;
}

.welcome-actions {
  display: flex;
  gap: 1rem;
}

.quick-action-btn {
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-action-btn.primary {
  background: linear-gradient(135deg, #581c87, #a855f7);
  color: white;
}

.quick-action-btn.secondary {
  background: rgba(168, 85, 247, 0.1);
  color: #581c87;
  border: 2px solid #a855f7;
}

.dark .quick-action-btn.secondary {
  color: #a855f7;
}

.quick-action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(88, 28, 135, 0.3);
}

.quick-action-btn svg {
  width: 1.2rem;
  height: 1.2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background: rgba(168, 85, 247, 0.05);
  border-radius: 1.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(88, 28, 135, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.movies { background: linear-gradient(135deg, #ef4444, #f97316); }
.stat-icon.music { background: linear-gradient(135deg, #8b5cf6, #a855f7); }
.stat-icon.time { background: linear-gradient(135deg, #06b6d4, #0891b2); }
.stat-icon.favorites { background: linear-gradient(135deg, #ec4899, #be185d); }

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #581c87;
}

.dark .stat-number {
  color: #a855f7;
}

.stat-label {
  font-weight: 600;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 500;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.dashboard-section {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(88, 28, 135, 0.1);
}

.dark .dashboard-section {
  background: #2a2a2a;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #581c87;
}

.dark .section-title {
  color: #a855f7;
}

.section-link {
  color: #a855f7;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.section-link:hover {
  color: #581c87;
}

.refresh-button {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  background: rgba(168, 85, 247, 0.1);
  transform: rotate(180deg);
}

.refresh-button svg {
  width: 1.2rem;
  height: 1.2rem;
  color: #a855f7;
}

.continue-watching {
  grid-column: 1 / -1;
}

.continue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.continue-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-item:hover {
  transform: translateY(-5px);
}

.continue-thumbnail {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 1rem;
}

.continue-thumbnail img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.progress-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1rem;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #581c87, #a855f7);
  transition: width 0.3s ease;
}

.progress-time {
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
}

.resume-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
}

.continue-item:hover .resume-button {
  opacity: 1;
}

.resume-button svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #581c87;
}

.continue-info h4 {
  font-weight: 600;
  color: #581c87;
  margin-bottom: 0.25rem;
}

.dark .continue-info h4 {
  color: #a855f7;
}

.continue-info p {
  font-size: 0.9rem;
  opacity: 0.8;
}

.media-carousel {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.media-card {
  flex-shrink: 0;
  width: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.media-card:hover {
  transform: scale(1.05);
}

.media-poster {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.media-poster img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.media-card:hover .media-overlay {
  opacity: 1;
}

.play-button {
  background: white;
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

.play-button:hover {
  transform: scale(1.1);
}

.play-button svg {
  width: 1.2rem;
  height: 1.2rem;
  color: #581c87;
}

.media-type {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.media-info h4 {
  font-weight: 600;
  color: #581c87;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .media-info h4 {
  color: #a855f7;
}

.media-info p {
  font-size: 0.85rem;
  opacity: 0.8;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.recommendation-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  transform: translateY(-3px);
}

.recommendation-poster {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 1rem;
}

.recommendation-poster img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.recommendation-overlay {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

.recommendation-rating {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.recommendation-rating svg {
  width: 0.75rem;
  height: 0.75rem;
  color: #fbbf24;
}

.add-to-list {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-list:hover {
  background: white;
  transform: scale(1.1);
}

.add-to-list svg {
  width: 1rem;
  height: 1rem;
  color: #581c87;
}

.recommendation-info h4 {
  font-weight: 600;
  color: #581c87;
  margin-bottom: 0.25rem;
}

.dark .recommendation-info h4 {
  color: #a855f7;
}

.recommendation-info p {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.recommendation-reason {
  font-size: 0.75rem;
  color: #a855f7;
  font-style: italic;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(168, 85, 247, 0.05);
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(168, 85, 247, 0.1);
}

.activity-icon img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.8rem;
  opacity: 0.6;
}

.activity-media img {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  object-fit: cover;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.action-card {
  background: rgba(168, 85, 247, 0.05);
  border: 2px solid transparent;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  border-color: #a855f7;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(88, 28, 135, 0.15);
}

.action-card.upload {
  background: linear-gradient(135deg, rgba(88, 28, 135, 0.1), rgba(168, 85, 247, 0.1));
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #581c87;
}

.dark .action-card h3 {
  color: #a855f7;
}

.action-card p {
  font-size: 0.85rem;
  opacity: 0.8;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .welcome-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .continue-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-actions {
    justify-content: center;
  }
  
  .quick-action-btn {
    padding: 0.75rem 1.5rem;
  }
}
</style>
