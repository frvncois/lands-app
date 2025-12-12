<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { sectionBlockLabels, sectionBlockIcons, canHaveChildren } from '@/lib/editor-utils'
import { PREBUILT_LIST_NAMES } from '@/stores/editor/helpers'
import type { SectionBlock } from '@/types/editor'
import Icon from '@/components/ui/Icon.vue'
import Tooltip from '@/components/ui/Tooltip.vue'

interface Props {
  block: SectionBlock
  depth: number
  parentId?: string
  expandedBlocks: Set<string>
  draggedChildInfo: { parentId: string; childIndex: number; blockId: string } | null
  dragOverChildInfo: { parentId: string; childIndex: number } | null
  childIndex?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggle-expand': [blockId: string]
  'select': [blockId: string]
  'context-menu': [blockId: string, type: 'section' | 'child', event: MouseEvent]
  'duplicate': [blockId: string]
  'delete': [blockId: string]
  'drag-start': [parentId: string, childIndex: number, blockId: string, event: DragEvent]
  'drag-over': [parentId: string, childIndex: number, event: DragEvent]
  'drag-leave': []
  'drop': [parentId: string, childIndex: number]
  'drag-end': []
}>()

const editorStore = useEditorStore()

// Check if this block is protected (header/footer)
const isProtected = computed(() =>
  props.block.type === 'header' || props.block.type === 'footer'
)

// Check if block is hidden
const isHidden = computed(() => {
  const settings = props.block.settings as Record<string, unknown>
  return settings.isHidden === true
})

// Check if block can expand (has children or can have children)
const canExpand = computed(() => {
  if (canHaveChildren(props.block.type)) return true
  if (props.block.children && props.block.children.length > 0) return true
  return false
})

// Check if block is expanded
const isExpanded = computed(() => props.expandedBlocks.has(props.block.id))

// Check if block is selected
const isSelected = computed(() =>
  editorStore.selectedBlockId === props.block.id && !editorStore.selectedItemId
)

// Check if this block is a prebuilt list grid (don't allow adding children via sidebar)
const isPrebuiltListGrid = computed(() =>
  props.block.type === 'grid' && PREBUILT_LIST_NAMES.includes(props.block.name)
)

// Check if this block is a header/footer stack (Start, Middle, End)
const isHeaderFooterStack = computed(() => {
  if (!props.parentId) return false
  const parent = editorStore.findBlockById(props.parentId)
  return parent?.type === 'header' || parent?.type === 'footer'
})

// Compute padding based on depth
const depthPadding = computed(() => `${props.depth * 24}px`)

// Drag state for this item
const isDragging = computed(() =>
  props.draggedChildInfo?.blockId === props.block.id
)

const isDragOver = computed(() =>
  props.dragOverChildInfo?.parentId === props.parentId &&
  props.dragOverChildInfo?.childIndex === props.childIndex
)

// Is this block draggable?
const isDraggable = computed(() =>
  !isProtected.value && props.depth > 0
)

function handleClick() {
  emit('select', props.block.id)
}

function handleContextMenu(event: MouseEvent) {
  emit('context-menu', props.block.id, props.depth === 0 ? 'section' : 'child', event)
}

function handleToggleExpand(event: MouseEvent) {
  event.stopPropagation()
  emit('toggle-expand', props.block.id)
}

function handleDuplicate(event: MouseEvent) {
  event.stopPropagation()
  emit('duplicate', props.block.id)
}

function handleDelete(event: MouseEvent) {
  event.stopPropagation()
  emit('delete', props.block.id)
}

function handleDragStart(event: DragEvent) {
  if (!isDraggable.value || props.parentId === undefined || props.childIndex === undefined) return
  emit('drag-start', props.parentId, props.childIndex, props.block.id, event)
}

function handleDragOver(event: DragEvent) {
  if (props.parentId === undefined || props.childIndex === undefined) return
  event.preventDefault()
  emit('drag-over', props.parentId, props.childIndex, event)
}

function handleDragLeave() {
  emit('drag-leave')
}

function handleDrop(event: DragEvent) {
  if (props.parentId === undefined || props.childIndex === undefined) return
  event.stopPropagation()
  emit('drop', props.parentId, props.childIndex)
}

function handleDragEnd() {
  emit('drag-end')
}

// Forward events from child BlockTreeItems
function forwardToggleExpand(blockId: string) {
  emit('toggle-expand', blockId)
}

