import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type {
  SectionBlock,
  SectionBlockType,
  PageSettings,
  ViewportSize,
  CoreBlockStyles,
  GridSettings,
  CanvasSettings,
  CanvasChildPosition,
  SavedComponent,
} from '@/types/editor'
import type { ProjectContent } from '@/types/project'
import {
  createSectionBlock,
  getDefaultPageSettings,
  duplicateSectionBlock,
  canHaveChildren,
  generateId,
} from '@/lib/editor-utils'
import { getThemeById } from '@/lib/themes'
import { getLayoutById } from '@/lib/layouts'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/stores/toast'
import {
  enqueueSave,
  flushQueue,
  clearProjectQueue,
  hasPendingSaves,
  isSyncing,
  saveQueueState,
  type EditorState,
} from '@/lib/editor'

// Import composables
import {
  useHistory,
  useClipboard,
  useSharedStyles,
  useTranslations,
  useCollaboration,
  useItemListOperations,
  // Helpers
  deepClone,
  isLayoutBlockType,
  hasDepthRestriction,
  isProtectedBlockType,
  buildBlockIndex,
  buildBlockIndexes,
  MAX_LAYOUT_NESTING_DEPTH,
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
  const saveStartedAt = ref<number | null>(null) // Track when save started
  const hasUnsavedChanges = ref(false)
  const viewport = ref<ViewportSize>('desktop')
  const isSidebarCollapsed = ref(false)
  const isInspectorCollapsed = ref(false)

  // Effect preview state
  const previewAppearBlockId = ref<string | null>(null)
  const autoSaveEnabled = ref(false)
  const lastSavedAt = ref<string | null>(null)

  // Saved components (reusable block templates)
  const components = ref<SavedComponent[]>([])

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
  // CHANGE TRACKING & SAVE QUEUE
  // ============================================

  // Last saved snapshot for diff computation
  const lastSavedSnapshot = ref<EditorState | null>(null)

  function getCurrentState(): EditorState {
    return {
      blocks: blocks.value,
      pageSettings: pageSettings.value as Record<string, unknown>,
      translations: translationsComposable.getTranslationsData() as unknown as Record<string, unknown>,
      components: components.value,
    }
  }

  function markAsChanged() {
    hasUnsavedChanges.value = true

    // Enqueue save with diff
    if (currentProjectId.value) {
      const currentState = getCurrentState()
      enqueueSave(currentProjectId.value, lastSavedSnapshot.value, currentState)
      // Update snapshot after enqueueing (use deepClone for Vue Proxy compatibility)
      lastSavedSnapshot.value = deepClone(currentState) as EditorState
    }
  }

  function markAsChangedWithHistory() {
    history.pushToHistory()
    markAsChanged()
  }

  function cancelAutoSave() {
    // No-op - auto-save is disabled (we use queue-based saving now)
  }

  // Expose save queue state for UI
  const isSyncingChanges = computed(() => isSyncing.value)
  const hasPendingChanges = computed(() => hasPendingSaves.value)
  const isOffline = computed(() => !saveQueueState.isOnline)

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

  function isDirectChildOfGrid(blockId: string): boolean {
    const parent = findParentBlock(blockId)
    return parent?.type === 'grid'
  }

  function getParentGridColumns(blockId: string): number | null {
    const parent = findParentBlock(blockId)
    if (parent?.type === 'grid') {
      const settings = parent.settings as { columns?: number | string }
      return Number(settings.columns) || 2
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

  function triggerAppearPreview(blockId: string) {
    // Set the block ID to trigger preview in PreviewSection
    previewAppearBlockId.value = blockId
    // Clear after a short delay (the animation will have started)
    setTimeout(() => {
      previewAppearBlockId.value = null
    }, 100)
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
        blocks.value.push(newBlock)
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
  // BLOCK OPERATIONS
  // ============================================

  function addBlock(type: SectionBlockType, index?: number, parentId?: string) {
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

    if (index !== undefined) {
      const safeIndex = Math.max(0, Math.min(index, blocks.value.length))
      blocks.value.splice(safeIndex, 0, block)
    } else {
      blocks.value.push(block)
    }

    selectedBlockId.value = block.id
    selectedItemId.value = null
    rebuildBlockIndex()
    return block
  }

  function addPresetBlock(block: SectionBlock, index?: number, parentId?: string): SectionBlock | null {
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

    if (index !== undefined) {
      const safeIndex = Math.max(0, Math.min(index, blocks.value.length))
      blocks.value.splice(safeIndex, 0, block)
    } else {
      blocks.value.push(block)
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

  function wrapBlockInStack(blockId: string): SectionBlock | null {
    const block = findBlockById(blockId)
    if (!block) return null

    markAsChangedWithHistory()

    // Create a new stack block
    const stackBlock = createSectionBlock('stack')
    stackBlock.name = 'Stack'

    // Check if it's a root-level block
    const rootIndex = blocks.value.findIndex((b: SectionBlock) => b.id === blockId)
    if (rootIndex !== -1) {
      // Remove the block from root
      blocks.value.splice(rootIndex, 1)
      // Add the block as child of the stack
      stackBlock.children = [block]
      // Insert the stack at the same position
      blocks.value.splice(rootIndex, 0, stackBlock)
    } else {
      // It's a nested block - find its parent
      const parent = findParentBlock(blockId)
      if (parent && parent.children) {
        const childIndex = parent.children.findIndex((b: SectionBlock) => b.id === blockId)
        if (childIndex !== -1) {
          // Remove the block from parent
          parent.children.splice(childIndex, 1)
          // Add the block as child of the stack
          stackBlock.children = [block]
          // Insert the stack at the same position
          parent.children.splice(childIndex, 0, stackBlock)
        }
      }
    }

    selectedBlockId.value = stackBlock.id
    selectedItemId.value = null
    rebuildBlockIndex()
    return stackBlock
  }

  /**
   * Convert a block's type (e.g., stack to button)
   */
  function convertBlockType(blockId: string, newType: SectionBlockType): boolean {
    const block = findBlockById(blockId)
    if (!block) return false

    markAsChangedWithHistory()

    // Change the block type
    block.type = newType

    // Get default settings and styles for the new type
    const defaultBlock = createSectionBlock(newType)

    // Merge settings: keep existing settings that are compatible, add new defaults
    block.settings = {
      ...defaultBlock.settings,
      ...block.settings,
    } as typeof defaultBlock.settings

    // Merge styles: keep existing styles, add new defaults
    block.styles = {
      ...defaultBlock.styles,
      ...block.styles,
    } as typeof defaultBlock.styles

    // If converting to a non-layout block, remove children
    if (!canHaveChildren(newType) && block.children) {
      delete block.children
    }

    rebuildBlockIndex()
    return true
  }

  // ============================================
  // COMPONENTS (Reusable block templates)
  // ============================================

  function createComponent(blockId: string, name?: string): SavedComponent | null {
    const block = findBlockById(blockId)
    if (!block) return null

    // Deep clone the block and all its children
    const blockCopy = duplicateSectionBlock(block)

    const component: SavedComponent = {
      id: generateId(),
      name: name || `${block.name} Component`,
      block: blockCopy,
      createdAt: new Date().toISOString(),
    }

    components.value.push(component)
    markAsChangedWithHistory()
    toast.success('Component created', `"${component.name}" saved to components`)
    return component
  }

  function insertComponent(componentId: string, parentId?: string, index?: number): SectionBlock | null {
    const component = components.value.find(c => c.id === componentId)
    if (!component) return null

    // Create a fresh copy with new IDs
    const newBlock = duplicateSectionBlock(component.block)

    if (parentId) {
      const parent = findBlockById(parentId)
      if (parent && canHaveChildren(parent.type)) {
        if (!parent.children) parent.children = []
        const insertIndex = index ?? parent.children.length
        parent.children.splice(insertIndex, 0, newBlock)
      }
    } else {
      const insertIndex = index ?? blocks.value.length
      blocks.value.splice(insertIndex, 0, newBlock)
    }

    selectedBlockId.value = newBlock.id
    selectedItemId.value = null
    rebuildBlockIndex()
    markAsChangedWithHistory()
    return newBlock
  }

  function deleteComponent(componentId: string) {
    const index = components.value.findIndex(c => c.id === componentId)
    if (index !== -1) {
      const component = components.value[index]!
      components.value.splice(index, 1)
      markAsChangedWithHistory()
      toast.success('Component deleted', `"${component.name}" removed`)
    }
  }

  function renameComponent(componentId: string, newName: string) {
    const component = components.value.find(c => c.id === componentId)
    if (component) {
      component.name = newName
      markAsChangedWithHistory()
    }
  }

  function reorderBlocks(fromIndex: number, toIndex: number, parentId?: string) {
    const blockList = parentId ? findBlockById(parentId)?.children : blocks.value
    if (!blockList) return

    const block = blockList[fromIndex]
    if (!block) return

    markAsChangedWithHistory()

    const [movedBlock] = blockList.splice(fromIndex, 1)
    if (movedBlock) {
      // Adjust index when moving down - after removal, indices shift
      const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex
      blockList.splice(adjustedIndex, 0, movedBlock)
      rebuildBlockIndex()
    }
  }

  function moveBlockToParent(blockId: string, newParentId: string, toIndex?: number) {
    const block = findBlockById(blockId)
    if (!block) return false

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
    if (!block) return false

    const currentParent = findParentBlock(blockId)
    if (!currentParent) return false

    markAsChangedWithHistory()

    if (currentParent.children) {
      const index = currentParent.children.findIndex((b: SectionBlock) => b.id === blockId)
      if (index !== -1) {
        currentParent.children.splice(index, 1)
      }
    }

    const insertIndex = toIndex !== undefined
      ? Math.max(0, Math.min(toIndex, blocks.value.length))
      : blocks.value.length

    blocks.value.splice(insertIndex, 0, block)
    rebuildBlockIndex()
    return true
  }

  function moveBlockUp(blockIndex: number, parentId?: string) {
    const blockList = parentId ? findBlockById(parentId)?.children : blocks.value
    if (!blockList) return

    const block = blockList[blockIndex]
    if (!block) return

    if (blockIndex <= 0) return

    reorderBlocks(blockIndex, blockIndex - 1, parentId)
  }

  function moveBlockDown(blockIndex: number, parentId?: string) {
    const blockList = parentId ? findBlockById(parentId)?.children : blocks.value
    if (!blockList) return

    const block = blockList[blockIndex]
    if (!block) return

    if (blockIndex >= blockList.length - 1) return

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

      Object.assign(block.settings, settings)

      if (block.sharedStyleId) {
        const style = sharedStyles.getSharedStyleById(block.sharedStyleId)
        if (style) {
          sharedStyles.updateSharedStyleFromBlock(blockId)
        }
      }

      rebuildBlockIndex()
    }
  }

  function updateBlockStyles(blockId: string, styles: Record<string, unknown>, replaceAll = false) {
    const block = findBlockById(blockId)
    if (block) {
      markAsChangedWithHistory()

      if (replaceAll) {
        block.styles = { ...styles }
      } else {
        // Create new object reference to ensure Vue reactivity is triggered
        block.styles = { ...block.styles, ...styles }
      }

      if (block.sharedStyleId) {
        const style = sharedStyles.getSharedStyleById(block.sharedStyleId)
        if (style) {
          style.styles = deepClone(block.styles) as typeof style.styles
          style.updatedAt = new Date().toISOString()
          sharedStyles.applySharedStyleToAllBlocks(style)
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
        components.value = deepClone(content.components || [])
        translationsComposable.loadTranslations(content.translations)
      } else {
        blocks.value = []
        pageSettings.value = getDefaultPageSettings()
        components.value = []
        translationsComposable.resetTranslations()
      }
      selectedBlockId.value = null
      selectedItemId.value = null
      hasUnsavedChanges.value = false

      rebuildBlockIndex()
      history.clearHistory()

      // Initialize snapshot for diff computation (use deepClone for Vue Proxy compatibility)
      lastSavedSnapshot.value = deepClone(getCurrentState()) as EditorState

      // Clear any stale queue entries for this project (we just loaded fresh data)
      clearProjectQueue(projectId)

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

    // Check if already syncing
    if (isSaving.value) {
      console.log('Save already in progress, skipping')
      return false
    }

    isSaving.value = true
    saveStartedAt.value = Date.now()

    try {
      // Flush the save queue - this processes all pending diffs
      const success = await flushQueue()

      if (success) {
        hasUnsavedChanges.value = false
        lastSavedAt.value = new Date().toISOString()
        return true
      }

      // Queue still has items - some saves failed
      toast.error('Failed to save all changes', 'Will retry automatically')
      return false
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      console.error('Failed to save project:', errorMessage)
      toast.error('Failed to save changes', errorMessage)
      return false
    } finally {
      isSaving.value = false
      saveStartedAt.value = null
    }
  }

  function getProjectContent(): ProjectContent {
    return {
      blocks: blocks.value,
      pageSettings: pageSettings.value,
      translations: translationsComposable.getTranslationsData(),
      components: components.value,
    }
  }

  function setProjectContent(content: ProjectContent) {
    blocks.value = content.blocks
    pageSettings.value = content.pageSettings
    components.value = content.components || []
    translationsComposable.loadTranslations(content.translations)
    hasUnsavedChanges.value = false
    rebuildBlockIndex()
    history.clearHistory()
  }

  function resetEditor() {
    collaboration.unsubscribeFromProjectChanges()

    // Clear save queue for current project before resetting
    if (currentProjectId.value) {
      clearProjectQueue(currentProjectId.value)
    }

    currentProjectId.value = null
    blocks.value = []
    pageSettings.value = getDefaultPageSettings()
    translationsComposable.resetTranslations()
    selectedBlockId.value = null
    selectedItemId.value = null
    hasUnsavedChanges.value = false
    lastSavedSnapshot.value = null
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
    // Save queue state
    isSyncingChanges,
    hasPendingChanges,
    isOffline,
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
    isDirectChildOfGrid,
    getParentGridColumns,
    getBlockNestingDepth,
    MAX_LAYOUT_NESTING_DEPTH,
    rebuildBlockIndex,
    // Viewport actions
    setViewport,
    // Effect preview
    previewAppearBlockId,
    triggerAppearPreview,
    // Panel actions
    toggleSidebar,
    toggleInspector,
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
    wrapBlockInStack,
    convertBlockType,
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
    // Components
    components,
    createComponent,
    insertComponent,
    deleteComponent,
    renameComponent,
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
    // Animation preview
    animationPreviewBlockId,
    triggerAnimationPreview,
    isAnimationPreviewing,
  }
})
