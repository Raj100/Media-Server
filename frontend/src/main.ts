import { createApp } from "vue"
import { createPinia } from "pinia"
import { createRouter, createWebHistory } from "vue-router"
import App from "./App.vue"
import "./assets/style.css"

// Import views
import Home from "./views/Home.vue"
import Admin from "./views/Admin.vue"
import Downloads from "./views/Downloads.vue"
import Status from "./views/Status.vue"
import Media from "./views/Media.vue"

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/admin", name: "Admin", component: Admin },
  { path: "/downloads", name: "Downloads", component: Downloads },
  { path: "/status", name: "Status", component: Status },
  { path: "/media", name: "Media", component: Media },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount("#app")
