<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Icon, Tooltip } from '@/components/ui'
import SidebarBlockPicker from './SidebarBlockPicker.vue'
import { sectionBlockIcons, canHaveChildren } from '@/lib/editor-utils'
import type { SectionBlock, SectionBlockType } from '@/types/editor'
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
  drop: [parentId: string, childIndex: number]
  dragEnd: []
  emptyParentDragOver: [parentId: string, event: DragEvent]
  emptyParentDragLeave: []
  emptyParentDrop: [parentId: string]
  addChild: [parentId: string, blockType: string]
  addChildAtPosition: [parentId: string, blockType: string, position: number]
  startRename: [blockId: string]
  finishRename: [blockId: string, newName: string]
  cancelRename: []
}>()

const editorStore = useEditorStore()
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
const isSelected = computed(() => editorStore.selectedBlockId === props.block.id)
const isDragging = computed(() => props.dragState.childInfo?.blockId === props.block.id)
const isDropTarget = computed(() => {
  return props.parentId &&
    props.dragState.overChildInfo?.parentId === props.parentId &&
    props.dragState.overChildInfo?.childIndex === props.childIndex
})

function canBlockExpand(block: SectionBlock): boolean {
  if (block.type === 'form') return true
  if (canHaveChildren(block.type)) return true
  return false
}

function isInsideForm(block: SectionBlock): boolean {
  if (block.type === 'form') return true
  let parent = editorStore.findParentBlock(block.id)
  while (parent) {
    if (parent.type === 'form') return true
    parent = editorStore.findParentBlock(parent.id)
  }
  return false
}

function getBlockPickerMode(block: SectionBlock): 'form' | 'content-only' | 'nested' {
  if (isInsideForm(block)) return 'form'
  if (block.type === 'canvas') return 'content-only'
  return 'nested'
}

function getBlockPickerLabel(block: SectionBlock): string {
  if (isInsideForm(block)) return 'Add field'
  if (block.type === 'canvas') return 'Add element'
  return 'Add block'
}

function handleClick() {
  editorStore.selectBlock(props.block.id)
}

function handleDragStart(event: DragEvent) {
  if (!props.parentId) return
  emit('dragStart', props.parentId, props.childIndex, props.block.id, event)
}

function handleDragOver(event: DragEvent) {
  if (!props.parentId) return
  emit('dragOver', props.parentId, props.childIndex, event)
}

function handleDrop() {
  if (!props.parentId) return
  emit('drop', props.parentId, props.childIndex)
}

function handleChildDragStart(parentId: string, childIndex: number, blockId: string, event: DragEvent) {
  emit('dragStart', parentId, childIndex, blockId, event)
}

function handleChildDragOver(parentId: string, childIndex: number, event: DragEvent) {
  emit('dragOver', parentId, childIndex, event)
}

function handleChildDrop(parentId: string, childIndex: number) {
  emit('drop', parentId, childIndex)
}

// Handlers for forwarding events from recursive children
function handleChildContextMenu(blockId: string, blockType: 'section' | 'child', event: MouseEvent) {
  emit('contextMenu', blockId, blockType, event)
}

function handleChildEmptyParentDragOver(parentId: string, event: DragEvent) {
  emit('emptyParentDragOver', parentId, event)
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
</script>

<template>
  <div class="block-item">
    <!-- Block row -->
    <div
      :draggable="!!parentId"
      class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
      :class="[
        parentId ? 'cursor-grab' : 'cursor-pointer',
        isSelected ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
        isDragging ? 'opacity-50' : '',
        isDropTarget ? 'border-t-2 border-primary' : '',
      ]"
      @click="handleClick"
      @contextmenu="$emit('contextMenu', block.id, parentId ? 'child' : 'section', $event)"
      @dragstart="handleDragStart"
      @dragover="handleDragOver"
      @dragleave="$emit('dragLeave')"
      @drop.stop="handleDrop"
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
      <div v-else class="w-4 shrink-0" />

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
        class="flex-1 bg-transparent border border-primary rounded px-1 py-0 text-xs font-medium leading-4 outline-none"
        @blur="handleRenameBlur"
        @keydown="handleRenameKeydown"
        @click.stop
      />
      <span
        v-else
        class="flex-1 truncate font-medium leading-4"
        @dblclick.stop="handleNameDoubleClick"
      >{{ block.name }}</span>

      <!-- Shared style indicator -->
      <Tooltip v-if="block.sharedStyleId" text="Has shared style">
        <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      </Tooltip>
    </div>

    <!-- Expanded content -->
    <div
      v-if="isExpanded && canHaveChildren(block.type)"
      class="mt-1"
      :class="depth === 0 ? 'ml-5' : 'ml-6'"
    >
      <!-- Empty drop zone (when no children and dragging) -->
      <div
        v-if="!hasChildren && dragState.childInfo"
        class="flex items-center justify-center px-2 py-3 rounded-lg border-2 border-dashed transition-colors"
        :class="isEmptyDropTarget ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'"
        @dragover="$emit('emptyParentDragOver', block.id, $event)"
        @dragleave="$emit('emptyParentDragLeave')"
        @drop.stop="$emit('emptyParentDrop', block.id)"
      >
        <span class="text-xs text-muted-foreground">Drop here</span>
      </div>

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
          />
        </template>
      </template>

      <!-- Empty state: Show block picker when no children -->
      <SidebarBlockPicker
        v-if="!hasChildren && !dragState.childInfo"
        :mode="getBlockPickerMode(block)"
        :trigger-label="getBlockPickerLabel(block)"
        @select="handleAddBlock"
      />
    </div>
  </div>
</template>
