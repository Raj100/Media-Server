<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Server Status</h1>
            <p class="text-gray-600 dark:text-gray-400">Monitor media server health and performance</p>
          </div>
          <router-link
            to="/dashboard"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </router-link>
        </div>
      </div>
    </header>

    <!-- Status Content -->
    <div class="container mx-auto px-4 py-6 space-y-6">
      <!-- System Health -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">System Health</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              {{ serverStore.health?.cpu.usage || 0 }}%
            </div>
            <div class="text-gray-600 dark:text-gray-400">CPU Usage</div>
            <div class="progress-bar mt-2">
              <div
                :style="{ width: (serverStore.health?.cpu.usage || 0) + '%' }"
                class="h-full bg-blue-500 transition-all duration-300"
              ></div>
            </div>
          </div>

          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">
              {{ serverStore.health?.memory.usage || 0 }}%
            </div>
            <div class="text-gray-600 dark:text-gray-400">Memory Usage</div>
            <div class="progress-bar mt-2">
              <div
                :style="{ width: (serverStore.health?.memory.usage || 0) + '%' }"
                class="h-full bg-green-500 transition-all duration-300"
              ></div>
            </div>
          </div>

          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600 mb-2">
              {{ serverStore.health?.disk.usage || 0 }}%
            </div>
            <div class="text-gray-600 dark:text-gray-400">Disk Usage</div>
            <div class="progress-bar mt-2">
              <div
                :style="{ width: (serverStore.health?.disk.usage || 0) + '%' }"
                class="h-full bg-orange-500 transition-all duration-300"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Services Status -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Services</h2>
        
        <div class="space-y-3">
          <div
            v-for="service in serverStore.services"
            :key="service.name"
            class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div
                :class="{
                  'w-3 h-3 rounded-full': true,
                  'bg-green-500': service.status === 'running',
                  'bg-red-500': service.status === 'stopped',
                  'bg-yellow-500': service.status === 'error',
                }"
              ></div>
              <div>
                <div class="font-medium">{{ service.name }}</div>
                <div v-if="service.port" class="text-sm text-gray-600 dark:text-gray-400">
                  Port: {{ service.port }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div
                :class="{
                  'status-indicator': true,
                  'status-online': service.status === 'running',
                  'status-offline': service.status === 'stopped',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400': service.status === 'error',
                }"
              >
                {{ service.status.charAt(0).toUpperCase() + service.status.slice(1) }}
              </div>
              <div v-if="service.uptime" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ service.uptime }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Logs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
        
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="log in serverStore.recentLogs"
            :key="log.id"
            class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div
              :class="{
                'w-2 h-2 rounded-full mt-2 flex-shrink-0': true,
                'bg-blue-500': log.level === 'info',
                'bg-green-500': log.level === 'success',
                'bg-yellow-500': log.level === 'warning',
                'bg-red-500': log.level === 'error',
              }"
            ></div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="font-medium text-gray-900 dark:text-white">{{ log.message }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatTimestamp(log.timestamp) }}
                </div>
              </div>
              <div v-if="log.details" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ log.details }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ log.source }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import { useServerStore } from "@/stores/server"

const serverStore = useServerStore()

const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString()
}

onMounted(() => {
  serverStore.startPolling(5000)
  serverStore.fetchActivityLogs()
})

onUnmounted(() => {
  serverStore.stopPolling()
})
</script>
