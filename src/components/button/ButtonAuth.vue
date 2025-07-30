<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const isProcessing = ref(false)
const lastClickTime = ref(0)
const minInterval = 2000 

function handleClick(e) {
  const now = Date.now()
  
  if (now - lastClickTime.value < minInterval) {
    e.preventDefault()
    return
  }
  
  if (isProcessing.value) {
    e.preventDefault()
    return
  }
  
  if (!e.isTrusted) {
    e.preventDefault()
    console.warn('Untrusted click blocked')
    return
  }
  
  isProcessing.value = true
  lastClickTime.value = now
  
  emit('click', e)
  
  setTimeout(() => {
    isProcessing.value = false
  }, 2000)
}

function handleKeydown(e) {
  if ((e.key === 'Enter' || e.key === ' ') && !isProcessing.value && !props.disabled) {
    e.preventDefault()
    handleClick(e)
  }
}
</script>

<template>
  <button
    @click="handleClick"
    @keydown="handleKeydown"
    :disabled="isProcessing || disabled"
    :aria-busy="isProcessing"
    type="button"
  >
    {{ isProcessing ? 'Processing...' : label }}
  </button>
</template>

<style scoped>
button {
  background: var(--light);
  color: var(--dark);
  white-space: nowrap;
  padding: var(--space-md);
  line-height: 2;
  transition: background-color var(--transition-smooth);
  
  &:hover:not(:disabled) {
    background: var(--light-hover);
  }
  
  &:disabled {
    background: var(--light-disabled);
    cursor: not-allowed;
  }
  
  &:focus {
    outline: 2px solid var(--light);
    outline-offset: 2px;
  }
}
</style>