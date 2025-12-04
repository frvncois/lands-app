<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { sectionBlockLabels, blockItemLabels, getAllowedChildren, sectionBlockIcons, blockItemIcons, formFieldLabels, formFieldIcons, socialPlatformLabels, socialPlatformIcons } from '@/lib/editor-utils'
import type { SectionBlockType, BlockItemType, SectionBlock, FormFieldType, FooterSocialLink } from '@/types/editor'

const editorStore = useEditorStore()

const showSectionDropdown = ref(false)
const showChildDropdown = ref<string | null>(null)
const expandedBlocks = ref<Set<string>>(new Set())

// Drag state
const draggedNewSectionType = ref<SectionBlockType | null>(null)
const draggedBlockIndex = ref<number | null>(null)
const dragOverBlockIndex = ref<number | null>(null)
const draggedChildInfo = ref<{ blockId: string; childIndex: number } | null>(null)
const dragOverChildInfo = ref<{ blockId: string; childIndex: number } | null>(null)
const draggedPostInfo = ref<{ blockId: string; postIndex: number } | null>(null)
const dragOverPostInfo = ref<{ blockId: string; postIndex: number } | null>(null)
const draggedLinkInfo = ref<{ blockId: string; linkIndex: number } | null>(null)
const dragOverLinkInfo = ref<{ blockId: string; linkIndex: number } | null>(null)
const draggedProductInfo = ref<{ blockId: string; productIndex: number } | null>(null)
const dragOverProductInfo = ref<{ blockId: string; productIndex: number } | null>(null)
const draggedFormFieldInfo = ref<{ blockId: string; fieldIndex: number } | null>(null)
const dragOverFormFieldInfo = ref<{ blockId: string; fieldIndex: number } | null>(null)
const draggedHeaderNavLinkInfo = ref<{ blockId: string; linkIndex: number } | null>(null)
const dragOverHeaderNavLinkInfo = ref<{ blockId: string; linkIndex: number } | null>(null)
const draggedFooterLinkInfo = ref<{ blockId: string; linkIndex: number } | null>(null)
const dragOverFooterLinkInfo = ref<{ blockId: string; linkIndex: number } | null>(null)
const draggedFooterSocialInfo = ref<{ blockId: string; linkIndex: number } | null>(null)
const dragOverFooterSocialInfo = ref<{ blockId: string; linkIndex: number } | null>(null)
const showFormFieldDropdown = ref<string | null>(null)
const showSocialDropdown = ref<string | null>(null)

// Helper to check if block is a post section
function isPostSection(block: SectionBlock): boolean {
  return block.type === 'post'
}

// Helper to check if block is a link section
function isLinkSection(block: SectionBlock): boolean {
  return block.type === 'link'
}

// Helper to check if block is a product section
function isProductSection(block: SectionBlock): boolean {
  return block.type === 'product'
}

// Helper to check if block has regular children (not post, link, or product sections)
function hasRegularChildren(block: SectionBlock): boolean {
  return !isPostSection(block) && !isLinkSection(block) && !isProductSection(block) && !isFormSection(block) && !isHeaderSection(block) && !isFooterSection(block)
}

// Helper to check if block is a form section
function isFormSection(block: SectionBlock): boolean {
  return block.type === 'form'
}

// Helper to check if block is a header section
function isHeaderSection(block: SectionBlock): boolean {
  return block.type === 'header'
}

// Helper to check if block is a footer section
function isFooterSection(block: SectionBlock): boolean {
  return block.type === 'footer'
}

// Helper to check if block is protected (header/footer - can't delete, duplicate, or move)
function isProtectedBlock(block: SectionBlock): boolean {
  return block.type === 'header' || block.type === 'footer'
}

// Section types available for adding (excluding header/footer which are auto-added)
const sectionTypes: SectionBlockType[] = [
  'hero',
  'text',
  'text-image',
  'text-video',
  'video',
  'image',
  'link',
  'post',
  'product',
  'form',
]

// Form field types for dropdown
const formFieldTypes: FormFieldType[] = [
  'text',
  'email',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'date',
  'phone',
  'number',
  'file',
]

// Social platforms for dropdown
const socialPlatforms: FooterSocialLink['platform'][] = [
  'twitter',
  'instagram',
  'facebook',
  'linkedin',
  'youtube',
  'tiktok',
  'github',
  'discord',
]

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

function handleAddChild(blockId: string, type: BlockItemType) {
  editorStore.addBlockItem(blockId, type)
  showChildDropdown.value = null
}

function handleDeleteChild(blockId: string, itemId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteBlockItem(blockId, itemId)
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

function handleDuplicateChild(blockId: string, itemId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.duplicateItem(blockId, itemId)
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown-container')) {
    showSectionDropdown.value = false
    showChildDropdown.value = null
  }
}

function handleSidebarClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  // Deselect if clicking on empty area (not on a block item)
  if (!target.closest('.block-item')) {
    editorStore.selectBlock(null)
  }
}

