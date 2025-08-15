import { defineStore } from "pinia"
import { ref, computed, readonly } from "vue"
import type { User, LoginCredentials, RegisterData, AuthResponse } from "@/types"
import { apiClient } from "@/lib/api"

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem("auth_token"))
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === "admin")
  const userName = computed(() => user.value?.name || "")

  // Actions
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    isLoading.value = true
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials)

      if (response.data.success && response.data.user && response.data.token) {
        user.value = response.data.user
        token.value = response.data.token
        localStorage.setItem("auth_token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    isLoading.value = true
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", data)

      if (response.data.success && response.data.user && response.data.token) {
        user.value = response.data.user
        token.value = response.data.token
        localStorage.setItem("auth_token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (token.value) {
        await apiClient.post("/auth/logout")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
    }
  }

  const initializeAuth = (): void => {
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error("Failed to parse saved user data:", error)
        logout()
      }
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<AuthResponse> => {
    if (!user.value) return { success: false, error: "Not authenticated" }

    try {
      const response = await apiClient.put<AuthResponse>(`/users/${user.value.id}`, updates)

      if (response.data.success && response.data.user) {
        user.value = response.data.user
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed",
      }
    }
  }

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),

    // Getters
    isAuthenticated,
    isAdmin,
    userName,

    // Actions
    login,
    register,
    logout,
    initializeAuth,
    updateProfile,
  }
})
