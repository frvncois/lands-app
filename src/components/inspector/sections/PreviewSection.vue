<script setup lang="ts">
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SegmentedControl from '../SegmentedControl.vue'

interface Props {
  previewState?: 'closed' | 'open'
}

const props = withDefaults(defineProps<Props>(), {
  previewState: 'open',
})

const emit = defineEmits<{
  'update:previewState': [value: 'closed' | 'open']
}>()

const stateOptions = [
  { value: 'closed', label: 'Closed' },
  { value: 'open', label: 'Open' },
]
</script>

<template>
  <InspectorSection title="Preview" icon="eye">
    <InspectorField label="State" horizontal>
      <SegmentedControl
        :model-value="previewState"
        :options="stateOptions"
        @update:model-value="emit('update:previewState', $event as 'closed' | 'open')"
      />
    </InspectorField>
  </InspectorSection>
</template>
