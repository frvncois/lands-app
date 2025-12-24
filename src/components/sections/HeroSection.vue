<script setup lang="ts">
/**
 * HERO SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 4):
 * - stacked: Media and content stacked vertically (3 layout options)
 * - overlay: Content layered inside media (9 position options)
 * - split: Media and content side-by-side (2 layout options)
 * - presentation: Profile-style hero with small rounded image
 *
 * Style options (via section.styles):
 * - height: 'auto' | 'full' | 'half' (all variants)
 * - stackedLayout: 'option1' | 'option2' | 'option3' (stacked only)
 * - overlayPosition: 9 positions (overlay only)
 * - mediaPosition: 'media-content' | 'content-media' (split only)
 * - presentationLayout: 'option1' | 'option3' (presentation only)
 */

import { computed } from 'vue'
import type { HeroData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import HeroStacked from './hero/HeroStacked.vue'
import HeroOverlay from './hero/HeroOverlay.vue'
import HeroSplit from './hero/HeroSplit.vue'
import HeroPresentation from './hero/HeroPresentation.vue'

const props = defineProps<{
  data: HeroData
  variant: string
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  isEditing?: boolean
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

// Centralized spacing control for all hero variants
const spaceBetween = computed(() => {
  const styles = props.sectionStyles as Record<string, unknown> | undefined
  return (styles?.spaceBetween as number) ?? 32
})
</script>

<template>
  <HeroStacked
    v-if="variant === 'stacked'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :is-editing="isEditing"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    :space-between="spaceBetween"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <HeroOverlay
    v-else-if="variant === 'overlay'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :is-editing="isEditing"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    :space-between="spaceBetween"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <HeroSplit
    v-else-if="variant === 'split'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :is-editing="isEditing"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    :space-between="spaceBetween"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <HeroPresentation
    v-else
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :is-editing="isEditing"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    :space-between="spaceBetween"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
</template>
