<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)

onErrorCaptured((err) => {
  hasError.value = true
  console.error('[ErrorBoundary] Section render error:', err)
  return false // prevent propagation to parent
})
</script>

<template>
  <div v-if="hasError" class="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl mx-4 my-2">
    <svg class="h-5 w-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <span>This section couldn't render.</span>
  </div>
  <slot v-else />
</template>
