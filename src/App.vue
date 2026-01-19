<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'

useTheme()

function handleGlobalError(error: Error, info: string) {
  // Optional: Send to error tracking
  console.error('[App] Global error:', error, info)
}
</script>

<template>
  <ErrorBoundary
    fallback-title="Application Error"
    fallback-message="The application encountered an unexpected error. Please reload the page."
    @error="handleGlobalError"
  >
    <RouterView />
  </ErrorBoundary>
  <ToastContainer />
  <ConnectionStatus />
</template>
