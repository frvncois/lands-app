<template>
  <li>
    <label v-if="label">{{ label }}</label>
    <input
      :placeholder="placeholder"
      :type="type"
      :value="model"
      :maxlength="maxLength"
      @input="handleInput"
      @paste="handlePaste"
      @blur="handleBlur"
    />
    <div v-if="showStatus" class="status">
      <div v-if="statusType === 'loading'" class="loading">
        ⏳ {{ statusMessage || 'Checking...' }}
      </div>
      <div v-else-if="statusType === 'success'" class="success">
        {{ statusMessage }}
      </div>
      <div v-else-if="statusType === 'error'" class="error">
        {{ statusMessage }}
      </div>
      <div v-else-if="statusType === 'warning'" class="warning">
        {{ statusMessage }}
      </div>
    </div>
    <p v-if="details && !showStatus">{{ details }}</p>
  </li>
</template>

<script setup>
import { computed, watch, ref, nextTick } from 'vue'

const model = defineModel()
const emit = defineEmits(['security-warning', 'validation-error'])

const props = defineProps({
  label: String,
  details: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  statusType: {
    type: String,
    validator: (value) => ['loading', 'success', 'error', 'warning'].includes(value)
  },
  statusMessage: String,
  maxLength: {
    type: Number,
    default: 500
  },
  allowNumbers: {
    type: Boolean,
    default: true
  },
  allowSpecialChars: {
    type: Boolean,
    default: true
  },
  strictMode: {
    type: Boolean,
    default: false
  }
})

const showStatus = computed(() => {
  return props.statusType && props.statusMessage
})

