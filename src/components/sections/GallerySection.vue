<script setup lang="ts">
/**
 * GALLERY SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 3):
 * - masonry: CSS columns with natural aspect ratios
 * - grid: Fixed responsive grid with uniform squares
 * - carousel: Horizontal scroll with navigation
 *
 * NO layout logic here - only routing.
 * Media only - no captions, no titles.
 */

import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { GalleryData } from '@/lib/section-registry'
import type {
  SectionStyleProperties,
  FieldStyles,
  ItemStyleProperties,
  SelectionPayload,
  ActiveNodeType,
} from '@/types/sections'
import GalleryMasonry from './gallery/GalleryMasonry.vue'
import GalleryGrid from './gallery/GalleryGrid.vue'
import GalleryCarousel from './gallery/GalleryCarousel.vue'

const props = defineProps<{
  data: GalleryData
  variant: string
  sectionStyles?: SectionStyleProperties
  fieldStyles?: FieldStyles
  itemStyles?: ItemStyleProperties
  editable?: boolean
  hiddenFields?: string[]
}>()

const emit = defineEmits<{
  selectField: [payload: SelectionPayload | string]
  'update': [fieldKey: string, value: unknown]
}>()

const editor = useEditorStore()

const currentNode = computed(() => {
  if (!props.editable) return null
  return editor.activeNode || null
})

const activeNodeId = computed(() => currentNode.value?.id ?? null)
const activeNodeType = computed<ActiveNodeType | null>(() => currentNode.value?.type ?? null)
const activeFieldKey = computed(() => currentNode.value?.fieldKey ?? null)
const activeItemId = computed(() => currentNode.value?.itemId ?? null)

function handleSelectField(payload: SelectionPayload | string) {
  emit('selectField', payload)
}

function handleUpdate(fieldKey: string, value: unknown) {
  emit('update', fieldKey, value)
}
</script>

<template>
  <GalleryMasonry
    v-if="variant === 'masonry'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :item-styles="itemStyles"
    :editable="editable"
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <GalleryCarousel
    v-else-if="variant === 'carousel'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :item-styles="itemStyles"
    :editable="editable"
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <GalleryGrid
    v-else
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :item-styles="itemStyles"
    :editable="editable"
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
</template>
