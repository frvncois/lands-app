<script setup>
import { ref } from 'vue'
import InputEmail from '@/components/input/InputEmail.vue'
import InputPassword from '@/components/input/InputPassword.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import AuthError from '@/components/alert/AuthError.vue'
import { useAccountStore } from '@/stores/account'

const accountStore = useAccountStore()
const email = ref('')
const password = ref('')
const showError = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

// Enhanced rate limiting
const failedAttempts = ref(parseInt(localStorage.getItem('login_failed_attempts') || '0'))
const lastFailedAttempt = ref(parseInt(localStorage.getItem('login_last_failed') || '0'))
const isBlocked = ref(false)

const emit = defineEmits(['go-to-lost-password'])

// Check if user is blocked due to too many failed attempts
function checkBlocked() {
  const now = Date.now()
  const timeSinceLastFailed = now - lastFailedAttempt.value
  const blockDuration = Math.min(300000, failedAttempts.value * 30000)
  
  if (failedAttempts.value >= 5 && timeSinceLastFailed < blockDuration) {
    isBlocked.value = true
    const remainingTime = Math.ceil((blockDuration - timeSinceLastFailed) / 1000)
    errorMessage.value = `Too many failed attempts. Try again in ${remainingTime} seconds.`
    showError.value = true
    return true
  }
  
  // Reset if block period has passed
  if (timeSinceLastFailed > blockDuration) {
    failedAttempts.value = 0
    isBlocked.value = false
    localStorage.removeItem('login_failed_attempts')
    localStorage.removeItem('login_last_failed')
  }
  
  return false
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async function handleLogin() {
  showError.value = false
  errorMessage.value = ''
  
  // heck if user is blocked
  if (checkBlocked()) {
    isLoading.value = false
    return
  }
  
  isLoading.value = true
  
  // Client-side validation
  if (!email.value.trim() || !password.value.trim()) {
    showError.value = true
    errorMessage.value = 'Please fill in all fields'
    isLoading.value = false
    return
  }
  
  if (!isValidEmail(email.value)) {
    showError.value = true
    errorMessage.value = 'Please enter a valid email address'
    isLoading.value = false
    return
  }
  
  // Add delay to prevent timing attacks
  const startTime = Date.now()
  
  // Attempt to sign in with Supabase
  const result = await accountStore.signIn(email.value, password.value)
  
  // Ensure minimum response time to prevent timing attacks
  const elapsed = Date.now() - startTime
  if (elapsed < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
  }
  
  if (result.success) {
    // Reset failed attempts on successful login
    failedAttempts.value = 0
    localStorage.removeItem('login_failed_attempts')
    localStorage.removeItem('login_last_failed')
  } else {
    // Track failed attempts
    failedAttempts.value++
    lastFailedAttempt.value = Date.now()
    localStorage.setItem('login_failed_attempts', failedAttempts.value.toString())
    localStorage.setItem('login_last_failed', lastFailedAttempt.value.toString())
    
    showError.value = true
    // Map Supabase errors to user-friendly messages
    switch (result.error) {
      case 'Invalid login credentials':
        errorMessage.value = 'Invalid email or password'
        break
      case 'Email not confirmed':
        errorMessage.value = 'Please check your email and click the verification link'
        break
      case 'Too many requests':
        errorMessage.value = 'Too many login attempts. Please try again later'
        break
      default:
        errorMessage.value = 'Login failed. Please try again'
    }
  }
  
  isLoading.value = false
}

function goToLostPassword() {
  emit('go-to-lost-password')
}
</script>

<template>
  <ul class="form">
    <li><h1>Welcome back</h1></li>
    <InputEmail 
      placeholder="Email" 
      type="email" 
      v-model="email"
      :disabled="isLoading"
    />
    <InputPassword 
      placeholder="Password" 
      v-model="password"
      :disabled="isLoading"
    />
    <ButtonAuth
      :label="isLoading ? 'Signing in...' : 'Login'"
      @click="handleLogin"
      :disabled="isLoading"
    />
    <AuthError v-if="showError" :message="errorMessage" />
    <li><a @click="goToLostPassword" :class="{ disabled: isLoading }">Lost password?</a></li>
  </ul>
</template>

<style scoped>
ul {
  .form {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-rg);
  }
  
  h1 {
    text-align: center;
    margin-bottom: var(--space-md);
    font-size: var(--font-lg);
  }
  
  a {
    font-family: 'mono';
    text-transform: uppercase;
    font-size: var(--font-sm);
    text-decoration: none;
    color: var(--details);
    cursor: pointer;
    
    &:hover:not(.disabled) {
      color: var(--light);
    }
    
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>