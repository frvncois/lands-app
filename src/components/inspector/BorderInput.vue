<script setup lang="ts">
import type { BorderStyle } from '@/types/editor'
import ColorInput from './ColorInput.vue'

const props = defineProps<{
  modelValue: BorderStyle | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BorderStyle]
}>()

const sizeOptions = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '4', label: '4' },
]

const radiusOptions = [
  { value: '0', label: 'None' },
  { value: '4', label: 'SM' },
  { value: '8', label: 'MD' },
  { value: '12', label: 'LG' },
  { value: '16', label: 'XL' },
  { value: '9999', label: 'Full' },
]

function update(key: keyof BorderStyle, value: string) {
  emit('update:modelValue', {
    size: props.modelValue?.size ?? '0',
    color: props.modelValue?.color ?? '',
    radius: props.modelValue?.radius ?? '0',
    [key]: value,
  })
}
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-2">
      <div class="space-y-1">
        <span class="text-xs text-muted-foreground">Size</span>
        <select
          class="w-full px-2 py-1.5 text-sm bg-secondary border border-border rounded-md text-foreground"
          :value="modelValue?.size ?? '0'"
          @change="update('size', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="opt in sizeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="space-y-1">
        <span class="text-xs text-muted-foreground">Radius</span>
        <select
          class="w-full px-2 py-1.5 text-sm bg-secondary border border-border rounded-md text-foreground"
          :value="modelValue?.radius ?? '0'"
          @change="update('radius', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="opt in radiusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
    <div class="space-y-1">
      <span class="text-xs text-muted-foreground">Color</span>
      <ColorInput
        :model-value="modelValue?.color"
        @update:model-value="update('color', $event)"
      />
    </div>
  </div>
</template>