// New section drag handlers (from dropdown)
function handleNewSectionDragStart(type: SectionBlockType, event: DragEvent) {
  draggedNewSectionType.value = type
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/x-section-type', type)
  }
}

function handleNewSectionDragEnd() {
  draggedNewSectionType.value = null
  showSectionDropdown.value = false
}

// Block drag handlers
function handleBlockDragStart(index: number, event: DragEvent) {
  draggedBlockIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'block')
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

// Child drag handlers
function handleChildDragStart(blockId: string, childIndex: number, event: DragEvent) {
  event.stopPropagation()
  draggedChildInfo.value = { blockId, childIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'child')
  }
}

function handleChildDragOver(blockId: string, childIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (
    draggedChildInfo.value !== null &&
    draggedChildInfo.value.blockId === blockId &&
    draggedChildInfo.value.childIndex !== childIndex
  ) {
    dragOverChildInfo.value = { blockId, childIndex }
  }
}

function handleChildDragLeave() {
  dragOverChildInfo.value = null
}

function handleChildDrop(blockId: string, childIndex: number) {
  if (
    draggedChildInfo.value !== null &&
    draggedChildInfo.value.blockId === blockId &&
    draggedChildInfo.value.childIndex !== childIndex
  ) {
    editorStore.reorderBlockItems(blockId, draggedChildInfo.value.childIndex, childIndex)
  }
  draggedChildInfo.value = null
  dragOverChildInfo.value = null
}

function handleChildDragEnd() {
  draggedChildInfo.value = null
  dragOverChildInfo.value = null
}

// Post item handlers
function handleAddPost(blockId: string) {
  editorStore.addPostItem(blockId)
}

function handleDeletePost(blockId: string, postId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deletePostItem(blockId, postId)
}

// Post drag handlers
function handlePostDragStart(blockId: string, postIndex: number, event: DragEvent) {
  event.stopPropagation()
  draggedPostInfo.value = { blockId, postIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'post')
  }
}

function handlePostDragOver(blockId: string, postIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (
    draggedPostInfo.value !== null &&
    draggedPostInfo.value.blockId === blockId &&
    draggedPostInfo.value.postIndex !== postIndex
  ) {
    dragOverPostInfo.value = { blockId, postIndex }
  }
}

function handlePostDragLeave() {
  dragOverPostInfo.value = null
}

function handlePostDrop(blockId: string, postIndex: number) {
  if (
    draggedPostInfo.value !== null &&
    draggedPostInfo.value.blockId === blockId &&
    draggedPostInfo.value.postIndex !== postIndex
  ) {
    editorStore.reorderPostItems(blockId, draggedPostInfo.value.postIndex, postIndex)
  }
  draggedPostInfo.value = null
  dragOverPostInfo.value = null
}

function handlePostDragEnd() {
  draggedPostInfo.value = null
  dragOverPostInfo.value = null
}

// Link item handlers
function handleAddLink(blockId: string) {
  editorStore.addLinkItem(blockId)
}

function handleDeleteLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteLinkItem(blockId, linkId)
}

// Link drag handlers
function handleLinkDragStart(blockId: string, linkIndex: number, event: DragEvent) {
  event.stopPropagation()
  draggedLinkInfo.value = { blockId, linkIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'link')
  }
}

function handleLinkDragOver(blockId: string, linkIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (
    draggedLinkInfo.value !== null &&
    draggedLinkInfo.value.blockId === blockId &&
    draggedLinkInfo.value.linkIndex !== linkIndex
  ) {
    dragOverLinkInfo.value = { blockId, linkIndex }
  }
}

function handleLinkDragLeave() {
  dragOverLinkInfo.value = null
}

function handleLinkDrop(blockId: string, linkIndex: number) {
  if (
    draggedLinkInfo.value !== null &&
    draggedLinkInfo.value.blockId === blockId &&
    draggedLinkInfo.value.linkIndex !== linkIndex
  ) {
    editorStore.reorderLinkItems(blockId, draggedLinkInfo.value.linkIndex, linkIndex)
  }
  draggedLinkInfo.value = null
  dragOverLinkInfo.value = null
}

function handleLinkDragEnd() {
  draggedLinkInfo.value = null
  dragOverLinkInfo.value = null
}

// Product item handlers
function handleAddProduct(blockId: string) {
  editorStore.addProductItem(blockId)
}

function handleDeleteProduct(blockId: string, productId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteProductItem(blockId, productId)
}

// Product drag handlers
function handleProductDragStart(blockId: string, productIndex: number, event: DragEvent) {
  event.stopPropagation()
  draggedProductInfo.value = { blockId, productIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'product')
  }
}

function handleProductDragOver(blockId: string, productIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (
    draggedProductInfo.value !== null &&
    draggedProductInfo.value.blockId === blockId &&
    draggedProductInfo.value.productIndex !== productIndex
  ) {
    dragOverProductInfo.value = { blockId, productIndex }
  }
}

function handleProductDragLeave() {
  dragOverProductInfo.value = null
}

