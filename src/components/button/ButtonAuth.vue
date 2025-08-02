<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  label: String,
  after: String,
  buttonStyle: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'dark', 'remove', 'disabled', 'none', 'inactive'].includes(value)
  }
})

const emit = defineEmits(['click'])

const isProcessing = ref(false)
const clickCount = ref(0)
const lastClickTime = ref(0)
const sessionClickCount = ref(0)
const userInteractionDetected = ref(false)

const MIN_CLICK_INTERVAL = 1000 
const MAX_CLICKS_PER_SESSION = 50 
const MAX_CLICKS_PER_MINUTE = 10 
const PROCESSING_TIMEOUT = 10000 

const clickTimestamps = ref([])

const afterContent = computed(() => props.after ? `"${props.after}"` : '""')

const isSecurelyDisabled = computed(() => {
  return props.buttonStyle === 'inactive' || 
         props.buttonStyle === 'disabled' ||
         isProcessing.value || 
         sessionClickCount.value >= MAX_CLICKS_PER_SESSION
})

const displayLabel = computed(() => {
  if (isProcessing.value) return 'Processing...'
  if (sessionClickCount.value >= MAX_CLICKS_PER_SESSION) return 'Limit reached'
  return props.label
})

function detectUserInteraction() {
  userInteractionDetected.value = true
}

function isValidClick(event) {
  const now = Date.now()
  
  if (!event.isTrusted) {
    console.warn('🚨 Untrusted click event blocked')
    return false
  }
  
  if (now - lastClickTime.value < MIN_CLICK_INTERVAL) {
    console.warn('🚨 Click too fast, blocked')
    return false
  }
  
  const oneMinuteAgo = now - 60000
  clickTimestamps.value = clickTimestamps.value.filter(timestamp => timestamp > oneMinuteAgo)
  
  if (clickTimestamps.value.length >= MAX_CLICKS_PER_MINUTE) {
    console.warn('🚨 Rate limit exceeded')
    return false
  }
  
  if (sessionClickCount.value >= MAX_CLICKS_PER_SESSION) {
    console.warn('🚨 Session click limit exceeded')
    return false
  }
  
  if (!userInteractionDetected.value) {
    console.warn('🚨 No user interaction detected')
    return false
  }
  
  return true
}

function handleClick(event) {
  if (isSecurelyDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  
  if (!isValidClick(event)) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  
  const now = Date.now()
  lastClickTime.value = now
  clickTimestamps.value.push(now)
  sessionClickCount.value++
  clickCount.value++
  
  isProcessing.value = true
  
  emit('click', event)
  
  setTimeout(() => {
    isProcessing.value = false
  }, PROCESSING_TIMEOUT)
}

function handleKeydown(event) {
  if ((event.key === 'Enter' || event.key === ' ') && !isSecurelyDisabled.value) {
    event.preventDefault()
    handleClick(event)
  }
}

function handleMouseDown() {
  detectUserInteraction()
}

function handleMouseMove() {
  detectUserInteraction()
}

function resetProcessing() {
  isProcessing.value = false
}

defineExpose({ resetProcessing })

onMounted(() => {
  document.addEventListener('mousemove', detectUserInteraction, { passive: true })
  document.addEventListener('keydown', detectUserInteraction, { passive: true })
  document.addEventListener('scroll', detectUserInteraction, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', detectUserInteraction)
  document.removeEventListener('keydown', detectUserInteraction)
  document.removeEventListener('scroll', detectUserInteraction)
})
</script>

<template>
  <button
    v-if="props.label"
    :class="['button', props.buttonStyle, { 'processing': isProcessing }]"
    @click="handleClick"
    @keydown="handleKeydown"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    :disabled="isSecurelyDisabled"
    :aria-busy="isProcessing"
    :aria-label="displayLabel"
    type="button"
  >
    {{ displayLabel }}
  </button>
</template>

<style scoped>
button {
  padding: var(--space-md) var(--space-md);
  white-space: nowrap;
  transition:
    background var(--transition-smooth),
    box-shadow var(--transition-smooth);
  
  &:after {
    content: v-bind(afterContent);
  }
  
  &.light {
    background: var(--light);
    color: var(--dark);
    border: 1px solid var(--light);
    
    &:hover {
      background: var(--light-hover);
    }
  }
  
  &.dark {
    background-color: transparent;
    color: var(--light);
    border: 1px solid var(--border);
    
    &:hover {
      background: var(--dark-hover);
    }
  }

  &.remove {
    background: var(--remove);
    color: var(--remove-txt);
    border: 1px solid var(--remove-border);
    &:hover {
      background: var(--remove-hover);
    }
  }
  
  &.disabled {
    background-color: var(--disabled);
    color: var(--details);
    border: 1px solid var(--border);
    cursor: not-allowed;
    
    &:hover {
      background-color: var(--inactive);
    }
  }
  

}
</style>