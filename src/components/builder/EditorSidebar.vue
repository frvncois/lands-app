<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Button, Combobox, Dropdown } from '@/components/ui'
import type { ComboboxItem } from '@/components/ui/Combobox.vue'
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

const editorStore = useEditorStore()

const showSectionDropdown = ref(false)
const sectionSearchQuery = ref('')
const expandedBlocks = ref<Set<string>>(new Set())
const showFormFieldDropdown = ref<string | null>(null)
const showSocialDropdown = ref<string | null>(null)

// Drag state
const draggedBlockIndex = ref<number | null>(null)
const dragOverBlockIndex = ref<number | null>(null)
const draggedItemInfo = ref<{ blockId: string; itemIndex: number } | null>(null)
const dragOverItemInfo = ref<{ blockId: string; itemIndex: number } | null>(null)
// Child drag state: track the actual block being dragged for cross-parent support
const draggedChildInfo = ref<{ parentId: string; childIndex: number; blockId: string } | null>(null)
const dragOverChildInfo = ref<{ parentId: string; childIndex: number } | null>(null)

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

// Categories allowed for first-level child blocks (can include layout for nesting)
const firstLevelChildCategories: BlockCategory[] = ['layout', 'content']

// Categories allowed for deeply nested blocks (no more layout blocks)
const deepNestedChildCategories: BlockCategory[] = ['content']

// Combobox items for first-level child blocks (includes layout and presets)
const firstLevelChildBlockItems = computed<ComboboxItem[]>(() => {
  const items: ComboboxItem[] = []
  // Add regular block categories
  for (const category of firstLevelChildCategories) {
    const types = blocksByCategory[category] || []
    for (const type of types) {
      items.push({
        value: type,
        label: sectionBlockLabels[type],
        icon: sectionBlockIcons[type],
        group: categoryLabels[category],
      })
    }
  }
  // Add List / Collection presets
  for (const preset of presetTypes) {
    items.push({
      value: preset,
      label: presetLabels[preset],
      icon: presetIcons[preset],
      group: 'List / Collection',
    })
  }
  return items
})

// Combobox items for deeply nested child blocks (content/form only, no layout, plus presets)
const deepNestedChildBlockItems = computed<ComboboxItem[]>(() => {
  const items: ComboboxItem[] = []
  // Add regular block categories (no layout blocks)
  for (const category of deepNestedChildCategories) {
    const types = blocksByCategory[category] || []
    for (const type of types) {
      items.push({
        value: type,
        label: sectionBlockLabels[type],
        icon: sectionBlockIcons[type],
        group: categoryLabels[category],
      })
    }
  }
  // Add List / Collection presets (presets are allowed at any level)
  for (const preset of presetTypes) {
    items.push({
      value: preset,
      label: presetLabels[preset],
      icon: presetIcons[preset],
      group: 'List / Collection',
    })
  }
  return items
})

// Combobox items for form field blocks (only used when adding to form blocks)
const formFieldBlockItems = computed<ComboboxItem[]>(() => {
  return formFieldBlockTypes.map(type => ({
    value: type,
    label: formFieldBlockLabels[type] || sectionBlockLabels[type],
    icon: sectionBlockIcons[type],
    group: 'Form Fields',
  }))
})

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
  editorStore.addPresetBlock(block)
  expandedBlocks.value.add(block.id)
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
    editorStore.addPresetBlock(block, undefined, parentId)
    editorStore.selectBlock(block.id)
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

// Check if a Grid block is a List/Collection (has Stack children)
function isListCollectionGrid(block: SectionBlock): boolean {
  if (block.type !== 'grid') return false
  if (!block.children || block.children.length === 0) return false
  // Check if first child is a Stack (List/Collection pattern)
  const firstChild = block.children[0]
  return firstChild ? firstChild.type === 'stack' : false
}

// Add a new list item by duplicating the first Stack child
function handleAddListItem(gridId: string) {
  const grid = editorStore.findBlockById(gridId)
  if (!grid || !grid.children || grid.children.length === 0) return

  // Find the first Stack child to use as template
  const templateStack = grid.children.find(c => c.type === 'stack')
  if (!templateStack) return

  // Duplicate the template stack
  const newItem = editorStore.duplicateBlock(templateStack.id)
  if (newItem) {
    // Update the name to reflect it's a new item
    const itemNumber = grid.children.filter(c => c.type === 'stack').length
    editorStore.updateBlockName(newItem.id, `Item ${itemNumber}`)
    editorStore.selectBlock(newItem.id)
    expandedBlocks.value.add(newItem.id)
  }
}

