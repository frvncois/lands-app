<script setup lang="ts">
/**
 * CONTACT SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 2):
 * - stacked: Single-column, everything vertically
 * - split: Two-column with content left, form right
 *
 * NO layout logic here - only routing.
 * NO submission logic - forms do nothing.
 */

import type { ContactData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import ContactStacked from './contact/ContactStacked.vue'
import ContactSplit from './contact/ContactSplit.vue'

const props = defineProps<{
  data: ContactData
  variant: string
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  isEditing?: boolean
  editable?: boolean
  activeField?: string | null
  activeItemIndex?: number | null
  hiddenFields?: string[]
}>()

const emit = defineEmits<{
  selectField: [fieldKey: string]
  'update': [fieldKey: string, value: unknown]
}>()

function handleSelectField(fieldKey: string) {
  emit('selectField', fieldKey)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}
</script>

<template>
  <ContactStacked
    v-if="variant === 'stacked'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :item-styles="itemStyles"
    :is-editing="isEditing"
    :editable="editable"
    :active-field="activeField"
    :active-item-index="activeItemIndex"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <ContactSplit
    v-else
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :item-styles="itemStyles"
    :is-editing="isEditing"
    :editable="editable"
    :active-field="activeField"
    :active-item-index="activeItemIndex"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
</template>
