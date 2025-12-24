<script setup lang="ts">
/**
 * ACCORDION SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 2):
 * - list: Headline + paragraph at top, accordion items below
 * - split: Two-column layout with content left, accordion right
 *
 * NO layout logic here - only routing.
 * NO buttons, NO CTAs.
 */

import type { AccordionData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import AccordionList from './accordion/AccordionList.vue'
import AccordionSplit from './accordion/AccordionSplit.vue'

const props = defineProps<{
  data: AccordionData
  variant: string
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  editable?: boolean
  activeField?: string | null
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
  <AccordionList
    v-if="variant === 'list'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :item-styles="itemStyles"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <AccordionSplit
    v-else
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :item-styles="itemStyles"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
</template>
