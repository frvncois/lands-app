<script setup lang="ts">
import type { Spacing } from '@/types/designer'
import InspectorSection from '../InspectorSection.vue'
import BoxModelInput from '../BoxModelInput.vue'

defineProps<{
  margin?: Spacing
  padding?: Spacing
}>()

const emit = defineEmits<{
  'update:margin': [value: Spacing]
  'update:padding': [value: Spacing]
}>()
</script>

<template>
  <InspectorSection title="Spacing" icon="style-justify-between">
    <BoxModelInput
      :margin="margin"
      :padding="padding"
      @update:margin="emit('update:margin', $event)"
      @update:padding="emit('update:padding', $event)"
    />
  </InspectorSection>
</template>
