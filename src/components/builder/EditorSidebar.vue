<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Button, Combobox, Dropdown, DropdownItem, Icon, Tooltip } from '@/components/ui'
import type { ComboboxItem } from '@/components/ui/Combobox.vue'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import ContextMenuDivider from '@/components/ui/ContextMenuDivider.vue'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'
import {
  sectionBlockLabels,
  sectionBlockIcons,
  blocksByCategory,
  categoryLabels,
  canHaveChildren,
  formFieldBlockTypes,
  formFieldBlockLabels,
  socialPlatformLabels,
  socialPlatformIcons,
  presetTypes,
  presetLabels,
  presetIcons,
  createPresetBlock,
  isFormFieldBlock,
  type PresetType,
} from '@/lib/editor-utils'
import type {
  SectionBlockType,
  SectionBlock,
  SocialPlatform,
  BlockCategory,
  HeaderSettings,
  FooterSettings,
  FormFieldBlockType,
} from '@/types/editor'
import {
  PREBUILT_LIST_NAMES,
  isPrebuiltListGrid,
  isPrebuiltListItem,
  isBlockInsidePrebuiltListItem as isBlockInsidePrebuiltListItemHelper,
  getStackDisplayName,
  getListItemTypeLabel,
} from '@/stores/editor/helpers'
// Recursive block tree component - can be used for simpler block tree rendering
// Full integration requires migrating special handling for header/footer/form/list blocks
import BlockTreeItem from '@/components/builder/BlockTreeItem.vue'

const editorStore = useEditorStore()

const showSectionDropdown = ref(false)
const sectionSearchQuery = ref('')
const expandedBlocks = ref<Set<string>>(new Set())
const showFormFieldDropdown = ref<string | null>(null)
const showSocialDropdown = ref<string | null>(null)

// Consolidated drag state for better performance (single reactive object vs multiple refs)
interface DragState {
  // Top-level block dragging
  blockIndex: number | null
  overBlockIndex: number | null
  // Item dragging within blocks
  itemInfo: { blockId: string; itemIndex: number } | null
  overItemInfo: { blockId: string; itemIndex: number } | null
  // Child block dragging (supports cross-parent)
  childInfo: { parentId: string; childIndex: number; blockId: string } | null
  overChildInfo: { parentId: string; childIndex: number } | null
  // Empty parent drop target
  overEmptyParentId: string | null
}

const dragState = reactive<DragState>({
  blockIndex: null,
  overBlockIndex: null,
  itemInfo: null,
  overItemInfo: null,
  childInfo: null,
  overChildInfo: null,
  overEmptyParentId: null,
})

// Helper to reset all drag state
function resetDragState() {
  dragState.blockIndex = null
  dragState.overBlockIndex = null
  dragState.itemInfo = null
  dragState.overItemInfo = null
  dragState.childInfo = null
  dragState.overChildInfo = null
  dragState.overEmptyParentId = null
}

// Form field block types for dropdown (now uses block types instead of field types)
// These are now child blocks of the form block

// Social platforms for dropdown
const socialPlatforms: SocialPlatform[] = [
  'twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'tiktok', 'github', 'discord',
  'dribbble', 'behance', 'medium', 'threads',
]

// Categories for block selection (excluding header/footer which are auto-added)
const categories: BlockCategory[] = ['layout', 'content']

// Search input ref for auto-focus
const sectionSearchInputRef = ref<HTMLInputElement | null>(null)

// Filtered blocks by search query
const filteredBlocksByCategory = computed(() => {
  const query = sectionSearchQuery.value.toLowerCase().trim()
  if (!query) return blocksByCategory

  const result: Record<BlockCategory, SectionBlockType[]> = { layout: [], content: [] }
  for (const category of categories) {
    result[category] = (blocksByCategory[category] || []).filter(type =>
      sectionBlockLabels[type].toLowerCase().includes(query)
    )
  }
  return result
})

// Filtered presets by search query
const filteredPresetTypes = computed(() => {
  const query = sectionSearchQuery.value.toLowerCase().trim()
  if (!query) return presetTypes
  return presetTypes.filter(preset =>
    presetLabels[preset].toLowerCase().includes(query)
  )
})

// Check if there are any results
const hasSearchResults = computed(() => {
  return filteredBlocksByCategory.value.layout.length > 0 ||
         filteredBlocksByCategory.value.content.length > 0 ||
         filteredPresetTypes.value.length > 0
})

// Watch for dropdown open to focus search input
watch(showSectionDropdown, async (isOpen) => {
  if (isOpen) {
    sectionSearchQuery.value = ''
    await nextTick()
    sectionSearchInputRef.value?.focus()
  }
})

// Watch for selection changes and auto-expand parent blocks
watch(() => editorStore.selectedBlockId, (blockId) => {
  if (!blockId) return

  // Expand all ancestors of the selected block
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

  // Also expand the selected block itself if it can have children
  const block = editorStore.findBlockById(blockId)
  if (block && canHaveChildren(block.type)) {
    expandedBlocks.value.add(blockId)
  }
}, { immediate: true })

// Combobox items for form field blocks (only used when adding to form blocks)
const formFieldBlockItems = computed<ComboboxItem[]>(() => {
  return formFieldBlockTypes.map(type => ({
    value: type,
    label: formFieldBlockLabels[type] || sectionBlockLabels[type],
    icon: sectionBlockIcons[type],
    group: 'Form Fields',
  }))
})

// Check if a block is a header/footer child stack (Start, Middle, End)
function isHeaderFooterStack(block: SectionBlock): boolean {
  const parent = editorStore.findParentBlock(block.id)
  return parent ? (parent.type === 'header' || parent.type === 'footer') : false
}

// Context menu for blocks
const blockContextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const contextMenuBlockId = ref<string | null>(null)
const contextMenuBlockType = ref<'section' | 'child'>('section')

// Get the block for context menu actions
const contextMenuBlock = computed(() => {
  if (!contextMenuBlockId.value) return null
  return editorStore.findBlockById(contextMenuBlockId.value)
})

// Check if context menu block can be duplicated/deleted
const canContextMenuDuplicate = computed(() => {
  if (!contextMenuBlock.value) return false
  // Protected blocks (header/footer) cannot be duplicated
  if (contextMenuBlock.value.type === 'header' || contextMenuBlock.value.type === 'footer') return false
  // Header/footer stacks (Start, Middle, End) cannot be duplicated
  if (isHeaderFooterStack(contextMenuBlock.value)) return false
  return true
})

const canContextMenuDelete = computed(() => {
  if (!contextMenuBlock.value) return false
  // Protected blocks (header/footer) cannot be deleted
  if (contextMenuBlock.value.type === 'header' || contextMenuBlock.value.type === 'footer') return false
  // Header/footer stacks (Start, Middle, End) cannot be deleted
  if (isHeaderFooterStack(contextMenuBlock.value)) return false
  return true
})

