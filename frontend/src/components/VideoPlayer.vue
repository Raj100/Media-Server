<template>
  <div v-if="isVisible" class="video-player-overlay" @click="closePlayer">
    <div class="video-player-container" @click.stop>
      <div class="video-wrapper" ref="videoWrapper">
        <video
          ref="videoElement"
          class="video-element"
          :poster="media.thumbnail"
          @loadedmetadata="onLoadedMetadata"
          @timeupdate="onTimeUpdate"
          @ended="onEnded"
          @click="togglePlayPause"
        >
          <source :src="getVideoUrl(media)" type="video/mp4">
          <track kind="subtitles" src="/subtitles/sample.vtt" srclang="en" label="English" default>
          Your browser does not support the video tag.
        </video>
        
        <!-- Loading Spinner -->
        <div v-if="isLoading" class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading video...</p>
        </div>
        
        <!-- Video Controls -->
        <div :class="['video-controls', { 'visible': showControls || !isPlaying }]">
          <div class="controls-background"></div>
          
          <!-- Progress Bar -->
          <div class="progress-container">
            <div 
              class="progress-bar" 
              ref="progressBar"
              @click="seekTo"
              @mousemove="showPreview"
              @mouseleave="hidePreview"
            >
              <div class="progress-buffer" :style="{ width: bufferPercentage + '%' }"></div>
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
              <div class="progress-handle" :style="{ left: progressPercentage + '%' }"></div>
            </div>
            
            <!-- Time Preview -->
            <div v-if="previewTime !== null" class="time-preview" :style="{ left: previewPosition + 'px' }">
              {{ formatTime(previewTime) }}
            </div>
          </div>
          
          <!-- Control Buttons -->
          <div class="controls-row">
            <div class="controls-left">
              <button @click="togglePlayPause" class="control-btn play-pause">
                <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              
              <button @click="skipBackward" class="control-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  <path d="M10.5 12.5v3h1v-3h-1z"/>
                </svg>
                <span class="skip-text">10</span>
              </button>
              
              <button @click="skipForward" class="control-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.01 19V15l5-5-5-5v4C8.7 9 6.01 11.69 6.01 15s2.69 6 6 6 6-2.69 6-6h-2c0 3.31-2.69 6-6 6z"/>
                  <path d="M13.5 12.5v3h1v-3h-1z"/>
                </svg>
                <span class="skip-text">10</span>
              </button>
              
              <!-- Volume Control -->
              <div class="volume-control">
                <button @click="toggleMute" class="control-btn volume-btn">
                  <svg v-if="isMuted || volume === 0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                  <svg v-else-if="volume < 0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </button>
                
                <div class="volume-slider" v-show="showVolumeSlider">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    v-model="volume"
                    @input="updateVolume"
                    class="volume-range"
                  />
                </div>
              </div>
              
              <div class="time-display">
                <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
              </div>
            </div>
            
            <div class="controls-right">
              <!-- Subtitles -->
              <button @click="toggleSubtitles" class="control-btn" :class="{ active: subtitlesEnabled }">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>
                </svg>
              </button>
              
              <!-- Quality Selector -->
              <div class="quality-selector">
                <button @click="toggleQualityMenu" class="control-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>{{ currentQuality }}</span>
                </button>
                
                <div v-if="showQualityMenu" class="quality-menu">
                  <button 
                    v-for="quality in availableQualities" 
                    :key="quality"
                    @click="changeQuality(quality)"
                    :class="{ active: currentQuality === quality }"
                  >
                    {{ quality }}
                  </button>
                </div>
              </div>
              
              <!-- Picture in Picture -->
              <button @click="togglePictureInPicture" class="control-btn" v-if="supportsPiP">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
                </svg>
              </button>
              
              <!-- Playback Speed -->
              <div class="speed-selector">
                <button @click="toggleSpeedMenu" class="control-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 8.5c0-.83-.67-1.5-1.5-1.5S10 7.67 10 8.5v3.5L8.5 14c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5H12c.83 0 1.5-.67 1.5-1.5V8.5z"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  <span>{{ playbackSpeed }}x</span>
                </button>
                
                <div v-if="showSpeedMenu" class="speed-menu">
                  <button 
                    v-for="speed in availableSpeeds" 
                    :key="speed"
                    @click="changePlaybackSpeed(speed)"
                    :class="{ active: playbackSpeed === speed }"
                  >
                    {{ speed }}x
                  </button>
                </div>
              </div>
              
              <!-- Fullscreen -->
              <button @click="toggleFullscreen" class="control-btn">
                <svg v-if="!isFullscreen" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Close Button -->
        <button @click="closePlayer" class="close-button">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  media: {
    type: Object,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'ended'])

