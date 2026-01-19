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

import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { CardsData } from '@/lib/section-registry'
import type {
  SectionStyleProperties,
  ItemStyleProperties,
  FieldStyles,
  SelectionPayload,
  ActiveNodeType,
} from '@/types/sections'
import CardsGrid from './cards/CardsGrid.vue'
import CardsCarousel from './cards/CardsCarousel.vue'
import CardsRow from './cards/CardsRow.vue'
import CardsSplit from './cards/CardsSplit.vue'

const props = defineProps<{
  data: CardsData
  variant: string
  sectionStyles?: SectionStyleProperties
  itemStyles?: ItemStyleProperties
  fieldStyles?: FieldStyles
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
  <CardsGrid
    v-if="variant === 'grid'"
    :data="data"
    :section-styles="sectionStyles"
    :item-styles="itemStyles"
    :field-styles="fieldStyles"
    :editable="editable"
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @select-field="handleSelectField"
    @update="handleUpdate"
  />
  <CardsCarousel
    v-else-if="variant === 'carousel'"
    :data="data"
    :section-styles="sectionStyles"
    :item-styles="itemStyles"
    :field-styles="fieldStyles"
    :editable="editable"
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @select-field="handleSelectField"
    @update="handleUpdate"
  />
  <CardsRow
    v-else-if="variant === 'row'"
    :data="data"
    :section-styles="sectionStyles"
    :item-styles="itemStyles"
    :field-styles="fieldStyles"
    :editable="editable"
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @select-field="handleSelectField"
    @update="handleUpdate"
  />
  <CardsSplit
    v-else
    :data="data"
    :section-styles="sectionStyles"
    :item-styles="itemStyles"
    :field-styles="fieldStyles"
    :editable="editable"
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @select-field="handleSelectField"
    @update="handleUpdate"
  />
</template>
