<script setup lang="ts">
import { computed } from 'vue'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  src?: string
  name?: string
  email?: string
  size?: AvatarSize
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-base' },
  xl: { container: 'w-16 h-16', text: 'text-lg' },
}

const initials = computed(() => {
  if (props.name) {
    const parts = props.name.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) {
      const first = parts[0]?.[0] ?? ''
      const last = parts[parts.length - 1]?.[0] ?? ''
      return `${first}${last}`.toUpperCase()
    }
    return props.name.slice(0, 2).toUpperCase()
  }
  if (props.email) {
    return props.email.slice(0, 2).toUpperCase()
  }
  return '?'
})

const classes = computed(() => sizeClasses[props.size])
</script>

<template>
  <div
    :class="[
      'rounded-full bg-primary flex items-center justify-center shrink-0 font-semibold text-accent',
      classes.container,
      classes.text,
    ]"
  >
    {{ initials }}
  </div>
</template>
