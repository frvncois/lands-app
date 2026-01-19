<script setup lang="ts">
/**
 * ERROR BOUNDARY
 *
 * Catches errors in child components and displays a fallback UI.
 * Prevents the entire app from crashing due to component errors.
 */

import { onErrorCaptured, ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'

const props = withDefaults(defineProps<{
  fallbackTitle?: string
  fallbackMessage?: string
  showRetry?: boolean
}>(), {
  fallbackTitle: 'Something went wrong',
  fallbackMessage: 'An unexpected error occurred. Please try again.',
  showRetry: true,
})

const emit = defineEmits<{
  error: [error: Error, info: string]
}>()

const error = ref<Error | null>(null)
const errorInfo = ref<string>('')
const isDev = import.meta.env.DEV

onErrorCaptured((err, instance, info) => {
  error.value = err
  errorInfo.value = info

  // Log to console in development
  if (isDev) {
    console.error('[ErrorBoundary] Caught error:', err)
    console.error('[ErrorBoundary] Component:', instance)
    console.error('[ErrorBoundary] Info:', info)
  }

  // Emit for parent handling (e.g., error tracking)
  emit('error', err, info)

  // Return false to prevent error from propagating further
  return false
})

function retry() {
  error.value = null
  errorInfo.value = ''
}

function reload() {
  window.location.reload()
}
</script>

<template>
  <div
    v-if="error"
    class="flex flex-col items-center justify-center min-h-[300px] p-8 text-center"
  >
    <div class="w-14 h-14 mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
      <Icon
        name="alert-circle"
        :size="28"
        class="text-destructive"
      />
    </div>

    <h3 class="text-lg font-semibold text-foreground mb-2">
      {{ fallbackTitle }}
    </h3>

    <p class="text-sm text-muted-foreground mb-6 max-w-md">
      {{ fallbackMessage }}
    </p>

    <!-- Show error details in development -->
    <details
      v-if="isDev"
      class="mb-6 text-left w-full max-w-lg"
    >
      <summary class="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
        Technical details
      </summary>
      <pre class="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">{{ error.message }}

      {{ error.stack }}</pre>
    </details>

    <div class="flex items-center gap-3">
      <Button
        v-if="showRetry"
        variant="secondary"
        size="sm"
        @click="retry"
      >
        <Icon
          name="refresh"
          :size="14"
          class="mr-2"
        />
        Try again
      </Button>
      <Button
        variant="outline"
        size="sm"
        @click="reload"
      >
        <Icon
          name="reload"
          :size="14"
          class="mr-2"
        />
        Reload page
      </Button>
    </div>
  </div>

  <slot v-else />
</template>
