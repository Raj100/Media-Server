import { createApp } from "vue"
import { createPinia } from "pinia"
import { createRouter, createWebHistory } from "vue-router"
import App from "./App.vue"
import "./assets/style.css"
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

// Import views
import Home from "./views/Home.vue"
import Admin from "./views/Admin.vue"
import Downloads from "./views/Downloads.vue"
import Status from "./views/Status.vue"
import Media from "./views/Media.vue"
import Dashboard from "./views/Dashboard.vue"
import Chat from "./views/Chat (1).vue"
import Login from "./views/Login.vue"
import Movies from "./views/Movies.vue"
import Music from "./views/Music.vue"
import Dashboard1 from './views/Dashboard1.vue'
import test from './views/test.vue'



const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/admin", name: "Admin", component: Admin },
  { path: "/downloads", name: "Downloads", component: Downloads },
  { path: "/chat", name: "Chat", component: Chat },
  { path: "/status", name: "Status", component: Status },
  { path: "/media", name: "Media", component: Media },
  { path: "/movies", name: "Movies", component: Movies },
  { path: "/music", name: "Music", component:  Music },
  { path: "/dashboard1", name: "Dashboard1", component: Dashboard1 },
  { path: "/test", name: "test", component: test },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
})
app.mount("#app")
