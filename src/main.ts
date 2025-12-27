import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import './assets/main.css'
import router from './router'
import { useUserStore } from './stores/user'
import { registerVisibilityHandler } from './lib/supabase'
import { setupAssistantRouteWatcher } from './stores/assistant'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Setup assistant route watcher
setupAssistantRouteWatcher(router)

// Register Supabase connection recovery on tab visibility change
registerVisibilityHandler()

const userStore = useUserStore()

// Mount app with timeout - don't let slow auth block the entire app
const AUTH_TIMEOUT = 5000
Promise.race([
  userStore.initAuth(),
  new Promise(resolve => setTimeout(resolve, AUTH_TIMEOUT))
]).then(() => {
  app.mount('#app')
}).catch((error) => {
  console.error('[Main] Auth initialization failed:', error)
  app.mount('#app') // Mount anyway so the app is usable
})
