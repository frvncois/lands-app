<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAccountStore } from '@/stores/account'
import InputEmail from '@/components/input/InputEmail.vue'
import InputPassword from '@/components/input/InputPassword.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import AccountAuth from '@/components/alert/AccountAuth.vue'

const accountStore = useAccountStore()

// Form fields
const email = ref('')
const password = ref('')

// UI state
const isLoading = ref(false)
const alertMessage = ref('')
const alertType = ref('error')

// Security tracking
const failedAttempts = ref(parseInt(sessionStorage.getItem('login_failed_attempts') || '0'))
const lastFailedAttempt = ref(parseInt(sessionStorage.getItem('login_last_failed') || '0'))
const blockedUntil = ref(0)

const emit = defineEmits(['go-to-lost-password'])

// Constants
const MAX_ATTEMPTS = 5
const BASE_BLOCK_DURATION = 30000 // 30 seconds
const MAX_BLOCK_DURATION = 300000 // 5 minutes

// Computed properties
const isBlocked = computed(() => {
  return Date.now() < blockedUntil.value
})

const blockTimeRemaining = computed(() => {
  if (!isBlocked.value) return 0
  return Math.ceil((blockedUntil.value - Date.now()) / 1000)
})

const canSubmit = computed(() => {
  return email.value.trim() !== '' && 
         password.value.trim() !== '' && 
         !isLoading.value && 
         !isBlocked.value
})

// Methods
function showAlert(type, message) {
  alertType.value = type
  alertMessage.value = message
}

function clearAlert() {
  alertMessage.value = ''
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function updateBlockStatus() {
  if (failedAttempts.value >= MAX_ATTEMPTS) {
    const blockDuration = Math.min(
      BASE_BLOCK_DURATION * Math.pow(2, failedAttempts.value - MAX_ATTEMPTS),
      MAX_BLOCK_DURATION
    )
    blockedUntil.value = lastFailedAttempt.value + blockDuration
  }
}

function trackFailedAttempt() {
  failedAttempts.value++
  lastFailedAttempt.value = Date.now()
  
  sessionStorage.setItem('login_failed_attempts', failedAttempts.value.toString())
  sessionStorage.setItem('login_last_failed', lastFailedAttempt.value.toString())
  
  updateBlockStatus()
}

function resetFailedAttempts() {
  failedAttempts.value = 0
  blockedUntil.value = 0
  sessionStorage.removeItem('login_failed_attempts')
  sessionStorage.removeItem('login_last_failed')
}

async function handleLogin() {
  // Clear previous alerts
  clearAlert()
  
  // Validation
  if (!email.value.trim()) {
    showAlert('error', 'Email is required')
    return
  }
  
  if (!password.value.trim()) {
    showAlert('error', 'Password is required')
    return
  }
  
  if (!isValidEmail(email.value)) {
    showAlert('error', 'Please enter a valid email address')
    return
  }
  
  if (isBlocked.value) {
    showAlert('error', `Account locked. Try again in ${blockTimeRemaining.value} seconds`)
    return
  }
  
  isLoading.value = true
  showAlert('updating', 'Signing in...')
  
  try {
    // Add artificial delay for security (prevent timing attacks)
    const startTime = Date.now()
    
    const result = await accountStore.signIn(
      email.value.toLowerCase().trim(),
      password.value
    )
    
    // Ensure minimum response time
    const elapsed = Date.now() - startTime
    if (elapsed < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
    }
    
    if (result.success) {
      resetFailedAttempts()
      showAlert('success', 'Login successful')
      
      // Clear sensitive data
      password.value = ''
    } else {
      trackFailedAttempt()
      
      // Show user-friendly error messages
      let errorMessage = 'Invalid email or password'
      
      if (failedAttempts.value >= MAX_ATTEMPTS) {
        errorMessage = `Account locked. Try again in ${blockTimeRemaining.value} seconds`
      }
      
      showAlert('error', errorMessage)
    }
  } catch (err) {
    trackFailedAttempt()
    console.error('Login error:', err)
    showAlert('error', 'Connection error. Please try again')
  } finally {
    isLoading.value = false
  }
}

function goToLostPassword() {
  emit('go-to-lost-password')
}

// Auto-update block status
let blockTimer = null

function startBlockTimer() {
  if (blockTimer) clearInterval(blockTimer)
  
  if (isBlocked.value) {
    blockTimer = setInterval(() => {
      if (!isBlocked.value) {
        clearInterval(blockTimer)
        clearAlert()
      } else if (alertMessage.value && alertType.value === 'error') {
        // Update remaining time in alert
        showAlert('error', `Account locked. Try again in ${blockTimeRemaining.value} seconds`)
      }
    }, 1000)
  }
}

// Lifecycle
onMounted(() => {
  updateBlockStatus()
  startBlockTimer()
})

onUnmounted(() => {
  if (blockTimer) clearInterval(blockTimer)
  // Clear sensitive data
  password.value = ''
})
</script>

<template>
  <ul class="list">
    <li>
      <h1>Sign in to your account</h1>
    </li>

    <ul class="form">
      <!-- Alert -->
      <AccountAuth
        v-if="alertMessage"
        :type="alertType"
        :message="alertMessage"
      />
      
      <!-- Form Fields -->
      <InputEmail 
        placeholder="Email" 
        v-model="email"
        :disabled="isLoading || isBlocked"
        autocomplete="email"
      />
      
      <InputPassword 
        placeholder="Password" 
        v-model="password"
        :disabled="isLoading || isBlocked"
        autocomplete="current-password"
      />
      
      <!-- Submit Button -->
      <ButtonAuth
        :label="isLoading ? 'Signing in...' : 'Sign in'"
        :disabled="!canSubmit"
        :loading="isLoading"
        @click="handleLogin"
      />
      <li>
        <a @click="goToLostPassword" class="link">
          Forgot your password?
        </a>
      </li>
    </ul>
  </ul>
</template>

<style scoped>
a {
  font-family: 'mono';
  text-transform: uppercase;
  font-size: var(--font-sm);
  text-decoration: none;
  color: var(--details);
  cursor: pointer;
  text-align: center;
}
</style>