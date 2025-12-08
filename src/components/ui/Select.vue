<script setup lang="ts">
import { computed } from 'vue'

type SelectSize = 'xs' | 'sm' | 'md' | 'lg'
type SelectVariant = 'default' | 'filled' | 'ghost'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: SelectOption[]
  placeholder?: string
  size?: SelectSize
  variant?: SelectVariant
  disabled?: boolean
  error?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Select an option',
  size: 'md',
  variant: 'default',
  disabled: false,
  error: false,
  fullWidth: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const sizeClasses: Record<SelectSize, string> = {
  xs: 'h-7 px-2 text-xs',
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-9 px-3 text-sm',
  lg: 'h-10 px-4 text-sm',
}

const variantClasses: Record<SelectVariant, string> = {
  default: 'bg-background border border-border',
  filled: 'bg-secondary border border-transparent',
  ghost: 'bg-transparent border border-transparent hover:bg-accent/50',
}

const classes = computed(() => [
  'rounded-md text-foreground transition-colors appearance-none cursor-pointer',
  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'pr-8', // Space for dropdown arrow
  sizeClasses[props.size],
  variantClasses[props.variant],
  props.error ? 'border-destructive focus:ring-destructive' : '',
  props.fullWidth ? 'w-full' : '',
])

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="['relative', fullWidth ? 'w-full' : '']">
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="classes"
      @change="handleChange"
    >
      <option v-if="placeholder" value="" disabled>
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <svg
      class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</template>
