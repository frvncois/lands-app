<script setup lang="ts">
/**
 * PROMO SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 2):
 * - card: Card-style with border/container
 * - split: Two-column layout (Content | Image)
 *
 * NO layout logic here - only routing.
 */

import { computed } from 'vue'
import type { PromoData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles, ItemStyleProperties } from '@/types/sections'
import PromoCard from './promo/PromoCard.vue'
import PromoSplit from './promo/PromoSplit.vue'

const props = defineProps<{
  data: PromoData
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

// Centralized spacing control for all promo variants
const spaceBetween = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return (styles?.spaceBetween as number) ?? 32
})

// Smart background toggle
const smartBackground = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return (styles?.smartBackground as boolean) ?? false
})

// Smart background opacity (0-1)
const smartBackgroundOpacity = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return (styles?.smartBackgroundOpacity as number) ?? 0.4
})

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
  <PromoCard
    v-if="variant === 'card'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :item-styles="itemStyles"
    :is-editing="isEditing"
    :editable="editable"
    :active-field="activeField"
    :active-item-index="activeItemIndex"
    :hidden-fields="hiddenFields"
    :space-between="spaceBetween"
    :smart-background="smartBackground"
    :smart-background-opacity="smartBackgroundOpacity"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <PromoSplit
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
    :space-between="spaceBetween"
    :smart-background="smartBackground"
    :smart-background-opacity="smartBackgroundOpacity"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
</template>
