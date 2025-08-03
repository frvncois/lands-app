<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import InputAuth from '@/components/input/InputAuth.vue'
import InputEmail from '@/components/input/InputEmail.vue'
import ButtonAuth from '@/components/button/ButtonAuth.vue'
import InputPassword from '@/components/input/InputPassword.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import AccountAuth from '@/components/alert/AccountAuth.vue'

const props = defineProps({
  userStore: {
    type: Object,
    required: true
  }
})

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
const alertMessage = ref('')
const alertType = ref('error')
const showSuccess = ref(false)

// Security: Honeypot field
const honeypot = ref('')

// Security tracking
const signupAttempts = ref(parseInt(sessionStorage.getItem('signup_attempts') || '0'))
const lastSignupAttempt = ref(parseInt(sessionStorage.getItem('last_signup_attempt') || '0'))

const MAX_ATTEMPTS = 3
const RATE_LIMIT_WINDOW = 300000 // 5 minutes

// Computed properties
const isFormValid = computed(() => {
  return firstName.value.trim() !== '' &&
         lastName.value.trim() !== '' &&
         email.value.trim() !== '' &&
         password.value.trim() !== '' &&
         acceptTerms.value === true &&
         honeypot.value === '' &&
         !isRateLimited.value
})

const isRateLimited = computed(() => {
  const now = Date.now()
  const timeSinceLastAttempt = now - lastSignupAttempt.value
  
  return signupAttempts.value >= MAX_ATTEMPTS && 
         timeSinceLastAttempt < RATE_LIMIT_WINDOW
})

const rateLimitTimeRemaining = computed(() => {
  if (!isRateLimited.value) return 0
  const now = Date.now()
  const timeSinceLastAttempt = now - lastSignupAttempt.value
  return Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastAttempt) / 1000 / 60)
})

// Password strength
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

// Methods
function showAlert(type, message) {
  alertType.value = type
  alertMessage.value = message
}

function clearAlert() {
  alertMessage.value = ''
}

