import { reactive } from 'vue'
import { useEditorStore } from '@/stores/editor'

export interface DragState {
  // Top-level block dragging
  blockIndex: number | null
  overBlockIndex: number | null
  // Child block dragging (supports cross-parent)
  childInfo: { parentId: string; childIndex: number; blockId: string } | null
  overChildInfo: { parentId: string; childIndex: number } | null
  // Empty parent drop target
  overEmptyParentId: string | null
}

export function useSidebarDragState() {
  const editorStore = useEditorStore()

  const dragState = reactive<DragState>({
    blockIndex: null,
    overBlockIndex: null,
    childInfo: null,
    overChildInfo: null,
    overEmptyParentId: null,
  })

  function resetDragState() {
    dragState.blockIndex = null
    dragState.overBlockIndex = null
    dragState.childInfo = null
    dragState.overChildInfo = null
    dragState.overEmptyParentId = null
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
    if (dragState.blockIndex !== null && dragState.blockIndex !== index) {
      dragState.overBlockIndex = index
    }
  }

  function handleBlockDragLeave() {
    dragState.overBlockIndex = null
  }

  function handleBlockDrop(index: number) {
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

  function handleChildDragOver(parentId: string, childIndex: number, event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()

    // Handle top-level block being dragged into a layout block
    if (dragState.blockIndex !== null) {
      const draggedBlock = editorStore.blocks[dragState.blockIndex]
      if (draggedBlock && draggedBlock.id === parentId) return
      dragState.overChildInfo = { parentId, childIndex }
      return
    }

    if (!dragState.childInfo) return

    const isSameParent = dragState.childInfo.parentId === parentId
    const isDifferentPosition = !isSameParent || dragState.childInfo.childIndex !== childIndex

    if (isDifferentPosition) {
      dragState.overChildInfo = { parentId, childIndex }
    }
  }

  function handleChildDragLeave() {
    dragState.overChildInfo = null
  }

  function handleChildDrop(parentId: string, childIndex: number, expandBlock: (id: string) => void) {
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

    if (dragState.blockIndex !== null) {
      const draggedBlock = editorStore.blocks[dragState.blockIndex]
      if (draggedBlock && draggedBlock.id === parentId) return
      dragState.overEmptyParentId = parentId
      return
    }

    if (!dragState.childInfo) return
    if (dragState.childInfo.parentId === parentId) return

    dragState.overEmptyParentId = parentId
  }

  function handleEmptyParentDragLeave() {
    dragState.overEmptyParentId = null
  }

  function handleEmptyParentDrop(parentId: string, expandBlock: (id: string) => void) {
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
  }
}
