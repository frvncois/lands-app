<script setup lang="ts">
import { computed, ref, defineAsyncComponent, type Component } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { SectionBlockType } from '@/types/editor'
import {
  sectionBlockLabels,
  sectionBlockIcons,
  flexBasisOptions,
} from '@/lib/editor-utils'
import {
  getResponsiveStyles,
  setViewportStyleOverrides,
} from '@/lib/style-utils'
import type {
  BaseBlockStyles,
  CoreBlockStyles,
  VariantsSettings,
  AnimationSettings,
  GoogleFont,
} from '@/types/editor'

import InspectorSection from '@/components/inspector/InspectorSection.vue'
import InspectorField from '@/components/inspector/InspectorField.vue'
import SelectInput from '@/components/inspector/SelectInput.vue'
import SliderInput from '@/components/inspector/SliderInput.vue'
import AnimationSection from '@/components/inspector/AnimationSection.vue'
import SharedStyleField from '@/components/inspector/SharedStyleField.vue'
import SpanInspector from '@/components/inspector/SpanInspector.vue'
import PageInspector from '@/components/inspector/PageInspector.vue'
import DynamicBlockInspector from '@/components/inspector/DynamicBlockInspector.vue'
import { hasInspectorConfig, usesCustomInspector } from '@/components/inspector/inspector-config'

// Custom block inspectors (only for blocks with complex logic that can't be config-driven)
const customBlockInspectorMap: Partial<Record<SectionBlockType, Component>> = {
  variants: defineAsyncComponent(() => import('@/components/inspector/blocks/VariantsInspector.vue')),
}

import ProjectFont from '@/components/modal/ProjectFont.vue'
import ProductVariants from '@/components/modal/ProductVariants.vue'
import SharedStyleCreate from '@/components/modal/SharedStyleCreate.vue'
import Icon from '@/components/ui/Icon.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import Button from '@/components/ui/Button.vue'

const editorStore = useEditorStore()

const selectedBlock = computed(() => editorStore.selectedBlock)
const selectedSpanId = computed(() => editorStore.selectedSpanId)
const pageSettings = computed(() => editorStore.pageSettings)

// Get the selected span data (when a span is selected)
const selectedSpan = computed(() => {
  if (!selectedSpanId.value || !selectedBlock.value) return null
  return editorStore.getSpanById(selectedBlock.value.id, selectedSpanId.value)
})

// Get the inspector component for the current block type
const CurrentBlockInspector = computed(() => {
  if (!selectedBlock.value) return null
  const blockType = selectedBlock.value.type

  // Check if this block type uses a custom inspector (complex logic)
  if (usesCustomInspector(blockType)) {
    return customBlockInspectorMap[blockType] || null
  }

  // Check if this block type has a config-driven inspector
  if (hasInspectorConfig(blockType)) {
    return DynamicBlockInspector
  }

  return null
})
const currentViewport = computed(() => editorStore.viewport)

// Get responsive styles for the current viewport (merged/cascaded)
const responsiveStyles = computed((): CoreBlockStyles => {
  if (!selectedBlock.value) return {}
  return getResponsiveStyles(selectedBlock.value.styles as BaseBlockStyles, currentViewport.value)
})

// Check if selected block is inside a flex container (Stack or Container)
const isInFlexContainer = computed(() => {
  if (!selectedBlock.value) return false
  const parent = editorStore.findParentBlock(selectedBlock.value.id)
  return parent?.type === 'stack' || parent?.type === 'container'
})

// Check if selected block is a direct child of a Grid
const isChildOfGrid = computed(() => {
  if (!selectedBlock.value) return false
  return editorStore.isDirectChildOfGrid(selectedBlock.value.id)
})

// Get the parent grid's column count
const parentGridColumns = computed(() => {
  if (!selectedBlock.value) return null
  return editorStore.getParentGridColumns(selectedBlock.value.id)
})


// Breadcrumb item type
interface BreadcrumbItem {
  id: string | null
  label: string
  icon?: string
}

