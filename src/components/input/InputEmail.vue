<template>
  <li class="input">
    <input
      :placeholder="placeholder"
      type="email"
      v-model="model"
      :maxlength="254"
      :disabled="disabled"
      :autocomplete="autocomplete"
      @input="handleInput"
      @paste="handlePaste"
      @blur="handleBlur"
      @focus="handleFocus"
      ref="inputElement"
    />
  </li>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const model = defineModel()
const inputElement = ref(null)

// Rate limiting
const lastInputTime = ref(0)
const inputCount = ref(0)
const INPUT_RATE_LIMIT = 5
const RATE_WINDOW = 1000

const props = defineProps({
  placeholder: String,
  disabled: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: 'email'
  },
  required: {
    type: Boolean,
    default: false
  }
})

// Common disposable email domains (partial list)
const DISPOSABLE_DOMAINS = [
  '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
  'mailinator.com', 'throwaway.email', 'temp-mail.org',
  'yopmail.com', 'getairmail.com', 'maildrop.cc', 'trashmail.com'
]

function sanitizeEmail(value) {
  if (typeof value !== 'string') return ''
  
  return value
    // Remove dangerous characters
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .toLowerCase()
    .trim()
    .slice(0, 254)
}

function checkRateLimit() {
  const now = Date.now()
  
  if (now - lastInputTime.value > RATE_WINDOW) {
    inputCount.value = 0
  }
  
  inputCount.value++
  lastInputTime.value = now
  
  return inputCount.value <= INPUT_RATE_LIMIT
}

function handleInput(e) {
  if (!checkRateLimit()) {
    e.preventDefault()
    return
  }
  
  const sanitized = sanitizeEmail(e.target.value)
  
  if (sanitized !== e.target.value) {
    model.value = sanitized
    nextTick(() => {
      e.target.value = sanitized
    })
  }
}

function handlePaste(e) {
  e.preventDefault()
  const pastedText = (e.clipboardData || window.clipboardData).getData('text')
  const sanitized = sanitizeEmail(pastedText)
  
  model.value = sanitized
}

function handleBlur() {
  // Simple blur handling without validation messages
}

function handleFocus() {
  // Simple focus handling without validation messages
}

watch(model, (newValue) => {
  if (newValue && typeof newValue === 'string') {
    const sanitized = sanitizeEmail(newValue)
    if (sanitized !== newValue) {
      model.value = sanitized
    }
  }
})
</script>