<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputPassword from '@/components/input/InputPassword.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import AuthError from '@/components/alert/AuthError.vue'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const showError = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

// Extract token from URL query parameters
const resetToken = ref('')

onMounted(() => {
  resetToken.value = route.query.token || ''
  
  // Redirect to main page if no token provided
  if (!resetToken.value) {
    router.push('/')
  }
})

function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }
  return null
}

function handleSetPassword() {
  showError.value = false
  errorMessage.value = ''
  
  if (!password.value.trim() || !confirmPassword.value.trim()) {
    showError.value = true
    errorMessage.value = 'Please fill in all fields'
    return
  }
  
  const passwordError = validatePassword(password.value)
  if (passwordError) {
    showError.value = true
    errorMessage.value = passwordError
    return
  }
  
  if (password.value !== confirmPassword.value) {
    showError.value = true
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  isLoading.value = true
  
  // TODO: Replace with actual API call to set new password
  // For now, we'll simulate success and redirect to login
  setTimeout(() => {
    isLoading.value = false
    // Redirect to main page (more secure - no auto-login)
    router.push('/')
  }, 1000)
}

function goBackToLogin() {
  router.push('/')
}
</script>

<template>
  <ul class="form">
    <li><h1>Set new password</h1></li>
    
    <InputPassword placeholder="New password" v-model="password" />
    <InputPassword placeholder="Confirm password" v-model="confirmPassword" />
    
    <div class="password-requirements">
      <p>Password requirements:</p>
      <ul>
        <li>At least 8 characters long</li>
        <li>One uppercase letter</li>
        <li>One lowercase letter</li>
        <li>One number</li>
      </ul>
    </div>
    
    <ButtonAuth
      :label="isLoading ? 'Setting password...' : 'Set password'"
      :watchValues="[password, confirmPassword]"
      @click="handleSetPassword"
    />
    
    <AuthError v-if="showError" :message="errorMessage" />
    
    <li><a @click="goBackToLogin">Back to login</a></li>
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
  
  .password-requirements {
    p {
      font-family: 'mono';
      text-transform: uppercase;
      font-size: var(--font-sm);
      color: var(--details);
      margin-bottom: var(--space-sm);
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        font-size: var(--font-sm);
        color: var(--details);
        margin-bottom: var(--space-xs);
        
        &::before {
          content: '•';
          margin-right: var(--space-sm);
        }
      }
    }
  }
  
  a {
    font-family: 'mono';
    text-transform: uppercase;
    font-size: var(--font-sm);
    text-align: center;
    color: var(--details);
    text-decoration: none;
    cursor: pointer;
    
    &:hover {
      color: var(--light);
    }
  }
}
</style>