import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import './assets/main.css'
import router from './router'
import { useUserStore } from './stores/user'
import { registerVisibilityHandler } from './lib/supabase'
import { initSaveQueue } from './lib/editor'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Register Supabase connection recovery on tab visibility change
registerVisibilityHandler()

// Initialize editor save queue (processes any pending saves from previous session)
initSaveQueue()

const userStore = useUserStore()
userStore.initAuth().then(() => {
  app.mount('#app')
})
