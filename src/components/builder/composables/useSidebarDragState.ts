import { reactive } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { canHaveChildren } from '@/lib/editor-utils'
import type { SectionBlockType } from '@/types/editor'

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
  // New block type being dragged from section dropdown
  newBlockType: SectionBlockType | null
}

export function useSidebarDragState() {
  const editorStore = useEditorStore()

  const dragState = reactive<DragState>({
    blockIndex: null,
    overBlockIndex: null,
    childInfo: null,
    overChildInfo: null,
    overEmptyParentId: null,
    hoverExpandBlockId: null,
    newBlockType: null,
  })

  // Timer for auto-expand on hover
  let hoverExpandTimer: ReturnType<typeof setTimeout> | null = null

  function startHoverExpandTimer(blockId: string, expandBlock: (id: string) => void) {
    // If already timing this same block, don't restart the timer
    if (dragState.hoverExpandBlockId === blockId && hoverExpandTimer) {
      return
    }

    // Clear any existing timer for a different block
    if (hoverExpandTimer) {
      clearTimeout(hoverExpandTimer)
    }

    // Check if this block can have children
    const block = editorStore.findBlockById(blockId)
    if (!block || !canHaveChildren(block.type)) return

    dragState.hoverExpandBlockId = blockId

    // Auto-expand after 500ms hover
    hoverExpandTimer = setTimeout(() => {
      expandBlock(blockId)
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

  function resetDragState() {
    clearHoverExpandTimer()
    dragState.blockIndex = null
    dragState.overBlockIndex = null
    dragState.childInfo = null
    dragState.overChildInfo = null
    dragState.overEmptyParentId = null
    dragState.hoverExpandBlockId = null
    dragState.newBlockType = null
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
      const newBlock = editorStore.addBlock(dragState.newBlockType, index)
      if (newBlock) {
        editorStore.selectBlock(newBlock.id)
      }
      resetDragState()
      return
    }

    // Also check dataTransfer for new block type (fallback)
    if (event) {
      const sectionType = event.dataTransfer?.getData('application/x-section-type')
      if (sectionType) {
        const newBlock = editorStore.addBlock(sectionType as SectionBlockType, index)
        if (newBlock) {
          editorStore.selectBlock(newBlock.id)
        }
        resetDragState()
        return
      }
    }

    if (dragState.blockIndex !== null && dragState.blockIndex !== index) {
      editorStore.reorderBlocks(dragState.blockIndex, index)
    }
    dragState.blockIndex = null
    dragState.overBlockIndex = null
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
    const block = editorStore.findBlockById(blockId)
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

    // Handle top-level block being dragged into a layout block
    if (dragState.blockIndex !== null) {
      const draggedBlock = editorStore.blocks[dragState.blockIndex]
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
  function handleBlockRowHover(blockId: string, expandBlock: (id: string) => void) {
    // Only start timer if we're actively dragging something
    if (dragState.childInfo || dragState.blockIndex !== null || dragState.newBlockType) {
      startHoverExpandTimer(blockId, expandBlock)
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
      const newBlock = editorStore.addBlock(dragState.newBlockType, childIndex, parentId)
      if (newBlock) {
        editorStore.selectBlock(newBlock.id)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    // Also check dataTransfer for new block type (fallback)
    if (event) {
      const sectionType = event.dataTransfer?.getData('application/x-section-type')
      if (sectionType) {
        const newBlock = editorStore.addBlock(sectionType as SectionBlockType, childIndex, parentId)
        if (newBlock) {
          editorStore.selectBlock(newBlock.id)
          expandBlock(parentId)
        }
        resetDragState()
        return
      }
    }

    // Handle top-level block being dropped into a layout block
    if (dragState.blockIndex !== null) {
      const draggedBlock = editorStore.blocks[dragState.blockIndex]
      if (draggedBlock) {
        editorStore.moveBlockToParent(draggedBlock.id, parentId, childIndex)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    if (!dragState.childInfo) return

    const isSameParent = dragState.childInfo.parentId === parentId

    if (isSameParent) {
      if (dragState.childInfo.childIndex !== childIndex) {
        editorStore.reorderBlocks(dragState.childInfo.childIndex, childIndex, parentId)
      }
    } else {
      editorStore.moveBlockToParent(dragState.childInfo.blockId, parentId, childIndex)
    }

    dragState.childInfo = null
    dragState.overChildInfo = null
  }

  function handleChildDragEnd() {
    dragState.childInfo = null
    dragState.overChildInfo = null
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

    if (dragState.blockIndex !== null) {
      const draggedBlock = editorStore.blocks[dragState.blockIndex]
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
      const newBlock = editorStore.addBlock(dragState.newBlockType, 0, parentId)
      if (newBlock) {
        editorStore.selectBlock(newBlock.id)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    // Also check dataTransfer for new block type (fallback)
    if (event) {
      const sectionType = event.dataTransfer?.getData('application/x-section-type')
      if (sectionType) {
        const newBlock = editorStore.addBlock(sectionType as SectionBlockType, 0, parentId)
        if (newBlock) {
          editorStore.selectBlock(newBlock.id)
          expandBlock(parentId)
        }
        resetDragState()
        return
      }
    }

    if (dragState.blockIndex !== null) {
      const draggedBlock = editorStore.blocks[dragState.blockIndex]
      if (draggedBlock) {
        editorStore.moveBlockToParent(draggedBlock.id, parentId, 0)
        expandBlock(parentId)
      }
      resetDragState()
      return
    }

    if (!dragState.childInfo) return

    editorStore.moveBlockToParent(dragState.childInfo.blockId, parentId, 0)

    dragState.childInfo = null
    dragState.overChildInfo = null
    dragState.overEmptyParentId = null
  }

  return {
    dragState,
    resetDragState,
    // New block type handlers
    handleNewBlockDragStart,
    handleNewBlockDragEnd,
    isNewBlockTypeDrag,
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
