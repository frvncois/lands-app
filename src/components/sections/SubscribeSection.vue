<script setup lang="ts">
/**
 * SUBSCRIBE SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 2):
 * - stacked: Centered single-column layout
 * - split: Two-column layout
 *
 * NO layout logic here - only routing.
 * NO backend logic - form does nothing.
 */

import type { SubscribeData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, SelectionPayload } from '@/types/sections'
import SubscribeStacked from './subscribe/SubscribeStacked.vue'
import SubscribeSplit from './subscribe/SubscribeSplit.vue'

const props = defineProps<{
  data: SubscribeData
  variant: string
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  isEditing?: boolean
  editable?: boolean
  activeField?: string | null
  hiddenFields?: string[]
}>()

const emit = defineEmits<{
  selectField: [payload: SelectionPayload | string]
  'update': [fieldKey: string, value: unknown]
}>()

function handleSelectField(payload: SelectionPayload | string) {
  emit('selectField', payload)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}
</script>

<template>
  <SubscribeStacked
    v-if="variant === 'stacked'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :is-editing="isEditing"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <SubscribeSplit
    v-else
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :is-editing="isEditing"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
</template>
