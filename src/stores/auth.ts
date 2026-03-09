import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const resetEmailSent = ref(false)
  const passwordResetSuccess = ref(false)
  const needsOnboarding = ref(false)

  function setLoading(loading: boolean) {
    isLoading.value = loading
    if (loading) error.value = null
  }

  function setError(message: string) {
    error.value = message
    isLoading.value = false
  }

  function clearError() {
    error.value = null
  }

  function $reset() {
    isLoading.value = false
    error.value = null
    resetEmailSent.value = false
    passwordResetSuccess.value = false
    needsOnboarding.value = false
  }

  return {
    isLoading,
    error,
    resetEmailSent,
    passwordResetSuccess,
    needsOnboarding,
    setLoading,
    setError,
    clearError,
    $reset,
  }
})
