<script setup lang="ts">
/**
 * CTA SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants:
 * - stacked: Centered single-column layout
 * - split: Two-column layout [Headline + Subheadline] [Paragraph + Button]
 *
 * NO layout logic here - only routing.
 * NO images, NO icons, NO forms.
 */

import type { CTABlockData } from '@/lib/section-registry'
import type { SectionStyleProperties, FieldStyles } from '@/types/sections'
import CTAStacked from './cta/CTAStacked.vue'
import CTASplit from './cta/CTASplit.vue'

const props = defineProps<{
  data: CTABlockData
  variant: string
  sectionStyles?: SectionStyleProperties
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
  <CTAStacked
    v-if="variant === 'stacked'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    @select-field="handleSelectField"
    @update="handleUpdate"
  />
  <CTASplit
    v-else
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :editable="editable"
    :active-field="activeField"
    :hidden-fields="hiddenFields"
    @select-field="handleSelectField"
    @update="handleUpdate"
  />
</template>
