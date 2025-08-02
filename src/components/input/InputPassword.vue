<template>
  <li class="input">
    <label v-if="label">{{ label }}</label>
      <input
        :placeholder="placeholder"
        :type="showPassword ? 'text' : 'password'"
        v-model="model"
        :autocomplete="autocomplete"
        :maxlength="256"
        :disabled="disabled"
        spellcheck="false"
        autocorrect="off"
        autocapitalize="off"
        @input="handleInput"
        @paste="handlePaste"
        @focus="handleFocus"
        @blur="handleBlur"
        ref="inputElement"
      />
      <button
        type="button"
        class="toggle"
        @click="togglePassword"
        @mousedown="preventSelection"
        :tabindex="-1"
        :disabled="disabled"
      >
        <RevealIcon v-if="!showPassword" />
        <HideIcon v-if="showPassword" />
      </button>
    </li>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import HideIcon from '@/assets/icons/HideIcon.vue'
import RevealIcon from '@/assets/icons/RevealIcon.vue'

const model = defineModel()
const inputElement = ref(null)
const showPassword = ref(false)
const showValidation = ref(false)
const validationMessage = ref('')
const validationClass = ref('')
const hidePasswordTimer = ref(null)

const props = defineProps({
  placeholder: String,
  label: String,
  autocomplete: {
    type: String,
    default: 'new-password'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showRequirements: {
    type: Boolean,
    default: true
  },
  showStrength: {
    type: Boolean,
    default: true
  },
  required: {
    type: Boolean,
    default: false
  }
})

// Common weak passwords list (subset)
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'qwerty123', '123123', 'admin123', 'root', 'toor', 'pass', 'test'
]

// Password requirements computed
const requirements = computed(() => {
  const pwd = model.value || ''
  return {
    length: pwd.length >= 12,
    lowercase: /[a-z]/.test(pwd),
    uppercase: /[A-Z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(pwd),
    noCommon: !COMMON_PASSWORDS.some(common => 
      pwd.toLowerCase().includes(common) || common.includes(pwd.toLowerCase())
    )
  }
})

// All requirements met
const allRequirementsMet = computed(() => {
  return Object.values(requirements.value).every(req => req)
})

// Password strength calculation
const strengthScore = computed(() => {
  const pwd = model.value || ''
  if (!pwd) return 0
  
  let score = 0
  
  // Length scoring
  if (pwd.length >= 8) score += 1
  if (pwd.length >= 12) score += 1
  if (pwd.length >= 16) score += 1
  if (pwd.length >= 20) score += 1
  
  // Character type scoring
  if (/[a-z]/.test(pwd)) score += 1
  if (/[A-Z]/.test(pwd)) score += 1
  if (/\d/.test(pwd)) score += 1
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(pwd)) score += 1
  
  // Complexity scoring
  if (pwd.length > 0 && new Set(pwd).size > pwd.length * 0.6) score += 1 // Character diversity
  if (!/(.)\1{2,}/.test(pwd)) score += 1 // No repeated characters
  if (!COMMON_PASSWORDS.some(common => pwd.toLowerCase().includes(common))) score += 1
  
  return Math.min(score, 10)
})

const strengthPercent = computed(() => (strengthScore.value / 10) * 100)

const strengthClass = computed(() => {
  if (strengthScore.value <= 3) return 'weak'
  if (strengthScore.value <= 6) return 'medium'
  if (strengthScore.value <= 8) return 'strong'
  return 'very-strong'
})

const strengthText = computed(() => {
  if (strengthScore.value <= 3) return 'Weak password'
  if (strengthScore.value <= 6) return 'Medium password'
  if (strengthScore.value <= 8) return 'Strong password'
  return 'Very strong password'
})

function sanitizePassword(value) {
  if (typeof value !== 'string') return ''
  
  return value
    // Remove HTML tags and dangerous patterns
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remove control characters but keep printable ASCII and extended
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Limit length
    .slice(0, 256)
}

function validatePassword(password) {
  if (props.required && (!password || password.trim() === '')) {
    return { valid: false, message: 'Password is required', class: 'error' }
  }
  
  if (!password) {
    return { valid: true, message: '', class: '' }
  }
  
  if (password.length < 12) {
    return { valid: false, message: 'Password must be at least 12 characters', class: 'error' }
  }
  
  if (!allRequirementsMet.value) {
    return { valid: false, message: 'Password does not meet all requirements', class: 'error' }
  }
  
  // Check for suspicious patterns
  if (/^(.)\1+$/.test(password)) {
    return { valid: false, message: 'Password cannot be all the same character', class: 'error' }
  }
  
  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde)/i.test(password)) {
    return { valid: false, message: 'Password cannot contain obvious sequences', class: 'error' }
  }
  
  return { valid: true, message: strengthText.value, class: 'success' }
}

function handleInput(e) {
  const sanitized = sanitizePassword(e.target.value)
  
  if (sanitized !== e.target.value) {
    model.value = sanitized
    e.target.value = sanitized
  }
  
  // Show validation for real-time feedback
  const validation = validatePassword(sanitized)
  showValidationMessage(validation.message, validation.class)
}

function handlePaste(e) {
  // Allow paste for password managers
  const pastedText = (e.clipboardData || window.clipboardData).getData('text')
  const sanitized = sanitizePassword(pastedText)
  
  if (sanitized !== pastedText) {
    e.preventDefault()
    model.value = sanitized
  }
}

function handleFocus() {
  if (validationClass.value === 'error') {
    showValidation.value = false
  }
}

function handleBlur() {
  if (model.value) {
    const validation = validatePassword(model.value)
    showValidationMessage(validation.message, validation.class)
  }
}

function showValidationMessage(message, className) {
  validationMessage.value = message
  validationClass.value = className
  showValidation.value = !!message
}

function togglePassword() {
  showPassword.value = !showPassword.value
  
  // Auto-hide password after 3 seconds for security
  if (showPassword.value) {
    clearTimeout(hidePasswordTimer.value)
    hidePasswordTimer.value = setTimeout(() => {
      showPassword.value = false
    }, 3000)
  } else {
    clearTimeout(hidePasswordTimer.value)
  }
}

function preventSelection(e) {
  e.preventDefault()
}

watch(model, (newValue) => {
  if (newValue && typeof newValue === 'string') {
    const sanitized = sanitizePassword(newValue)
    if (sanitized !== newValue) {
      model.value = sanitized
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  clearTimeout(hidePasswordTimer.value)
  // Clear password from memory
  if (model.value) {
    model.value = ''
  }
})
</script>

<style scoped>

.toggle {
  position: absolute;
  right: var(--space-md);
  cursor: pointer;
  background: none;
  border: none;
  padding: var(--space-xs);
  
  > svg {
    height: var(--height-md);
    color: var(--details);
    transition: color var(--transition-smooth);
    
    &:hover {
      color: var(--light);
    }
  }
}
</style>