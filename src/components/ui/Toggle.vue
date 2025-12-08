<script setup lang="ts">
import { computed } from 'vue'

type ToggleSize = 'sm' | 'md' | 'lg'

interface Props {
  modelValue: boolean
  label?: string
  disabled?: boolean
  size?: ToggleSize
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sizeClasses: Record<ToggleSize, { track: string; thumb: string; translate: string }> = {
  sm: {
    track: 'h-3.5 w-6',
    thumb: 'h-2 w-2',
    translate: 'translate-x-2.5',
  },
  md: {
    track: 'h-4 w-7',
    thumb: 'h-2.5 w-2.5',
    translate: 'translate-x-3',
  },
  lg: {
    track: 'h-5 w-9',
    thumb: 'h-3 w-3',
    translate: 'translate-x-4',
  },
}

const classes = computed(() => sizeClasses[props.size])

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <label class="flex items-center justify-between cursor-pointer" :class="disabled ? 'opacity-50 cursor-not-allowed' : ''">
    <span v-if="label" class="text-sm text-foreground">{{ label }}</span>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      :class="[
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors border',
        'focus:outline-none focus:ring-1 focus:ring-ring/25 focus:ring-offset-background',
        'disabled:cursor-not-allowed',
        classes.track,
        modelValue ? 'border-primary bg-primary' : 'border-border bg-transparent',
      ]"
      @click="toggle"
    >
      <span
        :class="[
          'pointer-events-none block rounded-full shadow-lg ring-0 transition-transform',
          classes.thumb,
          modelValue ? `${classes.translate} bg-background` : 'translate-x-0.75 bg-foreground',
        ]"
      />
    </button>
  </label>
</template>
