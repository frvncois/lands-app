<script setup>
import { ref } from 'vue'
import InputEmail from '@/components/input/InputEmail.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import AuthError from '@/components/alert/AuthError.vue'

const email = ref('')
const showError = ref(false)
const errorMessage = ref('')
const emailSent = ref(false)

const emit = defineEmits(['go-back-to-login'])

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function handleResetPassword() {
  showError.value = false
  errorMessage.value = ''
  
  if (!email.value.trim()) {
    showError.value = true
    errorMessage.value = 'Please enter your email address'
    return
  }
  
  if (!isValidEmail(email.value)) {
    showError.value = true
    errorMessage.value = 'Please enter a valid email address'
    return
  }
  
  // TODO: Replace with actual API call to send reset email
  // For now, we'll simulate success
  emailSent.value = true
}

function goBackToLogin() {
  emit('go-back-to-login')
}
</script>

<template>
  <ul class="form">
    <transition name="auth-fade" mode="out-in">
      <li v-if="!emailSent" key="reset-title">
        <h1>Reset your password</h1>
      </li>
      <li v-else key="check-title">
        <h1>Check your email</h1>
      </li>
    </transition>
    
    <transition name="auth-fade" mode="out-in">
      <div v-if="!emailSent" key="reset-form" class="form-content">
        <InputEmail placeholder="Email" type="email" v-model="email" />
        <ButtonAuth
          label="Send reset email"
          @click="handleResetPassword"
        />
        <AuthError v-if="showError" :message="errorMessage" />
      </div>
      
      <div v-else key="success-message" class="form-content">
        <p>Thank you, we will send you an email with instructions to reset your password. Please check your inbox and follow the link in the email.</p>
      </div>
    </transition>
    
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
  
  .form-content {
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
  
  p {
    text-align: center;
    line-height: 1.5;
    color: var(--light);
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

/* Same transition animation as AuthMain */
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