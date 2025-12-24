<script setup lang="ts">
/**
 * CARDS SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 3):
 * - grid: Fixed responsive grid (3/2/1 columns)
 * - carousel: Horizontal scrolling with layout options
 * - row: Alternating media/content rows
 *
 * NO layout logic here - only routing.
 * NO buttons - Cards is informational only.
 */

import type { CardsData } from '@/lib/section-registry'
import type { SectionStyleProperties, ItemStyleProperties, FieldStyles } from '@/types/sections'
import CardsGrid from './cards/CardsGrid.vue'
import CardsCarousel from './cards/CardsCarousel.vue'
import CardsRow from './cards/CardsRow.vue'

const props = defineProps<{
  data: CardsData
  variant: string
  sectionStyles?: SectionStyleProperties
  itemStyles?: ItemStyleProperties
  fieldStyles?: FieldStyles
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
  <CardsGrid
    v-if="variant === 'grid'"
    :data="data"
    :section-styles="sectionStyles"
    :item-styles="itemStyles"
    :field-styles="fieldStyles"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <CardsCarousel
    v-else-if="variant === 'carousel'"
    :data="data"
    :section-styles="sectionStyles"
    :item-styles="itemStyles"
    :field-styles="fieldStyles"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <CardsRow
    v-else
    :data="data"
    :section-styles="sectionStyles"
    :item-styles="itemStyles"
    :field-styles="fieldStyles"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
</template>
