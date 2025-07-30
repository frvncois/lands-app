<template>
 <li>
   <label v-if="label">{{ label }}</label>
   <input
     :placeholder="placeholder"
     :type="type"
     v-model="model"
     :maxlength="maxLength"
     @input="handleInput"
     @paste="handlePaste"
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
import { computed, watch } from 'vue'

const model = defineModel()

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
    default: 50
  }
})

const showStatus = computed(() => {
  return props.statusType && props.statusMessage
})

// Sanitize name input
function sanitizeName(value) {
  if (typeof value !== 'string') return ''
  
  return value
    // Remove dangerous characters
    .replace(/[<>'"&]/g, '')
    // Remove script-related content
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Allow only letters, spaces, hyphens, apostrophes
    .replace(/[^a-zA-Z\s\-']/g, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Trim and limit length
    .trim()
    .slice(0, props.maxLength)
}

function handleInput(e) {
  const sanitized = sanitizeName(e.target.value)
  if (sanitized !== e.target.value) {
    model.value = sanitized
    e.target.value = sanitized
  }
}

function handlePaste(e) {
  e.preventDefault()
  const pastedText = (e.clipboardData || window.clipboardData).getData('text')
  const sanitized = sanitizeName(pastedText)
  model.value = sanitized
}

// Watch model changes for sanitization
watch(model, (newValue) => {
  if (newValue && typeof newValue === 'string') {
    const sanitized = sanitizeName(newValue)
    if (sanitized !== newValue) {
      model.value = sanitized
    }
  }
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