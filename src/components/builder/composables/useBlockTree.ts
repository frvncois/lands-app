import { ref, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { canHaveChildren } from '@/lib/editor-utils'
import type { SectionBlock } from '@/types/editor'

export function useBlockTree() {
  const editorStore = useEditorStore()
  const expandedBlocks = ref<Set<string>>(new Set())

  function toggleExpanded(blockId: string) {
    if (expandedBlocks.value.has(blockId)) {
      expandedBlocks.value.delete(blockId)
    } else {
      expandedBlocks.value.add(blockId)
    }
  }

  function expandBlock(blockId: string) {
    expandedBlocks.value.add(blockId)
  }

  function collapseBlock(blockId: string) {
    expandedBlocks.value.delete(blockId)
  }

  function isExpanded(blockId: string): boolean {
    return expandedBlocks.value.has(blockId)
  }

  function expandToBlock(blockId: string) {
    let currentId: string | null = blockId
    while (currentId) {
      const parent = editorStore.findParentBlock(currentId)
      if (parent) {
        expandedBlocks.value.add(parent.id)
        currentId = parent.id
      } else {
        currentId = null
      }
    }

    const block = editorStore.findBlockById(blockId)
    if (block && canBlockExpand(block)) {
      expandedBlocks.value.add(blockId)
    }
  }

  function canBlockExpand(block: SectionBlock): boolean {
    if (canHaveChildren(block.type)) return true
    return false
  }

  // Auto-expand ancestors when selection changes
  watch(() => editorStore.selectedBlockId, (blockId) => {
    if (blockId) {
      expandToBlock(blockId)
    }
  }, { immediate: true })

  return {
    expandedBlocks,
    toggleExpanded,
    expandBlock,
    collapseBlock,
    isExpanded,
    expandToBlock,
    canBlockExpand,
  }
}
