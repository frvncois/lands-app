<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Button, Icon, Tooltip } from '@/components/ui'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import ContextMenuDivider from '@/components/ui/ContextMenuDivider.vue'
import BlockTreeLevel from './BlockTreeLevel.vue'
import AddBlockLine from './AddBlockLine.vue'
import SidebarBlockPicker from './SidebarBlockPicker.vue'
import { canHaveChildren } from '@/lib/editor-utils'
import {
  sectionBlockLabels,
  sectionBlockIcons,
  blocksByCategory,
  categoryLabels,
} from '@/lib/editor-utils'
import type { SectionBlockType, BlockCategory } from '@/types/editor'

// Composables
import { useSidebarDragState } from './composables/useSidebarDragState'
import { useBlockTree } from './composables/useBlockTree'
import { useBlockContextMenu } from './composables/useBlockContextMenu'

const editorStore = useEditorStore()

// Use composables
const {
  dragState,
  handleBlockDragStart,
  handleBlockDragOver,
  handleBlockDragLeave,
  handleBlockDrop,
  handleBlockDragEnd,
  handleChildDragStart,
  handleChildDragOver,
  handleChildDragLeave,
  handleChildDrop,
  handleChildDragEnd,
  handleEmptyParentDragOver,
  handleEmptyParentDragLeave,
  handleEmptyParentDrop,
} = useSidebarDragState()

const {
  expandedBlocks,
  toggleExpanded,
  expandBlock,
  collapseBlock,
  canBlockExpand,
  blockHasInteraction,
} = useBlockTree()

const {
  contextMenuRef,
  canDuplicate,
  canDelete,
  openContextMenu,
  handleDuplicate,
  handleDelete,
  handleCopyStyle,
  handlePasteStyle,
  handleCreateComponent,
} = useBlockContextMenu(expandBlock, collapseBlock)

// Local state
const showSectionDropdown = ref(false)
const sectionSearchQuery = ref('')
const sectionSearchInputRef = ref<HTMLInputElement | null>(null)
const showRootAddPicker = ref<number | null>(null)
const showChildAddPicker = ref<{ blockId: string; position: number } | null>(null)

// Categories for block selection
const categories: BlockCategory[] = ['layout', 'content']

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

// Filtered components by search query
const filteredComponents = computed(() => {
  const query = sectionSearchQuery.value.toLowerCase().trim()
  if (!query) return editorStore.components
  return editorStore.components.filter(c => c.name.toLowerCase().includes(query))
})

// Check if there are any results
const hasSearchResults = computed(() => {
  return filteredBlocksByCategory.value.layout.length > 0 ||
         filteredBlocksByCategory.value.content.length > 0 ||
         filteredComponents.value.length > 0
})

// Watch for dropdown open to focus search input
watch(showSectionDropdown, async (isOpen) => {
  if (isOpen) {
    sectionSearchQuery.value = ''
    await nextTick()
    sectionSearchInputRef.value?.focus()
  }
})

// Handlers
function handleAddSection(type: SectionBlockType) {
  const block = editorStore.addBlock(type)
  if (block) {
    expandBlock(block.id)
  }
  showSectionDropdown.value = false
}

function handleInsertComponent(componentId: string) {
  const block = editorStore.insertComponent(componentId)
  if (block) {
    expandBlock(block.id)
  }
  showSectionDropdown.value = false
}

function handleSectionTypeDragStart(type: SectionBlockType, event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/x-section-type', type)
    event.dataTransfer.setData('text/plain', type)
    event.dataTransfer.effectAllowed = 'copy'
  }
  setTimeout(() => {
    showSectionDropdown.value = false
  }, 100)
}

function handleSectionTypeDragEnd() {
  showSectionDropdown.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown-container')) {
    showSectionDropdown.value = false
  }
}

function handleSidebarClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.block-item')) {
    editorStore.selectBlock(null)
  }
}

// Child block handlers (forward to BlockTreeLevel)
function handleAddChildBlock(parentId: string, blockType: string) {
  const block = editorStore.addBlock(blockType as SectionBlockType, undefined, parentId)
  if (block) {
    editorStore.selectBlock(block.id)
  }
}

function handleAddChildBlockAtPosition(parentId: string, blockType: string, position: number) {
  const block = editorStore.addBlock(blockType as SectionBlockType, position, parentId)
  if (block) {
    editorStore.selectBlock(block.id)
  }
}

// Wrapper for child drop to pass expandBlock
function handleChildDropWithExpand(parentId: string, childIndex: number) {
  handleChildDrop(parentId, childIndex, expandBlock)
}

