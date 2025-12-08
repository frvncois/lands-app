<script setup lang="ts">
import { computed } from 'vue'
import type { Spacing, SpacingYX } from '@/types/editor'
import { Slider } from '@/components/ui'

const props = defineProps<{
  modelValue: Spacing | SpacingYX | undefined
  labelY?: string
  labelX?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SpacingYX]
}>()

// Helper to get Y value from either format
const yValue = computed(() => {
  if (!props.modelValue) return 0
  if ('y' in props.modelValue) return parseInt(props.modelValue.y, 10) || 0
  return parseInt(props.modelValue.top ?? '0', 10) || 0
})

// Helper to get X value from either format
const xValue = computed(() => {
  if (!props.modelValue) return 0
  if ('x' in props.modelValue) return parseInt(props.modelValue.x, 10) || 0
  return parseInt(props.modelValue.left ?? '0', 10) || 0
})

function updateY(value: number) {
  emit('update:modelValue', {
    y: String(value),
    x: String(xValue.value),
  })
}

function updateX(value: number) {
  emit('update:modelValue', {
    y: String(yValue.value),
    x: String(value),
  })
}
</script>

<template>
  <div class="space-y-3 px-3">
    <div class="space-y-1.5">
      <span class="text-xs text-muted-foreground">{{ labelY ?? 'Vertical (T+B)' }}</span>
      <Slider
        :model-value="yValue"
        :min="0"
        :max="96"
        :step="4"
        unit="px"
        @update:model-value="updateY"
      />
    </div>
    <div class="space-y-1.5">
      <span class="text-xs text-muted-foreground">{{ labelX ?? 'Horizontal (L+R)' }}</span>
      <Slider
        :model-value="xValue"
        :min="0"
        :max="96"
        :step="4"
        unit="px"
        @update:model-value="updateX"
      />
    </div>
  </div>
</template>
