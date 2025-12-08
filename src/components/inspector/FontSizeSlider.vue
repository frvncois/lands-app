<script setup lang="ts">
import { computed } from 'vue'
import { Slider } from '@/components/ui'

const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const
const fontSizeLabels: Record<string, string> = {
  'xs': 'XS',
  'sm': 'SM',
  'base': 'Base',
  'lg': 'LG',
  'xl': 'XL',
  '2xl': '2XL',
  '3xl': '3XL',
  '4xl': '4XL',
  '5xl': '5XL',
  '6xl': '6XL',
}

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'base',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Convert font size name to index
const sliderValue = computed(() => {
  const index = fontSizes.indexOf(props.modelValue as typeof fontSizes[number])
  return index >= 0 ? index : 2 // default to 'base' (index 2)
})

// Get display label
const displayLabel = computed(() => {
  return fontSizeLabels[props.modelValue] || 'Base'
})

function handleUpdate(index: number) {
  const fontSize = fontSizes[index]
  if (fontSize) {
    emit('update:modelValue', fontSize)
  }
}
</script>

<template>
  <Slider
    :model-value="sliderValue"
    :min="0"
    :max="fontSizes.length - 1"
    :step="1"
    :show-value="true"
    :display-label="displayLabel"
    @update:model-value="handleUpdate"
  />
</template>
