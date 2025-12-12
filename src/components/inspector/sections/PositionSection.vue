<script setup lang="ts">
import { computed } from 'vue'
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SliderInput from '../SliderInput.vue'
import SelectInput from '../SelectInput.vue'

const props = defineProps<{
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky'
  zIndex?: number | string
  top?: string
  right?: string
  bottom?: string
  left?: string
}>()

const emit = defineEmits<{
  'update:position': [value: string]
  'update:zIndex': [value: string]
  'update:top': [value: string]
  'update:right': [value: string]
  'update:bottom': [value: string]
  'update:left': [value: string]
}>()

const positionOptions = [
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'sticky', label: 'Sticky' },
]

const showOffsets = computed(() => props.position && props.position !== 'relative')
</script>

<template>
  <InspectorSection title="Position" icon="layout-stack">
    <InspectorField label="Type" horizontal>
      <SelectInput
        :model-value="position || 'relative'"
        :options="positionOptions"
        @update:model-value="emit('update:position', $event)"
      />
    </InspectorField>

    <InspectorField label="Z-Index" horizontal>
      <SliderInput
        :model-value="zIndex?.toString() || '0'"
        :min="0"
        :max="100"
        :step="1"
        @update:model-value="emit('update:zIndex', $event)"
      />
    </InspectorField>

    <!-- Offset controls (only for non-relative positions) -->
    <template v-if="showOffsets">
      <InspectorField label="Top" horizontal>
        <SliderInput
          :model-value="top || '0'"
          :min="-100"
          :max="100"
          :step="1"
          unit="px"
          @update:model-value="emit('update:top', $event)"
        />
      </InspectorField>
      <InspectorField label="Right" horizontal>
        <SliderInput
          :model-value="right || '0'"
          :min="-100"
          :max="100"
          :step="1"
          unit="px"
          @update:model-value="emit('update:right', $event)"
        />
      </InspectorField>
      <InspectorField label="Bottom" horizontal>
        <SliderInput
          :model-value="bottom || '0'"
          :min="-100"
          :max="100"
          :step="1"
          unit="px"
          @update:model-value="emit('update:bottom', $event)"
        />
      </InspectorField>
      <InspectorField label="Left" horizontal>
        <SliderInput
          :model-value="left || '0'"
          :min="-100"
          :max="100"
          :step="1"
          unit="px"
          @update:model-value="emit('update:left', $event)"
        />
      </InspectorField>
    </template>
  </InspectorSection>
</template>
