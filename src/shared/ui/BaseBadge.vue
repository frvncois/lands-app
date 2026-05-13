<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'xs' | 'sm'
  dot?: boolean
}>(), {
  variant: 'default',
  size: 'sm',
  dot: false,
})

const styles = {
  default: { badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  success: { badge: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  warning: { badge: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400' },
  error:   { badge: 'bg-red-50 text-red-600', dot: 'bg-red-400' },
  info:    { badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
}

const sizes = {
  xs: 'text-[10px] px-1.5 py-0.5 rounded-md gap-1',
  sm: 'text-xs px-2 py-0.5 rounded-lg gap-1.5',
}
</script>

<template>
  <span class="inline-flex items-center font-medium" :class="[styles[variant].badge, sizes[size]]">
    <span v-if="dot" class="h-1.5 w-1.5 rounded-full shrink-0" :class="styles[variant].dot" />
    <slot />
  </span>
</template>
