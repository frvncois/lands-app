<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'dotted' | 'destructive' | 'link'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
  fullWidth: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const baseClasses = 'inline-flex items-center font-mono uppercase justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-ring/25 focus:ring-offset-background  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border bg-transparent hover:bg-accent/25 shadow-xs',
  dotted: 'border border-dotted bg-transparent hover:bg-accent/25 shadow-xs',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  link: 'text-primary underline-offset-4 hover:underline',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-10 text-sm rounded-md gap-1.5',
  sm: 'h-8 px-3 py-3 text-xxs rounded-lg gap-3',
  md: 'h-9 px-5 py-5 text-xxs rounded-xl gap-3',
  lg: 'h-10 px-6 text-sm rounded-lg gap-2',
  icon: 'h-9 w-9 rounded-xl',
}

const classes = computed(() => [
  baseClasses,
  variantClasses[props.variant],
  sizeClasses[props.size],
  props.fullWidth ? 'w-full' : '',
])

function handleClick(event: MouseEvent) {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <svg
      v-if="loading"
      class="animate-spin"
      :class="size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot v-if="!loading || size !== 'icon'" />
  </button>
</template>
