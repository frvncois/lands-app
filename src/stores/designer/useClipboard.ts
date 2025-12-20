import { ref, computed } from 'vue'
import type { SectionBlock } from '@/types/designer'
import { duplicateSectionBlock, canHaveChildren } from '@/lib/designer-utils'
import { deepClone } from './helpers'

export interface UseClipboardOptions {
  findBlockById: (id: string) => SectionBlock | null
  findParentBlock: (blockId: string) => SectionBlock | null
  isProtectedBlock: (blockId: string) => boolean
  onPaste: (block: SectionBlock, parentId?: string) => void
  onDelete: (blockId: string) => void
  showToast: (type: 'info' | 'success' | 'error', message: string) => void
}

export function useClipboard(options: UseClipboardOptions) {
  const { findBlockById, findParentBlock, isProtectedBlock, onPaste, onDelete, showToast } = options

  // Clipboard state
  const clipboardBlock = ref<SectionBlock | null>(null)
  const clipboardStyles = ref<Record<string, unknown> | null>(null)
  const clipboardIsCut = ref(false)

  // Computed checks
  const hasClipboardBlock = computed(() => clipboardBlock.value !== null)
  const hasClipboardStyles = computed(() => clipboardStyles.value !== null)

  // Copy block to clipboard
  function copyBlock(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || isProtectedBlock(blockId)) return

    clipboardBlock.value = deepClone(block)
    clipboardIsCut.value = false
    showToast('info', 'Block copied')
  }

  // Cut block to clipboard (will be deleted on paste)
  function cutBlock(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || isProtectedBlock(blockId)) return

    clipboardBlock.value = deepClone(block)
    clipboardIsCut.value = true
    showToast('info', 'Block cut')
  }

  // Paste block from clipboard
  function pasteBlock(parentId?: string): SectionBlock | null {
    if (!clipboardBlock.value) return null

    // Create a new block from clipboard with new IDs
    const newBlock = duplicateSectionBlock(clipboardBlock.value)

    // Validate parent if specified
    if (parentId) {
      const parent = findBlockById(parentId)
      if (!parent || !canHaveChildren(parent.type)) {
        showToast('error', 'Cannot paste here')
        return null
      }
    }

    // Call the paste handler
    onPaste(newBlock, parentId)

    // If it was a cut operation, delete the original block
    if (clipboardIsCut.value && clipboardBlock.value) {
      const originalId = clipboardBlock.value.id
      onDelete(originalId)
      clipboardIsCut.value = false
    }

    showToast('success', 'Block pasted')
    return newBlock
  }

  // Copy block styles to clipboard
  function copyBlockStyles(blockId: string) {
    const block = findBlockById(blockId)
    if (!block) return

    clipboardStyles.value = deepClone(block.styles as Record<string, unknown>)
    showToast('info', 'Style copied')
  }

  // Paste styles from clipboard to a block
  function pasteBlockStyles(blockId: string): boolean {
    if (!clipboardStyles.value) return false

    const block = findBlockById(blockId)
    if (!block) return false

    // Merge styles (overwrite existing properties)
    block.styles = { ...block.styles, ...deepClone(clipboardStyles.value) }
    showToast('success', 'Style applied')
    return true
  }

  // Clear clipboard
  function clearClipboard() {
    clipboardBlock.value = null
    clipboardStyles.value = null
    clipboardIsCut.value = false
  }

  return {
    clipboardBlock,
    clipboardStyles,
    clipboardIsCut,
    hasClipboardBlock,
    hasClipboardStyles,
    copyBlock,
    cutBlock,
    pasteBlock,
    copyBlockStyles,
    pasteBlockStyles,
    clearClipboard,
  }
}
