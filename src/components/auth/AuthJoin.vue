<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccountStore } from '@/stores/account'
import InputAuth from '@/components/input/InputAuth.vue'
import InputEmail from '@/components/input/InputEmail.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import InputPassword from '../input/InputPassword.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import AuthError from '@/components/alert/AuthError.vue'

const accountStore = useAccountStore()

// Form fields
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')

// Boolean preferences
const acceptTerms = ref(false)
const stayUpToDate = ref(false)

// UI state
const isLoading = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)

// Security: Rate limiting for signup attempts
const signupAttempts = ref(parseInt(localStorage.getItem('signup_attempts') || '0'))
const lastSignupAttempt = ref(parseInt(localStorage.getItem('last_signup_attempt') || '0'))

// Security: Honeypot field (hidden from users, bots will fill it)
const honeypot = ref('')

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return firstName.value.trim() !== '' &&
         lastName.value.trim() !== '' &&
         email.value.trim() !== '' &&
         password.value.trim() !== '' &&
         acceptTerms.value === true &&
         honeypot.value === '' // Security: honeypot must be empty
})

// Password strength indicator
const passwordStrengthScore = computed(() => {
  const pwd = password.value
  if (!pwd) return 0
  
  let score = 0
  if (pwd.length >= 8) score += 1
  if (pwd.length >= 12) score += 1
  if (/[a-z]/.test(pwd)) score += 1
  if (/[A-Z]/.test(pwd)) score += 1
  if (/[0-9]/.test(pwd)) score += 1
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1
  if (pwd.length >= 16) score += 1
  
  return Math.min(score, 6)
})

const passwordStrengthPercent = computed(() => {
  return (passwordStrengthScore.value / 6) * 100
})

const passwordStrengthClass = computed(() => {
  if (passwordStrengthScore.value <= 2) return 'weak'
  if (passwordStrengthScore.value <= 4) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  if (passwordStrengthScore.value <= 2) return 'Weak password'
  if (passwordStrengthScore.value <= 4) return 'Medium password'
  return 'Strong password'
})

// Security: Enhanced password validation
function validatePassword(password) {
  if (password.length < 12) {
    return 'Password must be at least 12 characters long'
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/.test(password)) {
    return 'Password must contain uppercase, lowercase, number, and special character'
  }
  // Check for common weak patterns
  if (/(.)\1{2,}/.test(password)) {
    return 'Password cannot contain repeated characters'
  }
  if (/123|abc|qwe|password|admin/i.test(password)) {
    return 'Password cannot contain common patterns'
  }
  return null
}