function handleEmptyParentDropWithExpand(parentId: string) {
  handleEmptyParentDrop(parentId, expandBlock)
}

// Root-level add block handlers
function handleRootAddAtPosition(position: number) {
  showRootAddPicker.value = position
}

function handleRootAddBlockType(type: string, position: number) {
  const block = editorStore.addBlock(type as SectionBlockType, position)
  if (block) {
    expandBlock(block.id)
  }
  showRootAddPicker.value = null
}

function handleRootPickerClose() {
  showRootAddPicker.value = null
}

// First-level children add block handlers
function handleChildAddAtPosition(blockId: string, position: number) {
  showChildAddPicker.value = { blockId, position }
}

function handleChildAddBlockType(blockId: string, type: string, position: number) {
  const block = editorStore.addBlock(type as SectionBlockType, position, blockId)
  if (block) {
    editorStore.selectBlock(block.id)
  }
  showChildAddPicker.value = null
}

function handleChildPickerClose() {
  showChildAddPicker.value = null
}

function getBlockPickerMode(block: { type: string }): 'form' | 'content-only' | 'nested' {
  if (block.type === 'form') return 'form'
  if (block.type === 'canvas') return 'content-only'
  return 'nested'
}

function getBlockPickerLabel(block: { type: string }): string {
  if (block.type === 'form') return 'Add field'
  if (block.type === 'canvas') return 'Add element'
  return 'Add block'
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

                <!-- Components section -->
                <div v-if="filteredComponents.length > 0" class="flex flex-col items-start mb-3.5">
                  <div class="text-[10px] text-muted-foreground font-mono border rounded-full uppercase tracking-wider mb-2 px-1.5">
                    Components
                  </div>
                  <div class="grid grid-cols-2 gap-1 w-full">
                    <button
                      v-for="component in filteredComponents"
                      :key="component.id"
                      class="flex flex-col items-center border border-border/25 gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent/25 hover:border-border/50 transition-colors cursor-pointer"
                      @click="handleInsertComponent(component.id)"
                    >
                      <Icon name="package" :size="18" class="text-muted-foreground" />
                      <span class="text-[10px] text-center leading-tight truncate w-full">{{ component.name }}</span>
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
            <Icon name="layers-1" class="text-xl text-muted-foreground" />
          </div>
          <p class="text-sm text-muted-foreground">No sections yet</p>
          <p class="text-xs text-muted-foreground mt-1">Click + to add your first section</p>
        </div>

        <!-- Section block items using recursive component -->
        <div v-else class="space-y-0.5">
          <template v-for="(block, blockIndex) in editorStore.blocks" :key="block.id">
            <!-- Add line before block -->
            <AddBlockLine
              :position="blockIndex"
              @add="handleRootAddAtPosition(blockIndex)"
            />
            <!-- Inline picker at this position -->
            <SidebarBlockPicker
              v-if="showRootAddPicker === blockIndex"
              mode="all"
              auto-open
              @select="handleRootAddBlockType($event, blockIndex)"
              @close="handleRootPickerClose"
            />

            <div
              class="block-item"
              draggable="true"
              @dragstart="handleBlockDragStart(blockIndex, $event)"
              @dragover="handleBlockDragOver(blockIndex, $event)"
              @dragleave="handleBlockDragLeave"
              @drop="handleBlockDrop(blockIndex)"
              @dragend="handleBlockDragEnd"
            >
              <!-- Section block header -->
              <div
                class="relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors group cursor-grab"
                :class="[
                  editorStore.selectedBlockId === block.id && !editorStore.selectedItemId
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-accent/50',
                  dragState.blockIndex === blockIndex ? 'opacity-50' : '',
                  dragState.overBlockIndex === blockIndex ? 'border-t-2 border-primary' : '',
                ]"
                @click="editorStore.selectBlock(block.id)"
                @contextmenu="openContextMenu(block.id, 'section', $event)"
              >
                <!-- Expand/Collapse toggle -->
                <button
                  v-if="canBlockExpand(block)"
                  class="w-4 h-4 flex items-center justify-center shrink-0 rounded hover:bg-accent/50 transition-colors"
                  @click.stop="toggleExpanded(block.id)"
                >
                  <Icon name="chevron-down" class="text-[10px] text-muted-foreground transition-transform" :class="expandedBlocks.has(block.id) ? 'rotate-0' : '-rotate-90'" />
                </button>
                <div v-else class="w-4 shrink-0"></div>

                <span class="flex-1 truncate font-medium leading-4">{{ block.name }}</span>

                <!-- Interaction indicator -->
                <Tooltip v-if="blockHasInteraction(block.id)" text="Has interaction">
                  <span class="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                </Tooltip>

                <!-- Shared style indicator -->
                <Tooltip v-if="block.sharedStyleId" text="Has shared style">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                </Tooltip>
              </div>

              <!-- Expanded children -->
              <div v-if="expandedBlocks.has(block.id) && canHaveChildren(block.type)" class="ml-5 mt-1">
                <!-- Empty state or children -->
                <template v-if="block.children && block.children.length > 0">
                  <template v-for="(child, childIndex) in block.children" :key="child.id">
                    <!-- Add line before child -->
                    <AddBlockLine
                      :position="childIndex"
                      @add="handleChildAddAtPosition(block.id, childIndex)"
                    />
                    <!-- Inline picker at this position -->
                    <SidebarBlockPicker
                      v-if="showChildAddPicker?.blockId === block.id && showChildAddPicker?.position === childIndex"
                      :mode="getBlockPickerMode(block)"
                      :trigger-label="getBlockPickerLabel(block)"
                      auto-open
                      @select="handleChildAddBlockType(block.id, $event, childIndex)"
                      @close="handleChildPickerClose"
                    />

                    <BlockTreeLevel
                      :block="child"
                      :depth="1"
                      :parent-id="block.id"
                      :child-index="childIndex"
                      :drag-state="dragState"
                      :expanded-blocks="expandedBlocks"
                      @toggle-expanded="toggleExpanded"
                      @context-menu="(id, type, event) => openContextMenu(id, type, event)"
                      @drag-start="handleChildDragStart"
                      @drag-over="handleChildDragOver"
                      @drag-leave="handleChildDragLeave"
                      @drop="handleChildDropWithExpand"
                      @drag-end="handleChildDragEnd"
                      @empty-parent-drag-over="handleEmptyParentDragOver"
                      @empty-parent-drag-leave="handleEmptyParentDragLeave"
                      @empty-parent-drop="handleEmptyParentDropWithExpand"
                      @add-child="handleAddChildBlock"
                      @add-child-at-position="handleAddChildBlockAtPosition"
                    />
                  </template>

                  <!-- Add line at end -->
                  <AddBlockLine
                    :position="block.children.length"
                    @add="handleChildAddAtPosition(block.id, block.children.length)"
                  />
                  <!-- Inline picker at end -->
                  <SidebarBlockPicker
                    v-if="showChildAddPicker?.blockId === block.id && showChildAddPicker?.position === block.children.length"
                    :mode="getBlockPickerMode(block)"
                    :trigger-label="getBlockPickerLabel(block)"
                    auto-open
                    @select="handleChildAddBlockType(block.id, $event, block.children.length)"
                    @close="handleChildPickerClose"
                  />
                </template>

                <!-- Empty state: Show block picker when no children -->
                <SidebarBlockPicker
                  v-else
                  :mode="getBlockPickerMode(block)"
                  :trigger-label="getBlockPickerLabel(block)"
                  @select="handleAddChildBlock(block.id, $event)"
                />
              </div>
            </div>
          </template>

          <!-- Add line at end of all blocks -->
          <AddBlockLine
            :position="editorStore.blocks.length"
            @add="handleRootAddAtPosition(editorStore.blocks.length)"
          />
          <!-- Inline picker at end -->
          <SidebarBlockPicker
            v-if="showRootAddPicker === editorStore.blocks.length"
            mode="all"
            auto-open
            @select="handleRootAddBlockType($event, editorStore.blocks.length)"
            @close="handleRootPickerClose"
          />
        </div>
      </div>
    </template>

    <!-- Block Context Menu -->
    <ContextMenu ref="contextMenuRef">
      <ContextMenuItem
        icon="app-copy-style"
        @click="handleCopyStyle"
      >
        Copy style
      </ContextMenuItem>
      <ContextMenuItem
        icon="app-paste-style"
        :disabled="!editorStore.hasClipboardStyles"
        @click="handlePasteStyle"
      >
        Paste style
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem
        icon="layers-1"
        :disabled="!canDuplicate"
        @click="handleDuplicate"
      >
        Duplicate
      </ContextMenuItem>
      <ContextMenuItem
        icon="package"
        @click="handleCreateComponent"
      >
        Create component
      </ContextMenuItem>
      <ContextMenuDivider />
      <ContextMenuItem
        icon="trash-3"
        destructive
        :disabled="!canDelete"
        @click="handleDelete"
      >
        Delete
      </ContextMenuItem>
    </ContextMenu>
  </aside>
</template>
