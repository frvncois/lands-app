<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useDesignerStore } from '@/stores/designer'
import { useAIAssistant } from '@/composables/useAIAssistant'
import { canHaveChildren } from '@/lib/designer-utils'
import { isListContainer } from '@/lib/list-presets'
import type { SectionBlockType, ImageSettings, ContainerSettings } from '@/types/designer'
import type { ListPresetType } from '@/lib/list-presets'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import ContextMenuDivider from '@/components/ui/ContextMenuDivider.vue'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'
import { Icon, Tooltip, Popover } from '@/components/ui'
import ProjectUpload from '@/components/modal/ProjectUpload.vue'
import ProjectUnsplash from '@/components/modal/ProjectUnsplash.vue'
import { READONLY_MODE_KEY, CONTENT_PREVIEW_MODE_KEY } from './injection-keys'

const props = defineProps<{
  scrollContainer: HTMLElement | null
}>()

const designerStore = useDesignerStore()
const { isOpen: isAIOpen } = useAIAssistant()
const route = useRoute()

// Check if we're in readonly mode (content preview) - no context menu in readonly mode
const isReadonlyMode = inject(READONLY_MODE_KEY, false)
// Check if we're in content preview mode - show content edit controls
const isContentPreviewMode = inject(CONTENT_PREVIEW_MODE_KEY, false)

const projectId = computed(() => route.params.projectId as string)

// Rect state for selected and hovered blocks
const selectedRect = ref<DOMRect | null>(null)
const hoveredRect = ref<DOMRect | null>(null)
const selectedLabelBelow = ref(false)
const hoveredLabelBelow = ref(false)

// Dragging state
const isDragging = ref(false)

// Get block info
const selectedBlock = computed(() => designerStore.selectedBlock)
const hoveredBlockId = computed(() => designerStore.hoveredBlockId)
const hoveredBlock = computed(() => {
  if (!hoveredBlockId.value) return null
  return designerStore.findBlockById(hoveredBlockId.value)
})

// In content preview mode, only show hover for editable content blocks
const contentEditableTypes = ['text', 'heading', 'image', 'button']
const showHoverState = computed(() => {
  if (!hoveredBlock.value) return false
  // In content preview mode, only show hover for specific block types
  if (isContentPreviewMode) {
    return contentEditableTypes.includes(hoveredBlock.value.type)
  }
  // In designer mode, show hover for all blocks
  return true
})

// Check if AI glow should show
const showAIGlow = computed(() => isAIOpen.value && selectedBlock.value)

// Check if block can be dragged (simplified - not inside canvas and not protected)
const canDragLabel = computed(() => {
  if (!selectedBlock.value) return false
  // Could add more checks here if needed
  return true
})

// Update rect for a block
function updateBlockRect(blockId: string | null): DOMRect | null {
  if (!blockId || !props.scrollContainer) return null

  const blockElement = props.scrollContainer.querySelector(`[data-block-id="${blockId}"]`)
  if (!blockElement) return null

  const blockRect = blockElement.getBoundingClientRect()
  const containerRect = props.scrollContainer.getBoundingClientRect()

  // Calculate position relative to scroll container viewport (visible area)
  return new DOMRect(
    blockRect.left - containerRect.left,
    blockRect.top - containerRect.top,
    blockRect.width,
    blockRect.height
  )
}

// Check if label should show below (near top of viewport)
function shouldLabelShowBelow(rect: DOMRect | null): boolean {
  if (!rect) return false

  // Check if there's enough space above for the label (28px for label + margin)
  // rect.top is already relative to the container viewport
  return rect.top < 28
}

// Update all rects
function updateRects() {
  if (designerStore.selectedBlockId) {
    selectedRect.value = updateBlockRect(designerStore.selectedBlockId)
    selectedLabelBelow.value = shouldLabelShowBelow(selectedRect.value)
  } else {
    selectedRect.value = null
  }

  if (hoveredBlockId.value && hoveredBlockId.value !== designerStore.selectedBlockId) {
    hoveredRect.value = updateBlockRect(hoveredBlockId.value)
    hoveredLabelBelow.value = shouldLabelShowBelow(hoveredRect.value)
  } else {
    hoveredRect.value = null
  }
}

