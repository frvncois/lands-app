<script setup>
import { computed, watch, nextTick, ref } from 'vue'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Links'
  },
  titlePlaceholder: {
    type: String,
    default: 'Link title'
  },
  urlPlaceholder: {
    type: String,
    default: 'URL, email, or phone'
  }
})

const model = defineModel({
  type: Array,
  default: () => []
})

// Debounce timer for auto-formatting
const formatTimers = ref(new Map())

// Ensure model is always a valid array
const safeModel = computed({
  get() {
    // Always return a valid array, even if model is null/undefined
    return Array.isArray(model.value) ? model.value : []
  },
  set(value) {
    // Validate that we're setting an array
    if (Array.isArray(value)) {
      model.value = value
    } else {
      console.warn('InputLinks: Attempted to set non-array value')
    }
  }
})

// Validate individual link item
function validateLinkItem(item) {
  return item && 
         typeof item === 'object' && 
         typeof item.title === 'string' && 
         typeof item.url === 'string'
}

// Create a new link item with proper structure
function createLinkItem() {
  return {
    title: '',
    url: '',
    id: Date.now() + Math.random(), // Unique ID for tracking
    created_at: new Date().toISOString()
  }
}

// Add new link
function add() {
  try {
    // Initialize model if it's not an array
    if (!Array.isArray(model.value)) {
      model.value = []
    }
    
    const newItem = createLinkItem()
    model.value.push(newItem)
    
    console.log('✅ Added new link item:', newItem.id)
    
    // Focus on the title input of the new item
    nextTick(() => {
      const inputs = document.querySelectorAll('input[placeholder="Link title"]')
      const lastInput = inputs[inputs.length - 1]
      if (lastInput) {
        lastInput.focus()
      }
    })
    
  } catch (error) {
    console.error('❌ Error adding link:', error)
  }
}

// Remove link by index
function remove(index) {
  try {
    // Validate index
    if (!Array.isArray(model.value) || index < 0 || index >= model.value.length) {
      console.warn('InputLinks: Invalid remove index:', index)
      return
    }
    
    const removedItem = model.value[index]
    model.value.splice(index, 1)
    
    console.log('🗑️ Removed link item:', removedItem?.id || index)
    
  } catch (error) {
    console.error('❌ Error removing link:', error)
  }
}

// Clean up invalid items
function cleanup() {
  if (!Array.isArray(model.value)) return
  
  const originalLength = model.value.length
  model.value = model.value.filter(validateLinkItem)
  
  const removedCount = originalLength - model.value.length
  if (removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} invalid link items`)
  }
}

// Update item title
function updateTitle(index, value) {
  try {
    if (!Array.isArray(model.value) || index < 0 || index >= model.value.length) {
      return
    }
    
    // Ensure item exists and has proper structure
    if (!model.value[index]) {
      model.value[index] = createLinkItem()
    }
    
    model.value[index].title = String(value || '')
    model.value[index].updated_at = new Date().toISOString()
    
  } catch (error) {
    console.error('❌ Error updating title:', error)
  }
}

// Auto-detect and format URL based on input type (improved logic)
function autoFormatUrl(value) {
  if (!value) return ''
  
  const cleanValue = String(value).trim()
  
  // Don't auto-format if it already has a protocol
  if (/^(https?|ftp|mailto|tel):\/?\/?/i.test(cleanValue)) {
    return cleanValue
  }
  
  // Email detection - must be complete email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(cleanValue)) {
    return `mailto:${cleanValue}`
  }
  
  // If contains @ but not complete email, don't format yet
  if (cleanValue.includes('@')) {
    return cleanValue
  }
  
  // Phone number detection (various formats)
  const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{7,}$/
  const cleanPhone = cleanValue.replace(/[\s\-\(\)\.]/g, '')
  if (phoneRegex.test(cleanValue) && cleanPhone.length >= 7 && !cleanValue.includes('.')) {
    return `tel:${cleanValue}`
  }
  
  // Website/URL detection - only if it looks like a complete domain
  // If it starts with www
  if (/^www\./i.test(cleanValue)) {
    return `https://${cleanValue}`
  }
  
  // If it looks like a domain (contains dots, no spaces, and has TLD)
  if (/^[^\s@]+\.[a-z]{2,}$/i.test(cleanValue) && !cleanValue.includes(' ')) {
    return `https://${cleanValue}`
  }
  
  // Return as-is if we can't determine the type or it's incomplete
  return cleanValue
}

