<script setup lang="ts">
import type { SectionBlockType } from '@/types/editor'

import InspectorSection from '../InspectorSection.vue'
import SharedStyleField from '../SharedStyleField.vue'
import InteractionField from '../InteractionField.vue'

const props = defineProps<{
  blockId: string
  blockType: SectionBlockType
}>()

const emit = defineEmits<{
  openCreateStyleModal: []
  editInteraction: [interactionId: string]
  createInteraction: []
}>()
</script>

<template>
  <InspectorSection title="Settings" icon="cog">
    <SharedStyleField
      :block-id="props.blockId"
      :block-type="props.blockType"
      @open-create-modal="emit('openCreateStyleModal')"
    />
    <InteractionField
      :block-id="props.blockId"
      @edit="emit('editInteraction', $event)"
      @create="emit('createInteraction')"
    />
  </InspectorSection>
</template>
