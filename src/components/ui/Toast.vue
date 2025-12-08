<script setup lang="ts">
import { computed } from 'vue'
import type { Toast } from '@/stores/toast'

const props = defineProps<{
  toast: Toast
}>()

const emit = defineEmits<{
  dismiss: [id: string]
}>()

const iconMap = {
  success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`,
  error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`,
  warning: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>`,
  info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>`,
}

const typeClasses = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
    case 'error':
      return 'bg-destructive/10 border-destructive/20 text-destructive'
    case 'warning':
      return 'bg-amber-500/10 border-amber-500/20 text-amber-500'
    case 'info':
      return 'bg-blue-500/10 border-blue-500/20 text-blue-500'
    default:
      return 'bg-muted border-border text-foreground'
  }
})

const iconColor = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'text-emerald-500'
    case 'error':
      return 'text-destructive'
    case 'warning':
      return 'text-amber-500'
    case 'info':
      return 'text-blue-500'
    default:
      return 'text-foreground'
  }
})

function handleDismiss() {
  emit('dismiss', props.toast.id)
}

function handleAction() {
  if (props.toast.action?.onClick) {
    props.toast.action.onClick()
  }
  handleDismiss()
}
</script>

<template>
  <div
    class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-card shadow-lg transition-all duration-300"
    :class="typeClasses"
    role="alert"
  >
    <div class="p-2">
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div class="shrink-0" :class="iconColor" v-html="iconMap[toast.type]" />

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-foreground">
            {{ toast.title }}
          </p>
          <p v-if="toast.description" class="mt-1 text-sm text-muted-foreground">
            {{ toast.description }}
          </p>
          <!-- Action button -->
          <button
            v-if="toast.action"
            class="mt-2 text-sm hover:underline"
            :class="iconColor"
            @click="handleAction"
          >
            {{ toast.action.label }}
          </button>
        </div>

        <!-- Close button -->
        <button
          class="shrink-0 p-1 -m-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/50"
          @click="handleDismiss"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
