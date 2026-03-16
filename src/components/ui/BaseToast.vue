<script setup lang="ts">
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import type { Toast } from '@/composables/useToast'

defineProps<{ toast: Toast }>()
defineEmits<{ dismiss: [] }>()

const iconMap = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
}

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-gray-400',
  warning: 'text-amber-400',
}
</script>

<template>
  <div class="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3 w-80 pointer-events-auto">
    <component
      :is="iconMap[toast.type]"
      class="h-4 w-4 shrink-0"
      :class="iconColorMap[toast.type]"
    />
    <p class="flex-1 text-sm text-gray-800 leading-snug">{{ toast.message }}</p>
    <button
      v-if="toast.action"
      class="shrink-0 text-xs font-semibold text-gray-200 bg-gray-900 hover:bg-gray-800 transition-colors px-2.5 py-1 rounded-lg"
      @click="toast.action.onClick(); $emit('dismiss')"
    >
      {{ toast.action.label }}
    </button>
    <button
      class="text-gray-300 hover:text-gray-500 transition-colors shrink-0 -mr-1"
      @click="$emit('dismiss')"
    >
      <XMarkIcon class="h-3.5 w-3.5" />
    </button>
  </div>
</template>
