/**
 * Section Context Menu Composable
 *
 * Provides context menu actions for sections across canvas and sidebar.
 * Handles: Edit, AI content, Auto-translate, Add item, Duplicate, Delete
 */

import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { useAssistantStore } from '@/stores/assistant'
import { getSectionDefinition } from '@/lib/section-registry'
import type { SectionInstance } from '@/types/sections'

export interface SectionMenuContext {
  section: SectionInstance
  fieldKey?: string  // For content-level menus
}

export function useSectionContextMenu() {
  const editor = useEditorStore()
  const assistant = useAssistantStore()

  // Check if section has repeatable items
  function hasRepeatableItems(section: SectionInstance): boolean {
    const def = getSectionDefinition(section.type)
    if (!def) return false
    return def.schema.some(field => field.type === 'repeater')
  }

  // Get repeater field info for "Add item" label
  function getRepeatableInfo(section: SectionInstance) {
    const def = getSectionDefinition(section.type)
    if (!def) return null
    const repeater = def.schema.find(field => field.type === 'repeater')
    if (!repeater) return null
    return {
      key: repeater.key,
      label: repeater.label.replace(/s$/, '') // "Cards" -> "Card"
    }
  }

  // Check if auto-translate should show
  const showAutoTranslate = computed(() => {
    return editor.hasTranslations &&
           editor.currentLanguage !== null &&
           editor.currentLanguage !== editor.defaultLanguage
  })

  // Actions
  function editSection(sectionId: string) {
    editor.selectSection(sectionId)
    // Inspector will open automatically when section is selected
  }

  function editContent(sectionId: string, fieldKey: string) {
    editor.selectFieldNode(sectionId, fieldKey)
  }

  function aiContent(sectionId: string, sectionType: string) {
    const def = getSectionDefinition(sectionType)
    const displayName = def?.displayName || sectionType
    assistant.open()
    assistant.prefillMessage(`Edit the content of ${displayName} section`)
  }

  function autoTranslate(sectionId: string) {
    // TODO: Implement auto-translate via AI
    const section = editor.sections.find(s => s.id === sectionId)
    if (!section) return
    assistant.open()
    assistant.prefillMessage(`Translate the ${section.type} section to ${editor.currentLanguage}`)
  }

  function addItem(sectionId: string, repeaterKey: string) {
    editor.addRepeaterItem(sectionId, repeaterKey)
  }

  function duplicateSection(sectionId: string) {
    editor.duplicateSection(sectionId)
  }

  function deleteSection(sectionId: string) {
    editor.removeSection(sectionId)
  }

  function hideContent(sectionId: string, fieldKey: string) {
    editor.toggleFieldVisibility(sectionId, fieldKey)
  }

  return {
    // State
    showAutoTranslate,

    // Helpers
    hasRepeatableItems,
    getRepeatableInfo,

    // Actions
    editSection,
    editContent,
    aiContent,
    autoTranslate,
    addItem,
    duplicateSection,
    deleteSection,
    hideContent,
  }
}