// Handle right-click on blocks
function handleBlockContextMenu(blockId: string, blockType: 'section' | 'child', event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  contextMenuBlockId.value = blockId
  contextMenuBlockType.value = blockType
  blockContextMenuRef.value?.open(event)
}

// Context menu actions
function handleContextMenuDuplicate() {
  if (!contextMenuBlockId.value) return
  const newBlock = editorStore.duplicateBlock(contextMenuBlockId.value)
  if (newBlock) {
    expandedBlocks.value.add(newBlock.id)
    editorStore.selectBlock(newBlock.id)
  }
}

function handleContextMenuDelete() {
  if (!contextMenuBlockId.value) return
  editorStore.deleteBlock(contextMenuBlockId.value)
  expandedBlocks.value.delete(contextMenuBlockId.value)
}

function handleContextMenuCopyStyle() {
  if (!contextMenuBlockId.value) return
  editorStore.copyBlockStyles(contextMenuBlockId.value)
}

function handleContextMenuPasteStyle() {
  if (!contextMenuBlockId.value) return
  editorStore.pasteBlockStyles(contextMenuBlockId.value)
}

// Helper functions
function isProtectedBlock(block: SectionBlock): boolean {
  return block.type === 'header' || block.type === 'footer'
}

function isBlockHidden(block: SectionBlock): boolean {
  if (block.type === 'header') {
    return (block.settings as HeaderSettings).isHidden ?? false
  }
  if (block.type === 'footer') {
    return (block.settings as FooterSettings).isHidden ?? false
  }
  return false
}

function toggleBlockVisibility(block: SectionBlock, event: MouseEvent) {
  event.stopPropagation()
  if (block.type === 'header') {
    const settings = block.settings as HeaderSettings
    editorStore.updateHeaderSettings(block.id, { isHidden: !settings.isHidden })
  } else if (block.type === 'footer') {
    const settings = block.settings as FooterSettings
    editorStore.updateFooterSettings(block.id, { isHidden: !settings.isHidden })
  }
}

function toggleBlockExpanded(blockId: string) {
  if (expandedBlocks.value.has(blockId)) {
    expandedBlocks.value.delete(blockId)
  } else {
    expandedBlocks.value.add(blockId)
  }
}

function handleAddSection(type: SectionBlockType) {
  const block = editorStore.addBlock(type)
  if (block) {
    expandedBlocks.value.add(block.id)
  }
  showSectionDropdown.value = false
}

function handleAddPreset(presetType: PresetType) {
  const block = createPresetBlock(presetType)
  const inserted = editorStore.addPresetBlock(block)
  if (inserted) {
    expandedBlocks.value.add(inserted.id)
  }
  showSectionDropdown.value = false
}

// Drag handlers for section type dropdown (for dragging to preview)
function handleSectionTypeDragStart(type: SectionBlockType, event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/x-section-type', type)
    event.dataTransfer.setData('text/plain', type) // Fallback for some browsers
    event.dataTransfer.effectAllowed = 'copy'
  }
  // Close dropdown after a brief delay to allow drag to initiate
  setTimeout(() => {
    showSectionDropdown.value = false
  }, 100)
}

function handleSectionTypeDragEnd() {
  showSectionDropdown.value = false
}

// Drag handlers for preset templates
function handlePresetDragStart(presetType: PresetType, event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/x-preset-type', presetType)
    event.dataTransfer.setData('text/plain', presetType) // Fallback for some browsers
    event.dataTransfer.effectAllowed = 'copy'
  }
  // Close dropdown after a brief delay to allow drag to initiate
  setTimeout(() => {
    showSectionDropdown.value = false
  }, 100)
}

function handlePresetDragEnd() {
  showSectionDropdown.value = false
}

// Refs for child block dropdowns
const childBlockDropdownRefs = ref<Record<string, { close: () => void } | null>>({})

// Check if a value is a preset type
function isPresetType(value: string): value is PresetType {
  return presetTypes.includes(value as PresetType)
}

// Add child block to a layout block (handles both regular blocks and presets)
function handleAddChildBlock(parentId: string, value: string) {
  // Check if it's a preset type
  if (isPresetType(value)) {
    const block = createPresetBlock(value)
    const inserted = editorStore.addPresetBlock(block, undefined, parentId)
    if (inserted) {
      editorStore.selectBlock(inserted.id)
    }
  } else {
    // It's a regular block type
    const block = editorStore.addBlock(value as SectionBlockType, undefined, parentId)
    if (block) {
      editorStore.selectBlock(block.id)
    }
  }
  // Close the dropdown after selection
  childBlockDropdownRefs.value[parentId]?.close()
}

// Helper functions (PREBUILT_LIST_NAMES, isPrebuiltListGrid, getListItemTypeLabel, getStackDisplayName,
// isPrebuiltListItem) are imported from @/stores/editor/helpers

// Add a new list item by duplicating the last Stack child (so it's added at the end)
function handleAddListItem(gridId: string) {
  const grid = editorStore.findBlockById(gridId)
  if (!grid || !grid.children || grid.children.length === 0) return

  // Find the last Stack child to use as template (so new item is added at the end)
  const stackChildren = grid.children.filter(c => c.type === 'stack')
  const templateStack = stackChildren[stackChildren.length - 1]
  if (!templateStack) return

  // Duplicate the template stack (inserted right after it, i.e., at the end)
  const newItem = editorStore.duplicateBlock(templateStack.id)
  if (newItem) {
    // Update the name to reflect it's a new item
    const itemNumber = grid.children.filter(c => c.type === 'stack').length
    editorStore.updateBlockName(newItem.id, `Item ${itemNumber}`)
    editorStore.selectBlock(newItem.id)
    expandedBlocks.value.add(newItem.id)
  }
}

// Wrapper for isBlockInsidePrebuiltListItem helper (provides editorStore.findParentBlock)
function isBlockInsidePrebuiltListItem(parentBlock: SectionBlock): boolean {
  return isBlockInsidePrebuiltListItemHelper(parentBlock, editorStore.findParentBlock)
}

// Check if a child block is inside a PREBUILT List/Collection (either a list item or inside a list item)
function isChildInsidePrebuiltListCollection(parentBlock: SectionBlock, child: SectionBlock): boolean {
  // Check if this is a prebuilt list item (Stack child of PREBUILT Grid)
  if (isPrebuiltListItem(parentBlock, child)) {
    return true
  }
  // Check if this is a block inside a prebuilt list item
  if (isBlockInsidePrebuiltListItem(parentBlock)) {
    return true
  }
  return false
}

// Check if a child block is hidden
function isChildBlockHidden(child: SectionBlock): boolean {
  const settings = child.settings as Record<string, unknown>
  return !!settings.isHidden
}

// Toggle visibility for child blocks
function toggleChildVisibility(childId: string, event: MouseEvent) {
  event.stopPropagation()
  const child = editorStore.findBlockById(childId)
  if (!child) return
  const settings = child.settings as Record<string, unknown>
  editorStore.updateBlockSettings(childId, { isHidden: !settings.isHidden })
}