// Drag handlers
function handleLabelDragStart(event: DragEvent) {
  if (!selectedBlock.value || !canDragLabel.value) return

  isDragging.value = true

  // Set drag data
  event.dataTransfer?.setData('application/x-block-move', selectedBlock.value.id)
  event.dataTransfer?.setData('text/plain', selectedBlock.value.name)

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function handleLabelDragEnd() {
  isDragging.value = false
}

// Watch for selection/hover changes
watch(
  () => [designerStore.selectedBlockId, hoveredBlockId.value],
  () => {
    requestAnimationFrame(updateRects)
  },
  { immediate: true }
)

// Watch for block changes that might affect rect (like style changes)
watch(
  () => designerStore.blocks,
  () => {
    requestAnimationFrame(updateRects)
  },
  { deep: true }
)

// Scroll handler
function handleScroll() {
  requestAnimationFrame(updateRects)
}

// Resize observer for container size changes
let resizeObserver: ResizeObserver | null = null

// Mutation observer for DOM changes
let mutationObserver: MutationObserver | null = null

onMounted(() => {
  if (props.scrollContainer) {
    props.scrollContainer.addEventListener('scroll', handleScroll, { passive: true })

    // Watch for resize
    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateRects)
    })
    resizeObserver.observe(props.scrollContainer)

    // Watch for DOM mutations (block content changes)
    mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(updateRects)
    })
    mutationObserver.observe(props.scrollContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })
  }

  // Initial update
  updateRects()
})

onUnmounted(() => {
  if (props.scrollContainer) {
    props.scrollContainer.removeEventListener('scroll', handleScroll)
  }
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
})

// Watch for container ref changes
watch(
  () => props.scrollContainer,
  (newContainer, oldContainer) => {
    if (oldContainer) {
      oldContainer.removeEventListener('scroll', handleScroll)
    }
    if (newContainer) {
      newContainer.addEventListener('scroll', handleScroll, { passive: true })
      updateRects()
    }
  }
)

// Computed styles for outlines
const selectedOutlineStyle = computed(() => {
  if (!selectedRect.value) return {}
  return {
    left: `${selectedRect.value.left}px`,
    top: `${selectedRect.value.top}px`,
    width: `${selectedRect.value.width}px`,
    height: `${selectedRect.value.height}px`,
  }
})

const hoveredOutlineStyle = computed(() => {
  if (!hoveredRect.value) return {}
  return {
    left: `${hoveredRect.value.left}px`,
    top: `${hoveredRect.value.top}px`,
    width: `${hoveredRect.value.width}px`,
    height: `${hoveredRect.value.height}px`,
  }
})

const selectedLabelStyle = computed(() => {
  if (!selectedRect.value) return {}
  return {
    left: `${selectedRect.value.left}px`,
    top: selectedLabelBelow.value
      ? `${selectedRect.value.top + selectedRect.value.height}px`
      : `${selectedRect.value.top}px`,
    transform: selectedLabelBelow.value ? 'translateY(0)' : 'translateY(-100%)',
  }
})

const hoveredLabelStyle = computed(() => {
  if (!hoveredRect.value) return {}
  return {
    left: `${hoveredRect.value.left}px`,
    top: hoveredLabelBelow.value
      ? `${hoveredRect.value.top + hoveredRect.value.height}px`
      : `${hoveredRect.value.top}px`,
    transform: hoveredLabelBelow.value ? 'translateY(0)' : 'translateY(-100%)',
  }
})

// ============================================
// CONTENT EDIT CONTROLS (Content Preview Mode)
// ============================================
const showUploadModal = ref(false)
const showUnsplashModal = ref(false)
const imagePopoverOpen = ref(false)

// Check if selected block is an image block
const isImageBlock = computed(() => selectedBlock.value?.type === 'image')

// Check if selected block has a background image
const hasBackgroundImage = computed(() => {
  if (!selectedBlock.value) return false
  if (!['container', 'stack', 'grid'].includes(selectedBlock.value.type)) return false
  const settings = selectedBlock.value.settings as ContainerSettings
  return settings?.backgroundType === 'image' && !!settings?.backgroundImage
})

// Should show image edit controls
const showImageControls = computed(() => isContentPreviewMode && (isImageBlock.value || hasBackgroundImage.value))

// Get current image URL
const currentImageUrl = computed(() => {
  if (!selectedBlock.value) return ''
  if (isImageBlock.value) {
    return (selectedBlock.value.settings as ImageSettings)?.src || ''
  }
  if (hasBackgroundImage.value) {
    return (selectedBlock.value.settings as ContainerSettings)?.backgroundImage || ''
  }
  return ''
})