// Build breadcrumb path from root to selected block
const breadcrumbPath = computed<BreadcrumbItem[]>(() => {
  const path: BreadcrumbItem[] = [{ id: null, label: 'Page', icon: 'app-dashboard' }]

  if (!selectedBlock.value) return path

  // Build ancestry chain
  const ancestors: BreadcrumbItem[] = []
  let currentId: string | null = selectedBlock.value.id

  while (currentId) {
    const block = editorStore.findBlockById(currentId)
    if (!block) break

    ancestors.unshift({
      id: block.id,
      label: block.name || sectionBlockLabels[block.type],
      icon: sectionBlockIcons[block.type]
    })

    const parent = editorStore.findParentBlock(currentId)
    currentId = parent?.id || null
  }

  path.push(...ancestors)

  // Form field blocks are now child blocks, so they're handled by the parent block traversal above

  // Add span if selected
  if (selectedSpanId.value && selectedSpan.value) {
    path.push({ id: `span:${selectedSpanId.value}`, label: 'Span', icon: 'style-code' })
  }

  return path
})

// Handle breadcrumb click navigation
function handleBreadcrumbClick(item: BreadcrumbItem) {
  if (item.id === null) {
    // Click on Page - deselect everything
    editorStore.selectBlock(null)
    editorStore.selectSpan(null)
  } else if (item.id.startsWith('item:')) {
    // Item is already selected, do nothing
  } else if (item.id.startsWith('span:')) {
    // Span is already selected, do nothing
  } else {
    // Select the block (and deselect span if any)
    editorStore.selectSpan(null)
    editorStore.selectBlock(item.id)
  }
}

// Handle closing the span inspector
function handleCloseSpanInspector() {
  editorStore.selectSpan(null)
}

// Update functions
function updateBlockSettings(settings: Record<string, unknown>) {
  if (!selectedBlock.value) return
  editorStore.updateBlockSettings(selectedBlock.value.id, settings)
}

function updateBlockStyles(styles: Record<string, unknown>) {
  if (!selectedBlock.value) return

  // For core styles (padding, margin, background, border, shadow), apply viewport-aware update
  const coreStyleKeys = ['padding', 'margin', 'backgroundColor', 'backgroundImage', 'backgroundPosition', 'backgroundSize', 'border', 'shadow']
  const hasCoreStyles = Object.keys(styles).some(key => coreStyleKeys.includes(key))

  if (hasCoreStyles && currentViewport.value !== 'desktop') {
    // Update only the current viewport's overrides
    const currentStyles = (selectedBlock.value.styles || {}) as BaseBlockStyles
    const updatedStyles = setViewportStyleOverrides(currentStyles, currentViewport.value, styles as Partial<CoreBlockStyles>)
    editorStore.updateBlockStyles(selectedBlock.value.id, updatedStyles as Record<string, unknown>, true) // true = replace entire styles object
  } else {
    // Desktop or non-responsive styles (like animation) - update normally
    editorStore.updateBlockStyles(selectedBlock.value.id, styles)
  }
}

// Google Fonts modal state
const showGoogleFontsModal = ref(false)

// Product Variants modal state
const showVariantsModal = ref(false)

// Shared Style create modal state
const showSharedStyleModal = ref(false)

// Google Fonts handlers
function handleGoogleFontsUpdate(fonts: GoogleFont[]) {
  editorStore.updatePageSettings({ googleFonts: fonts })
}

// Hovered breadcrumb item for expand animation
const hoveredBreadcrumbId = ref<string | null>(null)

// ============================================
// ANIMATION HELPERS
// ============================================

// Get animation settings from selected block
const blockAnimation = computed(() => {
  if (!selectedBlock.value) return undefined
  return (selectedBlock.value.styles as BaseBlockStyles).animation
})

// Update animation settings
function updateBlockAnimation(animation: AnimationSettings) {
  if (!selectedBlock.value) return
  updateBlockStyles({ animation })
}

// Trigger animation preview in the editor
function handleAnimationPreview() {
  if (!selectedBlock.value) return
  editorStore.triggerAnimationPreview(selectedBlock.value.id)
}

// Check if block supports animation
const blockSupportsAnimation = computed(() => {
  return !!selectedBlock.value
})
</script>