// Refs
const videoElement = ref(null)
const videoWrapper = ref(null)
const progressBar = ref(null)

// State
const isPlaying = ref(false)
const isLoading = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isFullscreen = ref(false)
const showControls = ref(true)
const showVolumeSlider = ref(false)
const showQualityMenu = ref(false)
const showSpeedMenu = ref(false)
const subtitlesEnabled = ref(false)
const currentQuality = ref('1080p')
const playbackSpeed = ref(1)
const bufferPercentage = ref(0)
const previewTime = ref(null)
const previewPosition = ref(0)

// Control timeout
let controlsTimeout = null
let hideControlsTimeout = null

// Computed
const progressPercentage = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const supportsPiP = computed(() => {
  return document.pictureInPictureEnabled
})

const availableQualities = ref(['2160p', '1440p', '1080p', '720p', '480p', '360p'])
const availableSpeeds = ref([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2])

// Methods
const getVideoUrl = (media) => {
  // In a real app, this would return the actual video URL
  return `/placeholder-video.mp4?title=${encodeURIComponent(media.title)}`
}

const togglePlayPause = () => {
  if (!videoElement.value) return
  
  if (isPlaying.value) {
    videoElement.value.pause()
  } else {
    videoElement.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const skipBackward = () => {
  if (videoElement.value) {
    videoElement.value.currentTime = Math.max(0, videoElement.value.currentTime - 10)
  }
}

const skipForward = () => {
  if (videoElement.value) {
    videoElement.value.currentTime = Math.min(duration.value, videoElement.value.currentTime + 10)
  }
}

const seekTo = (event) => {
  if (!progressBar.value || !videoElement.value) return
  
  const rect = progressBar.value.getBoundingClientRect()
  const percentage = (event.clientX - rect.left) / rect.width
  const newTime = percentage * duration.value
  
  videoElement.value.currentTime = newTime
  currentTime.value = newTime
}

const showPreview = (event) => {
  if (!progressBar.value) return
  
  const rect = progressBar.value.getBoundingClientRect()
  const percentage = (event.clientX - rect.left) / rect.width
  previewTime.value = percentage * duration.value
  previewPosition.value = event.clientX - rect.left
}

const hidePreview = () => {
  previewTime.value = null
}

const toggleMute = () => {
  if (videoElement.value) {
    videoElement.value.muted = !videoElement.value.muted
    isMuted.value = videoElement.value.muted
  }
}

const updateVolume = () => {
  if (videoElement.value) {
    videoElement.value.volume = volume.value
    isMuted.value = volume.value === 0
  }
}

const toggleSubtitles = () => {
  subtitlesEnabled.value = !subtitlesEnabled.value
  if (videoElement.value && videoElement.value.textTracks.length > 0) {
    videoElement.value.textTracks[0].mode = subtitlesEnabled.value ? 'showing' : 'hidden'
  }
}

const toggleQualityMenu = () => {
  showQualityMenu.value = !showQualityMenu.value
  showSpeedMenu.value = false
}

const changeQuality = (quality) => {
  currentQuality.value = quality
  showQualityMenu.value = false
  // In a real app, you would switch video sources here
}

const toggleSpeedMenu = () => {
  showSpeedMenu.value = !showSpeedMenu.value
  showQualityMenu.value = false
}

const changePlaybackSpeed = (speed) => {
  playbackSpeed.value = speed
  if (videoElement.value) {
    videoElement.value.playbackRate = speed
  }
  showSpeedMenu.value = false
}

const togglePictureInPicture = async () => {
  if (!videoElement.value || !supportsPiP.value) return
  
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await videoElement.value.requestPictureInPicture()
    }
  } catch (error) {
    console.error('Picture-in-Picture error:', error)
  }
}