// Check if selected block is inside a list container
const parentOfSelected = computed(() => {
  if (!selectedBlock.value) return null
  return designerStore.findParentBlock(selectedBlock.value.id)
})

const isInsideListContainer = computed(() => {
  if (!parentOfSelected.value) return false
  return isListContainer(parentOfSelected.value)
})

// Show list controls in content preview mode
const showListControls = computed(() => isContentPreviewMode && isInsideListContainer.value)

// Get sibling count for delete check
const siblingCount = computed(() => {
  if (!parentOfSelected.value?.children) return 0
  return parentOfSelected.value.children.length
})

const canDeleteListItem = computed(() => siblingCount.value > 1)

// Content edit control position (top-right of selected block)
const contentEditStyle = computed(() => {
  if (!selectedRect.value) return {}
  return {
    left: `${selectedRect.value.left + selectedRect.value.width - 8}px`,
    top: `${selectedRect.value.top + 8}px`,
    transform: 'translateX(-100%)',
  }
})

function handleUploadImage() {
  imagePopoverOpen.value = false
  showUploadModal.value = true
}

function handleFindImage() {
  imagePopoverOpen.value = false
  showUnsplashModal.value = true
}

function handleImageChange(url: string) {
  if (!selectedBlock.value) return
  if (isImageBlock.value) {
    designerStore.updateBlockSettings(selectedBlock.value.id, { src: url })
  } else if (hasBackgroundImage.value) {
    designerStore.updateBlockSettings(selectedBlock.value.id, { backgroundImage: url })
  }
}

function handleRemoveImage() {
  if (!selectedBlock.value) return
  imagePopoverOpen.value = false

  if (isImageBlock.value) {
    designerStore.updateBlockSettings(selectedBlock.value.id, { src: '' })
  } else if (hasBackgroundImage.value) {
    designerStore.updateBlockSettings(selectedBlock.value.id, {
      backgroundType: 'color',
      backgroundImage: ''
    })
  }
}

function handleAddListItemFromParent() {
  if (!parentOfSelected.value) return
  const newItem = designerStore.addListItem(parentOfSelected.value.id)
  if (newItem) {
    designerStore.selectBlock(newItem.id)
  }
}

function handleDeleteListItem() {
  if (!selectedBlock.value || !canDeleteListItem.value) return
  designerStore.deleteBlock(selectedBlock.value.id)
}

// ============================================
// CONTEXT MENU
// ============================================
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const isBlockPickerOpen = ref(false)

// Block type checks
const isLayoutBlock = computed(() => selectedBlock.value ? canHaveChildren(selectedBlock.value.type) : false)
const isListContainerBlock = computed(() => selectedBlock.value ? isListContainer(selectedBlock.value) : false)
const isStack = computed(() => selectedBlock.value?.type === 'stack')
const isButton = computed(() => selectedBlock.value?.type === 'button')
const isGrid = computed(() => selectedBlock.value?.type === 'grid')
const isText = computed(() => selectedBlock.value?.type === 'text')
const isHeading = computed(() => selectedBlock.value?.type === 'heading')

// Check if block can be wrapped in a link
const canWrapInLink = computed(() => {
  if (!selectedBlock.value) return false
  return ['text', 'heading', 'image'].includes(selectedBlock.value.type)
})

// Check if block is inside a Canvas
const isInsideCanvas = computed(() => {
  if (!selectedBlock.value) return false
  const parent = designerStore.findParentBlock(selectedBlock.value.id)
  return parent?.type === 'canvas'
})

// Context menu handler
function handleLabelContextMenu(event: MouseEvent) {
  if (isReadonlyMode) return
  event.preventDefault()
  event.stopPropagation()
  contextMenuRef.value?.open(event)
}

// Context menu actions
function handleEditStyle() {
  if (!selectedBlock.value) return
  if (designerStore.isInspectorCollapsed) {
    designerStore.toggleInspector()
  }
}

function handleCopyStyle() {
  if (!selectedBlock.value) return
  designerStore.copyBlockStyles(selectedBlock.value.id)
}

function handlePasteStyle() {
  if (!selectedBlock.value) return
  designerStore.pasteBlockStyles(selectedBlock.value.id)
}

function handleCut() {
  if (!selectedBlock.value) return
  designerStore.cutBlock(selectedBlock.value.id)
}

function handleCopy() {
  if (!selectedBlock.value) return
  designerStore.copyBlock(selectedBlock.value.id)
}

