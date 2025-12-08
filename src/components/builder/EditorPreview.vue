<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEditorStore } from '@/stores/editor'
import PreviewSection from '@/components/preview/PreviewSection.vue'
import { createPresetBlock, type PresetType } from '@/lib/editor-utils'
import type { SectionBlockType } from '@/types/editor'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import BlockPicker from '@/components/builder/BlockPicker.vue'

const editorStore = useEditorStore()

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
    const blocks = editorStore.blocks
    const hasHeader = blocks[0]?.type === 'header'
    const footerIndex = blocks.findIndex(b => b.type === 'footer')

    // Default to after header (or start if no header)
    let insertIndex = hasHeader ? 1 : 0

    // If we have blocks, find where the click happened relative to them
    if (blocks.length > 0) {
      const clickY = event.clientY
      const blockElements = document.querySelectorAll('[data-preview-block]')

      for (let i = 0; i < blockElements.length; i++) {
        const rect = blockElements[i].getBoundingClientRect()
        if (clickY < rect.top + rect.height / 2) {
          insertIndex = i
          break
        }
        insertIndex = i + 1
      }

      // Clamp to valid range (after header, before footer)
      const minIndex = hasHeader ? 1 : 0
      const maxIndex = footerIndex !== -1 ? footerIndex : blocks.length
      insertIndex = Math.max(minIndex, Math.min(insertIndex, maxIndex))
    }

    blockPickerInsertIndex.value = insertIndex
    viewportContextMenuRef.value?.open(event)
  }
}

function handleAddContent() {
  isBlockPickerOpen.value = true
}

function handleBlockPickerSelectBlock(type: SectionBlockType) {
  const block = editorStore.addBlock(type, blockPickerInsertIndex.value ?? undefined)
  if (block) {
    editorStore.selectBlock(block.id)
  }
  blockPickerInsertIndex.value = null
}

function handleBlockPickerSelectPreset(type: PresetType) {
  const block = createPresetBlock(type)
  editorStore.addPresetBlock(block, blockPickerInsertIndex.value ?? undefined)
  editorStore.selectBlock(block.id)
  blockPickerInsertIndex.value = null
}

// Drop zone state
const isDragOver = ref(false)
const dropTargetIndex = ref<number | null>(null)

// Page styles from settings
const pageStyles = computed(() => {
  const settings = editorStore.pageSettings
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

  // Padding
  if (settings.padding) {
    if (settings.padding.y && settings.padding.y !== '0') {
      styles.paddingTop = `${settings.padding.y}px`
      styles.paddingBottom = `${settings.padding.y}px`
    }
    if (settings.padding.x && settings.padding.x !== '0') {
      styles.paddingLeft = `${settings.padding.x}px`
      styles.paddingRight = `${settings.padding.x}px`
    }
  }

  return styles
})

// Page classes for font family
const pageClasses = computed(() => {
  const settings = editorStore.pageSettings
  const classes: string[] = []

  if (settings.fontFamily) {
    switch (settings.fontFamily) {
      case 'sans':
        classes.push('font-sans')
        break
      case 'serif':
        classes.push('font-serif')
        break
      case 'mono':
        classes.push('font-mono')
        break
    }
  }

  return classes.join(' ')
})

function handlePreviewClick(event: MouseEvent) {
  // Deselect if clicking on empty preview area
  if (event.target === event.currentTarget) {
    editorStore.selectBlock(null)
  }
}

// Drag and drop handlers for new sections
let dragEnterCounter = 0

// Check if the drag event contains a valid block or preset type (for new blocks)
function isValidNewBlockDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-section-type') ||
         event.dataTransfer?.types.includes('application/x-preset-type') || false
}

// Check if drag event contains block move data
function isBlockMoveDragType(event: DragEvent): boolean {
  return event.dataTransfer?.types.includes('application/x-block-move') || false
}

// Check if any valid drag type
function isValidDragType(event: DragEvent): boolean {
  return isValidNewBlockDragType(event) || isBlockMoveDragType(event)
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
    const currentParent = editorStore.findParentBlock(blockIdToMove)
    if (currentParent) {
      // Moving from a parent to root level - use moveBlockToRoot
      editorStore.moveBlockToRoot(blockIdToMove, index !== null ? index : undefined)
      editorStore.selectBlock(blockIdToMove)
    }
    // If already at root, the reorder happens via section drag handlers
    return
  }

  // Check for preset type
  const presetType = event.dataTransfer?.getData('application/x-preset-type') as PresetType
  if (presetType) {
    const block = createPresetBlock(presetType)
    editorStore.addPresetBlock(block, index !== null ? index : undefined)
    editorStore.selectBlock(block.id)
    return
  }

  // Otherwise check for section type
  const sectionType = event.dataTransfer?.getData('application/x-section-type') as SectionBlockType
  if (sectionType) {
    const block = editorStore.addBlock(sectionType, index !== null ? index : undefined)
    if (block) {
      editorStore.selectBlock(block.id)
    }
  }
}

