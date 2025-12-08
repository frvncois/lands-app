<script setup lang="ts">
import ColorPicker from '@/components/ui/ColorPicker.vue'

defineProps<{
  modelValue: string | undefined
  placeholder?: string
  swatchOnly?: boolean
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
    @update:model-value="handleUpdate"
  />
</template>
