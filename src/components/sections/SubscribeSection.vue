<script setup lang="ts">
/**
 * SUBSCRIBE SECTION
 *
 * Router component that delegates to variant-specific subcomponents.
 *
 * Variants (EXACTLY 2):
 * - stacked: Simple vertical layout
 * - split: Two-column layout with content left/right
 *
 * NO layout logic here - only routing.
 */

import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { SubscribeData } from '@/lib/section-registry'
import type {
  SectionStyleProperties,
  FieldStyles,
  ItemStyleProperties,
  SelectionPayload,
  ActiveNodeType,
} from '@/types/sections'
import SubscribeStacked from './subscribe/SubscribeStacked.vue'
import SubscribeSplit from './subscribe/SubscribeSplit.vue'

const props = defineProps<{
  data: SubscribeData
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
  <SubscribeSplit
    v-if="variant === 'split'"
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
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
  <SubscribeStacked
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
    @selectField="handleSelectField"
    @update="handleUpdate"
  />
</template>
