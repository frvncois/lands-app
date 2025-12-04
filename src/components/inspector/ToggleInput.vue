<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <label class="flex items-center justify-between cursor-pointer">
    <span v-if="label" class="text-sm text-foreground">{{ label }}</span>
    <button
      type="button"
      class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors"
      :class="modelValue ? 'bg-primary' : 'bg-input'"
      @click="toggle"
    >
      <span
        class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
        :class="modelValue ? 'translate-x-4' : 'translate-x-0.5'"
      />
    </button>
  </label>
</template>
