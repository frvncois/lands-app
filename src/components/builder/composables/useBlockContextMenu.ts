import { ref, computed } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import { canHaveChildren } from '@/lib/designer-utils'
import type ContextMenu from '@/components/ui/ContextMenu.vue'

export function useBlockContextMenu(expandBlock: (id: string) => void, collapseBlock: (id: string) => void) {
  const designerStore = useDesignerStore()

  const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
  const contextMenuBlockId = ref<string | null>(null)
  const contextMenuBlockType = ref<'section' | 'child'>('section')

  // Rename state
  const renamingBlockId = ref<string | null>(null)

  const contextMenuBlock = computed(() => {
    if (!contextMenuBlockId.value) return null
    return designerStore.findBlockById(contextMenuBlockId.value)
  })

  const canDuplicate = computed(() => !!contextMenuBlock.value)
  const canDelete = computed(() => !!contextMenuBlock.value)

  function openContextMenu(blockId: string, blockType: 'section' | 'child', event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    contextMenuBlockId.value = blockId
    contextMenuBlockType.value = blockType
    contextMenuRef.value?.open(event)
  }

  function handleDuplicate() {
    if (!contextMenuBlockId.value) return
    const newBlock = designerStore.duplicateBlock(contextMenuBlockId.value)
    if (newBlock) {
      expandBlock(newBlock.id)
      designerStore.selectBlock(newBlock.id)
    }
  }

  function handleDelete() {
    if (!contextMenuBlockId.value) return
    designerStore.deleteBlock(contextMenuBlockId.value)
    collapseBlock(contextMenuBlockId.value)
  }

  function handleCopy() {
    if (!contextMenuBlockId.value) return
    designerStore.copyBlock(contextMenuBlockId.value)
  }

  function handlePaste() {
    if (!contextMenuBlockId.value) return
    const block = designerStore.findBlockById(contextMenuBlockId.value)
    if (!block) return

    // If block can have children, paste inside it
    // Otherwise paste as sibling (in same parent)
    const parentId = canHaveChildren(block.type)
      ? block.id
      : designerStore.findParentBlock(contextMenuBlockId.value)?.id

    const newBlock = designerStore.pasteBlock(parentId)
    if (newBlock) {
      expandBlock(newBlock.id)
      designerStore.selectBlock(newBlock.id)
    }
  }

  function handleCopyStyle() {
    if (!contextMenuBlockId.value) return
    designerStore.copyBlockStyles(contextMenuBlockId.value)
  }

  function handlePasteStyle() {
    if (!contextMenuBlockId.value) return
    designerStore.pasteBlockStyles(contextMenuBlockId.value)
  }

  function handleCreateComponent() {
    if (!contextMenuBlockId.value) return
    designerStore.createComponent(contextMenuBlockId.value)
  }

  function handleWrapInStack() {
    if (!contextMenuBlockId.value) return
    const stackBlock = designerStore.wrapBlockInStack(contextMenuBlockId.value)
    if (stackBlock) {
      expandBlock(stackBlock.id)
    }
  }

  // Check if block is a Stack (can convert to Button/Grid)
  const isStack = computed(() => contextMenuBlock.value?.type === 'stack')

  // Check if block is a Button (can convert to Stack)
  const isButton = computed(() => contextMenuBlock.value?.type === 'button')

  // Check if block is a Grid (can convert to Stack)
  const isGrid = computed(() => contextMenuBlock.value?.type === 'grid')

  function handleConvertToButton() {
    if (!contextMenuBlockId.value) return
    designerStore.convertBlockType(contextMenuBlockId.value, 'button')
  }

  function handleConvertToStack() {
    if (!contextMenuBlockId.value) return
    designerStore.convertBlockType(contextMenuBlockId.value, 'stack')
  }

  function handleConvertToGrid() {
    if (!contextMenuBlockId.value) return
    designerStore.convertBlockType(contextMenuBlockId.value, 'grid')
  }

  function handleRename() {
    if (!contextMenuBlockId.value) return
    renamingBlockId.value = contextMenuBlockId.value
  }

  function startRename(blockId: string) {
    renamingBlockId.value = blockId
  }

  function finishRename(blockId: string, newName: string) {
    if (newName.trim()) {
      designerStore.updateBlockName(blockId, newName.trim())
    }
    renamingBlockId.value = null
  }

  function cancelRename() {
    renamingBlockId.value = null
  }

  return {
    contextMenuRef,
    contextMenuBlockId,
    contextMenuBlockType,
    contextMenuBlock,
    canDuplicate,
    canDelete,
    openContextMenu,
    handleDuplicate,
    handleDelete,
    handleCopy,
    handlePaste,
    handleCopyStyle,
    handlePasteStyle,
    handleCreateComponent,
    handleWrapInStack,
    // Convert between Stack, Button, and Grid
    isStack,
    isButton,
    isGrid,
    handleConvertToButton,
    handleConvertToStack,
    handleConvertToGrid,
    // Rename
    renamingBlockId,
    handleRename,
    startRename,
    finishRename,
    cancelRename,
  }
}
