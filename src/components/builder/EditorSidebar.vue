<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Button, Icon, Tooltip } from '@/components/ui'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import ContextMenuItem from '@/components/ui/ContextMenuItem.vue'
import ContextMenuDivider from '@/components/ui/ContextMenuDivider.vue'
import BlockTreeLevel from './BlockTreeLevel.vue'
import SidebarBlockPicker from './SidebarBlockPicker.vue'
import { canHaveChildren } from '@/lib/editor-utils'
import {
  sectionBlockLabels,
  sectionBlockIcons,
  blocksByCategory,
  categoryLabels,
} from '@/lib/editor-utils'
import { listPresetConfigs, type ListPresetType } from '@/lib/list-presets'
import type { SectionBlockType, BlockCategory } from '@/types/editor'

// Composables
import { useSidebarDragState } from './composables/useSidebarDragState'
import { useBlockTree } from './composables/useBlockTree'
import { useBlockContextMenu } from './composables/useBlockContextMenu'

const editorStore = useEditorStore()

// Use composables
const {
  dragState,
  handleNewBlockDragStart,
  handleNewBlockDragEnd,
  isNewBlockTypeDrag,
  handleListPresetDragStart,
  handleListPresetDragEnd,
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
  handleBlockRowHover,
  handleBlockRowLeave,
} = useSidebarDragState()

const {
  expandedBlocks,
  toggleExpanded,
  expandBlock,
  collapseBlock,
  canBlockExpand,
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
  handleWrapInStack,
  isStack,
  isButton,
  handleConvertToButton,
  handleConvertToStack,
  renamingBlockId,
  handleRename,
  startRename,
  finishRename,
  cancelRename,
} = useBlockContextMenu(expandBlock, collapseBlock)

// Rename input ref for auto-focus
const renameInputRef = ref<HTMLInputElement | null>(null)

// Watch for rename mode to focus input
watch(renamingBlockId, async (newId) => {
  if (newId) {
    await nextTick()
    renameInputRef.value?.focus()
    renameInputRef.value?.select()
  }
})

// Handle rename input keydown
function handleRenameKeydown(event: KeyboardEvent, blockId: string, currentValue: string) {
  if (event.key === 'Enter') {
    event.preventDefault()
    finishRename(blockId, currentValue)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancelRename()
  }
}

// Handle double-click to start rename
function handleNameDoubleClick(blockId: string) {
  startRename(blockId)
}

// Local state
const showSectionDropdown = ref(false)
const sectionSearchQuery = ref('')
const sectionSearchInputRef = ref<HTMLInputElement | null>(null)

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

// Filtered list presets by search query
const filteredListPresets = computed(() => {
  const query = sectionSearchQuery.value.toLowerCase().trim()
  if (!query) return listPresetConfigs
  return listPresetConfigs.filter(preset =>
    preset.name.toLowerCase().includes(query) ||
    preset.description.toLowerCase().includes(query)
  )
})

