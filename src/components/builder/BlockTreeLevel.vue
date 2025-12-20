<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import { Icon, Tooltip } from '@/components/ui'
import SidebarBlockPicker from './SidebarBlockPicker.vue'
import { sectionBlockIcons, canHaveChildren, formChildBlockTypes } from '@/lib/designer-utils'
import type { SectionBlock, SectionBlockType } from '@/types/designer'
import type { DragState } from './composables/useSidebarDragState'

interface Props {
  block: SectionBlock
  depth: number
  parentId: string | null
  childIndex: number
  dragState: DragState
  expandedBlocks: Set<string>
  renamingBlockId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggleExpanded: [blockId: string]
  contextMenu: [blockId: string, blockType: 'section' | 'child', event: MouseEvent]
  dragStart: [parentId: string, childIndex: number, blockId: string, event: DragEvent]
  dragOver: [parentId: string, childIndex: number, event: DragEvent]
  dragLeave: []
  drop: [parentId: string, childIndex: number, event?: DragEvent]
  dragEnd: []
  emptyParentDragOver: [parentId: string, event: DragEvent]
  emptyParentDragLeave: []
  emptyParentDrop: [parentId: string, event?: DragEvent]
  addChild: [parentId: string, blockType: string]
  addChildAtPosition: [parentId: string, blockType: string, position: number]
  startRename: [blockId: string]
  finishRename: [blockId: string, newName: string]
  cancelRename: []
  blockRowHover: [blockId: string]
  blockRowLeave: []
}>()

const designerStore = useDesignerStore()
const renameInputRef = ref<HTMLInputElement | null>(null)

// Watch for rename mode to focus input
watch(() => props.renamingBlockId, async (newId) => {
  if (newId === props.block.id) {
    await nextTick()
    renameInputRef.value?.focus()
    renameInputRef.value?.select()
  }
})

const isExpanded = computed(() => props.expandedBlocks.has(props.block.id))
const isSelected = computed(() => designerStore.selectedBlockId === props.block.id)
const isDragging = computed(() => props.dragState.childInfo?.blockId === props.block.id)
const isDropTarget = computed(() => {
  return props.parentId &&
    props.dragState.overChildInfo?.parentId === props.parentId &&
    props.dragState.overChildInfo?.childIndex === props.childIndex
})

const isHoverExpanding = computed(() => {
  return props.dragState.hoverExpandBlockId === props.block.id
})

// Check if block is in multi-selection
const isMultiSelected = computed(() => {
  return designerStore.selectedBlockIds.length > 1 && designerStore.selectedBlockIds.includes(props.block.id)
})

function canBlockExpand(block: SectionBlock): boolean {
  if (canHaveChildren(block.type)) return true
  return false
}

function getBlockPickerMode(block: SectionBlock): 'content-only' | 'nested' {
  if (block.type === 'canvas') return 'content-only'
  return 'nested'
}

function getBlockPickerLabel(block: SectionBlock): string {
  if (block.type === 'canvas') return 'Add element'
  return 'Add block'
}

// Get allowed block types for form blocks (form inputs + layout blocks)
function getFormAllowedTypes(): string[] {
  return [...formChildBlockTypes, 'stack', 'grid', 'container', 'text', 'heading'] as string[]
}

// Check if block is a form or is inside a form
function isInsideForm(blockId: string): boolean {
  let current = designerStore.findBlockById(blockId)
  while (current) {
    if (current.type === 'form') return true
    const parent = designerStore.findParentBlock(current.id)
    if (!parent) break
    current = parent
  }
  return false
}

function handleClick(event: MouseEvent) {
  if (event.shiftKey) {
    designerStore.toggleBlockSelection(props.block.id)
  } else {
    designerStore.selectBlock(props.block.id)
  }
}

function handleDragStart(event: DragEvent) {
  if (!props.parentId) return
  emit('dragStart', props.parentId, props.childIndex, props.block.id, event)
}

function handleDragOver(event: DragEvent) {
  if (!props.parentId) return
  emit('dragOver', props.parentId, props.childIndex, event)
  // If this block can have children, also trigger auto-expand on hover
  if (canHaveChildren(props.block.type)) {
    emit('blockRowHover', props.block.id)
  }
}