// Security patterns to detect and neutralize
const securityPatterns = {
  // XSS attempts
  scriptTags: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  htmlTags: /<[^>]*>/g,
  javascriptProtocol: /javascript:/gi,
  vbscriptProtocol: /vbscript:/gi,
  dataUri: /data:(?:text\/html|application\/javascript)/gi,
  onEvents: /on\w+\s*=/gi,
  
  // SQL injection attempts
  sqlKeywords: /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b|\bexec\b|\bexecute\b)/gi,
  sqlComments: /(--|\*\/|\*)/g,
  
  // Path traversal
  pathTraversal: /\.\.\/|\.\.\\|\.\.\//g,
  
  // Command injection
  commandChars: /[;&|`$(){}[\]]/g
}

// Sanitize input for security while preserving user intent
function sanitizeInput(value) {
  if (typeof value !== 'string') return ''
  
  let sanitized = value
  let warnings = []
  
  // Only block the most dangerous security threats
  if (securityPatterns.scriptTags.test(sanitized)) {
    warnings.push('Script tags detected and removed')
    sanitized = sanitized.replace(securityPatterns.scriptTags, '')
  }
  
  if (securityPatterns.javascriptProtocol.test(sanitized)) {
    warnings.push('JavaScript protocol detected and removed')
    sanitized = sanitized.replace(securityPatterns.javascriptProtocol, '')
  }
  
  if (securityPatterns.vbscriptProtocol.test(sanitized)) {
    warnings.push('VBScript protocol detected and removed')
    sanitized = sanitized.replace(securityPatterns.vbscriptProtocol, '')
  }
  
  if (securityPatterns.onEvents.test(sanitized)) {
    warnings.push('Event handlers detected and removed')
    sanitized = sanitized.replace(securityPatterns.onEvents, '')
  }
  
  // Only in strict mode, do more aggressive filtering
  if (props.strictMode) {
    if (securityPatterns.htmlTags.test(sanitized)) {
      warnings.push('HTML tags detected and removed')
      sanitized = sanitized.replace(securityPatterns.htmlTags, '')
    }
    
    if (securityPatterns.sqlKeywords.test(sanitized)) {
      warnings.push('SQL keywords detected and neutralized')
      sanitized = sanitized.replace(securityPatterns.sqlKeywords, (match) => 
        match.replace(/[aeiou]/gi, '*')
      )
    }
    
    if (securityPatterns.pathTraversal.test(sanitized)) {
      warnings.push('Path traversal attempt detected and removed')
      sanitized = sanitized.replace(securityPatterns.pathTraversal, '')
    }
    
    if (securityPatterns.commandChars.test(sanitized)) {
      warnings.push('Command characters detected and removed')
      sanitized = sanitized.replace(securityPatterns.commandChars, '')
    }
    
    // Character filtering based on props (only in strict mode)
    if (!props.allowNumbers) {
      sanitized = sanitized.replace(/[0-9]/g, '')
    }
    
    if (!props.allowSpecialChars) {
      // Keep letters, numbers, spaces, and basic punctuation
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-'.,!?]/g, '')
    }
  }
  
  // Basic length limiting and whitespace cleanup
  sanitized = sanitized
    .replace(/\s{3,}/g, '  ') // Replace 3+ spaces with 2 spaces
    .replace(/[\t\r\n\f\v]/g, ' ') // Convert tabs/newlines to spaces
    .trim() // Remove leading/trailing whitespace
    .slice(0, props.maxLength)
  
  // Emit warnings if any security issues were found
  if (warnings.length > 0) {
    emit('security-warning', {
      warnings,
      original: value,
      sanitized
    })
    console.warn('🛡️ Security threats detected and neutralized:', warnings)
  }
  
  return sanitized
}

// Advanced validation for specific input types
function validateInput(value, type) {
  const validationRules = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/.+/,
    phone: /^[\+]?[\d\s\-\(\)\.]{7,}$/,
    name: /^[a-zA-Z\s\-']{1,}$/,
    username: /^[a-zA-Z0-9_\-]{3,}$/,
    password: /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/
  }
  
  if (validationRules[type] && value) {
    return validationRules[type].test(value)
  }
  
  return true
}

// Handle real-time input - DON'T sanitize during typing!
function handleInput(e) {
  const rawValue = e.target.value
  
  // Update the model directly - this sends data to parent/store
  model.value = rawValue
  
  // Only validate format if specified (don't block input)
  if (props.type && rawValue && !validateInput(rawValue, props.type)) {
    emit('validation-error', {
      type: props.type,
      value: rawValue,
      message: `Invalid ${props.type} format`
    })
  }
}

// Handle paste events with enhanced security
function handlePaste(e) {
  e.preventDefault()
  
  try {
    const pastedText = (e.clipboardData || window.clipboardData).getData('text')
    
    // Extra security check for paste content
    if (pastedText.length > props.maxLength * 2) {
      emit('security-warning', {
        warnings: ['Unusually large paste content detected'],
        original: pastedText,
        sanitized: pastedText.slice(0, props.maxLength)
      })
    }
    
    const sanitized = sanitizeInput(pastedText)
    model.value = sanitized
    
  } catch (error) {
    console.error('❌ Error handling paste:', error)
    emit('validation-error', {
      type: 'paste',
      message: 'Failed to process pasted content'
    })
  }
}

// Handle blur for final validation and sanitization
function handleBlur(e) {
  const value = e.target.value
  
  // NOW do the sanitization when user is done typing
  const sanitized = sanitizeInput(value)
  
  if (sanitized !== value) {
    model.value = sanitized
    e.target.value = sanitized
  }
  
  if (value && props.type) {
    const isValid = validateInput(sanitized, props.type)
    if (!isValid) {
      emit('validation-error', {
        type: props.type,
        value: sanitized,
        message: `Please enter a valid ${props.type}`
      })
    }
  }
}

// Watch model changes for external updates (but don't interfere with typing)
watch(model, (newValue) => {
  // Only sanitize if the change came from outside (parent component)
  // Don't sanitize during user typing
  if (newValue && typeof newValue === 'string') {
    // Let the natural v-model flow work without interference
    return
  }
}, { flush: 'post' })

// Utility function to check if input is safe for database
function isDatabaseSafe(value) {
  const dangerousPatterns = [
    securityPatterns.sqlKeywords,
    securityPatterns.scriptTags,
    securityPatterns.commandChars
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(value))
}

// Export utility for parent components
defineExpose({
  sanitizeInput,
  validateInput,
  isDatabaseSafe
})
</script>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: stretch;
  
  input {
    flex-grow: 1;
    display: flex;
  }
  
  p {
    font-size: var(--font-sm);
    font-family: 'mono';
    text-transform: uppercase;
    text-align: right;
    color: var(--details);
  }
}

.status {
  font-size: var(--font-sm);
  
  & div {
    border-radius: var(--radius-md);
    padding: var(--radius-rg) var(--space-md);
  }
  
  > .loading {
    background: #f0f9ff;
    color: #0284c7;
    border: 1px solid #bae6fd;
  }
  
  > .success {
    background: var(--success);
    color: var(--success-txt);
    border: 1px solid var(--success-border);
  }
  
  > .error {
    background: var(--alert);
    color: var(--alert-txt);
    border: 1px solid var(--alert-border);
  }
  
  > .warning {
    background: var(--warning);
    color: var(--warning-txt);
    border: 1px solid var(--warning-border);
  }
}
</style>