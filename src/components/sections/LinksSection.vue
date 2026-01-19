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

import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { LinksData } from '@/lib/section-registry'
import type {
  SectionStyleProperties,
  FieldStyles,
  ItemStyleProperties,
  SelectionPayload,
  ActiveNodeType,
} from '@/types/sections'
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
  <LinksGrid
    v-if="variant === 'grid'"
    :data="data"
    :section-styles="sectionStyles"
    :field-styles="fieldStyles"
    :item-styles="itemStyles"
    :editable="editable"
    :active-field="activeField"
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @select-field="handleSelectField"
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
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @select-field="handleSelectField"
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
    :active-node-id="activeNodeId"
    :active-node-type="activeNodeType"
    :active-field-key="activeFieldKey"
    :active-item-id="activeItemId"
    :hidden-fields="hiddenFields"
    @select-field="handleSelectField"
    @update="handleUpdate"
  />
</template>
