import { ref, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type ContextMenu from '@/components/ui/ContextMenu.vue'

export function useBlockContextMenu(expandBlock: (id: string) => void, collapseBlock: (id: string) => void) {
  const editorStore = useEditorStore()

  const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
  const contextMenuBlockId = ref<string | null>(null)
  const contextMenuBlockType = ref<'section' | 'child'>('section')

  // Rename state
  const renamingBlockId = ref<string | null>(null)

  const contextMenuBlock = computed(() => {
    if (!contextMenuBlockId.value) return null
    return editorStore.findBlockById(contextMenuBlockId.value)
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
    const newBlock = editorStore.duplicateBlock(contextMenuBlockId.value)
    if (newBlock) {
      expandBlock(newBlock.id)
      editorStore.selectBlock(newBlock.id)
    }
  }

  function handleDelete() {
    if (!contextMenuBlockId.value) return
    editorStore.deleteBlock(contextMenuBlockId.value)
    collapseBlock(contextMenuBlockId.value)
  }

  function handleCopyStyle() {
    if (!contextMenuBlockId.value) return
    editorStore.copyBlockStyles(contextMenuBlockId.value)
  }

  function handlePasteStyle() {
    if (!contextMenuBlockId.value) return
    editorStore.pasteBlockStyles(contextMenuBlockId.value)
  }

  function handleCreateComponent() {
    if (!contextMenuBlockId.value) return
    editorStore.createComponent(contextMenuBlockId.value)
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
      editorStore.updateBlockName(blockId, newName.trim())
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
    handleCopyStyle,
    handlePasteStyle,
    handleCreateComponent,
    // Rename
    renamingBlockId,
    handleRename,
    startRename,
    finishRename,
    cancelRename,
  }
}
