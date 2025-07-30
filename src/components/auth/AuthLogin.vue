<script setup>
import { ref } from 'vue'
import InputAuth from '@/components/input/InputAuth.vue'
import InputPassword from '@/components/input/InputPassword.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import AuthError from '@/components/alert/AuthError.vue'
import { useAccountStore } from '@/stores/account'

const accountStore = useAccountStore()
const email = ref('')
const password = ref('')
const showError = ref(false)
const errorMessage = ref('')

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function handleLogin() {
  showError.value = false
  errorMessage.value = ''
  
  if (!email.value.trim() || !password.value.trim()) {
    showError.value = true
    errorMessage.value = 'Please fill in all fields'
    return
  }
  
  if (!isValidEmail(email.value)) {
    showError.value = true
    errorMessage.value = 'Please enter a valid email address'
    return
  }
  
  // Test credentials check
  if (email.value === '123' && password.value === '123') {
    showError.value = true
    errorMessage.value = 'Invalid credentials'
    return
  }
  
  // Successful login
  accountStore.login({
    firstName: 'User',
    lastName: 'Demo',
    email: email.value
  })
}
</script>

<template>
  <ul class="form">
    <li><h1>Welcome back</h1></li>
    <InputAuth placeholder="Email" type="email" v-model="email" />
    <InputPassword placeholder="Password" type="password" v-model="password" />
    <ButtonAuth
      label="Login"
      :watchValues="[email, password]"
      @click="handleLogin"
    />
    <AuthError v-if="showError" :message="errorMessage" />
    <li><a>Lost password?</a></li>
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
  }
}
</style>