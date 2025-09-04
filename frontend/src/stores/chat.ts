import { defineStore } from "pinia"
import { ref, computed, readonly } from "vue"
import type { ChatMessage, ChatRoom, User } from "@/types"
import { apiClient } from "@/lib/api"

export const useChatStore = defineStore("chat", () => {
  const messages = ref<ChatMessage[]>([])
  const rooms = ref<ChatRoom[]>([])
  const activeRoom = ref<string | null>(null)
  const onlineUsers = ref<User[]>([])
  const isLoading = ref(false)
  const isConnected = ref(false)

  const activeRoomMessages = computed(() => messages.value.filter((msg) => msg.roomId === activeRoom.value))

  const unreadCount = computed(
    () => messages.value.filter((msg) => !msg.read && msg.roomId !== activeRoom.value).length,
  )

  const fetchRooms = async (): Promise<void> => {
    isLoading.value = true
    try {
      const response = await apiClient.get<ChatRoom[]>("/chat/rooms")
      rooms.value = response.data || []
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error)
    } finally {
      isLoading.value = false
    }
  }

  const fetchMessages = async (roomId: string): Promise<void> => {
    try {
      const response = await apiClient.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`)
      const roomMessages = response.data || []

      roomMessages.forEach((msg) => {
        const existingIndex = messages.value.findIndex((m) => m.id === msg.id)
        if (existingIndex >= 0) {
          messages.value[existingIndex] = msg
        } else {
          messages.value.push(msg)
        }
      })
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const sendMessage = async (roomId: string, content: string): Promise<ChatMessage | null> => {
    try {
      const response = await apiClient.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, {
        content,
        type: "text",
      })

      if (response.data) {
        messages.value.push(response.data)
        return response.data
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
    return null
  }

  const shareMedia = async (roomId: string, mediaId: string, mediaType: string): Promise<ChatMessage | null> => {
    try {
      const response = await apiClient.post<ChatMessage>(`/chat/rooms/${roomId}/messages`, {
        content: `Shared a ${mediaType}`,
        type: "media",
        mediaId,
        mediaType,
      })

      if (response.data) {
        messages.value.push(response.data)
        return response.data
      }
    } catch (error) {
      console.error("Failed to share media:", error)
    }
    return null
  }

  const setActiveRoom = (roomId: string): void => {
    activeRoom.value = roomId
    // Mark messages as read
    messages.value.filter((msg) => msg.roomId === roomId && !msg.read).forEach((msg) => (msg.read = true))
  }

  const fetchOnlineUsers = async (): Promise<void> => {
    try {
      const response = await apiClient.get<User[]>("/chat/online-users")
      onlineUsers.value = response.data || []
    } catch (error) {
      console.error("Failed to fetch online users:", error)
    }
  }

  const simulateTyping = (roomId: string, userId: string): void => {
    // Simulate typing indicator
    console.log(`User ${userId} is typing in room ${roomId}`)
  }

  return {
    // State
    messages: readonly(messages),
    rooms: readonly(rooms),
    activeRoom: readonly(activeRoom),
    onlineUsers: readonly(onlineUsers),
    isLoading: readonly(isLoading),
    isConnected: readonly(isConnected),

    // Getters
    activeRoomMessages,
    unreadCount,

    // Actions
    fetchRooms,
    fetchMessages,
    sendMessage,
    shareMedia,
    setActiveRoom,
    fetchOnlineUsers,
    simulateTyping,
  }
})