// Drop zone handlers for inserting between sections
function handleSectionDragEnter(index: number, event: DragEvent) {
  if (isValidDragType(event)) {
    const blocks = editorStore.blocks

    // Don't allow dropping before header (index 0 if header exists)
    const hasHeader = blocks[0]?.type === 'header'
    const minIndex = hasHeader ? 1 : 0

    // Don't allow dropping after footer
    const footerIndex = blocks.findIndex(b => b.type === 'footer')
    const maxIndex = footerIndex !== -1 ? footerIndex : blocks.length

    // Determine if we're in the top or bottom half of the section
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    let targetIndex = event.clientY < midY ? index : index + 1

    // Clamp to valid range
    targetIndex = Math.max(minIndex, Math.min(targetIndex, maxIndex))
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
    const currentParent = editorStore.findParentBlock(blockIdToMove)
    if (currentParent) {
      // Moving from a parent to root level
      editorStore.moveBlockToRoot(blockIdToMove, index)
    } else {
      // Already at root - reorder
      const currentIndex = editorStore.blocks.findIndex(b => b.id === blockIdToMove)
      if (currentIndex !== -1 && currentIndex !== index) {
        // Adjust target index if moving down (since we remove first)
        const targetIndex = currentIndex < index ? index - 1 : index
        editorStore.reorderBlocks(currentIndex, targetIndex)
      }
    }
    editorStore.selectBlock(blockIdToMove)
    return
  }

  // Check for preset type
  const presetType = event.dataTransfer?.getData('application/x-preset-type') as PresetType
  if (presetType && index !== null) {
    const block = createPresetBlock(presetType)
    editorStore.addPresetBlock(block, index)
    editorStore.selectBlock(block.id)
    return
  }

  // Otherwise check for section type
  const sectionType = event.dataTransfer?.getData('application/x-section-type') as SectionBlockType
  if (sectionType && index !== null) {
    const block = editorStore.addBlock(sectionType, index)
    if (block) {
      editorStore.selectBlock(block.id)
    }
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Preview area -->
    <div
      class="flex-1 overflow-auto transition-colors [&>*]:min-h-full"
      :class="isDragOver ? 'bg-primary/5' : ''"
      @click="handlePreviewClick"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Viewport container -->
      <div
        class="mx-auto h-full transition-all duration-300"
        :style="{ maxWidth: editorStore.viewportWidth }"
        @click.self="editorStore.selectBlock(null)"
        @contextmenu="handleViewportContextMenu"
      >
        <!-- Page container with settings applied -->
        <div
          class="mx-auto bg-background h-full transition-all duration-300"
          :class="pageClasses"
          :style="pageStyles"
          @click.self="editorStore.selectBlock(null)"
        >
          <!-- Empty state -->
          <div
            v-if="editorStore.blocks.length === 0"
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
            <template v-for="(block, index) in editorStore.blocks" :key="block.id">
              <div class="relative">
                <!-- Drop indicator line (positioned absolutely, no layout impact) -->
                <div
                  v-if="isDragOver && dropTargetIndex === index"
                  class="absolute top-0 left-0 right-0 h-1 bg-primary rounded-full z-10"
                />

                <PreviewSection
                  :block="block"
                  :index="index"
                  :total="editorStore.blocks.length"
                  @dragenter="handleSectionDragEnter(index, $event)"
                  @dragover="handleDropZoneDragOver"
                  @drop="handleSectionDrop"
                />

                <!-- Drop indicator after last section -->
                <div
                  v-if="isDragOver && dropTargetIndex === index + 1 && index === editorStore.blocks.length - 1"
                  class="absolute -bottom-4 left-0 right-0 h-1 bg-primary rounded-full z-10"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Viewport Context Menu -->
    <ContextMenu ref="viewportContextMenuRef">
      <ContextMenuItem icon="lni-plus" @click="handleAddContent">
        Add content
      </ContextMenuItem>
    </ContextMenu>

    <!-- Block Picker -->
    <BlockPicker
      v-model:open="isBlockPickerOpen"
      @select-block="handleBlockPickerSelectBlock"
      @select-preset="handleBlockPickerSelectPreset"
    />
  </div>
</template>