function handleProductDrop(blockId: string, productIndex: number) {
  if (
    draggedProductInfo.value !== null &&
    draggedProductInfo.value.blockId === blockId &&
    draggedProductInfo.value.productIndex !== productIndex
  ) {
    editorStore.reorderProductItems(blockId, draggedProductInfo.value.productIndex, productIndex)
  }
  draggedProductInfo.value = null
  dragOverProductInfo.value = null
}

function handleProductDragEnd() {
  draggedProductInfo.value = null
  dragOverProductInfo.value = null
}

// Form field handlers
function handleAddFormField(blockId: string, type: FormFieldType) {
  editorStore.addFormField(blockId, type)
  showFormFieldDropdown.value = null
}

function handleDeleteFormField(blockId: string, fieldId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteFormField(blockId, fieldId)
}

function handleFormFieldDragStart(blockId: string, fieldIndex: number, event: DragEvent) {
  event.stopPropagation()
  draggedFormFieldInfo.value = { blockId, fieldIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'formfield')
  }
}

function handleFormFieldDragOver(blockId: string, fieldIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (
    draggedFormFieldInfo.value !== null &&
    draggedFormFieldInfo.value.blockId === blockId &&
    draggedFormFieldInfo.value.fieldIndex !== fieldIndex
  ) {
    dragOverFormFieldInfo.value = { blockId, fieldIndex }
  }
}

function handleFormFieldDragLeave() {
  dragOverFormFieldInfo.value = null
}

function handleFormFieldDrop(blockId: string, fieldIndex: number) {
  if (
    draggedFormFieldInfo.value !== null &&
    draggedFormFieldInfo.value.blockId === blockId &&
    draggedFormFieldInfo.value.fieldIndex !== fieldIndex
  ) {
    editorStore.reorderFormFields(blockId, draggedFormFieldInfo.value.fieldIndex, fieldIndex)
  }
  draggedFormFieldInfo.value = null
  dragOverFormFieldInfo.value = null
}

function handleFormFieldDragEnd() {
  draggedFormFieldInfo.value = null
  dragOverFormFieldInfo.value = null
}

// Header nav link handlers
function handleAddHeaderNavLink(blockId: string) {
  editorStore.addHeaderNavLink(blockId)
}

function handleDeleteHeaderNavLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteHeaderNavLink(blockId, linkId)
}

function handleHeaderNavLinkDragStart(blockId: string, linkIndex: number, event: DragEvent) {
  event.stopPropagation()
  draggedHeaderNavLinkInfo.value = { blockId, linkIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'headernavlink')
  }
}

function handleHeaderNavLinkDragOver(blockId: string, linkIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (
    draggedHeaderNavLinkInfo.value !== null &&
    draggedHeaderNavLinkInfo.value.blockId === blockId &&
    draggedHeaderNavLinkInfo.value.linkIndex !== linkIndex
  ) {
    dragOverHeaderNavLinkInfo.value = { blockId, linkIndex }
  }
}

function handleHeaderNavLinkDragLeave() {
  dragOverHeaderNavLinkInfo.value = null
}

function handleHeaderNavLinkDrop(blockId: string, linkIndex: number) {
  if (
    draggedHeaderNavLinkInfo.value !== null &&
    draggedHeaderNavLinkInfo.value.blockId === blockId &&
    draggedHeaderNavLinkInfo.value.linkIndex !== linkIndex
  ) {
    editorStore.reorderHeaderNavLinks(blockId, draggedHeaderNavLinkInfo.value.linkIndex, linkIndex)
  }
  draggedHeaderNavLinkInfo.value = null
  dragOverHeaderNavLinkInfo.value = null
}

function handleHeaderNavLinkDragEnd() {
  draggedHeaderNavLinkInfo.value = null
  dragOverHeaderNavLinkInfo.value = null
}

// Footer link handlers
function handleAddFooterLink(blockId: string) {
  editorStore.addFooterLink(blockId)
}

function handleDeleteFooterLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteFooterLink(blockId, linkId)
}

function handleFooterLinkDragStart(blockId: string, linkIndex: number, event: DragEvent) {
  event.stopPropagation()
  draggedFooterLinkInfo.value = { blockId, linkIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'footerlink')
  }
}

function handleFooterLinkDragOver(blockId: string, linkIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (
    draggedFooterLinkInfo.value !== null &&
    draggedFooterLinkInfo.value.blockId === blockId &&
    draggedFooterLinkInfo.value.linkIndex !== linkIndex
  ) {
    dragOverFooterLinkInfo.value = { blockId, linkIndex }
  }
}

function handleFooterLinkDragLeave() {
  dragOverFooterLinkInfo.value = null
}

function handleFooterLinkDrop(blockId: string, linkIndex: number) {
  if (
    draggedFooterLinkInfo.value !== null &&
    draggedFooterLinkInfo.value.blockId === blockId &&
    draggedFooterLinkInfo.value.linkIndex !== linkIndex
  ) {
    editorStore.reorderFooterLinks(blockId, draggedFooterLinkInfo.value.linkIndex, linkIndex)
  }
  draggedFooterLinkInfo.value = null
  dragOverFooterLinkInfo.value = null
}

