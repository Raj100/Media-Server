import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  // Initialize user from localStorage
  const initAuth = () => {
    const savedUser = localStorage.getItem("mediaHub_user")
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }

  const saveUser = (userData) => {
    user.value = userData
    localStorage.setItem("mediaHub_user", JSON.stringify(userData))
  }

  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (credentials.email === "demo@example.com" && credentials.password === "password") {
        const userData = {
          id: 1,
          name: "Demo User",
          email: credentials.email,
          avatar: "/diverse-user-avatars.png",
          joinDate: new Date().toISOString(),
          preferences: {
            theme: "dark",
            autoplay: true,
            quality: "HD",
          },
        }
        saveUser(userData)
        return true
      } else {
        throw new Error("Invalid email or password. Try demo@example.com / password")
      }
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate Google OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const userData = {
        id: 2,
        name: "Google User",
        email: "google.user@gmail.com",
        avatar: "/google-user-avatar.png",
        provider: "google",
        joinDate: new Date().toISOString(),
        preferences: {
          theme: "dark",
          autoplay: true,
          quality: "HD",
        },
      }
      saveUser(userData)
      return true
    } catch (err) {
      error.value = "Google authentication failed. Please try again."
      return false
    } finally {
      isLoading.value = false
    }
  }

  const signup = async (userData) => {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if email already exists (simulation)
      if (userData.email === "demo@example.com") {
        throw new Error("Email already exists. Please use a different email.")
      }

      const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        avatar: "/abstract-user-avatar.png",
        joinDate: new Date().toISOString(),
        preferences: {
          theme: "dark",
          autoplay: true,
          quality: "HD",
        },
      }
      saveUser(newUser)
      return true
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    error.value = null
    localStorage.removeItem("mediaHub_user")
  }

  const updateProfile = async (updates) => {
    isLoading.value = true
    error.value = null

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedUser = { ...user.value, ...updates }
      saveUser(updatedUser)
      return true
    } catch (err) {
      error.value = "Failed to update profile"
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    initAuth,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
  }
})
