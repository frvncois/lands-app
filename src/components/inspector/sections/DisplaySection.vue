<script setup lang="ts">
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SliderInput from '../SliderInput.vue'
import SizeInput from '../SizeInput.vue'

const props = defineProps<{
  // Size
  width?: string
  height?: string
  // Layout
  direction?: string
  justify?: string
  align?: string
  gap?: string
  columns?: number
  rows?: number
  // Visibility flags
  hideDirection?: boolean
  hideLayout?: boolean
  isGrid?: boolean
}>()

const emit = defineEmits<{
  'update:width': [value: string]
  'update:height': [value: string]
  'update:direction': [value: string]
  'update:justify': [value: string]
  'update:align': [value: string]
  'update:gap': [value: string]
  'update:columns': [value: number]
  'update:rows': [value: number]
}>()

// justify-content/justify-items options (flex-start/flex-end work for both flex and grid)
const justifyOptions = [
  { value: 'flex-start', label: 'Start', icon: 'style-justify-start' },
  { value: 'center', label: 'Center', icon: 'style-justify-center' },
  { value: 'flex-end', label: 'End', icon: 'style-justify-end' },
  { value: 'space-between', label: 'Space Between', icon: 'style-justify-space-between' },
  { value: 'stretch', label: 'Stretch', icon: 'style-align-stretch' },
]

// align-items options (flex-start/flex-end work for both flex and grid)
const alignOptions = [
  { value: 'flex-start', label: 'Start', icon: 'style-align-start' },
  { value: 'center', label: 'Center', icon: 'style-justify-center' },
  { value: 'flex-end', label: 'End', icon: 'style-align-bottom' },
  { value: 'stretch', label: 'Stretch', icon: 'style-align-stretch' },
]
</script>

<template>
  <InspectorSection title="Display" icon="style-row">
    <!-- Size -->
    <InspectorField label="Width" horizontal>
      <SizeInput
        :model-value="width || ''"
        placeholder="auto"
        @update:model-value="emit('update:width', $event)"
      />
    </InspectorField>
    <InspectorField label="Height" horizontal>
      <SizeInput
        :model-value="height || ''"
        placeholder="auto"
        @update:model-value="emit('update:height', $event)"
      />
    </InspectorField>

    <!-- Layout (only for layout blocks) -->
    <template v-if="!hideLayout">
      <InspectorField v-if="!hideDirection" label="Direction" horizontal>
        <SegmentedControl
          :options="[
            { value: 'column', label: 'Column', icon: 'style-column' },
            { value: 'row', label: 'Row', icon: 'style-row' },
          ]"
          :model-value="direction || 'column'"
          icon-only
          @update:model-value="emit('update:direction', $event)"
        />
      </InspectorField>
      <InspectorField label="Justify" horizontal>
        <SegmentedControl
          :options="justifyOptions"
          :model-value="justify || 'flex-start'"
          icon-only
          @update:model-value="emit('update:justify', $event)"
        />
      </InspectorField>
      <InspectorField label="Align" horizontal>
        <SegmentedControl
          :options="alignOptions"
          :model-value="align || 'flex-start'"
          icon-only
          @update:model-value="emit('update:align', $event)"
        />
      </InspectorField>
      <!-- Grid-specific: Columns and Rows -->
      <template v-if="isGrid">
        <InspectorField label="Columns" horizontal>
          <SliderInput
            :model-value="String(columns || 2)"
            :min="1"
            :max="12"
            :step="1"
            unit=""
            @update:model-value="emit('update:columns', Number($event))"
          />
        </InspectorField>
        <InspectorField label="Rows" horizontal>
          <SliderInput
            :model-value="String(rows || 2)"
            :min="1"
            :max="12"
            :step="1"
            unit=""
            @update:model-value="emit('update:rows', Number($event))"
          />
        </InspectorField>
      </template>
      <InspectorField label="Gap" horizontal>
        <SizeInput
          :model-value="gap"
          placeholder="16px"
          @update:model-value="emit('update:gap', $event)"
        />
      </InspectorField>
    </template>
  </InspectorSection>
</template>
