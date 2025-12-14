<script setup lang="ts">
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SizeInput from '../SizeInput.vue'
import SliderInput from '../SliderInput.vue'
import SegmentedControl from '../SegmentedControl.vue'

const props = defineProps<{
  width?: string
  height?: string
  overflow?: 'visible' | 'hidden'
  // Grid child span settings
  gridColumnSpan?: number
  gridRowSpan?: number
  parentGridColumns?: number | null
}>()

const emit = defineEmits<{
  'update:width': [value: string]
  'update:height': [value: string]
  'update:overflow': [value: 'visible' | 'hidden']
  'update:gridColumnSpan': [value: number]
  'update:gridRowSpan': [value: number]
}>()

const overflowOptions = [
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
]
</script>

<template>
  <InspectorSection title="Size" icon="style-column">
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
    <InspectorField label="Overflow" horizontal>
      <SegmentedControl
        :options="overflowOptions"
        :model-value="overflow || 'visible'"
        @update:model-value="emit('update:overflow', $event as 'visible' | 'hidden')"
      />
    </InspectorField>

    <!-- Grid span controls (only shown for direct children of grid) -->
    <template v-if="parentGridColumns">
      <InspectorField label="Span Columns" horizontal>
        <SliderInput
          :model-value="String(gridColumnSpan || 1)"
          :min="1"
          :max="parentGridColumns"
          :step="1"
          unit=""
          @update:model-value="emit('update:gridColumnSpan', Number($event))"
        />
      </InspectorField>
      <InspectorField label="Span Rows" horizontal>
        <SliderInput
          :model-value="String(gridRowSpan || 1)"
          :min="1"
          :max="12"
          :step="1"
          unit=""
          @update:model-value="emit('update:gridRowSpan', Number($event))"
        />
      </InspectorField>
    </template>
  </InspectorSection>
</template>
