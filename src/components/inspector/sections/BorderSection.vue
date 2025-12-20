<script setup lang="ts">
import type { BorderStyle } from '@/types/designer'
import InspectorSection from '../InspectorSection.vue'
import BorderInput from '../BorderInput.vue'

defineProps<{
  modelValue?: BorderStyle
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BorderStyle]
}>()
</script>

<template>
  <InspectorSection title="Border" icon="style-border-top">
    <BorderInput
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </InspectorSection>
</template>