// Security: Validate name inputs
function validateName(name, fieldName) {
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters long`
  }
  if (name.length > 50) {
    return `${fieldName} must be less than 50 characters`
  }
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
  }
  return null
}

// Security: Rate limiting check
function checkRateLimit() {
  const now = Date.now()
  const timeSinceLastAttempt = now - lastSignupAttempt.value
  const cooldownPeriod = Math.min(600000, signupAttempts.value * 60000) // Max 10 minutes
  
  if (signupAttempts.value >= 3 && timeSinceLastAttempt < cooldownPeriod) {
    const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 60000)
    errorMessage.value = `Too many signup attempts. Please try again in ${remainingTime} minutes.`
    showError.value = true
    return false
  }
  
  // Reset if cooldown period has passed
  if (timeSinceLastAttempt > cooldownPeriod) {
    signupAttempts.value = 0
    localStorage.removeItem('signup_attempts')
    localStorage.removeItem('last_signup_attempt')
  }
  
  return true
}

async function handleSignUp() {
  if (!isFormValid.value) return
  
  showError.value = false
  showSuccess.value = false
  
  // Security: Check rate limiting
  if (!checkRateLimit()) {
    isLoading.value = false
    return
  }
  
  // Security: Honeypot check
  if (honeypot.value !== '') {
    console.warn('Bot detected via honeypot')
    // Silently fail for bots
    await new Promise(resolve => setTimeout(resolve, 2000))
    showError.value = true
    errorMessage.value = 'Please try again'
    return
  }
  
  isLoading.value = true
  
  // Validate names
  const firstNameError = validateName(firstName.value.trim(), 'First name')
  if (firstNameError) {
    showError.value = true
    errorMessage.value = firstNameError
    isLoading.value = false
    return
  }
  
  const lastNameError = validateName(lastName.value.trim(), 'Last name')
  if (lastNameError) {
    showError.value = true
    errorMessage.value = lastNameError
    isLoading.value = false
    return
  }
  
  // Validate password
  const passwordError = validatePassword(password.value)
  if (passwordError) {
    showError.value = true
    errorMessage.value = passwordError
    isLoading.value = false
    return
  }
  
  // Security: Add timing protection
  const startTime = Date.now()
  
  // Attempt to sign up with Supabase
  const result = await accountStore.signUp(
    email.value.toLowerCase().trim(),
    password.value,
    {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      marketing: stayUpToDate.value
    }
  )
  
  // Security: Ensure minimum response time
  const elapsed = Date.now() - startTime
  if (elapsed < 1500) {
    await new Promise(resolve => setTimeout(resolve, 1500 - elapsed))
  }
  
  if (result.success) {
    // Reset signup attempts on success
    signupAttempts.value = 0
    localStorage.removeItem('signup_attempts')
    localStorage.removeItem('last_signup_attempt')
    
    if (result.needsVerification) {
      showSuccess.value = true
    }
    // If no verification needed, user will be logged in automatically
  } else {
    // Track failed attempts
    signupAttempts.value++
    lastSignupAttempt.value = Date.now()
    localStorage.setItem('signup_attempts', signupAttempts.value.toString())
    localStorage.setItem('last_signup_attempt', lastSignupAttempt.value.toString())
    
    showError.value = true
    // Map Supabase errors to user-friendly messages
    switch (result.error) {
      case 'User already registered':
      case 'Email address already in use':
        errorMessage.value = 'An account with this email already exists'
        break
      case 'Password should be at least 6 characters':
        errorMessage.value = 'Password must be at least 12 characters long'
        break
      case 'Invalid email':
        errorMessage.value = 'Please enter a valid email address'
        break
      case 'Signup is disabled':
        errorMessage.value = 'Account creation is temporarily disabled'
        break
      default:
        errorMessage.value = 'Account creation failed. Please try again'
    }
  }
  
  isLoading.value = false
}

// Security: Clear sensitive data on component unmount
onMounted(() => {
  return () => {
    password.value = ''
    honeypot.value = ''
  }
})
</script>

<template>
  <ul class="form">
    <transition name="auth-fade" mode="out-in">
      <li v-if="!showSuccess" key="signup-title">
        <h1>Create your account</h1>
      </li>
      <li v-else key="success-title">
        <h1>Check your email</h1>
      </li>
    </transition>
    
    <transition name="auth-fade" mode="out-in">
      <div v-if="!showSuccess" key="signup-form" class="form-content">
        <!-- Security: Honeypot field (hidden from users) -->
        <input 
          v-model="honeypot" 
          type="text" 
          style="position: absolute; left: -9999px; opacity: 0;" 
          tabindex="-1" 
          autocomplete="off"
        />
        
        <InputAuth 
          placeholder="First name" 
          v-model="firstName"
          :disabled="isLoading"
          autocomplete="given-name"
        />
        <InputAuth 
          placeholder="Last name" 
          v-model="lastName"
          :disabled="isLoading"
          autocomplete="family-name"
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
          autocomplete="new-password"
        />
        
        <!-- Password strength indicator -->
        <div v-if="password.length > 0" class="password-strength">
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              :class="passwordStrengthClass"
              :style="{ width: passwordStrengthPercent + '%' }"
            ></div>
          </div>
          <p class="strength-text">{{ passwordStrengthText }}</p>
        </div>
        
        <ul class="list">
          <InputBoolean 
            label="Accept terms and conditions"
            details="By creating an account, you agree to our terms of service and privacy policy. You can review these documents at any time."
            v-model="acceptTerms"
            :disabled="isLoading"
          />
          
          <InputBoolean 
            label="Stay up to date"
            details="Receive news, updates, and product announcements about Lands.app. You can unsubscribe at any time from your account settings."
            v-model="stayUpToDate"
            :disabled="isLoading"
          />
        </ul>
        
        <ButtonAuth 
          :label="isLoading ? 'Creating account...' : 'Continue'"
          @click="handleSignUp"
          :disabled="!isFormValid || isLoading"
        />
        
        <AuthError v-if="showError" :message="errorMessage" />
      </div>
      
      <div v-else key="success-message" class="success-message">
        <p>Please check your email and click the verification link to complete your account setup.</p>
        <p class="note">The verification link will expire in 24 hours.</p>
      </div>
    </transition>
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
  }
  
  .list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
    margin: var(--space-md) 0;
  }
  
  .success-message {
    text-align: center;
    
    p {
      line-height: 1.5;
      color: var(--light);
      margin-bottom: var(--space-sm);
    }
    
    .note {
      font-size: var(--font-sm);
      color: var(--details);
      margin-bottom: 0;
    }
  }
  
  .password-strength {
    margin-top: calc(var(--space-rg) * -0.5);
    
    .strength-bar {
      width: 100%;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: var(--space-xs);
    }
    
    .strength-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
      
      &.weak {
        background: var(--alert-border);
      }
      
      &.medium {
        background: var(--warning-border);
      }
      
      &.strong {
        background: var(--success-border);
      }
    }
    
    .strength-text {
      font-size: var(--font-sm);
      font-family: 'mono';
      text-transform: uppercase;
      color: var(--details);
      margin: 0;
    }
  }
}

/* Transition animations */
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