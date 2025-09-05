<template>
  <div v-if="isVisible" class="audio-player-overlay" @click="closePlayer">
    <div class="audio-player-container" @click.stop>
      <!-- Close Button -->
      <button @click="closePlayer" class="close-button">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      <!-- Album Art & Track Info -->
      <div class="player-header">
        <div class="album-art">
          <img :src="media.thumbnail" :alt="media.album" />
          <div class="vinyl-effect"></div>
        </div>
        <div class="track-info">
          <h2 class="track-title">{{ media.title }}</h2>
          <p class="track-artist">{{ media.artist }}</p>
          <p class="track-album">{{ media.album }}</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="time-display">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
        <div class="progress-bar" ref="progressBar" @click="seekTo">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          <div class="progress-handle" :style="{ left: progressPercentage + '%' }"></div>
        </div>
      </div>

      <!-- Main Controls -->
      <div class="main-controls">
        <button @click="toggleShuffle" :class="['control-btn', { active: isShuffled }]">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
          </svg>
        </button>

        <button @click="previousTrack" class="control-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6v-12zm3.5 6l8.5 6V6l-8.5 6z"/>
          </svg>
        </button>

        <button @click="togglePlayPause" class="control-btn play-pause">
          <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        <button @click="nextTrack" class="control-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>

        <button @click="toggleRepeat" :class="['control-btn', { active: repeatMode !== 'off' }]">
          <svg v-if="repeatMode === 'one'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
        </button>
      </div>

      <!-- Secondary Controls -->
      <div class="secondary-controls">
        <button @click="toggleFavorite" :class="['control-btn', { active: media.isFavorite }]">
          <svg viewBox="0 0 24 24" :fill="media.isFavorite ? 'currentColor' : 'none'" stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <div class="volume-control">
          <button @click="toggleMute" class="control-btn">
            <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5V4L9 9H5z"/>
            </svg>
            <svg v-else-if="volume < 0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </button>
          <div class="volume-slider">
            <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="updateVolume" class="volume-range" />
          </div>
        </div>

        <button @click="togglePlaylist" class="control-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
          </svg>
        </button>
      </div>

      <!-- Playlist -->
      <div v-if="showPlaylist" class="playlist-section">
        <h3>Up Next</h3>
        <div class="playlist-items">
          <div
            v-for="(track, index) in playlist"
            :key="track.id"
            :class="['playlist-item', { active: track.id === media.id }]"
            @click="playTrack(track)"
          >
            <img :src="track.thumbnail" :alt="track.album" />
            <div class="playlist-track-info">
              <h4>{{ track.title }}</h4>
              <p>{{ track.artist }}</p>
            </div>
            <span class="track-duration">{{ formatTime(track.duration || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- Audio Element -->
      <audio
        ref="audioElement"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
      >
        <source :src="getAudioUrl(media)" type="audio/mpeg" />
      </audio>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMediaStore } from '@/stores/media'
import type { Music } from '@/types/media'

const props = defineProps<{
  media: Music
  isVisible?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'track-changed', track: Music): void
}>()

const mediaStore = useMediaStore()

const audioElement = ref<HTMLAudioElement | null>(null)
const progressBar = ref<HTMLDivElement | null>(null)

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isShuffled = ref(false)
const repeatMode = ref<'off' | 'all' | 'one'>('off')
const showPlaylist = ref(false)

const playlist = computed(() => mediaStore.music) // Music[]

watch(volume, (val) => {
  if (audioElement.value) audioElement.value.volume = val
})

const progressPercentage = computed(() => {
  return duration.value ? (currentTime.value / duration.value) * 100 : 0
})

function togglePlayPause() {
  if (!audioElement.value) return
  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play().catch(() => (isPlaying.value = false))
  }
  isPlaying.value = !isPlaying.value
}

function playTrack(track: Music) {
  // mediaStore.playMedia(track)
  emit('track-changed', track)
  if (audioElement.value) {
    audioElement.value.src = getAudioUrl(track)
    audioElement.value.play().then(() => (isPlaying.value = true)).catch(() => (isPlaying.value = false))
  }
}

