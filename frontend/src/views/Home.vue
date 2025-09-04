<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
    <!-- Loading State -->
    <div v-if="authStore.isLoading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>

    <!-- Login Form -->
    <div
      v-else-if="!authStore.isAuthenticated"
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div class="w-full max-w-md bg-white/80 dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
          <p class="text-gray-600 dark:text-gray-400">Sign in to access your media collection</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="email"
              v-model="loginForm.email"
              type="email"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="admin@mediaserver.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your password"
            />
          </div>

          <div v-if="error" class="text-sm text-red-600 dark:text-red-400">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loginLoading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <div v-if="loginLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Sign In
          </button>
          <div class="flex align-center justify-center">
          <router-link to="/dashboard"
              class=" px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Normal User Login
            </router-link>
            </div>
          <p class=" dark:text-white" >Guest Credentials: test@gmail.com</p>
          <p class="dark:text-white" >Password: testing</p>
        </form>
      </div>
    </div>

    <!-- Dashboard -->
    <div v-else>
      <!-- Header -->
      <header class="border-b bg-white backdrop-blur-sm dark:bg-gray-900/80">
        <div class="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-purple-600 dark:text-purple-400">Media Server</h1>
          <div class="flex items-center gap-4">
            <button
              @click="themeStore.toggleMode"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg v-if="!themeStore.isDark" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </button>
            <span class="text-sm text-gray-600 dark:text-gray-300">Welcome, {{ authStore.userName }}</span>
            <router-link to="/dashboard"
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              main dashboard
            </router-link>
            <button
              @click="handleLogout"
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-4 py-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Movies</p>
                <p class="text-2xl font-bold">
                  <span v-if="serverStore.stats">{{ serverStore.stats.totalMovies }}</span>
                  <div v-else class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Music</p>
                <p class="text-2xl font-bold">
                  <span v-if="serverStore.stats">{{ serverStore.stats.totalMusic }}</span>
                  <div v-else class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Active Downloads</p>
                <p class="text-2xl font-bold">
                  <span v-if="serverStore.stats">{{ serverStore.stats.activeDownloads }}</span>
                  <div v-else class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <svg class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Storage</p>
                <p class="text-2xl font-bold">
                  <span v-if="serverStore.stats">{{ serverStore.stats.totalSize }}</span>
                  <div v-else class="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions and Server Status -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <router-link
                to="/media"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
                </svg>
                Browse Media Library
              </router-link>

              <router-link
                v-if="authStore.isAdmin"
                to="/admin"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Admin Dashboard
              </router-link>

              <router-link
                to="/downloads"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Manager
              </router-link>

              <router-link
                to="/status"
                class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Server Status
              </router-link>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Server Status</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Server Status</span>
                <div class="flex items-center gap-2">
                  <div
                    :class="{
                      'w-2 h-2 rounded-full': true,
                      'bg-green-500': serverStore.stats?.serverStatus === 'online',
                      'bg-red-500': serverStore.stats?.serverStatus === 'offline',
                      'bg-yellow-500': serverStore.stats?.serverStatus === 'maintenance',
                    }"
                  ></div>
                  <span class="text-sm font-medium capitalize">
                    {{ serverStore.stats?.serverStatus || 'Loading...' }}
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                <span class="text-sm font-medium">{{ serverStore.stats?.uptime || 'Loading...' }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Available Space</span>
                <span class="text-sm font-medium">{{ serverStore.stats?.availableSpace || 'Loading...' }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useThemeStore } from "@/stores/theme"
import { useServerStore } from "@/stores/server"
import type { LoginCredentials } from "@/types"

const authStore = useAuthStore()
const themeStore = useThemeStore()
const serverStore = useServerStore()

const loginForm = ref<LoginCredentials>({
  email: "",
  password: "",
})

const loginLoading = ref(false)
const error = ref("")

const handleLogin = async (): Promise<void> => {
  loginLoading.value = true
  error.value = ""

  const response = await authStore.login(loginForm.value)
  if (!response.success) {
    error.value = response.error || "Login failed"
  }

  loginLoading.value = false
}

const handleLogout = async (): Promise<void> => {
  await authStore.logout()
}


onMounted(() => {
  serverStore.fetchServerStats()
})
</script>