function handleFooterLinkDragEnd() {
  draggedFooterLinkInfo.value = null
  dragOverFooterLinkInfo.value = null
}

// Footer social link handlers
function handleAddFooterSocialLink(blockId: string, platform: FooterSocialLink['platform']) {
  editorStore.addFooterSocialLink(blockId, platform)
  showSocialDropdown.value = null
}

function handleDeleteFooterSocialLink(blockId: string, linkId: string, event: MouseEvent) {
  event.stopPropagation()
  editorStore.deleteFooterSocialLink(blockId, linkId)
}

function handleFooterSocialDragStart(blockId: string, linkIndex: number, event: DragEvent) {
  event.stopPropagation()
  draggedFooterSocialInfo.value = { blockId, linkIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'footersocial')
  }
}

function handleFooterSocialDragOver(blockId: string, linkIndex: number, event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  if (
    draggedFooterSocialInfo.value !== null &&
    draggedFooterSocialInfo.value.blockId === blockId &&
    draggedFooterSocialInfo.value.linkIndex !== linkIndex
  ) {
    dragOverFooterSocialInfo.value = { blockId, linkIndex }
  }
}

function handleFooterSocialDragLeave() {
  dragOverFooterSocialInfo.value = null
}

function handleFooterSocialDrop(blockId: string, linkIndex: number) {
  if (
    draggedFooterSocialInfo.value !== null &&
    draggedFooterSocialInfo.value.blockId === blockId &&
    draggedFooterSocialInfo.value.linkIndex !== linkIndex
  ) {
    editorStore.reorderFooterSocialLinks(blockId, draggedFooterSocialInfo.value.linkIndex, linkIndex)
  }
  draggedFooterSocialInfo.value = null
  dragOverFooterSocialInfo.value = null
}

function handleFooterSocialDragEnd() {
  draggedFooterSocialInfo.value = null
  dragOverFooterSocialInfo.value = null
}
</script>

