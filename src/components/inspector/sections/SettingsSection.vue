<script setup lang="ts">
import type { SectionBlockType } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import SharedStyleField from '../SharedStyleField.vue'

const props = defineProps<{
  blockId: string
  blockType: SectionBlockType
}>()

const emit = defineEmits<{
  openCreateStyleModal: []
}>()
</script>

<template>
  <InspectorSection title="Settings" icon="cog">
    <SharedStyleField
      :block-id="props.blockId"
      :block-type="props.blockType"
      @open-create-modal="emit('openCreateStyleModal')"
    />
  </InspectorSection>
</template>