// Check if there are any results
const hasSearchResults = computed(() => {
  return filteredBlocksByCategory.value.layout.length > 0 ||
         filteredBlocksByCategory.value.content.length > 0 ||
         filteredComponents.value.length > 0 ||
         filteredListPresets.value.length > 0
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

function handleAddListPreset(type: ListPresetType) {
  const block = editorStore.addListPreset(type)
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
  handleNewBlockDragStart(type, event)
  // Close dropdown after a short delay so the drag preview is visible
  setTimeout(() => {
    showSectionDropdown.value = false
  }, 50)
}

function handleSectionTypeDragEnd() {
  handleNewBlockDragEnd()
  showSectionDropdown.value = false
}

function handleListPresetTypeDragStart(type: ListPresetType, event: DragEvent) {
  handleListPresetDragStart(type, event)
  // Close dropdown after a short delay so the drag preview is visible
  setTimeout(() => {
    showSectionDropdown.value = false
  }, 50)
}

function handleListPresetTypeDragEnd() {
  handleListPresetDragEnd()
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

function handleAddChildListPreset(parentId: string, presetType: ListPresetType) {
  const block = editorStore.addListPreset(presetType, undefined, parentId)
  if (block) {
    editorStore.selectBlock(block.id)
  }
}

// Wrapper for child drop to pass expandBlock and event
function handleChildDropWithExpand(parentId: string, childIndex: number, event?: DragEvent) {
  handleChildDrop(parentId, childIndex, expandBlock, event)
}

function handleEmptyParentDropWithExpand(parentId: string, event?: DragEvent) {
  handleEmptyParentDrop(parentId, expandBlock, event)
}

// Wrapper for block row hover to pass expandBlock
function handleBlockRowHoverWithExpand(blockId: string) {
  handleBlockRowHover(blockId, expandBlock)
}

function getBlockPickerMode(block: { type: string }): 'content-only' | 'nested' {
  if (block.type === 'canvas') return 'content-only'
  return 'nested'
}

function getBlockPickerLabel(block: { type: string }): string {
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

                <!-- Lists section -->
                <div v-if="filteredListPresets.length > 0" class="flex flex-col items-start mb-3.5">
                  <div class="text-[10px] text-muted-foreground font-mono border rounded-full uppercase tracking-wider mb-2 px-1.5">
                    Lists
                  </div>
                  <div class="grid grid-cols-2 gap-1 w-full">
                    <button
                      v-for="preset in filteredListPresets"
                      :key="preset.type"
                      draggable="true"
                      class="flex flex-col items-center border border-border/25 gap-1 p-2.5 rounded-lg text-popover-foreground hover:bg-accent/25 hover:border-border/50 transition-colors cursor-grab active:cursor-grabbing"
                      @click="handleAddListPreset(preset.type)"
                      @dragstart="handleListPresetTypeDragStart(preset.type, $event)"
                      @dragend="handleListPresetTypeDragEnd"
                    >
                      <Icon :name="preset.icon" :size="18" class="text-muted-foreground" />
                      <span class="text-[10px] text-center leading-tight">{{ preset.name }}</span>
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
            <div
              class="block-item"
              draggable="true"
              @dragstart="handleBlockDragStart(blockIndex, $event)"
              @dragover="handleBlockDragOver(blockIndex, $event); if (canHaveChildren(block.type)) handleBlockRowHoverWithExpand(block.id)"
              @dragleave="handleBlockDragLeave(); handleBlockRowLeave()"
              @drop="handleBlockDrop(blockIndex, $event)"
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
                  dragState.hoverExpandBlockId === block.id ? 'ring-1 ring-primary/50 bg-primary/10' : '',
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

                <!-- Block name (editable when renaming) -->
                <input
                  v-if="renamingBlockId === block.id"
                  ref="renameInputRef"
                  type="text"
                  :value="block.name"
                  class="flex-1 bg-transparent border border-primary rounded px-1 py-0 text-xs font-medium leading-4 outline-none"
                  @blur="finishRename(block.id, ($event.target as HTMLInputElement).value)"
                  @keydown="handleRenameKeydown($event, block.id, ($event.target as HTMLInputElement).value)"
                  @click.stop
                />
                <span
                  v-else
                  class="flex-1 truncate font-medium leading-4"
                  @dblclick.stop="handleNameDoubleClick(block.id)"
                >{{ block.name }}</span>

                <!-- Shared style indicator -->
                <Tooltip v-if="block.sharedStyleId" text="Has shared style">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                </Tooltip>
              </div>

              <!-- Expanded children -->
              <div v-if="expandedBlocks.has(block.id) && canHaveChildren(block.type)" class="ml-2.5 mt-1">
                <!-- Empty state or children -->
                <template v-if="block.children && block.children.length > 0">
                  <template v-for="(child, childIndex) in block.children" :key="child.id">
                    <BlockTreeLevel
                      :block="child"
                      :depth="1"
                      :parent-id="block.id"
                      :child-index="childIndex"
                      :drag-state="dragState"
                      :expanded-blocks="expandedBlocks"
                      :renaming-block-id="renamingBlockId"
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
                      @start-rename="startRename"
                      @finish-rename="finishRename"
                      @cancel-rename="cancelRename"
                      @block-row-hover="handleBlockRowHoverWithExpand"
                      @block-row-leave="handleBlockRowLeave"
                    />
                  </template>
                  <!-- Drop zone at end of children list (when dragging) -->
                  <div
                    v-if="dragState.childInfo || dragState.blockIndex !== null || dragState.newBlockType"
                    class="flex items-center justify-center px-2 py-1.5 rounded-lg border-2 border-dashed transition-colors mt-0.5"
                    :class="dragState.overChildInfo?.parentId === block.id && dragState.overChildInfo?.childIndex === block.children.length ? 'border-primary bg-primary/10' : 'border-transparent hover:border-muted-foreground/30'"
                    @dragover.prevent.stop="handleChildDragOver(block.id, block.children.length, $event)"
                    @dragleave="handleChildDragLeave"
                    @drop.stop="handleChildDropWithExpand(block.id, block.children.length, $event)"
                  >
                    <span class="text-[10px] text-muted-foreground">Drop here</span>
                  </div>
                </template>

                <!-- Empty state: Show drop zone when dragging, otherwise show block picker -->
                <template v-else>
                  <!-- Drop zone for empty parent when dragging -->
                  <div
                    v-if="dragState.childInfo || dragState.blockIndex !== null || dragState.newBlockType"
                    class="flex items-center justify-center px-2 py-3 rounded-lg border-2 border-dashed transition-colors"
                    :class="dragState.overEmptyParentId === block.id ? 'border-primary bg-primary/10' : 'border-muted-foreground/30'"
                    @dragover.prevent.stop="handleEmptyParentDragOver(block.id, $event)"
                    @dragleave="handleEmptyParentDragLeave"
                    @drop.stop="handleEmptyParentDropWithExpand(block.id, $event)"
                  >
                    <span class="text-xs text-muted-foreground">Drop here</span>
                  </div>
                  <!-- Normal block picker when not dragging -->
                  <SidebarBlockPicker
                    v-else
                    :mode="getBlockPickerMode(block)"
                    :trigger-label="getBlockPickerLabel(block)"
                    @select="handleAddChildBlock(block.id, $event)"
                    @select-list-preset="handleAddChildListPreset(block.id, $event)"
                  />
                </template>
              </div>
            </div>
          </template>

          <!-- Drop zone at end of blocks list (when dragging) -->
          <div
            v-if="dragState.childInfo || dragState.blockIndex !== null || dragState.newBlockType"
            class="flex items-center justify-center px-2 py-2 rounded-lg border-2 border-dashed transition-colors mt-1"
            :class="dragState.overBlockIndex === editorStore.blocks.length ? 'border-primary bg-primary/10' : 'border-transparent hover:border-muted-foreground/30'"
            @dragover.prevent="handleBlockDragOver(editorStore.blocks.length, $event)"
            @dragleave="handleBlockDragLeave"
            @drop="handleBlockDrop(editorStore.blocks.length, $event)"
          >
            <span class="text-[10px] text-muted-foreground">Drop here</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Block Context Menu -->
    <ContextMenu ref="contextMenuRef">
      <ContextMenuItem
        icon="pencil"
        @click="handleRename"
      >
        Rename
      </ContextMenuItem>
      <ContextMenuDivider />
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
        icon="style-row"
        @click="handleWrapInStack"
      >
        Wrap in stack
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isStack"
        icon="link-1"
        @click="handleConvertToButton"
      >
        Convert to link
      </ContextMenuItem>
      <ContextMenuItem
        v-if="isButton"
        icon="style-row"
        @click="handleConvertToStack"
      >
        Convert to stack
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
