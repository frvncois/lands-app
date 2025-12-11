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
  LanguageCode,
  ProjectTranslations,
  BlockTranslation,
  ViewportSize,
  CoreBlockStyles,
  FormFieldBlockType,
  GridSettings,
  CanvasSettings,
  CanvasChildPosition,
  SharedStyle,
  StyleState,
  StateStyles,
} from '@/types/editor'
import { STYLE_STATE_BLOCK_TYPES } from '@/types/editor'
import { DEFAULT_LANGUAGE } from '@/lib/languages'
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
  extractStyleSettings,
  applyStyleSettings,
  hasSharedStyleOverrides,
} from '@/lib/editor-utils'
import { getThemeById } from '@/lib/themes'
import { getLayoutById } from '@/lib/layouts'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Re-export ViewportSize for consumers
export type { ViewportSize }

// Auto-save is disabled - manual save only (Cmd+S)
// This prevents API spam and works better with collaborators

// History configuration
const MAX_HISTORY_SIZE = 100

// History snapshot type
interface HistorySnapshot {
  blocks: SectionBlock[]
  pageSettings: PageSettings
  selectedBlockId: string | null
  selectedItemId: string | null
}

export const useEditorStore = defineStore('editor', () => {
  const toast = useToast()

  // State
  const currentProjectId = ref<string | null>(null)
  const blocks = ref<SectionBlock[]>([])
  const pageSettings = ref<PageSettings>(getDefaultPageSettings())
  const selectedBlockId = ref<string | null>(null)
  const selectedItemId = ref<string | null>(null) // For items within blocks (form fields, list items, etc.)
  const hoveredBlockId = ref<string | null>(null) // Track which block is currently hovered
  const isLoading = ref(false)
  const isSaving = ref(false)
  const hasUnsavedChanges = ref(false)
  const viewport = ref<ViewportSize>('desktop')
  const isSidebarCollapsed = ref(false)
  const isInspectorCollapsed = ref(false)
  const currentStyleState = ref<StyleState>('none') // For editing hover/pressed/focused states
  const autoSaveEnabled = ref(false) // Disabled - manual save only
  const lastSavedAt = ref<string | null>(null)

  // ============================================
  // REALTIME COLLABORATION STATE
  // ============================================

  let realtimeChannel: RealtimeChannel | null = null
  const hasCollaboratorChanges = ref(false) // True when collaborator made changes we haven't loaded
  const lastCollaboratorUpdate = ref<string | null>(null) // Timestamp of last collaborator change

  // ============================================
  // TRANSLATIONS STATE
  // ============================================

  const translations = ref<ProjectTranslations>({
    defaultLanguage: DEFAULT_LANGUAGE,
    languages: {},
  })
  const currentLanguage = ref<LanguageCode | null>(null) // null = default (edit source content)

  // ============================================
  // BLOCK INDEX (O(1) lookups)
  // ============================================

  // Block index map for O(1) lookups - use shallowRef for performance
  const blockIndex = shallowRef<Map<string, SectionBlock>>(new Map())

  // Rebuild the block index from the current blocks tree
  function rebuildBlockIndex() {
    const map = new Map<string, SectionBlock>()
    const traverse = (blockList: SectionBlock[]) => {
      for (const block of blockList) {
        map.set(block.id, block)
        // Index direct children (layout blocks)
        if (block.children) {
          traverse(block.children)
        }
      }
    }
    traverse(blocks.value)
    blockIndex.value = map
  }

  // ============================================
  // UNDO/REDO HISTORY
  // ============================================

  const undoStack = shallowRef<HistorySnapshot[]>([])
  const redoStack = shallowRef<HistorySnapshot[]>([])

  // Check if undo/redo is available
  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  // ============================================
  // CLIPBOARD (for copy/cut/paste blocks and styles)
  // ============================================

  const clipboardBlock = ref<SectionBlock | null>(null)
  const clipboardStyles = ref<Record<string, unknown> | null>(null)
  const clipboardIsCut = ref(false) // Track if the clipboard block was cut (to delete source on paste)

  // Check if clipboard has content
  const hasClipboardBlock = computed(() => clipboardBlock.value !== null)
  const hasClipboardStyles = computed(() => clipboardStyles.value !== null)

  // Deep clone helper that handles Vue reactive objects
  function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  // Create a snapshot of current state
  function createSnapshot(): HistorySnapshot {
    return {
      blocks: deepClone(blocks.value),
      pageSettings: deepClone(pageSettings.value),
      selectedBlockId: selectedBlockId.value,
      selectedItemId: selectedItemId.value,
    }
  }

  // Push current state to undo stack before making changes
  function pushToHistory() {
    const snapshot = createSnapshot()
    const newStack = [...undoStack.value, snapshot]

    // Keep only the last MAX_HISTORY_SIZE items
    if (newStack.length > MAX_HISTORY_SIZE) {
      newStack.shift()
    }

    undoStack.value = newStack
    // Clear redo stack when new action is performed
    redoStack.value = []
  }

  // Undo last action
  function undo() {
    if (!canUndo.value) return

    // Save current state to redo stack
    const currentSnapshot = createSnapshot()
    redoStack.value = [...redoStack.value, currentSnapshot]

    // Pop and apply the last undo state
    const newUndoStack = [...undoStack.value]
    const snapshot = newUndoStack.pop()!
    undoStack.value = newUndoStack

    // Apply snapshot without triggering history
    applySnapshot(snapshot)

    // Rebuild index after undo
    rebuildBlockIndex()

    // Mark as changed
    hasUnsavedChanges.value = true
  }

  // Redo last undone action
  function redo() {
    if (!canRedo.value) return

    // Save current state to undo stack
    const currentSnapshot = createSnapshot()
    undoStack.value = [...undoStack.value, currentSnapshot]

    // Pop and apply the last redo state
    const newRedoStack = [...redoStack.value]
    const snapshot = newRedoStack.pop()!
    redoStack.value = newRedoStack

    // Apply snapshot without triggering history
    applySnapshot(snapshot)

    // Rebuild index after redo
    rebuildBlockIndex()

    // Mark as changed
    hasUnsavedChanges.value = true
  }

  // Apply a snapshot to current state
  function applySnapshot(snapshot: HistorySnapshot) {
    blocks.value = snapshot.blocks
    pageSettings.value = snapshot.pageSettings
    selectedBlockId.value = snapshot.selectedBlockId
    selectedItemId.value = snapshot.selectedItemId
  }

  // Clear history (when loading a new project)
  function clearHistory() {
    undoStack.value = []
    redoStack.value = []
  }

  // ============================================
  // CHANGE TRACKING (Manual save only)
  // ============================================

  // Mark content as changed
  function markAsChanged() {
    hasUnsavedChanges.value = true
    rebuildBlockIndex()
  }

  // Mark as changed with history (for undoable actions)
  function markAsChangedWithHistory() {
    pushToHistory()
    markAsChanged()
  }

  // Cancel pending auto-save (kept for API compatibility, but no-op now)
  function cancelAutoSave() {
    // No-op - auto-save is disabled
  }

  // ============================================
  // REALTIME COLLABORATION
  // ============================================

  // Subscribe to project content changes
  function subscribeToProjectChanges(projectId: string) {
    // Unsubscribe from previous channel if exists
    unsubscribeFromProjectChanges()

    const userStore = useUserStore()
    const currentUserId = userStore.user?.id

    // Subscribe to changes on project_content table
    realtimeChannel = supabase
      .channel(`project-content-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'project_content',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          // Ignore our own changes (check updated_by or compare timestamps)
          const updatedAt = payload.new.updated_at as string

          // If we just saved, this is likely our own change
          if (lastSavedAt.value && new Date(updatedAt).getTime() - new Date(lastSavedAt.value).getTime() < 2000) {
            return
          }

          // Another collaborator made changes
          hasCollaboratorChanges.value = true
          lastCollaboratorUpdate.value = updatedAt

          toast.info(
            'Project updated',
            'A collaborator made changes. Click "Reload" to see the latest version.'
          )
        }
      )
      .subscribe()
  }

  // Unsubscribe from project changes
  function unsubscribeFromProjectChanges() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
    hasCollaboratorChanges.value = false
    lastCollaboratorUpdate.value = null
  }

  // Reload project content (after collaborator changes)
  async function reloadProjectContent(): Promise<boolean> {
    if (!currentProjectId.value) return false

    // Warn if there are unsaved changes
    if (hasUnsavedChanges.value) {
      const confirmed = window.confirm(
        'You have unsaved changes that will be lost. Do you want to reload anyway?'
      )
      if (!confirmed) return false
    }

    const success = await loadProject(currentProjectId.value, true)
    if (success) {
      hasCollaboratorChanges.value = false
      lastCollaboratorUpdate.value = null
      toast.success('Project reloaded')
    }
    return success
  }

  // ============================================
  // GETTERS
  // ============================================

  const selectedBlock = computed(() => {
    if (!selectedBlockId.value) return null
    return blockIndex.value.get(selectedBlockId.value) || null
  })

  // O(1) block lookup using index
  function findBlockById(id: string): SectionBlock | null {
    return blockIndex.value.get(id) || null
  }

  // Helper to find parent of a block
  function findParentBlock(blockId: string, blockList: SectionBlock[] = blocks.value, parent: SectionBlock | null = null): SectionBlock | null {
    for (const block of blockList) {
      if (block.id === blockId) return parent
      // Check direct children (layout blocks)
      if (block.children) {
        // Check if blockId is a direct child of this block
        const isDirectChild = block.children.some((child: SectionBlock) => child.id === blockId)
        if (isDirectChild) return block
        // Otherwise search deeper
        const found = findParentBlock(blockId, block.children, block)
        if (found) return found
      }
    }
    return null
  }

  // Helper to calculate the nesting depth of a block (0 = root level)
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

  // Check if a block type is a layout block (container/grid have depth restrictions, stack does not)
  function isLayoutBlockType(type: SectionBlockType): boolean {
    return type === 'container' || type === 'grid' || type === 'stack'
  }

  // Check if a block type has depth restrictions (stack is allowed at any depth)
  function hasDepthRestriction(type: SectionBlockType): boolean {
    return type === 'container' || type === 'grid'
  }

  // Maximum nesting depth for layout blocks (0 = root, 1 = first child level, 2 = second child level)
  // Note: Stack blocks are exempt from this restriction
  const MAX_LAYOUT_NESTING_DEPTH = 2
  const MAX_MENU_LIST_DEPTH = 2

  function isMenuListBlock(block: SectionBlock | null): boolean {
    if (!block || block.type !== 'grid') return false
    const settings = block.settings as GridSettings
    return settings.collectionType === 'menu-list'
  }

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

  // Helper to check if a block is protected (header/footer)
  function isProtectedBlock(blockId: string): boolean {
    const block = findBlockById(blockId)
    return block?.type === 'header' || block?.type === 'footer'
  }

  // Helper to check if a block is a direct child of Header/Footer (Start, Middle, End stacks)
  function isHeaderFooterChild(blockId: string): boolean {
    const parent = findParentBlock(blockId)
    return parent?.type === 'header' || parent?.type === 'footer'
  }

  // Helper to check if a block is a list/collection item (Stack directly inside Grid)
  // Prebuilt list/collection names (from preset types)
  // ONLY these grids should have shared style restrictions
  const PREBUILT_LIST_NAMES = [
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

  // Check if a Grid is a PREBUILT list/collection (has prebuilt name)
  function isPrebuiltListGrid(grid: SectionBlock | null): boolean {
    if (!grid || grid.type !== 'grid') return false
    return PREBUILT_LIST_NAMES.includes(grid.name)
  }

  // Check if block is a list item in a PREBUILT list/collection
  function isListCollectionItem(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'stack') return false
    const parent = findParentBlock(blockId)
    // ONLY return true if parent is a PREBUILT Grid
    return isPrebuiltListGrid(parent)
  }

  // Helper to check if a block is inside a PREBUILT List/Collection pattern
  function isInsideListCollection(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block) return false

    const parent = findParentBlock(blockId)

    // Case 1: This block IS a Stack item inside a PREBUILT Grid
    if (block.type === 'stack' && parent && isPrebuiltListGrid(parent)) {
      return true
    }

    // Case 2: This block is inside a Stack which is inside a PREBUILT Grid
    if (parent && parent.type === 'stack') {
      const grandparent = findParentBlock(parent.id)
      if (isPrebuiltListGrid(grandparent)) {
        return true
      }
    }

    return false
  }

  // Check if a block is a CHILD inside a PREBUILT list item (not the list item itself)
  // This walks up the tree to find if any ancestor is a Stack with PREBUILT Grid parent
  function isChildInsideListItem(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block) return false

    // Walk up the tree
    let currentId = blockId
    let parent = findParentBlock(currentId)

    while (parent) {
      // Check if parent is a Stack with a PREBUILT Grid grandparent (meaning parent is a list item)
      if (parent.type === 'stack') {
        const grandparent = findParentBlock(parent.id)
        if (isPrebuiltListGrid(grandparent)) {
          // Parent is a prebuilt list item, and we are inside it
          return true
        }
      }
      // Move up the tree
      currentId = parent.id
      parent = findParentBlock(currentId)
    }

    return false
  }

  // Check if a block is a direct child of a Grid (for grid item placement)
  function isDirectChildOfGrid(blockId: string): boolean {
    const parent = findParentBlock(blockId)
    return parent?.type === 'grid'
  }

  // Get the parent Grid's column count for a block
  function getParentGridColumns(blockId: string): number | null {
    const parent = findParentBlock(blockId)
    if (parent?.type === 'grid') {
      const settings = parent.settings as { columns?: number }
      return settings.columns || 2
    }
    return null
  }

  // Viewport width based on current viewport size
  const viewportWidth = computed(() => {
    const widthMap: Record<ViewportSize, string> = {
      desktop: '100%',
      tablet: '768px',
      mobile: '375px',
    }
    return widthMap[viewport.value]
  })

  // Viewport aspect ratio for device simulation
  const viewportAspectRatio = computed(() => {
    const ratioMap: Record<ViewportSize, number | null> = {
      desktop: null,
      tablet: 4 / 3,
      mobile: 9 / 19.5,
    }
    return ratioMap[viewport.value]
  })

  // ============================================
  // VIEWPORT & PANEL ACTIONS
  // ============================================

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
  // STYLE STATE ACTIONS
  // ============================================

  function setStyleState(state: StyleState) {
    currentStyleState.value = state
  }

  // Check if a block type supports style states
  function supportsStyleStates(blockType: SectionBlockType): boolean {
    return STYLE_STATE_BLOCK_TYPES.includes(blockType)
  }

  // Reset the current state styles for a block (clear hover/pressed/focused overrides)
  function resetStateStyles(blockId: string) {
    const block = findBlockById(blockId)
    if (!block) return

    const state = currentStyleState.value
    if (state === 'none') return

    markAsChangedWithHistory()

    const styles = block.styles as Record<string, unknown>
    delete styles[state]

    // If block has a shared style, also update the shared style
    if (block.sharedStyleId) {
      const sharedStyle = getSharedStyleById(block.sharedStyleId)
      if (sharedStyle) {
        const sharedStyles = sharedStyle.styles as Record<string, unknown>
        delete sharedStyles[state]
        sharedStyle.updatedAt = new Date().toISOString()
        applySharedStyleToAllBlocks(sharedStyle)
      }
    }

    rebuildBlockIndex()
  }

  // Check if a block has any state styles defined for the current state
  function hasStateStyles(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block) return false

    const state = currentStyleState.value
    if (state === 'none') return false

    const styles = block.styles as Record<string, unknown>
    const stateStyles = styles[state] as Record<string, unknown> | undefined
    return stateStyles !== undefined && Object.keys(stateStyles).length > 0
  }

  // Check if a block has styles defined for a specific state
  function hasStylesForState(blockId: string, state: 'hover' | 'pressed' | 'focused'): boolean {
    const block = findBlockById(blockId)
    if (!block) return false

    const styles = block.styles as Record<string, unknown>
    const stateStyles = styles[state] as Record<string, unknown> | undefined
    return stateStyles !== undefined && Object.keys(stateStyles).length > 0
  }

  // ============================================
  // BLOCK ACTIONS
  // ============================================

  function addBlock(type: SectionBlockType, index?: number, parentId?: string) {
    // Don't allow adding header or footer blocks manually
    if (type === 'header' || type === 'footer') return null

    // If adding to a parent block, check nesting depth for layout blocks (except Stack which has no limit)
    if (parentId && hasDepthRestriction(type)) {
      const parentDepth = getBlockNestingDepth(parentId)
      // Parent is at depth N, so child will be at depth N+1
      // We only allow container/grid blocks up to MAX_LAYOUT_NESTING_DEPTH
      if (parentDepth >= MAX_LAYOUT_NESTING_DEPTH) {
        console.warn(`Cannot add ${type} block at depth ${parentDepth + 1}. Maximum nesting depth for container/grid blocks is ${MAX_LAYOUT_NESTING_DEPTH + 1}. Use Stack for deeper nesting.`)
        return null
      }
    }

    // Push to history before making changes
    markAsChangedWithHistory()

    const block = createSectionBlock(type)

    // If adding to a parent block
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

    // Adding to root level
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

  // Add a pre-built preset block (already constructed with children)
  function addPresetBlock(block: SectionBlock, index?: number, parentId?: string): SectionBlock | null {
    if (!applyMenuListLevel(block, parentId)) {
      return null
    }

    // Push to history before making changes
    markAsChangedWithHistory()

    // If adding to a parent block
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

    // Adding to root level
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

    // Push to history before making changes
    markAsChangedWithHistory()

    // Try to delete from root level
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

    // Try to delete from parent
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

    // Push to history before making changes
    markAsChangedWithHistory()

    const newBlock = duplicateSectionBlock(block)

    // Check if in root or parent
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

  // ============================================
  // CLIPBOARD OPERATIONS
  // ============================================

  // Copy block to clipboard
  function copyBlock(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || isProtectedBlock(blockId)) return

    clipboardBlock.value = deepClone(block)
    clipboardIsCut.value = false
    toast.info('Block copied')
  }

  // Cut block to clipboard (will be deleted on paste)
  function cutBlock(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || isProtectedBlock(blockId)) return

    clipboardBlock.value = deepClone(block)
    clipboardIsCut.value = true
    toast.info('Block cut')
  }

  // Paste block from clipboard
  function pasteBlock(parentId?: string) {
    if (!clipboardBlock.value) return null

    // Create a new block from clipboard with new IDs
    const newBlock = duplicateSectionBlock(clipboardBlock.value)

    if (!applyMenuListLevel(newBlock, parentId)) {
      return null
    }

    // Push to history before making changes
    markAsChangedWithHistory()

    if (parentId) {
      // Paste into a specific parent
      const parent = findBlockById(parentId)
      if (parent && canHaveChildren(parent.type)) {
        if (!parent.children) parent.children = []
        parent.children.push(newBlock)
      }
    } else {
      // Paste at root level (before footer if exists)
      const footerIndex = blocks.value.findIndex((b: SectionBlock) => b.type === 'footer')
      if (footerIndex !== -1) {
        blocks.value.splice(footerIndex, 0, newBlock)
      } else {
        blocks.value.push(newBlock)
      }
    }

    // If it was a cut operation, delete the original block
    if (clipboardIsCut.value && clipboardBlock.value) {
      const originalId = clipboardBlock.value.id
      // Find and delete the original (without adding to history again)
      const originalBlock = findBlockById(originalId)
      if (originalBlock) {
        const parent = findParentBlock(originalId)
        if (parent && parent.children) {
          const index = parent.children.findIndex((b: SectionBlock) => b.id === originalId)
          if (index !== -1) parent.children.splice(index, 1)
        } else {
          const rootIndex = blocks.value.findIndex((b: SectionBlock) => b.id === originalId)
          if (rootIndex !== -1) blocks.value.splice(rootIndex, 1)
        }
      }
      clipboardIsCut.value = false
    }

    selectedBlockId.value = newBlock.id
    selectedItemId.value = null
    rebuildBlockIndex()
    toast.success('Block pasted')
    return newBlock
  }

  // Copy block styles to clipboard
  function copyBlockStyles(blockId: string) {
    const block = findBlockById(blockId)
    if (!block) return

    clipboardStyles.value = deepClone(block.styles as Record<string, unknown>)
    toast.info('Style copied')
  }

  // Paste styles from clipboard to a block
  function pasteBlockStyles(blockId: string) {
    if (!clipboardStyles.value) return

    const block = findBlockById(blockId)
    if (!block) return

    // Push to history before making changes
    markAsChangedWithHistory()

    // Merge styles (overwrite existing properties)
    block.styles = { ...block.styles, ...deepClone(clipboardStyles.value) }
    rebuildBlockIndex()
    toast.success('Style applied')
  }

  // ============================================
  // SHARED STYLES
  // ============================================

  // Get shared styles for a specific block type
  function getSharedStylesForType(blockType: SectionBlockType): SharedStyle[] {
    return (pageSettings.value.sharedStyles || []).filter(s => s.blockType === blockType)
  }

  // Get a shared style by ID
  function getSharedStyleById(styleId: string): SharedStyle | undefined {
    return (pageSettings.value.sharedStyles || []).find(s => s.id === styleId)
  }

  // Create a new shared style from a block
  function createSharedStyle(name: string, blockId: string): SharedStyle | null {
    const block = findBlockById(blockId)
    if (!block) return null

    const now = new Date().toISOString()
    const newStyle: SharedStyle = {
      id: generateId(),
      name,
      blockType: block.type,
      styles: deepClone(block.styles) as SharedStyle['styles'],
      settings: extractStyleSettings(block.type, block.settings as Record<string, unknown>),
      createdAt: now,
      updatedAt: now,
    }

    // Push to history before making changes
    markAsChangedWithHistory()

    // Add to page settings
    if (!pageSettings.value.sharedStyles) {
      pageSettings.value.sharedStyles = []
    }
    pageSettings.value.sharedStyles.push(newStyle)

    // Link the block to this shared style
    block.sharedStyleId = newStyle.id
    rebuildBlockIndex()

    toast.success('Shared style created')
    return newStyle
  }

  // Apply a shared style to a block
  function applySharedStyle(blockId: string, styleId: string) {
    const block = findBlockById(blockId)
    const style = getSharedStyleById(styleId)
    if (!block || !style) return

    // Only apply to same block type
    if (block.type !== style.blockType) {
      toast.error('Style type mismatch')
      return
    }

    // Push to history before making changes
    markAsChangedWithHistory()

    // Apply styles
    block.styles = deepClone(style.styles) as typeof block.styles

    // Apply settings (preserving content fields)
    block.settings = applyStyleSettings(
      block.type,
      block.settings as Record<string, unknown>,
      style.settings
    ) as typeof block.settings

    // Link the block
    block.sharedStyleId = styleId
    rebuildBlockIndex()

    toast.success('Shared style applied')
  }

  // Detach a block from its shared style (keeps current styles)
  function detachSharedStyle(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || !block.sharedStyleId) return

    // Push to history before making changes
    markAsChangedWithHistory()

    delete block.sharedStyleId
    rebuildBlockIndex()

    toast.info('Style detached')
  }

  // Update a shared style from the current block's styles
  function updateSharedStyleFromBlock(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || !block.sharedStyleId) return

    const style = getSharedStyleById(block.sharedStyleId)
    if (!style) return

    // Push to history before making changes
    markAsChangedWithHistory()

    // Update the shared style
    style.styles = deepClone(block.styles) as SharedStyle['styles']
    style.settings = extractStyleSettings(block.type, block.settings as Record<string, unknown>)
    style.updatedAt = new Date().toISOString()

    // Apply to all blocks using this style
    applySharedStyleToAllBlocks(style)
    rebuildBlockIndex()

    toast.success('Shared style updated')
  }

  // Reset a block to its shared style (discard local changes)
  function resetToSharedStyle(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || !block.sharedStyleId) return

    const style = getSharedStyleById(block.sharedStyleId)
    if (!style) return

    // Push to history before making changes
    markAsChangedWithHistory()

    // Reset to shared style
    block.styles = deepClone(style.styles) as typeof block.styles
    block.settings = applyStyleSettings(
      block.type,
      block.settings as Record<string, unknown>,
      style.settings
    ) as typeof block.settings
    rebuildBlockIndex()

    toast.info('Reset to shared style')
  }

  // Rename a shared style
  function renameSharedStyle(styleId: string, name: string) {
    const style = getSharedStyleById(styleId)
    if (!style) return

    markAsChangedWithHistory()
    style.name = name
    style.updatedAt = new Date().toISOString()
  }

  // Delete a shared style (detaches all blocks using it)
  function deleteSharedStyle(styleId: string) {
    const styles = pageSettings.value.sharedStyles
    if (!styles) return

    const index = styles.findIndex(s => s.id === styleId)
    if (index === -1) return

    // Push to history before making changes
    markAsChangedWithHistory()

    // Detach all blocks using this style
    function detachFromBlocks(blockList: SectionBlock[]) {
      for (const block of blockList) {
        if (block.sharedStyleId === styleId) {
          delete block.sharedStyleId
        }
        if (block.children) {
          detachFromBlocks(block.children)
        }
      }
    }
    detachFromBlocks(blocks.value)

    // Remove the style
    styles.splice(index, 1)
    rebuildBlockIndex()

    toast.info('Shared style deleted')
  }

  // Helper: Apply a shared style to all blocks using it
  function applySharedStyleToAllBlocks(style: SharedStyle) {
    function applyToBlocks(blockList: SectionBlock[]) {
      for (const block of blockList) {
        if (block.sharedStyleId === style.id) {
          block.styles = deepClone(style.styles) as typeof block.styles
          block.settings = applyStyleSettings(
            block.type,
            block.settings as Record<string, unknown>,
            style.settings
          ) as typeof block.settings
        }
        if (block.children) {
          applyToBlocks(block.children)
        }
      }
    }
    applyToBlocks(blocks.value)
  }

  // Check if a block has local overrides from its shared style
  function blockHasSharedStyleOverrides(blockId: string): boolean {
    const block = findBlockById(blockId)
    if (!block || !block.sharedStyleId) return false

    const style = getSharedStyleById(block.sharedStyleId)
    if (!style) return false

    return hasSharedStyleOverrides(
      block.type,
      block.settings as Record<string, unknown>,
      block.styles as Record<string, unknown>,
      style.settings,
      style.styles as Record<string, unknown>
    )
  }

  function reorderBlocks(fromIndex: number, toIndex: number, parentId?: string) {
    const blockList = parentId ? findBlockById(parentId)?.children : blocks.value
    if (!blockList) return

    const block = blockList[fromIndex]
    if (!block || block.type === 'header' || block.type === 'footer') return

    // For root level, protect header/footer positions
    if (!parentId) {
      if (toIndex === 0 && blocks.value[0]?.type === 'header') return
      const lastIndex = blocks.value.length - 1
      if (toIndex === lastIndex && blocks.value[lastIndex]?.type === 'footer') return
    }

    // Push to history before making changes
    markAsChangedWithHistory()

    const [movedBlock] = blockList.splice(fromIndex, 1)
    if (movedBlock) {
      blockList.splice(toIndex, 0, movedBlock)
      rebuildBlockIndex()
    }
  }

  // Move a block from one parent to another
  function moveBlockToParent(blockId: string, newParentId: string, toIndex?: number) {
    const block = findBlockById(blockId)
    if (!block || block.type === 'header' || block.type === 'footer') return false

    const currentParent = findParentBlock(blockId)
    const newParent = findBlockById(newParentId)

    // Can't move to same parent (use reorderBlocks instead)
    if (currentParent?.id === newParentId) return false

    // New parent must be a layout block that can have children
    if (!newParent || !canHaveChildren(newParent.type)) return false

    // Check nesting depth for layout blocks
    if (isLayoutBlockType(block.type)) {
      const newParentDepth = getBlockNestingDepth(newParentId)
      if (newParentDepth >= MAX_LAYOUT_NESTING_DEPTH) {
        console.warn(`Cannot move layout block to depth ${newParentDepth + 1}. Maximum nesting depth for layout blocks is ${MAX_LAYOUT_NESTING_DEPTH + 1}.`)
        return false
      }
    }

    if (!applyMenuListLevel(block, newParentId)) {
      return false
    }

    // Push to history before making changes
    markAsChangedWithHistory()

    // Remove from current parent
    if (currentParent && currentParent.children) {
      const index = currentParent.children.findIndex((b: SectionBlock) => b.id === blockId)
      if (index !== -1) {
        currentParent.children.splice(index, 1)
      }
    } else {
      // Remove from root level
      const rootIndex = blocks.value.findIndex((b: SectionBlock) => b.id === blockId)
      if (rootIndex !== -1) {
        blocks.value.splice(rootIndex, 1)
      }
    }

    // Add to new parent
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

  // Move a block from a parent to root level
  function moveBlockToRoot(blockId: string, toIndex?: number) {
    const block = findBlockById(blockId)
    if (!block || block.type === 'header' || block.type === 'footer') return false

    const currentParent = findParentBlock(blockId)
    if (!currentParent) return false // Already at root

    if (!applyMenuListLevel(block)) {
      return false
    }

    // Push to history before making changes
    markAsChangedWithHistory()

    // Remove from current parent
    if (currentParent.children) {
      const index = currentParent.children.findIndex((b: SectionBlock) => b.id === blockId)
      if (index !== -1) {
        currentParent.children.splice(index, 1)
      }
    }

    // Add to root level
    // Respect header/footer positions
    const hasHeader = blocks.value[0]?.type === 'header'
    const footerIndex = blocks.value.findIndex((b: SectionBlock) => b.type === 'footer')

    let insertIndex: number
    if (toIndex !== undefined) {
      // Clamp to valid range
      const minIndex = hasHeader ? 1 : 0
      const maxIndex = footerIndex !== -1 ? footerIndex : blocks.value.length
      insertIndex = Math.max(minIndex, Math.min(toIndex, maxIndex))
    } else {
      // Default: insert before footer or at end
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

    // Calculate minimum index (skip header at position 0)
    const minIndex = !parentId && blocks.value[0]?.type === 'header' ? 1 : 0
    if (blockIndex <= minIndex) return

    reorderBlocks(blockIndex, blockIndex - 1, parentId)
  }

  function moveBlockDown(blockIndex: number, parentId?: string) {
    const blockList = parentId ? findBlockById(parentId)?.children : blocks.value
    if (!blockList) return

    const block = blockList[blockIndex]
    if (!block || block.type === 'header' || block.type === 'footer') return

    // Calculate maximum index (stop before footer)
    const footerIndex = !parentId ? blocks.value.findIndex((b: SectionBlock) => b.type === 'footer') : -1
    const maxIndex = footerIndex !== -1 ? footerIndex - 1 : blockList.length - 1
    if (blockIndex >= maxIndex) return

    reorderBlocks(blockIndex, blockIndex + 1, parentId)
  }

  function selectBlock(blockId: string | null, itemId: string | null = null) {
    selectedBlockId.value = blockId
    selectedItemId.value = itemId
    // DEBUG: Log selection info
    if (blockId) {
      const block = blockIndex.value.get(blockId)
      console.log('selectBlock:', blockId, 'found in index:', !!block, 'type:', block?.type, 'index size:', blockIndex.value.size)
    }
  }

  function hoverBlock(blockId: string | null) {
    hoveredBlockId.value = blockId
  }

  // Content fields that should NEVER be shared across list items
  const CONTENT_FIELDS = new Set([
    'content', 'label', 'url', 'src', 'alt', 'caption', 'placeholder',
    'name', 'icon', 'buyLink', 'price', 'image', 'successMessage', 'errorMessage',
    'copyrightText', 'navLinks', 'links', 'socialLinks', 'optionTypes', 'variants',
  ])

  // Check if settings contain only content fields (no shared settings)
  function hasOnlyContentFields(settings: Record<string, unknown>): boolean {
    return Object.keys(settings).every(key => CONTENT_FIELDS.has(key))
  }

  // Filter settings to only include non-content fields (for sharing across siblings)
  function filterNonContentFields(settings: Record<string, unknown>): Record<string, unknown> {
    const filtered: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(settings)) {
      if (!CONTENT_FIELDS.has(key)) {
        filtered[key] = value
      }
    }
    return filtered
  }

  function updateBlockSettings(blockId: string, settings: Record<string, unknown>) {
    const block = findBlockById(blockId)
    if (block) {
      // Push to history before making changes
      markAsChangedWithHistory()

      const blockSettings = block.settings as Record<string, unknown>

      // Always apply ALL settings to this block first
      Object.assign(block.settings, settings)

      // If block has a shared style, auto-update the shared style and propagate to all linked blocks
      if (block.sharedStyleId) {
        const style = getSharedStyleById(block.sharedStyleId)
        if (style) {
          // Update shared style settings (excluding content fields)
          style.settings = extractStyleSettings(block.type, block.settings as Record<string, unknown>)
          style.updatedAt = new Date().toISOString()
          // Apply to all other blocks using this style
          applySharedStyleToAllBlocks(style)
        }
      }

      // If overwriteStyle is enabled, we're done (only this block updated)
      if (blockSettings.overwriteStyle) {
        rebuildBlockIndex()
        return
      }

      // If settings contain only content fields, don't share with siblings
      if (hasOnlyContentFields(settings)) {
        rebuildBlockIndex()
        return
      }

      // Filter out content fields for sharing with siblings
      const sharedSettings = filterNonContentFields(settings)
      if (Object.keys(sharedSettings).length === 0) {
        rebuildBlockIndex()
        return
      }

      const parent = findParentBlock(blockId)

      // Case 1: This block IS a Stack item inside a PREBUILT Grid (List/Collection item wrapper)
      // ONLY share settings for PREBUILT list types - NOT manually created Grid > Stack
      if (block.type === 'stack' && parent && isPrebuiltListGrid(parent) && parent.children) {
        // Apply non-content settings to all sibling Stack items (except those with overwriteStyle)
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

      // Case 2: This block is inside a Stack which is inside a PREBUILT Grid (Grid > Stack > children)
      // ONLY share settings for PREBUILT list types - NOT manually created Grid > Stack
      if (parent && parent.type === 'stack' && parent.children) {
        const grandparent = findParentBlock(parent.id)
        if (isPrebuiltListGrid(grandparent) && grandparent && grandparent.children) {
          // Find the index of this block within its parent Stack
          const childIndex = parent.children.findIndex((c: SectionBlock) => c.id === blockId)
          if (childIndex !== -1) {
            // Apply non-content settings to all sibling Stacks' children at the same index
            for (const siblingStack of grandparent.children) {
              if (siblingStack.type === 'stack' && siblingStack.children && siblingStack.children[childIndex]) {
                const siblingChild = siblingStack.children[childIndex]
                // Skip this block (already updated above)
                if (siblingChild.id === blockId) continue
                const siblingChildSettings = siblingChild.settings as Record<string, unknown>
                // Only apply if same block type and not overwritten
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

      // Default: just this block (ALL non-prebuilt blocks already updated above)
      rebuildBlockIndex()
    }
  }

  function updateBlockStyles(blockId: string, styles: Record<string, unknown>, replaceAll = false) {
    const block = findBlockById(blockId)
    if (block) {
      // Push to history before making changes
      markAsChangedWithHistory()

      const blockSettings = block.settings as Record<string, unknown>
      const state = currentStyleState.value

      // Helper to apply styles to a block
      const applyStyles = (targetBlock: typeof block) => {
        // If editing a state (hover/pressed/focused), update state-specific styles
        if (state !== 'none' && supportsStyleStates(targetBlock.type)) {
          const targetStyles = targetBlock.styles as Record<string, unknown>
          if (!targetStyles[state]) {
            targetStyles[state] = {}
          }
          if (replaceAll) {
            targetStyles[state] = { ...styles }
          } else {
            Object.assign(targetStyles[state] as Record<string, unknown>, styles)
          }
        } else {
          // Normal base style update
          if (replaceAll) {
            // Replace entire styles object (used for responsive style updates)
            targetBlock.styles = { ...styles }
          } else {
            // Merge styles (default behavior)
            Object.assign(targetBlock.styles, styles)
          }
        }
      }

      // Apply styles to this block first
      applyStyles(block)

      // If block has a shared style, auto-update the shared style and propagate to all linked blocks
      if (block.sharedStyleId) {
        const style = getSharedStyleById(block.sharedStyleId)
        if (style) {
          // Update shared style
          style.styles = deepClone(block.styles) as SharedStyle['styles']
          style.updatedAt = new Date().toISOString()
          // Apply to all other blocks using this style
          applySharedStyleToAllBlocks(style)
          rebuildBlockIndex()
          return
        }
      }

      // If overwriteStyle is enabled, only update this block (already done above)
      if (blockSettings.overwriteStyle) {
        rebuildBlockIndex()
        return
      }

      const parent = findParentBlock(blockId)

      // Case 1: This block IS a Stack item inside a PREBUILT Grid (List/Collection item wrapper)
      // ONLY apply shared styles for PREBUILT list types - NOT manually created Grid > Stack
      if (block.type === 'stack' && parent && isPrebuiltListGrid(parent) && parent.children) {
        // Apply styles to all sibling Stack items (except those with overwriteStyle)
        for (const siblingStack of parent.children) {
          // Skip current block (already applied above)
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

      // Case 2: This block is inside a Stack which is inside a PREBUILT Grid (Grid > Stack > children)
      // ONLY apply shared styles for PREBUILT list types - NOT manually created Grid > Stack
      if (parent && parent.type === 'stack' && parent.children) {
        const grandparent = findParentBlock(parent.id)
        if (isPrebuiltListGrid(grandparent) && grandparent && grandparent.children) {
          // Find the index of this block within its parent Stack
          const childIndex = parent.children.findIndex((c: SectionBlock) => c.id === blockId)
          if (childIndex !== -1) {
            // Apply styles to all sibling Stacks' children at the same index (except those with overwriteStyle)
            for (const siblingStack of grandparent.children) {
              if (siblingStack.type === 'stack' && siblingStack.children && siblingStack.children[childIndex]) {
                const siblingChild = siblingStack.children[childIndex]
                // Skip current block (already applied above)
                if (siblingChild.id === blockId) continue
                const siblingChildSettings = siblingChild.settings as Record<string, unknown>
                // Only apply if same block type and not overwritten
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

      // Default: styles already applied above, just rebuild index
      rebuildBlockIndex()
    }
  }

  function updateBlockName(blockId: string, name: string) {
    const block = findBlockById(blockId)
    if (block) {
      // Push to history before making changes
      markAsChangedWithHistory()
      block.name = name
      rebuildBlockIndex()
    }
  }

  // ============================================
  // CANVAS ACTIONS
  // ============================================

  /**
   * Update a child block's position within a canvas block
   * This handles the responsive childPositions structure
   */
  function updateCanvasChildPosition(
    parentId: string,
    childId: string,
    position: CanvasChildPosition
  ) {
    const parent = findBlockById(parentId)
    if (!parent || parent.type !== 'canvas') return

    markAsChangedWithHistory()

    const settings = parent.settings as CanvasSettings
    const viewportKey = viewport.value === 'desktop' ? 'desktop' : viewport.value === 'tablet' ? 'tablet' : 'mobile'

    // Ensure the viewport key exists
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
  // HEADER ACTIONS
  // ============================================

  function updateHeaderSettings(blockId: string, settings: Partial<HeaderSettings>) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'header') return

    markAsChangedWithHistory()
    Object.assign(block.settings, settings)
    rebuildBlockIndex()
  }

  function addHeaderNavLink(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'header') return null

    markAsChangedWithHistory()
    const settings = block.settings as HeaderSettings
    if (!settings.navLinks) settings.navLinks = []
    const link = createHeaderNavLink()
    settings.navLinks.push(link)
    selectedItemId.value = link.id
    rebuildBlockIndex()
    return link
  }

  function deleteHeaderNavLink(blockId: string, linkId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'header') return

    markAsChangedWithHistory()
    const settings = block.settings as HeaderSettings
    if (!settings.navLinks) return
    const index = settings.navLinks.findIndex((l: { id: string }) => l.id === linkId)
    if (index !== -1) {
      settings.navLinks.splice(index, 1)
      if (selectedItemId.value === linkId) {
        selectedItemId.value = null
      }
      rebuildBlockIndex()
    }
  }

  function reorderHeaderNavLinks(blockId: string, fromIndex: number, toIndex: number) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'header') return

    markAsChangedWithHistory()
    const settings = block.settings as HeaderSettings
    if (!settings.navLinks) return
    const [link] = settings.navLinks.splice(fromIndex, 1)
    if (link) {
      settings.navLinks.splice(toIndex, 0, link)
      rebuildBlockIndex()
    }
  }

  function updateHeaderNavLink(blockId: string, linkId: string, updates: Partial<HeaderNavLink>) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'header') return

    markAsChangedWithHistory()
    const settings = block.settings as HeaderSettings
    if (!settings.navLinks) return
    const link = settings.navLinks.find((l: { id: string }) => l.id === linkId)
    if (link) {
      Object.assign(link, updates)
      rebuildBlockIndex()
    }
  }

  function duplicateHeaderNavLink(blockId: string, linkId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'header') return null

    markAsChangedWithHistory()
    const settings = block.settings as HeaderSettings
    if (!settings.navLinks) return null
    const index = settings.navLinks.findIndex((l: { id: string }) => l.id === linkId)
    if (index === -1) return null

    const original = settings.navLinks[index]
    const newLink: HeaderNavLink = {
      ...JSON.parse(JSON.stringify(original)),
      id: crypto.randomUUID(),
    }
    settings.navLinks.splice(index + 1, 0, newLink)
    selectedItemId.value = newLink.id
    rebuildBlockIndex()
    return newLink
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

  function addFooterLink(blockId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return null

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.links) settings.links = []
    const link = createFooterLink()
    settings.links.push(link)
    selectedItemId.value = link.id
    rebuildBlockIndex()
    return link
  }

  function deleteFooterLink(blockId: string, linkId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.links) return
    const index = settings.links.findIndex((l: { id: string }) => l.id === linkId)
    if (index !== -1) {
      settings.links.splice(index, 1)
      if (selectedItemId.value === linkId) {
        selectedItemId.value = null
      }
      rebuildBlockIndex()
    }
  }

  function reorderFooterLinks(blockId: string, fromIndex: number, toIndex: number) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.links) return
    const [link] = settings.links.splice(fromIndex, 1)
    if (link) {
      settings.links.splice(toIndex, 0, link)
      rebuildBlockIndex()
    }
  }

  function updateFooterLink(blockId: string, linkId: string, updates: Partial<FooterLink>) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.links) return
    const link = settings.links.find((l: { id: string }) => l.id === linkId)
    if (link) {
      Object.assign(link, updates)
      rebuildBlockIndex()
    }
  }

  function duplicateFooterLink(blockId: string, linkId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return null

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.links) return null
    const index = settings.links.findIndex((l: { id: string }) => l.id === linkId)
    if (index === -1) return null

    const original = settings.links[index]
    const newLink: FooterLink = {
      ...JSON.parse(JSON.stringify(original)),
      id: crypto.randomUUID(),
    }
    settings.links.splice(index + 1, 0, newLink)
    selectedItemId.value = newLink.id
    rebuildBlockIndex()
    return newLink
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
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.socialLinks) return
    const index = settings.socialLinks.findIndex((l: { id: string }) => l.id === linkId)
    if (index !== -1) {
      settings.socialLinks.splice(index, 1)
      if (selectedItemId.value === linkId) {
        selectedItemId.value = null
      }
      rebuildBlockIndex()
    }
  }

  function reorderFooterSocialLinks(blockId: string, fromIndex: number, toIndex: number) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.socialLinks) return
    const [link] = settings.socialLinks.splice(fromIndex, 1)
    if (link) {
      settings.socialLinks.splice(toIndex, 0, link)
      rebuildBlockIndex()
    }
  }

  function updateFooterSocialLink(blockId: string, linkId: string, updates: Partial<FooterSocialLink>) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.socialLinks) return
    const link = settings.socialLinks.find((l: { id: string }) => l.id === linkId)
    if (link) {
      Object.assign(link, updates)
      rebuildBlockIndex()
    }
  }

  function duplicateFooterSocialLink(blockId: string, linkId: string) {
    const block = findBlockById(blockId)
    if (!block || block.type !== 'footer') return null

    markAsChangedWithHistory()
    const settings = block.settings as FooterSettings
    if (!settings.socialLinks) return null
    const index = settings.socialLinks.findIndex((l: { id: string }) => l.id === linkId)
    if (index === -1) return null

    const original = settings.socialLinks[index]
    const newLink: FooterSocialLink = {
      ...JSON.parse(JSON.stringify(original)),
      id: crypto.randomUUID(),
    }
    settings.socialLinks.splice(index + 1, 0, newLink)
    selectedItemId.value = newLink.id
    rebuildBlockIndex()
    return newLink
  }

  // ============================================
  // FORM FIELD ACTIONS
  // Form fields are now child blocks of the form block
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
  // TRANSLATION ACTIONS
  // ============================================

  // Get list of available translation languages (excluding default)
  const availableTranslations = computed(() => {
    return Object.keys(translations.value.languages) as LanguageCode[]
  })

  // Check if currently editing a translation
  const isEditingTranslation = computed(() => currentLanguage.value !== null)

  // Set the default language
  function setDefaultLanguage(langCode: LanguageCode) {
    markAsChangedWithHistory()
    translations.value.defaultLanguage = langCode
  }

  // Add a new translation language
  function addTranslation(langCode: LanguageCode) {
    if (translations.value.languages[langCode]) return // Already exists

    markAsChangedWithHistory()

    // Initialize with empty translations
    translations.value.languages[langCode] = {
      blocks: {},
    }

    // Copy current content as initial translation values
    copyContentToTranslation(langCode)
  }

  // Remove a translation language
  function removeTranslation(langCode: LanguageCode) {
    if (!translations.value.languages[langCode]) return

    markAsChangedWithHistory()
    delete translations.value.languages[langCode]

    // If currently viewing this language, switch back to default
    if (currentLanguage.value === langCode) {
      currentLanguage.value = null
    }
  }

  // Switch to editing a specific language (null = default/source)
  function setCurrentLanguage(langCode: LanguageCode | null) {
    currentLanguage.value = langCode
  }

  // Copy all translatable content from blocks to a translation
  function copyContentToTranslation(langCode: LanguageCode) {
    if (!translations.value.languages[langCode]) return

    const langTranslations = translations.value.languages[langCode]

    // Traverse all blocks and extract translatable content
    function extractTranslations(blockList: SectionBlock[]) {
      for (const block of blockList) {
        const translation: BlockTranslation = {}
        const settings = block.settings as Record<string, unknown>

        switch (block.type) {
          case 'heading':
          case 'text':
            if (settings.content) translation.content = settings.content as string
            break
          case 'image':
            if (settings.alt) translation.alt = settings.alt as string
            if (settings.caption) translation.caption = settings.caption as string
            break
          case 'button':
            if (settings.label) translation.label = settings.label as string
            break
          case 'header':
            const headerSettings = settings as unknown as HeaderSettings
            if (headerSettings.navLinks) {
              translation.navLinks = headerSettings.navLinks.map((l: { id: string; label: string }) => ({ id: l.id, label: l.label }))
            }
            if (headerSettings.ctaButton?.label) {
              translation.ctaButtonLabel = headerSettings.ctaButton.label
            }
            break
          case 'footer':
            const footerSettings = settings as unknown as FooterSettings
            if (footerSettings.copyrightText) translation.copyrightText = footerSettings.copyrightText
            if (footerSettings.links) {
              translation.footerLinks = footerSettings.links.map((l: { id: string; label: string }) => ({ id: l.id, label: l.label }))
            }
            break
          case 'form':
            const formSettings = settings as unknown as FormSettings
            if (formSettings.successMessage) translation.successMessage = formSettings.successMessage
            if (formSettings.errorMessage) translation.errorMessage = formSettings.errorMessage
            break
          // Form field blocks - extract labels
          case 'form-input':
          case 'form-textarea':
          case 'form-select':
          case 'form-radio':
          case 'form-checkbox':
            if (settings.label) translation.label = settings.label as string
            if (settings.placeholder) translation.placeholder = settings.placeholder as string
            break
          case 'form-button':
            if (settings.label) translation.label = settings.label as string
            break
        }

        // Only store if there's translatable content
        if (Object.keys(translation).length > 0) {
          langTranslations.blocks[block.id] = translation
        }

        // Process children
        if (block.children) {
          extractTranslations(block.children)
        }
      }
    }

    extractTranslations(blocks.value)
  }

  // Get translated content for a block in the current language
  function getTranslatedContent(blockId: string, field: keyof BlockTranslation): string | undefined {
    if (!currentLanguage.value) return undefined
    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return undefined
    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation) return undefined
    return blockTranslation[field] as string | undefined
  }

  // Update translation for a specific block field
  function updateBlockTranslation(blockId: string, field: keyof BlockTranslation, value: string) {
    if (!currentLanguage.value) return

    markAsChangedWithHistory()

    let langTranslations = translations.value.languages[currentLanguage.value]

    // Create language entry if it doesn't exist
    if (!langTranslations) {
      translations.value.languages[currentLanguage.value] = { blocks: {} }
      langTranslations = translations.value.languages[currentLanguage.value]!
    }

    // Create block entry if it doesn't exist
    if (!langTranslations.blocks[blockId]) {
      langTranslations.blocks[blockId] = {}
    }

    // Update the field - use spread to ensure reactivity
    langTranslations.blocks[blockId] = {
      ...langTranslations.blocks[blockId],
      [field]: value,
    }
  }

  // Get translated nav link label for header
  function getTranslatedNavLinkLabel(blockId: string, linkId: string): string | undefined {
    if (!currentLanguage.value) return undefined
    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return undefined
    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation?.navLinks) return undefined
    const link = blockTranslation.navLinks.find((l: { id: string; label?: string }) => l.id === linkId)
    return link?.label
  }

  // Update translated nav link label for header
  function updateTranslatedNavLinkLabel(blockId: string, linkId: string, label: string) {
    if (!currentLanguage.value) return

    markAsChangedWithHistory()

    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return

    if (!langTranslations.blocks[blockId]) {
      langTranslations.blocks[blockId] = {}
    }

    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation.navLinks) {
      blockTranslation.navLinks = []
    }

    const existingLink = blockTranslation.navLinks.find((l: { id: string; label?: string }) => l.id === linkId)
    if (existingLink) {
      existingLink.label = label
    } else {
      blockTranslation.navLinks.push({ id: linkId, label })
    }
  }

  // Get translated footer link label
  function getTranslatedFooterLinkLabel(blockId: string, linkId: string): string | undefined {
    if (!currentLanguage.value) return undefined
    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return undefined
    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation?.footerLinks) return undefined
    const link = blockTranslation.footerLinks.find((l: { id: string; label?: string }) => l.id === linkId)
    return link?.label
  }

  // Update translated footer link label
  function updateTranslatedFooterLinkLabel(blockId: string, linkId: string, label: string) {
    if (!currentLanguage.value) return

    markAsChangedWithHistory()

    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return

    if (!langTranslations.blocks[blockId]) {
      langTranslations.blocks[blockId] = {}
    }

    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation.footerLinks) {
      blockTranslation.footerLinks = []
    }

    const existingLink = blockTranslation.footerLinks.find((l: { id: string; label?: string }) => l.id === linkId)
    if (existingLink) {
      existingLink.label = label
    } else {
      blockTranslation.footerLinks.push({ id: linkId, label })
    }
  }

  // ============================================
  // THEME & LAYOUT ACTIONS
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
        // Load translations if they exist
        if (content.translations) {
          translations.value = deepClone(content.translations)
        } else {
          translations.value = {
            defaultLanguage: DEFAULT_LANGUAGE,
            languages: {},
          }
        }
      } else {
        blocks.value = []
        pageSettings.value = getDefaultPageSettings()
        translations.value = {
          defaultLanguage: DEFAULT_LANGUAGE,
          languages: {},
        }
      }
      selectedBlockId.value = null
      selectedItemId.value = null
      currentLanguage.value = null // Reset to default language
      hasUnsavedChanges.value = false

      // Rebuild index and clear history for new project
      rebuildBlockIndex()
      clearHistory()

      // Subscribe to realtime changes for collaboration
      subscribeToProjectChanges(projectId)

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
        translations: translations.value,
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
      translations: translations.value,
    }
  }

  function setProjectContent(content: ProjectContent) {
    blocks.value = content.blocks
    pageSettings.value = content.pageSettings
    if (content.translations) {
      translations.value = content.translations
    } else {
      translations.value = {
        defaultLanguage: DEFAULT_LANGUAGE,
        languages: {},
      }
    }
    currentLanguage.value = null
    hasUnsavedChanges.value = false
    rebuildBlockIndex()
    clearHistory()
  }

  function resetEditor() {
    // Unsubscribe from realtime changes
    unsubscribeFromProjectChanges()

    currentProjectId.value = null
    blocks.value = []
    pageSettings.value = getDefaultPageSettings()
    translations.value = {
      defaultLanguage: DEFAULT_LANGUAGE,
      languages: {},
    }
    currentLanguage.value = null
    selectedBlockId.value = null
    selectedItemId.value = null
    hasUnsavedChanges.value = false
    rebuildBlockIndex()
    clearHistory()
  }

  function markUnsavedChanges() {
    hasUnsavedChanges.value = true
  }

  // ============================================
  // ANIMATION PREVIEW
  // ============================================

  // Track which block is currently previewing animation
  const animationPreviewBlockId = ref<string | null>(null)

  // Trigger animation preview for a block
  function triggerAnimationPreview(blockId: string) {
    // Clear any existing preview
    animationPreviewBlockId.value = null

    // Trigger new preview after a tick to ensure DOM updates
    setTimeout(() => {
      animationPreviewBlockId.value = blockId

      // Auto-clear preview after animation completes
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

  // Check if a block is currently previewing animation
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
    canUndo,
    canRedo,
    undo,
    redo,
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
    // Style state actions
    currentStyleState,
    setStyleState,
    supportsStyleStates,
    resetStateStyles,
    hasStateStyles,
    hasStylesForState,
    // Auto-save actions (deprecated - manual save only now)
    cancelAutoSave,
    // Collaboration
    hasCollaboratorChanges,
    lastCollaboratorUpdate,
    reloadProjectContent,
    unsubscribeFromProjectChanges,
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
    copyBlock,
    cutBlock,
    pasteBlock,
    copyBlockStyles,
    pasteBlockStyles,
    hasClipboardBlock,
    hasClipboardStyles,
    // Shared styles
    getSharedStylesForType,
    getSharedStyleById,
    createSharedStyle,
    applySharedStyle,
    detachSharedStyle,
    updateSharedStyleFromBlock,
    resetToSharedStyle,
    renameSharedStyle,
    deleteSharedStyle,
    blockHasSharedStyleOverrides,
    reorderBlocks,
    moveBlockToParent,
    moveBlockToRoot,
    moveBlockUp,
    moveBlockDown,
    selectBlock,
    hoverBlock,
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
    translations,
    currentLanguage,
    availableTranslations,
    isEditingTranslation,
    // Translation actions
    setDefaultLanguage,
    addTranslation,
    removeTranslation,
    setCurrentLanguage,
    getTranslatedContent,
    updateBlockTranslation,
    getTranslatedNavLinkLabel,
    updateTranslatedNavLinkLabel,
    getTranslatedFooterLinkLabel,
    updateTranslatedFooterLinkLabel,
    // Animation preview
    animationPreviewBlockId,
    triggerAnimationPreview,
    isAnimationPreviewing,
  }
})