<template>
  <aside
    class="flex flex-col h-full bg-sidebar-background border rounded-xl transition-all duration-200"
    :class="editorStore.isSidebarCollapsed ? 'w-10' : 'w-72'"
  >
    <!-- Collapsed state -->
    <div v-if="editorStore.isSidebarCollapsed" class="flex flex-col items-center py-2 gap-1">
      <button
        class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Expand sidebar"
        @click="editorStore.toggleSidebar"
      >
        <i class="lni lni-angle-double-right text-sm"></i>
      </button>
      <div class="w-6 border-t border-border my-1"></div>
      <!-- Section icons when collapsed -->
      <button
        v-for="block in editorStore.blocks"
        :key="block.id"
        class="p-1.5 rounded-md transition-colors"
        :class="[
          editorStore.selectedBlockId === block.id
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        ]"
        :title="block.name"
        @click="editorStore.selectBlock(block.id)"
      >
        <i :class="['lni', sectionBlockIcons[block.type], 'text-sm']"></i>
      </button>
    </div>

    <!-- Expanded state -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between h-12 px-4 border-b">
        <h2 class="text-sm font-semibold text-foreground">Sections</h2>
        <div class="flex items-center gap-1">
          <div class="relative dropdown-container">
            <button
              class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Add section"
              @click="showSectionDropdown = !showSectionDropdown"
            >
              <i class="lni lni-plus text-sm"></i>
            </button>
            <!-- Section Dropdown -->
            <Teleport to="body">
              <div
                v-if="(showSectionDropdown || showChildDropdown) && !draggedNewSectionType"
                class="fixed inset-0 z-40"
                @click="handleClickOutside"
              />
            </Teleport>
            <div
              v-if="showSectionDropdown"
              class="absolute right-0 top-full mt-1 z-50 w-56 p-2 bg-popover border border-border rounded-md shadow-lg"
            >
              <div class="grid grid-cols-2 gap-1">
                <button
                  v-for="type in sectionTypes"
                  :key="type"
                  draggable="true"
                  class="flex flex-col items-center gap-1 p-3 rounded-md text-popover-foreground hover:bg-accent transition-colors cursor-grab active:cursor-grabbing"
                  :class="draggedNewSectionType === type ? 'opacity-50' : ''"
                  @click="handleAddSection(type)"
                  @dragstart="handleNewSectionDragStart(type, $event)"
                  @dragend="handleNewSectionDragEnd"
                >
                  <i :class="['lni', sectionBlockIcons[type], 'text-lg text-muted-foreground']"></i>
                  <span class="text-xs">{{ sectionBlockLabels[type] }}</span>
                </button>
              </div>
            </div>
          </div>
          <button
            class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Collapse sidebar"
            @click="editorStore.toggleSidebar"
          >
            <i class="lni lni-angle-double-left text-sm"></i>
          </button>
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
            class="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors group"
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
            <!-- Drag handle (hidden for protected blocks) -->
            <div v-if="!isProtectedBlock(block)" class="p-0.5 cursor-grab text-muted-foreground">
              <i class="lni lni-menu-hamburger-1 text-sm"></i>
            </div>
            <!-- Lock icon for protected blocks -->
            <div v-else class="p-0.5 text-muted-foreground/50">
              <i class="lni lni-lock-1 text-sm"></i>
            </div>

            <!-- Expand/Collapse toggle -->
            <button
              class="p-0.5 rounded hover:bg-accent/50 transition-colors"
              @click.stop="toggleBlockExpanded(block.id)"
            >
              <i
                class="lni lni-chevron-down text-xs text-muted-foreground transition-transform"
                :class="expandedBlocks.has(block.id) ? '' : '-rotate-90'"
              ></i>
            </button>

            <i :class="['lni', sectionBlockIcons[block.type], 'text-xs text-muted-foreground']"></i>
            <span class="flex-1 font-medium">{{ block.name }}</span>

            <!-- Duplicate block button (hidden for protected blocks) -->
            <button
              v-if="!isProtectedBlock(block)"
              class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground transition-all"
              title="Duplicate section"
              @click="handleDuplicateBlock(block.id, $event)"
            >
              <i class="lni lni-file-multiple text-xs"></i>
            </button>

            <!-- Delete block button (hidden for protected blocks) -->
            <button
              v-if="!isProtectedBlock(block)"
              class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
              title="Delete section"
              @click="handleDeleteBlock(block.id, $event)"
            >
              <i class="lni lni-trash-3 text-xs"></i>
            </button>
          </div>

          <!-- Children list (for regular sections) -->
          <div v-if="expandedBlocks.has(block.id) && hasRegularChildren(block)" class="ml-6 mt-1 space-y-0.5">
            <!-- Child items -->
            <div
              v-for="(child, childIndex) in block.children"
              :key="child.id"
              draggable="true"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-grab transition-colors group"
              :class="[
                editorStore.selectedBlockId === block.id && editorStore.selectedItemId === child.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                draggedChildInfo?.blockId === block.id && draggedChildInfo?.childIndex === childIndex
                  ? 'opacity-50'
                  : '',
                dragOverChildInfo?.blockId === block.id && dragOverChildInfo?.childIndex === childIndex
                  ? 'border-t-2 border-primary'
                  : '',
              ]"
              @click="editorStore.selectBlock(block.id, child.id)"
              @dragstart="handleChildDragStart(block.id, childIndex, $event)"
              @dragover="handleChildDragOver(block.id, childIndex, $event)"
              @dragleave="handleChildDragLeave"
              @drop.stop="handleChildDrop(block.id, childIndex)"
              @dragend="handleChildDragEnd"
            >
              <!-- Drag handle -->
              <div class="cursor-grab text-muted-foreground">
                <i class="lni lni-menu-hamburger-1 text-xs"></i>
              </div>

              <i :class="['lni', blockItemIcons[child.type], 'text-xs text-muted-foreground']"></i>
              <span class="flex-1">{{ blockItemLabels[child.type] }}</span>

              <!-- Duplicate child button -->
              <button
                class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground transition-all"
                title="Duplicate item"
                @click="handleDuplicateChild(block.id, child.id, $event)"
              >
                <i class="lni lni-file-multiple text-xs"></i>
              </button>

              <!-- Delete child button -->
              <button
                class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                title="Delete item"
                @click="handleDeleteChild(block.id, child.id, $event)"
              >
                <i class="lni lni-xmark text-xs"></i>
              </button>
            </div>

            <!-- Add child button -->
            <div class="relative dropdown-container">
              <button
                class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                @click.stop="showChildDropdown = showChildDropdown === block.id ? null : block.id"
              >
                <i class="lni lni-plus text-xs"></i>
                Add item
              </button>

              <!-- Child dropdown -->
              <div
                v-if="showChildDropdown === block.id"
                class="absolute left-0 top-full mt-1 z-50 w-40 py-1 bg-popover border border-border rounded-md shadow-lg"
              >
                <button
                  v-for="childType in getAllowedChildren(block.type)"
                  :key="childType"
                  class="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-accent transition-colors"
                  @click="handleAddChild(block.id, childType)"
                >
                  <i :class="['lni', blockItemIcons[childType], 'text-xs text-muted-foreground']"></i>
                  {{ blockItemLabels[childType] }}
                </button>
              </div>
            </div>
          </div>

          <!-- Post items list (for post sections) -->
          <div v-if="expandedBlocks.has(block.id) && isPostSection(block) && block.postSettings" class="ml-6 mt-1 space-y-0.5">
            <!-- Post items -->
            <div
              v-for="(post, postIndex) in block.postSettings.posts"
              :key="post.id"
              draggable="true"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-grab transition-colors group"
              :class="[
                editorStore.selectedBlockId === block.id && editorStore.selectedItemId === post.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                draggedPostInfo?.blockId === block.id && draggedPostInfo?.postIndex === postIndex
                  ? 'opacity-50'
                  : '',
                dragOverPostInfo?.blockId === block.id && dragOverPostInfo?.postIndex === postIndex
                  ? 'border-t-2 border-primary'
                  : '',
              ]"
              @click="editorStore.selectBlock(block.id, post.id)"
              @dragstart="handlePostDragStart(block.id, postIndex, $event)"
              @dragover="handlePostDragOver(block.id, postIndex, $event)"
              @dragleave="handlePostDragLeave"
              @drop.stop="handlePostDrop(block.id, postIndex)"
              @dragend="handlePostDragEnd"
            >
              <!-- Drag handle -->
              <div class="cursor-grab text-muted-foreground">
                <i class="lni lni-menu-hamburger-1 text-xs"></i>
              </div>

              <!-- Post icon -->
              <i class="lni lni-text-format text-xs text-muted-foreground"></i>

              <span class="flex-1 truncate">{{ post.heading || 'Untitled Post' }}</span>

              <!-- Delete post button -->
              <button
                class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                title="Delete post"
                @click="handleDeletePost(block.id, post.id, $event)"
              >
                <i class="lni lni-xmark text-xs"></i>
              </button>
            </div>

            <!-- Add post button -->
            <button
              class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              @click.stop="handleAddPost(block.id)"
            >
              <i class="lni lni-plus text-xs"></i>
              Add post
            </button>
          </div>

          <!-- Link items list (for link sections) -->
          <div v-if="expandedBlocks.has(block.id) && isLinkSection(block) && block.linkSettings" class="ml-6 mt-1 space-y-0.5">
            <!-- Link items -->
            <div
              v-for="(link, linkIndex) in block.linkSettings.links"
              :key="link.id"
              draggable="true"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-grab transition-colors group"
              :class="[
                editorStore.selectedBlockId === block.id && editorStore.selectedItemId === link.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                draggedLinkInfo?.blockId === block.id && draggedLinkInfo?.linkIndex === linkIndex
                  ? 'opacity-50'
                  : '',
                dragOverLinkInfo?.blockId === block.id && dragOverLinkInfo?.linkIndex === linkIndex
                  ? 'border-t-2 border-primary'
                  : '',
              ]"
              @click="editorStore.selectBlock(block.id, link.id)"
              @dragstart="handleLinkDragStart(block.id, linkIndex, $event)"
              @dragover="handleLinkDragOver(block.id, linkIndex, $event)"
              @dragleave="handleLinkDragLeave"
              @drop.stop="handleLinkDrop(block.id, linkIndex)"
              @dragend="handleLinkDragEnd"
            >
              <!-- Drag handle -->
              <div class="cursor-grab text-muted-foreground">
                <i class="lni lni-menu-hamburger-1 text-xs"></i>
              </div>

              <!-- Link icon -->
              <i class="lni lni-link-2-angular-right text-xs text-muted-foreground"></i>

              <span class="flex-1 truncate">{{ link.heading || 'Untitled Link' }}</span>

              <!-- Delete link button -->
              <button
                class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                title="Delete link"
                @click="handleDeleteLink(block.id, link.id, $event)"
              >
                <i class="lni lni-xmark text-xs"></i>
              </button>
            </div>

            <!-- Add link button -->
            <button
              class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              @click.stop="handleAddLink(block.id)"
            >
              <i class="lni lni-plus text-xs"></i>
              Add link
            </button>
          </div>

          <!-- Product items list (for product sections) -->
          <div v-if="expandedBlocks.has(block.id) && isProductSection(block) && block.productSettings" class="ml-6 mt-1 space-y-0.5">
            <!-- Product items -->
            <div
              v-for="(product, productIndex) in block.productSettings.products"
              :key="product.id"
              draggable="true"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-grab transition-colors group"
              :class="[
                editorStore.selectedBlockId === block.id && editorStore.selectedItemId === product.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                draggedProductInfo?.blockId === block.id && draggedProductInfo?.productIndex === productIndex
                  ? 'opacity-50'
                  : '',
                dragOverProductInfo?.blockId === block.id && dragOverProductInfo?.productIndex === productIndex
                  ? 'border-t-2 border-primary'
                  : '',
              ]"
              @click="editorStore.selectBlock(block.id, product.id)"
              @dragstart="handleProductDragStart(block.id, productIndex, $event)"
              @dragover="handleProductDragOver(block.id, productIndex, $event)"
              @dragleave="handleProductDragLeave"
              @drop.stop="handleProductDrop(block.id, productIndex)"
              @dragend="handleProductDragEnd"
            >
              <!-- Drag handle -->
              <div class="cursor-grab text-muted-foreground">
                <i class="lni lni-menu-hamburger-1 text-xs"></i>
              </div>

              <!-- Product icon -->
              <i class="lni lni-cart-1 text-xs text-muted-foreground"></i>

              <span class="flex-1 truncate">{{ product.heading || 'Untitled Product' }}</span>

              <!-- Delete product button -->
              <button
                class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                title="Delete product"
                @click="handleDeleteProduct(block.id, product.id, $event)"
              >
                <i class="lni lni-xmark text-xs"></i>
              </button>
            </div>

            <!-- Add product button -->
            <button
              class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              @click.stop="handleAddProduct(block.id)"
            >
              <i class="lni lni-plus text-xs"></i>
              Add product
            </button>
          </div>

          <!-- Form fields list (for form sections) -->
          <div v-if="expandedBlocks.has(block.id) && isFormSection(block) && block.formSettings" class="ml-6 mt-1 space-y-0.5">
            <!-- Form field items -->
            <div
              v-for="(field, fieldIndex) in block.formSettings.fields"
              :key="field.id"
              draggable="true"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-grab transition-colors group"
              :class="[
                editorStore.selectedBlockId === block.id && editorStore.selectedItemId === field.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                draggedFormFieldInfo?.blockId === block.id && draggedFormFieldInfo?.fieldIndex === fieldIndex
                  ? 'opacity-50'
                  : '',
                dragOverFormFieldInfo?.blockId === block.id && dragOverFormFieldInfo?.fieldIndex === fieldIndex
                  ? 'border-t-2 border-primary'
                  : '',
              ]"
              @click="editorStore.selectBlock(block.id, field.id)"
              @dragstart="handleFormFieldDragStart(block.id, fieldIndex, $event)"
              @dragover="handleFormFieldDragOver(block.id, fieldIndex, $event)"
              @dragleave="handleFormFieldDragLeave"
              @drop.stop="handleFormFieldDrop(block.id, fieldIndex)"
              @dragend="handleFormFieldDragEnd"
            >
              <!-- Drag handle -->
              <div class="cursor-grab text-muted-foreground">
                <i class="lni lni-menu-hamburger-1 text-xs"></i>
              </div>

              <!-- Field type icon -->
              <i :class="['lni', formFieldIcons[field.type], 'text-xs text-muted-foreground']"></i>

              <span class="flex-1 truncate">{{ field.label || formFieldLabels[field.type] }}</span>

              <!-- Delete field button -->
              <button
                class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                title="Delete field"
                @click="handleDeleteFormField(block.id, field.id, $event)"
              >
                <i class="lni lni-xmark text-xs"></i>
              </button>
            </div>

            <!-- Add field button with dropdown -->
            <div class="relative">
              <button
                class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                @click.stop="showFormFieldDropdown = showFormFieldDropdown === block.id ? null : block.id"
              >
                <i class="lni lni-plus text-xs"></i>
                Add field
                <i class="lni lni-chevron-down text-[10px] ml-auto"></i>
              </button>
              <!-- Dropdown -->
              <div
                v-if="showFormFieldDropdown === block.id"
                class="absolute left-0 top-full mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-10 py-1 max-h-48 overflow-y-auto"
              >
                <button
                  v-for="fieldType in formFieldTypes"
                  :key="fieldType"
                  class="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                  @click.stop="handleAddFormField(block.id, fieldType)"
                >
                  <i :class="['lni', formFieldIcons[fieldType], 'text-muted-foreground']"></i>
                  {{ formFieldLabels[fieldType] }}
                </button>
              </div>
            </div>
          </div>

          <!-- Header nav links list (for header sections) -->
          <div v-if="expandedBlocks.has(block.id) && isHeaderSection(block) && block.headerSettings" class="ml-6 mt-1 space-y-0.5">
            <!-- Nav link items -->
            <div
              v-for="(link, linkIndex) in block.headerSettings.navLinks"
              :key="link.id"
              draggable="true"
              class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-grab transition-colors group"
              :class="[
                editorStore.selectedBlockId === block.id && editorStore.selectedItemId === link.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                draggedHeaderNavLinkInfo?.blockId === block.id && draggedHeaderNavLinkInfo?.linkIndex === linkIndex
                  ? 'opacity-50'
                  : '',
                dragOverHeaderNavLinkInfo?.blockId === block.id && dragOverHeaderNavLinkInfo?.linkIndex === linkIndex
                  ? 'border-t-2 border-primary'
                  : '',
              ]"
              @click="editorStore.selectBlock(block.id, link.id)"
              @dragstart="handleHeaderNavLinkDragStart(block.id, linkIndex, $event)"
              @dragover="handleHeaderNavLinkDragOver(block.id, linkIndex, $event)"
              @dragleave="handleHeaderNavLinkDragLeave"
              @drop.stop="handleHeaderNavLinkDrop(block.id, linkIndex)"
              @dragend="handleHeaderNavLinkDragEnd"
            >
              <!-- Drag handle -->
              <div class="cursor-grab text-muted-foreground">
                <i class="lni lni-menu-hamburger-1 text-xs"></i>
              </div>

              <!-- Link icon -->
              <i class="lni lni-link-2-angular-right text-xs text-muted-foreground"></i>

              <span class="flex-1 truncate">{{ link.label || 'Nav Link' }}</span>

              <!-- Delete link button -->
              <button
                class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                title="Delete nav link"
                @click="handleDeleteHeaderNavLink(block.id, link.id, $event)"
              >
                <i class="lni lni-xmark text-xs"></i>
              </button>
            </div>

            <!-- Add nav link button -->
            <button
              class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              @click.stop="handleAddHeaderNavLink(block.id)"
            >
              <i class="lni lni-plus text-xs"></i>
              Add nav link
            </button>
          </div>

          <!-- Footer links and social links list (for footer sections) -->
          <div v-if="expandedBlocks.has(block.id) && isFooterSection(block) && block.footerSettings" class="ml-6 mt-1 space-y-2">
            <!-- Footer links section -->
            <div class="space-y-0.5">
              <div class="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">Links</div>
              <div
                v-for="(link, linkIndex) in block.footerSettings.links"
                :key="link.id"
                draggable="true"
                class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-grab transition-colors group"
                :class="[
                  editorStore.selectedBlockId === block.id && editorStore.selectedItemId === link.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  draggedFooterLinkInfo?.blockId === block.id && draggedFooterLinkInfo?.linkIndex === linkIndex
                    ? 'opacity-50'
                    : '',
                  dragOverFooterLinkInfo?.blockId === block.id && dragOverFooterLinkInfo?.linkIndex === linkIndex
                    ? 'border-t-2 border-primary'
                    : '',
                ]"
                @click="editorStore.selectBlock(block.id, link.id)"
                @dragstart="handleFooterLinkDragStart(block.id, linkIndex, $event)"
                @dragover="handleFooterLinkDragOver(block.id, linkIndex, $event)"
                @dragleave="handleFooterLinkDragLeave"
                @drop.stop="handleFooterLinkDrop(block.id, linkIndex)"
                @dragend="handleFooterLinkDragEnd"
              >
                <!-- Drag handle -->
                <div class="cursor-grab text-muted-foreground">
                  <i class="lni lni-menu-hamburger-1 text-xs"></i>
                </div>

                <!-- Link icon -->
                <i class="lni lni-link-2-angular-right text-xs text-muted-foreground"></i>

                <span class="flex-1 truncate">{{ link.label || 'Footer Link' }}</span>

                <!-- Delete link button -->
                <button
                  class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                  title="Delete link"
                  @click="handleDeleteFooterLink(block.id, link.id, $event)"
                >
                  <i class="lni lni-xmark text-xs"></i>
                </button>
              </div>

              <!-- Add footer link button -->
              <button
                class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                @click.stop="handleAddFooterLink(block.id)"
              >
                <i class="lni lni-plus text-xs"></i>
                Add link
              </button>
            </div>

            <!-- Social links section -->
            <div class="space-y-0.5">
              <div class="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">Social</div>
              <div
                v-for="(social, socialIndex) in block.footerSettings.socialLinks"
                :key="social.id"
                draggable="true"
                class="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-grab transition-colors group"
                :class="[
                  editorStore.selectedBlockId === block.id && editorStore.selectedItemId === social.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  draggedFooterSocialInfo?.blockId === block.id && draggedFooterSocialInfo?.linkIndex === socialIndex
                    ? 'opacity-50'
                    : '',
                  dragOverFooterSocialInfo?.blockId === block.id && dragOverFooterSocialInfo?.linkIndex === socialIndex
                    ? 'border-t-2 border-primary'
                    : '',
                ]"
                @click="editorStore.selectBlock(block.id, social.id)"
                @dragstart="handleFooterSocialDragStart(block.id, socialIndex, $event)"
                @dragover="handleFooterSocialDragOver(block.id, socialIndex, $event)"
                @dragleave="handleFooterSocialDragLeave"
                @drop.stop="handleFooterSocialDrop(block.id, socialIndex)"
                @dragend="handleFooterSocialDragEnd"
              >
                <!-- Drag handle -->
                <div class="cursor-grab text-muted-foreground">
                  <i class="lni lni-menu-hamburger-1 text-xs"></i>
                </div>

                <!-- Social icon -->
                <i :class="['lni', socialPlatformIcons[social.platform], 'text-xs text-muted-foreground']"></i>

                <span class="flex-1 truncate">{{ socialPlatformLabels[social.platform] }}</span>

                <!-- Delete social button -->
                <button
                  class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
                  title="Delete social"
                  @click="handleDeleteFooterSocialLink(block.id, social.id, $event)"
                >
                  <i class="lni lni-xmark text-xs"></i>
                </button>
              </div>

              <!-- Add social button with dropdown -->
              <div class="relative">
                <button
                  class="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  @click.stop="showSocialDropdown = showSocialDropdown === block.id ? null : block.id"
                >
                  <i class="lni lni-plus text-xs"></i>
                  Add social
                  <i class="lni lni-chevron-down text-[10px] ml-auto"></i>
                </button>
                <!-- Dropdown -->
                <div
                  v-if="showSocialDropdown === block.id"
                  class="absolute left-0 top-full mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-10 py-1 max-h-48 overflow-y-auto"
                >
                  <button
                    v-for="platform in socialPlatforms"
                    :key="platform"
                    class="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                    @click.stop="handleAddFooterSocialLink(block.id, platform)"
                  >
                    <i :class="['lni', socialPlatformIcons[platform], 'text-muted-foreground']"></i>
                    {{ socialPlatformLabels[platform] }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </template>
  </aside>
</template>