function toggleFavorite() {
  // mediaStore.toggleFavorite(props.media.id, 'music')
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (audioElement.value) audioElement.value.muted = isMuted.value
}

function updateVolume() {
  if (audioElement.value) audioElement.value.volume = volume.value
}

function onLoadedMetadata() {
  if (audioElement.value) duration.value = audioElement.value.duration
}

function onTimeUpdate() {
  if (audioElement.value) currentTime.value = audioElement.value.currentTime
}

function onEnded() {
  if (repeatMode.value === 'one') {
    audioElement.value?.play()
  } else {
    nextTrack()
  }
}

function nextTrack() {
  const currentIndex = playlist.value.findIndex((t) => t.id === props.media.id)
  let nextIndex = currentIndex + 1
  if (nextIndex >= playlist.value.length) {
    nextIndex = repeatMode.value === 'all' ? 0 : currentIndex
  }
  playTrack(playlist.value[nextIndex])
}

function previousTrack() {
  const currentIndex = playlist.value.findIndex((t) => t.id === props.media.id)
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0
  playTrack(playlist.value[prevIndex])
}

function toggleShuffle() {
  isShuffled.value = !isShuffled.value
  // optional: implement shuffle logic in store
}

function toggleRepeat() {
  if (repeatMode.value === 'off') repeatMode.value = 'all'
  else if (repeatMode.value === 'all') repeatMode.value = 'one'
  else repeatMode.value = 'off'
}

function togglePlaylist() {
  showPlaylist.value = !showPlaylist.value
}

function seekTo(event: MouseEvent) {
  if (!progressBar.value || !audioElement.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  audioElement.value.currentTime = percent * duration.value
}

function formatTime(time: number) {
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

function closePlayer() {
  emit('close')
}

function getAudioUrl(track: Music) {
  return `/media/audio/${track.id}.mp3` 
}

onMounted(() => {
  if (audioElement.value) audioElement.value.volume = volume.value
})
</script>




<style scoped>
.audio-player-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.audio-player-container {
  position: relative;
  width: 90vw;
  max-width: 500px;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 2rem;
  padding: 2rem;
  color: white;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.close-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.player-header {
  text-align: center;
  margin-bottom: 2rem;
}

.album-art {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.3);
}

.album-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: rotate 20s linear infinite;
}

.vinyl-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #333;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #666, 0 0 0 4px #333;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.track-info h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.track-artist {
  font-size: 1.125rem;
  color: #8b5cf6;
  margin-bottom: 0.25rem;
}

.track-album {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.progress-section {
  margin-bottom: 2rem;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #a855f7);
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.1s ease;
}

.progress-handle {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: -3px;
  transform: translateX(-50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.main-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.control-btn.active {
  background: rgba(139, 92, 246, 0.3);
  color: #8b5cf6;
}

.control-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.main-controls .control-btn {
  width: 3rem;
  height: 3rem;
}

.play-pause {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
}

.play-pause svg {
  width: 1.75rem;
  height: 1.75rem;
}

.secondary-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.secondary-controls .control-btn {
  width: 2.5rem;
  height: 2.5rem;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  max-width: 150px;
  margin: 0 1rem;
}

.volume-control .control-btn {
  flex-shrink: 0;
}

.volume-slider {
  flex: 1;
}

.volume-range {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.volume-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.volume-range::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.playlist-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.playlist-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
}

.playlist-items {
  max-height: 200px;
  overflow-y: auto;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.playlist-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.playlist-item.active {
  background: rgba(139, 92, 246, 0.2);
}

.playlist-item img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  object-fit: cover;
}

.playlist-track-info {
  flex: 1;
}

.playlist-track-info h4 {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.125rem 0;
  color: white;
}

.playlist-track-info p {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.track-duration {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .audio-player-container {
    width: 95vw;
    padding: 1.5rem;
  }
  
  .album-art {
    width: 150px;
    height: 150px;
  }
  
  .track-info h2 {
    font-size: 1.25rem;
  }
  
  .main-controls {
    gap: 1rem;
  }
  
  .main-controls .control-btn {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .play-pause {
    width: 3.5rem;
    height: 3.5rem;
  }
  
  .volume-control {
    max-width: 120px;
  }
}
</style>
