import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import './assets/main.css'
import router from './router'
import { useUserStore } from './stores/user'
import { registerVisibilityHandler } from './lib/supabase'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Register visibility handler (currently a no-op, keeping for compatibility)
registerVisibilityHandler()

const userStore = useUserStore()

// FIRE-AND-FORGET: Start auth initialization without blocking app mount
// The app will render immediately and self-correct when auth resolves
userStore.initAuth()

// Mount app immediately - no waiting for auth
app.mount('#app')