function handlePaste() {
  if (!selectedBlock.value) return
  if (canHaveChildren(selectedBlock.value.type)) {
    designerStore.pasteBlock(selectedBlock.value.id)
  } else {
    designerStore.pasteBlock()
  }
}

function handleDuplicate() {
  if (!selectedBlock.value) return
  designerStore.duplicateBlock(selectedBlock.value.id)
}

function handleWrapInStack() {
  if (!selectedBlock.value) return
  designerStore.wrapBlockInStack(selectedBlock.value.id)
}

function handleWrapInLink() {
  if (!selectedBlock.value) return
  designerStore.wrapBlockInButton(selectedBlock.value.id)
}

function handleConvertToButton() {
  if (!selectedBlock.value) return
  designerStore.convertBlockType(selectedBlock.value.id, 'button')
}

function handleConvertToStack() {
  if (!selectedBlock.value) return
  designerStore.convertBlockType(selectedBlock.value.id, 'stack')
}

function handleConvertToGrid() {
  if (!selectedBlock.value) return
  designerStore.convertBlockType(selectedBlock.value.id, 'grid')
}

function handleConvertToHeading() {
  if (!selectedBlock.value) return
  designerStore.convertBlockType(selectedBlock.value.id, 'heading')
}

function handleConvertToText() {
  if (!selectedBlock.value) return
  designerStore.convertBlockType(selectedBlock.value.id, 'text')
}

function handleCreateComponent() {
  if (!selectedBlock.value) return
  designerStore.createComponent(selectedBlock.value.id)
}

function handleDelete() {
  if (!selectedBlock.value) return
  designerStore.deleteBlock(selectedBlock.value.id)
}

function openBlockPicker() {
  isBlockPickerOpen.value = true
}

function handleBlockPickerSelectBlock(type: string) {
  if (!selectedBlock.value) return
  const block = designerStore.addBlock(type as SectionBlockType, undefined, selectedBlock.value.id)
  if (block) {
    designerStore.selectBlock(block.id)
  }
}

function handleBlockPickerSelectListPreset(type: ListPresetType) {
  if (!selectedBlock.value) return
  const block = designerStore.addListPreset(type, undefined, selectedBlock.value.id)
  if (block) {
    designerStore.selectBlock(block.id)
  }
}

function handleAddListItem() {
  if (!selectedBlock.value) return
  const newItem = designerStore.addListItem(selectedBlock.value.id)
  if (newItem) {
    designerStore.selectBlock(newItem.id)
  }
}

// Z-index handlers for Canvas children
function handleBringToFront() {
  if (!selectedBlock.value || !isInsideCanvas.value) return
  const parent = designerStore.findParentBlock(selectedBlock.value.id)
  if (!parent || parent.type !== 'canvas') return

  const settings = parent.settings as { childPositions: Record<string, Record<string, { x: number; y: number; zIndex?: number }>> }
  const viewport = designerStore.viewport
  const viewportKey = viewport === 'desktop' ? 'desktop' : viewport === 'tablet' ? 'tablet' : 'mobile'

  const positions = settings.childPositions[viewportKey] || settings.childPositions.desktop || {}
  let maxZ = 0
  for (const pos of Object.values(positions)) {
    if (pos.zIndex !== undefined && pos.zIndex > maxZ) maxZ = pos.zIndex
  }

  const currentPos = positions[selectedBlock.value.id] || { x: 10, y: 10 }
  designerStore.updateCanvasChildPosition(parent.id, selectedBlock.value.id, {
    ...currentPos,
    zIndex: maxZ + 1,
  })
}

function handleSendToBack() {
  if (!selectedBlock.value || !isInsideCanvas.value) return
  const parent = designerStore.findParentBlock(selectedBlock.value.id)
  if (!parent || parent.type !== 'canvas') return

  const settings = parent.settings as { childPositions: Record<string, Record<string, { x: number; y: number; zIndex?: number }>> }
  const viewport = designerStore.viewport
  const viewportKey = viewport === 'desktop' ? 'desktop' : viewport === 'tablet' ? 'tablet' : 'mobile'

  const positions = settings.childPositions[viewportKey] || settings.childPositions.desktop || {}
  let minZ = 0
  for (const pos of Object.values(positions)) {
    if (pos.zIndex !== undefined && pos.zIndex < minZ) minZ = pos.zIndex
  }

  const currentPos = positions[selectedBlock.value.id] || { x: 10, y: 10 }
  designerStore.updateCanvasChildPosition(parent.id, selectedBlock.value.id, {
    ...currentPos,
    zIndex: minZ - 1,
  })
}
</script>

