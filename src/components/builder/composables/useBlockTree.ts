import { ref, watch } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import { canHaveChildren } from '@/lib/designer-utils'
import type { SectionBlock } from '@/types/designer'

export function useBlockTree() {
  const designerStore = useDesignerStore()
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
      const parent = designerStore.findParentBlock(currentId)
      if (parent) {
        expandedBlocks.value.add(parent.id)
        currentId = parent.id
      } else {
        currentId = null
      }
    }

    const block = designerStore.findBlockById(blockId)
    if (block && canBlockExpand(block)) {
      expandedBlocks.value.add(blockId)
    }
  }

  function canBlockExpand(block: SectionBlock): boolean {
    if (canHaveChildren(block.type)) return true
    return false
  }

  // Auto-expand ancestors when selection changes
  watch(() => designerStore.selectedBlockId, (blockId) => {
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
