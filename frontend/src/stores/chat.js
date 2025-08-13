import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useChatStore = defineStore("chat", () => {
  const conversations = ref([])
  const availableUsers = ref([
    {
      id: 2,
      name: "Sarah Johnson",
      avatar: "/diverse-user-avatars.png",
      isOnline: true,
      lastSeen: new Date(),
    },
    {
      id: 3,
      name: "Mike Chen",
      avatar: "/google-user-avatar.png",
      isOnline: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 4,
      name: "Emma Wilson",
      avatar: "/abstract-user-avatar.png",
      isOnline: true,
      lastSeen: new Date(),
    },
    {
      id: 5,
      name: "David Rodriguez",
      avatar: "/diverse-user-avatars.png",
      isOnline: false,
      lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ])

  const initializeChat = () => {
    // Initialize with some sample conversations
    conversations.value = [
      {
        id: 1,
        userId: 2,
        name: "Sarah Johnson",
        avatar: "/diverse-user-avatars.png",
        isOnline: true,
        lastSeen: new Date(),
        unreadCount: 2,
        lastMessage: {
          id: 3,
          content: "Have you watched the new sci-fi movie?",
          senderId: 2,
          timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        },
        messages: [
          {
            id: 1,
            content: "Hey! How are you doing?",
            senderId: 2,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            type: "text",
          },
          {
            id: 2,
            content: "I'm doing great! Just finished watching Inception again.",
            senderId: 1,
            timestamp: new Date(Date.now() - 90 * 60 * 1000),
            type: "text",
          },
          {
            id: 3,
            content: "Have you watched the new sci-fi movie?",
            senderId: 2,
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            type: "text",
          },
        ],
      },
      {
        id: 2,
        userId: 3,
        name: "Mike Chen",
        avatar: "/google-user-avatar.png",
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 0,
        lastMessage: {
          id: 2,
          content: "Thanks for the music recommendation!",
          senderId: 1,
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        messages: [
          {
            id: 1,
            content: "Check out this amazing song!",
            senderId: 3,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            type: "media",
            media: {
              id: 1,
              title: "Bohemian Rhapsody",
              artist: "Queen",
              thumbnail: "/queen-album-cover.png",
              type: "music",
            },
          },
          {
            id: 2,
            content: "Thanks for the music recommendation!",
            senderId: 1,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            type: "text",
          },
        ],
      },
      {
        id: 3,
        userId: 4,
        name: "Emma Wilson",
        avatar: "/abstract-user-avatar.png",
        isOnline: true,
        lastSeen: new Date(),
        unreadCount: 1,
        lastMessage: {
          id: 1,
          content: "Movie night this weekend?",
          senderId: 4,
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
        messages: [
          {
            id: 1,
            content: "Movie night this weekend?",
            senderId: 4,
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            type: "text",
          },
        ],
      },
    ]
  }

  const sendMessage = (conversationId, message) => {
    const conversation = conversations.value.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.messages.push(message)
      conversation.lastMessage = message

      // Update timestamp
      conversation.lastMessage.timestamp = message.timestamp

      // Move conversation to top
      const index = conversations.value.findIndex((c) => c.id === conversationId)
      if (index > 0) {
        const conv = conversations.value.splice(index, 1)[0]
        conversations.value.unshift(conv)
      }
    }
  }

  const markAsRead = (conversationId) => {
    const conversation = conversations.value.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }
  }

  const createConversation = (user) => {
    const existingConv = conversations.value.find((c) => c.userId === user.id)
    if (existingConv) {
      return existingConv
    }

    const newConversation = {
      id: Date.now(),
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      unreadCount: 0,
      lastMessage: {
        id: 0,
        content: "Start a conversation...",
        senderId: 0,
        timestamp: new Date(),
      },
      messages: [],
    }

    conversations.value.unshift(newConversation)
    return newConversation
  }

  const setTyping = (conversationId, isTyping) => {
    // This would typically update a typing indicator
    // For now, we'll just log it
    console.log(`User typing in conversation ${conversationId}: ${isTyping}`)
  }

  const deleteConversation = (conversationId) => {
    const index = conversations.value.findIndex((c) => c.id === conversationId)
    if (index > -1) {
      conversations.value.splice(index, 1)
    }
  }

  const searchMessages = (query) => {
    const results = []
    conversations.value.forEach((conversation) => {
      const matchingMessages = conversation.messages.filter((message) =>
        message.content.toLowerCase().includes(query.toLowerCase()),
      )
      if (matchingMessages.length > 0) {
        results.push({
          conversation,
          messages: matchingMessages,
        })
      }
    })
    return results
  }

  const getTotalUnreadCount = computed(() => {
    return conversations.value.reduce((total, conv) => total + conv.unreadCount, 0)
  })

  const getOnlineUsers = computed(() => {
    return availableUsers.value.filter((user) => user.isOnline)
  })

  return {
    conversations,
    availableUsers,
    getTotalUnreadCount,
    getOnlineUsers,
    initializeChat,
    sendMessage,
    markAsRead,
    createConversation,
    setTyping,
    deleteConversation,
    searchMessages,
  }
})
