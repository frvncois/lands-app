<script setup>
import { ref, computed, onUnmounted } from 'vue'
import InputEmail from '@/components/input/InputEmail.vue'
import InputPassword from '@/components/input/InputPassword.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import AccountAuth from '@/components/alert/AccountAuth.vue'

const props = defineProps({
  userStore: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['go-to-lost-password'])

// Form state
const email = ref('')
const password = ref('')
const isLoading = ref(false)

// Alert state
const alertMessage = ref('')
const alertType = ref('error')

// Computed properties
const canSubmit = computed(() => {
  return email.value.trim() !== '' && 
         password.value.trim() !== '' && 
         !isLoading.value
})

// Methods
function showAlert(type, message) {
  alertType.value = type
  alertMessage.value = message
}

function clearAlert() {
  alertMessage.value = ''
}

function goToLostPassword() {
  emit('go-to-lost-password')
}

async function handleLogin() {
  clearAlert()
  
  if (!email.value.trim() || !password.value.trim()) {
    showAlert('error', 'Please fill in all fields')
    return
  }

  isLoading.value = true
  showAlert('updating', 'Signing in...')
  
  try {
    const result = await props.userStore.signIn(email.value, password.value)
    
    if (result.success) {
      showAlert('success', 'Sign in successful')
      // Navigation will be handled by App.vue watcher
    } else {
      let errorMessage = 'Sign in failed'
      
      switch (result.error) {
        case 'Invalid login credentials':
          errorMessage = 'Invalid email or password'
          break
        case 'Email not confirmed':
          errorMessage = 'Please verify your email address first'
          break
        case 'Too many requests':
          errorMessage = 'Too many attempts. Please try again later'
          break
        default:
          errorMessage = 'Sign in failed. Please try again'
      }
      
      showAlert('error', errorMessage)
    }
  } catch (err) {
    console.error('Login error:', err)
    showAlert('error', 'Connection error. Please try again')
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => {
  password.value = ''
})
</script>

<template>
  <ul class="list">
    <li>
      <h1>Sign in to your account</h1>
    </li>
    
    <ul class="form">
      <AccountAuth
        v-if="alertMessage"
        :type="alertType"
        :message="alertMessage"
      />
      
      <InputEmail 
        placeholder="Email" 
        v-model="email"
        :disabled="isLoading"
        autocomplete="email"
      />
      
      <InputPassword 
        placeholder="Password" 
        v-model="password"
        :disabled="isLoading"
        autocomplete="current-password"
      />
      
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
