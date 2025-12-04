import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import './assets/main.css'
import 'lineicons/dist/lineicons.css'
import router from './router'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth before mounting
const userStore = useUserStore()
userStore.initAuth().then(() => {
  app.mount('#app')
})
