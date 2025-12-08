<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'circular' | 'rounded'
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClasses = {
  default: 'rounded',
  circular: 'rounded-full',
  rounded: 'rounded-lg',
}

const classes = computed(() => [
  'animate-pulse bg-muted',
  variantClasses[props.variant],
])

const style = computed(() => ({
  width: props.width,
  height: props.height,
}))
</script>

<template>
  <div :class="classes" :style="style">
    <slot />
  </div>
</template>
