<script setup lang="ts">
import Slider from '@/components/ui/Slider.vue'

defineProps<{
  label: string
  modelValue: number
  min: number
  max: number
  step?: number
  unit?: string
}>()

defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <label class="text-xs text-muted-foreground whitespace-nowrap">{{ label }}</label>
    <Slider
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :unit="unit"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>