// Check if a child block can be dragged
// PREBUILT list items (Stack children of PREBUILT Grid) CAN be dragged for reordering
// Blocks inside PREBUILT list items CANNOT be dragged
// All other blocks can be dragged normally
function canDragChild(parentBlock: SectionBlock, child: SectionBlock): boolean {
  // Prebuilt list items (Stack in PREBUILT Grid) can be dragged for reordering
  if (isPrebuiltListItem(parentBlock, child)) {
    return true
  }
  // Blocks inside prebuilt list items cannot be dragged
  if (isBlockInsidePrebuiltListItem(parentBlock)) {
    return false
  }
  // All other blocks (including manually created Grid > Stack) can be dragged
  return true
}

// Child block drag handlers (for layout block children)
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

  const targetParent = editorStore.findBlockById(parentId)

  // Handle top-level block being dragged into a layout block
  if (dragState.blockIndex !== null) {
    const draggedBlock = editorStore.blocks[dragState.blockIndex]
    // Don't allow header/footer to be moved into other blocks
    if (draggedBlock && (draggedBlock.type === 'header' || draggedBlock.type === 'footer')) return
    // Don't allow dropping into PREBUILT List/Collection grids
    if (targetParent && isPrebuiltListGrid(targetParent)) return
    // Don't allow dropping into itself
    if (draggedBlock && draggedBlock.id === parentId) return

    dragState.overChildInfo = { parentId, childIndex }
    return
  }

  if (!dragState.childInfo) return

  const isSameParent = dragState.childInfo.parentId === parentId

  // For PREBUILT List/Collection grids, only allow reordering within the same grid (not moving from outside)
  if (targetParent && isPrebuiltListGrid(targetParent)) {
    if (!isSameParent) return // Don't allow dropping from outside into a prebuilt list/collection
  }

  // Allow drop if different position (same or different parent)
  const isDifferentPosition = !isSameParent || dragState.childInfo.childIndex !== childIndex

  if (isDifferentPosition) {
    dragState.overChildInfo = { parentId, childIndex }
  }
}

function handleChildDragLeave() {
  dragState.overChildInfo = null
}

function handleChildDrop(parentId: string, childIndex: number) {
  // Handle top-level block being dropped into a layout block
  if (dragState.blockIndex !== null) {
    const draggedBlock = editorStore.blocks[dragState.blockIndex]
    if (draggedBlock && draggedBlock.type !== 'header' && draggedBlock.type !== 'footer') {
      editorStore.moveBlockToParent(draggedBlock.id, parentId, childIndex)
      expandedBlocks.value.add(parentId)
    }
    resetDragState()
    return
  }

  if (!dragState.childInfo) return

  const isSameParent = dragState.childInfo.parentId === parentId

  if (isSameParent) {
    // Same parent: reorder within
    if (dragState.childInfo.childIndex !== childIndex) {
      editorStore.reorderBlocks(dragState.childInfo.childIndex, childIndex, parentId)
    }
  } else {
    // Different parent: move to new parent
    editorStore.moveBlockToParent(dragState.childInfo.blockId, parentId, childIndex)
  }

  dragState.childInfo = null
  dragState.overChildInfo = null
}

function handleChildDragEnd() {
  dragState.childInfo = null
  dragState.overChildInfo = null
}

// Empty parent drop target is now in dragState.overEmptyParentId

// Handle drag over empty parent container
function handleEmptyParentDragOver(parentId: string, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()

  // Don't allow dropping onto PREBUILT List/Collection grids
  const targetParent = editorStore.findBlockById(parentId)
  if (targetParent && isPrebuiltListGrid(targetParent)) return

  // Handle top-level block being dragged into an empty layout block
  if (dragState.blockIndex !== null) {
    const draggedBlock = editorStore.blocks[dragState.blockIndex]
    // Don't allow header/footer to be moved into other blocks
    if (draggedBlock && (draggedBlock.type === 'header' || draggedBlock.type === 'footer')) return
    // Don't allow dropping into itself
    if (draggedBlock && draggedBlock.id === parentId) return

    dragState.overEmptyParentId = parentId
    return
  }

  if (!dragState.childInfo) return

  // Don't allow dropping onto own parent (already empty)
  if (dragState.childInfo.parentId === parentId) return

  dragState.overEmptyParentId = parentId
}

function handleEmptyParentDragLeave() {
  dragState.overEmptyParentId = null
}

function handleEmptyParentDrop(parentId: string) {
  // Handle top-level block being dropped into an empty layout block
  if (dragState.blockIndex !== null) {
    const draggedBlock = editorStore.blocks[dragState.blockIndex]
    if (draggedBlock && draggedBlock.type !== 'header' && draggedBlock.type !== 'footer') {
      editorStore.moveBlockToParent(draggedBlock.id, parentId, 0)
      expandedBlocks.value.add(parentId)
    }
    resetDragState()
    return
  }

  if (!dragState.childInfo) return

  // Move to this empty parent at index 0
  editorStore.moveBlockToParent(dragState.childInfo.blockId, parentId, 0)

  dragState.childInfo = null
  dragState.overChildInfo = null
  dragState.overEmptyParentId = null
}

function handleDuplicateChildBlock(childId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.duplicateBlock(childId)
}

function handleDeleteChildBlock(childId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteBlock(childId)
}

function handleDeleteBlock(blockId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteBlock(blockId)
  expandedBlocks.value.delete(blockId)
}

function handleDuplicateBlock(blockId: string, event: MouseEvent) {
  event.stopPropagation()
  const newBlock = editorStore.duplicateBlock(blockId)
  if (newBlock) {
    expandedBlocks.value.add(newBlock.id)
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown-container')) {
    showSectionDropdown.value = false
    showFormFieldDropdown.value = null
    showSocialDropdown.value = null
  }
}

function handleSidebarClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.block-item')) {
    editorStore.selectBlock(null)
  }
}

// Block drag handlers
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

// Generic item drag handlers (for form fields, nav links, etc.)
function handleItemDragStart(blockId: string, itemIndex: number, event: DragEvent) {
  event.stopPropagation()
  dragState.itemInfo = { blockId, itemIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleItemDragOver(blockId: string, itemIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (dragState.itemInfo?.blockId === blockId && dragState.itemInfo.itemIndex !== itemIndex) {
    dragState.overItemInfo = { blockId, itemIndex }
  }
}

function handleItemDragLeave() {
  dragState.overItemInfo = null
}

function handleItemDrop(blockId: string, itemIndex: number, reorderFn: (blockId: string, from: number, to: number) => void) {
  if (dragState.itemInfo?.blockId === blockId && dragState.itemInfo.itemIndex !== itemIndex) {
    reorderFn(blockId, dragState.itemInfo.itemIndex, itemIndex)
  }
  dragState.itemInfo = null
  dragState.overItemInfo = null
}

function handleItemDragEnd() {
  dragState.itemInfo = null
  dragState.overItemInfo = null
}

// Form field block handlers (form fields are now child blocks)
function handleAddFormFieldBlock(formBlockId: string, type: FormFieldBlockType) {
  editorStore.addFormFieldBlock(formBlockId, type)
  showFormFieldDropdown.value = null
}

function handleDeleteFormFieldBlock(formBlockId: string, fieldBlockId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteFormFieldBlock(formBlockId, fieldBlockId)
}

function handleDuplicateFormFieldBlock(formBlockId: string, fieldBlockId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.duplicateFormFieldBlock(formBlockId, fieldBlockId)
}

// Header nav link handlers
function handleAddHeaderNavLink(blockId: string) {
  editorStore.addHeaderNavLink(blockId)
}

function handleDeleteHeaderNavLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteHeaderNavLink(blockId, linkId)
}

function handleDuplicateHeaderNavLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.duplicateHeaderNavLink(blockId, linkId)
}

