<script setup lang="ts">
import { computed } from 'vue'
import type { SectionBlockType, LayoutHtmlTag, ContainerHtmlTag } from '@/types/designer'
import { useDesignerStore } from '@/stores/designer'

import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SelectInput from '../SelectInput.vue'
import SharedStyleField from '../SharedStyleField.vue'

const props = defineProps<{
  blockId: string
  blockType: SectionBlockType
}>()

const emit = defineEmits<{
  openCreateStyleModal: []
}>()

const designerStore = useDesignerStore()

// Get current block settings
const block = computed(() => designerStore.findBlockById(props.blockId))

// HTML tag options for layout blocks (stack, grid)
const layoutHtmlTagOptions = [
  { value: 'div', label: 'Div' },
  { value: 'header', label: 'Header' },
  { value: 'nav', label: 'Nav' },
  { value: 'footer', label: 'Footer' },
  { value: 'article', label: 'Article' },
]

// HTML tag options for container
const containerHtmlTagOptions = [
  { value: 'section', label: 'Section' },
  { value: 'div', label: 'Div' },
]

// Check if block type supports HTML tag selection
const showHtmlTagSelect = computed(() => {
  return ['container', 'stack', 'grid'].includes(props.blockType)
})

// Get options based on block type
const htmlTagOptions = computed(() => {
  return props.blockType === 'container' ? containerHtmlTagOptions : layoutHtmlTagOptions
})

// Get current HTML tag value
const currentHtmlTag = computed(() => {
  const settings = block.value?.settings as Record<string, unknown> | undefined
  if (props.blockType === 'container') {
    return (settings?.htmlTag as ContainerHtmlTag) || 'section'
  }
  return (settings?.htmlTag as LayoutHtmlTag) || 'div'
})

// Update HTML tag
function updateHtmlTag(value: string) {
  designerStore.updateBlockSettings(props.blockId, { htmlTag: value })
}
</script>

<template>
  <InspectorSection title="Settings" icon="cog">
    <SharedStyleField
      :block-id="props.blockId"
      :block-type="props.blockType"
      @open-create-modal="emit('openCreateStyleModal')"
    />

    <!-- HTML Tag Type (for layout blocks) -->
    <InspectorField v-if="showHtmlTagSelect" label="Type" horizontal>
      <SelectInput
        :model-value="currentHtmlTag"
        :options="htmlTagOptions"
        @update:model-value="updateHtmlTag"
      />
    </InspectorField>
  </InspectorSection>
</template>
