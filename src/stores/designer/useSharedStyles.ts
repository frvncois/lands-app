import type { Ref } from 'vue'
import type { SectionBlock, SectionBlockType, PageSettings, SharedStyle } from '@/types/designer'
import {
  generateId,
  extractStyleSettings,
  applyStyleSettings,
  hasSharedStyleOverrides,
} from '@/lib/designer-utils'
import { deepClone } from './helpers'

export interface UseSharedStylesOptions {
  pageSettings: Ref<PageSettings>
  blocks: Ref<SectionBlock[]>
  findBlockById: (id: string) => SectionBlock | null
  getBlocksBySharedStyleId: (styleId: string) => Set<string>
  onBeforeChange: () => void
  showToast: (type: 'info' | 'success' | 'error', message: string) => void
}

export function useSharedStyles(options: UseSharedStylesOptions) {
  const { pageSettings, blocks, findBlockById, getBlocksBySharedStyleId, onBeforeChange, showToast } = options

  /**
   * Get shared styles for a specific block type
   */
  function getSharedStylesForType(blockType: SectionBlockType): SharedStyle[] {
    return (pageSettings.value.sharedStyles || []).filter(s => s.blockType === blockType)
  }

  /**
   * Get a shared style by ID
   */
  function getSharedStyleById(styleId: string): SharedStyle | undefined {
    return (pageSettings.value.sharedStyles || []).find(s => s.id === styleId)
  }

  /**
   * Create a new shared style from a block
   */
  function createSharedStyle(name: string, blockId: string): SharedStyle | null {
    const block = findBlockById(blockId)
    if (!block) return null

    const now = new Date().toISOString()
    const newStyle: SharedStyle = {
      id: generateId(),
      name,
      blockType: block.type,
      styles: deepClone(block.styles) as SharedStyle['styles'],
      settings: extractStyleSettings(block.type, block.settings as Record<string, unknown>),
      createdAt: now,
      updatedAt: now,
    }

    onBeforeChange()

    // Add to page settings
    if (!pageSettings.value.sharedStyles) {
      pageSettings.value.sharedStyles = []
    }
    pageSettings.value.sharedStyles.push(newStyle)

    // Link the block to this shared style
    block.sharedStyleId = newStyle.id

    showToast('success', 'Shared style created')
    return newStyle
  }

  /**
   * Apply a shared style to a block
   */
  function applySharedStyle(blockId: string, styleId: string): boolean {
    const block = findBlockById(blockId)
    const style = getSharedStyleById(styleId)
    if (!block || !style) return false

    // Only apply to same block type
    if (block.type !== style.blockType) {
      showToast('error', 'Style type mismatch')
      return false
    }

    onBeforeChange()

    // Apply styles
    block.styles = deepClone(style.styles) as typeof block.styles

    // Apply settings (preserving content fields)
    block.settings = applyStyleSettings(
      block.type,
      block.settings as Record<string, unknown>,
      style.settings
    ) as typeof block.settings

    // Link the block
    block.sharedStyleId = styleId

    showToast('success', 'Shared style applied')
    return true
  }

  /**
   * Detach a block from its shared style (keeps current styles)
   */
  function detachSharedStyle(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block || !block.sharedStyleId) return false

    onBeforeChange()
    delete block.sharedStyleId

    showToast('info', 'Style detached')
    return true
  }

  /**
   * Helper: Apply a shared style to all blocks using it
   * Uses indexed lookup for O(1) block finding instead of tree traversal
   */
  function applySharedStyleToAllBlocks(style: SharedStyle) {
    const blockIds = getBlocksBySharedStyleId(style.id)
    for (const blockId of blockIds) {
      const block = findBlockById(blockId)
      if (block && block.sharedStyleId === style.id) {
        block.styles = deepClone(style.styles) as typeof block.styles
        block.settings = applyStyleSettings(
          block.type,
          block.settings as Record<string, unknown>,
          style.settings
        ) as typeof block.settings
      }
    }
  }

  /**
   * Update a shared style from the current block's styles
   */
  function updateSharedStyleFromBlock(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block || !block.sharedStyleId) return false

    const style = getSharedStyleById(block.sharedStyleId)
    if (!style) return false

    onBeforeChange()

    // Update the shared style
    style.styles = deepClone(block.styles) as SharedStyle['styles']
    style.settings = extractStyleSettings(block.type, block.settings as Record<string, unknown>)
    style.updatedAt = new Date().toISOString()

    // Apply to all blocks using this style
    applySharedStyleToAllBlocks(style)

    showToast('success', 'Shared style updated')
    return true
  }

  /**
   * Reset a block to its shared style (discard local changes)
   */
  function resetToSharedStyle(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block || !block.sharedStyleId) return false

    const style = getSharedStyleById(block.sharedStyleId)
    if (!style) return false

    onBeforeChange()

    // Reset to shared style
    block.styles = deepClone(style.styles) as typeof block.styles
    block.settings = applyStyleSettings(
      block.type,
      block.settings as Record<string, unknown>,
      style.settings
    ) as typeof block.settings

    showToast('info', 'Reset to shared style')
    return true
  }

  /**
   * Rename a shared style
   */
  function renameSharedStyle(styleId: string, name: string): boolean {
    const style = getSharedStyleById(styleId)
    if (!style) return false

    onBeforeChange()
    style.name = name
    style.updatedAt = new Date().toISOString()
    return true
  }

  /**
   * Delete a shared style (detaches all blocks using it)
   * Uses indexed lookup for O(1) block finding instead of tree traversal
   */
  function deleteSharedStyle(styleId: string): boolean {
    const styles = pageSettings.value.sharedStyles
    if (!styles) return false

    const index = styles.findIndex(s => s.id === styleId)
    if (index === -1) return false

    onBeforeChange()

    // Detach all blocks using this style (O(1) lookup)
    const blockIds = getBlocksBySharedStyleId(styleId)
    for (const blockId of blockIds) {
      const block = findBlockById(blockId)
      if (block && block.sharedStyleId === styleId) {
        delete block.sharedStyleId
      }
    }

    // Remove the style
    styles.splice(index, 1)

    showToast('info', 'Shared style deleted')
    return true
  }

  /**
   * Check if a block has local overrides from its shared style
   */
  function blockHasSharedStyleOverrides(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block || !block.sharedStyleId) return false

    const style = getSharedStyleById(block.sharedStyleId)
    if (!style) return false

    return hasSharedStyleOverrides(
      block.type,
      block.settings as Record<string, unknown>,
      block.styles as Record<string, unknown>,
      style.settings,
      style.styles as Record<string, unknown>
    )
  }

  return {
    getSharedStylesForType,
    getSharedStyleById,
    createSharedStyle,
    applySharedStyle,
    detachSharedStyle,
    updateSharedStyleFromBlock,
    resetToSharedStyle,
    renameSharedStyle,
    deleteSharedStyle,
    blockHasSharedStyleOverrides,
    applySharedStyleToAllBlocks,
  }
}
