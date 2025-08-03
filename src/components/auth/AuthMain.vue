<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AuthHeader from './AuthHeader.vue'
import AuthLogin from './AuthLogin.vue'
import AuthJoin from './AuthJoin.vue'
import AuthLostPassword from './AuthLostPassword.vue'
import AuthSetPassword from './AuthSetPassword.vue'
import AuthCover from './AuthCover.vue'

// Accept userStore as prop from App.vue
const props = defineProps({
  userStore: {
    type: Object,
    required: true
  }
})

const showLogin = ref(true)
const currentView = ref('login')

function toggleAuth() {
  showLogin.value = !showLogin.value
  currentView.value = showLogin.value ? 'login' : 'join'
}

function goToLostPassword() {
  currentView.value = 'lost-password'
}

function goBackToLogin() {
  currentView.value = 'login'
  showLogin.value = true
}

function clearSensitiveData() {
  const sensitiveInputs = document.querySelectorAll('input[type="password"], input[type="email"]')
  sensitiveInputs.forEach(input => {
    input.value = ''
    input.blur()
  })
  
  if (window.history?.replaceState) {
    window.history.replaceState(null, null, window.location.pathname)
  }
}

function preventContextMenu(e) {
  if (import.meta.env.PROD) {
    e.preventDefault()
    return false
  }
}

function detectDevTools() {
  if (import.meta.env.PROD) {
    let devtools = { open: false }
    const threshold = 160
    
    const checkDevTools = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true
          console.clear()
          console.warn('🔒 This application contains sensitive authentication data. Developer tools detected.')
        }
      } else {
        devtools.open = false
      }
    }
    
    return setInterval(checkDevTools, 500)
  }
  return null
}
let devToolsTimer = null

onMounted(() => {
  document.addEventListener('contextmenu', preventContextMenu, { passive: false })
  window.addEventListener('beforeunload', clearSensitiveData, { passive: true })
  
  devToolsTimer = detectDevTools()
  
  document.addEventListener('dragover', (e) => e.preventDefault(), { passive: false })
  document.addEventListener('drop', (e) => e.preventDefault(), { passive: false })
})

onUnmounted(() => {
  document.removeEventListener('contextmenu', preventContextMenu)
  window.removeEventListener('beforeunload', clearSensitiveData)
  document.removeEventListener('dragover', (e) => e.preventDefault())
  document.removeEventListener('drop', (e) => e.preventDefault())
  if (devToolsTimer) {
    clearInterval(devToolsTimer)
  }
  clearSensitiveData()
})
</script>

<template>
  <ul class="auth">
    <AuthHeader 
      :showLogin="showLogin" 
      :hideToggle="currentView === 'lost-password' || currentView === 'set-password'"
      @toggle="toggleAuth"
    />

    <!-- Pass userStore to all auth components -->
    <transition name="auth-fade" mode="out-in">
      <AuthLogin 
        v-if="currentView === 'login'" 
        key="login"
        :user-store="props.userStore"
        @go-to-lost-password="goToLostPassword"
      />
      <AuthJoin 
        v-else-if="currentView === 'join'" 
        key="join"
        :user-store="props.userStore"
      />
      <AuthLostPassword 
        v-else-if="currentView === 'lost-password'" 
        key="lost-password"
        :user-store="props.userStore"
        @go-back-to-login="goBackToLogin"
      />
      <AuthSetPassword 
        v-else-if="currentView === 'set-password'" 
        key="set-password"
        :user-store="props.userStore"
        @go-back-to-login="goBackToLogin"
      />
    </transition>
    
    <footer>
      <p>Made with ♥ in Montreal</p>
    </footer>
  </ul>

  <AuthCover />
</template>

<style scoped>
/* Same styles as before */
ul.auth {
  width: 33vw;
  background: var(--nav);
  backdrop-filter: blur(5em);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  z-index: 2;
  top: 0;
  bottom: 0;
  left: 0;
}

footer p {
  font-family: 'mono';
  text-transform: uppercase;
  font-size: var(--font-sm);
  text-align: center;
  color: var(--details);
  margin: 0;
  opacity: 0.7;
  transition: opacity var(--transition-smooth);
}

footer:hover p {
  opacity: 1;
}

.auth-fade-enter-active {
  transition: all var(--transition-smooth);
}

.auth-fade-leave-active {
  transition: all var(--transition-smooth);
}

.auth-fade-enter-from {
  opacity: 0;
  transform: translateY(0.25em);
}

.auth-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.25em);
}
</style>