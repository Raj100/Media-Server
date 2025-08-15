import { defineStore } from "pinia"
import { ref, computed, watch } from "vue"
import type { Theme } from "@/types"
import { readonly } from "vue"

export const useThemeStore = defineStore("theme", () => {
  // State
  const mode = ref<"light" | "dark">("light")
  const primaryColor = ref("#8b5cf6") // Purple
  const accentColor = ref("#06b6d4") // Cyan

  // Getters
  const isDark = computed(() => mode.value === "dark")
  const theme = computed(
    (): Theme => ({
      mode: mode.value,
      primaryColor: primaryColor.value,
      accentColor: accentColor.value,
    }),
  )

  // Actions
  const toggleMode = (): void => {
    mode.value = mode.value === "light" ? "dark" : "light"
  }

  const setMode = (newMode: "light" | "dark"): void => {
    mode.value = newMode
  }

  const setPrimaryColor = (color: string): void => {
    primaryColor.value = color
  }

  const setAccentColor = (color: string): void => {
    accentColor.value = color
  }

  const initializeTheme = (): void => {
    // Load from localStorage
    const savedMode = localStorage.getItem("theme-mode") as "light" | "dark" | null
    const savedPrimary = localStorage.getItem("theme-primary-color")
    const savedAccent = localStorage.getItem("theme-accent-color")

    if (savedMode) {
      mode.value = savedMode
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      mode.value = prefersDark ? "dark" : "light"
    }

    if (savedPrimary) primaryColor.value = savedPrimary
    if (savedAccent) accentColor.value = savedAccent

    // Apply theme to document
    applyTheme()
  }

  const applyTheme = (): void => {
    const root = document.documentElement

    if (mode.value === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // Apply custom colors if needed
    root.style.setProperty("--primary-color", primaryColor.value)
    root.style.setProperty("--accent-color", accentColor.value)
  }

  // Watch for changes and persist to localStorage
  watch(mode, (newMode) => {
    localStorage.setItem("theme-mode", newMode)
    applyTheme()
  })

  watch(primaryColor, (newColor) => {
    localStorage.setItem("theme-primary-color", newColor)
    applyTheme()
  })

  watch(accentColor, (newColor) => {
    localStorage.setItem("theme-accent-color", newColor)
    applyTheme()
  })

  return {
    // State
    mode: readonly(mode),
    primaryColor: readonly(primaryColor),
    accentColor: readonly(accentColor),

    // Getters
    isDark,
    theme,

    // Actions
    toggleMode,
    setMode,
    setPrimaryColor,
    setAccentColor,
    initializeTheme,
    applyTheme,
  }
})
