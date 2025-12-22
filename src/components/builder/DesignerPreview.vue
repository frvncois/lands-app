<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import PreviewSection from '@/components/preview/PreviewSection.vue'
import SelectionOverlay from '@/components/preview/SelectionOverlay.vue'
import { createSectionBlock } from '@/lib/designer-utils'
import type { ListPresetType } from '@/lib/list-presets'
import type { SectionBlockType } from '@/types/designer'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'

const designerStore = useDesignerStore()

// Scroll to selected block when selection changes
watch(
  () => designerStore.selectedBlockId,
  async (blockId) => {
    if (!blockId || !scrollContainerRef.value) return

    // Wait for DOM to update
    await nextTick()

    // Find the block element
    const blockElement = scrollContainerRef.value.querySelector(`[data-block-id="${blockId}"]`)
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }
)

// Ref for the preview container
const previewContainerRef = ref<HTMLElement | null>(null)
// Ref for the scroll container
const scrollContainerRef = ref<HTMLElement | null>(null)

// Custom font loading
const loadedFontStyleElement = ref<HTMLStyleElement | null>(null)

function loadCustomFonts() {
  const customFonts = designerStore.pageSettings.customFonts || []

  // Remove existing style element if any
  if (loadedFontStyleElement.value) {
    loadedFontStyleElement.value.remove()
    loadedFontStyleElement.value = null
  }

  if (customFonts.length === 0) return

  // Create @font-face rules for each custom font
  const fontFaceRules = customFonts.map((font: { name: string; url: string }) => {
    return `@font-face {
      font-family: '${font.name}';
      src: url('${font.url}');
      font-display: swap;
    }`
  }).join('\n')

  // Create and inject style element
  const styleEl = document.createElement('style')
  styleEl.textContent = fontFaceRules
  document.head.appendChild(styleEl)
  loadedFontStyleElement.value = styleEl
}

// Google Fonts loading
const loadedGoogleFontsLink = ref<HTMLLinkElement | null>(null)