const toggleFullscreen = async () => {
  if (!videoWrapper.value) return
  
  try {
    if (!document.fullscreenElement) {
      await videoWrapper.value.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  } catch (error) {
    console.error('Fullscreen error:', error)
  }
}

const closePlayer = () => {
  if (videoElement.value) {
    videoElement.value.pause()
  }
  emit('close')
}

const onLoadedMetadata = () => {
  if (videoElement.value) {
    duration.value = videoElement.value.duration
    isLoading.value = false
  }
}

const onTimeUpdate = () => {
  if (videoElement.value) {
    currentTime.value = videoElement.value.currentTime
    
    // Update buffer
    if (videoElement.value.buffered.length > 0) {
      const buffered = videoElement.value.buffered.end(videoElement.value.buffered.length - 1)
      bufferPercentage.value = (buffered / duration.value) * 100
    }
  }
}

const onEnded = () => {
  isPlaying.value = false
  emit('ended')
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const showControlsTemporarily = () => {
  showControls.value = true
  clearTimeout(hideControlsTimeout)
  
  if (isPlaying.value) {
    hideControlsTimeout = setTimeout(() => {
      showControls.value = false
    }, 3000)
  }
}

const handleMouseMove = () => {
  showControlsTemporarily()
}

const handleKeyPress = (event) => {
  switch (event.code) {
    case 'Space':
      event.preventDefault()
      togglePlayPause()
      break
    case 'ArrowLeft':
      event.preventDefault()
      skipBackward()
      break
    case 'ArrowRight':
      event.preventDefault()
      skipForward()
      break
    case 'ArrowUp':
      event.preventDefault()
      volume.value = Math.min(1, volume.value + 0.1)
      updateVolume()
      break
    case 'ArrowDown':
      event.preventDefault()
      volume.value = Math.max(0, volume.value - 0.1)
      updateVolume()
      break
    case 'KeyF':
      event.preventDefault()
      toggleFullscreen()
      break
    case 'KeyM':
      event.preventDefault()
      toggleMute()
      break
    case 'Escape':
      if (isFullscreen.value) {
        toggleFullscreen()
      } else {
        closePlayer()
      }
      break
  }
}

// Watchers
watch(() => props.isVisible, (visible) => {
  if (visible && videoElement.value) {
    // Auto-play when player opens
    setTimeout(() => {
      videoElement.value.play()
      isPlaying.value = true
    }, 100)
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
  clearTimeout(hideControlsTimeout)
})
</script>

<style scoped>
.video-player-overlay {
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

.video-player-container {
  position: relative;
  width: 90vw;
  height: 90vh;
  max-width: 1200px;
  background: #000;
  border-radius: 0.75rem;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: none;
}

.video-wrapper:hover {
  cursor: default;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 2rem 1.5rem 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.video-controls.visible {
  opacity: 1;
  pointer-events: all;
}

.controls-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  pointer-events: none;
}

.progress-container {
  position: relative;
  margin-bottom: 1rem;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-buffer {
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
}

.progress-fill {
  height: 100%;
  background: #8b5cf6;
  border-radius: 3px;
  position: absolute;
  top: 0;
  left: 0;
}

.progress-handle {
  width: 12px;
  height: 12px;
  background: #8b5cf6;
  border-radius: 50%;
  position: absolute;
  top: -3px;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

.time-preview {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
  pointer-events: none;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  position: relative;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn.active {
  color: #8b5cf6;
}

.control-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.play-pause svg {
  width: 1.5rem;
  height: 1.5rem;
}

.skip-text {
  font-size: 0.625rem;
  position: absolute;
  bottom: 0.125rem;
  right: 0.125rem;
  font-weight: 600;
}

.volume-control {
  position: relative;
  display: flex;
  align-items: center;
}

.volume-btn:hover + .volume-slider,
.volume-slider:hover {
  display: block;
}

.volume-slider {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 1rem 0.5rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  display: none;
}

.volume-range {
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
  width: 4px;
  height: 80px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
}

.time-display {
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.quality-selector,
.speed-selector {
  position: relative;
}

.quality-menu,
.speed-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  min-width: 80px;
}

.quality-menu button,
.speed-menu button {
  display: block;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 0.25rem;
  text-align: left;
  font-size: 0.875rem;
}

.quality-menu button:hover,
.speed-menu button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.quality-menu button.active,
.speed-menu button.active {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.2);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
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
  z-index: 10;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.close-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Fullscreen styles */
.video-player-container:fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  border-radius: 0;
}

.video-player-container:fullscreen .video-wrapper {
  cursor: none;
}

.video-player-container:fullscreen .video-wrapper:hover {
  cursor: none;
}

@media (max-width: 768px) {
  .video-player-container {
    width: 95vw;
    height: 95vh;
  }
  
  .controls-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .controls-left,
  .controls-right {
    width: 100%;
    justify-content: center;
  }
  
  .time-display {
    font-size: 0.75rem;
  }
}
</style>
