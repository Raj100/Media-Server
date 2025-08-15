import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { ServerStats, SystemHealth, ServiceStatus, ActivityLog } from "@/types"
import { apiClient } from "@/lib/api"
import { readonly } from "vue"

export const useServerStore = defineStore("server", () => {
  // State
  const stats = ref<ServerStats | null>(null)
  const health = ref<SystemHealth | null>(null)
  const services = ref<ServiceStatus[]>([])
  const activityLogs = ref<ActivityLog[]>([])
  const isLoading = ref(false)

  // Getters
  const isServerOnline = computed(() => stats.value?.serverStatus === "online")
  const criticalServices = computed(() => services.value.filter((s) => s.status === "error"))
  const recentLogs = computed(() =>
    activityLogs.value.slice(0, 50).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  )

  // Actions
  const fetchServerStats = async (): Promise<void> => {
    try {
      const response = await apiClient.get<ServerStats>("/server/stats")
      stats.value = response.data
    } catch (error) {
      console.error("Failed to fetch server stats:", error)
    }
  }

  const fetchSystemHealth = async (): Promise<void> => {
    try {
      const response = await apiClient.get<SystemHealth>("/server/health")
      health.value = response.data
    } catch (error) {
      console.error("Failed to fetch system health:", error)
    }
  }

  const fetchServices = async (): Promise<void> => {
    try {
      const response = await apiClient.get<ServiceStatus[]>("/server/services")
      services.value = response.data || []
    } catch (error) {
      console.error("Failed to fetch services:", error)
    }
  }

  const fetchActivityLogs = async (limit = 100): Promise<void> => {
    try {
      const response = await apiClient.get<ActivityLog[]>(`/server/logs?limit=${limit}`)
      activityLogs.value = response.data || []
    } catch (error) {
      console.error("Failed to fetch activity logs:", error)
    }
  }

  const restartService = async (serviceName: string): Promise<boolean> => {
    try {
      await apiClient.post(`/server/services/${serviceName}/restart`)
      await fetchServices() // Refresh services status
      return true
    } catch (error) {
      console.error(`Failed to restart service ${serviceName}:`, error)
      return false
    }
  }

  const startPolling = (interval = 5000): void => {
    const pollData = async () => {
      await Promise.all([fetchServerStats(), fetchSystemHealth(), fetchServices()])
    }

    // Initial fetch
    pollData()

    // Set up polling
    const intervalId = setInterval(pollData, interval)

    // Store interval ID for cleanup
    ;(window as any).__serverPollingInterval = intervalId
  }

  const stopPolling = (): void => {
    const intervalId = (window as any).__serverPollingInterval
    if (intervalId) {
      clearInterval(intervalId)
      delete (window as any).__serverPollingInterval
    }
  }

  return {
    // State
    stats: readonly(stats),
    health: readonly(health),
    services: readonly(services),
    activityLogs: readonly(activityLogs),
    isLoading: readonly(isLoading),

    // Getters
    isServerOnline,
    criticalServices,
    recentLogs,

    // Actions
    fetchServerStats,
    fetchSystemHealth,
    fetchServices,
    fetchActivityLogs,
    restartService,
    startPolling,
    stopPolling,
  }
})
