<script setup lang="ts">
import { computed } from 'vue'
import { Slider } from '@/components/ui'

interface Props {
  modelValue?: string | number
  min?: number
  max?: number
  step?: number
  unit?: string
  showValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  unit: 'px',
  showValue: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Convert string value to number for slider
const numericValue = computed(() => {
  if (typeof props.modelValue === 'number') return props.modelValue
  const parsed = parseInt(props.modelValue, 10)
  return isNaN(parsed) ? props.min : parsed
})

function handleUpdate(value: number) {
  emit('update:modelValue', String(value))
}
</script>

<template>
  <Slider
    :model-value="numericValue"
    :min="min"
    :max="max"
    :step="step"
    :unit="unit"
    :show-value="showValue"
    @update:model-value="handleUpdate"
  />
</template>
