import { reactive } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import { canHaveChildren } from '@/lib/designer-utils'
import type { SectionBlockType } from '@/types/designer'
import type { ListPresetType } from '@/lib/list-presets'

export interface DragState {
  // Top-level block dragging
  blockIndex: number | null
  overBlockIndex: number | null
  // Child block dragging (supports cross-parent)
  childInfo: { parentId: string; childIndex: number; blockId: string } | null
  overChildInfo: { parentId: string; childIndex: number } | null
  // Empty parent drop target
  overEmptyParentId: string | null
  // Auto-expand hover target
  hoverExpandBlockId: string | null
  // Track which block was auto-expanded during drag (to collapse when leaving)
  autoExpandedBlockId: string | null
  // New block type being dragged from section dropdown
  newBlockType: SectionBlockType | null
  // New list preset type being dragged from section dropdown
  newListPresetType: ListPresetType | null
}

export function useSidebarDragState() {
  const designerStore = useDesignerStore()

  const dragState = reactive<DragState>({
    blockIndex: null,
    overBlockIndex: null,
    childInfo: null,
    overChildInfo: null,
    overEmptyParentId: null,
    hoverExpandBlockId: null,
    autoExpandedBlockId: null,
    newBlockType: null,
    newListPresetType: null,
  })

  // Timer for auto-expand on hover
  let hoverExpandTimer: ReturnType<typeof setTimeout> | null = null

  // Helper to check if blockId is a descendant of parentId
  function isChildOfBlock(blockId: string, parentId: string): boolean {
    const parent = designerStore.findBlockById(parentId)
    if (!parent?.children) return false
    for (const child of parent.children) {
      if (child.id === blockId) return true
      if (isChildOfBlock(blockId, child.id)) return true
    }
    return false
  }

  function startHoverExpandTimer(blockId: string, expandBlock: (id: string) => void, collapseBlock: (id: string) => void) {
    // If already timing this same block, don't restart the timer
    if (dragState.hoverExpandBlockId === blockId && hoverExpandTimer) {
      return
    }

    // If this block is a child of the auto-expanded block, don't collapse parent
    const isInAutoExpanded = dragState.autoExpandedBlockId && isChildOfBlock(blockId, dragState.autoExpandedBlockId)

    // If hovering a different block and we have an auto-expanded one, collapse it
    // (unless we're hovering its children)
    if (dragState.autoExpandedBlockId && dragState.autoExpandedBlockId !== blockId && !isInAutoExpanded) {
      collapseBlock(dragState.autoExpandedBlockId)
      dragState.autoExpandedBlockId = null
    }

    // Clear any existing timer for a different block
    if (hoverExpandTimer) {
      clearTimeout(hoverExpandTimer)
    }

    // Check if this block can have children
    const block = designerStore.findBlockById(blockId)
    if (!block || !canHaveChildren(block.type)) return

    dragState.hoverExpandBlockId = blockId

    // Auto-expand after 500ms hover
    hoverExpandTimer = setTimeout(() => {
      expandBlock(blockId)
      dragState.autoExpandedBlockId = blockId
      dragState.hoverExpandBlockId = null
      hoverExpandTimer = null
    }, 500)
  }

  function clearHoverExpandTimer() {
    if (hoverExpandTimer) {
      clearTimeout(hoverExpandTimer)
      hoverExpandTimer = null
    }
    dragState.hoverExpandBlockId = null
  }

  function resetDragState(collapseBlock?: (id: string) => void) {
    clearHoverExpandTimer()
    // Collapse any auto-expanded block when drag ends
    if (dragState.autoExpandedBlockId && collapseBlock) {
      collapseBlock(dragState.autoExpandedBlockId)
    }
    dragState.blockIndex = null
    dragState.overBlockIndex = null
    dragState.childInfo = null
    dragState.overChildInfo = null
    dragState.overEmptyParentId = null
    dragState.hoverExpandBlockId = null
    dragState.autoExpandedBlockId = null
    dragState.newBlockType = null
    dragState.newListPresetType = null
  }

  // New block type drag handlers (from section dropdown)
  function handleNewBlockDragStart(type: SectionBlockType, event: DragEvent) {
    dragState.newBlockType = type
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/x-section-type', type)
      event.dataTransfer.setData('text/plain', type)
      event.dataTransfer.effectAllowed = 'copy'
    }
  }

  function handleNewBlockDragEnd() {
    resetDragState()
  }

  // Check if event is a new block type drag
  function isNewBlockTypeDrag(event: DragEvent): boolean {
    return event.dataTransfer?.types.includes('application/x-section-type') || false
  }

  // New list preset type drag handlers (from section dropdown)
  function handleListPresetDragStart(type: ListPresetType, event: DragEvent) {
    dragState.newListPresetType = type
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/x-list-preset-type', type)
      event.dataTransfer.setData('text/plain', type)
      event.dataTransfer.effectAllowed = 'copy'
    }
  }

  function handleListPresetDragEnd() {
    resetDragState()
  }

  // Check if event is a list preset type drag
  function isListPresetTypeDrag(event: DragEvent): boolean {
    return event.dataTransfer?.types.includes('application/x-list-preset-type') || false
  }

  // Check if any new item is being dragged (block or list preset)
  function isAnyNewItemDrag(event: DragEvent): boolean {
    return isNewBlockTypeDrag(event) || isListPresetTypeDrag(event)
  }

  // Top-level block drag handlers
  function handleBlockDragStart(index: number, event: DragEvent) {
    dragState.blockIndex = index
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  function handleBlockDragOver(index: number, event: DragEvent) {
    event.preventDefault()

    // Handle new block type being dragged from section dropdown
    if (dragState.newBlockType || isNewBlockTypeDrag(event)) {
      dragState.overBlockIndex = index
      return
    }

    // Handle list preset being dragged from section dropdown
    if (dragState.newListPresetType || isListPresetTypeDrag(event)) {
      dragState.overBlockIndex = index
      return
    }

    if (dragState.blockIndex !== null && dragState.blockIndex !== index) {
      dragState.overBlockIndex = index
    }
  }

  function handleBlockDragLeave() {
    dragState.overBlockIndex = null
  }

  function handleBlockDrop(index: number, event?: DragEvent) {
    // Handle new block type being dropped from section dropdown
    if (dragState.newBlockType) {
      const newBlock = designerStore.addBlock(dragState.newBlockType, index)
      if (newBlock) {
        designerStore.selectBlock(newBlock.id)
      }
      resetDragState()
      return
    }

    // Handle list preset being dropped from section dropdown
    if (dragState.newListPresetType) {
      const newBlock = designerStore.addListPreset(dragState.newListPresetType, index)
      if (newBlock) {
        designerStore.selectBlock(newBlock.id)
      }
      resetDragState()
      return
    }

    // Also check dataTransfer for new block type (fallback)
    if (event) {
      const sectionType = event.dataTransfer?.getData('application/x-section-type')
      if (sectionType) {
        const newBlock = designerStore.addBlock(sectionType as SectionBlockType, index)
        if (newBlock) {
          designerStore.selectBlock(newBlock.id)
        }
        resetDragState()
        return
      }

      // Also check for list preset type (fallback)
      const listPresetType = event.dataTransfer?.getData('application/x-list-preset-type')
      if (listPresetType) {
        const newBlock = designerStore.addListPreset(listPresetType as ListPresetType, index)
        if (newBlock) {
          designerStore.selectBlock(newBlock.id)
        }
        resetDragState()
        return
      }
    }

    if (dragState.blockIndex !== null && dragState.blockIndex !== index) {
      designerStore.reorderBlocks(dragState.blockIndex, index)
    }
    resetDragState()
  }

  function handleBlockDragEnd() {
    resetDragState()
  }

  // Child block drag handlers
  function handleChildDragStart(parentId: string, childIndex: number, blockId: string, event: DragEvent) {
    event.stopPropagation()
    dragState.childInfo = { parentId, childIndex, blockId }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  // Helper to check if targetId is a descendant of blockId
  function isDescendantOf(blockId: string, targetId: string): boolean {
    const block = designerStore.findBlockById(blockId)
    if (!block?.children) return false
    for (const child of block.children) {
      if (child.id === targetId) return true
      if (isDescendantOf(child.id, targetId)) return true
    }
    return false
  }

  function handleChildDragOver(parentId: string, childIndex: number, event: DragEvent, expandBlock?: (id: string) => void) {
    event.preventDefault()
    event.stopPropagation()

    // Handle new block type being dragged from section dropdown
    if (dragState.newBlockType || isNewBlockTypeDrag(event)) {
      dragState.overChildInfo = { parentId, childIndex }
      return
    }

    // Handle list preset being dragged from section dropdown
    if (dragState.newListPresetType || isListPresetTypeDrag(event)) {
      dragState.overChildInfo = { parentId, childIndex }
      return
    }

    // Handle top-level block being dragged into a layout block
    if (dragState.blockIndex !== null) {
      const draggedBlock = designerStore.blocks[dragState.blockIndex]
      if (!draggedBlock) return
      // Can't drop into itself
      if (draggedBlock.id === parentId) return
      // Can't drop into a descendant
      if (isDescendantOf(draggedBlock.id, parentId)) return
      dragState.overChildInfo = { parentId, childIndex }
      return
    }

    if (!dragState.childInfo) return

    // Can't drop into itself
    if (dragState.childInfo.blockId === parentId) return
    // Can't drop into a descendant
    if (isDescendantOf(dragState.childInfo.blockId, parentId)) return

    const isSameParent = dragState.childInfo.parentId === parentId
    const isDifferentPosition = !isSameParent || dragState.childInfo.childIndex !== childIndex

    if (isDifferentPosition) {
      dragState.overChildInfo = { parentId, childIndex }
    }
  }

  // Handler for hovering over a block row (for auto-expand)
  function handleBlockRowHover(blockId: string, expandBlock: (id: string) => void, collapseBlock: (id: string) => void) {
    // Only start timer if we're actively dragging something
    if (dragState.childInfo || dragState.blockIndex !== null || dragState.newBlockType || dragState.newListPresetType) {
      startHoverExpandTimer(blockId, expandBlock, collapseBlock)
    }
  }

  function handleBlockRowLeave() {
    clearHoverExpandTimer()
  }

  function handleChildDragLeave() {
    dragState.overChildInfo = null
  }

  function handleChildDrop(parentId: string, childIndex: number, expandBlock: (id: string) => void, event?: DragEvent) {
    // Handle new block type being dropped from section dropdown
    if (dragState.newBlockType) {
      const newBlock = designerStore.addBlock(dragState.newBlockType, childIndex, parentId)
      if (newBlock) {
        designerStore.selectBlock(newBlock.id)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    // Handle list preset being dropped from section dropdown
    if (dragState.newListPresetType) {
      const newBlock = designerStore.addListPreset(dragState.newListPresetType, childIndex, parentId)
      if (newBlock) {
        designerStore.selectBlock(newBlock.id)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    // Also check dataTransfer for new block type (fallback)
    if (event) {
      const sectionType = event.dataTransfer?.getData('application/x-section-type')
      if (sectionType) {
        const newBlock = designerStore.addBlock(sectionType as SectionBlockType, childIndex, parentId)
        if (newBlock) {
          designerStore.selectBlock(newBlock.id)
          expandBlock(parentId)
        }
        resetDragState()
        return
      }

      // Also check for list preset type (fallback)
      const listPresetType = event.dataTransfer?.getData('application/x-list-preset-type')
      if (listPresetType) {
        const newBlock = designerStore.addListPreset(listPresetType as ListPresetType, childIndex, parentId)
        if (newBlock) {
          designerStore.selectBlock(newBlock.id)
          expandBlock(parentId)
        }
        resetDragState()
        return
      }
    }

    // Handle top-level block being dropped into a layout block
    if (dragState.blockIndex !== null) {
      const draggedBlock = designerStore.blocks[dragState.blockIndex]
      if (draggedBlock) {
        designerStore.moveBlockToParent(draggedBlock.id, parentId, childIndex)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    if (!dragState.childInfo) return

    const isSameParent = dragState.childInfo.parentId === parentId

    if (isSameParent) {
      if (dragState.childInfo.childIndex !== childIndex) {
        designerStore.reorderBlocks(dragState.childInfo.childIndex, childIndex, parentId)
      }
    } else {
      designerStore.moveBlockToParent(dragState.childInfo.blockId, parentId, childIndex)
    }

    resetDragState()
  }

  function handleChildDragEnd() {
    resetDragState()
  }

  // Empty parent drop handlers
  function handleEmptyParentDragOver(parentId: string, event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()

    // Handle new block type being dragged from section dropdown
    if (dragState.newBlockType || isNewBlockTypeDrag(event)) {
      dragState.overEmptyParentId = parentId
      return
    }

    // Handle list preset being dragged from section dropdown
    if (dragState.newListPresetType || isListPresetTypeDrag(event)) {
      dragState.overEmptyParentId = parentId
      return
    }

    if (dragState.blockIndex !== null) {
      const draggedBlock = designerStore.blocks[dragState.blockIndex]
      if (!draggedBlock) return
      // Can't drop into itself
      if (draggedBlock.id === parentId) return
      // Can't drop into a descendant
      if (isDescendantOf(draggedBlock.id, parentId)) return
      dragState.overEmptyParentId = parentId
      return
    }

    if (!dragState.childInfo) return
    // Can't drop into itself
    if (dragState.childInfo.blockId === parentId) return
    // Can't drop into a descendant
    if (isDescendantOf(dragState.childInfo.blockId, parentId)) return

    dragState.overEmptyParentId = parentId
  }

  function handleEmptyParentDragLeave() {
    dragState.overEmptyParentId = null
  }

  function handleEmptyParentDrop(parentId: string, expandBlock: (id: string) => void, event?: DragEvent) {
    // Handle new block type being dropped from section dropdown
    if (dragState.newBlockType) {
      const newBlock = designerStore.addBlock(dragState.newBlockType, 0, parentId)
      if (newBlock) {
        designerStore.selectBlock(newBlock.id)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    // Handle list preset being dropped from section dropdown
    if (dragState.newListPresetType) {
      const newBlock = designerStore.addListPreset(dragState.newListPresetType, 0, parentId)
      if (newBlock) {
        designerStore.selectBlock(newBlock.id)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    // Also check dataTransfer for new block type (fallback)
    if (event) {
      const sectionType = event.dataTransfer?.getData('application/x-section-type')
      if (sectionType) {
        const newBlock = designerStore.addBlock(sectionType as SectionBlockType, 0, parentId)
        if (newBlock) {
          designerStore.selectBlock(newBlock.id)
          expandBlock(parentId)
        }
        resetDragState()
        return
      }

      // Also check for list preset type (fallback)
      const listPresetType = event.dataTransfer?.getData('application/x-list-preset-type')
      if (listPresetType) {
        const newBlock = designerStore.addListPreset(listPresetType as ListPresetType, 0, parentId)
        if (newBlock) {
          designerStore.selectBlock(newBlock.id)
          expandBlock(parentId)
        }
        resetDragState()
        return
      }
    }

    if (dragState.blockIndex !== null) {
      const draggedBlock = designerStore.blocks[dragState.blockIndex]
      if (draggedBlock) {
        designerStore.moveBlockToParent(draggedBlock.id, parentId, 0)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    if (!dragState.childInfo) {
      resetDragState()
      return
    }

    designerStore.moveBlockToParent(dragState.childInfo.blockId, parentId, 0)
    resetDragState()
  }

  return {
    dragState,
    resetDragState,
    // New block type handlers
    handleNewBlockDragStart,
    handleNewBlockDragEnd,
    isNewBlockTypeDrag,
    // List preset type handlers
    handleListPresetDragStart,
    handleListPresetDragEnd,
    isListPresetTypeDrag,
    isAnyNewItemDrag,
    // Block handlers
    handleBlockDragStart,
    handleBlockDragOver,
    handleBlockDragLeave,
    handleBlockDrop,
    handleBlockDragEnd,
    // Child handlers
    handleChildDragStart,
    handleChildDragOver,
    handleChildDragLeave,
    handleChildDrop,
    handleChildDragEnd,
    // Empty parent handlers
    handleEmptyParentDragOver,
    handleEmptyParentDragLeave,
    handleEmptyParentDrop,
    // Auto-expand on hover
    startHoverExpandTimer,
    clearHoverExpandTimer,
    handleBlockRowHover,
    handleBlockRowLeave,
  }
}
