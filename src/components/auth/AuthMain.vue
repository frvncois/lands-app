<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AuthHeader from './AuthHeader.vue'
import AuthLogin from './AuthLogin.vue'
import AuthJoin from './AuthJoin.vue'
import AuthLostPassword from './AuthLostPassword.vue'
import AuthSetPassword from './AuthSetPassword.vue'
import AuthCover from './AuthCover.vue'

const showLogin = ref(true)
const currentView = ref('login') // 'login', 'join', 'lost-password', 'set-password'

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
  const inputs = document.querySelectorAll('input[type="password"], input[type="email"]')
  inputs.forEach(input => {
    input.value = ''
  })
}

function preventContextMenu(e) {
  e.preventDefault()
  return false
}

onMounted(() => {
  document.addEventListener('contextmenu', preventContextMenu)
  window.addEventListener('beforeunload', clearSensitiveData)
})

onUnmounted(() => {
  document.removeEventListener('contextmenu', preventContextMenu)
  window.removeEventListener('beforeunload', clearSensitiveData)
  clearSensitiveData()
})
</script>

<template>
  <ul class="auth">
    <!-- Show header toggle only for main login/join -->
    <AuthHeader 
      v-if="currentView === 'login' || currentView === 'join'"
      :showLogin="showLogin" 
      @toggle="toggleAuth"
    />
    <!-- Hide toggle for password reset pages -->
    <AuthHeader 
      v-else
      :showLogin="true"
      :hideToggle="true"
    />

    <transition name="auth-fade" mode="out-in">
      <!-- Main login/join toggle -->
      <AuthLogin 
        v-if="currentView === 'login'" 
        key="login" 
        @go-to-lost-password="goToLostPassword"
      />
      <AuthJoin 
        v-else-if="currentView === 'join'" 
        key="join" 
      />
      
      <!-- Password reset components -->
      <AuthLostPassword 
        v-else-if="currentView === 'lost-password'" 
        key="lost-password" 
        @go-back-to-login="goBackToLogin"
      />
      <AuthSetPassword 
        v-else-if="currentView === 'set-password'" 
        key="set-password" 
        @go-back-to-login="goBackToLogin"
      />
    </transition>
    
    <li><p>Made with ♥ in Montreal</p></li>
  </ul>
  <AuthCover/>
</template>

<style scoped>
ul.auth {
  width: 40vw;
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
  
  p {
    font-family: 'mono';
    text-transform: uppercase;
    font-size: var(--font-sm);
    text-align: center;
    color: var(--details);
  }
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