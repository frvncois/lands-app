<script setup lang="ts">
/**
 * LINKS SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 3):
 * - grid: Responsive grid layout (3/2/1 columns)
 * - split: Two-column layout with links left, content right
 * - stacked: Simple vertical list
 *
 * NO layout logic here - only routing.
 * NO images, NO buttons, NO icons (except arrow indicators).
 */

import type { LinksData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import LinksGrid from './links/LinksGrid.vue'
import LinksSplit from './links/LinksSplit.vue'
import LinksStacked from './links/LinksStacked.vue'

const props = defineProps<{
  data: LinksData
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
  <LinksGrid
    v-if="variant === 'grid'"
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
  <LinksSplit
    v-else-if="variant === 'split'"
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
  <LinksStacked
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
