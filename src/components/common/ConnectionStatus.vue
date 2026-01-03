<script setup lang="ts">
import { computed } from 'vue'
import { connectionState } from '@/lib/supabase'
import { Icon } from '@/components/ui'

const isVisible = computed(() => {
  return connectionState.value === 'recovering' || connectionState.value === 'unhealthy'
})

const statusText = computed(() => {
  if (connectionState.value === 'recovering') {
    return 'Reconnecting...'
  }
  if (connectionState.value === 'unhealthy') {
    return 'Connection lost. Please refresh the page.'
  }
  return ''
})

const statusIcon = computed(() => {
  if (connectionState.value === 'recovering') {
    return 'reload'
  }
  return 'warning'
})

const statusClass = computed(() => {
  if (connectionState.value === 'recovering') {
    return 'bg-amber-500/10 border-amber-500/20 text-amber-600'
  }
  return 'bg-destructive/10 border-destructive/20 text-destructive'
})

function handleRefresh() {
  window.location.reload()
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-full"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-full"
  >
    <div
      v-if="isVisible"
      class="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center"
    >
      <div
        class="m-2 px-4 py-2.5 rounded-lg border shadow-lg backdrop-blur-sm transition-all"
        :class="statusClass"
      >
        <div class="flex items-center gap-3">
          <!-- Icon -->
          <div class="flex items-center">
            <Icon
              :name="statusIcon"
              class="text-base"
              :class="{ 'animate-spin': connectionState === 'recovering' }"
            />
          </div>

          <!-- Status text -->
          <span class="text-sm font-medium">
            {{ statusText }}
          </span>

          <!-- Refresh button (only for unhealthy) -->
          <button
            v-if="connectionState === 'unhealthy'"
            class="ml-2 px-3 py-1 text-xs font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            @click="handleRefresh"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
