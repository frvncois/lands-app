<script setup lang="ts">
import { computed } from 'vue'
import type { BorderStyle } from '@/types/designer'
import { Icon, Tooltip } from '@/components/ui'
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

const sides: { key: BorderSide; icon: string; tooltip: string }[] = [
  { key: 'top', icon: 'style-border-top', tooltip: 'Top' },
  { key: 'right', icon: 'style-border-right', tooltip: 'Right' },
  { key: 'bottom', icon: 'style-border-bottom', tooltip: 'Bottom' },
  { key: 'left', icon: 'style-border-left', tooltip: 'Left' },
]

// Current width
const currentWidth = computed(() => parseInt(props.modelValue?.width ?? '0', 10))

// Computed active sides - if width is 0, no sides are active
const activeSides = computed<Set<BorderSide>>(() => {
  if (currentWidth.value === 0) {
    return new Set<BorderSide>()
  }
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
  let newWidth = props.modelValue?.width ?? '0'

  if (active.has(side)) {
    active.delete(side)
    // If all sides are unselected, set width to 0
    if (active.size === 0) {
      newWidth = '0'
    }
  } else {
    active.add(side)
    // If width is 0 and user selects a side, set width to 1px
    if (currentWidth.value === 0) {
      newWidth = '1'
    }
  }

  emit('update:modelValue', {
    width: newWidth,
    color: props.modelValue?.color ?? '',
    radius: props.modelValue?.radius ?? '0',
    sides: Array.from(active).join(','),
  })
}

function updateWidth(value: string) {
  const newWidth = parseInt(value, 10)
  let newSides = props.modelValue?.sides ?? 'top,right,bottom,left'

  // If width goes to 0, clear all sides
  if (newWidth === 0) {
    newSides = ''
  }
  // If width goes from 0 to 1+, select all sides
  else if (currentWidth.value === 0 && newWidth > 0) {
    newSides = 'top,right,bottom,left'
  }

  emit('update:modelValue', {
    width: value,
    color: props.modelValue?.color ?? '',
    radius: props.modelValue?.radius ?? '0',
    sides: newSides,
  })
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
      <div class="flex p-0.5 bg-secondary rounded-md">
        <Tooltip v-for="side in sides" :key="side.key" :text="side.tooltip">
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 rounded transition-colors"
            :class="isSideActive(side.key)
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'"
            @click="toggleSide(side.key)"
          >
            <Icon :name="side.icon" :size="12" />
          </button>
        </Tooltip>
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
        @update:model-value="updateWidth"
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
        side="left"
        @update:model-value="update('color', $event)"
      />
    </InspectorField>
  </div>
</template>
