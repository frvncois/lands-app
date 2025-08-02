import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  // Alert state
  const message = ref('')
  const type = ref('success')
  const isVisible = ref(false)
  
  // Alert types: 'success', 'error', 'updating'
  
  // Timer reference for auto-hide
  let hideTimer = null
  
  // Show alert function
  function showAlert(alertMessage, alertType = 'success') {
    // Clear any existing timer
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
      console.log('🔔 Cleared existing timer')
    }
    
    message.value = alertMessage
    type.value = alertType
    isVisible.value = true
    
    console.log(`🔔 Alert shown: [${alertType}] ${alertMessage}`, {
      message: message.value,
      type: type.value,
      isVisible: isVisible.value
    })
    
    // Auto-hide for success and error messages (not for updating)
    if (alertType !== 'updating') {
      const hideDelay = alertType === 'success' ? 3000 : 5000
      console.log(`🔔 Setting auto-hide timer for ${hideDelay}ms`)
      hideTimer = setTimeout(() => {
        console.log('🔔 Auto-hide timer triggered')
        hideAlert()
      }, hideDelay)
    } else {
      console.log('🔔 No auto-hide for updating message')
    }
  }
  
  // Hide alert function
  function hideAlert() {
    // Clear any existing timer
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    
    isVisible.value = false
    console.log('🔔 Alert hidden')
  }
  
  // Update alert message/type without changing visibility
  function updateAlert(alertMessage, alertType) {
    message.value = alertMessage
    type.value = alertType
    console.log(`🔔 Alert updated: [${alertType}] ${alertMessage}`)
  }
  
  // Clear alert completely
  function clearAlert() {
    // Clear any existing timer
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    
    message.value = ''
    type.value = 'success'
    isVisible.value = false
    console.log('🔔 Alert cleared')
  }
  
  // Convenience functions for different alert types
  function showSuccess(message) {
    showAlert(message, 'success')
  }
  
  function showError(message) {
    showAlert(message, 'error')
  }
  
  function showUpdating(message) {
    showAlert(message, 'updating')
  }
  
  return {
    // State
    message,
    type,
    isVisible,
    
    // Methods
    showAlert,
    hideAlert,
    updateAlert,
    clearAlert,
    showSuccess,
    showError,
    showUpdating
  }
})