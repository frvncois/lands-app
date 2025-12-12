<script setup lang="ts">
import {
  justifyContentOptions,
  alignItemsOptions,
  flexDirectionOptions,
  flexWrapOptions,
} from '@/lib/editor-utils'
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SliderInput from '../SliderInput.vue'

interface Props {
  flexDirection?: string
  justifyContent?: string
  alignItems?: string
  flexWrap?: string
  gap?: string
  showDirection?: boolean
  showJustify?: boolean
  showAlign?: boolean
  showWrap?: boolean
  showGap?: boolean
}

withDefaults(defineProps<Props>(), {
  showDirection: true,
  showJustify: true,
  showAlign: true,
  showWrap: false,
  showGap: true,
})

const emit = defineEmits<{
  'update:flexDirection': [value: string]
  'update:justifyContent': [value: string]
  'update:alignItems': [value: string]
  'update:flexWrap': [value: string]
  'update:gap': [value: string]
}>()

const directionOptions = [
  { value: 'column', label: 'Column', icon: 'style-column' },
  { value: 'row', label: 'Row', icon: 'style-row' },
]
</script>

<template>
  <InspectorSection title="Layout" icon="style-column">
    <InspectorField v-if="showDirection" label="Direction" horizontal>
      <SegmentedControl
        :options="directionOptions"
        :model-value="flexDirection || 'column'"
        icon-only
        @update:model-value="emit('update:flexDirection', $event)"
      />
    </InspectorField>
    <InspectorField v-if="showJustify" label="Justify" horizontal>
      <SegmentedControl
        :options="justifyContentOptions"
        :model-value="justifyContent || 'flex-start'"
        icon-only
        @update:model-value="emit('update:justifyContent', $event)"
      />
    </InspectorField>
    <InspectorField v-if="showAlign" label="Align" horizontal>
      <SegmentedControl
        :options="alignItemsOptions"
        :model-value="alignItems || 'stretch'"
        icon-only
        @update:model-value="emit('update:alignItems', $event)"
      />
    </InspectorField>
    <InspectorField v-if="showWrap" label="Wrap" horizontal>
      <SegmentedControl
        :options="flexWrapOptions"
        :model-value="flexWrap || 'nowrap'"
        @update:model-value="emit('update:flexWrap', $event)"
      />
    </InspectorField>
    <InspectorField v-if="showGap" label="Gap" horizontal>
      <SliderInput
        :model-value="gap || '16'"
        :min="0"
        :max="64"
        :step="4"
        @update:model-value="emit('update:gap', $event)"
      />
    </InspectorField>
  </InspectorSection>
</template>
