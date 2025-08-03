<template>
  <li>
    <label v-if="label">{{ label }}</label>
    <input
      :placeholder="placeholder"
      :type="type"
      v-model="model"
      :maxlength="maxLength"
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
import { computed } from 'vue'

// Use defineModel for proper Vue 3 two-way binding
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
    default: 500 // Increased from 50 to allow longer text
  }
})

const showStatus = computed(() => {
  return props.statusType && props.statusMessage
})

// NO SANITIZATION - Let users type freely!
// Only basic XSS protection on the backend
</script>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: stretch;
}

.status {
  font-size: var(--font-sm);
  
  & div {
    border-radius: var(--radius-md);
    padding: var(--space-sm);
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