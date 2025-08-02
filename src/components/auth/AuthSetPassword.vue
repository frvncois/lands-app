<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputPassword from '@/components/input/InputPassword.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import AccountAuth from '@/components/alert/AccountAuth.vue'

const route = useRoute()
const router = useRouter()

// Form state
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

// Alert state
const alertMessage = ref('')
const alertType = ref('error')

// Extract token from URL query parameters
const resetToken = ref('')

// Computed properties
const canSubmit = computed(() => {
  return password.value.trim() !== '' && 
         confirmPassword.value.trim() !== '' &&
         password.value === confirmPassword.value &&
         isPasswordValid(password.value) &&
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

function isPasswordValid(password) {
  if (password.length < 12) return false
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/.test(password)) return false
  return true
}

function validatePassword(password) {
  if (password.length < 12) {
    return 'Password must be at least 12 characters long'
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/.test(password)) {
    return 'Password must contain uppercase, lowercase, number, and special character'
  }
  return null
}

async function handleSetPassword() {
  clearAlert()
  
  if (!password.value.trim() || !confirmPassword.value.trim()) {
    showAlert('error', 'Please fill in all fields')
    return
  }
  
  const passwordError = validatePassword(password.value)
  if (passwordError) {
    showAlert('error', passwordError)
    return
  }
  
  if (password.value !== confirmPassword.value) {
    showAlert('error', 'Passwords do not match')
    return
  }
  
  isLoading.value = true
  showAlert('updating', 'Setting new password...')
  
  try {
    // TODO: Replace with actual API call to set new password
    // const result = await supabase.auth.updateUser({ password: password.value })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    showAlert('success', 'Password updated successfully')
    
    password.value = ''
    confirmPassword.value = ''

    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err) {
    console.error('Set password error:', err)
    showAlert('error', 'Failed to update password. Please try again')
  } finally {
    isLoading.value = false
  }
}

function goBackToLogin() {
  router.push('/')
}

onMounted(() => {
  resetToken.value = route.query.token || ''
  
  if (!resetToken.value) {
    showAlert('error', 'Invalid or missing reset token')
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }
})
</script>

<template>
  <ul class="list">
    <li>
      <h1>Set new password</h1>
    </li>
    
    <ul class="form">
    <AccountAuth
      v-if="alertMessage"
      :type="alertType"
      :message="alertMessage"
    />
    
    <InputPassword 
      placeholder="New password" 
      v-model="password"
      :disabled="isLoading"
      autocomplete="new-password"
    />
    
    <InputPassword 
      placeholder="Confirm password" 
      v-model="confirmPassword"
      :disabled="isLoading"
      autocomplete="new-password"
    />
    </ul>
    
    <ButtonAuth
      :label="isLoading ? 'Updating...' : 'Update password'"
      :disabled="!canSubmit"
      :loading="isLoading"
      @click="handleSetPassword"
    />
    
    <li>
      <a @click="goBackToLogin" class="link">
        Back to login
      </a>
    </li>
  </ul>
</template>

<style scoped>
ul.form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-rg);
}

h1 {
  text-align: center;
  margin: 0;
  font-size: var(--font-lg);
}
</style>