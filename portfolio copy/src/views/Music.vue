<template>
  <div class="music-page">
    <Navbar />
    
    <div class="music-container">
      <!-- Header Section -->
      <section class="music-header">
        <div class="header-content">
          <h1 class="page-title">Music Library</h1>
          <p class="page-subtitle">Your personal soundtrack awaits</p>
        </div>
        
        <!-- Search and Controls -->
        <div class="music-controls">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search songs, artists, albums..."
              class="search-input"
            />
            <button class="search-button">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </div>
          
          <div class="view-controls">
            <button 
              @click="activeView = 'songs'" 
              :class="['view-button', { active: activeView === 'songs' }]"
            >
              Songs
            </button>
            <button 
              @click="activeView = 'albums'" 
              :class="['view-button', { active: activeView === 'albums' }]"
            >
              Albums
            </button>
            <button 
              @click="activeView = 'playlists'" 
              :class="['view-button', { active: activeView === 'playlists' }]"
            >
              Playlists
            </button>
          </div>
        </div>
      </section>

      <!-- Now Playing Bar -->
      <div v-if="currentlyPlaying" class="now-playing-bar">
        <div class="now-playing-info">
          <img :src="currentlyPlaying.thumbnail" :alt="currentlyPlaying.title" class="now-playing-thumb" />
          <div class="now-playing-text">
            <h4>{{ currentlyPlaying.title }}</h4>
            <p>{{ currentlyPlaying.artist }}</p>
          </div>
        </div>
        
        <div class="now-playing-controls">
          <button @click="previousTrack" class="control-button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6v14zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          
          <button @click="togglePlayPause" class="control-button play-pause">
            <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          
          <button @click="nextTrack" class="control-button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>
        
        <div class="now-playing-progress">
          <span class="time-current">{{ formatTime(currentTime) }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <span class="time-total">{{ formatTime(totalTime) }}</span>
        </div>
        
        <button @click="stopPlayback" class="close-player">×</button>
      </div>

      <!-- Content Views -->
      <section class="music-content">
        <!-- Songs View -->
        <div v-if="activeView === 'songs'" class="songs-view">
          <div class="songs-list">
            <div
              v-for="(song, index) in filteredMusic"
              :key="song.id"
              :class="['song-item', { 'playing': currentlyPlaying?.id === song.id }]"
              @click="playSong(song)"
            >
              <div class="song-number">
                <span v-if="currentlyPlaying?.id !== song.id">{{ index + 1 }}</span>
                <div v-else class="playing-indicator">
                  <div class="bar"></div>
                  <div class="bar"></div>
                  <div class="bar"></div>
                </div>
              </div>
              
              <img :src="song.thumbnail" :alt="song.album" class="song-thumbnail" />
              
              <div class="song-info">
                <h4 class="song-title">{{ song.title }}</h4>
                <p class="song-artist">{{ song.artist }}</p>
              </div>
              
              <div class="song-album">{{ song.album }}</div>
              <div class="song-duration">{{ song.duration }}</div>
              
              <button @click.stop="toggleFavorite(song)" class="favorite-button">
                <svg viewBox="0 0 24 24" :fill="song.isFavorite ? 'currentColor' : 'none'" stroke="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Albums View -->
        <div v-if="activeView === 'albums'" class="albums-view">
          <div class="albums-grid">
            <div
              v-for="album in uniqueAlbums"
              :key="album.album"
              class="album-card"
              @click="selectAlbum(album)"
            >
              <div class="album-cover">
                <img :src="album.thumbnail" :alt="album.album" />
                <div class="album-overlay">
                  <button @click.stop="playAlbum(album)" class="play-album-button">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="album-info">
                <h3 class="album-title">{{ album.album }}</h3>
                <p class="album-artist">{{ album.artist }}</p>
                <p class="album-tracks">{{ getAlbumTrackCount(album.album) }} tracks</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Playlists View -->
        <div v-if="activeView === 'playlists'" class="playlists-view">
          <div class="playlists-header">
            <button @click="showCreatePlaylist = true" class="create-playlist-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Playlist
            </button>
          </div>
          
          <div class="playlists-grid">
            <div
              v-for="playlist in playlists"
              :key="playlist.id"
              class="playlist-card"
              @click="selectPlaylist(playlist)"
            >
              <div class="playlist-cover">
                <div class="playlist-icon">🎵</div>
              </div>
              
              <div class="playlist-info">
                <h3 class="playlist-title">{{ playlist.name }}</h3>
                <p class="playlist-count">{{ playlist.songs.length }} songs</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Create Playlist Modal -->
    <div v-if="showCreatePlaylist" class="modal-overlay" @click="showCreatePlaylist = false">
      <div class="playlist-modal" @click.stop>
        <h3>Create New Playlist</h3>
        <input
          v-model="newPlaylistName"
          type="text"
          placeholder="Playlist name"
          class="playlist-input"
          @keyup.enter="createPlaylist"
        />
        <div class="playlist-modal-actions">
          <button @click="showCreatePlaylist = false" class="modal-button secondary">Cancel</button>
          <button @click="createPlaylist" class="modal-button primary">Create</button>
        </div>
      </div>
    </div>

    <!-- Audio Player Component -->
    <AudioPlayer
      v-if="currentTrack"
      :media="currentTrack"
      :isVisible="showAudioPlayer"
      @close="closeAudioPlayer"
      @ended="onAudioEnded"
      @favorite-toggled="onFavoriteToggled"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMediaStore } from '../stores/media'