<template>
  <aside
    class="group/inspector relative flex flex-col h-full bg-sidebar-background transition-[width] duration-300 ease-out"
    style="overflow-x: hidden !important;"
    :class="editorStore.isInspectorCollapsed ? 'w-16' : 'w-65'"
  >
    <!-- Left border toggle handle -->
    <div
      class="absolute top-0 left-0 w-1 h-full cursor-ew-resize z-10 transition-colors hover:bg-primary/50 active:bg-primary"
      :class="editorStore.isInspectorCollapsed ? 'bg-transparent group-hover/inspector:bg-sidebar-border' : 'bg-sidebar-border group-hover/inspector:bg-sidebar-foreground/20'"
      @click="editorStore.toggleInspector"
    >
      <div class="absolute top-1/2 -translate-y-1/2 -left-1.5 w-4 h-8 flex items-center justify-center opacity-0 group-hover/inspector:opacity-100 transition-opacity pointer-events-none">
        <div class="w-1 h-6 rounded-full bg-primary/50"></div>
      </div>
    </div>

    <!-- Collapsed state -->
    <div v-if="editorStore.isInspectorCollapsed" class="flex flex-col items-center py-2 gap-1 pl-1">
      <button
        class="p-1.5 rounded-md transition-colors"
        :class="[
          !selectedBlock
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        ]"
        @click="editorStore.selectBlock(null)"
      >
        <Tooltip text="Page" position="left">
          <Icon name="home-2" class="text-sm" />
        </Tooltip>
      </button>
      <div class="w-6 border-t border-sidebar-border my-1"></div>
      <button
        v-for="block in editorStore.blocks"
        :key="block.id"
        class="p-1.5 rounded-md transition-colors"
        :class="[
          editorStore.selectedBlockId === block.id
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        ]"
        @click="editorStore.selectBlock(block.id)"
      >
        <Tooltip :text="block.name" position="left">
          <Icon :name="sectionBlockIcons[block.type]" :size="14" />
        </Tooltip>
      </button>
    </div>

    <!-- Expanded state -->
    <template v-else>
      <!-- Header with Breadcrumb -->
      <div class="flex items-center h-12 px-3 border-b border-sidebar-border gap-2 ml-1">
        <!-- Breadcrumb navigation -->
        <nav class="flex items-center gap-1 min-w-0 flex-1">
          <template v-for="(item, index) in breadcrumbPath" :key="item.id ?? 'page'">
            <!-- Separator -->
            <i
              v-if="index > 0"
              class="text-[10px] text-muted-foreground/50 shrink-0"
            ></i>
            <!-- Previous items: icon only, expands on hover -->
            <button
              v-if="index < breadcrumbPath.length - 1"
              class="flex items-center h-6 rounded text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 ease-out shrink-0 overflow-hidden"
              :class="hoveredBreadcrumbId === (item.id ?? 'page') ? 'px-2 gap-1.5' : 'w-6 justify-center'"
              @mouseenter="hoveredBreadcrumbId = item.id ?? 'page'"
              @mouseleave="hoveredBreadcrumbId = null"
              @click="handleBreadcrumbClick(item)"
            >
              <Icon v-if="item.icon" :name="item.icon" :size="14" class="shrink-0" />
              <span
                class="text-xs font-medium truncate max-w-24 transition-all duration-200 ease-out"
                :class="hoveredBreadcrumbId === (item.id ?? 'page') ? 'opacity-100 w-auto' : 'opacity-0 w-0'"
              >{{ item.label }}</span>
            </button>
            <!-- Current item: icon + label + state dropdown if applicable -->
            <div
              v-else
              class="relative flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold shrink-0 bg-accent text-foreground"
            >
              <Icon v-if="item.icon" :name="item.icon" :size="10" />
              <span class="truncate max-w-32">{{ item.label }}</span>
            </div>
          </template>
        </nav>
      </div>

      <!-- Settings content -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden">
        <!-- Page Settings (when nothing selected) -->
        <PageInspector v-if="!selectedBlock" />

        <!-- Span Inspector (when a span is selected) -->
        <template v-else-if="selectedSpan && selectedBlock">
          <SpanInspector
            :block-id="selectedBlock.id"
            :span-id="selectedSpanId!"
            @close="handleCloseSpanInspector"
          />
        </template>

        <!-- Block Inspector (lazy-loaded components) -->
        <template v-else-if="CurrentBlockInspector && selectedBlock">
          <!-- Shared Style Field -->
          <div class="px-3 py-2 border-b border-sidebar-border">
            <SharedStyleField
              :block-id="selectedBlock.id"
              :block-type="selectedBlock.type"
              @open-create-modal="showSharedStyleModal = true"
            />
          </div>

          <!-- Dynamic Block Inspector -->
          <Suspense>
            <component :is="CurrentBlockInspector" />
          </Suspense>
        </template>

        <!-- Fallback for blocks without inspector config (shouldn't happen normally) -->
        <template v-else-if="selectedBlock">
          <!-- Grid Placement Section (only for direct children of Grid) -->
          <InspectorSection v-if="isChildOfGrid" title="Grid Placement" icon="layout-grid">
            <InspectorField label="Column Span" horizontal>
              <SliderInput
                :model-value="String((selectedBlock.settings as Record<string, unknown>).gridColumnSpan || 1)"
                :min="1"
                :max="parentGridColumns || 4"
                :step="1"
                unit=""
                @update:model-value="updateBlockSettings({ gridColumnSpan: parseInt($event) })"
              />
            </InspectorField>
            <InspectorField label="Row Span" horizontal>
              <SliderInput
                :model-value="String((selectedBlock.settings as Record<string, unknown>).gridRowSpan || 1)"
                :min="1"
                :max="6"
                :step="1"
                unit=""
                @update:model-value="updateBlockSettings({ gridRowSpan: parseInt($event) })"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Flex Child Section (for blocks inside Stack/Container) -->
          <InspectorSection v-if="isInFlexContainer" title="Flex Child" icon="layout-grid">
            <InspectorField label="Grow" horizontal>
              <SliderInput
                :model-value="responsiveStyles.flexGrow || '0'"
                :min="0"
                :max="5"
                :step="1"
                unit=""
                @update:model-value="updateBlockStyles({ flexGrow: $event })"
              />
            </InspectorField>
            <InspectorField label="Shrink" horizontal>
              <SliderInput
                :model-value="responsiveStyles.flexShrink || '1'"
                :min="0"
                :max="5"
                :step="1"
                unit=""
                @update:model-value="updateBlockStyles({ flexShrink: $event })"
              />
            </InspectorField>
            <InspectorField label="Basis" horizontal>
              <SelectInput
                :model-value="responsiveStyles.flexBasis || 'auto'"
                :options="flexBasisOptions"
                @update:model-value="updateBlockStyles({ flexBasis: $event })"
              />
            </InspectorField>
          </InspectorSection>

          <!-- Animation Section (common to most blocks) -->
          <AnimationSection
            v-if="blockSupportsAnimation"
            :model-value="blockAnimation"
            @update:model-value="updateBlockAnimation"
            @preview="handleAnimationPreview"
          />

          <!-- Dev Tool Section (shows applied styles) -->
          <InspectorSection title="Dev tool" icon="code">
            <div class="px-3 pb-3">
              <pre class="text-xxs font-mono bg-secondary/50 rounded p-2 overflow-auto max-h-48 text-foreground/70">{{ JSON.stringify(responsiveStyles, null, 2) }}</pre>
            </div>
          </InspectorSection>
        </template>
      </div>
    </template>
  </aside>

  <!-- Google Fonts Modal -->
  <ProjectFont
    :open="showGoogleFontsModal"
    :selected-fonts="pageSettings.googleFonts || []"
    @update:open="showGoogleFontsModal = $event"
    @update:selected-fonts="handleGoogleFontsUpdate"
  />

  <!-- Product Variants Modal -->
  <ProductVariants
    v-if="selectedBlock?.type === 'variants'"
    :open="showVariantsModal"
    :settings="(selectedBlock.settings as VariantsSettings)"
    @update:open="showVariantsModal = $event"
    @update:settings="updateBlockSettings($event)"
  />

  <!-- Shared Style Create Modal -->
  <SharedStyleCreate
    v-if="selectedBlock"
    :open="showSharedStyleModal"
    :block-id="selectedBlock.id"
    :block-type="selectedBlock.type"
    @update:open="showSharedStyleModal = $event"
  />
</template>