<template>
  <div class="absolute inset-0 pointer-events-none" style="z-index: 50;">
    <!-- Hover outline -->
    <div
      v-if="hoveredRect && !selectedRect && showHoverState"
      class="absolute border border-primary/40 pointer-events-none"
      :style="hoveredOutlineStyle"
    />

    <!-- Hover label -->
    <div
      v-if="hoveredRect && hoveredBlock && !selectedRect && showHoverState"
      class="absolute flex border items-center px-1.5 h-5 text-[10px] font-mono uppercase backdrop-blur-xs whitespace-nowrap bg-indigo-600/50 border-indigo-500/10 text-blue-100 pointer-events-none"
      :class="hoveredLabelBelow ? 'rounded-b' : 'rounded-t'"
      :style="hoveredLabelStyle"
    >
      {{ hoveredBlock.name }}
    </div>

    <!-- Selection outline -->
    <div
      v-if="selectedRect && !showAIGlow"
      class="absolute border border-border-outline pointer-events-none"
      :style="selectedOutlineStyle"
    />

    <!-- AI glow outline -->
    <div
      v-if="selectedRect && showAIGlow"
      class="absolute border-2 border-violet-500 pointer-events-none rounded-sm shadow-[0_0_12px_rgba(139,92,246,0.5),inset_0_0_12px_rgba(139,92,246,0.1)]"
      :style="selectedOutlineStyle"
    />

    <!-- Selection label -->
    <div
      v-if="selectedRect && selectedBlock"
      :draggable="canDragLabel"
      data-block-label
      class="absolute flex border items-center px-1.5 h-5 text-[10px] font-mono uppercase backdrop-blur-xs whitespace-nowrap pointer-events-auto"
      :class="[
        selectedLabelBelow ? 'rounded-b' : 'rounded-t',
        showAIGlow ? 'bg-violet-600 border-violet-500/10 text-violet-100' : 'bg-indigo-600 border-indigo-500/10 text-blue-100',
        canDragLabel ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'cursor-grabbing opacity-50' : ''
      ]"
      :style="selectedLabelStyle"
      @dragstart="handleLabelDragStart"
      @dragend="handleLabelDragEnd"
      @contextmenu="handleLabelContextMenu"
    >
      <span v-if="canDragLabel" class="w-2 h-2 rounded-full bg-blue-100 mr-1.5"></span>
      {{ selectedBlock.name }}
    </div>

    <!-- Content Edit Controls (Content Preview Mode) -->
    <div
      v-if="selectedRect && (showImageControls || showListControls)"
      class="absolute flex items-center gap-1.5 pointer-events-auto"
      :style="contentEditStyle"
      @click.stop
      @mousedown.stop
    >
      <!-- Image Edit Button -->
      <Popover v-if="showImageControls" v-model:open="imagePopoverOpen" align="right">
        <template #trigger>
          <Tooltip text="Change image" position="bottom">
            <button
              type="button"
              class="w-7 h-7 bg-background/95 backdrop-blur-sm border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors shadow-sm"
            >
              <Icon name="image-1" class="text-sm" />
            </button>
          </Tooltip>
        </template>

        <div class="p-2 space-y-1.5 min-w-[140px]">
          <!-- Current image preview -->
          <div v-if="currentImageUrl" class="relative rounded overflow-hidden mb-2">
            <img :src="currentImageUrl" alt="" class="w-full h-16 object-cover" />
          </div>

          <button
            type="button"
            class="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded hover:bg-muted transition-colors"
            @click="handleUploadImage"
          >
            <Icon name="upload-1" class="text-muted-foreground" />
            Upload image
          </button>
          <button
            type="button"
            class="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded hover:bg-muted transition-colors"
            @click="handleFindImage"
          >
            <Icon name="search-1" class="text-muted-foreground" />
            Search Unsplash
          </button>
          <div v-if="currentImageUrl" class="border-t border-border pt-1.5 mt-1.5">
            <button
              type="button"
              class="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left rounded text-destructive hover:bg-destructive/10 transition-colors"
              @click="handleRemoveImage"
            >
              <Icon name="trash-2" class="text-destructive" />
              Remove image
            </button>
          </div>
        </div>
      </Popover>

      <!-- List Item Controls -->
      <template v-if="showListControls">
        <Tooltip text="Add item" position="bottom">
          <button
            type="button"
            class="w-7 h-7 bg-background/95 backdrop-blur-sm border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors shadow-sm"
            @click="handleAddListItemFromParent"
          >
            <Icon name="plus" class="text-sm" />
          </button>
        </Tooltip>

        <Tooltip v-if="canDeleteListItem" text="Delete item" position="bottom">
          <button
            type="button"
            class="w-7 h-7 bg-background/95 backdrop-blur-sm border border-border rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shadow-sm"
            @click="handleDeleteListItem"
          >
            <Icon name="trash-2" class="text-sm" />
          </button>
        </Tooltip>
      </template>
    </div>

    <!-- Context Menu -->
    <ContextMenu v-if="!isReadonlyMode" ref="contextMenuRef">
      <!-- Add content option for layout blocks -->
      <template v-if="isLayoutBlock">
        <ContextMenuItem icon="plus" @click="openBlockPicker">
          Add content
        </ContextMenuItem>
        <!-- Add item option for list containers -->
        <ContextMenuItem v-if="isListContainerBlock" icon="plus" @click="handleAddListItem">
          Add item
        </ContextMenuItem>
        <ContextMenuDivider />
      </template>
      <!-- Z-index options for Canvas children -->
      <template v-if="isInsideCanvas">
        <ContextMenuItem icon="lni-arrow-upward" @click="handleBringToFront">
          Bring to front
        </ContextMenuItem>
        <ContextMenuItem icon="lni-arrow-downward" @click="handleSendToBack">
          Send to back
        </ContextMenuItem>
        <ContextMenuDivider />
      </template>
      <ContextMenuItem
        icon="app-cut"
        shortcut="⌘X"
        @click="handleCut"
      >
        Cut
      </ContextMenuItem>
      <ContextMenuItem
        icon="app-duplicate"
        shortcut="⌘C"
        @click="handleCopy"
      >
        Copy
      </ContextMenuItem>
      <ContextMenuItem
        icon="app-paste"
        shortcut="⌘V"
        :disabled="!designerStore.hasClipboardBlock"
        @click="handlePaste"
      >
        Paste
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem icon="app-editor" @click="handleEditStyle">
        Edit style
      </ContextMenuItem>
      <ContextMenuItem icon="app-copy-style" @click="handleCopyStyle">
        Copy style
      </ContextMenuItem>
      <ContextMenuItem
        icon="app-paste-style"
        :disabled="!designerStore.hasClipboardStyles"
        @click="handlePasteStyle"
      >
        Paste style
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem
        icon="app-duplicate"
        shortcut="⌘D"
        @click="handleDuplicate"
      >
        Duplicate
      </ContextMenuItem>
      <ContextMenuItem
        icon="style-row"
        @click="handleWrapInStack"
      >
        Wrap in stack
      </ContextMenuItem>
      <ContextMenuItem
        v-if="canWrapInLink"
        icon="link-1"
        @click="handleWrapInLink"
      >
        Wrap in a link
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isStack"
        icon="link-1"
        @click="handleConvertToButton"
      >
        Convert to link
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isStack"
        icon="grid-4"
        @click="handleConvertToGrid"
      >
        Convert to grid
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isButton || isGrid"
        icon="style-row"
        @click="handleConvertToStack"
      >
        Convert to stack
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isText"
        icon="text-style-heading-2"
        @click="handleConvertToHeading"
      >
        Convert to heading
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isHeading"
        icon="text-style-paragraph"
        @click="handleConvertToText"
      >
        Convert to text
      </ContextMenuItem>
      <ContextMenuItem
        icon="package"
        @click="handleCreateComponent"
      >
        Create component
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem
        icon="app-delete"
        shortcut="⌫"
        destructive
        @click="handleDelete"
      >
        Delete
      </ContextMenuItem>
    </ContextMenu>

    <!-- Block Picker for empty layout blocks -->
    <SidebarBlockPicker
      v-if="!isReadonlyMode"
      v-model:open="isBlockPickerOpen"
      hide-trigger
      @select="handleBlockPickerSelectBlock"
      @select-list-preset="handleBlockPickerSelectListPreset"
    />

    <!-- Upload Modal -->
    <ProjectUpload
      v-model:open="showUploadModal"
      :project-id="projectId"
      @uploaded="handleImageChange"
    />

    <!-- Unsplash Modal -->
    <ProjectUnsplash
      v-model:open="showUnsplashModal"
      @select="handleImageChange"
    />
  </div>
</template>
