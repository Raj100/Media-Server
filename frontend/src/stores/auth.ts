import { defineStore } from "pinia"
import { ref, computed, readonly } from "vue"
import type { User, LoginCredentials, RegisterData, AuthResponse } from "@/types"
import { apiClient } from "@/lib/api"
import { showToast } from "@/lib/toast"

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem("auth_token"))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === "admin")
  const userName = computed(() => user.value?.name || "")

  // Actions
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials)
      if (response.data.success && response.data.user && response.data.token) {
        user.value = response.data.user
        token.value = response.data.token
        localStorage.setItem("auth_token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        showToast({ message: "Login successful", type: "success" })
      } else {
        error.value = response.data.error || "Login failed"
        showToast({ message: error.value || "Login failed", type: "error" })
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || "Login failed"
      showToast({ message: error.value || "Login failed", type: "error" })
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const signup = async (data: RegisterData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", data)
      if (response.data.success && response.data.user && response.data.token) {
        user.value = response.data.user
        token.value = response.data.token
        localStorage.setItem("auth_token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
        showToast({ message: "Signup successful", type: "success" })
      } else {
        error.value = response.data.error || "Signup failed"
        showToast({ message: error.value || "Signup failed", type: "error" })
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || "Signup failed"
      showToast({ message: error.value || "Signup failed", type: "error" })
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async () => {
    // Placeholder
    showToast({ message: "Google login not implemented", type: "error" })
    return { success: false, error: "Not implemented" }
  }

  const logout = async () => {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    showToast({ message: "Logged out", type: "success" })
  }

  const initializeAuth = () => {
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch {
        logout()
      }
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated,
    isAdmin,
    userName,
    login,
    signup,
    loginWithGoogle,
    logout,
    initializeAuth,
  }
})
