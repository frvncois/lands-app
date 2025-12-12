<script setup lang="ts">
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SegmentedControl from '../SegmentedControl.vue'
import ColorInput from '../ColorInput.vue'
import ImageInput from '../ImageInput.vue'
import TextInput from '../TextInput.vue'

defineProps<{
  backgroundType?: 'color' | 'image' | 'video'
  backgroundColor?: string
  backgroundImage?: string
  backgroundVideo?: string
}>()

const emit = defineEmits<{
  'update:backgroundType': [value: 'color' | 'image' | 'video']
  'update:backgroundColor': [value: string]
  'update:backgroundImage': [value: string]
  'update:backgroundVideo': [value: string]
}>()

const backgroundTypeOptions = [
  { value: 'color', label: 'Color', icon: 'style-color' },
  { value: 'image', label: 'Image', icon: 'content-image' },
  { value: 'video', label: 'Video', icon: 'content-video' },
]
</script>

<template>
  <InspectorSection title="Background" icon="content-image">
    <InspectorField label="Type" horizontal>
      <SegmentedControl
        :options="backgroundTypeOptions"
        :model-value="backgroundType || 'color'"
        icon-only
        @update:model-value="emit('update:backgroundType', $event as 'color' | 'image' | 'video')"
      />
    </InspectorField>
    <InspectorField
      v-if="backgroundType === 'color' || !backgroundType"
      label="Color"
      horizontal
    >
      <ColorInput
        :model-value="backgroundColor"
        swatch-only
        @update:model-value="emit('update:backgroundColor', $event)"
      />
    </InspectorField>
    <InspectorField v-else-if="backgroundType === 'image'" label="Image">
      <ImageInput
        :model-value="backgroundImage || ''"
        placeholder="Upload background image"
        @update:model-value="emit('update:backgroundImage', $event)"
      />
    </InspectorField>
    <InspectorField v-else label="Video URL">
      <TextInput
        :model-value="backgroundVideo || ''"
        placeholder="YouTube, Vimeo, or file URL"
        @update:model-value="emit('update:backgroundVideo', $event)"
      />
    </InspectorField>
  </InspectorSection>
</template>
