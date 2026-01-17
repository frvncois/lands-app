<script setup lang="ts">
/**
 * CONTENT SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 4):
 * - stacked: Media and content stacked vertically (3 layout options)
 * - overlay: Content layered inside media (9 position options)
 * - split: Media and content side-by-side (2 layout options)
 * - presentation: Profile-style content with small rounded image
 *
 * All style options are now in SectionStyleProperties:
 * - spaceBetween, heroStackedLayout, overlayHeight, overlayPositionX, overlayPositionY,
 *   overlayOpacity, overlayBlur, heroSplitHeight, heroSplitContentPosition, heroPresentationLayout
 */

import type { ContentData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import ContentStacked from './content/ContentStacked.vue'
import ContentOverlay from './content/ContentOverlay.vue'
import ContentSplit from './content/ContentSplit.vue'
import ContentPresentation from './content/ContentPresentation.vue'

defineProps<{
  data: ContentData
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
</script>

<template>
  <ContentStacked
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
  <ContentOverlay
    v-else-if="variant === 'overlay'"
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
  <ContentSplit
    v-else-if="variant === 'split'"
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
  <ContentPresentation
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
