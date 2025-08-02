<template>
  <li class="input">
    <input
      :placeholder="placeholder"
      type="text"
      v-model="model"
      :maxlength="maxLength"
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
const INPUT_RATE_LIMIT = 10 // Max 10 inputs per second
const RATE_WINDOW = 1000 // 1 second

const props = defineProps({
  placeholder: String,
  maxLength: {
    type: Number,
    default: 50
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  required: {
    type: Boolean,
    default: false
  }
})

// Enhanced sanitization for names with international support
function sanitizeName(value) {
  if (typeof value !== 'string') return ''
  
  // Remove dangerous characters but preserve international characters
  const cleaned = value
    // Remove HTML tags and script injections
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // FIXED: Allow letters, spaces, hyphens, apostrophes, and periods
    // This regex now properly allows spaces and hyphens
    .replace(/[^a-zA-ZÀ-ÿĀ-žА-я\u4e00-\u9fff\u0100-\u017f\u0180-\u024f\u1e00-\u1eff\s\-'.]/g, '')
    // Normalize multiple spaces to single space
    .replace(/\s{2,}/g, ' ')
    // Remove leading/trailing whitespace only at the end
    .trim()
    // Enforce max length
    .slice(0, props.maxLength)
  
  return cleaned
}

// Rate limiting check
function checkRateLimit() {
  const now = Date.now()
  
  // Reset count if window expired
  if (now - lastInputTime.value > RATE_WINDOW) {
    inputCount.value = 0
  }
  
  inputCount.value++
  lastInputTime.value = now
  
  return inputCount.value <= INPUT_RATE_LIMIT
}

function handleInput(e) {
  // Rate limiting
  if (!checkRateLimit()) {
    e.preventDefault()
    return
  }
  
  // Don't sanitize during typing - let the user type naturally
  const currentValue = e.target.value
  
  // Only do basic safety checks (remove dangerous scripts)
  const basicClean = currentValue
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
  
  // Update model with minimally processed value
  model.value = basicClean
}

function handlePaste(e) {
  e.preventDefault()
  const pastedText = (e.clipboardData || window.clipboardData).getData('text')
  const sanitized = sanitizeName(pastedText)
  model.value = sanitized
  
  // Update the input element
  nextTick(() => {
    if (inputElement.value) {
      inputElement.value.value = sanitized
    }
  })
}

function handleBlur() {
  // Apply full sanitization only when user finishes typing (on blur)
  if (model.value && typeof model.value === 'string') {
    const sanitized = sanitizeName(model.value)
    if (sanitized !== model.value) {
      model.value = sanitized
    }
  }
}

function handleFocus() {
  // Simple focus handling without validation messages
}

// Watch model for external changes
watch(model, (newValue) => {
  // Only sanitize if the change came from outside (not user typing)
  if (newValue && typeof newValue === 'string') {
    // Don't interfere with user's natural typing
    // Only do basic safety sanitization
    const basicClean = newValue
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
    
    if (basicClean !== newValue) {
      model.value = basicClean
    }
  }
})
</script>
