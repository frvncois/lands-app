import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type {
  SectionBlock,
  SectionBlockType,
  PageSettings,
  FormSettings,
  HeaderSettings,
  HeaderNavLink,
  FooterSettings,
  FooterLink,
  FooterSocialLink,
  SocialPlatform,
  ViewportSize,
  CoreBlockStyles,
  FormFieldBlockType,
  GridSettings,
  CanvasSettings,
  CanvasChildPosition,
} from '@/types/editor'
import type { ProjectContent } from '@/types/project'
import {
  createSectionBlock,
  createHeaderNavLink,
  createFooterLink,
  createFooterSocialLink,
  getDefaultPageSettings,
  duplicateSectionBlock,
  canHaveChildren,
  isFormFieldBlock,
  generateId,
} from '@/lib/editor-utils'
import { getThemeById } from '@/lib/themes'
import { getLayoutById } from '@/lib/layouts'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/stores/toast'

// Import composables
import {
  useHistory,
  useClipboard,
  useSharedStyles,
  useTranslations,
  useCollaboration,
  useItemListOperations,
  useInteractions,
  // Helpers
  deepClone,
  isLayoutBlockType,
  hasDepthRestriction,
  isProtectedBlockType,
  isPrebuiltListGrid,
  isMenuListBlock,
  hasOnlyContentFields,
  filterNonContentFields,
  buildBlockIndex,
  buildBlockIndexes,
  MAX_LAYOUT_NESTING_DEPTH,
  MAX_MENU_LIST_DEPTH,
  PREBUILT_LIST_NAMES,
} from '@/stores/editor/index'

// Re-export ViewportSize for consumers
export type { ViewportSize }

