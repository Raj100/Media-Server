import { defineStore } from "pinia"
import { ref } from "vue"

export const useThemeStore = defineStore("theme", () => {
  const isDarkMode = ref(true) // Default to dark mode for media server

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem("theme", isDarkMode.value ? "dark" : "light")
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      isDarkMode.value = savedTheme === "dark"
    }
  }

  return {
    isDarkMode,
    toggleTheme,
    initTheme,
  }
})
