<script setup lang="ts">
/**
 * SECTION RENDERER
 *
 * Renders a section instance using its registered component.
 * Passes data, variant, theme, and editing capabilities as props.
 */

import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { getSectionDefinition } from '@/lib/section-registry'
import type { SectionInstance } from '@/types/sections'

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
const activeField = computed(() => {
  if (!props.isSelected) return null
  return editor.activeField
})

// Active item index for repeater fields (only when selected)
const activeItemIndex = computed(() => {
  if (!props.isSelected) return null
  return editor.activeItemIndex
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
function handleFieldSelect(fieldKey: string) {
  // First select this section if not already selected
  if (!props.isSelected) {
    emit('select')
  }

  // Parse dotted paths like "links.0" for repeater item selection
  const dotIndex = fieldKey.lastIndexOf('.')
  if (dotIndex > 0) {
    const maybeIndex = fieldKey.slice(dotIndex + 1)
    const parsedIndex = parseInt(maybeIndex, 10)
    if (!isNaN(parsedIndex)) {
      // This is a repeater item selection (e.g., "links.0")
      const repeaterKey = fieldKey.slice(0, dotIndex)
      editor.setActiveField(repeaterKey)
      editor.setActiveItem(parsedIndex)
      return
    }
  }

  // Regular field selection
  editor.setActiveField(fieldKey)
  editor.setActiveItem(null)
}

// Handler for clicking on section background (not a field)
function handleSectionClick() {
  emit('select')
  // Clear active field when clicking section background
  editor.setActiveField(null)
}
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
  </div>
</template>
