<script setup lang="ts">
import { inject, computed, type ComputedRef } from 'vue'

interface Props {
  value: string
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
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      isSelected ? 'border-primary' : 'border-muted-foreground/50',
    ]"
    @click="handleClick"
  >
    <span
      v-if="isSelected"
      class="flex items-center justify-center"
    >
      <span class="h-2.5 w-2.5 rounded-full bg-current" />
    </span>
  </button>
</template>
