<template>
  <div class="chat-page">
    <Navbar />
    
    <div class="chat-container">
      <!-- Chat Sidebar -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h2>Messages</h2>
          <button @click="showNewChat = true" class="new-chat-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/>
              <polygon points="18,2 22,6 12,16 8,16 8,12 18,2"/>
            </svg>
          </button>
        </div>
        
        <!-- Search Conversations -->
        <div class="search-conversations">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search conversations..."
            class="search-input"
          />
        </div>
        
        <!-- Conversations List -->
        <div class="conversations-list">
          <div
            v-for="conversation in filteredConversations"
            :key="conversation.id"
            :class="['conversation-item', { active: selectedConversation?.id === conversation.id }]"
            @click="selectConversation(conversation)"
          >
            <div class="conversation-avatar">
              <img :src="conversation.avatar" :alt="conversation.name" />
              <div v-if="conversation.isOnline" class="online-indicator"></div>
            </div>
            
            <div class="conversation-info">
              <div class="conversation-header">
                <h4 class="conversation-name">{{ conversation.name }}</h4>
                <span class="conversation-time">{{ formatTime(conversation.lastMessage.timestamp) }}</span>
              </div>
              <p class="conversation-preview">{{ conversation.lastMessage.content }}</p>
            </div>
            
            <div v-if="conversation.unreadCount > 0" class="unread-badge">
              {{ conversation.unreadCount }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Chat Main Area -->
      <div class="chat-main">
        <div v-if="!selectedConversation" class="chat-empty">
          <div class="empty-icon">💬</div>
          <h3>Select a conversation</h3>
          <p>Choose a conversation from the sidebar to start chatting</p>
        </div>
        
        <div v-else class="chat-active">
          <!-- Chat Header -->
          <div class="chat-header">
            <div class="chat-user-info">
              <img :src="selectedConversation.avatar" :alt="selectedConversation.name" class="chat-avatar" />
              <div class="chat-user-details">
                <h3>{{ selectedConversation.name }}</h3>
                <p class="user-status">
                  <span v-if="selectedConversation.isOnline" class="status-online">Online</span>
                  <span v-else class="status-offline">Last seen {{ formatTime(selectedConversation.lastSeen) }}</span>
                </p>
              </div>
            </div>
            
            <div class="chat-actions">
              <button class="action-button" @click="shareMedia">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16,6 12,2 8,6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </button>
              
              <button class="action-button mobile-close" @click="selectedConversation = null">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Messages Area -->
          <div class="messages-area" ref="messagesContainer">
            <div
              v-for="message in selectedConversation.messages"
              :key="message.id"
              :class="['message', { 'own-message': message.senderId === currentUser.id }]"
            >
              <div v-if="message.senderId !== currentUser.id" class="message-avatar">
                <img :src="selectedConversation.avatar" :alt="selectedConversation.name" />
              </div>
              
              <div class="message-content">
                <div v-if="message.type === 'text'" class="message-bubble">
                  {{ message.content }}
                </div>
                
                <div v-else-if="message.type === 'media'" class="message-media">
                  <div class="media-preview">
                    <img :src="message.media.thumbnail" :alt="message.media.title" />
                    <div class="media-info">
                      <h5>{{ message.media.title }}</h5>
                      <p>{{ message.media.type === 'movie' ? message.media.genre : message.media.artist }}</p>
                    </div>
                    <button @click="playSharedMedia(message.media)" class="play-shared">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="message-time">
                  {{ formatMessageTime(message.timestamp) }}
                </div>
              </div>
            </div>
            
            <!-- Typing Indicator -->
            <div v-if="isTyping" class="typing-indicator">
              <div class="typing-avatar">
                <img :src="selectedConversation.avatar" :alt="selectedConversation.name" />
              </div>
              <div class="typing-bubble">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Message Input -->
          <div class="message-input-area">
            <div class="input-container">
              <button @click="showMediaShare = true" class="attach-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type a message..."
                class="message-input"
                @keyup.enter="sendMessage"
                @input="handleTyping"
              />
              
              <button @click="sendMessage" :disabled="!newMessage.trim()" class="send-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Chat Modal -->
    <div v-if="showNewChat" class="modal-overlay" @click="showNewChat = false">
      <div class="new-chat-modal" @click.stop>
        <h3>Start New Conversation</h3>
        <div class="users-list">
          <div
            v-for="user in availableUsers"
            :key="user.id"
            class="user-item"
            @click="startNewConversation(user)"
          >
            <img :src="user.avatar" :alt="user.name" class="user-avatar" />
            <div class="user-info">
              <h4>{{ user.name }}</h4>
              <p class="user-status">{{ user.isOnline ? 'Online' : 'Offline' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Share Modal -->
    <div v-if="showMediaShare" class="modal-overlay" @click="showMediaShare = false">
      <div class="media-share-modal" @click.stop>
        <h3>Share Media</h3>
        <div class="media-tabs">
          <button 
            @click="shareTab = 'movies'" 
            :class="['tab-button', { active: shareTab === 'movies' }]"
          >
            Movies
          </button>
          <button 
            @click="shareTab = 'music'" 
            :class="['tab-button', { active: shareTab === 'music' }]"
          >
            Music
          </button>
        </div>
        
        <div class="media-grid">
          <div
            v-for="item in shareTab === 'movies' ? mediaStore.movies : mediaStore.music"
            :key="item.id"
            class="media-share-item"
            @click="shareMediaItem(item)"
          >
            <img :src="item.thumbnail" :alt="item.title" />
            <div class="media-share-info">
              <h5>{{ item.title }}</h5>
              <p>{{ shareTab === 'movies' ? item.genre : item.artist }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMediaStore } from '../stores/media'
import { useChatStore } from '../stores/chat'
import Navbar from '../components/Navbar.vue'

const router = useRouter()
const authStore = useAuthStore()
const mediaStore = useMediaStore()
const chatStore = useChatStore()

const searchQuery = ref('')
const selectedConversation = ref(null)
const newMessage = ref('')
const showNewChat = ref(false)
const showMediaShare = ref(false)
const shareTab = ref('movies')
const isTyping = ref(false)
const messagesContainer = ref(null)

const currentUser = computed(() => authStore.user)
const conversations = computed(() => chatStore.conversations)

const filteredConversations = computed(() => {
  if (!searchQuery.value) return conversations.value
  
  return conversations.value.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const availableUsers = computed(() => chatStore.availableUsers)

const selectConversation = (conversation) => {
  selectedConversation.value = conversation
  chatStore.markAsRead(conversation.id)
  scrollToBottom()
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return
  
  const message = {
    id: Date.now(),
    content: newMessage.value.trim(),
    senderId: currentUser.value.id,
    timestamp: new Date(),
    type: 'text'
  }
  
  chatStore.sendMessage(selectedConversation.value.id, message)
  newMessage.value = ''
  
  nextTick(() => {
    scrollToBottom()
  })
  
  // Simulate response after a delay
  setTimeout(() => {
    simulateResponse()
  }, 1000 + Math.random() * 2000)
}

const shareMediaItem = (mediaItem) => {
  if (!selectedConversation.value) return
  
  const message = {
    id: Date.now(),
    content: `Shared: ${mediaItem.title}`,
    senderId: currentUser.value.id,
    timestamp: new Date(),
    type: 'media',
    media: {
      ...mediaItem,
      type: shareTab.value === 'movies' ? 'movie' : 'music'
    }
  }
  
  chatStore.sendMessage(selectedConversation.value.id, message)
  showMediaShare.value = false
  
  nextTick(() => {
    scrollToBottom()
  })
}

const playSharedMedia = (media) => {
  mediaStore.playMedia(media)
  if (media.type === 'movie') {
    router.push('/movies')
  } else {
    router.push('/music')
  }
}

const startNewConversation = (user) => {
  const newConv = chatStore.createConversation(user)
  selectedConversation.value = newConv
  showNewChat.value = false
}

const handleTyping = () => {
  // Simulate typing indicator
  if (selectedConversation.value) {
    chatStore.setTyping(selectedConversation.value.id, true)
    
    setTimeout(() => {
      chatStore.setTyping(selectedConversation.value.id, false)
    }, 1000)
  }
}

const simulateResponse = () => {
  if (!selectedConversation.value) return
  
  isTyping.value = true
  
  setTimeout(() => {
    isTyping.value = false
    
    const responses = [
      "That sounds great! I'll check it out.",
      "Thanks for the recommendation!",
      "I love that one too!",
      "Have you seen the sequel?",
      "What did you think of it?",
      "I'll add it to my watchlist.",
      "The soundtrack is amazing!",
      "We should watch it together sometime."
    ]
    
    const response = {
      id: Date.now(),
      content: responses[Math.floor(Math.random() * responses.length)],
      senderId: selectedConversation.value.userId,
      timestamp: new Date(),
      type: 'text'
    }
    
    chatStore.sendMessage(selectedConversation.value.id, response)
    
    nextTick(() => {
      scrollToBottom()
    })
  }, 1500)
}

const shareMedia = () => {
  showMediaShare.value = true
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
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

const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

watch(selectedConversation, () => {
  if (selectedConversation.value) {
    scrollToBottom()
  }
})

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  chatStore.initializeChat()
  
  // Auto-select first conversation on desktop
  if (window.innerWidth > 768) {
    selectedConversation.value = conversations.value[0]
  }
})
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
}

.dark .chat-page {
  background: linear-gradient(135deg, #1a1a1a, #2a1a2a);
}

.chat-container {
  display: flex;
  height: calc(100vh - 80px);
  max-width: 1400px;
  margin: 0 auto;
}

.chat-sidebar {
  width: 350px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.dark .chat-sidebar {
  background: #2a2a2a;
  border-right-color: #4b5563;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .sidebar-header {
  border-bottom-color: #4b5563;
}

.sidebar-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #581c87;
}

.dark .sidebar-header h2 {
  color: #a855f7;
}

.new-chat-button {
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

.new-chat-button:hover {
  transform: scale(1.1);
}

.new-chat-button svg {
  width: 1.2rem;
  height: 1.2rem;
  color: white;
}

.search-conversations {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .search-conversations {
  border-bottom-color: #4b5563;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 2rem;
  font-size: 0.95rem;
  background: #f9fafb;
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
  background: white;
}

.dark .search-input:focus {
  background: #4b5563;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.dark .conversation-item {
  border-bottom-color: #374151;
}

.conversation-item:hover {
  background: rgba(168, 85, 247, 0.05);
}

.conversation-item.active {
  background: rgba(168, 85, 247, 0.1);
  border-right: 3px solid #a855f7;
}

.conversation-avatar {
  position: relative;
  margin-right: 1rem;
}

.conversation-avatar img {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 0.75rem;
  height: 0.75rem;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.conversation-name {
  font-weight: 600;
  color: #581c87;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .conversation-name {
  color: #a855f7;
}

.conversation-time {
  font-size: 0.8rem;
  opacity: 0.6;
  flex-shrink: 0;
}

.conversation-preview {
  font-size: 0.9rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  background: #a855f7;
  color: white;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.dark .chat-main {
  background: #1a1a1a;
}

.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.chat-empty h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #581c87;
}

.dark .chat-empty h3 {
  color: #a855f7;
}

.chat-empty p {
  opacity: 0.8;
}

.chat-active {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
}

.dark .chat-header {
  background: #2a2a2a;
  border-bottom-color: #4b5563;
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.chat-user-details h3 {
  font-weight: 600;
  color: #581c87;
  margin-bottom: 0.25rem;
}

.dark .chat-user-details h3 {
  color: #a855f7;
}

.user-status {
  font-size: 0.85rem;
}

.status-online {
  color: #10b981;
  font-weight: 500;
}

.status-offline {
  opacity: 0.6;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: rgba(168, 85, 247, 0.1);
}

.action-button svg {
  width: 1.2rem;
  height: 1.2rem;
  color: #581c87;
}

.dark .action-button svg {
  color: #a855f7;
}

.mobile-close {
  display: none;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
}

.dark .messages-area {
  background: #1a1a1a;
}

.message {
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-end;
}

.message.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin-right: 0.75rem;
}

.message.own-message .message-avatar {
  margin-right: 0;
  margin-left: 0.75rem;
}

.message-avatar img {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
}

.message.own-message .message-content {
  align-items: flex-end;
}

.message-bubble {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.message.own-message .message-bubble {
  background: linear-gradient(135deg, #581c87, #a855f7);
  color: white;
}

.dark .message-bubble {
  background: #374151;
  color: white;
}

.message-media {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.dark .message-media {
  background: #374151;
}

.media-preview {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.media-preview img {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  object-fit: cover;
}

.media-info {
  flex: 1;
  min-width: 0;
}

.media-info h5 {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #581c87;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .media-info h5 {
  color: #a855f7;
}

.media-info p {
  font-size: 0.85rem;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-shared {
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

.play-shared:hover {
  transform: scale(1.1);
}

.play-shared svg {
  width: 1rem;
  height: 1rem;
  color: white;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 0.25rem;
  text-align: right;
}

.message.own-message .message-time {
  text-align: left;
}

.typing-indicator {
  display: flex;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.typing-avatar {
  margin-right: 0.75rem;
}

.typing-avatar img {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}

.typing-bubble {
  background: white;
  padding: 1rem;
  border-radius: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark .typing-bubble {
  background: #374151;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 0.5rem;
  height: 0.5rem;
  background: #a855f7;
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.message-input-area {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.dark .message-input-area {
  background: #2a2a2a;
  border-top-color: #4b5563;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  border-radius: 2rem;
  padding: 0.5rem;
}

.dark .input-container {
  background: #374151;
}

.attach-button,
.send-button {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attach-button:hover,
.send-button:hover {
  background: rgba(168, 85, 247, 0.1);
}

.attach-button svg,
.send-button svg {
  width: 1.2rem;
  height: 1.2rem;
  color: #581c87;
}

.dark .attach-button svg,
.dark .send-button svg {
  color: #a855f7;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button:not(:disabled) {
  background: linear-gradient(135deg, #581c87, #a855f7);
}

.send-button:not(:disabled) svg {
  color: white;
}

.message-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.75rem;
  font-size: 1rem;
  outline: none;
}

.dark .message-input {
  color: white;
}

.message-input::placeholder {
  color: #9ca3af;
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

.new-chat-modal,
.media-share-modal {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.dark .new-chat-modal,
.dark .media-share-modal {
  background: #2a2a2a;
}

.new-chat-modal h3,
.media-share-modal h3 {
  margin-bottom: 1.5rem;
  color: #581c87;
  text-align: center;
}

.dark .new-chat-modal h3,
.dark .media-share-modal h3 {
  color: #a855f7;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-item:hover {
  background: rgba(168, 85, 247, 0.1);
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}

.user-info h4 {
  font-weight: 600;
  color: #581c87;
  margin-bottom: 0.25rem;
}

.dark .user-info h4 {
  color: #a855f7;
}

.user-status {
  font-size: 0.85rem;
  opacity: 0.8;
}

.media-tabs {
  display: flex;
  background: #f3f4f6;
  border-radius: 0.75rem;
  padding: 0.25rem;
  margin-bottom: 1.5rem;
}

.dark .media-tabs {
  background: #374151;
}

.tab-button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-button.active {
  background: white;
  color: #581c87;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .tab-button.active {
  background: #4b5563;
  color: #a855f7;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.media-share-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.dark .media-share-item {
  background: #374151;
}

.media-share-item:hover {
  background: rgba(168, 85, 247, 0.1);
  transform: translateY(-2px);
}

.media-share-item img {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  object-fit: cover;
  margin-right: 1rem;
}

.media-share-info h5 {
  font-weight: 600;
  color: #581c87;
  margin-bottom: 0.25rem;
}

.dark .media-share-info h5 {
  color: #a855f7;
}

.media-share-info p {
  font-size: 0.85rem;
  opacity: 0.8;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 70px);
  }
  
  .chat-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 10;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .chat-sidebar.show {
    transform: translateX(0);
  }
  
  .chat-main {
    width: 100%;
  }
  
  .mobile-close {
    display: block;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .media-grid {
    grid-template-columns: 1fr;
  }
  
  .new-chat-modal,
  .media-share-modal {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>
