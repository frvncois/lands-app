<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AuthHeader from './AuthHeader.vue'
import AuthLogin from './AuthLogin.vue'
import AuthJoin from './AuthJoin.vue'
import AuthCover from './AuthCover.vue'

const showLogin = ref(true)

function toggleAuth() {
  showLogin.value = !showLogin.value
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
    <AuthHeader :showLogin="showLogin" @toggle="toggleAuth"/>

    <transition name="auth-fade" mode="out-in">
      <AuthLogin v-if="showLogin" key="login" />
      <AuthJoin v-else key="join" />
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