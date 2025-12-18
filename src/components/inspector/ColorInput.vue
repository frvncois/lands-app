<script setup lang="ts">
import ColorPicker from '@/components/ui/ColorPicker.vue'

defineProps<{
  modelValue: string | undefined
  placeholder?: string
  swatchOnly?: boolean
  inline?: boolean
  side?: 'left' | 'right' | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleUpdate(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <ColorPicker
    :model-value="modelValue"
    :placeholder="placeholder"
    :swatch-only="swatchOnly"
    :inline="inline"
    :side="side"
    @update:model-value="handleUpdate"
  />
</template>
