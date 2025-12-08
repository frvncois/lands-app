<script setup lang="ts">
import { inject, computed, type ComputedRef } from 'vue'

interface Props {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const modelValue = inject<ComputedRef<string | undefined>>('radioGroupValue')
const updateValue = inject<(value: string) => void>('radioGroupUpdate')

const isSelected = computed(() => modelValue?.value === props.value)

function handleClick() {
  if (!props.disabled && updateValue) {
    updateValue(props.value)
  }
}
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="isSelected"
    :disabled="disabled"
    :class="[
      'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors',
      'focus:outline-none focus:ring-1 focus:ring-ring/25 focus:ring-offset-background',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    ]"
    @click="handleClick"
  >
    <!-- Radio circle -->
    <div
      :class="[
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
        isSelected ? 'border-primary' : 'border',
      ]"
    >
      <span
        v-if="isSelected"
        class="h-2.5 w-2.5 rounded-full bg-primary"
      ></span>
    </div>

    <!-- Label and description -->
    <div class="flex-1 min-w-0">
      <p class="text-xxs font-mono uppercase text-accent-foreground">{{ label }}</p>
      <p v-if="description" class="text-xs text-muted-foreground">{{ description }}</p>
    </div>

    <slot />
  </button>
</template>
