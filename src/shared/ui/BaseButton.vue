<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'ghost' | 'outline' | 'solid' | 'icon' | 'remove'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  active?: boolean
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'ghost',
  size: 'md',
  active: false,
  disabled: false,
  loading: false,
})

const classes = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-fast rounded-xl cursor-pointer'

  const variants = {
    ghost: 'bg-gray-white hover:bg-gray-50 active:bg-gray-100',
    outline: 'text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-50 shadow-sm/5',
    solid: 'text-white bg-gray-900 hover:bg-gray-800 active:bg-gray-700',
    icon: 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    remove: 'text-red-600 border border-red-300 hover:bg-red-50 active:bg-red-100',
  }

  const sizes = {
    xs: (props.variant === 'icon') ? 'p-1' : 'px-2 py-1 text-xs gap-1.5',
    sm: (props.variant === 'icon') ? 'p-1.5' : 'px-4 py-2 text-xs gap-1.5',
    md: props.variant === 'icon' ? 'p-2' : 'px-6 py-2 text-sm gap-2',
    lg: props.variant === 'icon' ? 'p-2.5' : 'px-6 py-3 text-base gap-2',
  }

  const activeStates: Record<string, string> = {
    ghost: 'bg-gray-100',
    outline: 'bg-gray-100',
    solid: 'bg-gray-800',
    icon: 'bg-gray-100 text-gray-700',
    remove: 'bg-red-50',
  }
  const activeClass = props.active ? activeStates[props.variant] : ''
  const state = (props.disabled || props.loading) ? 'cursor-not-allowed pointer-events-none' : ''

  return [base, variants[props.variant], sizes[props.size], activeClass, state]
})
</script>

<template>
  <button :class="classes" :disabled="disabled || loading">
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>
