<script setup lang="ts">
import { mixBlendModeOptions } from '@/lib/designer-utils'
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SliderInput from '../SliderInput.vue'
import SelectInput from '../SelectInput.vue'

defineProps<{
  opacity?: string | number
  mixBlendMode?: string
}>()

const emit = defineEmits<{
  'update:opacity': [value: string]
  'update:mixBlendMode': [value: string]
}>()
</script>

<template>
  <InspectorSection title="Opacity" icon="app-show">
    <InspectorField label="Opacity" horizontal>
      <SliderInput
        :model-value="opacity || '100'"
        :min="0"
        :max="100"
        :step="5"
        unit="%"
        @update:model-value="emit('update:opacity', $event)"
      />
    </InspectorField>
    <InspectorField label="Blend Mode" horizontal>
      <SelectInput
        :model-value="mixBlendMode || 'normal'"
        :options="mixBlendModeOptions"
        @update:model-value="emit('update:mixBlendMode', $event)"
      />
    </InspectorField>
  </InspectorSection>
</template>
