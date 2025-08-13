import { createApp } from "vue"
import { createPinia } from "pinia"
import { createRouter, createWebHistory } from "vue-router"
import App from "./App.vue"

import Home from "./views/Home.vue"
import Login from "./views/Login.vue"
import Dashboard from "./views/Dashboard.vue"
import Movies from "./views/Movies.vue"
import Music from "./views/Music.vue"
import Chat from "./views/Chat.vue"

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/dashboard", component: Dashboard },
  { path: "/movies", component: Movies },
  { path: "/music", component: Music },
  { path: "/chat", component: Chat },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const pinia = createPinia()
const app = createApp(App)

// Initialize auth and theme
import { useAuthStore } from "./stores/auth"
import { useThemeStore } from "./stores/theme"



app.use(pinia)
app.use(router)

const authStore = useAuthStore()
const themeStore = useThemeStore()

// Initialize stores after mounting
app.mount("#app")

authStore.initAuth()
themeStore.initTheme()
