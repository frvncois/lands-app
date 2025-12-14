<script setup lang="ts">
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SliderInput from '../SliderInput.vue'

defineProps<{
  rotate?: string
  scale?: string
  translateX?: string
  translateY?: string
  blur?: string
}>()

const emit = defineEmits<{
  'update:rotate': [value: string]
  'update:scale': [value: string]
  'update:translateX': [value: string]
  'update:translateY': [value: string]
  'update:blur': [value: string]
}>()
</script>

<template>
  <InspectorSection title="Transform" icon="app-undo">
    <InspectorField label="Rotate" horizontal>
      <SliderInput
        :model-value="rotate || '0'"
        :min="-180"
        :max="180"
        :step="1"
        unit="°"
        @update:model-value="emit('update:rotate', $event)"
      />
    </InspectorField>
    <InspectorField label="Scale" horizontal>
      <SliderInput
        :model-value="scale || '100'"
        :min="10"
        :max="200"
        :step="5"
        unit="%"
        @update:model-value="emit('update:scale', $event)"
      />
    </InspectorField>
    <InspectorField label="Translate X" horizontal>
      <SliderInput
        :model-value="translateX || '0'"
        :min="-200"
        :max="200"
        :step="1"
        unit="px"
        @update:model-value="emit('update:translateX', $event)"
      />
    </InspectorField>
    <InspectorField label="Translate Y" horizontal>
      <SliderInput
        :model-value="translateY || '0'"
        :min="-200"
        :max="200"
        :step="1"
        unit="px"
        @update:model-value="emit('update:translateY', $event)"
      />
    </InspectorField>
    <InspectorField label="Blur" horizontal>
      <SliderInput
        :model-value="blur || '0'"
        :min="0"
        :max="20"
        :step="1"
        unit="px"
        @update:model-value="emit('update:blur', $event)"
      />
    </InspectorField>
  </InspectorSection>
</template>