// Check if a child block is inside a List/Collection (parent is Grid with Stack children)
function isChildInsideListCollection(parentBlock: SectionBlock, child: SectionBlock): boolean {
  // Check if parent is a Grid with Stack children (List/Collection pattern)
  if (parentBlock.type === 'grid' && child.type === 'stack') {
    return true
  }
  // Check if parent is a Stack inside a Grid (nested inside List/Collection)
  if (parentBlock.type === 'stack') {
    const grandparent = editorStore.findParentBlock(parentBlock.id)
    if (grandparent && grandparent.type === 'grid') {
      return true
    }
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

// Check if a child block can be dragged (not inside List/Collection)
function canDragChild(parentBlock: SectionBlock, child: SectionBlock): boolean {
  return !isChildInsideListCollection(parentBlock, child)
}

// Child block drag handlers (for layout block children)
function handleChildDragStart(parentId: string, childIndex: number, blockId: string, event: DragEvent) {
  event.stopPropagation()
  draggedChildInfo.value = { parentId, childIndex, blockId }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleChildDragOver(parentId: string, childIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (!draggedChildInfo.value) return

  // Don't allow dropping onto List/Collection grids (Grid with Stack children)
  const targetParent = editorStore.findBlockById(parentId)
  if (targetParent && isListCollectionGrid(targetParent)) return

  // Allow drop if different position (same or different parent)
  const isSameParent = draggedChildInfo.value.parentId === parentId
  const isDifferentPosition = !isSameParent || draggedChildInfo.value.childIndex !== childIndex

  if (isDifferentPosition) {
    dragOverChildInfo.value = { parentId, childIndex }
  }
}

function handleChildDragLeave() {
  dragOverChildInfo.value = null
}

function handleChildDrop(parentId: string, childIndex: number) {
  if (!draggedChildInfo.value) return

  const isSameParent = draggedChildInfo.value.parentId === parentId

  if (isSameParent) {
    // Same parent: reorder within
    if (draggedChildInfo.value.childIndex !== childIndex) {
      editorStore.reorderBlocks(draggedChildInfo.value.childIndex, childIndex, parentId)
    }
  } else {
    // Different parent: move to new parent
    editorStore.moveBlockToParent(draggedChildInfo.value.blockId, parentId, childIndex)
  }

  draggedChildInfo.value = null
  dragOverChildInfo.value = null
}

function handleChildDragEnd() {
  draggedChildInfo.value = null
  dragOverChildInfo.value = null
}

// Track if dragging over an empty parent container
const dragOverEmptyParentId = ref<string | null>(null)

// Handle drag over empty parent container
function handleEmptyParentDragOver(parentId: string, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (!draggedChildInfo.value) return

  // Don't allow dropping onto List/Collection grids
  const targetParent = editorStore.findBlockById(parentId)
  if (targetParent && isListCollectionGrid(targetParent)) return

  // Don't allow dropping onto own parent (already empty)
  if (draggedChildInfo.value.parentId === parentId) return

  dragOverEmptyParentId.value = parentId
}

function handleEmptyParentDragLeave() {
  dragOverEmptyParentId.value = null
}

function handleEmptyParentDrop(parentId: string) {
  if (!draggedChildInfo.value) return

  // Move to this empty parent at index 0
  editorStore.moveBlockToParent(draggedChildInfo.value.blockId, parentId, 0)

  draggedChildInfo.value = null
  dragOverChildInfo.value = null
  dragOverEmptyParentId.value = null
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
  draggedBlockIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleBlockDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  if (draggedBlockIndex.value !== null && draggedBlockIndex.value !== index) {
    dragOverBlockIndex.value = index
  }
}

function handleBlockDragLeave() {
  dragOverBlockIndex.value = null
}

function handleBlockDrop(index: number) {
  if (draggedBlockIndex.value !== null && draggedBlockIndex.value !== index) {
    editorStore.reorderBlocks(draggedBlockIndex.value, index)
  }
  draggedBlockIndex.value = null
  dragOverBlockIndex.value = null
}

function handleBlockDragEnd() {
  draggedBlockIndex.value = null
  dragOverBlockIndex.value = null
}

// Generic item drag handlers (for form fields, nav links, etc.)
function handleItemDragStart(blockId: string, itemIndex: number, event: DragEvent) {
  event.stopPropagation()
  draggedItemInfo.value = { blockId, itemIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleItemDragOver(blockId: string, itemIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (draggedItemInfo.value?.blockId === blockId && draggedItemInfo.value.itemIndex !== itemIndex) {
    dragOverItemInfo.value = { blockId, itemIndex }
  }
}

function handleItemDragLeave() {
  dragOverItemInfo.value = null
}

function handleItemDrop(blockId: string, itemIndex: number, reorderFn: (blockId: string, from: number, to: number) => void) {
  if (draggedItemInfo.value?.blockId === blockId && draggedItemInfo.value.itemIndex !== itemIndex) {
    reorderFn(blockId, draggedItemInfo.value.itemIndex, itemIndex)
  }
  draggedItemInfo.value = null
  dragOverItemInfo.value = null
}

function handleItemDragEnd() {
  draggedItemInfo.value = null
  dragOverItemInfo.value = null
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

// Move item up/down handlers
function handleMoveItemUp(blockId: string, itemIndex: number, reorderFn: (blockId: string, from: number, to: number) => void, event: MouseEvent) {
  event.stopPropagation()
  if (itemIndex > 0) {
    reorderFn(blockId, itemIndex, itemIndex - 1)
  }
}

function handleMoveItemDown(blockId: string, itemIndex: number, itemsLength: number, reorderFn: (blockId: string, from: number, to: number) => void, event: MouseEvent) {
  event.stopPropagation()
  if (itemIndex < itemsLength - 1) {
    reorderFn(blockId, itemIndex, itemIndex + 1)
  }
}

function handleMoveChildUp(parentId: string, childIndex: number, event: MouseEvent) {
  event.stopPropagation()
  if (childIndex > 0) {
    editorStore.reorderBlocks(childIndex, childIndex - 1, parentId)
  }
}

function handleMoveChildDown(parentId: string, childIndex: number, childrenLength: number, event: MouseEvent) {
  event.stopPropagation()
  if (childIndex < childrenLength - 1) {
    editorStore.reorderBlocks(childIndex, childIndex + 1, parentId)
  }
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
      <Button
        v-for="block in editorStore.blocks"
        :key="block.id"
        variant="outline"
        size="icon"
        class="h-6 w-6"
        :class="editorStore.selectedBlockId === block.id ? 'bg-accent text-accent-foreground' : ''"
        :title="block.name"
        @click="editorStore.selectBlock(block.id)"
      >
        <i :class="['lni', sectionBlockIcons[block.type], 'text-sm']"></i>
      </Button>
    </div>

    <!-- Expanded state -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between h-12 px-4 mr-1 border-b border-sidebar-border">
        <h2 class="text-sm font-semibold text-foreground">Sections</h2>
        <div class="relative dropdown-container">
          <Button
            variant="outline"
            size="icon"
            title="Add section"
            @click="showSectionDropdown = !showSectionDropdown"
          >
            <i class="lni lni-plus text-sm"></i>
          </Button>
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
                <i class="lni lni-search-1 absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"></i>
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
                <i class="lni lni-search-1 text-2xl text-muted-foreground/50 mb-2"></i>
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
                        class="flex flex-col items-center gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent transition-colors cursor-grab active:cursor-grabbing"
                        @click="handleAddSection(type)"
                        @dragstart="handleSectionTypeDragStart(type, $event)"
                        @dragend="handleSectionTypeDragEnd"
                      >
                        <i :class="['lni', sectionBlockIcons[type], 'text-lg text-muted-foreground']"></i>
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
                      class="flex flex-col items-center gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent transition-colors cursor-grab active:cursor-grabbing"
                      @click="handleAddPreset(preset)"
                      @dragstart="handlePresetDragStart(preset, $event)"
                      @dragend="handlePresetDragEnd"
                    >
                      <i :class="['lni', presetIcons[preset], 'text-lg text-muted-foreground']"></i>
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
      <div class="flex-1 overflow-y-auto p-2" @click="handleSidebarClick">
        <!-- Empty state -->
        <div
          v-if="editorStore.blocks.length === 0"
          class="flex flex-col items-center justify-center h-full text-center px-4"
        >
          <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
            <i class="lni lni-layers-1 text-xl text-muted-foreground"></i>
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
              class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
              :class="[
                isProtectedBlock(block) ? 'cursor-pointer' : 'cursor-grab',
                editorStore.selectedBlockId === block.id && !editorStore.selectedItemId
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent/50',
                draggedBlockIndex === blockIndex ? 'opacity-50' : '',
                dragOverBlockIndex === blockIndex ? 'border-t-2 border-primary' : '',
              ]"
              @click="editorStore.selectBlock(block.id)"
            >


              <!-- Expand/Collapse toggle (only for blocks that can expand) -->
              <button
                v-if="canBlockExpand(block)"
                class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
                @click.stop="toggleBlockExpanded(block.id)"
              >
                <i
                  class="lni lni-chevron-down text-[10px] text-muted-foreground transition-transform"
                  :class="expandedBlocks.has(block.id) ? '' : '-rotate-90'"
                ></i>
              </button>
              <!-- Spacer for blocks that can't expand -->
              <div v-else class="w-4 shrink-0"></div>

              <span class="flex-1 font-medium leading-4" :class="isBlockHidden(block) ? 'opacity-50' : ''">{{ block.name }}</span>

              <!-- Visibility toggle for header/footer -->
              <button
                v-if="isProtectedBlock(block)"
                class="w-5 h-5 flex items-center justify-center shrink-0 rounded opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground transition-all"
                :class="isBlockHidden(block) ? '!opacity-100 text-muted-foreground' : ''"
                :title="isBlockHidden(block) ? 'Show section' : 'Hide section'"
                @click="toggleBlockVisibility(block, $event)"
              >
                <span v-if="isBlockHidden(block)" class="relative inline-flex items-center justify-center w-3 h-3">
                  <i class="lni lni-eye text-[10px] opacity-50"></i>
                  <span class="absolute inset-0 flex items-center justify-center">
                    <span class="w-3 h-[1px] bg-current rotate-45 rounded-full"></span>
                  </span>
                </span>
                <i v-else class="lni lni-eye text-[10px]"></i>
              </button>

              <!-- Move up button -->
              <button
                v-if="!isProtectedBlock(block)"
                class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                title="Move up"
                @click.stop="editorStore.moveBlockUp(blockIndex)"
              >
                <i class="lni lni-chevron-up text-[10px]"></i>
              </button>

              <!-- Move down button -->
              <button
                v-if="!isProtectedBlock(block)"
                class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                title="Move down"
                @click.stop="editorStore.moveBlockDown(blockIndex)"
              >
                <i class="lni lni-chevron-down text-[10px]"></i>
              </button>

              <!-- Duplicate block button -->
              <button
                v-if="!isProtectedBlock(block)"
                class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                title="Duplicate section"
                @click="handleDuplicateBlock(block.id, $event)"
              >
                <i class="lni lni-layers-1 text-[10px]"></i>
              </button>

              <!-- Delete block button -->
              <button
                v-if="!isProtectedBlock(block)"
                class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                title="Delete section"
                @click="handleDeleteBlock(block.id, $event)"
              >
                <i class="lni lni-trash-3 text-[10px]"></i>
              </button>
            </div>

            <!-- Expanded content: Header nav links -->
            <div v-if="expandedBlocks.has(block.id) && block.type === 'header'" class="ml-6 mt-1 space-y-0.5">
              <div
                v-for="(link, linkIndex) in (block.settings as HeaderSettings).navLinks"
                :key="link.id"
                draggable="true"
                class="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs cursor-grab transition-colors group"
                :class="[
                  editorStore.selectedBlockId === block.id && editorStore.selectedItemId === link.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  draggedItemInfo?.blockId === block.id && draggedItemInfo?.itemIndex === linkIndex ? 'opacity-50' : '',
                  dragOverItemInfo?.blockId === block.id && dragOverItemInfo?.itemIndex === linkIndex ? 'border-t-2 border-primary' : '',
                ]"
                @click="editorStore.selectBlock(block.id, link.id)"
                @dragstart="handleItemDragStart(block.id, linkIndex, $event)"
                @dragover="handleItemDragOver(block.id, linkIndex, $event)"
                @dragleave="handleItemDragLeave"
                @drop.stop="handleItemDrop(block.id, linkIndex, editorStore.reorderHeaderNavLinks)"
                @dragend="handleItemDragEnd"
              >
                <div class="w-4 h-4 flex items-center justify-center shrink-0">
                  <i class="lni lni-link-2 text-xs text-muted-foreground"></i>
                </div>
                <span class="flex-1 truncate leading-4">{{ link.label || 'Nav Link' }}</span>
                <button
                  class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                  title="Move up"
                  @click="handleMoveItemUp(block.id, linkIndex, editorStore.reorderHeaderNavLinks, $event)"
                >
                  <i class="lni lni-chevron-up text-[10px]"></i>
                </button>
                <button
                  class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                  title="Move down"
                  @click="handleMoveItemDown(block.id, linkIndex, (block.settings as HeaderSettings).navLinks.length, editorStore.reorderHeaderNavLinks, $event)"
                >
                  <i class="lni lni-chevron-down text-[10px]"></i>
                </button>
                <button
                  class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                  title="Duplicate nav link"
                  @click="handleDuplicateHeaderNavLink(block.id, link.id, $event)"
                >
                  <i class="lni lni-layers-1 text-[10px]"></i>
                </button>
                <button
                  class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                  title="Delete nav link"
                  @click="handleDeleteHeaderNavLink(block.id, link.id, $event)"
                >
                  <i class="lni lni-xmark text-[10px]"></i>
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                full-width
                class="justify-start gap-1.5 text-muted-foreground"
                @click.stop="handleAddHeaderNavLink(block.id)"
              >
                <i class="lni lni-plus text-xs"></i>
                Add nav link
              </Button>
            </div>

            <!-- Expanded content: Footer links and social -->
            <div v-if="expandedBlocks.has(block.id) && block.type === 'footer'" class="ml-6 mt-1 space-y-2">
              <!-- Footer links -->
              <div class="space-y-0.5">
                <div class="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">Links</div>
                <div
                  v-for="(link, linkIndex) in (block.settings as FooterSettings).links"
                  :key="link.id"
                  draggable="true"
                  class="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs cursor-grab transition-colors group"
                  :class="[
                    editorStore.selectedBlockId === block.id && editorStore.selectedItemId === link.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    draggedItemInfo?.blockId === block.id && draggedItemInfo?.itemIndex === linkIndex ? 'opacity-50' : '',
                    dragOverItemInfo?.blockId === block.id && dragOverItemInfo?.itemIndex === linkIndex ? 'border-t-2 border-primary' : '',
                  ]"
                  @click="editorStore.selectBlock(block.id, link.id)"
                  @dragstart="handleItemDragStart(block.id, linkIndex, $event)"
                  @dragover="handleItemDragOver(block.id, linkIndex, $event)"
                  @dragleave="handleItemDragLeave"
                  @drop.stop="handleItemDrop(block.id, linkIndex, editorStore.reorderFooterLinks)"
                  @dragend="handleItemDragEnd"
                >
                  <div class="w-4 h-4 flex items-center justify-center shrink-0">
                    <i class="lni lni-link-2 text-xs text-muted-foreground"></i>
                  </div>
                  <span class="flex-1 truncate leading-4">{{ link.label || 'Footer Link' }}</span>
                  <button
                    class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                    title="Move up"
                    @click="handleMoveItemUp(block.id, linkIndex, editorStore.reorderFooterLinks, $event)"
                  >
                    <i class="lni lni-chevron-up text-[10px]"></i>
                  </button>
                  <button
                    class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                    title="Move down"
                    @click="handleMoveItemDown(block.id, linkIndex, (block.settings as FooterSettings).links.length, editorStore.reorderFooterLinks, $event)"
                  >
                    <i class="lni lni-chevron-down text-[10px]"></i>
                  </button>
                  <button
                    class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                    title="Duplicate link"
                    @click="handleDuplicateFooterLink(block.id, link.id, $event)"
                  >
                    <i class="lni lni-layers-1 text-[10px]"></i>
                  </button>
                  <button
                    class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                    title="Delete link"
                    @click="handleDeleteFooterLink(block.id, link.id, $event)"
                  >
                    <i class="lni lni-xmark text-[10px]"></i>
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  full-width
                  class="justify-start gap-1.5 text-muted-foreground"
                  @click.stop="handleAddFooterLink(block.id)"
                >
                  <i class="lni lni-plus text-xs"></i>
                  Add link
                </Button>
              </div>

              <!-- Social links -->
              <div class="space-y-0.5">
                <div class="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">Social</div>
                <div
                  v-for="(social, socialIndex) in (block.settings as FooterSettings).socialLinks"
                  :key="social.id"
                  class="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors group cursor-pointer"
                  :class="[
                    editorStore.selectedBlockId === block.id && editorStore.selectedItemId === social.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  ]"
                  @click="editorStore.selectBlock(block.id, social.id)"
                >
                  <div class="w-4 h-4 flex items-center justify-center shrink-0">
                    <i :class="['lni', socialPlatformIcons[social.platform], 'text-xs text-muted-foreground']"></i>
                  </div>
                  <span class="flex-1 truncate leading-4">{{ socialPlatformLabels[social.platform] }}</span>
                  <button
                    class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                    title="Move up"
                    @click="handleMoveItemUp(block.id, socialIndex, editorStore.reorderFooterSocialLinks, $event)"
                  >
                    <i class="lni lni-chevron-up text-[10px]"></i>
                  </button>
                  <button
                    class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                    title="Move down"
                    @click="handleMoveItemDown(block.id, socialIndex, (block.settings as FooterSettings).socialLinks.length, editorStore.reorderFooterSocialLinks, $event)"
                  >
                    <i class="lni lni-chevron-down text-[10px]"></i>
                  </button>
                  <button
                    class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                    title="Duplicate social"
                    @click="handleDuplicateFooterSocialLink(block.id, social.id, $event)"
                  >
                    <i class="lni lni-layers-1 text-[10px]"></i>
                  </button>
                  <button
                    class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                    title="Delete social"
                    @click="handleDeleteFooterSocialLink(block.id, social.id, $event)"
                  >
                    <i class="lni lni-xmark text-[10px]"></i>
                  </button>
                </div>
                <div class="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    full-width
                    class="justify-start gap-1.5 text-muted-foreground"
                    @click.stop="showSocialDropdown = showSocialDropdown === block.id ? null : block.id"
                  >
                    <i class="lni lni-plus text-xs"></i>
                    <span class="flex-1 text-left">Add social</span>
                    <i class="lni lni-chevron-down text-[10px]"></i>
                  </Button>
                  <div
                    v-if="showSocialDropdown === block.id"
                    class="absolute left-0 top-full mt-1 w-full bg-popover border border-sidebar-border rounded-md shadow-lg z-10 py-1 max-h-48 overflow-y-auto"
                  >
                    <button
                      v-for="platform in socialPlatforms"
                      :key="platform"
                      class="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                      @click.stop="handleAddFooterSocialLink(block.id, platform)"
                    >
                      <div class="w-4 h-4 flex items-center justify-center shrink-0">
                        <i :class="['lni', socialPlatformIcons[platform], 'text-muted-foreground']"></i>
                      </div>
                      <span class="leading-4">{{ socialPlatformLabels[platform] }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Expanded content: Nested children (for layout blocks and form) -->
            <div v-if="expandedBlocks.has(block.id) && canHaveChildren(block.type)" class="ml-6 mt-1 space-y-0.5">
              <!-- Empty drop zone for dragging blocks to empty parents -->
              <div
                v-if="(!block.children || block.children.length === 0) && draggedChildInfo && !isListCollectionGrid(block)"
                class="flex items-center justify-center px-2 py-3 rounded-lg border-2 border-dashed transition-colors"
                :class="dragOverEmptyParentId === block.id ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'"
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
                  class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
                  :class="[
                    canDragChild(block, child) ? 'cursor-grab' : 'cursor-pointer',
                    editorStore.selectedBlockId === child.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    draggedChildInfo?.blockId === child.id ? 'opacity-50' : '',
                    dragOverChildInfo?.parentId === block.id && dragOverChildInfo?.childIndex === childIndex ? 'border-t-2 border-primary' : '',
                  ]"
                  @click="editorStore.selectBlock(child.id)"
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
                    <i
                      class="lni lni-chevron-down text-[10px] text-muted-foreground transition-transform"
                      :class="expandedBlocks.has(child.id) ? '' : '-rotate-90'"
                    ></i>
                  </button>
                  <div v-else class="w-4 h-4 shrink-0"></div>
                  <div class="w-4 h-4 flex items-center justify-center shrink-0">
                    <i :class="['lni', sectionBlockIcons[child.type], 'text-xs text-muted-foreground']"></i>
                  </div>
                  <span class="flex-1 truncate leading-4" :class="isChildBlockHidden(child) ? 'opacity-50' : ''">{{ child.name }}</span>
                  <!-- List/Collection item actions: eye, move up, move down -->
                  <template v-if="isChildInsideListCollection(block, child)">
                    <!-- Visibility toggle -->
                    <button
                      class="w-5 h-5 flex items-center justify-center shrink-0 rounded transition-all"
                      :class="isChildBlockHidden(child) ? '!opacity-100 text-muted-foreground hover:bg-accent hover:text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground opacity-0 group-hover:opacity-100'"
                      :title="isChildBlockHidden(child) ? 'Show item' : 'Hide item'"
                      @click="toggleChildVisibility(child.id, $event)"
                    >
                      <span v-if="isChildBlockHidden(child)" class="relative inline-flex items-center justify-center w-3 h-3">
                        <i class="lni lni-eye text-[10px] opacity-50"></i>
                        <span class="absolute inset-0 flex items-center justify-center">
                          <span class="w-3 h-[1px] bg-current rotate-45 rounded-full"></span>
                        </span>
                      </span>
                      <i v-else class="lni lni-eye text-[10px]"></i>
                    </button>
                    <!-- Move up button -->
                    <button
                      class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                      title="Move up"
                      @click.stop="handleMoveChildUp(block.id, childIndex, $event)"
                    >
                      <i class="lni lni-chevron-up text-[10px]"></i>
                    </button>
                    <!-- Move down button -->
                    <button
                      class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                      title="Move down"
                      @click.stop="handleMoveChildDown(block.id, childIndex, (block.children || []).length, $event)"
                    >
                      <i class="lni lni-chevron-down text-[10px]"></i>
                    </button>
                  </template>
                  <!-- Regular block actions: move up, move down, duplicate, delete -->
                  <template v-else>
                    <!-- Move up button -->
                    <button
                      class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                      title="Move up"
                      @click.stop="handleMoveChildUp(block.id, childIndex, $event)"
                    >
                      <i class="lni lni-chevron-up text-[10px]"></i>
                    </button>
                    <!-- Move down button -->
                    <button
                      class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                      title="Move down"
                      @click.stop="handleMoveChildDown(block.id, childIndex, (block.children || []).length, $event)"
                    >
                      <i class="lni lni-chevron-down text-[10px]"></i>
                    </button>
                    <!-- Duplicate button -->
                    <button
                      class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                      title="Duplicate"
                      @click.stop="handleDuplicateChildBlock(child.id, $event)"
                    >
                      <i class="lni lni-layers-1 text-[10px]"></i>
                    </button>
                    <!-- Delete button -->
                    <button
                      class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                      @click.stop="handleDeleteChildBlock(child.id, $event)"
                    >
                      <i class="lni lni-xmark text-[10px]"></i>
                    </button>
                  </template>
                </div>
                <!-- Nested children of this child (level 2 - grandchildren) -->
                <div v-if="expandedBlocks.has(child.id) && canHaveChildren(child.type)" class="ml-6 mt-0.5 space-y-0.5">
                  <!-- Empty drop zone for dragging blocks to empty parents -->
                  <div
                    v-if="(!child.children || child.children.length === 0) && draggedChildInfo && !isListCollectionGrid(child)"
                    class="flex items-center justify-center px-2 py-3 rounded-lg border-2 border-dashed transition-colors"
                    :class="dragOverEmptyParentId === child.id ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'"
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
                      class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
                      :class="[
                        canDragChild(child, grandchild) ? 'cursor-grab' : 'cursor-pointer',
                        editorStore.selectedBlockId === grandchild.id
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                        draggedChildInfo?.blockId === grandchild.id ? 'opacity-50' : '',
                        dragOverChildInfo?.parentId === child.id && dragOverChildInfo?.childIndex === grandchildIndex ? 'border-t-2 border-primary' : '',
                      ]"
                      @click="editorStore.selectBlock(grandchild.id)"
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
                        <i
                          class="lni lni-chevron-down text-[10px] text-muted-foreground transition-transform"
                          :class="expandedBlocks.has(grandchild.id) ? '' : '-rotate-90'"
                        ></i>
                      </button>
                      <div v-else class="w-4 h-4 shrink-0"></div>
                      <div class="w-4 h-4 flex items-center justify-center shrink-0">
                        <i :class="['lni', sectionBlockIcons[grandchild.type], 'text-xs text-muted-foreground']"></i>
                      </div>
                      <span class="flex-1 truncate leading-4" :class="isChildBlockHidden(grandchild) ? 'opacity-50' : ''">{{ grandchild.name }}</span>
                      <!-- List/Collection item actions: eye, move up, move down -->
                      <template v-if="isChildInsideListCollection(child, grandchild)">
                        <!-- Visibility toggle -->
                        <button
                          class="w-5 h-5 flex items-center justify-center shrink-0 rounded transition-all"
                          :class="isChildBlockHidden(grandchild) ? '!opacity-100 text-muted-foreground hover:bg-accent hover:text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground opacity-0 group-hover:opacity-100'"
                          :title="isChildBlockHidden(grandchild) ? 'Show item' : 'Hide item'"
                          @click="toggleChildVisibility(grandchild.id, $event)"
                        >
                          <span v-if="isChildBlockHidden(grandchild)" class="relative inline-flex items-center justify-center w-3 h-3">
                            <i class="lni lni-eye text-[10px] opacity-50"></i>
                            <span class="absolute inset-0 flex items-center justify-center">
                              <span class="w-3 h-[1px] bg-current rotate-45 rounded-full"></span>
                            </span>
                          </span>
                          <i v-else class="lni lni-eye text-[10px]"></i>
                        </button>
                        <!-- Move up button -->
                        <button
                          class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                          title="Move up"
                          @click.stop="handleMoveChildUp(child.id, grandchildIndex, $event)"
                        >
                          <i class="lni lni-chevron-up text-[10px]"></i>
                        </button>
                        <!-- Move down button -->
                        <button
                          class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                          title="Move down"
                          @click.stop="handleMoveChildDown(child.id, grandchildIndex, (child.children || []).length, $event)"
                        >
                          <i class="lni lni-chevron-down text-[10px]"></i>
                        </button>
                      </template>
                      <!-- Regular block actions: move up, move down, duplicate, delete -->
                      <template v-else>
                        <!-- Move up button -->
                        <button
                          class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                          title="Move up"
                          @click.stop="handleMoveChildUp(child.id, grandchildIndex, $event)"
                        >
                          <i class="lni lni-chevron-up text-[10px]"></i>
                        </button>
                        <!-- Move down button -->
                        <button
                          class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                          title="Move down"
                          @click.stop="handleMoveChildDown(child.id, grandchildIndex, (child.children || []).length, $event)"
                        >
                          <i class="lni lni-chevron-down text-[10px]"></i>
                        </button>
                        <!-- Duplicate button -->
                        <button
                          class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                          title="Duplicate"
                          @click.stop="handleDuplicateChildBlock(grandchild.id, $event)"
                        >
                          <i class="lni lni-layers-1 text-[10px]"></i>
                        </button>
                        <!-- Delete button -->
                        <button
                          class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                          title="Delete"
                          @click.stop="handleDeleteChildBlock(grandchild.id, $event)"
                        >
                          <i class="lni lni-xmark text-[10px]"></i>
                        </button>
                      </template>
                    </div>
                    <!-- Level 3 children (great-grandchildren) - deepest level, no more layout blocks allowed -->
                    <div v-if="expandedBlocks.has(grandchild.id) && canHaveChildren(grandchild.type)" class="ml-6 mt-0.5 space-y-0.5">
                      <!-- Empty drop zone for dragging blocks to empty parents -->
                      <div
                        v-if="(!grandchild.children || grandchild.children.length === 0) && draggedChildInfo && !isListCollectionGrid(grandchild)"
                        class="flex items-center justify-center px-2 py-3 rounded-lg border-2 border-dashed transition-colors"
                        :class="dragOverEmptyParentId === grandchild.id ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'"
                        @dragover="handleEmptyParentDragOver(grandchild.id, $event)"
                        @dragleave="handleEmptyParentDragLeave"
                        @drop.stop="handleEmptyParentDrop(grandchild.id)"
                      >
                        <span class="text-xs text-muted-foreground">Drop here</span>
                      </div>
                      <div
                        v-for="(greatgrandchild, greatgrandchildIndex) in (grandchild.children || [])"
                        :key="greatgrandchild.id"
                        :draggable="canDragChild(grandchild, greatgrandchild)"
                        class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
                        :class="[
                          canDragChild(grandchild, greatgrandchild) ? 'cursor-grab' : 'cursor-pointer',
                          editorStore.selectedBlockId === greatgrandchild.id
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                          draggedChildInfo?.blockId === greatgrandchild.id ? 'opacity-50' : '',
                          dragOverChildInfo?.parentId === grandchild.id && dragOverChildInfo?.childIndex === greatgrandchildIndex ? 'border-t-2 border-primary' : '',
                        ]"
                        @click="editorStore.selectBlock(greatgrandchild.id)"
                        @dragstart="canDragChild(grandchild, greatgrandchild) && handleChildDragStart(grandchild.id, greatgrandchildIndex, greatgrandchild.id, $event)"
                        @dragover="handleChildDragOver(grandchild.id, greatgrandchildIndex, $event)"
                        @dragleave="handleChildDragLeave"
                        @drop.stop="handleChildDrop(grandchild.id, greatgrandchildIndex)"
                        @dragend="handleChildDragEnd"
                      >
                        <div class="w-4 h-4 shrink-0"></div>
                        <div class="w-4 h-4 flex items-center justify-center shrink-0">
                          <i :class="['lni', sectionBlockIcons[greatgrandchild.type], 'text-xs text-muted-foreground']"></i>
                        </div>
                        <span class="flex-1 truncate leading-4" :class="isChildBlockHidden(greatgrandchild) ? 'opacity-50' : ''">{{ greatgrandchild.name }}</span>
                        <!-- List/Collection item actions: eye, move up, move down -->
                        <template v-if="isChildInsideListCollection(grandchild, greatgrandchild)">
                          <!-- Visibility toggle -->
                          <button
                            class="w-5 h-5 flex items-center justify-center shrink-0 rounded transition-all"
                            :class="isChildBlockHidden(greatgrandchild) ? '!opacity-100 text-muted-foreground hover:bg-accent hover:text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground opacity-0 group-hover:opacity-100'"
                            :title="isChildBlockHidden(greatgrandchild) ? 'Show item' : 'Hide item'"
                            @click="toggleChildVisibility(greatgrandchild.id, $event)"
                          >
                            <span v-if="isChildBlockHidden(greatgrandchild)" class="relative inline-flex items-center justify-center w-3 h-3">
                              <i class="lni lni-eye text-[10px] opacity-50"></i>
                              <span class="absolute inset-0 flex items-center justify-center">
                                <span class="w-3 h-[1px] bg-current rotate-45 rounded-full"></span>
                              </span>
                            </span>
                            <i v-else class="lni lni-eye text-[10px]"></i>
                          </button>
                          <!-- Move up button -->
                          <button
                            class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                            title="Move up"
                            @click.stop="handleMoveChildUp(grandchild.id, greatgrandchildIndex, $event)"
                          >
                            <i class="lni lni-chevron-up text-[10px]"></i>
                          </button>
                          <!-- Move down button -->
                          <button
                            class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                            title="Move down"
                            @click.stop="handleMoveChildDown(grandchild.id, greatgrandchildIndex, (grandchild.children || []).length, $event)"
                          >
                            <i class="lni lni-chevron-down text-[10px]"></i>
                          </button>
                        </template>
                        <!-- Regular block actions: move up, move down, duplicate, delete -->
                        <template v-else>
                          <!-- Move up button -->
                          <button
                            class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                            title="Move up"
                            @click.stop="handleMoveChildUp(grandchild.id, greatgrandchildIndex, $event)"
                          >
                            <i class="lni lni-chevron-up text-[10px]"></i>
                          </button>
                          <!-- Move down button -->
                          <button
                            class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                            title="Move down"
                            @click.stop="handleMoveChildDown(grandchild.id, greatgrandchildIndex, (grandchild.children || []).length, $event)"
                          >
                            <i class="lni lni-chevron-down text-[10px]"></i>
                          </button>
                          <!-- Duplicate button -->
                          <button
                            class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                            title="Duplicate"
                            @click.stop="handleDuplicateChildBlock(greatgrandchild.id, $event)"
                          >
                            <i class="lni lni-layers-1 text-[10px]"></i>
                          </button>
                          <!-- Delete button -->
                          <button
                            class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                            title="Delete"
                            @click.stop="handleDeleteChildBlock(greatgrandchild.id, $event)"
                          >
                            <i class="lni lni-xmark text-[10px]"></i>
                          </button>
                        </template>
                      </div>
                      <!-- Add block to deepest level - NO layout blocks allowed -->
                      <Dropdown
                        :ref="(el: any) => childBlockDropdownRefs[grandchild.id] = el"
                        align="left"
                        width="w-56"
                        :close-on-click="false"
                      >
                        <template #trigger="{ toggle }">
                          <Button
                            variant="ghost"
                            size="sm"
                            full-width
                            class="justify-start gap-1.5 text-muted-foreground"
                            @click.stop="toggle"
                          >
                            <i class="lni lni-plus text-xs"></i>
                            <span class="flex-1 text-left">Add block</span>
                            <i class="lni lni-chevron-down text-[10px]"></i>
                          </Button>
                        </template>
                        <Combobox
                          :items="deepNestedChildBlockItems"
                          search-placeholder="Search blocks..."
                          empty-text="No blocks found"
                          @select="handleAddChildBlock(grandchild.id, $event)"
                        />
                      </Dropdown>
                    </div>
                  </div>
                  <!-- Add child to nested layout block - allows layout blocks -->
                  <Dropdown
                    :ref="(el: any) => childBlockDropdownRefs[child.id] = el"
                    align="left"
                    width="w-56"
                    :close-on-click="false"
                  >
                    <template #trigger="{ toggle }">
                      <Button
                        variant="ghost"
                        size="sm"
                        full-width
                        class="justify-start gap-1.5 text-muted-foreground"
                        @click.stop="toggle"
                      >
                        <i class="lni lni-plus text-xs"></i>
                        <span class="flex-1 text-left">Add block</span>
                        <i class="lni lni-chevron-down text-[10px]"></i>
                      </Button>
                    </template>
                    <Combobox
                      :items="deepNestedChildBlockItems"
                      search-placeholder="Search blocks..."
                      empty-text="No blocks found"
                      @select="handleAddChildBlock(child.id, $event)"
                    />
                  </Dropdown>
                </div>
              </div>
              <!-- Add child button - for List/Collection grids, just add a new item -->
              <Button
                v-if="isListCollectionGrid(block)"
                variant="ghost"
                size="xs"
                full-width
                class="justify-start gap-1.5 text-muted-foreground"
                @click.stop="handleAddListItem(block.id)"
              >
                <i class="lni lni-plus text-xs"></i>
                <span class="flex-1 text-left">Add item</span>
              </Button>
              <!-- Form blocks show form field options -->
              <Dropdown
                v-else-if="block.type === 'form'"
                :ref="(el: any) => childBlockDropdownRefs[block.id] = el"
                align="left"
                width="w-56"
                :close-on-click="false"
              >
                <template #trigger="{ toggle }">
                  <Button
                    variant="ghost"
                    size="sm"
                    full-width
                    class="justify-start gap-1.5 text-muted-foreground"
                    @click.stop="toggle"
                  >
                    <i class="lni lni-plus text-xs"></i>
                    <span class="flex-1 text-left">Add field</span>
                    <i class="lni lni-chevron-down text-[10px]"></i>
                  </Button>
                </template>
                <Combobox
                  :items="formFieldBlockItems"
                  search-placeholder="Search fields..."
                  empty-text="No fields found"
                  @select="handleAddFormFieldBlock(block.id, $event as FormFieldBlockType)"
                />
              </Dropdown>
              <!-- Regular layout blocks show dropdown -->
              <Dropdown
                v-else
                :ref="(el: any) => childBlockDropdownRefs[block.id] = el"
                align="left"
                width="w-56"
                :close-on-click="false"
              >
                <template #trigger="{ toggle }">
                  <Button
                    variant="ghost"
                    size="sm"
                    full-width
                    class="justify-start gap-1.5 text-muted-foreground"
                    @click.stop="toggle"
                  >
                    <i class="lni lni-plus text-xs"></i>
                    <span class="flex-1 text-left">Add block</span>
                    <i class="lni lni-chevron-down text-[10px]"></i>
                  </Button>
                </template>
                <Combobox
                  :items="firstLevelChildBlockItems"
                  search-placeholder="Search blocks..."
                  empty-text="No blocks found"
                  @select="handleAddChildBlock(block.id, $event)"
                />
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>
