export interface Theme {
  mode: "light" | "dark"
  primaryColor: string
  accentColor: string
}

export interface NotificationItem {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: string
  read: boolean
  action?: {
    label: string
    handler: () => void
  }
}

export interface TabItem {
  id: string
  label: string
  icon?: string
  count?: number
  disabled?: boolean
}

export interface MenuItem {
  id: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
  badge?: string | number
}

export interface ModalProps {
  isOpen: boolean
  title?: string
  size?: "sm" | "md" | "lg" | "xl"
  closable?: boolean
  onClose: () => void
}

export interface ToastOptions {
  type?: "info" | "success" | "warning" | "error"
  duration?: number
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  closable?: boolean
}
