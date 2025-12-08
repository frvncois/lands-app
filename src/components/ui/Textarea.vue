<script setup lang="ts">
import { computed } from 'vue'

type TextareaSize = 'sm' | 'md' | 'lg'
type TextareaVariant = 'default' | 'filled' | 'ghost'

interface Props {
  modelValue?: string
  placeholder?: string
  size?: TextareaSize
  variant?: TextareaVariant
  rows?: number
  disabled?: boolean
  readonly?: boolean
  error?: boolean
  fullWidth?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  size: 'md',
  variant: 'default',
  rows: 3,
  disabled: false,
  readonly: false,
  error: false,
  fullWidth: true,
  resize: 'none',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const sizeClasses: Record<TextareaSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-sm',
}

const variantClasses: Record<TextareaVariant, string> = {
  default: 'bg-background border border-border',
  filled: 'bg-secondary border border-transparent',
  ghost: 'bg-transparent border border-transparent hover:bg-accent/50',
}

const resizeClasses: Record<string, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
}

const classes = computed(() => [
  'rounded-lg text-foreground placeholder:text-muted-foreground transition-colors h-25 shadow-xs',
  'focus:outline-none focus:ring-1 focus:ring-ring/25 focus:ring-offset-background',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  sizeClasses[props.size],
  variantClasses[props.variant],
  resizeClasses[props.resize],
  props.error ? 'border-destructive focus:ring-destructive' : '',
  props.fullWidth ? 'w-full' : '',
])

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :readonly="readonly"
    :class="classes"
    @input="handleInput"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  />
</template>
