<template>
  <div id="app" :class="{ dark: isDark }">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useThemeStore } from "@/stores/theme"

const authStore = useAuthStore()
const themeStore = useThemeStore()

const { isDark } = themeStore

onMounted(() => {
  // Initialize authentication and theme
  authStore.initializeAuth()
  themeStore.initializeTheme()
})
</script>

<!-- <style>
@import "./assets/style.css";
</style> -->
