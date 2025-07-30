<script setup>
import { ref, computed } from 'vue'
import { useAccountStore } from '@/stores/account'
import InputAuth from '@/components/input/InputAuth.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import InputPassword from '../input/InputPassword.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'

const accountStore = useAccountStore()

// Form fields
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

// Boolean preferences
const acceptTerms = ref(false)
const stayUpToDate = ref(false)

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return firstName.value.trim() !== '' &&
         lastName.value.trim() !== '' &&
         email.value.trim() !== '' &&
         password.value.trim() !== '' &&
         acceptTerms.value === true
})

function handleLogin() {
  // Only proceed if form is valid
  if (!isFormValid.value) {
    return
  }
  
  accountStore.login({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    settings: {
      marketing: stayUpToDate.value,
      analytics: false, // Default to false, can be changed later in settings
      acceptedTerms: acceptTerms.value
    }
  })
}
</script>

<template>
  <ul class="form">
    <li><h1>Create your account</h1></li>
    
    <InputAuth placeholder="First name" type="text" v-model="firstName" />
    <InputAuth placeholder="Last name" type="text" v-model="lastName" />
    <InputAuth placeholder="Email" type="email" v-model="email" />
    <InputPassword placeholder="Password" type="password" v-model="password" />
    
    <ul class="list">
    <InputBoolean 
      label="Accept terms and conditions"
      details="By creating an account, you agree to our terms of service and privacy policy. You can review these documents at any time."
      v-model="acceptTerms"
    />
    
    <InputBoolean 
      label="Stay up to date"
      details="Receive news, updates, and product announcements about Lands.app. You can unsubscribe at any time from your account settings."
      v-model="stayUpToDate"
    />
    </ul>
    
    <ButtonAuth 
      label="Continue" 
      @click="handleLogin"
      :disabled="!isFormValid"
      :buttonStyle="isFormValid ? 'primary' : 'disabled'"
    />
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
  }
  .list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
    margin: var(--space-md) 0;
  }
}
</style>