// Update item URL with debounced formatting
function updateUrl(index, displayValue) {
  try {
    if (!Array.isArray(model.value) || index < 0 || index >= model.value.length) {
      return
    }
    
    // Ensure item exists and has proper structure
    if (!model.value[index]) {
      model.value[index] = createLinkItem()
    }
    
    // Clear existing timer for this index
    if (formatTimers.value.has(index)) {
      clearTimeout(formatTimers.value.get(index))
    }
    
    // Set debounced auto-formatting (only if user pauses typing)
    const timer = setTimeout(() => {
      if (model.value[index]) {
        const formattedUrl = autoFormatUrl(displayValue)
        
        // Store the formatted URL with protocol
        model.value[index].url = formattedUrl
        model.value[index].updated_at = new Date().toISOString()
        
        console.log('🔗 Auto-formatted URL:', { 
          display: displayValue, 
          stored: formattedUrl,
          type: getUrlType(formattedUrl)
        })
      }
      
      formatTimers.value.delete(index)
    }, 1000) // 1 second delay
    
    formatTimers.value.set(index, timer)
    
  } catch (error) {
    console.error('❌ Error updating URL:', error)
  }
}

// Get URL type for debugging/display
function getUrlType(url) {
  if (!url) return 'empty'
  if (url.startsWith('mailto:')) return 'email'
  if (url.startsWith('tel:')) return 'phone'
  if (url.startsWith('https://') || url.startsWith('http://')) return 'website'
  if (url.startsWith('ftp://')) return 'ftp'
  return 'other'
}

// Validate URL format (updated for multiple protocols)
function isValidUrl(url) {
  if (!url) return true // Empty URLs are valid
  
  try {
    // Handle special protocols
    if (url.startsWith('mailto:')) {
      const email = url.substring(7)
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }
    
    if (url.startsWith('tel:')) {
      const phone = url.substring(4)
      return /^[\+]?[\d\s\-\(\)\.]{7,}$/.test(phone)
    }
    
    // For http/https/ftp URLs
    if (/^(https?|ftp):\/\//i.test(url)) {
      new URL(url)
      return true
    }
    
    // For other formats, be more lenient
    return true
    
  } catch {
    return false
  }
}

// Strip protocol from URL for display purposes
function getDisplayUrl(url) {
  if (!url) return ''
  
  const cleanUrl = String(url)
  
  // Remove protocol prefixes for display
  if (cleanUrl.startsWith('mailto:')) {
    return cleanUrl.substring(7)
  }
  
  if (cleanUrl.startsWith('tel:')) {
    return cleanUrl.substring(4)
  }
  
  if (cleanUrl.startsWith('https://')) {
    return cleanUrl.substring(8)
  }
  
  if (cleanUrl.startsWith('http://')) {
    return cleanUrl.substring(7)
  }
  
  if (cleanUrl.startsWith('ftp://')) {
    return cleanUrl.substring(6)
  }
  
  return cleanUrl
}

// Get the stored URL (with protocol)
function getStoredUrl(index) {
  if (!Array.isArray(model.value) || index < 0 || index >= model.value.length) {
    return ''
  }
  return model.value[index]?.url || ''
}

// Get CSS classes for input validation
function getInputClasses(index, field) {
  const item = safeModel.value[index]
  if (!item) return ''
  
  if (field === 'url' && item.url && !isValidUrl(item.url)) {
    return 'invalid-url'
  }
  
  return ''
}

// Clean up timers when component unmounts
watch(
  () => model.value,
  () => {
    cleanup()
  },
  { deep: true }
)

// Cleanup function for timers
function cleanupTimers() {
  formatTimers.value.forEach(timer => clearTimeout(timer))
  formatTimers.value.clear()
}
</script>

<template>
  <li>
    <div class="title">
      <label>{{ label }}</label>
      <ButtonMain buttonStyle="light" label="Add Link" @click="add" />
    </div>
    <div class="item" v-for="(item, i) in safeModel" :key="item?.id || i">
      <input 
        :value="item?.title || ''"
        @input="updateTitle(i, $event.target.value)"
        :placeholder="titlePlaceholder"
        :class="getInputClasses(i, 'title')"
      />
      <input 
        :value="getDisplayUrl(getStoredUrl(i))"
        @input="updateUrl(i, $event.target.value)"
        :placeholder="urlPlaceholder"
        :class="getInputClasses(i, 'url')"
        type="url"
      />
      <ButtonMain buttonStyle="remove" label="×" @click="remove(i)" />
    </div>
  </li>
</template>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  align-items: stretch;
  > .title {
    display: flex;
    gap: var(--space-sm);
    justify-content: space-between;
    align-items: flex-start;
  }
  
  > .item {
    display: flex;
    gap: var(--space-sm);
    justify-content: space-between;
    align-items: stretch;
    
    > input {
      padding: var(--space-rg) var(--space-rg);
      
      &.invalid-url {
        border-bottom: 1px solid var(--color-error);
      }
    }
  }
}
</style>