function forwardSelect(blockId: string) {
  emit('select', blockId)
}

function forwardContextMenu(blockId: string, type: 'section' | 'child', event: MouseEvent) {
  emit('context-menu', blockId, type, event)
}

function forwardDuplicate(blockId: string) {
  emit('duplicate', blockId)
}

function forwardDelete(blockId: string) {
  emit('delete', blockId)
}

function forwardDragStart(parentId: string, childIndex: number, blockId: string, event: DragEvent) {
  emit('drag-start', parentId, childIndex, blockId, event)
}

function forwardDragOver(parentId: string, childIndex: number, event: DragEvent) {
  emit('drag-over', parentId, childIndex, event)
}

function forwardDragLeave() {
  emit('drag-leave')
}

function forwardDrop(parentId: string, childIndex: number) {
  emit('drop', parentId, childIndex)
}

function forwardDragEnd() {
  emit('drag-end')
}
</script>

<template>
  <div class="block-tree-item">
    <!-- Block row -->
    <div
      class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group"
      :class="[
        isDraggable ? 'cursor-grab' : 'cursor-pointer',
        isSelected
          ? 'bg-accent text-accent-foreground'
          : 'text-foreground hover:bg-accent/50',
        isDragging ? 'opacity-50' : '',
        isDragOver ? 'border-t-2 border-primary' : '',
        isHidden ? 'opacity-50' : '',
      ]"
      :style="{ paddingLeft: depthPadding }"
      :draggable="isDraggable"
      @click="handleClick"
      @contextmenu="handleContextMenu"
      @dragstart="handleDragStart"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @dragend="handleDragEnd"
    >
      <!-- Expand/Collapse toggle -->
      <button
        v-if="canExpand"
        class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
        @click="handleToggleExpand"
      >
        <Icon
          name="chevron-down"
          class="text-[10px] text-muted-foreground transition-transform"
          :class="isExpanded ? 'rotate-0' : '-rotate-90'"
        />
      </button>
      <div v-else class="w-4 shrink-0"></div>

      <!-- Block icon (only show for depth > 0) -->
      <div v-if="depth > 0" class="w-4 h-4 flex items-center justify-center shrink-0">
        <Icon :name="sectionBlockIcons[block.type]" :size="12" class="text-muted-foreground" />
      </div>

      <!-- Block name -->
      <span class="flex-1 truncate font-medium leading-4">
        {{ block.name }}
      </span>

      <!-- Shared style indicator -->
      <Tooltip v-if="block.sharedStyleId" text="Has shared style">
        <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
      </Tooltip>

      <!-- Action buttons -->
      <div
        class="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pl-6 pr-1 opacity-0 group-hover:opacity-100 transition-opacity"
        :class="[
          isSelected
            ? 'bg-gradient-to-r from-transparent to-accent'
            : 'bg-gradient-to-r from-transparent via-sidebar/80 to-sidebar'
        ]"
      >
        <!-- Duplicate button -->
        <Tooltip v-if="!isProtected" text="Duplicate">
          <button
            class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
            @click="handleDuplicate"
          >
            <Icon name="layers-1" class="text-[10px]" />
          </button>
        </Tooltip>

        <!-- Delete button -->
        <Tooltip v-if="!isProtected" text="Delete">
          <button
            class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all"
            @click="handleDelete"
          >
            <Icon name="trash-3" class="text-[10px]" />
          </button>
        </Tooltip>
      </div>
    </div>

    <!-- Recursive children -->
    <div v-if="isExpanded && block.children?.length" class="space-y-0.5">
      <BlockTreeItem
        v-for="(child, index) in block.children"
        :key="child.id"
        :block="child"
        :depth="depth + 1"
        :parent-id="block.id"
        :child-index="index"
        :expanded-blocks="expandedBlocks"
        :dragged-child-info="draggedChildInfo"
        :drag-over-child-info="dragOverChildInfo"
        @toggle-expand="forwardToggleExpand"
        @select="forwardSelect"
        @context-menu="forwardContextMenu"
        @duplicate="forwardDuplicate"
        @delete="forwardDelete"
        @drag-start="forwardDragStart"
        @drag-over="forwardDragOver"
        @drag-leave="forwardDragLeave"
        @drop="forwardDrop"
        @drag-end="forwardDragEnd"
      />
    </div>
  </div>
</template>
