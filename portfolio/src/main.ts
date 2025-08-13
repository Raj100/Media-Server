import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'


import App from './App.vue'
import router from './router'
// import Tetikus from '@namchee/tetikus';
// import '@namchee/tetikus/dist/tetikus.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)
// app.use(Tetikus);


app.mount('#app')
