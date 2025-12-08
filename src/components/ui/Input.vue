<script setup lang="ts">
import { computed } from 'vue'

type InputSize = 'xs' | 'sm' | 'md' | 'lg'
type InputVariant = 'default' | 'filled' | 'ghost'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  size?: InputSize
  variant?: InputVariant
  disabled?: boolean
  readonly?: boolean
  error?: boolean
  fullWidth?: boolean
  prefix?: string
  suffix?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  size: 'md',
  variant: 'default',
  disabled: false,
  readonly: false,
  error: false,
  fullWidth: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const sizeClasses: Record<InputSize, string> = {
  xs: 'h-7 px-2 text-xs',
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-10 px-4 text-sm',
}

const variantClasses: Record<InputVariant, string> = {
  default: 'bg-input border shadow-xs focus:bg-background',
  filled: 'bg-secondary border border-transparent',
  ghost: 'bg-transparent border border-transparent hover:bg-accent/50',
}

const inputClasses = computed(() => [
  'rounded-lg text-foreground placeholder:text-muted-foreground transition-colors',
  'focus:outline-none focus:ring-1 focus:ring-ring/25 focus:ring-offset-background',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  sizeClasses[props.size],
  variantClasses[props.variant],
  props.error ? 'border-destructive focus:ring-destructive' : '',
  props.fullWidth ? 'w-full' : '',
  props.prefix ? 'rounded-l-none' : '',
  props.suffix ? 'rounded-r-none' : '',
])

const prefixSuffixClasses = computed(() => [
  'inline-flex items-center border border-border bg-muted/25 text-muted-foreground font-mono uppercase text-xxs shadow-xs',
  props.size === 'xs' ? 'px-2 text-xs' : '',
  props.size === 'sm' ? 'px-2.5 text-xs' : '',
  props.size === 'md' ? 'px-3 text-xs' : '',
  props.size === 'lg' ? 'px-4 text-sm' : '',
  sizeClasses[props.size].split(' ').find(c => c.startsWith('h-')) || 'h-9',
])

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', props.type === 'number' ? Number(target.value) : target.value)
}
</script>

<template>
  <div :class="['flex', fullWidth ? 'w-full' : '']">
    <span
      v-if="prefix"
      :class="[...prefixSuffixClasses, 'rounded-l-lg border-r-0']"
    >
      {{ prefix }}
    </span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :class="inputClasses"
      @input="handleInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <span
      v-if="suffix"
      :class="[...prefixSuffixClasses, 'rounded-r-md border-l-0']"
    >
      {{ suffix }}
    </span>
  </div>
</template>
