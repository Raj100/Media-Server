import type { ID, Timestamp } from "./index"

export interface ChatMessage {
  id: ID
  roomId: ID
  senderId: ID
  senderName: string
  content: string
  type: "text" | "media" | "system"
  mediaId?: ID
  mediaType?: string
  read: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ChatRoom {
  id: ID
  name: string
  description?: string
  memberCount: number
  isPrivate: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ChatUser {
  id: ID
  name: string
  avatar?: string
  isOnline: boolean
  lastSeen: Timestamp
}
