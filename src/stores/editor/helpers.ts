import type { SectionBlock, SectionBlockType } from '@/types/editor'

/**
 * Editor Helpers
 *
 * Consolidated helper functions used across the editor store and components.
 */

/**
 * Maximum nesting depth for layout blocks (container/grid)
 * Stack blocks are exempt from this restriction
 */
export const MAX_LAYOUT_NESTING_DEPTH = 2

/**
 * Deep clone helper that handles Vue reactive objects
 * Uses JSON serialization to strip Vue Proxy wrappers that structuredClone can't handle
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Find a block by ID in a nested block tree
 */
export function findBlockInTree(id: string, blockList: SectionBlock[]): SectionBlock | null {
  for (const block of blockList) {
    if (block.id === id) return block
    if (block.children) {
      const found = findBlockInTree(id, block.children)
      if (found) return found
    }
  }
  return null
}

/**
 * Find parent of a block in a nested tree
 */
export function findParentInTree(
  blockId: string,
  blockList: SectionBlock[],
  parent: SectionBlock | null = null
): SectionBlock | null {
  for (const block of blockList) {
    if (block.id === blockId) return parent
    if (block.children) {
      const isDirectChild = block.children.some(child => child.id === blockId)
      if (isDirectChild) return block
      const found = findParentInTree(blockId, block.children, block)
      if (found) return found
    }
  }
  return null
}

/**
 * Check if a block type is a layout block (container/grid/stack)
 */
export function isLayoutBlockType(type: SectionBlockType): boolean {
  return type === 'container' || type === 'grid' || type === 'stack'
}

/**
 * Check if a block type has depth restrictions (stack is allowed at any depth)
 */
export function hasDepthRestriction(type: SectionBlockType): boolean {
  return type === 'container' || type === 'grid'
}

/**
 * Check if a block is protected (cannot be deleted/duplicated)
 * Currently no blocks are protected
 */
export function isProtectedBlockType(_type: SectionBlockType): boolean {
  return false
}

/**
 * Build a block index Map for O(1) lookups
 */
export function buildBlockIndex(blocks: SectionBlock[]): Map<string, SectionBlock> {
  const map = new Map<string, SectionBlock>()
  function traverse(blockList: SectionBlock[]) {
    for (const block of blockList) {
      map.set(block.id, block)
      if (block.children) {
        traverse(block.children)
      }
    }
  }
  traverse(blocks)
  return map
}

/**
 * Build block index, parent index, and shared style index in a single traversal
 * Returns { blockIndex, parentIndex, sharedStyleIndex } for O(1) lookups
 */
export function buildBlockIndexes(blocks: SectionBlock[]): {
  blockIndex: Map<string, SectionBlock>
  parentIndex: Map<string, string | null>
  sharedStyleIndex: Map<string, Set<string>>
} {
  const blockIndex = new Map<string, SectionBlock>()
  const parentIndex = new Map<string, string | null>()
  const sharedStyleIndex = new Map<string, Set<string>>()

  function traverse(blockList: SectionBlock[], parentId: string | null) {
    for (const block of blockList) {
      blockIndex.set(block.id, block)
      parentIndex.set(block.id, parentId)

      // Track blocks by their shared style
      if (block.sharedStyleId) {
        const set = sharedStyleIndex.get(block.sharedStyleId)
        if (set) {
          set.add(block.id)
        } else {
          sharedStyleIndex.set(block.sharedStyleId, new Set([block.id]))
        }
      }

      if (block.children) {
        traverse(block.children, block.id)
      }
    }
  }
  traverse(blocks, null)
  return { blockIndex, parentIndex, sharedStyleIndex }
}
