// Re-export all types for easy importing
export * from "./auth"
export * from "./media"
export * from "./downloads"
export * from "./server"
export * from "./api"
export * from "./ui"
export * from "./chat"


// Global type utilities
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Common utility types
export type ID = string
export type Timestamp = string
export type FileSize = number
export type Percentage = number
export type URL = string
