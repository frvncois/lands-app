<script setup lang="ts">
import { computed } from 'vue'
import type { BorderStyle } from '@/types/editor'
import ColorInput from './ColorInput.vue'
import SliderInput from './SliderInput.vue'
import InspectorField from './InspectorField.vue'

const props = defineProps<{
  modelValue: BorderStyle | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BorderStyle]
}>()

// Border sides
type BorderSide = 'top' | 'right' | 'bottom' | 'left'

const sides: { key: BorderSide; icon: string; label: string }[] = [
  { key: 'top', icon: 'lni-arrow-up', label: 'Top' },
  { key: 'right', icon: 'lni-arrow-right', label: 'Right' },
  { key: 'bottom', icon: 'lni-arrow-down', label: 'Bottom' },
  { key: 'left', icon: 'lni-arrow-left', label: 'Left' },
]

// Computed active sides
const activeSides = computed<Set<BorderSide>>(() => {
  const sidesStr = props.modelValue?.sides
  if (!sidesStr) {
    return new Set(['top', 'right', 'bottom', 'left'])
  }
  return new Set(sidesStr.split(',').filter(s => s) as BorderSide[])
})

function isSideActive(side: BorderSide): boolean {
  return activeSides.value.has(side)
}

function toggleSide(side: BorderSide) {
  const active = new Set(activeSides.value)
  if (active.has(side)) {
    active.delete(side)
  } else {
    active.add(side)
  }
  update('sides', Array.from(active).join(','))
}

function update(key: keyof BorderStyle, value: string) {
  emit('update:modelValue', {
    width: props.modelValue?.width ?? '0',
    color: props.modelValue?.color ?? '',
    radius: props.modelValue?.radius ?? '0',
    sides: props.modelValue?.sides ?? 'top,right,bottom,left',
    [key]: value,
  })
}
</script>

<template>
  <div class="space-y-0">
    <!-- Border Sides -->
    <InspectorField label="Sides" horizontal>
      <div class="flex p-1 bg-secondary rounded-md">
        <button
          v-for="side in sides"
          :key="side.key"
          type="button"
          class="flex items-center justify-center w-7 h-6 rounded transition-colors"
          :class="isSideActive(side.key)
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'"
          :title="side.label"
          @click="toggleSide(side.key)"
        >
          <i :class="['lni', side.icon, 'text-xs']"></i>
        </button>
      </div>
    </InspectorField>

    <!-- Border Width -->
    <InspectorField label="Width" horizontal>
      <SliderInput
        :model-value="modelValue?.width ?? '0'"
        :min="0"
        :max="8"
        :step="1"
        unit="px"
        @update:model-value="update('width', $event)"
      />
    </InspectorField>

    <!-- Border Radius -->
    <InspectorField label="Rounded" horizontal>
      <SliderInput
        :model-value="modelValue?.radius ?? '0'"
        :min="0"
        :max="32"
        :step="2"
        unit="px"
        @update:model-value="update('radius', $event)"
      />
    </InspectorField>

    <!-- Border Color -->
    <InspectorField label="Color" horizontal>
      <ColorInput
        :model-value="modelValue?.color"
        swatch-only
        @update:model-value="update('color', $event)"
      />
    </InspectorField>
  </div>
</template>
