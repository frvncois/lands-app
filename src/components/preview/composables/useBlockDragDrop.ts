import { ref, computed, type Ref } from 'vue'
import type { SectionBlock, SectionBlockType, StackSettings } from '@/types/designer'
import type { ListPresetType } from '@/lib/list-presets'
import { useDesignerStore } from '@/stores/designer'
import { canHaveChildren } from '@/lib/designer-utils'

/**
 * Composable for handling block drag & drop operations
 * Supports both adding new blocks and reordering existing blocks
 */
export function useBlockDragDrop(block: Ref<SectionBlock>) {
  const designerStore = useDesignerStore()

  // Drop target state
  const isDropTarget = ref(false)
  const childDropIndex = ref<number | null>(null)

  // Check if this is a layout block that can receive children
  const isLayoutBlock = computed(() => canHaveChildren(block.value.type))

  // Check if this block is a list item (Stack directly inside Grid)
  const isListItem = computed(() => {
    if (block.value.type !== 'stack') return false
    const parent = designerStore.findParentBlock(block.value.id)
    return parent?.type === 'grid'
  })

  /**
   * Check if drag event contains valid block type (for adding new blocks)
   */
  function isValidNewBlockDragType(event: DragEvent): boolean {
    return event.dataTransfer?.types.includes('application/x-section-type') || false
  }

  /**
   * Check if drag event contains list preset type
   */
  function isListPresetDragType(event: DragEvent): boolean {
    return event.dataTransfer?.types.includes('application/x-list-preset-type') || false
  }

  /**
   * Check if drag event contains block move data
   */
  function isBlockMoveDragType(event: DragEvent): boolean {
    return event.dataTransfer?.types.includes('application/x-block-move') || false
  }

  /**
   * Check if any valid drag type (new block, list preset, or block move)
   */
  function isValidDragType(event: DragEvent): boolean {
    return isValidNewBlockDragType(event) || isListPresetDragType(event) || isBlockMoveDragType(event)
  }

  /**
   * Handle drag enter on layout block
   */
  function handleDragEnter(event: DragEvent) {
    if (!isLayoutBlock.value) return
    if (isValidDragType(event)) {
      event.preventDefault()
      event.stopPropagation()
      isDropTarget.value = true
    }
  }

  /**
   * Handle drag over on layout block
   */
  function handleDragOver(event: DragEvent) {
    if (!isLayoutBlock.value) return
    if (isValidDragType(event)) {
      event.preventDefault()
      event.stopPropagation()
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = isBlockMoveDragType(event) ? 'move' : 'copy'
      }
    }
  }

  /**
   * Handle drag leave on layout block
   */
  function handleDragLeave(event: DragEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement | null
    const currentTarget = event.currentTarget as HTMLElement
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      isDropTarget.value = false
      childDropIndex.value = null
    }
  }

  /**
   * Handle drop on layout block
   */
  function handleDrop(event: DragEvent) {
    if (!isLayoutBlock.value) return
    event.preventDefault()
    event.stopPropagation()
    isDropTarget.value = false
    const dropIndex = childDropIndex.value
    childDropIndex.value = null

    // Check for block move first
    const blockIdToMove = event.dataTransfer?.getData('application/x-block-move')
    if (blockIdToMove) {
      // Don't allow dropping a block into itself
      if (blockIdToMove === block.value.id) return

      // Check if reordering within same parent
      const blockParent = designerStore.findParentBlock(blockIdToMove)
      const isSameParent = blockParent?.id === block.value.id

      if (isSameParent && dropIndex !== null) {
        // Reordering within this container
        const currentIndex = block.value.children?.findIndex(c => c.id === blockIdToMove) ?? -1
        if (currentIndex !== -1 && currentIndex !== dropIndex) {
          const targetIndex = currentIndex < dropIndex ? dropIndex - 1 : dropIndex
          designerStore.reorderBlocks(currentIndex, targetIndex, block.value.id)
        }
      } else {
        // Move block to this parent
        designerStore.moveBlockToParent(blockIdToMove, block.value.id, dropIndex ?? undefined)
      }
      designerStore.selectBlock(blockIdToMove)
      return
    }

    // Check for list preset type
    const listPresetType = event.dataTransfer?.getData('application/x-list-preset-type') as ListPresetType
    if (listPresetType) {
      const newBlock = designerStore.addListPreset(listPresetType, dropIndex ?? undefined, block.value.id)
      if (newBlock) {
        designerStore.selectBlock(newBlock.id)
      }
      return
    }

    // Check for section type (new block)
    const sectionType = event.dataTransfer?.getData('application/x-section-type')
    if (sectionType) {
      const newBlock = designerStore.addBlock(sectionType as SectionBlockType, dropIndex ?? undefined, block.value.id)
      if (newBlock) {
        designerStore.selectBlock(newBlock.id)
      }
    }
  }

  /**
   * Handle drag over a specific child position to show drop indicator
   */
  function handleChildDragOver(childIndex: number, event: DragEvent) {
    if (!isLayoutBlock.value) return
    if (!isValidDragType(event)) return

    event.preventDefault()
    event.stopPropagation()

    // Determine if we're in the top or bottom half of the child
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const settings = block.value.settings as StackSettings
    const isVertical = block.value.type !== 'grid' && (block.value.type !== 'stack' || settings?.direction !== 'horizontal')

    if (isVertical) {
      const midY = rect.top + rect.height / 2
      childDropIndex.value = event.clientY < midY ? childIndex : childIndex + 1
    } else {
      const midX = rect.left + rect.width / 2
      childDropIndex.value = event.clientX < midX ? childIndex : childIndex + 1
    }

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = isBlockMoveDragType(event) ? 'move' : 'copy'
    }
  }

  /**
   * Handle drag leave from child
   */
  function handleChildDragLeave() {
    // Don't reset immediately - let the parent container handle it
  }

  /**
   * Start dragging this block for reordering
   */
  function handleBlockDragStart(event: DragEvent) {
    event.stopPropagation()
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/x-block-move', block.value.id)
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  /**
   * End block drag
   */
  function handleBlockDragEnd() {
    // Reset any drag state if needed
  }

  return {
    // State
    isDropTarget,
    childDropIndex,
    isLayoutBlock,
    isListItem,

    // Drag type checks
    isValidNewBlockDragType,
    isListPresetDragType,
    isBlockMoveDragType,
    isValidDragType,

    // Layout block drop handlers
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleChildDragOver,
    handleChildDragLeave,

    // Block drag handlers
    handleBlockDragStart,
    handleBlockDragEnd,
  }
}
