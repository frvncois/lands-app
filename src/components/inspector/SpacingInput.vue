<script setup lang="ts">
import type { Spacing } from '@/types/editor'
import { spacingOptions } from '@/lib/editor-utils'

const props = defineProps<{
  modelValue: Spacing | undefined
  labelY?: string
  labelX?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Spacing]
}>()

function updateY(value: string) {
  emit('update:modelValue', {
    y: value,
    x: props.modelValue?.x ?? '0',
  })
}

function updateX(value: string) {
  emit('update:modelValue', {
    y: props.modelValue?.y ?? '0',
    x: value,
  })
}
</script>

<template>
  <div class="grid grid-cols-2 gap-2">
    <div class="space-y-1">
      <span class="text-xs text-muted-foreground">{{ labelY ?? 'T+B' }}</span>
      <select
        class="w-full px-2 py-1.5 text-sm bg-secondary border border-border rounded-md text-foreground"
        :value="modelValue?.y ?? '0'"
        @change="updateY(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in spacingOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>
    <div class="space-y-1">
      <span class="text-xs text-muted-foreground">{{ labelX ?? 'L+R' }}</span>
      <select
        class="w-full px-2 py-1.5 text-sm bg-secondary border border-border rounded-md text-foreground"
        :value="modelValue?.x ?? '0'"
        @change="updateX(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in spacingOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>
  </div>
</template>