function loadGoogleFonts() {
  const googleFonts = designerStore.pageSettings.googleFonts || []

  // Remove existing link element if any
  if (loadedGoogleFontsLink.value) {
    loadedGoogleFontsLink.value.remove()
    loadedGoogleFontsLink.value = null
  }

  if (googleFonts.length === 0) return

  // Build Google Fonts URL with all selected fonts
  const fontFamilies = googleFonts.map((font: { family: string }) => {
    const encoded = encodeURIComponent(font.family)
    return `family=${encoded}:wght@400;500;600;700`
  }).join('&')

  const url = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`

  // Create and inject link element
  const linkEl = document.createElement('link')
  linkEl.rel = 'stylesheet'
  linkEl.href = url
  document.head.appendChild(linkEl)
  loadedGoogleFontsLink.value = linkEl
}

// Watch for custom font changes (compare serialized to avoid deep watch overhead)
const customFontsKey = computed(() =>
  JSON.stringify((designerStore.pageSettings.customFonts || []).map((f: { name: string; url: string }) => `${f.name}:${f.url}`))
)
watch(customFontsKey, () => loadCustomFonts())

// Watch for Google font changes (compare serialized to avoid deep watch overhead)
const googleFontsKey = computed(() =>
  JSON.stringify((designerStore.pageSettings.googleFonts || []).map((f: { family: string }) => f.family))
)
watch(googleFontsKey, () => loadGoogleFonts())

// ESC key to deselect and blur
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    // Blur any focused contenteditable first
    const activeEl = document.activeElement as HTMLElement
    if (activeEl?.getAttribute('contenteditable') === 'true') {
      activeEl.blur()
    }
    // Deselect the block
    designerStore.selectBlock(null)
  }
}

// Load fonts on mount
onMounted(() => {
  loadCustomFonts()
  loadGoogleFonts()
  document.addEventListener('keydown', handleKeyDown)
})

// Cleanup on unmount
onUnmounted(() => {
  if (loadedFontStyleElement.value) {
    loadedFontStyleElement.value.remove()
  }
  if (loadedGoogleFontsLink.value) {
    loadedGoogleFontsLink.value.remove()
  }
  document.removeEventListener('keydown', handleKeyDown)
})

// Context menu for viewport
const viewportContextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const isBlockPickerOpen = ref(false)
const blockPickerInsertIndex = ref<number | null>(null)

// Handle right-click on viewport (not on a block)
function handleViewportContextMenu(event: MouseEvent) {
  // Only handle if clicking directly on the viewport/page container, not on blocks
  const target = event.target as HTMLElement
  const isOnBlock = target.closest('section[class*="cursor-pointer"]')

  if (!isOnBlock) {
    event.preventDefault()
    event.stopPropagation()

    // Calculate insert index based on click position
    const blocks = designerStore.blocks
    let insertIndex = 0

    // If we have blocks, find where the click happened relative to them
    if (blocks.length > 0) {
      const clickY = event.clientY
      const blockElements = document.querySelectorAll('[data-preview-block]')

      for (let i = 0; i < blockElements.length; i++) {
        const el = blockElements[i]
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (clickY < rect.top + rect.height / 2) {
          insertIndex = i
          break
        }
        insertIndex = i + 1
      }

      // Clamp to valid range
      insertIndex = Math.max(0, Math.min(insertIndex, blocks.length))
    }

    blockPickerInsertIndex.value = insertIndex
    viewportContextMenuRef.value?.open(event)
  }
}

function handleAddContent() {
  isBlockPickerOpen.value = true
}

function handleBlockPickerSelectBlock(type: string) {
  const block = designerStore.addBlock(type as SectionBlockType, blockPickerInsertIndex.value ?? undefined)
  if (block) {
    designerStore.selectBlock(block.id)
  }
  blockPickerInsertIndex.value = null
}

function handleBlockPickerSelectListPreset(type: ListPresetType) {
  const block = designerStore.addListPreset(type, blockPickerInsertIndex.value ?? undefined)
  if (block) {
    designerStore.selectBlock(block.id)
  }
  blockPickerInsertIndex.value = null
}

// Expose the preview container for thumbnail generation
defineExpose({
  getPreviewElement: () => previewContainerRef.value,
})

// Drop zone state
const isDragOver = ref(false)
const dropTargetIndex = ref<number | null>(null)

// Page styles from settings
const pageStyles = computed(() => {
  const settings = designerStore.pageSettings
  const styles: Record<string, string> = {}

  // Max width
  if (settings.maxWidth && settings.maxWidth !== 'none') {
    styles.maxWidth = `${settings.maxWidth}px`
  }

  // Background color
  if (settings.backgroundColor) {
    styles.backgroundColor = settings.backgroundColor
  }

  // Background image
  if (settings.backgroundImage) {
    styles.backgroundImage = `url(${settings.backgroundImage})`
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
  }

  // Text color
  if (settings.textColor) {
    styles.color = settings.textColor
  }

  // Font family
  if (settings.fontFamily) {
    styles.fontFamily = settings.fontFamily
  }

  // Base font size
  if (settings.baseFontSize) {
    styles.fontSize = `${settings.baseFontSize}px`
  }

  // Page container has NO padding/margin - blocks handle their own spacing
  return styles
})

// Page classes (kept for potential future use)
const pageClasses = computed(() => {
  return ''
})

function handlePreviewClick(event: MouseEvent) {
  // Deselect if clicking on empty preview area (not on a block)
  const target = event.target as HTMLElement
  const isOnBlock = target.closest('[data-preview-block]')
  if (!isOnBlock) {
    designerStore.selectBlock(null)
    // Also blur any focused contenteditable
    const activeEl = document.activeElement as HTMLElement
    if (activeEl?.getAttribute('contenteditable') === 'true') {
      activeEl.blur()
    }
  }
}

// Drag and drop handlers for new sections
let dragEnterCounter = 0

// Check if the drag event contains a valid block type (for new blocks)
function isValidNewBlockDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-section-type') || false
}

// Check if the drag event contains a list preset type
function isListPresetDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-list-preset-type') || false
}

// Check if drag event contains block move data
function isBlockMoveDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-block-move') || false
}

// Check if any valid drag type
function isValidDragType(event: DragEvent): boolean {
  return isValidNewBlockDragType(event) || isListPresetDragType(event) || isBlockMoveDragType(event)
}

function handleDragEnter(event: DragEvent) {
  if (isValidDragType(event)) {
    dragEnterCounter++
    isDragOver.value = true
  }
}

function handleDragOver(event: DragEvent) {
  if (isValidDragType(event)) {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = isBlockMoveDragType(event) ? 'move' : 'copy'
    }
  }
}

function handleDragLeave() {
  dragEnterCounter--
  if (dragEnterCounter === 0) {
    isDragOver.value = false
    dropTargetIndex.value = null
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragEnterCounter = 0
  isDragOver.value = false
  const index = dropTargetIndex.value
  dropTargetIndex.value = null

  // Check for block move first (moving existing block to root level)
  const blockIdToMove = event.dataTransfer?.getData('application/x-block-move')
  if (blockIdToMove) {
    // Find current parent
    const currentParent = designerStore.findParentBlock(blockIdToMove)
    if (currentParent) {
      // Moving from a parent to root level - use moveBlockToRoot
      designerStore.moveBlockToRoot(blockIdToMove, index !== null ? index : undefined)
      designerStore.selectBlock(blockIdToMove)
    }
    // If already at root, the reorder happens via section drag handlers
    return
  }

  // Check for list preset type
  const listPresetType = event.dataTransfer?.getData('application/x-list-preset-type') as ListPresetType
  if (listPresetType) {
    const block = designerStore.addListPreset(listPresetType, index !== null ? index : undefined)
    if (block) {
      designerStore.selectBlock(block.id)
    }
    return
  }

  // Check for section type
  const sectionType = event.dataTransfer?.getData('application/x-section-type') as SectionBlockType
  if (sectionType) {
    const block = designerStore.addBlock(sectionType, index !== null ? index : undefined)
    if (block) {
      designerStore.selectBlock(block.id)
    }
  }
}

// Drop zone handlers for inserting between sections
function handleSectionDragEnter(index: number, event: DragEvent) {
  if (isValidDragType(event)) {
    const blocks = designerStore.blocks

    // Determine if we're in the top or bottom half of the section
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    let targetIndex = event.clientY < midY ? index : index + 1

    // Clamp to valid range
    targetIndex = Math.max(0, Math.min(targetIndex, blocks.length))
    dropTargetIndex.value = targetIndex
  }
}

function handleDropZoneDragOver(event: DragEvent) {
  if (isValidDragType(event)) {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = isBlockMoveDragType(event) ? 'move' : 'copy'
    }
  }
}

function handleSectionDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  dragEnterCounter = 0
  isDragOver.value = false
  const index = dropTargetIndex.value
  dropTargetIndex.value = null

  // Check for block move first (reordering or moving to root)
  const blockIdToMove = event.dataTransfer?.getData('application/x-block-move')
  if (blockIdToMove && index !== null) {
    const currentParent = designerStore.findParentBlock(blockIdToMove)
    if (currentParent) {
      // Moving from a parent to root level
      designerStore.moveBlockToRoot(blockIdToMove, index)
    } else {
      // Already at root - reorder
      const currentIndex = designerStore.blocks.findIndex((b: { id: string }) => b.id === blockIdToMove)
      if (currentIndex !== -1 && currentIndex !== index) {
        // Adjust target index if moving down (since we remove first)
        const targetIndex = currentIndex < index ? index - 1 : index
        designerStore.reorderBlocks(currentIndex, targetIndex)
      }
    }
    designerStore.selectBlock(blockIdToMove)
    return
  }

  // Check for list preset type
  const listPresetType = event.dataTransfer?.getData('application/x-list-preset-type') as ListPresetType
  if (listPresetType && index !== null) {
    const block = designerStore.addListPreset(listPresetType, index)
    if (block) {
      designerStore.selectBlock(block.id)
    }
    return
  }

  // Check for section type
  const sectionType = event.dataTransfer?.getData('application/x-section-type') as SectionBlockType
  if (sectionType && index !== null) {
    const block = designerStore.addBlock(sectionType, index)
    if (block) {
      designerStore.selectBlock(block.id)
    }
  }
}
</script>

<template>
  <!-- clip-path creates containing block for fixed elements without breaking scroll -->
  <div class="flex-1 flex flex-col h-full overflow-hidden" style="clip-path: inset(0);">
    <!-- Preview area wrapper (relative for overlay positioning) -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Scroll container -->
      <div
        ref="scrollContainerRef"
        class="absolute inset-0 overflow-auto transition-colors [&>*]:min-h-full"
        :class="isDragOver ? 'bg-primary/5' : ''"
        @click="handlePreviewClick"
        @dragenter="handleDragEnter"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
      <!-- Viewport container -->
      <div
        class="h-full mx-auto transition-all duration-300"
        :style="{ maxWidth: designerStore.viewportWidth, '--designer-vh': 'calc((100vh - 3.5rem) / 100)' }"
        @click.self="designerStore.selectBlock(null)"
        @contextmenu="handleViewportContextMenu"
      >
        <!-- Page container with settings applied -->
        <div
          ref="previewContainerRef"
          class="lands-preview designer-preview-container bg-background min-h-full transition-all duration-300"
          :class="pageClasses"
          :style="pageStyles"
          @click.self="designerStore.selectBlock(null)"
        >
          <!-- Empty state -->
          <div
            v-if="designerStore.blocks.length === 0"
            class="flex flex-col items-center justify-center h-96 text-center px-4"
          >
            <div class="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p class="text-sm text-muted-foreground">Preview will appear here</p>
            <p class="text-xs text-muted-foreground mt-1">Add sections to see your page come to life</p>
          </div>

          <!-- Section blocks -->
          <div v-else>
            <template v-for="(block, index) in designerStore.blocks" :key="block.id">
              <PreviewSection
                :block="block"
                :index="index"
                :total="designerStore.blocks.length"
                @dragenter="handleSectionDragEnter(index, $event)"
                @dragover="handleDropZoneDragOver"
                @drop="handleSectionDrop"
              />
            </template>
          </div>
        </div>
      </div>
      </div>

      <!-- Selection Overlay (rendered outside content flow to avoid overflow:hidden clipping) -->
      <SelectionOverlay :scroll-container="scrollContainerRef" />
    </div>

    <!-- Viewport Context Menu -->
    <ContextMenu ref="viewportContextMenuRef">
      <ContextMenuItem icon="lni-plus" @click="handleAddContent">
        Add content
      </ContextMenuItem>
    </ContextMenu>

    <!-- Block Picker -->
    <SidebarBlockPicker
      v-model:open="isBlockPickerOpen"
      hide-trigger
      @select="handleBlockPickerSelectBlock"
      @select-list-preset="handleBlockPickerSelectListPreset"
    />
  </div>
</template>
