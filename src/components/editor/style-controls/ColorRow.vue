<script setup lang="ts">
import ColorPicker from '@/components/ui/ColorPicker.vue'

defineProps<{
  label: string
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <label class="text-xs text-muted-foreground whitespace-nowrap">{{ label }}</label>
    <ColorPicker
      :model-value="modelValue"
      swatch-only
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>