export const useEditorStore = defineStore('editor', () => {
  const toast = useToast()

  // ============================================
  // CORE STATE
  // ============================================

  const currentProjectId = ref<string | null>(null)
  const blocks = ref<SectionBlock[]>([])
  const pageSettings = ref<PageSettings>(getDefaultPageSettings())
  const selectedBlockId = ref<string | null>(null)
  const selectedItemId = ref<string | null>(null)
  const hoveredBlockId = ref<string | null>(null)
  const selectedSpanId = ref<string | null>(null)
  const hoveredSpanId = ref<string | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const hasUnsavedChanges = ref(false)
  const viewport = ref<ViewportSize>('desktop')
  const isSidebarCollapsed = ref(false)
  const isInspectorCollapsed = ref(false)
  const autoSaveEnabled = ref(false)
  const lastSavedAt = ref<string | null>(null)

  // Block index for O(1) lookups (block, parent, and shared style)
  const blockIndex = shallowRef<Map<string, SectionBlock>>(new Map())
  const parentIndex = shallowRef<Map<string, string | null>>(new Map())
  const sharedStyleIndex = shallowRef<Map<string, Set<string>>>(new Map())

  function rebuildBlockIndex() {
    const indexes = buildBlockIndexes(blocks.value)
    blockIndex.value = indexes.blockIndex
    parentIndex.value = indexes.parentIndex
    sharedStyleIndex.value = indexes.sharedStyleIndex
  }

  // ============================================
  // TOAST HELPER
  // ============================================

  function showToast(type: 'info' | 'success' | 'error', message: string, description?: string) {
    if (type === 'info') toast.info(message, description)
    else if (type === 'success') toast.success(message, description)
    else toast.error(message, description)
  }

  // ============================================
  // CHANGE TRACKING
  // ============================================

  function markAsChanged() {
    hasUnsavedChanges.value = true
    // Note: rebuildBlockIndex() should be called AFTER mutations, not here
    // All mutating functions call rebuildBlockIndex() explicitly after their changes
  }

  function markAsChangedWithHistory() {
    history.pushToHistory()
    markAsChanged()
  }

  function cancelAutoSave() {
    // No-op - auto-save is disabled
  }

  // ============================================
  // HISTORY (Undo/Redo)
  // ============================================

  const history = useHistory({
    blocks,
    pageSettings,
    selectedBlockId,
    selectedItemId,
    onRestore: () => {
      rebuildBlockIndex()
      hasUnsavedChanges.value = true
    },
  })

  // ============================================
  // BLOCK LOOKUP HELPERS
  // ============================================

  const selectedBlock = computed(() => {
    if (!selectedBlockId.value) return null
    return blockIndex.value.get(selectedBlockId.value) || null
  })

  function findBlockById(id: string): SectionBlock | null {
    return blockIndex.value.get(id) || null
  }

  /**
   * Find parent block using O(1) index lookup
   */
  function findParentBlock(blockId: string): SectionBlock | null {
    const parentId = parentIndex.value.get(blockId)
    if (parentId === undefined || parentId === null) return null
    return blockIndex.value.get(parentId) || null
  }

  function getBlockNestingDepth(blockId: string): number {
    let depth = 0
    let currentId = blockId
    let parent = findParentBlock(currentId)

    while (parent) {
      depth++
      currentId = parent.id
      parent = findParentBlock(currentId)
    }

    return depth
  }

  function isProtectedBlock(blockId: string): boolean {
    const block = findBlockById(blockId)
    return block ? isProtectedBlockType(block.type) : false
  }

  function isHeaderFooterChild(blockId: string): boolean {
    const parent = findParentBlock(blockId)
    return parent?.type === 'header' || parent?.type === 'footer'
  }

  function isListCollectionItem(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'stack') return false
    const parent = findParentBlock(blockId)
    return isPrebuiltListGrid(parent)
  }

  function isInsideListCollection(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block) return false
    const parent = findParentBlock(blockId)

    if (block.type === 'stack' && parent && isPrebuiltListGrid(parent)) {
      return true
    }

    if (parent && parent.type === 'stack') {
      const grandparent = findParentBlock(parent.id)
      if (isPrebuiltListGrid(grandparent)) {
        return true
      }
    }

    return false
  }

  function isChildInsideListItem(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block) return false

    let currentId = blockId
    let parent = findParentBlock(currentId)

    while (parent) {
      if (parent.type === 'stack') {
        const grandparent = findParentBlock(parent.id)
        if (isPrebuiltListGrid(grandparent)) {
          return true
        }
      }
      currentId = parent.id
      parent = findParentBlock(currentId)
    }

    return false
  }

  function isDirectChildOfGrid(blockId: string): boolean {
    const parent = findParentBlock(blockId)
    return parent?.type === 'grid'
  }

  function getParentGridColumns(blockId: string): number | null {
    const parent = findParentBlock(blockId)
    if (parent?.type === 'grid') {
      const settings = parent.settings as { columns?: number }
      return settings.columns || 2
    }
    return null
  }

  // ============================================
  // VIEWPORT
  // ============================================

  const viewportWidth = computed(() => {
    const widthMap: Record<ViewportSize, string> = {
      desktop: '100%',
      tablet: '768px',
      mobile: '375px',
    }
    return widthMap[viewport.value]
  })

  const viewportAspectRatio = computed(() => {
    const ratioMap: Record<ViewportSize, number | null> = {
      desktop: null,
      tablet: 4 / 3,
      mobile: 9 / 19.5,
    }
    return ratioMap[viewport.value]
  })

  function setViewport(size: ViewportSize) {
    viewport.value = size
  }

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function toggleInspector() {
    isInspectorCollapsed.value = !isInspectorCollapsed.value
  }

  // ============================================
  // CLIPBOARD
  // ============================================

  const clipboard = useClipboard({
    findBlockById,
    findParentBlock,
    isProtectedBlock,
    onPaste: (newBlock, parentId) => {
      markAsChangedWithHistory()

      if (parentId) {
        const parent = findBlockById(parentId)
        if (parent && canHaveChildren(parent.type)) {
          if (!parent.children) parent.children = []
          parent.children.push(newBlock)
        }
      } else {
        const footerIndex = blocks.value.findIndex((b: SectionBlock) => b.type === 'footer')
        if (footerIndex !== -1) {
          blocks.value.splice(footerIndex, 0, newBlock)
        } else {
          blocks.value.push(newBlock)
        }
      }

      selectedBlockId.value = newBlock.id
      selectedItemId.value = null
      rebuildBlockIndex()
    },
    onDelete: (blockId) => {
      const parent = findParentBlock(blockId)
      if (parent && parent.children) {
        const index = parent.children.findIndex((b: SectionBlock) => b.id === blockId)
        if (index !== -1) parent.children.splice(index, 1)
      } else {
        const rootIndex = blocks.value.findIndex((b: SectionBlock) => b.id === blockId)
        if (rootIndex !== -1) blocks.value.splice(rootIndex, 1)
      }
    },
    showToast: (type, message) => showToast(type, message),
  })

  // Wrap clipboard paste to handle history
  function pasteBlock(parentId?: string) {
    return clipboard.pasteBlock(parentId)
  }

  function pasteBlockStyles(blockId: string) {
    markAsChangedWithHistory()
    const result = clipboard.pasteBlockStyles(blockId)
    rebuildBlockIndex()
    return result
  }

  // ============================================
  // SHARED STYLES
  // ============================================

  const sharedStyles = useSharedStyles({
    pageSettings,
    blocks,
    findBlockById,
    getBlocksBySharedStyleId: (styleId: string) => {
      // O(1) lookup using the shared style index
      return sharedStyleIndex.value.get(styleId) || new Set()
    },
    onBeforeChange: markAsChangedWithHistory,
    showToast,
  })

  // Wrapper functions for shared styles that modify blocks
  function createSharedStyle(name: string, blockId: string) {
    const result = sharedStyles.createSharedStyle(name, blockId)
    rebuildBlockIndex()
    return result
  }

  function applySharedStyle(blockId: string, styleId: string) {
    const result = sharedStyles.applySharedStyle(blockId, styleId)
    rebuildBlockIndex()
    return result
  }

  function detachSharedStyle(blockId: string) {
    const result = sharedStyles.detachSharedStyle(blockId)
    rebuildBlockIndex()
    return result
  }

  function updateSharedStyleFromBlock(blockId: string) {
    const result = sharedStyles.updateSharedStyleFromBlock(blockId)
    rebuildBlockIndex()
    return result
  }

  function resetToSharedStyle(blockId: string) {
    const result = sharedStyles.resetToSharedStyle(blockId)
    rebuildBlockIndex()
    return result
  }

  function renameSharedStyle(styleId: string, name: string) {
    const result = sharedStyles.renameSharedStyle(styleId, name)
    rebuildBlockIndex()
    return result
  }

  function deleteSharedStyle(styleId: string) {
    const result = sharedStyles.deleteSharedStyle(styleId)
    rebuildBlockIndex()
    return result
  }

  // ============================================
  // INTERACTIONS
  // ============================================

  const interactions = useInteractions({
    pageSettings,
    findBlockById,
    onBeforeChange: markAsChangedWithHistory,
    showToast,
  })

  // Wrapper functions for interactions that modify blocks
  function createInteraction(data: Parameters<typeof interactions.createInteraction>[0]) {
    const result = interactions.createInteraction(data)
    rebuildBlockIndex()
    return result
  }

  function updateInteraction(interactionId: string, updates: Parameters<typeof interactions.updateInteraction>[1]) {
    const result = interactions.updateInteraction(interactionId, updates)
    rebuildBlockIndex()
    return result
  }

  function updateInteractionStyles(interactionId: string, styles: Parameters<typeof interactions.updateInteractionStyles>[1]) {
    const result = interactions.updateInteractionStyles(interactionId, styles)
    rebuildBlockIndex()
    return result
  }

  function deleteInteraction(interactionId: string) {
    const result = interactions.deleteInteraction(interactionId)
    rebuildBlockIndex()
    return result
  }

  function duplicateInteraction(interactionId: string) {
    const result = interactions.duplicateInteraction(interactionId)
    rebuildBlockIndex()
    return result
  }

  function renameInteraction(interactionId: string, name: string) {
    const result = interactions.renameInteraction(interactionId, name)
    rebuildBlockIndex()
    return result
  }

  // ============================================
  // TRANSLATIONS
  // ============================================

  const translationsComposable = useTranslations({
    blocks,
    onBeforeChange: markAsChangedWithHistory,
  })

  // ============================================
  // COLLABORATION
  // ============================================

  const collaboration = useCollaboration({
    lastSavedAt: () => lastSavedAt.value,
    onCollaboratorChange: () => {},
    showToast: (type, title, desc) => showToast(type, title, desc),
  })

  // ============================================
  // MENU LIST HELPERS
  // ============================================

  function getParentMenuListLevel(parentId?: string): number {
    if (!parentId) return 0
    let current: SectionBlock | null = findBlockById(parentId)
    while (current) {
      if (isMenuListBlock(current)) {
        const settings = current.settings as GridSettings
        return settings.collectionLevel || 1
      }
      current = findParentBlock(current.id)
    }
    return 0
  }

  function applyMenuListLevel(block: SectionBlock, targetParentId?: string): boolean {
    if (!isMenuListBlock(block)) return true
    const targetLevel = getParentMenuListLevel(targetParentId) + 1
    if (targetLevel > MAX_MENU_LIST_DEPTH) {
      toast.error('Menu Lists can only be nested one level deep.')
      return false
    }
    const settings = block.settings as GridSettings
    settings.collectionLevel = targetLevel
    settings.collectionType = 'menu-list'
    return true
  }

  // ============================================
  // BLOCK OPERATIONS
  // ============================================

  function addBlock(type: SectionBlockType, index?: number, parentId?: string) {
    if (type === 'header' || type === 'footer') return null

    if (parentId && hasDepthRestriction(type)) {
      const parentDepth = getBlockNestingDepth(parentId)
      if (parentDepth >= MAX_LAYOUT_NESTING_DEPTH) {
        console.warn(`Cannot add ${type} block at depth ${parentDepth + 1}. Maximum nesting depth for container/grid blocks is ${MAX_LAYOUT_NESTING_DEPTH + 1}. Use Stack for deeper nesting.`)
        return null
      }
    }

    markAsChangedWithHistory()

    const block = createSectionBlock(type)

    if (parentId) {
      const parent = findBlockById(parentId)
      if (parent && parent.children) {
        if (index !== undefined) {
          parent.children.splice(index, 0, block)
        } else {
          parent.children.push(block)
        }
        selectedBlockId.value = block.id
        selectedItemId.value = null
        rebuildBlockIndex()
        return block
      }
      return null
    }

    const footerIndex = blocks.value.findIndex((b: SectionBlock) => b.type === 'footer')

    if (index !== undefined) {
      const headerExists = blocks.value[0]?.type === 'header'
      const minIndex = headerExists ? 1 : 0
      const maxIndex = footerIndex !== -1 ? footerIndex : blocks.value.length
      const safeIndex = Math.max(minIndex, Math.min(index, maxIndex))
      blocks.value.splice(safeIndex, 0, block)
    } else {
      if (footerIndex !== -1) {
        blocks.value.splice(footerIndex, 0, block)
      } else {
        blocks.value.push(block)
      }
    }

    selectedBlockId.value = block.id
    selectedItemId.value = null
    rebuildBlockIndex()
    return block
  }

  function addPresetBlock(block: SectionBlock, index?: number, parentId?: string): SectionBlock | null {
    if (!applyMenuListLevel(block, parentId)) {
      return null
    }

    markAsChangedWithHistory()

    if (parentId) {
      const parent = findBlockById(parentId)
      if (parent && parent.children) {
        if (index !== undefined) {
          parent.children.splice(index, 0, block)
        } else {
          parent.children.push(block)
        }
        selectedBlockId.value = block.id
        selectedItemId.value = null
        rebuildBlockIndex()
        return block
      }
      return null
    }

    const footerIndex = blocks.value.findIndex((b: SectionBlock) => b.type === 'footer')

    if (index !== undefined) {
      const headerExists = blocks.value[0]?.type === 'header'
      const minIndex = headerExists ? 1 : 0
      const maxIndex = footerIndex !== -1 ? footerIndex : blocks.value.length
      const safeIndex = Math.max(minIndex, Math.min(index, maxIndex))
      blocks.value.splice(safeIndex, 0, block)
    } else {
      if (footerIndex !== -1) {
        blocks.value.splice(footerIndex, 0, block)
      } else {
        blocks.value.push(block)
      }
    }

    selectedBlockId.value = block.id
    selectedItemId.value = null
    rebuildBlockIndex()
    return block
  }

  function deleteBlock(blockId: string) {
    if (isProtectedBlock(blockId)) return

    markAsChangedWithHistory()

    const rootIndex = blocks.value.findIndex((b: SectionBlock) => b.id === blockId)
    if (rootIndex !== -1) {
      blocks.value.splice(rootIndex, 1)
      if (selectedBlockId.value === blockId) {
        selectedBlockId.value = null
        selectedItemId.value = null
      }
      rebuildBlockIndex()
      return
    }

    const parent = findParentBlock(blockId)
    if (parent && parent.children) {
      const index = parent.children.findIndex((b: SectionBlock) => b.id === blockId)
      if (index !== -1) {
        parent.children.splice(index, 1)
        if (selectedBlockId.value === blockId) {
          selectedBlockId.value = null
          selectedItemId.value = null
        }
        rebuildBlockIndex()
      }
    }
  }

  function duplicateBlock(blockId: string) {
    if (isProtectedBlock(blockId)) return null

    const block = findBlockById(blockId)
    if (!block) return null

    markAsChangedWithHistory()

    const newBlock = duplicateSectionBlock(block)

    const rootIndex = blocks.value.findIndex((b: SectionBlock) => b.id === blockId)
    if (rootIndex !== -1) {
      blocks.value.splice(rootIndex + 1, 0, newBlock)
    } else {
      const parent = findParentBlock(blockId)
      if (parent && parent.children) {
        const index = parent.children.findIndex((b: SectionBlock) => b.id === blockId)
        if (index !== -1) {
          parent.children.splice(index + 1, 0, newBlock)
        }
      }
    }

    selectedBlockId.value = newBlock.id
    selectedItemId.value = null
    rebuildBlockIndex()
    return newBlock
  }

  function reorderBlocks(fromIndex: number, toIndex: number, parentId?: string) {
    const blockList = parentId ? findBlockById(parentId)?.children : blocks.value
    if (!blockList) return

    const block = blockList[fromIndex]
    if (!block || block.type === 'header' || block.type === 'footer') return

    if (!parentId) {
      if (toIndex === 0 && blocks.value[0]?.type === 'header') return
      const lastIndex = blocks.value.length - 1
      if (toIndex === lastIndex && blocks.value[lastIndex]?.type === 'footer') return
    }

    markAsChangedWithHistory()

    const [movedBlock] = blockList.splice(fromIndex, 1)
    if (movedBlock) {
      blockList.splice(toIndex, 0, movedBlock)
      rebuildBlockIndex()
    }
  }

  function moveBlockToParent(blockId: string, newParentId: string, toIndex?: number) {
    const block = findBlockById(blockId)
    if (!block || block.type === 'header' || block.type === 'footer') return false

    const currentParent = findParentBlock(blockId)
    const newParent = findBlockById(newParentId)

    if (currentParent?.id === newParentId) return false
    if (!newParent || !canHaveChildren(newParent.type)) return false

    if (isLayoutBlockType(block.type)) {
      const newParentDepth = getBlockNestingDepth(newParentId)
      if (newParentDepth >= MAX_LAYOUT_NESTING_DEPTH) {
        console.warn(`Cannot move layout block to depth ${newParentDepth + 1}.`)
        return false
      }
    }

    if (!applyMenuListLevel(block, newParentId)) {
      return false
    }

    markAsChangedWithHistory()

    if (currentParent && currentParent.children) {
      const index = currentParent.children.findIndex((b: SectionBlock) => b.id === blockId)
      if (index !== -1) {
        currentParent.children.splice(index, 1)
      }
    } else {
      const rootIndex = blocks.value.findIndex((b: SectionBlock) => b.id === blockId)
      if (rootIndex !== -1) {
        blocks.value.splice(rootIndex, 1)
      }
    }

    if (!newParent.children) {
      newParent.children = []
    }
    if (toIndex !== undefined && toIndex >= 0 && toIndex <= newParent.children.length) {
      newParent.children.splice(toIndex, 0, block)
    } else {
      newParent.children.push(block)
    }

    rebuildBlockIndex()
    return true
  }

  function moveBlockToRoot(blockId: string, toIndex?: number) {
    const block = findBlockById(blockId)
    if (!block || block.type === 'header' || block.type === 'footer') return false

    const currentParent = findParentBlock(blockId)
    if (!currentParent) return false

    if (!applyMenuListLevel(block)) {
      return false
    }

    markAsChangedWithHistory()

    if (currentParent.children) {
      const index = currentParent.children.findIndex((b: SectionBlock) => b.id === blockId)
      if (index !== -1) {
        currentParent.children.splice(index, 1)
      }
    }

    const hasHeader = blocks.value[0]?.type === 'header'
    const footerIndex = blocks.value.findIndex((b: SectionBlock) => b.type === 'footer')

    let insertIndex: number
    if (toIndex !== undefined) {
      const minIndex = hasHeader ? 1 : 0
      const maxIndex = footerIndex !== -1 ? footerIndex : blocks.value.length
      insertIndex = Math.max(minIndex, Math.min(toIndex, maxIndex))
    } else {
      insertIndex = footerIndex !== -1 ? footerIndex : blocks.value.length
    }

    blocks.value.splice(insertIndex, 0, block)
    rebuildBlockIndex()
    return true
  }

  function moveBlockUp(blockIndex: number, parentId?: string) {
    const blockList = parentId ? findBlockById(parentId)?.children : blocks.value
    if (!blockList) return

    const block = blockList[blockIndex]
    if (!block || block.type === 'header' || block.type === 'footer') return

    const minIndex = !parentId && blocks.value[0]?.type === 'header' ? 1 : 0
    if (blockIndex <= minIndex) return

    reorderBlocks(blockIndex, blockIndex - 1, parentId)
  }

  function moveBlockDown(blockIndex: number, parentId?: string) {
    const blockList = parentId ? findBlockById(parentId)?.children : blocks.value
    if (!blockList) return

    const block = blockList[blockIndex]
    if (!block || block.type === 'header' || block.type === 'footer') return

    const footerIndex = !parentId ? blocks.value.findIndex((b: SectionBlock) => b.type === 'footer') : -1
    const maxIndex = footerIndex !== -1 ? footerIndex - 1 : blockList.length - 1
    if (blockIndex >= maxIndex) return

    reorderBlocks(blockIndex, blockIndex + 1, parentId)
  }

  function selectBlock(blockId: string | null, itemId: string | null = null) {
    selectedBlockId.value = blockId
    selectedItemId.value = itemId
    // Clear span selection when selecting a different block
    if (blockId !== selectedBlockId.value) {
      selectedSpanId.value = null
    }
  }

  function hoverBlock(blockId: string | null) {
    hoveredBlockId.value = blockId
  }

  // ============================================
  // SPAN SELECTION & MANAGEMENT
  // ============================================

  function selectSpan(spanId: string | null) {
    selectedSpanId.value = spanId
  }

  function hoverSpan(spanId: string | null) {
    hoveredSpanId.value = spanId
  }

  function createSpan(blockId: string, spanId: string, name: string): void {
    const block = findBlockById(blockId)
    if (!block) return
    if (block.type !== 'text' && block.type !== 'heading') return

    markAsChangedWithHistory()
    const settings = block.settings as { spans?: Record<string, { id: string; name: string; styles: Record<string, unknown> }> }
    if (!settings.spans) {
      settings.spans = {}
    }
    settings.spans[spanId] = {
      id: spanId,
      name,
      styles: {},
    }
    selectedSpanId.value = spanId
  }

  function updateSpanStyles(blockId: string, spanId: string, styles: Record<string, unknown>): void {
    const block = findBlockById(blockId)
    if (!block) return

    const settings = block.settings as { spans?: Record<string, { styles: Record<string, unknown> }> }
    if (!settings.spans || !settings.spans[spanId]) return

    markAsChangedWithHistory()
    Object.assign(settings.spans[spanId].styles, styles)
  }

  function updateSpanName(blockId: string, spanId: string, name: string): void {
    const block = findBlockById(blockId)
    if (!block) return

    const settings = block.settings as { spans?: Record<string, { name: string }> }
    if (!settings.spans || !settings.spans[spanId]) return

    markAsChangedWithHistory()
    settings.spans[spanId].name = name
  }

  function deleteSpan(blockId: string, spanId: string): void {
    const block = findBlockById(blockId)
    if (!block) return

    const settings = block.settings as { spans?: Record<string, unknown> }
    if (!settings.spans || !settings.spans[spanId]) return

    markAsChangedWithHistory()
    delete settings.spans[spanId]
    if (selectedSpanId.value === spanId) {
      selectedSpanId.value = null
    }
  }

  function getSpanById(blockId: string, spanId: string): { id: string; name: string; styles: Record<string, unknown> } | null {
    const block = findBlockById(blockId)
    if (!block) return null

    const settings = block.settings as { spans?: Record<string, { id: string; name: string; styles: Record<string, unknown> }> }
    return settings.spans?.[spanId] || null
  }

  function updateBlockSettings(blockId: string, settings: Record<string, unknown>) {
    const block = findBlockById(blockId)
    if (block) {
      markAsChangedWithHistory()

      const blockSettings = block.settings as Record<string, unknown>
      Object.assign(block.settings, settings)

      if (block.sharedStyleId) {
        const style = sharedStyles.getSharedStyleById(block.sharedStyleId)
        if (style) {
          sharedStyles.updateSharedStyleFromBlock(blockId)
        }
      }

      if (blockSettings.overwriteStyle) {
        rebuildBlockIndex()
        return
      }

      if (hasOnlyContentFields(settings)) {
        rebuildBlockIndex()
        return
      }

      const sharedSettings = filterNonContentFields(settings)
      if (Object.keys(sharedSettings).length === 0) {
        rebuildBlockIndex()
        return
      }

      const parent = findParentBlock(blockId)

      if (block.type === 'stack' && parent && isPrebuiltListGrid(parent) && parent.children) {
        for (const siblingStack of parent.children) {
          if (siblingStack.type === 'stack' && siblingStack.id !== blockId) {
            const siblingSettings = siblingStack.settings as Record<string, unknown>
            if (!siblingSettings.overwriteStyle) {
              Object.assign(siblingStack.settings, sharedSettings)
            }
          }
        }
        rebuildBlockIndex()
        return
      }

      if (parent && parent.type === 'stack' && parent.children) {
        const grandparent = findParentBlock(parent.id)
        if (isPrebuiltListGrid(grandparent) && grandparent && grandparent.children) {
          const childIndex = parent.children.findIndex((c: SectionBlock) => c.id === blockId)
          if (childIndex !== -1) {
            for (const siblingStack of grandparent.children) {
              if (siblingStack.type === 'stack' && siblingStack.children && siblingStack.children[childIndex]) {
                const siblingChild = siblingStack.children[childIndex]
                if (siblingChild.id === blockId) continue
                const siblingChildSettings = siblingChild.settings as Record<string, unknown>
                if (siblingChild.type === block.type && !siblingChildSettings.overwriteStyle) {
                  Object.assign(siblingChild.settings, sharedSettings)
                }
              }
            }
            rebuildBlockIndex()
            return
          }
        }
      }

      rebuildBlockIndex()
    }
  }

  function updateBlockStyles(blockId: string, styles: Record<string, unknown>, replaceAll = false) {
    const block = findBlockById(blockId)
    if (block) {
      markAsChangedWithHistory()

      const blockSettings = block.settings as Record<string, unknown>

      const applyStyles = (targetBlock: typeof block) => {
        if (replaceAll) {
          targetBlock.styles = { ...styles }
        } else {
          Object.assign(targetBlock.styles, styles)
        }
      }

      applyStyles(block)

      if (block.sharedStyleId) {
        const style = sharedStyles.getSharedStyleById(block.sharedStyleId)
        if (style) {
          style.styles = deepClone(block.styles) as typeof style.styles
          style.updatedAt = new Date().toISOString()
          sharedStyles.applySharedStyleToAllBlocks(style)
          rebuildBlockIndex()
          return
        }
      }

      if (blockSettings.overwriteStyle) {
        rebuildBlockIndex()
        return
      }

      const parent = findParentBlock(blockId)

      if (block.type === 'stack' && parent && isPrebuiltListGrid(parent) && parent.children) {
        for (const siblingStack of parent.children) {
          if (siblingStack.id === blockId) continue
          if (siblingStack.type === 'stack') {
            const siblingSettings = siblingStack.settings as Record<string, unknown>
            if (!siblingSettings.overwriteStyle) {
              applyStyles(siblingStack)
            }
          }
        }
        rebuildBlockIndex()
        return
      }

      if (parent && parent.type === 'stack' && parent.children) {
        const grandparent = findParentBlock(parent.id)
        if (isPrebuiltListGrid(grandparent) && grandparent && grandparent.children) {
          const childIndex = parent.children.findIndex((c: SectionBlock) => c.id === blockId)
          if (childIndex !== -1) {
            for (const siblingStack of grandparent.children) {
              if (siblingStack.type === 'stack' && siblingStack.children && siblingStack.children[childIndex]) {
                const siblingChild = siblingStack.children[childIndex]
                if (siblingChild.id === blockId) continue
                const siblingChildSettings = siblingChild.settings as Record<string, unknown>
                if (siblingChild.type === block.type && !siblingChildSettings.overwriteStyle) {
                  applyStyles(siblingChild)
                }
              }
            }
            rebuildBlockIndex()
            return
          }
        }
      }

      rebuildBlockIndex()
    }
  }

  function updateBlockName(blockId: string, name: string) {
    const block = findBlockById(blockId)
    if (block) {
      markAsChangedWithHistory()
      block.name = name
      rebuildBlockIndex()
    }
  }

  // ============================================
  // CANVAS ACTIONS
  // ============================================

  function updateCanvasChildPosition(parentId: string, childId: string, position: CanvasChildPosition) {
    const parent = findBlockById(parentId)
    if (!parent || parent.type !== 'canvas') return

    markAsChangedWithHistory()

    const settings = parent.settings as CanvasSettings
    const viewportKey = viewport.value === 'desktop' ? 'desktop' : viewport.value === 'tablet' ? 'tablet' : 'mobile'

    if (viewportKey === 'tablet') {
      if (!settings.childPositions.tablet) {
        settings.childPositions.tablet = {}
      }
      settings.childPositions.tablet[childId] = position
    } else if (viewportKey === 'mobile') {
      if (!settings.childPositions.mobile) {
        settings.childPositions.mobile = {}
      }
      settings.childPositions.mobile[childId] = position
    } else {
      settings.childPositions.desktop[childId] = position
    }

    rebuildBlockIndex()
  }

  // ============================================
  // HEADER ACTIONS (using useItemListOperations)
  // ============================================

  function updateHeaderSettings(blockId: string, settings: Partial<HeaderSettings>) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'header') return

    markAsChangedWithHistory()
    Object.assign(block.settings, settings)
    rebuildBlockIndex()
  }

  function getHeaderNavLinkOperations(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'header') return null

    const settings = block.settings as HeaderSettings

    return useItemListOperations<HeaderNavLink>(
      () => settings.navLinks || [],
      (items) => { settings.navLinks = items },
      createHeaderNavLink,
      {
        onBeforeChange: markAsChangedWithHistory,
        onAfterAdd: (item) => { selectedItemId.value = item.id; rebuildBlockIndex() },
        onAfterRemove: (id) => { if (selectedItemId.value === id) selectedItemId.value = null; rebuildBlockIndex() },
      }
    )
  }

  function addHeaderNavLink(blockId: string) {
    const ops = getHeaderNavLinkOperations(blockId)
    return ops?.add() ?? null
  }

  function deleteHeaderNavLink(blockId: string, linkId: string) {
    const ops = getHeaderNavLinkOperations(blockId)
    ops?.remove(linkId)
  }

  function reorderHeaderNavLinks(blockId: string, fromIndex: number, toIndex: number) {
    const ops = getHeaderNavLinkOperations(blockId)
    ops?.reorder(fromIndex, toIndex)
  }

  function updateHeaderNavLink(blockId: string, linkId: string, updates: Partial<HeaderNavLink>) {
    const ops = getHeaderNavLinkOperations(blockId)
    ops?.update(linkId, updates)
  }

  function duplicateHeaderNavLink(blockId: string, linkId: string) {
    const ops = getHeaderNavLinkOperations(blockId)
    const newLink = ops?.duplicate(linkId)
    if (newLink) {
      selectedItemId.value = newLink.id
    }
    return newLink ?? null
  }

  // ============================================
  // FOOTER ACTIONS
  // ============================================

  function updateFooterSettings(blockId: string, settings: Partial<FooterSettings>) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return

    markAsChangedWithHistory()
    Object.assign(block.settings, settings)
    rebuildBlockIndex()
  }

  function getFooterLinkOperations(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return null

    const settings = block.settings as FooterSettings

    return useItemListOperations<FooterLink>(
      () => settings.links || [],
      (items) => { settings.links = items },
      createFooterLink,
      {
        onBeforeChange: markAsChangedWithHistory,
        onAfterAdd: (item) => { selectedItemId.value = item.id; rebuildBlockIndex() },
        onAfterRemove: (id) => { if (selectedItemId.value === id) selectedItemId.value = null; rebuildBlockIndex() },
      }
    )
  }

  function addFooterLink(blockId: string) {
    const ops = getFooterLinkOperations(blockId)
    return ops?.add() ?? null
  }

  function deleteFooterLink(blockId: string, linkId: string) {
    const ops = getFooterLinkOperations(blockId)
    ops?.remove(linkId)
  }

  function reorderFooterLinks(blockId: string, fromIndex: number, toIndex: number) {
    const ops = getFooterLinkOperations(blockId)
    ops?.reorder(fromIndex, toIndex)
  }

  function updateFooterLink(blockId: string, linkId: string, updates: Partial<FooterLink>) {
    const ops = getFooterLinkOperations(blockId)
    ops?.update(linkId, updates)
  }

  function duplicateFooterLink(blockId: string, linkId: string) {
    const ops = getFooterLinkOperations(blockId)
    const newLink = ops?.duplicate(linkId)
    if (newLink) {
      selectedItemId.value = newLink.id
    }
    return newLink ?? null
  }

  // Footer Social Links
  function getFooterSocialLinkOperations(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return null

    const settings = block.settings as FooterSettings

    return useItemListOperations<FooterSocialLink>(
      () => settings.socialLinks || [],
      (items) => { settings.socialLinks = items },
      () => createFooterSocialLink('twitter'),
      {
        onBeforeChange: markAsChangedWithHistory,
        onAfterAdd: (item) => { selectedItemId.value = item.id; rebuildBlockIndex() },
        onAfterRemove: (id) => { if (selectedItemId.value === id) selectedItemId.value = null; rebuildBlockIndex() },
      }
    )
  }

  function addFooterSocialLink(blockId: string, platform: SocialPlatform = 'twitter') {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return null

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.socialLinks) settings.socialLinks = []
    const link = createFooterSocialLink(platform)
    settings.socialLinks.push(link)
    selectedItemId.value = link.id
    rebuildBlockIndex()
    return link
  }

  function deleteFooterSocialLink(blockId: string, linkId: string) {
    const ops = getFooterSocialLinkOperations(blockId)
    ops?.remove(linkId)
  }

  function reorderFooterSocialLinks(blockId: string, fromIndex: number, toIndex: number) {
    const ops = getFooterSocialLinkOperations(blockId)
    ops?.reorder(fromIndex, toIndex)
  }

  function updateFooterSocialLink(blockId: string, linkId: string, updates: Partial<FooterSocialLink>) {
    const ops = getFooterSocialLinkOperations(blockId)
    ops?.update(linkId, updates)
  }

  function duplicateFooterSocialLink(blockId: string, linkId: string) {
    const ops = getFooterSocialLinkOperations(blockId)
    const newLink = ops?.duplicate(linkId)
    if (newLink) {
      selectedItemId.value = newLink.id
    }
    return newLink ?? null
  }

  // ============================================
  // FORM FIELD ACTIONS
  // ============================================

  function addFormFieldBlock(formBlockId: string, type: FormFieldBlockType) {
    const formBlock = findBlockById(formBlockId)
    if (!formBlock || formBlock.type !== 'form') return null

    markAsChangedWithHistory()
    const newField = createSectionBlock(type)
    if (!formBlock.children) {
      formBlock.children = []
    }
    formBlock.children.push(newField)
    selectedBlockId.value = newField.id
    rebuildBlockIndex()
    return newField
  }

  function deleteFormFieldBlock(formBlockId: string, fieldBlockId: string) {
    const formBlock = findBlockById(formBlockId)
    if (!formBlock || formBlock.type !== 'form' || !formBlock.children) return

    markAsChangedWithHistory()
    const index = formBlock.children.findIndex((child: SectionBlock) => child.id === fieldBlockId)
    if (index !== -1) {
      formBlock.children.splice(index, 1)
      if (selectedBlockId.value === fieldBlockId) {
        selectedBlockId.value = formBlockId
      }
      rebuildBlockIndex()
    }
  }

  function reorderFormFieldBlocks(formBlockId: string, fromIndex: number, toIndex: number) {
    const formBlock = findBlockById(formBlockId)
    if (!formBlock || formBlock.type !== 'form' || !formBlock.children) return

    markAsChangedWithHistory()
    const [field] = formBlock.children.splice(fromIndex, 1)
    if (field) {
      formBlock.children.splice(toIndex, 0, field)
      rebuildBlockIndex()
    }
  }

  function duplicateFormFieldBlock(formBlockId: string, fieldBlockId: string) {
    const formBlock = findBlockById(formBlockId)
    if (!formBlock || formBlock.type !== 'form' || !formBlock.children) return null

    markAsChangedWithHistory()
    const index = formBlock.children.findIndex((child: SectionBlock) => child.id === fieldBlockId)
    if (index === -1) return null

    const original = formBlock.children[index]
    if (!original) return null
    const newField = duplicateSectionBlock(original)
    formBlock.children.splice(index + 1, 0, newField)
    selectedBlockId.value = newField.id
    rebuildBlockIndex()
    return newField
  }

  // ============================================
  // PAGE SETTINGS
  // ============================================

  function updatePageSettings(settings: Partial<PageSettings>) {
    markAsChangedWithHistory()
    Object.assign(pageSettings.value, settings)
  }

  // ============================================
  // THEME & LAYOUT
  // ============================================

  function applyTheme(themeId: string) {
    const theme = getThemeById(themeId)
    if (!theme) return

    markAsChangedWithHistory()
    pageSettings.value = deepClone(theme.pageSettings)
    blocks.value = deepClone(theme.blocks)
    selectedBlockId.value = null
    selectedItemId.value = null
    rebuildBlockIndex()
  }

  function applyLayout(layoutId: string) {
    const layout = getLayoutById(layoutId)
    if (!layout) return

    markAsChangedWithHistory()
    pageSettings.value = deepClone(layout.pageSettings)
    blocks.value = deepClone(layout.blocks)
    selectedBlockId.value = null
    selectedItemId.value = null
    rebuildBlockIndex()
  }

  // ============================================
  // PROJECT ACTIONS
  // ============================================

  async function loadProject(projectId: string, forceReload = false): Promise<boolean> {
    if (currentProjectId.value === projectId && !forceReload) return true

    isLoading.value = true
    try {
      const projectsStore = useProjectsStore()
      const content = await projectsStore.fetchProjectContent(projectId)

      currentProjectId.value = projectId
      if (content) {
        blocks.value = deepClone(content.blocks)
        pageSettings.value = deepClone(content.pageSettings)
        translationsComposable.loadTranslations(content.translations)
      } else {
        blocks.value = []
        pageSettings.value = getDefaultPageSettings()
        translationsComposable.resetTranslations()
      }
      selectedBlockId.value = null
      selectedItemId.value = null
      hasUnsavedChanges.value = false

      rebuildBlockIndex()
      history.clearHistory()

      collaboration.subscribeToProjectChanges(projectId)

      return true
    } catch (e) {
      console.error('Failed to load project:', e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function saveProject(): Promise<boolean> {
    if (!currentProjectId.value) {
      return false
    }

    cancelAutoSave()
    isSaving.value = true

    try {
      const projectsStore = useProjectsStore()
      const success = await projectsStore.saveProjectContent(currentProjectId.value, {
        blocks: blocks.value,
        pageSettings: pageSettings.value,
        translations: translationsComposable.getTranslationsData(),
      })

      if (success) {
        hasUnsavedChanges.value = false
        lastSavedAt.value = new Date().toISOString()
      } else {
        toast.error('Failed to save changes')
      }
      return success
    } catch (e) {
      console.error('Failed to save project:', e)
      toast.error('Failed to save changes')
      return false
    } finally {
      isSaving.value = false
    }
  }

  function getProjectContent(): ProjectContent {
    return {
      blocks: blocks.value,
      pageSettings: pageSettings.value,
      translations: translationsComposable.getTranslationsData(),
    }
  }

  function setProjectContent(content: ProjectContent) {
    blocks.value = content.blocks
    pageSettings.value = content.pageSettings
    translationsComposable.loadTranslations(content.translations)
    hasUnsavedChanges.value = false
    rebuildBlockIndex()
    history.clearHistory()
  }

  function resetEditor() {
    collaboration.unsubscribeFromProjectChanges()

    currentProjectId.value = null
    blocks.value = []
    pageSettings.value = getDefaultPageSettings()
    translationsComposable.resetTranslations()
    selectedBlockId.value = null
    selectedItemId.value = null
    hasUnsavedChanges.value = false
    rebuildBlockIndex()
    history.clearHistory()
  }

  function markUnsavedChanges() {
    hasUnsavedChanges.value = true
  }

  async function reloadProjectContent(): Promise<boolean> {
    if (!currentProjectId.value) return false

    if (hasUnsavedChanges.value) {
      const confirmed = window.confirm(
        'You have unsaved changes that will be lost. Do you want to reload anyway?'
      )
      if (!confirmed) return false
    }

    const success = await loadProject(currentProjectId.value, true)
    if (success) {
      collaboration.clearCollaboratorChanges()
      toast.success('Project reloaded')
    }
    return success
  }

  // ============================================
  // ANIMATION PREVIEW
  // ============================================

  const animationPreviewBlockId = ref<string | null>(null)

  function triggerAnimationPreview(blockId: string) {
    animationPreviewBlockId.value = null

    setTimeout(() => {
      animationPreviewBlockId.value = blockId

      const block = findBlockById(blockId)
      if (block) {
        const styles = block.styles as { animation?: { duration?: number; delay?: number } }
        const duration = (styles.animation?.duration ?? 500) + (styles.animation?.delay ?? 0) + 100
        setTimeout(() => {
          if (animationPreviewBlockId.value === blockId) {
            animationPreviewBlockId.value = null
          }
        }, duration)
      }
    }, 10)
  }

  function isAnimationPreviewing(blockId: string): boolean {
    return animationPreviewBlockId.value === blockId
  }

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    currentProjectId,
    blocks,
    pageSettings,
    selectedBlockId,
    selectedItemId,
    hoveredBlockId,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    viewport,
    isSidebarCollapsed,
    isInspectorCollapsed,
    autoSaveEnabled,
    lastSavedAt,
    // Undo/Redo
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo: history.undo,
    redo: history.redo,
    // Getters
    selectedBlock,
    viewportWidth,
    viewportAspectRatio,
    // Helpers
    findBlockById,
    findParentBlock,
    isProtectedBlock,
    isInsideListCollection,
    isChildInsideListItem,
    isHeaderFooterChild,
    isListCollectionItem,
    isDirectChildOfGrid,
    getParentGridColumns,
    getBlockNestingDepth,
    MAX_LAYOUT_NESTING_DEPTH,
    rebuildBlockIndex,
    // Viewport actions
    setViewport,
    // Panel actions
    toggleSidebar,
    toggleInspector,
    // Interaction actions
    getInteractions: interactions.getInteractions,
    getInteractionsForBlock: interactions.getInteractionsForBlock,
    getInteractionsTargetingBlock: interactions.getInteractionsTargetingBlock,
    getInteractionById: interactions.getInteractionById,
    createInteraction,
    updateInteraction,
    updateInteractionStyles,
    deleteInteraction,
    duplicateInteraction,
    renameInteraction,
    blockHasInteractions: interactions.blockHasInteractions,
    getInteractionCount: interactions.getInteractionCount,
    cleanupBlockInteractions: interactions.cleanupBlockInteractions,
    // Auto-save actions
    cancelAutoSave,
    // Collaboration
    hasCollaboratorChanges: collaboration.hasCollaboratorChanges,
    lastCollaboratorUpdate: collaboration.lastCollaboratorUpdate,
    reloadProjectContent,
    unsubscribeFromProjectChanges: collaboration.unsubscribeFromProjectChanges,
    // Project actions
    loadProject,
    saveProject,
    getProjectContent,
    setProjectContent,
    resetEditor,
    markUnsavedChanges,
    // Block actions
    addBlock,
    addPresetBlock,
    deleteBlock,
    duplicateBlock,
    copyBlock: clipboard.copyBlock,
    cutBlock: clipboard.cutBlock,
    pasteBlock,
    copyBlockStyles: clipboard.copyBlockStyles,
    pasteBlockStyles,
    hasClipboardBlock: clipboard.hasClipboardBlock,
    hasClipboardStyles: clipboard.hasClipboardStyles,
    // Shared styles
    getSharedStylesForType: sharedStyles.getSharedStylesForType,
    getSharedStyleById: sharedStyles.getSharedStyleById,
    createSharedStyle,
    applySharedStyle,
    detachSharedStyle,
    updateSharedStyleFromBlock,
    resetToSharedStyle,
    renameSharedStyle,
    deleteSharedStyle,
    blockHasSharedStyleOverrides: sharedStyles.blockHasSharedStyleOverrides,
    reorderBlocks,
    moveBlockToParent,
    moveBlockToRoot,
    moveBlockUp,
    moveBlockDown,
    selectBlock,
    hoverBlock,
    // Span actions
    selectedSpanId,
    hoveredSpanId,
    selectSpan,
    hoverSpan,
    createSpan,
    updateSpanStyles,
    updateSpanName,
    deleteSpan,
    getSpanById,
    updateBlockSettings,
    updateBlockStyles,
    updateBlockName,
    updateCanvasChildPosition,
    // Header actions
    updateHeaderSettings,
    addHeaderNavLink,
    deleteHeaderNavLink,
    reorderHeaderNavLinks,
    updateHeaderNavLink,
    duplicateHeaderNavLink,
    // Footer actions
    updateFooterSettings,
    addFooterLink,
    deleteFooterLink,
    reorderFooterLinks,
    updateFooterLink,
    duplicateFooterLink,
    addFooterSocialLink,
    deleteFooterSocialLink,
    reorderFooterSocialLinks,
    updateFooterSocialLink,
    duplicateFooterSocialLink,
    // Form field block actions
    addFormFieldBlock,
    deleteFormFieldBlock,
    reorderFormFieldBlocks,
    duplicateFormFieldBlock,
    // Page settings
    updatePageSettings,
    // Theme actions
    applyTheme,
    // Layout actions
    applyLayout,
    // Translation state
    translations: translationsComposable.translations,
    currentLanguage: translationsComposable.currentLanguage,
    availableTranslations: translationsComposable.availableTranslations,
    isEditingTranslation: translationsComposable.isEditingTranslation,
    // Translation actions
    setDefaultLanguage: translationsComposable.setDefaultLanguage,
    addTranslation: translationsComposable.addTranslation,
    removeTranslation: translationsComposable.removeTranslation,
    setCurrentLanguage: translationsComposable.setCurrentLanguage,
    getTranslatedContent: translationsComposable.getTranslatedContent,
    updateBlockTranslation: translationsComposable.updateBlockTranslation,
    getTranslatedNavLinkLabel: translationsComposable.getTranslatedNavLinkLabel,
    updateTranslatedNavLinkLabel: translationsComposable.updateTranslatedNavLinkLabel,
    getTranslatedFooterLinkLabel: translationsComposable.getTranslatedFooterLinkLabel,
    updateTranslatedFooterLinkLabel: translationsComposable.updateTranslatedFooterLinkLabel,
    // Animation preview
    animationPreviewBlockId,
    triggerAnimationPreview,
    isAnimationPreviewing,
  }
})
