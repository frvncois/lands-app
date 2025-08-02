<script setup>
import { ref, computed } from 'vue'
import InputEmail from '@/components/input/InputEmail.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import AccountAuth from '@/components/alert/AccountAuth.vue'

// Form state
const email = ref('')
const isLoading = ref(false)
const emailSent = ref(false)

// Alert state
const alertMessage = ref('')
const alertType = ref('error')

const emit = defineEmits(['go-back-to-login'])

// Computed properties
const canSubmit = computed(() => {
  return email.value.trim() !== '' && 
         isValidEmail(email.value) && 
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

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async function handleResetPassword() {
  clearAlert()
  
  if (!email.value.trim()) {
    showAlert('error', 'Please enter your email address')
    return
  }
  
  if (!isValidEmail(email.value)) {
    showAlert('error', 'Please enter a valid email address')
    return
  }
  
  isLoading.value = true
  showAlert('updating', 'Sending reset email...')
  
  try {
    // Simulate API call - replace with actual Supabase call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // TODO: Replace with actual API call to send reset email
    // const result = await supabase.auth.resetPasswordForEmail(email.value)
    
    emailSent.value = true
    showAlert('success', 'Reset email sent')
  } catch (err) {
    console.error('Password reset error:', err)
    showAlert('error', 'Failed to send reset email. Please try again')
  } finally {
    isLoading.value = false
  }
}

function goBackToLogin() {
  emit('go-back-to-login')
}
</script>

<template>
  <ul class="list">
    <transition name="auth-fade" mode="out-in">
      <li v-if="!emailSent">
        <h1>Reset your password</h1>
      </li>
      <li v-else>
        <h1>Check your email</h1>
      </li>
    </transition>
    
    <transition name="auth-fade" mode="out-in">
      <ul v-if="!emailSent" key="reset-form" class="form">
        <!-- Alert -->
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
        
        <ButtonAuth
          :label="isLoading ? 'Sending...' : 'Send reset email'"
          :disabled="!canSubmit"
          :loading="isLoading"
          @click="handleResetPassword"
        />
      </ul>
      
      <div v-else key="success-message" class="form">
        <AccountAuth
          type="success"
          message="Reset email sent"
        />
        <p class="success-details">
          Thank you, we will send you an email with instructions to reset your password.
          Please check your inbox and follow the link in the email.
        </p>
        <a @click="goBackToLogin" class="link">
        Back to login
      </a>
      </div>
      
    </transition>
    
    <li>
    </li>
  </ul>
</template>

<style scoped>

/* Same transition animations as AuthMain */
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