// Footer link handlers
function handleAddFooterLink(blockId: string) {
  editorStore.addFooterLink(blockId)
}

function handleDeleteFooterLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteFooterLink(blockId, linkId)
}

function handleDuplicateFooterLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.duplicateFooterLink(blockId, linkId)
}

// Footer social link handlers
function handleAddFooterSocialLink(blockId: string, platform: SocialPlatform) {
  editorStore.addFooterSocialLink(blockId, platform)
  showSocialDropdown.value = null
}

function handleDeleteFooterSocialLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteFooterSocialLink(blockId, linkId)
}

function handleDuplicateFooterSocialLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.duplicateFooterSocialLink(blockId, linkId)
}

// Check if a block can have expandable items
function canBlockExpand(block: SectionBlock): boolean {
  // Header, footer, form blocks can always expand (they have nav links, links, fields)
  if (block.type === 'header' || block.type === 'footer' || block.type === 'form') {
    return true
  }
  // Layout blocks that can have children
  if (canHaveChildren(block.type)) {
    return true
  }
  return false
}

// Check if a block has interactions (either as trigger or target)
function blockHasInteraction(blockId: string): boolean {
  const interactions = editorStore.getInteractions()
  return interactions.some(i => i.triggerBlockId === blockId || i.targetBlockId === blockId)
}
</script>

