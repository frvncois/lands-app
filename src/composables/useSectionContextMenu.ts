/**
 * Section Context Menu Composable
 *
 * Provides context menu actions for sections across canvas and sidebar.
 * Handles: Edit, Add item, Duplicate, Delete
 */

import { useEditorStore } from '@/stores/editor'
import { getSectionDefinition } from '@/lib/section-registry'
import type { SectionInstance } from '@/types/sections'

export interface SectionMenuContext {
  section: SectionInstance
  fieldKey?: string  // For content-level menus
}

export function useSectionContextMenu() {
  const editor = useEditorStore()

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

  // Actions
  function editSection(sectionId: string) {
    editor.selectSection(sectionId)
    // Inspector will open automatically when section is selected
  }

  function editContent(sectionId: string, fieldKey: string) {
    editor.selectFieldNode(sectionId, fieldKey)
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
    // Helpers
    hasRepeatableItems,
    getRepeatableInfo,

    // Actions
    editSection,
    editContent,
    addItem,
    duplicateSection,
    deleteSection,
    hideContent,
  }
}
