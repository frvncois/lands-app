import type { SectionBlock, SectionBlockType, GridSettings } from '@/types/editor'

/**
 * Editor Helpers
 *
 * Consolidated helper functions used across the editor store and components.
 * These were previously duplicated in multiple files.
 *
 * NOTE: Block index optimization opportunity
 * The current implementation uses rebuildBlockIndex() calls after each mutation.
 * Since markAsChanged() already calls rebuildBlockIndex(), many explicit calls
 * are redundant. A future optimization could:
 * 1. Remove explicit rebuildBlockIndex() calls where markAsChanged() is also called
 * 2. Consider using a computed property that rebuilds on blocks.value change
 * The current approach works but has some redundant index rebuilds.
 */

/**
 * Prebuilt list/collection names (from preset types)
 * ONLY these grids should have shared style restrictions
 */
export const PREBUILT_LIST_NAMES = [
  'Link List',
  'Product List',
  'Card List',
  'Feature List',
  'Social List',
  'Testimonials',
  'Menus List',
  'FAQ List',
  'Gallery',
]

/**
 * Content fields that should NEVER be shared across list items
 */
export const CONTENT_FIELDS = new Set([
  'content', 'label', 'url', 'src', 'alt', 'caption', 'placeholder',
  'name', 'icon', 'buyLink', 'price', 'image', 'successMessage', 'errorMessage',
  'copyrightText', 'navLinks', 'links', 'socialLinks', 'optionTypes', 'variants',
])

/**
 * Maximum nesting depth for layout blocks (container/grid)
 * Stack blocks are exempt from this restriction
 */
export const MAX_LAYOUT_NESTING_DEPTH = 2

/**
 * Maximum depth for menu lists
 */
export const MAX_MENU_LIST_DEPTH = 2

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
 * Check if a block is protected (header/footer - cannot be deleted/duplicated)
 */
export function isProtectedBlockType(type: SectionBlockType): boolean {
  return type === 'header' || type === 'footer'
}

/**
 * Check if a Grid block is a PREBUILT List/Collection (has prebuilt name)
 */
export function isPrebuiltListGrid(block: SectionBlock | null): boolean {
  if (!block || block.type !== 'grid') return false
  return PREBUILT_LIST_NAMES.includes(block.name)
}

/**
 * Check if a block is a menu list grid
 */
export function isMenuListBlock(block: SectionBlock | null): boolean {
  if (!block || block.type !== 'grid') return false
  const settings = block.settings as GridSettings
  return settings.collectionType === 'menu-list'
}

/**
 * Check if a block is a header/footer child stack (Start, Middle, End)
 */
export function isHeaderFooterStack(
  block: SectionBlock,
  findParentBlock: (id: string) => SectionBlock | null
): boolean {
  const parent = findParentBlock(block.id)
  return parent ? (parent.type === 'header' || parent.type === 'footer') : false
}

/**
 * Check if a child block is a PREBUILT List/Collection item (Stack directly inside PREBUILT Grid)
 */
export function isPrebuiltListItem(parentBlock: SectionBlock, child: SectionBlock): boolean {
  return isPrebuiltListGrid(parentBlock) && child.type === 'stack'
}

/**
 * Check if a child block is INSIDE a PREBUILT List/Collection item
 * (inside Stack that's inside PREBUILT Grid)
 */
export function isBlockInsidePrebuiltListItem(
  parentBlock: SectionBlock,
  findParentBlock: (id: string) => SectionBlock | null
): boolean {
  // Check if parent IS a prebuilt list item (Stack in PREBUILT Grid)
  if (parentBlock.type === 'stack') {
    const grandparent = findParentBlock(parentBlock.id)
    if (grandparent && isPrebuiltListGrid(grandparent)) {
      return true
    }
  }
  // Check up the tree for a prebuilt list grid
  let current: SectionBlock | null = parentBlock
  while (current) {
    const parent = findParentBlock(current.id)
    if (!parent) break
    if (current.type === 'stack' && isPrebuiltListGrid(parent)) {
      return true
    }
    current = parent
  }
  return false
}

/**
 * Check if settings contain only content fields (no shared settings)
 */
export function hasOnlyContentFields(settings: Record<string, unknown>): boolean {
  return Object.keys(settings).every(key => CONTENT_FIELDS.has(key))
}

/**
 * Filter settings to only include non-content fields (for sharing across siblings)
 */
export function filterNonContentFields(settings: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(settings)) {
    if (!CONTENT_FIELDS.has(key)) {
      filtered[key] = value
    }
  }
  return filtered
}

/**
 * Get the display name for a stack item (from its "Title" heading content)
 */
export function getStackDisplayName(stack: SectionBlock): string {
  if (!stack.children || stack.children.length === 0) return stack.name

  const titleHeading = stack.children.find(c =>
    c.type === 'heading' && c.name.toLowerCase() === 'title'
  )

  if (titleHeading) {
    const settings = titleHeading.settings as { content?: string }
    if (settings.content && settings.content.trim()) {
      const content = settings.content.trim()
      return content.length > 25 ? content.slice(0, 25) + '...' : content
    }
  }

  return stack.name
}

/**
 * Get the item type label for a List/Collection grid
 */
export function getListItemTypeLabel(grid: SectionBlock): string {
  const name = grid.name.toLowerCase()
  if (name.includes('product')) return 'product'
  if (name.includes('card')) return 'card'
  if (name.includes('link')) return 'link'
  if (name.includes('feature')) return 'feature'
  if (name.includes('social')) return 'social'
  if (name.includes('testimonial')) return 'testimonial'
  if (name.includes('menu')) return 'menu item'
  if (name.includes('faq')) return 'faq'
  return 'item'
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
