<script setup lang="ts">
import Toggle from './Toggle.vue'

interface Props {
  modelValue?: boolean
  label?: string
  description?: string
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      'flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors',
      'focus:outline-none focus:ring-1 focus:ring-ring/25 focus:ring-offset-background',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    ]"
    @click="toggle"
  >
    <div class="space-y-0.5">
      <slot name="label">
        <p class="text-xxs font-mono uppercase text-foreground">
          {{ label }}
        </p>
      </slot>
      <slot name="description">
        <p
          v-if="description"
          class="text-xs text-muted-foreground"
        >
          {{ description }}
        </p>
      </slot>
    </div>
    <Toggle
      :model-value="modelValue ?? false"
      :disabled="disabled"
      @click.stop
      @update:model-value="emit('update:modelValue', $event)"
    />
  </button>
</template>