<template>
  <aside
    class="group/sidebar relative flex flex-col h-full bg-sidebar-background transition-[width] duration-300 ease-out"
    :class="editorStore.isSidebarCollapsed ? 'w-16' : 'w-60'"
  >
    <!-- Right border toggle handle -->
    <div
      class="absolute top-0 right-0 w-1 h-full cursor-ew-resize z-10 transition-colors hover:bg-primary/50 active:bg-primary"
      :class="editorStore.isSidebarCollapsed ? 'bg-transparent group-hover/sidebar:bg-sidebar-border' : 'bg-sidebar-border group-hover/sidebar:bg-sidebar-foreground/20'"
      @click="editorStore.toggleSidebar"
    >
      <div class="absolute top-1/2 -translate-y-1/2 -right-1.5 w-4 h-8 flex items-center justify-center opacity-0 group-hover/sidebar:opacity-100 transition-opacity pointer-events-none">
        <div class="w-1 h-6 rounded-full bg-primary/50"></div>
      </div>
    </div>

    <!-- Collapsed state -->
    <div v-if="editorStore.isSidebarCollapsed" class="flex flex-col items-center py-2 gap-1 pr-1">
      <Tooltip v-for="block in editorStore.blocks" :key="block.id" :text="block.name" position="right">
        <Button
          variant="outline"
          size="icon"
          class="h-6 w-6"
          :class="editorStore.selectedBlockId === block.id ? 'bg-accent text-accent-foreground' : ''"
          @click="editorStore.selectBlock(block.id)"
        >
          <Icon :name="sectionBlockIcons[block.type]" :size="14" />
        </Button>
      </Tooltip>
    </div>

    <!-- Expanded state -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between h-12 pl-3.5 pr-2.5 border-b border-sidebar-border">
        <h2 class="text-sm font-semibold text-foreground">Sections</h2>
        <div class="relative dropdown-container">
          <Tooltip text="Add section">
            <Button
              variant="ghost"
              size="sm"
              @click="showSectionDropdown = !showSectionDropdown"
            >
              <Icon name="plus" class="text-sm" />
            </Button>
          </Tooltip>
          <!-- Section Dropdown -->
          <Teleport to="body">
            <div
              v-if="showSectionDropdown"
              class="fixed inset-0 z-40"
              @click="handleClickOutside"
            />
          </Teleport>
          <div
            v-if="showSectionDropdown"
            class="absolute right-0 mt-5 -left-45 z-100 w-64 bg-popover backdrop-blur-sm border border-sidebar-border rounded-2xl shadow-lg max-h-[70vh] overflow-hidden flex flex-col"
          >
            <!-- Search input -->
            <div class="p-2 border-b border-sidebar-border">
              <div class="relative">
                <Icon name="search-1" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" />
                <input
                  ref="sectionSearchInputRef"
                  v-model="sectionSearchQuery"
                  type="text"
                  placeholder="Search blocks..."
                  class="w-full h-8 pl-7 pr-3 text-xs bg-secondary/50 border border-sidebar-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>
            <!-- Scrollable content -->
            <div class="flex-1 overflow-y-auto p-3">
              <!-- No results message -->
              <div v-if="!hasSearchResults" class="flex flex-col items-center justify-center py-8 text-center">
                <Icon name="search-1" class="text-2xl text-muted-foreground/50 mb-2" />
                <p class="text-xs text-muted-foreground">No blocks found</p>
              </div>
              <template v-else>
                <!-- Regular block categories -->
                <template v-for="category in categories" :key="category">
                  <div v-if="filteredBlocksByCategory[category].length > 0" class="flex flex-col items-start mb-3.5">
                    <div class="text-[10px] text-muted-foreground font-mono border rounded-full uppercase tracking-wider mb-2 px-1.5">
                      {{ categoryLabels[category] }}
                    </div>
                    <div class="grid grid-cols-2 gap-1 w-full">
                      <button
                        v-for="type in filteredBlocksByCategory[category]"
                        :key="type"
                        draggable="true"
                        class="flex flex-col items-center border border-border/25 gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent/25 hover:border-border/50 transition-colors cursor-grab active:cursor-grabbing"
                        @click="handleAddSection(type)"
                        @dragstart="handleSectionTypeDragStart(type, $event)"
                        @dragend="handleSectionTypeDragEnd"
                      >
                        <Icon :name="sectionBlockIcons[type]" :size="18" class="text-muted-foreground" />
                        <span class="text-[10px] text-center leading-tight">{{ sectionBlockLabels[type] }}</span>
                      </button>
                    </div>
                  </div>
                </template>
                <!-- List / Collection templates -->
                <div v-if="filteredPresetTypes.length > 0" class="flex flex-col items-start">
                  <div class="text-[10px] text-muted-foreground font-mono border rounded-full uppercase tracking-wider mb-2 px-1.5">
                    List / Collection
                  </div>
                  <div class="grid grid-cols-2 gap-1 w-full">
                    <button
                      v-for="preset in filteredPresetTypes"
                      :key="preset"
                      draggable="true"
                      class="flex flex-col items-center border border-border/25 gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent/25 hover:border-border/50 transition-colors cursor-grab active:cursor-grabbing"
                      @click="handleAddPreset(preset)"
                      @dragstart="handlePresetDragStart(preset, $event)"
                      @dragend="handlePresetDragEnd"
                    >
                      <Icon :name="presetIcons[preset]" :size="18" class="text-muted-foreground" />
                      <span class="text-[10px] text-center leading-tight">{{ presetLabels[preset] }}</span>
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Section blocks list -->
      <div class="flex-1 p-2" @click="handleSidebarClick">
        <!-- Empty state -->
        <div
          v-if="editorStore.blocks.length === 0"
          class="flex flex-col items-center justify-center h-full text-center px-4"
        >
          <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
            <Icon name="layers-1" class="text-xl text-muted-foreground" />
          </div>
          <p class="text-sm text-muted-foreground">No sections yet</p>
          <p class="text-xs text-muted-foreground mt-1">Click + to add your first section</p>
        </div>

        <!-- Section block items -->
        <div v-else class="space-y-1">
          <div
            v-for="(block, blockIndex) in editorStore.blocks"
            :key="block.id"
            class="block-item"
            :draggable="!isProtectedBlock(block)"
            @dragstart="!isProtectedBlock(block) && handleBlockDragStart(blockIndex, $event)"
            @dragover="handleBlockDragOver(blockIndex, $event)"
            @dragleave="handleBlockDragLeave"
            @drop="handleBlockDrop(blockIndex)"
            @dragend="handleBlockDragEnd"
          >
            <!-- Section block header -->
            <div
              class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
              :class="[
                isProtectedBlock(block) ? 'cursor-pointer' : 'cursor-grab',
                editorStore.selectedBlockId === block.id && !editorStore.selectedItemId
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent/50',
                dragState.blockIndex === blockIndex ? 'opacity-50' : '',
                dragState.overBlockIndex === blockIndex ? 'border-t-2 border-primary' : '',
              ]"
              @click="editorStore.selectBlock(block.id)"
              @contextmenu="handleBlockContextMenu(block.id, 'section', $event)"
            >
              <!-- Expand/Collapse toggle (only for blocks that can expand) -->
              <button
                v-if="canBlockExpand(block)"
                class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
                @click.stop="toggleBlockExpanded(block.id)"
              >
                <Icon name="chevron-down" class="text-[10px] text-muted-foreground transition-transform" :class="expandedBlocks.has(block.id) ? 'rotate-0' : '-rotate-90'" />
              </button>
              <!-- Spacer for blocks that can't expand -->
              <div v-else class="w-4 shrink-0"></div>

              <span class="flex-1 truncate font-medium leading-4" :class="isBlockHidden(block) ? 'opacity-50' : ''">{{ block.name }}</span>

              <!-- Interaction indicator (purple dot) -->
              <Tooltip v-if="blockHasInteraction(block.id)" text="Has interaction">
                <span class="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
              </Tooltip>

              <!-- Shared style indicator -->
              <Tooltip v-if="block.sharedStyleId" text="Has shared style">
                <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              </Tooltip>

              <!-- Visibility toggle for header/footer -->
              <Tooltip v-if="isProtectedBlock(block)" :text="isBlockHidden(block) ? 'Show' : 'Hide'">
                <button
                  class="w-5 h-5 flex items-center justify-center shrink-0 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-foreground"
                  :class="isBlockHidden(block) ? 'text-muted-foreground !opacity-100' : ''"
                  @click.stop="toggleBlockVisibility(block, $event)"
                >
                  <Icon v-if="isBlockHidden(block)" name="app-hide" class="text-[10px] opacity-50" />
                  <Icon v-else name="app-show" :size="10" />
                </button>
              </Tooltip>
            </div>

            <!-- Expanded content: Header children (Start, Middle, End stacks) -->
            <div v-if="expandedBlocks.has(block.id) && block.type === 'header' && block.children?.length" class="ml-6 mt-1 space-y-0.5">
              <div
                v-for="(child, childIndex) in block.children"
                :key="child.id"
                class="block-item"
              >
                <!-- Header stack row (Start/Middle/End) -->
                <div
                  class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors group"
                  :class="[
                    editorStore.selectedBlockId === child.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  ]"
                  @click="editorStore.selectBlock(child.id)"
                  @contextmenu="handleBlockContextMenu(child.id, 'child', $event)"
                >
                  <!-- Expand/collapse toggle -->
                  <button
                    class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
                    @click.stop="toggleBlockExpanded(child.id)"
                  >
                    <Icon name="chevron-down" class="text-[10px] text-muted-foreground transition-transform" :class="expandedBlocks.has(child.id) ? 'rotate-0' : '-rotate-90'" />
                  </button>
                  <div class="w-4 h-4 flex items-center justify-center shrink-0">
                    <Icon :name="sectionBlockIcons[child.type]" :size="12" class="text-muted-foreground" />
                  </div>
                  <span class="flex-1 truncate leading-4">{{ child.name }}</span>
                </div>
                <!-- Nested children of this stack -->
                <div v-if="expandedBlocks.has(child.id)" class="ml-6 mt-0.5 space-y-0.5">
                  <div
                    v-for="(grandchild, grandchildIndex) in (child.children || [])"
                    :key="grandchild.id"
                    draggable="true"
                    class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-grab transition-colors group"
                    :class="[
                      editorStore.selectedBlockId === grandchild.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                      dragState.childInfo?.blockId === grandchild.id ? 'opacity-50' : '',
                      dragState.overChildInfo?.parentId === child.id && dragState.overChildInfo?.childIndex === grandchildIndex ? 'border-t-2 border-primary' : '',
                    ]"
                    @click="editorStore.selectBlock(grandchild.id)"
                    @contextmenu="handleBlockContextMenu(grandchild.id, 'child', $event)"
                    @dragstart="handleChildDragStart(child.id, grandchildIndex, grandchild.id, $event)"
                    @dragover="handleChildDragOver(child.id, grandchildIndex, $event)"
                    @dragleave="handleChildDragLeave"
                    @drop.stop="handleChildDrop(child.id, grandchildIndex)"
                    @dragend="handleChildDragEnd"
                  >
                    <div class="w-4 h-4 flex items-center justify-center shrink-0">
                      <Icon :name="sectionBlockIcons[grandchild.type]" :size="12" class="text-muted-foreground" />
                    </div>
                    <span class="flex-1 truncate leading-4">{{ grandchild.name }}</span>
                    <!-- Interaction indicator (purple dot) -->
                    <Tooltip v-if="blockHasInteraction(grandchild.id)" text="Has interaction">
                      <span class="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                    </Tooltip>
                    <!-- Shared style indicator -->
                    <Tooltip v-if="grandchild.sharedStyleId" text="Has shared style">
                      <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    </Tooltip>
                  </div>
                  <!-- Add block to header stack -->
                  <SidebarBlockPicker
                    mode="header-footer-stack"
                    @select="handleAddChildBlock(child.id, $event)"
                  />
                </div>
              </div>
            </div>

            <!-- Expanded content: Footer children (Start, Middle, End stacks) -->
            <div v-if="expandedBlocks.has(block.id) && block.type === 'footer' && block.children?.length" class="ml-6 mt-1 space-y-0.5">
              <div
                v-for="child in block.children"
                :key="child.id"
                class="block-item"
              >
                <!-- Footer stack row (Start/Middle/End) -->
                <div
                  class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors group"
                  :class="[
                    editorStore.selectedBlockId === child.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  ]"
                  @click="editorStore.selectBlock(child.id)"
                  @contextmenu="handleBlockContextMenu(child.id, 'child', $event)"
                >
                  <!-- Expand/collapse toggle -->
                  <button
                    class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
                    @click.stop="toggleBlockExpanded(child.id)"
                  >
                    <Icon name="chevron-down" class="text-[10px] text-muted-foreground transition-transform" :class="expandedBlocks.has(child.id) ? 'rotate-0' : '-rotate-90'" />
                  </button>
                  <div class="w-4 h-4 flex items-center justify-center shrink-0">
                    <Icon :name="sectionBlockIcons[child.type]" :size="12" class="text-muted-foreground" />
                  </div>
                  <span class="flex-1 truncate leading-4">{{ child.name }}</span>
                </div>
                <!-- Nested children of this stack -->
                <div v-if="expandedBlocks.has(child.id)" class="ml-6 mt-0.5 space-y-0.5">
                  <div
                    v-for="(grandchild, grandchildIndex) in (child.children || [])"
                    :key="grandchild.id"
                    draggable="true"
                    class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-grab transition-colors group"
                    :class="[
                      editorStore.selectedBlockId === grandchild.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                      dragState.childInfo?.blockId === grandchild.id ? 'opacity-50' : '',
                      dragState.overChildInfo?.parentId === child.id && dragState.overChildInfo?.childIndex === grandchildIndex ? 'border-t-2 border-primary' : '',
                    ]"
                    @click="editorStore.selectBlock(grandchild.id)"
                    @contextmenu="handleBlockContextMenu(grandchild.id, 'child', $event)"
                    @dragstart="handleChildDragStart(child.id, grandchildIndex, grandchild.id, $event)"
                    @dragover="handleChildDragOver(child.id, grandchildIndex, $event)"
                    @dragleave="handleChildDragLeave"
                    @drop.stop="handleChildDrop(child.id, grandchildIndex)"
                    @dragend="handleChildDragEnd"
                  >
                    <div class="w-4 h-4 flex items-center justify-center shrink-0">
                      <Icon :name="sectionBlockIcons[grandchild.type]" :size="12" class="text-muted-foreground" />
                    </div>
                    <span class="flex-1 truncate leading-4">{{ grandchild.name }}</span>
                    <!-- Interaction indicator (purple dot) -->
                    <Tooltip v-if="blockHasInteraction(grandchild.id)" text="Has interaction">
                      <span class="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                    </Tooltip>
                    <!-- Shared style indicator -->
                    <Tooltip v-if="grandchild.sharedStyleId" text="Has shared style">
                      <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    </Tooltip>
                  </div>
                  <!-- Add block to footer stack -->
                  <SidebarBlockPicker
                    mode="header-footer-stack"
                    @select="handleAddChildBlock(child.id, $event)"
                  />
                </div>
              </div>
            </div>

            <!-- Expanded content: Nested children (for layout blocks and form, but NOT header/footer which have their own rendering above) -->
            <div v-if="expandedBlocks.has(block.id) && canHaveChildren(block.type) && block.type !== 'header' && block.type !== 'footer'" class="ml-5 mt-1 space-y-0.5">
              <!-- Empty drop zone for dragging blocks to empty parents -->
              <div
                v-if="(!block.children || block.children.length === 0) && dragState.childInfo && !isPrebuiltListGrid(block)"
                class="flex items-center justify-center px-2 py-3 rounded-lg border-2 border-dashed transition-colors"
                :class="dragState.overEmptyParentId === block.id ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'"
                @dragover="handleEmptyParentDragOver(block.id, $event)"
                @dragleave="handleEmptyParentDragLeave"
                @drop.stop="handleEmptyParentDrop(block.id)"
              >
                <span class="text-xs text-muted-foreground">Drop here</span>
              </div>
              <div
                v-for="(child, childIndex) in (block.children || [])"
                :key="child.id"
                class="block-item"
              >
                <!-- Child block row -->
                <div
                  :draggable="canDragChild(block, child)"
                  class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
                  :class="[
                    canDragChild(block, child) ? 'cursor-grab' : 'cursor-pointer',
                    editorStore.selectedBlockId === child.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    dragState.childInfo?.blockId === child.id ? 'opacity-50' : '',
                    dragState.overChildInfo?.parentId === block.id && dragState.overChildInfo?.childIndex === childIndex ? 'border-t-2 border-primary' : '',
                  ]"
                  @click="editorStore.selectBlock(child.id)"
                  @contextmenu="handleBlockContextMenu(child.id, 'child', $event)"
                  @dragstart="canDragChild(block, child) && handleChildDragStart(block.id, childIndex, child.id, $event)"
                  @dragover="handleChildDragOver(block.id, childIndex, $event)"
                  @dragleave="handleChildDragLeave"
                  @drop.stop="handleChildDrop(block.id, childIndex)"
                  @dragend="handleChildDragEnd"
                >
                  <!-- Expand/collapse toggle for nested layout blocks -->
                  <button
                    v-if="canBlockExpand(child)"
                    class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
                    @click.stop="toggleBlockExpanded(child.id)"
                  >
                    <Icon name="chevron-down" class="text-[10px] text-muted-foreground transition-transform" :class="expandedBlocks.has(child.id) ? 'rotate-0' : '-rotate-90'" />
                  </button>
                  <div class="w-4 h-4 flex items-center justify-center shrink-0">
                    <Icon :name="sectionBlockIcons[child.type]" :size="12" class="text-muted-foreground" />
                  </div>
                  <span class="flex-1 truncate leading-4">{{ isPrebuiltListItem(block, child) ? getStackDisplayName(child) : child.name }}</span>
                  <!-- Interaction indicator (purple dot) -->
                  <Tooltip v-if="blockHasInteraction(child.id)" text="Has interaction">
                    <span class="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                  </Tooltip>
                  <Tooltip v-if="child.sharedStyleId" text="Has shared style">
                    <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  </Tooltip>
                  <!-- Visibility toggle for list/collection items -->
                  <Tooltip v-if="isPrebuiltListItem(block, child) || isBlockInsidePrebuiltListItem(block)" :text="isChildBlockHidden(child) ? 'Show' : 'Hide'">
                    <button
                      class="w-5 h-5 flex items-center justify-center shrink-0 rounded transition-all text-muted-foreground hover:bg-accent hover:text-foreground opacity-0 group-hover:opacity-100"
                      :class="isChildBlockHidden(child) ? '!opacity-100' : ''"
                      @click.stop="toggleChildVisibility(child.id, $event)"
                    >
                      <Icon v-if="isChildBlockHidden(child)" name="app-hide" class="text-[10px] opacity-50" />
                      <Icon v-else name="app-show" :size="10" />
                    </button>
                  </Tooltip>
                </div>
                <!-- Nested children of this child (level 2 - grandchildren) -->
                <div v-if="expandedBlocks.has(child.id) && canHaveChildren(child.type)" class="ml-6 mt-0.5 space-y-0.5">
                  <!-- Empty drop zone for dragging blocks to empty parents -->
                  <div
                    v-if="(!child.children || child.children.length === 0) && dragState.childInfo && !isPrebuiltListGrid(child)"
                    class="flex items-center justify-center px-2 py-3 rounded-lg border-2 border-dashed transition-colors"
                    :class="dragState.overEmptyParentId === child.id ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'"
                    @dragover="handleEmptyParentDragOver(child.id, $event)"
                    @dragleave="handleEmptyParentDragLeave"
                    @drop.stop="handleEmptyParentDrop(child.id)"
                  >
                    <span class="text-xs text-muted-foreground">Drop here</span>
                  </div>
                  <div
                    v-for="(grandchild, grandchildIndex) in (child.children || [])"
                    :key="grandchild.id"
                    class="block-item"
                  >
                    <!-- Grandchild block row -->
                    <div
                      :draggable="canDragChild(child, grandchild)"
                      class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
                      :class="[
                        canDragChild(child, grandchild) ? 'cursor-grab' : 'cursor-pointer',
                        editorStore.selectedBlockId === grandchild.id
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                        dragState.childInfo?.blockId === grandchild.id ? 'opacity-50' : '',
                        dragState.overChildInfo?.parentId === child.id && dragState.overChildInfo?.childIndex === grandchildIndex ? 'border-t-2 border-primary' : '',
                      ]"
                      @click="editorStore.selectBlock(grandchild.id)"
                      @contextmenu="handleBlockContextMenu(grandchild.id, 'child', $event)"
                      @dragstart="canDragChild(child, grandchild) && handleChildDragStart(child.id, grandchildIndex, grandchild.id, $event)"
                      @dragover="handleChildDragOver(child.id, grandchildIndex, $event)"
                      @dragleave="handleChildDragLeave"
                      @drop.stop="handleChildDrop(child.id, grandchildIndex)"
                      @dragend="handleChildDragEnd"
                    >
                      <!-- Expand/collapse toggle for layout blocks at this level -->
                      <button
                        v-if="canHaveChildren(grandchild.type)"
                        class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
                        @click.stop="toggleBlockExpanded(grandchild.id)"
                      >
                        <Icon name="chevron-down" class="text-[10px] text-muted-foreground transition-transform" :class="expandedBlocks.has(grandchild.id) ? 'rotate-0' : '-rotate-90'" />
                      </button>
                      <div class="w-4 h-4 flex items-center justify-center shrink-0">
                        <Icon :name="sectionBlockIcons[grandchild.type]" :size="12" class="text-muted-foreground" />
                      </div>
                      <span class="flex-1 truncate leading-4">{{ isPrebuiltListItem(child, grandchild) ? getStackDisplayName(grandchild) : grandchild.name }}</span>
                      <!-- Interaction indicator (purple dot) -->
                      <Tooltip v-if="blockHasInteraction(grandchild.id)" text="Has interaction">
                        <span class="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                      </Tooltip>
                      <Tooltip v-if="grandchild.sharedStyleId" text="Has shared style">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      </Tooltip>
                      <!-- Visibility toggle for blocks inside list items -->
                      <Tooltip v-if="isBlockInsidePrebuiltListItem(child)" :text="isChildBlockHidden(grandchild) ? 'Show' : 'Hide'">
                        <button
                          class="w-5 h-5 flex items-center justify-center shrink-0 rounded transition-all text-muted-foreground hover:bg-accent hover:text-foreground opacity-0 group-hover:opacity-100"
                          :class="isChildBlockHidden(grandchild) ? '!opacity-100' : ''"
                          @click.stop="toggleChildVisibility(grandchild.id, $event)"
                        >
                          <Icon v-if="isChildBlockHidden(grandchild)" name="app-hide" class="text-[10px] opacity-50" />
                          <Icon v-else name="app-show" :size="10" />
                        </button>
                      </Tooltip>
                    </div>
                    <!-- Level 3 children (great-grandchildren) -->
                    <div v-if="expandedBlocks.has(grandchild.id) && canHaveChildren(grandchild.type)" class="ml-6 mt-0.5 space-y-0.5">
                      <!-- Empty drop zone for dragging blocks to empty parents -->
                      <div
                        v-if="(!grandchild.children || grandchild.children.length === 0) && dragState.childInfo && !isPrebuiltListGrid(grandchild)"
                        class="flex items-center justify-center px-2 py-3 rounded-lg border-2 border-dashed transition-colors"
                        :class="dragState.overEmptyParentId === grandchild.id ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'"
                        @dragover="handleEmptyParentDragOver(grandchild.id, $event)"
                        @dragleave="handleEmptyParentDragLeave"
                        @drop.stop="handleEmptyParentDrop(grandchild.id)"
                      >
                        <span class="text-xs text-muted-foreground">Drop here</span>
                      </div>
                      <template
                        v-for="(greatgrandchild, greatgrandchildIndex) in (grandchild.children || [])"
                        :key="greatgrandchild.id"
                      >
                        <div class="block-item">
                          <!-- Great-grandchild block row -->
                          <div
                            :draggable="canDragChild(grandchild, greatgrandchild)"
                            class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
                            :class="[
                              canDragChild(grandchild, greatgrandchild) ? 'cursor-grab' : 'cursor-pointer',
                              editorStore.selectedBlockId === greatgrandchild.id
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                              dragState.childInfo?.blockId === greatgrandchild.id ? 'opacity-50' : '',
                              dragState.overChildInfo?.parentId === grandchild.id && dragState.overChildInfo?.childIndex === greatgrandchildIndex ? 'border-t-2 border-primary' : '',
                            ]"
                            @click="editorStore.selectBlock(greatgrandchild.id)"
                            @contextmenu="handleBlockContextMenu(greatgrandchild.id, 'child', $event)"
                            @dragstart="canDragChild(grandchild, greatgrandchild) && handleChildDragStart(grandchild.id, greatgrandchildIndex, greatgrandchild.id, $event)"
                            @dragover="handleChildDragOver(grandchild.id, greatgrandchildIndex, $event)"
                            @dragleave="handleChildDragLeave"
                            @drop.stop="handleChildDrop(grandchild.id, greatgrandchildIndex)"
                            @dragend="handleChildDragEnd"
                          >
                            <!-- Expand/collapse toggle for layout blocks -->
                            <button
                              v-if="canHaveChildren(greatgrandchild.type)"
                              class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
                              @click.stop="toggleBlockExpanded(greatgrandchild.id)"
                            >
                              <Icon name="chevron-down" class="text-[10px] text-muted-foreground transition-transform" :class="expandedBlocks.has(greatgrandchild.id) ? 'rotate-0' : '-rotate-90'" />
                            </button>
                            <div class="w-4 h-4 flex items-center justify-center shrink-0">
                              <Icon :name="sectionBlockIcons[greatgrandchild.type]" :size="12" class="text-muted-foreground" />
                            </div>
                            <span class="flex-1 truncate leading-4">{{ isPrebuiltListItem(grandchild, greatgrandchild) ? getStackDisplayName(greatgrandchild) : greatgrandchild.name }}</span>
                            <!-- Interaction indicator (purple dot) -->
                            <Tooltip v-if="blockHasInteraction(greatgrandchild.id)" text="Has interaction">
                              <span class="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                            </Tooltip>
                            <Tooltip v-if="greatgrandchild.sharedStyleId" text="Has shared style">
                              <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            </Tooltip>
                            <!-- Visibility toggle for blocks inside list items -->
                            <Tooltip v-if="isBlockInsidePrebuiltListItem(grandchild)" :text="isChildBlockHidden(greatgrandchild) ? 'Show' : 'Hide'">
                              <button
                                class="w-5 h-5 flex items-center justify-center shrink-0 rounded transition-all text-muted-foreground hover:bg-accent hover:text-foreground opacity-0 group-hover:opacity-100"
                                :class="isChildBlockHidden(greatgrandchild) ? '!opacity-100' : ''"
                                @click.stop="toggleChildVisibility(greatgrandchild.id, $event)"
                              >
                                <Icon v-if="isChildBlockHidden(greatgrandchild)" name="app-hide" class="text-[10px] opacity-50" />
                                <Icon v-else name="app-show" :size="10" />
                              </button>
                            </Tooltip>
                          </div>
                          <!-- Level 4 children - for layout blocks at greatgrandchild level (e.g., Stack inside Stack) -->
                          <div v-if="expandedBlocks.has(greatgrandchild.id) && canHaveChildren(greatgrandchild.type)" class="ml-6 mt-0.5 space-y-0.5">
                            <div
                              v-for="level4child in (greatgrandchild.children || [])"
                              :key="level4child.id"
                              class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group cursor-pointer"
                              :class="[
                                editorStore.selectedBlockId === level4child.id
                                  ? 'bg-accent text-accent-foreground'
                                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                              ]"
                              @click="editorStore.selectBlock(level4child.id)"
                              @contextmenu="handleBlockContextMenu(level4child.id, 'child', $event)"
                            >
                              <div class="w-4 h-4 flex items-center justify-center shrink-0">
                                <Icon :name="sectionBlockIcons[level4child.type]" :size="12" class="text-muted-foreground" />
                              </div>
                              <span class="flex-1 truncate leading-4">{{ level4child.name }}</span>
                              <!-- Interaction indicator (purple dot) -->
                              <Tooltip v-if="blockHasInteraction(level4child.id)" text="Has interaction">
                                <span class="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                              </Tooltip>
                              <Tooltip v-if="level4child.sharedStyleId" text="Has shared style">
                                <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              </Tooltip>
                            </div>
                            <!-- Add block to level 4 layout block -->
                            <SidebarBlockPicker
                              mode="nested"
                              @select="handleAddChildBlock(greatgrandchild.id, $event)"
                            />
                          </div>
                        </div>
                      </template>
                      <!-- Add block to grandchild layout block - not for list items -->
                      <SidebarBlockPicker
                        v-if="!isPrebuiltListItem(child, grandchild) && !isBlockInsidePrebuiltListItem(child)"
                        mode="nested"
                        @select="handleAddChildBlock(grandchild.id, $event)"
                      />
                    </div>
                  </div>
                  <!-- Add child to nested layout block - allows layout blocks, but not for list items -->
                  <SidebarBlockPicker
                    v-if="!isPrebuiltListItem(block, child)"
                    mode="nested"
                    @select="handleAddChildBlock(child.id, $event)"
                  />
                </div>
              </div>
              <!-- Add child button - for List/Collection grids, just add a new item -->
              <Button
                v-if="isPrebuiltListGrid(block)"
                variant="dotted"
                size="sm"
                full-width
                class="justify-start text-muted-foreground"
                @click.stop="handleAddListItem(block.id)"
              >
                <Icon name="plus" class="text-xs" />
                <span class="text-[10px]">Add {{ getListItemTypeLabel(block) }}</span>
              </Button>
              <!-- Form blocks show form field options -->
              <Dropdown
                v-else-if="block.type === 'form'"
                :ref="(el: any) => childBlockDropdownRefs[block.id] = el"
                align="left"
                width="w-56"
                :close-on-click="false"
                              no-padding
              >
                <template #trigger="{ toggle }">
                  <Button
                    variant="dotted"
                    size="sm"
                    full-width
                    class="justify-start text-muted-foreground"
                    @click.stop="toggle"
                  >
                    <Icon name="plus" class="text-xs" />
                    <span class="text-[10px] flex-1 text-left">Add field</span>
                    <Icon name="chevron-down" class="text-[10px]" />
                  </Button>
                </template>
                <Combobox
                  :items="formFieldBlockItems"
                  search-placeholder="Search fields..."
                  empty-text="No fields found"
                  @select="handleAddFormFieldBlock(block.id, $event as FormFieldBlockType)"
                />
              </Dropdown>
              <!-- Canvas blocks show content-only options -->
              <SidebarBlockPicker
                v-else-if="block.type === 'canvas'"
                mode="content-only"
                trigger-label="Add element"
                @select="handleAddChildBlock(block.id, $event)"
              />
              <!-- Regular layout blocks show block picker -->
              <SidebarBlockPicker
                v-else
                @select="handleAddChildBlock(block.id, $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Block Context Menu -->
    <ContextMenu ref="blockContextMenuRef">
      <ContextMenuItem
        icon="app-copy-style"
        @click="handleContextMenuCopyStyle"
      >
        Copy style
      </ContextMenuItem>
      <ContextMenuItem
        icon="app-paste-style"
        :disabled="!editorStore.hasClipboardStyles"
        @click="handleContextMenuPasteStyle"
      >
        Paste style
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem
        icon="layers-1"
        :disabled="!canContextMenuDuplicate"
        @click="handleContextMenuDuplicate"
      >
        Duplicate
      </ContextMenuItem>
      <ContextMenuItem
        icon="trash-3"
        destructive
        :disabled="!canContextMenuDelete"
        @click="handleContextMenuDelete"
      >
        Delete
      </ContextMenuItem>
    </ContextMenu>
  </aside>
</template>