import Navbar from '../components/Navbar.vue'
import AudioPlayer from '../components/AudioPlayer.vue'

const router = useRouter()
const authStore = useAuthStore()
const mediaStore = useMediaStore()

const searchQuery = ref('')
const activeView = ref('songs')
const showCreatePlaylist = ref(false)
const newPlaylistName = ref('')
const isPlaying = ref(false)
const currentTime = ref(0)
const totalTime = ref(180) // 3 minutes default

const currentlyPlaying = computed(() => mediaStore.currentlyPlaying)
const playlists = ref([
  { id: 1, name: 'My Favorites', songs: [] },
  { id: 2, name: 'Chill Vibes', songs: [] },
  { id: 3, name: 'Workout Mix', songs: [] }
])

const filteredMusic = computed(() => {
  if (!searchQuery.value) return mediaStore.music
  
  return mediaStore.music.filter(song =>
    song.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const uniqueAlbums = computed(() => {
  const albums = new Map()
  mediaStore.music.forEach(song => {
    if (!albums.has(song.album)) {
      albums.set(song.album, {
        album: song.album,
        artist: song.artist,
        thumbnail: song.thumbnail
      })
    }
  })
  return Array.from(albums.values())
})

const progressPercentage = computed(() => {
  return totalTime.value > 0 ? (currentTime.value / totalTime.value) * 100 : 0
})

const getAlbumTrackCount = (albumName) => {
  return mediaStore.music.filter(song => song.album === albumName).length
}

const playSong = (song) => {
  currentTrack.value = song
  showAudioPlayer.value = true
  mediaStore.playMedia(song)
  isPlaying.value = true
  currentTime.value = 0
  simulatePlayback()
}

const playAlbum = (album) => {
  const albumSongs = mediaStore.music.filter(song => song.album === album.album)
  if (albumSongs.length > 0) {
    playSong(albumSongs[0])
  }
}

const togglePlayPause = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    simulatePlayback()
  }
}

const previousTrack = () => {
  const currentIndex = mediaStore.music.findIndex(song => song.id === currentlyPlaying.value?.id)
  if (currentIndex > 0) {
    playSong(mediaStore.music[currentIndex - 1])
  }
}

const nextTrack = () => {
  const currentIndex = mediaStore.music.findIndex(song => song.id === currentlyPlaying.value?.id)
  if (currentIndex < mediaStore.music.length - 1) {
    playSong(mediaStore.music[currentIndex + 1])
  }
}

const stopPlayback = () => {
  mediaStore.stopMedia()
  isPlaying.value = false
  currentTime.value = 0
}

const toggleFavorite = (song) => {
  mediaStore.toggleFavorite(song.id, 'music')
}

const selectAlbum = (album) => {
  // Navigate to album detail view or play album
  playAlbum(album)
}

const selectPlaylist = (playlist) => {
  // Navigate to playlist detail view
  console.log('Selected playlist:', playlist.name)
}

const createPlaylist = () => {
  if (newPlaylistName.value.trim()) {
    playlists.value.push({
      id: Date.now(),
      name: newPlaylistName.value.trim(),
      songs: []
    })
    newPlaylistName.value = ''
    showCreatePlaylist.value = false
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const simulatePlayback = () => {
  if (isPlaying.value && currentTime.value < totalTime.value) {
    setTimeout(() => {
      currentTime.value += 1
      simulatePlayback()
    }, 1000)
  }
}

const showAudioPlayer = ref(false)
const currentTrack = ref(null)

const closeAudioPlayer = () => {
  showAudioPlayer.value = false
  currentTrack.value = null
  stopPlayback()
}

const onAudioEnded = () => {
  // Handle track end
  console.log('Track ended')
}

const onFavoriteToggled = () => {
  // Refresh the current track data
  if (currentTrack.value) {
    const updatedTrack = mediaStore.music.find(t => t.id === currentTrack.value.id)
    if (updatedTrack) {
      currentTrack.value = updatedTrack
    }
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style scoped>
.music-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
  padding-bottom: 6rem; /* Space for now playing bar */
}

.dark .music-page {
  background: linear-gradient(135deg, #1a1a1a, #2a1a2a);
}

.music-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.music-header {
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

.music-controls {
  display: flex;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
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

.search-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: white;
}

.view-controls {
  display: flex;
  background: white;
  border-radius: 2rem;
  padding: 0.25rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.dark .view-controls {
  background: #374151;
}

.view-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 1.5rem;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-button.active {
  background: linear-gradient(135deg, #581c87, #a855f7);
  color: white;
}

.now-playing-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 100;
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.1);
}

.dark .now-playing-bar {
  background: #2a2a2a;
  border-top-color: #4b5563;
}

.now-playing-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
}

.now-playing-thumb {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  object-fit: cover;
}

.now-playing-text h4 {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #581c87;
}

.dark .now-playing-text h4 {
  color: #a855f7;
}

.now-playing-text p {
  font-size: 0.9rem;
  opacity: 0.8;
}

.now-playing-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.control-button:hover {
  background: rgba(168, 85, 247, 0.1);
}

.control-button svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #581c87;
}

.dark .control-button svg {
  color: #a855f7;
}

.play-pause {
  background: linear-gradient(135deg, #581c87, #a855f7);
  color: white;
}

.play-pause svg {
  color: white;
}

.now-playing-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.dark .progress-bar {
  background: #4b5563;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #581c87, #a855f7);
  transition: width 0.3s ease;
}

.close-player {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.close-player:hover {
  opacity: 1;
}

.songs-list {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.dark .songs-list {
  background: #2a2a2a;
}

.song-item {
  display: grid;
  grid-template-columns: 3rem 4rem 1fr 200px 80px 3rem;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 1rem;
}

.dark .song-item {
  border-bottom-color: #374151;
}

.song-item:hover {
  background: rgba(168, 85, 247, 0.05);
}

.song-item.playing {
  background: rgba(168, 85, 247, 0.1);
}

.song-number {
  text-align: center;
  font-weight: 500;
  opacity: 0.6;
}

.playing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.playing-indicator .bar {
  width: 3px;
  height: 12px;
  background: #a855f7;
  border-radius: 1px;
  animation: bounce 1.4s ease-in-out infinite both;
}

.playing-indicator .bar:nth-child(2) {
  animation-delay: -0.32s;
}

.playing-indicator .bar:nth-child(3) {
  animation-delay: -0.16s;
}

.song-thumbnail {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  object-fit: cover;
}

.song-info {
  min-width: 0;
}

.song-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #581c87;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .song-title {
  color: #a855f7;
}

.song-artist {
  font-size: 0.9rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-album,
.song-duration {
  font-size: 0.9rem;
  opacity: 0.8;
}

.favorite-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.favorite-button:hover {
  background: rgba(168, 85, 247, 0.1);
}

.favorite-button svg {
  width: 1.2rem;
  height: 1.2rem;
  color: #a855f7;
}

.albums-grid,
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.album-card,
.playlist-card {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.dark .album-card,
.dark .playlist-card {
  background: #2a2a2a;
}

.album-card:hover,
.playlist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(88, 28, 135, 0.2);
}

.album-cover,
.playlist-cover {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-cover {
  background: linear-gradient(135deg, #581c87, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.playlist-icon {
  font-size: 3rem;
  color: white;
}

.album-overlay {
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

.album-card:hover .album-overlay {
  opacity: 1;
}

.play-album-button {
  background: white;
  border: none;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-album-button:hover {
  transform: scale(1.1);
}

.play-album-button svg {
  width: 2rem;
  height: 2rem;
  color: #581c87;
}

.album-info,
.playlist-info {
  padding: 1.5rem;
}

.album-title,
.playlist-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #581c87;
}

.dark .album-title,
.dark .playlist-title {
  color: #a855f7;
}

.album-artist,
.album-tracks,
.playlist-count {
  font-size: 0.9rem;
  opacity: 0.8;
}

.playlists-header {
  margin-bottom: 2rem;
  text-align: center;
}

.create-playlist-button {
  background: linear-gradient(135deg, #581c87, #a855f7);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.create-playlist-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(88, 28, 135, 0.3);
}

.create-playlist-button svg {
  width: 1.2rem;
  height: 1.2rem;
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
}

.playlist-modal {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
}

.dark .playlist-modal {
  background: #2a2a2a;
}

.playlist-modal h3 {
  margin-bottom: 1.5rem;
  color: #581c87;
  text-align: center;
}

.dark .playlist-modal h3 {
  color: #a855f7;
}

.playlist-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.dark .playlist-input {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.playlist-input:focus {
  outline: none;
  border-color: #a855f7;
}

.playlist-modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-button.primary {
  background: linear-gradient(135deg, #581c87, #a855f7);
  color: white;
}

.modal-button.secondary {
  background: transparent;
  color: #581c87;
  border: 2px solid #e5e7eb;
}

.dark .modal-button.secondary {
  color: #a855f7;
  border-color: #4b5563;
}

.modal-button:hover {
  transform: translateY(-2px);
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .music-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .music-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .song-item {
    grid-template-columns: 3rem 3rem 1fr 3rem;
    gap: 0.5rem;
  }
  
  .song-album,
  .song-duration {
    display: none;
  }
  
  .now-playing-bar {
    padding: 1rem;
    gap: 1rem;
  }
  
  .now-playing-info {
    min-width: auto;
  }
  
  .now-playing-progress {
    display: none;
  }
  
  .albums-grid,
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>