function validateName(name, fieldName) {
  if (!name || name.trim() === '') {
    return `${fieldName} is required`
  }
  
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters`
  }
  
  if (name.length > 50) {
    return `${fieldName} must be less than 50 characters`
  }
  
  if (!/^[a-zA-ZÀ-ÿĀ-žА-я\u4e00-\u9fff\u0100-\u017f\u0180-\u024f\u1e00-\u1eff\s\-'.]+$/.test(name)) {
    return `${fieldName} contains invalid characters`
  }
  
  return null
}

function validatePassword(password) {
  if (password.length < 12) {
    return 'Password must be at least 12 characters long'
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/.test(password)) {
    return 'Password must contain uppercase, lowercase, number, and special character'
  }
  
  if (/(.)\1{3,}/.test(password)) {
    return 'Password cannot have 4 or more repeated characters'
  }
  
  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde)/i.test(password)) {
    return 'Password cannot contain obvious sequences'
  }
  
  return null
}

function trackSignupAttempt() {
  signupAttempts.value++
  lastSignupAttempt.value = Date.now()
  
  sessionStorage.setItem('signup_attempts', signupAttempts.value.toString())
  sessionStorage.setItem('last_signup_attempt', lastSignupAttempt.value.toString())
}

function resetSignupAttempts() {
  signupAttempts.value = 0
  sessionStorage.removeItem('signup_attempts')
  sessionStorage.removeItem('last_signup_attempt')
}

async function handleSignup() {
  clearAlert()
  
  if (isRateLimited.value) {
    showAlert('error', `Too many attempts. Try again in ${rateLimitTimeRemaining.value} minutes`)
    return
  }
  
  if (honeypot.value !== '') {
    console.warn('Bot detected via honeypot')
    return
  }
  
  const firstNameError = validateName(firstName.value.trim(), 'First name')
  if (firstNameError) {
    showAlert('error', firstNameError)
    return
  }
  
  const lastNameError = validateName(lastName.value.trim(), 'Last name')
  if (lastNameError) {
    showAlert('error', lastNameError)
    return
  }
  
  const passwordError = validatePassword(password.value)
  if (passwordError) {
    showAlert('error', passwordError)
    return
  }
  
  if (!acceptTerms.value) {
    showAlert('error', 'Please accept the terms and conditions')
    return
  }
  
  isLoading.value = true
  showAlert('updating', 'Creating your account...')
  
  try {
    const startTime = Date.now()
    
    const result = await props.userStore.signUp(
      email.value.toLowerCase().trim(),
      password.value,
      {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        marketing: stayUpToDate.value
      }
    )
    
    const elapsed = Date.now() - startTime
    if (elapsed < 1500) {
      await new Promise(resolve => setTimeout(resolve, 1500 - elapsed))
    }
    
    if (result.success) {
      resetSignupAttempts()
      showSuccess.value = true
      showAlert('success', 'Account created successfully')
    } else {
      trackSignupAttempt()
      
      let errorMessage = 'Account creation failed'
      
      switch (result.error) {
        case 'User already registered':
        case 'Email address already in use':
          errorMessage = 'An account with this email already exists'
          break
        case 'Password should be at least 6 characters':
          errorMessage = 'Password must be at least 12 characters long'
          break
        case 'Invalid email':
          errorMessage = 'Please enter a valid email address'
          break
        case 'Signup is disabled':
          errorMessage = 'Account creation is temporarily disabled'
          break
        default:
          errorMessage = 'Account creation failed. Please try again'
      }
      
      showAlert('error', errorMessage)
    }
  } catch (err) {
    trackSignupAttempt()
    console.error('Signup error:', err)
    showAlert('error', 'Connection error. Please try again')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (isRateLimited.value) {
    showAlert('error', `Too many attempts. Try again in ${rateLimitTimeRemaining.value} minutes`)
  }
})

onUnmounted(() => {
  password.value = ''
  honeypot.value = ''
})
</script>

<template>
  <ul class="list">
    <transition name="auth-fade" mode="out-in">
      <li v-if="!showSuccess">
        <h1>Create your account</h1>
      </li>
      <li v-else>
        <h1>Check your email</h1>
      </li>
    </transition>
    
    <transition name="auth-fade" mode="out-in">
      <ul v-if="!showSuccess" key="signup-form" class="form">
          <AccountAuth
            v-if="alertMessage"
            :type="alertType"
            :message="alertMessage"
          />
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
          
          <li v-if="password.length > 0" class="strength">
            <div class="bar">
              <div 
                class="fill" 
                :class="passwordStrengthClass"
                :style="{ width: passwordStrengthPercent + '%' }"
              ></div>
            </div>
            <p class="text">{{ passwordStrengthText }}</p>
          </li>
        
        <ul class="options">
          <InputBoolean 
            label="Accept terms and conditions"
            details="By creating an account, you agree to our terms of service and privacy policy."
            v-model="acceptTerms"
            :disabled="isLoading"
          />
          
          <InputBoolean 
            label="Stay up to date"
            details="Receive news, updates, and product announcements about Lands.app."
            v-model="stayUpToDate"
            :disabled="isLoading"
          />
        </ul>
        
        <ButtonAuth 
          :label="isLoading ? 'Creating account...' : 'Create account'"
          :buttonStyle="isFormValid && !isLoading ? 'light' : 'disabled'"
          @click="handleSignup"
        />
      </ul>
      
      <ul v-else key="success-message" class="list">
        <AccountAuth
          type="success"
          message="Account created successfully"
        />
        <p class="details">
          Thank you for joining Lands! We've sent you an email with instructions to verify your account. 
          Please check your inbox and follow the link in the email.
        </p>
      </ul>
    </transition>
  </ul>
</template>

<style scoped>
li.strength {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

li.strength > .bar {
  height: 4px;
  background: var(--input-border);
  border-radius: 2px;
  overflow: hidden;
}

li.strength > .bar > .fill {
  height: 100%;
  transition: width var(--transition-smooth), background-color var(--transition-smooth);
}

li.strength > .bar > .fill.weak {
  background: var(--error-border);
}

li.strength > .bar > .fill.medium {
  background: var(--warning-border);
}

li.strength > .bar > .fill.strong {
  background: var(--success-border);
}

li.strength > .text {
  font-size: var(--font-sm);
  font-family: 'mono';
  text-transform: uppercase;
  color: var(--details);
  margin: 0;
}

ul.options {
  margin: var(--space-lg) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

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
