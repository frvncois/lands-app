<script setup lang="ts">
import { computed } from 'vue'

type BadgeVariant = 'default' | 'secondary' | 'draft' | 'success' | 'warning' | 'error' | 'info' | 'outline'
type BadgeSize = 'xs' | 'sm' | 'md'

interface Props {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
  dot: false,
})

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-blue-900/50 text-blue-400 border border-blue-500/20',
  draft: 'bg-orange-500/10 text-orange-600 border border-orange-500/20',
  success: 'bg-green-500/10 text-green-600 border border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  error: 'bg-destructive/10 text-destructive border border-destructive/20',
  info: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
  outline: 'bg-violet-500/10 text-violet-600 border border-violet-500/20',
}

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-primary-foreground',
  secondary: 'bg-slate-500',
  draft: 'bg-orange-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-destructive',
  info: 'bg-blue-500',
  outline: 'bg-violet-500',
}

const shadowColors: Record<BadgeVariant, string> = {
  default: 'oklch(0.205 0 0 / 0.3)',
  secondary: 'oklch(0.55 0.15 250 / 0.4)',
  draft: 'oklch(0.7 0.17 50 / 0.4)',
  success: 'oklch(0.65 0.2 145 / 0.4)',
  warning: 'oklch(0.75 0.18 85 / 0.4)',
  error: 'oklch(0.577 0.245 27.325 / 0.4)',
  info: 'oklch(0.6 0.18 250 / 0.4)',
  outline: 'oklch(0.6 0.2 290 / 0.4)',
}

const classes = computed(() => [
  'inline-flex items-center rounded',
  props.dot ? 'gap-1.5' : 'gap-1',
  variantClasses[props.variant],
  sizeClasses[props.size],
])

const shadowStyle = computed(() => ({
  boxShadow: `0 0px 15px -6px ${shadowColors[props.variant]}`,
}))
</script>

<template>
  <span :class="classes" :style="shadowStyle">
    <span v-if="dot" class="w-1 h-1 rounded-full" :class="dotColors[variant]"></span>
    <slot />
  </span>
</template>
