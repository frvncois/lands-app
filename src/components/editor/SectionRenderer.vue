<script setup lang="ts">
/**
 * SECTION RENDERER
 *
 * Renders a section instance using its registered component.
 * Passes data, variant, theme, and editing capabilities as props.
 */

import { computed, ref, provide } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { getSectionDefinition } from '@/lib/section-registry'
import type { SectionInstance, SelectionPayload } from '@/types/sections'
import SectionContextMenu from './SectionContextMenu.vue'

const props = defineProps<{
  section: SectionInstance
  isSelected?: boolean
  isEditing?: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

const editor = useEditorStore()

const definition = computed(() => getSectionDefinition(props.section.type))

const sectionComponent = computed(() => definition.value?.component)

// Check if this is a header section that should be sticky
const isHeaderSection = computed(() => props.section.type === 'header')
const isHeaderSticky = computed(() => {
  if (!isHeaderSection.value) return false
  const styles = props.section.styles as Record<string, unknown> | undefined
  return styles?.sticky !== false // Default to true
})

// Get section data with translations applied (if viewing a translated language)
const sectionData = computed(() => {
  return editor.getSectionDataForLanguage(props.section, editor.currentLanguage)
})

// Active field for the current section (only when selected)
const activeNode = computed(() => editor.activeNode)

const activeField = computed(() => {
  if (!props.isSelected) return null
  const node = activeNode.value
  if (!node || node.sectionId !== props.section.id) return null
  if (node.type === 'field' || node.type === 'item') {
    return node.fieldKey ?? null
  }
  return null
})

const activeItemIndex = computed(() => {
  if (!props.isSelected) return null
  const node = activeNode.value
  if (!node || node.sectionId !== props.section.id) return null

  if (node.type === 'item' && node.fieldKey && node.itemId) {
    const items = getRepeaterItems(node.fieldKey)
    if (!items) return null
    const index = items.findIndex(item => typeof item === 'object' && (item as { id?: string }).id === node.itemId)
    return index === -1 ? null : index
  }

  return null
})

// Get hidden fields for this section as an array
const hiddenFields = computed(() => {
  const hidden = editor.hiddenFields[props.section.id]
  return hidden ? Array.from(hidden) : []
})

// Handler for inline content updates from section components
function handleFieldUpdate(key: string, value: unknown) {
  // If editing a translation language, save to translations
  if (editor.currentLanguage && editor.translationSettings && editor.currentLanguage !== editor.translationSettings.defaultLanguage) {
    editor.updateTranslation(props.section.id, editor.currentLanguage, { [key]: value })
  } else {
    // Otherwise save to default section data
    editor.updateSectionData(props.section.id, { [key]: value })
  }
}

// Handler for field selection from section components
function handleFieldSelect(payload: SelectionPayload | string) {
  if (!props.isSelected) {
    emit('select')
  }

  if (typeof payload === 'string') {
    handleLegacySelection(payload)
    return
  }

  switch (payload.type) {
    case 'item':
      if (payload.fieldKey && payload.itemId) {
        editor.selectItemNode(props.section.id, payload.fieldKey, payload.itemId)
      }
      break
    case 'field':
      if (payload.fieldKey) {
        editor.selectFieldNode(props.section.id, payload.fieldKey)
      }
      break
    case 'section':
      editor.selectSection(props.section.id)
      break
  }
}

function handleLegacySelection(fieldKey: string) {
  // Parse dotted paths like "links.0" for repeater item selection
  const dotIndex = fieldKey.lastIndexOf('.')
  if (dotIndex > 0) {
    const maybeIndex = fieldKey.slice(dotIndex + 1)
    const parsedIndex = parseInt(maybeIndex, 10)
    if (!isNaN(parsedIndex)) {
      const repeaterKey = fieldKey.slice(0, dotIndex)
      const items = getRepeaterItems(repeaterKey)
      const targetId = items?.[parsedIndex]?.id
      if (targetId) {
        editor.selectItemNode(props.section.id, repeaterKey, targetId)
      } else {
        editor.selectFieldNode(props.section.id, repeaterKey)
      }
      return
    }
  }

  editor.selectFieldNode(props.section.id, fieldKey)
}

function getRepeaterItems(fieldKey: string): { id?: string }[] | null {
  const value = (props.section.data as Record<string, unknown>)[fieldKey]
  if (!Array.isArray(value)) return null
  return value as { id?: string }[]
}

// Handler for clicking on section background (not a field)
function handleSectionClick() {
  emit('select')
  editor.selectSection(props.section.id)
}

// Context menu refs
const sectionMenuRef = ref<InstanceType<typeof SectionContextMenu> | null>(null)
const contentMenuRef = ref<InstanceType<typeof SectionContextMenu> | null>(null)
const activeContentField = ref<string | null>(null)

// Right-click handlers
function handleSectionContextMenu(event: MouseEvent) {
  if (!props.isEditing) return
  event.preventDefault()
  sectionMenuRef.value?.open(event)
}

function handleContentContextMenu(event: MouseEvent, fieldKey: string) {
  if (!props.isEditing) return
  event.preventDefault()
  event.stopPropagation()
  activeContentField.value = fieldKey
  contentMenuRef.value?.open(event)
}

// Expose content context menu handler to child components via provide
provide('contentContextMenu', handleContentContextMenu)
</script>

<template>
  <div
    class="relative group"
    :class="[
      isEditing && 'cursor-pointer',
      isEditing && !isSelected && 'hover:outline hover:outline-border hover:-outline-offset-1',
      isSelected && 'outline outline-primary -outline-offset-1',
      isHeaderSticky && 'sticky top-0 z-50'
    ]"
    @click.stop="handleSectionClick"
    @contextmenu="handleSectionContextMenu"
  >
    <!-- Section wrapper for editor interactions -->
    <div v-if="isEditing" class="flex absolute top-0 left-0 right-0 pointer-events-none z-10">
      <div
        class="inline-block px-3 py-0.5 bg-primary text-foreground text-xs font-medium rounded-br-md font-sans transition-opacity"
        :class="[
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        ]"
      >
        {{ definition?.displayName || section.type }}
      </div>
    </div>

    <!-- Render the actual section component -->
    <component
      v-if="sectionComponent"
      :is="sectionComponent"
      :data="sectionData"
      :variant="section.variant"
      :theme="editor.theme.tokens"
      :is-editing="isEditing"
      :editable="isEditing && isSelected"
      :active-field="activeField"
      :active-item-index="activeItemIndex"
      :field-styles="section.fieldStyles"
      :section-styles="section.styles"
      :item-styles="section.itemStyles"
      :hidden-fields="hiddenFields"
      @update="handleFieldUpdate"
      @select-field="handleFieldSelect"
    />

    <!-- Fallback if component not found -->
    <div v-else class="p-8 text-center bg-destructive/10 text-destructive font-sans">
      Unknown section type: {{ section.type }}
    </div>

    <!-- Section context menu -->
    <SectionContextMenu
      ref="sectionMenuRef"
      :section="section"
      location="canvas"
    />

    <!-- Content context menu -->
    <SectionContextMenu
      v-if="activeContentField"
      ref="contentMenuRef"
      :section="section"
      :field-key="activeContentField"
      location="canvas"
    />
  </div>
</template>
