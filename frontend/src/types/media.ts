export interface MediaItem {
  id: string
  title: string
  type: "movie" | "music" | "video"
  thumbnail?: string
  poster?: string
  duration?: number
  size: number
  format: string
  quality?: string
  createdAt: string
  updatedAt: string
  filePath: string
  metadata?: MediaMetadata
}

export interface Movie extends MediaItem {
  type: "movie"
  year?: number
  genre: string[]
  director?: string
  cast?: string[]
  rating?: number
  description?: string
  trailer?: string
}

export interface Music extends MediaItem {
  type: "music"
  artist: string
  album?: string
  genre: readonly string[]
  year?: number
  trackNumber?: number
  lyrics?: string
  isFavorite?: boolean
}

export interface Video extends MediaItem {
  type: "video"
  category?: string
  tags?: string[]
  description?: string
}

export interface MediaMetadata {
  width?: number
  height?: number
  bitrate?: number
  codec?: string
  fps?: number
  channels?: number
  sampleRate?: number
}

export interface MediaLibrary {
  movies: Movie[]
  music: Music[]
  videos: Video[]
  totalCount: number
  totalSize: number
}

export interface MediaFilter {
  type?: "movie" | "music" | "video"
  genre?: string
  year?: number
  quality?: string
  sortBy?: "title" | "date" | "size" | "rating"
  sortOrder?: "asc" | "desc"
  search?: string
}
