<script setup lang="ts">
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SizeInput from '../SizeInput.vue'

const props = defineProps<{
  direction?: string
  justify?: string
  align?: string
  gap?: string
  hideDirection?: boolean
}>()

const emit = defineEmits<{
  'update:direction': [value: string]
  'update:justify': [value: string]
  'update:align': [value: string]
  'update:gap': [value: string]
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
    <InspectorField label="Gap" horizontal>
      <SizeInput
        :model-value="gap"
        placeholder="16px"
        @update:model-value="emit('update:gap', $event)"
      />
    </InspectorField>
  </InspectorSection>
</template>
