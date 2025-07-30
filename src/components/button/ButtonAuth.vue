<script setup>
import { ref } from 'vue'

const props = defineProps({
  label: String
})

const emit = defineEmits(['click'])

const isProcessing = ref(false)
const lastClickTime = ref(0)

function handleClick(e) {
  const now = Date.now()
  
  if (now - lastClickTime.value < 1000) {
    e.preventDefault()
    return
  }
  
  if (isProcessing.value) {
    e.preventDefault()
    return
  }
  
  isProcessing.value = true
  lastClickTime.value = now
  
  emit('click')
  
  setTimeout(() => {
    isProcessing.value = false
  }, 2000)
}
</script>

<template>
  <button
    @click="handleClick"
    :disabled="isProcessing"
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
}
</style>