function handleDragLeave() {
  emit('dragLeave')
  emit('blockRowLeave')
}

function handleDrop(event: DragEvent) {
  if (!props.parentId) return
  emit('drop', props.parentId, props.childIndex, event)
}

function handleChildDragStart(parentId: string, childIndex: number, blockId: string, event: DragEvent) {
  emit('dragStart', parentId, childIndex, blockId, event)
}

function handleChildDragOver(parentId: string, childIndex: number, event: DragEvent) {
  emit('dragOver', parentId, childIndex, event)
}

function handleChildDrop(parentId: string, childIndex: number, event?: DragEvent) {
  emit('drop', parentId, childIndex, event)
}

// Handlers for forwarding events from recursive children
function handleChildContextMenu(blockId: string, blockType: 'section' | 'child', event: MouseEvent) {
  emit('contextMenu', blockId, blockType, event)
}

function handleChildEmptyParentDragOver(parentId: string, event: DragEvent) {
  emit('emptyParentDragOver', parentId, event)
}

function handleChildBlockRowHover(blockId: string) {
  emit('blockRowHover', blockId)
}

function handleChildBlockRowLeave() {
  emit('blockRowLeave')
}

function handleChildAddChild(parentId: string, blockType: string) {
  emit('addChild', parentId, blockType)
}

function handleChildAddChildAtPosition(parentId: string, blockType: string, position: number) {
  emit('addChildAtPosition', parentId, blockType, position)
}

function handleAddBlock(blockType: string) {
  emit('addChild', props.block.id, blockType)
}

// Rename handlers
function handleNameDoubleClick() {
  emit('startRename', props.block.id)
}

function handleRenameKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('finishRename', props.block.id, (event.target as HTMLInputElement).value)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancelRename')
  }
}

function handleRenameBlur(event: FocusEvent) {
  emit('finishRename', props.block.id, (event.target as HTMLInputElement).value)
}

// Forward rename events from children
function handleChildStartRename(blockId: string) {
  emit('startRename', blockId)
}

function handleChildFinishRename(blockId: string, newName: string) {
  emit('finishRename', blockId, newName)
}

function handleChildCancelRename() {
  emit('cancelRename')
}

const hasChildren = computed(() => props.block.children && props.block.children.length > 0)
const isEmptyDropTarget = computed(() => props.dragState.overEmptyParentId === props.block.id)

// Check if block has any effects applied
const hasEffects = computed(() => {
  const effects = (props.block.styles as Record<string, unknown>)?.effects as Record<string, unknown> | undefined
  if (!effects) return false
  return !!(effects.hover || effects.scroll || effects.appear || effects.loop)
})
</script>

