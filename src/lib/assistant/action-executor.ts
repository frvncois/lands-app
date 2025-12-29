/**
 * Action Executor
 *
 * Executes AI actions via the editor store.
 */

import { useEditorStore } from '@/stores/editor'
import type { AIAction } from './action-types'

export interface ExecutionResult {
  success: boolean
  executed: number
  failed: number
  errors: string[]
}

export async function executeActions(actions: AIAction[]): Promise<ExecutionResult> {
  const editorStore = useEditorStore()
  const result: ExecutionResult = {
    success: true,
    executed: 0,
    failed: 0,
    errors: [],
  }

  for (const action of actions) {
    try {
      let success = false

      switch (action.type) {
        case 'ADD_SECTION': {
          let position: number | undefined
          if (action.position === 'start') {
            position = 0
          } else if (action.position === 'end') {
            position = editorStore.sections.length
          } else if (typeof action.position === 'number') {
            position = action.position
          }

          const section = editorStore.addSection(action.sectionType, position)
          if (section) {
            // Apply variant if specified
            if (action.variant) {
              editorStore.updateSectionVariant(section.id, action.variant)
            }
            // Merge custom data if provided
            if (action.data) {
              editorStore.updateSectionData(section.id, action.data)
            }
            success = true
          }
          break
        }

        case 'UPDATE_SECTION': {
          // Update data if provided
          if (action.data) {
            success = editorStore.updateSectionData(action.sectionId, action.data)
          }
          
          // Update variant if provided
          if (action.variant) {
            const variantSuccess = editorStore.updateSectionVariant(action.sectionId, action.variant)
            success = success || variantSuccess
          }
          
          // Update styles if provided
          if (action.styles) {
            for (const [key, value] of Object.entries(action.styles)) {
              const styleSuccess = editorStore.updateSectionStyle(action.sectionId, key, value)
              success = success || styleSuccess
            }
          }
          
          break
        }

        case 'DELETE_SECTION': {
          success = editorStore.removeSection(action.sectionId)
          break
        }

        case 'REORDER_SECTION': {
          const section = editorStore.sections.find(s => s.id === action.sectionId)
          if (section) {
            const currentIndex = editorStore.sections.indexOf(section)
            success = editorStore.reorderSections(currentIndex, action.position)
          }
          break
        }

        case 'UPDATE_THEME': {
          // Update color overrides
          if (action.colors) {
            for (const [key, value] of Object.entries(action.colors)) {
              editorStore.setColorOverride(key as any, value)
            }
            success = true
          }
          
          // Update font overrides
          if (action.fonts) {
            for (const [key, value] of Object.entries(action.fonts)) {
              editorStore.setFontOverride(key as any, value)
            }
            success = true
          }
          break
        }

        case 'SELECT_SECTION': {
          editorStore.selectSection(action.sectionId)
          success = true
          break
        }

        default: {
          result.errors.push(`Unknown action type: ${(action as any).type}`)
          result.failed++
          continue
        }
      }

      if (success) {
        result.executed++
      } else {
        result.failed++
        result.errors.push(`Failed to execute ${action.type}`)
      }
    } catch (error) {
      result.failed++
      result.errors.push(`Error executing ${action.type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  result.success = result.failed === 0

  return result
}
