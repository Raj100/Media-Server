<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Chat</h1>
            <p class="text-gray-600 dark:text-gray-400">Connect with friends and share your favorite media</p>
          </div>
          <router-link
            to="/"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </router-link>
        </div>
      </div>
    </header>

    <!-- Chat Interface -->
    <div class="container mx-auto px-4 py-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden" style="height: 600px;">
        <div class="flex h-full">
          <!-- Sidebar -->
          <div class="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <!-- Online Users -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Online Users</h3>
              <div class="space-y-2">
                <div
                  v-for="user in chatStore.onlineUsers"
                  :key="user.id"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div class="relative">
                    <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <span class="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div>
                    <div class="font-medium text-sm">{{ user.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Online</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat Rooms -->
            <div class="flex-1 p-4">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Rooms</h3>
              <div class="space-y-1">
                <div
                  v-for="room in chatStore.rooms"
                  :key="room.id"
                  @click="chatStore.setActiveRoom(room.id)"
                  :class="{
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors': true,
                    'bg-purple-100 dark:bg-purple-900/20': chatStore.activeRoom === room.id,
                    'hover:bg-gray-50 dark:hover:bg-gray-700': chatStore.activeRoom !== room.id,
                  }"
                >
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-sm">{{ room.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ room.memberCount }} members</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Area -->
          <div class="flex-1 flex flex-col">
            <!-- Messages -->
            <div class="flex-1 p-4 overflow-y-auto">
              <div v-if="!chatStore.activeRoom" class="flex items-center justify-center h-full">
                <div class="text-center">
                  <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a room to start chatting</h3>
                  <p class="text-gray-600 dark:text-gray-400">Choose a room from the sidebar to begin the conversation</p>
                </div>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="message in chatStore.activeRoomMessages"
                  :key="message.id"
                  :class="{
                    'flex': true,
                    'justify-end': message.senderId === authStore.user?.id,
                    'justify-start': message.senderId !== authStore.user?.id,
                  }"
                >
                  <div
                    :class="{
                      'max-w-xs lg:max-w-md px-4 py-2 rounded-lg': true,
                      'bg-purple-600 text-white': message.senderId === authStore.user?.id,
                      'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white': message.senderId !== authStore.user?.id,
                    }"
                  >
                    <div v-if="message.senderId !== authStore.user?.id" class="text-xs font-medium mb-1 opacity-75">
                      {{ message.senderName }}
                    </div>
                    <div class="text-sm">{{ message.content }}</div>
                    <div class="text-xs opacity-75 mt-1">
                      {{ formatTime(message.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div v-if="chatStore.activeRoom" class="border-t border-gray-200 dark:border-gray-700 p-4">
              <form @submit.prevent="sendMessage" class="flex gap-2">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="Type your message..."
                  class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  :disabled="!newMessage.trim()"
                  class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useChatStore } from "@/stores/chat"
import { useAuthStore } from "@/stores/auth"

const chatStore = useChatStore()
const authStore = useAuthStore()

const newMessage = ref("")

const sendMessage = async (): Promise<void> => {
  if (!newMessage.value.trim() || !chatStore.activeRoom) return

  await chatStore.sendMessage(chatStore.activeRoom, newMessage.value.trim())
  newMessage.value = ""
}

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  chatStore.fetchRooms()
  chatStore.fetchOnlineUsers()
  
  // Set default room if available
  if (chatStore.rooms.length > 0) {
    chatStore.setActiveRoom(chatStore.rooms[0].id)
  }
})
</script>