<template>
  <div class="block-item">
    <!-- Block row -->
    <div
      :draggable="!!parentId && renamingBlockId !== block.id"
      class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
      :class="[
        parentId ? 'cursor-grab' : 'cursor-pointer',
        isSelected
          ? 'bg-accent text-accent-foreground'
          : isMultiSelected
            ? 'bg-accent/70 text-accent-foreground ring-1 ring-primary/30'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
        isDragging ? 'opacity-50' : '',
        isDropTarget ? 'border-t-2 border-primary' : '',
        isHoverExpanding ? 'ring-1 ring-primary/50 bg-primary/10' : '',
      ]"
      @click="handleClick($event)"
      @contextmenu="$emit('contextMenu', block.id, parentId ? 'child' : 'section', $event)"
      @dragstart="handleDragStart"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.stop="handleDrop($event)"
      @dragend="$emit('dragEnd')"
    >
      <!-- Expand/collapse toggle -->
      <button
        v-if="canBlockExpand(block)"
        class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
        @click.stop="$emit('toggleExpanded', block.id)"
      >
        <Icon
          name="chevron-down"
          class="text-[10px] text-muted-foreground transition-transform"
          :class="isExpanded ? 'rotate-0' : '-rotate-90'"
        />
      </button>

      <!-- Block icon (only for children, not root) -->
      <div v-if="parentId" class="w-4 h-4 flex items-center justify-center shrink-0">
        <Icon :name="sectionBlockIcons[block.type]" :size="12" class="text-muted-foreground" />
      </div>

      <!-- Block name (editable when renaming) -->
      <input
        v-if="renamingBlockId === block.id"
        ref="renameInputRef"
        type="text"
        :value="block.name"
        class="flex-1 min-w-0 bg-transparent border-b border-primary px-0 py-0 text-xs font-medium leading-4 outline-none"
        @blur="handleRenameBlur"
        @keydown="handleRenameKeydown"
        @click.stop
        @mousedown.stop
      />
      <span
        v-else
        class="flex-1 truncate font-medium leading-4"
        @dblclick.stop="handleNameDoubleClick"
      >{{ block.name }}</span>

      <!-- Indicators -->
      <div class="flex items-center gap-1 shrink-0">
        <!-- Shared style indicator -->
        <Tooltip v-if="block.sharedStyleId" text="Shared style">
          <span class="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
        </Tooltip>
        <!-- Effects indicator -->
        <Tooltip v-if="hasEffects" text="Effects">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
        </Tooltip>
      </div>
    </div>

    <!-- Expanded content -->
    <div
      v-if="isExpanded && canHaveChildren(block.type)"
      class="mt-1"
      :class="depth === 0 ? 'ml-2.5' : 'ml-2.5'"
    >
      <!-- Children -->
      <template v-if="hasChildren">
        <template v-for="(child, idx) in block.children" :key="child.id">
          <!-- Recursive child -->
          <BlockTreeLevel
            :block="child"
            :depth="depth + 1"
            :parent-id="block.id"
            :child-index="idx"
            :drag-state="dragState"
            :expanded-blocks="expandedBlocks"
            :renaming-block-id="renamingBlockId"
            @toggle-expanded="$emit('toggleExpanded', $event)"
            @context-menu="handleChildContextMenu"
            @drag-start="handleChildDragStart"
            @drag-over="handleChildDragOver"
            @drag-leave="$emit('dragLeave')"
            @drop="handleChildDrop"
            @drag-end="$emit('dragEnd')"
            @empty-parent-drag-over="handleChildEmptyParentDragOver"
            @empty-parent-drag-leave="$emit('emptyParentDragLeave')"
            @empty-parent-drop="$emit('emptyParentDrop', $event)"
            @add-child="handleChildAddChild"
            @add-child-at-position="handleChildAddChildAtPosition"
            @start-rename="handleChildStartRename"
            @finish-rename="handleChildFinishRename"
            @cancel-rename="handleChildCancelRename"
            @block-row-hover="handleChildBlockRowHover"
            @block-row-leave="handleChildBlockRowLeave"
          />
        </template>
        <!-- Drop zone at end of children list -->
        <div
          class="h-1 rounded"
          :class="dragState.overChildInfo?.parentId === block.id && dragState.overChildInfo?.childIndex === block.children?.length ? 'bg-primary' : ''"
          @dragover.prevent="$emit('dragOver', block.id, block.children?.length || 0, $event)"
          @dragleave="$emit('dragLeave')"
          @drop.prevent="$emit('drop', block.id, block.children?.length || 0, $event)"
        />
        <!-- Inline add block button (only on selected block, when not dragging) -->
        <SidebarBlockPicker
          v-if="isSelected && !dragState.childInfo && dragState.blockIndex === null && !dragState.newBlockType"
          trigger-variant="inline"
          :mode="getBlockPickerMode(block)"
          :allowed-types="isInsideForm(block.id) ? getFormAllowedTypes() : undefined"
          @select="handleAddBlock"
        />
      </template>

      <!-- Empty state: Drop zone + block picker when no children -->
      <div
        v-if="!hasChildren"
        class="py-1 rounded"
        :class="isEmptyDropTarget ? 'bg-primary/20 ring-1 ring-primary' : ''"
        @dragover.prevent="$emit('emptyParentDragOver', block.id, $event)"
        @dragleave="$emit('emptyParentDragLeave')"
        @drop.prevent="$emit('emptyParentDrop', block.id, $event)"
      >
        <SidebarBlockPicker
          :mode="getBlockPickerMode(block)"
          :trigger-label="getBlockPickerLabel(block)"
          :allowed-types="isInsideForm(block.id) ? getFormAllowedTypes() : undefined"
          @select="handleAddBlock"
        />
      </div>
    </div>
  </div>
</template>
