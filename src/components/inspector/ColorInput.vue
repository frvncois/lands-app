<script setup lang="ts">
import ColorPicker from '@/components/ui/ColorPicker.vue'

defineProps<{
  modelValue: string | undefined
  placeholder?: string
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
    @update:model-value="handleUpdate"
  />
</template>
